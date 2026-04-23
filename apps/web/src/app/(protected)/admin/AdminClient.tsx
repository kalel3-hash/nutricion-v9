"use client";

import { useState, useMemo } from "react";

type User = {
  email: string;
  full_name: string;
  created_at: string;
  profile_complete: boolean;
  daily_count: number;
  monthly_count: number;
  total_count: number;
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
  const [sortBy, setSortBy] = useState<"created_at" | "total_count" | "monthly_count">("created_at");

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
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return b[sortBy] - a[sortBy];
      });
  }, [users, search, filter, sortBy]);

  function initials(name: string, email: string) {
    const n = (name || "").trim();
    const e = email || "";
    if (n) {
      return n.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
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

      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: "#0C447C", marginBottom: 4 }}>
          Panel de administracion
        </h1>
        <p style={{ fontSize: 14, color: "#5F5E5A" }}>
          Usuarios registrados y uso de consultas - VitalCross AI
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { label: "Usuarios totales", value: summary.total_users, color: "#185FA5" },
          { label: "Perfiles completos", value: summary.perfiles_completos, color: "#3B6D11" },
          { label: "Consultas hoy", value: summary.consultas_hoy, color: "#854F0B" },
          { label: "Consultas este mes", value: summary.consultas_mes, color: "#2C2C2A" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#F0F6FF", borderRadius: 8, padding: "1rem", border: "0.5px solid #B5D4F4" }}>
            <div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 500, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: "8px 12px", fontSize: 13, border: "0.5px solid #B5D4F4", borderRadius: 8, background: "#fff", color: "#2C2C2A", outline: "none" }}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          style={{ padding: "8px 12px", fontSize: 13, border: "0.5px solid #B5D4F4", borderRadius: 8, background: "#fff", color: "#2C2C2A" }}>
          <option value="todos">Todos los usuarios</option>
          <option value="completo">Perfil completo</option>
          <option value="incompleto">Sin perfil</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          style={{ padding: "8px 12px", fontSize: 13, border: "0.5px solid #B5D4F4", borderRadius: 8, background: "#fff", color: "#2C2C2A" }}>
          <option value="created_at">Ordenar: mas reciente</option>
          <option value="total_count">Ordenar: mas consultas totales</option>
          <option value="monthly_count">Ordenar: mas consultas este mes</option>
        </select>
      </div>

      <div style={{ border: "0.5px solid #B5D4F4", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#E6F1FB" }}>
              {["Nombre", "Email", "Registro", "Perfil", "Hoy", "Este mes", "Total"].map((h) => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 500, fontSize: 12, color: "#185FA5", borderBottom: "0.5px solid #B5D4F4" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#888780" }}>
                  No se encontraron usuarios.
                </td>
              </tr>
            )}
            {filtered.map((u, i) => {
              const ini = initials(u.full_name, u.email);
              const barPct = Math.round((u.total_count / maxTotal) * 100);
              return (
                <tr key={u.email || i} style={{ borderBottom: i < filtered.length - 1 ? "0.5px solid #E6F1FB" : "none" }}>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#B5D4F4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, color: "#0C447C", flexShrink: 0 }}>
                        {ini}
                      </div>
                      <span style={{ color: "#2C2C2A", whiteSpace: "nowrap" }}>
                        {u.full_name || "-"}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px", color: "#5F5E5A", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {u.email || "-"}
                  </td>
                  <td style={{ padding: "10px 12px", color: "#888780", whiteSpace: "nowrap" }}>
                    {formatDate(u.created_at)}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: u.profile_complete ? "#EAF3DE" : "#FAEEDA", color: u.profile_complete ? "#27500A" : "#633806" }}>
                      {u.profile_complete ? "Completo" : "Incompleto"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, height: 6, background: "#E6F1FB", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ width: `${Math.round((u.daily_count / 5) * 100)}%`, height: "100%", background: u.daily_count >= 5 ? "#991B1B" : "#185FA5", borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 12, color: "#5F5E5A", minWidth: 14 }}>{u.daily_count}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px", color: "#2C2C2A" }}>{u.monthly_count}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, height: 6, background: "#E6F1FB", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ width: `${barPct}%`, height: "100%", background: "#378ADD", borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#2C2C2A", minWidth: 20 }}>{u.total_count}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: "1rem", fontSize: 12, color: "#888780" }}>
        {filtered.length} usuario{filtered.length !== 1 ? "s" : ""} mostrado{filtered.length !== 1 ? "s" : ""} · Datos en tiempo real desde Supabase
      </p>
    </div>
  );
}