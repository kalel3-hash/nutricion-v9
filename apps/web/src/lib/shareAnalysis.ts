import html2canvas from "html2canvas";

function extractSummary(analysisText: string): string {
  const lines = analysisText.split("\n").map(l => l.trim()).filter(Boolean);
  const summaryLines: string[] = [];
  let inPuntaje = false;
  for (const line of lines) {
    if (/BLOQUE\s+1/i.test(line)) { inPuntaje = true; continue; }
    if (/BLOQUE\s+[2-9]/i.test(line)) break;
    if (inPuntaje && line.length > 10) {
      summaryLines.push(line.replace(/\*\*/g, "").replace(/\*/g, ""));
      if (summaryLines.length >= 3) break;
    }
  }
  return summaryLines.join(" ").slice(0, 220) || "Análisis personalizado con VitalCross AI.";
}

export async function shareAnalysisAsImage({
  foodDescription,
  score,
  analysisText,
}: {
  foodDescription: string;
  score: number | null;
  analysisText: string;
}) {
  const summary = extractSummary(analysisText);

  const scoreStyle =
    score === null ? { bg: "rgba(255,255,255,0.15)", text: "#FFFFFF" }
    : score <= 3   ? { bg: "#FEE2E2", text: "#991B1B" }
    : score <= 6   ? { bg: "#FAEEDA", text: "#854F0B" }
    :                { bg: "#EAF3DE", text: "#27500A" };

  const card = document.createElement("div");
  card.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: 420px; padding: 2rem;
    background: linear-gradient(135deg, #0C447C 0%, #185FA5 100%);
    font-family: system-ui, -apple-system, sans-serif;
    border-radius: 20px; box-sizing: border-box;
  `;

  card.innerHTML = `
    <div style="margin-bottom:1.25rem;">
      <span style="font-size:13px;font-weight:800;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:1.5px;">VitalCross AI</span>
    </div>

    <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Análisis de</div>
    <div style="font-size:1.1rem;font-weight:700;color:#FFFFFF;margin-bottom:1.25rem;line-height:1.35;">
      ${foodDescription.slice(0, 80)}
    </div>

    ${score !== null ? `
      <div style="display:inline-block;padding:8px 24px;border-radius:50px;
        background:${scoreStyle.bg};color:${scoreStyle.text};
        font-size:2.25rem;font-weight:800;margin-bottom:1.25rem;line-height:1;">
        ${score}<span style="font-size:1rem;font-weight:500;">/10</span>
      </div>
    ` : ""}

    <div style="font-size:0.85rem;color:rgba(255,255,255,0.82);line-height:1.75;margin-bottom:1.75rem;">
      ${summary}
    </div>

    <div style="border-top:1px solid rgba(255,255,255,0.15);padding-top:1rem;
      display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:0.72rem;color:rgba(255,255,255,0.45);">nutricion-v9.vercel.app</span>
      <span style="font-size:0.72rem;color:rgba(255,255,255,0.45);">Análisis personalizado con IA</span>
    </div>
  `;

  document.body.appendChild(card);

  try {
    const canvas = await html2canvas(card, {
      scale: 2,
      backgroundColor: null,
      logging: false,
      useCORS: true,
    });
    const link = document.createElement("a");
    link.download = `vitalcross-${foodDescription.slice(0, 25).replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } finally {
    document.body.removeChild(card);
  }
}