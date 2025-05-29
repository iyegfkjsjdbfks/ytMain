
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/solid';
import PageLayout from '../components/PageLayout';
import VideoGrid from '../components/VideoGrid';
import { Video } from '../types';
import { searchVideos } from '../services/mockVideoService';
import AdjustmentsHorizontalIcon from '../components/icons/AdjustmentsHorizontalIcon';
import { parseRelativeDate } from '../utils/dateUtils';
import { parseViewCount } from '../utils/numberUtils';

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

  const sortFilterPanel = videos.length > 0 && (
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
  );

  const getTitle = () => {
    if (!searchQuery) return 'Search Results';
    if (loading) return `Searching for: "${searchQuery}"...`;
    return videos.length > 0 ? `Results for: "${searchQuery}"` : `No results found for: "${searchQuery}"`;
  };

  const getEmptyMessage = () => {
    if (!searchQuery) return 'Use the search bar at the top to find videos.';
    return 'Try different keywords or check for typos. For a broader search, try more general terms.';
  };

  return (
    <PageLayout
      title={getTitle()}
      icon={<MagnifyingGlassIcon className="w-8 h-8 text-purple-500" />}
      data={sortedVideos}
      loading={loading && !!searchQuery}
      error={null}
      emptyState={{
        title: !searchQuery ? "Search for videos" : "No results found",
        message: getEmptyMessage()
      }}
      headerActions={sortFilterPanel}
      skeletonCount={12}
    >
      {(videos) => <VideoGrid videos={videos} />}
    </PageLayout>
  );
};

export default SearchResultsPage;