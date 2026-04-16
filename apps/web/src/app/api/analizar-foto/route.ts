import https from "https";
import { auth } from "@/auth";
import { checkAndIncrementUsage } from "@/lib/usage";

export const runtime = "nodejs";

type HealthProfile = Record<string, unknown>;
type PhotoType = "alimento" | "etiqueta";

function buildPhotoPrompt(healthProfile: HealthProfile, type: PhotoType) {
  const profileJson = JSON.stringify(healthProfile, null, 2);

  const intro =
    type === "etiqueta"
      ? `Analizá esta etiqueta de información nutricional de un producto alimentario.
Primero identificá el producto y extraé los valores nutricionales principales (calorías, proteínas, grasas, carbohidratos, sodio, azúcares, etc.).`
      : `Identificá qué alimento o plato aparece en la imagen.
Describí brevemente lo que ves (ingredientes visibles, método de cocción aproximado, porción estimada).`;

  return `Sos un asistente de análisis nutricional experto. ${intro}

Perfil clínico del usuario: ${profileJson}

Responde EXACTAMENTE con estos 4 bloques. En el BLOQUE 1 el puntaje SIEMPRE debe estar en el formato EXACTO "X/10" donde X es un número del 1 al 10:

BLOQUE 1 - PUNTAJE:
[numero]/10 - [etiqueta: PROHIBIDO/DESACONSEJADO/NEUTRO/RECOMENDABLE/ALTAMENTE RECOMENDABLE]
[resumen de 2-3 líneas sobre el alimento identificado]

BLOQUE 2 - ANÁLISIS PERSONALIZADO:
[análisis vinculando el alimento con los marcadores clínicos del usuario]

BLOQUE 3 - SUGERENCIAS DE MEJORA:
[porciones recomendadas y modificaciones posibles]

BLOQUE 4 - FUENTES:
[mínimo 2 referencias científicas]

Este análisis es orientativo y no reemplaza la consulta con un profesional de la salud.`;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Falta GEMINI_API_KEY" }), {
      status: 500,
    });
  }

  try {
    // ✅ LÍMITE DE USO (primera lógica dentro del try)
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
            error:
              "Alcanzaste el límite de 5 consultas diarias. Volvé mañana.",
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
    const formData = await request.formData();
    const file = formData.get("image") as File;
    const type = (formData.get("type") as PhotoType) ?? "alimento";
    const healthProfileStr = formData.get("health_profile") as string;
    const healthProfile: HealthProfile = healthProfileStr
      ? JSON.parse(healthProfileStr)
      : {};

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No se recibió imagen" }),
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageBase64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    const prompt = buildPhotoPrompt(healthProfile, type);

    const payload = JSON.stringify({
      contents: [
        {
          parts: [
            { inline_data: { mime_type: mimeType, data: imageBase64 } },
            { text: prompt },
          ],
        },
      ],
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
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
    });
  }
}