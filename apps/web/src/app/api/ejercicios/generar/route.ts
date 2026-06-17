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

  // Obtener catálogo filtrado por equipamiento
  let query = supabase.from("exercise_catalog").select("*");

  if (equipamiento === "casa_sin_equipo") {
    query = query.ilike("equipment", "%none%");
  } else if (equipamiento === "casa_con_equipo") {
    query = query.or("equipment.ilike.%none%,equipment.ilike.%Dumbbell%,equipment.ilike.%Kettlebell%");
  }
  // gimnasio: todos los ejercicios

  const { data: ejercicios } = await query.limit(120);

  const catalogoTexto = (ejercicios || [])
    .map((e: any) => `ID:${e.id} | ${e.name_en} | Categoria:${e.category} | Equipo:${e.equipment} | Musculos:${e.muscles_primary || ""}`)
    .join("\n");

  const prompt = `Eres un entrenador personal certificado y experto en medicina del deporte. Debes crear un plan de ejercicios personalizado de 4 semanas basándote en el perfil clínico del usuario.

PERFIL CLÍNICO DEL USUARIO:
${perfil || "No disponible"}

PREFERENCIAS DEL USUARIO:
- Objetivo: ${objetivo}
- Días disponibles por semana: ${dias}
- Equipamiento: ${equipamiento}
- Nivel de experiencia: ${nivel}
- Restricciones físicas: ${restricciones || "Ninguna mencionada"}

CATÁLOGO DE EJERCICIOS DISPONIBLES (usa SOLO estos ejercicios, respetando el ID exacto):
${catalogoTexto}

INSTRUCCIONES PARA EL PLAN:
1. Crea un plan de 4 semanas con progresión gradual
2. Cada semana debe tener exactamente ${dias} días de entrenamiento
3. Cada sesión debe incluir ejercicios aeróbicos Y de fuerza
4. Para cada ejercicio incluye: nombre en español, ID del catálogo, series, repeticiones o duración, y descanso
5. Adapta la intensidad al nivel del usuario y su perfil clínico
6. Si el perfil clínico indica condiciones como hipertensión, diabetes, problemas articulares u otras patologías, ajusta los ejercicios apropiadamente y agrega advertencias específicas

FORMATO DE RESPUESTA (respeta este formato exacto):

OBJETIVO DEL PLAN:
[Descripción del objetivo considerando el perfil clínico]

ADVERTENCIAS CLÍNICAS:
[Advertencias específicas basadas en el perfil médico del usuario. Si no hay condiciones de riesgo, escribir "Sin restricciones clínicas identificadas"]

SEMANA 1 - BASE:
DÍA 1:
- EJERCICIO_ID:[id] | [Nombre en español] | [series]x[reps/duración] | Descanso:[tiempo]
- EJERCICIO_ID:[id] | [Nombre en español] | [series]x[reps/duración] | Descanso:[tiempo]
[continuar con todos los ejercicios del día]

DÍA 2:
[ejercicios]

[continuar con todos los días de semana 1]

SEMANA 2 - PROGRESIÓN:
[misma estructura con mayor intensidad]

SEMANA 3 - INTENSIFICACIÓN:
[misma estructura con mayor intensidad]

SEMANA 4 - PICO:
[misma estructura con mayor intensidad]

CONSEJOS GENERALES:
[3 a 5 consejos específicos para el objetivo y perfil clínico del usuario]`;

  const apiKey = process.env.GEMINI_API_KEY!;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

  const requestBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
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