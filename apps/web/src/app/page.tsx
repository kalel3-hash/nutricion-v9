"use client";
// apps/web/src/app/page.tsx

import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";

const DEMO_OUTPUTS: Record<string, DemoResult> = {
  default: {
    alimento: "Ensalada César con pollo",
    puntaje: 82,
    color: "#27500A",
    bg: "#EAF3DE",
    resumen: "Combinación de alto valor proteico con perfil de grasas moderado. El aderezo César aporta sodio relevante. Para la mayoría de los perfiles, es una opción de almuerzo equilibrada.",
    items: [
      { label: "Proteínas", valor: "38g", nota: "Favorece la saciedad y el mantenimiento muscular", icon: "💪" },
      { label: "Grasas", valor: "22g", nota: "Principalmente del aderezo y el queso parmesano", icon: "🫒" },
      { label: "Carbohidratos", valor: "14g", nota: "Impacto glucémico bajo por la base de hojas", icon: "🌿" },
      { label: "Sodio", valor: "720mg", nota: "Relevante si controlás presión arterial", icon: "⚠️" },
    ],
    advertencia: null,
  },
  pollo: {
    alimento: "Pollo a la plancha con arroz",
    puntaje: 88,
    color: "#27500A",
    bg: "#EAF3DE",
    resumen: "Fuente de proteína magra con carbohidratos de digestión media. El arroz blanco eleva la glucemia de forma moderada. Buena opción para perfiles activos.",
    items: [
      { label: "Proteínas", valor: "42g", nota: "Proteína completa de alta biodisponibilidad", icon: "💪" },
      { label: "Grasas", valor: "8g", nota: "Perfil bajo en grasas saturadas", icon: "🫒" },
      { label: "Carbohidratos", valor: "48g", nota: "Arroz blanco tiene índice glucémico moderado-alto", icon: "🌾" },
      { label: "Sodio", valor: "180mg", nota: "Valor bajo, favorable para cualquier perfil", icon: "✅" },
    ],
    advertencia: null,
  },
  pizza: {
    alimento: "Pizza de mozzarella (2 porciones)",
    puntaje: 44,
    color: "#854F0B",
    bg: "#FAEEDA",
    resumen: "Alta densidad calórica con combinación de carbohidratos refinados y grasas saturadas. El impacto glucémico es elevado. En perfiles con colesterol o glucemia alta, el consumo frecuente merece atención.",
    items: [
      { label: "Proteínas", valor: "18g", nota: "Aporte proteico moderado del queso", icon: "💪" },
      { label: "Grasas", valor: "32g", nota: "Alto en saturadas — relevante si controlás colesterol", icon: "⚠️" },
      { label: "Carbohidratos", valor: "72g", nota: "Masa refinada con impacto glucémico alto", icon: "🌾" },
      { label: "Sodio", valor: "1.240mg", nota: "Supera el 50% del límite diario recomendado", icon: "⚠️" },
    ],
    advertencia: "Para perfiles con colesterol LDL elevado o glucemia en rango alto, el consumo frecuente no es ideal. Consultá con tu nutricionista.",
  },
  milanesa: {
    alimento: "Milanesa con puré de papas",
    puntaje: 58,
    color: "#854F0B",
    bg: "#FAEEDA",
    resumen: "Combinación clásica argentina de proteína animal con carbohidratos de alto índice glucémico. El rebozado frito suma grasas saturadas. Plato de alto aporte calórico.",
    items: [
      { label: "Proteínas", valor: "34g", nota: "Fuente completa de proteína animal", icon: "💪" },
      { label: "Grasas", valor: "28g", nota: "El rebozado frito eleva las grasas saturadas", icon: "⚠️" },
      { label: "Carbohidratos", valor: "58g", nota: "Puré de papas tiene índice glucémico alto", icon: "🌾" },
      { label: "Sodio", valor: "890mg", nota: "Moderado-alto según condimento y sal añadida", icon: "⚠️" },
    ],
    advertencia: null,
  },
  medialunas: {
    alimento: "Medialunas con café con leche",
    puntaje: 38,
    color: "#991B1B",
    bg: "#FEE2E2",
    resumen: "Desayuno de alta carga glucémica y bajo valor nutricional relativo. Las medialunas combinan harinas refinadas con manteca. Caída de energía probable a las 2 horas.",
    items: [
      { label: "Proteínas", valor: "8g", nota: "Aporte proteico muy bajo para una comida principal", icon: "💪" },
      { label: "Grasas", valor: "18g", nota: "Principalmente saturadas por la manteca", icon: "⚠️" },
      { label: "Carbohidratos", valor: "64g", nota: "Harina refinada con pico glucémico rápido", icon: "🌾" },
      { label: "Sodio", valor: "320mg", nota: "Moderado", icon: "🫒" },
    ],
    advertencia: "No recomendado como única comida del día. Incorporar proteína (huevo, queso) mejora significativamente el perfil nutricional del desayuno.",
  },
  asado: {
    alimento: "Asado (costilla + vacío)",
    puntaje: 65,
    color: "#27500A",
    bg: "#EAF3DE",
    resumen: "Alto en proteína completa con perfil de grasas variable según el corte. La costilla suma más grasa saturada que el vacío. Sin hidratos de carbono — impacto glucémico nulo.",
    items: [
      { label: "Proteínas", valor: "52g", nota: "Proteína animal completa de alta calidad", icon: "💪" },
      { label: "Grasas", valor: "38g", nota: "Saturadas en costilla, perfil mejor en vacío", icon: "⚠️" },
      { label: "Carbohidratos", valor: "0g", nota: "Sin hidratos — favorable para glucemia", icon: "✅" },
      { label: "Sodio", valor: "140mg", nota: "Bajo si no se agrega sal en exceso", icon: "✅" },
    ],
    advertencia: null,
  },
};

