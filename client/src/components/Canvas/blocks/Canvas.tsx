import { useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { CanvasToolbar } from "@/components/CanvasToolbar";
import { useElementPosition } from "@/hooks/useElementPosition";
import { selectIsLayoutEmpty } from "@/store/slices/coreSlice";
import { CanvasContent } from "./CanvasContent";
import { GRID_MIN_W, GRID_MAX_W } from "@/constants/grid";

export function Canvas() {
  const layoutLength = useAppSelector(selectIsLayoutEmpty);
  const canvasRef = useRef<HTMLDivElement>(null);

  const { clearElementPosition } = useElementPosition(canvasRef.current);

  useEffect(() => {
    if (layoutLength && canvasRef.current) {
      clearElementPosition();
    }
  }, [layoutLength, clearElementPosition]);

  return (
    <div className="canvas relative h-full w-full overflow-hidden bg-gray-50">
      <CanvasToolbar />

      <div
        ref={canvasRef}
        className="h-full w-full overflow-x-auto overflow-y-auto p-4"
        style={{ minHeight: "calc(100% - 57px)" }}
      >
        <div
          className="mx-auto"
          style={{
            minWidth: GRID_MIN_W,
            maxWidth: GRID_MAX_W,
          }}
        >
          <CanvasContent />
        </div>
      </div>
    </div>
  );
}
