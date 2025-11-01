import { describe, it, expect, beforeEach } from 'vitest';
import { setupStore } from '../test-utils';
import {
  addWidget,
  removeWidget,
  selectDashboard,
  selectAllWidgets,
  selectWidgetById,
  selectLayout,
  selectLayoutItemById,
} from '@/store/slices/coreSlice';
import {
  selectWidget,
  clearSelection,
  toggleSelection,
  selectSelectedId,
  selectIsSelected,
} from '@/store/slices/selectionSlice';
import {
  toggleInspector,
  openInspector,
  closeInspector,
  setInspectorTab,
  togglePalette,
  openPalette,
  closePalette,
  setSaveStatus,
  markSaving,
  markSaved,
  markError,
  resetSaveStatus,
  selectInspectorOpen,
  selectInspectorTab,
  selectPaletteOpen,
  selectSaveStatus,
  selectLastSaved,
  selectIsSaving,
  selectIsSaved,
} from '@/store/slices/uiSlice';

describe('Redux Slices and Selectors', () => {
  let store: ReturnType<typeof setupStore>;

  beforeEach(() => {
    store = setupStore();
  });

  describe('Core Slice Selectors', () => {
    it('should select dashboard', () => {
      const state = store.getState();
      const dashboard = selectDashboard(state);

      expect(dashboard).toBeDefined();
      expect(dashboard.instances).toBeDefined();
      expect(dashboard.layout).toBeDefined();
      expect(dashboard.meta).toBeDefined();
    });

    it('should select all widgets', () => {
      const action1 = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      const action2 = addWidget({
        type: 'table',
        layout: { x: 6, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action1);
      store.dispatch(action2);

      const state = store.getState();
      const widgets = selectAllWidgets(state);

      expect(Object.keys(widgets)).toHaveLength(2);
      expect(widgets[action1.meta.id]).toBeDefined();
      expect(widgets[action2.meta.id]).toBeDefined();
    });

    it('should select widget by id', () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
        props: { title: 'Test Chart' },
      });

      store.dispatch(action);

      const state = store.getState();
      const widget = selectWidgetById(action.meta.id)(state);

      expect(widget).toBeDefined();
      expect(widget?.type).toBe('chart');
      expect(widget?.props.title).toBe('Test Chart');
    });

    it('should return undefined for non-existent widget id', () => {
      const state = store.getState();
      const widget = selectWidgetById('non-existent-id')(state);

      expect(widget).toBeUndefined();
    });

    it('should select layout', () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);

      const state = store.getState();
      const layout = selectLayout(state);

      expect(layout).toHaveLength(1);
      expect(layout[0].id).toBe(action.meta.id);
    });

    it('should select layout item by id', () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 3, y: 5, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);

      const state = store.getState();
      const layoutItem = selectLayoutItemById(action.meta.id)(state);

      expect(layoutItem).toBeDefined();
      expect(layoutItem?.x).toBe(3);
      expect(layoutItem?.y).toBe(5);
      expect(layoutItem?.w).toBe(6);
      expect(layoutItem?.h).toBe(4);
    });

    it('should return undefined for non-existent layout item', () => {
      const state = store.getState();
      const layoutItem = selectLayoutItemById('non-existent-id')(state);

      expect(layoutItem).toBeUndefined();
    });
  });

  describe('Selection Slice', () => {
    describe('Actions', () => {
      it('should select a widget', () => {
        store.dispatch(selectWidget('widget-1'));

        const state = store.getState();
        expect(selectSelectedId(state)).toBe('widget-1');
      });

      it('should clear selection', () => {
        store.dispatch(selectWidget('widget-1'));
        store.dispatch(clearSelection());

        const state = store.getState();
        expect(selectSelectedId(state)).toBeNull();
      });

      it('should toggle selection on', () => {
        store.dispatch(toggleSelection('widget-1'));

        const state = store.getState();
        expect(selectSelectedId(state)).toBe('widget-1');
      });

      it('should toggle selection off', () => {
        store.dispatch(selectWidget('widget-1'));
        store.dispatch(toggleSelection('widget-1'));

        const state = store.getState();
        expect(selectSelectedId(state)).toBeNull();
      });

      it('should switch selection with toggle', () => {
        store.dispatch(selectWidget('widget-1'));
        store.dispatch(toggleSelection('widget-2'));

        const state = store.getState();
        expect(selectSelectedId(state)).toBe('widget-2');
      });

      it('should auto-clear selection when widget is removed', () => {
        const action = addWidget({
          type: 'chart',
          layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
        });

        store.dispatch(action);
        store.dispatch(selectWidget(action.meta.id));

        let state = store.getState();
        expect(selectSelectedId(state)).toBe(action.meta.id);

        store.dispatch(removeWidget(action.meta.id));

        state = store.getState();
        expect(selectSelectedId(state)).toBeNull();
      });

      it('should not clear selection when different widget is removed', () => {
        const action1 = addWidget({
          type: 'chart',
          layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
        });

        const action2 = addWidget({
          type: 'table',
          layout: { x: 6, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
        });

        store.dispatch(action1);
        store.dispatch(action2);
        store.dispatch(selectWidget(action1.meta.id));

        store.dispatch(removeWidget(action2.meta.id));

        const state = store.getState();
        expect(selectSelectedId(state)).toBe(action1.meta.id);
      });
    });

    describe('Selectors', () => {
      it('should select selected id', () => {
        store.dispatch(selectWidget('widget-123'));

        const state = store.getState();
        expect(selectSelectedId(state)).toBe('widget-123');
      });

      it('should check if widget is selected', () => {
        store.dispatch(selectWidget('widget-1'));

        const state = store.getState();
        expect(selectIsSelected('widget-1')(state)).toBe(true);
        expect(selectIsSelected('widget-2')(state)).toBe(false);
      });

      it('should return null when nothing selected', () => {
        const state = store.getState();
        expect(selectSelectedId(state)).toBeNull();
      });
    });
  });

  describe('UI Slice', () => {
    describe('Inspector Actions', () => {
      it('should toggle inspector open', () => {
        let state = store.getState();
        expect(selectInspectorOpen(state)).toBe(false);

        store.dispatch(toggleInspector());
        state = store.getState();
        expect(selectInspectorOpen(state)).toBe(true);

        store.dispatch(toggleInspector());
        state = store.getState();
        expect(selectInspectorOpen(state)).toBe(false);
      });

      it('should open inspector', () => {
        store.dispatch(openInspector());

        const state = store.getState();
        expect(selectInspectorOpen(state)).toBe(true);
      });

      it('should close inspector', () => {
        store.dispatch(openInspector());
        store.dispatch(closeInspector());

        const state = store.getState();
        expect(selectInspectorOpen(state)).toBe(false);
      });

      it('should set inspector tab', () => {
        store.dispatch(setInspectorTab('data'));

        let state = store.getState();
        expect(selectInspectorTab(state)).toBe('data');

        store.dispatch(setInspectorTab('properties'));

        state = store.getState();
        expect(selectInspectorTab(state)).toBe('properties');
      });
    });

    describe('Palette Actions', () => {
      it('should toggle palette open', () => {
        let state = store.getState();
        const initialOpen = selectPaletteOpen(state);

        store.dispatch(togglePalette());
        state = store.getState();
        expect(selectPaletteOpen(state)).toBe(!initialOpen);

        store.dispatch(togglePalette());
        state = store.getState();
        expect(selectPaletteOpen(state)).toBe(initialOpen);
      });

      it('should open palette', () => {
        store.dispatch(openPalette());

        const state = store.getState();
        expect(selectPaletteOpen(state)).toBe(true);
      });

      it('should close palette', () => {
        store.dispatch(closePalette());

        const state = store.getState();
        expect(selectPaletteOpen(state)).toBe(false);
      });
    });

    describe('Save Status Actions', () => {
      it('should set save status', () => {
        store.dispatch(setSaveStatus('saving'));
        let state = store.getState();
        expect(selectSaveStatus(state)).toBe('saving');

        store.dispatch(setSaveStatus('saved'));
        state = store.getState();
        expect(selectSaveStatus(state)).toBe('saved');

        store.dispatch(setSaveStatus('error'));
        state = store.getState();
        expect(selectSaveStatus(state)).toBe('error');
      });

      it('should update lastSaved timestamp when status is saved', () => {
        const beforeTime = Date.now();

        store.dispatch(setSaveStatus('saved'));

        const afterTime = Date.now();

        const state = store.getState();
        const lastSaved = selectLastSaved(state);

        expect(lastSaved).not.toBeNull();
        expect(lastSaved!).toBeGreaterThanOrEqual(beforeTime);
        expect(lastSaved!).toBeLessThanOrEqual(afterTime);
      });

      it('should not update lastSaved for other statuses', () => {
        store.dispatch(setSaveStatus('saving'));
        let state = store.getState();
        expect(selectLastSaved(state)).toBeNull();

        store.dispatch(setSaveStatus('error'));
        state = store.getState();
        expect(selectLastSaved(state)).toBeNull();
      });

      it('should mark as saving', () => {
        store.dispatch(markSaving());

        const state = store.getState();
        expect(selectSaveStatus(state)).toBe('saving');
        expect(selectIsSaving(state)).toBe(true);
      });

      it('should mark as saved with timestamp', () => {
        const beforeTime = Date.now();

        store.dispatch(markSaved());

        const afterTime = Date.now();

        const state = store.getState();
        expect(selectSaveStatus(state)).toBe('saved');
        expect(selectIsSaved(state)).toBe(true);

        const lastSaved = selectLastSaved(state);
        expect(lastSaved).not.toBeNull();
        expect(lastSaved!).toBeGreaterThanOrEqual(beforeTime);
        expect(lastSaved!).toBeLessThanOrEqual(afterTime);
      });

      it('should mark as error', () => {
        store.dispatch(markError());

        const state = store.getState();
        expect(selectSaveStatus(state)).toBe('error');
      });

      it('should reset save status to idle', () => {
        store.dispatch(markSaved());
        store.dispatch(resetSaveStatus());

        const state = store.getState();
        expect(selectSaveStatus(state)).toBe('idle');
      });
    });

    describe('Selectors', () => {
      it('should select inspector open state', () => {
        store.dispatch(openInspector());

        const state = store.getState();
        expect(selectInspectorOpen(state)).toBe(true);
      });

      it('should select inspector tab', () => {
        const state = store.getState();
        expect(selectInspectorTab(state)).toBe('properties');
      });

      it('should select palette open state', () => {
        const state = store.getState();
        expect(selectPaletteOpen(state)).toBe(true);
      });

      it('should select save status', () => {
        store.dispatch(markSaving());

        const state = store.getState();
        expect(selectSaveStatus(state)).toBe('saving');
      });

      it('should select last saved timestamp', () => {
        store.dispatch(markSaved());

        const state = store.getState();
        const lastSaved = selectLastSaved(state);
        expect(lastSaved).toBeGreaterThan(0);
      });

      it('should select is saving', () => {
        store.dispatch(markSaving());

        let state = store.getState();
        expect(selectIsSaving(state)).toBe(true);

        store.dispatch(markSaved());

        state = store.getState();
        expect(selectIsSaving(state)).toBe(false);
      });

      it('should select is saved', () => {
        store.dispatch(markSaved());

        let state = store.getState();
        expect(selectIsSaved(state)).toBe(true);

        store.dispatch(markSaving());

        state = store.getState();
        expect(selectIsSaved(state)).toBe(false);
      });
    });
  });

  describe('Cross-Slice Interactions', () => {
    it('should maintain selection state independently of core state', () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);
      store.dispatch(selectWidget(action.meta.id));

      let state = store.getState();
      expect(selectSelectedId(state)).toBe(action.meta.id);
      expect(selectAllWidgets(state)[action.meta.id]).toBeDefined();

      store.dispatch({ type: 'UNDO' });

      state = store.getState();
      // After undo, widget is restored to state before addWidget
      // Since we started with empty state, widget no longer exists after undo
      expect(selectAllWidgets(state)[action.meta.id]).toBeUndefined();
      // Selection state is independent, so selection remains
      expect(selectSelectedId(state)).toBe(action.meta.id);
    });

    it('should maintain UI state independently of core state', () => {
      store.dispatch(openInspector());
      store.dispatch(setInspectorTab('data'));

      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);
      store.dispatch({ type: 'UNDO' });

      const state = store.getState();
      // UI state unaffected by undo
      expect(selectInspectorOpen(state)).toBe(true);
      expect(selectInspectorTab(state)).toBe('data');
    });

    it('should coordinate selection and core slice on widget removal', () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);
      store.dispatch(selectWidget(action.meta.id));

      let state = store.getState();
      expect(selectSelectedId(state)).toBe(action.meta.id);

      store.dispatch(removeWidget(action.meta.id));

      state = store.getState();
      // Selection cleared via extraReducers
      expect(selectSelectedId(state)).toBeNull();
      expect(selectAllWidgets(state)[action.meta.id]).toBeUndefined();
    });
  });

  describe('Selector Memoization', () => {
    it('should return same reference when state unchanged', () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);

      const state1 = store.getState();
      const widgets1 = selectAllWidgets(state1);
      const layout1 = selectLayout(state1);

      const state2 = store.getState();
      const widgets2 = selectAllWidgets(state2);
      const layout2 = selectLayout(state2);

      // Same references (no re-computation)
      expect(widgets1).toBe(widgets2);
      expect(layout1).toBe(layout2);
    });

    it('should return new reference when state changes', () => {
      const action1 = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action1);

      const state1 = store.getState();
      const widgets1 = selectAllWidgets(state1);

      const action2 = addWidget({
        type: 'table',
        layout: { x: 6, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action2);

      const state2 = store.getState();
      const widgets2 = selectAllWidgets(state2);

      // Different references (state changed)
      expect(widgets1).not.toBe(widgets2);
    });
  });
});
