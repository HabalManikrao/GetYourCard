// Fabric.js v6 canvas controller. Renders the active page of a DesignDocument,
// wires selection/drag/resize/rotate/text-edit back to the store, and exports a
// clean high-resolution raster (no selection handles) at any multiplier.
import * as fabric from "fabric";
import type {
  DecorationElement,
  DesignDocument,
  DesignElement,
  ImageElement,
  ShapeElement,
  TextElement,
} from "../types";
import { getDecoration } from "../lib/decorations";
import { resolveText, fontsInDoc } from "../lib/resolve";
import { ensureFonts } from "../lib/fontLoader";
import { analyzeLayout, type Bounds, type LayoutWarning } from "../lib/layout";

type AnyObj = fabric.FabricObject & { elementId?: string };

export interface CanvasCallbacks {
  onSelect: (id: string | null) => void;
  onModify: (id: string, patch: Partial<DesignElement>) => void;
  onTextEdited: (id: string, text: string) => void;
  onLayout?: (warnings: LayoutWarning[]) => void;
}

export class DesignCanvas {
  canvas: fabric.Canvas;
  private cb: CanvasCallbacks;
  private scale = 0.4;
  /** Set true while applying a store-driven re-render to ignore our own events. */
  suppressEvents = false;

  constructor(el: HTMLCanvasElement, cb: CanvasCallbacks) {
    this.cb = cb;
    this.canvas = new fabric.Canvas(el, {
      preserveObjectStacking: true,
      selection: true,
      backgroundColor: "#ffffff",
    });
    this.wire();
  }

  private wire() {
    const c = this.canvas;
    c.on("selection:created", (e) => this.emitSelect(e.selected?.[0] as AnyObj));
    c.on("selection:updated", (e) => this.emitSelect(e.selected?.[0] as AnyObj));
    c.on("selection:cleared", () => !this.suppressEvents && this.cb.onSelect(null));
    c.on("object:modified", (e) => this.emitModify(e.target as AnyObj));
    c.on("text:editing:exited", (e) => {
      const t = e.target as AnyObj & fabric.Textbox;
      if (t?.elementId && !this.suppressEvents) this.cb.onTextEdited(t.elementId, t.text || "");
    });
  }

  private emitSelect(obj?: AnyObj) {
    if (this.suppressEvents) return;
    this.cb.onSelect(obj?.elementId || null);
  }

  private emitModify(obj: AnyObj) {
    if (this.suppressEvents || !obj?.elementId) return;
    const patch: Partial<DesignElement> = {
      x: Math.round(obj.left ?? 0),
      y: Math.round(obj.top ?? 0),
      rotation: Math.round(obj.angle ?? 0),
    };
    if (obj.type === "textbox") {
      const tb = obj as fabric.Textbox;
      (patch as Partial<TextElement>).fontSize = Math.round((tb.fontSize ?? 40) * (tb.scaleY ?? 1));
      (patch as Partial<TextElement>).width = Math.round((tb.width ?? 400) * (tb.scaleX ?? 1));
    } else {
      patch.width = Math.round(obj.getScaledWidth());
      patch.height = Math.round(obj.getScaledHeight());
    }
    this.cb.onModify(obj.elementId, patch);
  }

  setZoom(containerW: number, containerH: number, doc: DesignDocument) {
    const pad = 32;
    const s = Math.min((containerW - pad) / doc.width, (containerH - pad) / doc.height);
    this.scale = Math.max(0.05, s);
    this.applyZoom();
  }

  zoomBy(factor: number) {
    this.scale = Math.min(2, Math.max(0.05, this.scale * factor));
    this.applyZoom();
  }

  private applyZoom() {
    const doc = this.lastDoc;
    if (!doc) return;
    this.canvas.setDimensions({ width: doc.width * this.scale, height: doc.height * this.scale });
    this.canvas.setZoom(this.scale);
    this.canvas.requestRenderAll();
  }

  get currentScale() {
    return this.scale;
  }

  private lastDoc: DesignDocument | null = null;

