import { z } from "zod";
import type { DashboardDoc } from "@/store/types";
import type { WidgetExportDoc } from "./export";
import { WIDGET_REGISTRY } from "@/constants/widget-registry";
import { CURRENT_VERSION } from "@/constants/validation";

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const WidgetInstanceSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["chart", "table", "list", "text"] as const),
  props: z.record(z.string(), z.any()),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const DashboardSchema = z.object({
  version: z.number().min(1, "Invalid version number"),
  id: z.string().uuid("Invalid dashboard ID format"),
  name: z.string().min(1, "Dashboard name is required"),
  description: z.string().optional(),
  instances: z.record(z.string(), WidgetInstanceSchema),
  layout: z.array(
    z.object({
      id: z.string().uuid(),
      x: z.number().min(0),
      y: z.number().min(0),
      w: z.number().min(1),
      h: z.number().min(1),
      minW: z.number().optional(),
      minH: z.number().optional(),
      maxW: z.number().optional(),
      maxH: z.number().optional(),
      locked: z.boolean().optional(),
      noResize: z.boolean().optional(),
      noMove: z.boolean().optional(),
    })
  ),
  meta: z.object({
    createdAt: z.number(),
    updatedAt: z.number(),
    exportedAt: z.number().optional(),
  }),
});

const WidgetExportSchema = z.object({
  version: z.number().min(1),
  widgetType: z.enum(["chart", "table", "list", "text"] as const),
  widget: WidgetInstanceSchema,
  layout: z.object({
    id: z.string().uuid(),
    x: z.number().min(0),
    y: z.number().min(0),
    w: z.number().min(1),
    h: z.number().min(1),
    minW: z.number().optional(),
    minH: z.number().optional(),
    maxW: z.number().optional(),
    maxH: z.number().optional(),
    locked: z.boolean().optional(),
    noResize: z.boolean().optional(),
    noMove: z.boolean().optional(),
  }),
  exportedAt: z.number(),
  exportedFrom: z.string().optional(),
});

export function validateDashboardImport(
  json: string
): ValidationResult<DashboardDoc> {
  try {
    const parsed = JSON.parse(json);

    const result = DashboardSchema.safeParse(parsed);

    if (!result.success) {
      const errors = result.error.issues.map((e) => e.message).join(", ");
      return {
        success: false,
        error: `Invalid dashboard format: ${errors}`,
      };
    }

    if (result.data.version > CURRENT_VERSION) {
      return {
        success: false,
        error: `Dashboard version ${result.data.version} is newer than supported version ${CURRENT_VERSION}. Please update the application.`,
      };
    }

    const invalidTypes: string[] = [];
    Object.values(result.data.instances).forEach((instance) => {
      if (!WIDGET_REGISTRY[instance.type]) {
        invalidTypes.push(instance.type);
      }
    });

    if (invalidTypes.length > 0) {
      return {
        success: false,
        error: `Unknown widget types: ${invalidTypes.join(", ")}`,
      };
    }

    return {
      success: true,
      data: result.data as DashboardDoc,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Invalid JSON format",
    };
  }
}

export function validateWidgetImport(
  json: string
): ValidationResult<WidgetExportDoc> {
  try {
    const parsed = JSON.parse(json);
    const result = WidgetExportSchema.safeParse(parsed);

    if (!result.success) {
      const errors = result.error.issues.map((e) => e.message).join(", ");
      return {
        success: false,
        error: `Invalid widget format: ${errors}`,
      };
    }

    if (result.data.version > CURRENT_VERSION) {
      return {
        success: false,
        error: `Widget version ${result.data.version} is newer than supported version ${CURRENT_VERSION}`,
      };
    }

    if (!WIDGET_REGISTRY[result.data.widgetType]) {
      return {
        success: false,
        error: `Unknown widget type: ${result.data.widgetType}`,
      };
    }

    return {
      success: true,
      data: result.data as WidgetExportDoc,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Invalid JSON format",
    };
  }
}

export function readJSONFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith(".json")) {
      reject(new Error("File must be a .json file"));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        resolve(text);
      } else {
        reject(new Error("Failed to read file contents"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}
