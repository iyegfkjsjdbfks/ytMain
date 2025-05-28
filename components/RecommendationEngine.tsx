import React, { useState, useEffect } from 'react';
import { ClockIcon, EyeIcon, ThumbsUpIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from '../utils/dateUtils';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelAvatar: string;
  views: string;
  uploadedAt: string;
  duration: string;
  category: string;
  tags: string[];
  description: string;
  likes: number;
  dislikes: number;
}

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
    const mockVideos = generateMockVideos();
    
    // Score videos based on user preferences
    const scoredVideos = mockVideos.map(video => {
      let score = 0;
      
      // Boost videos from subscribed channels
      if (userPreferences.subscribedChannels.includes(video.channelName)) {
        score += 50;
      }
      
      // Boost videos in preferred categories
      if (userPreferences.preferredCategories.includes(video.category)) {
        score += 30;
      }
      
      // Boost videos with similar tags to watched videos
      const watchedVideoTags = getWatchedVideoTags();
      const commonTags = video.tags.filter(tag => watchedVideoTags.includes(tag));
      score += commonTags.length * 10;
      
      // Boost popular videos
      const viewCount = parseInt(video.views.replace(/[^0-9]/g, ''));
      score += Math.log10(viewCount) * 5;
      
      // Boost recent videos
      const daysSinceUpload = (Date.now() - new Date(video.uploadedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpload < 7) score += 20;
      else if (daysSinceUpload < 30) score += 10;
      
      // Penalize already watched videos
      if (userPreferences.watchHistory.includes(video.id)) {
        score -= 100;
      }
      
      return { ...video, score };
    });
    
    return scoredVideos
      .sort((a, b) => b.score - a.score)
      .filter(video => !userPreferences.watchHistory.includes(video.id));
  };

  const generateTrendingRecommendations = async (): Promise<Video[]> => {
    const mockVideos = generateMockVideos();
    
    return mockVideos
      .sort((a, b) => {
        const aViews = parseInt(a.views.replace(/[^0-9]/g, ''));
        const bViews = parseInt(b.views.replace(/[^0-9]/g, ''));
        const aDays = (Date.now() - new Date(a.uploadedAt).getTime()) / (1000 * 60 * 60 * 24);
        const bDays = (Date.now() - new Date(b.uploadedAt).getTime()) / (1000 * 60 * 60 * 24);
        
        // Trending score: views per day
        const aScore = aViews / Math.max(aDays, 1);
        const bScore = bViews / Math.max(bDays, 1);
        
        return bScore - aScore;
      })
      .slice(0, maxRecommendations);
  };

  const generateSimilarRecommendations = async (): Promise<Video[]> => {
    if (!currentVideoId) return generatePersonalizedRecommendations();
    
    const mockVideos = generateMockVideos();
    const currentVideo = mockVideos.find(v => v.id === currentVideoId);
    
    if (!currentVideo) return generatePersonalizedRecommendations();
    
    return mockVideos
      .filter(video => video.id !== currentVideoId)
      .map(video => {
        let similarity = 0;
        
        // Same category
        if (video.category === currentVideo.category) similarity += 40;
        
        // Same channel
        if (video.channelName === currentVideo.channelName) similarity += 30;
        
        // Common tags
        const commonTags = video.tags.filter(tag => currentVideo.tags.includes(tag));
        similarity += commonTags.length * 15;
        
        // Similar duration
        const currentDuration = parseDuration(currentVideo.duration);
        const videoDuration = parseDuration(video.duration);
        const durationDiff = Math.abs(currentDuration - videoDuration);
        if (durationDiff < 120) similarity += 10; // Within 2 minutes
        
        return { ...video, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity);
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

  const generateMockVideos = (): Video[] => {
    const categories = ['Technology', 'Gaming', 'Music', 'Cooking', 'Fitness', 'Education', 'News', 'Entertainment'];
    const channels = [
      { name: 'TechReview', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' },
      { name: 'GameMaster', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face' },
      { name: 'MusicVibes', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
      { name: 'CookingPro', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face' },
      { name: 'FitnessGuru', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=40&h=40&fit=crop&crop=face' }
    ];
    
    return Array.from({ length: 50 }, (_, i) => {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const channel = channels[Math.floor(Math.random() * channels.length)];
      const views = Math.floor(Math.random() * 10000000);
      const likes = Math.floor(views * (0.01 + Math.random() * 0.05));
      
      return {
        id: `rec_${i + 1}`,
        title: generateVideoTitle(category),
        thumbnail: `https://images.unsplash.com/photo-${1500000000 + i}?w=320&h=180&fit=crop`,
        channelName: channel.name,
        channelAvatar: channel.avatar,
        views: formatViews(views),
        uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        duration: generateDuration(),
        category,
        tags: generateTags(category),
        description: `This is a ${category.toLowerCase()} video about ${generateVideoTitle(category).toLowerCase()}`,
        likes,
        dislikes: Math.floor(likes * 0.1)
      };
    });
  };

  const generateVideoTitle = (category: string): string => {
    const titles = {
      Technology: ['Latest iPhone Review', 'AI Revolution Explained', 'Best Laptops 2024', 'Tech News Update'],
      Gaming: ['Epic Gaming Moments', 'Game Review', 'Gaming Tips & Tricks', 'Live Gaming Session'],
      Music: ['New Music Release', 'Behind the Scenes', 'Music Production Tips', 'Artist Interview'],
      Cooking: ['Easy Recipe Tutorial', 'Cooking Masterclass', 'Kitchen Tips', 'Food Review'],
      Fitness: ['Workout Routine', 'Fitness Tips', 'Healthy Lifestyle', 'Exercise Tutorial'],
      Education: ['Learn Something New', 'Educational Content', 'Study Tips', 'Knowledge Sharing'],
      News: ['Breaking News', 'News Analysis', 'Current Events', 'News Update'],
      Entertainment: ['Funny Moments', 'Entertainment News', 'Celebrity Interview', 'Fun Content']
    };
    
    const categoryTitles = titles[category as keyof typeof titles] || titles.Entertainment;
    return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
  };

  const generateTags = (category: string): string[] => {
    const tagMap = {
      Technology: ['tech', 'review', 'gadgets', 'innovation', 'software'],
      Gaming: ['gaming', 'gameplay', 'review', 'tips', 'entertainment'],
      Music: ['music', 'song', 'artist', 'album', 'entertainment'],
      Cooking: ['cooking', 'recipe', 'food', 'kitchen', 'tutorial'],
      Fitness: ['fitness', 'workout', 'health', 'exercise', 'lifestyle'],
      Education: ['education', 'learning', 'tutorial', 'knowledge', 'study'],
      News: ['news', 'current events', 'politics', 'world', 'breaking'],
      Entertainment: ['entertainment', 'funny', 'comedy', 'fun', 'viral']
    };
    
    const categoryTags = tagMap[category as keyof typeof tagMap] || tagMap.Entertainment;
    return categoryTags.slice(0, Math.floor(Math.random() * 3) + 2);
  };

  const generateDuration = (): string => {
    const minutes = Math.floor(Math.random() * 60) + 1;
    const seconds = Math.floor(Math.random() * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
    return `${views} views`;
  };

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
                src={video.thumbnail}
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
                  src={video.channelAvatar}
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
                  <ThumbsUpIcon className="w-3 h-3" />
                  <span>{video.likes}</span>
                </div>
              </div>
              
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationEngine;