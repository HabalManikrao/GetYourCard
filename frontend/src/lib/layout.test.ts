import { describe, it, expect } from "vitest";
import { analyzeLayout, autoFitFontSize, type Bounds, SAFE_MARGIN } from "./layout";

const page = { w: 1080, h: 1920 };

function text(id: string, left: number, top: number, width: number, height: number, label = "x"): Bounds {
  return { id, kind: "text", left, top, width, height, label };
}

describe("analyzeLayout", () => {
  it("flags text clipped beyond the right edge as an error", () => {
    const w = analyzeLayout([text("t1", 700, 400, 600, 80, "long line")], page.w, page.h);
    const clip = w.find((x) => x.type === "clip");
    expect(clip).toBeTruthy();
    expect(clip!.severity).toBe("error");
    expect(clip!.edges).toContain("right");
  });

  it("flags text clipped beyond the bottom edge", () => {
    const w = analyzeLayout([text("t1", 100, 1900, 400, 120)], page.w, page.h);
    expect(w.some((x) => x.type === "clip" && x.edges?.includes("bottom"))).toBe(true);
  });

  it("passes a well-placed, wrapped text block with no warnings", () => {
    const w = analyzeLayout([text("t1", 120, 400, 840, 160)], page.w, page.h);
    expect(w).toEqual([]);
  });

  it("warns (not errors) for text inside the page but past the safe margin", () => {
    const w = analyzeLayout([text("t1", SAFE_MARGIN - 20, 400, 300, 80)], page.w, page.h);
    expect(w.some((x) => x.type === "margin" && x.severity === "warn")).toBe(true);
    expect(w.some((x) => x.type === "clip")).toBe(false);
  });

  it("does NOT flag decorations that bleed off the edge", () => {
    const deco: Bounds = { id: "d1", kind: "decoration", left: -40, top: -40, width: 420, height: 420 };
    expect(analyzeLayout([deco], page.w, page.h)).toEqual([]);
  });

  it("detects overlapping text as a collision", () => {
    const w = analyzeLayout(
      [text("a", 300, 400, 400, 200, "A"), text("b", 350, 450, 400, 200, "B")],
      page.w,
      page.h,
    );
    expect(w.some((x) => x.type === "collision")).toBe(true);
  });
});

describe("autoFitFontSize", () => {
  it("keeps size when text already fits", () => {
    expect(autoFitFontSize(400, 840, 48)).toBe(48);
  });
  it("shrinks proportionally when too wide, respecting the floor", () => {
    expect(autoFitFontSize(1680, 840, 48)).toBe(24);
    expect(autoFitFontSize(100000, 840, 48)).toBe(14); // floored at MIN_FONT
  });
});
