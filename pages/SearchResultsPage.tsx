
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Video } from '../types';
import { searchVideos } from '../services/mockVideoService';
import { searchCombined, YouTubeSearchResult, GoogleSearchResult } from '../services/googleSearchService';
// VideoCard and YouTubeVideoCard imports removed as they're not used in this component
import VideoGrid from '../components/VideoGrid';
import YouTubeVideoGrid from '../components/YouTubeVideoGrid';
import PageLayout from '../components/PageLayout';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { withMemo, memoComparisons } from '../utils/componentOptimizations';

// Types for better performance
interface SearchState {
  videos: Video[];
  youtubeVideos: YouTubeSearchResult[];
  googleSearchVideos: GoogleSearchResult[];
  loading: boolean;
  youtubeLoading: boolean;
}

interface DisplayVideos {
  local: Video[];
  youtube: YouTubeSearchResult[];
  googleSearch: GoogleSearchResult[];
}

// Debounce hook for search optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Memoized sorting functions
const sortingFunctions = {
  videos: {
    relevance: (videos: Video[], query: string) => {
      return videos.sort((a, b) => {
        const aRelevance = a.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
        const bRelevance = b.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
        return bRelevance - aRelevance;
      });
    },
    date: (videos: Video[]) => {
      return videos.sort((a, b) => {
        const dateA = a.uploadedAt || '';
        const dateB = b.uploadedAt || '';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
    },
    views: (videos: Video[]) => {
      return videos.sort((a, b) => {
        const viewsA = typeof a.views === 'string' ? parseInt(a.views) || 0 : (a.views || 0);
        const viewsB = typeof b.views === 'string' ? parseInt(b.views) || 0 : (b.views || 0);
        return viewsB - viewsA;
      });
    }
  },
  youtube: {
    relevance: (videos: YouTubeSearchResult[]) => videos, // Already sorted by relevance
    date: (videos: YouTubeSearchResult[]) => {
      return videos.sort((a, b) => {
        return new Date(b.uploadedAt || '').getTime() - new Date(a.uploadedAt || '').getTime();
      });
    },
    views: (videos: YouTubeSearchResult[]) => videos // YouTube API doesn't provide view count in search
  },
  googleSearch: {
    relevance: (videos: GoogleSearchResult[]) => videos, // Already sorted by relevance
    date: (videos: GoogleSearchResult[]) => {
      return videos.sort((a, b) => {
        const dateA = a.uploadedAt || '';
        const dateB = b.uploadedAt || '';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
    },
    views: (videos: GoogleSearchResult[]) => videos // Google search results don't have views data
  }
};

// Memoized sort function
const useSortedResults = (videos: Video[], youtubeVideos: YouTubeSearchResult[], googleSearchVideos: GoogleSearchResult[], sortBy: string, query: string) => {
  return useMemo(() => {
    const sortedVideos = [...videos];
    const sortedYouTube = [...youtubeVideos];
    const sortedGoogleSearch = [...googleSearchVideos];

    switch (sortBy) {
      case 'relevance':
        return {
          videos: sortingFunctions.videos.relevance(sortedVideos, query),
          youtube: sortingFunctions.youtube.relevance(sortedYouTube),
          googleSearch: sortingFunctions.googleSearch.relevance(sortedGoogleSearch)
        };
      case 'date':
        return {
          videos: sortingFunctions.videos.date(sortedVideos),
          youtube: sortingFunctions.youtube.date(sortedYouTube),
          googleSearch: sortingFunctions.googleSearch.date(sortedGoogleSearch)
        };
      case 'views':
        return {
          videos: sortingFunctions.videos.views(sortedVideos),
          youtube: sortingFunctions.youtube.views(sortedYouTube),
          googleSearch: sortingFunctions.googleSearch.views(sortedGoogleSearch)
        };
      default:
        return {
          videos: sortedVideos,
          youtube: sortedYouTube,
          googleSearch: sortedGoogleSearch
        };
    }
  }, [videos, youtubeVideos, googleSearchVideos, sortBy, query]);
};

// Memoized display videos calculation
const useDisplayVideos = (sortedResults: any, activeTab: string): DisplayVideos => {
  return useMemo(() => {
    switch (activeTab) {
      case 'local':
        return { local: sortedResults.videos, youtube: [], googleSearch: [] };
      case 'youtube':
        return { local: [], youtube: sortedResults.youtube, googleSearch: sortedResults.googleSearch };
      case 'all':
      default:
        return { 
          local: sortedResults.videos, 
          youtube: sortedResults.youtube, 
          googleSearch: sortedResults.googleSearch 
        };
    }
  }, [sortedResults, activeTab]);
};

// Memoized loading skeleton component
const LoadingSkeleton = React.memo(() => (
  <div className="grid grid-cols-1 gap-x-3 md:gap-x-4 gap-y-5 md:gap-y-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
    {Array.from({ length: 12 }).map((_, index) => (
      <div key={index} className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden animate-pulse">
        <div className="aspect-video bg-neutral-200 dark:bg-neutral-700"></div>
        <div className="p-4 space-y-3">
          <div className="space-y-2">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
));

// Memoized empty state component
const EmptySearchState = React.memo(() => (
  <div className="text-center py-12">
    <div className="text-neutral-500 dark:text-neutral-400">
      <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <h3 className="text-lg font-medium mb-2">Enter a search term</h3>
      <p>Use the search bar above to find videos.</p>
    </div>
  </div>
));

// Memoized no results component
const NoResultsState = React.memo<{ loading: boolean; youtubeLoading: boolean }>(({ loading, youtubeLoading }) => (
  <div className="text-center py-12">
    <div className="text-neutral-500 dark:text-neutral-400">
      <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <h3 className="text-lg font-medium mb-2">No videos found</h3>
      <p>Try adjusting your search terms or check your spelling.</p>
      {(loading || youtubeLoading) && (
        <div className="mt-4">
          <div className="inline-flex items-center gap-2 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-neutral-400 border-t-transparent"></div>
            Searching...
          </div>
        </div>
      )}
    </div>
  </div>
));

// Memoized tab button component
const TabButton = React.memo<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}>(({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
      active
        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
    }`}
  >
    {children}
  </button>
));

// Memoized sort dropdown component
const SortDropdown = React.memo<{
  sortBy: string;
  showDropdown: boolean;
  onToggle: () => void;
  onSort: (sort: string) => void;
}>(({ sortBy, showDropdown, onToggle, onSort }) => {
  const handleSort = useCallback((sort: string) => {
    onSort(sort);
  }, [onSort]);

  const sortLabel = useMemo(() => {
    switch (sortBy) {
      case 'relevance': return 'Relevance';
      case 'date': return 'Upload Date';
      case 'views': return 'Views';
      default: return 'Relevance';
    }
  }, [sortBy]);

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
      >
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Sort by: {sortLabel}
        </span>
        <ChevronDownIcon className="w-4 h-4 text-neutral-500" />
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-lg z-10">
          <div className="py-1">
            {['relevance', 'date', 'views'].map((sort) => (
              <button
                key={sort}
                onClick={() => handleSort(sort)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 ${
                  sortBy === sort 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                    : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {sort === 'relevance' ? 'Relevance' : sort === 'date' ? 'Upload Date' : 'Views'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

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