import { describe, it, expect, beforeEach } from 'vitest';
import { setupStore } from '../test-utils';
import { addWidget, duplicateWidget } from '@/store/slices/coreSlice';

describe('Widget Management - Duplicate', () => {
  let store: ReturnType<typeof setupStore>;

  beforeEach(() => {
    store = setupStore();
  });

  describe('Duplicating Widgets', () => {
    it('should create a duplicate widget with same type and props', () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
        props: {
          title: 'Original Chart',
          data: [{ x: 1, y: 2 }],
        },
      });

      store.dispatch(action);

      store.dispatch(duplicateWidget(action.meta.id));

      const state = store.getState();
      const { instances } = state.core.present.dashboard;

      expect(Object.keys(instances)).toHaveLength(2);

      const duplicates = Object.values(instances).filter(
        w => w.type === 'chart' && w.props.title === 'Original Chart'
      );

      expect(duplicates).toHaveLength(2);
      expect(duplicates[0].id).not.toBe(duplicates[1].id);
    });

    it('should offset duplicated widget position', () => {
      const action = addWidget({
        type: 'table',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);

      store.dispatch(duplicateWidget(action.meta.id));

      const state = store.getState();
      const layout = state.core.present.dashboard.layout;

      const original = layout.find(item => item.id === action.meta.id);
      const duplicate = layout.find(item => item.id !== action.meta.id);

      expect(duplicate?.x).toBe((original!.x + 1) % 12);
      expect(duplicate?.y).toBe(original!.y + 1);
    });

    it('should create new timestamps for duplicated widget', async () => {
      const action = addWidget({
        type: 'list',
        layout: { x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
      });

      store.dispatch(action);

      const originalWidget =
        store.getState().core.present.dashboard.instances[action.meta.id];

      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      store.dispatch(duplicateWidget(action.meta.id));

      const state = store.getState();
      const duplicatedWidget = Object.values(
        state.core.present.dashboard.instances
      ).find(w => w.id !== action.meta.id);

      expect(duplicatedWidget?.createdAt).toBeGreaterThan(
        originalWidget.createdAt
      );
    });

    it('should handle duplicating non-existent widget gracefully', () => {
      const initialState = store.getState();

      store.dispatch(duplicateWidget('non-existent-id'));

      const afterState = store.getState();

      expect(afterState.core.present.dashboard.instances).toEqual(
        initialState.core.present.dashboard.instances
      );
      expect(afterState.core.present.dashboard.layout).toEqual(
        initialState.core.present.dashboard.layout
      );
    });
  });
});
