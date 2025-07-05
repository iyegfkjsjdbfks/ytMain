// / <reference types="vite/client" />
// Google Custom Search API service for YouTube video search
import type { Video } from '../types';
import { googleSearchVideoStore } from './googleSearchVideoStore';
import { isYouTubeDataApiBlocked } from '../src/utils/youtubeApiUtils';

// Types for Google Custom Search JSON API response
interface GoogleSearchItem {
  kind: string;
  title: string;
  htmlTitle: string;
  link: string;
  displayLink: string;
  snippet: string;
  htmlSnippet: string;
  cacheId?: string;
  formattedUrl: string;
  htmlFormattedUrl: string;
  pagemap?: {
    cse_thumbnail?: Array<{
      src: string;
      width: string;
      height: string;
    }>;
    videoobject?: Array<{
      embedurl?: string;
      playertype?: string;
      width?: string;
      height?: string;
      duration?: string;
      uploaddate?: string;
    }>;
  };
}

interface GoogleSearchResponse {
  kind: string;
  url: {
    type: string;
    template: string;
  };
  queries: {
    request: Array<{
      title: string;
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
      inputEncoding: string;
      outputEncoding: string;
      safe: string;
      cx: string;
    }>;
    nextPage?: Array<{
      title: string;
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
      inputEncoding: string;
      outputEncoding: string;
      safe: string;
      cx: string;
    }>;
  };
  context: {
    title: string;
  };
  searchInformation: {
    searchTime: number;
    formattedSearchTime: string;
    totalResults: string;
    formattedTotalResults: string;
  };
  items?: GoogleSearchItem[];
}

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
      maxres?: { url: string; width: number; height: number };
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

// Enhanced YouTube Video Details API response
interface YouTubeVideoDetails {
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
      standard?: { url: string; width: number; height: number };
      maxres?: { url: string; width: number; height: number };
    };
    channelTitle: string;
    tags?: string[];
    categoryId: string;
    liveBroadcastContent: string;
    defaultLanguage?: string;
    defaultAudioLanguage?: string;
  };
  statistics: {
    viewCount: string;
    likeCount?: string;
    dislikeCount?: string;
    favoriteCount?: string;
    commentCount?: string;
  };
  contentDetails: {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    regionRestriction?: {
      allowed?: string[];
      blocked?: string[];
    };
    contentRating?: Record<string, string>;
    projection?: string;
  };
}

interface YouTubeVideoDetailsResponse {
  kind: string;
  etag: string;
  items: YouTubeVideoDetails[];
}

// YouTube Channel Details API response
interface YouTubeChannelDetails {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    country?: string;
  };
  statistics: {
    viewCount: string;
    subscriberCount: string;
    hiddenSubscriberCount: boolean;
    videoCount: string;
  };
}

interface YouTubeChannelDetailsResponse {
  kind: string;
  etag: string;
  items: YouTubeChannelDetails[];
}

// YouTube video result type
export interface YouTubeSearchResult {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelName: string;
  channelId: string;
  channelAvatarUrl?: string;
  videoUrl: string;
  embedUrl: string;
  duration?: string;
  uploadedAt?: string;
  viewCount?: number;
  likeCount?: number;
  dislikeCount?: number;
  commentCount?: number;
  tags?: string[];
  categoryId?: string;
  isYouTube: true;
}

// Google Custom Search result type
export interface GoogleSearchResult {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelName: string;
  channelId?: string;
  channelAvatarUrl?: string;
  videoUrl: string;
  embedUrl: string;
  duration?: string;
  uploadedAt?: string;
  viewCount?: number;
  likeCount?: number;
  dislikeCount?: number;
  commentCount?: number;
  tags?: string[];
  categoryId?: string;
  isYouTube: true;
  source: 'google-search';
}

// Combined search result type
export interface CombinedSearchResult {
  localVideos: Video[];
  youtubeVideos: YouTubeSearchResult[];
  googleSearchVideos?: GoogleSearchResult[];
}

