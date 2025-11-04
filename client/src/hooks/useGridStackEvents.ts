import { useEffect, useCallback } from "react";
import type { GridStack, GridStackNode } from "gridstack";
import { useAppDispatch } from "@/store/hooks";
import { moveResizeWidget, addWidget, selectWidget } from "@/store";
import { getWidgetMeta, getWidgetDefaultProps } from "@/lib/utils/widgets";
import { extractLayoutFromElement } from "@/lib/utils/gridstack";
import type { WidgetType } from "@/constants/widget-registry";

interface UseGridStackEventsProps {
  gridStack: GridStack | null;
}

export function useGridStackEvents({ gridStack }: UseGridStackEventsProps) {
  const dispatch = useAppDispatch();

  const handleGridChange = useCallback(
    (event: Event) => {
      const target = event.target as HTMLElement;
      const widgetId = target.getAttribute("gs-id");

      if (!widgetId) return;

      const layout = extractLayoutFromElement(target);

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

  const handleDrop = useCallback(
    (
      _event: Event,
      _previousWidget: GridStackNode,
      newWidget: GridStackNode
    ) => {
      const widgetType = newWidget.el?.getAttribute(
        "data-widget-type"
      ) as WidgetType;

      if (!widgetType) {
        console.error("Widget type not found on dropped element");
        return;
      }

      const meta = getWidgetMeta(widgetType);
      const props = getWidgetDefaultProps(widgetType);

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

      const newWidgetId = action.meta.id;
      dispatch(selectWidget(newWidgetId));

      if (newWidget.el && newWidget.el.parentElement) {
        newWidget.el.remove();
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (!gridStack) return;

    gridStack.on("dragstop", handleGridChange);
    gridStack.on("resizestop", handleGridChange);
    gridStack.on("dropped", handleDrop);

    return () => {
      gridStack.off("dragstop");
      gridStack.off("resizestop");
      gridStack.off("dropped");
    };
  }, [gridStack, handleGridChange, handleDrop]);
}
