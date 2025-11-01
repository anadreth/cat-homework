# Step-by-Step Build Plan

## Phase 0 — Project Scaffold & Foundations

- [x] Create React 19 app (Vite + TS)
- [x] Add dependencies:
  - [x] `@reduxjs/toolkit`, `react-redux`, `redux-undo`
  - [x] `gridstack`
  - [x] `react-hook-form`
  - [x] Tremor UI components (see CLAUDE.md for install commands)
  - [x] `html2canvas`, `jspdf`, `xlsx`
- [x] Decide grid units: 12 columns; choose cellHeight & breakpoints
- [x] Implement Tailwind for Vite ([Tremor Installation Guide](https://www.tremor.so/docs/getting-started/installation))
- [x] Set folder layout:
  ```
  src/
    store/ (store, providers, slices, selectors)
    components/../blocks.tsx,widget.tsx
    hooks/
    pages/
    utils/
    constants/
    mock/
    ...etc
    tests/
  ```

---

## Phase 1 — State Model & Store

- [x] Define types: `WidgetInstance`, `LayoutItem`, `DashboardDoc`
- [x] Implement `coreSlice` (layout + instances + import/reset)
- [x] Implement `selectionSlice` (selectedId)
- [x] Implement `uiSlice` (panel open/tab, saveStatus)
- [x] Wrap `coreSlice` with `redux-undo` (limit ~100)
- [x] Configure store; add listener middleware placeholder

---

## Phase 2 — Canvas Grid (Gridstack)

- [x] Build `CanvasGrid` component: initialize Gridstack; render tiles from `core.present.layout`
- [x] Map grid events → Redux:
  - [x] onAdded/external drop → `addWidget`
  - [x] drag/resize stop → `moveResizeWidget`
  - [x] delete via tile toolbar → `removeWidget`
- [x] Selection: click header selects tile (`selectionSlice.select(id)`)
- [x] Clear canvas button → `resetDashboard`

---

## Phase 3 — Palette (Drag from Sidebar)

- [x] Build `Palette` with widget types (Table/Chart/List/Text)
- [x] Enable Gridstack external drops; show ghost size per widget default
- [x] On drop: create `WidgetInstance` with defaults + layout; auto-select

---

## Phase 4 — Widget Registry & Renderer

- [x] Create `WIDGETS` registry: defaultSize, defaultProps, editorSchema, renderer
- [x] Implement `WidgetRenderer` to pick the right component from registry
- [x] Add minimal renderers:
  - [x] `ChartWidget`
  - [x] `TableWidget`
  - [x] `ListWidget`
  - [x] `TextWidget`
 
---

## Phase 5 — Inspector (Right Panel)

- [x] Build `Inspector`: reads selectedId → instance props + editorSchema
- [x] Use react-hook-form to edit props; dispatch `updateWidgetProps`
---

## Phase 6 — Autosave & Persistence

- [x] Implement listener middleware to persist `{layout, instances, meta}` to LocalStorage (debounced 700ms)
- [x] On app load: hydrate from LocalStorage, else start with empty dashboard
- [x] Save status indicator (idle/saving/saved/error)

---

## Phase 7 — Export / Import

- [x] Export dashboard JSON (`.dashboard.json`) with version, exportedAt
- [x] Import JSON: validate schema + version with Zod; `importDashboard`
- [x] Per-widget export (`.widget.json`) with widget metadata
- [x] Fix widget import ID mismatch bug (ensure new IDs generated)

---

## Phase 8 — Visual/File Exports

- [x] Chart → PNG/PDF via html2canvas + jsPDF
- [x] Table → CSV/XLSX (SheetJS)
- [x] Widget screenshot (tile DOM → html2canvas)
- [x] Dashboard export menu: JSON
- [x] Widget menu: JSON/PNG/PDF/CSV/XLSX

---

## Phase 9 — Constraints & Responsiveness - SKIPPING (future impl)

- Breakpoints: store separate layouts per breakpoint - use toggle group to simulate different canvas widths for different screen sizes and these should be specifically and separately saved in localStorage, export, import

---

## Phase 10 — Undo/Redo Integration & Safeguards

- [x] Wire toolbar buttons to undo/redo (redux-undo)
- [x] Ensure autosave operates on present state; exclude history from persistence
- [x] Add undo/redo to mobile menu for mobile accessibility
- [x] Add selectors for canUndo/canRedo state to enable/disable buttons

---

## Phase 11 — Documentation & Example Content

- [ ] Update README:
  - [ ] Architecture
  - [ ] Guides
  - [ ] etc...

## Phase 12 - Unit tests
- [ ] write unit test with vitest for import/export functionality, adding widgets to canvas, clearing canvas, editing widget properties, autosave functionality, undo/redo, drag/drop from palette,  