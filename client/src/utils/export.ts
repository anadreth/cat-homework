/**
 * Export Utilities
 *
 * Handles exporting dashboards and widgets to JSON files
 * with proper versioning and timestamps.
 */

import type { DashboardDoc, WidgetInstance, LayoutItem } from "@/store/types";

/**
 * Format timestamp for filenames
 * Returns format: YYYY-MM-DD-HHmmss
 */
function formatTimestampForFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
}

/**
 * Export dashboard to JSON file
 *
 * Adds exportedAt timestamp and triggers browser download
 *
 * @param dashboard - Complete dashboard document from Redux
 * @param filename - Optional custom filename (defaults to dashboard-{name}-{timestamp}.json)
 */
export function exportDashboardJSON(
  dashboard: DashboardDoc,
  filename?: string
): void {
  try {
    const exportDoc: DashboardDoc = {
      ...dashboard,
      meta: {
        ...dashboard.meta,
        exportedAt: Date.now(),
      },
    };

    const timestamp = formatTimestampForFilename(); // YYYY-MM-DD-HHmmss
    const finalFilename =
      filename || `dashboard-${dashboard.name || "untitled"}-${timestamp}.json`;

    const json = JSON.stringify(exportDoc, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = finalFilename;
    link.click();
    URL.revokeObjectURL(url);

    console.log("[Export] Dashboard exported successfully:", finalFilename);
  } catch (error) {
    console.error("[Export] Failed to export dashboard:", error);
    throw error;
  }
}

/**
 * Widget export document structure
 */
export type WidgetExportDoc = {
  version: number; // Schema version
  widgetType: string; // Widget type for validation
  widget: WidgetInstance; // Complete widget instance
  layout: LayoutItem; // Widget layout/positioning
  exportedAt: number; // Export timestamp
  exportedFrom?: string; // Optional dashboard name/ID
};

/**
 * Export single widget to JSON file
 *
 * Creates a portable widget template that can be imported
 * into any dashboard.
 *
 * @param widget - Widget instance from Redux
 * @param layout - Widget layout item
 * @param dashboardName - Optional source dashboard name
 * @param filename - Optional custom filename
 */
export function exportWidgetJSON(
  widget: WidgetInstance,
  layout: LayoutItem,
  dashboardName?: string,
  filename?: string
): void {
  try {
    const exportDoc: WidgetExportDoc = {
      version: 1,
      widgetType: widget.type,
      widget,
      layout,
      exportedAt: Date.now(),
      exportedFrom: dashboardName,
    };

    const sanitizedType = widget.type.toLowerCase().replace(/\s+/g, "-");
    const timestamp = formatTimestampForFilename();
    const finalFilename =
      filename || `widget-${sanitizedType}-${timestamp}.json`;

    const json = JSON.stringify(exportDoc, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = finalFilename;
    link.click();
    URL.revokeObjectURL(url);

    console.log("[Export] Widget exported successfully:", finalFilename);
  } catch (error) {
    console.error("[Export] Failed to export widget:", error);
    throw error;
  }
}

/**
 * Format file size in bytes to human-readable format
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 KB", "2.3 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 10) / 10 + " " + sizes[i];
}
