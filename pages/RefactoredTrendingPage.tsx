import React from 'react';
import { useVideosData } from '../hooks';
import { StandardPageLayout } from '../components/StandardPageLayout';
import { ReusableVideoGrid } from '../components/ReusableVideoGrid';
import { Video } from '../types';

/**
 * Refactored Trending Page demonstrating the use of reusable components
 * 
 * This page shows how the new reusable components reduce code duplication:
 * - StandardPageLayout handles loading, error, and empty states
 * - ReusableVideoGrid handles video display logic
 * - Custom hooks manage data fetching
 * 
 * Compare this with the original TrendingPage to see the reduction in boilerplate
 */
const RefactoredTrendingPage: React.FC = () => {
  const { data: videos, loading, error } = useVideosData('trending');

  const handleVideoClick = (video: Video) => {
    // Navigate to video or handle click
    window.location.href = `/watch?v=${video.id}`;
  };

  return (
    <StandardPageLayout
      title="Trending"
      subtitle="See what's trending on YouTube"
      loading={loading}
      error={error}
      isEmpty={!videos || videos.length === 0}
      emptyMessage="No trending videos available"
      emptyDescription="Check back later for trending content"
    >
      <ReusableVideoGrid
        videos={videos || []}
        onVideoClick={handleVideoClick}
        optimized={true}
        columns="auto"
        gap="md"
        showChannelName={true}
        showDuration={true}
        showViews={true}
        showUploadDate={true}
        className="mt-6"
      />
    </StandardPageLayout>
  );
};

export default RefactoredTrendingPage;