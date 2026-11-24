import { useEffect, useState } from "react";
import { Type, Sparkles, Image as ImageIcon, Upload, ScrollText, Palette } from "lucide-react";
import { useEditor } from "../store/editor";
import { useRegistry } from "../store/registry";
import { DECORATION_KEYS } from "../lib/decorations";
import { DecoThumb } from "./DecoThumb";
import { newId } from "./ids";
import { api } from "../api";
import type { DecorationElement, ShapeElement, TextElement, Wording } from "../types";
import { detectScript, directionForScript } from "../lib/scripts";

type Tab = "text" | "decorations" | "background" | "uploads" | "wording";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "text", label: "Text", icon: <Type size={16} /> },
  { id: "decorations", label: "Motifs", icon: <Sparkles size={16} /> },
  { id: "background", label: "Background", icon: <Palette size={16} /> },
  { id: "uploads", label: "Uploads", icon: <Upload size={16} /> },
  { id: "wording", label: "Wording", icon: <ScrollText size={16} /> },
];

const PALETTES = [
  { bg: "#fbf3e4", primary: "#7a1226", accent: "#b8860b", text: "#4a2c12" },
  { bg: "#13110c", primary: "#e8c877", accent: "#d4af37", text: "#e6dcc2" },
  { bg: "#fff6f3", primary: "#b23a5b", accent: "#e07a9a", text: "#5e2a3a" },
  { bg: "#f3fbfa", primary: "#0d6b63", accent: "#1b998b", text: "#0b3b36" },
  { bg: "#f3f6f4", primary: "#5b7a72", accent: "#c6a0a8", text: "#3f4f4a" },
  { bg: "#7a0e1f", primary: "#ffe9b0", accent: "#e8c877", text: "#ffe9b0" },
];

