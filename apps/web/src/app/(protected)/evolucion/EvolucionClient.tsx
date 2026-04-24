"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import NavbarProtegido from "@/components/NavbarProtegido";

type EvolutionRow = {
  id: string;
  created_at: string;
  food_description: string;
  score: number | null;
};

const scoreColor = (s: number) => {
  if (s <= 3) return "#E24B4A";
  if (s <= 6) return "#BA7517";
  return "#3B6D11";
};

export default function EvolucionClient() {
  const [rows, setRows] = useState<EvolutionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/history", { method: "GET" });
        const json = await res.json();
        setRows(json.items ?? []);
      } catch (e: any) {
        setError(e?.message || "Error cargando evolucion");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartData = [...rows]
    .filter((r) => r.score !== null)
    .reverse()
    .map((r, i) => ({
      index: i + 1,
      score: r.score,
      label: r.food_description?.slice(0, 20) + (r.food_description?.length > 20 ? "..." : ""),
      fecha: new Date(r.created_at).toLocaleDateString("es-AR"),
    }));

  const scores = rows.filter((r) => r.score !== null).map((r) => r.score as number);
  const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;
  const best = scores.length ? Math.max(...scores) : null;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F0F6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#5F5E5A", fontSize: "0.9rem" }}>Cargando evolucion...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F0F6FF" }}>

      <NavbarProtegido extraLinks={[{ label: "← Volver", href: "/dashboard" }]} showSignOut={false} />

      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ margin: "0 0 0.3rem", fontSize: "1.5rem", fontWeight: 700, color: "#2C2C2A" }}>
            Mi evolucion
          </h1>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#5F5E5A" }}>
            Seguimiento de tus puntajes nutricionales en el tiempo
          </p>
        </div>

        {error && (
          <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.875rem", color: "#991B1B" }}>
            {error}
          </div>
        )}

        {rows.length === 0 && !error && (
          <div style={{ background: "#FFFFFF", borderRadius: "14px", border: "1px solid #B5D4F4", padding: "3rem", textAlign: "center" }}>
            <p style={{ margin: "0 0 1rem", fontSize: "0.95rem", color: "#5F5E5A" }}>
              Todavia no hay analisis guardados.
            </p>
            <Link href="/analizar" style={{ display: "inline-block", padding: "0.7rem 1.5rem", borderRadius: "8px", background: "#185FA5", color: "#FFFFFF", fontSize: "0.9rem", fontWeight: 600, textDecoration: "none" }}>
              Hacer mi primer analisis
            </Link>
          </div>
        )}

        {rows.length > 0 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
              {[
                { label: "Puntaje promedio", value: avg ? `${avg}/10` : "—" },
                { label: "Mejor puntaje", value: best !== null ? `${best}/10` : "—" },
                { label: "Analisis totales", value: rows.length.toString() },
              ].map((m) => (
                <div key={m.label} style={{ background: "#FFFFFF", borderRadius: "12px", border: "1px solid #B5D4F4", padding: "1.25rem", textAlign: "center" }}>
                  <p style={{ margin: "0 0 0.4rem", fontSize: "0.75rem", color: "#888780", textTransform: "uppercase", letterSpacing: "0.4px" }}>{m.label}</p>
                  <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#185FA5" }}>{m.value}</p>
                </div>
              ))}
            </div>

            {chartData.length > 1 && (
              <div style={{ background: "#FFFFFF", borderRadius: "14px", border: "1px solid #B5D4F4", padding: "1.75rem", marginBottom: "1.5rem" }}>
                <h2 style={{ margin: "0 0 1.5rem", fontSize: "0.95rem", fontWeight: 700, color: "#2C2C2A" }}>
                  Tendencia de puntajes
                </h2>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6F1FB" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#888780" }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "#888780" }} />
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "1px solid #B5D4F4", fontSize: "0.8rem" }}
                      formatter={(value: any) => [`${value}/10`, "Puntaje"]}
                      labelFormatter={(label) => `Fecha: ${label}`}
                    />
                    {avg && (
                      <ReferenceLine y={parseFloat(avg)} stroke="#B5D4F4" strokeDasharray="4 4"
                        label={{ value: `Prom. ${avg}`, fontSize: 11, fill: "#378ADD" }} />
                    )}
                    <Line type="monotone" dataKey="score" stroke="#185FA5" strokeWidth={2.5} dot={{ fill: "#185FA5", r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div style={{ background: "#FFFFFF", borderRadius: "14px", border: "1px solid #B5D4F4", overflow: "hidden" }}>
              <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #E6F1FB" }}>
                <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#2C2C2A" }}>Detalle por analisis</h2>
              </div>
              {rows.map((r, i) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "0.875rem 1.5rem", borderBottom: i < rows.length - 1 ? "1px solid #E6F1FB" : "none" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: "0 0 0.15rem", fontWeight: 600, fontSize: "0.9rem", color: "#2C2C2A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.food_description}</p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#888780" }}>{new Date(r.created_at).toLocaleString("es-AR")}</p>
                  </div>
                  {r.score !== null && (
                    <div style={{ padding: "4px 12px", borderRadius: "20px", background: "#F0F6FF", border: "1px solid #B5D4F4", fontSize: "0.875rem", fontWeight: 700, color: scoreColor(r.score), flexShrink: 0 }}>
                      {r.score}/10
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Link href="/analizar" style={{ fontSize: "0.9rem", color: "#185FA5", fontWeight: 600, textDecoration: "none" }}>
                + Hacer nuevo analisis
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}