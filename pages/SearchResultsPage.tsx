
import * as React from 'react';
import {  useEffect, useState, useMemo  } from 'react';
import { useLocation } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import PageLayout from '../components/PageLayout';
import VideoGrid from '../components/VideoGrid';
import SortFilterPanel, { SortByType } from '../components/SortFilterPanel'; // Added import
import { Video } from '../types';
import { searchVideos } from '../services/mockVideoService';
import { parseRelativeDate } from '../utils/dateUtils';
import { parseViewCount } from '../utils/numberUtils';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}


const SearchResultsPage: React.FC = () => {
  const queryParams = useQuery();
  const searchQuery = queryParams.get('q') || '';
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortByType>('relevance');

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
  };

  const sortFilterPanel = (
    <SortFilterPanel 
      currentSortBy={sortBy} 
      onSortChange={handleSortChange} 
      disabled={videos.length === 0}
    />
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