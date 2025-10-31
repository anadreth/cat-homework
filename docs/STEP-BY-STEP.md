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

- [ ] Build `CanvasGrid` component: initialize Gridstack; render tiles from `core.present.layout`
- [ ] Map grid events → Redux:
  - [ ] onAdded/external drop → `addWidget`
  - [ ] drag/resize stop → `moveResizeWidget`
  - [ ] delete via tile toolbar → `removeWidget`
- [ ] Selection: click header selects tile (`selectionSlice.select(id)`)

---

## Phase 3 — Palette (Drag from Sidebar)

- [ ] Build `Palette` with widget types (Table/Chart/List/Text)
- [ ] Enable Gridstack external drops; show ghost size per widget default
- [ ] On drop: create `WidgetInstance` with defaults + layout; auto-select

---

## Phase 4 — Widget Registry & Renderer

- [ ] Create `WIDGETS` registry: defaultSize, defaultProps, editorSchema, renderer
- [ ] Implement `WidgetRenderer` to pick the right component from registry
- [ ] Add minimal renderers:
  - [ ] `ChartWidget`
  - [ ] `TableWidget`
  - [ ] `ListWidget`
  - [ ] `TextWidget`
 
---

## Phase 5 — Inspector (Right Panel)

- [ ] Build `Inspector`: reads selectedId → instance props + editorSchema
- [ ] Use JSON-schema form lib to edit props; dispatch `updateWidgetProps`
- [ ] Tabs: Properties, Data, Appearance (wire up later)

---

## Phase 6 — Autosave & Persistence

- [ ] Implement listener middleware to persist `{layout, instances, meta}` to LocalStorage (debounced 600–800ms)
- [ ] On app load: hydrate from LocalStorage, else start with empty dashboard
- [ ] Save status indicator (idle/saving/saved/error)

---

## Phase 7 — Export / Import

- [ ] Export dashboard JSON (`.dashboard.json`) with version, exportedAt
- [ ] Import JSON: validate schema + version; id remap if needed; `importDashboard`
- [ ] Per-widget export (`.widget.json`) with optional dataSnapshot

---

## Phase 8 — UX Polish

- [ ] Drag handle only on header; body stays interactive
- [ ] Tile toolbar: Rename, Duplicate, Export, Delete, Lock (position/size)
- [ ] Keyboard shortcuts:
  - [ ] Delete to remove
  - [ ] Arrows to nudge
  - [ ] Shift for larger step
- [ ] Empty state: onboarding hint ("Drag a widget here")

---

## Phase 9 — Data Binding (v1)

- [ ] Define `dataBinding` model (Static/REST/Custom)
- [ ] Implement simple data service: resolves binding → returns normalized data; cache & debounce
- [ ] Inspector "Data" tab to edit binding; pass `{props, data}` to renderer

---

## Phase 10 — Visual/File Exports

- [ ] Chart → PNG/SVG/PDF: prefer native chart export; fallback html2canvas + jsPDF
- [ ] Table → CSV/XLSX (SheetJS)
- [ ] Widget screenshot (tile DOM → html2canvas)
- [ ] Dashboard export menu: JSON
- [ ] Widget menu: JSON/PNG/PDF/CSV

---

## Phase 11 — Constraints & Responsiveness

- [ ] Per-widget minW/minH/maxW/maxH pulled from registry → apply to grid
- [ ] Breakpoints: store separate layouts per breakpoint or keep one canonical layout with packing rules

---

## Phase 12 — Undo/Redo Integration & Safeguards

- [ ] Wire toolbar buttons to undo/redo (redux-undo)
- [ ] Ensure autosave operates on present state; exclude history from persistence

---

## Phase 13 — Performance Pass

- [ ] Subscribe components via selector hooks (slice smallest needed data)
- [ ] Throttle drag updates; commit only on stop events
- [ ] Memoize `WidgetRenderer` and Inspector forms

---

## Phase 14 — Documentation & Example Content

- [ ] Seed example dashboard with 3 widgets
- [ ] Add README:
  - [ ] Architecture diagram
  - [ ] How to add a new widget type
  - [ ] Import/export format