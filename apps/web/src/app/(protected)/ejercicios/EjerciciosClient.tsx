"use client";

import { useEffect, useState, useRef } from "react";
import NavbarProtegido from "@/components/NavbarProtegido";
import { compactProfile } from "@/lib/utils";

type Ejercicio = {
  id: number;
  name_en: string;
  name_es: string | null;
  category: string;
  equipment: string;
  image_url: string;
  muscles_primary: string | null;
};

type UsageData = {
  daily_used: number;
  daily_limit: number;
  monthly_used: number;
  monthly_limit: number;
};

const OBJETIVOS = [
  { value: "bajar_peso", label: "Bajar de peso", icon: "⚖️" },
  { value: "subir_peso", label: "Subir de peso / ganar músculo", icon: "💪" },
  { value: "control_clinico", label: "Mejorar valores clínicos", icon: "🩺" },
  { value: "resistencia", label: "Correr 5K o 10K", icon: "🏃" },
  { value: "maraton", label: "Preparar una maratón", icon: "🏅" },
  { value: "bienestar", label: "Bienestar general", icon: "🌿" },
];

const NIVELES = [
  { value: "principiante", label: "Nunca entrené", icon: "🌱" },
  { value: "intermedio", label: "Entrené antes y dejé", icon: "🔄" },
  { value: "avanzado", label: "Entreno actualmente", icon: "🔥" },
];

const EQUIPAMIENTO = [
  { value: "casa_sin_equipo", label: "Casa sin equipamiento", icon: "🏠" },
  { value: "casa_con_equipo", label: "Casa con equipamiento básico", icon: "🏋️" },
  { value: "gimnasio", label: "Gimnasio completo", icon: "🏟️" },
];

const DIAS = [2, 3, 4, 5];

function parsePlan(text: string): { secciones: { titulo: string; contenido: string }[] } {
  const lines = text.split("\n");
  const secciones: { titulo: string; contenido: string }[] = [];
  let current: { titulo: string; contenido: string } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const isHeader =
      trimmed.startsWith("OBJETIVO") ||
      trimmed.startsWith("ADVERTENCIAS") ||
      trimmed.startsWith("SEMANA") ||
      trimmed.startsWith("CONSEJOS");

    if (isHeader) {
      if (current) secciones.push(current);
      current = { titulo: trimmed.replace(/:/g, "").trim(), contenido: "" };
    } else if (current) {
      current.contenido += line + "\n";
    }
  }

  if (current) secciones.push(current);
  return { secciones };
}

function extraerEjercicioIds(text: string): number[] {
  const matches = text.matchAll(/EJERCICIO_ID:(\d+)/g);
  const ids: number[] = [];
  for (const m of matches) {
    const id = parseInt(m[1]);
    if (!ids.includes(id)) ids.push(id);
  }
  return ids;
}

function renderLineaEjercicio(line: string, ejerciciosMap: Map<number, Ejercicio>, onVerEjercicio: (e: Ejercicio) => void) {
  const match = line.match(/EJERCICIO_ID:(\d+)\s*\|\s*(.+)/);
  if (!match) {
    return <p style={{ margin: "0 0 0.4rem", fontSize: "0.88rem", color: "#2C2C2A", lineHeight: 1.6 }}>{line}</p>;
  }

  const id = parseInt(match[1]);
  const resto = match[2];
  const partes = resto.split("|").map(p => p.trim());
  const nombre = partes[0] || "";
  const series = partes[1] || "";
  const descanso = partes[2] || "";
  const ejercicio = ejerciciosMap.get(id);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0.6rem 0.875rem", borderRadius: "8px", background: "#F8FBFF", border: "1px solid #B5D4F4", marginBottom: "0.5rem" }}>
      {ejercicio?.image_url && (
        <img
          src={ejercicio.image_url}
          alt={nombre}
          style={{ width: "44px", height: "44px", objectFit: "contain", borderRadius: "6px", background: "#E6F1FB", flexShrink: 0, cursor: "pointer" }}
          onClick={() => ejercicio && onVerEjercicio(ejercicio)}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <button
          onClick={() => ejercicio && onVerEjercicio(ejercicio)}
          style={{ background: "none", border: "none", padding: 0, cursor: ejercicio ? "pointer" : "default", textAlign: "left", display: "block", width: "100%" }}
        >
          <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#185FA5", display: "block" }}>{nombre}</span>
        </button>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "2px" }}>
          {series && <span style={{ fontSize: "0.75rem", color: "#5F5E5A", background: "#E6F1FB", padding: "1px 7px", borderRadius: "4px" }}>{series}</span>}
          {descanso && <span style={{ fontSize: "0.75rem", color: "#5F5E5A", background: "#EAF3DE", padding: "1px 7px", borderRadius: "4px" }}>{descanso}</span>}
        </div>
      </div>
    </div>
  );
}

