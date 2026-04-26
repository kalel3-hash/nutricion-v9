"use client";

import { useState, useMemo } from "react";

type User = {
  user_id: string;
  email: string;
  full_name: string;
  created_at: string;
  profile_complete: boolean;
  daily_count: number;
  monthly_count: number;
  total_count: number;
  is_admin: boolean;
};

type Summary = {
  total_users: number;
  perfiles_completos: number;
  consultas_hoy: number;
  consultas_mes: number;
};

export default function AdminClient({
  users,
  summary,
}: {
  users: User[];
  summary: Summary;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const [sortBy, setSortBy] = useState<
    "created_at" | "total_count" | "monthly_count"
  >("created_at");
  const [loadingUser, setLoadingUser] = useState<string | null>(null);

  async function changeRole(userId: string, makeAdmin: boolean) {
    const ok = confirm(
      makeAdmin
        ? "¿Confirmás hacer admin a este usuario?"
        : "¿Confirmás revocar el rol admin de este usuario?"
    );
    if (!ok) return;

    setLoadingUser(userId);

    await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        make_admin: makeAdmin,
      }),
    });

    location.reload();
  }

  const filtered = useMemo(() => {
    return users
      .filter((u) => {
        const q = search.toLowerCase();
        const email = (u.email || "").toLowerCase();
        const name = (u.full_name || "").toLowerCase();
        const matchSearch = email.includes(q) || name.includes(q);
        const matchFilter =
          filter === "todos" ||
          (filter === "completo" && u.profile_complete) ||
          (filter === "incompleto" && !u.profile_complete);
        return matchSearch && matchFilter;
      })
      .sort((a, b) => {
        if (sortBy === "created_at")
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
        return b[sortBy] - a[sortBy];
      });
  }, [users, search, filter, sortBy]);

  function initials(name: string, email: string) {
    const n = (name || "").trim();
    const e = email || "";
    if (n) {
      return n
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
    }
    return e.slice(0, 2).toUpperCase();
  }

  function formatDate(iso: string) {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  }

  const maxTotal = Math.max(...users.map((u) => u.total_count), 1);

  return (
    <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, color: "#0C447C" }}>
        Panel de administración
      </h1>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          margin: "1.5rem 0",
        }}
      >
        <Stat label="Usuarios totales" value={summary.total_users} />
        <Stat label="Perfiles completos" value={summary.perfiles_completos} />
        <Stat label="Consultas hoy" value={summary.consultas_hoy} />
        <Stat label="Consultas este mes" value={summary.consultas_mes} />
      </div>

      {/* Tabla */}
      <div
        style={{
          border: "1px solid #B5D4F4",
          borderRadius: 12,
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#E6F1FB" }}>
            <tr>
              {[
                "Nombre",
                "Email",
                "Rol",
                "Registro",
                "Perfil",
                "Hoy",
                "Este mes",
                "Total",
                "Acciones",
              ].map((h) => (
                <th key={h} style={{ padding: 10, textAlign: "left" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={i} style={{ borderTop: "1px solid #E6F1FB" }}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "#B5D4F4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {initials(u.full_name, u.email)}
                    </div>
                    {u.full_name}
                  </div>
                </td>
                <td>{u.email}</td>
                <td>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                      background: u.is_admin ? "#EAF3DE" : "#E6F1FB",
                      color: u.is_admin ? "#27500A" : "#0C447C",
                    }}
                  >
                    {u.is_admin ? "Admin" : "Usuario"}
                  </span>
                </td>
                <td>{formatDate(u.created_at)}</td>
                <td>{u.profile_complete ? "Completo" : "Incompleto"}</td>
                <td>{u.daily_count}</td>
                <td>{u.monthly_count}</td>
                <td>{u.total_count}</td>
                <td>
                  {u.is_admin ? (
                    <button
                      disabled={loadingUser === u.user_id}
                      onClick={() =>
                        changeRole(u.user_id, false)
                      }
                    >
                      Revocar admin
                    </button>
                  ) : (
                    <button
                      disabled={loadingUser === u.user_id}
                      onClick={() =>
                        changeRole(u.user_id, true)
                      }
                    >
                      Hacer admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        background: "#F0F6FF",
        border: "1px solid #B5D4F4",
        borderRadius: 8,
        padding: "1rem",
      }}
    >
      <div style={{ fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600 }}>{value}</div>
    </div>
  );
}