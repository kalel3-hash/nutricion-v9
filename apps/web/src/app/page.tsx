"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const contrastCards = [
  {
    front: { icon: "😓", text: '"Hago todo bien y no bajo de peso"' },
    back: "Tu glucemia o resistencia a la insulina pueden estar condicionando tus resultados sin que lo sepas. No es falta de voluntad.",
  },
  {
    front: { icon: "😓", text: '"Como sano pero me siento mal igual"' },
    back: '"Sano" es relativo. Algunos alimentos considerados saludables pueden no serlo para tu perfil específico de salud.',
  },
  {
    front: { icon: "😓", text: '"Me dijeron que comiera más proteína y me hizo mal"' },
    back: "Con función renal comprometida, más proteína puede ser dañina. El consejo era correcto — pero no era para vos.",
  },
  {
    front: { icon: "😓", text: '"Probé mil dietas y ninguna me duró"' },
    back: "Ninguna estaba basada en tus datos reales. VitalCross parte de tus análisis clínicos, no de una tendencia.",
  },
];

const steps = [
  {
    icon: "🔬", step: "1", title: "Cargás tus análisis clínicos",
    desc: "Subís un PDF o foto de laboratorio y la IA extrae los valores automáticamente. O los ingresás a mano.",
    back: "Colesterol, glucemia, HbA1c, función renal, triglicéridos, TSH y más. Todo lo que hace que tu situación sea única.",
  },
  {
    icon: "🧬", step: "2", title: "Completás tu perfil de salud",
    desc: "Edad, peso, condiciones médicas, medicación y objetivos.",
    back: "VitalCross cruza todos tus datos para que el análisis sea 100% personalizado. No hay dos perfiles iguales.",
  },
  {
    icon: "📸", step: "3", title: "Analizás cualquier alimento",
    desc: "Por texto libre, foto del plato o foto de la etiqueta nutricional.",
    back: "La IA procesa el alimento en segundos y lo evalúa en función de tu perfil real. No hay respuesta genérica.",
  },
  {
    icon: "🎯", step: "4", title: "Recibís tu análisis personalizado",
    desc: "Puntaje, impacto en tus valores clínicos y sugerencias concretas.",
    back: "Sabés exactamente por qué ese alimento es bueno, neutro o desaconsejado para vos. Con fuentes científicas.",
  },
];

