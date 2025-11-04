/**
 * GridStack Helper Utilities
 *
 * Pure functions for working with GridStack and converting between
 * Redux state and GridStack widget format.
 */

import type {
  GridStackWidget,
  GridItemHTMLElement,
  GridStack,
} from "gridstack";
import type { LayoutItem, RootState, WidgetInstance } from "@/store/types";
import { gridStackRegistry } from "@/components/Canvas/registry/gridStackRegistry";

/**
 * Create a GridStackWidget from Redux state
 * Note: We don't include widget props in the content anymore
 * Widgets read props directly from Redux via selectors
 */
export function createGridStackWidget(
  widgetId: string,
  layoutItem: LayoutItem,
  widgetType: string
): GridStackWidget {
  return {
    id: widgetId,
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
    // Content is now minimal - just widget type for identification
    // Widget components read actual props from Redux
    content: JSON.stringify({ name: widgetType, props: {} }),
  };
}

/**
 * Convert Redux layout + instances to GridStackWidget array
 * Used for initial GridStack options
 */
export function convertToGridStackWidgets(
  layout: LayoutItem[],
  instances: Record<string, WidgetInstance>
): GridStackWidget[] {
  return layout.map((layoutItem) => {
    const widget = instances[layoutItem.id];
    if (!widget) {
      console.warn(
        `Widget instance not found for layout item: ${layoutItem.id}`
      );
      return createGridStackWidget(layoutItem.id, layoutItem, "unknown");
    }
    return createGridStackWidget(widget.id, layoutItem, widget.type);
  });
}

/**
 * Find a GridStack element by widget ID
 */
export function findGridStackElement(
  widgetId: string
): GridItemHTMLElement | null {
  return document.body.querySelector<GridItemHTMLElement>(
    `[gs-id="${widgetId}"]`
  );
}

/**
 * Extract layout data from GridStack element
 */
export function extractLayoutFromElement(
  element: GridItemHTMLElement
): Partial<LayoutItem> {
  const gsNode = element.gridstackNode;
  if (!gsNode) return {};

  return {
    x: gsNode.x ?? 0,
    y: gsNode.y ?? 0,
    w: gsNode.w ?? 1,
    h: gsNode.h ?? 1,
  };
}

/**
 * Get GridStack instance from registry
 * Returns null if no instance is registered
 */
export function getGridStack(): GridStack | null {
  return gridStackRegistry.getInstance();
}

/**
 * Extract dashboard layout and instances from Redux state
 * Convenience function to avoid repetitive state access
 */
export function getDashboardState(state: RootState) {
  return {
    layout: state.core.present.dashboard.layout,
    instances: state.core.present.dashboard.instances,
  };
}

/**
 * Add a single widget to GridStack from Redux state data
 *
 * @param gridStack - GridStack instance
 * @param layoutItem - Layout configuration for the widget
 * @param instance - Widget instance data from Redux
 */
export function addWidgetToGrid(
  gridStack: GridStack,
  layoutItem: LayoutItem,
  instance: WidgetInstance
): void {
  const gridStackWidget = createGridStackWidget(
    instance.id,
    layoutItem,
    instance.type
  );
  gridStack.addWidget(gridStackWidget);
}

/**
 * Remove a widget from GridStack by ID
 *
 * @param gridStack - GridStack instance
 * @param widgetId - ID of widget to remove
 */
export function removeWidgetFromGrid(
  gridStack: GridStack,
  widgetId: string
): void {
  const element = findGridStackElement(widgetId);
  if (element) {
    gridStack.removeWidget(element);

    //gridstack bug when removing elements - gridstack.removeWidget does not remove element from dom
    const selectors = [
      `[gs-id="${widgetId}"]`,
      `[data-widget-id="${widgetId}"]`,
      `.grid-stack-item[gs-id="${widgetId}"]`,
    ];

    selectors.forEach((selector) => {
      const orphanedElements = document.querySelectorAll(selector);
      if (orphanedElements.length > 0) {
        console.warn(
          `Found ${orphanedElements.length} orphaned elements for widget ${widgetId}`
        );
        orphanedElements.forEach((el) => el.remove());
      }
    });
  }
}

/**
 * Update widget layout properties in GridStack
 *
 * @param gridStack - GridStack instance
 * @param widgetId - ID of widget to update
 * @param layout - New layout properties
 */
export function updateWidgetLayout(
  gridStack: GridStack,
  widgetId: string,
  layout: { x: number; y: number; w: number; h: number; locked?: boolean }
): void {
  const element = findGridStackElement(widgetId);
  if (element) {
    gridStack.update(element, layout);
  }
}

/**
 * Reconcile GridStack with Redux state
 *
 * This is the core synchronization logic used for UNDO/REDO operations.
 * It ensures GridStack matches Redux by:
 * 1. Removing widgets that exist in GridStack but not in Redux
 * 2. Adding widgets that exist in Redux but not in GridStack
 * 3. Updating existing widgets to match Redux layout state
 *
 * @param gridStack - GridStack instance
 * @param layout - Target layout from Redux
 * @param instances - Target widget instances from Redux
 */
export function reconcileGridStackWithRedux(
  gridStack: GridStack,
  layout: LayoutItem[],
  instances: Record<string, WidgetInstance>
): void {
  // Get current GridStack widget IDs
  const currentWidgets = gridStack.getGridItems();
  const currentIds = new Set(
    currentWidgets
      .map((el) => el.getAttribute("gs-id"))
      .filter((id): id is string => id !== null)
  );

  // Get target widget IDs from Redux
  const targetIds = new Set(layout.map((item) => item.id));

  // Remove widgets that shouldn't exist
  currentIds.forEach((id) => {
    if (!targetIds.has(id)) {
      removeWidgetFromGrid(gridStack, id);
    }
  });

  // Add or update widgets to match Redux state
  layout.forEach((layoutItem) => {
    if (!currentIds.has(layoutItem.id)) {
      // Widget doesn't exist in GridStack - add it
      const instance = instances[layoutItem.id];
      if (instance) {
        addWidgetToGrid(gridStack, layoutItem, instance);
      }
    } else {
      // Widget exists - update its layout to match Redux
      updateWidgetLayout(gridStack, layoutItem.id, {
        x: layoutItem.x,
        y: layoutItem.y,
        w: layoutItem.w,
        h: layoutItem.h,
        locked: layoutItem.locked,
      });
    }
  });
}

/**
 * Rebuild entire GridStack from scratch using Redux state
 *
 * Used for import/reset operations where we want to completely
 * replace GridStack contents with Redux state.
 *
 * @param gridStack - GridStack instance
 * @param layout - Layout array from Redux
 * @param instances - Widget instances from Redux
 */
export function rebuildGridStackFromRedux(
  gridStack: GridStack,
  layout: LayoutItem[],
  instances: Record<string, WidgetInstance>
): void {
  // Clear all existing widgets
  gridStack.removeAll(false);

  // Add all widgets from Redux state
  layout.forEach((layoutItem) => {
    const instance = instances[layoutItem.id];
    if (instance) {
      addWidgetToGrid(gridStack, layoutItem, instance);
    }
  });
}
