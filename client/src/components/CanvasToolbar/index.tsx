/**
 * CanvasToolbar Component
 *
 * Toolbar positioned above the canvas with dashboard actions
 * Hidden on mobile (mobile users access actions via MobileMenu)
 * Contains: Undo/Redo, Export/Import, Panel toggles, Add widgets, Clear
 */

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { undo, redo, selectCanUndo, selectCanRedo, resetDashboard } from '@/store';
import { togglePalette, toggleInspector, selectPaletteOpen, selectInspectorOpen } from '@/store/slices/uiSlice';
import { ExportButton } from '@/components/ExportImport/ExportButton';
import { ImportButton } from '@/components/ExportImport/ImportButton';
import { AddWidgetDialog } from '@/components/AddWidgetDialog';
import { ToolbarButton, ToolbarDivider } from '@/components/Toolbar';
import {
  RiAddLine,
  RiDeleteBin6Line,
  RiLayoutLeftLine,
  RiLayoutRightLine,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
} from '@remixicon/react';

export function CanvasToolbar() {
  const dispatch = useAppDispatch();
  const paletteOpen = useAppSelector(selectPaletteOpen);
  const inspectorOpen = useAppSelector(selectInspectorOpen);
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);
  const [isAddWidgetDialogOpen, setIsAddWidgetDialogOpen] = useState(false);

  return (
    <>
    <div className="hidden lg:flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-2 shadow-sm">
      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => dispatch(undo())}
        icon={<RiArrowGoBackLine size={18} />}
        title="Undo (Ctrl+Z)"
        disabled={!canUndo}
        className="px-2"
      />

      <ToolbarButton
        onClick={() => dispatch(redo())}
        icon={<RiArrowGoForwardLine size={18} />}
        title="Redo (Ctrl+Shift+Z)"
        disabled={!canRedo}
        className="px-2"
      />

      <ToolbarDivider />

      {/* Export/Import */}
      <ExportButton />
      <ImportButton />

      <ToolbarDivider className="mx-2" />

      {/* Panel toggles */}
      <ToolbarButton
        onClick={() => dispatch(togglePalette())}
        icon={<RiLayoutLeftLine size={16} />}
        title="Toggle palette"
        variant={paletteOpen ? 'primary' : 'default'}
        className="px-2"
      />

      <ToolbarButton
        onClick={() => dispatch(toggleInspector())}
        icon={<RiLayoutRightLine size={16} />}
        title="Toggle inspector"
        variant={inspectorOpen ? 'primary' : 'default'}
        className="px-2"
      />

      <ToolbarDivider className="mx-2" />

      {/* Add/Clear actions */}
      <ToolbarButton
        onClick={() => setIsAddWidgetDialogOpen(true)}
        icon={<RiAddLine size={16} />}
        title="Add widget"
        className="px-2"
      />

      <ToolbarButton
        onClick={() => dispatch(resetDashboard())}
        icon={<RiDeleteBin6Line size={18} />}
        title="Clear canvas"
        variant="danger"
        className="px-2"
      />
    </div>

    {/* Add Widget Dialog */}
    <AddWidgetDialog
      isOpen={isAddWidgetDialogOpen}
      onClose={() => setIsAddWidgetDialogOpen(false)}
    />
    </>
  );
}
