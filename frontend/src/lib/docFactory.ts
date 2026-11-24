// Builds a DesignDocument from a template + wizard output, and helpers to add
// language layers. Content model is language-independent: names/dates live in
// `details`; translatable copy lives per-locale in `languages`.
import { api } from "../api";
import type {
  DesignDocument,
  DesignPage,
  LanguageEntry,
  LanguageLayer,
  Template,
  WeddingDetails,
} from "../types";

function clonePages(pages: DesignPage[]): DesignPage[] {
  return JSON.parse(JSON.stringify(pages));
}

/** Build a localized language layer for a locale (defaults from backend). */
export async function buildLayer(
  locale: string,
  langEntry?: LanguageEntry,
  overrides: Record<string, string> = {},
): Promise<LanguageLayer> {
  let content: Record<string, string> = {};
  let direction: "ltr" | "rtl" = langEntry?.direction || "ltr";
  let languageName = langEntry?.name || locale;
  try {
    const d = await api.messageDefaults(locale);
    content = { ...d.content };
    direction = d.direction;
    languageName = d.languageName;
  } catch {
    /* offline: empty layer, user fills manually */
  }
  return { locale, languageName, direction, content: { ...content, ...overrides }, verified: true };
}

export async function buildDesignFromTemplate(
  template: Template,
  details: WeddingDetails,
  locales: string[],
  languages: LanguageEntry[],
): Promise<DesignDocument> {
  const cfg = template.configuration;
  const primaryLocale = locales[0] || "en-IN";
  const layers = await Promise.all(
    locales.map((loc) => buildLayer(loc, languages.find((l) => l.locale === loc))),
  );
  return {
    version: 1,
    templateId: template.id,
    width: cfg.width,
    height: cfg.height,
    palette: { ...cfg.palette },
    fonts: { ...cfg.fonts },
    pages: clonePages(cfg.pages),
    activePage: 0,
    languages: layers,
    primaryLocale,
    details: { ...details },
  };
}

/** A blank single-page document (used by "start from scratch") — still builds
 *  the selected language layers so wording/translation work immediately. */
export async function buildBlankDesign(
  details: WeddingDetails,
  locales: string[],
  languages: LanguageEntry[],
): Promise<DesignDocument> {
  const W = 1080;
  const H = 1920;
  const primaryLocale = locales[0] || "en-IN";
  const layers = await Promise.all(
    locales.map((loc) => buildLayer(loc, languages.find((l) => l.locale === loc))),
  );
  return {
    version: 1,
    templateId: null,
    width: W,
    height: H,
    palette: { bg: "#fbf3e4", primary: "#7a1226", accent: "#b8860b", text: "#4a2c12" },
    fonts: { en: "Cormorant Garamond", kn: "Noto Serif Kannada" },
    pages: [
      { name: "Front", width: W, height: H, background: { type: "color", color: "#fbf3e4" }, elements: [] },
      { name: "Inside", width: W, height: H, background: { type: "color", color: "#fbf3e4" }, elements: [] },
    ],
    activePage: 0,
    languages: layers,
    primaryLocale,
    details: { ...details },
  };
}
