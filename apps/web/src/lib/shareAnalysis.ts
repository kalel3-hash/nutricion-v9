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
  return summaryLines.join(" ").slice(0, 240) || "Analisis personalizado con VitalCross AI.";
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
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
  const W = 840;
  const PADDING = 56;
  const INNER = W - PADDING * 2;

  // Canvas temporal para medir texto
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = W;
  tmpCanvas.height = 100;
  const tmpCtx = tmpCanvas.getContext("2d")!;

  // Calcular altura dinamica
  tmpCtx.font = "bold 28px system-ui, sans-serif";
  const titleLines = wrapText(tmpCtx, foodDescription.slice(0, 120), INNER);

  tmpCtx.font = "28px system-ui, sans-serif";
  const summaryLines = wrapText(tmpCtx, summary, INNER);

  const titleH = titleLines.length * 38;
  const summaryH = summaryLines.length * 42;
  const scoreH = score !== null ? 120 : 0;
  const H = 80 + 40 + titleH + 24 + scoreH + 24 + summaryH + 60 + 56;

  // Canvas real
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Fondo gradiente
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#0C447C");
  grad.addColorStop(1, "#185FA5");
  roundRect(ctx, 0, 0, W, H, 32);
  ctx.fillStyle = grad;
  ctx.fill();

  // Patron sutil de puntos
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  for (let x = 0; x < W; x += 32) {
    for (let y = 0; y < H; y += 32) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let y = 56;

  // Label VitalCross AI
  ctx.font = "bold 22px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.letterSpacing = "3px";
  ctx.fillText("VITALCROSS AI", PADDING, y);
  y += 48;

  // Label "ANALISIS DE"
  ctx.font = "500 20px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.letterSpacing = "1px";
  ctx.fillText("ANALISIS DE", PADDING, y);
  y += 10;

  // Titulo alimento
  ctx.font = "bold 28px system-ui, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.letterSpacing = "0px";
  for (const line of titleLines) {
    y += 38;
    ctx.fillText(line, PADDING, y);
  }
  y += 28;

  // Puntaje
  if (score !== null) {
    const scoreBg = score <= 3 ? "#FEE2E2" : score <= 6 ? "#FAEEDA" : "#EAF3DE";
    const scoreText = score <= 3 ? "#991B1B" : score <= 6 ? "#854F0B" : "#27500A";
    const badgeW = 180;
    const badgeH = 80;
    roundRect(ctx, PADDING, y, badgeW, badgeH, 40);
    ctx.fillStyle = scoreBg;
    ctx.fill();

    ctx.font = "bold 52px system-ui, sans-serif";
    ctx.fillStyle = scoreText;
    ctx.fillText(`${score}`, PADDING + 24, y + 58);

    ctx.font = "500 26px system-ui, sans-serif";
    ctx.fillStyle = scoreText;
    ctx.fillText("/10", PADDING + 24 + ctx.measureText(`${score}`).width + 4, y + 54);

    y += badgeH + 28;
  }

  // Separador
  ctx.beginPath();
  ctx.moveTo(PADDING, y);
  ctx.lineTo(W - PADDING, y);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.stroke();
  y += 28;

  // Resumen
  ctx.font = "20px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  for (const line of summaryLines) {
    ctx.fillText(line, PADDING, y);
    y += 34;
  }
  y += 20;

  // Footer
  ctx.beginPath();
  ctx.moveTo(PADDING, y);
  ctx.lineTo(W - PADDING, y);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.stroke();
  y += 28;

  ctx.font = "18px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillText("www.vitalcrossai.com.ar", PADDING, y);

  ctx.textAlign = "right";
  ctx.fillText("Analisis personalizado con IA", W - PADDING, y);
  ctx.textAlign = "left";

  // Descargar
  const link = document.createElement("a");
  const safeName = foodDescription.slice(0, 30).replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
  link.download = `vitalcross-${safeName || "analisis"}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}