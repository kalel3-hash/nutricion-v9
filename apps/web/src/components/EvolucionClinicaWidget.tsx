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
  ReferenceLine,
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
  refMin: number | null; // null = no se muestra línea mínima
  refMax: number | null; // null = no se muestra línea máxima
};

// Rangos de referencia poblacionales generales (adultos)
// Fuentes: guías clínicas estándar de laboratorio (AHA, OMS, SEMERGEN)
const INDICADORES: Indicador[] = [
  {
    key: "weight_kg",
    label: "Peso",
    unidad: "kg",
    color: "#185FA5",
    refMin: null, // depende de talla, no se puede generalizar
    refMax: null,
  },
  {
    key: "fasting_glucose_mg_dl",
    label: "Glucosa",
    unidad: "mg/dL",
    color: "#E07B39",
    refMin: 70,   // límite inferior normal en ayunas
    refMax: 99,   // límite superior normal en ayunas (≥100 = prediabetes)
  },
  {
    key: "total_cholesterol_mg_dl",
    label: "Colesterol total",
    unidad: "mg/dL",
    color: "#9B59B6",
    refMin: null,
    refMax: 200,  // deseable <200 mg/dL
  },
  {
    key: "hdl_mg_dl",
    label: "HDL",
    unidad: "mg/dL",
    color: "#27AE60",
    refMin: 40,   // <40 = bajo (factor de riesgo)
    refMax: 80,   // referencia orientativa superior saludable
  },
  {
    key: "ldl_mg_dl",
    label: "LDL",
    unidad: "mg/dL",
    color: "#E74C3C",
    refMin: null,
    refMax: 100,  // deseable <100 mg/dL
  },
  {
    key: "triglycerides_mg_dl",
    label: "Triglicéridos",
    unidad: "mg/dL",
    color: "#F39C12",
    refMin: null,
    refMax: 150,  // deseable <150 mg/dL
  },
  {
    key: "hba1c_percent",
    label: "HbA1c",
    unidad: "%",
    color: "#16A085",
    refMin: 4.0,  // límite inferior normal
    refMax: 5.7,  // <5.7% = normal; 5.7–6.4% = prediabetes
  },
  {
    key: "creatinine_mg_dl",
    label: "Creatinina",
    unidad: "mg/dL",
    color: "#8E44AD",
    refMin: 0.5,  // límite inferior adultos
    refMax: 1.2,  // límite superior adultos (promedio hombre/mujer)
  },
  {
    key: "urea_mg_dl",
    label: "Urea",
    unidad: "mg/dL",
    color: "#2C3E50",
    refMin: 12,   // límite inferior normal
    refMax: 54,   // límite superior normal
  },
  {
    key: "tsh_miu_l",
    label: "TSH",
    unidad: "mUI/L",
    color: "#C0392B",
    refMin: 0.4,  // límite inferior normal
    refMax: 4.0,  // límite superior normal
  },
];

