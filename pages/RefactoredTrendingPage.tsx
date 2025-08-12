import React, { FC } from 'react';
import { Navigate } from 'react-router-dom';
import type React from 'react';

import ReusableVideoGrid from '../components/ReusableVideoGrid';
import StandardPageLayout from '../components/StandardPageLayout';
import { useVideosData } from '../hooks';

import type { Video } from '../types';

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
  const { data: unifiedVideos, loading, error } = useVideosData('trending');

  // Convert UnifiedVideoMetadata to Video format for compatibility
  const videos: Video[] = unifiedVideos ? unifiedVideos.map((video: any) => ({,
    id: video.id,
          title: video.title,
    description: video.description,
          thumbnailUrl: video.thumbnailUrl,
    videoUrl: video.videoUrl,
          duration: video.duration,
    views: video.views?.toString() || '0',
          viewCount: typeof video.views === 'number' ? video.views : parseInt(video.views?.toString() || '0', 10) || 0,
    likes: video.likes,
          likeCount: video.likes,
    dislikes: video.dislikes || 0,
          dislikeCount: video.dislikes || 0,
    commentCount: video.commentCount || 0,
          uploadedAt: video.publishedAt || '',
    channelName: video.channel?.name || 'Unknown Channel',
          channelId: video.channel?.id || '',
    channelAvatarUrl: video.channel?.avatarUrl || '',
          category: video.category || 'General',
    tags: video.tags || [],
          visibility: video.visibility as 'public' | 'private' | 'unlisted' | 'scheduled',
    isLive: video.isLive || false,
          isShort: video.isShort || false,
    createdAt: video.publishedAt || '',
          updatedAt: video.publishedAt || '' })) : [];

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
      emptyComponent={
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No trending videos available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Check back later for trending content.
          </p>
        </div>
      }
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

