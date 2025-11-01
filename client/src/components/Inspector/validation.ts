/**
 * Validation schemas for widget properties using Zod
 *
 * This module is responsible for generating Zod validation schemas
 * from editor field definitions. It validates form input but does NOT
 * handle data transformation - see utils/formSerialization.ts for that.
 */

import { z } from "zod";
import type { EditorSchema } from "@/constants/widget-registry";

/**
 * Create a Zod schema from editor field schema
 *
 * Generates validation rules based on field types:
 * - text: string with length limits
 * - textarea: string with larger length limits
 * - number: positive numbers
 * - json: validates JSON syntax (as string)
 * - select: non-empty string
 * - checkbox: boolean
 *
 * @param editorSchema - Widget editor schema from registry
 * @returns Zod object schema for react-hook-form validation
 */
export function createValidationSchema(editorSchema: EditorSchema) {
  const shape: Record<string, z.ZodTypeAny> = {};

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
          // For JSON fields, we validate the string can be parsed as JSON
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

        default:
          shape[field.key] = z.any();
      }
    });
  });

  return z.object(shape);
}
