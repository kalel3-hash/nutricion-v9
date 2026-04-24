"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NavbarProtegido from "@/components/NavbarProtegido";

type Item = {
  id: string;
  created_at?: string;
  food_description?: string;
  score?: number | null;
  analysis_result?: string;
};

const scoreColor = (s: number) => {
  if (s <= 3) return { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" };
  if (s <= 6) return { bg: "#FAEEDA", text: "#854F0B", border: "#FAC775" };
  return { bg: "#EAF3DE", text: "#27500A", border: "#C0DD97" };
};

export default function HistorialClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/history", { method: "GET" });
      const json = await res.json();
      setItems(json.items ?? []);
    } catch (e: any) {
      setError(e?.message || "Error cargando historial");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0F6FF" }}>

      <NavbarProtegido showSignOut={false} />

      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ margin: "0 0 0.3rem", fontSize: "1.5rem", fontWeight: 700, color: "#2C2C2A" }}>
              Historial de análisis
            </h1>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#5F5E5A" }}>
              Tus últimos {items.length} análisis guardados
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            style={{
              padding: "7px 16px", borderRadius: "8px",
              border: "1.5px solid #B5D4F4", background: "transparent",
              color: "#185FA5", fontSize: "0.85rem", fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Actualizando…" : "↺ Actualizar"}
          </button>
        </div>

        {error && (
          <div style={{
            background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "8px",
            padding: "0.75rem 1rem", marginBottom: "1rem",
            fontSize: "0.875rem", color: "#991B1B",
          }}>
            {error}
          </div>
        )}

        {loading && (
          <p style={{ color: "#5F5E5A", fontSize: "0.9rem", textAlign: "center", padding: "3rem 0" }}>
            Cargando historial…
          </p>
        )}

        {!loading && items.length === 0 && (
          <div style={{
            background: "#FFFFFF", borderRadius: "14px", border: "1px solid #B5D4F4",
            padding: "3rem", textAlign: "center",
          }}>
            <p style={{ margin: "0 0 1rem", fontSize: "0.95rem", color: "#5F5E5A" }}>
              Todavía no hay análisis guardados.
            </p>
            <Link href="/analizar" style={{
              display: "inline-block", padding: "0.7rem 1.5rem",
              borderRadius: "8px", background: "#185FA5",
              color: "#FFFFFF", fontSize: "0.9rem", fontWeight: 600, textDecoration: "none",
            }}>
              Hacer mi primer análisis
            </Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {items.map((it) => {
              const opened = openId === it.id;
              const s = it.score ?? null;
              const colors = s !== null ? scoreColor(s) : null;

              return (
                <div key={it.id} style={{
                  background: "#FFFFFF", borderRadius: "12px",
                  border: "1px solid #B5D4F4",
                  boxShadow: "0 2px 8px rgba(24,95,165,0.05)",
                  overflow: "hidden",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: "1rem",
                    padding: "1rem 1.25rem",
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{
                        margin: "0 0 0.2rem", fontWeight: 700,
                        fontSize: "0.95rem", color: "#2C2C2A",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {it.food_description ?? "Sin descripción"}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.78rem", color: "#888780" }}>
                        {it.created_at ? new Date(it.created_at).toLocaleString("es-AR") : ""}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", flexShrink: 0 }}>
                      {s !== null && colors && (
                        <div style={{
                          padding: "4px 12px", borderRadius: "20px",
                          background: colors.bg, border: `1px solid ${colors.border}`,
                          fontSize: "0.875rem", fontWeight: 700, color: colors.text,
                        }}>
                          {s}/10
                        </div>
                      )}
                      <button
                        onClick={() => toggle(it.id)}
                        style={{
                          padding: "5px 14px", borderRadius: "6px",
                          border: "1.5px solid #B5D4F4", background: "transparent",
                          color: "#185FA5", fontSize: "0.82rem", fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {opened ? "Ocultar" : "Ver"}
                      </button>
                    </div>
                  </div>

                  {opened && it.analysis_result && (
                    <div style={{
                      borderTop: "1px solid #E6F1FB",
                      padding: "1.25rem",
                      background: "#F8FBFF",
                    }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.75rem" }}>
                        <button
                          onClick={() => copyToClipboard(it.analysis_result || "", it.id)}
                          style={{
                            padding: "4px 12px", borderRadius: "6px",
                            border: "1px solid #B5D4F4", background: "#FFFFFF",
                            color: copied === it.id ? "#27500A" : "#185FA5",
                            fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                          }}
                        >
                          {copied === it.id ? "✅ Copiado" : "Copiar análisis"}
                        </button>
                      </div>
                      <pre style={{
                        whiteSpace: "pre-wrap", fontSize: "0.875rem",
                        color: "#2C2C2A", fontFamily: "inherit",
                        lineHeight: 1.7, margin: 0,
                      }}>
                        {it.analysis_result}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && items.length > 0 && (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link href="/analizar" style={{
              fontSize: "0.9rem", color: "#185FA5",
              fontWeight: 600, textDecoration: "none",
            }}>
              + Hacer nuevo análisis
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}