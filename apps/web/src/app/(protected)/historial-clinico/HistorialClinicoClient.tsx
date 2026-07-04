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
  bloques: { titulo: string; analisis: string; pregunta_medico: string }[];
  conclusion: string;
};

const SECTION_COLORS = [
  { bg: "#E6F1FB", border: "#185FA5", title: "#0C447C" },
  { bg: "#EAF3DE", border: "#C0DD97", title: "#27500A" },
  { bg: "#FAEEDA", border: "#FAC775", title: "#854F0B" },
  { bg: "#F3E8FF", border: "#C084FC", title: "#6B21A8" },
  { bg: "#FEF9C3", border: "#FDE047", title: "#713F12" },
  { bg: "#FCE7F3", border: "#F9A8D4", title: "#9D174D" },
  { bg: "#E0F2FE", border: "#7DD3FC", title: "#075985" },
];

const tag: React.CSSProperties = {
  display: "inline-block", padding: "2px 10px", borderRadius: "20px",
  background: "#E6F1FB", color: "#185FA5", fontSize: "0.75rem", fontWeight: 600,
};

const card: React.CSSProperties = {
  background: "#FFFFFF", borderRadius: "14px", border: "1px solid #B5D4F4",
  boxShadow: "0 2px 12px rgba(24,95,165,0.06)", padding: "1.5rem", marginBottom: "1rem",
};

