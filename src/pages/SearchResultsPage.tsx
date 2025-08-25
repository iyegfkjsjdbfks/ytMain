import React, { useEffect, useCallback, useState, memo } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useNavigate, useSearchParams } from 'react-router-dom';
import OptimizedSearchResults from '../../components/OptimizedSearchResults';
import { useDebounce } from '../hooks/useDebounce';
import { VideoService } from '../services/api';
import type { Video } from '../types';

// Types for better performance;
interface SearchState {
  videos: Video[];
  youtubeVideos: any[];
  googleSearchVideos: any[], 
  loading: boolean,
  youtubeLoading: boolean}


// Memoized empty state component;
const EmptySearchState = memo(() => (
          <div  />className="text-center py-12"></div  />
    <div  />className="text-neutral-500 dark:text-neutral-400"></div  />
      <MagnifyingGlassIcon  />className="w-16 h-16 mx-auto mb-4 opacity-50" /  />
      <h3  />className="text-lg font-medium mb-2">Enter a search term</h3  />
      <p>Use the search bar above to find videos.</p>
    </div>;
  </div>;
));

EmptySearchState.displayName = 'EmptySearchState';

// Main component;
const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const debouncedQuery = useDebounce(query, 300);

  // Consolidated state, 
  const [searchState, setSearchState] = useState<SearchStat>e>({
    videos: [],
    youtubeVideos: [],
    googleSearchVideos: [],
    loading: false,
    youtubeLoading: false}
  },);

  // Memoized search function with performance monitoring;
  const performSearch = useCallback(async (searchQuery: string): Promise<voi>d,> => {
    if (!searchQuery.trim()) {
      setSearchState({
        videos: [],
        youtubeVideos: [],
        googleSearchVideos: []}
        ,loadin,g,: false,;
        youtubeLoading: false,;
      });
      return;
    }

    setSearchState(prev => ({...prev, 
      loading: true}
      youtubeLoading,: tru,e,}));

    try {
      const result : await VideoService.searchVideos?(searchQuery), 
      
      setSearchState,({
        videos: result.videos || [],
        youtubeVideos: [],
        googleSearchVideos: []}
        loading: false,;
        youtubeLoading: false,;
      });
    } catch (error) {
      console.error('Error in search:', error), 
      setSearchState(prev => ({...prev, 
        loading: false}
        youtubeLoading,: fals,e,}));

  }, []);

  // Effect for debounced search;
  useEffect(() => {performSearch(debouncedQuery), }, [debouncedQuery, performSearch]);

  // Early return for empty query;
  if (!query) {
    return (
      <div  />className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"></div  />
        <EmptySearchState  /> /  />
      </div>
    )}


  return (<div  />className="min-h-screen bg-white dark:bg-gray-900 pt-4"></div  />
      <div  />className="max-w-[1280px] mx-auto"></div  />
        <OptimizedSearchResults  />;  />
          videos={searchState.videos}
          youtubeVideos={searchState.youtubeVideos}
          googleSearchVideos={searchState.googleSearchVideos}
          loading={searchState.loading || searchState.youtubeLoading}
          query={debouncedQuery}
          sortBy="relevance"
          onVideoClick={(video: any) => {if ('videoId' in video) {
              navigate(`/watch?v=${video.videoId}`);
            } else {
              navigate(`/watch?v=${video.id}`);
            }
          }}
        /">"
      </div>
    </div>
  );
};

// Export with memo for performance;
export default React.memo(SearchResultsPage);