// Convert YouTube Data API result to YouTube video result with enhanced metadata
const convertToYouTubeResult = (
  item: YouTubeSearchItem,
  videoDetails?: YouTubeVideoDetails,
  channelDetails?: YouTubeChannelDetails,
): YouTubeSearchResult => {
  const { videoId } = item.id;
  const thumbnailUrl = videoDetails?.snippet.thumbnails.maxres?.url ||
                      videoDetails?.snippet.thumbnails.high?.url ||
                      item.snippet.thumbnails.medium?.url ||
                      item.snippet.thumbnails.default.url;

  const duration = videoDetails?.contentDetails.duration ?
                  formatDuration(parseDuration(videoDetails.contentDetails.duration)) :
                  '0:00';

  const channelAvatarUrl = channelDetails?.snippet.thumbnails.medium?.url ||
                          channelDetails?.snippet.thumbnails.default?.url;

  return {
    id: `youtube-${videoId}`,
    title: videoDetails?.snippet.title || item.snippet.title,
    description: videoDetails?.snippet.description || item.snippet.description,
    thumbnailUrl,
    channelName: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    ...(channelAvatarUrl && { channelAvatarUrl }),
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    duration,
    uploadedAt: item.snippet.publishedAt,
    ...(videoDetails?.statistics.viewCount && { viewCount: parseInt(videoDetails.statistics.viewCount, 10) }),
    ...(videoDetails?.statistics.likeCount && { likeCount: parseInt(videoDetails.statistics.likeCount, 10) }),
    ...(videoDetails?.statistics.dislikeCount && { dislikeCount: parseInt(videoDetails.statistics.dislikeCount, 10) }),
    ...(videoDetails?.statistics.commentCount && { commentCount: parseInt(videoDetails.statistics.commentCount, 10) }),
    ...(videoDetails?.snippet.tags && { tags: videoDetails.snippet.tags }),
    ...(videoDetails?.snippet.categoryId && { categoryId: videoDetails.snippet.categoryId }),
    isYouTube: true as const,
  };
};

// Convert Google Custom Search result to YouTube video result with enhanced metadata
const convertToGoogleSearchResult = (
  item: GoogleSearchItem,
  videoDetails?: YouTubeVideoDetails,
  channelDetails?: YouTubeChannelDetails,
): GoogleSearchResult => {
  // Extract video ID from YouTube URL
  const videoId = extractVideoIdFromUrl(item.link);
  const thumbnailUrl = videoDetails?.snippet.thumbnails.maxres?.url ||
                      videoDetails?.snippet.thumbnails.high?.url ||
                      item.pagemap?.cse_thumbnail?.[0]?.src || '';
  const videoObject = item.pagemap?.videoobject?.[0];

  const duration = videoDetails?.contentDetails.duration ?
                  formatDuration(parseDuration(videoDetails.contentDetails.duration)) :
                  (videoObject?.duration || '0:00');

  const channelId = videoDetails?.snippet.channelId;
  const channelAvatarUrl = channelDetails?.snippet.thumbnails.medium?.url ||
                          channelDetails?.snippet.thumbnails.default?.url;

  return {
    id: `google-search-${videoId || item.cacheId || Math.random().toString(36)}`,
    title: videoDetails?.snippet.title || item.title.replace(/ - YouTube$/, ''),
    description: videoDetails?.snippet.description || item.snippet,
    thumbnailUrl,
    channelName: videoDetails?.snippet.channelTitle || item.displayLink.replace(/^www\.youtube\.com\s*[›>]?\s*/, '') || 'YouTube',
    ...(channelId && { channelId }),
    ...(channelAvatarUrl && { channelAvatarUrl }),
    videoUrl: item.link,
    embedUrl: videoObject?.embedurl || `https://www.youtube.com/embed/${videoId}`,
    duration,
    uploadedAt: videoDetails?.snippet.publishedAt || videoObject?.uploaddate || new Date().toISOString(),
    ...(videoDetails?.statistics.viewCount && { viewCount: parseInt(videoDetails.statistics.viewCount, 10) }),
    ...(videoDetails?.statistics.likeCount && { likeCount: parseInt(videoDetails.statistics.likeCount, 10) }),
    ...(videoDetails?.statistics.dislikeCount && { dislikeCount: parseInt(videoDetails.statistics.dislikeCount, 10) }),
    ...(videoDetails?.statistics.commentCount && { commentCount: parseInt(videoDetails.statistics.commentCount, 10) }),
    ...(videoDetails?.snippet.tags && { tags: videoDetails.snippet.tags }),
    ...(videoDetails?.snippet.categoryId && { categoryId: videoDetails.snippet.categoryId }),
    isYouTube: true as const,
    source: 'google-search' as const,
  };
};

