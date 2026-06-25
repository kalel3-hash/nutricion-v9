// apps/web/src/app/admin/usage/AdminUsageClient.tsx
"use client";

import { useState } from "react";

type UserUsage = {
  owner_email: string;
  daily_count: number;
  daily_limit: number;
  monthly_count: number;
  monthly_limit: number;
  last_reset_by: string | null;
  last_reset_at: string | null;
};

export default function AdminUsageClient({ users }: { users: UserUsage[] }) {
  const [data, setData] = useState<UserUsage[]>(users);
  const [loading, setLoading] = useState<string | null>(null);

  const reset = async (email: string, type: "daily" | "monthly" | "both") => {
    setLoading(`${email}-${type}`);

    await fetch("/api/admin/reset-usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type }),
    });

    setData(prev => prev.map(u => {
      if (u.owner_email !== email) return u;
      return {
        ...u,
        daily_count:   type !== "monthly" ? 0 : u.daily_count,
        monthly_count: type !== "daily"   ? 0 : u.monthly_count,
        last_reset_at: new Date().toISOString(),
      };
    }));

    setLoading(null);
  };

  return (
    <div style={{
      padding: "2rem",
      fontFamily: "system-ui, sans-serif",
      background: "#F0F6FF",
      minHeight: "100vh",
    }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0C447C", marginBottom: "0.25rem" }}>
        Panel Admin · Uso de consultas
      </h1>
      <p style={{ fontSize: "0.82rem", color: "#888780", marginBottom: "1.5rem" }}>
        {data.length} usuarios registrados
      </p>

      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%", borderCollapse: "collapse",
          background: "#fff", borderRadius: "12px",
          overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          <thead>
            <tr style={{ background: "#0C447C", color: "#fff", fontSize: "0.78rem" }}>
              {["Usuario", "Diario", "Mensual", "Último reset", "Acciones"].map(h => (
                <th key={h} style={{ padding: "0.875rem 1rem", textAlign: "left", fontWeight: 700 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((u, i) => (
              <tr key={u.owner_email} style={{
                borderTop: "1px solid #E6F1FB",
                background: i % 2 === 0 ? "#fff" : "#F8FBFF",
              }}>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.82rem", color: "#2C2C2A", fontWeight: 600 }}>
                  {u.owner_email}
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <UsageBar used={u.daily_count} limit={u.daily_limit} />
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <UsageBar used={u.monthly_count} limit={u.monthly_limit} />
                </td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "#888780" }}>
                  {u.last_reset_at ? (
                    <>
                      {new Date(u.last_reset_at).toLocaleDateString("es-AR")}
                      <br />
                      <span style={{ color: "#B0AEA8" }}>por {u.last_reset_by}</span>
                    </>
                  ) : "—"}
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {(["daily", "monthly", "both"] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => reset(u.owner_email, type)}
                        disabled={!!loading}
                        style={{
                          padding: "4px 10px", borderRadius: "6px", border: "none",
                          background: type === "both" ? "#0C447C" : "#E6F1FB",
                          color: type === "both" ? "#fff" : "#185FA5",
                          fontSize: "0.72rem", fontWeight: 700,
                          cursor: loading ? "not-allowed" : "pointer",
                          opacity: loading === `${u.owner_email}-${type}` ? 0.6 : 1,
                        }}
                      >
                        {loading === `${u.owner_email}-${type}`
                          ? "..."
                          : type === "daily" ? "Reset día"
                          : type === "monthly" ? "Reset mes"
                          : "Reset todo"}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsageBar({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min((used / limit) * 100, 100);
  const color = pct >= 100 ? "#991B1B" : pct >= 80 ? "#854F0B" : "#185FA5";
  return (
    <div>
      <div style={{ fontSize: "0.8rem", fontWeight: 700, color, marginBottom: "3px" }}>
        {used}/{limit}
      </div>
      <div style={{ height: "5px", background: "#E6F1FB", borderRadius: "4px", width: "100px" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: color, borderRadius: "4px", transition: "width 0.3s",
        }} />
      </div>
    </div>
  );
}