"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const problemCards = [
  {
    front: { icon: "❌", title: "El problema", sub: "Los consejos genéricos" },
    back: {
      content: "En redes vemos frases como \"el arroz es malo\" o \"el pan engorda\", como si todas las personas fueran iguales. No lo somos.",
    },
  },
  {
    front: { icon: "🍚", title: "El ejemplo", sub: "¿Es bueno comer arroz?" },
    back: {
      items: [
        { icon: "✅", text: "Análisis normales → puede ser adecuado" },
        { icon: "⚠️", text: "Resistencia a la insulina → controlar porción" },
        { icon: "⛔", text: "Diabetes mal controlada → puede ser dañino" },
      ],
    },
  },
  {
    front: { icon: "🧬", title: "La verdad", sub: "Depende de tu cuerpo" },
    back: {
      content: "Glucemia, colesterol, triglicéridos, función renal, medicación y patologías previas. Sin esos datos, cualquier consejo es incompleto.",
    },
  },
  {
    front: { icon: "✨", title: "La solución", sub: "VitalCross AI" },
    back: {
      content: "No te dice qué está bien o mal en general. Te dice qué está bien o mal para vos, basado en tus análisis clínicos reales.",
    },
  },
];

const howCards = [
  {
    front: { icon: "🔬", step: "1", title: "Cargás tus análisis" },
    back: { content: "Ingresás tus valores de laboratorio o subís un PDF/foto y la IA extrae los datos automáticamente." },
  },
  {
    front: { icon: "🧬", step: "2", title: "Completás tu perfil" },
    back: { content: "Edad, peso, condiciones médicas, medicación y objetivos. Todo lo que hace única tu situación." },
  },
  {
    front: { icon: "📸", step: "3", title: "Analizás un alimento" },
    back: { content: "Por texto libre, foto del plato o foto de la etiqueta nutricional. La IA procesa todo en segundos." },
  },
  {
    front: { icon: "🎯", step: "4", title: "Recibís tu análisis" },
    back: { content: "Impacto en tu salud, relación con tus valores clínicos, sugerencias de porción y fuentes científicas." },
  },
];