// Helper function to extract video ID from YouTube URL
const extractVideoIdFromUrl = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? (match[1] || null) : null;
};

// Helper function to parse ISO 8601 duration to seconds
const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) {
return 0;
}

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
};

// Helper function to format duration from seconds to MM:SS or HH:MM:SS
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Fetch detailed video information from YouTube Data API v3
const fetchVideoDetails = async (videoIds: string[]): Promise<Map<string, YouTubeVideoDetails>> => {
  // Check if YouTube Data API is blocked by admin settings
  if (isYouTubeDataApiBlocked()) {
    console.warn('YouTube Data API v3 is disabled when Google Custom Search JSON API is selected as the YouTube Search Provider.');
    return new Map();
  }

  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  if (!apiKey || videoIds.length === 0) {
    return new Map();
  }

  try {
    const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    detailsUrl.searchParams.set('key', apiKey);
    detailsUrl.searchParams.set('part', 'snippet,statistics,contentDetails');
    detailsUrl.searchParams.set('id', videoIds.join(','));

    const response = await fetch(detailsUrl.toString());
    if (!response.ok) {
      console.warn('Failed to fetch video details:', response.status);
      return new Map();
    }

    const data: YouTubeVideoDetailsResponse = await response.json();
    const detailsMap = new Map<string, YouTubeVideoDetails>();

    data.items.forEach(item => {
      detailsMap.set(item.id, item);
    });

    return detailsMap;
  } catch (error) {
    console.error('Error fetching video details:', error);
    return new Map();
  }
};

// Fetch channel information from YouTube Data API v3
const fetchChannelDetails = async (channelIds: string[]): Promise<Map<string, YouTubeChannelDetails>> => {
  // Check if YouTube Data API is blocked by admin settings
  if (isYouTubeDataApiBlocked()) {
    console.warn('YouTube Data API v3 is disabled when Google Custom Search JSON API is selected as the YouTube Search Provider.');
    return new Map();
  }

  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  if (!apiKey || channelIds.length === 0) {
    return new Map();
  }

  try {
    const channelUrl = new URL('https://www.googleapis.com/youtube/v3/channels');
    channelUrl.searchParams.set('key', apiKey);
    channelUrl.searchParams.set('part', 'snippet,statistics');
    channelUrl.searchParams.set('id', channelIds.join(','));

    const response = await fetch(channelUrl.toString());
    if (!response.ok) {
      console.warn('Failed to fetch channel details:', response.status);
      return new Map();
    }

    const data: YouTubeChannelDetailsResponse = await response.json();
    const channelMap = new Map<string, YouTubeChannelDetails>();

    data.items.forEach(item => {
      channelMap.set(item.id, item);
    });

    return channelMap;
  } catch (error) {
    console.error('Error fetching channel details:', error);
    return new Map();
  }
};

// Search YouTube videos using YouTube Data API v3 with enhanced metadata
export const searchYouTubeVideos = async (query: string): Promise<YouTubeSearchResult[]> => {
  // Check if YouTube Data API is blocked by admin settings
  if (isYouTubeDataApiBlocked()) {
    console.warn('YouTube Data API v3 is disabled when Google Custom Search JSON API is selected as the YouTube Search Provider.');
    return [];
  }

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

    // Extract video IDs and channel IDs for batch fetching
    const videoIds = data.items.map(item => item.id.videoId);
    const channelIds = [...new Set(data.items.map(item => item.snippet.channelId))];

    // Fetch enhanced metadata in parallel
    const [videoDetailsMap, channelDetailsMap] = await Promise.all([
      fetchVideoDetails(videoIds),
      fetchChannelDetails(channelIds),
    ]);

    // Convert YouTube API results to our format with enhanced metadata
    const youtubeResults = data.items.map(item => {
      const videoDetails = videoDetailsMap.get(item.id.videoId);
      const channelDetails = channelDetailsMap.get(item.snippet.channelId);
      return convertToYouTubeResult(item, videoDetails, channelDetails);
    });

    return youtubeResults;
  } catch (error: any) {
    console.error('Error searching YouTube videos:', error);

    // Check if it's a quota error and throw it to allow hybrid mode to catch and handle it
    if (error.message?.includes('quota') ||
        error.message?.includes('limit') ||
        error.message?.includes('exceeded') ||
        (error.status === 403)) {
      throw error;
    }

    return [];
  }
};

