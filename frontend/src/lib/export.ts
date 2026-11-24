// Export engine. Rasterizes the live canvas (glyphs already shaped by the
// browser, so every script/RTL language survives) and packages PNG/JPG/PDF.
import { jsPDF } from "jspdf";

export type ExportFormat = "png" | "jpg" | "pdf";
export type Quality = "standard" | "high" | "print" | "whatsapp";
export type PageFormat = "digital" | "a5" | "a4";

/** Device-pixels-per-design-unit multiplier for each quality tier. */
export function multiplierFor(quality: Quality): number {
  switch (quality) {
    case "standard":
      return 1; // 1080px wide
    case "high":
      return 2; // 2160px wide
    case "print":
      return 2.8; // ≈ 300+ DPI at A5
    case "whatsapp":
      return 1; // compact, portrait, readable
  }
}

const MM: Record<Exclude<PageFormat, "digital">, [number, number]> = {
  a5: [148, 210],
  a4: [210, 297],
};

export interface RenderedPage {
  dataURL: string;
  wPx: number;
  hPx: number;
  /** Card background colour, used to fill letterbox bars on paper formats. */
  bgColor?: string;
}

/** How the design maps onto a physical page of a different aspect ratio. */
export type FitMode = "contain" | "cover" | "stretch";

/** An invisible, selectable/searchable text run overlaid on a digital PDF page
 *  (Latin-script text only; complex scripts stay rasterized). Coords in output px. */
export interface PdfTextItem {
  text: string;
  x: number;
  y: number;
  size: number;
  maxWidth: number;
  align: "left" | "center" | "right";
}

function hexToRgb(hex?: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return [255, 255, 255];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Build a (possibly multi-page) PDF from rendered raster pages.
 *  `fitMode` defaults to "contain" so wedding names/dates/venue are NEVER cropped. */
export function buildPDF(
  pages: RenderedPage[],
  pageFormat: PageFormat,
  bleedMm = 0,
  fitMode: FitMode = "contain",
  textLayers?: PdfTextItem[][],
): Blob {
  const first = pages[0];
  let doc: jsPDF;

  if (pageFormat === "digital") {
    doc = new jsPDF({ orientation: first.hPx >= first.wPx ? "portrait" : "landscape", unit: "px", format: [first.wPx, first.hPx] });
  } else {
    const [w, h] = MM[pageFormat];
    doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [w, h] });
  }

  pages.forEach((p, i) => {
    if (i > 0) {
      if (pageFormat === "digital") doc.addPage([p.wPx, p.hPx], p.hPx >= p.wPx ? "portrait" : "landscape");
      else doc.addPage();
    }
    if (pageFormat === "digital") {
      // Digital page matches the design aspect exactly — no fitting needed.
      doc.addImage(p.dataURL, "PNG", 0, 0, p.wPx, p.hPx, undefined, "FAST");
      // Overlay an invisible, selectable text layer (Latin) so the PDF is searchable.
      const items = textLayers?.[i];
      if (items?.length) {
        doc.setTextColor(0, 0, 0);
        for (const it of items) {
          try {
            doc.setFontSize(it.size * 0.75); // px → pt
            doc.text(it.text, it.x, it.y, {
              align: it.align,
              maxWidth: it.maxWidth,
              baseline: "top",
              renderingMode: "invisible",
            });
          } catch {
            /* skip glyphs the base font can't encode */
          }
        }
      }
      return;
    }

    const [pw, ph] = MM[pageFormat];
    const aspect = p.wPx / p.hPx;
    const pageAspect = pw / ph;

    // Fill the page with the card background so letterbox bars look intentional.
    const [r, g, b] = hexToRgb(p.bgColor);
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, pw, ph, "F");

    let drawW: number;
    let drawH: number;
    if (fitMode === "stretch") {
      drawW = pw;
      drawH = ph;
    } else if (fitMode === "cover") {
      // Fill the page (+bleed), cropping overflow.
      if (aspect > pageAspect) {
        drawH = ph + bleedMm * 2;
        drawW = drawH * aspect;
      } else {
        drawW = pw + bleedMm * 2;
        drawH = drawW / aspect;
      }
    } else {
      // contain (default): fit the WHOLE design inside the page — no cropping.
      if (aspect > pageAspect) {
        drawW = pw;
        drawH = pw / aspect;
      } else {
        drawH = ph;
        drawW = ph * aspect;
      }
    }
    const x = (pw - drawW) / 2;
    const y = (ph - drawH) / 2;
    doc.addImage(p.dataURL, "PNG", x, y, drawW, drawH, undefined, "FAST");
  });

  return doc.output("blob");
}

export function dataURLToBlob(dataURL: string): Blob {
  const [head, body] = dataURL.split(",");
  const mime = head.match(/:(.*?);/)?.[1] || "image/png";
  const bin = atob(body);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function safeFilename(name: string): string {
  return (name || "invitation").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "invitation";
}
