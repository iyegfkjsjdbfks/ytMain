import type React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';

import { realVideos } from '../services/realVideoService';
import { youtubeSearchService } from '../services/youtubeSearchService';

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
  const [useYouTubeAPI, setUseYouTubeAPI] = useState(false);

  // Determine the current video ID from either prop
  const activeVideoId = useMemo(() => {
    return currentVideo?.id || currentVideoId;
  }, [currentVideo?.id, currentVideoId]);

  // Check if YouTube Search API is configured
  useEffect(() => {
    const configured = youtubeSearchService.isConfigured();
    setUseYouTubeAPI(configured);
    console.log('🎯 YouTube API Configuration Status:', configured ? '✅ Configured' : '❌ Not configured');
    if (configured) {
      console.log('✅ YouTube recommendations will use live API');
    } else {
      console.log('⚠️ YouTube recommendations will use fallback sample videos');
    }
  }, []);

  // Stable reference for generateRecommendations function
  const generateRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      let recommendedVideos: Video[] = [];

      if (useYouTubeAPI && currentVideo) {
        // Use YouTube Search API for real recommendations
        console.log('🔍 Fetching YouTube recommendations for video:', {
          id: currentVideo.id,
          title: currentVideo.title,
          category: currentVideo.category,
          tags: currentVideo.tags,
          channelName: currentVideo.channelName
        });
        
        recommendedVideos = await youtubeSearchService.searchRelatedVideos(
          currentVideo,
          maxRecommendations
        );

        console.log(`📺 YouTube API returned ${recommendedVideos.length} recommendations`);

        // If YouTube API returns no results, fall back to real videos
        if (recommendedVideos.length === 0) {
          console.log('⚠️ No YouTube API results, falling back to real videos');
          const availableVideos = realVideos.filter(video =>
            !activeVideoId || video.id !== activeVideoId,
          );
          recommendedVideos = availableVideos.slice(0, maxRecommendations);
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
  }, [activeVideoId, currentVideo, maxRecommendations, useYouTubeAPI]);

  // Use stable dependencies to prevent infinite re-renders
  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  const handleVideoClick = useCallback((video: Video) => {
    if (onVideoSelect) {
      onVideoSelect(video.id);
    } else {
      // Default behavior - navigate to watch page
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
          {useYouTubeAPI && (
            <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>Fetching from YouTube...</span>
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
        {useYouTubeAPI && (
          <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Live YouTube API</span>
          </div>
        )}
      </div>
      <div className="space-y-3">
        {recommendations.map((video) => (
          <div key={video.id} className="cursor-pointer" onClick={() => handleVideoClick(video)}>
            {useYouTubeAPI && video.videoUrl?.includes('youtube.com') ? (
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
