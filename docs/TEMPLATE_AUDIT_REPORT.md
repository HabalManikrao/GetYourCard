# Template Engine Audit (Phase D)

**Source:** `backend/app/template_data.py` · seeded to `templates` table ·
verified via `GET /api/templates` (`test_api.test_templates_seeded`).

## Count & distinctness

- **15 templates** exist (audit baseline requests **20** → shortfall of 5).
- They map to **5 structural layout archetypes**:

| Archetype | # templates | Templates |
|-----------|-------------|-----------|
| symmetric_border | 5 | royal-traditional, karnataka-wedding, red-and-gold, peacock-theme, antique-vintage |
| banner_top | 3 | kannada-heritage, modern-elegant, premium-designer |
| floral_corners | 3 | floral-wedding, pastel-wedding, lotus-theme |
| temple_arch | 2 | south-indian-traditional, temple-wedding |
| minimal_lines | 2 | luxury-gold, minimalist-wedding |

**Assessment:** templates differ by **palette, decoration set, and fonts** (more than mere
background-colour swaps — the original "not the same design with different colours" bar is
*met*), but **structural composition repeats** across the 5 archetypes. True visual diversity
is therefore **moderate**, not 15 unique compositions.

## Per-template attribute coverage

Every template provides (verified in `configuration`):

| Attribute | Present | Evidence |
|-----------|---------|----------|
| Unique name | ✅ | `template_name` |
| Palette | ✅ | `configuration.palette` (bg/primary/accent/text) |
| Font config | ✅ | `configuration.fonts` |
| Decorations | ✅ | `configuration.decorations` + element list |
| Background | ✅ | per-page `background` |
| Editable text (tokens) | ✅ | front/inside token elements |
| Dynamic language support | ✅ | token-based → one template, all languages |
| Layout config | ✅ | `configuration.layout` (archetype key) |
| Multi-page | ✅ | 2 pages (Front + Inside) each |
| Preview | ✅ | `GET /api/templates/{id}/preview.svg` (`test_template_preview_svg`) |
| Export compatibility | ✅ | renders via same canvas pipeline |

## Multi-language single template
✅ Confirmed: templates reference tokens (`{{invocation}}`, `{{groom_name}}`, …) and the
front page carries **no hardcoded language** (`test_templates_seeded` asserts
`{{invocation}}`/`{{groom_name}}` present). One template renders any language.

## Gaps
- **F-07 (P2):** 15 < 20 templates; only 5 distinct layouts. Recommend ≥5 additional
  genuinely new layout archetypes (e.g. asymmetric, photo-forward, side-border, arch-and-
  medallion, split-panel) to reach 20 with real structural variety.
- Preview is a generic palette-derived SVG, **not** a render of the actual template
  composition — gallery thumbnails under-represent template differences.

**Status: PARTIALLY IMPLEMENTED** (count & diversity below the audit baseline; attributes complete).
