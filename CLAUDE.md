# Lead Engineer for React-19 "Retool-style" Dashboard Builder

## Mission

Produce production-quality React 19 code and docs for a Retool-like dashboard builder:

- Drag widgets (charts, tables, lists, text) from a palette onto a resizable, snap-to-grid canvas
- Edit widget properties in a right-hand inspector
- Persist state to LocalStorage (debounced), support export/import (JSON) and per-widget visual exports (PNG/PDF/CSV/XLSX)
- Provide undo/redo, clean architecture, and strong tests

---

## Guardrails & Principles

- **Clean Code**: readable, intention-revealing names; no clever hacks
- **KISS**: simplest thing that works; avoid premature abstraction
- **DRY**: share logic via utilities and registries; avoid duplicating reducers/effects
- **Refactor relentlessly**: small, incremental changes; keep diffs reviewable
- **Small files & components**: aim for <200–250 LOC per file; split responsibly
- **TypeScript strict**: `strict: true`, no `any`
- **Determinism**: reducers pure; effects in middleware
- **Accessibility**: keyboard selection, focus outlines, ARIA where applicable

---

## Tech Stack (non-negotiable)

### Core
- **React 19** + **TypeScript**
- **Grid**: Gridstack.js (drag, resize, external drops)
- **State**: Redux Toolkit with slices; redux-undo for history; Listener Middleware for autosave & side effects
- **Forms (Inspector)**: react-hook-forms

### UI Components: Tremor
[Tremor Documentation](https://www.tremor.so/docs/getting-started/installation)

| Component | Install Command | Docs |
|-----------|----------------|------|
| AreaChart | `npm i recharts` | [Docs](https://www.tremor.so/docs/visualizations/area-chart) |
| Table | - | [Docs](https://www.tremor.so/docs/ui/table) |
| Input | `npm install tailwind-variants @remixicon/react` | [Docs](https://www.tremor.so/docs/inputs/input) |
| Label | `npm install @radix-ui/react-label` | [Docs](https://www.tremor.so/docs/inputs/label) |
| Select | `npm install @radix-ui/react-select` | [Docs](https://www.tremor.so/docs/inputs/select) |
| Checkbox | `npm install @radix-ui/react-checkbox` | [Docs](https://www.tremor.so/docs/inputs/checkbox) |
| Button | `npm install @radix-ui/react-slot tailwind-variants @remixicon/react` | [Docs](https://www.tremor.so/docs/ui/button) |

### Exports & Styling
- **Exports**: html2canvas, jsPDF, SheetJS (xlsx)
- **Styling**: Tailwind (utility-first)

---

## Performance

- Subscribe via selectors to minimal slices; memoize heavy components
- Avoid prop-drilling big objects; pass ids, select in child
- Batch updates; commit on stop events; throttle live metrics
- Keep files small and cohesive; extract hooks/utils early

---

## Code Style & Conventions

- **TypeScript everywhere**; no `any` without comment
- **Functions** ≤ 50–80 lines; **components** ≤ 200–250 LOC; split by responsibility
- **Names**: `verbNoun` for actions (`addWidget`), `selectThingById` for selectors
- Prefer pure utilities over inline lambdas in render trees
- ESLint (recommended + React + TS), Prettier, strict CI

---

## Do / Don't

### ✅ Do
- Keep reducers pure, effects in listener middleware
- Normalize instances, version persisted docs, debounce autosave
- Use schema-driven inspector and a widget registry

### ❌ Don't
- Put business logic in React components or reducers
- Store secrets/tokens in LocalStorage or export files
- Couple widgets to the grid—renderer accepts `{ id }` and selects its own data

---

## Output Expectations for the AI Agent

- Generate small, focused files that match the folder layout
- Include types, selectors, and tests alongside slices/components
- Provide docstrings for public utilities and reducers
- When adding a widget type, update the registry, provide a schema, a renderer, and demo fixtures
- When touching persistence, update migrations and tests
- Always include a brief rationale (1–3 lines) with non-obvious decisions
- Always use latest libraries