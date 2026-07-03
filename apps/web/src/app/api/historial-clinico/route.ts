// apps/web/src/app/api/historial-clinico/route.ts
export const runtime = "nodejs";
export const maxDuration = 60;

import https from "https";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createSupabaseAdmin } from "@/lib/supabaseService";
import { getUsageStatus, incrementUsage } from "@/lib/usage";

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
// sin tocar los caracteres estructurales del JSON
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

export async function POST() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const usageStatus = await getUsageStatus(email);
  if (!usageStatus.allowed) {
    return NextResponse.json({ error: "limite", reason: usageStatus.reason }, { status: 429 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Sin clave Gemini" }, { status: 500 });

  const supabase = createSupabaseAdmin();

  const { data: profile } = await supabase
    .from("health_profiles")
    .select("full_name, age, sex, weight_kg, height_cm, conditions, medications, main_goal, notes")
    .eq("owner_email", email)
    .maybeSingle();

  const { data: records } = await supabase
    .from("health_records")
    .select("*")
    .eq("owner_email", email)
    .order("recorded_at", { ascending: true });

  if (!records || records.length === 0) {
    return NextResponse.json({ error: "sin_registros" }, { status: 400 });
  }

  const profileLines: string[] = [];
  if (profile?.full_name) profileLines.push(`Nombre: ${profile.full_name}`);
  if (profile?.age) profileLines.push(`Edad: ${profile.age} años`);
  if (profile?.sex) profileLines.push(`Sexo: ${profile.sex}`);
  if (profile?.conditions?.length) profileLines.push(`Condiciones: ${profile.conditions.join(", ")}`);
  if (profile?.medications?.length) profileLines.push(`Medicamentos: ${profile.medications.join(", ")}`);
  if (profile?.main_goal) profileLines.push(`Objetivos: ${profile.main_goal}`);
  if (profile?.notes) profileLines.push(`Notas clínicas: ${profile.notes}`);

  const historyLines = records.map((r) => {
    const valores: string[] = [];
    if (r.weight_kg != null) valores.push(`Peso: ${r.weight_kg} kg`);
    if (r.total_cholesterol_mg_dl != null) valores.push(`Colesterol total: ${r.total_cholesterol_mg_dl} mg/dL`);
    if (r.hdl_mg_dl != null) valores.push(`HDL: ${r.hdl_mg_dl} mg/dL`);
    if (r.ldl_mg_dl != null) valores.push(`LDL: ${r.ldl_mg_dl} mg/dL`);
    if (r.triglycerides_mg_dl != null) valores.push(`Triglicéridos: ${r.triglycerides_mg_dl} mg/dL`);
    if (r.fasting_glucose_mg_dl != null) valores.push(`Glucemia en ayunas: ${r.fasting_glucose_mg_dl} mg/dL`);
    if (r.hba1c_percent != null) valores.push(`HbA1c: ${r.hba1c_percent}%`);
    if (r.creatinine_mg_dl != null) valores.push(`Creatinina: ${r.creatinine_mg_dl} mg/dL`);
    if (r.urea_mg_dl != null) valores.push(`Urea: ${r.urea_mg_dl} mg/dL`);
    if (r.tsh_miu_l != null) valores.push(`TSH: ${r.tsh_miu_l} mUI/L`);
    if (r.notes) valores.push(`Observaciones: ${r.notes}`);
    return `--- Análisis del ${r.recorded_at} ---\n${valores.join("\n")}`;
  });

  const prompt = `Sos un médico clínico con experiencia en medicina preventiva y análisis de laboratorio. Analizás la evolución de los valores clínicos de un paciente real a lo largo del tiempo. Tu análisis cruza indicadores entre sí y los interpreta en el contexto del perfil del paciente: su medicación, condiciones y objetivos declarados.

PERFIL DEL PACIENTE:
${profileLines.length > 0 ? profileLines.join("\n") : "Sin datos de perfil cargados."}

HISTORIAL DE ANÁLISIS CLÍNICOS (ordenados cronológicamente, del más antiguo al más reciente):
${historyLines.join("\n\n")}

INSTRUCCIONES:
- Organizá el análisis en exactamente 3 bloques temáticos que crucen indicadores relacionados entre sí.
- En cada bloque, identificá momentos específicos del historial (con fechas reales) donde hubo cambios significativos y explicá qué los pudo haber causado o qué significan en conjunto.
- Cruzá los indicadores con el perfil: si el paciente toma medicación antihipertensiva, analizá la función renal en ese contexto; si bajó de peso, correlacionalo con cambios en glucosa o lípidos.
- Usá un tono directo y claro, dirigiéndote al paciente por su nombre con "usted". Sin jerga médica sin explicar.
- NO diagnosticás ni prescribís. Al final de cada bloque sugerí qué preguntarle al médico tratante sobre ese tema específico.
- Texto limpio: sin asteriscos, sin markdown, sin bullets con *.
- Cada bloque debe tener un párrafo de análisis (5-7 oraciones) y una pregunta sugerida para el médico.

Los 3 bloques SIEMPRE son:
1. RIESGO CARDIOVASCULAR: analizá colesterol total, LDL, HDL, triglicéridos y peso en conjunto. Si hay medicación cardiovascular en el perfil, interpretá los valores en ese contexto.
2. METABOLISMO GLUCÍDICO: analizá glucosa en ayunas y HbA1c en conjunto, correlacionando con cambios de peso si los hay. Identificá períodos de riesgo y períodos de mejora.
3. FUNCIÓN RENAL Y METABÓLICA: analizá creatinina y urea. Si hay medicación que afecte los riñones, mencionalo. Si no hay datos suficientes de estos indicadores, indicalo brevemente.

Solo incluí un bloque si tiene al menos 1 dato en el historial. Si un bloque no tiene datos, omitilo del array.

Respondé ÚNICAMENTE con un JSON válido, sin markdown, sin texto antes ni después:
{
  "fecha_ultimo_analisis": "DD/MM/YYYY",
  "introduccion": "2-3 oraciones que mencionen el período total de seguimiento, cuántos análisis tiene el paciente y los 2 hallazgos más relevantes del historial completo. Dirigirse por nombre.",
  "bloques": [
    {
      "titulo": "TÍTULO DEL BLOQUE EN MAYÚSCULAS",
      "analisis": "Párrafo de análisis cruzado con referencias a fechas y valores específicos del historial.",
      "pregunta_medico": "Una pregunta concreta y específica que el paciente debería hacerle a su médico sobre este tema."
    }
  ],
  "conclusion": "2-3 oraciones que sinteticen el avance general, señalen el área que más atención requiere ahora mismo, y recomienden compartir este análisis con el médico tratante."
}`;

  const payload = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
  });

  try {
    const raw = await geminiRequest(payload, apiKey);

    // Paso 1: parsear la respuesta HTTP de Gemini
    let geminiJson: unknown;
    try {
      geminiJson = JSON.parse(raw);
    } catch {
      console.error("Error parseando respuesta HTTP de Gemini. Raw:", raw.slice(0, 500));
      return NextResponse.json({ error: "Respuesta inválida de Gemini" }, { status: 500 });
    }

    // Paso 2: extraer el texto generado
    const text: string =
      (geminiJson as { candidates?: { content?: { parts?: { text?: string }[] } }[] })
        ?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!text) {
      console.error("Gemini devolvió texto vacío. geminiJson COMPLETO:", JSON.stringify(geminiJson));
      return NextResponse.json({ error: "Gemini no generó contenido" }, { status: 500 });
    }

    // Paso 3: limpiar y extraer el JSON del texto
    // gemini-2.5-flash puede incluir bloques de "pensamiento" antes del JSON
    // Extraemos todo lo que está entre el primer { y el último }
    let clean = text.replace(/```json\n?/g, "").replace(/```/g, "").trim();
    const firstBrace = clean.indexOf("{");
    const lastBrace = clean.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      clean = clean.slice(firstBrace, lastBrace + 1);
    }

    let result: unknown;
    try {
      result = JSON.parse(clean);
    } catch {
      // Gemini a veces incluye saltos de línea literales DENTRO de valores string
      // lo que produce JSON inválido. Los escapamos solo dentro de strings.
      const repaired = repairJsonStrings(clean);
      try {
        result = JSON.parse(repaired);
      } catch {
        console.error("Error parseando JSON del contenido de Gemini. Texto limpio COMPLETO:", clean);
        return NextResponse.json({ error: "El análisis generado no tiene formato válido" }, { status: 500 });
      }
    }

    await incrementUsage(email).catch(() => {});

    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (err) {
    console.error("Error inesperado en historial-clinico:", err);
    return NextResponse.json({ error: "Error al procesar con Gemini" }, { status: 500 });
  }
}