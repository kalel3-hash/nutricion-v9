"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const contrastCards = [
  {
    front: { icon: "😓", text: '"Hago todo bien y los resultados no llegan"' },
    back: "Factores metabólicos como la forma en que tu cuerpo procesa la energía pueden influir en cómo respondés a ciertos enfoques alimentarios. No siempre es una cuestión de esfuerzo.",
  },
  {
    front: { icon: "😓", text: '"Elijo alimentos saludables y aun así no me siento bien"' },
    back: '"Saludable" no significa lo mismo para todas las personas. Algunos alimentos comúnmente recomendados pueden no ser los más adecuados según el contexto personal.',
  },
  {
    front: { icon: "😓", text: '"Seguí un consejo nutricional y no me resultó adecuado"' },
    back: "Los consejos generales no siempre contemplan situaciones individuales. El contexto personal puede ser clave al interpretar una recomendación.",
  },
  {
    front: { icon: "😓", text: '"Probé muchos planes y ninguno fue sostenible"' },
    back: "Muchas estrategias no consideran datos personales reales. VitalCross analiza la información que ingresás para aportar contexto.",
  },
];

const steps = [
  {
    icon: "🔬",
    step: "1",
    title: "Cargás tus análisis clínicos",
    desc: "Subís un PDF o foto de laboratorio, o ingresás los valores manualmente.",
    back: "Datos como colesterol, glucemia u otros valores ayudan a contextualizar el análisis nutricional. La información se utiliza con fines orientativos.",
  },
  {
    icon: "🧬",
    step: "2",
    title: "Completás tu perfil de salud",
    desc: "Edad, peso, condiciones declaradas, medicación y objetivos personales.",
    back: "La plataforma cruza los datos que ingresás para generar un análisis personalizado. No existen perfiles iguales.",
  },
  {
    icon: "📸",
    step: "3",
    title: "Analizás cualquier alimento",
    desc: "Por texto libre, foto del plato o etiqueta nutricional.",
    back: "El alimento se evalúa en función de la información disponible y del contexto declarado. El resultado es informativo.",
  },
  {
    icon: "🎯",
    step: "4",
    title: "Recibís tu análisis personalizado",
    desc: "Puntaje orientativo, contexto nutricional y sugerencias informativas.",
    back: "El análisis busca ayudarte a comprender mejor la relación entre alimentos y tu situación particular, desde un enfoque educativo.",
  },
];

function FlipCard({
  front,
  back,
  flipped,
  onToggle,
  theme = "red",
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
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(0.4,0,0.2,1)",
          transform: flipped ? "rotateY(180deg)" : "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            borderRadius: "14px",
            background: isRed ? "#FFFFFF" : "rgba(255,255,255,0.09)",
            border: `1.5px solid ${isRed ? "#FECACA" : "rgba(255,255,255,0.18)"}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.25rem",
          }}
        >
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
            <p style={{ margin: "0 0 0.3rem", fontWeight: 700, fontSize: "0.88rem", color: "#FFFFFF", textAlign: "center" }}>
              {front.title}
            </p>
          )}
          {front.desc && (
            <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255,255,255,0.65)", textAlign: "center" }}>
              {front.desc}
            </p>
          )}
          {front.text && (
            <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#2C2C2A", textAlign: "center", fontStyle: "italic" }}>
              {front.text}
            </p>
          )}
          <p style={{ marginTop: "0.65rem", fontSize: "0.66rem", color: isRed ? "#B5D4F4" : "rgba(255,255,255,0.35)" }}>
            Tocá para ver más →
          </p>
        </div>

        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #185FA5 0%, #378ADD 100%)",
            transform: "rotateY(180deg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.25rem",
          }}
        >
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
      {/* HERO */}
      <section style={{
        background: "linear-gradient(135deg, #0C447C 0%, #185FA5 60%, #378ADD 100%)",
        padding: "4.5rem 2rem 4rem", textAlign: "center",
      }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <h1 style={{
            margin: "0 0 1.5rem", color: "#FFFFFF", fontWeight: 800,
            fontSize: "clamp(2rem, 5.5vw, 3.25rem)", lineHeight: 1.12,
          }}>
            La nutrición no funciona igual
            <br />para todas las personas.
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.9)", fontSize: "clamp(1rem, 2vw, 1.15rem)",
            maxWidth: "520px", margin: "0 auto 2.5rem", lineHeight: 1.75,
          }}>
            VitalCross AI brinda información nutricional personalizada en base a los datos que ingresás, para ayudarte a comprender cómo distintos alimentos se relacionan con tu contexto personal.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{
              padding: "14px 2.5rem", borderRadius: "10px",
              background: "#FFFFFF", color: "#185FA5",
              fontSize: "1rem", fontWeight: 700, textDecoration: "none",
            }}>
              Empezar ahora
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

          <p style={{ marginTop: "1rem", color: "rgba(255,255,255,0.45)", fontSize: "0.78rem" }}>
            Información orientativa · No reemplaza la consulta profesional
          </p>
        </div>
      </section>

      {/* CONTRASTE */}
      <section style={{ padding: "3.5rem 1.5rem", maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#2C2C2A" }}>
            ¿Te sentiste identificado con alguna de estas situaciones?
          </h2>
          <p style={{ color: "#888780", fontSize: "0.88rem" }}>
            Tocá cada tarjeta para ver cómo el contexto puede cambiar la interpretación.
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
      </section>

      {/* CÓMO FUNCIONA */}
      <section style={{
        background: "linear-gradient(135deg, #0C447C 0%, #185FA5 100%)",
        padding: "3.5rem 1.5rem",
      }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#FFFFFF" }}>
              ¿Cómo funciona?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.88rem" }}>
              Un proceso claro y orientativo, paso a paso.
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
    </div>
  );
}