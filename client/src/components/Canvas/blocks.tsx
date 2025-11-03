import { Fragment, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { useAppSelector } from "@/store/hooks";
import { selectWidgetById, selectLayout, selectAllWidgets } from "@/store";
import type { WidgetComponentMap } from "@/constants/widget-registry";
import type { WidgetType } from "@/store/types";

export function GridStackRender(props: {
  componentMap: WidgetComponentMap;
  wrapperComponent?: ComponentType<{
    widgetId: string;
    widgetType: string;
    children: React.ReactNode;
  }>;
  getWidgetContainer: (widgetId: string) => HTMLElement | null;
}) {
  // Read widget data directly from Redux (single source of truth)
  const layout = useAppSelector(selectLayout);
  const instances = useAppSelector(selectAllWidgets);
  const WrapperComponent = props.wrapperComponent;

  return (
    <>
      {layout.map((layoutItem) => {
        const instance = instances[layoutItem.id];
        if (!instance) return null;

        const widgetContainer = props.getWidgetContainer(layoutItem.id);
        if (!widgetContainer) {
          // Don't throw - widget container might not be ready yet
          return null;
        }

        return (
          <Fragment key={layoutItem.id}>
            {createPortal(
              <LivePropsWidget
                widgetId={layoutItem.id}
                widgetType={instance.type}
                componentMap={props.componentMap}
                WrapperComponent={WrapperComponent}
              />,
              widgetContainer
            )}
          </Fragment>
        );
      })}
    </>
  );
}

function LivePropsWidget({
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
