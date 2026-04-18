"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";

const flipCards = [
  {
    step: "1", icon: "🧬", title: "Cargá tu perfil clínico",
    desc: "Ingresá tus marcadores de laboratorio: colesterol, glucemia, HbA1c, función renal y más. También podés subir un PDF y la IA los extrae automáticamente.",
  },
  {
    step: "2", icon: "🥗", title: "Analizá un alimento",
    desc: "Describí o fotografiá cualquier alimento. La IA lo evalúa en función de tu perfil real y te da un puntaje personalizado del 1 al 10.",
  },
  {
    step: "3", icon: "📈", title: "Seguí tu evolución",
    desc: "Consultá tu historial de análisis, visualizá tendencias y tomá mejores decisiones sobre tu alimentación con el tiempo.",
  },
];

export default function DashboardPage() {
  const [signingOut, setSigningOut] = useState(false);
  const [flipped, setFlipped] = useState<number | null>(null);
  const [profileStatus, setProfileStatus] = useState<"loading" | "completo" | "incompleto">("loading");
  const [usage, setUsage] = useState<{ daily_used: number; daily_limit: number } | null>(null);
  const [avgScore, setAvgScore] = useState<number | null>(null);
  const [totalAnalysis, setTotalAnalysis] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => {
        const p = d.profile;
        setProfileStatus(p && p.full_name && p.age && p.weight_kg && p.height_cm ? "completo" : "incompleto");
      })
      .catch(() => setProfileStatus("incompleto"));

    fetch("/api/usage")
      .then(r => r.json())
      .then(d => setUsage({ daily_used: d.daily_used, daily_limit: d.daily_limit }))
      .catch(() => {});

    fetch("/api/history")
      .then(r => r.json())
      .then(d => {
        const items = d.history ?? [];
        const withScore = items.filter((h: any) => h.score !== null && h.score !== undefined);
        if (withScore.length > 0) {
          const avg = withScore.reduce((acc: number, h: any) => acc + h.score, 0) / withScore.length;
          setAvgScore(Math.round(avg * 10) / 10);
        }
        setTotalAnalysis(items.length);
      })
      .catch(() => {});
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  }

  const toggle = (i: number) => setFlipped(prev => prev === i ? null : i);

  const scoreColor = (s: number) => {
    if (s <= 3) return { text: "#991B1B", bg: "#FEE2E2", border: "#FECACA" };
    if (s <= 6) return { text: "#854F0B", bg: "#FAEEDA", border: "#FAC775" };
    return { text: "#27500A", bg: "#EAF3DE", border: "#C0DD97" };
  };

  const disponibles = usage ? usage.daily_limit - usage.daily_used : null;
  const usageColor = disponibles === null ? "#185FA5" : disponibles === 0 ? "#991B1B" : disponibles === 1 ? "#854F0B" : "#185FA5";

  const cards = [
    {
      icon: "🧬", title: "Perfil de salud", href: "/perfil",
      badge: profileStatus === "loading" ? null
        : profileStatus === "completo"
          ? { label: "Completo", bg: "#EAF3DE", border: "#C0DD97", text: "#27500A" }
          : { label: "Incompleto", bg: "#FAEEDA", border: "#FAC775", text: "#854F0B" },
      subtitle: profileStatus === "loading" ? "Cargando…"
        : profileStatus === "completo" ? "Tu perfil clínico está cargado"
        : "Completá tus datos clínicos",
    },
    {
      icon: "🥗", title: "Analizar alimento", href: "/analizar",
      badge: disponibles === null ? null
        : disponibles === 0
          ? { label: "Sin consultas hoy", bg: "#FEE2E2", border: "#FECACA", text: "#991B1B" }
          : { label: `${disponibles}/${usage?.daily_limit} disponibles hoy`, bg: "#E6F1FB", border: "#B5D4F4", text: usageColor },
      subtitle: disponibles === null ? "Cargando…"
        : disponibles === 0 ? "Límite diario alcanzado"
        : "Describí o fotografiá un alimento",
    },
    {
      icon: "📈", title: "Mi evolución", href: "/evolucion",
      badge: avgScore === null ? null : { ...scoreColor(avgScore), label: `Promedio: ${avgScore}/10` },
      subtitle: totalAnalysis === null ? "Cargando…"
        : totalAnalysis === 0 ? "Aún no tenés análisis"
        : `${totalAnalysis} análisis realizados`,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F0F6FF" }}>

      {/* NAVBAR */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0.875rem 2rem", background: "#FFFFFF",
        borderBottom: "1px solid #B5D4F4", position: "sticky", top: 0, zIndex: 50,
      }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <Image src="/Logo.png" alt="VitalCross AI" width={56} height={56} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: "15px", fontWeight: 600 }}>
            <span style={{ color: "#185FA5" }}>Vital</span>
            <span style={{ color: "#2C2C2A" }}>Cross AI</span>
          </span>
        </Link>
        <button type="button" onClick={handleSignOut} disabled={signingOut} style={{
          padding: "7px 18px", borderRadius: "8px", border: "1.5px solid #B5D4F4",
          background: "transparent", color: "#5F5E5A", fontSize: "13px",
          fontWeight: 500, cursor: signingOut ? "not-allowed" : "pointer", opacity: signingOut ? 0.6 : 1,
        }}>
          {signingOut ? "Saliendo…" : "Cerrar sesión"}
        </button>
      </nav>

      {/* MAIN */}
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 1.5rem" }}>

        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ margin: "0 0 0.4rem", fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 700, color: "#2C2C2A" }}>
            Bienvenido a <span style={{ color: "#185FA5" }}>VitalCross AI</span>
          </h1>
          <p style={{ margin: 0, fontSize: "0.95rem", color: "#5F5E5A" }}>¿Qué querés hacer hoy?</p>
        </div>

        {/* Tarjetas */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.875rem", marginBottom: "3rem" }}>
          {cards.map((card) => (
            <Link key={card.title} href={card.href} style={{
              display: "flex", flexDirection: "row", alignItems: "center",
              gap: "0.875rem", background: "#FFFFFF", borderRadius: "10px",
              border: "1px solid #B5D4F4", boxShadow: "0 2px 8px rgba(24,95,165,0.06)",
              padding: "0.875rem 1.25rem", textDecoration: "none",
              flex: "1 1 200px", maxWidth: "270px",
              transition: "box-shadow 0.15s, border-color 0.15s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 16px rgba(24,95,165,0.14)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#378ADD";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 8px rgba(24,95,165,0.06)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#B5D4F4";
              }}
            >
              <span style={{ fontSize: "1.6rem", flexShrink: 0 }}>{card.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.2rem", flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#2C2C2A" }}>{card.title}</h2>
                  {card.badge && (
                    <span style={{
                      fontSize: "0.68rem", fontWeight: 700, padding: "1px 7px",
                      borderRadius: "20px", background: card.badge.bg,
                      border: `1px solid ${card.badge.border}`, color: card.badge.text, whiteSpace: "nowrap",
                    }}>{card.badge.label}</span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#5F5E5A", lineHeight: 1.4 }}>{card.subtitle}</p>
              </div>
              <svg style={{ flexShrink: 0 }} width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="#185FA5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          ))}
        </div>

        {/* CÓMO FUNCIONA — Flip cards */}
        <div style={{ borderTop: "1px solid #B5D4F4", paddingTop: "2.5rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.15rem", fontWeight: 700, color: "#2C2C2A" }}>
            ¿Cómo funciona VitalCross AI?
          </h2>
          <p style={{ margin: "0 0 2rem", fontSize: "0.85rem", color: "#888780" }}>
            Hacé click en cada tarjeta para ver los detalles.
          </p>

          <style>{`
            .flip-card { perspective: 1000px; cursor: pointer; }
            .flip-inner {
              position: relative; width: 100%; height: 220px;
              transform-style: preserve-3d;
              transition: transform 0.55s cubic-bezier(0.4,0,0.2,1);
            }
            .flip-inner.flipped { transform: rotateY(180deg); }
            .flip-front, .flip-back {
              position: absolute; width: 100%; height: 100%;
              backface-visibility: hidden; border-radius: 14px;
              border: 1px solid #B5D4F4;
              display: flex; flex-direction: column;
              align-items: center; justify-content: center;
              padding: 1.75rem; box-sizing: border-box;
            }
            .flip-front { background: #FFFFFF; box-shadow: 0 2px 12px rgba(24,95,165,0.06); }
            .flip-back {
              background: linear-gradient(135deg, #185FA5 0%, #378ADD 100%);
              transform: rotateY(180deg);
              box-shadow: 0 4px 20px rgba(24,95,165,0.2);
            }
            .flip-card:hover .flip-front { border-color: #378ADD; box-shadow: 0 4px 20px rgba(24,95,165,0.14); }
          `}</style>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            {flipCards.map((card, i) => (
              <div key={card.step} className="flip-card" onClick={() => toggle(i)} role="button" aria-label={`Ver detalle: ${card.title}`}>
                <div className={`flip-inner${flipped === i ? " flipped" : ""}`}>
                  <div className="flip-front">
                    <div style={{
                      width: "56px", height: "56px", borderRadius: "50%",
                      background: "#E6F1FB", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "1.75rem", marginBottom: "1rem",
                    }}>{card.icon}</div>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: "#185FA5", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "0.8rem", fontWeight: 700,
                      color: "#FFFFFF", marginBottom: "0.75rem",
                    }}>{card.step}</div>
                    <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#2C2C2A", textAlign: "center", lineHeight: 1.3 }}>{card.title}</h3>
                    <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", color: "#888780", textAlign: "center" }}>Click para ver más</p>
                  </div>
                  <div className="flip-back">
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "50%",
                      background: "rgba(255,255,255,0.15)", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: "1.5rem", marginBottom: "1rem",
                    }}>{card.icon}</div>
                    <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF", textAlign: "center" }}>{card.title}</h3>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.85)", textAlign: "center", lineHeight: 1.65 }}>{card.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}