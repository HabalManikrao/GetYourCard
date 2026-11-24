import { useState } from "react";
import { Link } from "react-router-dom";
import { Undo2, Redo2, Save, Download, Home, PanelLeft, PanelRight, Loader2, Check } from "lucide-react";
import { useEditor } from "../store/editor";
import type { DesignCanvas } from "./DesignCanvas";
import {
  buildPDF,
  dataURLToBlob,
  downloadBlob,
  multiplierFor,
  safeFilename,
  type ExportFormat,
  type PageFormat,
  type PdfTextItem,
  type Quality,
  type RenderedPage,
} from "../lib/export";
import { api } from "../api";
import { resolveText } from "../lib/resolve";
import { detectScript } from "../lib/scripts";
import type { TextElement } from "../types";

interface Props {
  dcRef: React.MutableRefObject<DesignCanvas | null>;
  saveNow: () => Promise<void>;
  onToggleLeft: () => void;
  onToggleRight: () => void;
}

export default function TopToolbar({ dcRef, saveNow, onToggleLeft, onToggleRight }: Props) {
  const { undo, redo, canUndo, canRedo, projectName, setProjectName, dirty } = useEditor();
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [menu, setMenu] = useState(false);

  const doSave = async () => {
    setSaving(true);
    await saveNow();
    setSaving(false);
  };

  const doExport = async (format: ExportFormat, quality: Quality, pageFormat: PageFormat, allPages: boolean) => {
    const dc = dcRef.current;
    const s = useEditor.getState();
    if (!dc || !s.doc || !s.projectId) return;
    setExporting(true);
    setMenu(false);
    try {
      const mult = multiplierFor(quality);
      const imgType = format === "jpg" ? "jpeg" : "png";
      const pageIdxs = allPages ? s.doc.pages.map((_, i) => i) : [s.doc.activePage];
      const bgColor = s.doc.pages[s.doc.activePage]?.background?.color || s.doc.palette?.bg;
      const rendered: RenderedPage[] = [];
      for (const i of pageIdxs) {
        const dataURL = await dc.renderPageDataURL(s.doc, i, imgType, mult);
        rendered.push({
          dataURL,
          wPx: Math.round(s.doc.width * mult),
          hPx: Math.round(s.doc.height * mult),
          bgColor: s.doc.pages[i]?.background?.color || bgColor,
        });
      }
      const base = safeFilename(s.projectName);
      let blob: Blob;
      let ext = format;
      if (format === "pdf") {
        // Invisible, selectable Latin text layer (digital PDFs) so output is searchable (F-04).
        let textLayers: PdfTextItem[][] | undefined;
        if (pageFormat === "digital") {
          textLayers = pageIdxs.map((i) => {
            const items: PdfTextItem[] = [];
            for (const el of s.doc!.pages[i].elements) {
              if (el.type !== "text") continue;
              const t = el as TextElement;
              const resolved = resolveText(t, s.doc!);
              if (!resolved.trim() || detectScript(resolved) !== "Latin") continue; // Latin only
              items.push({
                text: resolved,
                x: t.x * mult,
                y: t.y * mult,
                size: t.fontSize * mult,
                maxWidth: t.width * mult,
                align: t.textAlign,
              });
            }
            return items;
          });
        }
        // contain-fit: never crop names/dates/venue on A4/A5 (F-05).
        blob = buildPDF(rendered, pageFormat, 0, "contain", textLayers);
      } else {
        blob = dataURLToBlob(rendered[0].dataURL);
      }
      downloadBlob(blob, `${base}.${ext}`);

      // Record export server-side (best-effort; download already succeeded).
      try {
        const payloadData =
          format === "pdf" ? await blobToDataURL(blob) : rendered[0].dataURL;
        await api.createExport({
          project_id: s.projectId,
          export_format: format,
          resolution: `${Math.round(s.doc.width * mult)}x${Math.round(s.doc.height * mult)} (${quality})`,
          data: payloadData,
        });
      } catch {
        /* non-fatal */
      }
    } finally {
      setExporting(false);
      await dcRef.current?.render(useEditor.getState().doc!, useEditor.getState().selectedId);
    }
  };

  return (
    <div className="flex items-center gap-2 border-b border-stone-300 bg-ivory px-3 py-2">
      <Link to="/" className="rounded p-2 text-maroon hover:bg-stone-100" title="Dashboard">
        <Home size={18} />
      </Link>
      <input
        className="w-48 rounded border border-transparent bg-transparent px-2 py-1 font-display text-lg text-maroon hover:border-stone-300 focus:border-gold focus:outline-none"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        aria-label="Project name"
      />
      <span className="text-xs text-stone-400">{dirty ? "Unsaved" : "Saved"}</span>

      <div className="mx-auto flex items-center gap-1">
        <IconBtn onClick={undo} disabled={!canUndo()} title="Undo (Ctrl+Z)">
          <Undo2 size={18} />
        </IconBtn>
        <IconBtn onClick={redo} disabled={!canRedo()} title="Redo (Ctrl+Shift+Z)">
          <Redo2 size={18} />
        </IconBtn>
      </div>

      <button className="rounded p-2 text-maroon hover:bg-stone-100 lg:hidden" onClick={onToggleLeft} title="Toggle tools">
        <PanelLeft size={18} />
      </button>
      <button className="rounded p-2 text-maroon hover:bg-stone-100 lg:hidden" onClick={onToggleRight} title="Toggle properties">
        <PanelRight size={18} />
      </button>

      <button className="btn-ghost py-1.5" onClick={doSave} disabled={saving}>
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
      </button>

      <div className="relative">
        <button className="btn-primary py-1.5" onClick={() => setMenu((m) => !m)} disabled={exporting}>
          {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Download
        </button>
        {menu && (
          <div className="absolute right-0 top-11 z-20 w-64 rounded-lg border border-stone-200 bg-white p-2 shadow-xl">
            <MenuSection title="Image (current page)">
              <MenuItem onClick={() => doExport("png", "high", "digital", false)}>PNG — High resolution</MenuItem>
              <MenuItem onClick={() => doExport("png", "print", "digital", false)}>PNG — Print (300 DPI)</MenuItem>
              <MenuItem onClick={() => doExport("jpg", "high", "digital", false)}>JPG — High resolution</MenuItem>
              <MenuItem onClick={() => doExport("jpg", "whatsapp", "digital", false)}>JPG — WhatsApp (compact)</MenuItem>
            </MenuSection>
            <MenuSection title="PDF (all pages)">
              <MenuItem onClick={() => doExport("pdf", "high", "digital", true)}>PDF — Digital</MenuItem>
              <MenuItem onClick={() => doExport("pdf", "print", "a5", true)}>PDF — A5 Print + bleed</MenuItem>
              <MenuItem onClick={() => doExport("pdf", "print", "a4", true)}>PDF — A4 Print + bleed</MenuItem>
            </MenuSection>
          </div>
        )}
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, disabled, title }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; title: string }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title} className="rounded p-2 text-maroon hover:bg-stone-100 disabled:opacity-30">
      {children}
    </button>
  );
}
function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-400">{title}</p>
      {children}
    </div>
  );
}
function MenuItem({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-stone-700 hover:bg-ivory">
      <Check size={13} className="text-gold" /> {children}
    </button>
  );
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}
