import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

export async function exportToPNG(
  element: HTMLElement,
  filename: string
): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to create image blob"));
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        resolve();
      }, "image/png");
    });
  } catch (error) {
    console.error("[Export] Failed to export PNG:", error);
    throw error;
  }
}

export async function exportToPDF(
  element: HTMLElement,
  filename: string
): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("[Export] Failed to export PDF:", error);
    throw error;
  }
}

export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string
): void {
  try {
    if (!data || data.length === 0) {
      throw new Error("No data to export");
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("[Export] Failed to export CSV:", error);
    throw error;
  }
}

export function exportToXLSX(
  data: Record<string, unknown>[],
  filename: string,
  sheetName = "Sheet1"
): void {
  try {
    if (!data || data.length === 0) {
      throw new Error("No data to export");
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error("[Export] Failed to export XLSX:", error);
    throw error;
  }
}

export async function exportWidget(
  widgetId: string,
  widgetType: string,
  format: "png" | "pdf" | "csv" | "xlsx",
  data?: Record<string, unknown>[],
  filename?: string
): Promise<void> {
  const baseFilename = filename || `widget-${widgetType}-${Date.now()}`;

  try {
    if (format === "csv" || format === "xlsx") {
      if (!data) {
        throw new Error("Data is required for CSV/XLSX export");
      }

      if (format === "csv") {
        exportToCSV(data, baseFilename);
      } else {
        exportToXLSX(data, baseFilename);
      }
    } else {
      const gridItem = document.querySelector(
        `[gs-id="${widgetId}"]`
      ) as HTMLElement;

      if (!gridItem) {
        console.error("[Export] Widget element not found for ID:", widgetId);
        throw new Error(`Widget element not found: ${widgetId}`);
      }

      const element = gridItem.querySelector(
        "[data-widget-content]"
      ) as HTMLElement;

      if (!element) {
        console.error("[Export] Widget content not found for ID:", widgetId);
        throw new Error(`Widget content element not found: ${widgetId}`);
      }

      if (format === "png") {
        await exportToPNG(element, baseFilename);
      } else {
        await exportToPDF(element, baseFilename);
      }
    }
  } catch (error) {
    console.error("[Export] Widget export failed:", error);
    throw error;
  }
}

export function getAvailableExportFormats(
  widgetType: string
): Array<"json" | "png" | "pdf" | "csv" | "xlsx"> {
  const formats: Array<"json" | "png" | "pdf" | "csv" | "xlsx"> = [
    "json",
    "png",
    "pdf",
  ];

  if (widgetType === "table") {
    formats.push("csv", "xlsx");
  }

  return formats;
}
