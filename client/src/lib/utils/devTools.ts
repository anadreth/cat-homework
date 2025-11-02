import type { AppDispatch } from "@/store";
import { addWidget } from "@/store";
import type { WidgetType } from "@/store/types";
import { getWidgetDefaultProps, getWidgetMeta } from "./widgets";

export const addTestWidget = (dispatch: AppDispatch, type: WidgetType) => {
  const meta = getWidgetMeta(type);

  const x = Math.floor(Math.random() * (12 - meta.defaultSize.w));
  const y = Math.floor(Math.random() * 5);

  dispatch(
    addWidget({
      type,
      layout: {
        x,
        y,
        w: meta.defaultSize.w,
        h: meta.defaultSize.h,
      },
      props: getWidgetDefaultProps(type) as Record<
        string,
        import("@/store/types").SerializableValue
      >,
    })
  );
};

export const addMultipleTestWidgets = (dispatch: AppDispatch) => {
  const widgets: Array<{ type: WidgetType; x: number; y: number }> = [
    { type: "chart", x: 0, y: 0 },
    { type: "table", x: 6, y: 0 },
    { type: "list", x: 0, y: 4 },
    { type: "text", x: 4, y: 4 },
  ];

  widgets.forEach((widget) => {
    const meta = getWidgetMeta(widget.type);

    dispatch(
      addWidget({
        type: widget.type,
        layout: {
          x: widget.x,
          y: widget.y,
          w: meta.defaultSize.w,
          h: meta.defaultSize.h,
        },
        props: getWidgetDefaultProps(widget.type) as Record<
          string,
          import("@/store/types").SerializableValue
        >,
      })
    );
  });
};
