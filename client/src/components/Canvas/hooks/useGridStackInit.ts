import { useCallback, useLayoutEffect, useRef } from "react";
import { GridStack, type GridStackOptions } from "gridstack";
import { gridStackRegistry } from "../registry/gridStackRegistry";
import { DEFAULT_GRID_OPTIONS } from "@/constants/grid";

interface UseGridStackInitProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onGridStackCreated?: (gridStack: GridStack) => void;
}

export function useGridStackInit({
  containerRef,
  onGridStackCreated,
}: UseGridStackInitProps) {
  const gridStackRef = useRef<GridStack | null>(null);
  const optionsRef = useRef<GridStackOptions>(DEFAULT_GRID_OPTIONS);

  const initGridStack = useCallback(() => {
    if (!containerRef.current) return null;

    try {
      const gridStack = GridStack.init(
        optionsRef.current,
        containerRef.current
      );

      gridStackRegistry.register(gridStack);
      gridStackRef.current = gridStack;
      onGridStackCreated?.(gridStack);

      return gridStack;
    } catch (error) {
      console.error("Error initializing GridStack:", error);
      return null;
    }
  }, [containerRef, onGridStackCreated]);

  useLayoutEffect(() => {
    if (!gridStackRef.current) {
      initGridStack();
    }

    return () => {
      if (gridStackRef.current) {
        try {
          gridStackRef.current.destroy(false);
          gridStackRegistry.unregister();
          gridStackRef.current = null;
        } catch (error) {
          console.error("Error destroying GridStack:", error);
        }
      }
    };
  }, [initGridStack]);

  return {
    gridStack: gridStackRef.current,
    reinitialize: initGridStack,
  };
}
