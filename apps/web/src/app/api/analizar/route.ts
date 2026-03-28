import { NextResponse } from "next/server";
import https from "https";

export const runtime = "nodejs";

type HealthProfile = Record<string, unknown>;

function buildPrompt(healthProfile: HealthProfile, foodDescription: string) {
  const profileJson = JSON.stringify(healthProfile, null, 2);
  return `Sos un asistente de analisis nutricional. Perfil del usuario: ${profileJson}. Alimento: ${foodDescription}. Responde con estos 4 bloques: BLOQUE 1 - PUNTAJE: numero 1-10 con etiqueta (PROHIBIDO/DESACONSEJADO/NEUTRO/RECOMENDABLE/ALTAMENTE RECOMENDABLE) y resumen 2-3 lineas. BLOQUE 2 - ANALISIS PERSONALIZADO: vincula el alimento con los marcadores clinicos. BLOQUE 3 - SUGERENCIAS DE MEJORA: porciones y modificaciones. BLOQUE 4 - FUENTES: minimo 2 referencias cientificas. Termina con: Este analisis es orientativo y no reemplaza la consulta con un profesional de la salud.`;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Falta GEMINI_API_KEY" }, { status: 500 });
  }

  const body = await request.json();
  const foodDescription = body.food_description as string;
  const healthProfile = body.health_profile as HealthProfile;

  if (!foodDescription) {
    return NextResponse.json({ error: "Falta food_description" }, { status: 400 });
  }

  const prompt = buildPrompt(healthProfile || {}, foodDescription);

  try {
    const data = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const payload = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      });

      const agent = new https.Agent({ rejectUnauthorized: false });

      const req = https.request(
        {
          hostname: "generativelanguage.googleapis.com",
          path: "/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload),
          },
          agent,
        },
        (res) => {
          let raw = "";
          res.on("data", (chunk) => { raw += chunk; });
          res.on("end", () => {
            try {
              resolve(JSON.parse(raw));
            } catch {
              reject(new Error("Respuesta invalida: " + raw));
            }
          });
        }
      );
      req.on("error", reject);
      req.write(payload);
      req.end();
    });

    if (data.error) {
      return NextResponse.json({ error: JSON.stringify(data.error) }, { status: 500 });
    }

    const candidates = data.candidates as Array<{
      content: { parts: Array<{ text: string }> };
    }>;
    const analysis = candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta";
    return NextResponse.json({ analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
