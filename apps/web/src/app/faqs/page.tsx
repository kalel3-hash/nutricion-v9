"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const faqs = [
  {
    q: "Que es VitalCross AI?",
    a: "VitalCross AI es una plataforma digital de analisis nutricional que evalua como distintos alimentos pueden impactar en tu salud teniendo en cuenta tus datos personales y analisis clinicos reales.\n\nA diferencia de los consejos nutricionales generales que se ven en internet o redes sociales, VitalCross AI analiza cada alimento segun tu contexto individual, porque un mismo alimento no afecta igual a todas las personas.",
  },
  {
    q: "VitalCross AI da consejos medicos o reemplaza al medico?",
    a: "No. VitalCross AI no da consejos medicos ni reemplaza la consulta con profesionales de la salud.\n\nLa plataforma brinda informacion orientativa y educativa, basada en la interpretacion de datos clinicos y evidencia cientifica, para ayudarte a comprender mejor como ciertos alimentos pueden relacionarse con tu estado de salud.\n\nLas decisiones medicas, diagnosticos, tratamientos o cambios terapeuticos deben realizarse siempre con un medico o profesional de la salud matriculado.",
    highlight: true,
  },
  {
    q: "En que se diferencia VitalCross AI de un plan nutricional tradicional?",
    a: "Los planes nutricionales tradicionales suelen estar basados en reglas generales que no siempre consideran la situacion clinica individual.\n\nVitalCross AI no ofrece dietas genericas ni planes cerrados. En cambio, analiza cada alimento cruzando informacion clinica concreta: valores de laboratorio, condiciones de salud, medicacion y objetivos personales.\n\nEsto permite entender por que un alimento puede ser adecuado para una persona y no tanto para otra.",
  },
  {
    q: "Que informacion utiliza VitalCross AI para realizar los analisis?",
    a: "VitalCross AI utiliza datos que vos decides cargar:\n\n• Analisis clinicos de laboratorio\n• Datos personales (edad, peso, altura, sexo)\n• Condiciones de salud declaradas\n• Medicacion actual\n\nCon esta informacion, la IA evalua alimentos dentro de un contexto personalizado, siempre con un enfoque informativo y no medico.",
  },
  {
    q: "Por que un alimento puede ser recomendable para unos y no para otros?",
    a: "Porque cada cuerpo es diferente.\n\nFactores como la glucemia, el colesterol, la funcion renal, la resistencia a la insulina o ciertas patologias hacen que un mismo alimento sea recomendable para algunas personas, deba consumirse con moderacion por otras, o este desaconsejado en determinados contextos.\n\nVitalCross AI ayuda a interpretar esas diferencias.",
  },
  {
    q: "En que se basan los analisis de VitalCross AI?",
    a: "Los analisis se apoyan en:\n\n• Evidencia cientifica disponible\n• Criterios nutricionales aceptados\n• Interpretacion contextual de datos clinicos\n\nAdemas, VitalCross AI utiliza inteligencia artificial para procesar grandes volumenes de informacion, algo que representa una evolucion respecto a los enfoques nutricionales tradicionales.",
  },
  {
    q: "Por que el uso de inteligencia artificial es una evolucion en nutricion?",
    a: "La inteligencia artificial permite analizar multiples variables al mismo tiempo, algo dificil de hacer manualmente.\n\nVitalCross AI cruza informacion clinica, nutricional y cientifica para generar analisis personalizados, de forma rapida y accesible.\n\nEsto no reemplaza al profesional de la salud, pero mejora la comprension y el acceso a informacion relevante, ayudando a tomar decisiones mas conscientes.",
  },
  {
    q: "Que pasa con mis datos personales y clinicos?",
    a: "Tus datos son tratados con confidencialidad y unicamente se utilizan para generar los analisis dentro de la plataforma.\n\nVitalCross AI no vende ni comparte informacion personal con terceros. El uso de la plataforma implica aceptar sus politicas de privacidad y terminos de uso.",
  },
  {
    q: "Para quien esta pensada la plataforma?",
    a: "VitalCross AI esta pensada para personas interesadas en entender mejor como su alimentacion se relaciona con su salud.\n\nNo esta destinada a diagnostico ni tratamiento medico, sino a quienes buscan informacion personalizada para conversar mejor con profesionales y tomar decisiones mas informadas.",
  },
];

