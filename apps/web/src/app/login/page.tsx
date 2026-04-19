import Image from "next/image";
import Link from "next/link";
import { signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl || "/dashboard";
  const hasError = params?.error === "CredentialsSignin" || params?.error === "credentials";

  async function googleSignIn() {
    "use server";
    await signIn("google", { redirectTo: callbackUrl });
  }

  async function credentialsSignIn(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
      await signIn("credentials", { email, password, redirectTo: callbackUrl });
    } catch {
      redirect("/login?error=CredentialsSignin");
    }
  }

  return (
    <>
      <style>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          font-family: system-ui, sans-serif;
        }
        .login-branding {
          flex: 1;
          background: linear-gradient(160deg, #0C447C 0%, #185FA5 50%, #378ADD 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          padding: 4rem 5rem;
          position: relative;
          overflow: hidden;
        }
        .login-form-panel {
          width: 460px;
          flex-shrink: 0;
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3rem;
          border-left: 1px solid #B5D4F4;
        }
        @media (max-width: 768px) {
          .login-wrapper {
            flex-direction: column;
          }
          .login-branding {
            display: none;
          }
          .login-form-panel {
            width: 100%;
            border-left: none;
            padding: 2rem 1.5rem;
            justify-content: flex-start;
            padding-top: 3rem;
          }
        }
      `}</style>

      <div className="login-wrapper">

        {/* PANEL IZQUIERDO — Branding */}
        <div className="login-branding">
          <div style={{
            position: "absolute", top: "-80px", right: "-80px",
            width: "320px", height: "320px", borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }} />
          <div style={{
            position: "absolute", bottom: "-60px", left: "-60px",
            width: "240px", height: "240px", borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }} />

          <div style={{
            marginBottom: "2.5rem", position: "relative", zIndex: 1,
            width: "100px", height: "100px", borderRadius: "24px",
            background: "rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Image src="/Logo.png" alt="VitalCross AI" width={280} height={280}
              style={{ objectFit: "contain" }} priority />
          </div>

          <h1 style={{
            margin: "0 0 1rem", fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.5px",
            lineHeight: 1.1, position: "relative", zIndex: 1,
          }}>
            Vital<span style={{ color: "#85B7EB" }}>Cross AI</span>
          </h1>

          <p style={{
            margin: "0 0 1.5rem", fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
            fontWeight: 500, color: "#B5D4F4", lineHeight: 1.4,
            position: "relative", zIndex: 1,
          }}>
            Tu nutrición, personalizada<br />según tu salud real.
          </p>

          <p style={{
            margin: "0 0 3rem", fontSize: "0.95rem",
            color: "rgba(255,255,255,0.7)", lineHeight: 1.75,
            maxWidth: "380px", position: "relative", zIndex: 1,
          }}>
            Analizá cualquier alimento considerando tus marcadores clínicos reales: colesterol, glucemia, función renal, medicamentos y más.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", position: "relative", zIndex: 1 }}>
            {["Análisis personalizado con IA", "Basado en tus estudios clínicos", "OCR automático de PDF de laboratorio"].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.8)" }}>{item}</span>
              </div>
            ))}
          </div>

          <p style={{
            position: "absolute", bottom: "2rem", left: "5rem",
            fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", margin: 0, zIndex: 1,
          }}>
            © 2026 VitalCross AI
          </p>
        </div>

        {/* PANEL DERECHO — Formulario */}
        <div className="login-form-panel">

          {/* Logo solo en mobile */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2rem" }}>
            <Image src="/Logo.png" alt="VitalCross AI" width={44} height={44} style={{ objectFit: "contain" }} />
            <span style={{ fontSize: "15px", fontWeight: 600 }}>
              <span style={{ color: "#185FA5" }}>Vital</span>
              <span style={{ color: "#2C2C2A" }}>Cross AI</span>
            </span>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ margin: "0 0 0.4rem", fontSize: "1.5rem", fontWeight: 700, color: "#2C2C2A" }}>
              Iniciar sesión
            </h2>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#5F5E5A" }}>
              ¿No tenés cuenta?{" "}
              <Link href="/register" style={{ color: "#185FA5", fontWeight: 600, textDecoration: "none" }}>
                Crear cuenta gratis
              </Link>
            </p>
          </div>

          {hasError && (
            <div style={{
              background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "8px",
              padding: "0.75rem 1rem", marginBottom: "1.25rem",
              fontSize: "0.875rem", color: "#991B1B", textAlign: "center",
            }}>
              Email o contraseña incorrectos. Intentá de nuevo.
            </div>
          )}

          <form action={credentialsSignIn} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#2C2C2A" }}>Email</label>
              <input type="email" name="email" required placeholder="tu@email.com" style={{
                padding: "0.75rem 1rem", borderRadius: "8px",
                border: "1.5px solid #B5D4F4", fontSize: "0.95rem",
                color: "#2C2C2A", outline: "none", background: "#F8FBFF",
                width: "100%", boxSizing: "border-box",
              }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#2C2C2A" }}>Contraseña</label>
                <Link href="/recuperar-contrasena" style={{ fontSize: "0.8rem", color: "#185FA5", textDecoration: "none" }}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input type="password" name="password" required placeholder="••••••••" style={{
                padding: "0.75rem 1rem", borderRadius: "8px",
                border: "1.5px solid #B5D4F4", fontSize: "0.95rem",
                color: "#2C2C2A", outline: "none", background: "#F8FBFF",
                width: "100%", boxSizing: "border-box",
              }} />
            </div>
            <button type="submit" style={{
              width: "100%", padding: "0.8rem", borderRadius: "8px",
              background: "#185FA5", color: "#FFFFFF", fontSize: "0.95rem",
              fontWeight: 600, border: "none", cursor: "pointer", marginTop: "0.25rem",
            }}>
              Iniciar sesión
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.25rem" }}>
            <div style={{ flex: 1, height: "1px", background: "#B5D4F4" }} />
            <span style={{ fontSize: "0.8rem", color: "#888780" }}>o</span>
            <div style={{ flex: 1, height: "1px", background: "#B5D4F4" }} />
          </div>

          <form action={googleSignIn}>
            <button type="submit" style={{
              width: "100%", padding: "0.8rem", borderRadius: "8px",
              background: "#FFFFFF", border: "1.5px solid #B5D4F4",
              fontSize: "0.95rem", fontWeight: 500, color: "#2C2C2A",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", gap: "10px",
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.807 31.657 29.314 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.156 7.961 3.039l5.657-5.657C33.491 5.095 28.973 3 24 3 12.955 3 4 11.955 4 23s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.817C14.651 16.018 18.961 13 24 13c3.059 0 5.842 1.156 7.961 3.039l5.657-5.657C33.491 5.095 28.973 3 24 3 16.318 3 9.656 7.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 43c5.241 0 9.735-1.737 12.98-4.712l-5.99-4.998C29.9 34.669 27.17 35 24 35c-5.29 0-9.768-3.317-11.396-7.946l-6.53 5.032C9.384 38.556 16.129 43 24 43z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303C34.617 31.657 30.124 35 24 35c-5.29 0-9.768-3.317-11.396-7.946l-6.53 5.032C9.384 38.556 16.129 43 24 43c8.837 0 16-7.163 16-16 0-1.341-.138-2.651-.389-3.917z"/>
              </svg>
              Continuar con Google
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "0.75rem" }}>
            <a href={`/api/auth/signin?provider=google&callbackUrl=${encodeURIComponent(callbackUrl)}`}
              style={{ fontSize: "0.8rem", color: "#378ADD", textDecoration: "none" }}>
              ¿Problemas? Probar inicio con enlace directo
            </a>
          </div>

        </div>
      </div>
    </>
  );
}