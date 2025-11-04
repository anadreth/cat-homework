import { WidgetWrapper } from "@/components/WidgetWrapper";
import { WIDGET_COMPONENT_MAP, type WidgetType } from "@/constants/widget-registry";
import { selectWidgetById } from "@/store";
import { useAppSelector } from "@/store/hooks";

export function Widget<T extends WidgetType>({
  widgetId,
  widgetType,
}: {
  widgetId: string;
  widgetType: T;
}) {
  const widget = useAppSelector((state) => selectWidgetById(widgetId)(state));

  if (!widget) return null;

  const Comp = WIDGET_COMPONENT_MAP[widgetType] as React.FC<unknown>;

  return (
    <WidgetWrapper widgetId={widgetId} widgetType={widgetType}>
      <Comp {...widget.props} />
    </WidgetWrapper>
  );
}
