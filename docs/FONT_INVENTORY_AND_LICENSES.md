# Font Inventory and Licenses

All fonts below are **vendored** (real binaries present) in `frontend/public/fonts/` and
referenced by `frontend/public/fonts/manifest.json`. They were obtained from the official
**Google Fonts** CSS2 API (`fonts.googleapis.com` / `fonts.gstatic.com`) — the per-script
WOFF2 subset covering each script. Format: **WOFF2**. License: **SIL Open Font License 1.1**
for every file (Google Fonts serves these families under OFL 1.1). Total: **19 families,
38 files, ~1.44 MB**.

> Each file is a Google Fonts *subset* sized to its script (the whole Kannada/Arabic/… block
> fits in one subset). This is why coverage is complete per script while files stay small.

## Inventory

| Font family | Weight | Filename | Script coverage | Size |
|-------------|--------|----------|-----------------|------|
| Cormorant Garamond | 400 | `cormorant-garamond-400.woff2` | Latin | 22 KB |
| Cormorant Garamond | 700 | `cormorant-garamond-700.woff2` | Latin | 21 KB |
| Playfair Display | 400 | `playfair-display-400.woff2` | Latin | 21 KB |
| Playfair Display | 700 | `playfair-display-700.woff2` | Latin | 22 KB |
| Noto Serif | 400 | `noto-serif-400.woff2` | Latin | 14 KB |
| Noto Serif | 700 | `noto-serif-700.woff2` | Latin | 14 KB |
| Noto Sans | 400 | `noto-sans-400.woff2` | Latin | 12 KB |
| Noto Sans | 700 | `noto-sans-700.woff2` | Latin | 13 KB |
| Noto Serif Kannada | 400 | `noto-serif-kannada-400.woff2` | Kannada | 32 KB |
| Noto Serif Kannada | 700 | `noto-serif-kannada-700.woff2` | Kannada | 33 KB |
| Noto Sans Kannada | 400 | `noto-sans-kannada-400.woff2` | Kannada | 27 KB |
| Noto Sans Kannada | 700 | `noto-sans-kannada-700.woff2` | Kannada | 27 KB |
| Noto Serif Devanagari | 400 | `noto-serif-devanagari-400.woff2` | Devanagari (Hindi/Marathi/Sanskrit/Nepali) | 49 KB |
| Noto Serif Devanagari | 700 | `noto-serif-devanagari-700.woff2` | Devanagari | 54 KB |
| Noto Sans Devanagari | 400 | `noto-sans-devanagari-400.woff2` | Devanagari | 48 KB |
| Noto Sans Devanagari | 700 | `noto-sans-devanagari-700.woff2` | Devanagari | 52 KB |
| Noto Serif Telugu | 400 | `noto-serif-telugu-400.woff2` | Telugu | 34 KB |
| Noto Serif Telugu | 700 | `noto-serif-telugu-700.woff2` | Telugu | 39 KB |
| Noto Serif Tamil | 400 | `noto-serif-tamil-400.woff2` | Tamil | 14 KB |
| Noto Serif Tamil | 700 | `noto-serif-tamil-700.woff2` | Tamil | 14 KB |
| Noto Serif Malayalam | 400 | `noto-serif-malayalam-400.woff2` | Malayalam | 20 KB |
| Noto Serif Malayalam | 700 | `noto-serif-malayalam-700.woff2` | Malayalam | 22 KB |
| Noto Serif Bengali | 400 | `noto-serif-bengali-400.woff2` | Bengali/Assamese | 57 KB |
| Noto Serif Bengali | 700 | `noto-serif-bengali-700.woff2` | Bengali/Assamese | 69 KB |
| Noto Sans Gujarati | 400 | `noto-sans-gujarati-400.woff2` | Gujarati | 36 KB |
| Noto Sans Gujarati | 700 | `noto-sans-gujarati-700.woff2` | Gujarati | 36 KB |
| Noto Sans Gurmukhi | 400 | `noto-sans-gurmukhi-400.woff2` | Gurmukhi (Punjabi) | 11 KB |
| Noto Sans Gurmukhi | 700 | `noto-sans-gurmukhi-700.woff2` | Gurmukhi (Punjabi) | 11 KB |
| Noto Sans Oriya | 400 | `noto-sans-oriya-400.woff2` | Odia | 38 KB |
| Noto Sans Oriya | 700 | `noto-sans-oriya-700.woff2` | Odia | 40 KB |
| Noto Naskh Arabic | 400 | `noto-naskh-arabic-400.woff2` | Arabic/Persian/Sindhi | 51 KB |
| Noto Naskh Arabic | 700 | `noto-naskh-arabic-700.woff2` | Arabic/Persian/Sindhi | 51 KB |
| Noto Sans Arabic | 400 | `noto-sans-arabic-400.woff2` | Arabic | 47 KB |
| Noto Sans Arabic | 700 | `noto-sans-arabic-700.woff2` | Arabic | 49 KB |
| Noto Nastaliq Urdu | 400 | `noto-nastaliq-urdu-400.woff2` | Urdu / Kashmiri (Nastaliq) | 155 KB |
| Noto Nastaliq Urdu | 700 | `noto-nastaliq-urdu-700.woff2` | Urdu / Kashmiri (Nastaliq) | 153 KB |
| Noto Serif Hebrew | 400 | `noto-serif-hebrew-400.woff2` | Hebrew | 7 KB |
| Noto Serif Hebrew | 700 | `noto-serif-hebrew-700.woff2` | Hebrew | 7 KB |

## Fallback behavior
- The frontend font registry (`backend/app/font_data.py`, `FALLBACK_SANS`) maps each script to
  a covering family; all mapped families for the scripts above are vendored, so font
  **fallback works offline**.
- Families **not** vendored (see below) fall back: if online, they load from the Google CDN;
  if offline, the browser uses a system font (may be tofu for uncovered complex scripts).

## NOT vendored here (honest limitation)
- **CJK** — Japanese (Noto Sans JP), Chinese Simplified/Traditional (Noto Sans SC/TC), Korean
  (Noto Sans KR). Google splits CJK into 100+ unicode-range subsets; no single small subset
  covers the script, and the full fonts are multi-MB each. They are **not** bundled. Online,
  CJK renders from the CDN (certified). For **offline CJK**, download the full OFL fonts and add
  them per `OFFLINE_FONT_INSTALLATION_GUIDE.md`.
- Thai, Meetei Mayek, Ol Chiki — registry‑supported, not bundled (add per the guide if needed).

## License compliance
- All vendored files are SIL OFL 1.1 — bundling/redistribution permitted with the notice.
- Add the upstream `OFL.txt` for the Noto families and Cormorant Garamond / Playfair Display
  alongside this inventory when distributing. See `ASSET_LICENSE.md`.
- No proprietary or unlicensed fonts are used.
