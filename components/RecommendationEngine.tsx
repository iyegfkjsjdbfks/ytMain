import type React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';

import { realVideos } from '../services/realVideoService';
import { youtubeSearchService } from '../services/youtubeSearchService';
import { getYouTubeSearchProvider } from '../services/settingsService';

import OptimizedVideoCard from './OptimizedVideoCard';
import EnhancedYouTubeVideoCard from './EnhancedYouTubeVideoCard';

import type { Video } from '../types';


interface RecommendationEngineProps {
  currentVideo?: Video;
  currentVideoId?: string;
  maxRecommendations?: number;
  onVideoSelect?: (videoId: string) => void;
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({
  currentVideo,
  currentVideoId,
  maxRecommendations = 10,
  onVideoSelect,
}) => {
  const [recommendations, setRecommendations] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [useGoogleCustomSearch, setUseGoogleCustomSearch] = useState(false);
  const [searchProvider, setSearchProvider] = useState<string>('google-search');

  // Determine the current video ID from either prop
  const activeVideoId = useMemo(() => {
    return currentVideo?.id || currentVideoId;
  }, [currentVideo?.id, currentVideoId]);

  // Check API configuration and determine strategy
  useEffect(() => {
    const provider = getYouTubeSearchProvider();
    const googleSearchConfigured = youtubeSearchService.isConfigured();
    const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    
    setSearchProvider(provider);
    
    // NEW STRATEGY: Google Custom Search for discovery, YouTube Data API v3 for metadata
    const shouldUseGoogleCustomSearch = googleSearchConfigured; // Use Google Custom Search for discovery
    
    setUseGoogleCustomSearch(shouldUseGoogleCustomSearch);
    
    console.log('🎯 NEW STRATEGY - Discovery and Metadata Configuration:');
    console.log('   Admin Selected Provider:', provider);
    console.log('   🔍 DISCOVERY: Google Custom Search API', googleSearchConfigured ? '✅ Available (DEFAULT)' : '❌ Not configured');
    console.log('   📋 METADATA: YouTube Data API v3', youtubeApiKey ? '✅ Available (PRIMARY)' : '❌ Missing');
    console.log('   Strategy: Google Custom Search (discovery) + YouTube Data API v3 (metadata)');
    
    if (googleSearchConfigured && youtubeApiKey) {
      console.log('✅ Optimal setup: Google Custom Search discovery with YouTube Data API v3 metadata');
    } else if (googleSearchConfigured) {
      console.log('⚠️ Google Custom Search discovery only (YouTube API metadata not available)');
    } else if (youtubeApiKey) {
      console.log('⚠️ YouTube Data API v3 only (Google Custom Search discovery not available)');
    } else {
      console.log('❌ No APIs available - will use local video fallback');
    }
  }, []);

  // Stable reference for generateRecommendations function
  const generateRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      let recommendedVideos: Video[] = [];

      if (useGoogleCustomSearch) {
        console.log('🎯 Using NEW STRATEGY: Google Custom Search (discovery) + YouTube Data API v3 (metadata)');
        console.log('🔍 Current video context:', {
          id: currentVideo?.id,
          title: currentVideo?.title,
          category: currentVideo?.category,
          tags: currentVideo?.tags,
          channelName: currentVideo?.channelName
        });

        // Use unified data service which implements the new priority strategy
        const { unifiedDataService } = await import('../src/services/unifiedDataService');
        console.log('🔄 Unified data service imported successfully');

        if (currentVideo) {
          // Search for related videos based on current video
          const searchQuery = currentVideo.title || currentVideo.channelName || 'trending videos';
          console.log('🔍 Searching for related videos with query:', searchQuery);
          const searchResponse = await unifiedDataService.searchVideos(searchQuery, {}, maxRecommendations);
          console.log('📊 Search response from unified service:', searchResponse);
          const unifiedVideos = searchResponse.data;
          console.log('📺 Unified videos from search:', unifiedVideos.length);

          // Convert UnifiedVideoMetadata to Video format
          recommendedVideos = unifiedVideos.map((unifiedVideo) => ({
            id: unifiedVideo.id,
            title: unifiedVideo.title,
            description: unifiedVideo.description,
            thumbnailUrl: unifiedVideo.thumbnailUrl,
            videoUrl: unifiedVideo.videoUrl,
            duration: unifiedVideo.duration,
            views: unifiedVideo.viewsFormatted,
            viewCount: unifiedVideo.views,
            channelName: unifiedVideo.channel.name,
            channelId: unifiedVideo.channel.id,
            channelAvatarUrl: unifiedVideo.channel.avatarUrl,
            uploadedAt: unifiedVideo.publishedAt,
            category: unifiedVideo.category,
            tags: unifiedVideo.tags,
            isLive: unifiedVideo.isLive,
            isShort: unifiedVideo.isShort,
          }));
        } else {
          // Get trending videos as recommendations
          console.log('🔍 Getting trending videos using unified service...');
          const trendingResponse = await unifiedDataService.getTrendingVideos(maxRecommendations);
          const unifiedVideos = trendingResponse.data;

          // Convert UnifiedVideoMetadata to Video format
          recommendedVideos = unifiedVideos.map((unifiedVideo) => ({
            id: unifiedVideo.id,
            title: unifiedVideo.title,
            description: unifiedVideo.description,
            thumbnailUrl: unifiedVideo.thumbnailUrl,
            videoUrl: unifiedVideo.videoUrl,
            duration: unifiedVideo.duration,
            views: unifiedVideo.viewsFormatted,
            viewCount: unifiedVideo.views,
            channelName: unifiedVideo.channel.name,
            channelId: unifiedVideo.channel.id,
            channelAvatarUrl: unifiedVideo.channel.avatarUrl,
            uploadedAt: unifiedVideo.publishedAt,
            category: unifiedVideo.category,
            tags: unifiedVideo.tags,
            isLive: unifiedVideo.isLive,
            isShort: unifiedVideo.isShort,
          }));
        }

        console.log(`📋 Unified service returned ${recommendedVideos.length} recommendations using discovery + metadata strategy`);

        // Fallback to local videos only if both APIs fail
        if (recommendedVideos.length === 0) {
          console.log('⚠️ No results from Google Custom Search discovery or YouTube Data API v3 metadata, falling back to local videos');
          const availableVideos = realVideos.filter(video =>
            !activeVideoId || video.id !== activeVideoId,
          );
          recommendedVideos = availableVideos.slice(0, maxRecommendations);
        } else {
          console.log(`✅ Using ${recommendedVideos.length} recommendations from discovery + metadata strategy`);
        }
      } else {
        // Fallback to real videos with basic recommendation logic
        console.log('Using fallback recommendation system');
        const availableVideos = realVideos.filter(video =>
          !activeVideoId || video.id !== activeVideoId,
        );

        // Simple recommendation logic - prioritize similar categories if available
        let recommended: Video[] = [];
        
        if (currentVideo?.category) {
          // First, try to get videos from the same category
          const sameCategory = availableVideos.filter(
            video => video.category === currentVideo.category
          );
          recommended = [...sameCategory];
        }
        
        // Fill remaining slots with other videos
        if (recommended.length < maxRecommendations) {
          const remaining = availableVideos.filter(
            video => !recommended.find(r => r.id === video.id)
          );
          recommended = [...recommended, ...remaining];
        }

        // Shuffle and limit
        const shuffled = [...recommended].sort(() => Math.random() - 0.5);
        recommendedVideos = shuffled.slice(0, maxRecommendations);
      }

      setRecommendations(recommendedVideos);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      
      // Fallback to real videos in case of error
      const availableVideos = realVideos.filter(video =>
        !activeVideoId || video.id !== activeVideoId,
      );
      const fallbackVideos = availableVideos.slice(0, maxRecommendations);
      setRecommendations(fallbackVideos);
    } finally {
      setLoading(false);
    }
  }, [activeVideoId, currentVideo, currentVideoId, maxRecommendations, useGoogleCustomSearch, searchProvider]);

  // Use stable dependencies to prevent infinite re-renders
  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  const handleVideoClick = useCallback((video: Video) => {
    if (onVideoSelect) {
      onVideoSelect(video.id);
    } else {
      // Default behavior - navigate to watch page
      // Ensure we preserve the video ID exactly as it is (with google-search- prefix if it has one)
      window.location.href = `/watch?v=${video.id}`;
    }
  }, [onVideoSelect]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recommended for you
          </h3>
          {useGoogleCustomSearch && (
            <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>Google Custom Search discovery + YouTube Data API v3 metadata...</span>
            </div>
          )}
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recommended for you
        </h3>
        <div className="text-center py-8 text-gray-500">
          No recommendations available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recommended for you
        </h3>
        {useGoogleCustomSearch && (
          <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Google Custom Search Discovery + YouTube Data API v3 Metadata ({searchProvider})</span>
          </div>
        )}
      </div>
      <div className="space-y-3">
        {recommendations.map((video) => (
          <div key={video.id} className="cursor-pointer" onClick={() => handleVideoClick(video)}>
            {useGoogleCustomSearch ? (
              <EnhancedYouTubeVideoCard
                video={video}
                onVideoSelect={onVideoSelect}
                showChannel={true}
                size="sm"
              />
            ) : (
              <OptimizedVideoCard
                video={video}
                showChannel={true}
                size="sm"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationEngine;
