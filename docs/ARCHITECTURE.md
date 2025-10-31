# Architecture Overview

## 1. Goal

You're building a Retool-like dashboard builder in React 19, where users can:

- Drag widgets (charts, tables, lists, etc.) from a sidebar onto a grid canvas
- Resize and reposition them freely
- Edit properties via a right-side inspector panel
- Auto-save to LocalStorage
- Export/import dashboards and individual widgets
- Support undo/redo and future persistence to backend

All while being performant, modular, and future-proof.

---

## 2. High-level Architecture
```
┌────────────────────────────────────────────────────────────┐
│                        React App                           │
│                                                            │
│  ┌──────────┐   ┌────────────────┐   ┌───────────────┐     │
│  │ Sidebar  │→→→│   CanvasGrid   │←→│  Right Panel   │     │
│  │ (palette)│   │(Gridstack.js)  │   │ (Inspector)   │     │
│  └──────────┘   └────────────────┘   └───────────────┘     │
│           ↑             ↓                  ↑               │
│           │      Redux Toolkit Store       │               │
│           └────────────────────────────────┘               │
│                    (core, selection, ui)                   │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack & Rationale

| Layer | Library | Why |
|-------|---------|-----|
| **UI Framework** | React 19 | Modern concurrency, server actions-ready, widest ecosystem |
| **Layout & DnD** | Gridstack.js | Mature, resizable, drag-drop grid with external item drops |
| **State Management** | Redux Toolkit | Predictable, debuggable, supports undo/redo and middleware |
| **Persistence** | LocalStorage (via Listener Middleware) | Simple, zero backend, debounced auto-save |
| **Undo/Redo** | redux-undo | Time-travel debugging, undo user mistakes |
| **Inspector Forms** | react-hook-forms | Schema-driven property editing |
| **Charts** | Tremor | Good defaults + exportable canvases |
| **Tables** | Tremor Table | Feature-rich, type-safe |
| **Export Utils** | html2canvas / jsPDF / SheetJS | For image, PDF, and CSV export |
| **Styling** | Tailwind + CSS vars | Simple theming, responsive grid |

---

## 4. Redux Store Design

Your Redux Toolkit store is modular and future-proof:

### coreSlice (persistent state)

Holds the actual dashboard:
- `instances`: normalized widgets (charts, tables, etc.)
- `layout`: grid positioning
- `version`, `name`

**Reducers:**
- `addWidget`, `updateWidgetProps`, `moveResizeWidget`, `removeWidget`
- `setLayout`, `importDashboard`, `resetDashboard`

**Why:** Keeps layout and widget definitions normalized = faster rendering, easier persistence, and smaller payloads.

### selectionSlice (ephemeral)

Holds currently selected widget ID.

**Why:** Avoids re-rendering entire dashboard on selection change.

### uiSlice

Holds transient UI state:
- Right panel open?
- Active tab?
- Save status ("saving", "saved")

**Why:** Separates UX and layout state from business logic.

### undo/redo (via redux-undo)

Wraps coreSlice to allow state history.

**Why:** User mistakes (dragging/deleting) are common. Undo/redo dramatically improves usability and testing.

### listenerMiddleware

Observes changes in the `coreSlice.present` and automatically saves dashboards to LocalStorage with debounce.

```typescript
predicate: (action, current, prev) =>
  current.core.present !== prev.core.present
```

**Why:**
- Works like a global useEffect for Redux
- Keeps persistence logic out of reducers
- Allows cancellation (abort if user keeps dragging)
- Clean and modular

---

## 5. Data Flow Overview

```
[Drag widget from Sidebar]
        │
        ▼
  dispatch(addWidget(type, at, size, defaults))
        │
        ▼
     Redux coreSlice → updates state.layout & instances
        │
        ▼
     CanvasGrid re-renders from store
        │
        ▼
  User resizes/moves → moveResizeWidget()
        │
        ▼
  Listener middleware sees diff → debounced save to LocalStorage
```

**Inspector flow:**
- Inspector reads selected widget props (selectionSlice)
- On form change, dispatches `updateWidgetProps`
- Redux updates → autosave triggers again

---

## 6. Component Structure

| Component | Purpose |
|-----------|---------|
| **Sidebar** | Lists draggable widget types (table, chart, etc.). Each has default size & props from WIDGETS registry. |
| **CanvasGrid** | Gridstack container for placed widgets. Handles drag, resize, drop. Dispatches Redux actions for layout. |
| **WidgetRenderer** | Renders the right component (Chart, Table, List) from registry. |
| **Inspector** | Schema-driven property editor bound to selected widget props. |
| **AppToolbar** | Undo, redo, export, import, save status indicator. |

---

## 7. Widget Registry

Centralized definition for all widget types.

```typescript
type WidgetMeta = {
  type: "chart" | "table" | ...;
  defaultSize: { w: number; h: number };
  defaultProps: Record<string, any>;
  editorSchema: JSONSchema7;
  renderer: React.FC<any>;
};

