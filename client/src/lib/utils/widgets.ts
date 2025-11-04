import { WIDGET_REGISTRY } from "@/constants/widget-registry";
import type { WidgetType } from "@/store/types";

export function getWidgetMeta(type: WidgetType) {
  return WIDGET_REGISTRY[type];
}

export function getWidgetDefaultProps(type: WidgetType) {
  return WIDGET_REGISTRY[type].defaultPropsFactory();
}
