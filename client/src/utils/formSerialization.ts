/**
 * Form Serialization Utilities
 *
 * Handles conversion between Redux data structures and form-editable strings.
 * Primarily used for JSON fields that store arrays/objects but need to be
 * edited as text in textareas.
 */

import type { EditorSchema } from "@/constants/widget-registry";
import type { SerializableValue } from "@/store/types";

/**
 * Serialize widget props for form display
 * Converts JSON objects to formatted strings for textarea editing
 *
 * @param props - Widget properties from Redux
 * @param editorSchema - Schema defining which fields are JSON
 * @returns Props with JSON fields converted to pretty-printed strings
 *
 * @example
 * // Input (from Redux):
 * { title: "Chart", data: [{x: 1, y: 2}] }
 *
 * // Output (for form):
 * { title: "Chart", data: "[\n  {\n    \"x\": 1,\n    \"y\": 2\n  }\n]" }
 */
export function serializePropsForForm(
  props: Record<string, SerializableValue>,
  editorSchema: EditorSchema
): Record<string, SerializableValue | string> {
  const serialized: Record<string, SerializableValue | string> = { ...props };

  editorSchema.sections.forEach((section) => {
    section.fields.forEach((field) => {
      if (field.type === "json" && props[field.key] !== undefined) {
        // Convert object/array to pretty-printed JSON string
        serialized[field.key] = JSON.stringify(props[field.key], null, 2);
      }
    });
  });

  return serialized;
}

/**
 * Deserialize form values back to widget props
 * Parses JSON strings back to objects/arrays for Redux storage
 *
 * @param formValues - Form values with JSON strings
 * @param editorSchema - Schema defining which fields are JSON
 * @returns Props with JSON strings parsed back to objects/arrays
 *
 * @example
 * // Input (from form):
 * { title: "Chart", data: "[{\"x\": 1, \"y\": 2}]" }
 *
 * // Output (for Redux):
 * { title: "Chart", data: [{x: 1, y: 2}] }
 */
export function deserializePropsFromForm(
  formValues: Record<string, SerializableValue | string>,
  editorSchema: EditorSchema
): Record<string, SerializableValue> {
  const deserialized: Record<string, SerializableValue> = {
    ...formValues,
  } as Record<string, SerializableValue>;

  editorSchema.sections.forEach((section) => {
    section.fields.forEach((field) => {
      if (field.type === "json" && formValues[field.key] !== undefined) {
        try {
          // Parse JSON string back to JavaScript object/array
          deserialized[field.key] = JSON.parse(
            formValues[field.key] as string
          ) as SerializableValue;
        } catch {
          // If parsing fails, keep the string value
          // Validation will catch this and show an error to the user
          deserialized[field.key] = formValues[field.key] as SerializableValue;
        }
      }
    });
  });

  return deserialized;
}
