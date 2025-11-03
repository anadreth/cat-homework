/**
 * GridStack Synchronization Middleware
 *
 * Listens to Redux actions and imperatively updates GridStack instance.
 * This eliminates the need for useEffect hooks to sync state between Redux and GridStack.
 *
 * Data Flow:
 * User Action → Redux Action → Redux Reducer → This Middleware → GridStack API
 *
 * Benefits:
 * - Single source of truth (Redux)
 * - No bidirectional syncing
 * - No useEffect delays
 * - Predictable data flow
 */

import { createListenerMiddleware, type PayloadAction } from "@reduxjs/toolkit";
import { gridStackRegistry } from "@/components/Canvas/utils/gridStackRegistry";
import {
  createGridStackWidget,
  findGridStackElement,
} from "@/components/Canvas/utils/gridStackHelpers";
import type { RootState } from "../types";

export const gridStackSyncMiddleware = createListenerMiddleware();

/**
 * Listen to addWidget action
 * When a widget is added to Redux, add it to GridStack
 */
gridStackSyncMiddleware.startListening({
  type: "core/addWidget",
  effect: async (action, listenerApi) => {
    const gridStack = gridStackRegistry.getInstance();
    if (!gridStack) return;

    // Get the widget ID from action meta
    const widgetId = (action as unknown as { meta: { id: string } }).meta.id;

    // Get the updated state after the reducer ran
    const state = listenerApi.getState() as RootState;
    const layout = state.core.present.dashboard.layout;
    const instances = state.core.present.dashboard.instances;

    const layoutItem = layout.find((item) => item.id === widgetId);
    const instance = instances[widgetId];

    if (!layoutItem || !instance) {
      console.warn(`Widget not found in state after addWidget: ${widgetId}`);
      return;
    }

    // Create GridStack widget and add to grid
    const gridStackWidget = createGridStackWidget(
      widgetId,
      layoutItem,
      instance.type
    );

    try {
      gridStack.addWidget(gridStackWidget);
    } catch (error) {
      console.error("Error adding widget to GridStack:", error);
    }
  },
});

/**
 * Listen to removeWidget action
 * When a widget is removed from Redux, remove it from GridStack
 */
gridStackSyncMiddleware.startListening({
  type: "core/removeWidget",
  effect: async (action) => {
    const gridStack = gridStackRegistry.getInstance();
    if (!gridStack) return;

    const widgetId = (action as PayloadAction<string>).payload;
    const element = findGridStackElement(widgetId);

    if (element) {
      try {
        gridStack.removeWidget(element, false); // Don't trigger callbacks
      } catch (error) {
        console.error("Error removing widget from GridStack:", error);
      }
    }
  },
});

/**
 * Listen to moveResizeWidget action from non-GridStack sources
 * (e.g., keyboard shortcuts, undo/redo)
 * Update GridStack to reflect the new position/size
 */
gridStackSyncMiddleware.startListening({
  type: "core/moveResizeWidget",
  effect: async (action) => {
    const gridStack = gridStackRegistry.getInstance();
    if (!gridStack) return;

    const { id, x, y, w, h } = (action as PayloadAction<{
      id: string;
      x: number;
      y: number;
      w: number;
      h: number;
    }>).payload;

    const element = findGridStackElement(id);

    if (element) {
      try {
        // Update GridStack element position/size
       gridStack.update(element, { x, y, w, h });
      } catch (error) {
        console.error("Error updating widget in GridStack:", error);
      }
    }
  },
});

/**
 * Listen to duplicateWidget action
 * Add the duplicated widget to GridStack
 */
gridStackSyncMiddleware.startListening({
  type: "core/duplicateWidget",
  effect: async (_action, listenerApi) => {
    const gridStack = gridStackRegistry.getInstance();
    if (!gridStack) return;

    // Get the updated state
    const state = listenerApi.getState() as RootState;
    const layout = state.core.present.dashboard.layout;
    const instances = state.core.present.dashboard.instances;

    // Find the newly added widget (it will be the last one in the layout)
    const newLayoutItem = layout[layout.length - 1];
    const newInstance = instances[newLayoutItem?.id];

    if (!newLayoutItem || !newInstance) {
      console.warn("Duplicated widget not found in state");
      return;
    }

    // Create GridStack widget and add to grid
    const gridStackWidget = createGridStackWidget(
      newInstance.id,
      newLayoutItem,
      newInstance.type
    );

    try {
      gridStack.addWidget(gridStackWidget);
    } catch (error) {
      console.error("Error adding duplicated widget to GridStack:", error);
    }
  },
});

/**
 * Listen to toggleWidgetLock action
 * Update GridStack element's locked state
 */
gridStackSyncMiddleware.startListening({
  type: "core/toggleWidgetLock",
  effect: async (action, listenerApi) => {
    const gridStack = gridStackRegistry.getInstance();
    if (!gridStack) return;

    const widgetId = (action as PayloadAction<string>).payload;
    const element = findGridStackElement(widgetId);

    if (element) {
      // Get the updated locked state from Redux
      const state = listenerApi.getState() as RootState;
      const layoutItem = state.core.present.dashboard.layout.find(
        (item) => item.id === widgetId
      );

      if (layoutItem) {
        try {
          gridStack.update(element, {
            locked: layoutItem.locked,
            noMove: layoutItem.locked,
            noResize: layoutItem.locked,
          });
        } catch (error) {
          console.error("Error updating widget lock in GridStack:", error);
        }
      }
    }
  },
});

