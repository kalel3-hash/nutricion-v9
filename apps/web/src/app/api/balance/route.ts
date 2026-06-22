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

export async function POST(request: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const usageStatus = await getUsageStatus(email);
  if (!usageStatus.allowed) {
    return NextResponse.json({ error: "limite", reason: usageStatus.reason }, { status: 429 });
  }

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
- TDEE calculado (Mifflin-St Jeor × 1.2, modo sedentario): ${tdee} kcal${labLines.length > 0 ? `\n\nPERFIL CLÍNICO:\n${labLines.join("\n")}` : ""}

COMIDAS DEL DÍA (${fecha ?? "hoy"}):
${comidaLines.length > 0 ? comidaLines.join("\n") : "Sin comidas registradas"}

EJERCICIOS:
${ejercicioLines.length > 0 ? ejercicioLines.join("\n") : "Sin ejercicio registrado"}

Respondé ÚNICAMENTE con un JSON válido, sin markdown, sin texto antes ni después:
{
  "calorias_consumidas_kcal": 0,
  "detalle_comidas": {
    "desayuno": [{"item": "descripcion del item", "kcal_estimadas": 0}],
    "almuerzo": [{"item": "descripcion del item", "kcal_estimadas": 0}],
    "merienda": [{"item": "descripcion del item", "kcal_estimadas": 0}],
    "cena": [{"item": "descripcion del item", "kcal_estimadas": 0}],
    "colacion": [{"item": "descripcion del item", "kcal_estimadas": 0}]
  },
  "calorias_quemadas_ejercicio_kcal": 0,
  "detalle_ejercicios": [{"descripcion": "texto", "duracion_minutos": 0, "kcal_estimadas": 0}],
  "grasas_estimadas_g": 0,
  "impacto_glucemico": "bajo",
  "comentario_clinico": "2-3 oraciones informativas",
  "recomendaciones": ["recomendación 1", "recomendación 2", "recomendación 3"]
}`;

  const supabase = createSupabaseAdmin();

  await supabase
    .from("health_profiles")
    .update({ weight_kg: peso_confirmado })
    .eq("owner_email", email);

  const apiKey = process.env.GEMINI_API_KEY!;
  const payload = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
  });

  const agent = new https.Agent({ rejectUnauthorized: false });

  let fullText = "";
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
                    fullText += text;
                    controller.enqueue(Buffer.from(text));
                  }
                } catch {}
              }
            }
          });
          res.on("end", async () => {
            try {
              const clean = fullText.replace(/```json\n?/g, "").replace(/```/g, "").trim();
              const parsed = JSON.parse(clean);
              const balance_kcal =
                (parsed.calorias_consumidas_kcal ?? 0) -
                (tdee + (parsed.calorias_quemadas_ejercicio_kcal ?? 0));

              await supabase.from("daily_balance_history").insert({
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
            } catch {
              // DB save failure is non-fatal
            }
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
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}