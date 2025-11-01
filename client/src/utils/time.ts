/**
 * Time utilities for working with timestamps
 *
 * We store timestamps as numbers (Unix milliseconds) in Redux
 * for serialization. These utilities help convert to/from Date
 * objects and format for display.
 */

/**
 * Get current timestamp
 * @returns Unix timestamp in milliseconds
 */
export const now = (): number => Date.now();

/**
 * Convert timestamp to Date object
 * @param timestamp Unix timestamp in milliseconds
 * @returns Date object
 */
export const toDate = (timestamp: number): Date => new Date(timestamp);

/**
 * Convert Date to timestamp
 * @param date Date object
 * @returns Unix timestamp in milliseconds
 */
export const toTimestamp = (date: Date): number => date.getTime();

/**
 * Format timestamp as relative time (e.g., "2 minutes ago")
 * @param timestamp Unix timestamp in milliseconds
 * @returns Formatted relative time string
 */
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;

  // Format as date for older saves
  return new Date(timestamp).toLocaleDateString();
};

/**
 * Format timestamp as date string
 * @param timestamp Unix timestamp in milliseconds
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  timestamp: number,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string => {
  return toDate(timestamp).toLocaleDateString(undefined, options);
};

/**
 * Format timestamp as date and time string
 * @param timestamp Unix timestamp in milliseconds
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date and time string
 */
export const formatDateTime = (
  timestamp: number,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
): string => {
  return toDate(timestamp).toLocaleString(undefined, options);
};

/**
 * Format timestamp as ISO 8601 string
 * @param timestamp Unix timestamp in milliseconds
 * @returns ISO 8601 date string
 */
export const toISOString = (timestamp: number): string => {
  return toDate(timestamp).toISOString();
};

/**
 * Parse ISO 8601 string to timestamp
 * @param isoString ISO 8601 date string
 * @returns Unix timestamp in milliseconds
 */
export const fromISOString = (isoString: string): number => {
  return new Date(isoString).getTime();
};
