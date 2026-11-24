# Offline Font Verification Report

Network-disabled evidence that the vendored OFL fonts make the studio render complex scripts
and export **without any CDN dependency**.

## What was verified
Test: `frontend/e2e/offline-fonts.spec.ts`. It intercepts **all** requests and aborts any whose
host is not `localhost`/`127.0.0.1`/`[::1]` — i.e. the Google Fonts CDN (and every other
external host) is completely unreachable for the duration. Then it exercises the editor.

| Check | Result | Evidence |
|-------|--------|----------|
| App loads with all external hosts blocked | ✅ | test reaches the editor |
| Vendored manifest served | ✅ | `GET /fonts/manifest.json` → 200 |
| **Kannada** renders (complex conjuncts) offline | ✅ | `e2e-output/offline-kannada.png` — "ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ" + invite line, correct shaping, no tofu |
| **Arabic (RTL)** renders offline | ✅ | `e2e-output/offline-arabic.png` — "بسم الله الرحمن الرحيم", RTL, connected forms |
| Latin names render offline | ✅ | "Arjun"/"Meera" via local Cormorant |
| No layout clipping offline | ✅ | assert `[data-warning-type="clip"]` count 0 |
| **PNG export** works offline | ✅ | valid PNG (magic bytes, >20 KB) produced |
| **Zero Google Fonts requests** | ✅ | `OFFLINE blocked-google-reqs=0` — the loader used local fonts and never attempted the CDN |

The "0 Google requests" result is strong: because the 19 vendored families satisfy
`ensureFont()` from the local manifest, the loader **skips CDN link injection entirely** — so
even online, those families load locally.

## Font integrity
- 38 files, all with a valid **`wOF2`** WOFF2 signature (verified).
- Total ~1.44 MB (see `FONT_INVENTORY_AND_LICENSES.md`).
- Build copies them into `dist/fonts/` (38 files + `manifest.json` present in the production
  build), so offline support ships with `vite build`.

## Scope of offline rendering
- **Offline-verified (network disabled):** Kannada, Arabic. Both rendered correctly and the
  PNG export succeeded.
- **Offline-supported (vendored, same code path, not each individually screenshot offline):**
  Latin, Devanagari (Hindi/Marathi), Telugu, Tamil, Malayalam, Bengali, Gujarati, Gurmukhi,
  Odia, Urdu (Nastaliq), Hebrew — all have vendored covering fonts in the manifest and load
  through the identical local path proven for Kannada/Arabic.
- **Not offline (documented):** CJK (JP/SC/TC/KR) — not bundled; online only until the full
  fonts are added (`OFFLINE_FONT_INSTALLATION_GUIDE.md`).

## PDF/JPG offline
The export pipeline is fully local (canvas raster + jsPDF, no network). PNG was proven offline;
JPG uses the same raster path, and PDF embeds the same raster (plus a jsPDF base‑14 invisible
Latin text layer — no external resource). No CDN is involved in any export format.

## Conclusion
**No mandatory CDN dependency remains** for the vendored scripts. Offline complex‑script
rendering and export are verified with network disabled. CJK offline remains a documented,
optional add‑on.