  /** Rebuild the canvas from the active page. */
  async render(doc: DesignDocument, selectedId: string | null) {
    this.lastDoc = doc;
    this.suppressEvents = true;
    const c = this.canvas;
    c.discardActiveObject();
    c.remove(...c.getObjects());

    const page = doc.pages[doc.activePage];
    c.backgroundImage = undefined;
    c.backgroundColor = page.background.color || "#ffffff";
    if (page.background.type === "image" && page.background.src) {
      try {
        const bg = await fabric.FabricImage.fromURL(page.background.src, { crossOrigin: "anonymous" });
        bg.set({ left: 0, top: 0, originX: "left", originY: "top" });
        bg.scaleX = doc.width / (bg.width || doc.width);
        bg.scaleY = doc.height / (bg.height || doc.height);
        c.backgroundImage = bg;
      } catch {
        /* keep colour background */
      }
    }

    // Preload fonts so first paint and export are correctly shaped.
    await ensureFonts(fontsInDoc(doc));
    // Drop any stale metrics measured before the webfonts applied, otherwise
    // Fabric wraps text using fallback-font widths and clips on export (F-01).
    fabric.cache.clearFontCache();

    let selected: AnyObj | null = null;
    for (const el of page.elements) {
      const obj = await this.build(el, doc);
      if (!obj) continue;
      (obj as AnyObj).elementId = el.id;
      obj.set({
        opacity: el.opacity ?? 1,
        angle: el.rotation ?? 0,
        selectable: !el.locked,
        evented: !el.locked,
        lockMovementX: el.locked,
        lockMovementY: el.locked,
      });
      c.add(obj);
      if (el.id === selectedId) selected = obj as AnyObj;
    }

    // Re-wrap every textbox now that the correct fonts are guaranteed loaded.
    this.remeasureText();

    this.applyZoom();
    if (selected) c.setActiveObject(selected);
    c.requestRenderAll();
    this.suppressEvents = false;

    // Dynamic layout analysis (overflow / clipping / collision) — never silent.
    if (this.cb.onLayout) this.cb.onLayout(this.computeLayoutWarnings(doc));
  }

  /** Measure laid-out bounds (design coords) and return layout warnings. */
  computeLayoutWarnings(doc: DesignDocument): LayoutWarning[] {
    const page = doc.pages[doc.activePage];
    const kindById = new Map(page.elements.map((e) => [e.id, e.type]));
    const labelById = new Map(
      page.elements.map((e) => [e.id, e.type === "text" ? (e as TextElement).text : e.type]),
    );
    const bounds: Bounds[] = [];
    for (const o of this.canvas.getObjects()) {
      const id = (o as AnyObj).elementId;
      if (!id) continue;
      const sw = o.getScaledWidth();
      const sh = o.getScaledHeight();
      const left = o.originX === "center" ? (o.left ?? 0) - sw / 2 : o.left ?? 0;
      const top = o.originY === "center" ? (o.top ?? 0) - sh / 2 : o.top ?? 0;
      bounds.push({
        id,
        kind: (kindById.get(id) as Bounds["kind"]) || "shape",
        left,
        top,
        width: sw,
        height: sh,
        label: labelById.get(id),
      });
    }
    return analyzeLayout(bounds, doc.width, doc.height);
  }

  /** Force text re-measurement/wrapping with the currently-loaded fonts. */
  private remeasureText() {
    for (const o of this.canvas.getObjects()) {
      if (o.type === "textbox") {
        const tb = o as fabric.Textbox;
        tb.initDimensions();
        tb.setCoords();
      }
    }
  }

  private async build(el: DesignElement, doc: DesignDocument): Promise<fabric.FabricObject | null> {
    switch (el.type) {
      case "text":
        return this.buildText(el, doc);
      case "decoration":
        return this.buildDecoration(el);
      case "shape":
        return this.buildShape(el);
      case "image":
        return this.buildImage(el);
      default:
        return null;
    }
  }

