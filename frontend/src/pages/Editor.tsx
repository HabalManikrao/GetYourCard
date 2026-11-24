import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { useEditor } from "../store/editor";
import { useRegistry } from "../store/registry";
import { DesignCanvas } from "../editor/DesignCanvas";
import { buildDesignFromTemplate } from "../lib/docFactory";
import type { DesignDocument } from "../types";
import TopToolbar from "../editor/TopToolbar";
import LeftPanel from "../editor/LeftPanel";
import RightPanel from "../editor/RightPanel";
import LanguageBar from "../editor/LanguageBar";

export default function Editor() {
  const { projectId } = useParams();
  const registry = useRegistry();
  const editor = useEditor();
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dcRef = useRef<DesignCanvas | null>(null);
  const skipRender = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);

  const doc = useEditor((s) => s.doc);
  const selectedId = useEditor((s) => s.selectedId);

  // Load project + registry, then initialise the store.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await registry.load();
        const project = await api.getProject(projectId!);
        let design = (project.project_data?.design as DesignDocument) || null;
        if (!design && project.template_id) {
          const tpl = await api.getTemplate(project.template_id);
          design = await buildDesignFromTemplate(
            tpl,
            { groom_name: project.groom_name || "", bride_name: project.bride_name || "" },
            [project.language],
            useRegistry.getState().languages,
          );
        }
        if (!design) throw new Error("Project has no design data");
        if (cancelled) return;
        editor.init(project.id, project.project_name, design);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Create the Fabric canvas once the element exists.
  useEffect(() => {
    if (loading || error || !canvasElRef.current || dcRef.current) return;
    const dc = new DesignCanvas(canvasElRef.current, {
      onSelect: (id) => editor.select(id),
      onModify: (id, patch) => {
        skipRender.current = true;
        editor.patchElement(id, patch, true);
      },
      onTextEdited: (id, text) => {
        skipRender.current = true;
        editor.patchElement(id, { text }, true);
      },
      onLayout: (warnings) => useEditor.getState().setLayoutWarnings(warnings),
    });
    dcRef.current = dc;
    const fit = () => {
      if (wrapRef.current && useEditor.getState().doc) {
        dc.setZoom(wrapRef.current.clientWidth, wrapRef.current.clientHeight, useEditor.getState().doc!);
      }
    };
    window.addEventListener("resize", fit);
    // Initial paint: the document was set before this canvas existed, so the
    // doc-change effect won't fire for it — render it explicitly now.
    const current = useEditor.getState().doc;
    if (current) {
      (async () => {
        await dc.render(current, useEditor.getState().selectedId);
        fit();
      })();
    }
    return () => {
      window.removeEventListener("resize", fit);
      dc.dispose();
      dcRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error]);

  // Re-render canvas when the document changes (skip our own canvas-originated edits).
  useEffect(() => {
    const dc = dcRef.current;
    if (!dc || !doc) return;
    if (skipRender.current) {
      skipRender.current = false;
      return;
    }
    (async () => {
      await dc.render(doc, useEditor.getState().selectedId);
      if (wrapRef.current) dc.setZoom(wrapRef.current.clientWidth, wrapRef.current.clientHeight, doc);
    })();
  }, [doc]);

  // Reflect panel/layer-driven selection onto the canvas.
  useEffect(() => {
    dcRef.current?.selectById(selectedId);
  }, [selectedId]);

  // Debounced autosave.
  const saveNow = useCallback(async () => {
    const s = useEditor.getState();
    if (!s.projectId || !s.doc) return;
    await api.updateProject(s.projectId, {
      project_name: s.projectName,
      project_data: { design: s.doc },
      language: s.doc.primaryLocale,
      groom_name: s.doc.details.groom_name,
      bride_name: s.doc.details.bride_name,
      wedding_date: s.doc.details.wedding_date,
    });
    s.markSaved();
  }, []);

  useEffect(() => {
    if (!editor.dirty) return;
    const t = setTimeout(saveNow, 1500);
    return () => clearTimeout(t);
  }, [editor.dirty, doc, editor.projectName, saveNow]);

  // Keyboard shortcuts: undo/redo, delete.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        e.shiftKey ? editor.redo() : editor.undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        editor.redo();
      } else if ((e.key === "Delete" || e.key === "Backspace") && useEditor.getState().selectedId) {
        e.preventDefault();
        editor.deleteElement(useEditor.getState().selectedId!);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editor]);

  if (loading) return <Centered>Loading your invitation…</Centered>;
  if (error) return <Centered>{error}</Centered>;

  return (
    <div className="editor-ui flex h-screen flex-col overflow-hidden bg-[#ece3d2] text-sm text-stone-800">
      <TopToolbar dcRef={dcRef} saveNow={saveNow} onToggleLeft={() => setShowLeft((v) => !v)} onToggleRight={() => setShowRight((v) => !v)} />
      <div className="flex flex-1 overflow-hidden">
        {showLeft && <LeftPanel />}
        <div className="flex flex-1 flex-col overflow-hidden">
          <LanguageBar />
          <LayoutWarnings />
          <div ref={wrapRef} className="relative flex flex-1 items-center justify-center overflow-auto bg-[#d9cfbd] p-4">
            <div className="shadow-2xl">
              <canvas ref={canvasElRef} />
            </div>
          </div>
          <ZoomBar dcRef={dcRef} wrapRef={wrapRef} />
        </div>
        {showRight && <RightPanel />}
      </div>
    </div>
  );
}

