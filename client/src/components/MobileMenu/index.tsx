import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  togglePalette,
  toggleInspector,
  selectPaletteOpen,
  selectInspectorOpen,
} from "@/store/slices/uiSlice";
import {
  resetDashboard,
  selectCanUndo,
  selectCanRedo,
  selectUser,
  logout,
  undo,
  redo,
} from "@/store";
import { useImport } from "@/hooks/useImport";
import { useExport } from "@/hooks/useExport";
import { AddWidgetDialog } from "@/components/AddWidgetDialog";
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
  RiLogoutBoxLine,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuButtonProps {
  icon: RemixiconComponentType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  variant = "default",
}: MenuButtonProps) {
  const baseClasses =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";
  const variantClasses =
    variant === "danger"
      ? "text-red-600 hover:bg-red-50"
      : "text-gray-700 hover:bg-gray-100";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses}`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );
}

//TODO can refactor and modularize more
export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const paletteOpen = useAppSelector(selectPaletteOpen);
  const inspectorOpen = useAppSelector(selectInspectorOpen);
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);
  const user = useSelector(selectUser);
  const [isAddWidgetDialogOpen, setIsAddWidgetDialogOpen] = useState(false);

  const { fileInputRef, handleFileSelect, handleImportClick } = useImport();
  const { handleExportDashboard } = useExport();

  const handleTogglePalette = () => {
    dispatch(togglePalette());
    onClose();
  };

  const handleToggleInspector = () => {
    dispatch(toggleInspector());
    onClose();
  };

  const handleAddWidget = () => {
    setIsAddWidgetDialogOpen(true);
    onClose();
  };

  const handleClear = () => {
    if (window.confirm("Clear all widgets from canvas?")) {
      dispatch(resetDashboard());
      onClose();
    }
  };

  const handleExport = () => {
    handleExportDashboard();
    onClose();
  };

  const handleImport = () => {
    handleImportClick();
    onClose();
  };

  const handleUndo = () => {
    dispatch(undo());
    onClose();
  };

  const handleRedo = () => {
    dispatch(redo());
    onClose();
  };

  const handleLogout = async () => {
    await dispatch(logout());
    // Use replace: true to prevent back button navigation to dashboard
    navigate("/", { replace: true });
  };

  if (!isOpen) return null;

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

      <div
        className="fixed inset-0 z-[1000] bg-black/50 lg:hidden"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 z-[1001] w-64 bg-white shadow-xl lg:hidden">
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

        <nav className="flex flex-col p-2">
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

          <div className="mb-2 border-b border-gray-200 pb-2">
            <p className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">
              Actions
            </p>
            <MenuButton
              icon={RiArrowGoBackLine}
              label="Undo"
              onClick={handleUndo}
              disabled={!canUndo}
            />
            <MenuButton
              icon={RiArrowGoForwardLine}
              label="Redo"
              onClick={handleRedo}
              disabled={!canRedo}
            />
            <MenuButton
              icon={RiDownloadLine}
              label="Export Dashboard"
              onClick={handleExport}
            />
            <MenuButton
              icon={RiUploadLine}
              label="Import Dashboard"
              onClick={handleImport}
            />
            <MenuButton
              icon={RiAddLine}
              label="Add Widget"
              onClick={handleAddWidget}
            />
          </div>

          <div className="mb-2 border-b border-gray-200 pb-2">
            <p className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">
              Danger Zone
            </p>
            <MenuButton
              icon={RiDeleteBin6Line}
              label="Clear Canvas"
              onClick={handleClear}
              variant="danger"
            />
          </div>

          {user && (
            <div>
              <p className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">
                Account
              </p>
              <div className="flex items-center gap-3 px-3 py-2">
                {user.picture && (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <MenuButton
                icon={RiLogoutBoxLine}
                label="Logout"
                onClick={handleLogout}
              />
            </div>
          )}
        </nav>
      </div>

      <AddWidgetDialog
        isOpen={isAddWidgetDialogOpen}
        onClose={() => setIsAddWidgetDialogOpen(false)}
      />
    </>
  );
}
