import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUsageStatus, incrementUsage } from "@/lib/usage";
import { compactProfile } from "@/lib/utils";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const email = session.user.email;

  const usageStatus = await getUsageStatus(email);
  if (!usageStatus.canQuery) {
    return NextResponse.json(
      { error: usageStatus.daily >= 5 ? "Límite diario alcanzado" : "Límite mensual alcanzado" },
      { status: 429 }
    );
  }

  const formData = await req.formData();
  const query = formData.get("query") as string | null;
  const image = formData.get("image") as File | null;

  if (!query && !image) {
    return NextResponse.json({ error: "Ingresá un medicamento o una imagen" }, { status: 400 });
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
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
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

  try {
    let requestBody: Record<string, unknown>;

    if (image) {
      const imageBytes = await image.arrayBuffer();
      const base64 = Buffer.from(imageBytes).toString("base64");
      const mimeType = image.type;

      requestBody = {
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
      };
    } else {
      requestBody = {
        contents: [{ parts: [{ text: userPrompt }] }],
        system_instruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
      };
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    if (!geminiRes.ok || !geminiRes.body) {
      return NextResponse.json({ error: "Error al consultar Gemini" }, { status: 500 });
    }

    let tokenIncremented = false;
    let fullText = "";

    const stream = new ReadableStream({
      async start(controller) {
        const reader = geminiRes.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                if (!tokenIncremented) {
                  tokenIncremented = true;
                  await incrementUsage(email);
                }
                fullText += text;
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            } catch {}
          }
        }

        if (fullText) {
          await supabase.from("medication_history").insert({
            owner_email: email,
            query: query || "Consulta por imagen",
            result: fullText,
          });
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}