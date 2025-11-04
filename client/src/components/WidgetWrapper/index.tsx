import { type PropsWithChildren, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeWidget } from "@/store";
import { selectWidget, selectIsSelected } from "@/store/slices/selectionSlice";
import { toggleInspector, selectInspectorOpen } from "@/store/slices/uiSlice";
import { RiDeleteBin6Line } from "@remixicon/react";

export type WidgetWrapperProps = PropsWithChildren & {
  widgetId: string;
  widgetType: string;
};

export function WidgetWrapper({
  widgetId,
  widgetType,
  children,
}: WidgetWrapperProps) {
  const dispatch = useAppDispatch();
  const isSelected = useAppSelector(selectIsSelected(widgetId));
  const inspectorOpen = useAppSelector(selectInspectorOpen);
  const lastTapRef = useRef<number>(0);
  const lastHeaderTapRef = useRef<number>(0);

  const handleHeaderClick = () => {
    dispatch(selectWidget(widgetId));
  };

  const handleHeaderDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectAndInspect();
  };

  const handleHeaderTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastHeaderTapRef.current;

    if (timeSinceLastTap < 300) {
      e.stopPropagation();
      selectAndInspect();
      lastHeaderTapRef.current = 0;
    } else {
      lastHeaderTapRef.current = now;
      dispatch(selectWidget(widgetId));
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger selection when deleting
    dispatch(removeWidget(widgetId));
  };

  const selectAndInspect = () => {
    dispatch(selectWidget(widgetId));
    if (!inspectorOpen) {
      dispatch(toggleInspector());
    }
  };

  const handleContentDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectAndInspect();
  };

  const handleContentTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300) {
      e.stopPropagation();
      selectAndInspect();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
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
