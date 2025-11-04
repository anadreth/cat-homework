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
import type { RootState } from "../types";
import {
  getGridStack,
  getDashboardState,
  addWidgetToGrid,
  removeWidgetFromGrid,
  updateWidgetLayout,
  rebuildGridStackFromRedux,
  reconcileGridStackWithRedux,
} from "@/lib/utils/gridstack";

export const gridStackSyncMiddleware = createListenerMiddleware();

gridStackSyncMiddleware.startListening({
  type: "core/addWidget",
  effect: async (action, listenerApi) => {
    const gridStack = getGridStack();
    if (!gridStack) return;

    const widgetId = (action as unknown as { meta: { id: string } }).meta.id;
    const { layout, instances } = getDashboardState(
      listenerApi.getState() as RootState
    );

    const layoutItem = layout.find((item) => item.id === widgetId);
    const instance = instances[widgetId];

    if (layoutItem && instance) {
      try {
        addWidgetToGrid(gridStack, layoutItem, instance);
      } catch (error) {
        console.error("Error adding widget to GridStack:", error);
      }
    }
  },
});

gridStackSyncMiddleware.startListening({
  type: "core/removeWidget",
  effect: async (action) => {
    const gridStack = getGridStack();
    if (!gridStack) return;

    const widgetId = (action as PayloadAction<string>).payload;
    try {
      removeWidgetFromGrid(gridStack, widgetId);
    } catch (error) {
      console.error("Error removing widget from GridStack:", error);
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
    const gridStack = getGridStack();
    if (!gridStack) return;

    const { id, x, y, w, h } = (
      action as PayloadAction<{
        id: string;
        x: number;
        y: number;
        w: number;
        h: number;
      }>
    ).payload;

    try {
      updateWidgetLayout(gridStack, id, { x, y, w, h });
    } catch (error) {
      console.error("Error updating widget in GridStack:", error);
    }
  },
});

gridStackSyncMiddleware.startListening({
  type: "core/duplicateWidget",
  effect: async (_action, listenerApi) => {
    const gridStack = getGridStack();
    if (!gridStack) return;

    const { layout, instances } = getDashboardState(
      listenerApi.getState() as RootState
    );

    // The duplicated widget is the last one in the layout
    const newLayoutItem = layout[layout.length - 1];
    const newInstance = instances[newLayoutItem?.id];

    if (newLayoutItem && newInstance) {
      try {
        addWidgetToGrid(gridStack, newLayoutItem, newInstance);
      } catch (error) {
        console.error("Error adding duplicated widget to GridStack:", error);
      }
    }
  },
});

gridStackSyncMiddleware.startListening({
  type: "core/toggleWidgetLock",
  effect: async (action, listenerApi) => {
    const gridStack = getGridStack();
    if (!gridStack) return;

    const widgetId = (action as PayloadAction<string>).payload;
    const { layout } = getDashboardState(listenerApi.getState() as RootState);

    const layoutItem = layout.find((item) => item.id === widgetId);

    if (layoutItem) {
      try {
        updateWidgetLayout(gridStack, widgetId, {
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
          locked: layoutItem.locked,
        });
      } catch (error) {
        console.error("Error updating widget lock in GridStack:", error);
      }
    }
  },
});

gridStackSyncMiddleware.startListening({
  type: "core/importDashboard",
  effect: async (_action, listenerApi) => {
    const gridStack = getGridStack();
    if (!gridStack) return;

    const { layout, instances } = getDashboardState(
      listenerApi.getState() as RootState
    );

    try {
      rebuildGridStackFromRedux(gridStack, layout, instances);
    } catch (error) {
      console.error("Error importing dashboard to GridStack:", error);
    }
  },
});

gridStackSyncMiddleware.startListening({
  type: "core/resetDashboard",
  effect: async () => {
    const gridStack = getGridStack();
    if (!gridStack) return;

    try {
      gridStack.removeAll(false);
    } catch (error) {
      console.error("Error resetting GridStack:", error);
    }
  },
});

gridStackSyncMiddleware.startListening({
  predicate: (action) => action.type === "UNDO" || action.type === "REDO",
  effect: async (action, listenerApi) => {
    const gridStack = getGridStack();
    if (!gridStack) return;

    const { layout, instances } = getDashboardState(
      listenerApi.getState() as RootState
    );

    try {
      reconcileGridStackWithRedux(gridStack, layout, instances);
    } catch (error) {
      console.error(`Error syncing GridStack after ${action.type}:`, error);
    }
  },
});
