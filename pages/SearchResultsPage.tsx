

import { useState, useEffect, useCallback } from 'react';

import { useSearchParams, useNavigate } from 'react-router-dom';

import OptimizedSearchResults from '../components/OptimizedSearchResults';
import { useDebounce } from '../hooks/useDebounce';
import { searchCombined } from '../services/googleSearchService';
import { performanceMonitor } from '../utils/performance';

import type { YouTubeSearchResult, GoogleSearchResult } from '../services/googleSearchService';
import type { Video } from '../types';


// Types for better performance
interface SearchState {
  videos: Video[];
  youtubeVideos: YouTubeSearchResult[];
  googleSearchVideos: GoogleSearchResult[];
  loading: boolean;
  youtubeLoading: boolean;
}


// Memoized empty state component
const EmptySearchState = React.memo(() => (
  <div className="text-center py-12">
    <div className="text-neutral-500 dark:text-neutral-400">
      <MagnifyingGlassIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
      <h3 className="text-lg font-medium mb-2">Enter a search term</h3>
      <p>Use the search bar above to find videos.</p>
    </div>
  </div>
));

// Main component
const SearchResultsPage: React.FC = () => {
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
    youtubeLoading: false,
  });

  // Memoized search function with performance monitoring
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery) {
      setSearchState({
        videos: [],
        youtubeVideos: [],
        googleSearchVideos: [],
        loading: false,
        youtubeLoading: false,
      });
      return;
    }

    performanceMonitor.startMeasure('search-results-load');
    setSearchState(prev => ({ ...prev, loading: true, youtubeLoading: true }));

    try {
      // Parallel search execution for better performance
      const [localResults, combinedResults] = await Promise.allSettled([
        searchVideos(searchQuery),
        searchCombined(searchQuery, searchVideos),
      ]);

      const combinedData = combinedResults.status === 'fulfilled' ? combinedResults.value : {
        localVideos: [],
        youtubeVideos: [],
        googleSearchVideos: [],
      };

      setSearchState({
        videos: localResults.status === 'fulfilled' ? localResults.value : [],
        youtubeVideos: combinedData.youtubeVideos,
        googleSearchVideos: combinedData.googleSearchVideos || [],
        loading: false,
        youtubeLoading: false,
      });

      if (performanceMonitor.hasMetric('search-results-load')) {
        performanceMonitor.endMeasure('search-results-load');
      }
    } catch (error) {
      console.error('Error in search:', error);
      setSearchState(prev => ({ ...prev, loading: false, youtubeLoading: false }));
      if (performanceMonitor.hasMetric('search-results-load')) {
        performanceMonitor.endMeasure('search-results-load');
      }
    }
  }, []);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <OptimizedSearchResults
        videos={searchState.videos}
        youtubeVideos={searchState.youtubeVideos}
        googleSearchVideos={searchState.googleSearchVideos}
        loading={searchState.loading || searchState.youtubeLoading}
        query={debouncedQuery}
        sortBy="relevance"
        onVideoClick={(video) => {
          if ('videoId' in video) {
            // YouTube video
            navigate(`/watch?v=${video.videoId}`);
          } else {
            // Local video
            navigate(`/watch?v=${video.id}`);
          }
        }}
      />
    </div>
  );
};

// Export with memo for performance
export default React.memo(SearchResultsPage);