"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function NavbarWrapper({ isOnboarding = false }: { isOnboarding?: boolean }) {
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <>
      <style>{`.nav-title-p{font-size:15px;font-weight:700;text-decoration:none}@media(max-width:540px){.nav-title-p{font-size:13px}}`}</style>
      <nav style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "0.3rem 1.25rem", background: "#FFFFFF", borderBottom: "1px solid #B5D4F4", position: "sticky", top: 0, zIndex: 50, gap: "8px" }}>

        {/* IZQUIERDA */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {isOnboarding ? (
            <span className="nav-title-p">
              <span style={{ color: "#185FA5" }}>Vital</span><span style={{ color: "#2C2C2A" }}>Cross AI</span>
            </span>
          ) : (
            <Link href="/dashboard" className="nav-title-p">
              <span style={{ color: "#185FA5" }}>Vital</span><span style={{ color: "#2C2C2A" }}>Cross AI</span>
            </Link>
          )}
        </div>

        {/* CENTRO */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          {isOnboarding ? (
            <Image src="/Logo.png" alt="VitalCross AI" width={100} height={100} style={{ objectFit: "contain", display: "block" }} />
          ) : (
            <Link href="/dashboard">
              <Image src="/Logo.png" alt="VitalCross AI" width={100} height={100} style={{ objectFit: "contain", display: "block" }} />
            </Link>
          )}
        </div>

        {/* DERECHA */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "4px" }}>
          {isOnboarding ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              style={{ padding: "6px 14px", borderRadius: "8px", border: "1.5px solid #B5D4F4", background: "transparent", color: "#5F5E5A", fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0, cursor: signingOut ? "not-allowed" : "pointer", opacity: signingOut ? 0.6 : 1 }}
            >
              {signingOut ? "Saliendo..." : "Cerrar sesion"}
            </button>
          ) : (
            <Link href="/dashboard" style={{ padding: "6px 14px", borderRadius: "8px", border: "1.5px solid #B5D4F4", background: "transparent", color: "#5F5E5A", fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0, textDecoration: "none" }}>
              Volver
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}