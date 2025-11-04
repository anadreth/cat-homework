import type { ComponentType } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  AreaChartWidget,
  type AreaChartWidgetProps,
} from "@/components/AreaChart/widget";
import { TableWidget, type TableWidgetProps } from "@/components/Table/widget";
import { ListWidget, type ListWidgetProps } from "@/components/List/widget";
import { TextWidget, type TextWidgetProps } from "@/components/Text/widget";
import {
  RiBarChartBoxLine,
  RiTableLine,
  RiListUnordered,
  RiText,
  type RemixiconComponentType,
} from "@remixicon/react";

export type EditorFieldSchema = {
  key: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "select"
    | "checkbox"
    | "json"
    | "filters";
  placeholder?: string;
  options?: { value: string; label: string }[];
  description?: string;
};

export type EditorSchema = {
  sections: {
    title: string;
    fields: EditorFieldSchema[];
  }[];
};

export type WidgetProps =
  | AreaChartWidgetProps<Record<string, string | number>, string, string>
  | TableWidgetProps<Record<string, string | number>, string>
  | ListWidgetProps
  | TextWidgetProps;

export type WidgetMeta<TProps extends WidgetProps = WidgetProps> = {
  type: WidgetType;
  name: string;
  description: string;
  defaultSize: {
    w: number;
    h: number;
  };
  defaultPropsFactory: () => TProps;
  component: ComponentType<TProps>;
  editorSchema: EditorSchema;
};

const generateSampleChartData = () => [
  { date: "Jan", revenue: 2500, profit: 1200 },
  { date: "Feb", revenue: 3200, profit: 1500 },
  { date: "Mar", revenue: 2800, profit: 1300 },
  { date: "Apr", revenue: 3500, profit: 1800 },
  { date: "May", revenue: 4200, profit: 2100 },
  { date: "Jun", revenue: 3800, profit: 1900 },
];

const generateSampleTableData = () => [
  { id: uuidv4(), name: "Alice Johnson", role: "Engineer", salary: 95000 },
  { id: uuidv4(), name: "Bob Smith", role: "Designer", salary: 85000 },
  { id: uuidv4(), name: "Carol Williams", role: "Manager", salary: 105000 },
  { id: uuidv4(), name: "David Brown", role: "Engineer", salary: 92000 },
];

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

export type WidgetRegistry = {
  chart: WidgetMeta<
    AreaChartWidgetProps<Record<string, string | number>, string, string>
  >;
  table: WidgetMeta<TableWidgetProps<Record<string, string | number>, string>>;
  list: WidgetMeta<ListWidgetProps>;
  text: WidgetMeta<TextWidgetProps>;
};

export type WidgetType = keyof WidgetRegistry;

export const WIDGET_REGISTRY: WidgetRegistry = {
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
      filters: [],
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
            {
              key: "filters",
              label: "Data Filters",
              type: "filters",
              description: "Filter table rows based on column values",
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

export const WIDGET_COMPONENT_MAP = {
  chart: AreaChartWidget,
  table: TableWidget,
  list: ListWidget,
  text: TextWidget,
};
export const WIDGET_ICONS = {
  chart: RiBarChartBoxLine,
  table: RiTableLine,
  list: RiListUnordered,
  text: RiText,
} satisfies Record<WidgetType, RemixiconComponentType>;

export const WIDGET_COLORS = {
  chart: "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200",
  table: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200",
  list: "bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200",
  text: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200",
} satisfies Record<WidgetType, string>;

export function getWidgetTypes(): WidgetType[] {
  return Object.keys(WIDGET_REGISTRY) as WidgetType[];
}
