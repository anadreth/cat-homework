import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  togglePalette,
  toggleInspector,
  selectPaletteOpen,
  selectInspectorOpen,
} from "@/store/slices/uiSlice";
import { useDashboardLoader } from "@/hooks/useDashboardLoader";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Canvas } from "@/components/Canvas";
import { Palette } from "@/components/Palette";
import { Inspector } from "@/components/Inspector";
import { MobileMenu } from "@/components/MobileMenu";

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const paletteOpen = useAppSelector(selectPaletteOpen);
  const inspectorOpen = useAppSelector(selectInspectorOpen);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useDashboardLoader();

  return (
    <div className="app-container flex h-screen w-screen flex-col overflow-hidden bg-gray-100">
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
      />
    </div>
  );
}
