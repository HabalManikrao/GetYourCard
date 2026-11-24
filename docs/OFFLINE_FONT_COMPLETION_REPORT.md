# Offline Font Completion Report

> **UPDATE — fonts now vendored & offline‑verified.** 19 families / 38 OFL WOFF2 files
> (~1.44 MB) were downloaded through the browser and bundled in `public/fonts/` with a
> manifest; Kannada + Arabic were verified rendering/exporting with the network disabled
> (`blocked-google-reqs=0`). See `FONT_INVENTORY_AND_LICENSES.md`,
> `OFFLINE_FONT_VERIFICATION_REPORT.md`, `MULTILINGUAL_OFFLINE_ACCEPTANCE_REPORT.md`. The
> "blocker" below is **resolved for the primary scripts**; only CJK remains an optional add‑on.

## Current state
- **Loading mechanism: implemented and active.** On startup `registry.load()` calls
  `fontLoader.loadLocalFonts()`, which fetches `/fonts/manifest.json`. Any family listed is
  loaded from a local `@font-face` and the Google CDN is **not** used for it (`ensureFont`
  checks `isLocalFont` first). With no manifest, behaviour is unchanged (CDN).
- **No hard CDN dependency: verified.** `e2e/offline.spec.ts` blocks `fonts.googleapis.com`
  and `fonts.gstatic.com` and confirms the app still loads, renders the canvas, and exports a
  valid PNG with zero page errors. Latin renders via system fallback.
- **Blocker:** the sandbox has **no outbound network** for font downloads (verified: `curl`
  to the Google Fonts CSS2 API returns empty), and **no OFL fonts are present on the host**
  (only proprietary Windows fonts). Therefore the Noto/OFL binaries could not be vendored
  here, and offline **complex‑script** rendering is not yet active. This is an asset gap, not
  a code gap.

## Legally‑compliant vendoring plan
All fonts below are **SIL Open Font License 1.1** — bundling and redistribution are permitted
with the licence notice retained. Keep `ASSET_LICENSE.md` and add each font's `OFL.txt`.

### Files to obtain (one `.woff2` per weight)
Source: Google Fonts (https://fonts.google.com) or the google/fonts GitHub repo
(https://github.com/google/fonts, OFL directory). Install location: `frontend/public/fonts/`.

| Family | Weights | Scripts covered | Suggested filenames |
|--------|---------|-----------------|---------------------|
| Cormorant Garamond | 400,700 | Latin | `cormorant-garamond-{400,700}.woff2` |
| Playfair Display | 400,700 | Latin | `playfair-display-{400,700}.woff2` |
| Noto Serif | 400,700 | Latin/Greek/Cyrillic | `noto-serif-{400,700}.woff2` |
| Noto Sans | 400,700 | Latin/Greek/Cyrillic | `noto-sans-{400,700}.woff2` |
| Noto Serif Kannada | 400,700 | Kannada | `noto-serif-kannada-{400,700}.woff2` |
| Noto Serif Devanagari | 400,700 | Hindi/Marathi/Sanskrit/Nepali/Konkani | `noto-serif-devanagari-{400,700}.woff2` |
| Noto Serif Telugu | 400,700 | Telugu | `noto-serif-telugu-{400,700}.woff2` |
| Noto Serif Tamil | 400,700 | Tamil | `noto-serif-tamil-{400,700}.woff2` |
| Noto Serif Malayalam | 400,700 | Malayalam | `noto-serif-malayalam-{400,700}.woff2` |
| Noto Serif Bengali | 400,700 | Bengali/Assamese | `noto-serif-bengali-{400,700}.woff2` |
| Noto Sans Gujarati | 400,700 | Gujarati | `noto-sans-gujarati-{400,700}.woff2` |
| Noto Sans Gurmukhi | 400,700 | Punjabi | `noto-sans-gurmukhi-{400,700}.woff2` |
| Noto Sans Oriya | 400,700 | Odia | `noto-sans-oriya-{400,700}.woff2` |
| Noto Naskh Arabic | 400,700 | Arabic/Persian/Sindhi | `noto-naskh-arabic-{400,700}.woff2` |
| Noto Nastaliq Urdu | 400,700 | Urdu/Kashmiri | `noto-nastaliq-urdu-{400,700}.woff2` |
| Noto Serif Hebrew | 400,700 | Hebrew | `noto-serif-hebrew-{400,700}.woff2` |
| Noto Sans SC / TC / JP / KR | 400,700 | Chinese/Japanese/Korean (large, multi‑MB each) | `noto-sans-{sc,tc,jp,kr}-{400,700}.woff2` |
| Noto Sans Thai, Meetei Mayek, Ol Chiki | 400,700 | Thai/Manipuri/Santali | `noto-sans-{thai,meetei-mayek,ol-chiki}-{400,700}.woff2` |

### manifest.json (example)
```json
{
  "Cormorant Garamond": { "400": "cormorant-garamond-400.woff2", "700": "cormorant-garamond-700.woff2" },
  "Noto Serif Kannada": { "400": "noto-serif-kannada-400.woff2", "700": "noto-serif-kannada-700.woff2" },
  "Noto Naskh Arabic":  { "400": "noto-naskh-arabic-400.woff2" }
}
```

### Automated fetch (run on a networked machine)
```bash
# Example per family using google-webfonts-helper or gfonts tooling, e.g.:
#   npx google-font-installer download "Noto Serif Kannada" -d frontend/public/fonts
# or download the OFL .ttf from github.com/google/fonts and convert to .woff2
#   (woff2_compress) — then write manifest.json.
```

## Verification checklist after vendoring
1. Files present in `frontend/public/fonts/` + `manifest.json` written.
2. `npm run build` (Vite copies `public/` into `dist/`).
3. Run `e2e/offline.spec.ts` plus a complex‑script create (e.g. Kannada) **with the CDN
   blocked** and confirm the canvas + PNG/PDF render the script correctly (no tofu).
4. Add each font's `OFL.txt` and update `ASSET_LICENSE.md`.

## Conclusion
Offline support is **code‑complete and functionally verified** (no mandatory CDN dependency);
**complex‑script offline rendering is pending the font binaries**, which must be vendored on a
networked machine per the plan above. No fonts were invented or falsely claimed.
