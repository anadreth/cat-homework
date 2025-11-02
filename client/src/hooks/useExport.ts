/**
 * useExport Hook
 *
 * Custom hook that handles export business logic for dashboard and widgets
 * Component-level UI state (dropdown open/close) should remain in the component
 */

import { useAppSelector } from "@/store/hooks";
import { selectDashboard, selectWidgetById, selectLayout } from "@/store";
import { selectSelectedId } from "@/store/slices/selectionSlice";
import { exportDashboardJSON, exportWidgetJSON } from "@/lib/utils/export";
import { exportWidget } from "@/lib/utils/visualExports";

export function useExport(onExportComplete?: () => void) {
  const dashboard = useAppSelector(selectDashboard);
  const selectedId = useAppSelector(selectSelectedId);
  const selectedWidget = useAppSelector((state) =>
    selectedId ? selectWidgetById(selectedId)(state) : null
  );
  const layout = useAppSelector(selectLayout);

  const handleExportDashboard = () => {
    try {
      exportDashboardJSON(dashboard);
      onExportComplete?.();
    } catch (error) {
      alert("Failed to export dashboard. Please try again.");
      console.error(error);
    }
  };

  const handleExportWidgetJSON = () => {
    if (!selectedWidget || !selectedId) return;

    try {
      const widgetLayout = layout.find((item) => item.id === selectedId);
      if (!widgetLayout) {
        alert("Could not find widget layout");
        return;
      }

      exportWidgetJSON(
        selectedWidget,
        widgetLayout,
        dashboard.name || "Untitled Dashboard"
      );
      onExportComplete?.();
    } catch (error) {
      alert("Failed to export widget. Please try again.");
      console.error(error);
    }
  };

  const handleExportWidgetVisual = async (
    format: "png" | "pdf" | "csv" | "xlsx"
  ) => {
    if (!selectedWidget || !selectedId) return;

    try {
      let data: Record<string, unknown>[] | undefined;
      if ((format === "csv" || format === "xlsx") && selectedWidget.type === "table") {
        const tableData = selectedWidget.props.data;
        if (
          Array.isArray(tableData) &&
          tableData.length > 0 &&
          typeof tableData[0] === "object" &&
          tableData[0] !== null &&
          !Array.isArray(tableData[0])
        ) {
          data = tableData as unknown as Record<string, unknown>[];
        }
      }

      await exportWidget(
        selectedId,
        selectedWidget.type,
        format,
        data,
        `widget-${selectedWidget.type}`
      );
      onExportComplete?.();
    } catch (error) {
      alert(`Failed to export widget as ${format.toUpperCase()}. Please try again.`);
      console.error(error);
    }
  };

  return {
    selectedWidget,
    handleExportDashboard,
    handleExportWidgetJSON,
    handleExportWidgetVisual,
  };
}
