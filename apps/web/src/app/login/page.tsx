// apps/web/src/app/login/page.tsx
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
    <div style={{ minHeight: "100vh", background: "#F0F6FF", display: "flex", flexDirection: "column" }}>

      <nav style={{
        display: "flex",
        alignItems: "center",
        padding: "0.875rem 2rem",
        background: "#FFFFFF",
        borderBottom: "1px solid #B5D4F4",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <Image src="/Logo.png" alt="VitalCross AI" width={56} height={56} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: "15px", fontWeight: 600 }}>
            <span style={{ color: "#185FA5" }}>Vital</span>
            <span style={{ color: "#2C2C2A" }}>Cross AI</span>
          </span>
        </Link>
      </nav>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
        <div style={{
          width: "100%", maxWidth: "420px", background: "#FFFFFF",
          borderRadius: "16px", border: "1px solid #B5D4F4",
          boxShadow: "0 4px 24px rgba(24,95,165,0.08)", padding: "2.5rem 2rem",
        }}>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", marginBottom: "2rem" }}>
            <Image src="/Logo.png" alt="VitalCross AI" width={250} height={250} style={{ objectFit: "contain" }} priority />
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#2C2C2A" }}>Iniciar sesión</h1>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#5F5E5A" }}>Ingresá con tu cuenta de VitalCross AI</p>
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
                padding: "0.75rem 1rem", borderRadius: "8px", border: "1.5px solid #B5D4F4",
                fontSize: "0.95rem", color: "#2C2C2A", outline: "none",
                background: "#F8FBFF", width: "100%", boxSizing: "border-box",
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
                padding: "0.75rem 1rem", borderRadius: "8px", border: "1.5px solid #B5D4F4",
                fontSize: "0.95rem", color: "#2C2C2A", outline: "none",
                background: "#F8FBFF", width: "100%", boxSizing: "border-box",
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

          <div style={{ borderTop: "1px solid #E6F1FB", marginTop: "1.5rem", paddingTop: "1.25rem", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#5F5E5A" }}>
              ¿No tenés cuenta?{" "}
              <Link href="/register" style={{ color: "#185FA5", fontWeight: 600, textDecoration: "none" }}>
                Crear cuenta gratis
              </Link>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}