function FlipCard({
  front, back, flipped, onToggle, theme = "red",
}: {
  front: { icon: string; text?: string; step?: string; title?: string; desc?: string };
  back: string;
  flipped: boolean;
  onToggle: () => void;
  theme?: "red" | "blue";
}) {
  const isRed = theme === "red";
  return (
    <div onClick={onToggle} role="button" style={{ perspective: "1000px", cursor: "pointer", height: "190px" }}>
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
          background: isRed ? "#FFFFFF" : "rgba(255,255,255,0.09)",
          border: `1.5px solid ${isRed ? "#FECACA" : "rgba(255,255,255,0.18)"}`,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "1.25rem", boxSizing: "border-box",
          boxShadow: isRed ? "0 2px 12px rgba(153,27,27,0.06)" : "none",
        }}>
          {front.step && (
            <div style={{
              width: "26px", height: "26px", borderRadius: "50%",
              background: "rgba(255,255,255,0.2)", color: "#FFFFFF",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.75rem", fontWeight: 800, marginBottom: "0.5rem",
            }}>{front.step}</div>
          )}
          <span style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>{front.icon}</span>
          {front.title && (
            <p style={{ margin: "0 0 0.3rem", fontWeight: 700, fontSize: "0.88rem", color: "#FFFFFF", textAlign: "center", lineHeight: 1.3 }}>{front.title}</p>
          )}
          {front.desc && (
            <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255,255,255,0.65)", textAlign: "center", lineHeight: 1.5 }}>{front.desc}</p>
          )}
          {front.text && (
            <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#2C2C2A", textAlign: "center", lineHeight: 1.35, fontStyle: "italic" }}>{front.text}</p>
          )}
          <p style={{ margin: "0.65rem 0 0", fontSize: "0.66rem", color: isRed ? "#B5D4F4" : "rgba(255,255,255,0.35)", textAlign: "center" }}>
            Click para ver más →
          </p>
        </div>

        {/* DORSO */}
        <div style={{
          position: "absolute", width: "100%", height: "100%",
          backfaceVisibility: "hidden", borderRadius: "14px",
          background: "linear-gradient(135deg, #185FA5 0%, #378ADD 100%)",
          transform: "rotateY(180deg)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1.25rem", boxSizing: "border-box",
          boxShadow: "0 4px 20px rgba(24,95,165,0.3)",
        }}>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.93)", textAlign: "center", lineHeight: 1.72 }}>
            {back}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [contrastFlipped, setContrastFlipped] = useState<number | null>(null);
  const [stepsFlipped, setStepsFlipped] = useState<number | null>(null);

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
        padding: "4.5rem 2rem 4rem", textAlign: "center",
      }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <div style={{
            display: "inline-block", background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)", borderRadius: "20px",
            padding: "5px 16px", fontSize: "0.72rem", fontWeight: 700,
            color: "rgba(255,255,255,0.85)", letterSpacing: "0.8px",
            marginBottom: "1.75rem", textTransform: "uppercase",
          }}>
            Nutrición personalizada con IA
          </div>

          <h1 style={{
            margin: "0 0 1.5rem", color: "#FFFFFF", fontWeight: 800,
            fontSize: "clamp(2rem, 5.5vw, 3.25rem)", lineHeight: 1.12, letterSpacing: "-0.5px",
          }}>
            Seguiste la dieta.
            <br />Hiciste el esfuerzo.
            <br />
            <span style={{ color: "#85B7EB" }}>Y no funcionó.</span>
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.9)", fontSize: "clamp(1rem, 2vw, 1.15rem)",
            maxWidth: "520px", margin: "0 auto 1rem", lineHeight: 1.75, fontWeight: 500,
          }}>
            Quizás el problema no fue tu voluntad.
            <br />Fue que el consejo no era para vos.
          </p>

          <p style={{
            color: "rgba(255,255,255,0.7)", fontSize: "0.92rem",
            maxWidth: "500px", margin: "0 auto 2.5rem", lineHeight: 1.75,
          }}>
            Cada cuerpo responde distinto. VitalCross AI analiza cada alimento según tus análisis de laboratorio reales, tu medicación y tu contexto personal.{" "}
            <strong style={{ color: "#FFFFFF" }}>No es para todos. Es para vos.</strong>
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{
              padding: "14px 2.5rem", borderRadius: "10px",
              background: "#FFFFFF", color: "#185FA5",
              fontSize: "1rem", fontWeight: 700, textDecoration: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
            }}>
              Descubrí qué funciona para tu cuerpo
            </Link>
            <Link href="/login" style={{
              padding: "14px 2.25rem", borderRadius: "10px",
              border: "2px solid rgba(255,255,255,0.35)",
              background: "transparent", color: "#FFFFFF",
              fontSize: "1rem", fontWeight: 500, textDecoration: "none",
            }}>
              Ya tengo cuenta
            </Link>
          </div>
          <p style={{ margin: "1rem 0 0", color: "rgba(255,255,255,0.45)", fontSize: "0.78rem" }}>
            Gratis para empezar · Sin tarjeta de crédito
          </p>
        </div>
      </section>

      {/* CONTRASTE */}
      <section style={{ padding: "3.5rem 2rem", maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "clamp(1.3rem, 3vw, 1.75rem)", fontWeight: 700, color: "#2C2C2A" }}>
            ¿Te suena familiar alguna de estas situaciones?
          </h2>
          <p style={{ margin: 0, color: "#888780", fontSize: "0.88rem" }}>
            Hacé click en cada tarjeta para entender qué puede estar pasando realmente.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          {contrastCards.map((card, i) => (
            <FlipCard
              key={i}
              front={{ icon: card.front.icon, text: card.front.text }}
              back={card.back}
              flipped={contrastFlipped === i}
              onToggle={() => setContrastFlipped(prev => prev === i ? null : i)}
              theme="red"
            />
          ))}
        </div>

        <div style={{
          marginTop: "1.75rem", background: "#E6F1FB",
          border: "1px solid #85B7EB", borderRadius: "12px",
          padding: "1.25rem 1.5rem", textAlign: "center",
        }}>
          <p style={{ margin: 0, color: "#0C447C", fontSize: "0.95rem", fontWeight: 600, lineHeight: 1.65 }}>
            Sin conocer tus datos clínicos reales, cualquier consejo nutricional es una suposición.
            <br />
            <span style={{ fontWeight: 400, fontSize: "0.88rem" }}>VitalCross AI parte de tus análisis de laboratorio, no de tendencias.</span>
          </p>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section style={{
        background: "linear-gradient(135deg, #0C447C 0%, #185FA5 100%)",
        padding: "3.5rem 2rem",
      }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ margin: "0 0 0.4rem", fontSize: "clamp(1.3rem, 3vw, 1.75rem)", fontWeight: 700, color: "#FFFFFF" }}>
              ¿Cómo funciona?
            </h2>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: "0.88rem" }}>
              Hacé click en cada paso para ver los detalles.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            {steps.map((s, i) => (
              <FlipCard
                key={i}
                front={{ icon: s.icon, step: s.step, title: s.title, desc: s.desc }}
                back={s.back}
                flipped={stepsFlipped === i}
                onToggle={() => setStepsFlipped(prev => prev === i ? null : i)}
                theme="blue"
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <div style={{ maxWidth: "520px", margin: "0 auto" }}>
          <h2 style={{
            margin: "0 0 0.75rem", fontWeight: 800, color: "#2C2C2A",
            fontSize: "clamp(1.4rem, 3.5vw, 2rem)", lineHeight: 1.2,
          }}>
            No te decimos qué comer.
          </h2>
          <p style={{ margin: "0 0 2.25rem", color: "#5F5E5A", fontSize: "1rem", lineHeight: 1.75 }}>
            Te mostramos cómo cada alimento impacta{" "}
            <strong style={{ color: "#185FA5" }}>en vos</strong>,
            basado en tus análisis clínicos reales.
            <br />
            <span style={{ fontSize: "0.88rem", color: "#888780" }}>No es algo para todos. Es para el que la usa.</span>
          </p>
          <Link href="/register" style={{
            display: "inline-block", padding: "15px 3rem", borderRadius: "10px",
            background: "#185FA5", color: "#FFFFFF",
            fontSize: "1.05rem", fontWeight: 700, textDecoration: "none",
            boxShadow: "0 4px 24px rgba(24,95,165,0.3)",
          }}>
            Crear cuenta gratis
          </Link>
          <p style={{ margin: "1rem 0 0", color: "#B5D4F4", fontSize: "0.78rem" }}>
            Gratis para empezar · Sin tarjeta de crédito
          </p>
        </div>
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