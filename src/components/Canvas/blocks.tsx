import {
  GridStack,
  type GridItemHTMLElement,
  type GridStackOptions,
  type GridStackWidget,
} from "gridstack";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type PropsWithChildren,
} from "react";
import isEqual from "react-fast-compare";
import { createPortal } from "react-dom";

export const GridStackContext = createContext<{
  initialOptions: GridStackOptions;
  gridStack: GridStack | null;
  addWidget: (
    widget: GridStackWidget & { id: Required<GridStackWidget>["id"] }
  ) => void;
  removeWidget: (id: string) => void;
  addSubGrid: (
    subGrid: GridStackWidget & {
      id: Required<GridStackWidget>["id"];
      subGridOpts: Required<GridStackWidget>["subGridOpts"] & {
        children: Array<
          GridStackWidget & { id: Required<GridStackWidget>["id"] }
        >;
      };
    }
  ) => void;
  saveOptions: () => GridStackOptions | GridStackWidget[] | undefined;
  removeAll: () => void;

  _gridStack: {
    value: GridStack | null;
    set: React.Dispatch<React.SetStateAction<GridStack | null>>;
  };
  _rawWidgetMetaMap: {
    value: Map<string, GridStackWidget>;
    set: React.Dispatch<React.SetStateAction<Map<string, GridStackWidget>>>;
  };
} | null>(null);

export function useGridStackContext() {
  const context = useContext(GridStackContext);
  if (!context) {
    throw new Error(
      "useGridStackContext must be used within a GridStackProvider"
    );
  }
  return context;
}

export function GridStackProvider({
  children,
  initialOptions,
}: PropsWithChildren<{ initialOptions: GridStackOptions }>) {
  const [gridStack, setGridStack] = useState<GridStack | null>(null);
  const [rawWidgetMetaMap, setRawWidgetMetaMap] = useState(() => {
    const map = new Map<string, GridStackWidget>();
    const deepFindNodeWithContent = (obj: GridStackWidget) => {
      if (obj.id && obj.content) {
        map.set(obj.id, obj);
      }
      if (obj.subGridOpts?.children) {
        obj.subGridOpts.children.forEach((child: GridStackWidget) => {
          deepFindNodeWithContent(child);
        });
      }
    };
    initialOptions.children?.forEach((child: GridStackWidget) => {
      deepFindNodeWithContent(child);
    });
    return map;
  });

  const addWidget = useCallback(
    (widget: GridStackWidget & { id: Required<GridStackWidget>["id"] }) => {
      gridStack?.addWidget(widget);
      setRawWidgetMetaMap((prev) => {
        const newMap = new Map<string, GridStackWidget>(prev);
        newMap.set(widget.id, widget);
        return newMap;
      });
    },
    [gridStack]
  );

  const addSubGrid = useCallback(
    (
      subGrid: GridStackWidget & {
        id: Required<GridStackWidget>["id"];
        subGridOpts: Required<GridStackWidget>["subGridOpts"] & {
          children: Array<
            GridStackWidget & { id: Required<GridStackWidget>["id"] }
          >;
        };
      }
    ) => {
      gridStack?.addWidget(subGrid);

      setRawWidgetMetaMap((prev) => {
        const newMap = new Map<string, GridStackWidget>(prev);
        subGrid.subGridOpts?.children?.forEach(
          (meta: GridStackWidget & { id: Required<GridStackWidget>["id"] }) => {
            newMap.set(meta.id, meta);
          }
        );
        return newMap;
      });
    },
    [gridStack]
  );

  const removeWidget = useCallback(
    (id: string) => {
      const element = document.body.querySelector<GridItemHTMLElement>(
        `[gs-id="${id}"]`
      );
      if (element) gridStack?.removeWidget(element);

      setRawWidgetMetaMap((prev) => {
        const newMap = new Map<string, GridStackWidget>(prev);
        newMap.delete(id);
        return newMap;
      });
    },
    [gridStack]
  );

  const saveOptions = useCallback(() => {
    return gridStack?.save(true, true, (_, widget) => widget);
  }, [gridStack]);

  const removeAll = useCallback(() => {
    gridStack?.removeAll();
    setRawWidgetMetaMap(new Map<string, GridStackWidget>());
  }, [gridStack]);

  return (
    <GridStackContext.Provider
      value={{
        initialOptions,
        gridStack,

        addWidget,
        removeWidget,
        addSubGrid,
        saveOptions,
        removeAll,

        _gridStack: {
          value: gridStack,
          set: setGridStack,
        },
        _rawWidgetMetaMap: {
          value: rawWidgetMetaMap,
          set: setRawWidgetMetaMap,
        },
      }}
    >
      {children}
    </GridStackContext.Provider>
  );
}

export const GridStackRenderContext = createContext<{
  getWidgetContainer: (widgetId: string) => HTMLElement | null;
} | null>(null);

export function useGridStackRenderContext() {
  const context = useContext(GridStackRenderContext);
  if (!context) {
    throw new Error(
      "useGridStackRenderContext must be used within a GridStackProvider"
    );
  }
  return context;
}

// WeakMap to store widget containers for each grid instance
export const gridWidgetContainersMap = new WeakMap<
  GridStack,
  Map<string, HTMLElement>
