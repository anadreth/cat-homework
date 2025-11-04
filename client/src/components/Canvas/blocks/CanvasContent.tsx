import { selectLayout } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { type GridStackWidget, GridStack } from "gridstack";
import { useRef, useCallback, useLayoutEffect } from "react";
import { useGridStackEvents } from "../hooks/useGridStackEvents";
import { useGridStackInit } from "../hooks/useGridStackInit";
import { GridStackRender } from "./GridStackRender";

export function CanvasContent() {
  const layout = useAppSelector(selectLayout);
  const widgetContainersRef = useRef<Map<string, HTMLElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  const renderCBFn = useCallback(
    (element: HTMLElement, widget: GridStackWidget & { grid?: GridStack }) => {
      if (widget.id && widget.grid) {
        widgetContainersRef.current.set(widget.id, element);
      }
    },
    []
  );

  useLayoutEffect(() => {
    GridStack.renderCB = renderCBFn;
  }, [renderCBFn]);

  const { gridStack } = useGridStackInit({
    containerRef,
  });

  useGridStackEvents({ gridStack });

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="grid-stack min-h-[calc(100vh-8rem)] min-w-full relative"
      >
        {gridStack && (
          <GridStackRender
            getWidgetContainer={(widgetId: string) => {
              return widgetContainersRef.current.get(widgetId) || null;
            }}
          />
        )}
      </div>

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
