// apps/web/src/app/(protected)/historial-clinico/HistorialClinicoClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type HealthRecord = {
  id: string;
  recorded_at: string;
  weight_kg: number | null;
  total_cholesterol_mg_dl: number | null;
  hdl_mg_dl: number | null;
  ldl_mg_dl: number | null;
  triglycerides_mg_dl: number | null;
  fasting_glucose_mg_dl: number | null;
  hba1c_percent: number | null;
  creatinine_mg_dl: number | null;
  urea_mg_dl: number | null;
  tsh_miu_l: number | null;
  notes: string | null;
};

type AnalysisResult = {
  fecha_ultimo_analisis: string;
  introduccion: string;
  secciones: { titulo: string; contenido: string }[];
  conclusion: string;
};

const card: React.CSSProperties = {
  background: "#FFFFFF", borderRadius: "14px", border: "1px solid #B5D4F4",
  boxShadow: "0 2px 12px rgba(24,95,165,0.06)", padding: "1.5rem", marginBottom: "1rem",
};

const tag: React.CSSProperties = {
  display: "inline-block", padding: "2px 10px", borderRadius: "20px",
  background: "#E6F1FB", color: "#185FA5", fontSize: "0.75rem", fontWeight: 600,
};

export default function HistorialClinicoClient() {
  const router = useRouter();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/health-records")
      .then(r => r.json())
      .then(json => setRecords(json.records ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d: string) => {
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setAnalysis(null);
    setStreamText("");
    setError("");

    try {
      const res = await fetch("/api/historial-clinico", { method: "POST" });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (json.error === "sin_registros") {
          setError("No tiene análisis clínicos cargados. Agregue al menos uno desde su Perfil.");
        } else if (json.error === "limite") {
          setError("Alcanzó el límite de consultas disponibles por hoy. Intente mañana.");
        } else {
          setError("Ocurrió un error al generar el análisis. Intente nuevamente.");
        }
        return;
      }

      // Leer stream completo acumulando chunks
      const reader = res.body?.getReader();
      if (!reader) { setError("Error al leer la respuesta."); return; }

      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          // Mostrar progreso mientras llega
          const partial = new TextDecoder().decode(value);
          setStreamText(prev => prev + partial);
        }
      }

      const fullText = new TextDecoder().decode(
        chunks.reduce((acc, chunk) => {
          const merged = new Uint8Array(acc.length + chunk.length);
          merged.set(acc);
          merged.set(chunk, acc.length);
          return merged;
        }, new Uint8Array(0))
      );

      const clean = fullText.replace(/```json\n?/g, "").replace(/```/g, "").trim();
      const parsed: AnalysisResult = JSON.parse(clean);
      setAnalysis(parsed);
      setStreamText("");

    } catch {
      setError("Error al procesar el análisis. Intente nuevamente.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <main style={{ maxWidth: "680px", margin: "0 auto", padding: "1.5rem 1rem 4rem" }}>

      {/* Encabezado */}
      <div style={{ marginBottom: "1.5rem" }}>
        <button
          type="button"
          onClick={() => router.push("/perfil")}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: "#185FA5", fontSize: "0.85rem", fontWeight: 600,
            padding: "0 0 1rem", display: "flex", alignItems: "center", gap: "4px",
          }}
        >
          ← Volver al Perfil
        </button>
        <h1 style={{ margin: "0 0 0.4rem", fontSize: "1.4rem", fontWeight: 700, color: "#0C447C" }}>
          Historial Clínico
        </h1>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "#5F5E5A" }}>
          Evolución de sus análisis de laboratorio a lo largo del tiempo.
        </p>
      </div>

      {/* Estado de carga */}
      {loading && (
        <p style={{ textAlign: "center", color: "#888780", fontSize: "0.875rem" }}>
          Cargando análisis...
        </p>
      )}

      {/* Sin registros */}
      {!loading && records.length === 0 && (
        <div style={{ ...card, textAlign: "center", padding: "2.5rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📂</div>
          <p style={{ margin: "0 0 0.5rem", fontWeight: 600, color: "#0C447C" }}>
            No tiene análisis cargados todavía
          </p>
          <p style={{ margin: "0 0 1.25rem", fontSize: "0.85rem", color: "#888780" }}>
            Cargue sus estudios de laboratorio desde la sección Perfil para ver su evolución aquí.
          </p>
          <button
            type="button"
            onClick={() => router.push("/perfil")}
            style={{
              padding: "0.75rem 1.5rem", borderRadius: "10px",
              background: "#185FA5", color: "#FFFFFF",
              border: "none", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            Ir al Perfil
          </button>
        </div>
      )}

      {/* Lista de registros */}
      {!loading && records.length > 0 && (
        <>
          {/* Resumen de registros */}
          <div style={card}>
            <h2 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, color: "#185FA5" }}>
              📋 Sus análisis cargados ({records.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {records.map(r => (
                <div key={r.id} style={{
                  padding: "0.875rem 1rem", borderRadius: "10px",
                  border: "1px solid #E6F1FB", background: "#F8FBFF",
                }}>
                  <div style={{ fontWeight: 700, color: "#0C447C", fontSize: "0.9rem", marginBottom: "0.4rem" }}>
                    📅 {formatDate(r.recorded_at)}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {r.weight_kg != null && <span style={tag}>Peso: {r.weight_kg} kg</span>}
                    {r.total_cholesterol_mg_dl != null && <span style={tag}>Col: {r.total_cholesterol_mg_dl}</span>}
                    {r.hdl_mg_dl != null && <span style={tag}>HDL: {r.hdl_mg_dl}</span>}
                    {r.ldl_mg_dl != null && <span style={tag}>LDL: {r.ldl_mg_dl}</span>}
                    {r.triglycerides_mg_dl != null && <span style={tag}>TG: {r.triglycerides_mg_dl}</span>}
                    {r.fasting_glucose_mg_dl != null && <span style={tag}>Gluc: {r.fasting_glucose_mg_dl}</span>}
                    {r.hba1c_percent != null && <span style={tag}>HbA1c: {r.hba1c_percent}%</span>}
                    {r.creatinine_mg_dl != null && <span style={tag}>Creat: {r.creatinine_mg_dl}</span>}
                    {r.urea_mg_dl != null && <span style={tag}>Urea: {r.urea_mg_dl}</span>}
                    {r.tsh_miu_l != null && <span style={tag}>TSH: {r.tsh_miu_l}</span>}
                  </div>
                  {r.notes && (
                    <p style={{ margin: "0.4rem 0 0", fontSize: "0.78rem", color: "#888780" }}>{r.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Botón analizar */}
          {records.length < 2 && !analysis && (
            <div style={{
              ...card, background: "#FFF8E1", borderColor: "#FFD54F",
              fontSize: "0.85rem", color: "#5F5E5A", textAlign: "center",
            }}>
              💡 Con un solo análisis puede ver sus valores actuales. Para ver evolución comparativa, cargue al menos dos análisis de fechas distintas.
            </div>
          )}

          <button
            type="button"
            onClick={runAnalysis}
            disabled={analyzing}
            style={{
              width: "100%", padding: "1rem", borderRadius: "12px",
              background: analyzing
                ? "rgba(24,95,165,0.5)"
                : "linear-gradient(135deg, #185FA5 0%, #0C447C 100%)",
              color: "#FFFFFF", border: "none",
              fontSize: "1rem", fontWeight: 700,
              cursor: analyzing ? "not-allowed" : "pointer",
              boxShadow: analyzing ? "none" : "0 4px 16px rgba(24,95,165,0.25)",
              marginBottom: "1.25rem",
              display: analysis ? "none" : "flex",
              alignItems: "center", justifyContent: "center", gap: "8px",
            }}
          >
            {analyzing ? (
              <>
                <span style={{
                  width: "16px", height: "16px", borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTopColor: "#FFFFFF",
                  display: "inline-block",
                  animation: "spin 0.8s linear infinite",
                }} />
                Analizando su historial...
              </>
            ) : (
              <>🧠 {analysis ? "Volver a analizar" : "Analizar evolución con IA"}</>
            )}
          </button>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {/* Error */}
          {error && (
            <div style={{
              padding: "0.875rem 1rem", borderRadius: "10px", marginBottom: "1rem",
              background: "#FEE2E2", color: "#991B1B",
              border: "1px solid #FECACA", fontSize: "0.875rem",
            }}>
              {error}
            </div>
          )}

          {/* Resultado del análisis */}
          {analyzing && streamText && (
            <div style={{ ...card, borderColor: "#185FA5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                <span style={{ fontSize: "1.2rem" }}>⏳</span>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#185FA5", fontWeight: 600 }}>
                  Generando análisis...
                </p>
              </div>
              <div style={{ fontSize: "0.82rem", color: "#888780", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {streamText}
              </div>
            </div>
          )}

          {analysis && (() => {
            const SECTION_COLORS = [
              { bg: "#E6F1FB", border: "#185FA5", title: "#0C447C" },
              { bg: "#EAF3DE", border: "#C0DD97", title: "#27500A" },
              { bg: "#FAEEDA", border: "#FAC775", title: "#854F0B" },
              { bg: "#F3E8FF", border: "#C084FC", title: "#6B21A8" },
              { bg: "#FEF9C3", border: "#FDE047", title: "#713F12" },
              { bg: "#FCE7F3", border: "#F9A8D4", title: "#9D174D" },
              { bg: "#E0F2FE", border: "#7DD3FC", title: "#075985" },
            ];

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                {/* Encabezado */}
                <div style={{
                  background: "linear-gradient(135deg, #0C447C 0%, #185FA5 100%)",
                  borderRadius: "14px", padding: "1.5rem",
                }}>
                  <p style={{ margin: "0 0 0.4rem", fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Análisis de evolución clínica · {analysis.fecha_ultimo_analisis}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.92rem", color: "#FFFFFF", lineHeight: 1.7 }}>
                    {analysis.introduccion}
                  </p>
                </div>

                {/* Secciones con colores rotativos */}
                {analysis.secciones.map((sec, i) => {
                  const color = SECTION_COLORS[i % SECTION_COLORS.length];
                  return (
                    <div key={i} style={{
                      background: color.bg,
                      border: `1.5px solid ${color.border}`,
                      borderRadius: "14px", padding: "1.25rem",
                    }}>
                      <p style={{
                        margin: "0 0 0.75rem", fontSize: "0.72rem", fontWeight: 800,
                        color: color.title, textTransform: "uppercase", letterSpacing: "0.6px",
                        borderBottom: `1px solid ${color.border}`, paddingBottom: "0.5rem",
                      }}>
                        {i + 1}. {sec.titulo}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.875rem", color: "#2C2C2A", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                        {sec.contenido}
                      </p>
                    </div>
                  );
                })}

                {/* Conclusión */}
                <div style={{
                  background: "#2C2C2A", borderRadius: "14px", padding: "1.5rem",
                }}>
                  <p style={{ margin: "0 0 0.75rem", fontSize: "0.72rem", fontWeight: 800, color: "#64B5F6", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                    Conclusión y próximos pasos
                  </p>
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#F0F6FF", lineHeight: 1.75 }}>
                    {analysis.conclusion}
                  </p>
                </div>

                <p style={{ margin: "0.25rem 0 0", fontSize: "0.72rem", color: "#888780", textAlign: "center" }}>
                  Este análisis es orientativo y no reemplaza la consulta con su médico tratante.
                </p>

                {/* Botón volver a analizar */}
                <button
                  type="button"
                  onClick={runAnalysis}
                  disabled={analyzing}
                  style={{
                    width: "100%", padding: "0.875rem", borderRadius: "12px",
                    background: "transparent", color: "#185FA5",
                    border: "1.5px solid #185FA5", fontSize: "0.9rem",
                    fontWeight: 600, cursor: "pointer", marginBottom: "1rem",
                  }}
                >
                  🔄 Volver a analizar
                </button>
              </div>
            );
          })()}
        </>
      )}
    </main>
  );
}