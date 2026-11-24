// Dynamic layout engine: measures element bounds and detects overflow (text
// clipped beyond the page), safe-margin violations, and text-text collisions.
// Pure functions here are unit-tested; DesignCanvas feeds it measured bounds.

export const SAFE_MARGIN = 40; // design units (px at 1080-wide canvas)
export const MIN_FONT = 14; // minimum readable font size for auto-fit

export type LayoutMode = "manual" | "auto" | "locked";

export interface Bounds {
  id: string;
  kind: "text" | "decoration" | "shape" | "image";
  left: number;
  top: number;
  width: number;
  height: number;
  /** Human label for warnings (e.g. the text content or field). */
  label?: string;
}

export interface LayoutWarning {
  elementId: string;
  type: "clip" | "margin" | "collision";
  severity: "error" | "warn";
  message: string;
  edges?: string[];
}

function overlapArea(a: Bounds, b: Bounds): number {
  const x = Math.max(0, Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left));
  const y = Math.max(0, Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top));
  return x * y;
}

/**
 * Analyse laid-out element bounds against a page.
 * - Text extending beyond the page edges → "clip" (error): important text lost.
 * - Text outside the safe margin (but on-page) → "margin" (warn).
 * - Two text elements overlapping > 25% of the smaller → "collision" (warn).
 * Decorations/shapes may intentionally bleed to the edge and are not flagged for clipping.
 */
export function analyzeLayout(
  items: Bounds[],
  pageW: number,
  pageH: number,
  margin = SAFE_MARGIN,
): LayoutWarning[] {
  const warnings: LayoutWarning[] = [];
  const eps = 1.5;
  const texts = items.filter((i) => i.kind === "text");

  for (const t of texts) {
    const edges: string[] = [];
    if (t.left < -eps) edges.push("left");
    if (t.top < -eps) edges.push("top");
    if (t.left + t.width > pageW + eps) edges.push("right");
    if (t.top + t.height > pageH + eps) edges.push("bottom");
    if (edges.length) {
      warnings.push({
        elementId: t.id,
        type: "clip",
        severity: "error",
        edges,
        message: `Text "${(t.label || "").slice(0, 24)}" is clipped at the ${edges.join(", ")} edge`,
      });
      continue; // a clip is already the worst case; skip margin check
    }
    const mEdges: string[] = [];
    if (t.left < margin - eps) mEdges.push("left");
    if (t.top < margin - eps) mEdges.push("top");
    if (t.left + t.width > pageW - margin + eps) mEdges.push("right");
    if (t.top + t.height > pageH - margin + eps) mEdges.push("bottom");
    if (mEdges.length) {
      warnings.push({
        elementId: t.id,
        type: "margin",
        severity: "warn",
        edges: mEdges,
        message: `Text "${(t.label || "").slice(0, 24)}" extends past the safe margin (${mEdges.join(", ")})`,
      });
    }
  }

  // Text/text collisions.
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i];
      const b = texts[j];
      const ov = overlapArea(a, b);
      if (ov <= 0) continue;
      const smaller = Math.min(a.width * a.height, b.width * b.height) || 1;
      if (ov / smaller > 0.25) {
        warnings.push({
          elementId: a.id,
          type: "collision",
          severity: "warn",
          message: `Text "${(a.label || "").slice(0, 16)}" overlaps "${(b.label || "").slice(0, 16)}"`,
        });
      }
    }
  }

  return warnings;
}

/** Compute an auto-fit font size that keeps text within `maxWidth` lines,
 *  shrinking from `fontSize` toward MIN_FONT. Wrapping is handled by the canvas;
 *  this is the secondary constraint (never the only strategy). */
export function autoFitFontSize(
  measuredWidth: number,
  maxWidth: number,
  fontSize: number,
  min = MIN_FONT,
): number {
  if (measuredWidth <= maxWidth || measuredWidth <= 0) return fontSize;
  const scaled = Math.floor(fontSize * (maxWidth / measuredWidth));
  return Math.max(min, scaled);
}
