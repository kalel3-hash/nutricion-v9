"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Email o contrasena incorrectos. Intenta de nuevo.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Error de conexion. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <>
      <style>{`
        .login-wrapper { min-height: 100vh; display: flex; font-family: system-ui, sans-serif; }
        .login-branding {
          flex: 1;
          background: linear-gradient(160deg, #0C447C 0%, #185FA5 50%, #378ADD 100%);
          display: flex; flex-direction: column; justify-content: center;
          align-items: flex-start; padding: 4rem 5rem;
          position: relative; overflow: hidden;
        }
        .login-form-panel {
          width: 460px; flex-shrink: 0; background: #FFFFFF;
          display: flex; flex-direction: column; justify-content: center;
          padding: 3rem; border-left: 1px solid #B5D4F4;
        }
        @media (max-width: 768px) {
          .login-wrapper { flex-direction: column; }
          .login-branding { display: none; }
          .login-form-panel { width: 100%; border-left: none; padding: 2rem 1.5rem; justify-content: flex-start; padding-top: 3rem; }
        }
      `}</style>

      <div className="login-wrapper">

        {/* PANEL IZQUIERDO */}
        <div className="login-branding">
          <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "320px", height: "320px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "240px", height: "240px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

          <div style={{ marginBottom: "2.5rem", position: "relative", zIndex: 1, width: "100px", height: "100px", borderRadius: "24px", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Image src="/Logo.png" alt="VitalCross AI" width={280} height={280} style={{ objectFit: "contain" }} priority />
          </div>

          <h1 style={{ margin: "0 0 1rem", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.5px", lineHeight: 1.1, position: "relative", zIndex: 1 }}>
            Vital<span style={{ color: "#85B7EB" }}>Cross AI</span>
          </h1>

          <p style={{ margin: "0 0 1.5rem", fontSize: "clamp(1.1rem, 2vw, 1.35rem)", fontWeight: 500, color: "#B5D4F4", lineHeight: 1.4, position: "relative", zIndex: 1 }}>
            Tu nutricion, personalizada<br />segun tu salud real.
          </p>

          <p style={{ margin: "0 0 3rem", fontSize: "0.95rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.75, maxWidth: "380px", position: "relative", zIndex: 1 }}>
            Analiza cualquier alimento considerando tus marcadores clinicos reales: colesterol, glucemia, funcion renal, medicamentos y mas.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", position: "relative", zIndex: 1 }}>
            {["Analisis personalizado con IA", "Basado en tus estudios clinicos", "OCR automatico de PDF de laboratorio"].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.8)" }}>{item}</span>
              </div>
            ))}
          </div>

          <p style={{ position: "absolute", bottom: "2rem", left: "5rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", margin: 0, zIndex: 1 }}>
            2026 VitalCross AI
          </p>
        </div>

        {/* PANEL DERECHO */}
        <div className="login-form-panel">

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2rem" }}>
            <Image src="/Logo.png" alt="VitalCross AI" width={44} height={44} style={{ objectFit: "contain" }} />
            <span style={{ fontSize: "15px", fontWeight: 600 }}>
              <span style={{ color: "#185FA5" }}>Vital</span>
              <span style={{ color: "#2C2C2A" }}>Cross AI</span>
            </span>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ margin: "0 0 0.4rem", fontSize: "1.5rem", fontWeight: 700, color: "#2C2C2A" }}>Iniciar sesion</h2>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#5F5E5A" }}>
              No tenes cuenta?{" "}
              <Link href="/register" style={{ color: "#185FA5", fontWeight: 600, textDecoration: "none" }}>Crear cuenta gratis</Link>
            </p>
          </div>

          {error && (
            <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1.25rem", fontSize: "0.875rem", color: "#991B1B", textAlign: "center" }}>
              {error}
            </div>
          )}

          {/* GOOGLE */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            style={{
              width: "100%", padding: "0.875rem", borderRadius: "8px",
              background: "#FFFFFF", border: "1.5px solid #B5D4F4",
              fontSize: "0.95rem", fontWeight: 600, color: "#2C2C2A",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "1.25rem",
              opacity: googleLoading ? 0.6 : 1,
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.807 31.657 29.314 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.156 7.961 3.039l5.657-5.657C33.491 5.095 28.973 3 24 3 12.955 3 4 11.955 4 23s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.817C14.651 16.018 18.961 13 24 13c3.059 0 5.842 1.156 7.961 3.039l5.657-5.657C33.491 5.095 28.973 3 24 3 16.318 3 9.656 7.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 43c5.241 0 9.735-1.737 12.98-4.712l-5.99-4.998C29.9 34.669 27.17 35 24 35c-5.29 0-9.768-3.317-11.396-7.946l-6.53 5.032C9.384 38.556 16.129 43 24 43z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303C34.617 31.657 30.124 35 24 35c-5.29 0-9.768-3.317-11.396-7.946l-6.53 5.032C9.384 38.556 16.129 43 24 43c8.837 0 16-7.163 16-16 0-1.341-.138-2.651-.389-3.917z"/>
            </svg>
            {googleLoading ? "Redirigiendo..." : "Continuar con Google"}
          </button>

          {/* DIVISOR */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.25rem" }}>
            <div style={{ flex: 1, height: "1px", background: "#B5D4F4" }} />
            <span style={{ fontSize: "0.8rem", color: "#888780" }}>o inicia con tu cuenta</span>
            <div style={{ flex: 1, height: "1px", background: "#B5D4F4" }} />
          </div>

          {/* FORMULARIO */}
          <form onSubmit={handleCredentials} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#2C2C2A" }}>Email</label>
              <input
                type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                style={{ padding: "0.75rem 1rem", borderRadius: "8px", border: "1.5px solid #B5D4F4", fontSize: "0.95rem", color: "#2C2C2A", outline: "none", background: "#F8FBFF", width: "100%", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#2C2C2A" }}>Contrasena</label>
                <Link href="/recuperar-contrasena" style={{ fontSize: "0.8rem", color: "#185FA5", textDecoration: "none" }}>
                  Olvidaste tu contrasena?
                </Link>
              </div>
              <input
                type="password" required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ padding: "0.75rem 1rem", borderRadius: "8px", border: "1.5px solid #B5D4F4", fontSize: "0.95rem", color: "#2C2C2A", outline: "none", background: "#F8FBFF", width: "100%", boxSizing: "border-box" }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", background: loading ? "#378ADD" : "#185FA5", color: "#FFFFFF", fontSize: "0.95rem", fontWeight: 600, border: "none", cursor: loading ? "not-allowed" : "pointer", marginTop: "0.25rem", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Iniciando sesion..." : "Iniciar sesion"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}git add .
