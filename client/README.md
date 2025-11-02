# Dashboard Builder

A dashboard builder built with React 19, TypeScript, Redux Toolkit, and Gridstack. Create customizable dashboards by dragging widgets onto a responsive grid canvas, editing properties in real-time, and exporting to multiple formats.

![Dashboard Builder](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Redux](https://img.shields.io/badge/Redux-Toolkit-purple) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### Core Functionality
- **Drag-and-Drop Interface** - Intuitive widget placement from sidebar palette
- **Real-time Editing** - Live property editing with instant visual feedback
- **Responsive Grid System** - 12-column Gridstack-powered layout with resize/drag
- **Widget Library** - Charts, Tables, Lists, and Text widgets
- **Undo/Redo** - Full history management with 100-step limit
- **Auto-save** - Debounced (700ms) persistence to LocalStorage

### Data Management
- **Export Formats**:
  - Dashboard JSON (`.dashboard.json`)
  - Individual widget JSON (`.widget.json`)
  - Charts as PNG/PDF
  - Tables as CSV/XLSX
  - Widget screenshots

- **Import Support**:
  - Full dashboard restoration
  - Individual widget import with ID regeneration
  - Schema validation with Zod

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd cat-homework

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the application.

---

## 📖 Architecture

### Tech Stack

| Technology | Purpose |
|------------|---------|
| **React** | UI framework with React Compiler |
| **TypeScript** | Type safety and developer experience |
| **Redux Toolkit** | State management |
| **redux-undo** | Time-travel debugging & undo/redo |
| **Gridstack.js** | Drag-resize grid system |
| **Tremor** | UI component library |
| **react-hook-form** | Form state management |
| **Zod** | Runtime schema validation |
| **Tailwind CSS** | Utility-first styling |
| **Vite** | Build tool and dev server |

### State Management

```
store/
├── index.ts          # Store configuration
├── slices/
│   ├── coreSlice.ts      # Widget instances & layout (with redux-undo)
│   ├── selectionSlice.ts # Selected widget tracking
│   └── uiSlice.ts        # Panel states & save status
└── middleware/
    └── autosave.ts       # Debounced LocalStorage persistence
```

**State Structure:**
```typescript
{
  core: {
    past: [],        // Undo history
    present: {
      dashboard: {
        widgets: {},     // Widget instances by ID
        layout: [],      // Position & size data
        meta: {}         // Dashboard metadata
      }
    },
    future: []       // Redo history
  },
  selection: {
    selectedId: string | null
  },
  ui: {
    paletteOpen: boolean,
    inspectorOpen: boolean,
    saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  }
}
```

### Component Architecture

```
components/
├── Canvas/              # Gridstack grid + Redux integration
│   ├── index.tsx        # Canvas container
│   └── blocks.tsx       # Grid providers & rendering
├── Palette/             # Widget sidebar
├── Inspector/           # Property editor panel
│   └── PropertyEditor.tsx
├── WidgetWrapper/       # Widget container with toolbar
├── ExportImport/        # Export/import functionality
├── MobileMenu/          # Mobile navigation
└── [WidgetType]/
    ├── widget.tsx       # Widget component
    └── blocks.tsx       # Tremor UI components
```

### Data Flow

```
User Action → Redux Action → Reducer Updates State
     ↓
State Change → Component Re-render
     ↓
Autosave Middleware → LocalStorage (debounced)
```

---

## 🎨 Widget System

### Widget Registry

All widgets are registered in `src/constants/widget-registry.ts`:

```typescript
export const WIDGET_REGISTRY = {
  chart: {
    name: 'Chart',
    description: 'Area chart visualization',
    defaultSize: { w: 6, h: 4 },
    defaultProps: { /* ... */ },
    editorSchema: { /* ... */ }
  },
  // ... more widgets
}
```

### Adding a New Widget

1. **Create Widget Component** (`src/components/MyWidget/widget.tsx`):
```typescript

export type MyWidgetProps = {
  title: string;
  value: number;
};

export const MyWidget = (props: MyWidgetProps) => {
  return <div>{props.title}: {props.value}</div>;
}a
```

2. **Register Widget**:
```typescript
// src/constants/widget-registry.ts
import { MyWidget } from "@/components/MyWidget/widget";

export const WIDGET_COMPONENT_MAP = {
  mywidget: MyWidget,
  // ... existing widgets
};

export const WIDGET_REGISTRY = {
  mywidget: {
    name: 'My Widget',
    description: 'Custom widget description',
    defaultSize: { w: 4, h: 3 },
    defaultProps: {
      title: 'Default Title',
      value: 0
    },
    editorSchema: {
      sections: [{
        title: 'Settings',
        fields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'value', label: 'Value', type: 'number' }
        ]
      }]
    }
  }
};
```

3. **Add Icon** (in Palette):
```typescript
// src/components/Palette/index.tsx
const WIDGET_ICONS = {
  mywidget: RiCustomIcon,
  // ... existing icons
};
```

---

## 🔧 Configuration

### Grid Settings

Configure grid behavior in `src/constants/grid.ts`:

```typescript
export const GRID_COLUMNS = 12;      // 12-column grid
export const CELL_HEIGHT = 60;       // Height per row (px)
export const VERTICAL_MARGIN = 10;   // Gap between widgets (px)
```

### Autosave Configuration

Adjust autosave behavior in `src/store/middleware/autosave.ts`:

```typescript
const STORAGE_KEY = "cat-dashboard";
const DEBOUNCE_MS = 700;  // Milliseconds to wait before saving
```

### Undo/Redo History

Modify history limit in `src/store/index.ts`:

```typescript
const undoableCore = undoable(coreSlice.reducer, {
  limit: 100  // Maximum undo steps
});
```

---

## 📱 Usage Guide

### Desktop

1. **Add Widgets**: Drag from left palette onto canvas
2. **Resize/Move**: Drag widget edges or drag header to reposition
3. **Edit Properties**: Click widget header → Edit in right Inspector panel
4. **Delete Widget**: Click delete icon in widget header
5. **Undo/Redo**: Use toolbar buttons or Ctrl+Z / Ctrl+Shift+Z
6. **Export**: Click Export button → Choose format
7. **Import**: Click Import button → Select JSON file

---

## 🧪 Testing

```bash
# Run tests (when implemented)
npm run test

# Type checking
npm run build
```

---

## 📁 Project Structure

```
cat-homework/
├── src/
│   ├── components/       # React components
│   │   ├── Canvas/       # Grid canvas
│   │   ├── Palette/      # Widget sidebar
│   │   ├── Inspector/    # Property editor
│   │   ├── [Widget]/     # Widget components
│   │   └── ...
│   ├── store/            # Redux store
│   │   ├── slices/       # State slices
│   │   └── middleware/   # Custom middleware
│   ├── constants/        # Constants & config
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Root component
│   └── main.tsx          # Entry point
└── package.json
```

---

## 🐛 Troubleshooting

### Widgets Not Dragging
- Ensure Gridstack is initialized (check browser console)
- Verify `.palette-item` class on draggable elements

### Autosave Not Working
- Check LocalStorage is enabled in browser
- Verify 700ms debounce isn't being interrupted

### Import Fails
- Ensure JSON matches schema version
- Check browser console for validation errors

### Performance Issues
- Limit widgets on canvas (<50 recommended)
- Check React DevTools Profiler for render cycles

---

## 🔮 Future Enhancements

### Planned Features (Not Yet Implemented)
- **Responsive Breakpoints** - Separate layouts for mobile/tablet/desktop
- **Unit Tests** - Vitest test suite for core functionality
- **Widget Templates** - Pre-built dashboard templates
- **Real-time Collaboration** - Multi-user editing
- **API Integration** - Connect widgets to live data sources
- **Custom Themes** - Dark mode and custom color schemes