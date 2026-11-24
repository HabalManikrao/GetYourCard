// Editor store: the active design document, selection, undo/redo history, and
// all mutation actions. Snapshots are deep-cloned for reliable history.
import { create } from "zustand";
import type { DesignDocument, DesignElement, TextElement } from "../types";
import { useRegistry } from "./registry";
import { detectScript, directionForScript } from "../lib/scripts";
import { substitute } from "../lib/resolve";
import type { LayoutMode, LayoutWarning } from "../lib/layout";

const MAX_HISTORY = 60;

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

interface EditorState {
  projectId: string | null;
  projectName: string;
  doc: DesignDocument | null;
  selectedId: string | null;
  past: DesignDocument[];
  future: DesignDocument[];
  dirty: boolean;
  layoutWarnings: LayoutWarning[];

  init: (projectId: string, projectName: string, doc: DesignDocument) => void;
  setLayoutWarnings: (w: LayoutWarning[]) => void;
  setLayoutMode: (m: LayoutMode) => void;
  setProjectName: (name: string) => void;
  markSaved: () => void;

  select: (id: string | null) => void;
  setActivePage: (i: number) => void;

  commit: (mutate: (d: DesignDocument) => void) => void;
  /** Snapshot current doc into history before a burst of live edits (sliders). */
  pushHistory: () => void;
  patchElement: (id: string, patch: Partial<DesignElement>, history?: boolean) => void;
  addElement: (el: DesignElement) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  reorder: (id: string, dir: "front" | "back" | "forward" | "backward") => void;
  toggleLock: (id: string) => void;

