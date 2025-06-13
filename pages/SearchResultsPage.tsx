
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { searchVideos } from '../services/videoService';
import { searchYouTubeVideos, searchGoogleVideos, YouTubeSearchResult, GoogleSearchResult } from '../services/googleSearchService';
import OptimizedSearchResults from '../components/OptimizedSearchResults';
import LoadingSpinner from '../components/LoadingSpinner';
import { performanceMonitor } from '../utils/performance';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

// Types for better performance
interface SearchState {
  videos: Video[];
  youtubeVideos: YouTubeSearchResult[];
  googleSearchVideos: GoogleSearchResult[];
  loading: boolean;
  youtubeLoading: boolean;
}

// Combined search results type
type CombinedSearchResult = Video | YouTubeSearchResult | GoogleSearchResult;

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
  const query = searchParams.get('q') || '';
  const debouncedQuery = useDebounce(query, 300); // Debounce search for 300ms
  
  // Consolidated state
  const [searchState, setSearchState] = useState<SearchState>({
    videos: [],
    youtubeVideos: [],
    googleSearchVideos: [],
    loading: true,
    youtubeLoading: true
  });
  
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'views'>('relevance');
  const [activeTab, setActiveTab] = useState<'all' | 'local' | 'youtube'>('all');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Memoized search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery) {
      setSearchState({
        videos: [],
        youtubeVideos: [],
        googleSearchVideos: [],
        loading: false,
        youtubeLoading: false
      });
      return;
    }
    
    setSearchState(prev => ({ ...prev, loading: true, youtubeLoading: true }));
    
    try {
      const results = await searchCombined(searchQuery, searchVideos);
      
      setSearchState({
        videos: results.localVideos,
        youtubeVideos: results.youtubeVideos || [],
        googleSearchVideos: results.googleSearchVideos || [],
        loading: false,
        youtubeLoading: false
      });
    } catch (error) {
      console.error('Error in combined search:', error);
      setSearchState(prev => ({ ...prev, loading: false, youtubeLoading: false }));
    }
  }, []);

  // Effect for debounced search
  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  // Memoized sorted results
  const sortedResults = useSortedResults(
    searchState.videos,
    searchState.youtubeVideos,
    searchState.googleSearchVideos,
    sortBy,
    debouncedQuery
  );

  // Memoized display videos
  const displayVideos = useDisplayVideos(sortedResults, activeTab);

  // Memoized total results
  const totalResults = useMemo(() => {
    return searchState.videos.length + searchState.youtubeVideos.length + searchState.googleSearchVideos.length;
  }, [searchState.videos.length, searchState.youtubeVideos.length, searchState.googleSearchVideos.length]);

  // Memoized handlers
  const handleTabChange = useCallback((tab: 'all' | 'local' | 'youtube') => {
    setActiveTab(tab);
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    setSortBy(sort as 'relevance' | 'date' | 'views');
    setShowSortDropdown(false);
  }, []);

  const toggleSortDropdown = useCallback(() => {
    setShowSortDropdown(prev => !prev);
  }, []);

  // Early returns for different states
  if (!query) {
    return (
      <PageLayout title="Search" data={[]} loading={false} error={null}>
        {() => (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <EmptySearchState />
          </div>
        )}
      </PageLayout>
    );
  }

  if (searchState.loading && searchState.youtubeLoading) {
    return (
      <PageLayout title="" data={[]} loading={true} error={null}>
        {() => (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <LoadingSkeleton />
          </div>
        )}
      </PageLayout>
    );
  }

  return (
    <PageLayout title="" data={searchState.videos} loading={searchState.loading} error={null}>
      {() => (
        <div className="max-w-7xl mx-auto -mt-4">
          <div className="flex items-center justify-between">
            <div></div>
            
            <div className="flex items-center gap-4">
              {/* Tab Navigation */}
              <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                <TabButton
                  active={activeTab === 'all'}
                  onClick={() => handleTabChange('all')}
                >
                  All ({totalResults})
                </TabButton>
                <TabButton
                  active={activeTab === 'local'}
                  onClick={() => handleTabChange('local')}
                >
                  Local ({searchState.videos.length})
                </TabButton>
                <TabButton
                  active={activeTab === 'youtube'}
                  onClick={() => handleTabChange('youtube')}
                >
                  YouTube ({searchState.youtubeVideos.length + searchState.googleSearchVideos.length})
                </TabButton>
              </div>
              
              <SortDropdown
                sortBy={sortBy}
                showDropdown={showSortDropdown}
                onToggle={toggleSortDropdown}
                onSort={handleSortChange}
              />
            </div>
          </div>
          
          {totalResults === 0 ? (
            <NoResultsState loading={searchState.loading} youtubeLoading={searchState.youtubeLoading} />
          ) : (
            <div className="space-y-4">
              {/* Local Videos Section */}
              {displayVideos.local.length > 0 && (
                <div>
                  {activeTab === 'all' && (
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Local Videos ({displayVideos.local.length})
                    </h2>
                  )}
                  <VideoGrid videos={displayVideos.local} keyPrefix="local" />
                </div>
              )}
              
              {/* YouTube Videos Section */}
              {displayVideos.youtube.length > 0 && (
                <div>
                  {activeTab === 'all' && (
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      YouTube Videos ({displayVideos.youtube.length})
                      {searchState.youtubeLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent ml-2"></div>
                      )}
                    </h2>
                  )}
                  <YouTubeVideoGrid videos={displayVideos.youtube} keyPrefix="youtube" />
                </div>
              )}
              
              {/* Google Search Videos Section */}
              {displayVideos.googleSearch.length > 0 && (
                <div>
                  {activeTab === 'all' && (
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      YouTube Videos (Google Search) ({displayVideos.googleSearch.length})
                      {searchState.youtubeLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent ml-2"></div>
                      )}
                    </h2>
                  )}
                  <YouTubeVideoGrid videos={displayVideos.googleSearch} keyPrefix="google-search" />
                </div>
              )}
              
              {/* Loading states */}
              {(searchState.loading || searchState.youtubeLoading) && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-neutral-400 border-t-transparent"></div>
                    {searchState.loading && searchState.youtubeLoading ? 'Loading videos...' : searchState.loading ? 'Loading local videos...' : 'Loading YouTube videos...'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
};

// Export with memo for performance
export default withMemo(SearchResultsPage, memoComparisons.shallow);