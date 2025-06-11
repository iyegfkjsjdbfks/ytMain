// Google Custom Search API service for YouTube video search
import { Video } from '../types';

// Types for Google Custom Search API response
interface GoogleSearchItem {
  title: string;
  link: string;
  snippet: string;
  pagemap?: {
    videoobject?: Array<{
      name?: string;
      description?: string;
      thumbnailurl?: string;
      duration?: string;
      uploaddate?: string;
    }>;
    metatags?: Array<{
      'og:image'?: string;
      'og:title'?: string;
      'og:description'?: string;
    }>;
  };
}

interface GoogleSearchResponse {
  items?: GoogleSearchItem[];
  searchInformation?: {
    totalResults: string;
  };
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

// Extract YouTube video ID from URL
const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Extract channel name from YouTube URL or snippet
const extractChannelName = (item: GoogleSearchItem): string => {
  // Try to extract from snippet (usually contains "by ChannelName")
  const snippetMatch = item.snippet.match(/by ([^-•]+)/i);
  if (snippetMatch) {
    return snippetMatch[1].trim();
  }
  
  // Fallback to domain extraction
  try {
    const url = new URL(item.link);
    if (url.hostname.includes('youtube.com')) {
      return 'YouTube';
    }
  } catch {
    // Invalid URL
  }
  
  return 'Unknown Channel';
};

// Convert Google Search result to YouTube video result
const convertToYouTubeResult = (item: GoogleSearchItem): YouTubeSearchResult | null => {
  const videoId = extractYouTubeVideoId(item.link);
  if (!videoId) return null;
  
  const videoObject = item.pagemap?.videoobject?.[0];
  const metaTags = item.pagemap?.metatags?.[0];
  
  return {
    id: `youtube-${videoId}`,
    title: videoObject?.name || metaTags?.['og:title'] || item.title,
    description: videoObject?.description || metaTags?.['og:description'] || item.snippet,
    thumbnailUrl: videoObject?.thumbnailurl || metaTags?.['og:image'] || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    channelName: extractChannelName(item),
    videoUrl: item.link,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    duration: videoObject?.duration,
    uploadedAt: videoObject?.uploaddate,
    isYouTube: true as const
  };
};

// Search YouTube videos using Google Custom Search API
export const searchYouTubeVideos = async (query: string): Promise<YouTubeSearchResult[]> => {
  // Check for API key and Search Engine ID in environment variables
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const searchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;
  
  if (!apiKey || !searchEngineId) {
    console.warn('Google Custom Search API credentials not configured');
    return [];
  }
  
  try {
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.set('key', apiKey);
    searchUrl.searchParams.set('cx', searchEngineId);
    searchUrl.searchParams.set('q', `${query} site:youtube.com`);
    searchUrl.searchParams.set('num', '10'); // Limit to 10 results
    
    const response = await fetch(searchUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Google Search API error: ${response.status}`);
    }
    
    const data: GoogleSearchResponse = await response.json();
    
    if (!data.items) {
      return [];
    }
    
    // Convert and filter valid YouTube results
    const youtubeResults = data.items
      .map(convertToYouTubeResult)
      .filter((result): result is YouTubeSearchResult => result !== null);
    
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