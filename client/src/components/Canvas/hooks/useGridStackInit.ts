/**
 * useGridStackInit Hook
 *
 * Handles GridStack initialization and registration with the global registry.
 * This hook replaces the complex initialization logic in GridStackRenderProvider.
 */

import { useCallback, useLayoutEffect, useRef } from "react";
import { GridStack, type GridStackOptions, type GridStackWidget } from "gridstack";
import { gridStackRegistry } from "../utils/gridStackRegistry";

interface UseGridStackInitProps {
  options: GridStackOptions;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onGridStackCreated?: (gridStack: GridStack) => void;
}

export function useGridStackInit({
  options,
  containerRef,
  onGridStackCreated,
}: UseGridStackInitProps) {
  const gridStackRef = useRef<GridStack | null>(null);
  const optionsRef = useRef<GridStackOptions>(options);

  // Initialize GridStack
  const initGridStack = useCallback(() => {
    if (!containerRef.current) return null;

    try {
      const gridStack = GridStack.init(optionsRef.current, containerRef.current);

      // Register with global registry for middleware access
      gridStackRegistry.register(gridStack);

      // Store ref
      gridStackRef.current = gridStack;

      // Notify parent
      onGridStackCreated?.(gridStack);

      return gridStack;
    } catch (error) {
      console.error("Error initializing GridStack:", error);
      return null;
    }
  }, [containerRef, onGridStackCreated]);

  // Initialize on mount
  useLayoutEffect(() => {
    if (!gridStackRef.current) {
      initGridStack();
    }

    // Cleanup on unmount
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

/**
 * Custom render callback for GridStack
 * This is set globally and creates container elements for React portals
 */
export function setupGridStackRenderCallback(
  onElementCreated: (element: HTMLElement, widget: GridStackWidget & { grid?: GridStack }) => void
) {
  GridStack.renderCB = (element: HTMLElement, widget: GridStackWidget & { grid?: GridStack }) => {
    onElementCreated(element, widget);
  };
}
