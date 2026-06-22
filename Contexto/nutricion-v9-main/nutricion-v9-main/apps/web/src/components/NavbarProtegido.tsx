"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

type ExtraLink = { label: string; href: string };

type NavItem =
  | { type: "link"; label: string; href: string }
  | { type: "dropdown"; label: string; items: { label: string; href: string }[] };

export default function NavbarProtegido({
  extraLinks,
  showSignOut = true,
}: {
  extraLinks?: ExtraLink[];
  showSignOut?: boolean;
}) {
  const [signingOut, setSigningOut] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  }

  function isActivePath(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  const navItems: NavItem[] = [
    {
      type: "dropdown",
      label: "Analizar",
      items: [
        { label: "Analizar alimentos", href: "/analizar" },
        { label: "Historial", href: "/historial" },
        { label: "Evolución", href: "/evolucion" },
      ],
    },
    { type: "link", label: "Ejercicios", href: "/ejercicios" },
    { type: "link", label: "Balance Calórico", href: "/balance" },
    {
      type: "dropdown",
      label: "Medicamentos",
      items: [
        { label: "Revisar medicamento", href: "/medicamentos" },
        { label: "Historial de medicamentos", href: "/historial-medicamentos" },
      ],
    },
  ];

  function isItemActive(item: NavItem) {
    if (item.type === "link") return isActivePath(item.href);
    return item.items.some(sub => isActivePath(sub.href));
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setOpenDropdown(null);
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <style>{`.nav-title{font-size:15px;font-weight:700;text-decoration:none}.nav-link{font-size:12px;font-weight:500;text-decoration:none;padding:5px 10px;border-radius:6px;border:1px solid transparent;white-space:nowrap;transition:all 0.15s}.nav-link:hover{color:#185FA5;border-color:#185FA5}.nav-link.active{color:#185FA5;border-color:#185FA5;background:#E6F1FB}.nav-trigger{font-size:12px;font-weight:500;text-decoration:none;padding:5px 10px;border-radius:6px;border:1px solid transparent;white-space:nowrap;transition:all 0.15s;background:transparent;cursor:pointer;display:inline-flex;align-items:center;gap:4px;font-family:inherit}.nav-trigger:hover{color:#185FA5;border-color:#185FA5}.nav-trigger.active{color:#185FA5;border-color:#185FA5;background:#E6F1FB}.nav-dropdown-panel{position:absolute;top:calc(100% + 4px);left:0;background:#FFFFFF;border:1px solid #B5D4F4;border-radius:8px;box-shadow:0 4px 16px rgba(24,95,165,0.14);padding:6px;min-width:190px;z-index:60}.nav-dropdown-item{display:block;padding:8px 12px;font-size:12px;font-weight:500;text-decoration:none;border-radius:6px;white-space:nowrap}.nav-dropdown-item:hover{background:#E6F1FB;color:#185FA5}.nav-extra-link{font-size:12px;font-weight:500;color:#5F5E5A;text-decoration:none;padding:5px 10px;border-radius:6px;border:1px solid #B5D4F4;background:transparent;white-space:nowrap}.nav-extra-link:hover{color:#185FA5;border-color:#185FA5}.nav-cerrar{}.nav-volver{}.nav-hamburger{display:none;background:transparent;border:1px solid #B5D4F4;border-radius:8px;padding:6px 10px;cursor:pointer;align-items:center;justify-content:center;flex-shrink:0}.nav-hamburger:hover{border-color:#185FA5}.nav-mobile-panel{position:absolute;top:100%;left:0;right:0;background:#FFFFFF;border-bottom:1px solid #B5D4F4;box-shadow:0 4px 16px rgba(24,95,165,0.1);padding:10px 16px 14px;display:flex;flex-direction:column;gap:2px;z-index:55}.nav-mobile-link{padding:9px 8px;font-size:13px;font-weight:500;color:#5F5E5A;text-decoration:none;border-radius:6px;background:transparent;border:none;text-align:left;cursor:pointer;font-family:inherit}.nav-mobile-link:hover{background:#E6F1FB;color:#185FA5}.nav-mobile-link.active{color:#185FA5;background:#E6F1FB}.nav-mobile-sub{padding-left:18px}.nav-mobile-section-label{padding:9px 8px 2px;font-size:11px;font-weight:700;color:#888780;text-transform:uppercase;letter-spacing:0.03em}@media(max-width:540px){.nav-title{font-size:13px}.nav-cerrar{display:none!important}.nav-link{display:none!important}.nav-trigger{display:none!important}.nav-extra-link{display:none!important}.nav-hamburger{display:flex!important}}`}</style>
      <nav ref={navRef} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "0.3rem 1.25rem", background: "#FFFFFF", borderBottom: "1px solid #B5D4F4", position: "sticky", top: 0, zIndex: 50, gap: "8px" }}>

        {/* IZQUIERDA */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Link href="/dashboard" className="nav-title">
            <span style={{ color: "#185FA5" }}>Vital</span><span style={{ color: "#2C2C2A" }}>Cross AI</span>
          </Link>

          {navItems.map(item => {
            if (item.type === "link") {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link${isActivePath(item.href) ? " active" : ""}`}
                  style={{ color: isActivePath(item.href) ? "#185FA5" : "#5F5E5A" }}
                >
                  {item.label}
                </Link>
              );
            }

            const active = isItemActive(item);
            const open = openDropdown === item.label;

            return (
              <div key={item.label} style={{ position: "relative" }}>
                <button
                  type="button"
                  className={`nav-trigger${active ? " active" : ""}`}
                  style={{ color: active ? "#185FA5" : "#5F5E5A" }}
                  onClick={() => setOpenDropdown(open ? null : item.label)}
                >
                  {item.label}
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {open && (
                  <div className="nav-dropdown-panel">
                    {item.items.map(sub => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="nav-dropdown-item"
                        style={{
                          color: isActivePath(sub.href) ? "#185FA5" : "#5F5E5A",
                          background: isActivePath(sub.href) ? "#E6F1FB" : "transparent",
                        }}
                        onClick={() => setOpenDropdown(null)}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

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

          <button
            type="button"
            className="nav-hamburger"
            aria-label="Abrir menu"
            onClick={() => setMobileOpen(prev => !prev)}
          >
            {mobileOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 3l12 12M15 3L3 15" stroke="#185FA5" strokeWidth="1.8" strokeLinecap="round" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="#185FA5" strokeWidth="1.8" strokeLinecap="round" /></svg>
            )}
          </button>
        </div>

        {/* MENU MOBILE */}
        {mobileOpen && (
          <div className="nav-mobile-panel">
            <Link href="/dashboard" className={`nav-mobile-link${pathname === "/dashboard" ? " active" : ""}`} onClick={() => setMobileOpen(false)}>
              Inicio
            </Link>

            <div className="nav-mobile-section-label">Analizar</div>
            <Link href="/analizar" className={`nav-mobile-link nav-mobile-sub${isActivePath("/analizar") ? " active" : ""}`} onClick={() => setMobileOpen(false)}>
              Analizar alimentos
            </Link>
            <Link href="/historial" className={`nav-mobile-link nav-mobile-sub${isActivePath("/historial") ? " active" : ""}`} onClick={() => setMobileOpen(false)}>
              Historial
            </Link>
            <Link href="/evolucion" className={`nav-mobile-link nav-mobile-sub${isActivePath("/evolucion") ? " active" : ""}`} onClick={() => setMobileOpen(false)}>
              Evolución
            </Link>

            <Link href="/ejercicios" className={`nav-mobile-link${isActivePath("/ejercicios") ? " active" : ""}`} onClick={() => setMobileOpen(false)}>
              Ejercicios
            </Link>

            <Link href="/balance" className={`nav-mobile-link${isActivePath("/balance") ? " active" : ""}`} onClick={() => setMobileOpen(false)}>
              Balance Calórico
            </Link>

            <div className="nav-mobile-section-label">Medicamentos</div>
            <Link href="/medicamentos" className={`nav-mobile-link nav-mobile-sub${isActivePath("/medicamentos") ? " active" : ""}`} onClick={() => setMobileOpen(false)}>
              Revisar medicamento
            </Link>
            <Link href="/historial-medicamentos" className={`nav-mobile-link nav-mobile-sub${isActivePath("/historial-medicamentos") ? " active" : ""}`} onClick={() => setMobileOpen(false)}>
              Historial de medicamentos
            </Link>

            {extraLinks?.map(l => (
              <Link key={l.href} href={l.href} className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
                {l.label}
              </Link>
            ))}

            {showSignOut && (
              <button type="button" onClick={handleSignOut} disabled={signingOut} className="nav-mobile-link">
                {signingOut ? "Saliendo..." : "Cerrar sesion"}
              </button>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
