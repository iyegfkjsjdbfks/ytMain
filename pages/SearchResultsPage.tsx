
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Video } from '../types';
import { searchVideos } from '../services/mockVideoService';
import { searchYouTubeVideos } from '../services/googleSearchService';
import VideoCard from '../components/VideoCard';
import YouTubeVideoCard from '../components/YouTubeVideoCard';
import PageLayout from '../components/PageLayout';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [videos, setVideos] = useState<Video[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [youtubeLoading, setYoutubeLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'views'>('relevance');
  const [activeTab, setActiveTab] = useState<'all' | 'local' | 'youtube'>('all');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      
      setLoading(true);
      setYoutubeLoading(true);
      
      try {
        // Search local videos
        const localResults = await searchVideos(query);
        setVideos(localResults);
      } catch (error) {
        console.error('Error searching local videos:', error);
      } finally {
        setLoading(false);
      }
      
      try {
        // Search YouTube videos
        const youtubeResults = await searchYouTubeVideos(query);
        setYoutubeVideos(youtubeResults);
      } catch (error) {
        console.error('Error searching YouTube videos:', error);
      } finally {
        setYoutubeLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const sortedVideos = useMemo(() => {
    const sortVideos = (videos: Video[]) => {
      return [...videos].sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
          case 'views':
            return b.views - a.views;
          case 'relevance':
          default:
            // Simple relevance based on title match
            const aRelevance = a.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
            const bRelevance = b.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
            return bRelevance - aRelevance;
        }
      });
    };

    return sortVideos(videos);
  }, [videos, sortBy, query]);

  const sortedYouTubeVideos = useMemo(() => {
    const sortVideos = (videos: any[]) => {
      return [...videos].sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
          case 'views':
            return parseInt(b.viewCount || '0') - parseInt(a.viewCount || '0');
          case 'relevance':
          default:
            return 0; // YouTube API already returns by relevance
        }
      });
    };

    return sortVideos(youtubeVideos);
  }, [youtubeVideos, sortBy]);

  const displayVideos = useMemo(() => {
    switch (activeTab) {
      case 'local':
        return { local: sortedVideos, youtube: [] };
      case 'youtube':
        return { local: [], youtube: sortedYouTubeVideos };
      case 'all':
      default:
        return { local: sortedVideos, youtube: sortedYouTubeVideos };
    }
  }, [activeTab, sortedVideos, sortedYouTubeVideos]);

  const totalResults = videos.length + youtubeVideos.length;

  if (!query) {
    return (
      <PageLayout
        title="Search"
        data={[]}
        loading={false}
        error={null}
      >
        {() => (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <div className="text-neutral-500 dark:text-neutral-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-medium mb-2">Enter a search term</h3>
                <p>Use the search bar above to find videos.</p>
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    );
  }

  if (loading && youtubeLoading) {
    return (
      <PageLayout
        title={`Search results for "${query}"`}
        data={[]}
        loading={true}
        error={null}
      >
        {() => (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
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
          </div>
        )}
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`Search results for "${query}"`}
      data={videos}
      loading={loading}
      error={null}
    >
      {() => (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Search results for "{query}" ({totalResults} results)
          </h1>
          
          <div className="flex items-center gap-4">
            {/* Tab Navigation */}
            <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                All ({totalResults})
              </button>
              <button
                onClick={() => setActiveTab('local')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'local'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                Local ({videos.length})
              </button>
              <button
                onClick={() => setActiveTab('youtube')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'youtube'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                YouTube ({youtubeVideos.length})
              </button>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Sort by: {sortBy === 'relevance' ? 'Relevance' : sortBy === 'date' ? 'Upload Date' : 'Views'}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-neutral-500" />
              </button>
              
              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => { setSortBy('relevance'); setShowSortDropdown(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 ${
                        sortBy === 'relevance' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      Relevance
                    </button>
                    <button
                      onClick={() => { setSortBy('date'); setShowSortDropdown(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 ${
                        sortBy === 'date' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      Upload Date
                    </button>
                    <button
                      onClick={() => { setSortBy('views'); setShowSortDropdown(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 ${
                        sortBy === 'views' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      Views
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {totalResults === 0 ? (
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
        ) : (
          <div className="space-y-8">
            {/* Local Videos Section */}
            {displayVideos.local.length > 0 && (
              <div>
                {activeTab === 'all' && (
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Local Videos ({displayVideos.local.length})
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayVideos.local.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </div>
            )}
            
            {/* YouTube Videos Section */}
            {displayVideos.youtube.length > 0 && (
              <div>
                {activeTab === 'all' && (
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    YouTube Videos ({displayVideos.youtube.length})
                    {youtubeLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent ml-2"></div>
                    )}
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayVideos.youtube.map((video) => (
                    <YouTubeVideoCard key={video.videoId} video={video} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Loading states */}
            {(loading || youtubeLoading) && (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-neutral-400 border-t-transparent"></div>
                  {loading && youtubeLoading ? 'Loading videos...' : loading ? 'Loading local videos...' : 'Loading YouTube videos...'}
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

export default SearchResultsPage;