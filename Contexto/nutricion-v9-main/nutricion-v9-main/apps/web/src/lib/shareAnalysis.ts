function extractBlocks(analysisText: string): { title: string; content: string }[] {
  const titles: { index: number; raw: string; label: string }[] = [];
  let match;
  const re = /BLOQUE\s+\d+\s*[-–]\s*([A-ZÁÉÍÓÚÑ\s]+?):/gi;
  while ((match = re.exec(analysisText)) !== null) {
    titles.push({ index: match.index, raw: match[0], label: match[1].trim() });
  }
  if (titles.length === 0) return [{ title: "Analisis", content: analysisText }];
  return titles.map((t, i) => {
    const start = t.index + t.raw.length;
    const end = i + 1 < titles.length ? titles[i + 1].index : analysisText.length;
    return {
      title: t.label.charAt(0) + t.label.slice(1).toLowerCase(),
      content: analysisText.slice(start, end).trim().replace(/\*\*/g, "").replace(/\*/g, ""),
    };
  });
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.head.appendChild(s);
  });
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
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");

  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const W = 210;
  const MARGIN = 18;
  const INNER = W - MARGIN * 2;
  let y = 0;

  // ── Encabezado azul
  doc.setFillColor(12, 68, 124);
  doc.rect(0, 0, W, 42, "F");

  doc.setFontSize(9);
  doc.setTextColor(180, 210, 244);
  doc.setFont("helvetica", "bold");
  doc.text("VITALCROSS AI", MARGIN, 14);

  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  const titleText = foodDescription.slice(0, 90);
  const titleLines = doc.splitTextToSize(titleText, INNER - 60);
  doc.text(titleLines, MARGIN, 26);

  // Puntaje en encabezado
  if (score !== null) {
    const scoreR = score <= 3 ? [254, 226, 226] : score <= 6 ? [250, 238, 218] : [234, 243, 222];
    const scoreT = score <= 3 ? [153, 27, 27] : score <= 6 ? [133, 79, 11] : [39, 80, 10];
    doc.setFillColor(scoreR[0], scoreR[1], scoreR[2]);
    doc.roundedRect(W - MARGIN - 36, 8, 36, 26, 4, 4, "F");
    doc.setFontSize(22);
    doc.setTextColor(scoreT[0], scoreT[1], scoreT[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`${score}`, W - MARGIN - 28, 24);
    doc.setFontSize(11);
    doc.text("/10", W - MARGIN - 12, 24);
  }

  y = 52;

  // ── Bloques del analisis
  const blocks = extractBlocks(analysisText);
  const blockColors: Record<string, { bg: number[]; border: number[]; title: number[] }> = {
    default:                  { bg: [248, 251, 255], border: [181, 212, 244], title: [12, 68, 124] },
    puntaje:                  { bg: [248, 251, 255], border: [181, 212, 244], title: [12, 68, 124] },
    "analisis personalizado": { bg: [230, 241, 251], border: [133, 183, 235], title: [12, 68, 124] },
    "sugerencias de mejora":  { bg: [234, 243, 222], border: [192, 221, 151], title: [39, 80, 10] },
    fuentes:                  { bg: [241, 239, 232], border: [211, 209, 199], title: [68, 68, 65] },
  };

  function getColor(label: string) {
    const key = label.toLowerCase();
    for (const k of Object.keys(blockColors)) {
      if (key.includes(k)) return blockColors[k];
    }
    return blockColors.default;
  }

  for (const block of blocks) {
    const colors = getColor(block.title);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(block.content, INNER - 8);
    const blockH = 8 + lines.length * 5.5 + 8;

    // Verificar salto de pagina
    if (y + blockH > 275) {
      doc.addPage();
      y = 18;
    }

    // Fondo del bloque
    doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.4);
    doc.roundedRect(MARGIN, y, INNER, blockH, 3, 3, "FD");

    // Titulo del bloque
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colors.title[0], colors.title[1], colors.title[2]);
    doc.text(block.title.toUpperCase(), MARGIN + 4, y + 6);

    // Contenido
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(44, 44, 42);
    doc.text(lines, MARGIN + 4, y + 13);

    y += blockH + 5;
  }

  // ── Footer
  if (y > 260) { doc.addPage(); y = 18; }

  doc.setDrawColor(181, 212, 244);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y + 4, W - MARGIN, y + 4);
  y += 10;

  doc.setFontSize(8);
  doc.setTextColor(136, 135, 128);
  doc.setFont("helvetica", "normal");
  doc.text("www.vitalcrossai.com.ar", MARGIN, y);
  doc.text("Analisis personalizado con IA · No reemplaza consulta medica", W - MARGIN, y, { align: "right" });

  // ── Descargar
  const safeName = foodDescription.slice(0, 30).replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "") || "analisis";
  doc.save(`vitalcross-${safeName}.pdf`);
}