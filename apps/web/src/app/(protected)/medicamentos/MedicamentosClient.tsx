"use client";
import { useState, useRef } from "react";

type Props = { userEmail: string };

export default function MedicamentosClient({ userEmail }: Props) {
  const [query, setQuery] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!query.trim() && !image) {
      setError("Ingresá el nombre de un medicamento o una imagen.");
      return;
    }
    setError("");
    setResult("");
    setLoading(true);

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
        setError(data.error || "Error al consultar.");
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
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  function renderResult(text: string) {
    const blocks = text.split(/\n(?=## )/).filter(Boolean);
    return blocks.map((block, i) => {
      const lines = block.split("\n");
      const title = lines[0].replace(/^##\s*/, "").trim();
      const content = lines.slice(1).join("\n").trim();

      let bg = "#EEF4FF";
      let border = "#85B7EB";

      if (title.includes("Factores")) { bg = "#E6F1FB"; border = "#378ADD"; }
      else if (title.includes("Preguntas")) { bg = "#EAF3DE"; border = "#C0DD97"; }
      else if (title.includes("Señales")) { bg = "#FAEEDA"; border = "#FAC775"; }
      else if (title.includes("Disclaimer")) { bg = "#F1EFE8"; border = "#D3D1C7"; }

      return (
        <div key={i} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#185FA5", marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: 14, color: "#2C2C2A", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{content}</div>
        </div>
      );
    });
  }

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#185FA5", marginBottom: 4 }}>Analizar Medicamento</h1>
      <p style={{ fontSize: 14, color: "#5F5E5A", marginBottom: 24 }}>
        Consultá sobre un medicamento y preparate mejor para hablar con tu médico.
      </p>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#2C2C2A", display: "block", marginBottom: 6 }}>
          Nombre del medicamento o consulta
        </label>
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ej: Metformina 500mg, Ibuprofeno, Enalapril..."
          rows={3}
          style={{ width: "100%", borderRadius: 10, border: "1.5px solid #B5D4F4", padding: "10px 14px", fontSize: 14, color: "#2C2C2A", background: "#F0F6FF", resize: "vertical", boxSizing: "border-box" }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#2C2C2A", display: "block", marginBottom: 6 }}>
          Foto de la caja o prospecto (opcional)
        </label>
        {!imagePreview ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            style={{ border: "2px dashed #B5D4F4", borderRadius: 10, padding: "24px", textAlign: "center", cursor: "pointer", background: "#F0F6FF", color: "#5F5E5A", fontSize: 13 }}
          >
            Arrastrá una imagen o hacé clic para seleccionar
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
        disabled={loading}
        style={{ width: "100%", padding: "12px", borderRadius: 10, background: loading ? "#85B7EB" : "#185FA5", color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: loading ? "not-allowed" : "pointer", marginBottom: 24 }}
      >
        {loading ? "Analizando..." : "Analizar"}
      </button>

      {loading && !result && (
        <div style={{ textAlign: "center", color: "#5F5E5A", fontSize: 14, padding: "24px 0" }}>
          Consultando con IA...
        </div>
      )}

      {result && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#2C2C2A", marginBottom: 12 }}>Resultado</h2>
          {renderResult(result)}
        </div>
      )}
    </main>
  );
}