"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { compactProfile } from "@/lib/utils";
import { shareAnalysisAsImage } from "@/lib/shareAnalysis";

type ProfileResponse = { profile: any | null; error?: string };
type PhotoType = "alimento" | "etiqueta";
type Block = { key: string; title: string; content: string };

function parseBlocks(text: string): Block[] {
  const titles: { index: number; raw: string; label: string }[] = [];
  let match;
  const re = /BLOQUE\s+\d+\s*[-–]\s*([A-ZÁÉÍÓÚÑ\s]+?):/gi;
  while ((match = re.exec(text)) !== null) {
    titles.push({ index: match.index, raw: match[0], label: match[1].trim() });
  }
  if (titles.length === 0) return [{ key: "raw", title: "Análisis", content: text }];
  return titles.map((t, i) => {
    const start = t.index + t.raw.length;
    const end = i + 1 < titles.length ? titles[i + 1].index : text.length;
    return { key: t.label, title: t.label, content: text.slice(start, end).trim() };
  });
}

const blockStyles: Record<string, { bg: string; border: string; titleColor: string; icon: string }> = {
  default:                  { bg: "#F8FBFF",  border: "#B5D4F4", titleColor: "#0C447C", icon: "📋" },
  PUNTAJE:                  { bg: "#F8FBFF",  border: "#B5D4F4", titleColor: "#0C447C", icon: "🎯" },
  "ANÁLISIS PERSONALIZADO": { bg: "#E6F1FB",  border: "#85B7EB", titleColor: "#0C447C", icon: "🧬" },
  "SUGERENCIAS DE MEJORA":  { bg: "#EAF3DE",  border: "#C0DD97", titleColor: "#27500A", icon: "💡" },
  FUENTES:                  { bg: "#F1EFE8",  border: "#D3D1C7", titleColor: "#444441", icon: "📚" },
};

function getStyle(label: string) {
  for (const key of Object.keys(blockStyles)) {
    if (label.toUpperCase().includes(key)) return blockStyles[key];
  }
  return blockStyles.default;
}

