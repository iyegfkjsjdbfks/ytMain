// utils/dateUtils.ts
export const parseRelativeDate = (relativeDate: string | null | undefined): number => {
  const now = new Date().getTime();

  // Safety check for null or undefined input
  if (relativeDate == null) { // Checks for both null and undefined
    return now - (10 * 365 * 24 * 60 * 60 * 1000); // Approx 10 years ago as a fallback
  }

  const lowerDate = relativeDate.toLowerCase();

  if (lowerDate === 'just now') {
    return now;
  }

  // Match "X unit(s) ago"
  const parts = lowerDate.match(/(\d+)\s+(hour|day|week|month|year)s?\s+ago/);

  if (parts?.[1] && parts[2]) {
    const quantity = parseInt(parts[1], 10);
    const unit = parts[2];
    let msAgo = 0;

    switch (unit) {
      case 'hour':
        msAgo = quantity * 60 * 60 * 1000;
        break;
      case 'day':
        msAgo = quantity * 24 * 60 * 60 * 1000;
        break;
      case 'week':
        msAgo = quantity * 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        msAgo = quantity * 30 * 24 * 60 * 60 * 1000; // Approximation
        break;
      case 'year':
        msAgo = quantity * 365 * 24 * 60 * 60 * 1000; // Approximation
        break;
      default:
        // Should not happen with the regex, but as a fallback
        return now - (10 * 365 * 24 * 60 * 60 * 1000); // Approx 10 years ago
    }
    return now - msAgo; // Returns the estimated timestamp of when the event occurred
  }

  // Attempt to parse as a direct date string as a fallback
  const directDate = new Date(relativeDate).getTime();
  if (!isNaN(directDate)) {
    return directDate;
  }

  // Final fallback for unparsable dates: treat as very old
  return now - (10 * 365 * 24 * 60 * 60 * 1000); // Approx 10 years ago
};

export const formatDistanceToNow = (date: string | Date, options?: { addSuffix?: boolean }): string => {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(targetDate.getTime())) {
    return 'Invalid date';
  }

  const diffMs = now.getTime() - targetDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  let result: string;
  if (diffSeconds < 60) {
    result = 'just now';
  } else if (diffMinutes < 60) {
    result = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    result = `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  } else if (diffDays < 7) {
    result = `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  } else if (diffWeeks < 4) {
    result = `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''}`;
  } else if (diffMonths < 12) {
    result = `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
  } else {
    result = `${diffYears} year${diffYears !== 1 ? 's' : ''}`;
  }

  // Add 'ago' suffix unless it's 'just now' or addSuffix is explicitly false
  if (result !== 'just now' && options?.addSuffix !== false) {
    result += ' ago';
  }

  return result;
};