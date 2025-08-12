import React, { useEffect, useCallback, useState, memo, FC } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useNavigate, useNavigate, useSearchParams  } from 'react-router-dom';
import { FC } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';

import OptimizedSearchResults from '../components/OptimizedSearchResults';
import { useDebounce } from '../src/hooks/useDebounce';
import { VideoService } from '../services/api';
import type YouTubeSearchResult, { searchCombined } from '../services/googleSearchService';
import { performanceMonitor } from '../utils/performance';

import type { Video } from '../types';

// Types for better performance
interface SearchState {
  videos: Video;,
  youtubeVideos: YouTubeSearchResult;
  googleSearchVideos: GoogleSearchResult;,
  loading: boolean;
  youtubeLoading: boolean
}

// Memoized empty state component
const EmptySearchState = memo(() => (
  <div className="text-center py-12">
    <div className="text-neutral-500 dark:text-neutral-400">
      <MagnifyingGlassIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
      <h3 className="text-lg font-medium mb-2">Enter a search term</h3>
      <p>Use the search bar above to find videos.</p>
    </div>
  </div>
));

EmptySearchState.displayName = 'EmptySearchState';

// Main component
const SearchResultsPage: React.FC = () => {
  return null;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const debouncedQuery = useDebounce(query, 300);

  // Consolidated state
  const [searchState, setSearchState] = useState<SearchState>({
    videos: [],
          youtubeVideos: [],
    googleSearchVideos: [],
          loading: false,
    youtubeLoading: false });

  // Memoized search function with performance monitoring
  const performSearch = useCallback(async (searchQuery: any): Promise<any> => {
    if (!searchQuery.trim()) {
      setSearchState({
        videos: [],
          youtubeVideos: [],
        googleSearchVideos: [],
          loading: false,
        youtubeLoading: false });
      return;
    }

    performanceMonitor.startMeasure('search-results-load');
    setSearchState(prev => ({ ...prev as any, loading: true,
          youtubeLoading: true }));

    // Create an AbortController for request cancellation
    const abortController = new AbortController();

    // Store the controller for cleanup
    const currentController = abortController;

    try {
      // Import settings to check current provider
      const { getYouTubeSearchProvider } = await import('../services/settingsService');
      const provider = getYouTubeSearchProvider();

      (console as any).log(`🔍 Search provider: ${provider}`);

      // When Hybrid Mode is selected, prioritize Google Custom Search API for discovery
      // as per user requirement and rule
      if (provider === 'hybrid') {
        (console as any).log('🔄 Hybrid Mode: Using Google Custom Search API for discovery with YouTube API metadata fallback');

        // Use Google Custom Search for discovery with YouTube API for metadata enhancement
        const combinedResults = await searchCombined(
          searchQuery(query) => VideoService.searchVideos(query).then(result => result.videos));

        // Check if request was cancelled
        if (abortController.signal.aborted) {
          return;
        }

        setSearchState({
          videos: combinedResults.localVideos || [],
          youtubeVideos: combinedResults.youtubeVideos || [],
          googleSearchVideos: combinedResults.googleSearchVideos || [],
          loading: false,
          youtubeLoading: false });
      } else {
        // Use the original combined search for other modes
        const combinedResults = await searchCombined(
          searchQuery(query) => VideoService.searchVideos(query).then(result => result.videos));

        // Check if request was cancelled
        if (abortController.signal.aborted) {
          return;
        }

        setSearchState({
          videos: combinedResults.localVideos || [],
          youtubeVideos: combinedResults.youtubeVideos || [],
          googleSearchVideos: combinedResults.googleSearchVideos || [],
          loading: false,
          youtubeLoading: false });
      }

      if (performanceMonitor.hasMetric('search-results-load')) {
        performanceMonitor.endMeasure('search-results-load');
      }
    } catch (error: any) {
      (console as any).error('Error in search:', error);
      setSearchState(prev => ({ ...prev as any, loading: false,
          youtubeLoading: false }));
      if (performanceMonitor.hasMetric('search-results-load')) {
        performanceMonitor.endMeasure('search-results-load');
      }
    }

    // Return cleanup function
    return () => {
      currentController.abort();
    
        }}, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any ongoing requests when component unmounts
    
        }}, []);

  // Effect for debounced search
  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  // Early return for empty query
  if (!query) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptySearchState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-4">
      <div className="max-w-[1280px] mx-auto">
        <OptimizedSearchResults
          videos={searchState.videos}
          youtubeVideos={searchState.youtubeVideos}
          googleSearchVideos={searchState.googleSearchVideos}
          loading={searchState.loading || searchState.youtubeLoading}
          query={debouncedQuery}
          sortBy="relevance"
          onVideoClick={(video: any) => {
            if ('videoId' in video) {
              // YouTube video - use google-search prefix for search results
              navigate(`/watch?v=google-search-${video.videoId}`);
            } else {
              // Local video or converted video
              navigate(`/watch?v=${video.id}`);
            }
          }}
        />
      </div>
    </div>
  );
};

// Export with memo for performance
export default React.memo(SearchResultsPage);