type DemoResult = {
  alimento: string;
  puntaje: number;
  color: string;
  bg: string;
  resumen: string;
  items: { label: string; valor: string; nota: string; icon: string }[];
  advertencia: string | null;
};

function matchOutput(input: string): DemoResult {
  const q = input.toLowerCase();
  if (q.includes("pollo") && (q.includes("arroz") || q.includes("plancha"))) return DEMO_OUTPUTS.pollo;
  if (q.includes("pizza") || q.includes("mozzarella") || q.includes("napolitana")) return DEMO_OUTPUTS.pizza;
  if (q.includes("milanesa") || q.includes("milaneza")) return DEMO_OUTPUTS.milanesa;
  if (q.includes("medialuna") || q.includes("croissant") || q.includes("café") || q.includes("cafe")) return DEMO_OUTPUTS.medialunas;
  if (q.includes("asado") || q.includes("costilla") || q.includes("vacío") || q.includes("vacio") || q.includes("churrasco")) return DEMO_OUTPUTS.asado;
  if (q.includes("pollo") || q.includes("pechuga")) return DEMO_OUTPUTS.pollo;
  return DEMO_OUTPUTS.default;
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#E6F1FB" strokeWidth="8" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)" }}
      />
      <text x="50" y="46" textAnchor="middle" fontSize="18" fontWeight="800" fill={color}>{score}</text>
      <text x="50" y="60" textAnchor="middle" fontSize="9" fill="#888780">/100</text>
    </svg>
  );
}

