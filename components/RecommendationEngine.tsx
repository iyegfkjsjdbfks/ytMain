/// <reference types="react/jsx-runtime" />
import React from 'react';
// @ts-nocheck
import { useState, useEffect, useCallback, useMemo } from 'react';

import { realVideos } from '../services/realVideoService';
import { getYouTubeSearchProvider } from '../services/settingsService';
import { youtubeSearchService } from '../services/youtubeSearchService';

import EnhancedYouTubeVideoCard from './EnhancedYouTubeVideoCard';
import OptimizedVideoCard from './OptimizedVideoCard';

import type { Video } from '../types';


interface RecommendationEngineProps {
  currentVideo?: Video;
  currentVideoId?: string;
  maxRecommendations?: number;
  onVideoSelect?: (videoId) => void;
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

  // Determine the current video ID from either prop
  const activeVideoId = useMemo(() => {
    return currentVideo?.id || currentVideoId;
  }, [currentVideo?.id, currentVideoId]);

  // Check API configuration and determine strategy
  useEffect(() => {
    const provider = getYouTubeSearchProvider();
    const googleSearchConfigured = youtubeSearchService.isConfigured();
    const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

    // NEW STRATEGY: Google Custom Search for discovery, YouTube Data API v3 for metadata
    const shouldUseGoogleCustomSearch = googleSearchConfigured; // Use Google Custom Search for discovery

    console.log('Search provider:', provider); // Use the provider variable

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
      let recommendedVideos: Video = [];

      if (useGoogleCustomSearch) {
        console.log('🎯 Using DIRECT STRATEGY: Google Custom Search API for YouTube recommendations');
        console.log('🔍 Current video context:', {
          id: currentVideo?.id,
          title: currentVideo?.title,
          category: currentVideo?.category,
          tags: currentVideo?.tags,
          channelName: currentVideo?.channelName,
        });

        if (currentVideo) {
          // Generate intelligent search query based on current video
          let searchQuery = '';

          // Extract meaningful words from title (remove common words)
          const titleWords = currentVideo.title
            .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
            .split(' ')
            .filter(word =>
              word.length > 3 &&
              !['the', 'and', 'or', 'but', 'with', 'this', 'that', 'from', 'they', 'have', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'official', 'video', 'music'].includes(word.toLowerCase()),
            )
            .slice(0, 3); // Take first 3 meaningful words

          if (titleWords.length > 0) {
            searchQuery = titleWords.join(' ');
          } else if (currentVideo.channelName) {
            searchQuery = currentVideo.channelName;
          } else if (currentVideo.category && currentVideo.category !== 'General') {
            searchQuery = currentVideo.category;
          } else {
            searchQuery = 'trending youtube videos';
          }

          console.log('🔍 Searching for related videos with intelligent query:', searchQuery);
          console.log('🔍 Generated from video:', { title: currentVideo.title, channel: currentVideo.channelName, category: currentVideo.category });

          // Use Google Custom Search directly for better recommendations
          const { searchYouTubeWithGoogleSearch } = await import('../services/googleSearchService');
          const googleSearchResults = await searchYouTubeWithGoogleSearch(searchQuery);
          console.log('📊 Google Custom Search returned:', googleSearchResults.length, 'results');

          // Convert Google Custom Search results to Video format
          recommendedVideos = googleSearchResults.map((googleVideo) => ({
            id: googleVideo.id,
            title: googleVideo.title,
            description: googleVideo.description,
            thumbnailUrl: googleVideo.thumbnailUrl,
            videoUrl: googleVideo.videoUrl,
            duration: googleVideo.duration || '0:00',
            views: googleVideo.views,
            viewCount: googleVideo.viewCount || 0,
            channelName: googleVideo.channelName,
            channelId: googleVideo.channelId || '',
            channelAvatarUrl: googleVideo.channelAvatarUrl || '',
            category: googleVideo.categoryId || 'Entertainment',
            tags: googleVideo.tags || [],
            likes: googleVideo.likeCount || 0,
            dislikes: googleVideo.dislikeCount || 0,
            uploadedAt: googleVideo.uploadedAt || new Date().toISOString(),
            isShort: googleVideo.isShort || false,
            isLive: false, // GoogleSearchResult doesn't have isLive property
            commentCount: googleVideo.commentCount || 0,
            // Required Video interface properties
            visibility: 'public' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        } else {
          // Get trending videos using Google Custom Search
          console.log('🔍 Getting trending videos using Google Custom Search...');
          const { searchYouTubeWithGoogleSearch } = await import('../services/googleSearchService');
          const trendingResults = await searchYouTubeWithGoogleSearch('popular trending youtube videos 2024');
          console.log('📊 Google Custom Search trending results:', trendingResults.length);

          // Convert Google Custom Search results to Video format
          recommendedVideos = trendingResults.map((googleVideo) => ({
            id: googleVideo.id,
            title: googleVideo.title,
            description: googleVideo.description,
            thumbnailUrl: googleVideo.thumbnailUrl,
            videoUrl: googleVideo.videoUrl,
            duration: googleVideo.duration || '0:00',
            views: googleVideo.views,
            viewCount: googleVideo.viewCount || 0,
            channelName: googleVideo.channelName,
            channelId: googleVideo.channelId || '',
            channelAvatarUrl: googleVideo.channelAvatarUrl || '',
            category: googleVideo.categoryId || 'Entertainment',
            tags: googleVideo.tags || [],
            likes: googleVideo.likeCount || 0,
            dislikes: googleVideo.dislikeCount || 0,
            uploadedAt: googleVideo.uploadedAt || new Date().toISOString(),
            isShort: googleVideo.isShort || false,
            isLive: false, // GoogleSearchResult doesn't have isLive property
            commentCount: googleVideo.commentCount || 0,
            // Required Video interface properties
            visibility: 'public' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        }

        console.log(`📋 Google Custom Search returned ${recommendedVideos.length} recommendations`);

        // Fallback to local videos only if Google Custom Search fails
        if (recommendedVideos.length === 0) {
          console.log('⚠️ No results from Google Custom Search, falling back to local videos');
          const availableVideos = realVideos.filter(video =>
            !activeVideoId || video.id !== activeVideoId,
          );
          recommendedVideos = availableVideos.slice(0, maxRecommendations);
        } else {
          console.log(`✅ Using ${recommendedVideos.length} recommendations from Google Custom Search`);
        }
      } else {
        // Fallback to real videos with basic recommendation logic
        console.log('Using fallback recommendation system');
        const availableVideos = realVideos.filter(video =>
          !activeVideoId || video.id !== activeVideoId,
        );

        // Simple recommendation logic - prioritize similar categories if available
        let recommended: Video = [];

        if (currentVideo?.category) {
          // First, try to get videos from the same category
          const sameCategory = availableVideos.filter(
            video => video.category === currentVideo.category,
          );
          recommended = [...sameCategory];
        }

        // Fill remaining slots with other videos
        if (recommended.length < maxRecommendations) {
          const remaining = availableVideos.filter(
            video => !recommended.find(r => r.id === video.id),
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
  }, [activeVideoId, currentVideo, maxRecommendations, useGoogleCustomSearch]);

  // Use stable dependencies to prevent infinite re-renders
  useEffect(() => {
    generateRecommendations().catch(() => {
      // Handle promise rejection silently
    });
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
      <div className="space-y-0">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recommended for you
            </h3>
            {useGoogleCustomSearch && (
              <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>Loading...</span>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-2 p-1">
              <div className="w-[168px] h-[94px] bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mb-1" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="space-y-0">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Recommended for you
          </h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          No recommendations available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* YouTube-style section header - more compact */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Recommended for you
          </h3>
          {useGoogleCustomSearch && (
            <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live</span>
            </div>
          )}
        </div>
      </div>

      {/* YouTube-style video grid - more compact spacing */}
      <div className="space-y-2">
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


declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