export default function HistorialClinicoClient() {
  const router = useRouter();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [usage, setUsage] = useState<{ daily_used: number; daily_limit: number; monthly_used: number; monthly_limit: number } | null>(null);

  useEffect(() => {
    fetch("/api/health-records")
      .then(r => r.json())
      .then(json => setRecords(json.records ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/usage")
      .then(r => r.json())
      .then(setUsage)
      .catch(() => {});
  }, []);

  const formatDate = (d: string) => {
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  const limitReached = usage !== null && (usage.daily_used >= usage.daily_limit || usage.monthly_used >= usage.monthly_limit);

  const runAnalysis = async () => {
    if (limitReached) { setError("Alcanzó el límite de consultas por hoy. Intente mañana."); return; }
    setAnalyzing(true);
    setAnalysis(null);
    setError("");
    try {
      const res = await fetch("/api/historial-clinico", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json.error === "sin_registros") setError("No tiene análisis cargados. Agregue al menos uno desde su Perfil.");
        else if (json.error === "limite") setError("Alcanzó el límite de consultas por hoy. Intente mañana.");
        else setError("Error al generar el análisis. Intente nuevamente.");
        return;
      }
      if (!json.ok || !json.result) { setError("Respuesta inválida. Intente nuevamente."); return; }
      setAnalysis(json.result as AnalysisResult);
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <main style={{ maxWidth: "680px", margin: "0 auto", padding: "1.5rem 1rem 4rem" }}>

      {/* Encabezado */}
      <div style={{ marginBottom: "1.5rem" }}>
        <button type="button" onClick={() => router.push("/perfil")} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#185FA5", fontSize: "0.85rem", fontWeight: 600, padding: "0 0 1rem" }}>
          ← Volver al Perfil
        </button>
        <h1 style={{ margin: "0 0 0.4rem", fontSize: "1.4rem", fontWeight: 700, color: "#0C447C" }}>Historial Clínico</h1>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "#5F5E5A" }}>Evolución de sus análisis de laboratorio a lo largo del tiempo.</p>
      </div>

      {loading && <p style={{ textAlign: "center", color: "#888780", fontSize: "0.875rem" }}>Cargando análisis...</p>}

      {!loading && records.length === 0 && (
        <div style={{ ...card, textAlign: "center", padding: "2.5rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📂</div>
          <p style={{ margin: "0 0 0.5rem", fontWeight: 600, color: "#0C447C" }}>No tiene análisis cargados todavía</p>
          <p style={{ margin: "0 0 1.25rem", fontSize: "0.85rem", color: "#888780" }}>Cargue sus estudios desde la sección Perfil.</p>
          <button type="button" onClick={() => router.push("/perfil")} style={{ padding: "0.75rem 1.5rem", borderRadius: "10px", background: "#185FA5", color: "#FFFFFF", border: "none", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}>
            Ir al Perfil
          </button>
        </div>
      )}

      {!loading && records.length > 0 && (
        <>
          {/* Lista de registros */}
          <div style={card}>
            <h2 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, color: "#185FA5" }}>
              📋 Sus análisis cargados ({records.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {records.map(r => (
                <div key={r.id} style={{ padding: "0.875rem 1rem", borderRadius: "10px", border: "1px solid #E6F1FB", background: "#F8FBFF" }}>
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
                  {r.notes && <p style={{ margin: "0.4rem 0 0", fontSize: "0.78rem", color: "#888780" }}>{r.notes}</p>}
                </div>
              ))}
            </div>
          </div>

          {usage && (
            <div style={{ background: "#FFFFFF", border: "1px solid #B5D4F4", borderRadius: "10px", padding: "0.875rem 1.25rem", marginBottom: "1.25rem" }}>
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
              {limitReached && (
                <div style={{ marginTop: "0.75rem", background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "8px", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#991B1B" }}>
                  {usage.daily_used >= usage.daily_limit ? "Alcanzó el límite diario de consultas. Podrá volver mañana." : "Alcanzó el límite mensual de consultas."}
                </div>
              )}
            </div>
          )}

          {/* Aviso un solo análisis */}
          {records.length < 2 && !analysis && (
            <div style={{ ...card, background: "#FFF8E1", borderColor: "#FFD54F", fontSize: "0.85rem", color: "#5F5E5A", textAlign: "center" }}>
              💡 Con un solo análisis puede ver sus valores actuales. Para comparación cargue al menos dos análisis.
            </div>
          )}

          {/* Botón analizar — solo visible cuando no hay resultado */}
          {!analysis && (
            <button
              type="button"
              onClick={runAnalysis}
              disabled={analyzing || limitReached}
              style={{
                width: "100%", padding: "1rem", borderRadius: "12px",
                background: analyzing ? "rgba(24,95,165,0.5)" : "linear-gradient(135deg, #185FA5 0%, #0C447C 100%)",
                color: "#FFFFFF", border: "none", fontSize: "1rem", fontWeight: 700,
                cursor: analyzing || limitReached ? "not-allowed" : "pointer",
                opacity: limitReached ? 0.5 : 1,
                boxShadow: analyzing ? "none" : "0 4px 16px rgba(24,95,165,0.25)",
                marginBottom: "1.25rem",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              {analyzing ? (
                <>
                  <span style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#FFFFFF", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                  Analizando su historial...
                </>
              ) : (
                <>🧠 Analizar evolución con IA</>
              )}
            </button>
          )}

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {/* Error */}
          {error && (
            <div style={{ padding: "0.875rem 1rem", borderRadius: "10px", marginBottom: "1rem", background: "#FEE2E2", color: "#991B1B", border: "1px solid #FECACA", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          {/* RESULTADO EN BLOQUES DE COLORES */}
          {analysis && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

              {/* Encabezado azul */}
              <div style={{ background: "linear-gradient(135deg, #0C447C 0%, #185FA5 100%)", borderRadius: "14px", padding: "1.5rem" }}>
                <p style={{ margin: "0 0 0.4rem", fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Análisis de evolución clínica · {analysis.fecha_ultimo_analisis}
                </p>
                <p style={{ margin: 0, fontSize: "0.92rem", color: "#FFFFFF", lineHeight: 1.7 }}>
                  {analysis.introduccion}
                </p>
              </div>

              {/* Bloques temáticos */}
              {analysis.bloques.map((bloque, i) => {
                const color = SECTION_COLORS[i % SECTION_COLORS.length];
                return (
                  <div key={i} style={{ background: color.bg, border: `1.5px solid ${color.border}`, borderRadius: "14px", padding: "1.25rem" }}>
                    <p style={{ margin: "0 0 0.75rem", fontSize: "0.72rem", fontWeight: 800, color: color.title, textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: `1px solid ${color.border}`, paddingBottom: "0.5rem" }}>
                      {i + 1}. {bloque.titulo}
                    </p>
                    <p style={{ margin: "0 0 1rem", fontSize: "0.875rem", color: "#2C2C2A", lineHeight: 1.75 }}>
                      {bloque.analisis}
                    </p>
                    {bloque.pregunta_medico && (
                      <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: "8px", padding: "0.75rem 1rem", borderLeft: `3px solid ${color.title}` }}>
                        <p style={{ margin: "0 0 0.25rem", fontSize: "0.65rem", fontWeight: 800, color: color.title, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          💬 Preguntale a tu médico
                        </p>
                        <p style={{ margin: 0, fontSize: "0.82rem", color: "#2C2C2A", lineHeight: 1.6, fontStyle: "italic" }}>
                          {bloque.pregunta_medico}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Conclusión oscura */}
              <div style={{ background: "#2C2C2A", borderRadius: "14px", padding: "1.5rem" }}>
                <p style={{ margin: "0 0 0.75rem", fontSize: "0.72rem", fontWeight: 800, color: "#64B5F6", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                  Conclusión y próximos pasos
                </p>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#F0F6FF", lineHeight: 1.75 }}>
                  {analysis.conclusion}
                </p>
              </div>

              <p style={{ margin: 0, fontSize: "0.72rem", color: "#888780", textAlign: "center" }}>
                Este análisis es orientativo y no reemplaza la consulta con su médico tratante.
              </p>

              {/* Botón volver a analizar */}
              <button
                type="button"
                onClick={runAnalysis}
                disabled={analyzing}
                style={{ width: "100%", padding: "0.875rem", borderRadius: "12px", background: "transparent", color: "#185FA5", border: "1.5px solid #185FA5", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", marginBottom: "1rem" }}
              >
                🔄 Volver a analizar
              </button>

            </div>
          )}
        </>
      )}
    </main>
  );
}