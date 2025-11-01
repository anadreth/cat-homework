/**
 * Palette - Draggable widget sidebar
 *
 * Provides draggable widget items that can be dropped onto the canvas.
 * Uses Gridstack external drag-and-drop functionality.
 */

import { useEffect, useRef } from "react";
import { GridStack } from "gridstack";
import { WIDGET_REGISTRY } from "@/constants/widget-registry";
import type { WidgetType } from "@/store/types";
import {
  RiBarChartBoxLine,
  RiTableLine,
  RiListUnordered,
  RiText,
} from "@remixicon/react";

/**
 * Icon map for widget types
 */
const WIDGET_ICONS: Record<WidgetType, typeof RiBarChartBoxLine> = {
  chart: RiBarChartBoxLine,
  table: RiTableLine,
  list: RiListUnordered,
  text: RiText,
};

/**
 * Color map for widget types
 */
const WIDGET_COLORS: Record<WidgetType, string> = {
  chart: "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200",
  table: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200",
  list: "bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200",
  text: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200",
};

/**
 * Palette component
 */
export function Palette() {
  const paletteRef = useRef<HTMLDivElement>(null);

  /**
   * Initialize Gridstack draggable on palette items
   */
  useEffect(() => {
    if (!paletteRef.current) return;

    const items = Array.from(
      paletteRef.current.querySelectorAll(".palette-item")
    ) as HTMLElement[];

    GridStack.setupDragIn(items, {
      appendTo: "body",
      helper: "clone",
    });
  }, []);

  const widgetTypes = Object.keys(WIDGET_REGISTRY) as WidgetType[];

  return (
    <div ref={paletteRef} className="flex h-full flex-col">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Widget Palette</h2>
        <p className="mt-1 text-xs text-gray-500">
          Drag widgets onto the canvas
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {widgetTypes.map((type) => {
          const meta = WIDGET_REGISTRY[type];
          const Icon = WIDGET_ICONS[type];
          const colorClass = WIDGET_COLORS[type];

          return (
            <div
              key={type}
              className={`palette-item cursor-move rounded border-2 p-3 transition-all ${colorClass}`}
              data-gs-width={meta.defaultSize.w}
              data-gs-height={meta.defaultSize.h}
              data-widget-type={type}
            >
              <div className="flex items-start gap-2">
                <Icon size={20} className="mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{meta.name}</div>
                  <div className="mt-0.5 text-xs opacity-75">
                    {meta.description}
                  </div>
                  <div className="mt-1 text-xs font-mono opacity-60">
                    {meta.defaultSize.w}×{meta.defaultSize.h}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded border border-gray-200 bg-gray-50 p-3">
        <div className="text-xs text-gray-600">
          <strong>Tip:</strong> Drag any widget to the canvas to add it to your
          dashboard.
        </div>
      </div>
    </div>
  );
}
