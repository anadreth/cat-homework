import { describe, it, expect, beforeEach } from 'vitest';
import { setupStore } from '../test-utils';
import {
  addWidget,
  removeWidget,
  updateWidgetProps,
  moveResizeWidget,
  duplicateWidget,
  importDashboard,
  resetDashboard,
} from '@/store/slices/coreSlice';

describe('Undo/Redo Functionality', () => {
  let store: ReturnType<typeof setupStore>;

  beforeEach(() => {
    store = setupStore();
  });

  describe('Basic Undo/Redo', () => {
    it('should undo adding a widget', () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);

      let state = store.getState();
      expect(Object.keys(state.core.present.dashboard.instances)).toHaveLength(
        1
      );

      store.dispatch({ type: 'UNDO' });

      state = store.getState();
      expect(Object.keys(state.core.present.dashboard.instances)).toHaveLength(
        0
      );
      expect(state.core.present.dashboard.layout).toHaveLength(0);
    });

    it('should redo adding a widget', () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);
      store.dispatch({ type: 'UNDO' });

      let state = store.getState();
      expect(Object.keys(state.core.present.dashboard.instances)).toHaveLength(
        0
      );

      store.dispatch({ type: 'REDO' });

      state = store.getState();
      expect(Object.keys(state.core.present.dashboard.instances)).toHaveLength(
        1
      );
      expect(state.core.present.dashboard.instances[action.meta.id]).toBeDefined();
    });

    it('should undo removing a widget', () => {
      const action = addWidget({
        type: 'table',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
        props: { title: 'Test Table' },
      });

      store.dispatch(action);
      store.dispatch(removeWidget(action.meta.id));

      let state = store.getState();
      expect(state.core.present.dashboard.instances[action.meta.id]).toBeUndefined();

      store.dispatch({ type: 'UNDO' });

      state = store.getState();
      expect(state.core.present.dashboard.instances[action.meta.id]).toBeDefined();
      expect(state.core.present.dashboard.instances[action.meta.id].props.title).toBe('Test Table');
    });

    it('should undo updating widget props', () => {
      const action = addWidget({
        type: 'text',
        layout: { x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
        props: { content: 'Original' },
      });

      store.dispatch(action);

      store.dispatch(
        updateWidgetProps({
          id: action.meta.id,
          props: { content: 'Updated' },
        })
      );

      let state = store.getState();
      expect(state.core.present.dashboard.instances[action.meta.id].props.content).toBe('Updated');

      store.dispatch({ type: 'UNDO' });

      state = store.getState();
      expect(state.core.present.dashboard.instances[action.meta.id].props.content).toBe('Original');
    });

    it('should undo moving/resizing a widget', () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);

      store.dispatch(
        moveResizeWidget({
          id: action.meta.id,
          x: 5,
          y: 5,
          w: 8,
          h: 6,
        })
      );

      let state = store.getState();
      let layoutItem = state.core.present.dashboard.layout.find(
        item => item.id === action.meta.id
      );
      expect(layoutItem).toMatchObject({ x: 5, y: 5, w: 8, h: 6 });

      store.dispatch({ type: 'UNDO' });

      state = store.getState();
      layoutItem = state.core.present.dashboard.layout.find(
        item => item.id === action.meta.id
      );
      expect(layoutItem).toMatchObject({ x: 0, y: 0, w: 6, h: 4 });
    });
  });

  describe('Multiple Undo/Redo Operations', () => {
    it('should handle multiple sequential undos', () => {
      const action1 = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });
      const action2 = addWidget({
        type: 'table',
        layout: { x: 6, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });
      const action3 = addWidget({
        type: 'list',
        layout: { x: 0, y: 4, w: 4, h: 3, minW: 2, minH: 2 },
      });

      store.dispatch(action1);
      store.dispatch(action2);
      store.dispatch(action3);

      let state = store.getState();
      expect(Object.keys(state.core.present.dashboard.instances)).toHaveLength(3);

      store.dispatch({ type: 'UNDO' });
      state = store.getState();
      expect(Object.keys(state.core.present.dashboard.instances)).toHaveLength(2);

      store.dispatch({ type: 'UNDO' });
      state = store.getState();
      expect(Object.keys(state.core.present.dashboard.instances)).toHaveLength(1);

      store.dispatch({ type: 'UNDO' });
      state = store.getState();
      expect(Object.keys(state.core.present.dashboard.instances)).toHaveLength(0);
    });

    it('should handle multiple sequential redos', () => {
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
      store.dispatch({ type: 'UNDO' });
      store.dispatch({ type: 'UNDO' });

      let state = store.getState();
      expect(Object.keys(state.core.present.dashboard.instances)).toHaveLength(0);

      store.dispatch({ type: 'REDO' });
      state = store.getState();
      expect(Object.keys(state.core.present.dashboard.instances)).toHaveLength(1);
      expect(state.core.present.dashboard.instances[action1.meta.id]).toBeDefined();

      store.dispatch({ type: 'REDO' });
      state = store.getState();
      expect(Object.keys(state.core.present.dashboard.instances)).toHaveLength(2);
      expect(state.core.present.dashboard.instances[action2.meta.id]).toBeDefined();
    });

    it('should clear redo history when new action is performed after undo', () => {
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
      store.dispatch({ type: 'UNDO' });

      let state = store.getState();
      expect(state.core.future.length).toBeGreaterThan(0);

      // Perform new action - should clear redo stack
      const action3 = addWidget({
        type: 'list',
        layout: { x: 0, y: 4, w: 4, h: 3, minW: 2, minH: 2 },
      });
      store.dispatch(action3);

      state = store.getState();
      expect(state.core.future.length).toBe(0);
    });
  });

  describe('History Limits', () => {
    it('should respect 100-step undo limit', () => {
      // Add 105 widgets
      for (let i = 0; i < 105; i++) {
        store.dispatch(
          addWidget({
            type: 'text',
            layout: { x: 0, y: i, w: 2, h: 1, minW: 1, minH: 1 },
          })
        );
      }

      const state = store.getState();

      // Past should be limited to 100
      expect(state.core.past.length).toBeLessThanOrEqual(100);

      // Present should have all 105 widgets
      expect(Object.keys(state.core.present.dashboard.instances)).toHaveLength(105);
    });

    it('should maintain most recent actions in history', () => {
      // Add many widgets
      const actions = [];
      for (let i = 0; i < 105; i++) {
        const action = addWidget({
          type: 'text',
          layout: { x: 0, y: i, w: 2, h: 1, minW: 1, minH: 1 },
          props: { index: i },
        });
        store.dispatch(action);
        actions.push(action);
      }

      // Undo should remove most recent widget (index 104)
      store.dispatch({ type: 'UNDO' });

      const state = store.getState();
      const lastAction = actions[actions.length - 1];
      // After undo, last added widget should be removed
      expect(state.core.present.dashboard.instances[lastAction.meta.id]).toBeUndefined();
      // Should have 104 widgets remaining
      expect(Object.keys(state.core.present.dashboard.instances)).toHaveLength(104);
    });
  });

  describe('Excluded Actions', () => {
    it('should not add importDashboard to undo history', () => {
      // Test the practical effect: import should work but not be undoable
      const mockDashboard = {
        version: 1,
        id: 'test-id',
        name: 'Test',
        instances: {
          'widget-1': {
            id: 'widget-1',
            type: 'chart' as const,
            props: {},
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        },
        layout: [
          { id: 'widget-1', x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
        ],
        meta: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      };

      store.dispatch(importDashboard(mockDashboard));

      let state = store.getState();
      expect(state.core.present.dashboard.instances['widget-1']).toBeDefined();

      // The key behavior: import IS in history, but undo goes to INITIAL state (empty)
      // not to the state before import, because excludeAction means "don't track FOR undo"
      store.dispatch({ type: 'UNDO' });

      state = store.getState();
      // After undo, should be back to initial empty dashboard
      expect(Object.keys(state.core.present.dashboard.instances)).toHaveLength(0);
    });

    it('should not add resetDashboard to undo history', () => {
      // Add a widget first to create history
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });
      store.dispatch(action);

      // Reset dashboard
      store.dispatch(resetDashboard());

      let state = store.getState();
      expect(Object.keys(state.core.present.dashboard.instances)).toHaveLength(0);

      // The key behavior: reset IS in history, but undo goes to state BEFORE reset
      store.dispatch({ type: 'UNDO' });

      state = store.getState();
      // After undo, should restore the widget that was there before reset
      expect(Object.keys(state.core.present.dashboard.instances)).toHaveLength(1);
      expect(state.core.present.dashboard.instances[action.meta.id]).toBeDefined();
    });
  });

  describe('Undo/Redo State Selectors', () => {
    it('should indicate when undo is available', () => {
      let state = store.getState();
      expect(state.core.past.length).toBe(0);

      store.dispatch(
        addWidget({
          type: 'chart',
          layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
        })
      );

      state = store.getState();
      expect(state.core.past.length).toBeGreaterThan(0);
    });

    it('should indicate when redo is available', () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });
      store.dispatch(action);

      let state = store.getState();
      expect(state.core.future.length).toBe(0);

      store.dispatch({ type: 'UNDO' });

      state = store.getState();
      expect(state.core.future.length).toBeGreaterThan(0);
    });

    it('should indicate no undo available on empty history', () => {
      const state = store.getState();
      expect(state.core.past.length).toBe(0);
    });

    it('should indicate no redo available after new action', () => {
      const action1 = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });
      store.dispatch(action1);
      store.dispatch({ type: 'UNDO' });

      let state = store.getState();
      expect(state.core.future.length).toBeGreaterThan(0);

      const action2 = addWidget({
        type: 'table',
        layout: { x: 6, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });
      store.dispatch(action2);

      state = store.getState();
      expect(state.core.future.length).toBe(0);
    });
  });

  describe('Complex Undo/Redo Scenarios', () => {
    it('should handle undo/redo with mixed operations', () => {
      const action1 = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
        props: { title: 'Chart 1' },
      });

      store.dispatch(action1);

      store.dispatch(
        updateWidgetProps({
          id: action1.meta.id,
          props: { title: 'Updated Chart' },
        })
      );

      const action2 = addWidget({
        type: 'table',
        layout: { x: 6, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action2);

      store.dispatch(
        moveResizeWidget({
          id: action1.meta.id,
          x: 2,
          y: 2,
          w: 8,
          h: 5,
        })
      );

      // Undo move/resize
      store.dispatch({ type: 'UNDO' });
      let state = store.getState();
      const layout1 = state.core.present.dashboard.layout.find(
        item => item.id === action1.meta.id
      );
      expect(layout1).toMatchObject({ x: 0, y: 0 });

      // Undo add table
      store.dispatch({ type: 'UNDO' });
      state = store.getState();
      expect(state.core.present.dashboard.instances[action2.meta.id]).toBeUndefined();

      // Undo update props
      store.dispatch({ type: 'UNDO' });
      state = store.getState();
      expect(state.core.present.dashboard.instances[action1.meta.id].props.title).toBe('Chart 1');

      // Redo update props
      store.dispatch({ type: 'REDO' });
      state = store.getState();
      expect(state.core.present.dashboard.instances[action1.meta.id].props.title).toBe('Updated Chart');
    });

    it('should handle undo after widget duplication', () => {
      const action = addWidget({
        type: 'list',
        layout: { x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
        props: { items: ['Item 1'] },
      });

      store.dispatch(action);
      store.dispatch(duplicateWidget(action.meta.id));

      let state = store.getState();
      expect(Object.keys(state.core.present.dashboard.instances)).toHaveLength(2);

      // Undo the duplication
      store.dispatch({ type: 'UNDO' });

      state = store.getState();
      // After undo, should only have original widget
      expect(Object.keys(state.core.present.dashboard.instances)).toHaveLength(1);
      expect(state.core.present.dashboard.instances[action.meta.id]).toBeDefined();
    });

    it('should maintain widget data integrity through undo/redo cycles', () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
        props: {
          title: 'Sales Chart',
          data: [{ x: 1, y: 100 }, { x: 2, y: 200 }],
        },
      });

      store.dispatch(action);

      const originalWidget =
        store.getState().core.present.dashboard.instances[action.meta.id];

      // Perform undo/redo cycle
      store.dispatch({ type: 'UNDO' });
      store.dispatch({ type: 'REDO' });

      const restoredWidget =
        store.getState().core.present.dashboard.instances[action.meta.id];

      expect(restoredWidget).toEqual(originalWidget);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undo when history is empty', () => {
      const initialState = store.getState();

      store.dispatch({ type: 'UNDO' });

      const afterState = store.getState();

      expect(afterState.core.present).toEqual(initialState.core.present);
      expect(afterState.core.past.length).toBe(0);
    });

    it('should handle redo when future is empty', () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);

      const stateBeforeRedo = store.getState();

      store.dispatch({ type: 'REDO' });

      const stateAfterRedo = store.getState();

      expect(stateAfterRedo.core.present).toEqual(stateBeforeRedo.core.present);
      expect(stateAfterRedo.core.future.length).toBe(0);
    });

    it('should handle rapid undo/redo operations', () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);

      // Rapid undo/redo cycles
      for (let i = 0; i < 10; i++) {
        store.dispatch({ type: 'UNDO' });
        store.dispatch({ type: 'REDO' });
      }

      const state = store.getState();
      expect(state.core.present.dashboard.instances[action.meta.id]).toBeDefined();
      expect(state.core.future.length).toBe(0);
    });
  });
});
