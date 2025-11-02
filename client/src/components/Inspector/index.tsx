import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectSelectedId } from "@/store/slices/selectionSlice";
import { selectWidgetById, updateWidgetProps } from "@/store";

import { PropertyEditor } from "./PropertyEditor";
import type { SerializableValue } from "@/store/types";
import { getWidgetMeta } from "@/lib/utils/widgets";

const EmptyInspector = () => {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Inspector</h2>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-sm">No widget selected</p>
          <p className="mt-1 text-xs">Click a widget to edit its properties</p>
        </div>
      </div>
    </div>
  );
};

export function Inspector() {
  const selectedId = useAppSelector(selectSelectedId);
  const selectedWidget = useAppSelector((state) =>
    selectedId ? selectWidgetById(selectedId)(state) : null
  );
  const dispatch = useAppDispatch();

  if (!selectedId || !selectedWidget) {
    return <EmptyInspector />;
  }

  const widgetMeta = getWidgetMeta(selectedWidget.type);

  const handlePropsChange = (newProps: Record<string, SerializableValue>) => {
    console.log("[Inspector] Dispatching updateWidgetProps:", {
      id: selectedId,
      props: newProps,
    });
    dispatch(
      updateWidgetProps({
        id: selectedId,
        props: newProps,
      })
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Inspector</h2>
        <p className="mt-1 text-xs text-gray-500">
          {widgetMeta.name} Properties
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <PropertyEditor
          schema={widgetMeta.editorSchema}
          values={selectedWidget.props}
          onChange={handlePropsChange}
        />
      </div>
    </div>
  );
}
