"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const contrastCards = [
  {
    front: { icon: "📱", label: "Lo que dice internet", text: '"El pan engorda"' },
    back: "Tu glucemia, peso y actividad determinan si el pan es un problema para vos — o no. Para muchas personas, es perfectamente adecuado.",
  },
  {
    front: { icon: "📱", label: "Lo que dice internet", text: '"Comé más proteína"' },
    back: "¿Tenés función renal comprometida? Más proteína puede ser perjudicial. Sin saber tu creatinina, ese consejo puede hacerte daño.",
  },
  {
    front: { icon: "📱", label: "Lo que dice internet", text: '"La fruta es saludable"' },
    back: "Para alguien con diabetes, algunas frutas elevan más la glucemia que un caramelo. Depende de tu HbA1c y tu contexto real.",
  },
  {
    front: { icon: "📱", label: "Lo que dice internet", text: '"Evitá las grasas"' },
    back: "Las grasas buenas son esenciales. Depende de tu colesterol HDL, tu perfil lipídico y tus objetivos personales.",
  },
];

const steps = [
  { icon: "🔬", step: "1", title: "Cargás tus análisis clínicos", desc: "Subís un PDF o foto de laboratorio y la IA extrae los valores automáticamente. O los ingresás a mano." },
  { icon: "🧬", step: "2", title: "Completás tu perfil de salud", desc: "Edad, peso, condiciones médicas, medicación y objetivos. Lo que hace única tu situación." },
  { icon: "📸", step: "3", title: "Analizás cualquier alimento", desc: "Por texto libre, foto del plato o foto de la etiqueta nutricional. En segundos." },
  { icon: "🎯", step: "4", title: "Recibís tu análisis personalizado", desc: "Puntaje, impacto en tus valores clínicos, sugerencias concretas y fuentes científicas." },
];

