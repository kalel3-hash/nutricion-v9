"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/nueva-contrasena` }
    );
    setLoading(false);
    if (resetError) { setError(resetError.message); return; }
    setSuccess(true);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F0F6FF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>

      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "2rem" }}>
        <Image src="/Logo.png" alt="VitalCross AI" width={48} height={48} style={{ objectFit: "contain" }} />
        <span style={{ fontSize: "18px", fontWeight: 700 }}>
          <span style={{ color: "#185FA5" }}>Vital</span>
          <span style={{ color: "#2C2C2A" }}>Cross AI</span>
        </span>
      </Link>

      <div style={{
        background: "#FFFFFF", borderRadius: "16px", border: "1px solid #B5D4F4",
        boxShadow: "0 4px 24px rgba(24,95,165,0.08)",
        padding: "2.5rem 2rem", width: "100%", maxWidth: "420px",
      }}>
        <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.4rem", fontWeight: 700, color: "#2C2C2A", textAlign: "center" }}>
          Recuperar contraseña
        </h1>
        <p style={{ margin: "0 0 2rem", fontSize: "0.9rem", color: "#5F5E5A", textAlign: "center", lineHeight: 1.6 }}>
          Ingresá tu email y te enviamos un link para restablecer tu contraseña
        </p>

        {success ? (
          <div style={{ textAlign: "center" }}>
            <div style={{
              background: "#EAF3DE", border: "1px solid #C0DD97", borderRadius: "12px",
              padding: "1.5rem", marginBottom: "1.5rem",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✓</div>
              <p style={{ margin: "0 0 0.5rem", fontWeight: 700, color: "#27500A", fontSize: "1rem" }}>Email enviado</p>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#27500A", lineHeight: 1.6 }}>
                Revisá tu bandeja de entrada y hacé click en el link que te enviamos.
              </p>
            </div>
            <Link href="/login" style={{
              display: "inline-block", padding: "0.75rem 1.5rem", borderRadius: "8px",
              background: "#185FA5", color: "#FFFFFF", fontWeight: 600,
              fontSize: "0.9rem", textDecoration: "none",
            }}>Volver al login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {error && (
              <div style={{
                background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "8px",
                padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#991B1B",
              }}>{error}</div>
            )}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#2C2C2A", marginBottom: "6px" }}>
                Email
              </label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                style={{
                  width: "100%", padding: "0.75rem 1rem", borderRadius: "8px",
                  border: "1.5px solid #B5D4F4", fontSize: "0.95rem", color: "#2C2C2A",
                  background: "#F8FBFF", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <button type="submit" disabled={loading} style={{
              padding: "0.875rem", borderRadius: "8px",
              background: loading ? "#378ADD" : "#185FA5", color: "#FFFFFF",
              fontSize: "0.95rem", fontWeight: 700, border: "none",
              cursor: loading ? "not-allowed" : "pointer",
            }}>
              {loading ? "Enviando…" : "Enviar link de recuperación"}
            </button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link href="/login" style={{ fontSize: "0.875rem", color: "#185FA5", textDecoration: "none", fontWeight: 500 }}>
            ← Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
}