import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";
import { getUsageStatus, incrementUsage } from "@/lib/usage";
import https from "https";

export const runtime = "nodejs";
export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const email = session.user.email;
  const usageStatus = await getUsageStatus(email);

  if (!usageStatus.allowed) {
    return NextResponse.json(
      { error: usageStatus.daily_used >= usageStatus.daily_limit ? "Limite diario alcanzado." : "Limite mensual alcanzado." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { objetivo, dias, equipamiento, nivel, restricciones, perfil } = body;

  let query = supabase.from("exercise_catalog").select("*");

  if (equipamiento === "casa_sin_equipo") {
    query = query.ilike("equipment", "%none%");
  } else if (equipamiento === "casa_con_equipo") {
    query = query.or("equipment.ilike.%none%,equipment.ilike.%Dumbbell%,equipment.ilike.%Kettlebell%");
  }

  const { data: ejercicios } = await query.limit(120);

  const catalogoTexto = (ejercicios || [])
    .map((e: any) => `ID:${e.id} | ${e.name_en} | Categoria:${e.category} | Equipo:${e.equipment} | Musculos:${e.muscles_primary || ""}`)
    .join("\n");

  const prompt = `Eres un entrenador personal. Crea un plan de ejercicios de 2 semanas. Responde ÚNICAMENTE con el plan en el formato indicado. NO escribas saludos, presentaciones, introducciones ni texto adicional antes o después del plan. Empieza directamente con "OBJETIVO DEL PLAN:".

PERFIL CLÍNICO:
${perfil || "No disponible"}

PREFERENCIAS:
- Objetivo: ${objetivo}
- Días por semana: ${dias}
- Equipamiento: ${equipamiento}
- Nivel: ${nivel}
- Restricciones físicas: ${restricciones || "Ninguna"}

CATÁLOGO DE EJERCICIOS (usa SOLO estos IDs, no inventes ejercicios):
${catalogoTexto}

REGLAS ESTRICTAS:
1. Usa SOLO ejercicios del catálogo con su ID exacto
2. Cada sesión debe tener ejercicios aeróbicos Y de fuerza
3. Máximo 6 ejercicios por día
4. Adapta la intensidad al nivel y perfil clínico
5. NO escribas separadores como "---" o "--"
6. NO escribas texto fuera del formato indicado
7. El formato de cada ejercicio debe ser EXACTAMENTE: EJERCICIO_ID:[id] | [Nombre] | [series]x[reps] | Descanso:[tiempo]

FORMATO EXACTO DE RESPUESTA:

OBJETIVO DEL PLAN:
[Una sola oración describiendo el objetivo]

ADVERTENCIAS CLÍNICAS:
[Advertencias basadas en el perfil. Si no hay, escribir exactamente: Sin restricciones clínicas identificadas]

SEMANA 1 - BASE:
DÍA 1:
EJERCICIO_ID:[id] | [Nombre] | [series]x[reps] | Descanso:[tiempo]
EJERCICIO_ID:[id] | [Nombre] | [series]x[reps] | Descanso:[tiempo]
[continuar hasta máximo 6 ejercicios]

DÍA 2:
[misma estructura]

[continuar con los ${dias} días]

SEMANA 2 - PROGRESIÓN:
DÍA 1:
[misma estructura con mayor intensidad]

[continuar con los ${dias} días]

CONSEJOS GENERALES:
[3 consejos específicos para el objetivo y perfil del usuario]`;

  const apiKey = process.env.GEMINI_API_KEY!;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

  const requestBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 4096 },
  });

  const encoder = new TextEncoder();
  let firstChunk = true;

  const stream = new ReadableStream({
    start(controller) {
      const req = https.request(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }, (res) => {
        let buffer = "";

        res.on("data", async (chunk: Buffer) => {
          buffer += chunk.toString();
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr || jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                if (firstChunk) {
                  firstChunk = false;
                  await incrementUsage(email);
                }
                controller.enqueue(encoder.encode(text));
              }
            } catch { }
          }
        });

        res.on("end", () => controller.close());
        res.on("error", (err: Error) => controller.error(err));
      });

      req.on("error", (err: Error) => controller.error(err));
      req.write(requestBody);
      req.end();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" },
  });
}