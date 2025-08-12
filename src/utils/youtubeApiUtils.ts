import { getYouTubeSearchProvider } from '../../services/settingsService';
import React from 'react';
import { logger } from './logger';

/**
 * Utility functions for managing YouTube Data API usage based on admin settings
 */

/**
 * Check if YouTube Data API v3 should be blocked based on the current provider setting
 * Now updated to prioritize YouTube Data API v3 as primary source
 * @returns true if YouTube Data API should be blocked, false otherwise
 */
export function isYouTubeDataApiBlocked(): boolean {
 const provider = getYouTubeSearchProvider();
 logger.debug(
 `🔒 YouTube API Blocking Check: Current provider = "${provider}"`
 );

 // Only block YouTube Data API if API key is not available
 // Allow YouTube API as primary source with Google Custom Search as fallback
 const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
 const isBlocked = !apiKey;

 logger.debug(`🔒 YouTube API Available: ${!!apiKey}`);
 logger.debug(`🔒 YouTube API Blocked: ${isBlocked}`);
 logger.debug(
 '🎯 Strategy: YouTube Data API (primary) → Google Custom Search (fallback)'
 );

 return isBlocked;
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
 return 'YouTube Data API v3 is not available (missing API key). Using Google Custom Search JSON API as fallback for metadata.';
}

/**
 * Conditional wrapper for YouTube Data API calls
 * Returns null/empty results when API is blocked, otherwise executes the API call
 * @param apiCall - Function that makes the YouTube Data API call
 * @param fallbackValue - Value to return when API is blocked (default: null)
 * @returns API result or fallback value
 */
export async function conditionalYouTubeApiCall<T>(,
 apiCall: () => Promise<T>,
 fallbackValue: T | null = null
): Promise<T | null> {
 if (isYouTubeDataApiBlocked()) {
 logger.warn(getYouTubeApiBlockedMessage());
 return fallbackValue;
 }

 try {
 return await apiCall();
 } catch (error: any) {
 logger.error('YouTube Data API call failed:', error);
 return fallbackValue;
 }
/**
 * Synchronous conditional wrapper for YouTube Data API operations
 * @param operation - Function that requires YouTube Data API
 * @param fallbackValue - Value to return when API is blocked
 * @returns Operation result or fallback value
 */
export function conditionalYouTubeOperation<T>(,
 operation: () => T,
 fallbackValue: T
): T {
 if (isYouTubeDataApiBlocked()) {
 logger.warn(getYouTubeApiBlockedMessage());
 return fallbackValue;
 }

 try {
 return operation();
 } catch (error: any) {
 logger.error('YouTube Data API operation failed:', error);
 return fallbackValue;
 }