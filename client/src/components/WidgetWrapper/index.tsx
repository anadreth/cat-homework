/**
 * WidgetWrapper - Wraps all widgets with header, toolbar, and selection
 *
 * Features:
 * - Header with widget type name
 * - Delete button in toolbar
 * - Click header to select widget
 * - Double-click widget content to select and open inspector
 * - Visual highlight when selected
 */

import { type ReactNode, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeWidget } from "@/store";
import { selectWidget, selectIsSelected } from "@/store/slices/selectionSlice";
import { toggleInspector, selectInspectorOpen } from "@/store/slices/uiSlice";
import { RiDeleteBin6Line } from "@remixicon/react";

export interface WidgetWrapperProps {
  widgetId: string;
  widgetType: string;
  children: ReactNode;
}

export function WidgetWrapper({
  widgetId,
  widgetType,
  children,
}: WidgetWrapperProps) {
  const dispatch = useAppDispatch();
  const isSelected = useAppSelector(selectIsSelected(widgetId));
  const inspectorOpen = useAppSelector(selectInspectorOpen);
  const [lastTap, setLastTap] = useState<number>(0);

  const [lastHeaderTap, setLastHeaderTap] = useState<number>(0);

  const handleHeaderClick = () => {
    dispatch(selectWidget(widgetId));
  };

  /**
   * Handle double-click on header (desktop)
   */
  const handleHeaderDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectAndInspect();
  };

  /**
   * Handle touch for mobile double-tap detection on header
   */
  const handleHeaderTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastHeaderTap;

    // Double-tap detected (within 300ms)
    if (timeSinceLastTap < 300) {
      e.stopPropagation();
      selectAndInspect();
      // Reset to prevent triple-tap from triggering
      setLastHeaderTap(0);
    } else {
      // First tap - record it and select widget
      setLastHeaderTap(now);
      dispatch(selectWidget(widgetId));
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger selection when deleting
    dispatch(removeWidget(widgetId));
  };

  /**
   * Select widget and open inspector
   */
  const selectAndInspect = () => {
    dispatch(selectWidget(widgetId));
    // Open inspector if not already open
    if (!inspectorOpen) {
      dispatch(toggleInspector());
    }
  };

  /**
   * Handle double-click on widget content (desktop)
   */
  const handleContentDoubleClick = (e: React.MouseEvent) => {
    // Don't interfere with text selection or other interactions
    e.stopPropagation();
    selectAndInspect();
  };

  /**
   * Handle touch for mobile double-tap detection on widget content
   */
  const handleContentTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap;

    // Double-tap detected (within 300ms)
    if (timeSinceLastTap < 300) {
      e.stopPropagation();
      selectAndInspect();
      // Reset to prevent triple-tap from triggering
      setLastTap(0);
    } else {
      // First tap - record it
      setLastTap(now);
    }
  };

  return (
    <div
      className={`flex h-full w-full flex-col overflow-hidden rounded border-2 bg-white transition-all ${
        isSelected
          ? "border-blue-500 shadow-lg"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Widget Header */}
      <div
        onClick={handleHeaderClick}
        onDoubleClick={handleHeaderDoubleClick}
        onTouchEnd={handleHeaderTouchEnd}
        className={`flex cursor-pointer items-center justify-between border-b px-3 py-2 ${
          isSelected
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 bg-gray-50 hover:bg-gray-100"
        }`}
      >
        <span className="text-sm font-medium text-gray-700">
          {widgetType.charAt(0).toUpperCase() + widgetType.slice(1)}
        </span>

        {/* Toolbar */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleDelete}
            className="rounded p-1 text-gray-500 hover:bg-red-100 hover:text-red-600"
            title="Delete widget"
          >
            <RiDeleteBin6Line size={16} />
          </button>
        </div>
      </div>

      {/* Widget Content */}
      <div
        className="flex-1 overflow-auto p-2"
        data-widget-content="true"
        onDoubleClick={handleContentDoubleClick}
        onTouchEnd={handleContentTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
