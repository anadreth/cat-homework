/**
 * GridStack Helper Utilities
 *
 * Pure functions for working with GridStack and converting between
 * Redux state and GridStack widget format.
 */

import type { GridStackWidget, GridItemHTMLElement } from "gridstack";
import type { LayoutItem, WidgetInstance } from "@/store/types";

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
      console.warn(`Widget instance not found for layout item: ${layoutItem.id}`);
      return createGridStackWidget(layoutItem.id, layoutItem, "unknown");
    }
    return createGridStackWidget(widget.id, layoutItem, widget.type);
  });
}

/**
 * Find a GridStack element by widget ID
 */
export function findGridStackElement(widgetId: string): GridItemHTMLElement | null {
  return document.body.querySelector<GridItemHTMLElement>(`[gs-id="${widgetId}"]`);
}

/**
 * Extract layout data from GridStack element
 */
export function extractLayoutFromElement(element: GridItemHTMLElement): Partial<LayoutItem> {
  const gsNode = element.gridstackNode;
  if (!gsNode) return {};

  return {
    x: gsNode.x ?? 0,
    y: gsNode.y ?? 0,
    w: gsNode.w ?? 1,
    h: gsNode.h ?? 1,
  };
}
