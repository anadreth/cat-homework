# Component Testing

## Overview

This test suite validates widget component rendering and UI behavior. These tests complement the Redux store tests by verifying that state changes actually result in correct UI updates.

## Test Philosophy

### Two Layers of Testing

**1. Redux Store Tests** (`src/tests/widget-management/`)
- Test state management logic
- Verify actions update store correctly
- Check selectors return correct data
- Fast, isolated unit tests

**2. Component/UI Tests** (`src/tests/components/`) **← You are here**
- Test component rendering from store
- Verify UI matches state
- Check error states and edge cases
- Integration tests connecting Redux → UI

**Both are needed for complete coverage!**

## What This Suite Tests

### Widget.test.tsx - Core Rendering

**Goal:** Verify the `Widget` component correctly renders different widget types from the Redux store.

**Key Test Cases:**
- ✅ Renders chart widget with data
- ✅ Renders table widget with columns
- ✅ Renders list widget with items
- ✅ Renders text widget with content
- ✅ Returns null when widget not found in store

**What This Validates:**
- Store → Component data flow works
- `selectWidgetById` selector works correctly
- `WIDGET_COMPONENT_MAP` maps types to components
- `WidgetWrapper` wraps widgets correctly
- Missing widgets don't crash the app

### AreaChart.test.tsx - Chart-Specific Behavior

**Goal:** Test chart widget's rendering logic and error handling.

**Key Test Cases:**
- ✅ Renders chart with valid data/categories
- ✅ Shows error when data is empty
- ✅ Shows error when categories are empty

**What This Validates:**
- Chart renders with proper data
- Error states display user-friendly messages
- Component doesn't crash with invalid props
- Error UI is visible and helpful

## Testing Approach

### Using `renderWithProviders`

The `renderWithProviders` utility (from `test-utils.tsx`) wraps components with Redux Provider, making store state available during tests.

**Example:**
```typescript
import { renderWithProviders } from '../test-utils';
import { Widget } from '@/components/Canvas/blocks/Widget';

const preloadedState = {
  core: {
    present: {
      dashboard: {
        instances: {
          'widget-id': {
            id: 'widget-id',
            type: 'chart',
            props: { data: [...], index: 'date', categories: ['sales'] }
          }
        },
        layout: [...]
      }
    }
  }
};

renderWithProviders(
  <Widget widgetId="widget-id" widgetType="chart" />,
  { preloadedState }
);
```

### Using Standard `render` for Pure Components

For components that don't need Redux (like specific widget implementations), use standard React Testing Library `render`:

```typescript
import { render, screen } from '@testing-library/react';
import { AreaChartWidget } from '@/components/AreaChart/widget';

render(
  <AreaChartWidget
    data={[...]}
    index="date"
    categories={['revenue']}
  />
);
```

## Test Structure

### Preloaded State Pattern

Component tests require full Redux state structure:

```typescript
const preloadedState: Partial<RootState> = {
  core: {
    past: [],              // Undo history
    present: {             // Current state
      dashboard: {
        id: 'test-dashboard',
        name: 'Test Dashboard',
        instances: {       // Widget definitions
          'widget-id': {
            id: 'widget-id',
            type: 'chart',
            props: { ... },
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        },
        layout: [          // Widget positioning
          {
            id: 'widget-id',
            x: 0, y: 0,
            w: 6, h: 4,
            minW: 2, minH: 2
          }
        ],
        meta: {
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      }
    },
    future: []             // Redo history
  }
};
```

### Testing Rendered Output

**DOM Queries:**
```typescript
// By text content
expect(screen.getByText('Chart Title')).toBeInTheDocument();

// By DOM selector (for third-party components)
const chart = document.querySelector('.recharts-wrapper');
expect(chart).toBeInTheDocument();

// Check for null render
const { container } = renderWithProviders(<Widget ... />);
expect(container.firstChild).toBeNull();
```

## What We're NOT Testing (Yet)

These are intentionally out of scope for initial component tests:

- ❌ User interactions (clicks, drags)
- ❌ Widget selection state
- ❌ Delete button functionality
- ❌ Inspector opening on double-click
- ❌ GridStack integration
- ❌ Portal rendering mechanics
- ❌ Real-time state updates
- ❌ Performance with many widgets

**These may be added in future iterations as integration tests.**

## Difference from Redux Tests

| Aspect | Redux Tests | Component Tests |
|--------|-------------|-----------------|
| **What** | State management | UI rendering |
| **Tools** | Direct store dispatch | React Testing Library |
| **Speed** | Very fast | Slower (DOM rendering) |
| **Scope** | Actions, reducers, selectors | Components, JSX, DOM |
| **Example** | `expect(state.instances[id]).toBeDefined()` | `expect(screen.getByText('...')).toBeInTheDocument()` |

## Test Utilities Used

- `renderWithProviders()` - Wraps component with Redux Provider
- `render()` - Standard React Testing Library render
- `screen` - Query rendered output
- `@testing-library/jest-dom` - Extended matchers (`.toBeInTheDocument()`)
- `document.querySelector()` - Direct DOM queries for third-party components

## Coverage Goals

### Current Coverage (Initial Phase)

- **Widget component:** 100% - All widget types render correctly
- **Chart error states:** 100% - Missing data/categories handled
- **Store integration:** Basic - Widget fetches from store

### Future Coverage (Next Phases)

- Widget-specific rendering (Table filters, List empty states)
- User interactions (clicks, selections)
- Error boundaries
- Accessibility tests
- Integration flows (add widget → renders in UI)

## Running Tests

**Run all component tests:**
```bash
npm test components
```

**Run specific test file:**
```bash
npm test components/Widget
npm test components/AreaChart
```

**Watch mode:**
```bash
npm test -- --watch components
```

## Debugging Tips

**Component not rendering:**
- Check preloadedState structure matches RootState type
- Verify widget ID matches between instances and component props
- Ensure all required state fields are present

**Query not finding element:**
- Use `screen.debug()` to see rendered output
- Check for third-party component classes (`.recharts-wrapper`)
- Verify text content matches exactly (case-sensitive)

**Test timing issues:**
- Use `await screen.findByText()` for async rendering
- Use `waitFor()` for state updates

**Inspecting rendered output:**
```typescript
import { screen } from '@testing-library/react';

// See full DOM tree
screen.debug();

// See specific element
const element = screen.getByText('Title');
screen.debug(element);
```

## Future Enhancements

- Add tests for WidgetWrapper (selection, delete, inspector)
- Test widget prop updates trigger re-renders
- Add accessibility tests (ARIA labels, keyboard navigation)
- Test error boundaries
- Add visual regression testing
- Performance tests with many widgets
