import { type WidgetMeta, WIDGET_REGISTRY } from "@/constants/widget-registry";
import type { WidgetType } from "@/store/types";

export function getWidgetMeta(type: WidgetType): WidgetMeta {
  return WIDGET_REGISTRY[type];
}

export function getWidgetDefaultProps(type: WidgetType): Record<string, any> {
  return WIDGET_REGISTRY[type].defaultPropsFactory();
}
