/**
 * WidgetWrapper - Wraps all widgets with header, toolbar, and selection
 *
 * Features:
 * - Header with widget type name
 * - Delete button in toolbar
 * - Click header to select widget
 * - Visual highlight when selected
 */

import { type ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeWidget } from "@/store";
import { selectWidget, selectIsSelected } from "@/store/slices/selectionSlice";
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

  const handleHeaderClick = () => {
    dispatch(selectWidget(widgetId));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger selection when deleting
    dispatch(removeWidget(widgetId));
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
      <div className="flex-1 overflow-auto p-2">{children}</div>
    </div>
  );
}
