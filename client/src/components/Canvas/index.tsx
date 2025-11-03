import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import {
  GridStack,
  type GridStackOptions,
  type GridStackWidget,
} from "gridstack";
import { GridStackRender } from "@/components/Canvas/blocks";
import { useAppSelector } from "@/store/hooks";
import { selectLayout, selectAllWidgets } from "@/store";
import { WIDGET_COMPONENT_MAP } from "@/constants/widget-registry";
import { GRID_OPTIONS } from "@/constants/grid";
import { WidgetWrapper } from "@/components/WidgetWrapper";
import { CanvasToolbar } from "@/components/CanvasToolbar";
import { useGridStackEvents } from "./hooks/useGridStackEvents";
import { convertToGridStackWidgets } from "./utils/gridStackHelpers";
import { useGridStackInit } from "./hooks/useGridStackInit";

function CanvasContent({ options }: { options: GridStackOptions }) {
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
    options,
    containerRef,
  });

  useGridStackEvents({ gridStack });

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="grid-stack min-h-[calc(100vh-8rem)] min-w-full relative"
      >
        {gridStack ? (
          <GridStackRender
            componentMap={WIDGET_COMPONENT_MAP}
            wrapperComponent={WidgetWrapper}
            getWidgetContainer={(widgetId: string) => {
              return widgetContainersRef.current.get(widgetId) || null;
            }}
          />
        ) : null}
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

export function Canvas() {
  const layout = useAppSelector(selectLayout);
  const widgets = useAppSelector(selectAllWidgets);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Reset scroll position when canvas is cleared
  useEffect(() => {
    if (layout.length === 0 && canvasRef.current) {
      canvasRef.current.scrollTop = 0;
      canvasRef.current.scrollLeft = 0;
    }
  }, [layout.length]);

  // Create GridStack options with initial widgets from Redux
  // Note: This is only used for initial setup - all updates go through middleware
  const options = useMemo((): GridStackOptions => {
    return {
      ...GRID_OPTIONS,
      children: convertToGridStackWidgets(layout, widgets),
    };
  }, [layout, widgets]);

  return (
    <div className="canvas relative h-full w-full overflow-hidden bg-gray-50">
      <CanvasToolbar />

      <div
        ref={canvasRef}
        className="h-full w-full overflow-x-auto overflow-y-auto p-4"
        style={{ minHeight: "calc(100% - 57px)" }}
      >
        <div
          className="mx-auto"
          style={{
            minWidth: "480px",
            maxWidth: "1440px",
          }}
        >
          <CanvasContent options={options} />
        </div>
      </div>
    </div>
  );
}
