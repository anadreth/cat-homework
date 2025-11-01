/**
 * Selection slice - Currently selected widget
 *
 * This slice tracks which widget is currently selected for editing.
 * Kept separate from core state to avoid re-rendering the entire
 * dashboard when selection changes.
 *
 * Ephemeral state - not persisted to LocalStorage.
 */

import { createSlice,type PayloadAction } from '@reduxjs/toolkit';
import type { SelectionState } from '../types';
import { removeWidget } from './coreSlice';

/**
 * Initial state - nothing selected
 */
const initialState: SelectionState = {
  selectedId: null,
};

/**
 * Selection slice
 */
const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    /**
     * Select a widget by ID
     */
    selectWidget: (state, action: PayloadAction<string>) => {
      state.selectedId = action.payload;
    },

    /**
     * Clear selection
     */
    clearSelection: (state) => {
      state.selectedId = null;
    },

    /**
     * Toggle selection (select if not selected, clear if selected)
     */
    toggleSelection: (state, action: PayloadAction<string>) => {
      if (state.selectedId === action.payload) {
        state.selectedId = null;
      } else {
        state.selectedId = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Auto-clear selection when the selected widget is removed
    builder.addCase(removeWidget, (state, action) => {
      if (state.selectedId === action.payload) {
        state.selectedId = null;
      }
    });
  },
});

export const { selectWidget, clearSelection, toggleSelection } =
  selectionSlice.actions;

export default selectionSlice.reducer;

export const selectSelectedId = (state: { selection: SelectionState }) =>
  state.selection.selectedId;

export const selectIsSelected = (id: string) => (state: { selection: SelectionState }) =>
  state.selection.selectedId === id;
