import { describe, it, expect, beforeEach } from 'vitest';
import { setupStore } from '../test-utils';
import { addWidget, moveResizeWidget } from '@/store/slices/coreSlice';

describe('Widget Management - Move/Resize', () => {
  let store: ReturnType<typeof setupStore>;

  beforeEach(() => {
    store = setupStore();
  });

  describe('Moving and Resizing Widgets', () => {
    it('should update widget position and size', () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);

      store.dispatch(
        moveResizeWidget({
          id: action.meta.id,
          x: 3,
          y: 5,
          w: 8,
          h: 6,
        })
      );

      const state = store.getState();
      const layoutItem = state.core.present.dashboard.layout.find(
        item => item.id === action.meta.id
      );

      expect(layoutItem).toMatchObject({
        x: 3,
        y: 5,
        w: 8,
        h: 6,
      });
    });

    it('should preserve other layout properties when moving/resizing', () => {
      const action = addWidget({
        type: 'table',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
      });

      store.dispatch(action);

      store.dispatch(
        moveResizeWidget({
          id: action.meta.id,
          x: 2,
          y: 2,
          w: 7,
          h: 5,
        })
      );

      const state = store.getState();
      const layoutItem = state.core.present.dashboard.layout.find(
        item => item.id === action.meta.id
      );

      expect(layoutItem?.minW).toBe(3);
      expect(layoutItem?.minH).toBe(3);
    });

    it('should not affect widget instance data when moving/resizing', () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
        props: { title: 'Test Chart' },
      });

      store.dispatch(action);

      const beforeInstance =
        store.getState().core.present.dashboard.instances[action.meta.id];

      store.dispatch(
        moveResizeWidget({
          id: action.meta.id,
          x: 5,
          y: 5,
          w: 10,
          h: 8,
        })
      );

      const afterInstance =
        store.getState().core.present.dashboard.instances[action.meta.id];

      expect(afterInstance).toEqual(beforeInstance);
    });

    it('should handle moving/resizing non-existent widget gracefully', () => {
      const initialState = store.getState();

      store.dispatch(
        moveResizeWidget({
          id: 'non-existent-id',
          x: 1,
          y: 1,
          w: 4,
          h: 4,
        })
      );

      const afterState = store.getState();

      expect(afterState.core.present.dashboard.layout).toEqual(
        initialState.core.present.dashboard.layout
      );
    });
  });
});
