# Redux Slices and Selectors Testing

## Overview

This test suite validates the Redux slices (core, selection, UI) and their selectors. These slices manage different aspects of application state with clear separation of concerns.

## State Architecture

### Core Slice
- **Purpose:** Dashboard data (widgets, layout, metadata)
- **Persistence:** LocalStorage via autosave middleware
- **Undo/Redo:** Wrapped with redux-undo
- **Location:** `state.core.present.dashboard`

### Selection Slice
- **Purpose:** Currently selected widget
- **Persistence:** Ephemeral (not saved)
- **Undo/Redo:** Not included
- **Location:** `state.selection.selectedId`

### UI Slice
- **Purpose:** Transient UI state (panels, save status)
- **Persistence:** Ephemeral (not saved)
- **Undo/Redo:** Not included
- **Location:** `state.ui`

## Testing Approach

### 1. Core Slice Selectors

**Goal:** Validate selectors correctly extract data from nested redux-undo structure.

**Key Test Cases:**
- `selectDashboard` - Full dashboard object
- `selectAllWidgets` - Instances map
- `selectWidgetById(id)` - Single widget lookup
- `selectLayout` - Layout array
- `selectLayoutItemById(id)` - Single layout item lookup
- Undefined returns for non-existent IDs

**Strategy:**
- Add widgets to store
- Use selectors to extract data
- Verify correct data returned
- Test edge cases (empty state, non-existent IDs)

**Note:** Core selectors navigate `state.core.present` to access current state within undo wrapper.

### 2. Selection Slice

**Goal:** Test widget selection management and auto-clear on deletion.

**Key Test Cases:**
- Select widget by ID
- Clear selection
- Toggle selection on/off
- Switch selection between widgets
- Auto-clear when selected widget removed
- Preserve selection when different widget removed

**Strategy:**
- Dispatch selection actions
- Verify `selectedId` changes correctly
- Test interaction with core slice (removeWidget)
- Validate extraReducers behavior

**Design Rationale:** Separate slice prevents re-rendering entire dashboard when selection changes.

### 3. UI Slice

**Goal:** Validate UI state management for panels and save indicators.

**Key Test Cases:**

**Inspector:**
- Toggle open/close
- Open/close explicitly
- Set active tab (properties, data)

**Palette:**
- Toggle open/close
- Open/close explicitly

**Save Status:**
- Set status (idle, saving, saved, error)
- Mark as saving/saved/error
- Reset to idle
- Update `lastSaved` timestamp

**Strategy:**
- Dispatch UI actions
- Verify state transitions
- Check timestamp accuracy
- Test all status values

**Usage:** Powers UI indicators and panel visibility.

### 4. Cross-Slice Interactions

**Goal:** Test how slices interact and maintain independence.

**Key Test Cases:**
- Selection persists through core undo/redo
- UI state persists through core undo/redo
- Selection auto-clears on widget removal
- State isolation verified

**Strategy:**
- Perform actions across multiple slices
- Verify expected coupling (selection + removeWidget)
- Verify expected isolation (UI + core undo)

**Design Pattern:** Slices are independent except for deliberate coupling via extraReducers.

### 5. Selector Memoization

**Goal:** Verify selectors don't cause unnecessary re-renders.

**Key Test Cases:**
- Same reference returned when state unchanged
- New reference returned when state changes

**Strategy:**
- Call selectors multiple times
- Compare object references with `===`
- Verify reference equality/inequality

**Performance:** Memoization prevents component re-renders when data hasn't changed.

## Slice Responsibilities

### Core Slice
**Handles:**
- Widget CRUD operations
- Layout management
- Dashboard metadata
- Import/export state transformations

**Does NOT handle:**
- LocalStorage persistence (middleware)
- Selection tracking (selection slice)
- UI state (ui slice)

### Selection Slice
**Handles:**
- Current selection tracking
- Selection clearing
- Auto-clear on widget deletion

**Does NOT handle:**
- Multi-selection (not implemented)
- Selection history (could be added)

### UI Slice
**Handles:**
- Inspector panel state
- Palette panel state
- Save status indicators
- Tab state

**Does NOT handle:**
- Widget visibility (future enhancement)
- Modal states (future enhancement)

## Test Utilities Used

- `setupStore()` - Store with all three slices
- Action creators from each slice
- Selectors from each slice
- Widget fixtures from test-utils

## Coverage Goals

- **Core selectors:** 100% - All selector functions
- **Selection actions:** 100% - All actions and extraReducers
- **Selection selectors:** 100% - All selector functions
- **UI actions:** 100% - All actions
- **UI selectors:** 100% - All selector functions
- **Cross-slice interactions:** Representative scenarios
- **Memoization:** Basic verification

## Known Limitations

- **Reselect memoization:** Not tested in detail (shallow equality check)
- **Performance:** No stress tests for selector computation
- **TypeScript inference:** Type safety verified by compilation, not tests

## Selector Patterns

### Simple Selectors
```typescript
export const selectDashboard = (state: RootState) =>
  state.core.present.dashboard;
```

### Parameterized Selectors
```typescript
export const selectWidgetById = (id: string) => (state: RootState) =>
  state.core.present.dashboard.instances[id];
```

### Derived Selectors
```typescript
export const selectIsSaving = (state: { ui: UIState }) =>
  state.ui.saveStatus === 'saving';
```

## Future Enhancements

- Add reselect library for computed selectors (derived data)
- Test selector performance with large datasets
- Add entity adapter for normalized state (Redux Toolkit)
- Test selector composition patterns
- Add multi-selection support to selection slice

## Debugging Tips

**Viewing State:**
```typescript
const state = store.getState();
console.log('Core:', state.core.present.dashboard);
console.log('Selection:', state.selection.selectedId);
console.log('UI:', state.ui);
```

**Testing Selectors:**
```typescript
const state = store.getState();
const widget = selectWidgetById('widget-1')(state);
expect(widget).toBeDefined();
```

**Common Issues:**
- **Undefined widgets:** Check if widget was added successfully
- **Stale selection:** Selection not auto-cleared (verify extraReducers)
- **Wrong state path:** Core slice wrapped in undo, use `state.core.present`
- **Selector not updating:** Check if state reference changed

## Separation of Concerns Benefits

1. **Performance:** Selection changes don't trigger dashboard re-renders
2. **Persistence:** Only core state saved to LocalStorage
3. **Undo/Redo:** Only core state in history
4. **Testability:** Each slice tested independently
5. **Maintainability:** Clear boundaries between state domains
