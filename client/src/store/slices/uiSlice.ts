/**
 * UI slice - Transient UI state
 *
 * This slice manages ephemeral UI state that doesn't need
 * to be persisted:
 * - Inspector panel visibility and active tab
 * - Palette visibility
 * - Save status indicator
 *
 * Not included in undo/redo or LocalStorage persistence.
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UIState, SaveStatus, InspectorTab } from "../types";

/**
 * Initial UI state
 */
const initialState: UIState = {
  inspectorOpen: false,
  inspectorTab: "properties",
  paletteOpen: true,
  saveStatus: "idle",
  lastSaved: null,
};

/**
 * UI slice
 */
const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    /**
     * Toggle inspector panel
     */
    toggleInspector: (state) => {
      state.inspectorOpen = !state.inspectorOpen;
    },

    /**
     * Open inspector panel
     */
    openInspector: (state) => {
      state.inspectorOpen = true;
    },

    /**
     * Close inspector panel
     */
    closeInspector: (state) => {
      state.inspectorOpen = false;
    },

    /**
     * Set active inspector tab
     */
    setInspectorTab: (state, action: PayloadAction<InspectorTab>) => {
      state.inspectorTab = action.payload;
    },

    /**
     * Toggle palette panel
     */
    togglePalette: (state) => {
      state.paletteOpen = !state.paletteOpen;
    },

    /**
     * Open palette panel
     */
    openPalette: (state) => {
      state.paletteOpen = true;
    },

    /**
     * Close palette panel
     */
    closePalette: (state) => {
      state.paletteOpen = false;
    },

    /**
     * Set save status
     */
    setSaveStatus: (state, action: PayloadAction<SaveStatus>) => {
      state.saveStatus = action.payload;
      if (action.payload === "saved") {
        state.lastSaved = Date.now();
      }
    },

    /**
     * Mark as saving
     */
    markSaving: (state) => {
      state.saveStatus = "saving";
    },

    /**
     * Mark as saved
     */
    markSaved: (state) => {
      state.saveStatus = "saved";
      state.lastSaved = Date.now();
    },

    /**
     * Mark as error
     */
    markError: (state) => {
      state.saveStatus = "error";
    },

    /**
     * Reset to idle
     */
    resetSaveStatus: (state) => {
      state.saveStatus = "idle";
    },
  },
});

export const {
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
} = uiSlice.actions;

export default uiSlice.reducer;

export const selectInspectorOpen = (state: { ui: UIState }) =>
  state.ui.inspectorOpen;

export const selectInspectorTab = (state: { ui: UIState }) =>
  state.ui.inspectorTab;

export const selectPaletteOpen = (state: { ui: UIState }) =>
  state.ui.paletteOpen;

export const selectSaveStatus = (state: { ui: UIState }) => state.ui.saveStatus;

export const selectLastSaved = (state: { ui: UIState }) => state.ui.lastSaved;

export const selectIsSaving = (state: { ui: UIState }) =>
  state.ui.saveStatus === "saving";

export const selectIsSaved = (state: { ui: UIState }) =>
  state.ui.saveStatus === "saved";
