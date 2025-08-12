import { Navigate } from 'react-router-dom';
import { useMemo, useCallback, useState, lazy, Suspense, FC } from 'react';

import { HomeIcon as HomeSolidIcon } from '@heroicons/react/24/solid';
const HomeIconSolid = HomeSolidIcon;

import CategoryChips from '../components/CategoryChips';
import ErrorBoundary from '../components/ErrorBoundary';
import LoadingSpinner from '../components/LoadingSpinner';
import VirtualizedVideoGrid from '../components/VirtualizedVideoGrid';
import { useHomeVideos } from '../src/hooks/useOptimizedVideoData';
import { cn } from '../src/lib/utils';

import type { Video } from '../types';

// Lazy load additional sections
const ShortsSection = React.lazy(() => import('../components/ShortsSection'));
const TrendingSection = React.lazy(() => import('../components/TrendingSection'));
const SubscriptionFeed = React.lazy(() => import('../components/SubscriptionFeed'));

interface OptimizedHomePageProps {
  className?: string;
}

const categories = [
  'All',
  'Technology',
  'Gaming',
  'Music',
  'Education',
  'Entertainment',
  'Sports',
  'News',
  'Comedy',
  'Science',
  'Travel',
  'Food',
];

const OptimizedHomePage: React.FC<OptimizedHomePageProps> = ({ className }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSections] = useState({
    shorts: true,
    trending: true,
    subscriptions: true,
  });

  // Use optimized video data hook
  const {
    data: videos,
    loading,
    error,
    refetch,
    hasMore,
    loadMore,
  } = useHomeVideos(selectedCategory === 'All' ? undefined : selectedCategory);

  // Memoized filtered videos
  const filteredVideos = useMemo(() => {
    if (selectedCategory === 'All') {
      return videos;
    }
    return videos.filter((video) => video.category === selectedCategory);
  }, [videos, selectedCategory]);

  // Event handlers
  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleVideoClick = useCallback((video: Video) => {
    // Navigate to watch page
    window.location.hash = `/watch/${video.id}`;
  }, []);

  const handleChannelClick = useCallback((channelId) => {
    // Navigate to channel page
    window.location.hash = `/channel/${channelId}`;
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // const _toggleSection = useCallback((section: keyof typeof showSections) => {
  //   setShowSections(prev => ({
  //     ...prev,
  //     [section]: !prev[section],
  //   }));
  // }, []);

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold mb-2 text-gray-900">Something went wrong</h2>
        <p className="text-gray-600 mb-4 max-w-md">
          {error}
        </p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <HomeIcon className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900">Home</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'px-3 py-1 rounded text-sm font-medium transition-colors',
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900',
                  )}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'px-3 py-1 rounded text-sm font-medium transition-colors',
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900',
                  )}
                >
                  List
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Chips */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <CategoryChips
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-8">
          {/* Shorts Section */}
          {showSections.shorts && (
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner size="lg" />}>
                <ShortsSection />
              </Suspense>
            </ErrorBoundary>
          )}

          {/* Main Video Grid */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedCategory === 'All' ? 'Recommended' : selectedCategory} Videos
              </h2>
              <span className="text-sm text-gray-500">
                {filteredVideos.length} videos
              </span>
            </div>

            {loading && filteredVideos.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 aspect-video rounded-lg mb-3" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[800px]">
                <VirtualizedVideoGrid
                  videos={filteredVideos}
                  loading={loading}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                  onVideoClick={handleVideoClick}
                  onChannelClick={handleChannelClick}
                  cardSize="md"
                  showChannel={true}
                  showDescription={false}
                />
              </div>
            )}
          </section>

          {/* Trending Section */}
          {showSections.trending && (
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner size="lg" />}>
                <TrendingSection />
              </Suspense>
            </ErrorBoundary>
          )}

          {/* Subscription Feed */}
          {showSections.subscriptions && (
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner size="lg" />}>
                <SubscriptionFeed />
              </Suspense>
            </ErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptimizedHomePage;


