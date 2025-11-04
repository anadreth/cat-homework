import { selectLayout, selectAllWidgets } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { Fragment } from "react";
import { createPortal } from "react-dom";
import { Widget } from "./Widget";

type GridStackRenderProps = {
  getWidgetContainer: (widgetId: string) => HTMLElement | null;
};

export const GridStackRender = ({
  getWidgetContainer,
}: GridStackRenderProps) => {
  const layout = useAppSelector(selectLayout);
  const instances = useAppSelector(selectAllWidgets);

  return (
    <>
      {layout.map((layoutItem) => {
        const instance = instances[layoutItem.id];
        if (!instance) return null;

        const widgetContainer = getWidgetContainer(layoutItem.id);
        if (!widgetContainer) {
          return null;
        }

        return (
          <Fragment key={layoutItem.id}>
            {createPortal(
              <Widget widgetId={layoutItem.id} widgetType={instance.type} />,
              widgetContainer
            )}
          </Fragment>
        );
      })}
    </>
  );
};
