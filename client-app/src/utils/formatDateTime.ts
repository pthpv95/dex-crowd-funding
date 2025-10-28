/**
 * Format a date/timestamp into a readable string
 * @param date - Date object, timestamp (number), or date string
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string or "Invalid Date" if the date is invalid
 */
export function formatDateTime(
  date: Date | number | string | undefined | null,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    // Handle null/undefined
    if (date == null) {
      return "Invalid Date";
    }

    // Convert to Date object
    let dateObj: Date;
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === "number" || typeof date === "string") {
      dateObj = new Date(date);
    } else {
      return "Invalid Date";
    }

    // Check if date is valid
    if (Number.isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }

    // Default options for date formatting
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options,
    };

    return new Intl.DateTimeFormat("en-US", defaultOptions).format(dateObj);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
}

/**
 * Format a date/timestamp into a full date and time string
 * @param date - Date object, timestamp (number), or date string
 * @returns Formatted date and time string or "Invalid Date" if the date is invalid
 */
export function formatDateTimeFull(
  date: Date | number | string | undefined | null
): string {
  return formatDateTime(date, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a date/timestamp into a short date string (e.g., "Jan 1, 2024")
 * @param date - Date object, timestamp (number), or date string
 * @returns Formatted date string or "Invalid Date" if the date is invalid
 */
export function formatDateShort(
  date: Date | number | string | undefined | null
): string {
  return formatDateTime(date, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date/timestamp into a relative time string (e.g., "2 days ago", "in 3 hours")
 * @param date - Date object, timestamp (number), or date string
 * @returns Relative time string or "Invalid Date" if the date is invalid
 */
export function formatRelativeTime(
  date: Date | number | string | undefined | null
): string {
  try {
    if (date == null) {
      return "Invalid Date";
    }

    let dateObj: Date;
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === "number" || typeof date === "string") {
      dateObj = new Date(date);
    } else {
      return "Invalid Date";
    }

    if (Number.isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }

    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    const diffSeconds = Math.round(diffMs / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    if (Math.abs(diffDays) > 30) {
      return formatDateShort(dateObj);
    }

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    if (Math.abs(diffDays) >= 1) {
      return rtf.format(diffDays, "day");
    }
    if (Math.abs(diffHours) >= 1) {
      return rtf.format(diffHours, "hour");
    }
    if (Math.abs(diffMinutes) >= 1) {
      return rtf.format(diffMinutes, "minute");
    }
    return rtf.format(diffSeconds, "second");
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return "Invalid Date";
  }
}
