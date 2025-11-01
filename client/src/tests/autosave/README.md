# Autosave Testing

## Overview

This test suite validates the autosave middleware that automatically persists dashboard state to LocalStorage. The autosave system uses debouncing (700ms) to batch rapid changes and provides save status tracking for user feedback.

## Testing Approach

### 1. Debounced Auto-save

**Goal:** Verify that dashboard changes are saved to LocalStorage after the debounce period.

**Key Test Cases:**
- Save after adding a widget
- Debounce multiple rapid changes (batch saves)
- Save after removing a widget
- Save after updating widget props
- Save after undo/redo operations

**Strategy:**
- Use Vitest fake timers (`vi.useFakeTimers()`)
- Dispatch actions and advance timers with `vi.advanceTimersByTimeAsync()`
- Verify localStorage content before and after debounce
- Check that debouncing prevents excessive saves

**Rationale:** Debouncing reduces LocalStorage writes, improves performance, and prevents UI lag during rapid operations.

### 2. Debounce Behavior

**Goal:** Ensure debouncing correctly batches operations and cancels pending saves.

**Key Test Cases:**
- No save before debounce completes
- Multiple rapid changes result in single save
- New action cancels previous pending save
- Final saved state includes all changes

**Strategy:**
- Dispatch multiple actions with small time intervals
- Advance timers incrementally to test intermediate states
- Spy on `localStorage.setItem` to count save operations
- Verify final saved state matches current store state

**Configuration:** `DEBOUNCE_MS = 700` milliseconds

### 3. Save Status Tracking

**Goal:** Validate UI status indicators for save state.

**Key Test Cases:**
- Status set to "saving" immediately after action
- Status set to "saved" after debounce completes
- `lastSaved` timestamp updated correctly
- Status set to "error" when save fails

**Strategy:**
- Check `state.ui.saveStatus` after each step
- Verify status transitions: idle → saving → saved/error
- Mock localStorage failures to test error handling
- Validate timestamp accuracy

**Usage:** Powers the save indicator in the UI (e.g., "Saving...", "Saved 2 seconds ago")

### 4. Loading Dashboard

**Goal:** Test dashboard restoration from LocalStorage on app initialization.

**Key Test Cases:**
- Load valid dashboard successfully
- Return null when localStorage is empty
- Handle corrupted JSON gracefully
- Handle localStorage errors gracefully

**Strategy:**
- Pre-populate localStorage with mock data
- Call `loadDashboard()` utility function
- Verify correct data parsing
- Mock errors and validate error handling

**Error Handling:** Silent failures with console warnings, never crashes

### 5. Clearing Dashboard

**Goal:** Test localStorage cleanup functionality.

**Key Test Cases:**
- Remove dashboard from localStorage
- Handle clear errors gracefully

**Strategy:**
- Pre-populate localStorage
- Call `clearDashboard()` utility function
- Verify localStorage is empty
- Mock removeItem errors

**Usage:** Called when user explicitly clears dashboard or during logout/cleanup

### 6. Import Integration

**Goal:** Verify imported dashboards are auto-saved.

**Key Test Cases:**
- Save imported dashboard after debounce
- Replace existing saved dashboard on import

**Strategy:**
- Dispatch `importDashboard` action with mock data
- Advance timers past debounce
- Verify localStorage contains imported data
- Test overwrite behavior

**Note:** Import is excluded from undo history but still triggers autosave

### 7. Performance and Edge Cases

**Goal:** Test system behavior under stress and error conditions.

**Key Test Cases:**
- Many rapid actions (50+) result in single save
- Large dashboard (100+ widgets) saves successfully
- LocalStorage quota exceeded handled gracefully
- Storage unavailable errors handled gracefully

**Strategy:**
- Dispatch many actions rapidly, verify single save
- Create large dashboards and verify JSON size
- Mock quota/availability errors
- Ensure app continues functioning despite save failures

**Performance Goal:** Debouncing should reduce saves to ~1 per action sequence

## Middleware Configuration

```typescript
autosaveMiddleware.startListening({
  predicate: (action) => {
    const isCoreAction = isAnyOf(
      addWidget,
      updateWidgetProps,
      moveResizeWidget,
      removeWidget,
      setLayout,
      importDashboard,
      updateDashboardMeta,
      duplicateWidget,
      toggleWidgetLock,
      resetDashboard
    )(action);

    const isUndoRedo = action.type === 'UNDO' || action.type === 'REDO';

    return isCoreAction || isUndoRedo;
  },
  effect: async (_, listenerApi) => {
    listenerApi.cancelActiveListeners();  // Cancel pending saves
    listenerApi.dispatch(markSaving());

    await listenerApi.delay(DEBOUNCE_MS);  // Debounce

    const dashboard = listenerApi.getState().core.present.dashboard;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboard));
    listenerApi.dispatch(markSaved());
  },
});
```

**Key Points:**
- **Listener Middleware:** Redux Toolkit's async middleware for side effects
- **cancelActiveListeners:** Cancels previous pending save when new action arrives
- **markSaving/markSaved:** Updates UI status indicators
- **STORAGE_KEY:** `"retool-dashboard"`
- **DEBOUNCE_MS:** `700` milliseconds

## Test Utilities Used

- `setupStore()` - Store with autosave middleware
- `vi.useFakeTimers()` - Control time in tests
- `vi.advanceTimersByTimeAsync()` - Fast-forward timers
- `vi.spyOn(Storage.prototype, 'setItem')` - Monitor save calls
- `localStorage` mock from jsdom

## Coverage Goals

- **Auto-save operations:** 100% - All action types trigger save
- **Debounce behavior:** 100% - Batching and cancellation
- **Save status tracking:** 100% - All status transitions
- **Loading:** 100% - Success and error cases
- **Clearing:** 100% - Success and error cases
- **Import integration:** 100% - Import triggers save
- **Performance:** Representative stress tests
- **Error handling:** 100% - All error scenarios

## Known Limitations

- **Timer precision:** Fake timers may not perfectly simulate browser behavior
- **Storage size limits:** Test uses small datasets (real limits ~5-10MB vary by browser)
- **Concurrent tabs:** Not tested (requires multi-process testing)
- **IndexedDB fallback:** Not implemented (LocalStorage only)

## Future Enhancements

- Add IndexedDB fallback for large dashboards
- Test cross-tab synchronization with BroadcastChannel
- Add compression for large dashboard payloads
- Test offline detection and queued saves
- Add periodic auto-save (in addition to change-based)

## Debugging Tips

**Common Issues:**
- **Timers not advancing:** Ensure `vi.useFakeTimers()` in beforeEach
- **Saves not happening:** Check debounce duration with `vi.advanceTimersByTimeAsync(DEBOUNCE_MS)`
- **State not persisting:** Verify action is in middleware predicate list
- **Flaky tests:** Use `advanceTimersByTimeAsync` (async) not `advanceTimersByTime` (sync)

**Monitoring Saves:**
```typescript
const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
// ... run tests ...
console.log('Save count:', setItemSpy.mock.calls.length);
```

**Inspecting Saved Data:**
```typescript
const saved = localStorage.getItem('retool-dashboard');
const parsed = JSON.parse(saved!);
console.log('Saved widgets:', Object.keys(parsed.instances));
```
