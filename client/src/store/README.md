# Store Directory

This directory contains the Redux Toolkit store configuration and all state management logic.

## Structure

```
store/
  ├── index.ts              # Store configuration and export
  ├── slices/               # Redux Toolkit slices
  │   ├── coreSlice.ts      # Dashboard layout and widget instances
  │   ├── selectionSlice.ts # Currently selected widget
  │   └── uiSlice.ts        # UI state (panels, tabs, save status)
  └── middleware/           # Custom middleware
      └── autosave.ts       # Listener middleware for LocalStorage persistence
```

## Key Concepts

### Slices

- **coreSlice**: Contains the dashboard document (layout + widget instances). Wrapped with `redux-undo` for time-travel debugging.
- **selectionSlice**: Tracks which widget is currently selected for editing.
- **uiSlice**: Transient UI state that doesn't need to be persisted.

### Middleware

- **autosave**: Listens to state changes and debounces writes to LocalStorage.

## Usage

```typescript
import { store } from '@/store';
import { Provider } from 'react-redux';

// Wrap your app
<Provider store={store}>
  <App />
</Provider>
```

## Best Practices

- Keep reducers pure (no side effects)
- Use listener middleware for async operations
- Normalize state shape (no nested objects)
- Use selectors for derived state
- Memoize expensive selectors with `createSelector`