  private buildText(el: TextElement, doc: DesignDocument): fabric.Textbox {
    const tb = new fabric.Textbox(resolveText(el, doc), {
      left: el.x,
      top: el.y,
      width: el.width,
      originX: "center",
      originY: "top",
      fontFamily: `"${el.fontFamily}"`,
      fontSize: el.fontSize,
      fill: el.fill,
      fontWeight: el.fontWeight,
      fontStyle: el.fontStyle as fabric.Textbox["fontStyle"],
      textAlign: el.textAlign,
      lineHeight: el.lineHeight ?? 1.25,
      charSpacing: el.charSpacing ?? 0,
      direction: (el.direction || "ltr") as fabric.Textbox["direction"],
      editable: !el.locked,
      splitByGrapheme: false,
    });
    return tb;
  }

  private buildDecoration(el: DecorationElement): fabric.Group {
    const deco = getDecoration(el.asset);
    const paths = deco.paths.map(
      (p) =>
        new fabric.Path(p.d, {
          fill: el.fill,
          opacity: p.opacity ?? 1,
          fillRule: p.fillRule ?? "nonzero",
          strokeLineJoin: "round",
          selectable: false,
          objectCaching: false,
        }),
    );
    const group = new fabric.Group(paths, { originX: "left", originY: "top", left: el.x, top: el.y });
    const bw = group.width || 100;
    const bh = group.height || 100;
    group.set({ scaleX: (el.width || 100) / bw, scaleY: (el.height || el.width || 100) / bh });
    return group;
  }

  private buildShape(el: ShapeElement): fabric.FabricObject {
    if (el.shape === "line") {
      return new fabric.Line([0, 0, el.width, 0], {
        left: el.x,
        top: el.y,
        originX: "left",
        originY: "top",
        stroke: el.stroke || "#000",
        strokeWidth: el.strokeWidth || 2,
      });
    }
    return new fabric.Rect({
      left: el.x,
      top: el.y,
      width: el.width,
      height: el.height || 100,
      originX: "left",
      originY: "top",
      fill: el.fill || "",
      stroke: el.stroke || "",
      strokeWidth: el.strokeWidth || 0,
      rx: el.rx || 0,
      ry: el.rx || 0,
    });
  }

  private async buildImage(el: ImageElement): Promise<fabric.FabricObject | null> {
    try {
      const img = await fabric.FabricImage.fromURL(el.src, { crossOrigin: "anonymous" });
      img.set({ left: el.x, top: el.y, originX: "left", originY: "top" });
      // Apply a crop rectangle (natural pixels) if one is configured.
      if (el.cropW && el.cropH) {
        img.set({ cropX: el.cropX ?? 0, cropY: el.cropY ?? 0, width: el.cropW, height: el.cropH });
      }
      if (el.width) img.scaleToWidth(el.width);
      return img;
    } catch {
      return null;
    }
  }

  /** Select an object by element id without triggering selection callbacks. */
  selectById(id: string | null) {
    const c = this.canvas;
    this.suppressEvents = true;
    if (!id) {
      c.discardActiveObject();
    } else {
      const obj = c.getObjects().find((o) => (o as AnyObj).elementId === id);
      if (obj) c.setActiveObject(obj);
      else c.discardActiveObject();
    }
    c.requestRenderAll();
    this.suppressEvents = false;
  }

  /** Render a specific page and return its clean raster (used for export). */
  async renderPageDataURL(doc: DesignDocument, pageIndex: number, format: "png" | "jpeg", multiplier: number): Promise<string> {
    const original = doc.activePage;
    await this.render({ ...doc, activePage: pageIndex }, null);
    const url = await this.toDataURL(format, multiplier);
    await this.render({ ...doc, activePage: original }, null);
    return url;
  }

  /** Export the current design cleanly at `multiplier` device pixels per unit. */
  async toDataURL(format: "png" | "jpeg", multiplier: number, quality = 0.95): Promise<string> {
    const c = this.canvas;
    const active = c.getActiveObject();
    c.discardActiveObject();
    c.requestRenderAll();
    // Export maps design units (zoom-independent) to pixels via multiplier/scale.
    const data = c.toDataURL({
      format,
      quality,
      multiplier: multiplier / this.scale,
      enableRetinaScaling: false,
    });
    if (active) c.setActiveObject(active);
    c.requestRenderAll();
    return data;
  }

  dispose() {
    this.canvas.dispose();
  }
}
