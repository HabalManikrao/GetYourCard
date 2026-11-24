// Registry store: languages + fonts loaded from the backend, with the helpers
// the editor needs to pick a covering font for any script.
import { create } from "zustand";
import { api } from "../api";
import type { FontEntry, LanguageEntry } from "../types";
import { ensureFont, loadLocalFonts } from "../lib/fontLoader";

interface RegistryState {
  languages: LanguageEntry[];
  fonts: FontEntry[];
  fallback: Record<string, string>;
  loaded: boolean;
  load: () => Promise<void>;
  languageByLocale: (locale: string) => LanguageEntry | undefined;
  fontsForScript: (script: string) => FontEntry[];
  /** Pick a font that covers `script`, preferring `preferred` if it covers it. */
  coveringFont: (script: string, preferred?: string) => string;
  /** True when `family` covers `script`. */
  fontCovers: (family: string, script: string) => boolean;
}

export const useRegistry = create<RegistryState>((set, get) => ({
  languages: [],
  fonts: [],
  fallback: {},
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    await loadLocalFonts(); // self-hosted fonts first (offline support)
    const [languages, fontsRes] = await Promise.all([api.listLanguages(), api.listFonts()]);
    const fallback = (fontsRes.fallback as Record<string, string>) || {};
    set({ languages, fonts: fontsRes.fonts, fallback, loaded: true });
    // Warm the most common families so first paint isn't tofu.
    ["Cormorant Garamond", "Playfair Display", "Noto Serif", "Noto Serif Kannada"].forEach((f) =>
      ensureFont(f),
    );
  },

  languageByLocale: (locale) => get().languages.find((l) => l.locale === locale),

  fontsForScript: (script) => get().fonts.filter((f) => f.scripts.includes(script)),

  fontCovers: (family, script) => {
    const f = get().fonts.find((x) => x.family === family);
    return !!f && f.scripts.includes(script);
  },

  coveringFont: (script, preferred) => {
    const { fonts, fallback } = get();
    if (preferred && fonts.find((f) => f.family === preferred && f.scripts.includes(script))) {
      return preferred;
    }
    if (fallback[script]) return fallback[script];
    const any = fonts.find((f) => f.scripts.includes(script));
    return any?.family || "Noto Sans";
  },
}));
