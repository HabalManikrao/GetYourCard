import { useMemo } from "react";
import {
  Bold, Italic, AlignLeft, AlignCenter, AlignRight, Copy, Trash2, Lock, Unlock,
  ChevronUp, ChevronDown, ArrowUpToLine, ArrowDownToLine, AlertTriangle, Layers,
} from "lucide-react";
import { useEditor } from "../store/editor";
import { useRegistry } from "../store/registry";
import { detectScript } from "../lib/scripts";
import { resolveText } from "../lib/resolve";
import type { DecorationElement, DesignElement, ImageElement, ShapeElement, TextElement } from "../types";

export default function RightPanel() {
  const doc = useEditor((s) => s.doc);
  const selectedId = useEditor((s) => s.selectedId);
  const select = useEditor((s) => s.select);

  const el = useMemo(() => {
    if (!doc || !selectedId) return null;
    return doc.pages[doc.activePage].elements.find((e) => e.id === selectedId) || null;
  }, [doc, selectedId]);

  if (!doc) return null;

  return (
    <aside className="flex w-72 flex-col border-l border-stone-300 bg-ivory">
      <div className="border-b border-stone-200 px-4 py-2 font-display text-lg text-maroon">
        {el ? "Properties" : "Layers & content"}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {el ? <Properties el={el} /> : <LayersAndContent />}
      </div>
      {el && (
        <div className="border-t border-stone-200 p-2 text-center text-xs text-stone-400">
          <button className="underline" onClick={() => select(null)}>
            Deselect
          </button>
        </div>
      )}
    </aside>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-2 block">
      <span className="mb-1 block text-xs font-medium text-stone-500">{label}</span>
      {children}
    </label>
  );
}

