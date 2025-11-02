import { type WidgetMeta, WIDGET_REGISTRY } from "@/constants/widget-registry";
import type { WidgetType } from "@/store/types";

export function getWidgetMeta(type: WidgetType): WidgetMeta {
  //TODO remove cast and overload types
  return WIDGET_REGISTRY[type] as WidgetMeta;
}

//TODO remove any
export function getWidgetDefaultProps(type: WidgetType): Record<string, any> {
  return WIDGET_REGISTRY[type].defaultPropsFactory();
}
