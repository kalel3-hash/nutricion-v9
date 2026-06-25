// apps/web/src/components/UsageBadge.tsx
"use client";

import { useEffect, useState, useRef } from "react";

type UsageStatus = {
  daily_used: number;
  daily_limit: number;
  monthly_used: number;
  monthly_limit: number;
};

export default function UsageBadge() {
  const [usage, setUsage] = useState<UsageStatus | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then(r => r.json())
      .then(setUsage)
      .catch(() => null);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDetail(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!usage) return null;

  const dailyPct  = Math.min((usage.daily_used  / usage.daily_limit)  * 100, 100);
  const dailyFull = usage.daily_used >= usage.daily_limit;
  const barColor  = dailyFull ? "#DC2626" : dailyPct >= 80 ? "#D97706" : "#185FA5";

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={() => setShowDetail(v => !v)}
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          background: "#F0F6FF", border: "1.5px solid #B5D4F4",
          borderRadius: "8px", padding: "5px 10px", cursor: "pointer",
        }}
      >
        <span style={{ fontSize: "11px", fontWeight: 700, color: barColor, whiteSpace: "nowrap" }}>
          {usage.daily_used}/{usage.daily_limit}
          <span style={{ fontWeight: 400, color: "#888780", marginLeft: "3px" }}>hoy</span>
        </span>
        <div style={{ width: "36px", height: "4px", background: "#E6F1FB", borderRadius: "4px", flexShrink: 0 }}>
          <div style={{
            height: "100%", width: `${dailyPct}%`,
            background: barColor, borderRadius: "4px", transition: "width 0.4s",
          }} />
        </div>
      </button>

      {showDetail && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: "#FFFFFF", border: "1px solid #B5D4F4",
          borderRadius: "10px", padding: "0.875rem 1rem", minWidth: "200px",
          boxShadow: "0 8px 24px rgba(24,95,165,0.12)", zIndex: 200,
        }}>
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.72rem", fontWeight: 700, color: "#888780", textTransform: "uppercase" }}>
            Uso de consultas
          </p>
          <DetailRow label="Consultas hoy" used={usage.daily_used}   limit={usage.daily_limit} />
          <DetailRow label="Este mes"      used={usage.monthly_used} limit={usage.monthly_limit} />
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct   = Math.min((used / limit) * 100, 100);
  const color = pct >= 100 ? "#DC2626" : pct >= 80 ? "#D97706" : "#185FA5";
  return (
    <div style={{ marginBottom: "0.625rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "0.75rem", color: "#5F5E5A" }}>{label}</span>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color }}>{used}/{limit}</span>
      </div>
      <div style={{ height: "4px", background: "#E6F1FB", borderRadius: "4px" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "4px", transition: "width 0.3s" }} />
      </div>
    </div>
  );
}