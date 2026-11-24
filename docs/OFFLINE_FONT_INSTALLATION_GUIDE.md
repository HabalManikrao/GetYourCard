# Offline Font Installation Guide

Offline fonts for the **primary scripts are already vendored** in `frontend/public/fonts/`
(19 families / 38 WOFF2 files / ~1.44 MB) with a `manifest.json`. They ship in the production
build (`dist/fonts/`). No action is needed for Latin + Indic + Arabic/Urdu + Hebrew offline use.

This guide covers (a) how the system works, (b) re‑vendoring/updating, and (c) adding the
**optional CJK** fonts for offline Chinese/Japanese/Korean.

## How it works
1. On startup, `fontLoader.loadLocalFonts()` fetches `/fonts/manifest.json`.
2. For each `family → { weight: filename }`, it registers a local `@font-face` from
   `/fonts/<filename>` and marks the family local.
3. `ensureFont(family)` returns immediately for local families and **never contacts the CDN**;
   non‑local families fall back to the Google CDN (online) or system fonts (offline).

`manifest.json` shape:
```json
{
  "Noto Serif Kannada": { "400": "noto-serif-kannada-400.woff2", "700": "noto-serif-kannada-700.woff2" },
  "Noto Naskh Arabic":  { "400": "noto-naskh-arabic-400.woff2",  "700": "noto-naskh-arabic-700.woff2" }
}
```

## Re‑vendoring / updating the bundled fonts
A browser‑based tool downloads the OFL WOFF2 subsets through Chrome (works even when the shell
has no network) and writes files + manifest:

```bash
# from frontend/, with the dev server running and Chrome installed:
#   the tool is excluded from the normal suite (testIgnore **/_*.spec.ts)
npx playwright test _download-fonts --config=playwright.config.ts
```
It saves each family's script‑covering subset to `public/fonts/` and regenerates
`manifest.json`. Edit the `SPECS` array in `e2e/_download-fonts.spec.ts` to change families or
weights. Re‑run `vite build` to publish.

## Adding CJK (optional, for offline Chinese/Japanese/Korean)
CJK is **not** bundled (Google splits CJK into 100+ subsets; the full fonts are multi‑MB).
To enable offline CJK:
1. Download the full OFL fonts (WOFF2) on a networked machine:
   - **Noto Sans JP / SC / TC / KR** — from Google Fonts (https://fonts.google.com) or
     github.com/notofonts (OFL). Each is ~2–7 MB.
2. Place them in `frontend/public/fonts/`, e.g. `noto-sans-jp-400.woff2`.
3. Add them to `manifest.json`:
   ```json
   "Noto Sans JP": { "400": "noto-sans-jp-400.woff2", "700": "noto-sans-jp-700.woff2" },
   "Noto Sans SC": { "400": "noto-sans-sc-400.woff2", "700": "noto-sans-sc-700.woff2" }
   ```
4. `vite build`, then verify offline (below).

## Verifying offline after any change
```bash
# from frontend/
npx playwright test offline-fonts        # blocks ALL external hosts, renders Kannada+Arabic, exports PNG
```
For a newly added script, add a case to `offline-fonts.spec.ts` (switch to that language /
type a sample) and confirm the screenshot shows real glyphs (no tofu) with
`blocked-google-reqs=0`.

## License
All bundled fonts are SIL OFL 1.1 (redistributable with notice). Keep each family's `OFL.txt`
and `ASSET_LICENSE.md` updated. Never add proprietary/unlicensed fonts.