function DemoAnalisis() {
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "result">("idle");
  const [result, setResult] = useState<DemoResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const SUGERENCIAS = ["Ensalada César con pollo", "Pizza de mozzarella", "Milanesa con puré", "Medialunas con café", "Asado"];

  const analizar = (texto: string) => {
    const q = texto.trim();
    if (!q) return;
    setInput(q);
    setPhase("loading");
    setTimeout(() => {
      setResult(matchOutput(q));
      setPhase("result");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
    }, 1800);
  };

  return (
    <div style={{
      background: "#FFFFFF", borderRadius: "20px",
      border: "1.5px solid #B5D4F4",
      boxShadow: "0 8px 40px rgba(24,95,165,0.10)",
      overflow: "hidden", maxWidth: "620px", margin: "0 auto",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #0C447C 0%, #185FA5 100%)",
        padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem",
      }}>
        <Image src="/Logo.png" alt="VitalCross AI" width={28} height={28} style={{ borderRadius: "6px" }} />
        <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.88rem" }}>VitalCross AI · Demo</span>
        <span style={{
          marginLeft: "auto", background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)",
          fontSize: "0.68rem", padding: "3px 10px", borderRadius: "20px", fontWeight: 600,
        }}>SIN PERFIL CLÍNICO</span>
      </div>

      <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #E6F1FB" }}>
        <p style={{ margin: "0 0 0.625rem", fontSize: "0.78rem", color: "#5F5E5A", fontWeight: 600 }}>
          ¿Qué comiste o vas a comer?
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && analizar(input)}
            placeholder="Ej: milanesa con puré, ensalada césar..."
            disabled={phase === "loading"}
            style={{
              flex: 1, padding: "0.65rem 0.9rem", borderRadius: "8px",
              border: "1.5px solid #B5D4F4", fontSize: "0.88rem", color: "#2C2C2A",
              background: "#F8FBFF", outline: "none",
            }}
          />
          <button onClick={() => analizar(input)} disabled={phase === "loading" || !input.trim()}
            style={{
              padding: "0.65rem 1.1rem", borderRadius: "8px",
              background: phase === "loading" ? "#85B7EB" : "#185FA5",
              color: "#FFFFFF", border: "none", fontWeight: 700,
              fontSize: "0.85rem", cursor: phase === "loading" ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}>
            {phase === "loading" ? "Analizando..." : "Analizar →"}
          </button>
        </div>
        {phase === "idle" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "0.625rem" }}>
            {SUGERENCIAS.map(s => (
              <button key={s} onClick={() => analizar(s)} style={{
                padding: "4px 12px", borderRadius: "20px", border: "1px solid #B5D4F4",
                background: "#F0F6FF", color: "#185FA5", fontSize: "0.75rem",
                fontWeight: 600, cursor: "pointer",
              }}>{s}</button>
            ))}
          </div>
        )}
      </div>

      {phase === "loading" && (
        <div style={{ padding: "2.5rem 1.5rem", textAlign: "center" }}>
          <div style={{
            width: "40px", height: "40px", border: "3px solid #E6F1FB",
            borderTop: "3px solid #185FA5", borderRadius: "50%",
            margin: "0 auto 1rem", animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#5F5E5A" }}>Analizando composición nutricional...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {phase === "result" && result && (
        <div ref={resultRef} style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <ScoreRing score={result.puntaje} color={result.color} />
            <div>
              <p style={{ margin: "0 0 2px", fontSize: "0.7rem", color: "#888780", textTransform: "uppercase", fontWeight: 700 }}>Análisis de</p>
              <p style={{ margin: "0 0 4px", fontSize: "1rem", fontWeight: 800, color: "#2C2C2A" }}>{result.alimento}</p>
              <span style={{
                display: "inline-block", padding: "2px 10px", borderRadius: "20px",
                background: result.bg, color: result.color, fontSize: "0.72rem", fontWeight: 700,
              }}>
                {result.puntaje >= 75 ? "Perfil favorable" : result.puntaje >= 50 ? "Perfil moderado" : "Perfil a revisar"}
              </span>
            </div>
          </div>

          <p style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: "#2C2C2A", lineHeight: 1.65, padding: "0.75rem", background: "#F8FBFF", borderRadius: "8px", borderLeft: `3px solid ${result.color}` }}>
            {result.resumen}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "1rem" }}>
            {result.items.map((item) => (
              <div key={item.label} style={{ padding: "0.625rem 0.75rem", borderRadius: "10px", background: "#F8FBFF", border: "1px solid #E6F1FB" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                  <span style={{ fontSize: "0.68rem", color: "#888780", textTransform: "uppercase", fontWeight: 700 }}>{item.label}</span>
                  <span style={{ fontSize: "0.7rem" }}>{item.icon}</span>
                </div>
                <p style={{ margin: "0 0 2px", fontSize: "1rem", fontWeight: 800, color: "#185FA5" }}>{item.valor}</p>
                <p style={{ margin: 0, fontSize: "0.68rem", color: "#888780", lineHeight: 1.4 }}>{item.nota}</p>
              </div>
            ))}
          </div>

          {result.advertencia && (
            <div style={{
              padding: "0.75rem", borderRadius: "8px", background: "#FEF3C7",
              border: "1px solid #FCD34D", marginBottom: "1rem",
              fontSize: "0.8rem", color: "#92400E", lineHeight: 1.55,
            }}>
              ⚠️ {result.advertencia}
            </div>
          )}

          <div style={{
            padding: "1rem", borderRadius: "12px",
            background: "linear-gradient(135deg, #0C447C 0%, #185FA5 100%)",
            textAlign: "center",
          }}>
            <p style={{ margin: "0 0 0.5rem", fontSize: "0.82rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
              Este análisis es genérico. Con tu perfil clínico real —colesterol, glucemia, medicamentos—
              el resultado es personalizado para vos.
            </p>
            <Link href="/register" style={{
              display: "inline-block", marginTop: "0.5rem", padding: "0.6rem 1.5rem",
              borderRadius: "8px", background: "#FFFFFF", color: "#185FA5",
              fontSize: "0.88rem", fontWeight: 700, textDecoration: "none",
            }}>
              Crear cuenta gratis →
            </Link>
          </div>

          <button onClick={() => { setPhase("idle"); setInput(""); setResult(null); }} style={{
            marginTop: "0.75rem", width: "100%", padding: "0.5rem",
            background: "transparent", border: "none", color: "#888780",
            fontSize: "0.78rem", cursor: "pointer",
          }}>
            ← Analizar otro alimento
          </button>
        </div>
      )}
    </div>
  );
}

