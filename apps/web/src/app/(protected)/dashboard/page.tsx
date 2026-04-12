"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { signOut } from "next-auth/react";

const cards = [
  { icon: "🧬", title: "Perfil de salud", subtitle: "Cargá tus datos clínicos", href: "/perfil" },
  { icon: "🥗", title: "Analizar alimento", subtitle: "Describí o fotografiá un alimento", href: "/analizar" },
  { icon: "📈", title: "Mi evolución", subtitle: "Ver historial y gráficos", href: "/evolucion" },
] as const;

const steps = [
  {
    step: "1",
    title: "Cargá tu perfil clínico",
    desc: "Ingresá tus marcadores de laboratorio: colesterol, glucemia, HbA1c, función renal y más. También podés subir un PDF y la IA los extrae automáticamente.",
  },
  {
    step: "2",
    title: "Analizá un alimento",
    desc: "Describí o fotografiá cualquier alimento. La IA lo evalúa en función de tu perfil real y te da un puntaje personalizado del 1 al 10.",
  },
  {
    step: "3",
    title: "Seguí tu evolución",
    desc: "Consultá tu historial de análisis, visualizá tendencias y tomá mejores decisiones sobre tu alimentación con el tiempo.",
  },
];

export default function DashboardPage() {
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F0F6FF" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.875rem 2rem",
        background: "#FFFFFF",
        borderBottom: "1px solid #B5D4F4",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <Image src="/Logo.png" alt="VitalCross AI" width={56} height={56} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: "15px", fontWeight: 600 }}>
            <span style={{ color: "#185FA5" }}>Vital</span>
            <span style={{ color: "#2C2C2A" }}>Cross AI</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          style={{
            padding: "7px 18px",
            borderRadius: "8px",
            border: "1.5px solid #B5D4F4",
            background: "transparent",
            color: "#5F5E5A",
            fontSize: "13px",
            fontWeight: 500,
            cursor: signingOut ? "not-allowed" : "pointer",
            opacity: signingOut ? 0.6 : 1,
          }}
        >
          {signingOut ? "Saliendo…" : "Cerrar sesión"}
        </button>
      </nav>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 1.5rem" }}>

        {/* Saludo */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ margin: "0 0 0.4rem", fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 700, color: "#2C2C2A" }}>
            Bienvenido a <span style={{ color: "#185FA5" }}>VitalCross AI</span>
          </h1>
          <p style={{ margin: 0, fontSize: "0.95rem", color: "#5F5E5A" }}>
            ¿Qué querés hacer hoy?
          </p>
        </div>

        {/* ── TARJETAS COMPACTAS ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.875rem", marginBottom: "3rem" }}>
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "0.875rem",
                background: "#FFFFFF",
                borderRadius: "10px",
                border: "1px solid #B5D4F4",
                boxShadow: "0 2px 8px rgba(24, 95, 165, 0.06)",
                padding: "0.875rem 1.25rem",
                textDecoration: "none",
                flex: "1 1 200px",
                maxWidth: "270px",
                transition: "box-shadow 0.15s, border-color 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 16px rgba(24, 95, 165, 0.14)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#378ADD";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 8px rgba(24, 95, 165, 0.06)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#B5D4F4";
              }}
            >
              <span style={{ fontSize: "1.6rem", flexShrink: 0 }} aria-hidden>{card.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: "0 0 0.15rem", fontSize: "0.9rem", fontWeight: 700, color: "#2C2C2A" }}>
                  {card.title}
                </h2>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#5F5E5A", lineHeight: 1.4 }}>
                  {card.subtitle}
                </p>
              </div>
              <svg style={{ flexShrink: 0 }} width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="#185FA5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          ))}
        </div>

        {/* ── CÓMO FUNCIONA ── */}
        <div style={{ borderTop: "1px solid #B5D4F4", paddingTop: "2.5rem" }}>
          <h2 style={{ margin: "0 0 1.75rem", fontSize: "1.15rem", fontWeight: 700, color: "#2C2C2A" }}>
            ¿Cómo funciona VitalCross AI?
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.75rem" }}>
            {steps.map((item) => (
              <div key={item.step} style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: "#E6F1FB", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "0.875rem", fontWeight: 700, color: "#185FA5",
                }}>
                  {item.step}
                </div>
                <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#2C2C2A" }}>
                  {item.title}
                </h3>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#5F5E5A", lineHeight: 1.65 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}