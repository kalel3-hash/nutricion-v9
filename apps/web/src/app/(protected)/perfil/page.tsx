import { auth } from "@/auth";
import Link from "next/link";
import Image from "next/image";
import PerfilFormClient from "./PerfilFormClient";

export default async function PerfilPage() {
  const session = await auth();
  const user = session?.user;

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
        <Link href="/dashboard" style={{
          padding: "7px 18px",
          borderRadius: "8px",
          border: "1.5px solid #B5D4F4",
          background: "transparent",
          color: "#5F5E5A",
          fontSize: "13px",
          fontWeight: 500,
          textDecoration: "none",
        }}>
          ← Volver
        </Link>
      </nav>

      {/* ── CONTENIDO ── */}
      <main style={{ maxWidth: "700px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ margin: "0 0 0.3rem", fontSize: "1.5rem", fontWeight: 700, color: "#2C2C2A" }}>
            Perfil de salud
          </h1>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#5F5E5A" }}>
            {user?.email ?? ""}
          </p>
        </div>

        <PerfilFormClient />
      </main>
    </div>
  );
}