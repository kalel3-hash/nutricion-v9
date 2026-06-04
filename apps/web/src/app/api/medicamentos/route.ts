import https from "https";
import { auth } from "@/auth";
import { getUsageStatus, incrementUsage } from "@/lib/usage";
import { createClient } from "@supabase/supabase-js";
import { compactProfile } from "@/lib/utils";

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
      JSON.stringify({ error: status.reason === "daily" ? "Alcanzaste el limite de 5 consultas diarias. Volve manana." : "Alcanzaste el limite de 30 consultas mensuales." }),
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

  const profileText = compactProfile(profile);

  const systemPrompt = `Sos un asistente de salud que ayuda a los usuarios a prepararse mejor para hablar con su médico.
Cuando el usuario consulta sobre un medicamento, analizás su perfil clínico y devolvés información útil para que pueda tener una conversación más informada con su profesional de salud.
NUNCA recomendás ni desaconsejás tomar un medicamento. NUNCA reemplazás la consulta médica.
Respondés siempre en español, de forma clara y empática.
Usás exactamente esta estructura de bloques:

## 🔍 Medicamento identificado
Nombre del medicamento, para qué se usa generalmente.

## 👤 Factores de tu perfil relevantes
Aspectos del perfil clínico del usuario que podrían ser relevantes en relación a este medicamento. Si no hay factores relevantes, indicalo.

## ❓ Preguntas para hacerle a tu médico
Lista de 3 a 5 preguntas concretas y útiles que el usuario debería hacerle a su médico considerando su perfil.

## ⚠️ Señales a monitorear
Síntomas o situaciones que el usuario debería reportar a su médico si aparecen.

## 📋 Disclaimer
Recordatorio claro de que esta información es orientativa y no reemplaza la consulta con un profesional de salud.`;

  const userPrompt = query
    ? `Mi consulta es sobre: ${query}\n\nMi perfil clínico: ${profileText}`
    : `Mi perfil clínico: ${profileText}`;

  let payload: string;

  if (image) {
    const imageBytes = await image.arrayBuffer();
    const base64 = Buffer.from(imageBytes).toString("base64");
    const mimeType = image.type;

    payload = JSON.stringify({
      contents: [
        {
          parts: [
            { text: userPrompt },
            { inline_data: { mime_type: mimeType, data: base64 } },
          ],
        },
      ],
      system_instruction: { parts: [{ text: systemPrompt }] },
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