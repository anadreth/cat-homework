import type { DashboardDoc, WidgetInstance, LayoutItem } from "@/store/types";

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

export type WidgetExportDoc = {
  version: number;
  widgetType: string;
  widget: WidgetInstance;
  layout: LayoutItem;
  exportedAt: number;
  exportedFrom?: string;
};

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

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + " " + sizes[i];
}