function formatFecha(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year.slice(2)}`;
}

// Tooltip personalizado
function CustomTooltip({ active, payload, label, unidad, refMin, refMax }: {
  active?: boolean;
  payload?: { value: number; dataKey: string }[];
  label?: string;
  unidad: string;
  refMin: number | null;
  refMax: number | null;
}) {
  if (!active || !payload || payload.length === 0) return null;

  // Solo mostrar en el tooltip el punto del indicador real (dataKey="valor")
  const puntoReal = payload.find((p) => p.dataKey === "valor");
  if (!puntoReal) return null;

  const val = puntoReal.value;
  let estado: { texto: string; color: string } | null = null;

  if (refMin !== null && refMax !== null) {
    if (val < refMin) estado = { texto: "Por debajo del rango", color: "#E07B39" };
    else if (val > refMax) estado = { texto: "Por encima del rango", color: "#E74C3C" };
    else estado = { texto: "Dentro del rango", color: "#27AE60" };
  } else if (refMax !== null) {
    if (val > refMax) estado = { texto: "Por encima del rango", color: "#E74C3C" };
    else estado = { texto: "Dentro del rango", color: "#27AE60" };
  } else if (refMin !== null) {
    if (val < refMin) estado = { texto: "Por debajo del rango", color: "#E07B39" };
    else estado = { texto: "Dentro del rango", color: "#27AE60" };
  }

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
      <div style={{ fontWeight: 700, color: "#185FA5", marginBottom: "4px" }}>{label}</div>
      <div style={{ marginBottom: estado ? "4px" : 0 }}>
        {val} <span style={{ color: "#888780" }}>{unidad}</span>
      </div>
      {estado && (
        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: estado.color }}>
          {estado.texto}
        </div>
      )}
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
        const sorted = [...(d.records ?? [])].reverse();
        setRecords(sorted);
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  const indicadoresDisponibles = INDICADORES.filter((ind) =>
    records.some((r) => r[ind.key] !== null)
  );

  const indicadorActual = INDICADORES.find((i) => i.key === selectedKey) ?? INDICADORES[0];

  const chartData = records
    .filter((r) => r[selectedKey] !== null)
    .map((r) => ({
      fecha: formatFecha(r.recorded_at),
      valor: Number(r[selectedKey]),
    }));

  useEffect(() => {
    if (indicadoresDisponibles.length > 0) {
      const existe = indicadoresDisponibles.find((i) => i.key === selectedKey);
      if (!existe) {
        setSelectedKey(indicadoresDisponibles[0].key);
      }
    }
  }, [indicadoresDisponibles, selectedKey]);

  // Dominio dinámico del eje Y: incluye datos reales + líneas de referencia, con margen del 15%
  const yDomain = (() => {
    if (chartData.length === 0) return ["auto", "auto"] as ["auto", "auto"];
    const valores = chartData.map((d) => d.valor);
    const candidatos = [...valores];
    if (indicadorActual.refMin !== null) candidatos.push(indicadorActual.refMin);
    if (indicadorActual.refMax !== null) candidatos.push(indicadorActual.refMax);
    const minVal = Math.min(...candidatos);
    const maxVal = Math.max(...candidatos);
    const rango = maxVal - minVal || 1;
    const margen = rango * 0.15;
    const yMin = Math.floor(minVal - margen);
    const yMax = Math.ceil(maxVal + margen);
    return [yMin < 0 ? 0 : yMin, yMax] as [number, number];
  })();

  const tieneReferencia = indicadorActual.refMin !== null || indicadorActual.refMax !== null;

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
          display: "inline-block", fontSize: "0.82rem", fontWeight: 600,
          color: "#185FA5", border: "1px solid #B5D4F4", borderRadius: "8px",
          padding: "6px 14px", textDecoration: "none", background: "#F0F6FF",
        }}>
          Ir al Historial Clínico →
        </Link>
      </div>
    );
  }

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
          display: "inline-block", fontSize: "0.82rem", fontWeight: 600,
          color: "#185FA5", border: "1px solid #B5D4F4", borderRadius: "8px",
          padding: "6px 14px", textDecoration: "none", background: "#F0F6FF",
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
          fontSize: "0.78rem", fontWeight: 600, color: "#185FA5",
          textDecoration: "none", opacity: 0.8,
        }}>
          Ver historial completo →
        </Link>
      </div>

      {/* Selector de indicador */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.25rem" }}>
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
        <>
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
                domain={yDomain}
              />
              <Tooltip
                content={
                  <CustomTooltip
                    unidad={indicadorActual.unidad}
                    refMin={indicadorActual.refMin}
                    refMax={indicadorActual.refMax}
                  />
                }
              />

              {/* Línea de referencia MÍNIMA */}
              {indicadorActual.refMin !== null && (
                <ReferenceLine
                  y={indicadorActual.refMin}
                  stroke="#27AE60"
                  strokeDasharray="5 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Mín. ref. ${indicadorActual.refMin}`,
                    position: "insideBottomRight",
                    fontSize: 10,
                    fill: "#27AE60",
                    fontWeight: 600,
                  }}
                />
              )}

              {/* Línea de referencia MÁXIMA */}
              {indicadorActual.refMax !== null && (
                <ReferenceLine
                  y={indicadorActual.refMax}
                  stroke="#E74C3C"
                  strokeDasharray="5 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Máx. ref. ${indicadorActual.refMax}`,
                    position: "insideTopRight",
                    fontSize: 10,
                    fill: "#E74C3C",
                    fontWeight: 600,
                  }}
                />
              )}

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
                  style={{ fontSize: "11px", fontWeight: 600, fill: indicadorActual.color }}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>

          {/* Leyenda de referencias + disclaimer */}
          <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {tieneReferencia && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.75rem" }}>
                {indicadorActual.refMin !== null && (
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#27AE60" }}>
                    <span style={{ display: "inline-block", width: "18px", borderTop: "2px dashed #27AE60" }} />
                    Mínimo de referencia ({indicadorActual.refMin} {indicadorActual.unidad})
                  </span>
                )}
                {indicadorActual.refMax !== null && (
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#E74C3C" }}>
                    <span style={{ display: "inline-block", width: "18px", borderTop: "2px dashed #E74C3C" }} />
                    Máximo de referencia ({indicadorActual.refMax} {indicadorActual.unidad})
                  </span>
                )}
              </div>
            )}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.75rem", color: "#888780" }}>
              <span>{records.length} registro{records.length !== 1 ? "s" : ""} cargado{records.length !== 1 ? "s" : ""}</span>
              <span>Unidad: {indicadorActual.unidad}</span>
            </div>
            {tieneReferencia && (
              <p style={{ margin: 0, fontSize: "0.72rem", color: "#AAA8A3", lineHeight: 1.5 }}>
                ⚠️ Los rangos de referencia son valores poblacionales generales para adultos. Pueden variar según su condición de salud, sexo y laboratorio. Consultá siempre con su médico.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}