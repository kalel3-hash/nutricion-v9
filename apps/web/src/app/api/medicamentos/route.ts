import https from "https";
import { auth } from "@/auth";
import { getUsageStatus, incrementUsage } from "@/lib/usage";
import { createClient } from "@supabase/supabase-js";
import { profileToText } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 60;

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
    return new Response(JSON.stringify({ error: "Ingresa el medicamento recetado o una imagen" }), { status: 400 });
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

  const systemPrompt = `Sos un asistente de salud que ayuda a los usuarios a entender mejor la medicacion que su medico les receto.
Tu rol es cruzar el medicamento recetado con el perfil clinico del usuario y señalar que datos de ese perfil son relevantes para esa receta, para que el usuario pueda tener una conversacion mas informada con su medico.
NO evaluas si el medico estuvo bien o mal. NO recomendas ni desaconsejas tomar el medicamento. NO reemplazas la consulta medica.
Respondes siempre en español, de forma clara, concisa y sin alarmar innecesariamente.
La respuesta debe ser breve y directa. Maximo 4 bloques cortos.
Usas exactamente esta estructura:

## Medicamento recetado
Una sola oracion explicando para que se usa este medicamento.

## Lo que encontre en tu perfil
Puntos concretos del perfil del usuario que son relevantes para este medicamento. Solo los que realmente importan. Si un valor esta fuera de rango normal, mencionalo. Si no hay nada relevante, decilo claramente.

## Que consultarle a tu medico
2 o 3 preguntas cortas y concretas para que el usuario le haga a su medico, basadas especificamente en su perfil.

## Aviso
Una sola oracion recordando que esto no reemplaza la consulta medica.`;

  const userPrompt = query
    ? "Mi medico me receto: " + query + "\n\nMi perfil medico:\n" + profileText
    : "Mi perfil medico:\n" + profileText;

  let payload: string;

  if (image) {
    const imageBytes = await image.arrayBuffer();
    const base64 = Buffer.from(imageBytes).toString("base64");
    const mimeType = image.type;
    payload = JSON.stringify({
      contents: [
        {
          parts: [
            { text: systemPrompt + "\n\n" + userPrompt },
            { inline_data: { mime_type: mimeType, data: base64 } },
          ],
        },
      ],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
    });
  } else {
    payload = JSON.stringify({
      contents: [{ parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
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
          path: "/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=" + apiKey + "&alt=sse",
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