export const WIDGETS: Record<string, WidgetMeta> = { ... };
```

**Why:** One source of truth for defaults, schemas, and renderers = adding a new widget becomes plug-and-play.

---

## 8. Persistence Strategy

- **Autosave**: Redux listener middleware saves DashboardDoc JSON to LocalStorage every time `core.present` changes (debounced)
- **Export**: Downloads dashboard as `.dashboard.json`
- **Import**: Parses JSON, migrates if needed, and loads into store
- **Versioning**: Each document has `version` field to handle future schema upgrades
- **Undo/redo**: Never persisted (ephemeral)

**Why:** Simple, safe, zero-backend. You can later add cloud sync (e.g. Supabase or Firebase) without changing internal state shape.

---

## 9. Exporting Features

### Whole Dashboard
- Serialize Redux state → JSON file
- Version + metadata
- Used for backup, import/export

### Individual Widget
- Export widget definition only (`{ type, props, dataBinding, dataSnapshot }`)
- Re-importable into another dashboard

### Visual Exports
- **Chart** → PNG/SVG/PDF using native chart library or html2canvas + jsPDF
- **Table** → CSV/XLSX via SheetJS
- **Widget** → Screenshot for image preview

**Why:** Supports "share widget", "export report", and "offline snapshot".

---

## 10. Data Binding System (future-ready)

Each widget can optionally include a dataBinding:

```typescript
dataBinding: {
  source: "REST" | "STATIC" | "SQL" | "CUSTOM",
  config: { endpoint: string; query?: string; mapping?: any }
}
```

A central data service resolves bindings → supplies data prop to widget renderers.
Cached, debounced, and refreshable.

**Why:** Lets users connect real data sources later without refactoring UI.

---

## 11. Performance Techniques

| Area | Technique | Why |
|------|-----------|-----|
| **Re-renders** | Normalized state + useSelector slices | Only affected components update |
| **Dragging** | Update layout only on onDragStop / onResizeStop | Avoid thrashing |
| **Save** | Debounced (600–800 ms) in listener middleware | Prevents write storms |
| **Inspector** | Memoized schema forms | Avoid re-building forms on every keystroke |
| **Grid rendering** | Virtualize long widget lists if needed | Scalability for 100+ widgets |

---

## 12. Security & Safety

- Don't persist credentials or tokens in LocalStorage
- Never include secrets in exported JSON
- Validate imported JSON (schema + version check)
- Use unique IDs (`crypto.randomUUID()`) to avoid collisions on import
- Sanitize data in widget props before rendering (XSS safety)

---

## 13. Undo / Redo Flow

- `redux-undo` wraps coreSlice
- Only specific actions (add/remove/move/update) are tracked
- Ctrl+Z and Ctrl+Shift+Z mapped to undo/redo
- Uses `present` state for rendering, `past`/`future` kept in memory

**Why:** Essential for UX polish and user safety in a builder app.

---

## 14. Extensibility & Future Steps

- **Multi-dashboard system** — allow multiple saved dashboards with thumbnail previews
- **Cloud sync** — persist dashboards to Supabase/Postgres
- **User auth (OAuth2/OIDC)** — secure personal dashboards
- **Collaboration mode** — sync layout changes in real time (WebSockets + Y.js/CRDT)
- **Custom widget SDK** — allow developers to register custom React widgets dynamically

---

## 15. Key Design Philosophies

| Principle | Implementation |
|-----------|----------------|
| **Declarative over imperative** | Redux actions describe intent, not implementation |
| **Schema-driven everything** | Widgets, inspector, bindings — all defined in registries |
| **Isolation of concerns** | UI (components) vs. State (Redux) vs. Persistence (middleware) |
| **Undo safety** | Every user action reversible |
| **Persistence transparency** | Users never have to "Save"; state just stays |
| **Portability** | Entire dashboard portable via JSON |
| **Future scalability** | Can plug a backend or auth layer later with no architectural rewrite |

---

## 16. Summary in Plain English

You've effectively designed a mini-Retool engine:

- A grid editor powered by Gridstack.js for positioning
- A Redux Toolkit store with slices for layout, widgets, and UI
- Undo/redo, auto-save, and export/import via Listener Middleware
- Schema-driven inspector for dynamic widget editing
- Pluggable registry so new widgets are just config
- Performant, resilient, extensible — ready to evolve into a real low-code platform