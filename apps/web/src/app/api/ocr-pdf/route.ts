import { NextResponse } from "next/server";
import https from "https";

export const runtime = "nodejs";

async function callGeminiWithPdf(apiKey: string, pdfBase64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      contents: [{
        parts: [
          {
            inline_data: {
              mime_type: "application/pdf",
              data: pdfBase64,
            }
          },
          {
            text: `Sos un experto en análisis clínicos de laboratorio.
Analizá este PDF de laboratorio y extraé los valores numéricos de los marcadores clínicos.
Respondé ÚNICAMENTE con un objeto JSON válido con estos campos exactos (usá null si el valor no está presente):
{
  "total_cholesterol_mg_dl": número o null,
  "hdl_mg_dl": número o null,
  "ldl_mg_dl": número o null,
  "triglycerides_mg_dl": número o null,
  "fasting_glucose_mg_dl": número o null,
  "hba1c_percent": número o null,
  "creatinine_mg_dl": número o null,
  "urea_mg_dl": número o null,
  "tsh_miu_l": número o null
}
No agregues explicaciones ni texto adicional. Solo el JSON.`
          }
        ]
      }],
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
            const parsed = JSON.parse(raw);
            if (parsed.error) reject(new Error(JSON.stringify(parsed.error)));
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
            resolve(text);
          } catch {
            reject(new Error("Respuesta inválida de Gemini"));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Falta GEMINI_API_KEY" }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("pdf") as File;

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "El archivo debe ser un PDF" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfBase64 = buffer.toString("base64");

    const geminiResponse = await callGeminiWithPdf(apiKey, pdfBase64);
    const cleanJson = geminiResponse.replace(/```json|```/g, "").trim();
    const extractedValues = JSON.parse(cleanJson);

    return NextResponse.json({ values: extractedValues });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}