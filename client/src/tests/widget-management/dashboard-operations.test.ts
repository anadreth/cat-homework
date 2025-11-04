import { describe, it, expect, beforeEach } from 'vitest';
import { setupStore } from '../test-utils';
import {
  addWidget,
  removeWidget,
  updateWidgetProps,
  moveResizeWidget,
  duplicateWidget,
  resetDashboard,
} from '@/store/slices/coreSlice';

describe('Widget Management - Dashboard Operations', () => {
  let store: ReturnType<typeof setupStore>;

  beforeEach(() => {
    store = setupStore();
  });

  describe('Clearing Dashboard', () => {
    it('should remove all widgets when resetting dashboard', () => {
      store.dispatch(
        addWidget({
          type: 'chart',
          layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
        })
      );

      store.dispatch(
        addWidget({
          type: 'table',
          layout: { x: 6, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
        })
      );

      store.dispatch(resetDashboard());

      const state = store.getState();
      const { instances, layout } = state.core.present.dashboard;

      expect(Object.keys(instances)).toHaveLength(0);
      expect(layout).toHaveLength(0);
    });

    it('should create new dashboard metadata when resetting', () => {
      const initialState = store.getState();
      const initialId = initialState.core.present.dashboard.id;

      store.dispatch(resetDashboard());

      const afterState = store.getState();
      const newId = afterState.core.present.dashboard.id;

      expect(newId).not.toBe(initialId);
      expect(afterState.core.present.dashboard.name).toBe(
        'Untitled Dashboard'
      );
    });
  });

  describe('Multiple Widget Operations', () => {
    it('should handle adding multiple widgets sequentially', () => {
      for (let i = 0; i < 5; i++) {
        store.dispatch(
          addWidget({
            type: 'chart',
            layout: { x: i, y: 0, w: 2, h: 2, minW: 1, minH: 1 },
          })
        );
      }

      const state = store.getState();
      const { instances, layout } = state.core.present.dashboard;

      expect(Object.keys(instances)).toHaveLength(5);
      expect(layout).toHaveLength(5);
    });

    it('should handle complex sequence of operations', () => {
      // Add widgets
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

      // Update props
      store.dispatch(
        updateWidgetProps({
          id: action1.meta.id,
          props: { title: 'Updated' },
        })
      );

      // Move widget
      store.dispatch(
        moveResizeWidget({
          id: action2.meta.id,
          x: 4,
          y: 2,
          w: 8,
          h: 5,
        })
      );

      // Duplicate widget
      store.dispatch(duplicateWidget(action3.meta.id));

      // Remove widget
      store.dispatch(removeWidget(action2.meta.id));

      const state = store.getState();
      const { instances, layout } = state.core.present.dashboard;

      // Should have: action1, action3, and duplicate of action3
      expect(Object.keys(instances)).toHaveLength(3);
      expect(layout).toHaveLength(3);

      // Verify action1 update
      expect(instances[action1.meta.id].props.title).toBe('Updated');

      // Verify action2 removed
      expect(instances[action2.meta.id]).toBeUndefined();

      // Verify action3 and its duplicate exist
      const listWidgets = Object.values(instances).filter(
        w => w.type === 'list'
      );
      expect(listWidgets).toHaveLength(2);
    });
  });
});
