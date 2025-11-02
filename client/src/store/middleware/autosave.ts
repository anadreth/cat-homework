/**
 * Autosave middleware - Debounced LocalStorage persistence
 *
 * Listens for changes to core.present and automatically saves
 * the dashboard to LocalStorage after a debounce period.
 *
 * This keeps the persistence logic out of reducers and provides
 * a clean separation of concerns.
 */

import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import type { RootState } from "../types";
import {
  addWidget,
  updateWidgetProps,
  moveResizeWidget,
  removeWidget,
  setLayout,
  importDashboard,
  resetDashboard,
  updateDashboardMeta,
  duplicateWidget,
  toggleWidgetLock,
} from "../slices/coreSlice";
import { markSaving, markSaved, markError } from "../slices/uiSlice";
import {
  AUTOSAVE_DEBOUNCE_MS,
  AUTOSAVE_STORAGE_KEY,
} from "@/constants/autosave";

/**
 * Create listener middleware instance
 */
export const autosaveMiddleware = createListenerMiddleware();

/**
 * Start listening for core state changes
 * Including undo/redo actions
 */
autosaveMiddleware.startListening({
  predicate: (action) => {
    const isCoreAction = isAnyOf(
      addWidget,
      updateWidgetProps,
      moveResizeWidget,
      removeWidget,
      setLayout,
      importDashboard,
      updateDashboardMeta,
      duplicateWidget,
      toggleWidgetLock,
      resetDashboard
    )(action);

    const isUndoRedo = action.type === "UNDO" || action.type === "REDO";

    return isCoreAction || isUndoRedo;
  },
  effect: async (_, listenerApi) => {
    listenerApi.cancelActiveListeners();
    listenerApi.dispatch(markSaving());

    await listenerApi.delay(AUTOSAVE_DEBOUNCE_MS);

    try {
      const state = listenerApi.getState() as RootState;
      const dashboard = state.core.present.dashboard;

      localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(dashboard));
      listenerApi.dispatch(markSaved());
    } catch (error) {
      console.error("[Autosave] Failed to save dashboard:", error);
      listenerApi.dispatch(markError());
    }
  },
});

/**
 * Load dashboard from LocalStorage
 * Called on app initialization
 */
export const loadDashboard = () => {
  try {
    const stored = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("[Autosave] Failed to load dashboard:", error);
  }
  return null;
};

/**
 * Clear dashboard from LocalStorage
 */
export const clearDashboard = () => {
  try {
    localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
  } catch (error) {
    console.error("[Autosave] Failed to clear dashboard:", error);
  }
};

/**
 * Export dashboard to JSON file
 */
export const exportDashboardToFile = (dashboard: unknown) => {
  try {
    const json = JSON.stringify(dashboard, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dashboard-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("[Export] Failed to export dashboard:", error);
    throw error;
  }
};
