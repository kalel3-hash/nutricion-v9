// apps/web/src/app/(protected)/balance/BalanceClient.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import NavbarProtegido from "@/components/NavbarProtegido";

interface Ejercicio { descripcion: string; duracion_minutos: number; }
interface DetalleItem {
  item: string;
  kcal_estimadas: number;
  proteinas_g?: number;
  grasas_g?: number;
  carbohidratos_g?: number;
  sodio_mg?: number;
  fibra_g?: number;
}
interface DetalleEjercicio {
  descripcion: string;
  duracion_minutos: number;
  kcal_estimadas: number;
  tipo?: string;
  beneficio_clinico?: string;
}
interface TotalesDia {
  proteinas_g: number;
  grasas_g: number;
  carbohidratos_g: number;
  sodio_mg: number;
  fibra_g: number;
}
interface GeminiResult {
  calorias_consumidas_kcal: number;
  detalle_comidas: {
    desayuno: DetalleItem[]; almuerzo: DetalleItem[]; merienda: DetalleItem[];
    cena: DetalleItem[]; colacion: DetalleItem[];
  };
  totales_dia?: TotalesDia;
  calorias_quemadas_ejercicio_kcal: number;
  detalle_ejercicios: DetalleEjercicio[];
  impacto_glucemico: "bajo" | "moderado" | "alto";
  comentario_clinico: string;
  recomendaciones: string[];
}
interface Profile {
  sex?: string; age?: number; height_cm?: number; weight_kg?: number;
  total_cholesterol_mg_dl?: number; hdl_mg_dl?: number; ldl_mg_dl?: number;
  triglycerides_mg_dl?: number; fasting_glucose_mg_dl?: number; hba1c_percent?: number;
  creatinine_mg_dl?: number; urea_mg_dl?: number; tsh_miu_l?: number;
  conditions?: string[]; medications?: string[];
}

function calcTDEE(w: number, h: number, a: number, s: string): number {
  const base = 10 * w + 6.25 * h - 5 * a;
  const c = s === "masculino" ? 5 : s === "femenino" ? -161 : -78;
  return Math.round((base + c) * 1.2);
}

const card: React.CSSProperties = {
  background: "#FFFFFF", borderRadius: "14px", border: "1px solid #B5D4F4",
  boxShadow: "0 2px 12px rgba(24,95,165,0.06)", padding: "1.5rem", marginBottom: "1rem",
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.65rem 0.9rem", borderRadius: "8px",
  border: "1.5px solid #B5D4F4", fontSize: "0.88rem", color: "#2C2C2A",
  background: "#F8FBFF", outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#5F5E5A",
  marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.4px",
};
const sectionTitle: React.CSSProperties = {
  fontSize: "0.95rem", fontWeight: 700, color: "#185FA5",
  margin: "0 0 1rem", paddingBottom: "0.5rem", borderBottom: "2px solid #E6F1FB",
};
const macroChip = (color: string, bg: string): React.CSSProperties => ({
  display: "inline-block", padding: "2px 8px", borderRadius: "20px",
  fontSize: "0.7rem", fontWeight: 700, color, background: bg, whiteSpace: "nowrap",
});

const MEALS = [
  { key: "desayuno", label: "Desayuno", icon: "☀️" },
  { key: "almuerzo", label: "Almuerzo", icon: "🍽️" },
  { key: "merienda", label: "Merienda", icon: "🫖" },
  { key: "cena", label: "Cena", icon: "🌙" },
  { key: "colacion", label: "Colación (opcional)", icon: "🍎" },
];

