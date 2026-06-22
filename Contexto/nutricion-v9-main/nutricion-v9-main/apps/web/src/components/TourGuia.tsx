"use client";

import { useEffect, useState } from "react";

export type TourStep = {
  targetId: string;
  title: string;
  description: string;
};

type Props = {
  steps: TourStep[];
  storageKey: string;
  onComplete?: () => void;
};

export default function TourGuia({ steps, storageKey, onComplete }: Props) {
  const [active, setActive] = useState(false);
  const [current, setCurrent] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const done = localStorage.getItem(storageKey);
    if (!done) {
      setTimeout(() => setActive(true), 800);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!active) return;
    const step = steps[current];
    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      }, 400);
    }
  }, [active, current, steps]);

  const next = () => {
    if (current < steps.length - 1) {
      setCurrent(c => c + 1);
    } else {
      finish();
    }
  };

  const finish = () => {
    localStorage.setItem(storageKey, "true");
    setActive(false);
    onComplete?.();
  };

  if (!active || !targetRect) return null;

  const step = steps[current];
  const padding = 10;
  const spotX = targetRect.left - padding;
  const spotY = targetRect.top - padding;
  const spotW = targetRect.width + padding * 2;
  const spotH = targetRect.height + padding * 2;

  const viewportH = window.innerHeight;
  const viewportW = window.innerWidth;
  const tooltipW = Math.min(300, viewportW - 24);
  const tooltipH = 170;

  let tooltipTop = spotY + spotH + 16;
  let tooltipLeft = spotX + spotW / 2 - tooltipW / 2;

  if (tooltipTop + tooltipH > viewportH - 20) {
    tooltipTop = spotY - tooltipH - 16;
  }
  if (tooltipTop < 12) tooltipTop = 12;
  if (tooltipLeft < 12) tooltipLeft = 12;
  if (tooltipLeft + tooltipW > viewportW - 12) tooltipLeft = viewportW - tooltipW - 12;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none" }}>
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "all" }}
        onClick={finish}
      >
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect x={spotX} y={spotY} width={spotW} height={spotH} rx="10" fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#tour-mask)" />
      </svg>

      <div style={{
        position: "absolute",
        left: spotX, top: spotY, width: spotW, height: spotH,
        borderRadius: "10px",
        border: "2px solid #378ADD",
        boxShadow: "0 0 0 4px rgba(55,138,221,0.25)",
        pointerEvents: "none",
      }} />

      <div
        style={{
          position: "absolute",
          top: tooltipTop,
          left: tooltipLeft,
          width: tooltipW,
          background: "#FFFFFF",
          borderRadius: "14px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          border: "1px solid #B5D4F4",
          padding: "1.25rem",
          pointerEvents: "all",
          zIndex: 10000,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#888780", textTransform: "uppercase", letterSpacing: "0.4px" }}>
            Paso {current + 1} de {steps.length}
          </span>
          <button onClick={finish} style={{ background: "none", border: "none", color: "#888780", fontSize: "0.75rem", cursor: "pointer", padding: 0 }}>
            Saltar guia
          </button>
        </div>

        <p style={{ margin: "0 0 0.4rem", fontSize: "0.95rem", fontWeight: 700, color: "#0C447C" }}>
          {step.title}
        </p>
        <p style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: "#5F5E5A", lineHeight: 1.6 }}>
          {step.description}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            {steps.map((_, i) => (
              <div key={i} style={{
                width: i === current ? "18px" : "6px",
                height: "6px", borderRadius: "3px",
                background: i === current ? "#185FA5" : "#B5D4F4",
                transition: "width 0.2s",
              }} />
            ))}
          </div>
          <button onClick={next} style={{
            padding: "7px 18px", borderRadius: "8px",
            background: "#185FA5", color: "#FFFFFF",
            border: "none", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
          }}>
            {current < steps.length - 1 ? "Siguiente" : "Entendido"}
          </button>
        </div>
      </div>
    </div>
  );
}