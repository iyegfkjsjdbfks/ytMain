// utils/dateUtils.ts
export const parseRelativeDate = (relativeDate: string | null | undefined): number => {
  const now = new Date().getTime();
  
  // Safety check for null or undefined input
  if (relativeDate == null) { // Checks for both null and undefined
    return now - (10 * 365 * 24 * 60 * 60 * 1000); // Approx 10 years ago as a fallback
  }

  const lowerDate = relativeDate.toLowerCase();

  if (lowerDate === "just now") {
    return now;
  }

  // Match "X unit(s) ago"
  const parts = lowerDate.match(/(\d+)\s+(hour|day|week|month|year)s?\s+ago/);
  
  if (parts) {
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