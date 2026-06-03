"use client";
import { useEffect, useState } from "react";

type Entry = {
  id: string;
  query: string;
  result: string;
  created_at: string;
};

export default function HistorialMedicamentosClient() {
  const [history, setHistory] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/historial-medicamentos")
      .then(r => r.json())
      .then(d => setHistory(d.history || []))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    setDeleting(id);
    await fetch("/api/historial-medicamentos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setHistory(prev => prev.filter(e => e.id !== id));
    setDeleting(null);
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
        <div key={i} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#185FA5", marginBottom: 6 }}>{title}</div>
          <div style={{ fontSize: 13, color: "#2C2C2A", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{content}</div>
        </div>
      );
    });
  }

  if (loading) {
    return (
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "32px 16px", textAlign: "center", color: "#5F5E5A" }}>
        Cargando historial...
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#185FA5", marginBottom: 4 }}>Historial de Medicamentos</h1>
      <p style={{ fontSize: 14, color: "#5F5E5A", marginBottom: 24 }}>
        Tus últimas 50 consultas sobre medicamentos.
      </p>

      {history.length === 0 ? (
        <div style={{ background: "#F0F6FF", border: "1.5px solid #B5D4F4", borderRadius: 12, padding: "32px", textAlign: "center", color: "#5F5E5A", fontSize: 14 }}>
          Todavía no tenés consultas de medicamentos.
        </div>
      ) : (
        history.map(entry => (
          <div key={entry.id} style={{ background: "#FFFFFF", border: "1.5px solid #B5D4F4", borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
            {/* Header */}
            <div
              onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
              style={{ padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#2C2C2A" }}>{entry.query}</div>
                <div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>
                  {new Date(entry.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(entry.id); }}
                  disabled={deleting === entry.id}
                  style={{ padding: "4px 10px", borderRadius: 6, border: "1.5px solid #FECACA", background: "transparent", color: "#991B1B", fontSize: 12, cursor: "pointer" }}
                >
                  {deleting === entry.id ? "..." : "Eliminar"}
                </button>
                <span style={{ color: "#5F5E5A", fontSize: 18 }}>{expanded === entry.id ? "▲" : "▼"}</span>
              </div>
            </div>

            {/* Contenido expandido */}
            {expanded === entry.id && (
              <div style={{ padding: "0 16px 16px" }}>
                {renderResult(entry.result)}
              </div>
            )}
          </div>
        ))
      )}
    </main>
  );
}