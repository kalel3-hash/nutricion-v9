// apps/web/src/app/api/historial-clinico/route.ts
export const runtime = "nodejs";
export const maxDuration = 60;

import https from "https";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createSupabaseAdmin } from "@/lib/supabaseService";
import { getUsageStatus, incrementUsage } from "@/lib/usage";

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

  // Traer perfil del usuario (condiciones, medicamentos, objetivos)
  const supabase = createSupabaseAdmin();
  const { data: profile } = await supabase
    .from("health_profiles")
    .select("full_name, age, sex, weight_kg, height_cm, conditions, medications, main_goal, notes")
    .eq("owner_email", email)
    .maybeSingle();

  // Traer todos los registros históricos ordenados cronológicamente
  const { data: records } = await supabase
    .from("health_records")
    .select("*")
    .eq("owner_email", email)
    .order("recorded_at", { ascending: true });

  if (!records || records.length === 0) {
    return NextResponse.json({ error: "sin_registros" }, { status: 400 });
  }

  // Construir el bloque de perfil para el prompt
  const profileLines: string[] = [];
  if (profile?.full_name) profileLines.push(`Nombre: ${profile.full_name}`);
  if (profile?.age) profileLines.push(`Edad: ${profile.age} años`);
  if (profile?.sex) profileLines.push(`Sexo: ${profile.sex}`);
  if (profile?.conditions?.length) profileLines.push(`Condiciones: ${profile.conditions.join(", ")}`);
  if (profile?.medications?.length) profileLines.push(`Medicamentos: ${profile.medications.join(", ")}`);
  if (profile?.main_goal) profileLines.push(`Objetivos: ${profile.main_goal}`);
  if (profile?.notes) profileLines.push(`Notas clínicas: ${profile.notes}`);

  // Construir el bloque de historial para el prompt
  const historyLines = records.map((r) => {
    const fecha = r.recorded_at;
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
    return `--- Análisis del ${fecha} ---\n${valores.join("\n")}`;
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
- NO diagnosticás ni prescribís medicación. Siempre sugerí consultar con el médico tratante para decisiones clínicas.

Respondé ÚNICAMENTE con un JSON válido, sin markdown, sin texto antes ni después, con esta estructura exacta:
{
  "fecha_ultimo_analisis": "DD/MM/YYYY",
  "introduccion": "Párrafo de bienvenida personalizado dirigido al paciente por su nombre, resumiendo brevemente el objetivo del análisis.",
  "secciones": [
    {
      "titulo": "TÍTULO DE LA SECCIÓN EN MAYÚSCULAS",
      "contenido": "Texto completo de esta sección con análisis detallado, tendencias y significado clínico. Puede tener múltiples párrafos separados por salto de línea."
    }
  ],
  "conclusion": "Párrafo final con recomendaciones concretas y pasos a seguir. Siempre indicar consultar con el médico tratante."
}

Las secciones deben cubrir los grupos de valores presentes en los análisis. Por ejemplo: perfil lipídico, glucemia y diabetes, función renal, tiroides, peso, etc. Solo incluí secciones para los valores que realmente están en los datos.`;

  const payloadObj = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 4000 },
  };
  const payload = JSON.stringify(payloadObj);
  const agent = new https.Agent({ rejectUnauthorized: false });

  let incrementDone = false;

  const readableStream = new ReadableStream({
    start(controller) {
      const req = https.request(
        {
          hostname: "generativelanguage.googleapis.com",
          path: `/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${apiKey}&alt=sse`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload),
          },
          agent,
        },
        (res) => {
          const decoder = new TextDecoder();
          res.on("data", (chunk: Buffer) => {
            const lines = chunk.toString().split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const json = JSON.parse(line.slice(6));
                  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    if (!incrementDone) {
                      incrementDone = true;
                      incrementUsage(email).catch(() => {});
                    }
                    controller.enqueue(Buffer.from(text));
                  }
                } catch {}
              }
            }
          });
          res.on("end", () => {
            decoder.decode();
            controller.close();
          });
          res.on("error", (err: Error) => controller.error(err));
        }
      );
      req.on("error", (err: Error) => controller.error(err));
      req.write(payload);
      req.end();
    },
  });

  return new Response(readableStream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}