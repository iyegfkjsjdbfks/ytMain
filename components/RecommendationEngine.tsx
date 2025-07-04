import type React from 'react';
import { useState, useEffect } from 'react';

import { realVideos } from '../services/realVideoService';

import OptimizedVideoCard from './OptimizedVideoCard';

import type { Video } from '../types';


interface RecommendationEngineProps {
  userId?: string;
  currentVideo?: Video;
  watchHistory?: Video[];
  preferences?: {
    categories: string[];
    channels: string[];
    duration: string;
  };
  maxRecommendations?: number;
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({
  userId,
  currentVideo,
  watchHistory = [],
  preferences,
  maxRecommendations = 10,
}) => {
  const [recommendations, setRecommendations] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateRecommendations();
  }, [userId, currentVideo, watchHistory, preferences]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Use real videos for recommendations
      const availableVideos = realVideos.filter(video =>
        !currentVideo || video.id !== currentVideo.id,
      );

      // Simple recommendation logic using dummy data
      const shuffled = [...availableVideos].sort(() => Math.random() - 0.5);
      const recommended = shuffled.slice(0, maxRecommendations);

      setRecommendations(recommended);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recommendations available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Recommended for you
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {recommendations.map((video) => (
          <OptimizedVideoCard
            key={video.id}
            video={video}
            showChannel={true}
            onClick={() => {
              // Handle video click
              console.log('Clicked video:', video.title);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendationEngine;
