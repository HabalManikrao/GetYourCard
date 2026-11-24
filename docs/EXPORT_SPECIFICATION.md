# Export Specification

## Pipeline

1. The editor renders the target page(s) to a clean Fabric canvas (selection handles
   discarded) and calls `canvas.toDataURL({ multiplier })`.
2. The multiplier maps design units → output pixels (`src/lib/export.ts`).
3. PNG/JPG: the data URL is converted to a Blob and downloaded.
4. PDF: pages are placed with jsPDF (`buildPDF`), one design page per PDF page.
5. The export is recorded server-side (`POST /api/exports`) and the file is stored under
   `storage/exports/`.

Because the raster is captured **after** the browser shapes glyphs, every script and RTL
language appears exactly as on screen. Fonts are awaited (`ensureFonts`) before capture.

## Formats & quality tiers

| Tier | Multiplier | Output width (from 1080) | Use |
|------|-----------|--------------------------|-----|
| standard | 1× | 1080 px | quick share |
| high | 2× | 2160 px | high-resolution image |
| print | 2.8× | ~3024 px (≈300+ DPI at A5) | print shop |
| whatsapp | 1× | 1080 px portrait | compact chat share |

## Recommended canvas / page sizes

| Format | Dimensions |
|---|---|
| Digital portrait | 1080 × 1920 (default) |
| Digital landscape | 1920 × 1080 |
| A5 portrait | 148 × 210 mm |
| A4 portrait | 210 × 297 mm |
| Square social | 1080 × 1080 |

## PDF options

- **Digital** — page sized to the rendered pixels (screen-accurate, multi-page).
- **A5 / A4** — physical page in mm; artwork fit preserving aspect, centred, with an
  optional **3 mm bleed** on the print tier. Portrait orientation.

## Download menu (editor → Download)

- PNG — High resolution
- PNG — Print (300 DPI)
- JPG — High resolution
- JPG — WhatsApp (compact)
- PDF — Digital (all pages)
- PDF — A5 Print + bleed (all pages)
- PDF — A4 Print + bleed (all pages)

## Guarantees

- Downloads match the canvas preview (same renderer, no editor chrome or selection handles).
- Multi-page PDFs include every design page (front + inside).
- Verified by `frontend/e2e/export.spec.ts`: PNG magic bytes `89 50 4E 47`, PDF header
  `%PDF-`, non-trivial file sizes, correct filename extensions.

## Print tips

- Use the **Print (300 DPI)** or **A5/A4 + bleed** options for a print shop.
- Keep key text within ~5 mm of the page edge (safe margin); bleed extends the background.
