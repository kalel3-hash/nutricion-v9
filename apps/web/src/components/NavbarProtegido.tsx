"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { signOut } from "next-auth/react";

function IconFacebook() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#1877F2"/>
      <path d="M22 16C22 12.686 19.314 10 16 10C12.686 10 10 12.686 10 16C10 18.994 12.04 21.504 14.813 22.203V18H13V16H14.813V14.5C14.813 12.726 15.884 11.75 17.5 11.75C18.274 11.75 19.063 11.891 19.063 11.891V13.625H18.19C17.328 13.625 17.063 14.15 17.063 14.688V16H18.984L18.672 18H17.063V22.203C19.836 21.504 22 18.994 22 16Z" fill="white"/>
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ig" x1="0" y1="32" x2="32" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFDB2C"/>
          <stop offset="25%" stopColor="#FF7A00"/>
          <stop offset="50%" stopColor="#FF0069"/>
          <stop offset="75%" stopColor="#D300C5"/>
          <stop offset="100%" stopColor="#7638FA"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#ig)"/>
      <rect x="9" y="9" width="14" height="14" rx="4" stroke="white" strokeWidth="1.8" fill="none"/>
      <circle cx="16" cy="16" r="3.5" stroke="white" strokeWidth="1.8" fill="none"/>
      <circle cx="20.5" cy="11.5" r="1" fill="white"/>
    </svg>
  );
}

function IconTikTok() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#010101"/>
      <path d="M21.5 10.5C20.8 10.5 20.167 10.233 19.7 9.8C19.233 9.367 18.967 8.733 18.967 8H16.9V19.333C16.9 20.4 16.033 21.267 14.967 21.267C13.9 21.267 13.033 20.4 13.033 19.333C13.033 18.267 13.9 17.4 14.967 17.4C15.167 17.4 15.367 17.433 15.533 17.5V15.4C15.367 15.367 15.167 15.333 14.967 15.333C12.767 15.333 11 17.1 11 19.333C11 21.567 12.767 23.333 14.967 23.333C17.167 23.333 18.933 21.567 18.933 19.333V13.733C19.733 14.333 20.733 14.7 21.8 14.7V12.633C21.8 12.633 21.5 10.5 21.5 10.5Z" fill="white"/>
      <path d="M21.5 10.5C20.8 10.5 20.167 10.233 19.7 9.8C19.233 9.367 18.967 8.733 18.967 8H16.9V19.333C16.9 20.4 16.033 21.267 14.967 21.267C13.9 21.267 13.033 20.4 13.033 19.333C13.033 18.267 13.9 17.4 14.967 17.4C15.167 17.4 15.367 17.433 15.533 17.5V15.4C15.367 15.367 15.167 15.333 14.967 15.333C12.767 15.333 11 17.1 11 19.333C11 21.567 12.767 23.333 14.967 23.333C17.167 23.333 18.933 21.567 18.933 19.333V13.733C19.733 14.333 20.733 14.7 21.8 14.7V12.633" fill="#EE1D52"/>
      <path d="M15.533 15.4V17.5C15.367 17.433 15.167 17.4 14.967 17.4C13.9 17.4 13.033 18.267 13.033 19.333C13.033 20.4 13.9 21.267 14.967 21.267C16.033 21.267 16.9 20.4 16.9 19.333V8H18.967C18.967 8.733 19.233 9.367 19.7 9.8" fill="#69C9D0"/>
    </svg>
  );
}

function IconEmail() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#185FA5"/>
      <rect x="7" y="10" width="18" height="13" rx="2" stroke="white" strokeWidth="1.6" fill="none"/>
      <path d="M7 13l9 5.5 9-5.5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

const ss: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "8px", textDecoration: "none", flexShrink: 0, transition: "opacity 0.18s" };

function SE({ href, title, children }: { href: string; title: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" title={title} style={ss} onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")} onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>{children}</a>;
}
function SM({ href, title, children }: { href: string; title: string; children: React.ReactNode }) {
  return <a href={href} title={title} style={ss} onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")} onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>{children}</a>;
}

export default function NavbarProtegido() {
  const [signingOut, setSigningOut] = useState(false);
  async function handleSignOut() {
    setSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  }
  return (
    <>
      <style>{`.nav-title{font-size:15px;font-weight:700;text-decoration:none}@media(max-width:540px){.nav-title{font-size:13px}.nav-cerrar{display:none!important}}`}</style>
      <nav style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "0.4rem 1.25rem", background: "#FFFFFF", borderBottom: "1px solid #B5D4F4", position: "sticky", top: 0, zIndex: 50, gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link href="/dashboard" className="nav-title">
            <span style={{ color: "#185FA5" }}>Vital</span><span style={{ color: "#2C2C2A" }}>Cross AI</span>
          </Link>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Link href="/dashboard">
            <Image src="/Logo.png" alt="VitalCross AI" width={80} height={80} style={{ objectFit: "contain", display: "block" }} />
          </Link>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px" }}>
          <SE href="https://www.facebook.com/Vitalcrossai" title="Facebook"><IconFacebook /></SE>
          <SE href="https://www.instagram.com/vitalcross_ai/" title="Instagram"><IconInstagram /></SE>
          <SE href="https://www.tiktok.com/@vitalcrossai" title="TikTok"><IconTikTok /></SE>
          <SM href="mailto:info@vitalcrossai.com.ar" title="Email: info@vitalcrossai.com.ar"><IconEmail /></SM>
          <div style={{ width: "1px", height: "20px", background: "#B5D4F4", margin: "0 2px", flexShrink: 0 }} />
          <button type="button" onClick={handleSignOut} disabled={signingOut} className="nav-cerrar" style={{ padding: "6px 14px", borderRadius: "8px", border: "1.5px solid #B5D4F4", background: "transparent", color: "#5F5E5A", fontSize: "12px", fontWeight: 500, cursor: signingOut ? "not-allowed" : "pointer", opacity: signingOut ? 0.6 : 1, whiteSpace: "nowrap", flexShrink: 0 }}>
            {signingOut ? "Saliendo..." : "Cerrar sesion"}
          </button>
        </div>
      </nav>
    </>
  );
}