function SeccionPlan({ titulo, contenido, ejerciciosMap, onVerEjercicio }: {
  titulo: string;
  contenido: string;
  ejerciciosMap: Map<number, Ejercicio>;
  onVerEjercicio: (e: Ejercicio) => void;
}) {
  const isAdvertencia = titulo.includes("ADVERTENCIA");
  const isObjetivo = titulo.includes("OBJETIVO");
  const isConsejo = titulo.includes("CONSEJO");

  const bg = isAdvertencia ? "#FAEEDA" : isObjetivo ? "#E6F1FB" : isConsejo ? "#EAF3DE" : "#FFFFFF";
  const border = isAdvertencia ? "#FAC775" : isObjetivo ? "#B5D4F4" : isConsejo ? "#C0DD97" : "#B5D4F4";
  const titleColor = isAdvertencia ? "#854F0B" : isObjetivo ? "#0C447C" : isConsejo ? "#27500A" : "#185FA5";
  const icon = isAdvertencia ? "⚠️" : isObjetivo ? "🎯" : isConsejo ? "💡" : "📅";

  const lines = contenido.split("\n").map(l => l.trim()).filter(Boolean);

  return (
    <div style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: "14px", padding: "1.25rem 1.5rem", marginBottom: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.875rem" }}>
        <span style={{ fontSize: "1.1rem" }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: titleColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>{titulo}</h3>
      </div>
      <div>
        {lines.map((line, i) => {
          if (line.startsWith("DÍA") || line.startsWith("DIA")) {
            return (
              <p key={i} style={{ margin: "0.875rem 0 0.5rem", fontSize: "0.82rem", fontWeight: 700, color: "#185FA5", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                {line}
              </p>
            );
          }
          if (line.includes("EJERCICIO_ID:")) {
            return <div key={i}>{renderLineaEjercicio(line, ejerciciosMap, onVerEjercicio)}</div>;
          }
          const cleaned = line.replace(/^[-•*]\s*/, "");
          return (
            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "0.4rem" }}>
              <span style={{ color: titleColor, flexShrink: 0 }}>•</span>
              <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.65, color: "#2C2C2A" }}>{cleaned}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ModalEjercicio({ ejercicio, onClose }: { ejercicio: Ejercicio; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "#FFFFFF", borderRadius: "16px", padding: "1.5rem", maxWidth: "400px", width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#185FA5" }}>
            {ejercicio.name_es || ejercicio.name_en}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: "#888780", lineHeight: 1 }}>✕</button>
        </div>
        {ejercicio.image_url && (
          <img
            src={ejercicio.image_url}
            alt={ejercicio.name_en}
            style={{ width: "100%", maxHeight: "220px", objectFit: "contain", borderRadius: "10px", background: "#F0F6FF", marginBottom: "1rem" }}
          />
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          <span style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: "6px", background: "#E6F1FB", color: "#185FA5", fontWeight: 600 }}>{ejercicio.category}</span>
          {ejercicio.equipment && (
            <span style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: "6px", background: "#F1EFE8", color: "#444441", fontWeight: 500 }}>{ejercicio.equipment}</span>
          )}
          {ejercicio.muscles_primary && (
            <span style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: "6px", background: "#EAF3DE", color: "#27500A", fontWeight: 500 }}>💪 {ejercicio.muscles_primary}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EjerciciosClient() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [paso, setPaso] = useState(0);
  const [objetivo, setObjetivo] = useState("");
  const [dias, setDias] = useState(3);
  const [equipamiento, setEquipamiento] = useState("");
  const [nivel, setNivel] = useState("");
  const [restricciones, setRestricciones] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ejerciciosMap, setEjerciciosMap] = useState<Map<number, Ejercicio>>(new Map());
  const [ejercicioModal, setEjercicioModal] = useState<Ejercicio | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, usageRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/usage"),
        ]);
        if (profileRes.ok) { const d = await profileRes.json(); setProfile(d.profile ?? null); }
        if (usageRes.ok) { setUsage(await usageRes.json()); }
      } finally {
        setLoadingProfile(false);
      }
    };
    load();
  }, []);

  const limitReached = usage !== null && (usage.daily_used >= usage.daily_limit || usage.monthly_used >= usage.monthly_limit);

  const generarPlan = async () => {
    setLoading(true);
    setPlan("");
    setError("");
    setEjerciciosMap(new Map());

    try {
      const res = await fetch("/api/ejercicios/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objetivo,
          dias,
          equipamiento,
          nivel,
          restricciones,
          perfil: compactProfile(profile ?? {}),
        }),
      });

      if (res.status === 429) {
        const d = await res.json();
        setError(d.error ?? "Limite de consultas alcanzado.");
        return;
      }

      if (!res.ok) throw new Error("Error al generar el plan");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No se pudo leer la respuesta");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value);
        setPlan(fullText);
      }

      // Cargar ejercicios del catálogo
      const ids = extraerEjercicioIds(fullText);
      if (ids.length > 0) {
        const catalogRes = await fetch(`/api/ejercicios/catalogo?ids=${ids.join(",")}`);
        if (catalogRes.ok) {
          const ejercicios: Ejercicio[] = await catalogRes.json();
          const map = new Map<number, Ejercicio>();
          ejercicios.forEach(e => map.set(e.id, e));
          setEjerciciosMap(map);
        }
      }

      // Guardar plan
      await fetch("/api/ejercicios/historial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objetivo, dias, equipamiento, nivel, restricciones, plan_content: fullText }),
      });

      setUsage(await (await fetch("/api/usage")).json());
      setPaso(5);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexion");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div style={{ minHeight: "100vh", background: "#F0F6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#5F5E5A" }}>Cargando...</p>
      </div>
    );
  }

  const { secciones } = plan ? parsePlan(plan) : { secciones: [] };

  return (
    <div style={{ minHeight: "100vh", background: "#F0F6FF" }}>
      <NavbarProtegido showSignOut={false} />

      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ margin: "0 0 0.3rem", fontSize: "1.5rem", fontWeight: 700, color: "#2C2C2A" }}>Plan de ejercicios</h1>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#5F5E5A" }}>
            Creamos un plan semanal personalizado basado en tu perfil clinico y tus objetivos.
          </p>
        </div>

        {usage && (
          <div style={{ background: "#FFFFFF", border: "1px solid #B5D4F4", borderRadius: "10px", padding: "0.875rem 1.25rem", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, lineHeight: 1, color: usage.daily_used >= usage.daily_limit ? "#991B1B" : "#185FA5" }}>
                  {usage.daily_limit - usage.daily_used}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#5F5E5A", marginTop: "2px" }}>tokens hoy</div>
              </div>
              <div style={{ width: "1px", background: "#B5D4F4", height: "2rem" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, lineHeight: 1, color: usage.monthly_used >= usage.monthly_limit ? "#991B1B" : "#185FA5" }}>
                  {usage.monthly_limit - usage.monthly_used}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#5F5E5A", marginTop: "2px" }}>tokens este mes</div>
              </div>
            </div>
            {limitReached && (
              <div style={{ marginTop: "0.75rem", background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "8px", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#991B1B" }}>
                {usage.daily_used >= usage.daily_limit ? "Alcanzaste el limite diario." : "Alcanzaste el limite mensual."}
              </div>
            )}
          </div>
        )}

        {/* WIZARD */}
        {paso < 5 && (
          <div style={{ background: "#FFFFFF", border: "1px solid #B5D4F4", borderRadius: "14px", padding: "1.75rem", boxShadow: "0 2px 12px rgba(24,95,165,0.06)" }}>

            {/* Progreso */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "1.75rem" }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{ flex: 1, height: "4px", borderRadius: "2px", background: i <= paso ? "#185FA5" : "#E6F1FB", transition: "background 0.2s" }} />
              ))}
            </div>

            {/* PASO 0 — Objetivo */}
            {paso === 0 && (
              <div>
                <h2 style={{ margin: "0 0 0.4rem", fontSize: "1.1rem", fontWeight: 700, color: "#2C2C2A" }}>¿Cuál es tu objetivo?</h2>
                <p style={{ margin: "0 0 1.25rem", fontSize: "0.88rem", color: "#5F5E5A" }}>Seleccioná el que mejor describe lo que querés lograr.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {OBJETIVOS.map(o => (
                    <button
                      key={o.value}
                      onClick={() => { setObjetivo(o.value); setPaso(1); }}
                      style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0.875rem 1rem", borderRadius: "10px", border: `2px solid ${objetivo === o.value ? "#185FA5" : "#B5D4F4"}`, background: objetivo === o.value ? "#E6F1FB" : "#F8FBFF", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                    >
                      <span style={{ fontSize: "1.5rem" }}>{o.icon}</span>
                      <span style={{ fontSize: "0.95rem", fontWeight: 600, color: objetivo === o.value ? "#185FA5" : "#2C2C2A" }}>{o.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 1 — Días */}
            {paso === 1 && (
              <div>
                <h2 style={{ margin: "0 0 0.4rem", fontSize: "1.1rem", fontWeight: 700, color: "#2C2C2A" }}>¿Cuántos días por semana podés entrenar?</h2>
                <p style={{ margin: "0 0 1.25rem", fontSize: "0.88rem", color: "#5F5E5A" }}>Sé realista — es mejor empezar conservador.</p>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  {DIAS.map(d => (
                    <button
                      key={d}
                      onClick={() => setDias(d)}
                      style={{ flex: "1 1 80px", padding: "1.25rem 0.5rem", borderRadius: "10px", border: `2px solid ${dias === d ? "#185FA5" : "#B5D4F4"}`, background: dias === d ? "#E6F1FB" : "#F8FBFF", cursor: "pointer", transition: "all 0.15s" }}
                    >
                      <div style={{ fontSize: "1.75rem", fontWeight: 800, color: dias === d ? "#185FA5" : "#2C2C2A" }}>{d}</div>
                      <div style={{ fontSize: "0.78rem", color: "#5F5E5A", marginTop: "2px" }}>días</div>
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                  <button onClick={() => setPaso(0)} style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1.5px solid #B5D4F4", background: "transparent", color: "#5F5E5A", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}>Atrás</button>
                  <button onClick={() => setPaso(2)} style={{ flex: 2, padding: "0.75rem", borderRadius: "8px", border: "none", background: "#185FA5", color: "#FFFFFF", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}>Continuar</button>
                </div>
              </div>
            )}

            {/* PASO 2 — Equipamiento */}
            {paso === 2 && (
              <div>
                <h2 style={{ margin: "0 0 0.4rem", fontSize: "1.1rem", fontWeight: 700, color: "#2C2C2A" }}>¿Dónde vas a entrenar?</h2>
                <p style={{ margin: "0 0 1.25rem", fontSize: "0.88rem", color: "#5F5E5A" }}>Esto determina qué ejercicios podemos incluir en tu plan.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {EQUIPAMIENTO.map(e => (
                    <button
                      key={e.value}
                      onClick={() => { setEquipamiento(e.value); setPaso(3); }}
                      style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0.875rem 1rem", borderRadius: "10px", border: `2px solid ${equipamiento === e.value ? "#185FA5" : "#B5D4F4"}`, background: equipamiento === e.value ? "#E6F1FB" : "#F8FBFF", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                    >
                      <span style={{ fontSize: "1.5rem" }}>{e.icon}</span>
                      <span style={{ fontSize: "0.95rem", fontWeight: 600, color: equipamiento === e.value ? "#185FA5" : "#2C2C2A" }}>{e.label}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setPaso(1)} style={{ width: "100%", marginTop: "1rem", padding: "0.75rem", borderRadius: "8px", border: "1.5px solid #B5D4F4", background: "transparent", color: "#5F5E5A", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}>Atrás</button>
              </div>
            )}

            {/* PASO 3 — Nivel */}
            {paso === 3 && (
              <div>
                <h2 style={{ margin: "0 0 0.4rem", fontSize: "1.1rem", fontWeight: 700, color: "#2C2C2A" }}>¿Cuál es tu experiencia con el ejercicio?</h2>
                <p style={{ margin: "0 0 1.25rem", fontSize: "0.88rem", color: "#5F5E5A" }}>Esto ajusta la intensidad y progresión del plan.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {NIVELES.map(n => (
                    <button
                      key={n.value}
                      onClick={() => { setNivel(n.value); setPaso(4); }}
                      style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0.875rem 1rem", borderRadius: "10px", border: `2px solid ${nivel === n.value ? "#185FA5" : "#B5D4F4"}`, background: nivel === n.value ? "#E6F1FB" : "#F8FBFF", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                    >
                      <span style={{ fontSize: "1.5rem" }}>{n.icon}</span>
                      <span style={{ fontSize: "0.95rem", fontWeight: 600, color: nivel === n.value ? "#185FA5" : "#2C2C2A" }}>{n.label}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setPaso(2)} style={{ width: "100%", marginTop: "1rem", padding: "0.75rem", borderRadius: "8px", border: "1.5px solid #B5D4F4", background: "transparent", color: "#5F5E5A", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}>Atrás</button>
              </div>
            )}

            {/* PASO 4 — Restricciones */}
            {paso === 4 && (
              <div>
                <h2 style={{ margin: "0 0 0.4rem", fontSize: "1.1rem", fontWeight: 700, color: "#2C2C2A" }}>¿Tenés alguna restricción física?</h2>
                <p style={{ margin: "0 0 1.25rem", fontSize: "0.88rem", color: "#5F5E5A" }}>
                  Lesiones, dolores o limitaciones. Podés dejarlo vacío si no tenés ninguna.<br />
                  <span style={{ color: "#185FA5", fontWeight: 600 }}>Tu perfil clínico ya fue considerado automáticamente.</span>
                </p>
                <textarea
                  value={restricciones}
                  onChange={e => setRestricciones(e.target.value)}
                  placeholder="Ej: dolor en rodilla derecha, hernia lumbar, no puedo hacer saltos..."
                  style={{ width: "100%", height: "100px", padding: "0.875rem 1rem", borderRadius: "8px", border: "1.5px solid #B5D4F4", fontSize: "0.9rem", color: "#2C2C2A", background: "#F8FBFF", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 }}
                />
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                  <button onClick={() => setPaso(3)} style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1.5px solid #B5D4F4", background: "transparent", color: "#5F5E5A", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}>Atrás</button>
                  <button
                    onClick={generarPlan}
                    disabled={loading || limitReached}
                    style={{ flex: 2, padding: "0.75rem", borderRadius: "8px", border: "none", background: loading ? "#378ADD" : "#185FA5", color: "#FFFFFF", fontSize: "0.9rem", fontWeight: 700, cursor: loading || limitReached ? "not-allowed" : "pointer", opacity: limitReached ? 0.5 : 1 }}
                  >
                    {loading ? "Generando plan..." : "Generar mi plan"}
                  </button>
                </div>
                {error && <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: "#991B1B" }}>{error}</p>}
              </div>
            )}
          </div>
        )}

        {/* MENSAJE MIENTRAS GENERA */}
        {loading && (
          <p style={{ margin: "1rem 0", fontSize: "0.85rem", color: "#378ADD", textAlign: "center" }}>
            La IA está creando tu plan personalizado...
          </p>
        )}

        {/* PLAN GENERADO */}
        {plan && paso === 5 && (
          <div style={{ marginTop: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#2C2C2A" }}>Tu plan semanal</h2>
              <button
                onClick={() => { setPlan(""); setPaso(0); setObjetivo(""); setEquipamiento(""); setNivel(""); setRestricciones(""); }}
                style={{ padding: "6px 16px", borderRadius: "8px", border: "1.5px solid #B5D4F4", background: "transparent", color: "#185FA5", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
              >
                Nuevo plan
              </button>
            </div>
            {secciones.map((s, i) => (
              <SeccionPlan
                key={i}
                titulo={s.titulo}
                contenido={s.contenido}
                ejerciciosMap={ejerciciosMap}
                onVerEjercicio={setEjercicioModal}
              />
            ))}
            <p style={{ margin: "1.5rem 0 0", fontSize: "0.78rem", color: "#888780", textAlign: "center", lineHeight: 1.6 }}>
              Este plan es orientativo y fue generado con inteligencia artificial considerando tu perfil clínico. Consultá con tu médico antes de iniciar cualquier rutina de ejercicio.
            </p>
          </div>
        )}

        {ejercicioModal && (
          <ModalEjercicio ejercicio={ejercicioModal} onClose={() => setEjercicioModal(null)} />
        )}

      </main>
    </div>
  );
}