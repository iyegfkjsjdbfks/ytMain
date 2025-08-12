import type { Channel } from '../types';
import { Link } from 'react-router-dom';
// / <reference types="vite/client" />
// Google Custom Search API service for YouTube video search
import { isYouTubeDataApiBlocked } from '../src/utils/youtubeApiUtils';

import { googleSearchVideoStore } from './googleSearchVideoStore';

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
 height: string
 }>;
 cse_image?: Array<{
 src: string
 }>;
 videoobject?: Array<{
 embedurl?: string;
 playertype?: string;
 width?: string;
 height?: string;
 duration?: string;
 uploaddate?: string;
 name?: string;
 description?: string;
 thumbnailurl?: string;
 channelid?: string;
 interactioncount?: string;
 viewcount?: string;
 watchcount?: string;
 likecount?: string;
 dislikecount?: string;
 commentcount?: string;
 subscribercount?: string;
 genre?: string;
 keywords?: string;
 contentrating?: string;
 isfamilyfriendly?: string;
 }>;
 metatags?: Array<{
 'og:title'?: string;
 'og:description'?: string;
 'og:image'?: string;
 'og:url'?: string;
 'og:video:duration'?: string;
 'og:video:tag'?: string;
 'twitter:title'?: string;
 'twitter:description'?: string;
 'twitter:image'?: string;
 'youtube-client-name'?: string;
 'youtube-client-version'?: string;
 'theme-color'?: string;
 }>;
 person?: Array<{
 name?: string;
 url?: string;
 }>;
 organization?: Array<{
 name?: string;
 url?: string;
 }>;
 };
}

interface GoogleSearchResponse {
 kind: string;
 url: {
 type: string;
 template: string
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
 cx: string
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
 cx: string
 }>;
 };
 context: {
 title: string
 };
 searchInformation: {
 searchTime: number;
 formattedSearchTime: string;
 totalResults: string;
 formattedTotalResults: string
 };
 items?: GoogleSearchItem;
}

// Types for YouTube Data API v3 response
interface YouTubeSearchItem {
 id: {
 kind: string;
 videoId: string
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
 publishTime: string
 };
}

interface YouTubeSearchResponse {
 kind: string;
 etag: string;
 nextPageToken?: string;
 regionCode: string;
 pageInfo: {
 totalResults: number;
 resultsPerPage: number
 };
 items: YouTubeSearchItem
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
 tags?: string;
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
 allowed?: string;
 blocked?: string;
 };
 contentRating?: Record<string, string>;
 projection?: string;
 };
}

interface YouTubeVideoDetailsResponse {
 kind: string;
 etag: string;
 items: YouTubeVideoDetails
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
 videoCount: string
 };
}

interface YouTubeChannelDetailsResponse {
 kind: string;
 etag: string;
 items: YouTubeChannelDetails
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
 tags?: string;
 categoryId?: string;
 isYouTube: true
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
 views: string; // Formatted view count string
 likeCount?: number;
 dislikeCount?: number;
 commentCount?: number;
 tags?: string;
 categoryId?: string;
 isYouTube: true;
 isShort?: boolean; // Whether the video is a YouTube Short,
 source: 'google-search'
}

// Combined search result type
export interface CombinedSearchResult {
 localVideos: Video;
 youtubeVideos: YouTubeSearchResult;
 googleSearchVideos?: GoogleSearchResult;
}

// Convert YouTube Data API result to YouTube video result with enhanced metadata
const convertToYouTubeResult: any = (,
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
 isYouTube: true as const };
};

