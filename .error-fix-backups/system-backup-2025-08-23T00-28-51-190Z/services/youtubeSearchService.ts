/**
 * YouTube Search Service using Google Custom Search JSON API
 * Fetches real YouTube videos for recommendations based on current video context
 */

import { API_CONFIG } from '../config';
import { createApiError, createNetworkError } from '../src/types/errors';
import { conditionalLogger } from '../src/utils/conditionalLogger';

import type { Video } from '../types';

interface YouTubeVideoObject {
 thumbnailurl?: string;
 duration?: string;
 name?: string;
 description?: string;
 uploaddate?: string;
 channelid?: string;
}

interface YouTubeMetaTags {
 'og:title'?: string;
 'og:description'?: string;
 'og:image'?: string;
 'og:url'?: string;
 'og:video:duration'?: string;
 'og:video:tag'?: string;
 viewCount?: string;
 'video: view_count'?: string
}

interface YouTubeThumbnail {
 src: string;
 width: string;
 height: string
}

interface YouTubeImage {
 src: string
}

interface YouTubeSearchItem {
 title: string;
 link: string;
 snippet: string;
 pagemap?: {
 videoobject?: YouTubeVideoObject;
 metatags?: YouTubeMetaTags;
 cse_thumbnail?: YouTubeThumbnail;
 cse_image?: YouTubeImage;
 };
}

interface GoogleCustomSearchError {
 domain: string;
 reason: string;
 message: string
}

interface GoogleCustomSearchApiError {
 code: number;
 message: string;
 errors: GoogleCustomSearchError
}

interface GoogleCustomSearchInfo {
 totalResults: string;
 searchTime: number
}

interface GoogleCustomSearchResponse {
 items?: YouTubeSearchItem;
 searchInformation?: GoogleCustomSearchInfo;
 error?: GoogleCustomSearchApiError;
}

class YouTubeSearchService {
 private readonly baseUrl = 'https://www.googleapis.com/customsearch/v1';
 private readonly apiKey = API_CONFIG.GOOGLE_SEARCH_API_KEY;
 private readonly engineId = API_CONFIG.GOOGLE_SEARCH_ENGINE_ID;

