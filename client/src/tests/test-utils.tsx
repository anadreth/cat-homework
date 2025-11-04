import type { PropsWithChildren, ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import {
  configureStore,
  type Reducer,
  type UnknownAction,
} from "@reduxjs/toolkit";
import undoable, { excludeAction, type StateWithHistory } from "redux-undo";
import coreReducer from "@/store/slices/coreSlice";
import selectionReducer from "@/store/slices/selectionSlice";
import uiReducer from "@/store/slices/uiSlice";
import authReducer from "@/store/slices/authSlice";
import { autosaveMiddleware } from "@/store/middleware/autosave";
import { authListenerMiddleware } from "@/store/middleware/authListener";
import type {
  DashboardDoc,
  RootState,
  CoreState,
  SelectionState,
  UIState,
  AuthState,
  WidgetType,
  LayoutItem,
  SerializableValue,
} from "@/store/types";

export function setupStore(preloadedState?: Partial<RootState>) {
  const undoableCore = undoable(coreReducer, {
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

  // Redux v5 uses 3-generic Reducer type: Reducer<State, Action, PreloadedState>
  // The third generic must be the expanded StateWithHistory structure with '| undefined'
  type CoreReducerType = Reducer<
    StateWithHistory<CoreState>,
    UnknownAction,
    { past: CoreState[]; present: CoreState; future: CoreState[] } | undefined
  >;
  type SelectionReducerType = Reducer<
    SelectionState,
    UnknownAction,
    SelectionState | undefined
  >;
  type UIReducerType = Reducer<UIState, UnknownAction, UIState | undefined>;
  type AuthReducerType = Reducer<
    AuthState,
    UnknownAction,
    AuthState | undefined
  >;

  return configureStore({
    reducer: {
      core: undoableCore as CoreReducerType,
      selection: selectionReducer as SelectionReducerType,
      ui: uiReducer as UIReducerType,
      auth: authReducer as AuthReducerType,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredPaths: ["core.present.dashboard.meta"],
        },
      })
        .prepend(autosaveMiddleware.middleware)
        .prepend(authListenerMiddleware.middleware),
  });
}

export type AppStore = ReturnType<typeof setupStore>;

interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>;
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

export const mockWidgetData = {
  chart: {
    type: "chart" as const,
    props: {
      data: [
        { month: "Jan", sales: 100 },
        { month: "Feb", sales: 150 },
      ],
      index: "month",
      categories: ["sales"],
    },
  },
  table: {
    type: "table" as const,
    props: {
      data: [
        { id: 1, name: "Item 1", value: 100 },
        { id: 2, name: "Item 2", value: 200 },
      ],
      columns: [
        { key: "name", header: "Name" },
        { key: "value", header: "Value" },
      ],
      idKey: "id",
    },
  },
  list: {
    type: "list" as const,
    props: {
      title: "Test List",
      items: [
        { id: "1", label: "Item 1", description: "Description 1" },
        { id: "2", label: "Item 2", description: "Description 2" },
      ],
    },
  },
  text: {
    type: "text" as const,
    props: {
      title: "Test Title",
      content: "Test content",
    },
  },
};

export function createMockDashboard(): DashboardDoc {
  const now = Date.now();
  return {
    version: 1,
    id: crypto.randomUUID(),
    name: "Test Dashboard",
    instances: {
      "widget-1": {
        id: "widget-1",
        ...mockWidgetData.chart,
        createdAt: now,
        updatedAt: now,
      },
      "widget-2": {
        id: "widget-2",
        ...mockWidgetData.table,
        createdAt: now,
        updatedAt: now,
      },
    },
    layout: [
      {
        id: "widget-1",
        x: 0,
        y: 0,
        w: 6,
        h: 4,
        minW: 2,
        minH: 2,
      },
      {
        id: "widget-2",
        x: 6,
        y: 0,
        w: 6,
        h: 4,
        minW: 2,
        minH: 2,
      },
    ],
    meta: {
      createdAt: now,
      updatedAt: now,
    },
  };
}

/**
 * Creates a preloaded state with a single widget for testing component rendering
 * Useful for component tests that need to render widgets from store state
 *
 * @example
 * const preloadedState = createWidgetTestState('test-chart', 'chart', {
 *   data: [{ date: 'Jan', revenue: 100 }],
 *   index: 'date',
 *   categories: ['revenue']
 * });
 */
export function createWidgetTestState(
  widgetId: string,
  widgetType: WidgetType,
  widgetProps: Record<string, SerializableValue>,
  layoutOptions: Partial<
    Pick<LayoutItem, "x" | "y" | "w" | "h" | "minW" | "minH">
  > = {}
): Partial<RootState> {
  const now = Date.now();
  const defaultLayout = {
    x: 0,
    y: 0,
    w: 6,
    h: 4,
    minW: 2,
    minH: 2,
  };

  return {
    core: {
      past: [],
      present: {
        dashboard: {
          version: 1,
          id: "test-dashboard",
          name: "Test Dashboard",
          instances: {
            [widgetId]: {
              id: widgetId,
              type: widgetType,
              props: widgetProps,
              createdAt: now,
              updatedAt: now,
            },
          },
          layout: [
            {
              id: widgetId,
              ...defaultLayout,
              ...layoutOptions,
            },
          ],
          meta: {
            createdAt: now,
            updatedAt: now,
          },
        },
      },
      future: [],
    },
  };
}

export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export { default as userEvent } from "@testing-library/user-event";
