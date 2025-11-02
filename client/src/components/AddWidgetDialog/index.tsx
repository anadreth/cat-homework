/**
 * AddWidgetDialog Component
 *
 * Dialog for adding widgets to the canvas
 * Displays a 2x2 grid of widget options
 * On click, adds widget to center of viewport and closes dialog
 */

import { useAppDispatch } from "@/store/hooks";
import { addWidget } from "@/store";
import { selectWidget } from "@/store/slices/selectionSlice";
import { WIDGET_REGISTRY } from "@/constants/widget-registry";
import { Modal } from "@/components/Modal";
import type { WidgetType } from "@/store/types";
import {
  RiTableLine,
  RiListCheck,
  RiText,
  RiBarChartBoxLine,
} from "@remixicon/react";

interface AddWidgetDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const WIDGET_OPTIONS: Array<{
  type: WidgetType;
  icon: React.ReactNode;
  color: string;
}> = [
  {
    type: "chart",
    icon: <RiBarChartBoxLine size={32} />,
    color: "from-blue-500 to-blue-600",
  },
  {
    type: "table",
    icon: <RiTableLine size={32} />,
    color: "from-purple-500 to-purple-600",
  },
  {
    type: "list",
    icon: <RiListCheck size={32} />,
    color: "from-green-500 to-green-600",
  },
  {
    type: "text",
    icon: <RiText size={32} />,
    color: "from-orange-500 to-orange-600",
  },
];

export function AddWidgetDialog({ isOpen, onClose }: AddWidgetDialogProps) {
  const dispatch = useAppDispatch();

  const handleAddWidget = (type: WidgetType) => {
    const meta = WIDGET_REGISTRY[type];
    const props = meta.defaultPropsFactory();

    // Add widget to center of viewport (approximate)
    const action = dispatch(
      addWidget({
        type,
        layout: {
          x: 3, // Centered in 12-column grid
          y: 0, // Top of canvas
          w: meta.defaultSize.w,
          h: meta.defaultSize.h,
        },
        props,
      })
    );

    // Auto-select the newly created widget
    const newWidgetId = action.meta.id;
    dispatch(selectWidget(newWidgetId));

    // Close dialog
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Widget">
      {/* Content - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-4 p-6">
        {WIDGET_OPTIONS.map((option) => {
          const meta = WIDGET_REGISTRY[option.type];
          return (
            <button
              key={option.type}
              onClick={() => handleAddWidget(option.type)}
              className="group flex flex-col items-center gap-3 rounded-lg border-2 border-gray-200 p-6 transition-all hover:border-gray-300 hover:shadow-md"
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br ${option.color} text-white shadow-md transition-transform group-hover:scale-110`}
              >
                {option.icon}
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">{meta.name}</p>
                <p className="mt-1 text-xs text-gray-500">{meta.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
