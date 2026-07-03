// apps/web/src/app/api/balance/route.ts
export const runtime = "nodejs";
export const maxDuration = 60;

import https from "https";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createSupabaseAdmin } from "@/lib/supabaseService";
import { getUsageStatus, incrementUsage } from "@/lib/usage";

function calcTDEE(weight_kg: number, height_cm: number, age: number, sex: string): number {
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age;
  const constant = sex === "masculino" ? 5 : sex === "femenino" ? -161 : -78;
  return Math.round((base + constant) * 1.2);
}

function geminiRequest(payload: string, apiKey: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const agent = new https.Agent({ rejectUnauthorized: false });
    const req = https.request(
      {
        hostname: "generativelanguage.googleapis.com",
        path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
        agent,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        res.on("error", reject);
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

// Escapa saltos de línea y tabulaciones literales dentro de valores string JSON
// sin tocar los caracteres estructurales del JSON. Misma función que en
// api/historial-clinico/route.ts — mantenerlas sincronizadas si se ajusta una.
function repairJsonStrings(input: string): string {
  let result = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      result += ch;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }
    if (inString) {
      if (ch === "\n") { result += "\\n"; continue; }
      if (ch === "\r") { result += "\\r"; continue; }
      if (ch === "\t") { result += "\\t"; continue; }
    }
    result += ch;
  }
  return result;
}

export async function POST(request: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const usageStatus = await getUsageStatus(email);
  if (!usageStatus.allowed) {
    return NextResponse.json({ error: "limite", reason: usageStatus.reason }, { status: 429 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Sin clave Gemini" }, { status: 500 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Body inválido" }, { status: 400 });

  const { fecha, peso_confirmado, weight_kg, height_cm, age, sex, comidas, ejercicios, laboratorio } = body;

  if (!weight_kg || !height_cm || !age || !sex || sex === "") {
    return NextResponse.json({ error: "perfil_incompleto" }, { status: 400 });
  }

  const tdee = calcTDEE(Number(weight_kg), Number(height_cm), Number(age), sex);

  const labLines: string[] = [];
  if (laboratorio?.colesterol) labLines.push(`Colesterol total: ${laboratorio.colesterol} mg/dL`);
  if (laboratorio?.hdl) labLines.push(`HDL: ${laboratorio.hdl} mg/dL`);
  if (laboratorio?.ldl) labLines.push(`LDL: ${laboratorio.ldl} mg/dL`);
  if (laboratorio?.trigliceridos) labLines.push(`Triglicéridos: ${laboratorio.trigliceridos} mg/dL`);
  if (laboratorio?.glucemia) labLines.push(`Glucemia en ayunas: ${laboratorio.glucemia} mg/dL`);
  if (laboratorio?.hba1c) labLines.push(`HbA1c: ${laboratorio.hba1c}%`);
  if (laboratorio?.creatinina) labLines.push(`Creatinina: ${laboratorio.creatinina} mg/dL`);
  if (laboratorio?.urea) labLines.push(`Urea: ${laboratorio.urea} mg/dL`);
  if (laboratorio?.tsh) labLines.push(`TSH: ${laboratorio.tsh} mUI/L`);
  if (laboratorio?.condiciones?.length) labLines.push(`Condiciones: ${(laboratorio.condiciones as string[]).join(", ")}`);
  if (laboratorio?.medicamentos?.length) labLines.push(`Medicamentos: ${(laboratorio.medicamentos as string[]).join(", ")}`);

  const MEAL_NAMES: Record<string, string> = {
    desayuno: "Desayuno", almuerzo: "Almuerzo", merienda: "Merienda", cena: "Cena", colacion: "Colación",
  };
  const comidaLines: string[] = [];
  for (const [key, items] of Object.entries(comidas ?? {})) {
    const filtered = (items as string[]).filter((i: string) => i.trim());
    if (filtered.length > 0) comidaLines.push(`${MEAL_NAMES[key] ?? key}: ${filtered.join(" / ")}`);
  }

  const ejercicioLines: string[] = ((ejercicios ?? []) as { descripcion: string; duracion_minutos: number }[])
    .filter(e => e.descripcion.trim())
    .map(e => `${e.descripcion} (${e.duracion_minutos} min)`);

  const prompt = `Sos un asistente nutricional. Analizá este registro diario de forma informativa. No des consejos médicos directivos, no indiques dosis ni horarios de medicación ni tratamientos. Cualquier observación de salud debe sugerir consultar con un profesional.

DATOS DEL USUARIO:
- Sexo: ${sex}, Edad: ${age} años, Peso: ${weight_kg} kg, Altura: ${height_cm} cm
- TDEE calculado (Mifflin-St Jeor × 1.2, modo sedentario): ${tdee} kcal${labLines.length > 0 ? `\n\nPERFIL CLÍNICO (usá estos valores para personalizar el análisis):\n${labLines.join("\n")}` : ""}

COMIDAS DEL DÍA (${fecha ?? "hoy"}):
${comidaLines.length > 0 ? comidaLines.join("\n") : "Sin comidas registradas"}

EJERCICIOS:
${ejercicioLines.length > 0 ? ejercicioLines.join("\n") : "Sin ejercicio registrado"}

Respondé ÚNICAMENTE con un JSON válido, sin markdown, sin texto antes ni después:
{
  "calorias_consumidas_kcal": 0,
  "detalle_comidas": {
    "desayuno": [{"item": "descripcion", "kcal_estimadas": 0, "proteinas_g": 0, "grasas_g": 0, "carbohidratos_g": 0, "sodio_mg": 0, "fibra_g": 0}],
    "almuerzo": [{"item": "descripcion", "kcal_estimadas": 0, "proteinas_g": 0, "grasas_g": 0, "carbohidratos_g": 0, "sodio_mg": 0, "fibra_g": 0}],
    "merienda": [{"item": "descripcion", "kcal_estimadas": 0, "proteinas_g": 0, "grasas_g": 0, "carbohidratos_g": 0, "sodio_mg": 0, "fibra_g": 0}],
    "cena": [{"item": "descripcion", "kcal_estimadas": 0, "proteinas_g": 0, "grasas_g": 0, "carbohidratos_g": 0, "sodio_mg": 0, "fibra_g": 0}],
    "colacion": [{"item": "descripcion", "kcal_estimadas": 0, "proteinas_g": 0, "grasas_g": 0, "carbohidratos_g": 0, "sodio_mg": 0, "fibra_g": 0}]
  },
  "totales_dia": {
    "proteinas_g": 0,
    "grasas_g": 0,
    "carbohidratos_g": 0,
    "sodio_mg": 0,
    "fibra_g": 0
  },
  "calorias_quemadas_ejercicio_kcal": 0,
  "detalle_ejercicios": [{"descripcion": "texto", "duracion_minutos": 0, "kcal_estimadas": 0, "tipo": "aeróbico", "beneficio_clinico": "descripción del beneficio considerando el perfil clínico"}],
  "impacto_glucemico": "bajo",
  "comentario_clinico": "3-4 oraciones que crucen explícitamente los valores del perfil clínico (mencionar los valores numéricos) con las comidas y ejercicios del día. Siempre sugerir consultar con un profesional.",
  "recomendaciones": ["recomendación 1", "recomendación 2", "recomendación 3"]
}`;

  const payload = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
  });

  try {
    const raw = await geminiRequest(payload, apiKey);

    // Paso 1: parsear la respuesta HTTP de Gemini
    let geminiJson: unknown;
    try {
      geminiJson = JSON.parse(raw);
    } catch {
      console.error("Error parseando respuesta HTTP de Gemini (balance). Raw:", raw.slice(0, 500));
      return NextResponse.json({ error: "Respuesta inválida de Gemini" }, { status: 500 });
    }

    // Paso 2: extraer el texto generado
    const text: string =
      (geminiJson as { candidates?: { content?: { parts?: { text?: string }[] } }[] })
        ?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!text) {
      console.error("Gemini devolvió texto vacío (balance). geminiJson COMPLETO:", JSON.stringify(geminiJson));
      return NextResponse.json({ error: "Gemini no generó contenido" }, { status: 500 });
    }

    // Paso 3: limpiar y extraer el JSON del texto
    // gemini-2.5-flash puede incluir texto de razonamiento antes del JSON.
    // Extraemos todo lo que está entre el primer { y el último }
    let clean = text.replace(/```json\n?/g, "").replace(/```/g, "").trim();
    const firstBrace = clean.indexOf("{");
    const lastBrace = clean.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      clean = clean.slice(firstBrace, lastBrace + 1);
    }

    let parsed: {
      calorias_consumidas_kcal?: number;
      calorias_quemadas_ejercicio_kcal?: number;
      [key: string]: unknown;
    };
    try {
      parsed = JSON.parse(clean);
    } catch {
      // Gemini a veces incluye saltos de línea literales DENTRO de valores string,
      // lo que produce JSON inválido. Los escapamos solo dentro de strings.
      const repaired = repairJsonStrings(clean);
      try {
        parsed = JSON.parse(repaired);
      } catch {
        console.error("Error parseando JSON del contenido de Gemini (balance). Texto limpio COMPLETO:", clean);
        return NextResponse.json({ error: "El análisis generado no tiene formato válido" }, { status: 500 });
      }
    }

    const balance_kcal =
      (parsed.calorias_consumidas_kcal ?? 0) -
      (tdee + (parsed.calorias_quemadas_ejercicio_kcal ?? 0));

    const supabase = createSupabaseAdmin();

    await supabase
      .from("health_profiles")
      .update({ weight_kg: peso_confirmado })
      .eq("owner_email", email);

    const { error: insertError } = await supabase.from("daily_balance_history").insert({
      owner_email: email,
      fecha: fecha ?? new Date().toISOString().slice(0, 10),
      profile_weight_kg: peso_confirmado,
      profile_height_cm: height_cm,
      profile_age: age,
      profile_sex: sex,
      comidas: comidas ?? {},
      ejercicios: ejercicios ?? [],
      tdee_kcal: tdee,
      calorias_consumidas_kcal: parsed.calorias_consumidas_kcal ?? null,
      calorias_quemadas_kcal: parsed.calorias_quemadas_ejercicio_kcal ?? 0,
      balance_kcal,
      analisis_gemini: parsed,
    });

    if (insertError) {
      // No es fatal para el usuario (ya tiene su análisis), pero se loguea
      // para poder auditar por qué no quedó guardado en el historial.
      console.error("Error guardando daily_balance_history:", insertError.message);
    }

    await incrementUsage(email).catch(() => {});

    return NextResponse.json({ ok: true, result: parsed, tdee_kcal: tdee }, { status: 200 });
  } catch (err) {
    console.error("Error inesperado en balance:", err);
    return NextResponse.json({ error: "Error al procesar con Gemini" }, { status: 500 });
  }
}