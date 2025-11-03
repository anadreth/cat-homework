import { useEffect, useCallback } from "react";
import type { GridStack } from "gridstack";
import { useAppDispatch } from "@/store/hooks";
import { moveResizeWidget, addWidget, selectWidget } from "@/store";
import { extractLayoutFromElement } from "../utils/gridStackHelpers";
import { getWidgetMeta, getWidgetDefaultProps } from "@/lib/utils/widgets";
import type { WidgetType } from "@/store/types";

interface UseGridStackEventsProps {
  gridStack: GridStack | null;
}

export function useGridStackEvents({ gridStack }: UseGridStackEventsProps) {
  const dispatch = useAppDispatch();

  /**
   * Handle drag/resize stop events
   * Updates Redux with new position/size
   */
  const handleGridChange = useCallback(
    (event: Event) => {
      const target = event.target as HTMLElement;
      const widgetId = target.getAttribute("gs-id");

      if (!widgetId) return;

      const layout = extractLayoutFromElement(target as any);

      if (
        layout.x !== undefined &&
        layout.y !== undefined &&
        layout.w !== undefined &&
        layout.h !== undefined
      ) {
        dispatch(
          moveResizeWidget({
            id: widgetId,
            x: layout.x,
            y: layout.y,
            w: layout.w,
            h: layout.h,
          })
        );
      }
    },
    [dispatch]
  );

  /**
   * Handle widget drop from palette
   * Creates new widget in Redux
   */
  const handleDrop = useCallback(
    (_event: Event, _previousWidget: any, newWidget: any) => {
      // Extract widget type from the dragged element's data
      const widgetType = newWidget.el?.getAttribute(
        "data-widget-type"
      ) as WidgetType;

      if (!widgetType) {
        console.error("Widget type not found on dropped element");
        return;
      }

      const meta = getWidgetMeta(widgetType);
      const props = getWidgetDefaultProps(widgetType);

      // Dispatch addWidget action - middleware will handle adding to GridStack
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

      // Remove the temporary dragged element from the palette

      if (newWidget.el && newWidget.el.parentElement) {
        newWidget.el.remove();
      }
    },
    [dispatch]
  );

  /**
   * Attach event listeners to GridStack
   */
  useEffect(() => {
    if (!gridStack) return;

    // Listen to drag/resize stop events
    gridStack.on("dragstop", handleGridChange );
    gridStack.on("resizestop", handleGridChange);

    // Listen to drop events (from palette)
    gridStack.on("dropped", handleDrop);

    // Cleanup
    return () => {
      gridStack.off("dragstop");
      gridStack.off("resizestop");
      gridStack.off("dropped");
    };
  }, [gridStack, handleGridChange, handleDrop]);
}