// Convert Google Custom Search result to YouTube video result with YouTube API as primary, Google Custom Search as fallback
const convertToGoogleSearchResult: any = (,
 item: GoogleSearchItem,
 videoDetails?: YouTubeVideoDetails,
 channelDetails?: YouTubeChannelDetails,
): GoogleSearchResult => {
 // Extract video ID from YouTube URL
 const videoId = extractVideoIdFromUrl(item.link);

 // Enhanced metadata extraction from Google Custom Search API
 const videoObject = item.pagemap?.videoobject?.[0];
 const metaTags = item.pagemap?.metatags?.[0];
 const person = item.pagemap?.person?.[0];
 const organization = item.pagemap?.organization?.[0];

 // Extract thumbnail from multiple sources
 const thumbnailUrl = videoDetails?.snippet.thumbnails.maxres?.url ||
 videoDetails?.snippet.thumbnails.high?.url ||
 metaTags?.['og:image'] ||
 metaTags?.['twitter:image'] ||
 videoObject?.thumbnailurl ||
 item.pagemap?.cse_thumbnail?.[0]?.src ||
 item.pagemap?.cse_image?.[0]?.src ||
 `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

 // Extract duration from multiple sources
 const duration = videoDetails?.contentDetails.duration ?
 formatDuration(parseDuration(videoDetails.contentDetails.duration)) :
 metaTags?.['og:video:duration'] ||
 videoObject?.duration ||
 '0:00';

 // Extract enhanced metadata
 const title: any = (videoDetails?.snippet.title ||
 metaTags?.['og:title'] ||
 videoObject?.name ||
 item.title || 'YouTube Video')
 .replace(/ - YouTube$/, '')
 .replace(/\s*\|\s*YouTube$/, '');

 const description = videoDetails?.snippet.description ||
 metaTags?.['og:description'] ||
 metaTags?.['twitter:description'] ||
 videoObject?.description ||
 item.snippet || '';

 const channelName = videoDetails?.snippet.channelTitle ||
 person?.name ||
 organization?.name ||
 item.displayLink.replace(/^www\.youtube\.com\s*[›>]?\s*/, '') ||
 'YouTube';

 const uploadedAt = videoDetails?.snippet.publishedAt ||
 videoObject?.uploaddate ||
 new Date().toISOString();

 // Extract view count and other statistics from multiple sources
 let viewCount: number | undefined;
 let likeCount: number | undefined;
 let dislikeCount: number | undefined;
 let commentCount: number | undefined;

 if (videoDetails?.statistics.viewCount) {
 viewCount = parseInt(videoDetails.statistics.viewCount, 10);
 likeCount = videoDetails.statistics.likeCount ? parseInt(videoDetails.statistics.likeCount, 10) : undefined;
 dislikeCount = videoDetails.statistics.dislikeCount ? parseInt(videoDetails.statistics.dislikeCount, 10) : undefined;
 commentCount = videoDetails.statistics.commentCount ? parseInt(videoDetails.statistics.commentCount, 10) : undefined;
 } else {
 // Try to extract from Google Custom Search videoobject
 if (videoObject?.viewcount) {
 const parsed = parseInt(videoObject.viewcount.replace(/[^\d]/g, ''), 10);
 if (!isNaN(parsed)) {
 viewCount = parsed;
 }
 } else if (videoObject?.watchcount) {
 const parsed = parseInt(videoObject.watchcount.replace(/[^\d]/g, ''), 10);
 if (!isNaN(parsed)) {
 viewCount = parsed;
 }
 } else if (videoObject?.interactioncount) {
 const parsed = parseInt(videoObject.interactioncount.replace(/[^\d]/g, ''), 10);
 if (!isNaN(parsed)) {
 viewCount = parsed;
 }
 // Try to extract view count from snippet text (e.g., "1.2M views")
 if (!viewCount && item.snippet) {
 const viewsMatch = item.snippet.match(/(\d+(?:\.\d+)?[KMB]?)\s*views?/i);
 if (viewsMatch?.[1]) {
 const viewsText = viewsMatch[1];
 let multiplier = 1;
 if (viewsText.includes('K')) {
multiplier = 1000;
} else if (viewsText.includes('M')) {
multiplier = 1000000;
} else if (viewsText.includes('B')) {
multiplier = 1000000000;
}

 const baseNumber = parseFloat(viewsText.replace(/[KMB]/i, ''));
 if (!isNaN(baseNumber)) {
 viewCount = Math.round(baseNumber * multiplier);
 }
 }

 // Try to extract view count from title and htmlSnippet as well
 if (!viewCount && item.title) {
 const titleViewsMatch = item.title.match(/(\d+(?:\.\d+)?[KMB]?)\s*views?/i);
 if (titleViewsMatch?.[1]) {
 const viewsText = titleViewsMatch[1];
 let multiplier = 1;
 if (viewsText.includes('K')) {
multiplier = 1000;
} else if (viewsText.includes('M')) {
multiplier = 1000000;
} else if (viewsText.includes('B')) {
multiplier = 1000000000;
}

 const baseNumber = parseFloat(viewsText.replace(/[KMB]/i, ''));
 if (!isNaN(baseNumber)) {
 viewCount = Math.round(baseNumber * multiplier);
 }
 }

 if (!viewCount && item.htmlSnippet) {
 const htmlSnippet = item.htmlSnippet.replace(/<[^>]*>/g, '');
 const htmlViewsMatch = htmlSnippet.match(/(\d+(?:\.\d+)?[KMB]?)\s*views?/i);
 if (htmlViewsMatch?.[1]) {
 const viewsText = htmlViewsMatch[1];
 let multiplier = 1;
 if (viewsText.includes('K')) {
multiplier = 1000;
} else if (viewsText.includes('M')) {
multiplier = 1000000;
} else if (viewsText.includes('B')) {
multiplier = 1000000000;
}

 const baseNumber = parseFloat(viewsText.replace(/[KMB]/i, ''));
 if (!isNaN(baseNumber)) {
 viewCount = Math.round(baseNumber * multiplier);
 }
 }

 // Extract other statistics from videoobject
 if (videoObject?.likecount) {
 const parsed = parseInt(videoObject.likecount.replace(/[^\d]/g, ''), 10);
 if (!isNaN(parsed)) {
 likeCount = parsed;
 }
 if (videoObject?.dislikecount) {
 const parsed = parseInt(videoObject.dislikecount.replace(/[^\d]/g, ''), 10);
 if (!isNaN(parsed)) {
 dislikeCount = parsed;
 }
 if (videoObject?.commentcount) {
 const parsed = parseInt(videoObject.commentcount.replace(/[^\d]/g, ''), 10);
 if (!isNaN(parsed)) {
 commentCount = parsed;
 }
 }

 const channelId = videoDetails?.snippet.channelId || videoObject?.channelid || `channel-${videoId}`;

 // Determine if this is a YouTube Short based on duration
 const durationSeconds = videoDetails?.contentDetails.duration ?
 parseDuration(videoDetails.contentDetails.duration) :
 parseDuration(duration || 'PT0S');
 const isShort = durationSeconds > 0 && durationSeconds <= 60;

 // Format views for display
 const finalViewCount = videoDetails?.statistics.viewCount ?
 parseInt(videoDetails.statistics.viewCount, 10) :
 viewCount || 0;
 const views = formatViewCount(finalViewCount);

 return {
 id: `google-search-${videoId || item.cacheId || Math.random().toString(36)}`,
 title: videoDetails?.snippet.title || title,
 description: videoDetails?.snippet.description || description,
 thumbnailUrl: videoDetails?.snippet.thumbnails.maxres?.url ||
 videoDetails?.snippet.thumbnails.high?.url ||
 videoDetails?.snippet.thumbnails.medium?.url ||
 thumbnailUrl,
 channelName: videoDetails?.snippet.channelTitle || channelName,
 channelId: videoDetails?.snippet.channelId || channelId || `channel-${videoId}`,
 channelAvatarUrl: channelDetails?.snippet.thumbnails.medium?.url ||
 channelDetails?.snippet.thumbnails.default?.url ||
 generateChannelAvatarUrl(videoDetails?.snippet.channelTitle || channelName),
 videoUrl: item.link,
 embedUrl: videoObject?.embedurl || `https://www.youtube.com/embed/${videoId}`,
 duration: videoDetails?.contentDetails.duration ?
 formatDuration(parseDuration(videoDetails.contentDetails.duration)) :
 duration,
 uploadedAt: videoDetails?.snippet.publishedAt || uploadedAt,
 views,
 isShort,
 // Use YouTube API statistics if available, otherwise fall back to extracted values
 ...(videoDetails?.statistics.viewCount && {
 viewCount: parseInt(videoDetails.statistics.viewCount, 10) }),
 ...(videoDetails?.statistics.likeCount && {
 likeCount: parseInt(videoDetails.statistics.likeCount, 10) }),
 ...(videoDetails?.statistics.dislikeCount && {
 dislikeCount: parseInt(videoDetails.statistics.dislikeCount, 10) }),
 ...(videoDetails?.statistics.commentCount && {
 commentCount: parseInt(videoDetails.statistics.commentCount, 10) }),
 // If YouTube API data not available, use extracted values from Google Custom Search
 ...(!videoDetails?.statistics.viewCount && viewCount && { viewCount }),
 ...(!videoDetails?.statistics.likeCount && likeCount && { likeCount }),
 ...(!videoDetails?.statistics.dislikeCount && dislikeCount && { dislikeCount }),
 ...(!videoDetails?.statistics.commentCount && commentCount && { commentCount }),
 ...(videoDetails?.snippet.tags && { tags: videoDetails.snippet.tags }),
 ...(videoDetails?.snippet.categoryId && { categoryId: videoDetails.snippet.categoryId }),
 isYouTube: true as const, source: 'google-search' as const };
};

