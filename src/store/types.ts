/**
 * Core type definitions for the dashboard builder
 *
 * These types define the shape of our dashboard data model:
 * - WidgetInstance: Individual widget configuration
 * - LayoutItem: Grid positioning for a widget
 * - DashboardDoc: Complete dashboard document for persistence
 */

/**
 * Supported widget types
 */
export type WidgetType = 'chart' | 'table' | 'list' | 'text';

/**
 * Serializable value types allowed in widget props
 * Must be JSON-serializable for Redux and LocalStorage
 *
 * This is a pragmatic type that covers common widget props without
 * causing "excessively deep" TypeScript errors. It allows:
 * - Primitives: string, number, boolean, null
 * - Arrays of primitives or objects
 * - Objects with primitive values, arrays, or nested objects
 *
 * For more complex nested structures, TypeScript will infer compatibility.
 */
export type SerializableValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[]
  | boolean[]
  | SerializableObject
  | SerializableObject[]
  | Array<string | number | boolean | null | SerializableObject>;

/**
 * Helper type for serializable objects
 * Supports nested structures commonly used in widget data
 */
export type SerializableObject = {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | string[]
    | number[]
    | boolean[]
    | SerializableObject
    | SerializableObject[];
};

/**
 * Widget instance with configuration and data binding
 * Normalized structure - layout is stored separately
 */
export type WidgetInstance = {
  id: string; // Unique identifier (crypto.randomUUID())
  type: WidgetType;
  props: Record<string, SerializableValue>; // Widget-specific configuration (type-safe, serializable)
  dataBinding?: DataBinding; // Optional data source configuration
  createdAt: number; // Unix timestamp in milliseconds (Date.now())
  updatedAt: number; // Unix timestamp in milliseconds (Date.now())
};

/**
 * Data binding configuration for widgets
 * Allows widgets to connect to various data sources
 */
export type DataBinding = {
  source: 'STATIC' | 'REST' | 'SQL' | 'CUSTOM';
  config: {
    endpoint?: string;
    query?: string;
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    params?: Record<string, SerializableValue>; // Type-safe, serializable parameters
    mapping?: Record<string, string>; // Map response fields to widget fields
    refreshInterval?: number; // Auto-refresh in ms
  };
  dataSnapshot?: SerializableValue; // Cached data for offline/export (must be serializable)
};

/**
 * Grid layout item (Gridstack format)
 * Defines position and size of a widget on the canvas
 */
export type LayoutItem = {
  id: string; // Must match WidgetInstance.id
  x: number; // Column position (0-11 in 12-column grid)
  y: number; // Row position
  w: number; // Width in columns
  h: number; // Height in rows
  minW?: number; // Minimum width constraint
  minH?: number; // Minimum height constraint
  maxW?: number; // Maximum width constraint
  maxH?: number; // Maximum height constraint
  locked?: boolean; // Prevent moving/resizing
  noResize?: boolean; // Prevent resizing only
  noMove?: boolean; // Prevent moving only
};

/**
 * Complete dashboard document
 * This is what gets persisted to LocalStorage or exported
 */
export type DashboardDoc = {
  version: number; // Schema version for migrations
  id: string; // Dashboard unique ID
  name: string; // Dashboard name
  description?: string;
  instances: Record<string, WidgetInstance>; // Normalized by ID
  layout: LayoutItem[]; // Array of layout items
  meta: {
    createdAt: number; // Unix timestamp in milliseconds (Date.now())
    updatedAt: number; // Unix timestamp in milliseconds (Date.now())
    exportedAt?: number; // Unix timestamp in milliseconds (for export files)
  };
};

/**
 * Save status for UI feedback
 */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Inspector panel tabs
 */
export type InspectorTab = 'properties' | 'data' | 'appearance';

/**
 * Core state (wrapped with redux-undo)
 */
export type CoreState = {
  dashboard: DashboardDoc;
};

/**
 * Selection state (ephemeral)
 */
export type SelectionState = {
  selectedId: string | null;
};

/**
 * UI state (ephemeral)
 */
export type UIState = {
  inspectorOpen: boolean;
  inspectorTab: InspectorTab;
  paletteOpen: boolean;
  saveStatus: SaveStatus;
  lastSaved: number | null; // Unix timestamp in milliseconds (Date.now()) or null if never saved
};

/**
 * Root Redux state shape
 */
export type RootState = {
  core: {
    past: CoreState[];
    present: CoreState;
    future: CoreState[];
  };
  selection: SelectionState;
  ui: UIState;
};
