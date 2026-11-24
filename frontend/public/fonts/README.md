# Self-hosted fonts (offline support)

The app loads webfonts from the Google Fonts CDN by default. To make invitation
creation and **export fully offline** (including complex scripts), vendor the
open-source (SIL OFL) font files here and add a `manifest.json`.

## How it works
On startup the font loader fetches `/fonts/manifest.json`. Any family listed there
is loaded from a local `@font-face` (these files) and the CDN is **not** used for
it. Families not in the manifest continue to load from the CDN. No code changes
are needed — drop files + manifest and offline mode activates.

## Steps
1. Download the OFL `.woff2` files (one per weight) for the families you need. The
   licence (SIL OFL 1.1) permits bundling and redistribution with the licence notice.
   Core set that covers the shipped templates/scripts:
   - Cormorant Garamond (400, 700), Playfair Display (400, 700)
   - Noto Serif / Noto Sans (400, 700) — Latin/Greek/Cyrillic
   - Noto Serif Kannada, Noto Sans Devanagari, Noto Serif Telugu, Noto Serif Tamil,
     Noto Serif Malayalam, Noto Serif Bengali, Noto Sans Gujarati, Noto Sans Gurmukhi,
     Noto Sans Oriya, Noto Naskh Arabic, Noto Serif Hebrew (400, 700)
   - CJK (Noto Sans SC/TC/JP/KR) are large (multi-MB); add only if needed.
2. Place the files in this directory, e.g. `cormorant-garamond-400.woff2`.
3. Create `manifest.json` mapping family → weight → filename:

```json
{
  "Cormorant Garamond": { "400": "cormorant-garamond-400.woff2", "700": "cormorant-garamond-700.woff2" },
  "Noto Serif Kannada": { "400": "noto-serif-kannada-400.woff2", "700": "noto-serif-kannada-700.woff2" },
  "Noto Naskh Arabic":  { "400": "noto-naskh-arabic-400.woff2" }
}
```

4. Rebuild/restart the frontend. Verify offline by blocking `fonts.googleapis.com`
   and confirming the canvas + PNG/PDF exports still render each script correctly.

> Note: in the build/audit sandbox, outbound font downloads were blocked, so the
> binaries are not committed. The loading mechanism is implemented and tested; only
> the font files need to be vendored to complete offline support (gap F-03).
