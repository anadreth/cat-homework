import { describe, it, expect, beforeEach } from 'vitest';
import { setupStore } from '../test-utils';
import {
  addWidget,
  removeWidget,
  updateWidgetProps,
  moveResizeWidget,
  duplicateWidget,
  toggleWidgetLock,
  resetDashboard,
} from '@/store/slices/coreSlice';

describe('Widget Management', () => {
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
