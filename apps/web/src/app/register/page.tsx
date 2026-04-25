"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
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
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Error al crear la cuenta.");
        return;
      }

      setSuccess(true);
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Error de conexión. Intentá nuevamente.");
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
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    border: "1.5px solid #B5D4F4",
    fontSize: "0.95rem",
    color: "#2C2C2A",
    outline: "none",
    background: "#F8FBFF",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#2C2C2A",
    marginBottom: "6px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0F6FF" }}>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0.875rem 2rem",
          background: "#FFFFFF",
          borderBottom: "1px solid #B5D4F4",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
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
        </Link>
      </nav>

      <main
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 65px)",
          padding: "2rem 1rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid #B5D4F4",
            boxShadow: "0 4px 24px rgba(24,95,165,0.08)",
            padding: "2.5rem 2rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              marginBottom: "2rem",
            }}
          >
            <Image
              src="/Logo.png"
              alt="VitalCross AI"
              width={120}
              height={120}
              style={{ objectFit: "contain" }}
              priority
            />
            <h1
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#2C2C2A",
              }}
            >
              Crear cuenta
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "#5F5E5A",
              }}
            >
              Registrate para continuar
            </p>
          </div>

          {success ? (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  background: "#EAF3DE",
                  border: "1px solid #C0DD97",
                  borderRadius: "8px",
                  padding: "1rem",
                  marginBottom: "1.25rem",
                  fontSize: "0.875rem",
                  color: "#27500A",
                }}
              >
                Cuenta creada exitosamente. Ya podés iniciar sesión.
              </div>
              <Link
                href="/login"
                style={{
                  display: "block",
                  padding: "0.8rem",
                  borderRadius: "8px",
                  background: "#185FA5",
                  color: "#FFFFFF",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                Ir a iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div
                  style={{
                    background: "#FEE2E2",
                    border: "1px solid #FECACA",
                    borderRadius: "8px",
                    padding: "0.75rem 1rem",
                    marginBottom: "1.25rem",
                    fontSize: "0.875rem",
                    color: "#991B1B",
                    textAlign: "center",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading || loading}
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  borderRadius: "8px",
                  background: "#FFFFFF",
                  border: "1.5px solid #B5D4F4",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  color: "#2C2C2A",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  marginBottom: "1.25rem",
                  opacity: googleLoading || loading ? 0.6 : 1,
                }}
              >
                {googleLoading ? "Redirigiendo..." : "Continuar con Google"}
              </button>

              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
              >
                <div>
                  <label style={labelStyle}>Nombre completo</label>
                  <input
                    style={inputStyle}
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    style={inputStyle}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Contraseña</label>
                  <input
                    style={inputStyle}
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Confirmar contraseña</label>
                  <input
                    style={inputStyle}
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    borderRadius: "8px",
                    background: loading ? "#378ADD" : "#185FA5",
                    color: "#FFFFFF",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? "Creando cuenta..." : "Crear cuenta"}
                </button>
              </form>

              <div
                style={{
                  borderTop: "1px solid #E6F1FB",
                  marginTop: "1.5rem",
                  paddingTop: "1.25rem",
                  textAlign: "center",
                }}
              >
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#5F5E5A" }}>
                  ¿Ya tenés cuenta?{" "}
                  <Link
                    href="/login"
                    style={{
                      color: "#185FA5",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Iniciar sesión
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}