# Asset Licensing Record

## Decorative motifs & templates
All SVG decoration motifs (`frontend/src/lib/decorations.ts`) and the 15 invitation
templates (`backend/app/template_data.py`) were **authored originally for this project**.
They are simplified, stylised geometric interpretations of traditional Indian wedding motifs
(Ganesha emblem, kalash, mango-leaf toran, lotus, mandala, paisley, peacock, diya, temple
arch/pillar, bells, garland, gold ornament, florals, art-deco, gandaberunda emblem, vintage
frame, royal crest). No copyrighted third-party artwork or photographs are bundled.

License: you may use, modify, and distribute these project assets freely within and
alongside this application.

## Fonts (loaded at runtime, not redistributed in-repo)
All fonts are open-source under the **SIL Open Font License 1.1**:

| Font family | Coverage | Source |
|-------------|----------|--------|
| Cormorant Garamond | Latin display | Google Fonts (OFL) |
| Playfair Display | Latin display | Google Fonts (OFL) |
| Noto Serif / Noto Sans | Latin, Greek, Cyrillic | Google Fonts (OFL) |
| Noto Serif/Sans Kannada | Kannada | Google Fonts (OFL) |
| Noto Serif/Sans Devanagari | Hindi, Marathi, Sanskrit, Nepali, … | Google Fonts (OFL) |
| Noto Serif/Sans Telugu, Tamil, Malayalam, Bengali, Gujarati, Gurmukhi, Oriya | Indic scripts | Google Fonts (OFL) |
| Noto Naskh/Sans Arabic, Noto Nastaliq Urdu | Arabic, Urdu, Persian, Sindhi | Google Fonts (OFL) |
| Noto Serif/Sans Hebrew | Hebrew | Google Fonts (OFL) |
| Noto Serif/Sans SC/TC/JP/KR | Chinese, Japanese, Korean | Google Fonts (OFL) |
| Noto Serif/Sans Thai, Noto Sans Meetei Mayek, Noto Sans Ol Chiki | Thai, Manipuri, Santali | Google Fonts (OFL) |

Fonts load from self-hosted OFL WOFF2 files when present (see
`frontend/public/fonts/manifest.json`), falling back to the Google Fonts CSS2 API otherwise.

**Vendored offline fonts:** 19 families / 38 WOFF2 files (~1.44 MB) are bundled in
`frontend/public/fonts/`, all under **SIL Open Font License 1.1** (Cormorant Garamond,
Playfair Display, Noto Serif/Sans, and Noto Serif/Sans for Kannada, Devanagari, Telugu, Tamil,
Malayalam, Bengali, Gujarati, Gurmukhi, Odia, Arabic (Naskh), Urdu (Nastaliq), Hebrew). See
`docs/FONT_INVENTORY_AND_LICENSES.md` for the full list. OFL 1.1 permits bundling and
redistribution with the license notice — retain each family's `OFL.txt` when distributing.
CJK fonts are not bundled (optional add-on; see `docs/OFFLINE_FONT_INSTALLATION_GUIDE.md`).

## User uploads
Photographs and images uploaded by users remain the property of the user and are stored
locally. They are recorded in the `assets` table with `license = "User upload"`.
