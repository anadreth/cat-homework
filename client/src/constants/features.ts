import {
  RiDragMoveLine,
  RiBarChartBoxLine,
  RiPaintLine,
  RiTableLine,
  RiListCheck2,
  RiLayoutGridLine,
} from "@remixicon/react";

export interface Feature {
  icon: typeof RiDragMoveLine;
  iconBgColor: string;
  iconColor: string;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    icon: RiDragMoveLine,
    iconBgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Drag & Drop",
    description:
      "Intuitive drag-and-drop interface powered by Gridstack.js. Resize and reposition widgets with ease.",
  },
  {
    icon: RiBarChartBoxLine,
    iconBgColor: "bg-purple-100",
    iconColor: "text-purple-600",
    title: "Rich Widgets",
    description:
      "Multiple widget types: charts, tables, lists, and text. Each with customizable properties and styling.",
  },
  {
    icon: RiPaintLine,
    iconBgColor: "bg-green-100",
    iconColor: "text-green-600",
    title: "Customizable",
    description:
      "Edit widget properties in real-time with the inspector panel. See changes instantly on the canvas.",
  },
  {
    icon: RiTableLine,
    iconBgColor: "bg-orange-100",
    iconColor: "text-orange-600",
    title: "Auto-Save",
    description:
      "Your dashboards are automatically saved to LocalStorage with debounced updates. Never lose your work.",
  },
  {
    icon: RiListCheck2,
    iconBgColor: "bg-red-100",
    iconColor: "text-red-600",
    title: "Undo/Redo",
    description:
      "Full undo/redo support with keyboard shortcuts. Experiment freely knowing you can always go back.",
  },
  {
    icon: RiLayoutGridLine,
    iconBgColor: "bg-indigo-100",
    iconColor: "text-indigo-600",
    title: "Export/Import",
    description:
      "Export dashboards as JSON files. Import to share dashboards across devices or with your team.",
  },
];
