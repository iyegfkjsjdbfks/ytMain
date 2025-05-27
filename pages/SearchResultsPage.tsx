
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { Video } from '../types';
import { searchVideos } from '../services/mockVideoService';
import AdjustmentsHorizontalIcon from '../components/icons/AdjustmentsHorizontalIcon';
import { parseRelativeDate } from '../utils/dateUtils';
import { parseViewCount } from '../utils/numberUtils'; // Import from new utility file
import { CheckIcon } from '@heroicons/react/24/solid';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

type SortByType = 'relevance' | 'uploadDate' | 'viewCount';

const sortOptions: { value: SortByType; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'uploadDate', label: 'Upload date' },
  { value: 'viewCount', label: 'View count' },
];

// Helper to parse view counts like "1.2M views" or "870K views" into numbers - MOVED TO numberUtils.ts


const SearchResultsPage: React.FC = () => {
  const queryParams = useQuery();
  const searchQuery = queryParams.get('q') || '';
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortByType>('relevance');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      if (searchQuery) {
        try {
          const results = await searchVideos(searchQuery);
          setVideos(results);
        } catch (error) {
          console.error("Failed to search videos:", error);
          setVideos([]);
        }
      } else {
        setVideos([]); 
      }
      setLoading(false);
    };
    fetchResults();
    window.scrollTo(0,0);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target as Node) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setShowFilterPanel(false);
      }
    };
    if (showFilterPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterPanel]);

  const sortedVideos = useMemo(() => {
    let tempVideos = [...videos];
    if (sortBy === 'uploadDate') {
      tempVideos.sort((a, b) => parseRelativeDate(b.uploadedAt) - parseRelativeDate(a.uploadedAt));
    } else if (sortBy === 'viewCount') {
      tempVideos.sort((a, b) => parseViewCount(b.views) - parseViewCount(a.views));
    }
    // 'relevance' uses the default order from the API (or current videos state)
    return tempVideos;
  }, [videos, sortBy]);

  const handleSortChange = (newSortBy: SortByType) => {
    setSortBy(newSortBy);
    setShowFilterPanel(false);
  };

  if (loading && searchQuery) { 
     return (
      <div className="bg-white dark:bg-neutral-950">
        <h2 className="text-lg font-semibold mb-5 text-neutral-800 dark:text-neutral-100">Searching for: "{searchQuery}"...</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-3 md:gap-x-4 gap-y-5 md:gap-y-6">
          {Array.from({ length: 12 }).map((_, index) => (
             <div key={index} className="bg-white dark:bg-neutral-900 rounded-xl animate-pulse">
              <div className="aspect-video bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
              <div className="p-3">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-full bg-neutral-300 dark:bg-neutral-700/80 mt-0.5 flex-shrink-0"></div>
                  <div className="flex-grow space-y-1.5 pt-0.5">
                    <div className="h-4 bg-neutral-300 dark:bg-neutral-700/80 rounded w-5/6"></div>
                    <div className="h-3 bg-neutral-300 dark:bg-neutral-700/80 rounded w-3/4"></div>
                    <div className="h-3 bg-neutral-300 dark:bg-neutral-700/80 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-950">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-2 sm:mb-0">
          {searchQuery ? (videos.length > 0 ? `Results for: "${searchQuery}"` : `No results found for: "${searchQuery}"`) : 'Enter a search term to begin.'}
        </h2>
        {videos.length > 0 && (
          <div className="relative">
            <button
              ref={filterButtonRef}
              onClick={() => setShowFilterPanel(prev => !prev)}
              className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 transition-colors"
              aria-expanded={showFilterPanel}
              aria-haspopup="true"
              aria-controls="sort-options-panel"
              id="filter-button"
              title="Sort search results"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4 mr-1.5" />
              Sort by
            </button>
            {showFilterPanel && (
              <div
                ref={filterPanelRef}
                id="sort-options-panel"
                className="absolute top-full right-0 mt-1.5 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-30 py-1 animate-fade-in-fast"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="filter-button"
              >
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between
                      ${sortBy === option.value 
                        ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 font-medium' 
                        : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700/70'
                      } transition-colors`}
                    role="menuitemradio"
                    aria-checked={sortBy === option.value}
                  >
                    <span>{option.label}</span>
                    {sortBy === option.value && <CheckIcon className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {sortedVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-3 md:gap-x-4 gap-y-5 md:gap-y-6">
          {sortedVideos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        !loading && searchQuery && <p className="text-neutral-600 dark:text-neutral-400 mt-4">Try different keywords or check for typos. For a broader search, try more general terms.</p>
      )}
      {!searchQuery && !loading && (
        <p className="text-neutral-600 dark:text-neutral-400 mt-4">Use the search bar at the top to find videos.</p>
      )}
    </div>
  );
};

export default SearchResultsPage;