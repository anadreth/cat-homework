import { describe, it, expect, beforeEach } from 'vitest';
import { setupStore } from '../test-utils';
import { addWidget, removeWidget } from '@/store/slices/coreSlice';

describe('Widget Management - Add/Remove', () => {
  let store: ReturnType<typeof setupStore>;

  beforeEach(() => {
    store = setupStore();
  });

  describe('Adding Widgets', () => {
    it('should add a widget to the dashboard', () => {
      const widgetAction = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
        props: {
          title: 'Sales Chart',
          data: [],
        },
      });

      store.dispatch(widgetAction);

      const state = store.getState();
      const { instances, layout } = state.core.present.dashboard;

      expect(Object.keys(instances)).toHaveLength(1);
      expect(layout).toHaveLength(1);

      const widgetId = widgetAction.meta.id;
      expect(instances[widgetId]).toBeDefined();
      expect(instances[widgetId].type).toBe('chart');
      expect(instances[widgetId].props.title).toBe('Sales Chart');
    });

    it('should generate unique IDs for each widget', () => {
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

      const id1 = action1.meta.id;
      const id2 = action2.meta.id;

      expect(id1).not.toBe(id2);

      const state = store.getState();
      expect(state.core.present.dashboard.instances[id1]).toBeDefined();
      expect(state.core.present.dashboard.instances[id2]).toBeDefined();
    });

    it('should add widget with default empty props if not provided', () => {
      const action = addWidget({
        type: 'text',
        layout: { x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
      });

      store.dispatch(action);

      const state = store.getState();
      const widget = state.core.present.dashboard.instances[action.meta.id];

      expect(widget.props).toEqual({});
    });

    it('should add widget to layout with correct position and size', () => {
      const action = addWidget({
        type: 'list',
        layout: { x: 3, y: 5, w: 4, h: 6, minW: 2, minH: 3 },
      });

      store.dispatch(action);

      const state = store.getState();
      const layoutItem = state.core.present.dashboard.layout.find(
        item => item.id === action.meta.id
      );

      expect(layoutItem).toMatchObject({
        x: 3,
        y: 5,
        w: 4,
        h: 6,
        minW: 2,
        minH: 3,
      });
    });

    it('should set createdAt and updatedAt timestamps', () => {
      const beforeTime = Date.now();

      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);

      const afterTime = Date.now();

      const state = store.getState();
      const widget = state.core.present.dashboard.instances[action.meta.id];

      expect(widget.createdAt).toBeGreaterThanOrEqual(beforeTime);
      expect(widget.createdAt).toBeLessThanOrEqual(afterTime);
      expect(widget.updatedAt).toBe(widget.createdAt);
    });

    it('should update dashboard updatedAt when adding widget', () => {
      const beforeTime = Date.now();

      store.dispatch(
        addWidget({
          type: 'chart',
          layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
        })
      );

      const afterTime = Date.now();

      const state = store.getState();
      const dashboardUpdatedAt = state.core.present.dashboard.meta.updatedAt;

      expect(dashboardUpdatedAt).toBeGreaterThanOrEqual(beforeTime);
      expect(dashboardUpdatedAt).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('Removing Widgets', () => {
    it('should remove a widget from the dashboard', () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);

      const widgetId = action.meta.id;

      store.dispatch(removeWidget(widgetId));

      const state = store.getState();
      const { instances, layout } = state.core.present.dashboard;

      expect(instances[widgetId]).toBeUndefined();
      expect(layout.find(item => item.id === widgetId)).toBeUndefined();
      expect(Object.keys(instances)).toHaveLength(0);
      expect(layout).toHaveLength(0);
    });

    it('should remove only the specified widget', () => {
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

      store.dispatch(removeWidget(action1.meta.id));

      const state = store.getState();
      const { instances, layout } = state.core.present.dashboard;

      expect(instances[action1.meta.id]).toBeUndefined();
      expect(instances[action2.meta.id]).toBeDefined();
      expect(Object.keys(instances)).toHaveLength(1);
      expect(layout).toHaveLength(1);
    });

    it('should handle removing non-existent widget gracefully', () => {
      const initialState = store.getState();

      store.dispatch(removeWidget('non-existent-id'));

      const afterState = store.getState();

      expect(afterState.core.present.dashboard.instances).toEqual(
        initialState.core.present.dashboard.instances
      );
      expect(afterState.core.present.dashboard.layout).toEqual(
        initialState.core.present.dashboard.layout
      );
    });

    it('should update dashboard updatedAt when removing widget', () => {
      const action = addWidget({
        type: 'chart',
        layout: { x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
      });

      store.dispatch(action);

      const beforeRemove = Date.now();
      store.dispatch(removeWidget(action.meta.id));
      const afterRemove = Date.now();

      const state = store.getState();
      const dashboardUpdatedAt = state.core.present.dashboard.meta.updatedAt;

      expect(dashboardUpdatedAt).toBeGreaterThanOrEqual(beforeRemove);
      expect(dashboardUpdatedAt).toBeLessThanOrEqual(afterRemove);
    });
  });
});
