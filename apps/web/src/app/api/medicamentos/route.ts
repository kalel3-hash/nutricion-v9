import https from "https";
import { auth } from "@/auth";
import { getUsageStatus, incrementUsage } from "@/lib/usage";
import { createClient } from "@supabase/supabase-js";
import { profileToText } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  }

  const email = session.user.email;

  const status = await getUsageStatus(email);
  if (!status.allowed) {
    return new Response(
      JSON.stringify({
        error: status.reason === "daily"
          ? "Alcanzaste el limite de 5 consultas diarias. Volve manana."
          : "Alcanzaste el limite de 30 consultas mensuales.",
      }),
      { status: 429 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Falta GEMINI_API_KEY" }), { status: 500 });
  }

  const formData = await request.formData();
  const query = formData.get("query") as string | null;
  const image = formData.get("image") as File | null;

  if (!query && !image) {
    return new Response(JSON.stringify({ error: "Ingresá un medicamento o una imagen" }), { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: profile } = await supabase
    .from("health_profiles")
    .select("*")
    .eq("owner_email", email)
    .single();

  if (!profile) {
    return new Response(JSON.stringify({ error: "Perfil no encontrado" }), { status: 404 });
  }

  const profileText = profileToText(profile);

  const systemPrompt = `Sos un asistente de salud especializado en análisis clínico personalizado.
Tu tarea es analizar un medicamento en el contexto del perfil médico específico del usuario y ayudarlo a prepararse mejor para hablar con su médico.
NUNCA recomendás ni desaconsejás tomar un medicamento. NUNCA reemplazás la consulta médica.
Respondés siempre en español, de forma clara, empática y personalizada.
Comenzás la respuesta con una introducción narrativa que diga exactamente: "A partir del análisis de tu perfil médico," seguido de tu evaluación personalizada del medicamento.
Usás exactamente esta estructura de bloques:

## 🔍 Medicamento identificado
Nombre y uso general del medicamento.

## 👤 Análisis personalizado de tu perfil
Analizá en detalle cómo los valores clínicos, condiciones y medicación actual del usuario se relacionan con este medicamento. Sé específico con los valores numéricos cuando estén disponibles. Si no hay datos relevantes, indicalo.

## ❓ Preguntas para hacerle a tu médico
3 a 5 preguntas concretas y personalizadas basadas en el perfil del usuario.

## ⚠️ Señales a monitorear
Síntomas o situaciones específicas que este usuario debería reportar a su médico considerando su perfil.

## 📋 Disclaimer
Recordatorio claro de que esta información es orientativa y no reemplaza la consulta con un profesional de salud.`;

  const userPrompt = query
    ? `Consulta sobre el medicamento: ${query}\n\nMi perfil médico:\n${profileText}`
    : `Mi perfil médico:\n${profileText}`;

  let payload: string;

  if (image) {
    const imageBytes = await image.arrayBuffer();
    const base64 = Buffer.from(imageBytes).toString("base64");
    const mimeType = image.type;

    payload = JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${systemPrompt}\n\n${userPrompt}` },
            { inline_data: { mime_type: mimeType, data: base64 } },
          ],
        },
      ],
      generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
    });
  } else {
    payload = JSON.stringify({
      contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
    });
  }

  const agent = new https.Agent({ rejectUnauthorized: false });
  let tokenConsumed = false;
  let fullText = "";

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
                  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    if (!tokenConsumed) {
                      tokenConsumed = true;
                      incrementUsage(email).catch(() => {});
                    }
                    fullText += text;
                    controller.enqueue(text);
                  }
                } catch {}
              }
            }
          });
          res.on("end", async () => {
            if (fullText) {
              await supabase.from("medication_history").insert({
                owner_email: email,
                query: query || "Consulta por imagen",
                result: fullText,
              });
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

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}