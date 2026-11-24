# Design Editor Functional Audit (Phase E)

**Method:** source inspection of `frontend/src/editor/*` + `store/editor.ts` +
`pages/Editor.tsx`, cross-referenced with executed E2E (`flows`, `smoke`, `visual-check`).
Browser-interaction coverage via Playwright is limited (see notes); several controls are
verified by code presence + wiring but **not** by automated interaction.

| Control | Implemented | Wired to canvas/store | Automated-tested | Notes |
|---------|-------------|-----------------------|------------------|-------|
| Add text | ✅ `LeftPanel.addText` | ✅ `addElement` | ✅ flows:TC013 | |
| Edit text (canvas dbl-click) | ✅ `DesignCanvas text:editing:exited` | ✅ `onTextEdited` | ⚠️ via right-panel textarea (flows:TC015) | canvas inline edit not E2E-clicked |
| Edit text (panel) | ✅ `RightPanel TextProps` | ✅ `patchElement` | ✅ flows:TC015 | |
| Move text | ✅ Fabric drag → `object:modified` | ✅ `onModify` | ❌ | not E2E-asserted |
| Resize text | ✅ scale→fontSize/width readback | ✅ `emitModify` | ❌ | |
| Rotate text | ✅ `angle` readback | ✅ | ❌ | |
| Change font | ✅ `TextProps` select | ✅ | ⚠️ | visual-check switches script font |
| Change colour | ✅ `ColorRow` | ✅ | ❌ | |
| Change alignment | ✅ toggles | ✅ | ❌ | |
| Change text direction (RTL) | ✅ `direction` select | ✅ | ⚠️ | visual-check (Arabic auto) |
| Add image | ✅ `LeftPanel onUpload` | ✅ | ⚠️ backend upload tested | placement not E2E |
| Move/resize image | ✅ Fabric | ✅ | ❌ | |
| **Crop image** | ❌ | — | — | **NOT IMPLEMENTED** |
| Add decoration | ✅ `LeftPanel` motifs grid | ✅ | ❌ | 24 motifs |
| Delete decoration/element | ✅ `deleteElement` + Delete key | ✅ | ⚠️ undo path | |
| Layer ordering | ✅ `reorder` (front/back/fwd/bwd) | ✅ | ❌ | |
| **Group / ungroup** | ❌ | — | — | **NOT IMPLEMENTED** |
| Lock / unlock | ✅ `toggleLock` | ✅ | ❌ | |
| Undo | ✅ `editor.undo` | ✅ | ✅ flows:TC013 | |
| Redo | ✅ `editor.redo` | ✅ | ❌ | keyboard wired |
| Zoom (in/out/fit) | ✅ `zoomBy/setZoom` | ✅ | ⚠️ | present in UI |
| **Pan** | ❌ | — | — | **NOT IMPLEMENTED** (scroll container only) |
| Multi-page editing | ✅ page tabs `setActivePage` | ✅ | ⚠️ | front/inside |
| Real-time preview | ✅ store→render effect | ✅ | ✅ visual | |
| Editor usable after language switch | ✅ | ✅ | ✅ visual-check | verified |

## Inert / missing controls
- **Image crop** — no crop tool or UI anywhere.
- **Group/ungroup** — not implemented (Fabric supports it; not surfaced).
- **Pan** — only the scroll container; no hand-tool/space-drag.
- **Custom font upload** — `registerCustomFont` exists but no control invokes it.

## Interaction integrity
Every *rendered* button in the panels dispatches a real store action (no decorative/no-op
buttons found in `LeftPanel.tsx`/`RightPanel.tsx`/`TopToolbar.tsx`). The gaps above are
**absent features**, not dead buttons.

## Coverage caveat
Drag, resize, rotate, colour, alignment, decoration-add, layer-order, and lock are
implemented and wired but **not covered by automated interaction tests** — they are verified
by code + manual reasoning only. Recommend Playwright drag/resize/property tests.

**Status: PARTIALLY IMPLEMENTED** — core editing works; crop, group/ungroup, and pan missing;
interaction test coverage thin.
