"use client";
import { useState, useRef, useEffect } from "react";

type Props = { userEmail: string };

function renderContent(content: string, titleColor: string) {
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
  return lines.map((line, i) => {
    const isBullet = /^[\*\-]\s+/.test(line);
    const isNumbered = /^\d+[\.\)]\s+/.test(line);
    const formatted = line
      .replace(/^[\*\-]\s+/, "")
      .replace(/^\d+[\.\)]\s+/, "")
      .replace(/\*\*(.*?)\*\*/g, `<strong style="color:${titleColor}">$1</strong>`);

    if (isBullet || isNumbered) {
      return (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
          <span style={{ color: titleColor, flexShrink: 0, marginTop: 2 }}>
            {isNumbered ? `${i + 1}.` : "•"}
          </span>
          <span
            style={{ fontSize: 14, lineHeight: 1.7, color: "#2C2C2A" }}
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        </div>
      );
    }
    return (
      <p
        key={i}
        style={{ margin: "0 0 6px", fontSize: 14, lineHeight: 1.7, color: "#2C2C2A" }}
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    );
  });
}

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "already" | "error">("idle");

  async function handleSubmit() {
    if (!email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok && data.already) setStatus("already");
      else if (data.ok) setStatus("ok");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div style={{ marginTop: "0.75rem", background: "#EAF3DE", border: "1px solid #C0DD97", borderRadius: "8px", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#27500A" }}>
        Te anotamos. Te avisamos cuando haya paquetes disponibles.
      </div>
    );
  }

  if (status === "already") {
    return (
      <div style={{ marginTop: "0.75rem", background: "#E6F1FB", border: "1px solid #B5D4F4", borderRadius: "8px", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#185FA5" }}>
        Ya estas en la lista. Te avisamos cuando haya paquetes disponibles.
      </div>
    );
  }

  return (
    <div style={{ marginTop: "0.875rem", background: "#FFF8E6", border: "1px solid #FAC775", borderRadius: "8px", padding: "0.875rem 1rem" }}>
      <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", fontWeight: 600, color: "#854F0B" }}>
        Pronto vas a poder comprar paquetes de consultas
      </p>
      <p style={{ margin: "0 0 0.75rem", fontSize: "0.8rem", color: "#854F0B" }}>
        Deja tu email y te avisamos cuando este disponible.
      </p>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="tu@email.com"
          style={{ flex: 1, minWidth: 0, padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1.5px solid #FAC775", fontSize: "0.875rem", color: "#2C2C2A", background: "#FFFFFF", outline: "none" }}
        />
        <button
          onClick={handleSubmit}
          disabled={status === "loading" || !email.includes("@")}
          style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: "#185FA5", color: "#FFFFFF", border: "none", fontSize: "0.875rem", fontWeight: 600, cursor: status === "loading" ? "not-allowed" : "pointer", whiteSpace: "nowrap", opacity: !email.includes("@") ? 0.6 : 1 }}
        >
          {status === "loading" ? "Guardando..." : "Avisame"}
        </button>
      </div>
      {status === "error" && (
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.78rem", color: "#991B1B" }}>Error al guardar. Intentalo de nuevo.</p>
      )}
    </div>
  );
}

export default function MedicamentosClient({ userEmail }: Props) {
  const [query, setQuery] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const [usage, setUsage] = useState<{ daily_used: number; daily_limit: number; monthly_used: number; monthly_limit: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then(r => r.json())
      .then(setUsage)
      .catch(() => {});
  }, []);

  const quotaExhausted = usage !== null && (usage.daily_used >= usage.daily_limit || usage.monthly_used >= usage.monthly_limit);

  function handleImage(file: File) {
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImage(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImage(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function removeImage() {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit() {
    if (quotaExhausted) { setLimitReached(true); return; }
    if (!query.trim() && !image) {
      setError("Ingresa el medicamento recetado o una imagen de la receta.");
      return;
    }
    setError("");
    setResult("");
    setLoading(true);
    setLimitReached(false);

    const formData = new FormData();
    if (query.trim()) formData.append("query", query.trim());
    if (image) formData.append("image", image);

    try {
      const res = await fetch("/api/medicamentos", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 429) setLimitReached(true);
        else setError(data.error || "Error al consultar.");
        setLoading(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) setResult(prev => prev + chunk);
      }
    } catch {
      setError("Error de conexion.");
    } finally {
      setLoading(false);
    }
  }

  function renderResult(text: string) {
    const blocks = text.split(/\n(?=## )/).filter(Boolean);
    if (blocks.length <= 1) {
      return (
        <div style={{ background: "#EEF4FF", border: "1.5px solid #85B7EB", borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 14, color: "#2C2C2A", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{text}</div>
        </div>
      );
    }
    return blocks.map((block, i) => {
      const lines = block.split("\n");
      const title = lines[0].replace(/^##\s*/, "").trim();
      const content = lines.slice(1).join("\n").trim();

      let bg = "#EEF4FF";
      let border = "#85B7EB";
      let titleColor = "#185FA5";

      if (title.includes("encontre") || title.includes("perfil")) {
        bg = "#E6F1FB"; border = "#378ADD"; titleColor = "#0C447C";
      } else if (title.includes("consultarle") || title.includes("medico")) {
        bg = "#EAF3DE"; border = "#C0DD97"; titleColor = "#27500A";
      } else if (title.includes("Aviso")) {
        bg = "#F1EFE8"; border = "#D3D1C7"; titleColor = "#444441";
      }

      return (
        <div key={i} style={{ background: bg, border: "1.5px solid " + border, borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: titleColor, marginBottom: 10 }}>{title}</div>
          <div>{renderContent(content, titleColor)}</div>
        </div>
      );
    });
  }

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#185FA5", marginBottom: 4 }}>
        Revisar medicamento recetado
      </h1>
      <p style={{ fontSize: 14, color: "#5F5E5A", marginBottom: 24, lineHeight: 1.6 }}>
        Tu medico te receto un medicamento. Ingresalo aca y te digo que datos de tu perfil son relevantes para que puedas consultarle.
      </p>

      {usage && !limitReached && (
        <div style={{ background: "#FFFFFF", border: "1px solid #B5D4F4", borderRadius: 10, padding: "0.875rem 1.25rem", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, lineHeight: 1, color: usage.daily_used >= usage.daily_limit ? "#991B1B" : usage.daily_limit - usage.daily_used === 1 ? "#854F0B" : "#185FA5" }}>
                {usage.daily_limit - usage.daily_used}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#5F5E5A", marginTop: "2px" }}>consultas disponibles hoy</div>
            </div>
            <div style={{ width: "1px", background: "#B5D4F4", height: "2rem", alignSelf: "center" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, lineHeight: 1, color: usage.monthly_used >= usage.monthly_limit ? "#991B1B" : usage.monthly_limit - usage.monthly_used <= 3 ? "#854F0B" : "#185FA5" }}>
                {usage.monthly_limit - usage.monthly_used}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#5F5E5A", marginTop: "2px" }}>consultas disponibles este mes</div>
            </div>
          </div>
        </div>
      )}

      {limitReached && (
        <div style={{ background: "#FFFFFF", border: "1px solid #B5D4F4", borderRadius: 10, padding: "0.875rem 1.25rem", marginBottom: 20 }}>
          <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: 8, padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#991B1B" }}>
            Alcanzaste el límite de consultas. Podés volver mañana con consultas nuevas.
          </div>
          <WaitlistForm />
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#2C2C2A", display: "block", marginBottom: 6 }}>
          Que medicamento te recetaron?
        </label>
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ej: El medico me receto Enalapril 10mg para la presion"
          rows={3}
          disabled={limitReached || quotaExhausted}
          style={{ width: "100%", borderRadius: 10, border: "1.5px solid #B5D4F4", padding: "10px 14px", fontSize: 14, color: "#2C2C2A", background: (limitReached || quotaExhausted) ? "#F0F0F0" : "#F0F6FF", resize: "vertical", boxSizing: "border-box", opacity: (limitReached || quotaExhausted) ? 0.6 : 1 }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#2C2C2A", display: "block", marginBottom: 6 }}>
          Foto de la receta o caja (opcional)
        </label>
        {!imagePreview ? (
          <div
            onDrop={(limitReached || quotaExhausted) ? undefined : handleDrop}
            onDragOver={(limitReached || quotaExhausted) ? undefined : handleDragOver}
            onClick={(limitReached || quotaExhausted) ? undefined : () => fileInputRef.current?.click()}
            style={{ border: "2px dashed #B5D4F4", borderRadius: 10, padding: "24px", textAlign: "center", cursor: (limitReached || quotaExhausted) ? "not-allowed" : "pointer", background: "#F0F6FF", color: "#5F5E5A", fontSize: 13, opacity: (limitReached || quotaExhausted) ? 0.6 : 1 }}
          >
            Arrastra una imagen o hace clic para seleccionar
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
          </div>
        ) : (
          <div style={{ position: "relative", display: "inline-block" }}>
            <img src={imagePreview} alt="Preview" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 10, border: "1.5px solid #B5D4F4" }} />
            <button onClick={removeImage} style={{ position: "absolute", top: 6, right: 6, background: "#991B1B", color: "#fff", border: "none", borderRadius: 6, padding: "2px 8px", fontSize: 12, cursor: "pointer" }}>
              Quitar
            </button>
          </div>
        )}
      </div>

      {error && (
        <div style={{ background: "#FEE2E2", border: "1.5px solid #FECACA", borderRadius: 10, padding: "10px 14px", color: "#991B1B", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || limitReached || quotaExhausted}
        style={{ width: "100%", padding: "12px", borderRadius: 10, background: (loading || limitReached || quotaExhausted) ? "#85B7EB" : "#185FA5", color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: (loading || limitReached || quotaExhausted) ? "not-allowed" : "pointer", marginBottom: 24, opacity: (limitReached || quotaExhausted) ? 0.6 : 1 }}
      >
        {loading ? "Analizando..." : (limitReached || quotaExhausted) ? "Limite de consultas alcanzado" : "Revisar con mi perfil"}
      </button>

      {loading && !result && (
        <div style={{ textAlign: "center", color: "#5F5E5A", fontSize: 14, padding: "24px 0" }}>
          Cruzando el medicamento con tu perfil...
        </div>
      )}

      {result && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#2C2C2A", marginBottom: 12 }}>
            Resultado
          </h2>
          {renderResult(result)}
        </div>
      )}
    </main>
  );
}