function renderSources(content: string) {
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
  return lines.map((line, i) => {
    const isSource = /^\d+[\.\)]/.test(line);
    if (!isSource) return (
      <p key={i} style={{ margin: "0 0 0.5rem", fontSize: "0.875rem", color: "#5F5E5A" }}>{line}</p>
    );
    const titleMatch = line.match(/["""«»]([^"""«»]+)["""«»]/) ||
                       line.match(/\*([^*]+)\*/) ||
                       line.match(/\*\*([^*]+)\*\*/);
    const searchText = titleMatch
      ? titleMatch[1]
      : line.replace(/^\d+[\.\)]\s*/, "").replace(/\*\*/g, "").slice(0, 120);
    const pubmedUrl = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(searchText)}`;
    const scholarUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(searchText)}`;
    const cleanLine = line.replace(/^\d+[\.\)]\s*/, "").replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");
    return (
      <div key={i} style={{
        display: "flex", flexDirection: "column", gap: "6px",
        padding: "0.875rem", borderRadius: "8px",
        background: "#FFFFFF", border: "1px solid #D3D1C7", marginBottom: "0.75rem",
      }}>
        <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.65, color: "#2C2C2A" }}>
          <strong style={{ color: "#444441" }}>{i + 1}.</strong> {cleanLine}
        </p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <a href={pubmedUrl} target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "6px",
            background: "#E6F1FB", border: "1px solid #B5D4F4", color: "#185FA5", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none",
          }}>🔬 Buscar en PubMed</a>
          <a href={scholarUrl} target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "6px",
            background: "#F1EFE8", border: "1px solid #D3D1C7", color: "#444441", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none",
          }}>🎓 Buscar en Scholar</a>
        </div>
      </div>
    );
  });
}

function renderContent(content: string, titleColor: string) {
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
  return lines.map((line, i) => {
    const isBullet = /^[\*\-]\s+/.test(line);
    const formattedLine = line.replace(/\*\*(.*?)\*\*/g, (_, t) => `<strong style="color:${titleColor}">${t}</strong>`);
    if (isBullet) {
      return (
        <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "0.6rem" }}>
          <span style={{ color: titleColor, flexShrink: 0, marginTop: "2px" }}>•</span>
          <span style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#2C2C2A" }}
            dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[\*\-]\s+/, "") }} />
        </div>
      );
    }
    return (
      <p key={i} style={{ margin: "0 0 0.65rem", fontSize: "0.9rem", lineHeight: 1.75, color: "#2C2C2A" }}
        dangerouslySetInnerHTML={{ __html: formattedLine }} />
    );
  });
}

export default function AnalizarClient() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [foodDescription, setFoodDescription] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [identification, setIdentification] = useState("");
  const [sharing, setSharing] = useState(false);

  const [usage, setUsage] = useState<{
    daily_used: number; daily_limit: number;
    monthly_used: number; monthly_limit: number;
  } | null>(null);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoType, setPhotoType] = useState<PhotoType>("alimento");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await fetch("/api/profile", { method: "GET" });
        const json = (await res.json()) as ProfileResponse;
        if (!mounted) return;
        setProfile(json.profile ?? null);
        const usageRes = await fetch("/api/usage");
        if (usageRes.ok) {
          const usageData = await usageRes.json();
          if (mounted) setUsage(usageData);
        }
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

  const refreshUsage = async () => {
    const res = await fetch("/api/usage");
    if (res.ok) setUsage(await res.json());
  };

  const limitReached = usage !== null && (
    usage.daily_used >= usage.daily_limit || usage.monthly_used >= usage.monthly_limit
  );

  const handlePhotoSelect = (type: PhotoType) => {
    setPhotoType(type); setPhotoPreview(null); setPhotoFile(null);
    setAnalysis(""); setError(""); setIdentification("");
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); e.target.value = "";
  };

  const clearPhoto = () => { setPhotoPreview(null); setPhotoFile(null); };

  const saveToHistory = async (text: string, description: string) => {
    const scoreMatch = text.match(/(\d+)\s*\/\s*10/);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
    await fetch("/api/history", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ food_description: description, analysis_result: text, score }),
    });
  };

  const streamResponse = async (response: Response) => {
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No se pudo leer la respuesta");
    const decoder = new TextDecoder();
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value);
      const idMatch = text.match(/^IDENTIFICACIÓN:\s*(.+)/m);
      if (idMatch) setIdentification(idMatch[1].trim());
      setAnalysis(text);
    }
    return text;
  };

  const handleAnalyzeText = async () => {
    if (!foodDescription.trim()) return;
    setLoading(true); setAnalysis(""); setError(""); setIdentification("");
    try {
      const response = await fetch("/api/analizar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food_description: foodDescription, health_profile: compactProfile(profile ?? {}) }),
      });
      if (response.status === 429) {
        const errData = await response.json();
        setError(errData.error ?? "Límite de consultas alcanzado.");
        await refreshUsage(); return;
      }
      if (!response.ok) throw new Error("Error en el motor de IA");
      const text = await streamResponse(response);
      await saveToHistory(text, foodDescription);
      await refreshUsage();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally { setLoading(false); }
  };

  const handleAnalyzePhoto = async () => {
    if (!photoFile) return;
    setLoading(true); setAnalysis(""); setError(""); setIdentification("");
    try {
      const formData = new FormData();
      formData.append("image", photoFile); formData.append("type", photoType);
      formData.append("health_profile", JSON.stringify(compactProfile(profile ?? {})));
      const response = await fetch("/api/analizar-foto", { method: "POST", body: formData });
      if (response.status === 429) {
        const errData = await response.json();
        setError(errData.error ?? "Límite de consultas alcanzado.");
        await refreshUsage(); return;
      }
      if (!response.ok) throw new Error("Error en el motor de IA");
      const text = await streamResponse(response);
      const label = photoType === "etiqueta" ? "Etiqueta nutricional (foto)" : "Alimento analizado por foto";
      await saveToHistory(text, label);
      await refreshUsage();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally { setLoading(false); }
  };

  const handleShare = async () => {
    if (!analysis) return;
    setSharing(true);
    try {
      const scoreMatch = analysis.match(/(\d+)\s*\/\s*10/);
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
      const description = identification || foodDescription || "Alimento analizado";
      await shareAnalysisAsImage({ foodDescription: description, score, analysisText: analysis });
    } catch { }
    finally { setSharing(false); }
  };

  const scoreMatch = analysis.match(/(\d+)\s*\/\s*10/);
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
  const scoreColor = (s: number) => {
    if (s <= 3) return { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" };
    if (s <= 6) return { bg: "#FAEEDA", text: "#854F0B", border: "#FAC775" };
    return { bg: "#EAF3DE", text: "#27500A", border: "#C0DD97" };
  };

  const blocks = analysis ? parseBlocks(analysis) : [];

  if (loadingProfile) {
    return (
      <div style={{ minHeight: "100vh", background: "#F0F6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#5F5E5A" }}>Cargando perfil…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F0F6FF" }}>
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
        style={{ display: "none" }} onChange={handleFileChange} />

      {/* NAVBAR */}
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
          background: "transparent", color: "#5F5E5A", fontSize: "13px", fontWeight: 500, textDecoration: "none",
        }}>← Volver</Link>
      </nav>

      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ margin: "0 0 0.3rem", fontSize: "1.5rem", fontWeight: 700, color: "#2C2C2A" }}>Analizar alimento</h1>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#5F5E5A" }}>Describí, fotografiá o escaneá un alimento para recibir tu análisis personalizado.</p>
        </div>

        {!profile && (
          <div style={{
            background: "#FAEEDA", border: "1px solid #FAC775", borderRadius: "10px",
            padding: "0.875rem 1.25rem", marginBottom: "1.25rem",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
          }}>
            <span style={{ fontSize: "0.875rem", color: "#854F0B" }}>⚠️ Sin perfil clínico — el análisis será estándar.</span>
            <Link href="/perfil" style={{ fontSize: "0.8rem", color: "#185FA5", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>Cargar perfil →</Link>
          </div>
        )}

        {usage && (
          <div style={{
            background: "#FFFFFF", border: "1px solid #B5D4F4",
            borderRadius: "10px", padding: "0.875rem 1.25rem", marginBottom: "1.25rem",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "1.3rem", fontWeight: 800, lineHeight: 1,
                  color: usage.daily_used >= usage.daily_limit ? "#991B1B"
                       : usage.daily_used >= usage.daily_limit - 1 ? "#854F0B" : "#185FA5",
                }}>{usage.daily_used}/{usage.daily_limit}</div>
                <div style={{ fontSize: "0.75rem", color: "#5F5E5A", marginTop: "2px" }}>consultas hoy</div>
              </div>
              <div style={{ width: "1px", background: "#B5D4F4", height: "2rem", alignSelf: "center" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "1.3rem", fontWeight: 800, lineHeight: 1,
                  color: usage.monthly_used >= usage.monthly_limit ? "#991B1B"
                       : usage.monthly_used >= usage.monthly_limit - 1 ? "#854F0B" : "#185FA5",
                }}>{usage.monthly_used}/{usage.monthly_limit}</div>
                <div style={{ fontSize: "0.75rem", color: "#5F5E5A", marginTop: "2px" }}>consultas este mes</div>
              </div>
            </div>
            {limitReached && (
              <div style={{
                marginTop: "0.75rem", background: "#FEE2E2", border: "1px solid #FECACA",
                borderRadius: "8px", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#991B1B",
              }}>
                {usage.daily_used >= usage.daily_limit
                  ? "⛔ Alcanzaste el límite diario. Podés volver mañana con 5 consultas nuevas."
                  : "⛔ Alcanzaste el límite mensual de 30 consultas."}
              </div>
            )}
          </div>
        )}

        {/* BOTONES DE FOTO */}
        <div style={{
          background: "#FFFFFF", borderRadius: "14px", border: "1px solid #B5D4F4",
          boxShadow: "0 2px 12px rgba(24,95,165,0.06)", padding: "1.5rem", marginBottom: "1.25rem",
        }}>
          <p style={{ margin: "0 0 1rem", fontSize: "0.8rem", fontWeight: 600, color: "#5F5E5A", textTransform: "uppercase", letterSpacing: "0.4px" }}>
            Analizar por foto
          </p>
          <div style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap" }}>
            {[
              { type: "etiqueta" as PhotoType, icon: "🏷️", label: "Etiqueta nutricional", sub: "Fotografiá la tabla de un producto" },
              { type: "alimento" as PhotoType, icon: "🍽️", label: "Foto de alimento", sub: "Fotografiá tu plato o comida" },
            ].map((btn) => (
              <button key={btn.type} type="button" onClick={() => handlePhotoSelect(btn.type)}
                disabled={loading || limitReached}
                style={{
                  flex: "1 1 200px", padding: "0.875rem 1rem", borderRadius: "10px",
                  border: `2px solid ${photoType === btn.type && photoPreview ? "#185FA5" : "#B5D4F4"}`,
                  background: photoType === btn.type && photoPreview ? "#E6F1FB" : "#F8FBFF",
                  color: "#2C2C2A", fontSize: "0.875rem", fontWeight: 600,
                  cursor: loading || limitReached ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: "10px", textAlign: "left",
                  opacity: limitReached ? 0.5 : 1,
                }}>
                <span style={{ fontSize: "1.5rem" }}>{btn.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: "#185FA5" }}>{btn.label}</div>
                  <div style={{ fontSize: "0.75rem", color: "#5F5E5A", fontWeight: 400 }}>{btn.sub}</div>
                </div>
              </button>
            ))}
          </div>

          {photoPreview && (
            <div style={{ marginTop: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#185FA5" }}>
                  {photoType === "etiqueta" ? "Etiqueta seleccionada" : "Foto seleccionada"}
                </p>
                <button onClick={clearPhoto} style={{ background: "none", border: "none", color: "#888780", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}>
                  Cambiar foto
                </button>
              </div>
              <img src={photoPreview} alt="Vista previa" style={{
                width: "100%", maxHeight: "240px", objectFit: "contain",
                borderRadius: "8px", border: "1px solid #B5D4F4", background: "#F0F6FF",
              }} />
              <button onClick={handleAnalyzePhoto} disabled={loading || limitReached} style={{
                width: "100%", marginTop: "1rem", padding: "0.875rem", borderRadius: "8px",
                background: loading ? "#378ADD" : "#185FA5", color: "#FFFFFF",
                fontSize: "0.95rem", fontWeight: 700, border: "none",
                cursor: loading || limitReached ? "not-allowed" : "pointer",
                opacity: limitReached ? 0.5 : 1,
              }}>
                {loading ? "Analizando foto…" : "Analizar esta foto"}
              </button>
            </div>
          )}
        </div>

        {/* CAMPO DE TEXTO */}
        <div style={{
          background: "#FFFFFF", borderRadius: "14px", border: "1px solid #B5D4F4",
          boxShadow: "0 2px 12px rgba(24,95,165,0.06)", padding: "1.5rem", marginBottom: "1.25rem",
        }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#5F5E5A", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
            O describí el alimento con texto
          </label>
          <textarea value={foodDescription} onChange={(e) => setFoodDescription(e.target.value)}
            placeholder="Ej: Milanesa con puré y un vaso de jugo de naranja."
            style={{
              width: "100%", height: "100px", padding: "0.875rem 1rem", borderRadius: "8px",
              border: "1.5px solid #B5D4F4", fontSize: "0.95rem", color: "#2C2C2A",
              background: "#F8FBFF", outline: "none", resize: "vertical",
              boxSizing: "border-box", lineHeight: 1.6,
            }} />
          <button onClick={handleAnalyzeText} disabled={loading || !foodDescription.trim() || limitReached} style={{
            width: "100%", marginTop: "0.875rem", padding: "0.875rem", borderRadius: "8px",
            background: loading ? "#378ADD" : "#185FA5", color: "#FFFFFF",
            fontSize: "0.95rem", fontWeight: 700, border: "none",
            cursor: loading || !foodDescription.trim() || limitReached ? "not-allowed" : "pointer",
            opacity: (!foodDescription.trim() && !loading) || limitReached ? 0.5 : 1,
          }}>
            {loading ? "Analizando…" : "Analizar ahora"}
          </button>
        </div>

        {loading && (
          <p style={{ margin: "0 0 1rem", fontSize: "0.8rem", color: "#378ADD", textAlign: "center" }}>
            La IA está procesando tu consulta en tiempo real…
          </p>
        )}

        {error && (
          <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.875rem", color: "#991B1B" }}>
            {error}
          </div>
        )}

        {identification && (
          <div style={{
            background: "#E6F1FB", border: "1px solid #85B7EB", borderRadius: "10px",
            padding: "0.875rem 1.25rem", marginBottom: "0.75rem",
            display: "flex", alignItems: "flex-start", gap: "10px",
          }}>
            <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>🔍</span>
            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#185FA5", textTransform: "uppercase", letterSpacing: "0.4px" }}>La IA identificó</span>
              <p style={{ margin: "2px 0 0", fontSize: "0.9rem", color: "#0C447C", fontWeight: 500, lineHeight: 1.5 }}>{identification}</p>
            </div>
          </div>
        )}

        {/* RESULTADO */}
        {analysis && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {score !== null && (
              <div style={{
                display: "flex", alignItems: "center", gap: "1.25rem",
                padding: "1.25rem 1.5rem", borderRadius: "14px",
                background: scoreColor(score).bg, border: `1.5px solid ${scoreColor(score).border}`,
              }}>
                <div style={{ fontSize: "3rem", fontWeight: 800, color: scoreColor(score).text, lineHeight: 1 }}>
                  {score}<span style={{ fontSize: "1.25rem", fontWeight: 500 }}>/10</span>
                </div>
                <div>
                  <p style={{ margin: "0 0 0.2rem", fontSize: "1rem", fontWeight: 700, color: scoreColor(score).text }}>Puntaje personalizado</p>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: scoreColor(score).text, opacity: 0.75 }}>Basado en tu perfil clínico real</p>
                </div>
              </div>
            )}

            {blocks.map((block) => {
              const style = getStyle(block.key);
              return (
                <div key={block.key} style={{ background: style.bg, borderRadius: "14px", border: `1.5px solid ${style.border}`, padding: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "1.1rem" }}>{style.icon}</span>
                    <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: style.titleColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {block.title.charAt(0) + block.title.slice(1).toLowerCase()}
                    </h3>
                  </div>
                  <div>{block.key.toUpperCase().includes("FUENTE") ? renderSources(block.content) : renderContent(block.content, style.titleColor)}</div>
                </div>
              );
            })}

            {/* BOTONES DE ACCIÓN */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
              <button
                onClick={handleShare}
                disabled={sharing}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "8px 20px", borderRadius: "8px",
                  background: sharing ? "#E6F1FB" : "#185FA5",
                  color: sharing ? "#378ADD" : "#FFFFFF",
                  border: "none", fontSize: "0.88rem", fontWeight: 600,
                  cursor: sharing ? "not-allowed" : "pointer",
                }}
              >
                {sharing ? "Generando imagen…" : "📤 Compartir resultado"}
              </button>
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