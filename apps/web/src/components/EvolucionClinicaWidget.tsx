// apps/web/src/components/EvolucionClinicaWidget.tsx
"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import Link from "next/link";

type HealthRecord = {
  id: string;
  recorded_at: string;
  weight_kg: number | null;
  total_cholesterol_mg_dl: number | null;
  hdl_mg_dl: number | null;
  ldl_mg_dl: number | null;
  triglycerides_mg_dl: number | null;
  fasting_glucose_mg_dl: number | null;
  hba1c_percent: number | null;
  creatinine_mg_dl: number | null;
  urea_mg_dl: number | null;
  tsh_miu_l: number | null;
};

type Indicador = {
  key: keyof Omit<HealthRecord, "id" | "recorded_at">;
  label: string;
  unidad: string;
  color: string;
};

const INDICADORES: Indicador[] = [
  { key: "weight_kg",               label: "Peso",             unidad: "kg",      color: "#185FA5" },
  { key: "fasting_glucose_mg_dl",   label: "Glucosa",          unidad: "mg/dL",   color: "#E07B39" },
  { key: "total_cholesterol_mg_dl", label: "Colesterol total",  unidad: "mg/dL",   color: "#9B59B6" },
  { key: "hdl_mg_dl",              label: "HDL",              unidad: "mg/dL",   color: "#27AE60" },
  { key: "ldl_mg_dl",              label: "LDL",              unidad: "mg/dL",   color: "#E74C3C" },
  { key: "triglycerides_mg_dl",    label: "Triglicéridos",    unidad: "mg/dL",   color: "#F39C12" },
  { key: "hba1c_percent",          label: "HbA1c",            unidad: "%",       color: "#16A085" },
  { key: "creatinine_mg_dl",       label: "Creatinina",       unidad: "mg/dL",   color: "#8E44AD" },
  { key: "urea_mg_dl",             label: "Urea",             unidad: "mg/dL",   color: "#2C3E50" },
  { key: "tsh_miu_l",              label: "TSH",              unidad: "mUI/L",   color: "#C0392B" },
];