function Num({ value, onChange, onStart, min, max, step = 1 }: { value: number; onChange: (v: number) => void; onStart?: () => void; min?: number; max?: number; step?: number }) {
  return (
    <input
      type="number"
      className="input py-1.5"
      value={Math.round(value)}
      min={min}
      max={max}
      step={step}
      onFocus={onStart}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

function Properties({ el }: { el: DesignElement }) {
  const patch = useEditor((s) => s.patchElement);
  const pushHistory = useEditor((s) => s.pushHistory);
  const dup = useEditor((s) => s.duplicateElement);
  const del = useEditor((s) => s.deleteElement);
  const reorder = useEditor((s) => s.reorder);
  const toggleLock = useEditor((s) => s.toggleLock);

  const live = (p: Partial<DesignElement>) => patch(el.id, p, false);
  const commit = (p: Partial<DesignElement>) => patch(el.id, p, true);

  return (
    <div>
      {el.type === "text" && <TextProps el={el as TextElement} live={live} commit={commit} pushHistory={pushHistory} />}
      {el.type === "decoration" && <DecoProps el={el as DecorationElement} live={live} commit={commit} pushHistory={pushHistory} />}
      {el.type === "shape" && <ShapeProps el={el as ShapeElement} live={live} commit={commit} pushHistory={pushHistory} />}
      {el.type === "image" && <ImageProps el={el as ImageElement} commit={commit} />}

      <div className="my-3 h-px bg-stone-200" />
      <p className="mb-1 text-xs font-medium text-stone-500">Transform</p>
      <div className="grid grid-cols-2 gap-2">
        <Row label="X"><Num value={el.x} onStart={pushHistory} onChange={(v) => live({ x: v })} /></Row>
        <Row label="Y"><Num value={el.y} onStart={pushHistory} onChange={(v) => live({ y: v })} /></Row>
        <Row label="Width"><Num value={el.width} onStart={pushHistory} onChange={(v) => live({ width: v })} /></Row>
        {el.type !== "text" && <Row label="Height"><Num value={el.height || 0} onStart={pushHistory} onChange={(v) => live({ height: v })} /></Row>}
        <Row label="Rotation"><Num value={el.rotation} onStart={pushHistory} onChange={(v) => live({ rotation: v })} min={-180} max={180} /></Row>
      </div>

      <Row label={`Transparency ${Math.round((el.opacity ?? 1) * 100)}%`}>
        <input type="range" min={0} max={1} step={0.01} value={el.opacity ?? 1} className="w-full" onPointerDown={pushHistory} onChange={(e) => live({ opacity: Number(e.target.value) })} />
      </Row>

      <div className="my-3 h-px bg-stone-200" />
      <p className="mb-1 flex items-center gap-1 text-xs font-medium text-stone-500"><Layers size={12} /> Layer order</p>
      <div className="mb-3 grid grid-cols-4 gap-1">
        <IconTool title="To back" onClick={() => reorder(el.id, "back")}><ArrowDownToLine size={15} /></IconTool>
        <IconTool title="Backward" onClick={() => reorder(el.id, "backward")}><ChevronDown size={15} /></IconTool>
        <IconTool title="Forward" onClick={() => reorder(el.id, "forward")}><ChevronUp size={15} /></IconTool>
        <IconTool title="To front" onClick={() => reorder(el.id, "front")}><ArrowUpToLine size={15} /></IconTool>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button className="btn-ghost justify-center py-1.5" onClick={() => dup(el.id)} title="Duplicate"><Copy size={15} /></button>
        <button className="btn-ghost justify-center py-1.5" onClick={() => toggleLock(el.id)} title={el.locked ? "Unlock" : "Lock"}>
          {el.locked ? <Lock size={15} /> : <Unlock size={15} />}
        </button>
        <button className="btn justify-center py-1.5 text-red-700 hover:bg-red-50" onClick={() => del(el.id)} title="Delete"><Trash2 size={15} /></button>
      </div>
    </div>
  );
}

function IconTool({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button onClick={onClick} title={title} className="flex items-center justify-center rounded border border-stone-200 bg-white py-1.5 text-maroon hover:border-gold">
      {children}
    </button>
  );
}

function ColorRow({ label, value, onLive, onStart }: { label: string; value: string; onLive: (v: string) => void; onStart: () => void }) {
  return (
    <Row label={label}>
      <div className="flex items-center gap-2">
        <input type="color" className="h-8 w-10 rounded" value={value} onPointerDown={onStart} onChange={(e) => onLive(e.target.value)} />
        <input className="input py-1.5" value={value} onChange={(e) => onLive(e.target.value)} onFocus={onStart} />
      </div>
    </Row>
  );
}

function TextProps({ el, live, commit, pushHistory }: { el: TextElement; live: (p: Partial<TextElement>) => void; commit: (p: Partial<TextElement>) => void; pushHistory: () => void }) {
  const doc = useEditor((s) => s.doc)!;
  const registry = useRegistry();
  const resolved = resolveText(el, doc);
  // Always detect from the CURRENT text so coverage warnings stay correct after
  // the text is edited (a stale el.script would hide missing-glyph warnings).
  const script = detectScript(resolved) || el.script || "Latin";
  const covers = registry.fontCovers(el.fontFamily, script);
  const coveringFonts = registry.fontsForScript(script);
  const allFonts = registry.fonts;
  const fontList = coveringFonts.length ? coveringFonts : allFonts;

  const autoFix = () => {
    pushHistory();
    live({ fontFamily: registry.coveringFont(script, doc.fonts.kn) });
  };

  return (
    <div>
      <Row label="Text">
        <textarea
          className="input min-h-20 py-1.5"
          value={el.text}
          onFocus={pushHistory}
          onChange={(e) => live({ text: e.target.value })}
        />
      </Row>

      {!covers && (
        <div className="mb-2 flex items-start gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <div>
            <b>{el.fontFamily}</b> may not cover the {script} script — glyphs could be missing.
            <button className="mt-1 block font-semibold underline" onClick={autoFix}>
              Switch to a {script}-compatible font
            </button>
          </div>
        </div>
      )}

      <Row label={`Font (${script})`}>
        <select className="input py-1.5" value={el.fontFamily} onChange={(e) => { pushHistory(); live({ fontFamily: e.target.value }); }}>
          {!fontList.find((f) => f.family === el.fontFamily) && <option value={el.fontFamily}>{el.fontFamily}</option>}
          {fontList.map((f) => (
            <option key={f.family} value={f.family}>
              {f.family}
            </option>
          ))}
        </select>
      </Row>

      <div className="grid grid-cols-2 gap-2">
        <Row label="Size"><Num value={el.fontSize} onStart={pushHistory} onChange={(v) => live({ fontSize: v })} min={6} max={400} /></Row>
        <Row label="Line height"><Num value={el.lineHeight} onStart={pushHistory} step={0.05} onChange={(v) => live({ lineHeight: v })} min={0.8} max={3} /></Row>
      </div>
      <Row label={`Letter spacing ${el.charSpacing}`}>
        <input type="range" min={-50} max={300} value={el.charSpacing} className="w-full" onPointerDown={pushHistory} onChange={(e) => live({ charSpacing: Number(e.target.value) })} />
      </Row>

      <ColorRow label="Colour" value={el.fill} onStart={pushHistory} onLive={(v) => live({ fill: v })} />

      <div className="mb-2 flex gap-1">
        <Toggle active={el.fontWeight === "bold"} onClick={() => commit({ fontWeight: el.fontWeight === "bold" ? "normal" : "bold" })}><Bold size={15} /></Toggle>
        <Toggle active={el.fontStyle === "italic"} onClick={() => commit({ fontStyle: el.fontStyle === "italic" ? "normal" : "italic" })}><Italic size={15} /></Toggle>
        <span className="mx-1 w-px bg-stone-200" />
        <Toggle active={el.textAlign === "left"} onClick={() => commit({ textAlign: "left" })}><AlignLeft size={15} /></Toggle>
        <Toggle active={el.textAlign === "center"} onClick={() => commit({ textAlign: "center" })}><AlignCenter size={15} /></Toggle>
        <Toggle active={el.textAlign === "right"} onClick={() => commit({ textAlign: "right" })}><AlignRight size={15} /></Toggle>
      </div>

      <Row label="Language direction">
        <select className="input py-1.5" value={el.direction || "ltr"} onChange={(e) => commit({ direction: e.target.value as "ltr" | "rtl" })}>
          <option value="ltr">Left → Right</option>
          <option value="rtl">Right → Left (RTL)</option>
        </select>
      </Row>
    </div>
  );
}

function DecoProps({ el, live, pushHistory }: { el: DecorationElement; live: (p: Partial<DecorationElement>) => void; commit: (p: Partial<DecorationElement>) => void; pushHistory: () => void }) {
  return <ColorRow label="Colour" value={el.fill} onStart={pushHistory} onLive={(v) => live({ fill: v })} />;
}

function ShapeProps({ el, live, pushHistory }: { el: ShapeElement; live: (p: Partial<ShapeElement>) => void; commit: (p: Partial<ShapeElement>) => void; pushHistory: () => void }) {
  return (
    <div>
      {el.shape === "rect" && <ColorRow label="Fill" value={el.fill || "#000000"} onStart={pushHistory} onLive={(v) => live({ fill: v })} />}
      <ColorRow label="Stroke" value={el.stroke || "#b8860b"} onStart={pushHistory} onLive={(v) => live({ stroke: v })} />
      <Row label="Stroke width"><Num value={el.strokeWidth || 0} onStart={pushHistory} onChange={(v) => live({ strokeWidth: v })} min={0} max={40} /></Row>
    </div>
  );
}

function ImageProps({ el, commit }: { el: ImageElement; commit: (p: Partial<ImageElement>) => void }) {
  const nw = el.naturalW;
  const nh = el.naturalH;
  const canCrop = !!(nw && nh);

  const applyAspect = (ar: number | null) => {
    if (!nw || !nh) return;
    if (ar === null) {
      // Free / reset: remove crop, restore natural aspect.
      commit({ cropX: undefined, cropY: undefined, cropW: undefined, cropH: undefined, height: Math.round(el.width * (nh / nw)) });
      return;
    }
    let cropW: number, cropH: number;
    if (nw / nh > ar) {
      cropH = nh;
      cropW = Math.round(nh * ar);
    } else {
      cropW = nw;
      cropH = Math.round(nw / ar);
    }
    commit({
      cropX: Math.round((nw - cropW) / 2),
      cropY: Math.round((nh - cropH) / 2),
      cropW,
      cropH,
      height: Math.round(el.width / ar),
    });
  };

  return (
    <div>
      <p className="mb-1 text-xs font-medium text-stone-500">Crop</p>
      {!canCrop && <p className="mb-2 text-xs text-amber-600">Crop presets need the image's natural size (re-upload to enable).</p>}
      <div className="grid grid-cols-2 gap-2">
        <IconTool title="Free (reset crop)" onClick={() => applyAspect(null)}>Free</IconTool>
        <IconTool title="Square 1:1" onClick={() => applyAspect(1)}>1:1</IconTool>
        <IconTool title="Portrait 3:4" onClick={() => applyAspect(3 / 4)}>3:4</IconTool>
        <IconTool title="Landscape 4:3" onClick={() => applyAspect(4 / 3)}>4:3</IconTool>
      </div>
      {el.cropW ? <p className="mt-2 text-xs text-stone-500">Cropped to {el.cropW}×{el.cropH}px</p> : null}
    </div>
  );
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`flex h-8 w-8 items-center justify-center rounded ${active ? "bg-maroon text-ivory" : "bg-white text-maroon hover:bg-stone-100"}`}>
      {children}
    </button>
  );
}

/** When nothing is selected: layer list + per-language content editor. */
function LayersAndContent() {
  const doc = useEditor((s) => s.doc)!;
  const select = useEditor((s) => s.select);
  const updateLayerContent = useEditor((s) => s.updateLayerContent);
  const updateDetail = useEditor((s) => s.updateDetail);
  const page = doc.pages[doc.activePage];
  const primary = doc.languages.find((l) => l.locale === doc.primaryLocale);

  const contentKeys = primary ? Object.keys(primary.content) : [];
  // Occasion-agnostic: show whatever structured fields this project actually has.
  const detailKeys = Object.keys(doc.details).filter((k) => doc.details[k] !== undefined);

  return (
    <div>
      <p className="mb-1 text-xs font-medium text-stone-500">Elements on this page</p>
      <div className="mb-4 max-h-48 overflow-y-auto rounded-lg border border-stone-200 bg-white">
        {[...page.elements].reverse().map((e) => (
          <button key={e.id} onClick={() => select(e.id)} className="flex w-full items-center justify-between px-2 py-1.5 text-left text-xs hover:bg-ivory">
            <span className="truncate text-maroon">
              {e.type === "text" ? `“${(e as TextElement).text.slice(0, 20)}”` : e.type === "decoration" ? (e as DecorationElement).asset : e.type}
            </span>
            <span className="text-stone-400">{e.locked ? "🔒" : e.type[0].toUpperCase()}</span>
          </button>
        ))}
        {page.elements.length === 0 && <p className="p-3 text-xs text-stone-400">Empty page — add text or motifs from the left.</p>}
      </div>

      <p className="mb-1 text-xs font-medium text-stone-500">Card details (all languages)</p>
      <div className="mb-4 space-y-2">
        {detailKeys.map((k) => (
          <label key={k} className="block">
            <span className="mb-0.5 block text-[11px] capitalize text-stone-400">{String(k).replace(/_/g, " ")}</span>
            <input className="input py-1.5" value={doc.details[k] || ""} onChange={(e) => updateDetail(String(k), e.target.value)} />
          </label>
        ))}
      </div>

      {primary && (
        <>
          <p className="mb-1 text-xs font-medium text-stone-500">
            {primary.languageName} wording {primary.verified === false && <span className="text-amber-600">(unverified)</span>}
          </p>
          <div className="space-y-2">
            {contentKeys.map((k) => (
              <label key={k} className="block">
                <span className="mb-0.5 block text-[11px] capitalize text-stone-400">{k.replace(/_/g, " ")}</span>
                <textarea
                  className="input py-1.5"
                  dir={primary.direction}
                  value={primary.content[k]}
                  onChange={(e) => updateLayerContent(primary.locale, k, e.target.value)}
                />
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
