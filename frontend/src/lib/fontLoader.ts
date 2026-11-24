// Dynamic font loader. Injects Google Fonts CSS2 on demand and resolves only
// once the glyphs are actually ready, so exports never rasterize unshaped text.

const loaded = new Set<string>();
const linkFor = new Map<string, HTMLLinkElement>();

// Self-hosted (offline) fonts. If /fonts/manifest.json exists, its families are
// loaded from local @font-face files and the Google CDN is NOT used for them.
// This makes the app work fully offline as soon as OFL font files are vendored
// into public/fonts/ (see public/fonts/README.md). With no manifest, behaviour
// is unchanged (CDN).
const localFamilies = new Map<string, Record<string, string>>();
let manifestPromise: Promise<void> | null = null;

export function loadLocalFonts(): Promise<void> {
  if (manifestPromise) return manifestPromise;
  manifestPromise = (async () => {
    try {
      const res = await fetch("/fonts/manifest.json", { cache: "force-cache" });
      if (!res.ok) return;
      const manifest = (await res.json()) as Record<string, Record<string, string>>;
      for (const [family, weights] of Object.entries(manifest)) {
        localFamilies.set(family, weights);
        for (const [weight, file] of Object.entries(weights)) {
          try {
            const face = new FontFace(family, `url(/fonts/${file})`, { weight });
            await face.load();
            (document as Document).fonts.add(face);
            loaded.add(`${family}:${weight}`);
          } catch {
            /* skip a missing/invalid file; CDN fallback still applies */
          }
        }
      }
    } catch {
      /* no manifest → CDN mode */
    }
  })();
  return manifestPromise;
}

export function isLocalFont(family: string): boolean {
  return localFamilies.has(family);
}

/** Google Fonts CSS2 family token, e.g. "Noto Serif Kannada". */
function css2Url(family: string, weights: number[]): string {
  const fam = family.replace(/ /g, "+");
  const wght = (weights.length ? weights : [400, 700]).join(";");
  return `https://fonts.googleapis.com/css2?family=${fam}:wght@${wght}&display=swap`;
}

/** Inject the stylesheet link (idempotent). */
export function registerFont(family: string, weights: number[] = [400, 600, 700]): void {
  if (linkFor.has(family)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = css2Url(family, weights);
  link.dataset.font = family;
  document.head.appendChild(link);
  linkFor.set(family, link);
}

/** Ensure a font family is loaded and its glyphs are ready for rendering. */
export async function ensureFont(
  family: string,
  weights: number[] = [400, 700],
  sampleText = "Aaಕಗ हिअ",
): Promise<boolean> {
  const key = `${family}:${weights.join(",")}`;
  if (loaded.has(key)) return true;
  // Prefer a self-hosted (offline) font; only fall back to the CDN otherwise.
  if (isLocalFont(family)) {
    await (document as Document).fonts.ready;
    loaded.add(key);
    return true;
  }
  registerFont(family, weights);
  try {
    // document.fonts.load triggers fetch + resolves when glyphs are usable.
    await Promise.all(weights.map((w) => (document as Document).fonts.load(`${w} 48px "${family}"`, sampleText)));
    await (document as Document).fonts.ready;
    loaded.add(key);
    return true;
  } catch {
    return false;
  }
}

/** Ensure every font family used in the document is ready (call before export). */
export async function ensureFonts(families: string[]): Promise<void> {
  await Promise.all([...new Set(families)].map((f) => ensureFont(f)));
  await (document as Document).fonts.ready;
}

/** Register a custom uploaded font from a data URL. */
export async function registerCustomFont(family: string, dataUrl: string): Promise<boolean> {
  try {
    const face = new FontFace(family, `url(${dataUrl})`);
    await face.load();
    (document as Document).fonts.add(face);
    loaded.add(`${family}:custom`);
    return true;
  } catch {
    return false;
  }
}
