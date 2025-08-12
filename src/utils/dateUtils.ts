import { logger } from './logger';

/**
 * Date and time formatting utilities
 */

/**
 * Formats a date to a relative time string (e.g., "2 hours ago")
 * @param date Date object, date string, or timestamp
 * @returns Relative time string
 */
export const formatDistanceToNow = (date: string | Date | number): string => {
  try {
    const now = new Date();
    const targetDate = new Date(date);

    if (isNaN(targetDate.getTime())) {
      return 'Invalid date';
    }

    const diffInSeconds = Math.floor(
      (now.getTime() - targetDate.getTime()) / 1000
    );

    if (diffInSeconds < 0) {
      return 'in the future';
    }

    if (diffInSeconds < 60) {
      return 'just now';
    }

    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }

    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }

    if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    }

    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months === 1 ? '' : 's'} ago`;
    }

    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years === 1 ? '' : 's'} ago`;
  } catch (error) {
    logger.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Formats a date to a short relative time string (e.g., "2h ago")
 * @param date Date object, date string, or timestamp
 * @returns Short relative time string
 */
export const formatShortDistanceToNow = (
  date: string | Date | number
): string => {
  try {
    const now = new Date();
    const targetDate = new Date(date);

    if (isNaN(targetDate.getTime())) {
      return 'Invalid';
    }

    const diffInSeconds = Math.floor(
      (now.getTime() - targetDate.getTime()) / 1000
    );

    if (diffInSeconds < 0) {
      return 'future';
    }

    if (diffInSeconds < 60) {
      return 'now';
    }

    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    }

    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    }

    if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }

    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months}mo ago`;
    }

    const years = Math.floor(diffInSeconds / 31536000);
    return `${years}y ago`;
  } catch (error) {
    logger.error('Error formatting date:', error);
    return 'Invalid';
  }
};

/**
 * Formats a date to a localized string
 * @param date Date object, date string, or timestamp
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date | number,
  options?: Intl.DateTimeFormatOptions
): string => {
  try {
    const targetDate = new Date(date);

    if (isNaN(targetDate.getTime())) {
      return 'Invalid date';
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric' };

    return targetDate.toLocaleDateString('en-US', options || defaultOptions);
  } catch (error) {
    logger.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Formats time to localized string
 * @param date Date object, date string, or timestamp
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted time string
 */
export const formatTime = (
  date: string | Date | number,
  options?: Intl.DateTimeFormatOptions
): string => {
  try {
    const targetDate = new Date(date);

    if (isNaN(targetDate.getTime())) {
      return 'Invalid time';
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit' };

    return targetDate.toLocaleTimeString('en-US', options || defaultOptions);
  } catch (error) {
    logger.error('Error formatting time:', error);
    return 'Invalid time';
  }
};

/**
 * Parses a relative date string and returns a timestamp
 * @param relativeDate Relative date string like "2 hours ago"
 * @returns Timestamp in milliseconds
 */
export const parseRelativeDate = (
  relativeDate: string | null | undefined
): number => {
  const now = new Date().getTime();

  // Safety check for null or undefined input
  if (relativeDate == null) {
    return now - 10 * 365 * 24 * 60 * 60 * 1000; // Approx 10 years ago as a fallback
  }

  const lowerDate = relativeDate.toLowerCase();

  if (lowerDate === 'just now') {
    return now;
  }

  // Match "X unit(s) ago"
  const parts = lowerDate.match(/(\d+)\s+(hour|day|week|month|year)s?\s+ago/);
  if (parts?.[1]) {
    const value = parseInt(parts[1], 10);
    const unit = parts[2];

    switch (unit) {
      case 'hour':
        return now - value * 60 * 60 * 1000;
      case 'day':
        return now - value * 24 * 60 * 60 * 1000;
      case 'week':
        return now - value * 7 * 24 * 60 * 60 * 1000;
      case 'month':
        return now - value * 30 * 24 * 60 * 60 * 1000; // Approximate
      case 'year':
        return now - value * 365 * 24 * 60 * 60 * 1000; // Approximate
      default:
        break;
    }
  }

  // Attempt to parse as a direct date string as a fallback
  const directDate = new Date(relativeDate).getTime();
  if (!isNaN(directDate)) {
    return directDate;
  }

  // Final fallback for unparsable dates: treat as very old
  return now - 10 * 365 * 24 * 60 * 60 * 1000; // Approx 10 years ago
};