// Helper function to extract video ID from YouTube URL
const extractVideoIdFromUrl: any = (url: any): string | null => {
 const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
 const match = url.match(regex);
 return match ? (match[1] || null) : null;
};

// Helper function to parse ISO 8601 duration to seconds
const parseDuration: any = (duration: any): number => {
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
const formatDuration: any = (seconds: any): string => {
 const hours = Math.floor(seconds / 3600);
 const minutes = Math.floor((seconds % 3600) / 60);
 const secs = seconds % 60;

 if (hours > 0) {
 return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
 }
 return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to format view count for display
const formatViewCount: any = (viewCount: any): string => {
 if (viewCount >= 1000000000) {
 return `${(viewCount / 1000000000).toFixed(1).replace(/\.0$/, '')}B`;
 }
 if (viewCount >= 1000000) {
 return `${(viewCount / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
 }
 if (viewCount >= 1000) {
 return `${(viewCount / 1000).toFixed(1).replace(/\.0$/, '')}K`;
 }
 return viewCount.toString();
};

// Fetch detailed video information from YouTube Data API v3 (with blocking check)
const fetchVideoDetails = async (videoIds: any): Promise<Map<string, YouTubeVideoDetails>> => {
 // Check if YouTube Data API is blocked by admin settings
 if (isYouTubeDataApiBlocked()) {
 (console as any).warn('YouTube Data API v3 is disabled when Google Custom Search JSON API is selected as the YouTube Search Provider.');
 return new Map();
 }
 return fetchVideoDetailsInternal(videoIds);
};

// Internal function to fetch video details without blocking check
const fetchVideoDetailsInternal = async (videoIds: any): Promise<Map<string, YouTubeVideoDetails>> => {

 const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
 if (!apiKey || videoIds.length === 0) {
 return new Map();
 }

 try {
 const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
 detailsUrl.searchParams.set('key', apiKey);
 detailsUrl.searchParams.set('part', 'snippet,statistics,contentDetails');
 detailsUrl.searchParams.set('id', videoIds.join(','));

 const response = await (fetch as any)(detailsUrl.toString());
 if (!response.ok) {
 (console as any).warn(`Failed to fetch video details: ${response.status} ${response.statusText}`);
 (console as any).warn('This is expected when using Google Custom Search as fallback - video metadata will come from search results');
 return new Map();
 }

 const data: YouTubeVideoDetailsResponse = await response.json();
 const detailsMap = new Map<string, YouTubeVideoDetails>();

 data.items.forEach((item: any) => {
 detailsMap.set(item.id, item);
 });

 return detailsMap;
 } catch (error: any) {
 (console as any).error('Error fetching video details:', error);
 return new Map();
 };

// Fetch channel information from YouTube Data API v3 (with blocking check)
const fetchChannelDetails = async (channelIds: any): Promise<Map<string, YouTubeChannelDetails>> => {
 // Check if YouTube Data API is blocked by admin settings
 if (isYouTubeDataApiBlocked()) {
 (console as any).warn('YouTube Data API v3 is disabled when Google Custom Search JSON API is selected as the YouTube Search Provider.');
 return new Map();
 }
 return fetchChannelDetailsInternal(channelIds);
};

// Internal function to fetch channel details without blocking check
const fetchChannelDetailsInternal = async (channelIds: any): Promise<Map<string, YouTubeChannelDetails>> => {

 const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
 if (!apiKey || channelIds.length === 0) {
 return new Map();
 }

 try {
 const channelUrl = new URL('https://www.googleapis.com/youtube/v3/channels');
 channelUrl.searchParams.set('key', apiKey);
 channelUrl.searchParams.set('part', 'snippet,statistics');
 channelUrl.searchParams.set('id', channelIds.join(','));

 const response = await (fetch as any)(channelUrl.toString());
 if (!response.ok) {
 (console as any).warn(`Failed to fetch channel details: ${response.status} ${response.statusText}`);
 (console as any).warn('This is expected when using Google Custom Search as fallback - channel metadata will come from search results');
 return new Map();
 }

 const data: YouTubeChannelDetailsResponse = await response.json();
 const channelMap = new Map<string, YouTubeChannelDetails>();

 data.items.forEach((item: any) => {
 channelMap.set(item.id, item);
 });

 return channelMap;
 } catch (error: any) {
 (console as any).error('Error fetching channel details:', error);
 return new Map();
 };

// Search YouTube videos using YouTube Data API v3 with enhanced metadata
export const searchYouTubeVideos = async (query: any): Promise<YouTubeSearchResult[]> => {
 // Check if YouTube Data API is blocked by admin settings
 if (isYouTubeDataApiBlocked()) {
 (console as any).warn('YouTube Data API v3 is disabled when Google Custom Search JSON API is selected as the YouTube Search Provider.');
 return [];
 }

 // Check for YouTube API key in environment variables
 const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

 if (!apiKey) {
 (console as any).warn('YouTube Data API key not configured');
 return [];
 }

 try {
 const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
 searchUrl.searchParams.set('key', apiKey);
 searchUrl.searchParams.set('part', 'snippet');
 searchUrl.searchParams.set('q', query);
 searchUrl.searchParams.set('type', 'video');
 searchUrl.searchParams.set('maxResults', '50');
 (console as any).log('🔍 YouTube API search URL:', searchUrl.toString());
 searchUrl.searchParams.set('order', 'relevance');

 const response = await (fetch as any)(searchUrl.toString());

 if (!response.ok) {
 const errorText = await response.text();
 throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
 }

 const data: YouTubeSearchResponse = await response.json();

 if (!data.items || data.items.length === 0) {
 return [];
 }

 // Extract video IDs and channel IDs for batch fetching
 const videoIds = data.items.map((item: any) => item.id.videoId);
 const channelIds = [...new Set(data.items.map((item: any) => item.snippet.channelId))];

 // Fetch enhanced metadata in parallel
 const [videoDetailsMap, channelDetailsMap] = await Promise.all([
 fetchVideoDetails(videoIds),
 fetchChannelDetails(channelIds)]);

 // Convert YouTube API results to our format with enhanced metadata
 const youtubeResults = data.items.map((item: any) => {
 const videoDetails = videoDetailsMap.get(item.id.videoId);
 const channelDetails = channelDetailsMap.get(item.snippet.channelId);
 return convertToYouTubeResult(item, videoDetails, channelDetails);
 });

 return youtubeResults;
 } catch (error: any) {
 (console as any).error('Error searching YouTube videos:', error);

 // Check if it's a quota error and throw it to allow hybrid mode to catch and handle it
 if (error.message?.includes('quota') ||
 error.message?.includes('limit') ||
 error.message?.includes('exceeded') ||
 (error.status === 403)) {
 throw error;
 }

 return [];
 };

// Search YouTube videos using Google Custom Search JSON API with enhanced metadata
export const searchYouTubeWithGoogleSearch = async (query: any): Promise<GoogleSearchResult[]> => {
 // Check for Google Custom Search API key and engine ID
 const apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
 const engineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

 if (!apiKey || !engineId) {
 (console as any).warn('Google Custom Search API key or engine ID not configured');
 return [];
 }

 try {
 const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
 searchUrl.searchParams.set('key', apiKey);
 searchUrl.searchParams.set('cx', engineId);
 searchUrl.searchParams.set('q', `${query}, site:youtube.com`);
 searchUrl.searchParams.set('num', '10');
 (console as any).log('🔍 Google Custom Search URL:', searchUrl.toString());
 // Remove searchType parameter as it's not supported for general web search

 const response = await (fetch as any)(searchUrl.toString());

 if (!response.ok) {
 const errorText = await response.text();
 throw new Error(`Google Custom Search API error: ${response.status} - ${errorText}`);
 }

 const data: GoogleSearchResponse = await response.json();

 if (!data.items || data.items.length === 0) {
 return [];
 }

 // Filter for YouTube video results
 const youtubeItems = data.items.filter((item: any) => item.link.includes('youtube.com/watch'));

 // Extract video IDs for enhanced metadata fetching
 const videoIds = youtubeItems
 .map((item: any) => extractVideoIdFromUrl(item.link))
 .filter((id: string): id is string => id !== null);

 let videoDetailsMap = new Map<string, YouTubeVideoDetails>();
 let channelDetailsMap = new Map<string, YouTubeChannelDetails>();

 // Always try to fetch enhanced metadata with YouTube API first, then fallback to Google Custom Search
 // This implements the user rule: "use youtube data api to fetch and show metadata and google custom search api as a fallback for metadata everywhere"
 const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
 const { getYouTubeSearchProvider } = await import('./settingsService');
 const currentProvider = getYouTubeSearchProvider();

 // Always try YouTube API for metadata if available (regardless of provider selection)
 if (youtubeApiKey && videoIds.length > 0) {
 try {
 (console as any).log(`🎯 Using YouTube Data API v3 for metadata enhancement (provider: ${currentProvider})`);
 videoDetailsMap = await fetchVideoDetailsInternal(videoIds);

 // Extract unique channel IDs from video details
 const channelIds = Array.from(new Set(
 Array.from(videoDetailsMap.values()).map((video: any) => video.snippet.channelId),
 ));

 if (channelIds.length > 0) {
 channelDetailsMap = await fetchChannelDetailsInternal(channelIds);
 }
 (console as any).log(`✅ Enhanced YouTube API metadata fetched for ${videoDetailsMap.size} videos`);
 } catch (error: any) {
 (console as any).warn('⚠️ YouTube API metadata fetch failed, using Google Custom Search metadata as fallback:', error);
 }
 } else {
 (console as any).log('⚠️ YouTube API not available for metadata enhancement, using Google Custom Search metadata only');
 }

 // Convert to our format with enhanced metadata when available
 const youtubeResults = youtubeItems.map((item: any) => {
 const videoId = extractVideoIdFromUrl(item.link);
 const videoDetails = videoId ? videoDetailsMap.get(videoId) : undefined;
 const channelDetails = videoDetails ? channelDetailsMap.get(videoDetails.snippet.channelId) : undefined;
 return convertToGoogleSearchResult(item, videoDetails, channelDetails);
 });

 // Store Google Custom Search results for individual access
 googleSearchVideoStore.storeVideos(youtubeResults);
 (console as any).log(`📦 Stored ${youtubeResults.length} Google Custom Search videos for individual access`);

 return youtubeResults;
 } catch (error: any) {
 (console as any).error('Error searching YouTube with Google Custom Search:', error);
 return [];
 };

// Search function specifically for home page - respects hybrid mode preference
export const searchForHomePage = async (query: any, searchLocalVideos: (query: any) => Promise<Video[]>): Promise<CombinedSearchResult> => {
 (console as any).log('🏠 searchForHomePage called with query:', query);
 try {
 // Import settings service dynamically to avoid circular dependencies
 const { getYouTubeSearchProvider } = await import('./settingsService');
 const provider = getYouTubeSearchProvider();
 (console as any).log('🎯 YouTube search provider for home page:', provider);

 // Search local videos first
 const localVideos = await searchLocalVideos(query);
 (console as any).log('📁 Local videos found:', localVideos.length);

 let youtubeResults: YouTubeSearchResult[] | GoogleSearchResult;

 if (provider === 'hybrid') {
 // Hybrid mode for HOME PAGE: Use YouTube Data API first, then Google Custom Search as fallback
 (console as any).log('🔄 Hybrid Mode (Home Page): Trying YouTube Data API first, then Google Custom Search as fallback');
 try {
 (console as any).log('🎯 Step 1: Attempting YouTube Data API search...');
 youtubeResults = await searchYouTubeVideos(query);
 (console as any).log('✅ YouTube Data API search successful:', youtubeResults.length, 'results');
 return {
 localVideos,
 youtubeVideos: youtubeResults,
 googleSearchVideos: [] };
 } catch (youtubeError: any) {
 (console as any).warn('🚨 YouTube Data API failed, falling back to Google Custom Search:', youtubeError.message);
 try {
 (console as any).log('🎯 Step 2: Attempting Google Custom Search as fallback...');
 youtubeResults = await searchYouTubeWithGoogleSearch(query);
 (console as any).log('✅ Google Custom Search fallback successful:', youtubeResults.length, 'results');
 return {
 localVideos,
 youtubeVideos: [],
 googleSearchVideos: youtubeResults };
 } catch (fallbackError: any) {
 (console as any).error('❌ Both YouTube Data API and Google Custom Search failed in hybrid mode (home page)');
 (console as any).error('YouTube API Error:', youtubeError.message);
 (console as any).error('Google Search Error:', fallbackError.message);
 throw new Error(`Hybrid mode failed on home page: YouTube API (${youtubeError.message}), Google Search (${fallbackError.message})`);
 }
 } else if (provider === 'google-search') {
 (console as any).log('🔍 Using Google Custom Search for home page');
 youtubeResults = await searchYouTubeWithGoogleSearch(query);
 (console as any).log('✅ Google Custom Search results:', youtubeResults.length);
 return {
 localVideos,
 youtubeVideos: [],
 googleSearchVideos: youtubeResults };
 } else {
 (console as any).log('🎯 Using YouTube Data API for home page');
 youtubeResults = await searchYouTubeVideos(query);
 (console as any).log('✅ YouTube Data API results:', youtubeResults.length);
 return {
 localVideos,
 youtubeVideos: youtubeResults,
 googleSearchVideos: [] };
 }
 } catch (error: any) {
 (console as any).error('Error in home page search:', error);
 // Return local results only if both searches fail
 const localVideos = await searchLocalVideos(query);
 return {
 localVideos,
 youtubeVideos: [],
 googleSearchVideos: [] };
 };

// Search function specifically for search results page - always uses Google Custom Search for discovery
export const searchForSearchResultsPage = async (query: any, searchLocalVideos: (query: any) => Promise<Video[]>): Promise<CombinedSearchResult> => {
 (console as any).log('🔍 searchForSearchResultsPage called with query:', query);
 try {
 // Import settings service dynamically to avoid circular dependencies
 const { getYouTubeSearchProvider } = await import('./settingsService');
 const provider = getYouTubeSearchProvider();
 (console as any).log('🎯 YouTube search provider for search results page:', provider);

 // Search local videos first
 const localVideos = await searchLocalVideos(query);
 (console as any).log('📁 Local videos found:', localVideos.length);

 let youtubeResults: YouTubeSearchResult[] | GoogleSearchResult;

 // For search results page, always use Google Custom Search for discovery
 // with YouTube Data API for metadata enhancement (as per user requirements)
 (console as any).log('🔍 Search Results Page: Using Google Custom Search for discovery with YouTube API metadata enhancement');
 try {
 youtubeResults = await searchYouTubeWithGoogleSearch(query);
 (console as any).log('✅ Google Custom Search results with YouTube API metadata:', youtubeResults.length);
 return {
 localVideos,
 youtubeVideos: [],
 googleSearchVideos: youtubeResults };
 } catch (error: any) {
 (console as any).error('❌ Google Custom Search failed on search results page:', error.message);
 // If Google Custom Search fails, still try YouTube API as last resort
 if (provider !== 'google-search') {
 try {
 (console as any).log('🎯 Last resort: Trying YouTube Data API...');
 youtubeResults = await searchYouTubeVideos(query);
 (console as any).log('✅ YouTube API last resort results:', youtubeResults.length);
 return {
 localVideos,
 youtubeVideos: youtubeResults,
 googleSearchVideos: [] };
 } catch (youtubeError: any) {
 (console as any).error('❌ YouTube API also failed:', youtubeError);
 }
 throw error;
 }
 } catch (error: any) {
 (console as any).error('Error in search results page search:', error);
 // Return local results only if all searches fail
 const localVideos = await searchLocalVideos(query);
 return {
 localVideos,
 youtubeVideos: [],
 googleSearchVideos: [] };
 };

// Legacy combined search function - kept for backward compatibility
export const searchCombined = async (query: any, searchLocalVideos: (query: any) => Promise<Video[]>): Promise<CombinedSearchResult> => {
 (console as any).log('🔍 searchCombined called with query (legacy):', query);
 // Default to search results page behavior for backward compatibility
 return searchForSearchResultsPage(query, searchLocalVideos);
};

// Fetch a single video by YouTube ID from Google Custom Search
export const fetchSingleVideoFromGoogleSearch = async (youtubeVideoId: any): Promise<GoogleSearchResult | null> => {
 (console as any).log(`🔍 Fetching single video from Google Custom Search: ${youtubeVideoId}`);

 try {
 const searchApiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
 const searchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

 (console as any).log(`🔑 API Key available: ${!!searchApiKey}`);
 (console as any).log(`🔍 Search Engine ID available: ${!!searchEngineId}`);

 if (!searchApiKey || !searchEngineId) {
 (console as any).error('Google Custom Search API not configured');
 (console as any).error(`Missing API Key: ${!searchApiKey}, Missing Engine ID: ${!searchEngineId}`);
 return null;
 }

 // Search for the specific video ID on YouTube
 const searchQuery = `site:youtube.com/watch ${youtubeVideoId}`;
 const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
 searchUrl.searchParams.set('key', searchApiKey);
 searchUrl.searchParams.set('cx', searchEngineId);
 searchUrl.searchParams.set('q', searchQuery);
 searchUrl.searchParams.set('num', '1'); // Only need one result

 (console as any).log(`🌐 Google Custom Search URL: ${searchUrl.toString()}`);

 const response = await (fetch as any)(searchUrl.toString());
 (console as any).log(`📡 Response status: ${response.status} ${response.statusText}`);

 if (!response.ok) {
 const errorText = await response.text();
 (console as any).error(`❌ Google Custom Search API error: ${response.status} ${response.statusText}`);
 (console as any).error(`❌ Error details: ${errorText}`);
 throw new Error(`Google Custom Search API error: ${response.statusText}`);
 }

 const data = await response.json();
 (console as any).log('📥 Google Custom Search API Response:', JSON.stringify(data, null, 2));
 (console as any).log('📊 Search info:', {
 totalResults: data.searchInformation?.totalResults,
 itemsCount: data.items?.length || 0,
 searchTime: data.searchInformation?.searchTime });

 if (!data.items || data.items.length === 0) {
 (console as any).log(`❌ No Google Custom Search results found for video ID: ${youtubeVideoId}`);
 return null;
 }

 const item = data.items[0];

 // Verify this is actually the video we're looking for
 if (!item.link.includes(youtubeVideoId)) {
 (console as any).log(`❌ Found video does not match requested ID: ${youtubeVideoId}`);
 return null;
 }

 (console as any).log('🔍 Raw Google Search Item:', JSON.stringify(item, null, 2));

 // Try to extract metadata from the YouTube page if available
 let enhancedMetadata: YouTubeVideoDetails | null = null;
 let channelMetadata: YouTubeChannelDetails | null = null;

 // Use YouTube API for enhanced metadata when available
 // Even when Google Custom Search is selected as search provider, we can use YouTube API for individual video metadata
 const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
 const shouldUseYouTubeApi = !!youtubeApiKey;

 if (shouldUseYouTubeApi as any) {
 try {
 (console as any).log('🎯 Using YouTube API for enhanced metadata...');
 (console as any).log('🔑 YouTube API Key available:', !!youtubeApiKey);
 (console as any).log('💡 Note: Using YouTube API for metadata even with Google Custom Search selected');

 const videoDetailsMap = await fetchVideoDetailsInternal([youtubeVideoId]);
 enhancedMetadata = videoDetailsMap.get(youtubeVideoId) || null;

 if (enhancedMetadata as any) {
 (console as any).log('✅ Enhanced metadata found:', enhancedMetadata.snippet.title);
 (console as any).log('📊 Real view count:', parseInt(enhancedMetadata.statistics.viewCount, 10).toLocaleString());
 const channelDetailsMap = await fetchChannelDetailsInternal([enhancedMetadata.snippet.channelId]);
 channelMetadata = channelDetailsMap.get(enhancedMetadata.snippet.channelId) || null;

 if (channelMetadata as any) {
 (console as any).log('✅ Channel metadata found from YouTube API:', channelMetadata.snippet.title);
 (console as any).log('👥 Subscriber count:', parseInt(channelMetadata.statistics.subscriberCount, 10).toLocaleString());
 }
 } else {
 (console as any).log('❌ No enhanced metadata found from YouTube API, will use Google Custom Search fallback');
 }
 } catch (error: any) {
 (console as any).warn('⚠️ YouTube API failed, falling back to Google Custom Search metadata:', error);
 }
 } else {
 (console as any).log('❌ YouTube API Key not available, using Google Custom Search metadata only');
 }

 // Enhanced metadata extraction from Google Custom Search API
 const videoObject = item.pagemap?.videoobject?.[0];
 const metaTags = item.pagemap?.metatags?.[0];
 const person = item.pagemap?.person?.[0];
 const organization = item.pagemap?.organization?.[0];

 // Parse the title to remove " - YouTube" suffix
 const cleanTitle: any = (enhancedMetadata?.snippet.title ||
 metaTags?.['og:title'] ||
 videoObject?.name ||
 item.title || 'YouTube Video')
 .replace(/ - YouTube$/, '')
 .replace(/\s*\|\s*YouTube$/, '');

 // Extract channel name from multiple sources
 const channelName = enhancedMetadata?.snippet.channelTitle ||
 person?.name ||
 organization?.name ||
 extractChannelFromTitle(item.title) ||
 'YouTube Channel';

 // Extract description from multiple sources
 const description = enhancedMetadata?.snippet.description ||
 metaTags?.['og:description'] ||
 metaTags?.['twitter:description'] ||
 videoObject?.description ||
 item.snippet || '';

 // Extract duration from multiple sources
 const duration = enhancedMetadata?.contentDetails.duration ?
 formatDuration(parseDuration(enhancedMetadata.contentDetails.duration)) :
 metaTags?.['og:video:duration'] ||
 videoObject?.duration ||
 'Unknown';

 // Extract view count from multiple sources
 let viewCount: number | undefined;
 let likeCount: number | undefined;
 let dislikeCount: number | undefined;
 let commentCount: number | undefined;

 if (enhancedMetadata?.statistics.viewCount) {
 viewCount = parseInt(enhancedMetadata.statistics.viewCount, 10);
 likeCount = enhancedMetadata.statistics.likeCount ? parseInt(enhancedMetadata.statistics.likeCount, 10) : undefined;
 dislikeCount = enhancedMetadata.statistics.dislikeCount ? parseInt(enhancedMetadata.statistics.dislikeCount, 10) : undefined;
 commentCount = enhancedMetadata.statistics.commentCount ? parseInt(enhancedMetadata.statistics.commentCount, 10) : undefined;
 } else {
 // Try to extract from Google Custom Search videoobject
 if (videoObject?.viewcount) {
 const parsed = parseInt(videoObject.viewcount.replace(/[^\d]/g, ''), 10);
 if (!isNaN(parsed)) {
 viewCount = parsed;
 }
 } else if (videoObject?.watchcount) {
 const parsed = parseInt(videoObject.watchcount.replace(/[^\d]/g, ''), 10);
 if (!isNaN(parsed)) {
 viewCount = parsed;
 }
 } else if (videoObject?.interactioncount) {
 // Try to parse interaction count as view count
 const parsed = parseInt(videoObject.interactioncount.replace(/[^\d]/g, ''), 10);
 if (!isNaN(parsed)) {
 viewCount = parsed;
 }
 // Try to extract view count from snippet text (e.g., "1.2M views")
 if (!viewCount && item.snippet) {
 const viewsMatch = item.snippet.match(/(\d+(?:\.\d+)?[KMB]?)\s*views?/i);
 if (viewsMatch?.[1]) {
 const viewsText = viewsMatch[1];
 let multiplier = 1;
 if (viewsText.includes('K')) {
multiplier = 1000;
} else if (viewsText.includes('M')) {
multiplier = 1000000;
} else if (viewsText.includes('B')) {
multiplier = 1000000000;
}

 const baseNumber = parseFloat(viewsText.replace(/[KMB]/i, ''));
 if (!isNaN(baseNumber)) {
 viewCount = Math.round(baseNumber * multiplier);
 (console as any).log(`✅ Extracted view count from snippet: ${viewCount.toLocaleString()}`);
 }
 }

 // Try to extract view count from title (sometimes included)
 if (!viewCount && item.title) {
 const titleViewsMatch = item.title.match(/(\d+(?:\.\d+)?[KMB]?)\s*views?/i);
 if (titleViewsMatch?.[1]) {
 const viewsText = titleViewsMatch[1];
 let multiplier = 1;
 if (viewsText.includes('K')) {
multiplier = 1000;
} else if (viewsText.includes('M')) {
multiplier = 1000000;
} else if (viewsText.includes('B')) {
multiplier = 1000000000;
}

 const baseNumber = parseFloat(viewsText.replace(/[KMB]/i, ''));
 if (!isNaN(baseNumber)) {
 viewCount = Math.round(baseNumber * multiplier);
 (console as any).log(`✅ Extracted view count from title: ${viewCount.toLocaleString()}`);
 }
 }

 // Try to extract view count from htmlSnippet (HTML version of snippet)
 if (!viewCount && item.htmlSnippet) {
 const htmlSnippet = item.htmlSnippet.replace(/<[^>]*>/g, ''); // Remove HTML tags
 const htmlViewsMatch = htmlSnippet.match(/(\d+(?:\.\d+)?[KMB]?)\s*views?/i);
 if (htmlViewsMatch?.[1]) {
 const viewsText = htmlViewsMatch[1];
 let multiplier = 1;
 if (viewsText.includes('K')) {
multiplier = 1000;
} else if (viewsText.includes('M')) {
multiplier = 1000000;
} else if (viewsText.includes('B')) {
multiplier = 1000000000;
}

 const baseNumber = parseFloat(viewsText.replace(/[KMB]/i, ''));
 if (!isNaN(baseNumber)) {
 viewCount = Math.round(baseNumber * multiplier);
 (console as any).log(`✅ Extracted view count from HTML snippet: ${viewCount.toLocaleString()}`);
 }
 }

 // Extract like/dislike counts from videoobject
 if (videoObject?.likecount) {
 const parsed = parseInt(videoObject.likecount.replace(/[^\d]/g, ''), 10);
 if (!isNaN(parsed)) {
 likeCount = parsed;
 }
 if (videoObject?.dislikecount) {
 const parsed = parseInt(videoObject.dislikecount.replace(/[^\d]/g, ''), 10);
 if (!isNaN(parsed)) {
 dislikeCount = parsed;
 }
 if (videoObject?.commentcount) {
 const parsed = parseInt(videoObject.commentcount.replace(/[^\d]/g, ''), 10);
 if (!isNaN(parsed)) {
 commentCount = parsed;
 }
 }

 // Extract thumbnail from multiple sources
 const thumbnailUrl = enhancedMetadata?.snippet.thumbnails.maxres?.url ||
 enhancedMetadata?.snippet.thumbnails.high?.url ||
 enhancedMetadata?.snippet.thumbnails.medium?.url ||
 metaTags?.['og:image'] ||
 metaTags?.['twitter:image'] ||
 videoObject?.thumbnailurl ||
 item.pagemap?.cse_thumbnail?.[0]?.src ||
 item.pagemap?.cse_image?.[0]?.src ||
 `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`;

 // Extract upload date from multiple sources
 const uploadedAt = enhancedMetadata?.snippet.publishedAt ||
 videoObject?.uploaddate ||
 new Date().toISOString();

 // Extract tags from multiple sources
 const tags = enhancedMetadata?.snippet.tags ||
 (metaTags?.['og:video:tag'] ? [metaTags['og:video:tag']] : []) ||
 [];

 (console as any).log('🔍 Building result with data sources:');
 (console as any).log(' 📝 Title source:', enhancedMetadata ? 'YouTube API' : 'Google Custom Search');
 (console as any).log(' 📺 Channel source:', enhancedMetadata ? 'YouTube API' : 'Google Custom Search');
 (console as any).log(' 📊 View count source:', enhancedMetadata ? 'YouTube API (real)' : 'Google Custom Search (extracted)');
 (console as any).log(' 🖼️ Thumbnail source:', enhancedMetadata ? 'YouTube API (high-res)' : 'Google Custom Search');
 (console as any).log(' 👥 Subscriber count source:', channelMetadata ? 'YouTube API (real)' : 'Not available');

 // Determine view count and format for display
 const finalViewCount = enhancedMetadata?.statistics.viewCount
 ? parseInt(enhancedMetadata.statistics.viewCount, 10)
 : viewCount || 0;
 const views = formatViewCount(finalViewCount);

 // Determine if this is a YouTube Short based on duration
 const durationSeconds = enhancedMetadata?.contentDetails.duration
 ? parseDuration(enhancedMetadata.contentDetails.duration)
 : parseDuration(duration || 'PT0S');
 const isShort = durationSeconds > 0 && durationSeconds <= 60;

 // Build result using YouTube API data as primary, Google Custom Search as fallback
 const result: GoogleSearchResult = {
 id: `google-search-${youtubeVideoId}`,
 title: enhancedMetadata?.snippet.title || cleanTitle,
 description: enhancedMetadata?.snippet.description || description,
 thumbnailUrl: enhancedMetadata?.snippet.thumbnails.maxres?.url ||
 enhancedMetadata?.snippet.thumbnails.high?.url ||
 enhancedMetadata?.snippet.thumbnails.medium?.url ||
 thumbnailUrl,
 videoUrl: item.link,
 embedUrl: `https://www.youtube.com/embed/${youtubeVideoId}`,
 uploadedAt: enhancedMetadata?.snippet.publishedAt || uploadedAt,
 channelName: enhancedMetadata?.snippet.channelTitle || channelName,
 channelId: enhancedMetadata?.snippet.channelId || videoObject?.channelid || `channel-${youtubeVideoId}`,
 channelAvatarUrl: channelMetadata?.snippet.thumbnails.medium?.url ||
 channelMetadata?.snippet.thumbnails.default?.url ||
 generateChannelAvatarUrl(enhancedMetadata?.snippet.channelTitle || channelName),
 duration: enhancedMetadata?.contentDetails.duration ?
 formatDuration(parseDuration(enhancedMetadata.contentDetails.duration)) :
 duration,
 views,
 isShort,
 // Use YouTube API statistics if available, otherwise fall back to extracted values
 ...(enhancedMetadata?.statistics.viewCount && {
 viewCount: parseInt(enhancedMetadata.statistics.viewCount, 10) }),
 ...(enhancedMetadata?.statistics.likeCount && {
 likeCount: parseInt(enhancedMetadata.statistics.likeCount, 10) }),
 ...(enhancedMetadata?.statistics.dislikeCount && {
 dislikeCount: parseInt(enhancedMetadata.statistics.dislikeCount, 10) }),
 ...(enhancedMetadata?.statistics.commentCount && {
 commentCount: parseInt(enhancedMetadata.statistics.commentCount, 10) }),
 // If YouTube API data not available, use extracted values from Google Custom Search
 ...(!enhancedMetadata?.statistics.viewCount && viewCount && { viewCount }),
 ...(!enhancedMetadata?.statistics.likeCount && likeCount && { likeCount }),
 ...(!enhancedMetadata?.statistics.dislikeCount && dislikeCount && { dislikeCount }),
 ...(!enhancedMetadata?.statistics.commentCount && commentCount && { commentCount }),
 categoryId: enhancedMetadata?.snippet.categoryId || 'General',
 tags: enhancedMetadata?.snippet.tags || tags,
 isYouTube: true as const, source: 'google-search' as const };

 (console as any).log('📦 Final result summary:');
 (console as any).log(` 🆔 ID: ${result.id}`);
 (console as any).log(` 📝 Title: ${result.title}`);
 (console as any).log(` 📺 Channel: ${result.channelName}`);
 (console as any).log(` 📊 Views: ${result.viewCount ? result.viewCount.toLocaleString() : 'Not available'}`);
 (console as any).log(` ⏱️ Duration: ${result.duration}`);
 (console as any).log(` 📄 Description: ${result.description.substring(0, 100)}...`);
 (console as any).log(` 🏷️ Tags: ${result.tags?.join(', ') || 'None'}`);
 (console as any).log(` 🎯 Data Source: ${enhancedMetadata ? 'YouTube API (primary) + Google Custom Search (fallback)' : 'Google Custom Search Only'}`);

 // Debug: Show what data was extracted
 (console as any).log('🔍 Metadata extraction summary:');
 (console as any).log(` - YouTube API metadata: ${enhancedMetadata ? 'Available' : 'Not available'}`);
 (console as any).log(` - YouTube API channel data: ${channelMetadata ? 'Available' : 'Not available'}`);
 (console as any).log(` - Google Custom Search VideoObject: ${videoObject ? 'Available' : 'None'}`);
 (console as any).log(` - Google Custom Search MetaTags: ${metaTags ? 'Available' : 'None'}`);
 (console as any).log(` - Final view count: ${result.viewCount ? result.viewCount.toLocaleString() : 'None'} (${enhancedMetadata?.statistics.viewCount ? 'YouTube API' : viewCount ? 'Google Custom Search' : 'Not available'})`);
 (console as any).log(` - Final like count: ${result.likeCount ? result.likeCount.toLocaleString() : 'None'} (${enhancedMetadata?.statistics.likeCount ? 'YouTube API' : likeCount ? 'Google Custom Search' : 'Not available'})`);

 // Debug: Log Google Custom Search data when YouTube API is not available
 if (!enhancedMetadata) {
 (console as any).log('🔍 Google Custom Search fallback data:');
 (console as any).log(' - Full pagemap data:', JSON.stringify(item.pagemap, null, 2));
 (console as any).log(' - Text sources for extraction:', {
 title: item.title,
 snippet: item.snippet,
 htmlSnippet: item.htmlSnippet });
 }
 (console as any).log(` 🎯 Source: ${result.source}`);
 (console as any).log(` 🔗 URL: ${result.videoUrl}`);

 (console as any).log('✅ Successfully fetched video from Google Custom Search:', result.title);

 // Store the video for future use
 googleSearchVideoStore.storeVideo(result);

 return result;

 } catch (error: any) {
 (console as any).error('Error fetching single video from Google Custom Search:', error);
 return null;
 };

// Helper function to extract channel name from video title
function extractChannelFromTitle(title: any): string | null {
 // Remove " - YouTube" suffix first
 const cleanTitle = title.replace(/ - YouTube$/, '').replace(/\s*\|\s*YouTube$/, '');

 // Try to extract channel name from common title patterns
 const patterns = [
 / - ([^-]+)$/, // "Video Title - Channel Name"
 /by ([^|]+)$/i, // "Video Title by Channel Name"
 /\| ([^|]+)$/, // "Video Title | Channel Name"
 /: ([^:]+)$/, // "Video Title: Channel Name"
 /\(([^)]+)\)$/, // "Video Title (Channel Name)"
 ];

 for (const pattern of patterns) {
 const match = cleanTitle.match(pattern);
 if (match?.[1]) {
 const channelName = match[1].trim();
 // Filter out common non-channel words
 if (!['YouTube', 'Video', 'Official', 'HD', '4K', '2024', '2023'].includes(channelName)) {
 return channelName;
 }
 }

 // If no pattern matches, try to extract from the URL or displayLink
 return null;
}

// Helper function to generate a channel avatar URL
function generateChannelAvatarUrl(channelName: any): string {
 // Use a placeholder avatar service
 const encodedName = encodeURIComponent(channelName);
 return `https://ui-avatars.com/api/?name=${encodedName}&size=48&background=random`;
}
