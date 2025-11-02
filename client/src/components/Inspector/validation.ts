import { z } from "zod";
import type { EditorSchema } from "@/constants/widget-registry";
import type { SerializableValue } from "@/store/types";

export function createValidationSchema(editorSchema: EditorSchema) {
  const shape: Record<string, z.ZodType<SerializableValue>> = {};

  editorSchema.sections.forEach((section) => {
    section.fields.forEach((field) => {
      switch (field.type) {
        case "text":
          shape[field.key] = z
            .string()
            .min(1, "This field is required")
            .max(500, "Maximum 500 characters");
          break;

        case "textarea":
          shape[field.key] = z
            .string()
            .min(1, "This field is required")
            .max(5000, "Maximum 5000 characters");
          break;

        case "number":
          shape[field.key] = z
            .number()
            .min(0, "Must be positive")
            .max(999999, "Value too large");
          break;

        case "json":
          shape[field.key] = z
            .string()
            .min(1, "JSON data is required")
            .refine(
              (val) => {
                try {
                  JSON.parse(val);
                  return true;
                } catch {
                  return false;
                }
              },
              { message: "Invalid JSON format" }
            );
          break;

        case "select":
          shape[field.key] = z.string().min(1, "Please select an option");
          break;

        case "checkbox":
          shape[field.key] = z.boolean();
          break;

        case "filters":
          shape[field.key] = z
            .array(
              z.object({
                column: z.string().min(1, "Column is required"),
                operator: z.enum([
                  "equals",
                  "notEquals",
                  "contains",
                  "notContains",
                  "greaterThan",
                  "lessThan",
                  "greaterThanOrEqual",
                  "lessThanOrEqual",
                ]),
                value: z.union([z.string(), z.number()]).refine(
                  (val) => val !== "" && val !== null && val !== undefined,
                  "Value is required"
                ),
              })
            )
            .optional() as any;
          break;

        default:
          shape[field.key] = z.any();
      }
    });
  });

  return z.object(shape);
}
