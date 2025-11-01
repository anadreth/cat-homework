/**
 * Widget Registry
 * Central registry for all widget types with metadata and components
 */

import type { ComponentType } from "react";
import { v4 as uuidv4 } from "uuid";
import type { WidgetType } from "@/store/types";
import { AreaChartWidget } from "@/components/AreaChart/widget";
import { TableWidget } from "@/components/Table/widget";
import { ListWidget } from "@/components/List/widget";
import { TextWidget } from "@/components/Text/widget";

/**
 * Editor field schema for widget properties
 */
export type EditorFieldSchema = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "checkbox" | "json";
  placeholder?: string;
  options?: { value: string; label: string }[];
  description?: string;
};

/**
 * Editor schema for a widget type
 */
export type EditorSchema = {
  sections: {
    title: string;
    fields: EditorFieldSchema[];
  }[];
};

/**
 * Widget metadata for a specific widget type
 */
export type WidgetMeta = {
  type: WidgetType;
  name: string;
  description: string;
  defaultSize: {
    w: number; // Width in columns (1-12)
    h: number; // Height in rows
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultPropsFactory: () => Record<string, any>; // Function that generates fresh props
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  editorSchema: EditorSchema;
};

/**
 * Generate sample data for chart widget (with unique references)
 */
const generateSampleChartData = () => [
  { date: "Jan", revenue: 2500, profit: 1200 },
  { date: "Feb", revenue: 3200, profit: 1500 },
  { date: "Mar", revenue: 2800, profit: 1300 },
  { date: "Apr", revenue: 3500, profit: 1800 },
  { date: "May", revenue: 4200, profit: 2100 },
  { date: "Jun", revenue: 3800, profit: 1900 },
];

/**
 * Generate sample data for table widget (with unique IDs)
 */
const generateSampleTableData = () => [
  { id: uuidv4(), name: "Alice Johnson", role: "Engineer", salary: 95000 },
  { id: uuidv4(), name: "Bob Smith", role: "Designer", salary: 85000 },
  { id: uuidv4(), name: "Carol Williams", role: "Manager", salary: 105000 },
  { id: uuidv4(), name: "David Brown", role: "Engineer", salary: 92000 },
];

/**
 * Generate sample data for list widget (with unique IDs)
 */
const generateSampleListItems = () => [
  {
    id: uuidv4(),
    label: "Complete project proposal",
    description: "Due by end of week",
  },
  { id: uuidv4(), label: "Review code changes", description: "PR #123" },
  { id: uuidv4(), label: "Team standup meeting", description: "Daily at 10am" },
  { id: uuidv4(), label: "Update documentation", description: "API endpoints" },
];

/**
 * Widget Registry - Central source of truth for all widget types
 */
export const WIDGET_REGISTRY: Record<WidgetType, WidgetMeta> = {
  chart: {
    type: "chart",
    name: "Area Chart",
    description: "Display data trends over time with area charts",
    defaultSize: { w: 6, h: 4 },
    defaultPropsFactory: () => ({
      data: generateSampleChartData(),
      index: "date",
      categories: ["revenue", "profit"],
      className: "h-full",
    }),
    component: AreaChartWidget,
    editorSchema: {
      sections: [
        {
          title: "Data",
          fields: [
            {
              key: "data",
              label: "Chart Data",
              type: "json",
              description: "Array of data objects for the chart",
            },
            {
              key: "index",
              label: "Index Field",
              type: "text",
              placeholder: "date",
              description: "Field name to use as x-axis",
            },
          ],
        },
        {
          title: "Appearance",
          fields: [
            {
              key: "className",
              label: "CSS Class",
              type: "text",
              placeholder: "h-full",
            },
          ],
        },
      ],
    },
  },
  table: {
    type: "table",
    name: "Data Table",
    description: "Display structured data in rows and columns",
    defaultSize: { w: 6, h: 4 },
    defaultPropsFactory: () => ({
      data: generateSampleTableData(),
      columns: [
        { key: "name", header: "Name", align: "left" },
        { key: "role", header: "Role", align: "left" },
        { key: "salary", header: "Salary", align: "right" },
      ],
      idKey: "id",
      caption: "Employee Directory",
    }),
    component: TableWidget,
    editorSchema: {
      sections: [
        {
          title: "Data",
          fields: [
            {
              key: "caption",
              label: "Table Caption",
              type: "text",
              placeholder: "Enter table title",
            },
            {
              key: "data",
              label: "Table Data",
              type: "json",
              description: "Array of data objects",
            },
            {
              key: "columns",
              label: "Column Configuration",
              type: "json",
              description: "Array of column definitions",
            },
          ],
        },
      ],
    },
  },
  list: {
    type: "list",
    name: "List",
    description: "Display items in a vertical list",
    defaultSize: { w: 4, h: 4 },
    defaultPropsFactory: () => ({
      title: "Task List",
      items: generateSampleListItems(),
    }),
    component: ListWidget,
    editorSchema: {
      sections: [
        {
          title: "Content",
          fields: [
            {
              key: "title",
              label: "List Title",
              type: "text",
              placeholder: "Enter list title",
            },
            {
              key: "items",
              label: "List Items",
              type: "json",
              description: "Array of list item objects",
            },
          ],
        },
      ],
    },
  },
  text: {
    type: "text",
    name: "Text",
    description: "Display rich text content",
    defaultSize: { w: 4, h: 3 },
    defaultPropsFactory: () => ({
      title: "Welcome",
      content:
        "This is a text widget. You can add any content here.\n\nEdit this widget to customize the text.",
    }),
    component: TextWidget,
    editorSchema: {
      sections: [
        {
          title: "Content",
          fields: [
            {
              key: "title",
              label: "Title",
              type: "text",
              placeholder: "Enter title",
            },
            {
              key: "content",
              label: "Text Content",
              type: "textarea",
              placeholder: "Enter your text here...",
              description: "Supports multiline text",
            },
          ],
        },
      ],
    },
  },
};

/**
 * Get widget metadata by type
 * Returns metadata with fresh default props generated on-demand
 */
export function getWidgetMeta(type: WidgetType): WidgetMeta {
  return WIDGET_REGISTRY[type];
}

/**
 * Get fresh default props for a widget type
 * Calls the factory function to generate unique data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getWidgetDefaultProps(type: WidgetType): Record<string, any> {
  return WIDGET_REGISTRY[type].defaultPropsFactory();
}

/**
 * Component map for rendering widgets
 * Maps widget names to their components for Gridstack rendering
 */
export const WIDGET_COMPONENT_MAP = {
  chart: AreaChartWidget,
  table: TableWidget,
  list: ListWidget,
  text: TextWidget,
} as const;

/**
 * Type for component map
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentMap = Record<string, ComponentType<any>>;
