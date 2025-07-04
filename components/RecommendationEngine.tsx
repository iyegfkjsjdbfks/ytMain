import type React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';

import { realVideos } from '../services/realVideoService';

import OptimizedVideoCard from './OptimizedVideoCard';

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

  // Determine the current video ID from either prop
  const activeVideoId = useMemo(() => {
    return currentVideo?.id || currentVideoId;
  }, [currentVideo?.id, currentVideoId]);

  // Stable reference for generateRecommendations function
  const generateRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      // Use real videos for recommendations
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
      const final = shuffled.slice(0, maxRecommendations);

      setRecommendations(final);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [activeVideoId, currentVideo?.category, maxRecommendations]);

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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recommended for you
        </h3>
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
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Recommended for you
      </h3>
      <div className="space-y-3">
        {recommendations.map((video) => (
          <div key={video.id} className="cursor-pointer" onClick={() => handleVideoClick(video)}>
            <OptimizedVideoCard
              video={video}
              showChannel={true}
              size="sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationEngine;
