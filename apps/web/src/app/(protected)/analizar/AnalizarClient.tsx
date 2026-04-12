"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type ProfileResponse = { profile: any | null; error?: string };

export default function AnalizarClient() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [foodDescription, setFoodDescription] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Cargar perfil clínico ──────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await fetch("/api/profile", { method: "GET" });
        const json = (await res.json()) as ProfileResponse;
        if (!mounted) return;
        setProfile(json.profile ?? null);
      } catch {
        if (!mounted) return;
        setProfile(null);
      } finally {
        if (!mounted) return;
        setLoadingProfile(false);
      }
    };
    loadProfile();
    return () => { mounted = false; };
  }, []);

  // ── Analizar alimento (stream) ─────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!foodDescription.trim()) return;
    setLoading(true);
    setAnalysis("");
    setError("");

    try {
      const response = await fetch("/api/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food_description: foodDescription, health_profile: profile }),
      });

      if (!response.ok) throw new Error("Error en el motor de IA");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No se pudo leer la respuesta del motor de IA");

      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value);
        setAnalysis(text);
      }

      const scoreMatch = text.match(/(\d+)\s*\/\s*10/);
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;

      const saveRes = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food_description: foodDescription, analysis_result: text, score }),
      });

      if (!saveRes.ok) {
        const j = await saveRes.json().catch(() => null);
        console.warn("No se pudo guardar historial:", j);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // ── Extraer puntaje para mostrarlo destacado ───────────────────────────────
  const scoreMatch = analysis.match(/(\d+)\s*\/\s*10/);
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;

  const scoreColor = (s: number) => {
    if (s <= 3) return { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" };
    if (s <= 6) return { bg: "#FAEEDA", text: "#854F0B", border: "#FAC775" };
    return { bg: "#EAF3DE", text: "#27500A", border: "#C0DD97" };
  };

  // ── Loading inicial ────────────────────────────────────────────────────────
  if (loadingProfile) {
    return (
      <div style={{ minHeight: "100vh", background: "#F0F6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#5F5E5A", fontSize: "0.9rem" }}>Cargando perfil…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F0F6FF" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0.875rem 2rem", background: "#FFFFFF",
        borderBottom: "1px solid #B5D4F4", position: "sticky", top: 0, zIndex: 50,
      }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <Image src="/Logo.png" alt="VitalCross AI" width={56} height={56} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: "15px", fontWeight: 600 }}>
            <span style={{ color: "#185FA5" }}>Vital</span>
            <span style={{ color: "#2C2C2A" }}>Cross AI</span>
          </span>
        </Link>
        <Link href="/dashboard" style={{
          padding: "7px 18px", borderRadius: "8px", border: "1.5px solid #B5D4F4",
          background: "transparent", color: "#5F5E5A", fontSize: "13px",
          fontWeight: 500, textDecoration: "none",
        }}>
          ← Volver
        </Link>
      </nav>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ margin: "0 0 0.3rem", fontSize: "1.5rem", fontWeight: 700, color: "#2C2C2A" }}>
            Analizar alimento
          </h1>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#5F5E5A" }}>
            Describí lo que vas a comer y la IA lo evalúa según tu perfil clínico.
          </p>
        </div>

        {/* Aviso sin perfil */}
        {!profile && (
          <div style={{
            background: "#FAEEDA", border: "1px solid #FAC775", borderRadius: "10px",
            padding: "0.875rem 1.25rem", marginBottom: "1.25rem",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
          }}>
            <span style={{ fontSize: "0.875rem", color: "#854F0B" }}>
              ⚠️ Sin perfil clínico — el análisis será estándar, no personalizado.
            </span>
            <Link href="/perfil" style={{
              fontSize: "0.8rem", color: "#185FA5", fontWeight: 600,
              textDecoration: "none", whiteSpace: "nowrap",
            }}>
              Cargar perfil →
            </Link>
          </div>
        )}

        {/* Card principal */}
        <div style={{
          background: "#FFFFFF", borderRadius: "14px",
          border: "1px solid #B5D4F4",
          boxShadow: "0 2px 12px rgba(24,95,165,0.06)",
          padding: "1.75rem", marginBottom: "1.25rem",
        }}>
          <label style={{
            display: "block", fontSize: "0.8rem", fontWeight: 600,
            color: "#5F5E5A", marginBottom: "8px",
            textTransform: "uppercase", letterSpacing: "0.4px",
          }}>
            ¿Qué vas a comer?
          </label>

          <textarea
            value={foodDescription}
            onChange={(e) => setFoodDescription(e.target.value)}
            placeholder="Ej: Milanesa con puré y un vaso de jugo de naranja."
            style={{
              width: "100%", height: "120px",
              padding: "0.875rem 1rem", borderRadius: "8px",
              border: "1.5px solid #B5D4F4", fontSize: "0.95rem",
              color: "#2C2C2A", background: "#F8FBFF",
              outline: "none", resize: "vertical",
              boxSizing: "border-box", lineHeight: 1.6,
            }}
          />

          {error && (
            <div style={{
              background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "8px",
              padding: "0.75rem 1rem", marginTop: "1rem",
              fontSize: "0.875rem", color: "#991B1B",
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || !foodDescription.trim()}
            style={{
              width: "100%", marginTop: "1rem", padding: "0.9rem",
              borderRadius: "8px", background: loading ? "#378ADD" : "#185FA5",
              color: "#FFFFFF", fontSize: "1rem", fontWeight: 700,
              border: "none", cursor: loading || !foodDescription.trim() ? "not-allowed" : "pointer",
              opacity: !foodDescription.trim() ? 0.5 : 1,
              letterSpacing: "0.3px",
            }}
          >
            {loading ? "Analizando…" : "Analizar ahora"}
          </button>

          {/* Indicador de streaming */}
          {loading && (
            <p style={{ margin: "0.75rem 0 0", fontSize: "0.8rem", color: "#378ADD", textAlign: "center" }}>
              La IA está procesando tu consulta en tiempo real…
            </p>
          )}
        </div>

        {/* Resultado */}
        {analysis && (
          <div style={{
            background: "#FFFFFF", borderRadius: "14px",
            border: "1px solid #B5D4F4",
            boxShadow: "0 2px 12px rgba(24,95,165,0.06)",
            padding: "1.75rem",
          }}>

            {/* Puntaje destacado */}
            {score !== null && (
              <div style={{
                display: "flex", alignItems: "center", gap: "1rem",
                padding: "1rem 1.25rem", borderRadius: "10px", marginBottom: "1.5rem",
                background: scoreColor(score).bg,
                border: `1px solid ${scoreColor(score).border}`,
              }}>
                <div style={{
                  fontSize: "2rem", fontWeight: 800,
                  color: scoreColor(score).text, lineHeight: 1,
                }}>
                  {score}<span style={{ fontSize: "1rem", fontWeight: 500 }}>/10</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: scoreColor(score).text }}>
                    Puntaje personalizado
                  </p>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: scoreColor(score).text, opacity: 0.8 }}>
                    Basado en tu perfil clínico
                  </p>
                </div>
              </div>
            )}

            <label style={{
              display: "block", fontSize: "0.8rem", fontWeight: 600,
              color: "#5F5E5A", marginBottom: "0.75rem",
              textTransform: "uppercase", letterSpacing: "0.4px",
            }}>
              Análisis completo
            </label>

            <div style={{
              background: "#F8FBFF", borderRadius: "8px",
              border: "1px solid #E6F1FB", padding: "1.25rem",
            }}>
              <pre style={{
                whiteSpace: "pre-wrap", fontSize: "0.875rem",
                color: "#2C2C2A", fontFamily: "inherit", lineHeight: 1.7, margin: 0,
              }}>
                {analysis}
              </pre>
            </div>

            <div style={{ marginTop: "1rem", textAlign: "right" }}>
              <Link href="/historial" style={{ fontSize: "0.85rem", color: "#185FA5", textDecoration: "none", fontWeight: 500 }}>
                Ver historial completo →
              </Link>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}