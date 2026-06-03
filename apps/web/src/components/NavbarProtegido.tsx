"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

type ExtraLink = { label: string; href: string };

export default function NavbarProtegido({
  extraLinks,
  showSignOut = true,
}: {
  extraLinks?: ExtraLink[];
  showSignOut?: boolean;
}) {
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();

  async function handleSignOut() {
    setSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  }

  const navLinks = [
    { label: "Analizar", href: "/analizar" },
    { label: "Medicamentos", href: "/medicamentos" },
    { label: "Historial", href: "/historial" },
    { label: "Evolución", href: "/evolucion" },
  ];

  return (
    <>
      <style>{`.nav-title{font-size:15px;font-weight:700;text-decoration:none}.nav-link{font-size:12px;font-weight:500;text-decoration:none;padding:5px 10px;border-radius:6px;border:1px solid transparent;white-space:nowrap;transition:all 0.15s}.nav-link:hover{color:#185FA5;border-color:#185FA5}.nav-link.active{color:#185FA5;border-color:#185FA5;background:#E6F1FB}.nav-extra-link{font-size:12px;font-weight:500;color:#5F5E5A;text-decoration:none;padding:5px 10px;border-radius:6px;border:1px solid #B5D4F4;background:transparent;white-space:nowrap}.nav-extra-link:hover{color:#185FA5;border-color:#185FA5}.nav-cerrar{}.nav-volver{}@media(max-width:540px){.nav-title{font-size:13px}.nav-cerrar{display:none!important}.nav-link{display:none!important}.nav-extra-link{display:none!important}}`}</style>
      <nav style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "0.3rem 1.25rem", background: "#FFFFFF", borderBottom: "1px solid #B5D4F4", position: "sticky", top: 0, zIndex: 50, gap: "8px" }}>

        {/* IZQUIERDA */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Link href="/dashboard" className="nav-title">
            <span style={{ color: "#185FA5" }}>Vital</span><span style={{ color: "#2C2C2A" }}>Cross AI</span>
          </Link>
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link${pathname.startsWith(l.href) ? " active" : ""}`}
              style={{ color: pathname.startsWith(l.href) ? "#185FA5" : "#5F5E5A" }}
            >
              {l.label}
            </Link>
          ))}
          {extraLinks?.map(l => (
            <Link key={l.href} href={l.href} className="nav-extra-link">{l.label}</Link>
          ))}
        </div>

        {/* CENTRO */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Link href="/dashboard">
            <Image src="/Logo.png" alt="VitalCross AI" width={100} height={100} style={{ objectFit: "contain", display: "block" }} />
          </Link>
        </div>

        {/* DERECHA */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "4px" }}>
          {showSignOut ? (
            <button type="button" onClick={handleSignOut} disabled={signingOut} className="nav-cerrar" style={{ padding: "6px 14px", borderRadius: "8px", border: "1.5px solid #B5D4F4", background: "transparent", color: "#5F5E5A", fontSize: "12px", fontWeight: 500, cursor: signingOut ? "not-allowed" : "pointer", opacity: signingOut ? 0.6 : 1, whiteSpace: "nowrap", flexShrink: 0 }}>
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