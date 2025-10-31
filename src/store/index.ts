import { configureStore } from "@reduxjs/toolkit";
import undoable, { excludeAction } from "redux-undo";

import coreReducer from "./slices/coreSlice";
import selectionReducer from "./slices/selectionSlice";
import uiReducer from "./slices/uiSlice";

import { autosaveMiddleware } from "./middleware/autosave";

import type { RootState } from "./types";

/**
 * Wrap core reducer with redux-undo
 * Excludes import/reset actions from undo history
 */
const undoableCoreReducer = undoable(coreReducer, {
  limit: 100,
  filter: excludeAction(["core/importDashboard", "core/resetDashboard"]),
  groupBy: (action) => {
    if (action.type === "core/moveResizeWidget") {
      return "MOVE_RESIZE";
    }
    return null;
  },
  undoType: "UNDO",
  redoType: "REDO",
});

export const store = configureStore({
  reducer: {
    core: undoableCoreReducer,
    selection: selectionReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in serializable check
        // (timestamps are numbers, not serializable Date objects)
        ignoredPaths: ["core.present.dashboard.meta"],
      },
    }).prepend(autosaveMiddleware.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type { RootState };

export const undo = () => ({ type: "UNDO" });
export const redo = () => ({ type: "REDO" });

export {
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
  selectDashboard,
  selectAllWidgets,
  selectWidgetById,
  selectLayout,
  selectLayoutItemById,
} from "./slices/coreSlice";

export {
  selectWidget,
  clearSelection,
  toggleSelection,
  selectSelectedId,
  selectIsSelected,
} from "./slices/selectionSlice";

export {
  toggleInspector,
  openInspector,
  closeInspector,
  setInspectorTab,
  togglePalette,
  openPalette,
  closePalette,
  setSaveStatus,
  markSaving,
  markSaved,
  markError,
  resetSaveStatus,
  selectInspectorOpen,
  selectInspectorTab,
  selectPaletteOpen,
  selectSaveStatus,
  selectLastSaved,
  selectIsSaving,
  selectIsSaved,
} from "./slices/uiSlice";

export {
  loadDashboard,
  clearDashboard,
  exportDashboardToFile,
} from "./middleware/autosave";