function LayoutWarnings() {
  const warnings = useEditor((s) => s.layoutWarnings);
  const select = useEditor((s) => s.select);
  if (!warnings.length) return null;
  const errors = warnings.filter((w) => w.severity === "error");
  const shown = (errors.length ? errors : warnings).slice(0, 3);
  return (
    <div
      className={`flex flex-wrap items-center gap-3 px-4 py-1.5 text-xs ${
        errors.length ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-800"
      }`}
      role="alert"
      data-testid="layout-warnings"
    >
      <span className="font-semibold">⚠ Layout {errors.length ? "problems" : "notices"}:</span>
      {shown.map((w, i) => (
        <button key={i} className="underline" onClick={() => select(w.elementId)} data-warning-type={w.type}>
          {w.message}
        </button>
      ))}
      {warnings.length > shown.length && <span>+{warnings.length - shown.length} more</span>}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-paper flex h-screen items-center justify-center font-display text-xl text-maroon">
      {children}
    </div>
  );
}

function ZoomBar({
  dcRef,
  wrapRef,
}: {
  dcRef: React.MutableRefObject<DesignCanvas | null>;
  wrapRef: React.RefObject<HTMLDivElement>;
}) {
  const doc = useEditor((s) => s.doc);
  const setActivePage = useEditor((s) => s.setActivePage);
  const activePage = doc?.activePage ?? 0;
  return (
    <div className="flex items-center gap-2 border-t border-stone-300 bg-ivory/80 px-4 py-1.5">
      <div className="flex gap-1">
        {doc?.pages.map((p, i) => (
          <button
            key={i}
            onClick={() => setActivePage(i)}
            className={`rounded px-3 py-1 text-xs ${i === activePage ? "bg-maroon text-ivory" : "bg-white text-maroon"}`}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-1">
        <button className="rounded bg-white px-2 py-1 text-xs" onClick={() => dcRef.current?.zoomBy(0.9)}>
          −
        </button>
        <button
          className="rounded bg-white px-2 py-1 text-xs"
          onClick={() => {
            if (wrapRef.current && doc) dcRef.current?.setZoom(wrapRef.current.clientWidth, wrapRef.current.clientHeight, doc);
          }}
        >
          Fit
        </button>
        <button className="rounded bg-white px-2 py-1 text-xs" onClick={() => dcRef.current?.zoomBy(1.1)}>
          +
        </button>
      </div>
    </div>
  );
}
