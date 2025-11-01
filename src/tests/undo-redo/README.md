# Undo/Redo Testing

## Overview

This test suite validates the undo/redo functionality powered by redux-undo. The dashboard builder maintains a history of up to 100 actions, allowing users to undo and redo operations seamlessly.

## Testing Approach

### 1. Basic Undo/Redo Operations

**Goal:** Verify that fundamental undo/redo operations work correctly for all action types.

**Key Test Cases:**
- Undo adding a widget
- Redo adding a widget
- Undo removing a widget
- Undo updating widget properties
- Undo moving/resizing widgets

**Strategy:**
- Dispatch action and verify state change
- Dispatch `{ type: 'UNDO' }` and verify state reverts
- Dispatch `{ type: 'REDO' }` and verify state returns to post-action state
- Compare widget data and layout before/after undo/redo

### 2. Multiple Sequential Operations

**Goal:** Test undo/redo with multiple actions in history.

**Key Test Cases:**
- Multiple sequential undos (going back through history)
- Multiple sequential redos (replaying history)
- Redo history cleared after new action post-undo

**Strategy:**
- Dispatch multiple different actions
- Undo multiple times and verify each state
- Redo multiple times and verify state restoration
- Test that new actions clear the future stack

### 3. History Limits

**Goal:** Validate the 100-step history limit configuration.

**Key Test Cases:**
- History limited to 100 past states
- Most recent actions maintained in history
- Oldest actions dropped when limit exceeded

**Strategy:**
- Dispatch >100 actions (105 widgets)
- Verify `state.core.past.length ≤ 100`
- Verify most recent action can be undone
- Check present state contains all widgets despite limited history

### 4. Excluded Actions

**Goal:** Ensure certain actions don't create undo history entries.

**Key Test Cases:**
- `importDashboard` excluded from history
- `resetDashboard` excluded from history

**Strategy:**
- Dispatch excluded actions
- Verify `state.core.past.length` doesn't increase
- Verify undo doesn't reverse excluded actions
- Test behavior when excluded actions follow regular actions

**Rationale:** Import and reset are "replace-all" operations that should clear history, not add to it.

### 5. Undo/Redo State Tracking

**Goal:** Test the availability indicators for undo/redo buttons.

**Key Test Cases:**
- `canUndo` when past.length > 0
- `canRedo` when future.length > 0
- Empty history states

**Strategy:**
- Check `state.core.past.length` and `state.core.future.length`
- Verify correct values after actions, undos, and redos
- Test edge cases (empty history, cleared future)

**Usage:** These selectors power the enabled/disabled state of undo/redo buttons in the UI.

### 6. Complex Scenarios

**Goal:** Test real-world sequences of mixed operations.

**Key Test Cases:**
- Mixed operation types (add, update, move, remove)
- Undo/redo after duplication
- Data integrity through undo/redo cycles
- Partial undo with selective redo

**Strategy:**
- Execute complex sequences (add → update → add → move)
- Undo selectively through the sequence
- Verify correct state at each undo step
- Test redo restores exact previous state

### 7. Edge Cases

**Goal:** Handle boundary conditions and error scenarios.

**Key Test Cases:**
- Undo when history is empty
- Redo when future is empty
- Rapid undo/redo cycles
- State consistency after many operations

**Strategy:**
- Test operations that should be no-ops
- Verify state doesn't corrupt with invalid operations
- Stress test with rapid undo/redo toggling

## Redux-Undo Configuration

The store is configured with:

```typescript
undoable(coreReducer, {
  limit: 100,
  filter: excludeAction(['core/importDashboard', 'core/resetDashboard']),
  groupBy: (action) => {
    if (action.type === 'core/moveResizeWidget') {
      return 'MOVE_RESIZE';
    }
    return null;
  },
  undoType: 'UNDO',
  redoType: 'REDO',
})
```

**Key Points:**
- **limit:** 100 - Maximum past states stored
- **filter:** Excludes import/reset from history
- **groupBy:** Groups rapid move/resize operations (future enhancement)
- **undoType/redoType:** Custom action types for undo/redo

## Test Utilities Used

- `setupStore()` - Creates store with undoable reducer
- Widget action creators (addWidget, updateWidgetProps, etc.)
- Undo/redo actions: `{ type: 'UNDO' }`, `{ type: 'REDO' }`
- State selectors: `state.core.past`, `state.core.present`, `state.core.future`

## Coverage Goals

- **Basic operations:** 100% - All action types tested
- **Multi-step history:** 100% - Sequential undo/redo
- **History limits:** 100% - Limit enforcement
- **Excluded actions:** 100% - Import/reset exclusion
- **State tracking:** 100% - canUndo/canRedo
- **Complex scenarios:** Representative workflows
- **Edge cases:** Boundary conditions

## Known Limitations

- **Move/resize grouping:** Configured but not yet fully tested (requires UI-level interaction testing)
- **Concurrent operations:** Not applicable (single-threaded Redux)
- **Memory limits:** 100 steps may not be sufficient for very large dashboards (configurable)

## Future Enhancements

- Test move/resize action grouping (debounced operations create single undo entry)
- Add performance tests for large history stacks
- Test history persistence (save/load undo stack)
- Add selective undo/redo (undo specific actions, not just latest)

## Debugging Tips

**State Structure:**
```typescript
state.core = {
  past: Array<CoreState>,      // History of previous states
  present: CoreState,            // Current state
  future: Array<CoreState>,      // Redo stack
}
```

**Common Issues:**
- **Undo doesn't work:** Check if action is in `excludeAction` list
- **History grows infinitely:** Verify `limit` configuration
- **State corruption:** Ensure reducers are pure (no mutations)
- **Timestamps change on undo:** Expected (timestamps regenerated on state updates)
