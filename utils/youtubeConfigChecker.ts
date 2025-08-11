/**
 * YouTube API Configuration Checker
 * Helps verify and validate Google Custom Search API setup
 */


import { API_CONFIG } from '../config';

import { youtubeSearchService } from '../services/youtubeSearchService';

interface ConfigStatus {
  isConfigured: boolean;
  hasApiKey: boolean;
  hasEngineId: boolean;
  apiKeyLength?: number;
  engineIdLength?: number;
  recommendations: string[];
}

export const checkYouTubeAPIConfig = (): ConfigStatus => {
  const status = youtubeSearchService.getConfigStatus();
  const recommendations: string[] = [];

  // Check API key
  if (!status.hasApiKey) {
    recommendations.push('Add VITE_GOOGLE_SEARCH_API_KEY to your .env file');
    recommendations.push('Get API key from: https://console.developers.google.com/');
  }

  // Check Engine ID
  if (!status.hasEngineId) {
    recommendations.push('Add VITE_GOOGLE_SEARCH_ENGINE_ID to your .env file');
    recommendations.push('Create Custom Search Engine at: https://cse.google.com/');
  }

  // Additional recommendations
  if (status.configured) {
    recommendations.push('✅ YouTube API is properly configured');
    recommendations.push('Recommendations will use live YouTube search results');
  } else {
    recommendations.push('📋 Setup Guide: See GOOGLE_SEARCH_SETUP.md for detailed instructions');
    recommendations.push('🔄 Fallback: Using static sample videos until API is configured');
  }

  return {
    isConfigured: status.configured,
    hasApiKey: status.hasApiKey,
    hasEngineId: status.hasEngineId,
    apiKeyLength: API_CONFIG.GOOGLE_SEARCH_API_KEY?.length,
    engineIdLength: API_CONFIG.GOOGLE_SEARCH_ENGINE_ID?.length,
    recommendations,
  };
};

/**
 * Test the YouTube Search API with a simple query
 */
export const testYouTubeAPI = async (): Promise<{
  success: boolean;
  message: string;
  results?: number;
  error?: string;
}> => {
  try {
    const results = await youtubeSearchService.searchVideos('javascript tutorial', 3);

    if (results.length > 0) {
      return {
        success: true,
        message: 'YouTube Search API is working correctly',
        results: results.length,
      };
    }
      return {
        success: false,
        message: 'API responded but returned no results',
        results: 0,
      };

  } catch (error) {
    return {
      success: false,
      message: 'YouTube Search API test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Log configuration status to console for debugging
 */
export const logConfigStatus = (): void => {
  const config = checkYouTubeAPIConfig();

  console.group('🎯 YouTube API Configuration Status');
  console.log('Configured:', config.isConfigured ? '✅' : '❌');
  console.log('API Key:', config.hasApiKey ? '✅' : '❌', config.hasApiKey ? `(${config.apiKeyLength} chars)` : '');
  console.log('Engine ID:', config.hasEngineId ? '✅' : '❌', config.hasEngineId ? `(${config.engineIdLength} chars)` : '');

  console.group('📋 Recommendations:');
  config.recommendations.forEach((rec: any) => console.log(`• ${rec}`));
  console.groupEnd();

  console.groupEnd();
};

/**
 * Show configuration info in development mode
 */
if (import.meta.env.DEV) {
  logConfigStatus();
}

export default {
  checkYouTubeAPIConfig,
  testYouTubeAPI,
  logConfigStatus,
};
