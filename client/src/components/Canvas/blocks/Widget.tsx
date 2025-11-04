import type { WidgetComponentMap } from "@/constants/widget-registry";
import { selectWidgetById } from "@/store";
import { useAppSelector } from "@/store/hooks";
import type { WidgetType } from "@/store/types";
import type { ComponentType } from "react";

export function Widget({
  widgetId,
  widgetType,
  componentMap,
  WrapperComponent,
}: {
  widgetId: string;
  widgetType: WidgetType;
  componentMap: WidgetComponentMap;
  WrapperComponent?: ComponentType<{
    widgetId: string;
    widgetType: string;
    children: React.ReactNode;
  }>;
}) {
  const widget = useAppSelector((state) => selectWidgetById(widgetId)(state));

  const WidgetComponent = componentMap[widgetType] as ComponentType<any>;

  if (!WidgetComponent) {
    console.error(
      `[LivePropsWidget] Component not found for type: ${widgetType}`
    );
    return null;
  }

  if (!widget) {
    return null;
  }

  const widgetContent = <WidgetComponent {...widget.props} />;

  if (WrapperComponent) {
    return (
      <WrapperComponent widgetId={widgetId} widgetType={widgetType}>
        {widgetContent}
      </WrapperComponent>
    );
  }

  return widgetContent;
}
