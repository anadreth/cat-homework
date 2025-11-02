export const now = (): number => Date.now();

export const toDate = (timestamp: number): Date => new Date(timestamp);

export const toTimestamp = (date: Date): number => date.getTime();

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

  return new Date(timestamp).toLocaleDateString();
};

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

export const toISOString = (timestamp: number): string => {
  return toDate(timestamp).toISOString();
};

export const fromISOString = (isoString: string): number => {
  return new Date(isoString).getTime();
};
