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
import {
  WIDGET_REGISTRY,
  WIDGET_ICONS,
  getWidgetTypes,
  type WidgetType,
} from "@/constants/widget-registry";
import { Modal } from "@/components/Modal";

interface AddWidgetDialogProps {
  isOpen: boolean;
  onClose: () => void;
}


const WIDGET_GRADIENT_COLORS = {
  chart: "from-blue-500 to-blue-600",
  table: "from-purple-500 to-purple-600",
  list: "from-green-500 to-green-600",
  text: "from-orange-500 to-orange-600",
} satisfies Record<WidgetType, string>;


const WIDGET_OPTIONS = getWidgetTypes().map((type) => ({
  type,
  icon: WIDGET_ICONS[type],
  color: WIDGET_GRADIENT_COLORS[type],
}));

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
          const IconComponent = option.icon;
          return (
            <button
              key={option.type}
              onClick={() => handleAddWidget(option.type)}
              className="group flex flex-col items-center gap-3 rounded-lg border-2 border-gray-200 p-6 transition-all hover:border-gray-300 hover:shadow-md"
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br ${option.color} text-white shadow-md transition-transform group-hover:scale-110`}
              >
                <IconComponent size={32} />
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
