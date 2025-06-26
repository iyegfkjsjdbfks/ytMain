// Google Custom Search API service for YouTube video search
import type { Video } from '../types';

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

// Google Custom Search result type
export interface GoogleSearchResult {
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
  source: 'google-search';
}

// Combined search result type
export interface CombinedSearchResult {
  localVideos: Video[];
  youtubeVideos: YouTubeSearchResult[];
  googleSearchVideos?: GoogleSearchResult[];
}

// Convert YouTube Data API result to YouTube video result
const convertToYouTubeResult = (item: YouTubeSearchItem): YouTubeSearchResult => {
  const { videoId } = item.id;

  return {
    id: `youtube-${videoId}`,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
    channelName: item.snippet.channelTitle,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    duration: '0:00', // Duration requires additional API call
    uploadedAt: item.snippet.publishedAt,
    isYouTube: true as const,
  };
};

// Convert Google Custom Search result to YouTube video result
const convertToGoogleSearchResult = (item: GoogleSearchItem): GoogleSearchResult => {
  // Extract video ID from YouTube URL
  const videoId = extractVideoIdFromUrl(item.link);
  const thumbnailUrl = item.pagemap?.cse_thumbnail?.[0]?.src || '';
  const videoObject = item.pagemap?.videoobject?.[0];

  return {
    id: `google-search-${videoId || item.cacheId || Math.random().toString(36)}`,
    title: item.title.replace(/ - YouTube$/, ''),
    description: item.snippet,
    thumbnailUrl,
    channelName: item.displayLink.replace('www.youtube.com › ', ''),
    videoUrl: item.link,
    embedUrl: videoObject?.embedurl || `https://www.youtube.com/embed/${videoId}`,
    duration: videoObject?.duration || '0:00',
    uploadedAt: videoObject?.uploaddate || new Date().toISOString(),
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

// Search YouTube videos using Google Custom Search JSON API
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

    // Filter for YouTube video results and convert to our format
    const youtubeResults = data.items
      .filter(item => item.link.includes('youtube.com/watch'))
      .map(convertToGoogleSearchResult);

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
              googleSearchVideos: youtubeResults as GoogleSearchResult[],
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
        googleSearchVideos: youtubeResults as GoogleSearchResult[],
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