const FEATURES = [
  { icon: "🔬", title: "Análisis de alimentos", desc: "Escribís lo que comiste en texto libre. La IA estima calorías, macronutrientes e impacto glucémico cruzando los datos con tu perfil clínico." },
  { icon: "⚖️", title: "Balance calórico diario", desc: "Registrás comidas y ejercicio del día. La app calcula tu TDEE personal y te muestra si estás en déficit, equilibrio o superávit." },
  { icon: "🏋️", title: "Rutinas de ejercicio", desc: "Generá rutinas personalizadas según tu condición física, objetivos y tiempo disponible. Cada ejercicio incluye descripción y beneficio clínico." },
  { icon: "💊", title: "Interacciones con medicamentos", desc: "Consultás si un alimento tiene interacciones conocidas con tus medicamentos declarados. Información orientativa con respaldo clínico." },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F0F6FF", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(12,68,124,0.97)", backdropFilter: "blur(8px)",
        padding: "0.875rem 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <Image src="/Logo.png" alt="VitalCross AI" width={32} height={32} style={{ borderRadius: "8px" }} />
          <span style={{ color: "#FFFFFF", fontWeight: 800, fontSize: "1rem" }}>
            <span style={{ color: "#64B5F6" }}>Vital</span>Cross AI
          </span>
        </div>
        <Link href="/login" style={{
          padding: "0.5rem 1.25rem", borderRadius: "8px",
          border: "1.5px solid rgba(255,255,255,0.3)",
          color: "#FFFFFF", fontSize: "0.85rem", fontWeight: 600,
          textDecoration: "none",
        }}>
          Iniciar sesión
        </Link>
      </nav>

      {/* HERO con logo grande */}
      <section style={{
        background: "linear-gradient(160deg, #0C447C 0%, #185FA5 55%, #378ADD 100%)",
        padding: "5rem 2rem 4rem", textAlign: "center",
      }}>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>

          {/* Logo grande en hero */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.12)",
              borderRadius: "24px",
              padding: "1rem 1.5rem",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}>
              <Image
                src="/Logo.png"
                alt="VitalCross AI"
                width={120}
                height={120}
                style={{ display: "block", borderRadius: "16px" }}
              />
            </div>
          </div>

          <span style={{
            display: "inline-block", marginBottom: "1.25rem",
            padding: "4px 14px", borderRadius: "20px",
            background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)",
            fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.5px",
          }}>
            INTELIGENCIA ARTIFICIAL · NUTRICIÓN CLÍNICA
          </span>

          <h1 style={{
            margin: "0 0 1.25rem", color: "#FFFFFF",
            fontWeight: 800, fontSize: "clamp(2rem, 5.5vw, 3.25rem)",
            lineHeight: 1.1, letterSpacing: "-0.5px",
          }}>
            Lo que comés importa.
            <br />
            <span style={{ color: "#93C5FD" }}>Tu historial clínico también.</span>
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.85)", fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
            maxWidth: "500px", margin: "0 auto 1rem", lineHeight: 1.75,
          }}>
            VitalCross AI analiza tus alimentos y rutinas considerando tus valores reales de colesterol, glucemia, función renal y medicamentos.
          </p>

          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", marginBottom: "3rem" }}>
            Probalo sin registrarte. ↓
          </p>
        </div>
      </section>

      {/* DEMO */}
      <section style={{ padding: "0 1.5rem", marginTop: "-2rem", marginBottom: "4rem" }}>
        <DemoAnalisis />
      </section>

      {/* FEATURES */}
      <section style={{ padding: "2rem 1.5rem 4rem", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.6rem", fontWeight: 800, color: "#2C2C2A" }}>
            Todo lo que incluye tu cuenta
          </h2>
          <p style={{ margin: 0, color: "#888780", fontSize: "0.88rem" }}>
            Cada módulo usa tu perfil clínico para personalizar el resultado.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{
              background: "#FFFFFF", borderRadius: "14px",
              border: "1px solid #B5D4F4",
              boxShadow: "0 2px 12px rgba(24,95,165,0.05)",
              padding: "1.5rem",
            }}>
              <span style={{ fontSize: "1.8rem", display: "block", marginBottom: "0.75rem" }}>{f.icon}</span>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.95rem", fontWeight: 700, color: "#185FA5" }}>{f.title}</h3>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#5F5E5A", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{
        background: "linear-gradient(135deg, #0C447C 0%, #185FA5 100%)",
        padding: "4rem 2rem", textAlign: "center",
      }}>
        <h2 style={{ margin: "0 0 0.75rem", color: "#FFFFFF", fontSize: "1.75rem", fontWeight: 800 }}>
          Tu nutrición, basada en tu salud real.
        </h2>
        <p style={{ margin: "0 auto 2rem", color: "rgba(255,255,255,0.75)", fontSize: "0.95rem", maxWidth: "420px", lineHeight: 1.65 }}>
          Creá tu cuenta gratis, cargá tu perfil clínico y empezá a analizar con contexto real.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" style={{
            padding: "0.875rem 2.5rem", borderRadius: "10px",
            background: "#FFFFFF", color: "#185FA5",
            fontSize: "1rem", fontWeight: 700, textDecoration: "none",
          }}>
            Empezar gratis
          </Link>
          <Link href="/login" style={{
            padding: "0.875rem 2.25rem", borderRadius: "10px",
            border: "2px solid rgba(255,255,255,0.35)",
            background: "transparent", color: "#FFFFFF",
            fontSize: "1rem", fontWeight: 600, textDecoration: "none",
          }}>
            Iniciar sesión
          </Link>
        </div>
        <p style={{ marginTop: "1.25rem", color: "rgba(255,255,255,0.35)", fontSize: "0.75rem" }}>
          Información orientativa · No reemplaza la consulta profesional
        </p>
      </section>

    </div>
  );
}