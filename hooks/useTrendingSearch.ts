import { useState, useEffect, useCallback } from 'react';

import { searchForHomePage, type YouTubeSearchResult, type GoogleSearchResult } from '../services/googleSearchService';
import { VideoService } from '../services/api';
import { getInitialSearchKeyword } from '../services/settingsService';

import type { Video } from '../types';

// Convert search results to Video format for HomePage compatibility
const convertSearchResultToVideo = (
  result: YouTubeSearchResult | GoogleSearchResult,
  index: number,
): Video => {
  // Generate a unique ID that preserves the source information
  const videoId = result.id.startsWith('youtube-') || result.id.startsWith('google-search-') 
    ? result.id 
    : `trending-${result.id}-${index}`;

  return {
    id: videoId,
    title: result.title,
    description: result.description,
    thumbnailUrl: result.thumbnailUrl,
    videoUrl: result.videoUrl,
    duration: result.duration || '0:00',
    views: result.viewCount?.toString() || '0',
    likes: result.likeCount || 0,
    dislikes: result.dislikeCount || 0,
    uploadedAt: result.uploadedAt || new Date().toISOString(),
    channelName: result.channelName,
    channelId: result.channelId || `channel-${index}`,
    channelAvatarUrl: result.channelAvatarUrl || '',
    category: result.categoryId || 'Entertainment',
    tags: result.tags || [],
    // Required Video interface properties
    visibility: 'public' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isLive: false,
    // isUpcoming: false, // Removed as it's not part of Video interface
    // Properties removed from Video type that don't exist
    // allowedRegions, blockedRegions, isAgeRestricted, embeddable, 
    // defaultLanguage, defaultAudioLanguage, recordingStatus, 
    // uploadStatus, selfDeclaredMadeForKids - these are not part of Video interface
    statistics: {
      viewCount: result.viewCount || 0,
      likeCount: result.likeCount || 0,
      dislikeCount: result.dislikeCount || 0,
      favoriteCount: 0,
      commentCount: result.commentCount || 0,
    },
    topicDetails: {
      topicIds: [],
      relevantTopicIds: [],
      topicCategories: [],
    },
    contentDetails: {
      duration: result.duration ? `PT${result.duration.replace(':', 'M')}S` : 'PT0M0S',
      dimension: '2d',
      definition: 'hd',
      caption: 'false',
      licensedContent: false,
      contentRating: {},
      projection: 'rectangular',
    },
  };
};

interface UseInitialSearchResult {
  data: Video[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching videos based on the initial search keyword from settings.
 * Uses the configurable keyword (default: 'trending') to search for videos.
 * 
 * For HOME PAGE behavior:
 * - In hybrid mode: Uses YouTube Data API first, then Google Custom Search as fallback
 * - In google-search mode: Uses Google Custom Search for discovery with YouTube API for metadata
 * - In youtube-api mode: Uses YouTube Data API only
 * 
 * This respects the Hybrid Mode settings and automatically refetches when
 * the keyword is updated in the admin settings.
 */
export function useTrendingSearch(): UseInitialSearchResult {
  const [data, setData] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingVideos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const initialKeyword = getInitialSearchKeyword();
      console.log(`🔥 Fetching ${initialKeyword} videos for HOME PAGE using hybrid search logic...`);

      // Use home page specific search logic (YouTube API first in hybrid mode)
      const combinedResults = await searchForHomePage(
        initialKeyword,
        (query) => VideoService.searchVideos(query).then(result => result.videos),
      );

      console.log('📊 Search results:', {
        localVideos: combinedResults.localVideos?.length || 0,
        youtubeVideos: combinedResults.youtubeVideos?.length || 0,
        googleSearchVideos: combinedResults.googleSearchVideos?.length || 0,
      });

      // Combine all results and convert to Video format
      const allResults: (YouTubeSearchResult | GoogleSearchResult)[] = [
        ...(combinedResults.youtubeVideos || []),
        ...(combinedResults.googleSearchVideos || []),
      ];

      // Convert search results to Video format
      const convertedVideos = allResults.map((result, index) => 
        convertSearchResultToVideo(result, index)
      );

      // Add local videos if any
      const localVideos = combinedResults.localVideos || [];
      
      // Combine and sort by view count (trending)
      const allVideos = [...localVideos, ...convertedVideos];
      const sortedVideos = allVideos.sort((a, b) => {
        const viewsA = typeof a.views === 'string' ? parseInt(a.views, 10) || 0 : a.statistics?.viewCount || 0;
        const viewsB = typeof b.views === 'string' ? parseInt(b.views, 10) || 0 : b.statistics?.viewCount || 0;
        return viewsB - viewsA;
      });

      console.log(`✅ Successfully fetched ${sortedVideos.length} ${getInitialSearchKeyword()} videos`);
      setData(sortedVideos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to fetch ${getInitialSearchKeyword()} videos`;
      console.error(`❌ Error fetching ${getInitialSearchKeyword()} videos:`, errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to refetch videos when the keyword changes
  useEffect(() => {
    // Listen for storage changes to detect when the keyword is updated
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'appSettings') {
        fetchTrendingVideos();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchTrendingVideos]);

  const refetch = useCallback(async () => {
    await fetchTrendingVideos();
  }, [fetchTrendingVideos]);

  // Fetch trending videos on mount
  useEffect(() => {
    fetchTrendingVideos();
  }, [fetchTrendingVideos]);

  return { data, loading, error, refetch };
}
