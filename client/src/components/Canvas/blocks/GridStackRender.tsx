import type { WidgetComponentMap } from "@/constants/widget-registry";
import { selectLayout, selectAllWidgets } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { type ComponentType, Fragment } from "react";
import { createPortal } from "react-dom";
import { Widget } from "./Widget";

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
              <Widget
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