export default function BalanceClient() {
  const today = new Date().toISOString().slice(0, 10);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [perfilExpandido, setPerfilExpandido] = useState(false);

  const [fecha, setFecha] = useState(today);
  const [peso, setPeso] = useState("");
  const [comidas, setComidas] = useState<Record<string, string[]>>({
    desayuno: [], almuerzo: [], merienda: [], cena: [], colacion: [],
  });
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GeminiResult | null>(null);
  const [tdee, setTdee] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => {
        const p = d.profile;
        if (p) { setProfile(p); setPeso((p.weight_kg ?? "").toString()); }
        else setProfileError("No se encontró el perfil.");
      })
      .catch(() => setProfileError("Error cargando el perfil."))
      .finally(() => setProfileLoading(false));
  }, []);

  const addItem = (meal: string) =>
    setComidas(prev => ({ ...prev, [meal]: [...prev[meal], ""] }));
  const updateItem = (meal: string, idx: number, val: string) =>
    setComidas(prev => { const a = [...prev[meal]]; a[idx] = val; return { ...prev, [meal]: a }; });
  const removeItem = (meal: string, idx: number) =>
    setComidas(prev => ({ ...prev, [meal]: prev[meal].filter((_, i) => i !== idx) }));
  const addEjercicio = () =>
    setEjercicios(prev => [...prev, { descripcion: "", duracion_minutos: 30 }]);
  const updateEjercicio = (idx: number, field: keyof Ejercicio, val: string | number) =>
    setEjercicios(prev => { const a = [...prev]; a[idx] = { ...a[idx], [field]: val }; return a; });
  const removeEjercicio = (idx: number) =>
    setEjercicios(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!profile) return;
    setError("");
    if (!profile.sex) { setError("Tu perfil no tiene el sexo cargado."); return; }
    if (!profile.height_cm || !profile.age) { setError("Tu perfil está incompleto. Cargá altura y edad."); return; }
    const pesoNum = parseFloat(peso);
    if (!pesoNum || pesoNum <= 0 || pesoNum > 500) { setError("Ingresá un peso válido."); return; }

    setLoading(true);
    setResult(null);
    const computedTDEE = calcTDEE(pesoNum, profile.height_cm, profile.age, profile.sex);
    setTdee(computedTDEE);

    try {
      const res = await fetch("/api/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha, peso_confirmado: pesoNum, weight_kg: pesoNum,
          height_cm: profile.height_cm, age: profile.age, sex: profile.sex,
          comidas, ejercicios,
          laboratorio: {
            colesterol: profile.total_cholesterol_mg_dl ?? null,
            hdl: profile.hdl_mg_dl ?? null, ldl: profile.ldl_mg_dl ?? null,
            trigliceridos: profile.triglycerides_mg_dl ?? null,
            glucemia: profile.fasting_glucose_mg_dl ?? null,
            hba1c: profile.hba1c_percent ?? null,
            creatinina: profile.creatinine_mg_dl ?? null,
            urea: profile.urea_mg_dl ?? null, tsh: profile.tsh_miu_l ?? null,
            condiciones: profile.conditions ?? [], medicamentos: profile.medications ?? [],
          },
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string };
        if (json.error === "limite") setError("Alcanzaste el límite de consultas del día.");
        else if (json.error === "perfil_incompleto") setError("Tu perfil no tiene todos los datos necesarios.");
        else setError("Error al calcular el balance. Intentá de nuevo.");
        setLoading(false);
        return;
      }

      const reader = res.body!.getReader();
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
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
      const parsed: GeminiResult = JSON.parse(clean);
      setResult(parsed);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch {
      setError("Error al procesar el resultado. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const balance = result !== null && tdee !== null
    ? result.calorias_consumidas_kcal - (tdee + (result.calorias_quemadas_ejercicio_kcal ?? 0))
    : null;

  const balanceColor = balance === null ? "#185FA5" : Math.abs(balance) < 100 ? "#27500A" : balance < 0 ? "#185FA5" : "#854F0B";
  const balanceBg = balance === null ? "#E6F1FB" : Math.abs(balance) < 100 ? "#EAF3DE" : balance < 0 ? "#EEF4FF" : "#FAEEDA";
  const glucemicoColor: Record<string, string> = { bajo: "#27500A", moderado: "#854F0B", alto: "#991B1B" };
  const glucemicoBg: Record<string, string> = { bajo: "#EAF3DE", moderado: "#FAEEDA", alto: "#FEE2E2" };
  const profileIncomplete = profile && (!profile.sex || !profile.height_cm || !profile.age);
  const previewTDEE = profile?.sex && profile?.height_cm && profile?.age && parseFloat(peso) > 0
    ? calcTDEE(parseFloat(peso), profile.height_cm, profile.age, profile.sex) : null;

  const datosPerfilCargados = profile ? [
    profile.total_cholesterol_mg_dl && { label: "Colesterol total", valor: `${profile.total_cholesterol_mg_dl} mg/dL` },
    profile.hdl_mg_dl && { label: "HDL", valor: `${profile.hdl_mg_dl} mg/dL` },
    profile.ldl_mg_dl && { label: "LDL", valor: `${profile.ldl_mg_dl} mg/dL` },
    profile.triglycerides_mg_dl && { label: "Triglicéridos", valor: `${profile.triglycerides_mg_dl} mg/dL` },
    profile.fasting_glucose_mg_dl && { label: "Glucemia en ayunas", valor: `${profile.fasting_glucose_mg_dl} mg/dL` },
    profile.hba1c_percent && { label: "HbA1c", valor: `${profile.hba1c_percent}%` },
    profile.creatinine_mg_dl && { label: "Creatinina", valor: `${profile.creatinine_mg_dl} mg/dL` },
    profile.urea_mg_dl && { label: "Urea", valor: `${profile.urea_mg_dl} mg/dL` },
    profile.tsh_miu_l && { label: "TSH", valor: `${profile.tsh_miu_l} mUI/L` },
    profile.conditions?.length && { label: "Condiciones", valor: profile.conditions.join(", ") },
    profile.medications?.length && { label: "Medicamentos", valor: profile.medications.join(", ") },
  ].filter(Boolean) as { label: string; valor: string }[] : [];

  if (profileLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F0F6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#5F5E5A", fontSize: "0.9rem" }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F0F6FF" }}>
      <NavbarProtegido extraLinks={[{ label: "← Volver", href: "/dashboard" }]} showSignOut={false} />

      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ margin: "0 0 0.3rem", fontSize: "1.5rem", fontWeight: 700, color: "#2C2C2A" }}>
            Calculadora de Balance Calórico
          </h1>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#5F5E5A" }}>
            Registrá las comidas y el ejercicio de tu día para estimar tu balance calórico
          </p>
        </div>

        {profileError && (
          <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.875rem", color: "#991B1B" }}>
            {profileError}{" "}<Link href="/perfil" style={{ color: "#991B1B", fontWeight: 700 }}>Ir al perfil →</Link>
          </div>
        )}

        {profileIncomplete && (
          <div style={{ background: "#FAEEDA", border: "1px solid #FAC775", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.875rem", color: "#854F0B" }}>
            Tu perfil está incompleto (faltan sexo, altura o edad). La calculadora los necesita.{" "}
            <Link href="/perfil" style={{ color: "#854F0B", fontWeight: 700 }}>Completar perfil →</Link>
          </div>
        )}

        {/* Panel perfil clínico colapsable */}
        {datosPerfilCargados.length > 0 && (
          <div style={{ marginBottom: "1rem", borderRadius: "12px", border: "1px solid #B5D4F4", background: "#FFFFFF", overflow: "hidden" }}>
            <button
              type="button"
              onClick={() => setPerfilExpandido(p => !p)}
              style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.875rem 1.25rem", background: "transparent", border: "none", cursor: "pointer", fontSize: "0.88rem", fontWeight: 700, color: "#185FA5" }}
            >
              <span>🧬 Perfil clínico usado en el cálculo</span>
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" style={{ transform: perfilExpandido ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                <path d="M2 4l4 4 4-4" stroke="#185FA5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {perfilExpandido && (
              <div style={{ padding: "0 1.25rem 1rem", borderTop: "1px solid #E6F1FB" }}>
                <p style={{ margin: "0.75rem 0", fontSize: "0.75rem", color: "#888780" }}>
                  Estos valores de tu perfil son considerados por la IA al analizar tus comidas y ejercicios.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {datosPerfilCargados.map((d) => (
                    <div key={d.label} style={{ padding: "0.5rem 0.75rem", borderRadius: "8px", background: "#F0F6FF", border: "1px solid #E6F1FB" }}>
                      <p style={{ margin: 0, fontSize: "0.68rem", color: "#888780", textTransform: "uppercase", letterSpacing: "0.3px" }}>{d.label}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "0.85rem", fontWeight: 700, color: "#185FA5" }}>{d.valor}</p>
                    </div>
                  ))}
                </div>
                <p style={{ margin: "0.75rem 0 0", fontSize: "0.72rem", color: "#888780" }}>
                  ¿Datos desactualizados? <Link href="/perfil" style={{ color: "#185FA5", fontWeight: 600 }}>Actualizar perfil →</Link>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Datos del día */}
        <div style={card}>
          <h2 style={sectionTitle}>Datos del día</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Fecha</label>
              <input type="date" style={inputStyle} value={fecha} max={today} onChange={e => setFecha(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Peso (kg)</label>
              <input type="number" style={inputStyle} value={peso} min="20" max="500" step="0.1" placeholder="Ej: 75" onChange={e => setPeso(e.target.value)} />
              <p style={{ margin: "4px 0 0", fontSize: "0.7rem", color: "#888780" }}>Este valor actualiza tu perfil al calcular</p>
            </div>
          </div>
          {previewTDEE && (
            <div style={{ marginTop: "0.875rem", padding: "0.625rem 0.875rem", borderRadius: "8px", background: "#E6F1FB", border: "1px solid #B5D4F4", fontSize: "0.8rem", color: "#185FA5" }}>
              TDEE base (sedentario):{" "}
              <strong>{previewTDEE.toLocaleString("es-AR")} kcal</strong>
              <span style={{ color: "#888780", fontSize: "0.7rem", marginLeft: "8px" }}>· Mifflin-St Jeor × 1.2</span>
            </div>
          )}
        </div>

        {/* Comidas */}
        {MEALS.map(meal => (
          <div key={meal.key} style={card}>
            <h2 style={sectionTitle}>{meal.icon} {meal.label}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {comidas[meal.key].length === 0 && (
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#B5D4F4", fontStyle: "italic" }}>Sin items cargados</p>
              )}
              {comidas[meal.key].map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input type="text" style={{ ...inputStyle, flex: 1 }} value={item} placeholder="Ej: 2 huevos revueltos con queso" onChange={e => updateItem(meal.key, idx, e.target.value)} />
                  <button type="button" onClick={() => removeItem(meal.key, idx)} style={{ padding: "0.5rem 0.7rem", borderRadius: "6px", border: "1px solid #FECACA", background: "#FEE2E2", color: "#991B1B", cursor: "pointer", fontSize: "0.9rem", flexShrink: 0 }}>×</button>
                </div>
              ))}
              <button type="button" onClick={() => addItem(meal.key)} style={{ alignSelf: "flex-start", marginTop: "0.25rem", padding: "0.4rem 0.875rem", borderRadius: "6px", border: "1.5px solid #B5D4F4", background: "transparent", color: "#185FA5", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                + Agregar
              </button>
            </div>
          </div>
        ))}

        {/* Ejercicios */}
        <div style={card}>
          <h2 style={sectionTitle}>🏋️ Ejercicios (opcional)</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {ejercicios.length === 0 && (
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#B5D4F4", fontStyle: "italic" }}>Sin ejercicios registrados</p>
            )}
            {ejercicios.map((ej, idx) => (
              <div key={idx} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <input type="text" style={{ ...inputStyle, flex: 2 }} value={ej.descripcion} placeholder="Ej: Caminata, Bicicleta, Natación" onChange={e => updateEjercicio(idx, "descripcion", e.target.value)} />
                <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                  <input type="number" style={{ ...inputStyle, width: "72px" }} value={ej.duracion_minutos} min="1" max="360" onChange={e => updateEjercicio(idx, "duracion_minutos", parseInt(e.target.value) || 0)} />
                  <span style={{ fontSize: "0.75rem", color: "#888780", whiteSpace: "nowrap" }}>min</span>
                </div>
                <button type="button" onClick={() => removeEjercicio(idx)} style={{ padding: "0.5rem 0.7rem", borderRadius: "6px", border: "1px solid #FECACA", background: "#FEE2E2", color: "#991B1B", cursor: "pointer", fontSize: "0.9rem", flexShrink: 0, marginTop: "1px" }}>×</button>
              </div>
            ))}
            <button type="button" onClick={addEjercicio} style={{ alignSelf: "flex-start", marginTop: "0.25rem", padding: "0.4rem 0.875rem", borderRadius: "6px", border: "1.5px solid #B5D4F4", background: "transparent", color: "#185FA5", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
              + Agregar ejercicio
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.875rem", color: "#991B1B" }}>
            {error}
            {(error.includes("sexo") || error.includes("incompleto") || error.includes("altura") || error.includes("edad")) && (
              <> <Link href="/perfil" style={{ color: "#991B1B", fontWeight: 700 }}>Ir al perfil →</Link></>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !profile || !!profileError || !!profileIncomplete}
          style={{ width: "100%", padding: "0.9rem", borderRadius: "10px", background: loading ? "#85B7EB" : "#185FA5", color: "#FFFFFF", fontSize: "1rem", fontWeight: 600, border: "none", cursor: loading || !profile || !!profileError || !!profileIncomplete ? "not-allowed" : "pointer", marginBottom: "2rem" }}
        >
          {loading ? "Calculando con IA..." : "Calcular balance calórico"}
        </button>

        {/* RESULTADOS */}
        {result !== null && tdee !== null && (
          <div ref={resultsRef}>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ background: "#EEF4FF", borderRadius: "12px", border: "1px solid #B5D4F4", padding: "1rem", textAlign: "center" }}>
                <p style={{ margin: "0 0 0.3rem", fontSize: "0.68rem", color: "#888780", textTransform: "uppercase", letterSpacing: "0.4px" }}>Gasto total estimado</p>
                <p style={{ margin: "0 0 0.2rem", fontSize: "1.4rem", fontWeight: 700, color: "#185FA5" }}>
                  {(tdee + (result.calorias_quemadas_ejercicio_kcal ?? 0)).toLocaleString("es-AR")} kcal
                </p>
                <p style={{ margin: 0, fontSize: "0.7rem", color: "#888780" }}>
                  {tdee.toLocaleString("es-AR")} base + {(result.calorias_quemadas_ejercicio_kcal ?? 0).toLocaleString("es-AR")} ejercicio
                </p>
              </div>
              <div style={{ background: "#EEF4FF", borderRadius: "12px", border: "1px solid #B5D4F4", padding: "1rem", textAlign: "center" }}>
                <p style={{ margin: "0 0 0.3rem", fontSize: "0.68rem", color: "#888780", textTransform: "uppercase", letterSpacing: "0.4px" }}>Calorías consumidas *</p>
                <p style={{ margin: "0 0 0.2rem", fontSize: "1.4rem", fontWeight: 700, color: "#185FA5" }}>
                  {(result.calorias_consumidas_kcal ?? 0).toLocaleString("es-AR")} kcal
                </p>
                <p style={{ margin: 0, fontSize: "0.7rem", color: "#888780" }}>Estimado por IA</p>
              </div>
            </div>

            {/* Balance */}
            <div style={{ background: balanceBg, border: `1px solid ${balanceColor}40`, borderRadius: "14px", padding: "1.5rem", marginBottom: "0.75rem", textAlign: "center" }}>
              <p style={{ margin: "0 0 0.25rem", fontSize: "0.72rem", fontWeight: 700, color: "#888780", textTransform: "uppercase", letterSpacing: "0.5px" }}>Balance del día</p>
              <p style={{ margin: "0 0 0.2rem", fontSize: "2.2rem", fontWeight: 700, color: balanceColor }}>
                {balance! > 0 ? "+" : ""}{balance!.toLocaleString("es-AR")} kcal
              </p>
              <p style={{ margin: 0, fontSize: "0.85rem", color: balanceColor, fontWeight: 600 }}>
                {Math.abs(balance!) < 100 ? "Equilibrio calórico" : balance! < 0 ? "Déficit calórico" : "Superávit calórico"}
              </p>
            </div>

            {/* Totales macros del día */}
            {result.totales_dia && (
              <div style={{ ...card, marginBottom: "0.75rem" }}>
                <h2 style={sectionTitle}>Resumen nutricional del día *</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.625rem", marginBottom: "0.625rem" }}>
                  <div style={{ textAlign: "center", padding: "0.75rem 0.5rem", borderRadius: "10px", background: "#EEF4FF", border: "1px solid #B5D4F4" }}>
                    <p style={{ margin: "0 0 2px", fontSize: "0.65rem", color: "#888780", textTransform: "uppercase" }}>Proteínas</p>
                    <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#185FA5" }}>{result.totales_dia.proteinas_g}g</p>
                  </div>
                  <div style={{ textAlign: "center", padding: "0.75rem 0.5rem", borderRadius: "10px", background: "#FAEEDA", border: "1px solid #FAC775" }}>
                    <p style={{ margin: "0 0 2px", fontSize: "0.65rem", color: "#888780", textTransform: "uppercase" }}>Grasas</p>
                    <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#854F0B" }}>{result.totales_dia.grasas_g}g</p>
                  </div>
                  <div style={{ textAlign: "center", padding: "0.75rem 0.5rem", borderRadius: "10px", background: "#EAF3DE", border: "1px solid #C0DD97" }}>
                    <p style={{ margin: "0 0 2px", fontSize: "0.65rem", color: "#888780", textTransform: "uppercase" }}>Carbohidratos</p>
                    <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#27500A" }}>{result.totales_dia.carbohidratos_g}g</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
                  <div style={{ textAlign: "center", padding: "0.625rem 0.5rem", borderRadius: "10px", background: "#F0F6FF", border: "1px solid #E6F1FB" }}>
                    <p style={{ margin: "0 0 2px", fontSize: "0.65rem", color: "#888780", textTransform: "uppercase" }}>Sodio</p>
                    <p style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#5F5E5A" }}>{result.totales_dia.sodio_mg}mg</p>
                  </div>
                  <div style={{ textAlign: "center", padding: "0.625rem 0.5rem", borderRadius: "10px", background: "#F0F6FF", border: "1px solid #E6F1FB" }}>
                    <p style={{ margin: "0 0 2px", fontSize: "0.65rem", color: "#888780", textTransform: "uppercase" }}>Fibra</p>
                    <p style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#5F5E5A" }}>{result.totales_dia.fibra_g}g</p>
                  </div>
                </div>
              </div>
            )}

            {/* Impacto glucémico + ejercicio */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ background: glucemicoBg[result.impacto_glucemico] ?? "#FFFFFF", borderRadius: "12px", border: "1px solid #B5D4F4", padding: "1rem", textAlign: "center" }}>
                <p style={{ margin: "0 0 0.3rem", fontSize: "0.68rem", color: "#888780", textTransform: "uppercase" }}>Impacto glucémico *</p>
                <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: glucemicoColor[result.impacto_glucemico] ?? "#185FA5" }}>
                  {result.impacto_glucemico.charAt(0).toUpperCase() + result.impacto_glucemico.slice(1)}
                </p>
              </div>
              <div style={{ background: "#FFFFFF", borderRadius: "12px", border: "1px solid #B5D4F4", padding: "1rem", textAlign: "center" }}>
                <p style={{ margin: "0 0 0.3rem", fontSize: "0.68rem", color: "#888780", textTransform: "uppercase" }}>Ejercicio registrado</p>
                <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#185FA5" }}>
                  −{(result.calorias_quemadas_ejercicio_kcal ?? 0).toLocaleString("es-AR")} kcal
                </p>
              </div>
            </div>

            {/* IMPORTANTE */}
            <div style={{ background: "#FAEEDA", border: "1px solid #FAC775", borderRadius: "10px", padding: "0.875rem 1rem", marginBottom: "1rem" }}>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#854F0B", lineHeight: 1.55 }}>
                <strong>IMPORTANTE:</strong> Los valores marcados con * son estimaciones de IA sobre descripciones de texto libre. Este balance es orientativo — consultá con un nutricionista antes de tomar decisiones nutricionales.
              </p>
            </div>

            {/* Detalle comidas con macros */}
            <div style={card}>
              <h2 style={sectionTitle}>Detalle de comidas *</h2>
              {MEALS.map(meal => {
                const items = result.detalle_comidas?.[meal.key as keyof typeof result.detalle_comidas] ?? [];
                if (items.length === 0) return null;
                const totalKcal = items.reduce((s, i) => s + (i.kcal_estimadas ?? 0), 0);
                return (
                  <div key={meal.key} style={{ marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#2C2C2A" }}>
                        {meal.icon} {meal.label.replace(" (opcional)", "")}
                      </span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#185FA5" }}>
                        {totalKcal.toLocaleString("es-AR")} kcal
                      </span>
                    </div>
                    {items.map((item, i) => (
                      <div key={i} style={{ padding: "0.5rem 0.625rem", borderRadius: "8px", background: i % 2 === 0 ? "#F8FBFF" : "transparent", marginBottom: "4px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <span style={{ fontSize: "0.83rem", color: "#2C2C2A", fontWeight: 500 }}>{item.item}</span>
                          <span style={{ fontSize: "0.83rem", fontWeight: 700, color: "#185FA5", whiteSpace: "nowrap", marginLeft: "0.5rem" }}>{item.kcal_estimadas} kcal</span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {item.proteinas_g !== undefined && <span style={macroChip("#185FA5", "#EEF4FF")}>P: {item.proteinas_g}g</span>}
                          {item.grasas_g !== undefined && <span style={macroChip("#854F0B", "#FAEEDA")}>G: {item.grasas_g}g</span>}
                          {item.carbohidratos_g !== undefined && <span style={macroChip("#27500A", "#EAF3DE")}>C: {item.carbohidratos_g}g</span>}
                          {item.sodio_mg !== undefined && <span style={macroChip("#5F5E5A", "#F0F6FF")}>Na: {item.sodio_mg}mg</span>}
                          {item.fibra_g !== undefined && <span style={macroChip("#5F5E5A", "#F0F6FF")}>Fibra: {item.fibra_g}g</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Detalle ejercicios */}
            {result.detalle_ejercicios && result.detalle_ejercicios.length > 0 && (
              <div style={card}>
                <h2 style={sectionTitle}>Detalle de ejercicios *</h2>
                {result.detalle_ejercicios.map((ej, i) => (
                  <div key={i} style={{ padding: "0.75rem 0", borderBottom: i < result.detalle_ejercicios.length - 1 ? "1px solid #E6F1FB" : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <div>
                        <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 700, color: "#2C2C2A" }}>{ej.descripcion}</p>
                        <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#888780" }}>{ej.duracion_minutos} min</p>
                      </div>
                      <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#185FA5", whiteSpace: "nowrap", marginLeft: "1rem" }}>−{ej.kcal_estimadas} kcal</span>
                    </div>
                    {ej.tipo && (
                      <span style={{ ...macroChip("#185FA5", "#E6F1FB"), marginRight: "6px" }}>{ej.tipo}</span>
                    )}
                    {ej.beneficio_clinico && (
                      <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "#5F5E5A", lineHeight: 1.5 }}>{ej.beneficio_clinico}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Comentario clínico */}
            {result.comentario_clinico && (
              <div style={{ background: "#E6F1FB", border: "1px solid #B5D4F4", borderRadius: "12px", padding: "1.25rem", marginBottom: "1rem" }}>
                <p style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", fontWeight: 700, color: "#185FA5", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  Análisis clínico personalizado
                </p>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "#2C2C2A", lineHeight: 1.65 }}>{result.comentario_clinico}</p>
              </div>
            )}

            {/* Recomendaciones */}
            {result.recomendaciones && result.recomendaciones.length > 0 && (
              <div style={{ background: "#EAF3DE", border: "1px solid #C0DD97", borderRadius: "12px", padding: "1.25rem", marginBottom: "2.5rem" }}>
                <p style={{ margin: "0 0 0.75rem", fontSize: "0.75rem", fontWeight: 700, color: "#27500A", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  Sugerencias informativas
                </p>
                {result.recomendaciones.map((rec, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: i < result.recomendaciones.length - 1 ? "0.5rem" : 0 }}>
                    <span style={{ color: "#27500A", fontWeight: 700, flexShrink: 0 }}>·</span>
                    <p style={{ margin: 0, fontSize: "0.88rem", color: "#2C2C2A", lineHeight: 1.55 }}>{rec}</p>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}