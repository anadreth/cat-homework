/**
 * ExportButton - Export dashboard or selected widget to various formats
 *
 * Provides a dropdown menu with export options:
 * - Export Dashboard JSON
 * - Export Current Widget (JSON/PNG/PDF/CSV/XLSX based on widget type)
 */

import { useState, useRef, useEffect } from "react";
import { useExport } from "@/hooks/useExport";
import { ExportMenuItem } from "./ExportMenuItem";
import {
  RiDownloadLine,
  RiArrowDownSLine,
  RiFileTextLine,
  RiImageLine,
  RiFileChartLine,
  RiTableLine,
} from "@remixicon/react";

export function ExportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    selectedWidget,
    handleExportDashboard,
    handleExportWidgetJSON,
    handleExportWidgetVisual,
  } = useExport(() => setIsOpen(false));

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

  const widgetExportOptions = [
    {
      icon: <RiFileTextLine size={16} />,
      label: "JSON Template",
      iconColor: "text-blue-500",
      onClick: handleExportWidgetJSON,
    },
    {
      icon: <RiImageLine size={16} />,
      label: "PNG Image",
      iconColor: "text-green-500",
      onClick: () => handleExportWidgetVisual("png"),
    },
    {
      icon: <RiFileChartLine size={16} />,
      label: "PDF Document",
      iconColor: "text-red-500",
      onClick: () => handleExportWidgetVisual("pdf"),
    },
  ];

  const tableExportOptions = [
    {
      icon: <RiTableLine size={16} />,
      label: "CSV Spreadsheet",
      iconColor: "text-orange-500",
      onClick: () => handleExportWidgetVisual("csv"),
    },
    {
      icon: <RiTableLine size={16} />,
      label: "Excel (XLSX)",
      iconColor: "text-purple-500",
      onClick: () => handleExportWidgetVisual("xlsx"),
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        title="Export"
      >
        <RiDownloadLine size={16} />
        <span className="hidden lg:inline">Export</span>
        <RiArrowDownSLine size={16} className="text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 w-64 rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="py-1">
            {/* Dashboard Export */}
            <ExportMenuItem
              icon={<RiFileTextLine size={16} />}
              label="Export Dashboard"
              description="Save complete dashboard as JSON"
              onClick={handleExportDashboard}
              iconColor="text-gray-500"
            />

            {/* Widget Exports */}
            {selectedWidget && (
              <>
                <div className="my-1 border-t border-gray-200" />
                <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase">
                  Export Widget ({selectedWidget.type})
                </div>

                {widgetExportOptions.map((option, index) => (
                  <ExportMenuItem key={index} {...option} />
                ))}

                {selectedWidget.type === "table" &&
                  tableExportOptions.map((option, index) => (
                    <ExportMenuItem key={index} {...option} />
                  ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
