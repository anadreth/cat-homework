/**
 * Canvas - Grid canvas with Redux integration
 *
 * This component bridges Gridstack and Redux:
 * - Syncs Gridstack state to Redux
 * - Syncs Redux state to Gridstack
 * - Handles widget lifecycle (add/remove/update)
 */

import { useEffect, useMemo, useCallback } from "react";
import type { GridStackOptions, GridStackWidget } from "gridstack";
import {
  GridStackProvider,
  GridStackRenderProvider,
  GridStackRender,
  useGridStackContext,
} from "@/components/Canvas/blocks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectLayout,
  selectAllWidgets,
  moveResizeWidget,
  addWidget,
} from "@/store";
import { selectWidget } from "@/store/slices/selectionSlice";
import {
  WIDGET_COMPONENT_MAP,
  getWidgetDefaultProps,
  getWidgetMeta,
} from "@/constants/widget-registry";
import type { ComponentDataType } from "@/components/Canvas/blocks";
import { GRID_COLUMNS, CELL_HEIGHT, VERTICAL_MARGIN } from "@/constants/grid";
import { WidgetWrapper } from "@/components/WidgetWrapper";
import type { WidgetType } from "@/store/types";

/**
 * Grid options for canvas
 */
const GRID_OPTIONS: GridStackOptions = {
  column: GRID_COLUMNS,
  cellHeight: CELL_HEIGHT,
  margin: VERTICAL_MARGIN,
  float: true,
  removable: false,
  acceptWidgets: ".palette-item", // Accept items with this class
  animate: true, // Disable animation for instant feedback
  minRow: 1,
  maxRow: 0, // Infinite height
  resizable: {
    handles: "e, se, s, sw, w",
  },
  children: [], // Will be populated from Redux
};

/**
 * Canvas content - connects Gridstack to Redux
 */
