import { describe, it, expect, beforeEach } from 'vitest';
import { setupStore } from '../test-utils';
import { addWidget, updateWidgetProps } from '@/store/slices/coreSlice';

describe('Widget Management - Update Properties', () => {
  let store: ReturnType<typeof setupStore>;

  beforeEach(() => {
    store = setupStore();
  });

  describe('Updating Widget Properties', () => {
    it('should update widget props', () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
        props: {
          title: 'Original Title',
          data: [],
        },
      });

      store.dispatch(action);

      const widgetId = action.meta.id;

      store.dispatch(
        updateWidgetProps({
          id: widgetId,
          props: {
            title: 'Updated Title',
            subtitle: 'New Subtitle',
          },
        })
      );

      const state = store.getState();
      const widget = state.core.present.dashboard.instances[widgetId];

      expect(widget.props.title).toBe('Updated Title');
      expect(widget.props.subtitle).toBe('New Subtitle');
      expect(widget.props.data).toEqual([]); // Original prop preserved
    });

    it('should merge new props with existing props', () => {
      const action = addWidget({
        type: 'table',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
        props: {
          columns: ['name', 'value'],
          data: [{ name: 'Item 1', value: 100 }],
        },
      });

      store.dispatch(action);

      store.dispatch(
        updateWidgetProps({
          id: action.meta.id,
          props: {
            sortable: true,
          },
        })
      );

      const state = store.getState();
      const widget = state.core.present.dashboard.instances[action.meta.id];

      expect(widget.props).toEqual({
        columns: ['name', 'value'],
        data: [{ name: 'Item 1', value: 100 }],
        sortable: true,
      });
    });

    it('should update widget updatedAt timestamp', async () => {
      const action = addWidget({
        type: 'text',
        layout: { x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
        props: { content: 'Original' },
      });

      store.dispatch(action);

      const originalUpdatedAt =
        store.getState().core.present.dashboard.instances[action.meta.id]
          .updatedAt;

      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      store.dispatch(
        updateWidgetProps({
          id: action.meta.id,
          props: { content: 'Updated' },
        })
      );

      const state = store.getState();
      const widget = state.core.present.dashboard.instances[action.meta.id];

      expect(widget.updatedAt).toBeGreaterThan(originalUpdatedAt);
    });

    it('should not update props for non-existent widget', () => {
      const initialState = store.getState();

      store.dispatch(
        updateWidgetProps({
          id: 'non-existent-id',
          props: { title: 'Test' },
        })
      );

      const afterState = store.getState();

      expect(afterState.core.present.dashboard.instances).toEqual(
        initialState.core.present.dashboard.instances
      );
    });
  });
});
