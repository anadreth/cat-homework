/**
 * MobileMenu - Mobile-only navigation menu
 *
 * Provides access to all dashboard actions on mobile devices
 * including panel toggles, export/import, and canvas actions
 */

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  togglePalette,
  toggleInspector,
  selectPaletteOpen,
  selectInspectorOpen,
} from "@/store/slices/uiSlice";
import { resetDashboard, selectCanUndo, selectCanRedo } from "@/store";
import { addMultipleTestWidgets } from "@/utils/devTools";
import {
  RiLayoutLeftLine,
  RiLayoutRightLine,
  RiDownloadLine,
  RiUploadLine,
  RiAddLine,
  RiDeleteBin6Line,
  RiCloseLine,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
} from "@remixicon/react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function MobileMenu({
  isOpen,
  onClose,
  onExport,
  onImport,
  onUndo,
  onRedo,
}: MobileMenuProps) {
  const dispatch = useAppDispatch();
  const paletteOpen = useAppSelector(selectPaletteOpen);
  const inspectorOpen = useAppSelector(selectInspectorOpen);
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);

  const handleTogglePalette = () => {
    dispatch(togglePalette());
    onClose();
  };

  const handleToggleInspector = () => {
    dispatch(toggleInspector());
    onClose();
  };

  const handleAddDefaults = () => {
    addMultipleTestWidgets(dispatch);
    onClose();
  };

  const handleClear = () => {
    if (window.confirm("Clear all widgets from canvas?")) {
      dispatch(resetDashboard());
      onClose();
    }
  };

  const handleExport = () => {
    onExport();
    onClose();
  };

  const handleImport = () => {
    onImport();
    onClose();
  };

  const handleUndo = () => {
    onUndo();
    onClose();
  };

  const handleRedo = () => {
    onRedo();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[1000] bg-black/50 lg:hidden"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="fixed inset-y-0 left-0 z-[1001] w-64 bg-white shadow-xl lg:hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col p-2">
          {/* Panel Toggles */}
          <div className="mb-2 border-b border-gray-200 pb-2">
            <p className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">
              Panels
            </p>
            <button
              onClick={handleTogglePalette}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                paletteOpen
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <RiLayoutLeftLine size={20} />
              <span className="font-medium">
                {paletteOpen ? "Hide" : "Show"} Widget Palette
              </span>
            </button>

            <button
              onClick={handleToggleInspector}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                inspectorOpen
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <RiLayoutRightLine size={20} />
              <span className="font-medium">
                {inspectorOpen ? "Hide" : "Show"} Inspector
              </span>
            </button>
          </div>

          {/* Actions */}
          <div className="mb-2 border-b border-gray-200 pb-2">
            <p className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">
              Actions
            </p>
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <RiArrowGoBackLine size={20} />
              <span className="font-medium">Undo</span>
            </button>

            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <RiArrowGoForwardLine size={20} />
              <span className="font-medium">Redo</span>
            </button>

            <button
              onClick={handleExport}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-gray-700 transition-colors hover:bg-gray-100"
            >
              <RiDownloadLine size={20} />
              <span className="font-medium">Export Dashboard</span>
            </button>

            <button
              onClick={handleImport}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-gray-700 transition-colors hover:bg-gray-100"
            >
              <RiUploadLine size={20} />
              <span className="font-medium">Import Dashboard</span>
            </button>

            <button
              onClick={handleAddDefaults}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-gray-700 transition-colors hover:bg-gray-100"
            >
              <RiAddLine size={20} />
              <span className="font-medium">Add Default Widgets</span>
            </button>
          </div>

          {/* Danger Zone */}
          <div>
            <p className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">
              Danger Zone
            </p>
            <button
              onClick={handleClear}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-red-600 transition-colors hover:bg-red-50"
            >
              <RiDeleteBin6Line size={20} />
              <span className="font-medium">Clear Canvas</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
