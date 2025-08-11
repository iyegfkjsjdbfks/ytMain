import React, { useState } from 'react';
import Link, { Link, useParams } from 'react-router-dom';
import { queryClient } from '@/hooks/useQueryClient';

import { isYouTubeUrl } from '@/lib/youtube-utils';

import { logger } from '@/utils/logger';

import { useUnifiedVideo } from '@/hooks/unified/useVideos';

import { VideoPlayer } from '../components/VideoPlayer';
import type { Video } from '../../../types/core';
import VideoCard from '../components/VideoCard';
import YouTubePlayer from '../../../components/YouTubePlayer';

const WatchPage: React.FC = () => {
  const { videoId: paramVideoId } = useParams<{ videoId: string }>();
  const [searchParams] = useSearchParams();

  // Get video ID from either URL params or query string
  const videoId = paramVideoId || searchParams.get('v') || '';
  logger.debug(
    `🎬 WatchPage: Rendering with videoId: ${videoId} (from ${paramVideoId ? 'params' : 'query'})`
  );

  const {
    data: video,
    loading,
    error,
  } = useUnifiedVideo(videoId, {
    staleTime: 0, // Force fresh data
  });
  logger.debug(
    '📊 WatchPage: Video data received:',
    video ? `${video.title} (${video.source})` : 'No video'
  );
  logger.debug('📊 WatchPage: Loading state:', loading);
  logger.debug('📊 WatchPage: Error state:', error);

  // Debug metadata fields
  if (video) {
    logger.debug('📊 WatchPage: Metadata debug:', {
      title: video.title,
      channelName: video.channel?.name,
      channelAvatar: video.channel?.avatarUrl,
      subscribers: video.channel?.subscribersFormatted,
      views: video.viewsFormatted,
      likes: video.likes,
      dislikes: video.dislikes,
      publishedAt: video.publishedAt,
      source: video.source,
    });

    // Enhanced debugging for Google Custom Search videos
    if (video.source === 'google-search') {
      logger.debug('🔍 Google Custom Search Video Debug:', {
        id: video.id,
        title: video.title,
        description: `${video.description?.substring(0, 100)}...`,
        channel: {
          id: video.channel?.id,
          name: video.channel?.name,
          avatarUrl: video.channel?.avatarUrl,
          subscribers: video.channel?.subscribersFormatted,
          isVerified: video.channel?.isVerified,
        },
        stats: {
          views: video.views,
          viewsFormatted: video.viewsFormatted,
          likes: video.likes,
          dislikes: video.dislikes,
          commentCount: video.commentCount,
        },
        metadata: {
          duration: video.duration,
          publishedAt: video.publishedAt,
          publishedAtFormatted: video.publishedAtFormatted,
          category: video.category,
          tags: video.tags,
          source: video.source,
        },
        technicalData: {
          videoUrl: video.videoUrl,
          thumbnailUrl: video.thumbnailUrl,
          visibility: video.visibility,
        },
      });
    }
  }
  logger.debug('📊 WatchPage: Video object:', video);
  logger.debug('📊 WatchPage: Video truthy:', !!video);
  logger.debug(`⏳ WatchPage: Loading state: ${loading}`);

  const [_recommendedVideos, setRecommendedVideos] = useState<Video[]>([]);
  const [_showFullDescription, _setShowFullDescription] = useState(false);

  useEffect(() => {
    if (videoId) {
      loadRecommendations();
    }
  }, [videoId]);

  const loadRecommendations = async () => {
    try {
      logger.debug('🎯 Loading recommendations using unified data service...');
      logger.debug('🎯 Current videoId:', videoId);

      // Import the unified data service
      const { unifiedDataService } = await import(
        '../../../services/unifiedDataService'
      );
      logger.debug('✅ Unified data service imported successfully');

      // Get trending videos as recommendations (using hybrid YouTube API + Google Custom Search)
      logger.debug('🔄 Calling getTrendingVideos...');
      const response = await unifiedDataService.getTrendingVideos(10, {});
      logger.debug('📊 Unified service response:', response);

      const unifiedVideos = response.data;
      logger.debug(
        `📺 Loaded ${unifiedVideos.length} recommendations with unified metadata`
      );
      logger.debug(
        '📺 First few recommendations:',
        unifiedVideos
          .slice(0, 3)
          .map((v: any) => ({ id: v.id, title: v.title }))
      );

      // Convert UnifiedVideoMetadata to Video format for compatibility
      const convertedRecommendations: Video[] = unifiedVideos.map(
        (unifiedVideo: any) => ({
          id: unifiedVideo.id,
          createdAt: unifiedVideo.publishedAt,
          updatedAt: unifiedVideo.publishedAt,
          title: unifiedVideo.title,
          description: unifiedVideo.description,
          thumbnailUrl: unifiedVideo.thumbnailUrl,
          videoUrl: unifiedVideo.videoUrl,
          duration: unifiedVideo.duration,
          views: unifiedVideo.viewsFormatted,
          viewCount: unifiedVideo.views,
          likes: unifiedVideo.likes,
          likeCount: unifiedVideo.likes,
          dislikeCount: unifiedVideo.dislikes,
          commentCount: unifiedVideo.commentCount,
          dislikes: unifiedVideo.dislikes,
          uploadedAt: unifiedVideo.publishedAt,
          publishedAt: unifiedVideo.publishedAt,
          channelName: unifiedVideo.channel.name,
          channelId: unifiedVideo.channel.id,
          channelAvatarUrl: unifiedVideo.channel.avatarUrl,
          category: unifiedVideo.category,
          tags: unifiedVideo.tags,
          isLive: unifiedVideo.isLive,
          isShort: unifiedVideo.isShort,
          visibility: unifiedVideo.visibility,
          statistics: {
            viewCount: unifiedVideo.views,
            likeCount: unifiedVideo.likes,
            dislikeCount: unifiedVideo.dislikes,
            favoriteCount: 0,
            commentCount: unifiedVideo.commentCount,
          },
          topicDetails: {
            topicIds: [],
            relevantTopicIds: [],
            topicCategories: [],
          },
          contentDetails: {
            duration: unifiedVideo.duration,
            dimension: '2d',
            definition: unifiedVideo.metadata?.quality === 'hd' ? 'hd' : 'sd',
            caption: 'false',
            licensedContent: false,
            contentRating: {},
            projection: 'rectangular',
          },
        })
      );

      logger.debug(
        '✅ Recommendations converted to Video format:',
        convertedRecommendations.map(v => ({
          id: v.id,
          title: v.title,
          views: v.viewCount,
          source: v.id.startsWith('google-search-')
            ? 'Google Custom Search'
            : 'YouTube API',
        }))
      );

      setRecommendedVideos(convertedRecommendations);
      logger.debug(
        '✅ Recommendations state updated, length:',
        convertedRecommendations.length
      );
    } catch (error) {
      logger.error('❌ Error loading recommendations:', error);
      logger.error('❌ Error details:', error);

      // Fallback to a simple mock video for testing
      const fallbackVideo: Video = {
        id: 'fallback-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: 'Fallback Test Video',
        description: 'This is a fallback video for testing',
        thumbnailUrl: 'https://picsum.photos/320/180',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: '3:30',
        views: '1M',
        viewCount: 1000000,
        likes: 1000,
        likeCount: 1000,
        dislikeCount: 10,
        commentCount: 100,
        dislikes: 10,
        uploadedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        channelName: 'Test Channel',
        channelId: 'test-channel',
        channelAvatarUrl: 'https://picsum.photos/48/48',
        category: 'Entertainment',
        tags: ['test'],
        isLive: false,
        isShort: false,
        visibility: 'public',
        statistics: {
          viewCount: 1000000,
          likeCount: 1000,
          dislikeCount: 10,
          favoriteCount: 0,
          commentCount: 100,
        },
        topicDetails: {
          topicIds: [],
          relevantTopicIds: [],
          topicCategories: [],
        },
        contentDetails: {
          duration: 'PT3M30S',
          dimension: '2d',
          definition: 'hd',
          caption: 'false',
          licensedContent: false,
          contentRating: {},
          projection: 'rectangular',
        },
      };

      setRecommendedVideos([fallbackVideo]);
      logger.debug('✅ Fallback video set for testing');
    }
  };

  // const _handleSubscribe = () => {
  //   setIsSubscribed(!isSubscribed);
  // };

  if (loading) {
    return (
      <div className='min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-red-600' />
      </div>
    );
  }

  if (!video) {
    const testGoogleSearchFallback = async () => {
      try {
        logger.debug('🧪 Testing Google Custom Search fallback manually...');
        logger.debug('🎯 Current video ID:', videoId);

        // Check current provider setting
        const { getYouTubeSearchProvider } = await import(
          '../../../../services/settingsService'
        );
        const currentProvider = getYouTubeSearchProvider();
        logger.debug('⚙️ Current YouTube Search Provider:', currentProvider);

        // Check if YouTube API is blocked
        const { isYouTubeDataApiBlocked } = await import(
          '../../../utils/youtubeApiUtils'
        );
        const isBlocked = isYouTubeDataApiBlocked();
        logger.debug('🔒 YouTube Data API Blocked:', isBlocked);

        // Check what's in the Google Search video store
        const { googleSearchVideoStore } = await import(
          '../../../../services/googleSearchVideoStore'
        );
        const allVideos = googleSearchVideoStore.getAllVideos();
        logger.debug('📦 Videos in Google Search store:', allVideos.length);
        logger.debug(
          '📦 Store contents:',
          allVideos.map(v => ({ id: v.id, title: v.title }))
        );

        // Check if our specific video is in the store
        const specificVideo = googleSearchVideoStore.getVideo(videoId);
        logger.debug('🔍 Specific video in store:', specificVideo);

        // Try to fetch the video directly from Google Custom Search API
        if (!specificVideo && videoId.startsWith('google-search-')) {
          const youtubeId = videoId.replace('google-search-', '');
          logger.debug(
            '🌐 Attempting to fetch from Google Custom Search API with YouTube ID:',
            youtubeId
          );

          const { fetchSingleVideoFromGoogleSearch } = await import(
            '../../../../services/googleSearchService'
          );
          const fetchedVideo =
            await fetchSingleVideoFromGoogleSearch(youtubeId);
          logger.debug('🌐 Fetched video result:', fetchedVideo);
        }

        // Clear any cached data first
        const { unifiedDataService } = await import(
          '../../../services/unifiedDataService'
        );
        unifiedDataService.clearCache(`video:${videoId}`);
        unifiedDataService.clearCache('unified-video');
        logger.debug(`🗑️ Cleared cache for ${videoId}`);

        const result = await unifiedDataService.getVideoById(videoId);
        logger.debug('🧪 Test result:', result);

        if (result) {
          const viewsInfo = result.views
            ? `${result.views.toLocaleString()} views`
            : 'Views: Not available';
          alert(
            `✅ Test Success!\nProvider: ${currentProvider}\nYouTube API Blocked: ${isBlocked}\nTitle: ${result.title}\n${viewsInfo}\nChannel: ${result.channel?.name}\nSource: ${result.source}`
          );
        } else {
          alert(
            `❌ Test failed: No video found\nProvider: ${currentProvider}\nYouTube API Blocked: ${isBlocked}`
          );
        }
      } catch (error) {
        logger.error('🧪 Test error:', error);
        alert(`❌ Test error: ${error}`);
      }
    };

    const clearCacheAndRefresh = async () => {
      try {
        logger.debug('🗑️ Clearing all caches and refreshing...');

        // Clear unified data service cache
        const { unifiedDataService } = await import(
          '../../../services/unifiedDataService'
        );
        unifiedDataService.clearCache(); // Clear all cache
        logger.debug('✅ Unified data service cache cleared');

        // Clear Google Search video store
        const { googleSearchVideoStore } = await import(
          '../../../../services/googleSearchVideoStore'
        );
        googleSearchVideoStore.clear();
        logger.debug('✅ Google Search video store cleared');

        // Clear React Query cache

        queryClient.clear();
        logger.debug('✅ React Query cache cleared');

        // Clear browser storage
        localStorage.removeItem('google-search-videos');
        sessionStorage.clear();
        logger.debug('✅ Browser storage cleared');

        logger.debug('🔄 Reloading page...');
        window.location.reload();
      } catch (error) {
        logger.error('❌ Cache clear error:', error);
      }
    };

    return (
      <div className='min-h-screen bg-white dark:bg-neutral-900 p-6'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-2xl font-bold text-neutral-900 dark:text-white mb-4'>
            {loading ? 'Loading video...' : 'Video not found'}
          </h1>

          {/* Debug Information Panel */}
          <div className='bg-neutral-100 dark:bg-neutral-800 rounded-lg p-6 mb-6'>
            <h2 className='text-lg font-semibold text-neutral-900 dark:text-white mb-4'>
              🔍 Debug Information
            </h2>
            <div className='space-y-2 text-sm text-neutral-700 dark:text-neutral-300'>
              <div>
                <strong>Video ID from URL:</strong> {videoId}
              </div>
              <div>
                <strong>Loading State:</strong> {loading ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Error State:</strong> {error || 'None'}
              </div>
              <div>
                <strong>Hook Response:</strong> {video ? 'Video found' : 'null'}
              </div>
              <div>
                <strong>Video Data:</strong>{' '}
                {video ? JSON.stringify(video, null, 2) : 'null'}
              </div>
              <div>
                <strong>Environment Check:</strong>
              </div>
              <div className='ml-4'>
                <div>
                  VITE_GOOGLE_SEARCH_API_KEY:{' '}
                  {import.meta.env.VITE_GOOGLE_SEARCH_API_KEY
                    ? '✅ Set'
                    : '❌ Missing'}
                </div>
                <div>
                  VITE_GOOGLE_SEARCH_ENGINE_ID:{' '}
                  {import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID
                    ? '✅ Set'
                    : '❌ Missing'}
                </div>
                <div>
                  VITE_YOUTUBE_API_KEY:{' '}
                  {import.meta.env.VITE_YOUTUBE_API_KEY
                    ? '✅ Set'
                    : '❌ Missing'}
                </div>
              </div>
              <div>
                <strong>⚠️ Note:</strong> YouTube API is blocked when Google
                Custom Search is selected in admin panel
              </div>
              <div>
                <strong>💡 Expected:</strong> Google Custom Search should
                provide basic metadata, but view counts may not be available
              </div>
            </div>

            {/* Manual Retry Button */}
            <div className='mt-4'>
              <button
                onClick={async () => {
                  if (videoId.startsWith('google-search-')) {
                    const youtubeId = videoId.replace('google-search-', '');
                    logger.debug(
                      '🔄 Manual retry: Attempting to fetch video:',
                      youtubeId
                    );

                    try {
                      const { fetchSingleVideoFromGoogleSearch } = await import(
                        '../../../../services/googleSearchService'
                      );
                      const result =
                        await fetchSingleVideoFromGoogleSearch(youtubeId);
                      logger.debug('🔄 Manual retry result:', result);

                      if (result) {
                        alert(
                          `✅ Video fetched successfully!\nTitle: ${result.title}\nChannel: ${result.channelName}`
                        );
                        // Refresh the page to load the video
                        window.location.reload();
                      } else {
                        alert(
                          '❌ Failed to fetch video from Google Custom Search API'
                        );
                      }
                    } catch (error) {
                      logger.error('Manual retry error:', error);
                      alert(
                        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
                      );
                    }
                  }
                }}
                className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
              >
                🔄 Retry Fetch Video
              </button>
            </div>
          </div>

          <div className='space-y-4'>
            <button
              onClick={testGoogleSearchFallback}
              className='w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
            >
              🧪 Test Google Custom Search Fallback
            </button>

            <button
              onClick={clearCacheAndRefresh}
              className='w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium'
            >
              🗑️ Clear Cache & Refresh
            </button>

            <Link
              to='/'
              className='block w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-center'
            >
              ← Go back to home
            </Link>
          </div>

          <div className='mt-6 text-xs text-neutral-500 dark:text-neutral-400'>
            <p>
              💡 <strong>Tip:</strong> Open browser developer tools (F12) to see
              detailed console logs
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white dark:bg-neutral-900'>
      <div className='max-w-7xl mx-auto px-4 py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Main Content */}
          <div className='lg:col-span-2'>
            {/* Video Player */}
            <div className='bg-black rounded-lg overflow-hidden mb-4'>
              {isYouTubeUrl(video.videoUrl || '') ? (
                <YouTubePlayer
                  video={
                    {
                      ...video,
                      viewCount: video.views,
                      duration:
                        typeof video.duration === 'string'
                          ? parseInt(
                              video.duration
                                .split(':')
                                .reduce((acc, time) => 60 * acc + +time, 0)
                                .toString(),
                              10
                            )
                          : (video.duration as number) || 0,
                    } as unknown as Video
                  }
                  autoplay={true}
                  width='100%'
                  height={480}
                  controls={true}
                  className='w-full h-full'
                />
              ) : (
                <VideoPlayer
                  videoId={video.id}
                  src={
                    video.videoUrl ||
                    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
                  }
                  poster={video.thumbnailUrl}
                  title={video.title}
                  autoplay={true}
                  className='w-full'
                  useYouTube={false}
                  onTimeUpdate={(_currentTime, _duration) => {
                    // Track watch progress
                  }}
                  onPlay={() => {
                    // Handle play event
                  }}
                />
              )}
            </div>

            {/* Video Metadata */}
            <div className='space-y-4'>
              {/* Video Title */}
              <h1 className='text-xl font-bold text-neutral-900 dark:text-white'>
                {video.title}
              </h1>

              {/* Channel Metadata Section - Mirroring search results styling */}
              <div className='flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-700'>
                {/* Channel Avatar */}
                <Link
                  to={`/channel/${video.channel?.id}`}
                  className='flex-shrink-0'
                >
                  <img
                    src={
                      video.channel?.avatarUrl ||
                      'https://picsum.photos/seed/default-channel/150/150'
                    }
                    alt={video.channel?.name}
                    className='w-9 h-9 rounded-full object-cover'
                  />
                </Link>

                {/* Channel Info */}
                <div className='flex-1 min-w-0'>
                  <Link
                    to={`/channel/${video.channel?.id}`}
                    className='font-medium text-neutral-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors block'
                  >
                    {video.channel?.name}
                  </Link>
                  <div className='flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400'>
                    {/* Subscriber Count */}
                    <span>
                      {video.channel?.subscribersFormatted || '0 subscribers'}
                    </span>
                    <span>•</span>
                    {/* View Count */}
                    <span>{video.viewsFormatted || '0 views'}</span>
                  </div>
                </div>

                {/* Subscribe Button */}
                <button className='px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-medium'>
                  Subscribe
                </button>
              </div>

              {/* Video Stats and Actions */}
              <div className='flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-700'>
                <div className='flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400'>
                  <span>
                    {new Date(video.publishedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className='flex items-center gap-2'>
                  {/* Like Button */}
                  <button className='flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors'>
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7m5 3v10M9 7H6a2 2 0 00-2 2v8a2 2 0 002 2h2.5'
                      />
                    </svg>
                    <span>{(video.likes || 0).toLocaleString()}</span>
                  </button>

                  {/* Dislike Button */}
                  {video.dislikes && (
                    <button className='flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors'>
                      <svg
                        className='w-5 h-5 rotate-180'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7m5 3v10M9 7H6a2 2 0 00-2 2v8a2 2 0 002 2h2.5'
                        />
                      </svg>
                      <span>{video.dislikes.toLocaleString()}</span>
                    </button>
                  )}

                  {/* Share Button */}
                  <button className='flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors'>
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
                      />
                    </svg>
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Channel Information */}
              <div className='flex items-start gap-4'>
                <Link
                  to={`/channel/${video.channel?.id}`}
                  className='flex-shrink-0'
                >
                  <img
                    src={
                      video.channel?.avatarUrl ||
                      'https://picsum.photos/seed/default-channel/150/150'
                    }
                    alt={video.channel?.name}
                    className='w-12 h-12 rounded-full object-cover'
                  />
                </Link>

                <div className='flex-1 min-w-0'>
                  <div>
                    <Link
                      to={`/channel/${video.channel?.id}`}
                      className='font-semibold text-neutral-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors'
                    >
                      {video.channel?.name}
                    </Link>
                    <p className='text-sm text-neutral-600 dark:text-neutral-400'>
                      {video.channel?.subscribersFormatted || '0 subscribers'} •{' '}
                      {video.viewsFormatted || '0 views'}
                    </p>
                  </div>

                  {/* Video Description */}
                  <div className='mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg'>
                    <div className='text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap'>
                      {video.description}
                    </div>
                    {/* Tags */}{' '}
                    {video.tags && video.tags.length > 0 && (
                      <div className='mt-4 flex flex-wrap gap-2'>
                        {video.tags.map((tag: any, index: number) => (
                          <span
                            key={index}
                            className='px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full'
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Additional Metadata */}
                    <div className='mt-4 space-y-3'>
                      {/* Basic Stats */}
                      <div className='grid grid-cols-2 gap-4 text-xs text-neutral-600 dark:text-neutral-400'>
                        <div>
                          <span className='font-medium'>Category:</span>{' '}
                          {video.category}
                        </div>
                        <div>
                          <span className='font-medium'>Duration:</span>{' '}
                          {video.duration || '0:00'}
                        </div>
                        <div>
                          <span className='font-medium'>Views:</span>{' '}
                          {video.viewsFormatted}
                        </div>
                        <div>
                          <span className='font-medium'>Likes:</span>{' '}
                          {(video.likes || 0).toLocaleString()}
                        </div>
                        {video.commentCount && (
                          <div>
                            <span className='font-medium'>Comments:</span>{' '}
                            {video.commentCount.toLocaleString()}
                          </div>
                        )}
                        <div>
                          <span className='font-medium'>Source:</span>{' '}
                          {video.source || 'local'}
                        </div>
                      </div>

                      {/* YouTube Specific Metadata */}
                      {(video.source === 'youtube' ||
                        video.source === 'google-search') && (
                        <div className='pt-3 border-t border-neutral-200 dark:border-neutral-600'>
                          <h4 className='font-medium text-sm text-neutral-800 dark:text-neutral-200 mb-2'>
                            {video.source === 'google-search'
                              ? 'Google Custom Search Metadata'
                              : 'YouTube Metadata'}
                          </h4>
                          <div className='grid grid-cols-2 gap-2 text-xs text-neutral-600 dark:text-neutral-400'>
                            <div>
                              <span className='font-medium'>Published:</span>{' '}
                              {video.publishedAtFormatted}
                            </div>
                            <div>
                              <span className='font-medium'>Quality:</span>{' '}
                              {video.metadata?.definition || 'HD'}
                            </div>
                            <div>
                              <span className='font-medium'>Captions:</span>{' '}
                              {video.metadata?.captions ? 'Available' : 'None'}
                            </div>
                            <div>
                              <span className='font-medium'>License:</span>{' '}
                              {video.metadata?.license || 'Standard'}
                            </div>
                            <div>
                              <span className='font-medium'>Source:</span>{' '}
                              {video.source === 'google-search'
                                ? 'Google Custom Search JSON API'
                                : 'YouTube Data API v3'}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Channel Metadata */}
                      {video.channel && (
                        <div className='pt-3 border-t border-neutral-200 dark:border-neutral-600'>
                          <h4 className='font-medium text-sm text-neutral-800 dark:text-neutral-200 mb-2'>
                            Channel Details
                          </h4>
                          <div className='grid grid-cols-2 gap-2 text-xs text-neutral-600 dark:text-neutral-400'>
                            <div>
                              <span className='font-medium'>Channel ID:</span>{' '}
                              {video.channel.id}
                            </div>
                            <div>
                              <span className='font-medium'>Subscribers:</span>{' '}
                              {video.channel.subscribersFormatted}
                            </div>
                            <div>
                              <span className='font-medium'>Verified:</span>{' '}
                              {video.channel.isVerified ? 'Yes' : 'No'}
                            </div>
                            <div>
                              <span className='font-medium'>Name:</span>{' '}
                              {video.channel.name}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Debug Info */}
                      <details className='pt-3 border-t border-neutral-200 dark:border-neutral-600'>
                        <summary className='cursor-pointer text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'>
                          Raw Video Data (Debug)
                        </summary>
                        <pre className='mt-2 p-2 bg-neutral-100 dark:bg-neutral-700 rounded text-xs overflow-auto max-h-40 text-neutral-700 dark:text-neutral-300'>
                          {JSON.stringify(video, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Recommended Videos */}
          <div className='lg:col-span-1'>
            <h3 className='text-lg font-semibold text-neutral-900 dark:text-white mb-4'>
              Recommended Videos
            </h3>
            <div className='space-y-4'>
              {(() => {
                logger.debug(
                  '🎬 Rendering recommendations, count:',
                  _recommendedVideos.length
                );
                return null;
              })()}
              {_recommendedVideos.length === 0 ? (
                <div className='text-neutral-500 dark:text-neutral-400 text-sm'>
                  Loading recommendations...
                </div>
              ) : (
                _recommendedVideos.map(recommendedVideo => {
                  logger.debug(
                    '🎬 Rendering recommendation:',
                    recommendedVideo.id,
                    recommendedVideo.title
                  );
                  return (
                    <VideoCard
                      key={recommendedVideo.id}
                      video={recommendedVideo}
                      variant='compact'
                      onClick={() => {
                        logger.debug(
                          '🎬 Recommendation clicked:',
                          recommendedVideo.id
                        );
                        window.location.href = `/watch?v=${recommendedVideo.id}`;
                      }}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;


