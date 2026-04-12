import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F0F6FF", fontFamily: "system-ui, sans-serif" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        background: "#FFFFFF",
        borderBottom: "1px solid #B5D4F4",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        {/* Logo + nombre */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Image
            src="/Logo.png"
            alt="VitalCross AI"
            width={56}
            height={56}
            style={{ objectFit: "contain" }}
          />
          <span style={{ fontSize: "15px", fontWeight: 600 }}>
            <span style={{ color: "#185FA5" }}>Vital</span>
            <span style={{ color: "#2C2C2A" }}>Cross AI</span>
          </span>
        </div>

        {/* Botones de acceso */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link href="/login" style={{
            padding: "7px 18px",
            borderRadius: "8px",
            border: "1.5px solid #185FA5",
            background: "transparent",
            color: "#185FA5",
            fontSize: "13px",
            fontWeight: 500,
            textDecoration: "none",
          }}>
            Iniciar sesión
          </Link>
          <Link href="/register" style={{
            padding: "7px 18px",
            borderRadius: "8px",
            border: "none",
            background: "#185FA5",
            color: "#FFFFFF",
            fontSize: "13px",
            fontWeight: 500,
            textDecoration: "none",
          }}>
            Crear cuenta gratis
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <main style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 65px)",
        padding: "3rem 2rem",
        textAlign: "center",
      }}>

        {/* Logo grande */}
        <div style={{
          width: "260px",
          height: "260px",
          background: "#FFFFFF",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.75rem",
          border: "2px solid #B5D4F4",
          boxShadow: "0 4px 24px rgba(24, 95, 165, 0.12)",
        }}>
          <Image
            src="/Logo.png"
            alt="VitalCross AI"
            width={210}
            height={210}
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        {/* Título */}
        <h1 style={{
          margin: "0 0 0.75rem",
          fontSize: "clamp(2rem, 6vw, 3rem)",
          fontWeight: 700,
          letterSpacing: "-0.5px",
          lineHeight: 1.1,
        }}>
          <span style={{ color: "#185FA5" }}>Vital</span>
          <span style={{ color: "#2C2C2A" }}>Cross AI</span>
        </h1>

        {/* Subtítulo principal */}
        <p style={{
          color: "#444441",
          fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
          maxWidth: "480px",
          margin: "0 0 0.6rem",
          lineHeight: 1.65,
        }}>
          Tu análisis nutricional personalizado basado en tu perfil de salud
        </p>

        {/* Descripción secundaria */}
        <p style={{
          color: "#5F5E5A",
          fontSize: "0.9rem",
          maxWidth: "440px",
          margin: "0 0 2.5rem",
          lineHeight: 1.6,
        }}>
          Analizá alimentos según tu perfil clínico real. Colesterol, glucemia, medicamentos y más.
        </p>

        {/* Botones CTA */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
          maxWidth: "340px",
        }}>
          <Link href="/register" style={{
            display: "block",
            padding: "13px 2rem",
            borderRadius: "10px",
            background: "#185FA5",
            color: "#FFFFFF",
            fontSize: "1rem",
            fontWeight: 600,
            textDecoration: "none",
            textAlign: "center",
          }}>
            Crear cuenta gratis
          </Link>
          <Link href="/login" style={{
            display: "block",
            padding: "13px 2rem",
            borderRadius: "10px",
            background: "#FFFFFF",
            border: "1.5px solid #185FA5",
            color: "#185FA5",
            fontSize: "1rem",
            fontWeight: 500,
            textDecoration: "none",
            textAlign: "center",
          }}>
            Ya tengo cuenta
          </Link>
        </div>

        {/* Footer mínimo */}
        <p style={{
          color: "#888780",
          fontSize: "0.75rem",
          marginTop: "2.5rem",
          letterSpacing: "0.3px",
        }}>
          VitalCross AI · Análisis clínico con inteligencia artificial
        </p>

      </main>
    </div>
  );
}