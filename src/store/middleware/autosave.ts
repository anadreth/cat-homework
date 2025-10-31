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
  resetDashboard,
  updateDashboardMeta,
  duplicateWidget,
  toggleWidgetLock,
} from "../slices/coreSlice";
import { markSaving, markSaved, markError } from "../slices/uiSlice";

const STORAGE_KEY = "retool-dashboard";
const DEBOUNCE_MS = 700;

/**
 * Create listener middleware instance
 */
export const autosaveMiddleware = createListenerMiddleware();

/**
 * Start listening for core state changes
 */
autosaveMiddleware.startListening({
  matcher: isAnyOf(
    addWidget,
    updateWidgetProps,
    moveResizeWidget,
    removeWidget,
    setLayout,
    updateDashboardMeta,
    duplicateWidget,
    toggleWidgetLock,
    resetDashboard
  ),
  effect: async (_, listenerApi) => {
    listenerApi.cancelActiveListeners();
    listenerApi.dispatch(markSaving());

    await listenerApi.delay(DEBOUNCE_MS);

    try {
      const state = listenerApi.getState() as RootState;
      const dashboard = state.core.present.dashboard;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboard));

      listenerApi.dispatch(markSaved());

      console.log("[Autosave] Dashboard saved to LocalStorage");
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
    const stored = localStorage.getItem(STORAGE_KEY);
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
    localStorage.removeItem(STORAGE_KEY);
    console.log("[Autosave] Dashboard cleared from LocalStorage");
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
    console.log("[Export] Dashboard exported to file");
  } catch (error) {
    console.error("[Export] Failed to export dashboard:", error);
    throw error;
  }
};
