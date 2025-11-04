import { WIDGET_REGISTRY, type WidgetType } from "@/constants/widget-registry";

export function getWidgetMeta(type: WidgetType) {
  return WIDGET_REGISTRY[type];
}

export function getWidgetDefaultProps(type: WidgetType) {
  return WIDGET_REGISTRY[type].defaultPropsFactory();
}