export default function LeftPanel() {
  const [tab, setTab] = useState<Tab>("text");
  const doc = useEditor((s) => s.doc);
  const addElement = useEditor((s) => s.addElement);
  const applyPalette = useEditor((s) => s.applyPalette);
  const setBackground = useEditor((s) => s.setBackground);
  const setImageBackground = useEditor((s) => s.setImageBackground);
  const updateDetail = useEditor((s) => s.updateDetail);
  const registry = useRegistry();
  const [wordings, setWordings] = useState<Wording[]>([]);

  useEffect(() => {
    api.listWordings().then(setWordings).catch(() => setWordings([]));
  }, []);

  if (!doc) return null;
  const p = doc.palette;

  const addText = (text: string, fontSize: number, weight = "normal") => {
    const script = detectScript(text);
    const font =
      script === "Latin" ? doc.fonts.en || "Cormorant Garamond" : registry.coveringFont(script, doc.fonts.kn);
    const el: TextElement = {
      id: newId("text"),
      type: "text",
      x: Math.round(doc.width / 2),
      y: Math.round(doc.height / 2),
      width: 760,
      rotation: 0,
      opacity: 1,
      locked: false,
      text,
      fontFamily: font,
      fontSize,
      fill: p.primary || "#7a1226",
      fontWeight: weight,
      fontStyle: "normal",
      textAlign: "center",
      lineHeight: 1.3,
      charSpacing: 0,
      locale: doc.primaryLocale,
      script,
      direction: directionForScript(script),
    };
    addElement(el);
  };

  const addDecoration = (asset: string) => {
    const el: DecorationElement = {
      id: newId("deco"),
      type: "decoration",
      asset,
      x: Math.round(doc.width / 2 - 100),
      y: Math.round(doc.height / 2 - 100),
      width: 200,
      height: 200,
      rotation: 0,
      opacity: 1,
      locked: false,
      fill: p.accent || "#b8860b",
    };
    addElement(el);
  };

  const addLine = () => {
    const el: ShapeElement = {
      id: newId("line"),
      type: "shape",
      shape: "line",
      x: Math.round(doc.width / 2 - 120),
      y: Math.round(doc.height / 2),
      width: 240,
      height: 2,
      rotation: 0,
      opacity: 1,
      locked: false,
      stroke: p.accent || "#b8860b",
      strokeWidth: 3,
    };
    addElement(el);
  };

  const onUpload = async (file: File, asBackground: boolean) => {
    try {
      const asset = await api.uploadAsset(file);
      if (asBackground) setImageBackground(asset.asset_path);
      else {
        const nw = asset.meta?.width;
        const nh = asset.meta?.height;
        const aspect = nw && nh ? nw / nh : 1;
        const w = 420;
        addElement({
          id: newId("img"),
          type: "image",
          src: asset.asset_path,
          x: Math.round(doc.width / 2 - w / 2),
          y: Math.round(doc.height / 2 - w / aspect / 2),
          width: w,
          height: Math.round(w / aspect),
          rotation: 0,
          opacity: 1,
          locked: false,
          naturalW: nw,
          naturalH: nh,
        });
      }
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <aside className="flex w-72 flex-col border-r border-stone-300 bg-ivory">
      <div className="flex border-b border-stone-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] ${
              tab === t.id ? "bg-maroon text-ivory" : "text-maroon hover:bg-stone-100"
            }`}
            title={t.label}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {tab === "text" && (
          <div className="space-y-2">
            <PanelBtn onClick={() => addText("Heading", 72, "bold")}>＋ Add heading</PanelBtn>
            <PanelBtn onClick={() => addText("Subheading", 44)}>＋ Add subheading</PanelBtn>
            <PanelBtn onClick={() => addText("Body text — double-click to edit", 30)}>＋ Add body text</PanelBtn>
            <PanelBtn onClick={() => addText("{{title}}", 80, "bold")}>＋ Title field</PanelBtn>
            <PanelBtn onClick={() => addText("{{event_date}}", 40)}>＋ Date field</PanelBtn>
            <PanelBtn onClick={addLine}>＋ Divider line</PanelBtn>
            <p className="pt-2 text-xs text-stone-500">
              Tip: fields like <code>{"{{venue}}"}</code> fill automatically from your card details and
              translate per language.
            </p>
          </div>
        )}

        {tab === "decorations" && (
          <div className="grid grid-cols-3 gap-2">
            {DECORATION_KEYS.map((k) => (
              <button
                key={k}
                onClick={() => addDecoration(k)}
                className="flex aspect-square items-center justify-center rounded-lg border border-stone-200 bg-white hover:border-gold"
                title={k.replace(/_/g, " ")}
              >
                <DecoThumb asset={k} color={p.accent} />
              </button>
            ))}
          </div>
        )}

        {tab === "background" && (
          <div className="space-y-4">
            <div>
              <p className="label">Theme palettes</p>
              <div className="grid grid-cols-3 gap-2">
                {PALETTES.map((pal, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      applyPalette(pal);
                      setBackground(pal.bg);
                    }}
                    className="h-12 overflow-hidden rounded-lg border border-stone-200"
                    style={{ background: pal.bg }}
                    title="Apply palette"
                  >
                    <span className="flex h-full">
                      <i className="flex-1" style={{ background: pal.primary }} />
                      <i className="flex-1" style={{ background: pal.accent }} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="label">Background colour</span>
              <input
                type="color"
                className="h-10 w-full rounded"
                value={doc.pages[doc.activePage].background.color || "#fbf3e4"}
                onChange={(e) => setBackground(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="label">Background image</span>
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0], true)} />
            </label>
          </div>
        )}

        {tab === "uploads" && (
          <div className="space-y-3">
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-maroon/30 p-6 text-center text-maroon/70 hover:bg-white">
              <ImageIcon size={28} />
              <span className="text-sm">Upload a photograph</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0], false)} />
            </label>
            <p className="text-xs text-stone-500">PNG, JPG or WebP up to 10 MB. Added to the canvas — drag, resize and position freely.</p>
          </div>
        )}

        {tab === "wording" && (
          <div className="space-y-2">
            <p className="text-xs text-stone-500">Insert a blessing into your invitation message, or add it as text.</p>
            {wordings.map((w) => (
              <div key={w.id} className="rounded-lg border border-stone-200 bg-white p-2">
                <p className="text-sm font-semibold text-maroon">{w.title}</p>
                <p className="mb-2 max-h-16 overflow-hidden text-xs text-stone-500">{w.body.slice(0, 120)}…</p>
                <div className="flex gap-2">
                  <button className="btn-ghost flex-1 py-1 text-xs" onClick={() => updateDetail("invitation_message", w.body)}>
                    Use as message
                  </button>
                  <button className="btn-ghost px-2 py-1 text-xs" onClick={() => addText(w.body, 30)}>
                    Add as text
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function PanelBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-left text-sm text-maroon hover:border-gold">
      {children}
    </button>
  );
}
