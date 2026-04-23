"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function NuevaContrasenaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Escuchar el evento de recuperacion de contrasena
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setSessionReady(true);
          setChecking(false);
        } else if (event === "SIGNED_IN" && session) {
          setSessionReady(true);
          setChecking(false);
        }
      }
    );

    // Timeout: si en 3 segundos no hay sesion, mostrar error
    const timeout = setTimeout(() => {
      setChecking(false);
      setSessionReady(false);
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Las contrasenas no coinciden");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await supabase.auth.signOut();
    router.push("/login?mensaje=contrasena-actualizada");
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
          Nueva contrasena
        </h1>
        <p style={{ margin: "0 0 2rem", fontSize: "0.9rem", color: "#5F5E5A", textAlign: "center" }}>
          Ingresa tu nueva contrasena
        </p>

        {checking ? (
          <p style={{ textAlign: "center", color: "#5F5E5A", fontSize: "0.9rem" }}>
            Verificando sesion...
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {!sessionReady && !error && (
              <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "8px", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#991B1B" }}>
                El link de recuperacion es invalido o expiro.{" "}
                <Link href="/recuperar-contrasena" style={{ color: "#991B1B", fontWeight: 600 }}>
                  Solicitar uno nuevo
                </Link>
              </div>
            )}
            {error && (
              <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "8px", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#991B1B" }}>
                {error}
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#2C2C2A", marginBottom: "6px" }}>
                Nueva contrasena
              </label>
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 6 caracteres"
                disabled={!sessionReady}
                style={{
                  width: "100%", padding: "0.75rem 1rem", borderRadius: "8px",
                  border: "1.5px solid #B5D4F4", fontSize: "0.95rem", color: "#2C2C2A",
                  background: sessionReady ? "#F8FBFF" : "#F0F0F0", outline: "none", boxSizing: "border-box" as const,
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#2C2C2A", marginBottom: "6px" }}>
                Confirmar contrasena
              </label>
              <input
                type="password" required value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeti la contrasena"
                disabled={!sessionReady}
                style={{
                  width: "100%", padding: "0.75rem 1rem", borderRadius: "8px",
                  border: "1.5px solid #B5D4F4", fontSize: "0.95rem", color: "#2C2C2A",
                  background: sessionReady ? "#F8FBFF" : "#F0F0F0", outline: "none", boxSizing: "border-box" as const,
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !sessionReady}
              style={{
                padding: "0.875rem", borderRadius: "8px",
                background: loading || !sessionReady ? "#378ADD" : "#185FA5", color: "#FFFFFF",
                fontSize: "0.95rem", fontWeight: 700, border: "none",
                cursor: loading || !sessionReady ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Guardando..." : "Guardar nueva contrasena"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}