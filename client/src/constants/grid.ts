/**
 * Grid configuration for Gridstack.js
 *
 * Following Retool-style dashboard builder principles:
 * - 12-column grid for flexibility
 * - Responsive breakpoints
 * - Sensible cell height for drag/drop UX
 */

/**
 * Number of columns in the grid
 * 12 columns allows for flexible layouts (halves, thirds, quarters, sixths)
 */
export const GRID_COLUMNS = 12;

/**
 * Height of each grid cell in pixels
 * ~60px provides good balance between granularity and usability
 */
export const CELL_HEIGHT = 60;

/**
 * Vertical margin between grid items in pixels
 */
export const VERTICAL_MARGIN = 10;

/**
 * Responsive breakpoints for the grid
 * Mobile-first approach with standard breakpoints
 */
export const GRID_BREAKPOINTS = {
  xs: 0,      // Mobile portrait
  sm: 640,    // Mobile landscape / Small tablet
  md: 768,    // Tablet
  lg: 1024,   // Desktop
  xl: 1280,   // Large desktop
  '2xl': 1536 // Extra large desktop
} as const;

/**
 * Column configuration per breakpoint
 * Adapts the grid to different screen sizes
 */
export const COLUMNS_PER_BREAKPOINT = {
  xs: 1,   // Single column on mobile
  sm: 4,   // 4 columns on small screens
  md: 8,   // 8 columns on tablets
  lg: 12,  // Full 12 columns on desktop
  xl: 12,  // Full 12 columns on large desktop
  '2xl': 12 // Full 12 columns on XL desktop
} as const;

/**
 * Default Gridstack options
 * Applied when initializing the grid
 */
export const DEFAULT_GRID_OPTIONS = {
  column: GRID_COLUMNS,
  cellHeight: CELL_HEIGHT,
  margin: VERTICAL_MARGIN,
  float: true, // Allow items to float up when space is available
  removable: false, // Don't allow dragging out to remove (we'll use delete button)
  acceptWidgets: true, // Allow external widgets to be dropped
  disableOneColumnMode: false, // Enable single-column mode on mobile
  animate: true, // Smooth animations
  minRow: 1, // Minimum number of rows
  resizable: {
    handles: 'e, se, s, sw, w' // All sides except top (header is for dragging)
  }
} as const;

/**
 * Grid constraint constants
 */
export const GRID_CONSTRAINTS = {
  MIN_WIDTH: 1,
  MIN_HEIGHT: 1,
  MAX_WIDTH: GRID_COLUMNS,
  MAX_HEIGHT: 100 // Practical maximum
} as const;