function CanvasContent() {
  const dispatch = useAppDispatch();
  const {
    gridStack,
    removeWidget: removeWidgetFromGrid,
    addWidget: addWidgetToGrid,
  } = useGridStackContext();

  const layout = useAppSelector(selectLayout);
  const widgets = useAppSelector(selectAllWidgets);

  /**
   * Convert Redux layout to Gridstack widgets
   */
  const gridstackWidgets = useMemo(() => {
    return layout.map((layoutItem): GridStackWidget => {
      const widget = widgets[layoutItem.id];
      const widgetType = widget?.type || "text";

      const props =
        widget?.props || (widget ? getWidgetDefaultProps(widget.type) : {});

      return {
        id: layoutItem.id,
        x: layoutItem.x,
        y: layoutItem.y,
        w: layoutItem.w,
        h: layoutItem.h,
        minW: layoutItem.minW,
        minH: layoutItem.minH,
        maxW: layoutItem.maxW,
        maxH: layoutItem.maxH,
        locked: layoutItem.locked,
        noResize: layoutItem.noResize,
        noMove: layoutItem.noMove,
        content: JSON.stringify({
          name: widgetType,
          props,
        } satisfies ComponentDataType),
      };
    });
  }, [layout, widgets]);

  /**
   * Sync Gridstack changes back to Redux
   */
  const handleGridChange = useCallback(() => {
    if (!gridStack) return;

    const currentState = gridStack.save(true);

    if (!Array.isArray(currentState)) {
      console.error("[Canvas] Failed to save grid state - not an array");
      return;
    }

    currentState.forEach((item: GridStackWidget) => {
      if (!item.id) return;

      dispatch(
        moveResizeWidget({
          id: String(item.id),
          x: item.x ?? 0,
          y: item.y ?? 0,
          w: item.w ?? 1,
          h: item.h ?? 1,
        })
      );
    });
  }, [gridStack, dispatch]);

  /**
   * Set up drag/resize listeners
   * Note: "change" event doesn't fire reliably (Gridstack issue #2671)
   * We use dragstop/resizestop instead for reliable position updates
   */
  useEffect(() => {
    if (!gridStack) {
      return;
    }

    gridStack.on("dragstop", handleGridChange);
    gridStack.on("resizestop", handleGridChange);

    return () => {
      gridStack.off("dragstop");
      gridStack.off("resizestop");
    };
  }, [gridStack, handleGridChange]);

  /**
   * Handle external widget drops from palette
   */
  useEffect(() => {
    if (!gridStack) {
      return;
    }

    const handleDrop = (
      _event: Event,
      _previousWidget: GridStackWidget,
      newWidget: GridStackWidget & { el?: HTMLElement }
    ) => {
      // Get widget type from the dropped element
      const el = newWidget.el;
      const widgetType = el?.getAttribute("data-widget-type") as WidgetType;

      if (!widgetType) {
        console.error("[Canvas] No widget type found on dropped element");
        return;
      }

      // Get widget metadata and create widget with defaults
      const meta = getWidgetMeta(widgetType);
      const props = getWidgetDefaultProps(widgetType);

      // Create widget in Redux with the dropped position
      const action = dispatch(
        addWidget({
          type: widgetType,
          layout: {
            x: newWidget.x ?? 0,
            y: newWidget.y ?? 0,
            w: meta.defaultSize.w,
            h: meta.defaultSize.h,
          },
          props,
        })
      );

      // Auto-select the newly created widget
      const newWidgetId = action.meta.id;
      dispatch(selectWidget(newWidgetId));

      // Remove the temporary element
      setTimeout(() => {
        if (el && el.parentElement) {
          el.remove();
        }
      }, 0);
    };

    gridStack.on("dropped", handleDrop);

    return () => {
      console.log("[Canvas] Cleaning up drop handler");
      gridStack.off("dropped");
    };
  }, [gridStack, dispatch]);

  /**
   * Sync widgets to grid when Redux state changes
   */
  useEffect(() => {
    if (!gridStack) return;

    const currentItems = gridStack.getGridItems();
    const currentIds = new Set(
      currentItems.map((el) => el.getAttribute("gs-id")).filter(Boolean)
    );

    const layoutIds = new Set(layout.map((item) => item.id));

    currentIds.forEach((id) => {
      if (!layoutIds.has(id!)) {
        removeWidgetFromGrid(id!);
      }
    });

    gridstackWidgets.forEach((widget) => {
      if (!currentIds.has(widget.id!)) {
        addWidgetToGrid(widget as GridStackWidget & { id: string });
      } else {
        const element = currentItems.find(
          (el) => el.getAttribute("gs-id") === widget.id
        );
        if (element) {
          gridStack.update(element, widget);
        }
      }
    });
  }, [
    gridStack,
    layout,
    gridstackWidgets,
    removeWidgetFromGrid,
    addWidgetToGrid,
  ]);

  return (
    <div className="relative h-full w-full">
      <GridStackRenderProvider>
        <GridStackRender
          componentMap={WIDGET_COMPONENT_MAP}
          wrapperComponent={WidgetWrapper}
        />
      </GridStackRenderProvider>

      {layout.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="text-lg font-medium">Empty Canvas</p>
            <p className="mt-2 text-sm">Drag widgets from the palette</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 *  Canvas - Main component
 */
export function Canvas() {
  const layout = useAppSelector(selectLayout);
  const widgets = useAppSelector(selectAllWidgets);

  const initialOptions = useMemo((): GridStackOptions => {
    return {
      ...GRID_OPTIONS,
      children: layout.map((layoutItem): GridStackWidget => {
        const widget = widgets[layoutItem.id];
        const widgetType = widget?.type || "text";

        const props =
          widget?.props || (widget ? getWidgetDefaultProps(widget.type) : {});

        return {
          id: layoutItem.id,
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
          minW: layoutItem.minW,
          minH: layoutItem.minH,
          maxW: layoutItem.maxW,
          maxH: layoutItem.maxH,
          locked: layoutItem.locked,
          noResize: layoutItem.noResize,
          noMove: layoutItem.noMove,
          content: JSON.stringify({
            name: widgetType,
            props,
          } satisfies ComponentDataType),
        };
      }),
    };
  }, []);

  return (
    <div
      className="canvas relative h-full w-full overflow-auto bg-gray-50 p-4"
      style={{ minHeight: "100%" }}
    >
      <GridStackProvider initialOptions={initialOptions}>
        <CanvasContent />
      </GridStackProvider>
    </div>
  );
}