>();

export function GridStackRenderProvider({ children }: PropsWithChildren) {
  const {
    _gridStack: { value: gridStack, set: setGridStack },
    initialOptions,
  } = useGridStackContext();

  const widgetContainersRef = useRef<Map<string, HTMLElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<GridStackOptions>(initialOptions);

  const renderCBFn = useCallback(
    (element: HTMLElement, widget: GridStackWidget & { grid?: GridStack }) => {
      if (widget.id && widget.grid) {
        // Get or create the widget container map for this grid instance
        let containers = gridWidgetContainersMap.get(widget.grid);
        if (!containers) {
          containers = new Map<string, HTMLElement>();
          gridWidgetContainersMap.set(widget.grid, containers);
        }
        containers.set(widget.id, element);

        // Also update the local ref for backward compatibility
        widgetContainersRef.current.set(widget.id, element);
      }
    },
    []
  );

  const initGrid = useCallback(() => {
    if (containerRef.current) {
      GridStack.renderCB = renderCBFn;
      return GridStack.init(optionsRef.current, containerRef.current);
      // ! Change event not firing on nested grids (resize, move...) https://github.com/gridstack/gridstack.js/issues/2671
      // .on("change", () => {
      //   console.log("changed");
      // })
      // .on("resize", () => {
      //   console.log("resize");
      // })
    }
    return null;
  }, [renderCBFn]);

  useLayoutEffect(() => {
    if (!isEqual(initialOptions, optionsRef.current) && gridStack) {
      try {
        gridStack.removeAll(false);
        gridStack.destroy(false);
        widgetContainersRef.current.clear();
        // Clean up the WeakMap entry for this grid instance
        gridWidgetContainersMap.delete(gridStack);
        optionsRef.current = initialOptions;
        setGridStack(initGrid());
      } catch (e) {
        console.error("Error reinitializing gridstack", e);
      }
    }
  }, [initialOptions, gridStack, initGrid, setGridStack]);

  useLayoutEffect(() => {
    if (!gridStack) {
      try {
        setGridStack(initGrid());
      } catch (e) {
        console.error("Error initializing gridstack", e);
      }
    }
  }, [gridStack, initGrid, setGridStack]);

  return (
    <GridStackRenderContext.Provider
      value={useMemo(
        () => ({
          getWidgetContainer: (widgetId: string) => {
            // First try to get from the current grid instance's map
            if (gridStack) {
              const containers = gridWidgetContainersMap.get(gridStack);
              if (containers?.has(widgetId)) {
                return containers.get(widgetId) || null;
              }
            }
            // Fallback to local ref for backward compatibility
            return widgetContainersRef.current.get(widgetId) || null;
          },
        }),
        // ! gridStack is required to reinitialize the grid when the options change
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [gridStack]
      )}
    >
      <div ref={containerRef}>{gridStack ? children : null}</div>
    </GridStackRenderContext.Provider>
  );
}

export interface ComponentDataType<T = object> {
  name: string;
  props: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentMap = Record<string, ComponentType<any>>;

function parseWeightMetaToComponentData(
  meta: GridStackWidget
): ComponentDataType & { error: unknown } {
  let error = null;
  let name = "";
  let props = {};
  try {
    if (meta.content) {
      const result = JSON.parse(meta.content) as {
        name: string;
        props: object;
      };
      name = result.name;
      props = result.props;
    }
  } catch (e) {
    error = e;
  }
  return {
    name,
    props,
    error,
  };
}

export function GridStackRender(props: {
  componentMap: ComponentMap;
  wrapperComponent?: ComponentType<{
    widgetId: string;
    widgetType: string;
    children: React.ReactNode
  }>;
}) {
  const { _rawWidgetMetaMap } = useGridStackContext();
  const { getWidgetContainer } = useGridStackRenderContext();
  const WrapperComponent = props.wrapperComponent;

  return (
    <>
      {Array.from(_rawWidgetMetaMap.value.entries()).map(([id, meta]) => {
        const componentData = parseWeightMetaToComponentData(meta);

        const WidgetComponent = props.componentMap[componentData.name];

        const widgetContainer = getWidgetContainer(id);

        if (!widgetContainer) {
          throw new Error(`Widget container not found for id: ${id}`);
        }

        const widgetContent = <WidgetComponent {...componentData.props} />;

        return (
          <GridStackWidgetContext.Provider key={id} value={{ widget: { id } }}>
            {createPortal(
              WrapperComponent ? (
                <WrapperComponent
                  widgetId={id}
                  widgetType={componentData.name}
                >
                  {widgetContent}
                </WrapperComponent>
              ) : (
                widgetContent
              ),
              widgetContainer
            )}
          </GridStackWidgetContext.Provider>
        );
      })}
    </>
  );
}

export const GridStackWidgetContext = createContext<{
  widget: {
    id: string;
  };
} | null>(null);

export function useGridStackWidgetContext() {
  const context = useContext(GridStackWidgetContext);
  if (!context) {
    throw new Error(
      "useGridStackWidgetContext must be used within a GridStackWidgetProvider"
    );
  }
  return context;
}
