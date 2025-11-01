# Import/Export Testing

## Overview

This test suite validates the dashboard import/export functionality, ensuring data integrity, proper serialization/deserialization, and LocalStorage integration.

## Testing Approach

### 1. Dashboard Export Testing

**Goal:** Verify that dashboards are correctly serialized to JSON format with all required metadata.

**Key Test Cases:**
- Export structure validation (widgets, layout, meta)
- Version and timestamp inclusion
- File download functionality (mocked)
- Error handling for invalid data

**Strategy:**
- Create mock dashboards using `createMockDashboard()` from test-utils
- Dispatch `importDashboard` action to populate store
- Verify exported state matches expected structure
- Mock browser APIs (`URL.createObjectURL`, DOM element creation) for file download tests

### 2. Dashboard Import Testing

**Goal:** Ensure dashboards can be imported from JSON, replacing current state correctly.

**Key Test Cases:**
- Successful import with state update
- Widget type preservation
- Layout position and dimension preservation
- Clearing existing dashboard on new import
- Undo/redo history reset

**Strategy:**
- Start with empty store state
- Dispatch `importDashboard` with mock data
- Verify store state matches imported data exactly
- Test that subsequent imports completely replace previous state

### 3. Widget Export/Import

**Goal:** Validate individual widget export capability for reuse across dashboards.

**Key Test Cases:**
- Single widget export with layout metadata
- Widget structure validation

**Strategy:**
- Extract widget and layout data from store
- Verify exported format includes type, props, and layout dimensions

### 4. LocalStorage Integration

**Goal:** Test persistence layer integration without actual browser storage.

**Key Test Cases:**
- Save dashboard to localStorage
- Load dashboard from localStorage
- Handle missing data gracefully
- Handle corrupted data with proper errors

**Strategy:**
- Use jsdom's localStorage implementation
- Clear storage in `beforeEach` for test isolation
- Test JSON serialization/deserialization edge cases

## Test Utilities Used

- `setupStore()` - Creates Redux store with undoable reducer
- `createMockDashboard()` - Generates consistent test data
- `mockWidgetData` - Predefined widget configurations
- Vitest mocks (`vi.fn()`, `vi.spyOn()`) - Mock browser APIs

## Coverage Goals

- **Export functionality:** 100% - All export paths tested
- **Import functionality:** 100% - All import scenarios covered
- **Error handling:** 100% - Invalid data, missing data, corrupted JSON
- **LocalStorage integration:** 100% - Save, load, error scenarios

## Known Limitations

- File download is mocked (cannot test actual browser download)
- DOM APIs are mocked (jsdom provides basic implementations)
- Network operations are not tested (export/import are local-only)

## Future Enhancements

- Test import validation/schema checking when implemented
- Test migration logic for version upgrades
- Test large dashboard performance (>100 widgets)
- Add snapshot testing for exported JSON structure
