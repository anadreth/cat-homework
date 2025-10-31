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
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  } else {
    return toDate(timestamp).toLocaleDateString();
  }
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
    year: 'numeric',
    month: 'short',
    day: 'numeric',
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
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
