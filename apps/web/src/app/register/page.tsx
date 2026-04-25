"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim() } },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data?.user && data.user.identities && data.user.identities.length === 0) {
        setError("Este email ya esta registrado. Intenta iniciar sesion.");
        return;
      }

      if (!data?.user) {
        setError("No se pudo crear la cuenta. Intenta de nuevo.");
        return;
      }

      setSuccess(true);
      setFullName(""); setEmail(""); setPassword(""); setConfirmPassword("");
    } catch (err: any) {
      setError(err?.message ?? "Error de conexion. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  const inputStyle = {
    width: "100%", padding: "0.75rem 1rem", borderRadius: "8px",
    border: "1.5px solid #B5D4F4", fontSize: "0.95rem", color: "#2C2C2A",
    outline: "none", background: "#F8FBFF", boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block", fontSize: "0.875rem", fontWeight: 500,
    color: "#2C2C2A", marginBottom: "6px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0F6FF" }}>

      <nav style={{ display: "flex", alignItems: "center", padding: "0.875rem 2rem", background: "#FFFFFF", borderBottom: "1px solid #B5D4F4" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <Image src="/Logo.png" alt="VitalCross AI" width={56} height={56} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: "15px", fontWeight: 600 }}>
            <span style={{ color: "#185FA5" }}>Vital</span>
            <span style={{ color: "#2C2C2A" }}>Cross AI</span>
          </span>
        </Link>
      </nav>

      <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 65px)", padding: "2rem 1rem" }}>
        <div style={{ width: "100%", maxWidth: "420px", background: "#FFFFFF", borderRadius: "16px", border: "1px solid #B5D4F4", boxShadow: "0 4px 24px rgba(24,95,165,0.08)", padding: "2.5rem 2rem" }}>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", marginBottom: "2rem" }}>
            <Image src="/Logo.png" alt="VitalCross AI" width={120} height={120} style={{ objectFit: "contain" }} priority />
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#2C2C2A" }}>Crear cuenta</h1>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#5F5E5A" }}>Registrate para continuar</p>
          </div>

          {success ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ background: "#EAF3DE", border: "1px solid #C0DD97", borderRadius: "8px", padding: "1rem", marginBottom: "1.25rem", fontSize: "0.875rem", color: "#27500A" }}>
                Cuenta creada exitosamente. Ya podes iniciar sesion.
              </div>
              <Link href="/login" style={{ display: "block", padding: "0.8rem", borderRadius: "8px", background: "#185FA5", color: "#FFFFFF", fontSize: "0.95rem", fontWeight: 600, textDecoration: "none", textAlign: "center" }}>
                Ir a iniciar sesion
              </Link>
            </div>
          ) : (
            <>
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
                style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", background: "#FFFFFF", border: "1.5px solid #B5D4F4", fontSize: "0.95rem", fontWeight: 500, color: "#2C2C2A", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "1.25rem", opacity: googleLoading || loading ? 0.6 : 1 }}
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
                <span style={{ fontSize: "0.8rem", color: "#888780" }}>o</span>
                <div style={{ flex: 1, height: "1px", background: "#B5D4F4" }} />
              </div>

              {/* FORMULARIO */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Nombre completo</label>
                  <input style={inputStyle} type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Tu nombre" />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input style={inputStyle} type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
                </div>
                <div>
                  <label style={labelStyle}>Contrasena</label>
                  <input style={inputStyle} type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimo 6 caracteres" />
                </div>
                <div>
                  <label style={labelStyle}>Confirmar contrasena</label>
                  <input style={inputStyle} type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeti la contrasena" />
                </div>
                <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", background: loading ? "#378ADD" : "#185FA5", color: "#FFFFFF", fontSize: "0.95rem", fontWeight: 600, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, marginTop: "0.25rem" }}>
                  {loading ? "Creando cuenta..." : "Crear cuenta"}
                </button>
              </form>

              <div style={{ borderTop: "1px solid #E6F1FB", marginTop: "1.5rem", paddingTop: "1.25rem", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#5F5E5A" }}>
                  Ya tenes cuenta?{" "}
                  <Link href="/login" style={{ color: "#185FA5", fontWeight: 600, textDecoration: "none" }}>Iniciar sesion</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}