function FaqItem({ q, a, highlight = false }: { q: string; a: string; highlight?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderRadius: "12px",
        border: highlight ? "1.5px solid #185FA5" : "1px solid #B5D4F4",
        background: open ? (highlight ? "#E6F1FB" : "#F8FBFF") : "#FFFFFF",
        marginBottom: "0.75rem",
        overflow: "hidden",
        transition: "box-shadow 0.2s",
        boxShadow: open ? "0 4px 16px rgba(24,95,165,0.1)" : "0 1px 4px rgba(24,95,165,0.04)",
      }}
    >
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "center", padding: "1.1rem 1.4rem",
          background: "transparent", border: "none", cursor: "pointer",
          textAlign: "left", gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
          {highlight && (
            <span style={{
              fontSize: "0.65rem", fontWeight: 700, color: "#185FA5",
              background: "#E6F1FB", border: "1px solid #B5D4F4",
              borderRadius: "20px", padding: "2px 8px", whiteSpace: "nowrap", flexShrink: 0,
            }}>IMPORTANTE</span>
          )}
          <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#2C2C2A", lineHeight: 1.4 }}>{q}</span>
        </div>
        <div style={{
          width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
          background: open ? "#185FA5" : "#E6F1FB",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d={open ? "M2 8l4-4 4 4" : "M2 4l4 4 4-4"}
              stroke={open ? "#FFFFFF" : "#185FA5"}
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>
      {open && (
        <div style={{ padding: "0 1.4rem 1.25rem" }}>
          <div style={{ width: "100%", height: "1px", background: "#E6F1FB", marginBottom: "1rem" }} />
          {a.split("\n\n").map((paragraph, i) => (
            <p key={i} style={{
              margin: "0 0 0.75rem", fontSize: "0.9rem",
              color: "#5F5E5A", lineHeight: 1.75,
              whiteSpace: "pre-line",
            }}>{paragraph}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FaqsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F0F6FF", fontFamily: "system-ui, sans-serif" }}>

      {/* NAVBAR */}
      <nav style={{
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center", padding: "0.4rem 1.25rem",
        background: "#FFFFFF", borderBottom: "1px solid #B5D4F4",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link href="/" style={{ fontSize: "15px", fontWeight: 700, textDecoration: "none" }}>
            <span style={{ color: "#185FA5" }}>Vital</span>
            <span style={{ color: "#2C2C2A" }}>Cross AI</span>
          </Link>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Link href="/">
            <Image src="/Logo.png" alt="VitalCross AI" width={80} height={80} style={{ objectFit: "contain", display: "block" }} />
          </Link>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <Link href="/login" style={{
            padding: "7px 16px", borderRadius: "8px", border: "1.5px solid #185FA5",
            color: "#185FA5", fontSize: "13px", fontWeight: 500, textDecoration: "none",
          }}>Iniciar sesion</Link>
          <Link href="/register" style={{
            padding: "7px 16px", borderRadius: "8px",
            background: "#185FA5", color: "#FFFFFF",
            fontSize: "13px", fontWeight: 500, textDecoration: "none",
          }}>Crear cuenta</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        background: "linear-gradient(135deg, #0C447C 0%, #185FA5 60%, #378ADD 100%)",
        padding: "3.5rem 2rem 3rem", textAlign: "center",
      }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{
            display: "inline-block", background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)", borderRadius: "20px",
            padding: "4px 14px", fontSize: "0.7rem", fontWeight: 700,
            color: "rgba(255,255,255,0.85)", letterSpacing: "0.8px",
            marginBottom: "1.25rem", textTransform: "uppercase",
          }}>
            Centro de ayuda
          </div>
          <h1 style={{
            margin: "0 0 1rem", color: "#FFFFFF", fontWeight: 800,
            fontSize: "clamp(1.6rem, 4vw, 2.5rem)", lineHeight: 1.15,
          }}>
            Preguntas frecuentes sobre VitalCross AI
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.8)", fontSize: "0.95rem",
            maxWidth: "480px", margin: "0 auto", lineHeight: 1.75,
          }}>
            En VitalCross AI creemos que tomar decisiones informadas sobre la alimentacion es clave para la salud.
            Aca respondemos las preguntas mas comunes para que entiendas que hace la plataforma, como funciona y que no hace.
          </p>
        </div>
      </section>

      {/* FAQS */}
      <main style={{ maxWidth: "740px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          {faqs.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} highlight={faq.highlight} />
          ))}
        </div>

        {/* CIERRE */}
        <div style={{
          background: "linear-gradient(135deg, #0C447C 0%, #185FA5 100%)",
          borderRadius: "16px", padding: "2.5rem 2rem", textAlign: "center",
        }}>
          <p style={{
            margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 700,
            color: "#FFFFFF", lineHeight: 1.5,
          }}>
            VitalCross AI no busca decirte que hacer.
          </p>
          <p style={{
            margin: "0 0 1.75rem", fontSize: "0.9rem",
            color: "rgba(255,255,255,0.75)", lineHeight: 1.7,
          }}>
            Sino ayudarte a entender mejor tu propio cuerpo. La informacion es un primer paso para una relacion mas consciente con la alimentacion y la salud.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{
              padding: "12px 2rem", borderRadius: "8px",
              background: "#FFFFFF", color: "#185FA5",
              fontSize: "0.9rem", fontWeight: 700, textDecoration: "none",
            }}>
              Crear cuenta gratis
            </Link>
            <Link href="/login" style={{
              padding: "12px 2rem", borderRadius: "8px",
              border: "2px solid rgba(255,255,255,0.35)",
              background: "transparent", color: "#FFFFFF",
              fontSize: "0.9rem", fontWeight: 500, textDecoration: "none",
            }}>
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{
        background: "#FFFFFF", borderTop: "1px solid #B5D4F4",
        padding: "1.25rem 2rem", textAlign: "center",
      }}>
        <p style={{ margin: 0, color: "#888780", fontSize: "0.75rem" }}>
          VitalCross AI · Analisis nutricional personalizado con inteligencia artificial
        </p>
      </footer>

    </div>
  );
}