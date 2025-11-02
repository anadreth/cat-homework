import { useEffect, useRef } from "react";
import { GridStack } from "gridstack";
import {
  WIDGET_COLORS,
  WIDGET_ICONS,
  WIDGET_REGISTRY,
} from "@/constants/widget-registry";
import type { WidgetType } from "@/store/types";
import { useAppDispatch } from "@/store/hooks";
import { addWidget } from "@/store";

import { getWidgetDefaultProps } from "@/lib/utils/widgets";

const widgetTypes = Object.keys(WIDGET_REGISTRY) as WidgetType[];

export function Palette() {
  const paletteRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const lastTapRef = useRef<{
    type: WidgetType | null;
    time: number;
  }>({
    type: null,
    time: 0,
  });

  useEffect(() => {
    if (!paletteRef.current) return;

    const items = Array.from(
      paletteRef.current.querySelectorAll(".palette-item")
    ) as HTMLElement[];

    GridStack.setupDragIn(items, {
      appendTo: "body",
      helper: "clone",
    });
  }, []);

  const addWidgetToCanvas = (type: WidgetType) => {
    const meta = WIDGET_REGISTRY[type];
    const props = getWidgetDefaultProps(type);

    dispatch(
      addWidget({
        type,
        layout: {
          x: 0,
          y: 0,
          w: meta.defaultSize.w,
          h: meta.defaultSize.h,
        },
        props,
      })
    );
  };

  const handleDoubleClick = (type: WidgetType) => {
    addWidgetToCanvas(type);
  };

  const handleTouchEnd = (type: WidgetType) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current.time;

    if (timeSinceLastTap < 300 && lastTapRef.current.type === type) {
      addWidgetToCanvas(type);
      lastTapRef.current = { type: null, time: 0 };
    } else {
      lastTapRef.current = { type, time: now };
    }
  };

  return (
    <div ref={paletteRef} className="flex h-full flex-col">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Widget Palette</h2>
        <p className="mt-1 text-xs text-gray-500">
          <span className="hidden lg:inline">Drag widgets onto the canvas</span>
          <span className="lg:hidden">Double-tap to add widget</span>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {widgetTypes.map((type) => {
          const meta = WIDGET_REGISTRY[type];
          const Icon = WIDGET_ICONS[type];
          const colorClass = WIDGET_COLORS[type];

          return (
            <div
              key={type}
              className={`palette-item cursor-move rounded border-2 p-3 transition-all ${colorClass}`}
              data-gs-width={meta.defaultSize.w}
              data-gs-height={meta.defaultSize.h}
              data-widget-type={type}
              onDoubleClick={() => handleDoubleClick(type)}
              onTouchEnd={() => handleTouchEnd(type)}
              role="button"
              tabIndex={0}
              aria-label={`Add ${meta.name} widget`}
            >
              <div className="flex items-start gap-2">
                <Icon size={20} className="mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{meta.name}</div>
                  <div className="mt-0.5 text-xs opacity-75">
                    {meta.description}
                  </div>
                  <div className="mt-1 text-xs font-mono opacity-60">
                    {meta.defaultSize.w}×{meta.defaultSize.h}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