function formatFecha(dateStr: string): string {
  // dateStr viene como "YYYY-MM-DD"
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year.slice(2)}`;
}

// Tooltip personalizado con estilo VitalCross
function CustomTooltip({ active, payload, label, unidad }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  unidad: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #B5D4F4",
      borderRadius: "8px",
      padding: "8px 14px",
      boxShadow: "0 2px 8px rgba(24,95,165,0.12)",
      fontSize: "0.82rem",
      color: "#2C2C2A",
    }}>
      <div style={{ fontWeight: 700, color: "#185FA5", marginBottom: "2px" }}>{label}</div>
      <div>{payload[0].value} <span style={{ color: "#888780" }}>{unidad}</span></div>
    </div>
  );
}

export default function EvolucionClinicaWidget() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<Indicador["key"]>("weight_kg");

  useEffect(() => {
    fetch("/api/health-records")
      .then((r) => r.json())
      .then((d) => {
        // El API devuelve orden desc; lo invertimos para que el gráfico vaya de más antiguo a más reciente
        const sorted = [...(d.records ?? [])].reverse();
        setRecords(sorted);
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  // Filtramos los indicadores que tienen al menos 1 valor no nulo
  const indicadoresDisponibles = INDICADORES.filter((ind) =>
    records.some((r) => r[ind.key] !== null)
  );

  // Datos para recharts: solo fechas donde el indicador seleccionado tiene valor
  const indicadorActual = INDICADORES.find((i) => i.key === selectedKey) ?? INDICADORES[0];

  const chartData = records
    .filter((r) => r[selectedKey] !== null)
    .map((r) => ({
      fecha: formatFecha(r.recorded_at),
      valor: Number(r[selectedKey]),
    }));

  // Si el indicador seleccionado no tiene datos, cambiamos al primero disponible
  useEffect(() => {
    if (indicadoresDisponibles.length > 0) {
      const existe = indicadoresDisponibles.find((i) => i.key === selectedKey);
      if (!existe) {
        setSelectedKey(indicadoresDisponibles[0].key);
      }
    }
  }, [indicadoresDisponibles, selectedKey]);

  const cardStyle: React.CSSProperties = {
    background: "#FFFFFF",
    borderRadius: "14px",
    border: "1px solid #B5D4F4",
    boxShadow: "0 2px 12px rgba(24,95,165,0.06)",
    padding: "1.5rem",
    marginBottom: "1.5rem",
  };

  if (loading) {
    return (
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.2rem" }}>📈</span>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#2C2C2A" }}>
            Evolución de indicadores clínicos
          </h2>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#888780", margin: 0 }}>Cargando datos...</p>
      </div>
    );
  }

  // Sin registros
  if (records.length === 0) {
    return (
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "1.2rem" }}>📈</span>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#2C2C2A" }}>
            Evolución de indicadores clínicos
          </h2>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#5F5E5A", margin: "0 0 1rem" }}>
          Todavía no tenés registros de laboratorio. Cargá tus análisis en el Historial Clínico para ver tu evolución en el tiempo.
        </p>
        <Link href="/historial-clinico" style={{
          display: "inline-block",
          fontSize: "0.82rem",
          fontWeight: 600,
          color: "#185FA5",
          border: "1px solid #B5D4F4",
          borderRadius: "8px",
          padding: "6px 14px",
          textDecoration: "none",
          background: "#F0F6FF",
        }}>
          Ir al Historial Clínico →
        </Link>
      </div>
    );
  }

  // Un solo registro: no alcanza para graficar tendencia
  if (records.length === 1) {
    return (
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "1.2rem" }}>📈</span>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#2C2C2A" }}>
            Evolución de indicadores clínicos
          </h2>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#5F5E5A", margin: "0 0 1rem" }}>
          Tenés 1 registro cargado. Agregá un segundo análisis con fecha diferente para ver tu evolución en el tiempo.
        </p>
        <Link href="/historial-clinico" style={{
          display: "inline-block",
          fontSize: "0.82rem",
          fontWeight: 600,
          color: "#185FA5",
          border: "1px solid #B5D4F4",
          borderRadius: "8px",
          padding: "6px 14px",
          textDecoration: "none",
          background: "#F0F6FF",
        }}>
          Agregar otro registro →
        </Link>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.2rem" }}>📈</span>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#2C2C2A" }}>
            Evolución de indicadores clínicos
          </h2>
        </div>
        <Link href="/historial-clinico" style={{
          fontSize: "0.78rem",
          fontWeight: 600,
          color: "#185FA5",
          textDecoration: "none",
          opacity: 0.8,
        }}>
          Ver historial completo →
        </Link>
      </div>

      {/* Selector de indicador */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.4rem",
        marginBottom: "1.25rem",
      }}>
        {indicadoresDisponibles.map((ind) => {
          const activo = ind.key === selectedKey;
          return (
            <button
              key={ind.key}
              onClick={() => setSelectedKey(ind.key)}
              style={{
                fontSize: "0.75rem",
                fontWeight: activo ? 700 : 500,
                padding: "4px 12px",
                borderRadius: "20px",
                border: activo ? `1.5px solid ${ind.color}` : "1.5px solid #D0E4F5",
                background: activo ? ind.color : "#F0F6FF",
                color: activo ? "#FFFFFF" : "#5F5E5A",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {ind.label}
            </button>
          );
        })}
      </div>

      {/* Gráfico */}
      {chartData.length < 2 ? (
        <p style={{ fontSize: "0.85rem", color: "#888780", margin: 0 }}>
          No hay suficientes registros de <strong>{indicadorActual.label}</strong> para graficar la evolución.
          Necesitás al menos 2 registros con ese indicador cargado.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 28, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E6F1FB" />
            <XAxis
              dataKey="fecha"
              tick={{ fontSize: 11, fill: "#888780" }}
              tickLine={false}
              axisLine={{ stroke: "#D0E4F5" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#888780" }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip content={<CustomTooltip unidad={indicadorActual.unidad} />} />
            <Line
              type="monotone"
              dataKey="valor"
              stroke={indicadorActual.color}
              strokeWidth={2.5}
              dot={{ r: 5, fill: indicadorActual.color, strokeWidth: 2, stroke: "#FFFFFF" }}
              activeDot={{ r: 7, fill: indicadorActual.color, stroke: "#FFFFFF", strokeWidth: 2 }}
              name={indicadorActual.label}
            >
              <LabelList
                dataKey="valor"
                position="top"
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  fill: indicadorActual.color,
                }}
              />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Pie: cantidad de registros y unidad */}
      <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#888780", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <span>{records.length} registro{records.length !== 1 ? "s" : ""} cargado{records.length !== 1 ? "s" : ""}</span>
        <span>Unidad: {indicadorActual.unidad}</span>
      </div>
    </div>
  );
}