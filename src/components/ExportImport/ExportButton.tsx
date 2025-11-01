/**
 * ExportButton - Export dashboard or selected widget to JSON
 *
 * Provides a dropdown menu with export options:
 * - Export Dashboard JSON
 * - Export Current Widget JSON (when widget selected)
 */

import { useState, useRef, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectDashboard, selectWidgetById, selectLayout } from "@/store";
import { selectSelectedId } from "@/store/slices/selectionSlice";
import { exportDashboardJSON, exportWidgetJSON } from "@/utils/export";
import { RiDownloadLine, RiArrowDownSLine } from "@remixicon/react";

export function ExportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dashboard = useAppSelector(selectDashboard);
  const selectedId = useAppSelector(selectSelectedId);
  const selectedWidget = useAppSelector((state) =>
    selectedId ? selectWidgetById(selectedId)(state) : null
  );
  const layout = useAppSelector(selectLayout);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleExportDashboard = () => {
    try {
      exportDashboardJSON(dashboard);
      setIsOpen(false);
    } catch (error) {
      alert("Failed to export dashboard. Please try again.");
      console.error(error);
    }
  };

  const handleExportWidget = () => {
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
      setIsOpen(false);
    } catch (error) {
      alert("Failed to export widget. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        title="Export"
      >
        <RiDownloadLine size={16} />
        <span>Export</span>
        <RiArrowDownSLine size={16} className="text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="py-1">
            <button
              onClick={handleExportDashboard}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <RiDownloadLine size={16} className="text-gray-500" />
              <div>
                <div className="font-medium">Export Dashboard</div>
                <div className="text-xs text-gray-500">
                  Save complete dashboard as JSON
                </div>
              </div>
            </button>

            {selectedWidget && (
              <>
                <div className="my-1 border-t border-gray-200" />
                <button
                  onClick={handleExportWidget}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <RiDownloadLine size={16} className="text-blue-500" />
                  <div>
                    <div className="font-medium">Export Current Widget</div>
                    <div className="text-xs text-gray-500">
                      Save selected widget as template
                    </div>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
