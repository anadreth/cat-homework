/**
 * Core slice - Dashboard layout and widget instances
 *
 * This slice contains the main dashboard state:
 * - Widget instances (normalized by ID)
 * - Layout items (grid positioning)
 * - Dashboard metadata
 *
 * All reducers are pure functions. Side effects (autosave, etc.)
 * are handled via listener middleware.
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import type {
  CoreState,
  DashboardDoc,
  LayoutItem,
  WidgetInstance,
  WidgetType,
  SerializableValue,
} from "../types";

/**
 * Create an empty dashboard document
 */
const createEmptyDashboard = (): DashboardDoc => ({
  version: 1,
  id: crypto.randomUUID(),
  name: "Untitled Dashboard",
  instances: {},
  layout: [],
  meta: {
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
});

/**
 * Initial state
 */
const initialState: CoreState = {
  dashboard: createEmptyDashboard(),
};

/**
 * Core slice
 */
const coreSlice = createSlice({
  name: "core",
  initialState,
  reducers: {
    /**
     * Add a new widget to the dashboard
     */
    addWidget: {
      reducer: (
        state,
        action: PayloadAction<{
          id: string;
          type: WidgetType;
          layout: Omit<LayoutItem, "id">;
          props?: Record<string, SerializableValue>;
          createdAt: number;
          updatedAt: number;
        }>
      ) => {
        const { id, type, layout, props, createdAt, updatedAt } =
          action.payload;

        const instance: WidgetInstance = {
          id,
          type,
          props: props || {},
          createdAt,
          updatedAt,
        };

        const layoutItem: LayoutItem = {
          id,
          ...layout,
        };

        state.dashboard.instances[id] = instance;
        state.dashboard.layout.push(layoutItem);
        state.dashboard.meta.updatedAt = updatedAt;
      },
      prepare: (payload: {
        type: WidgetType;
        layout: Omit<LayoutItem, "id">;
        props?: Record<string, SerializableValue>;
      }) => {
        const id = uuidv4();
        const now = Date.now();
        return {
          payload: {
            id,
            type: payload.type,
            layout: payload.layout,
            props: payload.props,
            createdAt: now,
            updatedAt: now,
          },
          meta: { id },
        };
      },
    },

    /**
     * Update widget properties
     */
    updateWidgetProps: (
      state,
      action: PayloadAction<{
        id: string;
        props: Record<string, SerializableValue>;
      }>
    ) => {
      const instance = state.dashboard.instances[action.payload.id];
      if (instance) {
        instance.props = {
          ...instance.props,
          ...action.payload.props,
        };
        instance.updatedAt = Date.now();
        state.dashboard.meta.updatedAt = Date.now();
      }
    },

    /**
     * Update widget position/size after drag/resize
     */
    moveResizeWidget: (
      state,
      action: PayloadAction<{
        id: string;
        x: number;
        y: number;
        w: number;
        h: number;
      }>
    ) => {
      const layoutItem = state.dashboard.layout.find(
        (item) => item.id === action.payload.id
      );
      if (layoutItem) {
        layoutItem.x = action.payload.x;
        layoutItem.y = action.payload.y;
        layoutItem.w = action.payload.w;
        layoutItem.h = action.payload.h;
        state.dashboard.meta.updatedAt = Date.now();
      }
    },

    /**
     * Remove a widget from the dashboard
     */
    removeWidget: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.dashboard.instances[id];
      state.dashboard.layout = state.dashboard.layout.filter(
        (item) => item.id !== id
      );

      state.dashboard.meta.updatedAt = Date.now();
    },

    /**
     * Replace entire layout (after drag/drop reordering)
     */
    setLayout: (state, action: PayloadAction<LayoutItem[]>) => {
      state.dashboard.layout = action.payload;
      state.dashboard.meta.updatedAt = Date.now();
    },

    /**
     * Import a complete dashboard
     * Used for loading from LocalStorage or importing from file
     */
    importDashboard: (state, action: PayloadAction<DashboardDoc>) => {
      state.dashboard = {
        ...action.payload,
        meta: {
          ...action.payload.meta,
          updatedAt: Date.now(),
        },
      };
    },

    /**
     * Reset to empty dashboard
     */
    resetDashboard: (state) => {
      state.dashboard = createEmptyDashboard();
    },

    /**
     * Update dashboard metadata
     */
    updateDashboardMeta: (
      state,
      action: PayloadAction<{
        name?: string;
        description?: string;
      }>
    ) => {
      if (action.payload.name !== undefined) {
        state.dashboard.name = action.payload.name;
      }
      if (action.payload.description !== undefined) {
        state.dashboard.description = action.payload.description;
      }
      state.dashboard.meta.updatedAt = Date.now();
    },

    /**
     * Duplicate a widget
     */
    duplicateWidget: (state, action: PayloadAction<string>) => {
      const sourceId = action.payload;
      const sourceInstance = state.dashboard.instances[sourceId];
      const sourceLayout = state.dashboard.layout.find(
        (item) => item.id === sourceId
      );

      if (!sourceInstance || !sourceLayout) return;

      const newId = crypto.randomUUID();
      const now = Date.now();

      const newInstance: WidgetInstance = {
        ...sourceInstance,
        id: newId,
        createdAt: now,
        updatedAt: now,
      };

      const newLayout: LayoutItem = {
        ...sourceLayout,
        id: newId,
        x: (sourceLayout.x + 1) % 12, // Shift one column
        y: sourceLayout.y + 1, // Shift one row
      };

      state.dashboard.instances[newId] = newInstance;
      state.dashboard.layout.push(newLayout);
      state.dashboard.meta.updatedAt = now;
    },

    /**
     * Lock/unlock widget position and size
     */
    toggleWidgetLock: (state, action: PayloadAction<string>) => {
      const layoutItem = state.dashboard.layout.find(
        (item) => item.id === action.payload
      );
      if (layoutItem) {
        layoutItem.locked = !layoutItem.locked;
        state.dashboard.meta.updatedAt = Date.now();
      }
    },
  },
});

export const {
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
} = coreSlice.actions;

export default coreSlice.reducer;

import type { RootState } from "../types";

export const selectDashboard = (state: RootState) =>
  state.core.present.dashboard;

export const selectAllWidgets = (state: RootState) =>
  state.core.present.dashboard.instances;

export const selectWidgetById = (id: string) => (state: RootState) =>
  state.core.present.dashboard.instances[id];

export const selectLayout = (state: RootState) =>
  state.core.present.dashboard.layout;

export const selectLayoutItemById = (id: string) => (state: RootState) =>
  state.core.present.dashboard.layout.find((item) => item.id === id);
