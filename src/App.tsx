/**
 * Main Application Component
 *
 * Dashboard builder with:
 * - Top toolbar (undo/redo, save status, export)
 * - Left palette (drag widgets)
 * - Center canvas (Gridstack grid)
 * - Right inspector (edit selected widget)
 */

import { useEffect } from "react";
import { useAppDispatch } from "./store/hooks";
import { importDashboard, loadDashboard, resetDashboard } from "./store";
import { addMultipleTestWidgets } from "@/utils/devTools";
import { Canvas } from "./components/Canvas";
import { Palette } from "./components/Palette";

function App() {
  const dispatch = useAppDispatch();

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
      {/* Top Toolbar */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Dashboard Builder</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => addMultipleTestWidgets(dispatch)}
            className="rounded bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600"
          >
            Add Test Widgets
          </button>
          <button
            onClick={() => dispatch(resetDashboard())}
            className="rounded bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
          >
            Clear Canvas
          </button>
          <span className="text-sm text-gray-500">Phase 3: Palette</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Palette */}
        <aside className="w-64 border-r border-gray-200 bg-white p-4">
          <Palette />
        </aside>

        {/* Center Canvas */}
        <div className="flex-1 overflow-hidden">
          <Canvas />
        </div>

        {/* Right Inspector - TODO Phase 5 */}
        <aside className="w-80 border-l border-gray-200 bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            Inspector
          </h2>
          <p className="text-xs text-gray-500">
            Coming in Phase 5: Edit widget properties
          </p>
        </aside>
      </main>
    </div>
  );
}

export default App;
