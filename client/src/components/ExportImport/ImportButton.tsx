/**
 * ImportButton - Import dashboard or widget from JSON file
 *
 * Handles file upload, validation, and importing into Redux
 * Refactored to use useImport hook for reusable logic
 */

import { useImport } from "@/hooks/useImport";
import { RiUploadLine } from "@remixicon/react";

export function ImportButton() {
  const { fileInputRef, handleFileSelect, handleImportClick } = useImport();

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Import JSON file"
      />

      <button
        onClick={handleImportClick}
        className="flex items-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        title="Import dashboard or widget"
      >
        <RiUploadLine size={16} />
        <span>Import</span>
      </button>
    </>
  );
}