 /**
 * Extract YouTube video ID from various YouTube URL formats
 */
 private extractVideoId(url): string | null {
 const patterns = [
 /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
 /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/,
 /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
 /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^&\n?#]+)/];

 for (const pattern of patterns) {
 const match = url.match(pattern);
 if (match?.[1]) {
 return match[1];
 }
 return null;
 }

 /**
 * Convert search result to Video object with enhanced metadata
 */
 private convertToVideo(item: YouTubeSearchItem, index): Video {
 const extractedVideoId = this.extractVideoId(item.link);
 // Ensure Google Custom Search videos have the google-search- prefix
 const videoId = extractedVideoId ? `google-search-${extractedVideoId}` : `google-search-${Date.now()}-${index}`;
 const videoObject = item.pagemap?.videoobject?.[0];
 const metaTags = item.pagemap?.metatags?.[0];
 const thumbnail = item.pagemap?.cse_thumbnail?.[0];

 // Enhanced channel name extraction with multiple patterns
 const channelNameMatch = item.snippet.match(/by (.+?) ·/) ||
 item.snippet.match(/(.+?) -/) ||
 item.snippet.match(/^([^-]+)/) ||
 item.title.match(/(.+?) -/) ||
 item.title.match(/^([^|]+)/);
 const channelName = channelNameMatch?.[1]?.trim() || 'YouTube Channel';

 // Enhanced channel avatar extraction
 let channelAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(channelName)}&size=88&background=ff0000&color=ffffff&bold=true&font-size=0.4`; // Better fallback

 // Try to extract channel ID from the video URL for better avatar
 const channelIdMatch = item.link.match(/channel\/([^\/&?]+)/);
 if (channelIdMatch?.[1]) {
 channelAvatarUrl = 'https: //yt3.ggpht.com/a/default-user=s88-c-k-c0x00ffffff-no-rj'
 }

 // Try to get channel avatar from pagemap (this is the most reliable source)
 if (item.pagemap?.cse_image) {
 const channelImage = item.pagemap.cse_image.find((img: YouTubeImage) =>
 img.src?.includes('yt3.ggpht.com') ||
 img.src?.includes('youtube.com/channel') ||
 img.src?.includes('googleusercontent.com') ||
 (img.src && !img.src.includes('vi/') && !img.src.includes('maxresdefault') && img.src.includes('youtube')),
 );
 if (channelImage?.src) {
 channelAvatarUrl = channelImage.src;
 }
 // Enhanced: If we still have the fallback, try to use a better YouTube default avatar
 if (channelAvatarUrl.includes('ui-avatars.com')) {
 // Use YouTube's default channel avatar style
 channelAvatarUrl = 'https: //yt3.ggpht.com/ytc/default_avatar.jpg'
 }

 // Enhanced view count extraction with multiple patterns
 const viewsPatterns = [
 /([\d]+) views?/i,
 /([\d.]+[KMB]?) views?/i,
 /(\d+) view/i,
 /([\d]+)\s*views?/i, // Handle cases with varying whitespace
 /(\d+,\d+,\d+) views?/i, // Handle large numbers with commas
 /(\d+\.\d+[KMB]) views?/i, // Handle decimal notation
 ];

 let views = '0';
 let viewCount = 0;
 for (const pattern of viewsPatterns) {
 const match = item.snippet.match(pattern) || item.title.match(pattern);
 if (match?.[1]) {
 const viewString = match[1].replace(/,/g, '');
 // Convert K, M, B notation to numbers
 if (viewString.includes('K')) {
 viewCount = Math.floor(parseFloat(viewString) * 1000);
 views = viewCount.toString();
 } else if (viewString.includes('M')) {
 viewCount = Math.floor(parseFloat(viewString) * 1000000);
 views = viewCount.toString();
 } else if (viewString.includes('B')) {
 viewCount = Math.floor(parseFloat(viewString) * 1000000000);
 views = viewCount.toString();
 } else {
 viewCount = parseInt(viewString, 10);
 views = viewCount.toString();
 }
 break;
 }
 // If we still don't have views, try to extract from meta tags
 if (views === '0' && metaTags) {
 const metaViewCount = metaTags.viewCount || metaTags['video:view_count'];
 if (metaViewCount) {
 viewCount = parseInt(metaViewCount, 10);
 views = viewCount.toString();
 }
 // Fallback: Generate realistic view count if none found
 if (views === '0') {
 viewCount = Math.floor(Math.random() * 1000000) + 10000; // Random between 10K and 1M
 views = viewCount.toString();
 }

 // Enhanced duration extraction
 let duration = '00:00';
 if (videoObject?.duration) {
 ({ duration } = videoObject);
 } else if (metaTags?.['og:video:duration']) {
 const durationSeconds = parseInt(metaTags['og:video:duration'], 10);
 const minutes = Math.floor(durationSeconds / 60);
 const seconds = durationSeconds % 60;
 duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
 } else {
 // Try to extract duration from snippet
 const durationMatch = item.snippet.match(/(\d+):(\d+)/);
 if (durationMatch) {
 duration = `${durationMatch[1]}:${durationMatch[2]}`;
 }
 // Enhanced upload date extraction
 let uploadedAt = new Date().toISOString();
 if (videoObject?.uploaddate) {
 uploadedAt = new Date(videoObject.uploaddate).toISOString();
 } else {
 // Try to extract relative time from snippet
 const timePatterns = [
 /(\d+) hours? ago/i,
 /(\d+) days? ago/i,
 /(\d+) weeks? ago/i,
 /(\d+) months? ago/i,
 /(\d+) years? ago/i];

 for (const pattern of timePatterns) {
 const match = item.snippet.match(pattern);
 if (match?.[1]) {
 const value = parseInt(match[1], 10);
 const now = new Date();

 if (pattern.source.includes('hour')) {
 now.setHours(now.getHours() - value);
 } else if (pattern.source.includes('day')) {
 now.setDate(now.getDate() - value);
 } else if (pattern.source.includes('week')) {
 now.setDate(now.getDate() - (value * 7));
 } else if (pattern.source.includes('month')) {
 now.setMonth(now.getMonth() - value);
 } else if (pattern.source.includes('year')) {
 now.setFullYear(now.getFullYear() - value);
 }

 uploadedAt = now.toISOString();
 break;
 }
 }

 // Enhanced thumbnail selection (prefer higher quality)
 let thumbnailUrl = '/default-thumbnail.jpg';
 if (metaTags?.['og:image']) {
 thumbnailUrl = metaTags['og: image']
 } else if (videoObject?.thumbnailurl) {
 thumbnailUrl = videoObject.thumbnailurl;
 } else if (thumbnail?.src) {
 thumbnailUrl = thumbnail.src;
 } else {
 // Use YouTube thumbnail API for better quality
 thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
 }

 // Enhanced title extraction
 const title = videoObject?.name ||
 metaTags?.['og:title'] ||
 item.title.replace(/- YouTube$/, '').trim() ||
 'YouTube Video';

 // Enhanced description extraction
 const description = videoObject?.description ||
 metaTags?.['og:description'] ||
 item.snippet ||
 'No description available';

 // Extract tags from various sources
 const tags: string[] = [];
 if (metaTags?.['og:video:tag']) {
 tags.push(...metaTags['og:video:tag'].split(',').map((tag) => tag.trim()))
 }

 // Enhanced category detection
 let category = 'General';
 const categoryPatterns = [
 { pattern: /music|song|album|artist|band/i, category: 'Music' },
 { pattern: /game|gaming|gameplay|let's play/i, category: 'Gaming' },
 { pattern: /tutorial|how to|learn|education/i, category: 'Education' },
 { pattern: /news|politics|current events/i, category: 'News' },
 { pattern: /comedy|funny|humor|laugh/i, category: 'Comedy' },
 { pattern: /tech|technology|review|unbox/i, category: 'Technology' },
 { pattern: /sport|football|basketball|soccer/i, category: 'Sports' },
 { pattern: /travel|vacation|adventure/i, category: 'Travel' },
 { pattern: /food|recipe|cooking|chef/i, category: 'Food' },
 { pattern: /movie|film|trailer|cinema/i, category: 'Movies' }];

 const combinedText = `${title} ${description} ${tags.join(' ')}`.toLowerCase();
 for (const { pattern, category: cat } of categoryPatterns) {
 if (pattern.test(combinedText)) {
 category = cat;
 break;
 }
 conditionalLogger.debug('Enhanced metadata extracted', {
 title: `${title.substring(0, 50)}...`,
 channelName,
 views,
 duration,
 category,
 tagsCount: tags.length,
 thumbnailUrl: `${thumbnailUrl.substring(0, 50)}...` }, 'YouTubeSearchService');

 conditionalLogger.debug('Enhanced Metadata Extraction completed', {
 videoId,
 title: title.substring(0, 50),
 channelName,
 channelAvatarUrl: `${channelAvatarUrl.substring(0, 50)}...`,
 views,
 viewCount,
 duration,
 category }, 'YouTubeSearchService');

 return {
 id: videoId,
 title,
 description,
 thumbnailUrl,
 videoUrl: item.link,
 duration,
 views,
 viewCount, // Include numeric view count for components that need it
 uploadedAt,
 channelId: videoObject?.channelid || `channel-${videoId}`,
 channelName,
 channelAvatarUrl,
 category,
 tags: tags.slice(0, 5), // Limit to 5 tags,
 likes: Math.floor(Math.random() * 10000),
 dislikes: Math.floor(Math.random() * 1000),
 likeCount: Math.floor(Math.random() * 10000),
 dislikeCount: Math.floor(Math.random() * 1000),
 commentCount: Math.floor(Math.random() * 5000),
 isLive: item.snippet.toLowerCase().includes('live') || item.title.toLowerCase().includes('live'),
 visibility: 'public' as const createdAt: uploadedAt,
 updatedAt: uploadedAt,
 publishedAt: uploadedAt };
 }

 /**
 * Generate search query based on current video context
 */
 private generateSearchQuery(currentVideo: Video): string {
 const queries = [];

 // Special handling for placeholder YouTube videos
 if (currentVideo.title === 'YouTube Video' && currentVideo.channelName === 'YouTube') {
 // For generic YouTube video placeholders, use popular/trending queries
 const fallbackQueries = [
 'popular videos today',
 'trending videos',
 'viral videos',
 'top videos this week',
 'most watched videos',
 'recommended videos',
 'youtube trending'];
 const selectedQuery = fallbackQueries[Math.floor(Math.random() * fallbackQueries.length)];
 return selectedQuery || 'popular videos';
 }

 // Use video title words (excluding common words)
 if (currentVideo.title && currentVideo.title !== 'YouTube Video') {
 const titleWords = currentVideo.title
 .toLowerCase()
 .split(/\s+/)
 .filter((word) =>
 word.length > 3 &&
 !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'end', 'few', 'got', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word),
 )
 .slice(0, 3); // Take first 3 meaningful words

 if (titleWords.length > 0) {
 queries.push(titleWords.join(' '));
 }
 // Use category
 if (currentVideo.category && currentVideo.category !== 'General') {
 queries.push(currentVideo.category.toLowerCase());
 }

 // Use tags
 if (currentVideo.tags && currentVideo.tags.length > 0) {
 const tag = currentVideo.tags[Math.floor(Math.random() * currentVideo.tags.length)];
 if (tag) {
 queries.push(tag.toLowerCase());
 }
 // Use channel name for similar content
 if (currentVideo.channelName && currentVideo.channelName !== 'Unknown Channel' && currentVideo.channelName !== 'YouTube') {
 queries.push(`"${currentVideo.channelName}"`);
 }

 // Return a random query or combination
 if (queries.length === 0) {
 return 'popular videos';
 }

 // Mix queries for better variety
 if (queries.length > 1 && Math.random() > 0.5) {
 return queries.slice(0, 2).join(' ');
 }

 const selectedQuery = queries[Math.floor(Math.random() * queries.length)];
 return selectedQuery || 'popular videos';
 }

 /**
 * Search for YouTube videos related to current video
 */
 async searchRelatedVideos(,
 currentVideo: Video,
 maxResults: number = 10,
 ): Promise<Video[]> {
 if (!this.apiKey || !this.engineId) {
 conditionalLogger.warn('Google Custom Search API credentials not configured', undefined, 'YouTubeSearchService');
 return [];
 }

 try {
 // Generate search query based on current video
 const query = this.generateSearchQuery(currentVideo);

 conditionalLogger.debug('Generated search query', { query }, 'YouTubeSearchService');
 conditionalLogger.debug('Video context for search', {
 title: currentVideo.title,
 category: currentVideo.category,
 tags: currentVideo.tags,
 channelName: currentVideo.channelName }, 'YouTubeSearchService');

 // Build search URL
 const searchUrl = new URL(this.baseUrl);
 searchUrl.searchParams.set('key', this.apiKey);
 searchUrl.searchParams.set('cx', this.engineId);
 searchUrl.searchParams.set('q', `${query} site:youtube.com`);
 searchUrl.searchParams.set('num', Math.min(maxResults, 10).toString());
 // Remove invalid parameters - Google Custom Search API v1 doesn't use these
 // searchUrl.searchParams.set('safe', 'moderate'); // Invalid parameter
 // searchUrl.searchParams.set('searchType', 'web'); // Invalid parameter

 conditionalLogger.debug('Searching YouTube with Custom Search API', { url: searchUrl.toString() }, 'YouTubeSearchService');

 const response = await (fetch)(searchUrl.toString());

 if (!response.ok) {
 const errorText = await response.text();
 const apiError = createApiError(
 `Google Custom Search API request failed: ${errorText}`,
 searchUrl.toString(),
 'GET',
 response.status,
 );
 conditionalLogger.apiError(searchUrl.toString(), apiError);
 return [];
 }

 const data: GoogleCustomSearchResponse = await response.json();

 if (data.error) {
 const apiError = createApiError(
 `Google Custom Search API error: ${data.error.message}`,
 searchUrl.toString(),
 'GET',
 data.error.code,
 { errors: data.error.errors },
 );
 conditionalLogger.apiError(searchUrl.toString(), apiError);
 return [];
 }

 if (!data.items || data.items.length === 0) {
 conditionalLogger.warn('No search results found for query', { query }, 'YouTubeSearchService');
 return [];
 }

 conditionalLogger.debug('Found raw search results', { count: data.items.length }, 'YouTubeSearchService');

 // Convert search results to Video objects
 const videos = data.items
 .filter((item) => {
 // Only include YouTube video URLs
 const isYouTubeVideo = item.link.includes('youtube.com/watch') || item.link.includes('youtu.be/');
 if (!isYouTubeVideo) {
 conditionalLogger.debug('Filtering out non-YouTube URL', { url: item.link }, 'YouTubeSearchService');
 }
 return isYouTubeVideo;
 })
 .map((item, index) => this.convertToVideo(item, index))
 .filter((video) => {
 // Exclude the current video from recommendations
 const isDifferent = video.id !== currentVideo.id &&
 !video.videoUrl.includes(currentVideo.id);
 if (!isDifferent) {
 conditionalLogger.debug('Filtering out current video', { title: video.title }, 'YouTubeSearchService');
 }
 return isDifferent;
 });

 conditionalLogger.debug('Final recommendation results', { count: videos.length }, 'YouTubeSearchService');
 if (videos.length > 0) {
 conditionalLogger.debug('Sample recommendations', {
 samples: videos.slice(0, 3).map((v) => ({ title: v.title, url: v.videoUrl })) }, 'YouTubeSearchService');
 }

 return videos;

 } catch (error) {
 const networkError = createNetworkError(
 `Failed to search for related videos: ${error instanceof Error ? error.message : 'Unknown error'}`,
 this.baseUrl,
 );
 conditionalLogger.error('Error searching for related videos', networkError, 'YouTubeSearchService');
 return [];
 }
 /**
 * Search for YouTube videos by specific query
 */
 async searchVideos(,
 query,
 maxResults: number = 10,
 ): Promise<Video[]> {
 if (!this.apiKey || !this.engineId) {
 conditionalLogger.warn('Google Custom Search API credentials not configured', undefined, 'YouTubeSearchService');
 return [];
 }

 try {
 const searchUrl = new URL(this.baseUrl);
 searchUrl.searchParams.set('key', this.apiKey);
 searchUrl.searchParams.set('cx', this.engineId);
 searchUrl.searchParams.set('q', `${query} site:youtube.com`);
 searchUrl.searchParams.set('num', Math.min(maxResults, 10).toString());
 // Remove invalid parameter
 // searchUrl.searchParams.set('safe', 'moderate'); // Invalid parameter

 const response = await (fetch)(searchUrl.toString());

 if (!response.ok) {
 throw new Error(`Search failed: ${response.status}`);
 }

 const data: GoogleCustomSearchResponse = await response.json();

 if (data.error) {
 throw new Error(`API Error: ${data.error.message}`);
 }

 if (!data.items) {
 return [];
 }

 return data.items
 .filter((item) => item.link.includes('youtube.com/watch') || item.link.includes('youtu.be/'))
 .map((item, index) => this.convertToVideo(item, index));

 } catch (error) {
 const networkError = createNetworkError(
 `Failed to search videos: ${error instanceof Error ? error.message : 'Unknown error'}`,
 this.baseUrl,
 );
 conditionalLogger.error('Error searching videos', networkError, 'YouTubeSearchService');
 return [];
 }
 /**
 * Get trending YouTube videos by category
 */
 async getTrendingVideos(
 category = 'popular',
 maxResults: number = 10,
 ): Promise<Video[]> {
 const trendingQueries = {
 music: 'trending music videos',
 gaming: 'trending gaming videos',
 tech: 'trending technology videos',
 news: 'trending news today',
 sports: 'trending sports videos',
 entertainment: 'trending entertainment videos',
 education: 'trending educational videos',
 popular: 'trending videos today' };

 const query = trendingQueries[category as keyof typeof trendingQueries] || trendingQueries.popular;
 return this.searchVideos(query, maxResults);
 }

 /**
 * Check if API is configured and available
 */
 isConfigured(): boolean {
 return !!(this.apiKey && this.engineId);
 }

 /**
 * Get API configuration status
 */
 getConfigStatus(): { configured: boolean; hasApiKey: boolean; hasEngineId: boolean } {
 return {
 configured: this.isConfigured(),
 hasApiKey: !!this.apiKey,
 hasEngineId: !!this.engineId };
 }
export const youtubeSearchService = new YouTubeSearchService();
export default youtubeSearchService;
