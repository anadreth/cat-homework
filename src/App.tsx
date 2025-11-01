/**
 * Main Application Component
 *
 * Dashboard builder with:
 * - Top toolbar (undo/redo, save status, export)
 * - Left palette (drag widgets)
 * - Center canvas (Gridstack grid)
 * - Right inspector (edit selected widget)
 */

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  importDashboard,
  loadDashboard,
  resetDashboard,
  undo,
  redo,
  selectCanUndo,
  selectCanRedo,
} from "./store";
import {
  togglePalette,
  toggleInspector,
  selectPaletteOpen,
  selectInspectorOpen,
} from "./store/slices/uiSlice";
import { addMultipleTestWidgets } from "@/utils/devTools";
import { Canvas } from "./components/Canvas";
import { Palette } from "./components/Palette";
import { Inspector } from "./components/Inspector";
import { SaveStatusIndicator } from "./components/SaveStatusIndicator";
import { ExportButton } from "./components/ExportImport/ExportButton";
import { ImportButton } from "./components/ExportImport/ImportButton";
import { MobileMenu } from "./components/MobileMenu";
import {
  RiAddLine,
  RiDeleteBin6Line,
  RiLayoutLeftLine,
  RiLayoutRightLine,
  RiMenuLine,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
} from "@remixicon/react";

function App() {
  const dispatch = useAppDispatch();
  const paletteOpen = useAppSelector(selectPaletteOpen);
  const inspectorOpen = useAppSelector(selectInspectorOpen);
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /**
   * Load dashboard from LocalStorage on mount
   */
  useEffect(() => {
    const savedDashboard = loadDashboard();
    if (savedDashboard) {
      dispatch(importDashboard(savedDashboard));
    }
  }, [dispatch]);

  return (
    <div className="app-container flex h-screen w-screen flex-col overflow-hidden bg-gray-100">
      {/* Top Toolbar - Responsive */}
      <header className="flex items-center justify-between gap-2 border-b border-gray-200 bg-white px-2 py-2 shadow-sm sm:px-4 sm:py-3">
        {/* Left section */}
        <div className="flex items-center gap-1 sm:gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded p-1.5 text-gray-600 hover:bg-gray-100 lg:hidden"
            title="Open menu"
            aria-label="Open menu"
          >
            <RiMenuLine size={20} />
          </button>

          <h1 className="text-base font-bold text-gray-900 sm:text-xl">
            <span className="hidden sm:inline">Dashboard Builder</span>
            <span className="sm:hidden">Dashboard</span>
          </h1>
          <div className="hidden sm:block">
            <SaveStatusIndicator />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Undo/Redo buttons - hidden on mobile */}
          <button
            onClick={() => dispatch(undo())}
            disabled={!canUndo}
            className="hidden rounded border border-gray-300 p-1.5 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent sm:flex sm:px-2"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <RiArrowGoBackLine size={18} />
          </button>

          <button
            onClick={() => dispatch(redo())}
            disabled={!canRedo}
            className="hidden rounded border border-gray-300 p-1.5 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent sm:flex sm:px-2"
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
          >
            <RiArrowGoForwardLine size={18} />
          </button>

          <div className="mx-1 hidden h-6 border-l border-gray-300 sm:mx-2 sm:block" />

          <ExportButton />
          <ImportButton />

          <div className="mx-1 h-6 border-l border-gray-300 sm:mx-2" />

          {/* Panel toggles - desktop only */}
          <button
            onClick={() => dispatch(togglePalette())}
            className={`hidden items-center gap-1.5 rounded border px-2 py-1.5 text-sm font-medium transition-colors lg:flex ${
              paletteOpen
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            title="Toggle palette"
          >
            <RiLayoutLeftLine size={16} />
            <span className="hidden xl:inline">Palette</span>
          </button>

          <button
            onClick={() => dispatch(toggleInspector())}
            className={`hidden items-center gap-1.5 rounded border px-2 py-1.5 text-sm font-medium transition-colors lg:flex ${
              inspectorOpen
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            title="Toggle inspector"
          >
            <RiLayoutRightLine size={16} />
            <span className="hidden xl:inline">Inspector</span>
          </button>

          <div className="mx-1 hidden h-6 border-l border-gray-300 sm:mx-2 sm:block" />

          <button
            onClick={() => addMultipleTestWidgets(dispatch)}
            className="hidden items-center gap-1.5 rounded border border-gray-300 px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:flex sm:px-3"
            title="Add test widgets"
          >
            <RiAddLine size={16} />
            <span className="hidden md:inline">Add Default Widgets</span>
          </button>

          <button
            onClick={() => dispatch(resetDashboard())}
            className="flex items-center gap-1.5 rounded border border-gray-300 px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 sm:px-3"
            title="Clear canvas"
          >
            <RiDeleteBin6Line size={18} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </header>

      {/* Main Content - Responsive */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Palette - Collapsible */}
        {paletteOpen && (
          <aside className="absolute inset-y-0 left-0 top-[57px] z-[1001] w-64 border-r border-gray-200 bg-white p-4 shadow-lg sm:top-[65px] lg:static lg:z-auto lg:shadow-none">
            <Palette />
          </aside>
        )}

        {/* Center Canvas */}
        <div className="flex-1 overflow-hidden">
          <Canvas />
        </div>

        {/* Right Inspector - Collapsible */}
        {inspectorOpen && (
          <aside className="absolute inset-y-0 right-0 top-[57px] z-[1001] w-80 border-l border-gray-200 bg-white p-4 shadow-lg sm:top-[65px] lg:static lg:z-auto lg:shadow-none">
            <Inspector />
          </aside>
        )}
      </main>

      {/* Mobile overlay when panels are open */}
      {(paletteOpen || inspectorOpen) && (
        <div
          className="fixed inset-0 z-[1000] bg-black/20 lg:hidden"
          onClick={() => {
            if (paletteOpen) dispatch(togglePalette());
            if (inspectorOpen) dispatch(toggleInspector());
          }}
        />
      )}

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onExport={() => {
          // Trigger export button click
          const exportBtn = document.querySelector(
            '[title="Export"]'
          ) as HTMLButtonElement;
          exportBtn?.click();
        }}
        onImport={() => {
          // Trigger import button click
          const importBtn = document.querySelector(
            '[title="Import dashboard or widget"]'
          ) as HTMLButtonElement;
          importBtn?.click();
        }}
        onUndo={() => dispatch(undo())}
        onRedo={() => dispatch(redo())}
      />
    </div>
  );
}

export default App;
