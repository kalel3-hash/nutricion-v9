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
        path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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

  const prompt = `Sos un asistente médico especializado en análisis clínicos. Tu tarea es analizar la evolución de los valores de laboratorio de un paciente a lo largo del tiempo y generar un informe comparativo claro, empático y personalizado en español, usando "usted".

PERFIL DEL PACIENTE:
${profileLines.length > 0 ? profileLines.join("\n") : "Sin datos de perfil cargados."}

HISTORIAL DE ANÁLISIS CLÍNICOS (ordenados cronológicamente):
${historyLines.join("\n\n")}

INSTRUCCIONES:
- Analizá la evolución de cada valor entre los distintos análisis.
- Identificá avances positivos, retrocesos y valores que requieren atención.
- Usá un tono empático, claro y directo. No uses jerga médica sin explicarla.
- Para cada hallazgo relevante, indicá la tendencia (mejora, estable, empeora) y su significado clínico.
- NO diagnosticás ni prescribís medicación. Siempre sugerí consultar con el médico tratante.
- El contenido de cada sección debe ser texto limpio, sin asteriscos, sin markdown, sin bullets con *.

Respondé ÚNICAMENTE con un JSON válido, sin markdown, sin texto antes ni después:
{
  "fecha_ultimo_analisis": "DD/MM/YYYY",
  "introduccion": "Párrafo de bienvenida personalizado dirigido al paciente por su nombre.",
  "secciones": [
    {
      "titulo": "TÍTULO EN MAYÚSCULAS",
      "contenido": "Texto completo sin markdown ni asteriscos. Párrafos separados por salto de línea."
    }
  ],
  "conclusion": "Párrafo final con recomendaciones y sugerencia de consultar al médico tratante."
}

Solo incluí secciones para los valores que realmente están presentes en los datos.`;

  const payload = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 4000 },
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
    // Buscamos el primer { y el último } para extraer solo el JSON
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
      console.error("Error parseando JSON del contenido de Gemini. Texto limpio:", clean.slice(0, 500));
      return NextResponse.json({ error: "El análisis generado no tiene formato válido" }, { status: 500 });
    }

    await incrementUsage(email).catch(() => {});

    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (err) {
    console.error("Error inesperado en historial-clinico:", err);
    return NextResponse.json({ error: "Error al procesar con Gemini" }, { status: 500 });
  }
}