export default function HomePage() {
  const [flipped, setFlipped] = useState<number | null>(null);

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
        padding: "4rem 2rem 3.5rem", textAlign: "center",
      }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>

          <div style={{
            display: "inline-block", background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)", borderRadius: "20px",
            padding: "5px 16px", fontSize: "0.72rem", fontWeight: 700,
            color: "rgba(255,255,255,0.85)", letterSpacing: "0.8px",
            marginBottom: "1.5rem", textTransform: "uppercase",
          }}>
            Nutrición personalizada con IA
          </div>

          <h1 style={{
            margin: "0 0 1.25rem", color: "#FFFFFF", fontWeight: 800,
            fontSize: "clamp(2rem, 5.5vw, 3.25rem)", lineHeight: 1.1, letterSpacing: "-0.5px",
          }}>
            ¿Te dijeron que el arroz engorda?
            <br />
            <span style={{ color: "#85B7EB" }}>Depende de tu cuerpo.</span>
            <br />
            <span style={{ fontSize: "0.65em", fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>
              No de una tendencia de Instagram.
            </span>
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.85)", fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
            maxWidth: "540px", margin: "0 auto 2.25rem", lineHeight: 1.75,
          }}>
            VitalCross AI analiza lo que comés usando tus análisis clínicos reales.
            No modas. No generalidades. <strong style={{ color: "#FFFFFF" }}>Tu salud, tu respuesta.</strong>
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{
              padding: "14px 2.5rem", borderRadius: "10px",
              background: "#FFFFFF", color: "#185FA5",
              fontSize: "1rem", fontWeight: 700, textDecoration: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
            }}>
              Analizá un alimento — es gratis
            </Link>
            <Link href="/login" style={{
              padding: "14px 2.25rem", borderRadius: "10px",
              border: "2px solid rgba(255,255,255,0.4)",
              background: "transparent", color: "#FFFFFF",
              fontSize: "1rem", fontWeight: 500, textDecoration: "none",
            }}>
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* CONTRASTE — Flip cards */}
      <section style={{ padding: "3.5rem 2rem", maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "clamp(1.3rem, 3vw, 1.75rem)", fontWeight: 700, color: "#2C2C2A" }}>
            Lo que ves en redes vs. la realidad de tu cuerpo
          </h2>
          <p style={{ margin: 0, color: "#888780", fontSize: "0.88rem" }}>
            Hacé click en cada tarjeta para ver la otra cara del consejo.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          {contrastCards.map((card, i) => (
            <div
              key={i}
              onClick={() => setFlipped(prev => prev === i ? null : i)}
              role="button"
              style={{ perspective: "1000px", cursor: "pointer", height: "180px" }}
            >
              <div style={{
                position: "relative", width: "100%", height: "100%",
                transformStyle: "preserve-3d",
                transition: "transform 0.55s cubic-bezier(0.4,0,0.2,1)",
                transform: flipped === i ? "rotateY(180deg)" : "none",
              }}>
                {/* FRENTE */}
                <div style={{
                  position: "absolute", width: "100%", height: "100%",
                  backfaceVisibility: "hidden", borderRadius: "14px",
                  background: "#FFFFFF", border: "1.5px solid #FECACA",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  padding: "1.25rem", boxSizing: "border-box",
                  boxShadow: "0 2px 12px rgba(153,27,27,0.06)",
                }}>
                  <span style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{card.front.icon}</span>
                  <span style={{
                    fontSize: "0.65rem", fontWeight: 700, color: "#991B1B",
                    textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem",
                  }}>{card.front.label}</span>
                  <p style={{
                    margin: 0, fontSize: "1rem", fontWeight: 700,
                    color: "#2C2C2A", textAlign: "center", lineHeight: 1.3,
                    fontStyle: "italic",
                  }}>{card.front.text}</p>
                  <p style={{ margin: "0.6rem 0 0", fontSize: "0.68rem", color: "#B5D4F4" }}>
                    Click para ver la realidad →
                  </p>
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
                  <span style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>🧬</span>
                  <p style={{
                    margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.93)",
                    textAlign: "center", lineHeight: 1.7,
                  }}>{card.back}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: "1.75rem", background: "#E6F1FB",
          border: "1px solid #85B7EB", borderRadius: "12px",
          padding: "1.25rem 1.5rem", textAlign: "center",
        }}>
          <p style={{ margin: 0, color: "#0C447C", fontSize: "0.95rem", fontWeight: 600, lineHeight: 1.6 }}>
            Sin conocer tus datos clínicos reales, cualquier consejo nutricional es una suposición.
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
            <p style={{ margin: 0, color: "rgba(255,255,255,0.65)", fontSize: "0.88rem" }}>
              Cuatro pasos simples para dejar atrás los consejos genéricos.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            {steps.map((s) => (
              <div key={s.step} style={{
                background: "rgba(255,255,255,0.09)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "14px", padding: "1.5rem",
                display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.75rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)", color: "#FFFFFF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.78rem", fontWeight: 800, flexShrink: 0,
                  }}>{s.step}</div>
                  <span style={{ fontSize: "1.4rem" }}>{s.icon}</span>
                </div>
                <p style={{ margin: 0, fontWeight: 700, color: "#FFFFFF", fontSize: "0.9rem", lineHeight: 1.3 }}>{s.title}</p>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.72)", fontSize: "0.82rem", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
          <h2 style={{
            margin: "0 0 0.75rem", fontWeight: 800, color: "#2C2C2A",
            fontSize: "clamp(1.4rem, 3.5vw, 2rem)", lineHeight: 1.2,
          }}>
            No te decimos qué comer.
          </h2>
          <p style={{ margin: "0 0 0.5rem", color: "#5F5E5A", fontSize: "1.05rem", lineHeight: 1.65 }}>
            Te mostramos cómo cada alimento impacta{" "}
            <strong style={{ color: "#185FA5" }}>en vos</strong>,
            basado en tus análisis clínicos reales.
          </p>
          <p style={{ margin: "0 0 2.25rem", color: "#888780", fontSize: "0.88rem" }}>
            Gratis para empezar. Sin tarjeta de crédito.
          </p>
          <Link href="/register" style={{
            display: "inline-block", padding: "15px 3rem", borderRadius: "10px",
            background: "#185FA5", color: "#FFFFFF",
            fontSize: "1.05rem", fontWeight: 700, textDecoration: "none",
            boxShadow: "0 4px 24px rgba(24,95,165,0.3)",
          }}>
            Crear cuenta gratis
          </Link>
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