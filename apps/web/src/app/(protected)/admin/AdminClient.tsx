"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Profile = {
  owner_id: string;
  owner_email: string;
  full_name?: string;
  created_at?: string;
  is_admin?: boolean;
  provider?: string;
  profile_complete?: boolean;
  age?: number;
  sex?: string;
  weight_kg?: number;
  height_cm?: number;
};

type HistoryItem = {
  owner_email: string;
  food_description?: string;
  score?: number;
  created_at?: string;
};

type UsageItem = {
  owner_email: string;
  daily_count?: number;
  monthly_count?: number;
  updated_at?: string;
};

type WaitlistItem = {
  id: string;
  email: string;
  created_at: string;
};

type Props = {
  profiles: Profile[];
  history: HistoryItem[];
  usage: UsageItem[];
  currentEmail: string;
  waitlist: WaitlistItem[];
};

const tabs = ["Resumen", "Usuarios", "Analisis", "Uso", "Waitlist"];

function StatCard({
  label,
  value,
  sub,
  color = "#185FA5",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "12px",
        border: "1px solid #B5D4F4",
        padding: "1.25rem 1.5rem",
        boxShadow: "0 2px 8px rgba(24,95,165,0.06)",
      }}
    >
      <p
        style={{
          margin: "0 0 0.4rem",
          fontSize: "0.75rem",
          color: "#888780",
          textTransform: "uppercase",
          letterSpacing: "0.4px",
        }}
      >
        {label}
      </p>
      <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color }}>
        {value}
      </p>
      {sub && (
        <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "#888780" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function GeminiBillingLink() {
  return (
    <a
      href="https://aistudio.google.com/usage"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.75rem",
        background: "#FFFFFF",
        borderRadius: "12px",
        border: "1px solid #B5D4F4",
        padding: "1rem 1.25rem",
        textDecoration: "none",
      }}
    >
      <div>
        <p style={{ margin: "0 0 0.2rem", fontSize: "0.85rem", fontWeight: 700, color: "#2C2C2A" }}>
          Consumo y costo de la API de Gemini
        </p>
        <p style={{ margin: 0, fontSize: "0.78rem", color: "#888780" }}>
          Se ve en el dashboard de Google AI Studio, no dentro de VitalCross AI
        </p>
      </div>
      <span
        style={{
          padding: "8px 16px",
          borderRadius: "8px",
          background: "#185FA5",
          color: "#FFFFFF",
          fontSize: "0.8rem",
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        Ver en Google AI Studio
      </span>
    </a>
  );
}

export default function AdminClient({
  profiles,
  history,
  usage,
  currentEmail,
  waitlist,
}: Props) {
  const [activeTab, setActiveTab] = useState("Resumen");
  const [searchUser, setSearchUser] = useState("");
  const [searchWaitlist, setSearchWaitlist] = useState("");
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  async function changeRole(userId: string, makeAdmin: boolean) {
    const ok = confirm(
      makeAdmin
        ? "Confirmas hacer admin a este usuario?"
        : "Confirmas revocar el rol admin de este usuario?"
    );
    if (!ok) return;

    setLoadingUserId(userId);

    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, make_admin: makeAdmin }),
      });

      if (!res.ok) {
        alert("No se pudo actualizar el rol.");
        return;
      }

      location.reload();
    } catch {
      alert("Error de conexion.");
    } finally {
      setLoadingUserId(null);
    }
  }

  const totalUsers = profiles.length;
  const totalAnalysis = history.length;
  const avgScore = history.filter((h) => h.score != null).length
    ? (
        history
          .filter((h) => h.score != null)
          .reduce((a, h) => a + (h.score ?? 0), 0) /
        history.filter((h) => h.score != null).length
      ).toFixed(1)
    : "-";

  const usersWithProfile = profiles.filter((p) => p.profile_complete).length;
  const usersWithAnalysis = new Set(history.map((h) => h.owner_email)).size;
  const totalAdmins = profiles.filter((p) => p.is_admin).length;

  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });

  const analysisByDay = last14.map((date) => ({
    fecha: date.slice(5),
    analisis: history.filter((h) => h.created_at?.slice(0, 10) === date).length,
  }));

  const usersByDay = last14.map((date) => ({
    fecha: date.slice(5),
    usuarios: profiles.filter((p) => p.created_at?.slice(0, 10) === date).length,
  }));

  const foodCount: Record<string, number> = {};
  history.forEach((h) => {
    const food = h.food_description?.slice(0, 30) ?? "Sin descripcion";
    foodCount[food] = (foodCount[food] ?? 0) + 1;
  });
  const topFoods = Object.entries(foodCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([food, count]) => ({ food, count }));

  const scoreRanges = [
    {
      label: "1-3 (Malo)",
      count: history.filter((h) => h.score != null && h.score <= 3).length,
      color: "#991B1B",
    },
    {
      label: "4-6 (Medio)",
      count:
        history.filter(
          (h) => h.score != null && h.score >= 4 && h.score <= 6
        ).length,
      color: "#854F0B",
    },
    {
      label: "7-10 (Bueno)",
      count: history.filter((h) => h.score != null && h.score >= 7).length,
      color: "#27500A",
    },
  ];

  const lastActivityByEmail: Record<string, string> = {};
  history.forEach((h) => {
    if (!h.owner_email || !h.created_at) return;
    const email = h.owner_email.toLowerCase();
    const current = lastActivityByEmail[email];
    if (!current || new Date(h.created_at).getTime() > new Date(current).getTime()) {
      lastActivityByEmail[email] = h.created_at;
    }
  });

  const usageByEmail: Record<string, UsageItem> = {};
  usage.forEach((u) => {
    if (!u.owner_email) return;
    usageByEmail[u.owner_email.toLowerCase()] = u;
  });

  function formatProvider(value?: string) {
    if (!value) return "-";
    if (value === "google") return "Google";
    if (value === "email") return "Email";
    return value;
  }

  function getSortTime(profile: Profile) {
    const lastActivity = lastActivityByEmail[profile.owner_email.toLowerCase()];
    if (lastActivity) return new Date(lastActivity).getTime();
    if (profile.created_at) return new Date(profile.created_at).getTime();
    return 0;
  }

  const filteredProfiles = profiles
    .filter(
      (p) =>
        p.owner_email.toLowerCase().includes(searchUser.toLowerCase()) ||
        (p.full_name ?? "").toLowerCase().includes(searchUser.toLowerCase())
    )
    .sort((a, b) => {
      if (!!a.is_admin !== !!b.is_admin) {
        return a.is_admin ? -1 : 1;
      }
      const timeDiff = getSortTime(b) - getSortTime(a);
      if (timeDiff !== 0) return timeDiff;
      return (a.full_name || a.owner_email).localeCompare(
        b.full_name || b.owner_email,
        "es",
        { sensitivity: "base" }
      );
    });

  const filteredWaitlist = waitlist.filter((w) =>
    w.email.toLowerCase().includes(searchWaitlist.toLowerCase())
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F0F6FF",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <nav
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          padding: "0.5rem 1.25rem",
          background: "#FFFFFF",
          borderBottom: "1px solid #B5D4F4",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link
            href="/dashboard"
            style={{ fontSize: "15px", fontWeight: 700, textDecoration: "none" }}
          >
            <span style={{ color: "#185FA5" }}>Vital</span>
            <span style={{ color: "#2C2C2A" }}>Cross AI</span>
          </Link>
          <span
            style={{
              fontSize: "11px",
              background: "#185FA5",
              color: "#FFFFFF",
              borderRadius: "20px",
              padding: "2px 10px",
              fontWeight: 700,
            }}
          >
            ADMIN
          </span>
        </div>

        <Link href="/dashboard">
          <Image
            src="/Logo.png"
            alt="VitalCross AI"
            width={70}
            height={70}
            style={{ objectFit: "contain", display: "block" }}
          />
        </Link>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Link
            href="/dashboard"
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: "1.5px solid #B5D4F4",
              color: "#5F5E5A",
              fontSize: "12px",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Volver al dashboard
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1
            style={{
              margin: "0 0 0.25rem",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#2C2C2A",
            }}
          >
            Panel de administracion
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#888780" }}>
            Acceso como {currentEmail}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "4px",
            marginBottom: "1.75rem",
            background: "#FFFFFF",
            borderRadius: "10px",
            padding: "4px",
            border: "1px solid #B5D4F4",
            width: "fit-content",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "6px 18px",
                borderRadius: "7px",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                background: activeTab === tab ? "#185FA5" : "transparent",
                color: activeTab === tab ? "#FFFFFF" : "#5F5E5A",
                transition: "all 0.15s",
                position: "relative",
              }}
            >
              {tab}
              {tab === "Waitlist" && waitlist.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    background: "#991B1B",
                    color: "#fff",
                    borderRadius: "20px",
                    padding: "0px 5px",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                  }}
                >
                  {waitlist.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "Resumen" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <GeminiBillingLink />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1rem",
              }}
            >
              <StatCard label="Usuarios totales" value={totalUsers} sub="en la plataforma" />
              <StatCard
                label="Admins"
                value={totalAdmins}
                sub="usuarios con acceso admin"
                color="#27500A"
              />
              <StatCard
                label="Perfiles completos"
                value={usersWithProfile}
                sub={`${Math.round((usersWithProfile / Math.max(totalUsers, 1)) * 100)}% del total`}
                color="#3B6D11"
              />
              <StatCard
                label="Usuarios activos"
                value={usersWithAnalysis}
                sub="con al menos 1 analisis"
                color="#378ADD"
              />
              <StatCard label="Analisis totales" value={totalAnalysis} sub="en toda la plataforma" />
              <StatCard
                label="Puntaje promedio"
                value={avgScore}
                sub="de todos los analisis"
                color={
                  parseFloat(String(avgScore)) >= 7
                    ? "#27500A"
                    : parseFloat(String(avgScore)) >= 4
                    ? "#854F0B"
                    : "#991B1B"
                }
              />
              <StatCard
                label="Waitlist"
                value={waitlist.length}
                sub="solicitudes de mas tokens"
                color="#854F0B"
              />
            </div>

            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "14px",
                border: "1px solid #B5D4F4",
                padding: "1.5rem",
              }}
            >
              <h2
                style={{
                  margin: "0 0 1.25rem",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "#2C2C2A",
                }}
              >
                Analisis por dia (ultimos 14 dias)
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analysisByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6F1FB" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#888780" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#888780" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #B5D4F4",
                      fontSize: "0.8rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="analisis"
                    stroke="#185FA5"
                    strokeWidth={2.5}
                    dot={{ fill: "#185FA5", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "14px",
                border: "1px solid #B5D4F4",
                padding: "1.5rem",
              }}
            >
              <h2
                style={{
                  margin: "0 0 1.25rem",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "#2C2C2A",
                }}
              >
                Usuarios nuevos por dia (ultimos 14 dias)
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={usersByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6F1FB" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#888780" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#888780" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #B5D4F4",
                      fontSize: "0.8rem",
                    }}
                  />
                  <Bar dataKey="usuarios" fill="#378ADD" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "14px",
                  border: "1px solid #B5D4F4",
                  padding: "1.5rem",
                }}
              >
                <h2
                  style={{
                    margin: "0 0 1rem",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#2C2C2A",
                  }}
                >
                  Distribucion de puntajes
                </h2>
                {scoreRanges.map((s) => (
                  <div key={s.label} style={{ marginBottom: "0.75rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                      }}
                    >
                      <span style={{ fontSize: "0.8rem", color: s.color, fontWeight: 600 }}>
                        {s.label}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "#5F5E5A" }}>
                        {s.count} analisis
                      </span>
                    </div>
                    <div
                      style={{
                        height: "6px",
                        borderRadius: "3px",
                        background: "#E6F1FB",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.round((s.count / Math.max(totalAnalysis, 1)) * 100)}%`,
                          background: s.color,
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "14px",
                  border: "1px solid #B5D4F4",
                  padding: "1.5rem",
                }}
              >
                <h2
                  style={{
                    margin: "0 0 1rem",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#2C2C2A",
                  }}
                >
                  Alimentos mas analizados
                </h2>
                {topFoods.slice(0, 6).map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.4rem 0",
                      borderBottom: i < 5 ? "1px solid #E6F1FB" : "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "#2C2C2A",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "75%",
                      }}
                    >
                      {f.food}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#185FA5",
                        flexShrink: 0,
                      }}
                    >
                      {f.count}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Usuarios" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input
              placeholder="Buscar por email o nombre..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "1.5px solid #B5D4F4",
                fontSize: "0.9rem",
                outline: "none",
                background: "#FFFFFF",
                width: "320px",
                boxSizing: "border-box",
              }}
            />

            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "14px",
                border: "1px solid #B5D4F4",
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  minWidth: "1500px",
                  borderCollapse: "collapse",
                  fontSize: "0.85rem",
                }}
              >
                <thead>
                  <tr style={{ background: "#E6F1FB" }}>
                    {[
                      "Nombre",
                      "Email",
                      "Rol",
                      "Accion",
                      "Proveedor",
                      "Edad",
                      "Sexo",
                      "Peso",
                      "Altura",
                      "Perfil",
                      "Registro",
                      "Ultima actividad",
                      "Consultas mes",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.75rem 1rem",
                          textAlign: "left",
                          fontWeight: 700,
                          color: "#0C447C",
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.3px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredProfiles.map((p, i) => {
                    const isSelf = p.owner_email === currentEmail;
                    const busy = loadingUserId === p.owner_id;
                    const usageInfo = usageByEmail[p.owner_email.toLowerCase()];
                    const lastActivity = lastActivityByEmail[p.owner_email.toLowerCase()];

                    return (
                      <tr
                        key={p.owner_email}
                        style={{
                          borderTop: "1px solid #E6F1FB",
                          background: i % 2 === 0 ? "#FFFFFF" : "#F8FBFF",
                        }}
                      >
                        <td style={{ padding: "0.75rem 1rem", color: "#2C2C2A", fontWeight: 500 }}>
                          {p.full_name ?? "-"}
                        </td>

                        <td style={{ padding: "0.75rem 1rem", color: "#5F5E5A" }}>
                          {p.owner_email}
                        </td>

                        <td style={{ padding: "0.75rem 1rem" }}>
                          {p.is_admin ? (
                            <span
                              style={{
                                background: "#185FA5",
                                color: "#FFFFFF",
                                borderRadius: "20px",
                                padding: "2px 10px",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                              }}
                            >
                              Admin
                            </span>
                          ) : (
                            <span
                              style={{
                                background: "#E6F1FB",
                                color: "#5F5E5A",
                                borderRadius: "20px",
                                padding: "2px 10px",
                                fontSize: "0.7rem",
                              }}
                            >
                              Usuario
                            </span>
                          )}
                        </td>

                        <td style={{ padding: "0.75rem 1rem" }}>
                          {isSelf ? (
                            <span style={{ fontSize: "0.75rem", color: "#888780" }}>
                              Tu cuenta
                            </span>
                          ) : p.is_admin ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={async () => {
                                const ok = confirm(
                                  "Confirmas revocar el rol admin de este usuario?"
                                );
                                if (!ok) return;
                                setLoadingUserId(p.owner_id);
                                try {
                                  const res = await fetch("/api/admin/roles", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      user_id: p.owner_id,
                                      make_admin: false,
                                    }),
                                  });
                                  if (!res.ok) {
                                    alert("No se pudo revocar el rol admin.");
                                    return;
                                  }
                                  location.reload();
                                } catch {
                                  alert("Error de conexion.");
                                } finally {
                                  setLoadingUserId(null);
                                }
                              }}
                              style={{
                                padding: "6px 10px",
                                borderRadius: "8px",
                                border: "1px solid #FECACA",
                                background: "#FEE2E2",
                                color: "#991B1B",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                cursor: busy ? "not-allowed" : "pointer",
                                opacity: busy ? 0.6 : 1,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {busy ? "Procesando..." : "Revocar admin"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={async () => {
                                const ok = confirm(
                                  "Confirmas hacer admin a este usuario?"
                                );
                                if (!ok) return;
                                setLoadingUserId(p.owner_id);
                                try {
                                  const res = await fetch("/api/admin/roles", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      user_id: p.owner_id,
                                      make_admin: true,
                                    }),
                                  });
                                  if (!res.ok) {
                                    alert("No se pudo otorgar el rol admin.");
                                    return;
                                  }
                                  location.reload();
                                } catch {
                                  alert("Error de conexion.");
                                } finally {
                                  setLoadingUserId(null);
                                }
                              }}
                              style={{
                                padding: "6px 10px",
                                borderRadius: "8px",
                                border: "1px solid #C0DD97",
                                background: "#EAF3DE",
                                color: "#27500A",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                cursor: busy ? "not-allowed" : "pointer",
                                opacity: busy ? 0.6 : 1,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {busy ? "Procesando..." : "Hacer admin"}
                            </button>
                          )}
                        </td>

                        <td style={{ padding: "0.75rem 1rem", color: "#5F5E5A" }}>
                          {formatProvider(p.provider)}
                        </td>

                        <td style={{ padding: "0.75rem 1rem", color: "#5F5E5A" }}>
                          {p.age ?? "-"}
                        </td>

                        <td style={{ padding: "0.75rem 1rem", color: "#5F5E5A" }}>
                          {p.sex ?? "-"}
                        </td>

                        <td style={{ padding: "0.75rem 1rem", color: "#5F5E5A" }}>
                          {p.weight_kg ? `${p.weight_kg} kg` : "-"}
                        </td>

                        <td style={{ padding: "0.75rem 1rem", color: "#5F5E5A" }}>
                          {p.height_cm ? `${p.height_cm} cm` : "-"}
                        </td>

                        <td style={{ padding: "0.75rem 1rem" }}>
                          {p.profile_complete ? (
                            <span
                              style={{
                                background: "#EAF3DE",
                                color: "#27500A",
                                borderRadius: "20px",
                                padding: "2px 10px",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                              }}
                            >
                              Completo
                            </span>
                          ) : (
                            <span
                              style={{
                                background: "#FAEEDA",
                                color: "#854F0B",
                                borderRadius: "20px",
                                padding: "2px 10px",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                              }}
                            >
                              Incompleto
                            </span>
                          )}
                        </td>

                        <td style={{ padding: "0.75rem 1rem", color: "#5F5E5A", whiteSpace: "nowrap" }}>
                          {p.created_at
                            ? new Date(p.created_at).toLocaleDateString("es-AR")
                            : "-"}
                        </td>

                        <td style={{ padding: "0.75rem 1rem", color: "#5F5E5A", whiteSpace: "nowrap" }}>
                          {lastActivity
                            ? new Date(lastActivity).toLocaleString("es-AR")
                            : "-"}
                        </td>

                        <td style={{ padding: "0.75rem 1rem", color: "#5F5E5A" }}>
                          {usageInfo?.monthly_count ?? 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredProfiles.length === 0 && (
                <p style={{ textAlign: "center", padding: "2rem", color: "#888780" }}>
                  No se encontraron usuarios
                </p>
              )}
            </div>

            <p style={{ margin: 0, fontSize: "0.8rem", color: "#888780" }}>
              {filteredProfiles.length} usuarios encontrados
            </p>
          </div>
        )}

        {activeTab === "Analisis" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "14px",
                border: "1px solid #B5D4F4",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "1rem 1.25rem",
                  borderBottom: "1px solid #E6F1FB",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#2C2C2A" }}>
                  Ultimos 100 analisis
                </h2>
                <span style={{ fontSize: "0.8rem", color: "#888780" }}>
                  {history.length} total
                </span>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "#E6F1FB" }}>
                    {["Usuario", "Alimento", "Puntaje", "Fecha"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.75rem 1rem",
                          textAlign: "left",
                          fontWeight: 700,
                          color: "#0C447C",
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.3px",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 100).map((h, i) => {
                    const sc = h.score;
                    const scoreStyle =
                      sc == null
                        ? { bg: "#E6F1FB", text: "#5F5E5A" }
                        : sc <= 3
                        ? { bg: "#FEE2E2", text: "#991B1B" }
                        : sc <= 6
                        ? { bg: "#FAEEDA", text: "#854F0B" }
                        : { bg: "#EAF3DE", text: "#27500A" };

                    return (
                      <tr
                        key={i}
                        style={{
                          borderTop: "1px solid #E6F1FB",
                          background: i % 2 === 0 ? "#FFFFFF" : "#F8FBFF",
                        }}
                      >
                        <td style={{ padding: "0.75rem 1rem", color: "#5F5E5A", fontSize: "0.8rem" }}>
                          {h.owner_email}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem 1rem",
                            color: "#2C2C2A",
                            maxWidth: "280px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h.food_description ?? "-"}
                        </td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          {sc != null ? (
                            <span
                              style={{
                                background: scoreStyle.bg,
                                color: scoreStyle.text,
                                borderRadius: "20px",
                                padding: "2px 10px",
                                fontWeight: 700,
                                fontSize: "0.8rem",
                              }}
                            >
                              {sc}/10
                            </span>
                          ) : (
                            <span style={{ color: "#888780" }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", color: "#888780", fontSize: "0.8rem" }}>
                          {h.created_at ? new Date(h.created_at).toLocaleString("es-AR") : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Uso" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "14px",
                border: "1px solid #B5D4F4",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #E6F1FB" }}>
                <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#2C2C2A" }}>
                  Consumo por usuario
                </h2>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "#E6F1FB" }}>
                    {["Email", "Consultas hoy", "Consultas mes", "Ultima actividad"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.75rem 1rem",
                          textAlign: "left",
                          fontWeight: 700,
                          color: "#0C447C",
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.3px",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usage.map((u, i) => {
                    const dailyColor =
                      (u.daily_count ?? 0) >= 5
                        ? "#991B1B"
                        : (u.daily_count ?? 0) >= 4
                        ? "#854F0B"
                        : "#185FA5";

                    const monthlyColor =
                      (u.monthly_count ?? 0) >= 30
                        ? "#991B1B"
                        : (u.monthly_count ?? 0) >= 25
                        ? "#854F0B"
                        : "#185FA5";

                    const lastActivity =
                      lastActivityByEmail[(u.owner_email || "").toLowerCase()];

                    return (
                      <tr
                        key={i}
                        style={{
                          borderTop: "1px solid #E6F1FB",
                          background: i % 2 === 0 ? "#FFFFFF" : "#F8FBFF",
                        }}
                      >
                        <td style={{ padding: "0.75rem 1rem", color: "#5F5E5A", fontSize: "0.8rem" }}>
                          {u.owner_email}
                        </td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <span style={{ fontWeight: 700, color: dailyColor }}>
                            {u.daily_count ?? 0}
                          </span>
                          <span style={{ color: "#888780" }}>/5</span>
                        </td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <span style={{ fontWeight: 700, color: monthlyColor }}>
                            {u.monthly_count ?? 0}
                          </span>
                          <span style={{ color: "#888780" }}>/30</span>
                        </td>
                        <td style={{ padding: "0.75rem 1rem", color: "#888780", fontSize: "0.8rem" }}>
                          {lastActivity
                            ? new Date(lastActivity).toLocaleString("es-AR")
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {usage.length === 0 && (
                <p style={{ textAlign: "center", padding: "2rem", color: "#888780" }}>
                  Sin datos de uso todavia
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "Waitlist" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <input
                placeholder="Buscar por email..."
                value={searchWaitlist}
                onChange={(e) => setSearchWaitlist(e.target.value)}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  border: "1.5px solid #B5D4F4",
                  fontSize: "0.9rem",
                  outline: "none",
                  background: "#FFFFFF",
                  width: "320px",
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  background: "#FFF8E6",
                  border: "1px solid #FAC775",
                  borderRadius: "8px",
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  color: "#854F0B",
                  fontWeight: 600,
                }}
              >
                {waitlist.length} {waitlist.length === 1 ? "persona quiere" : "personas quieren"} mas tokens
              </div>
            </div>

            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "14px",
                border: "1px solid #B5D4F4",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "1rem 1.25rem",
                  borderBottom: "1px solid #E6F1FB",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#2C2C2A" }}>
                  Solicitudes de mas tokens
                </h2>
                <span style={{ fontSize: "0.8rem", color: "#888780" }}>
                  {filteredWaitlist.length} resultados
                </span>
              </div>

              {filteredWaitlist.length === 0 ? (
                <p style={{ textAlign: "center", padding: "2rem", color: "#888780" }}>
                  {waitlist.length === 0 ? "Todavia no hay solicitudes" : "No se encontraron resultados"}
                </p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ background: "#E6F1FB" }}>
                      {["#", "Email", "Fecha de solicitud"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "0.75rem 1rem",
                            textAlign: "left",
                            fontWeight: 700,
                            color: "#0C447C",
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.3px",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWaitlist.map((w, i) => (
                      <tr
                        key={w.id}
                        style={{
                          borderTop: "1px solid #E6F1FB",
                          background: i % 2 === 0 ? "#FFFFFF" : "#F8FBFF",
                        }}
                      >
                        <td style={{ padding: "0.75rem 1rem", color: "#888780", fontSize: "0.8rem" }}>
                          {i + 1}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", color: "#2C2C2A", fontWeight: 500 }}>
                          {w.email}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", color: "#888780", fontSize: "0.8rem" }}>
                          {new Date(w.created_at).toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
