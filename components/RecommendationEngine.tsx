import React, { useState, useEffect } from 'react';
import { ClockIcon, EyeIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from '../utils/dateUtils';
import { mockVideos } from '../services/mockVideoService';
import { Video } from '../types';

interface UserPreferences {
  watchHistory: string[];
  likedVideos: string[];
  subscribedChannels: string[];
  preferredCategories: string[];
  watchTime: { [videoId: string]: number };
  searchHistory: string[];
}

interface RecommendationEngineProps {
  currentVideoId?: string;
  maxRecommendations?: number;
  onVideoSelect?: (videoId: string) => void;
  className?: string;
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({
  currentVideoId,
  maxRecommendations = 20,
  onVideoSelect,
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState<Video[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    watchHistory: [],
    likedVideos: [],
    subscribedChannels: [],
    preferredCategories: [],
    watchTime: {},
    searchHistory: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recommendationType, setRecommendationType] = useState<'personalized' | 'trending' | 'similar'>('personalized');

  useEffect(() => {
    loadUserPreferences();
    generateRecommendations();
  }, [currentVideoId, recommendationType]);

  const loadUserPreferences = () => {
    try {
      const watchHistory = JSON.parse(localStorage.getItem('youtubeCloneWatchHistory_v1') || '[]');
      const likedVideos = JSON.parse(localStorage.getItem('youtubeCloneLikedVideos_v1') || '[]');
      const subscriptions = JSON.parse(localStorage.getItem('youtubeCloneSubscriptions_v1') || '{}');
      const searchHistory = JSON.parse(localStorage.getItem('youtubeCloneSearchHistory_v1') || '[]');
      const watchTime = JSON.parse(localStorage.getItem('youtubeCloneWatchTime_v1') || '{}');
      
      const subscribedChannels = Object.keys(subscriptions).filter(channelId => subscriptions[channelId].isSubscribed);
      const preferredCategories = extractPreferredCategories(watchHistory, likedVideos);
      
      setUserPreferences({
        watchHistory,
        likedVideos,
        subscribedChannels,
        preferredCategories,
        watchTime,
        searchHistory
      });
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const extractPreferredCategories = (watchHistory: string[], likedVideos: string[]): string[] => {
    // Mock category extraction based on video IDs
    const categoryMap: { [key: string]: string } = {
      'tech': 'Technology',
      'game': 'Gaming',
      'music': 'Music',
      'cook': 'Cooking',
      'fit': 'Fitness',
      'edu': 'Education',
      'news': 'News',
      'ent': 'Entertainment'
    };
    
    const categories = new Set<string>();
    [...watchHistory, ...likedVideos].forEach(videoId => {
      Object.keys(categoryMap).forEach(key => {
        if (videoId.toLowerCase().includes(key)) {
          categories.add(categoryMap[key]);
        }
      });
    });
    
    return Array.from(categories);
  };

  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      let videos: Video[] = [];
      
      switch (recommendationType) {
        case 'personalized':
          videos = await generatePersonalizedRecommendations();
          break;
        case 'trending':
          videos = await generateTrendingRecommendations();
          break;
        case 'similar':
          videos = await generateSimilarRecommendations();
          break;
      }
      
      setRecommendations(videos.slice(0, maxRecommendations));
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePersonalizedRecommendations = async (): Promise<Video[]> => {
    // Use actual videos from mockVideoService instead of generating fake ones
    const availableVideos = mockVideos.filter(video => video.id !== currentVideoId);
    
    // Score videos based on user preferences
    const scoredVideos = availableVideos.map(video => {
      let score = 0;
      
      // Boost videos from subscribed channels
      if (userPreferences.subscribedChannels.includes(video.channelName)) {
        score += 50;
      }
      
      // Boost videos in preferred categories
      if (userPreferences.preferredCategories.includes(video.category)) {
        score += 30;
      }
      
      // Boost recently uploaded videos (parse the uploadedAt string)
      const daysAgo = parseInt(video.uploadedAt.match(/\d+/)?.[0] || '30');
      if (daysAgo < 7) {
        score += 20;
      }
      
      // Boost videos with high view count
      const viewCount = parseInt(video.views.replace(/[^0-9]/g, '')) || 0;
      score += Math.log10(viewCount + 1) * 5;
      
      // Add some randomness
      score += Math.random() * 10;
      
      return { ...video, score };
    });
    
    return scoredVideos
      .sort((a, b) => b.score - a.score)
      .filter(video => !userPreferences.watchHistory.includes(video.id));
  };

  const generateTrendingRecommendations = async (): Promise<Video[]> => {
    // Use actual videos from mockVideoService
    const availableVideos = mockVideos.filter(video => video.id !== currentVideoId);
    
    return availableVideos
      .sort((a, b) => {
        const aViews = parseInt(a.views.replace(/[^0-9]/g, '')) || 0;
        const bViews = parseInt(b.views.replace(/[^0-9]/g, '')) || 0;
        
        // Parse days from uploadedAt string (e.g., "2 weeks ago", "3 days ago")
        const aDaysMatch = a.uploadedAt.match(/(\d+)\s+(day|week|month)/);
        const bDaysMatch = b.uploadedAt.match(/(\d+)\s+(day|week|month)/);
        
        let aDays = 30; // default
        let bDays = 30; // default
        
        if (aDaysMatch) {
          const [, num, unit] = aDaysMatch;
          aDays = parseInt(num) * (unit === 'week' ? 7 : unit === 'month' ? 30 : 1);
        }
        
        if (bDaysMatch) {
          const [, num, unit] = bDaysMatch;
          bDays = parseInt(num) * (unit === 'week' ? 7 : unit === 'month' ? 30 : 1);
        }
        
        // Combine views and recency for trending score
        const aScore = aViews / Math.max(1, aDays);
        const bScore = bViews / Math.max(1, bDays);
        
        return bScore - aScore;
      })
      .slice(0, maxRecommendations);
  };

  const generateSimilarRecommendations = async (): Promise<Video[]> => {
    if (!currentVideoId) return generatePersonalizedRecommendations();
    
    // Use actual videos from mockVideoService
    const availableVideos = mockVideos.filter(video => video.id !== currentVideoId);
    const currentVideo = mockVideos.find(v => v.id === currentVideoId);
    
    if (!currentVideo) return generatePersonalizedRecommendations();
    
    return availableVideos
      .map(video => {
        let similarityScore = 0;
        
        // Same category gets high score
        if (video.category === currentVideo.category) {
          similarityScore += 50;
        }
        
        // Same channel gets medium score
        if (video.channelName === currentVideo.channelName) {
          similarityScore += 30;
        }
        
        // Similar duration
        const currentDuration = parseInt(currentVideo.duration.split(':')[0]);
        const videoDuration = parseInt(video.duration.split(':')[0]);
        const durationDiff = Math.abs(currentDuration - videoDuration);
        if (durationDiff < 5) similarityScore += 15;
        
        // Add randomness for variety
        similarityScore += Math.random() * 10;
        
        return { ...video, similarityScore };
      })
      .sort((a, b) => (b as any).similarityScore - (a as any).similarityScore)
      .slice(0, maxRecommendations);
  };

  const getWatchedVideoTags = (): string[] => {
    // Mock implementation - in real app, would fetch from video metadata
    const commonTags = ['tutorial', 'review', 'gaming', 'music', 'tech', 'cooking', 'fitness', 'news'];
    return commonTags.filter(() => Math.random() > 0.5);
  };

  const parseDuration = (duration: string): number => {
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  // Removed generateMockVideos function - now using actual videos from mockVideoService

  // Removed helper functions for generating mock data - now using actual videos from mockVideoService

  const handleVideoClick = (videoId: string) => {
    // Track video selection for future recommendations
    const updatedHistory = [videoId, ...userPreferences.watchHistory.filter(id => id !== videoId)].slice(0, 100);
    localStorage.setItem('youtubeCloneWatchHistory_v1', JSON.stringify(updatedHistory));
    
    onVideoSelect?.(videoId);
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex space-x-3 animate-pulse">
            <div className="w-40 h-24 bg-neutral-200 dark:bg-neutral-700 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
              <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
              <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Recommended for you
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setRecommendationType('personalized')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              recommendationType === 'personalized'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setRecommendationType('trending')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              recommendationType === 'trending'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
            }`}
          >
            Trending
          </button>
          {currentVideoId && (
            <button
              onClick={() => setRecommendationType('similar')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                recommendationType === 'similar'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              Similar
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((video) => (
          <div
            key={video.id}
            onClick={() => handleVideoClick(video.id)}
            className="flex space-x-3 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
          >
            <div className="relative flex-shrink-0">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-40 h-24 object-cover rounded-lg"
              />
              <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                {video.duration}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 line-clamp-2 mb-1">
                {video.title}
              </h4>
              
              <div className="flex items-center space-x-2 mb-1">
                <img
                  src={video.channelAvatarUrl}
                  alt={video.channelName}
                  className="w-6 h-6 rounded-full"
                />
                <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                  {video.channelName}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-neutral-500 dark:text-neutral-500">
                <div className="flex items-center space-x-1">
                  <EyeIcon className="w-3 h-3" />
                  <span>{video.views}</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(video.uploadedAt))} ago</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <HandThumbUpIcon className="w-3 h-3" />
                  <span>{video.likes}</span>
                </div>
              </div>
              
              {video.tags && video.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {video.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationEngine;