// Resolves {{field}} placeholders in text using the active language layer first,
// then the shared structured details. Language-independent content model: names
// and dates live in `details`; translatable copy lives per-locale in `languages`.
import type { DesignDocument, TextElement } from "../types";

const TOKEN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export function layerContent(doc: DesignDocument, locale: string): Record<string, string> {
  const layer = doc.languages?.find((l) => l.locale === locale);
  return layer?.content || {};
}

/** Substitute tokens in `text` for display/export in the given locale.
 *  Output is Unicode NFC-normalized so complex scripts shape/measure consistently. */
export function substitute(text: string, doc: DesignDocument, locale: string): string {
  const content = layerContent(doc, locale);
  const details = doc.details || {};
  const out = text.replace(TOKEN, (_m, key: string) => {
    const v = content[key] ?? (details as Record<string, string>)[key];
    return v != null && v !== "" ? v : "";
  });
  return out.normalize("NFC");
}

/** Resolve the display text of a text element in its own locale (or the doc's). */
export function resolveText(el: TextElement, doc: DesignDocument): string {
  const locale = el.locale || doc.primaryLocale;
  const resolved = substitute(el.text, doc, locale).replace(/\n{3,}/g, "\n\n").trim();
  // If a binding produced nothing, show the readable placeholder label.
  return resolved || el.text.replace(TOKEN, (_m, k: string) => `{${k.replace(/_/g, " ")}}`);
}

/** All distinct font families referenced by a document (for preloading). */
export function fontsInDoc(doc: DesignDocument): string[] {
  const set = new Set<string>();
  Object.values(doc.fonts || {}).forEach((f) => set.add(f));
  doc.pages.forEach((p) =>
    p.elements.forEach((e) => {
      if (e.type === "text") set.add(e.fontFamily);
    }),
  );
  return [...set];
}
