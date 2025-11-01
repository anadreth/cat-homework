# Widget Management Testing

## Overview

This test suite validates the core widget lifecycle operations: adding, removing, updating, moving/resizing, duplicating, and locking widgets. These operations form the foundation of the dashboard builder's functionality.

## Testing Approach

### 1. Adding Widgets

**Goal:** Verify that widgets are correctly created and added to both the instances map and layout array.

**Key Test Cases:**
- Basic widget addition with props
- Unique ID generation for each widget
- Default empty props when not provided
- Correct layout positioning and dimensions
- Timestamp creation (createdAt, updatedAt)
- Dashboard metadata updates

**Strategy:**
- Use the `addWidget` action with prepare callback that generates UUIDs
- Verify widget appears in both `dashboard.instances` and `dashboard.layout`
- Check that generated ID from action.meta matches the stored widget
- Validate all widget properties and layout dimensions

### 2. Removing Widgets

**Goal:** Ensure widgets are completely removed from the dashboard state.

**Key Test Cases:**
- Single widget removal
- Selective removal (remove one, keep others)
- Graceful handling of non-existent widget IDs
- Dashboard timestamp updates

**Strategy:**
- Add widgets, then dispatch `removeWidget` action
- Verify widget is removed from both instances and layout
- Ensure other widgets remain unaffected
- Test edge case of removing non-existent IDs

### 3. Updating Widget Properties

**Goal:** Validate property updates merge correctly with existing props.

**Key Test Cases:**
- Update existing properties
- Add new properties while preserving old ones
- Widget timestamp updates
- Graceful handling of non-existent widget updates

**Strategy:**
- Create widget with initial props
- Dispatch `updateWidgetProps` with partial updates
- Verify merge behavior (new props added, old props preserved)
- Check widget.updatedAt changes while createdAt remains constant

### 4. Moving and Resizing Widgets

**Goal:** Test layout updates without affecting widget instance data.

**Key Test Cases:**
- Position updates (x, y)
- Size updates (w, h)
- Preservation of other layout properties (minW, minH)
- Widget instance data remains unchanged
- Graceful handling of non-existent widgets

**Strategy:**
- Add widget with specific layout
- Dispatch `moveResizeWidget` action
- Verify only x, y, w, h change in layout
- Ensure widget instance (type, props) unaffected

### 5. Duplicating Widgets

**Goal:** Create exact copies of widgets with new IDs and offset positions.

**Key Test Cases:**
- Deep copy of widget type and props
- New unique ID generation
- Position offset (x+1, y+1)
- New timestamps (createdAt, updatedAt)
- Graceful handling of non-existent source widget

**Strategy:**
- Add source widget with specific props
- Dispatch `duplicateWidget` action
- Verify duplicate has same type/props but different ID
- Check position is offset from original
- Ensure new timestamps are generated

### 6. Locking/Unlocking Widgets

**Goal:** Toggle widget lock state to prevent/allow drag/resize operations.

**Key Test Cases:**
- Lock widget (locked: true)
- Unlock widget (locked: false)
- Toggle behavior (multiple calls)
- Graceful handling of non-existent widgets

**Strategy:**
- Add widget (default unlocked)
- Dispatch `toggleWidgetLock` action
- Verify locked state toggles correctly
- Test multiple toggles return to original state

### 7. Clearing Dashboard

**Goal:** Reset dashboard to empty state with new metadata.

**Key Test Cases:**
- Remove all widgets and layout items
- Generate new dashboard ID
- Reset dashboard name to "Untitled Dashboard"
- Create new timestamps

**Strategy:**
- Add multiple widgets
- Dispatch `resetDashboard` action
- Verify instances and layout are empty
- Check new dashboard metadata is generated

### 8. Complex Multi-Operation Scenarios

**Goal:** Test real-world sequences of multiple operations.

**Key Test Cases:**
- Sequential widget additions
- Mixed operation sequences (add, update, move, duplicate, remove)
- State consistency across operations

**Strategy:**
- Execute complex operation sequences
- Verify final state matches expected result
- Ensure operation order doesn't cause inconsistencies

## Test Utilities Used

- `setupStore()` - Fresh Redux store for each test
- `addWidget()` - Creates widget with UUID and timestamps
- Widget action creators from coreSlice
- Store state selectors to verify updates

## Coverage Goals

- **Adding widgets:** 100% - All widget creation paths
- **Removing widgets:** 100% - Deletion and edge cases
- **Updating props:** 100% - Merge behavior and updates
- **Moving/resizing:** 100% - Layout manipulation
- **Duplicating:** 100% - Copy operations
- **Locking:** 100% - Toggle state
- **Clearing:** 100% - Reset functionality
- **Multi-operations:** Representative scenarios

## Edge Cases Covered

- Non-existent widget IDs (remove, update, move, duplicate, lock)
- Empty props object
- Timestamp validation
- ID uniqueness
- State isolation between operations

## Known Limitations

- Gridstack integration not tested (UI-level testing)
- Visual rendering not tested (component-level concern)
- Undo/redo tested separately (see undo-redo tests)
- Autosave middleware tested separately (see autosave tests)

## Future Enhancements

- Add performance tests for large widget counts (>100 widgets)
- Test widget validation/schema checking when implemented
- Add stress tests for rapid operation sequences
- Test concurrent operation handling if multi-user support added