/**
 * Listen to importDashboard action
 * Recreate all widgets in GridStack
 */
gridStackSyncMiddleware.startListening({
  type: "core/importDashboard",
  effect: async (_action, listenerApi) => {
    const gridStack = gridStackRegistry.getInstance();
    if (!gridStack) return;

    try {
      // Clear all existing widgets
      gridStack.removeAll(false);

      // Get the new state
      const state = listenerApi.getState() as RootState;
      const layout = state.core.present.dashboard.layout;
      const instances = state.core.present.dashboard.instances;

      // Add all widgets from the imported dashboard
      layout.forEach((layoutItem) => {
        const instance = instances[layoutItem.id];
        if (instance) {
          const gridStackWidget = createGridStackWidget(
            instance.id,
            layoutItem,
            instance.type
          );
          gridStack.addWidget(gridStackWidget);
        }
      });
    } catch (error) {
      console.error("Error importing dashboard to GridStack:", error);
    }
  },
});

/**
 * Listen to resetDashboard action
 * Remove all widgets from GridStack
 */
gridStackSyncMiddleware.startListening({
  type: "core/resetDashboard",
  effect: async (_action) => {
    const gridStack = gridStackRegistry.getInstance();
    if (!gridStack) return;

    try {
      gridStack.removeAll(false);
    } catch (error) {
      console.error("Error resetting GridStack:", error);
    }
  },
});

/**
 * Listen to UNDO action
 * Reconcile GridStack with Redux state after undo
 */
gridStackSyncMiddleware.startListening({
  type: "UNDO",
  effect: async (_action, listenerApi) => {
    const gridStack = gridStackRegistry.getInstance();
    if (!gridStack) return;

    // Get the state after undo
    const state = listenerApi.getState() as RootState;
    const layout = state.core.present.dashboard.layout;
    const instances = state.core.present.dashboard.instances;

    try {
      // Get current GridStack widget IDs
      const currentWidgets = gridStack.getGridItems();
      const currentIds = new Set(
        currentWidgets
          .map((el) => el.getAttribute("gs-id"))
          .filter((id): id is string => id !== null)
      );

      // Get target widget IDs from Redux
      const targetIds = new Set(layout.map((item) => item.id));

      // Remove widgets that shouldn't exist
      currentIds.forEach((id) => {
        if (!targetIds.has(id)) {
          const element = findGridStackElement(id);
          if (element) {
            gridStack.removeWidget(element, false);
          }
        }
      });

      // Add widgets that should exist but don't
      layout.forEach((layoutItem) => {
        if (!currentIds.has(layoutItem.id)) {
          const instance = instances[layoutItem.id];
          if (instance) {
            const gridStackWidget = createGridStackWidget(
              instance.id,
              layoutItem,
              instance.type
            );
            gridStack.addWidget(gridStackWidget);
          }
        } else {
          // Update existing widgets to match Redux state
          const element = findGridStackElement(layoutItem.id);
          if (element) {
            gridStack.update(element, {
              x: layoutItem.x,
              y: layoutItem.y,
              w: layoutItem.w,
              h: layoutItem.h,
              locked: layoutItem.locked,
            });
          }
        }
      });
    } catch (error) {
      console.error("Error syncing GridStack after undo:", error);
    }
  },
});

/**
 * Listen to REDO action
 * Reconcile GridStack with Redux state after redo
 */
gridStackSyncMiddleware.startListening({
  type: "REDO",
  effect: async (_action, listenerApi) => {
    const gridStack = gridStackRegistry.getInstance();
    if (!gridStack) return;

    // Get the state after redo
    const state = listenerApi.getState() as RootState;
    const layout = state.core.present.dashboard.layout;
    const instances = state.core.present.dashboard.instances;

    try {
      // Get current GridStack widget IDs
      const currentWidgets = gridStack.getGridItems();
      const currentIds = new Set(
        currentWidgets
          .map((el) => el.getAttribute("gs-id"))
          .filter((id): id is string => id !== null)
      );

      // Get target widget IDs from Redux
      const targetIds = new Set(layout.map((item) => item.id));

      // Remove widgets that shouldn't exist
      currentIds.forEach((id) => {
        if (!targetIds.has(id)) {
          const element = findGridStackElement(id);
          if (element) {
            gridStack.removeWidget(element, false);
          }
        }
      });

      // Add widgets that should exist but don't
      layout.forEach((layoutItem) => {
        if (!currentIds.has(layoutItem.id)) {
          const instance = instances[layoutItem.id];
          if (instance) {
            const gridStackWidget = createGridStackWidget(
              instance.id,
              layoutItem,
              instance.type
            );
            gridStack.addWidget(gridStackWidget);
          }
        } else {
          // Update existing widgets to match Redux state
          const element = findGridStackElement(layoutItem.id);
          if (element) {
            gridStack.update(element, {
              x: layoutItem.x,
              y: layoutItem.y,
              w: layoutItem.w,
              h: layoutItem.h,
              locked: layoutItem.locked,
            });
          }
        }
      });
    } catch (error) {
      console.error("Error syncing GridStack after redo:", error);
    }
  },
});
