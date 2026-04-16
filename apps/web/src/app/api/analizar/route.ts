import https from "https";
import { auth } from "@/auth";
import { checkAndIncrementUsage } from "@/lib/usage";

export const runtime = "nodejs";

type HealthProfile = Record<string, unknown>;

function buildPrompt(healthProfile: HealthProfile, foodDescription: string) {
  const profileJson = JSON.stringify(healthProfile, null, 2);
  return `Sos un asistente de analisis nutricional. Perfil del usuario: ${profileJson}. Alimento: ${foodDescription}.

Responde EXACTAMENTE con estos 4 bloques. En el BLOQUE 1 el puntaje SIEMPRE debe estar en el formato EXACTO "X/10" donde X es un numero del 1 al 10:

BLOQUE 1 - PUNTAJE:
[numero]/10 - [etiqueta: PROHIBIDO/DESACONSEJADO/NEUTRO/RECOMENDABLE/ALTAMENTE RECOMENDABLE]
[resumen de 2-3 lineas]

BLOQUE 2 - ANALISIS PERSONALIZADO:
[analisis vinculando el alimento con los marcadores clinicos del usuario]

BLOQUE 3 - SUGERENCIAS DE MEJORA:
[porciones recomendadas y modificaciones posibles]

BLOQUE 4 - FUENTES:
[minimo 2 referencias cientificas]

Este analisis es orientativo y no reemplaza la consulta con un profesional de la salud.`;
}

export async function POST(request: Request) {
  // ✅ LÍMITE DE USO (al inicio)
  const session = await auth();

  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "No autenticado" }), {
      status: 401,
    });
  }

  const usage = await checkAndIncrementUsage(session.user.email);

  if (!usage.allowed) {
    if (usage.reason === "daily") {
      return new Response(
        JSON.stringify({
          error: "Alcanzaste el límite de 5 consultas diarias. Volvé mañana.",
        }),
        { status: 429 }
      );
    }

    if (usage.reason === "monthly") {
      return new Response(
        JSON.stringify({
          error: "Alcanzaste el límite de 30 consultas mensuales.",
        }),
        { status: 429 }
      );
    }
  }

  // ✅ LÓGICA ORIGINAL (sin cambios)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Falta GEMINI_API_KEY" }), {
      status: 500,
    });
  }

  const body = await request.json();
  const foodDescription = body.food_description as string;
  const healthProfile = body.health_profile as HealthProfile;

  if (!foodDescription) {
    return new Response(
      JSON.stringify({ error: "Falta food_description" }),
      { status: 400 }
    );
  }

  const prompt = buildPrompt(healthProfile || {}, foodDescription);

  const payload = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0 },
  });

  const agent = new https.Agent({ rejectUnauthorized: false });

  const stream = new ReadableStream({
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
                  const text =
                    json.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) controller.enqueue(text);
                } catch {}
              }
            }
          });
          res.on("end", () => controller.close());
          res.on("error", (err: Error) => controller.error(err));
        }
      );
      req.on("error", (err: Error) => controller.error(err));
      req.write(payload);
      req.end();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}