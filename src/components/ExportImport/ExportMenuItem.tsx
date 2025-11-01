/**
 * ExportMenuItem - Reusable menu item for export dropdown
 *
 * Single Responsibility: Renders a single menu item with icon, label, and optional description
 * DRY: Eliminates repeated button markup in ExportButton
 */

import { type ReactNode } from "react";

export interface ExportMenuItemProps {
  icon: ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  iconColor?: string;
}

export function ExportMenuItem({
  icon,
  label,
  description,
  onClick,
  iconColor = "text-gray-500",
}: ExportMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
    >
      <span className={iconColor}>{icon}</span>
      {description ? (
        <div>
          <div className="font-medium">{label}</div>
          <div className="text-xs text-gray-500">{description}</div>
        </div>
      ) : (
        <span>{label}</span>
      )}
    </button>
  );
}
