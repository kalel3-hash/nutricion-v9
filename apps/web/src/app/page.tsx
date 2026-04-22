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
            Tocá para ver más →
          </p>
        </div>
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

function IconFacebook() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function IconTikTok() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
    </svg>
  );
}

function IconEmail() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

const socialStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  width: "34px", height: "34px", borderRadius: "8px",
  background: "#E6F1FB", color: "#185FA5",
  textDecoration: "none", flexShrink: 0,
  transition: "background 0.18s",
};

function SocialLinkExterno({ href, title, children }: { href: string; title: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" title={title} style={socialStyle} onMouseEnter={e => (e.currentTarget.style.background = "#B5D4F4")} onMouseLeave={e => (e.currentTarget.style.background = "#E6F1FB")}>{children}</a>;
}

function SocialLinkEmail({ href, title, children }: { href: string; title: string; children: React.ReactNode }) {
  return <a href={href} title={title} style={socialStyle} onMouseEnter={e => (e.currentTarget.style.background = "#B5D4F4")} onMouseLeave={e => (e.currentTarget.style.background = "#E6F1FB")}>{children}</a>;
}

export default function HomePage() {
  const [contrastFlipped, setContrastFlipped] = useState<number | null>(null);
  const [stepsFlipped, setStepsFlipped] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: "#F0F6FF", fontFamily: "system-ui, sans-serif" }}>

      <style>{`
        .nav-title { font-size: 15px; font-weight: 700; }
        @media (max-width: 480px) {
          .nav-title { font-size: 13px; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        padding: "0.55rem 1.25rem",
        background: "#FFFFFF",
        borderBottom: "1px solid #B5D4F4",
        position: "sticky", top: 0, zIndex: 50,
        gap: "8px",
      }}>

        {/* IZQUIERDA — Título */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="nav-title">
            <span style={{ color: "#185FA5" }}>Vital</span>
            <span style={{ color: "#2C2C2A" }}>Cross AI</span>
          </span>
        </div>

        {/* CENTRO — Logo grande */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Image
            src="/Logo.png"
            alt="VitalCross AI"
            width={62}
            height={62}
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* DERECHA — Redes sociales */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "6px" }}>
          <SocialLinkExterno href="https://www.facebook.com/Vitalcrossai" title="Facebook">
            <IconFacebook />
          </SocialLinkExterno>
          <SocialLinkExterno href="https://www.instagram.com/vitalcross_ai/" title="Instagram">
            <IconInstagram />
          </SocialLinkExterno>
          <SocialLinkExterno href="https://www.tiktok.com/@vitalcrossai" title="TikTok">
            <IconTikTok />
          </SocialLinkExterno>
          <SocialLinkEmail href="mailto:info@vitalcrossai.com.ar" title="Email: info@vitalcrossai.com.ar">
            <IconEmail />
          </SocialLinkEmail>
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
      <section style={{ padding: "3.5rem 1.5rem", maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "clamp(1.3rem, 3vw, 1.75rem)", fontWeight: 700, color: "#2C2C2A" }}>
            ¿Te suena familiar alguna de estas situaciones?
          </h2>
          <p style={{ margin: 0, color: "#888780", fontSize: "0.88rem" }}>
            Tocá cada tarjeta para entender qué puede estar pasando realmente.
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
        padding: "3.5rem 1.5rem",
      }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ margin: "0 0 0.4rem", fontSize: "clamp(1.3rem, 3vw, 1.75rem)", fontWeight: 700, color: "#FFFFFF" }}>
              ¿Cómo funciona?
            </h2>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: "0.88rem" }}>
              Tocá cada paso para ver los detalles.
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
      <section style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
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