  // Multilingual
  setPrimaryLocale: (locale: string) => void;
  addLanguageLayer: (layer: DesignDocument["languages"][number]) => void;
  removeLanguageLayer: (locale: string) => void;
  updateLayerContent: (locale: string, key: string, value: string) => void;
  updateDetail: (key: string, value: string) => void;
  applyPalette: (palette: Record<string, string>) => void;
  setBackground: (color: string) => void;
  setImageBackground: (src: string) => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

function activeElements(d: DesignDocument): DesignElement[] {
  return d.pages[d.activePage].elements;
}

export const useEditor = create<EditorState>((set, get) => ({
  projectId: null,
  projectName: "Untitled Invitation",
  doc: null,
  selectedId: null,
  past: [],
  future: [],
  dirty: false,
  layoutWarnings: [],

  init: (projectId, projectName, doc) =>
    set({ projectId, projectName, doc, selectedId: null, past: [], future: [], dirty: false, layoutWarnings: [] }),

  setLayoutWarnings: (w) => set({ layoutWarnings: w }),
  setLayoutMode: (m) =>
    get().commit((d) => {
      d.layoutMode = m;
    }),

  setProjectName: (name) => set({ projectName: name, dirty: true }),
  markSaved: () => set({ dirty: false }),

  select: (id) => set({ selectedId: id }),
  setActivePage: (i) =>
    set((s) => (s.doc ? { doc: { ...s.doc, activePage: i }, selectedId: null } : {})),

  commit: (mutate) =>
    set((s) => {
      if (!s.doc) return {};
      const next = clone(s.doc);
      mutate(next);
      const past = [...s.past, s.doc].slice(-MAX_HISTORY);
      return { doc: next, past, future: [], dirty: true };
    }),

  pushHistory: () =>
    set((s) => (s.doc ? { past: [...s.past, clone(s.doc)].slice(-MAX_HISTORY), future: [] } : {})),

  patchElement: (id, patch, history = true) => {
    const apply = (d: DesignDocument) => {
      const els = activeElements(d);
      const idx = els.findIndex((e) => e.id === id);
      if (idx >= 0) els[idx] = { ...els[idx], ...patch } as DesignElement;
    };
    if (history) get().commit(apply);
    else
      set((s) => {
        if (!s.doc) return {};
        const next = clone(s.doc);
        apply(next);
        return { doc: next, dirty: true };
      });
  },

  addElement: (el) =>
    get().commit((d) => {
      activeElements(d).push(el);
    }),

  deleteElement: (id) => {
    get().commit((d) => {
      const els = activeElements(d);
      const idx = els.findIndex((e) => e.id === id);
      if (idx >= 0 && !els[idx].locked) els.splice(idx, 1);
    });
    if (get().selectedId === id) set({ selectedId: null });
  },

  duplicateElement: (id) => {
    const newId = `el_${Math.round(performance.now())}_${Math.floor(Math.random() * 1e4)}`;
    get().commit((d) => {
      const els = activeElements(d);
      const src = els.find((e) => e.id === id);
      if (src) {
        const copy = clone(src);
        copy.id = newId;
        copy.x += 24;
        copy.y += 24;
        els.push(copy);
      }
    });
    set({ selectedId: newId });
  },

  reorder: (id, dir) =>
    get().commit((d) => {
      const els = activeElements(d);
      const idx = els.findIndex((e) => e.id === id);
      if (idx < 0) return;
      const [el] = els.splice(idx, 1);
      if (dir === "front") els.push(el);
      else if (dir === "back") els.unshift(el);
      else if (dir === "forward") els.splice(Math.min(idx + 1, els.length), 0, el);
      else els.splice(Math.max(idx - 1, 0), 0, el);
    }),

  toggleLock: (id) =>
    get().commit((d) => {
      const el = activeElements(d).find((e) => e.id === id);
      if (el) el.locked = !el.locked;
    }),

  setPrimaryLocale: (locale) => {
    const reg = useRegistry.getState();
    get().commit((d) => {
      d.primaryLocale = locale;
      // Reassign fonts/direction for message (token-bound) text to a covering font.
      for (const page of d.pages) {
        for (const el of page.elements) {
          if (el.type !== "text") continue;
          const t = el as TextElement;
          if (!t.text.includes("{{")) continue; // preserve manually edited text
          const resolved = substitute(t.text, d, locale);
          if (!resolved.trim()) continue;
          const script = detectScript(resolved);
          if (script === "Latin") continue; // names/dates stay on their font
          t.script = script;
          t.locale = locale;
          t.direction = directionForScript(script);
          if (!reg.fontCovers(t.fontFamily, script)) {
            t.fontFamily = reg.coveringFont(script, d.fonts.kn);
          }
        }
      }
    });
  },

  addLanguageLayer: (layer) =>
    get().commit((d) => {
      if (!d.languages.find((l) => l.locale === layer.locale)) d.languages.push(layer);
    }),

  removeLanguageLayer: (locale) =>
    get().commit((d) => {
      d.languages = d.languages.filter((l) => l.locale !== locale);
      if (d.primaryLocale === locale && d.languages.length) d.primaryLocale = d.languages[0].locale;
    }),

  updateLayerContent: (locale, key, value) =>
    get().commit((d) => {
      const layer = d.languages.find((l) => l.locale === locale);
      if (layer) {
        layer.content[key] = value;
        layer.verified = true;
      }
    }),

  updateDetail: (key, value) =>
    get().commit((d) => {
      d.details[key] = value;
    }),

  applyPalette: (palette) =>
    get().commit((d) => {
      d.palette = { ...d.palette, ...palette };
    }),

  setBackground: (color) =>
    get().commit((d) => {
      d.pages[d.activePage].background = { type: "color", color };
    }),

  setImageBackground: (src) =>
    get().commit((d) => {
      d.pages[d.activePage].background = { type: "image", src };
    }),

  undo: () =>
    set((s) => {
      if (!s.past.length || !s.doc) return {};
      const previous = s.past[s.past.length - 1];
      return {
        doc: previous,
        past: s.past.slice(0, -1),
        future: [s.doc, ...s.future].slice(0, MAX_HISTORY),
        dirty: true,
        selectedId: null,
      };
    }),

  redo: () =>
    set((s) => {
      if (!s.future.length || !s.doc) return {};
      const next = s.future[0];
      return {
        doc: next,
        past: [...s.past, s.doc].slice(-MAX_HISTORY),
        future: s.future.slice(1),
        dirty: true,
        selectedId: null,
      };
    }),

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}));
