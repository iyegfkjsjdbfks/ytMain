// Google Custom Search API service for YouTube video search
import { Video } from '../types';

// Types for YouTube Data API v3 response
interface YouTubeSearchItem {
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
}

interface YouTubeSearchResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  regionCode: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeSearchItem[];
}

// YouTube video result type
export interface YouTubeSearchResult {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelName: string;
  videoUrl: string;
  embedUrl: string;
  duration?: string;
  uploadedAt?: string;
  isYouTube: true;
}

// Combined search result type
export interface CombinedSearchResult {
  localVideos: Video[];
  youtubeVideos: YouTubeSearchResult[];
}

// Convert YouTube Data API result to YouTube video result
const convertToYouTubeResult = (item: YouTubeSearchItem): YouTubeSearchResult => {
  const videoId = item.id.videoId;
  
  return {
    id: `youtube-${videoId}`,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
    channelName: item.snippet.channelTitle,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    duration: undefined, // Duration requires additional API call
    uploadedAt: item.snippet.publishedAt,
    isYouTube: true as const
  };
};

// Search YouTube videos using YouTube Data API v3
export const searchYouTubeVideos = async (query: string): Promise<YouTubeSearchResult[]> => {
  // Check for YouTube API key in environment variables
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  
  if (!apiKey) {
    console.warn('YouTube Data API key not configured');
    return [];
  }
  
  try {
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('key', apiKey);
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('q', query);
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('maxResults', '10');
    searchUrl.searchParams.set('order', 'relevance');
    
    const response = await fetch(searchUrl.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
    }
    
    const data: YouTubeSearchResponse = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return [];
    }
    
    // Convert YouTube API results to our format
    const youtubeResults = data.items.map(convertToYouTubeResult);
    
    return youtubeResults;
  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    return [];
  }
};

// Combined search function that searches both local videos and YouTube
export const searchCombined = async (query: string, searchLocalVideos: (query: string) => Promise<Video[]>): Promise<CombinedSearchResult> => {
  try {
    // Search both local and YouTube videos in parallel
    const [localVideos, youtubeVideos] = await Promise.all([
      searchLocalVideos(query),
      searchYouTubeVideos(query)
    ]);
    
    return {
      localVideos,
      youtubeVideos
    };
  } catch (error) {
    console.error('Error in combined search:', error);
    // Return local results only if YouTube search fails
    const localVideos = await searchLocalVideos(query);
    return {
      localVideos,
      youtubeVideos: []
    };
  }
};