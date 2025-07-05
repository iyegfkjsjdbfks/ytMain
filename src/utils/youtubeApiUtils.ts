import { getYouTubeSearchProvider } from '../../services/settingsService';

/**
 * Utility functions for managing YouTube Data API usage based on admin settings
 */

/**
 * Check if YouTube Data API v3 should be blocked based on the current provider setting
 * @returns true if YouTube Data API should be blocked, false otherwise
 */
export function isYouTubeDataApiBlocked(): boolean {
  const provider = getYouTubeSearchProvider();

  // Block YouTube Data API when Google Custom Search is selected as the sole provider
  return provider === 'google-search';
}

/**
 * Check if YouTube Data API v3 is allowed to be used
 * @returns true if YouTube Data API can be used, false otherwise
 */
export function isYouTubeDataApiAllowed(): boolean {
  return !isYouTubeDataApiBlocked();
}

/**
 * Get a warning message when YouTube Data API is blocked
 * @returns Warning message string
 */
export function getYouTubeApiBlockedMessage(): string {
  return 'YouTube Data API v3 is disabled when Google Custom Search JSON API is selected as the YouTube Search Provider. Please change the provider in admin settings to use YouTube Data API features.';
}

/**
 * Conditional wrapper for YouTube Data API calls
 * Returns null/empty results when API is blocked, otherwise executes the API call
 * @param apiCall - Function that makes the YouTube Data API call
 * @param fallbackValue - Value to return when API is blocked (default: null)
 * @returns API result or fallback value
 */
export async function conditionalYouTubeApiCall<T>(
  apiCall: () => Promise<T>,
  fallbackValue: T | null = null,
): Promise<T | null> {
  if (isYouTubeDataApiBlocked()) {
    console.warn(getYouTubeApiBlockedMessage());
    return fallbackValue;
  }

  try {
    return await apiCall();
  } catch (error) {
    console.error('YouTube Data API call failed:', error);
    return fallbackValue;
  }
}

/**
 * Synchronous conditional wrapper for YouTube Data API operations
 * @param operation - Function that requires YouTube Data API
 * @param fallbackValue - Value to return when API is blocked
 * @returns Operation result or fallback value
 */
export function conditionalYouTubeOperation<T>(
  operation: () => T,
  fallbackValue: T,
): T {
  if (isYouTubeDataApiBlocked()) {
    console.warn(getYouTubeApiBlockedMessage());
    return fallbackValue;
  }

  try {
    return operation();
  } catch (error) {
    console.error('YouTube Data API operation failed:', error);
    return fallbackValue;
  }
}
