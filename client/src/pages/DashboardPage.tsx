/**
 * Dashboard Page Component
 *
 * Main dashboard builder interface with:
 * - Top toolbar (undo/redo, save status, export)
 * - Left palette (drag widgets)
 * - Center canvas (Gridstack grid)
 * - Right inspector (edit selected widget)
 *
 * Refactored for clean architecture:
 * - Custom hook for dashboard loading
 * - Extracted header component
 * - Reusable toolbar components
 */

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { undo, redo } from '@/store';
import { togglePalette, toggleInspector, selectPaletteOpen, selectInspectorOpen } from '@/store/slices/uiSlice';
import { useDashboardLoader } from '@/hooks/useDashboardLoader';
import { useImport } from '@/hooks/useImport';
import { useExport } from '@/hooks/useExport';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Canvas } from '@/components/Canvas';
import { Palette } from '@/components/Palette';
import { Inspector } from '@/components/Inspector';
import { MobileMenu } from '@/components/MobileMenu';

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const paletteOpen = useAppSelector(selectPaletteOpen);
  const inspectorOpen = useAppSelector(selectInspectorOpen);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load dashboard from LocalStorage on mount
  useDashboardLoader();

  // Import/Export hooks with handlers
  const { fileInputRef, handleFileSelect, handleImportClick } = useImport();
  const { handleExportDashboard } = useExport();

  return (
    <div className="app-container flex h-screen w-screen flex-col overflow-hidden bg-gray-100">
      {/* Hidden file input for import functionality */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Import JSON file"
      />

      <DashboardHeader onMobileMenuOpen={() => setMobileMenuOpen(true)} />

      <main className="flex flex-1 overflow-hidden">
        {paletteOpen && (
          <aside className="absolute inset-y-0 left-0 top-[57px] z-[1001] w-64 border-r border-gray-200 bg-white p-4 shadow-lg sm:top-[65px] lg:static lg:z-auto lg:shadow-none">
            <Palette />
          </aside>
        )}

        <div className="flex-1 overflow-hidden">
          <Canvas />
        </div>

        {inspectorOpen && (
          <aside className="absolute inset-y-0 right-0 top-[57px] z-[1001] w-80 border-l border-gray-200 bg-white p-4 shadow-lg sm:top-[65px] lg:static lg:z-auto lg:shadow-none">
            <Inspector />
          </aside>
        )}
      </main>

      {(paletteOpen || inspectorOpen) && (
        <div
          className="fixed inset-0 z-[1000] bg-black/20 lg:hidden"
          onClick={() => {
            if (paletteOpen) dispatch(togglePalette());
            if (inspectorOpen) dispatch(toggleInspector());
          }}
        />
      )}

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onExport={handleExportDashboard}
        onImport={handleImportClick}
        onUndo={() => dispatch(undo())}
        onRedo={() => dispatch(redo())}
      />
    </div>
  );
}
