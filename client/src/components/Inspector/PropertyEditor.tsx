import { useEffect, useMemo, useCallback, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { EditorSchema } from "@/constants/widget-registry";
import type { SerializableValue } from "@/store/types";
import { Input } from "@/components/Input/blocks";
import { Label } from "@/components/Label/blocks";
import { FilterEditor } from "@/components/FilterEditor";
import { createValidationSchema } from "./validation";
import {
  serializePropsForForm,
  deserializePropsFromForm,
} from "@/lib/utils/formSerialization";

export interface PropertyEditorProps {
  schema: EditorSchema;
  values: Record<string, SerializableValue>;
  onChange: (values: Record<string, SerializableValue>) => void;
}

export function PropertyEditor({
  schema,
  values,
  onChange,
}: PropertyEditorProps) {
  const validationSchema = useMemo(
    () => createValidationSchema(schema),
    [schema]
  );

  const defaultValues = useMemo(
    () => serializePropsForForm(values, schema),
    [values, schema]
  );

  const {
    register,
    watch,
    reset,
    control,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues,
    resolver: zodResolver(validationSchema),
    mode: "onChange",
  });

  const getAvailableColumns = useCallback((fieldKey: string): string[] => {
    if (fieldKey === "filters") {
      try {
        const columnsValue = watch("columns");
        const columns = typeof columnsValue === "string"
          ? JSON.parse(columnsValue)
          : columnsValue;
        return columns?.map((col: any) => col.key) || [];
      } catch {
        return [];
      }
    }
    return [];
  }, [watch]);

  useEffect(() => {
    const serialized = serializePropsForForm(values, schema);
    reset(serialized);
  }, [values, schema, reset]);

  //TODO pull into useDebounce hook + usePropertyEditorForm
  const debounceTimerRef = useRef<number | null>(null);
  const debouncedOnChange = useCallback(
    async (formValues: Record<string, SerializableValue | string>) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = window.setTimeout(async () => {
        const isValid = await trigger();

        if (isValid) {
          const deserialized = deserializePropsFromForm(formValues, schema);
          onChange(deserialized);
        }
      }, 300);
    },
    [onChange, schema, trigger, errors]
  );

  useEffect(() => {
    const subscription = watch((formValues) => {
      debouncedOnChange(
        formValues as Record<string, SerializableValue | string>
      );
    });
    return () => {
      subscription.unsubscribe();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [watch, debouncedOnChange]);

  //TODO refactor into field components with FormProvider and useFormContext
  return (
    <div className="space-y-6">
      {schema.sections.map((section) => (
        <div key={section.title} className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">
            {section.title}
          </h3>

          <div className="space-y-3">
            {section.fields.map((field) => (
              <div key={field.key} className="space-y-1">
                <Label htmlFor={field.key}>{field.label}</Label>

                {field.type === "text" && (
                  <>
                    <Input
                      id={field.key}
                      {...register(field.key)}
                      placeholder={field.placeholder}
                      className="w-full"
                    />
                    {errors[field.key] && (
                      <p className="text-xs text-red-600">
                        {errors[field.key]?.message as string}
                      </p>
                    )}
                  </>
                )}

                {field.type === "textarea" && (
                  <>
                    <textarea
                      id={field.key}
                      {...register(field.key)}
                      placeholder={field.placeholder}
                      rows={4}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    {errors[field.key] && (
                      <p className="text-xs text-red-600">
                        {errors[field.key]?.message as string}
                      </p>
                    )}
                  </>
                )}

                {field.type === "number" && (
                  <>
                    <Input
                      id={field.key}
                      type="number"
                      {...register(field.key, { valueAsNumber: true })}
                      placeholder={field.placeholder}
                      className="w-full"
                    />
                    {errors[field.key] && (
                      <p className="text-xs text-red-600">
                        {errors[field.key]?.message as string}
                      </p>
                    )}
                  </>
                )}

                {field.type === "json" && (
                  <>
                    <textarea
                      id={field.key}
                      {...register(field.key)}
                      placeholder={field.placeholder || "Enter JSON data"}
                      rows={6}
                      className={`w-full rounded-md border px-3 py-2 font-mono text-xs focus:outline-none focus:ring-1 ${
                        errors[field.key]
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      }`}
                    />
                    {errors[field.key] && (
                      <p className="text-xs text-red-600">
                        {errors[field.key]?.message as string}
                      </p>
                    )}
                  </>
                )}

                {field.type === "filters" && (
                  <Controller
                    name={field.key}
                    control={control}
                    render={({ field: controllerField }) => (
                      <FilterEditor
                        value={Array.isArray(controllerField.value) ? controllerField.value : []}
                        onChange={controllerField.onChange}
                        availableColumns={getAvailableColumns(field.key)}
                        errors={errors[field.key] as any}
                      />
                    )}
                  />
                )}

                {field.description && (
                  <p className="text-xs text-gray-500">{field.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
