/**
 * DashboardHeader Component
 *
 * Top toolbar for dashboard with navigation, actions, and panel toggles
 */

import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { undo, redo, selectCanUndo, selectCanRedo, resetDashboard } from '@/store';
import { togglePalette, toggleInspector, selectPaletteOpen, selectInspectorOpen } from '@/store/slices/uiSlice';
import { addMultipleTestWidgets } from '@/utils/devTools';
import { SaveStatusIndicator } from '@/components/SaveStatusIndicator';
import { ExportButton } from '@/components/ExportImport/ExportButton';
import { ImportButton } from '@/components/ExportImport/ImportButton';
import { ToolbarButton, ToolbarDivider, ToolbarIconButton } from '@/components/Toolbar';
import {
  RiAddLine,
  RiDeleteBin6Line,
  RiLayoutLeftLine,
  RiLayoutRightLine,
  RiMenuLine,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiHomeLine,
} from '@remixicon/react';

interface DashboardHeaderProps {
  onMobileMenuOpen: () => void;
}

export function DashboardHeader({ onMobileMenuOpen }: DashboardHeaderProps) {
  const dispatch = useAppDispatch();
  const paletteOpen = useAppSelector(selectPaletteOpen);
  const inspectorOpen = useAppSelector(selectInspectorOpen);
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);

  return (
    <header className="flex items-center justify-between gap-2 border-b border-gray-200 bg-white px-2 py-2 shadow-sm sm:px-4 sm:py-3">
      {/* Left section */}
      <div className="flex items-center gap-1 sm:gap-4">
        <ToolbarIconButton
          onClick={onMobileMenuOpen}
          icon={<RiMenuLine size={20} />}
          title="Open menu"
          hideOnDesktop
        />

        <Link to="/" className="rounded p-1.5 text-gray-600 hover:bg-gray-100" title="Go to home">
          <RiHomeLine size={20} />
        </Link>

        <h1 className="text-base font-bold text-gray-900 sm:text-xl">Dashboard</h1>

        <div className="hidden sm:block">
          <SaveStatusIndicator />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Undo/Redo - hidden on mobile */}
        <ToolbarButton
          onClick={() => dispatch(undo())}
          icon={<RiArrowGoBackLine size={18} />}
          title="Undo (Ctrl+Z)"
          disabled={!canUndo}
          hideOnMobile
          className="md:flex sm:px-2"
        />

        <ToolbarButton
          onClick={() => dispatch(redo())}
          icon={<RiArrowGoForwardLine size={18} />}
          title="Redo (Ctrl+Shift+Z)"
          disabled={!canRedo}
          hideOnMobile
          className="md:flex sm:px-2"
        />

        <ToolbarDivider hideOnMobile />

        <ExportButton />
        <ImportButton />

        <ToolbarDivider className="lg:mx-2" />

        {/* Panel toggles - desktop only */}
        <ToolbarButton
          onClick={() => dispatch(togglePalette())}
          icon={<RiLayoutLeftLine size={16} />}
          label="Palette"
          title="Toggle palette"
          variant={paletteOpen ? 'primary' : 'default'}
          hideOnMobile
          className="lg:flex"
        />

        <ToolbarButton
          onClick={() => dispatch(toggleInspector())}
          icon={<RiLayoutRightLine size={16} />}
          label="Inspector"
          title="Toggle inspector"
          variant={inspectorOpen ? 'primary' : 'default'}
          hideOnMobile
          className="lg:flex"
        />

        <ToolbarDivider className="sm:mx-2 lg:block" />

        <ToolbarButton
          onClick={() => addMultipleTestWidgets(dispatch)}
          icon={<RiAddLine size={16} />}
          label="Add Default Widgets"
          title="Add test widgets"
          hideOnMobile
          className="sm:flex sm:px-3"
        />

        <ToolbarButton
          onClick={() => dispatch(resetDashboard())}
          icon={<RiDeleteBin6Line size={18} />}
          label="Clear"
          title="Clear canvas"
          variant="danger"
          className="sm:px-3"
        />
      </div>
    </header>
  );
}