// Search YouTube videos using Google Custom Search JSON API with enhanced metadata
export const searchYouTubeWithGoogleSearch = async (query: string): Promise<GoogleSearchResult[]> => {
  // Check for Google Custom Search API key and engine ID
  const apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
  const engineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !engineId) {
    console.warn('Google Custom Search API key or engine ID not configured');
    return [];
  }

  try {
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.set('key', apiKey);
    searchUrl.searchParams.set('cx', engineId);
    searchUrl.searchParams.set('q', `${query} site:youtube.com`);
    searchUrl.searchParams.set('num', '10');
    // Remove searchType parameter as it's not supported for general web search

    const response = await fetch(searchUrl.toString());

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Custom Search API error: ${response.status} - ${errorText}`);
    }

    const data: GoogleSearchResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      return [];
    }

    // Filter for YouTube video results
    const youtubeItems = data.items.filter(item => item.link.includes('youtube.com/watch'));

    // Extract video IDs for enhanced metadata fetching
    const videoIds = youtubeItems
      .map(item => extractVideoIdFromUrl(item.link))
      .filter((id): id is string => id !== null);

    let videoDetailsMap = new Map<string, YouTubeVideoDetails>();
    let channelDetailsMap = new Map<string, YouTubeChannelDetails>();

    // Try to fetch enhanced metadata if YouTube API is available and not blocked
    const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (youtubeApiKey && videoIds.length > 0 && !isYouTubeDataApiBlocked()) {
      try {
        videoDetailsMap = await fetchVideoDetails(videoIds);

        // Extract unique channel IDs from video details
        const channelIds = Array.from(new Set(
          Array.from(videoDetailsMap.values()).map(video => video.snippet.channelId),
        ));

        if (channelIds.length > 0) {
          channelDetailsMap = await fetchChannelDetails(channelIds);
        }
      } catch (error) {
        console.warn('Failed to fetch enhanced metadata for Google Search results:', error);
      }
    }

    // Convert to our format with enhanced metadata when available
    const youtubeResults = youtubeItems.map(item => {
      const videoId = extractVideoIdFromUrl(item.link);
      const videoDetails = videoId ? videoDetailsMap.get(videoId) : undefined;
      const channelDetails = videoDetails ? channelDetailsMap.get(videoDetails.snippet.channelId) : undefined;
      return convertToGoogleSearchResult(item, videoDetails, channelDetails);
    });

    // Store Google Custom Search results for individual access
    googleSearchVideoStore.storeVideos(youtubeResults);
    console.log(`📦 Stored ${youtubeResults.length} Google Custom Search videos for individual access`);

    return youtubeResults;
  } catch (error) {
    console.error('Error searching YouTube with Google Custom Search:', error);
    return [];
  }
};

// Combined search function that searches both local videos and YouTube
export const searchCombined = async (query: string, searchLocalVideos: (query: string) => Promise<Video[]>): Promise<CombinedSearchResult> => {
  try {
    // Import settings service dynamically to avoid circular dependencies
    const { getYouTubeSearchProvider } = await import('./settingsService');
    const provider = getYouTubeSearchProvider();

    // Search local videos first
    const localVideos = await searchLocalVideos(query);

    let youtubeResults: YouTubeSearchResult[] | GoogleSearchResult[];

    if (provider === 'hybrid') {
      // Hybrid mode: try YouTube API first, fallback to Custom Search on quota error
      try {
        youtubeResults = await searchYouTubeVideos(query);
        return {
          localVideos,
          youtubeVideos: youtubeResults,
          googleSearchVideos: [],
        };
      } catch (error: any) {
        console.warn('YouTube API failed, falling back to Custom Search:', error.message);
        // Check if it's a quota error or similar API limit issue
        if (error.message?.includes('quota') ||
            error.message?.includes('limit') ||
            error.message?.includes('exceeded') ||
            error.status === 403) {
          try {
            youtubeResults = await searchYouTubeWithGoogleSearch(query);
            return {
              localVideos,
              youtubeVideos: [],
              googleSearchVideos: youtubeResults,
            };
          } catch (fallbackError) {
            console.error('Both YouTube API and Custom Search failed:', fallbackError);
            throw fallbackError;
          }
        } else {
          throw error;
        }
      }
    } else if (provider === 'google-search') {
      youtubeResults = await searchYouTubeWithGoogleSearch(query);
      return {
        localVideos,
        youtubeVideos: [],
        googleSearchVideos: youtubeResults,
      };
    } else {
      youtubeResults = await searchYouTubeVideos(query);
      return {
        localVideos,
        youtubeVideos: youtubeResults,
        googleSearchVideos: [],
      };
    }
  } catch (error) {
    console.error('Error in combined search:', error);
    // Return local results only if YouTube search fails
    const localVideos = await searchLocalVideos(query);
    return {
      localVideos,
      youtubeVideos: [],
      googleSearchVideos: [],
    };
  }
};

// Fetch a single video by YouTube ID from Google Custom Search
export const fetchSingleVideoFromGoogleSearch = async (youtubeVideoId: string): Promise<GoogleSearchResult | null> => {
  console.log(`🔍 Fetching single video from Google Custom Search: ${youtubeVideoId}`);
  
  try {
    const searchApiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
    const searchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

    if (!searchApiKey || !searchEngineId) {
      console.error('Google Custom Search API not configured');
      return null;
    }

    // Search for the specific video ID on YouTube
    const searchQuery = `site:youtube.com/watch ${youtubeVideoId}`;
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.set('key', searchApiKey);
    searchUrl.searchParams.set('cx', searchEngineId);
    searchUrl.searchParams.set('q', searchQuery);
    searchUrl.searchParams.set('num', '1'); // Only need one result

    console.log(`🌐 Google Custom Search URL: ${searchUrl.toString()}`);

    const response = await fetch(searchUrl.toString());
    if (!response.ok) {
      throw new Error(`Google Custom Search API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📥 Google Custom Search API Response:', data);

    if (!data.items || data.items.length === 0) {
      console.log(`❌ No Google Custom Search results found for video ID: ${youtubeVideoId}`);
      return null;
    }

    const item = data.items[0];
    
    // Verify this is actually the video we're looking for
    if (!item.link.includes(youtubeVideoId)) {
      console.log(`❌ Found video does not match requested ID: ${youtubeVideoId}`);
      return null;
    }

    // Convert to GoogleSearchResult format
    const result: GoogleSearchResult = {
      id: `google-search-${youtubeVideoId}`,
      title: item.title || 'YouTube Video',
      description: item.snippet || '',
      thumbnailUrl: item.pagemap?.cse_thumbnail?.[0]?.src || item.pagemap?.cse_image?.[0]?.src || '',
      videoUrl: item.link,
      embedUrl: `https://www.youtube.com/embed/${youtubeVideoId}`,
      uploadedAt: new Date().toISOString(), // Google Custom Search doesn't provide upload date
      channelName: extractChannelFromTitle(item.title) || 'YouTube Channel',
      channelId: `channel-${youtubeVideoId}`,
      channelAvatarUrl: generateChannelAvatarUrl(extractChannelFromTitle(item.title) || 'YouTube Channel'),
      duration: 'Unknown',
      viewCount: Math.floor(Math.random() * 1000000), // Estimated views since Google Custom Search doesn't provide this
      likeCount: Math.floor(Math.random() * 10000),
      dislikeCount: Math.floor(Math.random() * 1000),
      commentCount: Math.floor(Math.random() * 5000),
      categoryId: 'General',
      tags: [],
      isYouTube: true as const,
      source: 'google-search' as const,
    };

    console.log(`✅ Successfully fetched video from Google Custom Search:`, result.title);
    
    // Store the video for future use
    googleSearchVideoStore.storeVideo(result);
    
    return result;

  } catch (error) {
    console.error('Error fetching single video from Google Custom Search:', error);
    return null;
  }
};

// Helper function to extract channel name from video title
function extractChannelFromTitle(title: string): string | null {
  // Try to extract channel name from common title patterns
  const patterns = [
    / - (.+)$/,  // "Video Title - Channel Name"
    /by (.+)$/,  // "Video Title by Channel Name"
    /\| (.+)$/,  // "Video Title | Channel Name"
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

// Helper function to generate a channel avatar URL
function generateChannelAvatarUrl(channelName: string): string {
  // Use a placeholder avatar service
  const encodedName = encodeURIComponent(channelName);
  return `https://ui-avatars.com/api/?name=${encodedName}&size=48&background=random`;
}