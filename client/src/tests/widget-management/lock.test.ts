import { describe, it, expect, beforeEach } from 'vitest';
import { setupStore } from '../test-utils';
import { addWidget, toggleWidgetLock } from '@/store/slices/coreSlice';

describe('Widget Management - Lock/Unlock', () => {
  let store: ReturnType<typeof setupStore>;

  beforeEach(() => {
    store = setupStore();
  });

  describe('Locking/Unlocking Widgets', () => {
    it('should toggle widget lock state', () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);

      store.dispatch(toggleWidgetLock(action.meta.id));

      let state = store.getState();
      let layoutItem = state.core.present.dashboard.layout.find(
        item => item.id === action.meta.id
      );

      expect(layoutItem?.locked).toBe(true);

      store.dispatch(toggleWidgetLock(action.meta.id));

      state = store.getState();
      layoutItem = state.core.present.dashboard.layout.find(
        item => item.id === action.meta.id
      );

      expect(layoutItem?.locked).toBe(false);
    });

    it('should handle locking non-existent widget gracefully', () => {
      const initialState = store.getState();

      store.dispatch(toggleWidgetLock('non-existent-id'));

      const afterState = store.getState();

      expect(afterState.core.present.dashboard.layout).toEqual(
        initialState.core.present.dashboard.layout
      );
    });
  });
});