function FlipCard({ front, back, flipped, onToggle, dark = false }: {
  front: { icon: string; title: string; sub?: string; step?: string };
  back: { content?: string; items?: { icon: string; text: string }[] };
  flipped: boolean;
  onToggle: () => void;
  dark?: boolean;
}) {
  return (
    <div
      onClick={onToggle}
      role="button"
      style={{ perspective: "1000px", cursor: "pointer", height: "160px" }}
    >
      <div style={{
        position: "relative", width: "100%", height: "100%",
        transformStyle: "preserve-3d",
        transition: "transform 0.55s cubic-bezier(0.4,0,0.2,1)",
        transform: flipped ? "rotateY(180deg)" : "none",
      }}>
        {/* FRENTE */}
        <div style={{
          position: "absolute", width: "100%", height: "100%",
          backfaceVisibility: "hidden", borderRadius: "14px",
          border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "#B5D4F4"}`,
          background: dark ? "rgba(255,255,255,0.08)" : "#FFFFFF",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "1.25rem", boxSizing: "border-box",
          boxShadow: dark ? "none" : "0 2px 12px rgba(24,95,165,0.06)",
        }}>
          {front.step && (
            <div style={{
              width: "26px", height: "26px", borderRadius: "50%",
              background: dark ? "rgba(255,255,255,0.2)" : "#185FA5",
              color: "#FFFFFF", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "0.75rem", fontWeight: 800,
              marginBottom: "0.5rem",
            }}>{front.step}</div>
          )}
          <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{front.icon}</div>
          <p style={{ margin: "0 0 0.2rem", fontWeight: 700, fontSize: "0.9rem", color: dark ? "#FFFFFF" : "#2C2C2A", textAlign: "center" }}>{front.title}</p>
          {front.sub && <p style={{ margin: 0, fontSize: "0.75rem", color: dark ? "rgba(255,255,255,0.65)" : "#888780", textAlign: "center" }}>{front.sub}</p>}
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.68rem", color: dark ? "rgba(255,255,255,0.45)" : "#B5D4F4", textAlign: "center" }}>Click para ver más</p>
        </div>

        {/* DORSO */}
        <div style={{
          position: "absolute", width: "100%", height: "100%",
          backfaceVisibility: "hidden", borderRadius: "14px",
          background: "linear-gradient(135deg, #185FA5 0%, #378ADD 100%)",
          transform: "rotateY(180deg)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "1.25rem", boxSizing: "border-box",
          boxShadow: "0 4px 20px rgba(24,95,165,0.25)",
        }}>
          {back.content && (
            <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", textAlign: "center", lineHeight: 1.65 }}>
              {back.content}
            </p>
          )}
          {back.items && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", width: "100%" }}>
              {back.items.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <span style={{ fontSize: "0.9rem", flexShrink: 0 }}>{item.icon}</span>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255,255,255,0.9)", lineHeight: 1.5 }}>{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [problemFlipped, setProblemFlipped] = useState<number | null>(null);
  const [howFlipped, setHowFlipped] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: "#F0F6FF", fontFamily: "system-ui, sans-serif" }}>

      {/* NAVBAR */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "1rem 2rem", background: "#FFFFFF",
        borderBottom: "1px solid #B5D4F4", position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Image src="/Logo.png" alt="VitalCross AI" width={56} height={56} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: "15px", fontWeight: 600 }}>
            <span style={{ color: "#185FA5" }}>Vital</span>
            <span style={{ color: "#2C2C2A" }}>Cross AI</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link href="/login" style={{
            padding: "7px 18px", borderRadius: "8px", border: "1.5px solid #185FA5",
            background: "transparent", color: "#185FA5", fontSize: "13px", fontWeight: 500, textDecoration: "none",
          }}>Iniciar sesión</Link>
          <Link href="/register" style={{
            padding: "7px 18px", borderRadius: "8px",
            background: "#185FA5", color: "#FFFFFF", fontSize: "13px", fontWeight: 500, textDecoration: "none",
          }}>Crear cuenta gratis</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        background: "linear-gradient(135deg, #0C447C 0%, #185FA5 60%, #378ADD 100%)",
        padding: "3.5rem 2rem 3rem", textAlign: "center",
      }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <div style={{
            display: "inline-block", background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.3)", borderRadius: "20px",
            padding: "5px 14px", fontSize: "0.72rem", fontWeight: 700,
            color: "#FFFFFF", letterSpacing: "0.5px", marginBottom: "1.25rem",
            textTransform: "uppercase",
          }}>
            Nutrición personalizada con IA
          </div>

          <h1 style={{
            margin: "0 0 1rem", color: "#FFFFFF", fontWeight: 800,
            fontSize: "clamp(1.75rem, 5vw, 3rem)", lineHeight: 1.15, letterSpacing: "-0.5px",
          }}>
            Un mismo alimento no es igual para todos.{" "}
            <span style={{ color: "#85B7EB" }}>Descubrí cómo impacta en vos.</span>
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.82)", fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
            maxWidth: "520px", margin: "0 auto 2rem", lineHeight: 1.7,
          }}>
            VitalCross AI analiza alimentos según tus análisis clínicos reales y tu perfil de salud. Información concreta, no consejos genéricos.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{
              padding: "13px 2.25rem", borderRadius: "10px",
              background: "#FFFFFF", color: "#185FA5",
              fontSize: "0.95rem", fontWeight: 700, textDecoration: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}>
              Analizá tu alimentación gratis
            </Link>
            <Link href="/login" style={{
              padding: "13px 2.25rem", borderRadius: "10px",
              border: "2px solid rgba(255,255,255,0.45)",
              background: "transparent", color: "#FFFFFF",
              fontSize: "0.95rem", fontWeight: 500, textDecoration: "none",
            }}>
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* PROBLEMA + SOLUCIÓN — Flip cards */}
      <section style={{ padding: "3rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <h2 style={{ margin: "0 0 0.4rem", fontSize: "clamp(1.25rem, 3vw, 1.6rem)", fontWeight: 700, color: "#2C2C2A" }}>
            ¿Por qué los consejos de internet no te ayudan?
          </h2>
          <p style={{ margin: 0, color: "#888780", fontSize: "0.85rem" }}>Hacé click en cada tarjeta para entenderlo.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "1rem" }}>
          {problemCards.map((card, i) => (
            <FlipCard
              key={i}
              front={card.front}
              back={card.back}
              flipped={problemFlipped === i}
              onToggle={() => setProblemFlipped(prev => prev === i ? null : i)}
            />
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA — Flip cards */}
      <section style={{
        background: "linear-gradient(135deg, #0C447C 0%, #185FA5 100%)",
        padding: "3rem 2rem",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <h2 style={{ margin: "0 0 0.4rem", fontSize: "clamp(1.25rem, 3vw, 1.6rem)", fontWeight: 700, color: "#FFFFFF" }}>
              ¿Cómo funciona VitalCross AI?
            </h2>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.65)", fontSize: "0.85rem" }}>Hacé click en cada paso para ver los detalles.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "1rem" }}>
            {howCards.map((card, i) => (
              <FlipCard
                key={i}
                front={card.front}
                back={card.back}
                flipped={howFlipped === i}
                onToggle={() => setHowFlipped(prev => prev === i ? null : i)}
                dark
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: "3.5rem 2rem", textAlign: "center", maxWidth: "560px", margin: "0 auto" }}>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "clamp(1.35rem, 3vw, 1.85rem)", fontWeight: 800, color: "#2C2C2A", lineHeight: 1.2 }}>
          No te dice qué está bien en general.
        </h2>
        <p style={{ margin: "0 0 2rem", color: "#5F5E5A", fontSize: "1rem", lineHeight: 1.65 }}>
          Te dice qué está bien <strong style={{ color: "#185FA5" }}>para vos</strong>.
        </p>
        <Link href="/register" style={{
          display: "inline-block", padding: "14px 3rem", borderRadius: "10px",
          background: "#185FA5", color: "#FFFFFF",
          fontSize: "1rem", fontWeight: 700, textDecoration: "none",
          boxShadow: "0 4px 20px rgba(24,95,165,0.25)",
        }}>
          Crear cuenta gratis
        </Link>
        <p style={{ margin: "1rem 0 0", color: "#B5D4F4", fontSize: "0.78rem" }}>
          Sin tarjeta de crédito · Gratis para empezar
        </p>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: "#FFFFFF", borderTop: "1px solid #B5D4F4",
        padding: "1.25rem 2rem", textAlign: "center",
      }}>
        <p style={{ margin: 0, color: "#888780", fontSize: "0.75rem" }}>
          VitalCross AI · Análisis nutricional personalizado con inteligencia artificial
        </p>
      </footer>

    </div>
  );
}