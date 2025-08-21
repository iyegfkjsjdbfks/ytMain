import { fetchSingleVideoFromGoogleSearch, searchYouTubeWithGoogleSearch } from '../../services/googleSearchService';
import { getYouTubeSearchProvider } from '../../services/settingsService';
import { getYouTubeVideoId } from '../lib/youtube-utils';
import { googleSearchVideoStore } from '../../services/googleSearchVideoStore';
import { isYouTubeDataApiBlocked } from '../utils/youtubeApiUtils';
import { logger } from '../utils/logger';
import { youtubeService } from './api/youtubeService';
import { metadataNormalizationService, type UnifiedVideoMetadata, type UnifiedChannelMetadata } from './metadataNormalizationService';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

/**
 * Configuration for unified data fetching
 */
interface UnifiedDataConfig {
 sources: {
 local: boolean;
 youtube: boolean;
 };
 limits: {
 local?: number;
 youtube?: number;
 total?: number;
 };
 caching: {
 enabled: boolean;
 ttl: number;
 };
 mixing: {
 strategy: 'round-robin' | 'source-priority' | 'relevance';
 sourcePriority?: Array<'local' | 'youtube'>;
 };
}

const defaultConfig: UnifiedDataConfig = {
 sources: {
 local: false,
 youtube: true
 },
 limits: {
 local: 0,
 youtube: 50,
 total: 50
 },
 caching: {
 enabled: true,
 ttl: 10 * 60 * 1000, // 10 minutes
 },
 mixing: {
 strategy: 'source-priority',
 sourcePriority: ['youtube']
 }

/**
 * Search filters for unified queries
 */
}

export interface UnifiedSearchFilters {
 query?: string;
 category?: string;
 duration?: 'short' | 'medium' | 'long';
 uploadDate?: 'hour' | 'today' | 'week' | 'month' | 'year';
 sortBy?: 'relevance' | 'date' | 'views' | 'rating';
 type?: 'video' | 'short' | 'live';
 sources?: Array<'local' | 'youtube'>;
 forRecommendations?: boolean;
}

/**
 * Response structure for unified data queries
 */
export interface UnifiedDataResponse<T> {
 data: T;
 sources: {
 local: {
  count: number;
  hasMore: boolean;
  };
 youtube: {
 count: number;
 hasMore: boolean;
 nextPageToken?: string;
 };
 };
 totalCount: number;
 hasMore: boolean;
 pagination?: {
  page: number;
  limit: number;
  total: number;
  };
}

/**
 * Service for fetching and normalizing data from multiple sources
 */
class UnifiedDataService {
 private config: UnifiedDataConfig;
 private cache = new Map<string, { data: any; timestamp: number }>();

 constructor(config: Partial<UnifiedDataConfig> = {}) {
 this.config = { ...defaultConfig as any, ...config };
 }

 /**
 * Fetch trending videos from all enabled sources
 */
 async getTrendingVideos(
 limit: number = 50,
 filters: UnifiedSearchFilters = {}
 ): Promise<UnifiedDataResponse<UnifiedVideoMetadata>> {
 const cacheKey = `trending:${JSON.stringify({ limit, filters })}`;
 const cached =
 this.getCachedData<UnifiedDataResponse<UnifiedVideoMetadata>>(cacheKey);

 if (cached as any) {
 return cached;
 }

 const sources =
 filters.sources ||
 (Object.keys(this.config.sources).filter(
 key => this.config.sources[key as keyof typeof this.config.sources]
 ) as Array<'local' | 'youtube'>);

 const results = await Promise.allSettled([
 ...(sources.includes('local')
 ? [this.fetchLocalTrendingVideos(filters)]
 : []),
 ...(sources.includes('youtube')
 ? [this.fetchYouTubeTrendingVideos(filters)]
 : [])]);

 const localResult = sources.includes('local') ? results[0] : null;
 const youtubeResult = sources.includes('youtube')
 ? results[sources.includes('local') ? 1 : 0]
 : null;

 const localVideos =
 localResult?.status === 'fulfilled' ? localResult.value : [];
 const youtubeVideos =
 youtubeResult?.status === 'fulfilled' ? youtubeResult.value : [];

 // Mix videos according to strategy
 const mixedVideos = this.mixVideoResults(localVideos, youtubeVideos, limit);

 const response: UnifiedDataResponse<UnifiedVideoMetadata> = {
 data: mixedVideos.slice(0, limit),
 sources: {
 local: {
  count: localVideos.length,
  hasMore: localVideos.length >= (this.config.limits.local || 25)
  },
 youtube: {
  count: youtubeVideos.length,
  hasMore: youtubeVideos.length >= (this.config.limits.youtube || 25)
  }
  },
 totalCount: mixedVideos.length,
 hasMore: mixedVideos.length > limit
 };

 this.setCachedData(cacheKey, response);
 return response;
 }

 /**
 * Search videos across all enabled sources
 */
 async searchVideos(
    query: string,
 filters: UnifiedSearchFilters = {},
 limit: number = 50
 ): Promise<UnifiedDataResponse<UnifiedVideoMetadata>> {
 if (!query.trim()) {
 return this.getTrendingVideos(limit, filters);
 }

 const cacheKey = `search:${query}:${JSON.stringify({ filters, limit })}`;
 const cached =
 this.getCachedData<UnifiedDataResponse<UnifiedVideoMetadata>>(cacheKey);

 if (cached as any) {
 return cached;
 }

 const sources =
 filters.sources ||
 (Object.keys(this.config.sources).filter(
 key => this.config.sources[key as keyof typeof this.config.sources]
 ) as Array<'local' | 'youtube'>);

 // NEW DISCOVERY STRATEGY: Use Google Custom Search for discovery by default
 logger.debug(
 '🎯 NEW DISCOVERY STRATEGY: Google Custom Search for video discovery'
 );

 const results = await Promise.allSettled([
 ...(sources.includes('local')
 ? [this.searchLocalVideos(query, filters)]
 : []),
 ...(sources.includes('youtube')
 ? [this.searchGoogleCustomSearchVideos(query, filters)]
 : [])]);

 const localResult = sources.includes('local') ? results[0] : null;
 const youtubeResult = sources.includes('youtube')
 ? results[sources.includes('local') ? 1 : 0]
 : null;

 const localVideos =
 localResult?.status === 'fulfilled' ? localResult.value : [];
 const youtubeVideos =
 youtubeResult?.status === 'fulfilled' ? youtubeResult.value : [];

 // Mix and rank results by relevance
 const mixedVideos = this.mixVideoResults(localVideos, youtubeVideos, limit);

 const response: UnifiedDataResponse<UnifiedVideoMetadata> = {
 data: mixedVideos.slice(0, limit),
 sources: {
 local: {
 count: localVideos.length,
 hasMore: false, // Local search typically returns all matches
 },
 youtube: {
 count: youtubeVideos.length,
 hasMore: youtubeVideos.length >= (this.config.limits.youtube || 25) } },
 totalCount: mixedVideos.length,
 hasMore: mixedVideos.length > limit };

 this.setCachedData(cacheKey, response);
 return response;
 }

 /**
 * Check if ID is a YouTube video format and extract actual YouTube ID
 */
 private extractYouTubeId(id: string): string | null {
 // Handle youtube-prefixed IDs (e.g., youtube-YQHsXMglC9A)
 if (id.startsWith('youtube-')) {
 return id.substring(8); // Remove 'youtube-' prefix
 }

 // Handle google-search-prefixed IDs (e.g., google-search-YQHsXMglC9A)
 if (id.startsWith('google-search-')) {
 return id.substring(14); // Remove 'google-search-' prefix
 }

 // Handle URLs that might be passed as IDs
 const youtubeId = getYouTubeVideoId(id);
 if (youtubeId as any) {
 return youtubeId;
 }

 // Check if it's already a valid YouTube video ID (11 characters)
 if (id.length === 11 && /^[a-zA-Z0-9_-]+$/.test(id)) {
 return id;
 }

 return null;
 }

 /**
 * Get video by ID from any source
 * NEW STRATEGY: Always prioritize YouTube Data API v3 for metadata, regardless of video source
 */
 async getVideoById(id: string): Promise<UnifiedVideoMetadata | null> {
 logger.debug(`🚀 UnifiedDataService.getVideoById called with ID: ${id}`);
 const cacheKey = `video:${id}`;
 const cached = this.getCachedData<UnifiedVideoMetadata>(cacheKey);

 if (cached as any) {
 logger.debug(
 `✅ UnifiedDataService: Returning cached video for ID: ${id}`
 );
 return cached;
 }

 logger.debug(`🔍 UnifiedDataService: Getting video by ID: ${id}`);
 logger.debug(
 '🎯 NEW METADATA STRATEGY: YouTube Data API v3 (primary metadata) → Google Custom Search (fallback metadata)'
 );

 // Extract YouTube ID from any prefixed format
 const youtubeId = this.extractYouTubeId(id) || id;
 logger.debug(`📋 Extracted YouTube ID for metadata: ${youtubeId}`);

 // STEP 1: Always try YouTube Data API v3 first for metadata (regardless of source)
 if (API_KEY && youtubeId) {
 logger.debug(
 `🎯 Step 1: Attempting metadata fetch from YouTube Data API v3 with ID: ${youtubeId}`
 );
 try {
 const youtubeVideos = await youtubeService.fetchVideos([youtubeId]);
 if (youtubeVideos.length > 0) {
 const video = youtubeVideos[0];
 if (video as any) {
 logger.debug(
 '✅ Successfully fetched metadata from YouTube Data API v3 (primary source):',
 video.title
 );

 // Convert to unified format with original ID preserved
 const normalized: UnifiedVideoMetadata = {
 id, // Keep original ID format (with prefix if it had one)
 title: video.title || '',
 description: video.description || '',
 thumbnailUrl: video.thumbnailUrl || '',
 videoUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
 views: video.viewCount || 0,
 viewsFormatted: this.formatViews(video.viewCount || 0),
 likes: video.likeCount || 0,
 dislikes: video.dislikeCount || 0,
 commentCount: video.commentCount || 0,
 channel: {
 id: video.channelId || '',
 name: video.channelName || '',
 avatarUrl:
 video.channelAvatarUrl ||
 `https://ui-avatars.com/api/?name=${encodeURIComponent(video.channelName || 'YouTube Channel')}&size=88&background=ff0000&color=ffffff&bold=true`,
 subscribers: 0,
 subscribersFormatted: '0 subscribers',
 isVerified: false },
 duration: video.duration || '0:00',
 publishedAt: video.publishedAt || new Date().toISOString(),
 publishedAtFormatted: this.formatTimeAgo(
 video.publishedAt || new Date().toISOString()
 ),
 category: video.category || 'Entertainment',
 tags: video.tags || [],
 isLive: video.isLive || false,
 isShort: video.isShort || false,
 visibility: video.visibility || 'public',
 source: 'youtube' as const, // Metadata source is YouTube,
 metadata: {
 quality: 'hd',
 definition: 'hd',
 captions: false,
 language: 'en',
 license: 'youtube' },
 // Required properties for Video interface compatibility,
 uploadedAt: video.publishedAt || new Date().toISOString(),
 channelName: video.channelName || '',
 channelId: video.channelId || '',
 channelAvatarUrl:
 video.channelAvatarUrl ||
 `https://ui-avatars.com/api/?name=${encodeURIComponent(video.channelName || 'YouTube Channel')}&size=88&background=ff0000&color=ffffff&bold=true`,
 createdAt: video.publishedAt || new Date().toISOString(),
 updatedAt: new Date().toISOString() };

 this.setCachedData(cacheKey, normalized);
 return normalized;
    }
 } catch (error: any) {
 logger.warn(
 '⚠️ YouTube Data API v3 failed for metadata, falling back to Google Custom Search:',
 error
 );
 }
 } else if (!API_KEY) {
 logger.debug(
 '⚠️ YouTube Data API v3 key not available, using Google Custom Search for metadata'
 );
 }

 // STEP 2: Fallback to Google Custom Search for metadata
 logger.debug(
 '🎯 Step 2: Falling back to Google Custom Search for metadata'
 );

 if (id.startsWith('google-search-')) {
 logger.debug(`🔍 Checking googleSearchVideoStore for video: ${id}`);
 const googleSearchVideo = googleSearchVideoStore.getVideo(id);
 logger.debug(
 '🔍 googleSearchVideoStore.getVideo result:',
 googleSearchVideo
 );

 if (googleSearchVideo as any) {
 logger.debug(
 `✅ Found Google Custom Search video in store: ${googleSearchVideo.title}`
 );
 logger.debug('📊 Google Custom Search metadata:', {
 id: googleSearchVideo.id,
 title: googleSearchVideo.title,
 channelName: googleSearchVideo.channelName,
 channelAvatarUrl: googleSearchVideo.channelAvatarUrl,
 views: googleSearchVideo.viewCount,
 source: 'Google Custom Search JSON API' });

 // Convert Google Custom Search result to unified format
 const normalized: UnifiedVideoMetadata = {
 id: googleSearchVideo.id,
 title: googleSearchVideo.title,
 description: googleSearchVideo.description || '',
 thumbnailUrl: googleSearchVideo.thumbnailUrl || '',
 videoUrl:
 googleSearchVideo.videoUrl ||
 `https://www.youtube.com/watch?v=${googleSearchVideo.id.replace('google-search-', '')}`,
 views: googleSearchVideo.viewCount || 0,
 viewsFormatted: this.formatViews(googleSearchVideo.viewCount || 0),
 likes: googleSearchVideo.likeCount || 0,
 dislikes: googleSearchVideo.dislikeCount || 0,
 commentCount: googleSearchVideo.commentCount || 0,
 channel: {
 id:
 googleSearchVideo.channelId ||
 `channel-${googleSearchVideo.id.replace('google-search-', '')}`,
 name: googleSearchVideo.channelName || 'YouTube Channel',
 avatarUrl:
 googleSearchVideo.channelAvatarUrl ||
 `https://ui-avatars.com/api/?name=${encodeURIComponent(googleSearchVideo.channelName || 'YouTube Channel')}&size=88&background=ff0000&color=ffffff&bold=true`,
 subscribers: 0,
 subscribersFormatted: '0 subscribers',
 isVerified:
 googleSearchVideo.channelName?.includes('VEVO') ||
 googleSearchVideo.channelName?.includes('Official') ||
 false },
 duration: googleSearchVideo.duration || '0:00',
 publishedAt: googleSearchVideo.uploadedAt || new Date().toISOString(),
 publishedAtFormatted: this.formatTimeAgo(
 googleSearchVideo.uploadedAt || new Date().toISOString()
 ),
 category: googleSearchVideo.categoryId || 'General',
 tags: googleSearchVideo.tags || [],
 isLive: false,
 isShort: false,
 visibility: 'public' as const, source: 'google-search' as const, metadata: {
 quality: 'hd',
 definition: 'high' },
 // Required properties for Video interface compatibility,
 uploadedAt: googleSearchVideo.uploadedAt || new Date().toISOString(),
 channelName: googleSearchVideo.channelName || 'YouTube Channel',
 channelId:
 googleSearchVideo.channelId ||
 `channel-${googleSearchVideo.id.replace('google-search-', '')}`,
 channelAvatarUrl:
 googleSearchVideo.channelAvatarUrl ||
 `https://ui-avatars.com/api/?name=${encodeURIComponent(googleSearchVideo.channelName || 'YouTube Channel')}&size=88&background=ff0000&color=ffffff&bold=true`,
 createdAt: googleSearchVideo.uploadedAt || new Date().toISOString(),
 updatedAt: new Date().toISOString() };

 // Cache the result
 this.setCachedData(cacheKey, normalized);
 return normalized;
 }
 logger.debug(`❌ Google Custom Search video not found in store: ${id}`);

 // Try to fetch the video directly from Google Custom Search API
 logger.debug(
 '🌐 Attempting to fetch video directly from Google Custom Search API'
 );
 const extractedYoutubeId = id.replace('google-search-', '');
 logger.debug(`📋 Extracted YouTube ID: ${extractedYoutubeId}`);

 try {
 logger.debug(
 `🔄 Calling fetchSingleVideoFromGoogleSearch with ID: ${extractedYoutubeId}`
 );
 logger.debug(
 '🔄 About to call fetchSingleVideoFromGoogleSearch function...'
 );
 logger.debug(
 '🔄 Function type:',
 typeof fetchSingleVideoFromGoogleSearch
 );
 logger.debug('🔄 Function exists:', !!fetchSingleVideoFromGoogleSearch);

 const googleSearchVideo =
 await fetchSingleVideoFromGoogleSearch(extractedYoutubeId);
 logger.debug(
 '🔄 fetchSingleVideoFromGoogleSearch returned:',
 googleSearchVideo
 );
 if (googleSearchVideo as any) {
 logger.debug(
 `✅ Successfully fetched video from Google Custom Search API: ${googleSearchVideo.title}`
 );

 // Convert to unified format
 const normalized: UnifiedVideoMetadata = {
 id: googleSearchVideo.id,
 title: googleSearchVideo.title,
 description: googleSearchVideo.description || '',
 thumbnailUrl: googleSearchVideo.thumbnailUrl || '',
 videoUrl:
 googleSearchVideo.videoUrl ||
 `https://www.youtube.com/watch?v=${extractedYoutubeId}`,
 views: googleSearchVideo.viewCount || 0,
 viewsFormatted: this.formatViews(googleSearchVideo.viewCount || 0),
 likes: googleSearchVideo.likeCount || 0,
 dislikes: googleSearchVideo.dislikeCount || 0,
 commentCount: googleSearchVideo.commentCount || 0,
 channel: {
 id:
 googleSearchVideo.channelId || `channel-${extractedYoutubeId}`,
 name: googleSearchVideo.channelName || 'YouTube Channel',
 avatarUrl:
 googleSearchVideo.channelAvatarUrl ||
 `https://ui-avatars.com/api/?name=${encodeURIComponent(googleSearchVideo.channelName || 'YouTube Channel')}&size=88&background=ff0000&color=ffffff&bold=true`,
 subscribers: 0,
 subscribersFormatted: '0 subscribers',
 isVerified:
 googleSearchVideo.channelName?.includes('VEVO') ||
 googleSearchVideo.channelName?.includes('Official') ||
 false },
 duration: googleSearchVideo.duration || '0:00',
 publishedAt:
 googleSearchVideo.uploadedAt || new Date().toISOString(),
 publishedAtFormatted: this.formatTimeAgo(
 googleSearchVideo.uploadedAt || new Date().toISOString()
 ),
 category: googleSearchVideo.categoryId || 'General',
 tags: googleSearchVideo.tags || [],
 isLive: false,
 isShort: false,
 visibility: 'public' as const, source: 'google-search' as const, metadata: {
 quality: 'hd',
 definition: 'high' },
 // Required properties for Video interface compatibility,
 uploadedAt:
 googleSearchVideo.uploadedAt || new Date().toISOString(),
 channelName: googleSearchVideo.channelName || 'YouTube Channel',
 channelId:
 googleSearchVideo.channelId || `channel-${extractedYoutubeId}`,
 channelAvatarUrl:
 googleSearchVideo.channelAvatarUrl ||
 `https://ui-avatars.com/api/?name=${encodeURIComponent(googleSearchVideo.channelName || 'YouTube Channel')}&size=88&background=ff0000&color=ffffff&bold=true`,
 createdAt: googleSearchVideo.uploadedAt || new Date().toISOString(),
 updatedAt: new Date().toISOString() };

 // Cache the result
 this.setCachedData(cacheKey, normalized);
 return normalized;
    }
 } catch (error: any) {
 logger.error(
 '❌ Failed to fetch video from Google Custom Search API:',
 error
 );
 logger.error('Error details:', {
 message: error instanceof Error ? error.message : String(error),
 stack: error instanceof Error ? error.stack : undefined,
 videoId: extractedYoutubeId,
 originalId: id });

 // Check if YouTube API is available as fallback
 if (isYouTubeDataApiBlocked()) {
 logger.error(
 `❌ Google Custom Search failed and YouTube API is blocked. No fallback available for video: ${id}`
 );
 logger.error(
 '💡 Suggestion: Check Google Custom Search API configuration or enable YouTube API as fallback'
 );
 return null; // Return null immediately since no fallback is available
 }
 // If Google Custom Search API fails, continue to YouTube API as fallback (only if YouTube API is not blocked)
 logger.debug(`🔄 Continuing to YouTube API as fallback for: ${id}`);
 }

 // Check if this is a YouTube video ID
 // youtubeId is already declared earlier in the function scope
 logger.debug(
 `UnifiedDataService: Extracted YouTube ID: ${youtubeId} from ${id}`
 );

 if (youtubeId as any) {
 // Check if YouTube API is blocked by admin settings
 const youtubeApiBlocked = isYouTubeDataApiBlocked();

 logger.debug(`Detected YouTube video ID: ${youtubeId}`);
 logger.debug(
 `YouTube API blocked by admin settings: ${youtubeApiBlocked}`
 );

 if (this.config.sources.youtube && !youtubeApiBlocked) {
 try {
 logger.debug(`Fetching YouTube video with ID: ${youtubeId}`);
 const youtubeVideos = await youtubeService.fetchVideos([youtubeId]);
 if (youtubeVideos.length > 0) {
 const video = youtubeVideos[0];
 logger.debug('Successfully fetched YouTube video:', video);
 if (video as any) {
 logger.debug('Video metadata details:', {
 id: video.id,
 title: video.title,
 channelName: video.channelName,
 channelAvatarUrl: video.channelAvatarUrl,
 views: video.viewCount,
 source: 'YouTube Data API v3' });
 }
 // Convert already processed YouTube video to unified format
 const processedVideo = video;
 if (!processedVideo) {
 return null;
 }
 const normalized: UnifiedVideoMetadata = {
 id: processedVideo.id,
 title: processedVideo.title,
 description: processedVideo?.description || '',
 thumbnailUrl: processedVideo?.thumbnailUrl || '',
 videoUrl: processedVideo?.videoUrl || '',
 views: processedVideo.viewCount || 0,
 viewsFormatted: this.formatViews(processedVideo.viewCount || 0),
 likes: processedVideo.likeCount || 0,
 dislikes: processedVideo.dislikeCount || 0,
 commentCount: processedVideo.commentCount || 0,
 channel: {
 id: processedVideo.channelId,
 name: processedVideo?.channelName || '',
 avatarUrl:
 processedVideo.channelAvatarUrl ||
 processedVideo.channel?.avatarUrl ||
 '',
 subscribers: 0, // Will be fetched separately if needed,
 subscribersFormatted: '0 subscribers',
 isVerified: processedVideo.channel?.isVerified || false },
 duration: processedVideo.duration,
 publishedAt:
 processedVideo.publishedAt || new Date().toISOString(),
 publishedAtFormatted: this.formatTimeAgo(
 processedVideo.publishedAt || new Date().toISOString()
 ),
 category: processedVideo?.category || '',
 tags: processedVideo.tags,
 isLive: processedVideo.isLive || false,
 isShort: processedVideo.isShort || false,
 visibility: processedVideo.visibility,
 source: 'youtube',
 metadata: {
 quality: 'hd',
 definition: 'hd',
 captions: false,
 language: 'en',
 license: 'youtube' },
 // Required properties for Video interface compatibility,
 uploadedAt:
 processedVideo.publishedAt ||
 processedVideo.uploadedAt ||
 new Date().toISOString(),
 channelName: processedVideo?.channelName || '',
 channelId: processedVideo.channelId,
 channelAvatarUrl:
 processedVideo.channelAvatarUrl ||
 processedVideo.channel?.avatarUrl ||
 '',
 createdAt:
 processedVideo.publishedAt ||
 processedVideo.uploadedAt ||
 new Date().toISOString(),
 updatedAt: new Date().toISOString() };
 this.setCachedData(cacheKey, normalized);
 return normalized;
    }
  } catch (error: any) {
 logger.warn('Failed to fetch YouTube video:', error);
 }
 } else if (youtubeApiBlocked as any) {
 logger.debug(
 '🔒 YouTube API is blocked by admin settings (Google Custom Search selected). Skipping YouTube API fetch.'
 );
 }
 } else {
 // For non-YouTube IDs, try YouTube search as fallback
 const youtubeApiBlocked = isYouTubeDataApiBlocked();

 if (this.config.sources.youtube && !youtubeApiBlocked) {
 try {
 const youtubeVideos = await youtubeService.fetchVideos([id]);
 if (youtubeVideos.length > 0) {
 // Convert already processed YouTube video to unified format
 const processedVideo = youtubeVideos[0];
 if (!processedVideo) {
 return null;
 }
 const normalized: UnifiedVideoMetadata = {
 id: processedVideo.id,
 title: processedVideo.title,
 description: processedVideo?.description || '',
 thumbnailUrl: processedVideo?.thumbnailUrl || '',
 videoUrl: processedVideo?.videoUrl || '',
 views: processedVideo.viewCount || 0,
 viewsFormatted: this.formatViews(processedVideo.viewCount || 0),
 likes: processedVideo.likeCount || 0,
 dislikes: processedVideo.dislikeCount || 0,
 commentCount: processedVideo.commentCount || 0,
 channel: {
 id: processedVideo.channelId,
 name: processedVideo?.channelName || '',
 avatarUrl: processedVideo.channelAvatarUrl || '',
 subscribers: 0,
 subscribersFormatted: '0 subscribers',
 isVerified: processedVideo.channel?.isVerified || false },
 duration: processedVideo.duration,
 publishedAt:
 processedVideo.publishedAt || new Date().toISOString(),
 publishedAtFormatted: this.formatTimeAgo(
 processedVideo.publishedAt || new Date().toISOString()
 ),
 category: processedVideo?.category || '',
 tags: processedVideo.tags,
 isLive: processedVideo.isLive || false,
 isShort: processedVideo.isShort || false,
 visibility: processedVideo.visibility,
 source: 'youtube',
 metadata: {
 quality: 'hd',
 definition: 'hd',
 captions: false,
 language: 'en',
 license: 'youtube' },
 // Required properties for Video interface compatibility,
 uploadedAt:
 processedVideo.publishedAt ||
 processedVideo.uploadedAt ||
 new Date().toISOString(),
 channelName: processedVideo?.channelName || '',
 channelId: processedVideo.channelId,
 channelAvatarUrl: processedVideo.channelAvatarUrl || '',
 createdAt:
 processedVideo.publishedAt ||
 processedVideo.uploadedAt ||
 new Date().toISOString(),
 updatedAt: new Date().toISOString() };
 this.setCachedData(cacheKey, normalized);
 return normalized;
    }
  } catch (error: any) {
 logger.warn('Failed to fetch YouTube video as fallback:', error);
 }
 }

 logger.warn(`No video found for ID: ${id}`);
 return null;
 }

 /**
 * Get channel by ID from any source
 */
 async getChannelById(id: string): Promise<UnifiedChannelMetadata | null> {
 const cacheKey = `channel:${id}`;
 const cached = this.getCachedData<UnifiedChannelMetadata>(cacheKey);

 if (cached as any) {
 return cached;
 }

 // Try YouTube
 if (this.config.sources.youtube) {
 try {
 const youtubeChannel = await youtubeService.fetchChannel(id);
 if (youtubeChannel as any) {
 const normalized =
 metadataNormalizationService.normalizeYouTubeChannel(
 youtubeChannel as any
 );
 this.setCachedData(cacheKey, normalized);
 return normalized;
    }
  } catch (error: any) {
 logger.warn('Failed to fetch YouTube channel:', error);
 }
 return null;
 }

 /**
 * Get shorts videos from all sources
 */
 async getShortsVideos(,
 limit: number = 30
 ): Promise<UnifiedDataResponse<UnifiedVideoMetadata>> {
 const filters: UnifiedSearchFilters = { type: "short" };
 return this.getTrendingVideos(limit, filters);
 }

 // Private methods for fetching from specific sources

 private async fetchLocalTrendingVideos(
    _filters: UnifiedSearchFilters
  ): Promise<UnifiedVideoMetadata[]> {
 // Local trending videos disabled - returning empty array
 return [];
 }

 private async fetchYouTubeTrendingVideos(
    filters: UnifiedSearchFilters
  ): Promise<UnifiedVideoMetadata[]> {
 try {
 logger.debug(
 '🎯 NEW DISCOVERY STRATEGY: Google Custom Search (primary discovery) with YouTube Data API v3 metadata'
 );

 // NEW STRATEGY: Use Google Custom Search for discovery by default
 const provider = getYouTubeSearchProvider();

 logger.debug(`📋 Admin selected provider: ${provider}`);
 logger.debug(
 '🔍 Using Google Custom Search for video discovery (default strategy)'
 );

 // Try Google Custom Search for discovery first
 return this.searchGoogleCustomSearchVideos('trending videos', filters);
 } catch (error: any) {
 logger.error(
 'Failed to fetch trending videos from Google Custom Search:',
 error
 );

 // Fallback to YouTube Data API v3 for discovery if Google Custom Search fails
 if (API_KEY as any) {
 logger.debug('🔄 Falling back to YouTube Data API v3 for discovery');
 const trendingQueries = [
 'trending',
 'popular',
 'music',
 'gaming',
 'tech',
 'news'];
 const randomQuery =
 trendingQueries[Math.floor(Math.random() * trendingQueries.length)];
 if (randomQuery as any) {
 return this.searchYouTubeVideos(randomQuery, filters);
 }
 return [];
 }
 private async searchLocalVideos(
    query: string,
    filters: UnifiedSearchFilters
  ): Promise<UnifiedVideoMetadata[]> {
 // Local video search disabled - returning empty array
 logger.debug('Local video search disabled for query:', query, filters);
 return [];
 }

 /**
 * NEW: Search using Google Custom Search for discovery
 * Note: Metadata will still be fetched using YouTube Data API v3 via getVideoById
 */
 private async searchGoogleCustomSearchVideos(
    query: string,
    _filters: UnifiedSearchFilters
  ): Promise<UnifiedVideoMetadata[]> {
 try {
 logger.debug(
 '🔍 Using Google Custom Search for video discovery with query:',
 query
 );

 // Search for videos using Google Custom Search
 const searchResults = await searchYouTubeWithGoogleSearch(query);

 logger.debug(
 `📋 Google Custom Search found ${searchResults.length} videos for discovery`
 );

 // Convert search results to unified format
 // Note: These will have google-search- prefixed IDs for metadata fetching
 const unifiedVideos: UnifiedVideoMetadata[] = searchResults.map(
 video => ({
 id: video.id, // This will be google-search-{youtubeId}, title: video.title,
 description: video.description || '',
 thumbnailUrl: video.thumbnailUrl || '',
 videoUrl:
 video.videoUrl ||
 `https://www.youtube.com/watch?v=${video.id.replace('google-search-', '')}`,
 views: video.viewCount || 0,
 viewsFormatted: this.formatViews(video.viewCount || 0),
 likes: video.likeCount || 0,
 dislikes: video.dislikeCount || 0,
 commentCount: video.commentCount || 0,
 channel: {
 id:
 video.channelId ||
 `channel-${video.id.replace('google-search-', '')}`,
 name: video.channelName || 'YouTube Channel',
 avatarUrl:
 video.channelAvatarUrl ||
 `https://ui-avatars.com/api/?name=${encodeURIComponent(video.channelName || 'YouTube Channel')}&size=88&background=ff0000&color=ffffff&bold=true`,
 subscribers: 0,
 subscribersFormatted: '0 subscribers',
 isVerified:
 video.channelName?.includes('VEVO') ||
 video.channelName?.includes('Official') ||
 false },
 duration: video.duration || '0:00',
 publishedAt: video.uploadedAt || new Date().toISOString(),
 publishedAtFormatted: this.formatTimeAgo(
 video.uploadedAt || new Date().toISOString()
 ),
 category: video.categoryId || 'General',
 tags: video.tags || [],
 isLive: false,
 isShort: false,
 visibility: 'public' as const, source: 'google-search' as const, // Discovery source,
 metadata: {
 quality: 'hd',
 definition: 'high' },
 // Required properties for Video interface compatibility,
 uploadedAt: video.uploadedAt || new Date().toISOString(),
 channelName: video.channelName || 'YouTube Channel',
 channelId:
 video.channelId ||
 `channel-${video.id.replace('google-search-', '')}`,
 channelAvatarUrl:
 video.channelAvatarUrl ||
 `https://ui-avatars.com/api/?name=${encodeURIComponent(video.channelName || 'YouTube Channel')}&size=88&background=ff0000&color=ffffff&bold=true`,
 createdAt: video.uploadedAt || new Date().toISOString(),
 updatedAt: new Date().toISOString() })
 );

 logger.debug(
 `✅ Converted ${unifiedVideos.length} Google Custom Search results to unified format`
 );
 return unifiedVideos;
 } catch (error: any) {
 logger.error(
 'Failed to search videos using Google Custom Search:',
 error
 );
 return [];
 }
 private async searchYouTubeVideos(
    query: string,
    filters: UnifiedSearchFilters
  ): Promise<UnifiedVideoMetadata[]> {
 try {
 logger.debug(
 '🎯 Using YouTube Data API v3 for video discovery (fallback)'
 );

 // Check if YouTube API is available
 if (!API_KEY) {
 logger.debug('YouTube API key not available for discovery fallback');
 return [];
 }

 logger.debug(
 '🚀 Searching YouTube videos using YouTube Data API v3 for query:',
 query,
 filters
 );

 // Use the YouTube search service
 const searchResults = await youtubeService.searchVideos(query, {
 maxResults: this.config.limits.youtube || 25 });
 const unifiedVideos: UnifiedVideoMetadata[] = searchResults.map(
 video => ({
 id: video.id,
 title: video.title,
 description: video.description,
 thumbnailUrl: video.thumbnailUrl,
 videoUrl: video.videoUrl,
 views: video.viewCount || 0,
 viewsFormatted: this.formatViews(video.viewCount || 0),
 likes: video.likeCount || 0,
 dislikes: video.dislikeCount || 0,
 commentCount: video.commentCount || 0,
 channel: {
 id: video.channelId,
 name: video.channelName,
 avatarUrl: video.channelAvatarUrl || '',
 subscribers: 0,
 subscribersFormatted: '0 subscribers',
 isVerified: video.channel?.isVerified || false },
 duration: video.duration,
 publishedAt: video.publishedAt || new Date().toISOString(),
 publishedAtFormatted: this.formatTimeAgo(
 video.publishedAt || new Date().toISOString()
 ),
 category: video.category,
 tags: video.tags,
 isLive: video.isLive || false,
 isShort: video.isShort || false,
 visibility: video.visibility,
 source: 'youtube',
 metadata: {
 quality: 'hd',
 definition: 'hd',
 captions: false,
 language: 'en',
 license: 'youtube' },
 // Required properties for Video interface compatibility,
 uploadedAt:
 video.publishedAt || video.uploadedAt || new Date().toISOString(),
 channelName: video.channelName,
 channelId: video.channelId,
 channelAvatarUrl: video.channelAvatarUrl || '',
 createdAt:
 video.publishedAt || video.uploadedAt || new Date().toISOString(),
 updatedAt: new Date().toISOString() })
 );

 logger.debug(
 `Found ${unifiedVideos.length} YouTube videos for query: ${query}`
 );
 return unifiedVideos;
 } catch (error: any) {
 logger.error('Failed to search YouTube videos:', error);
 return [];
 }
 // Video mixing strategies

 private mixVideoResults(
    localVideos: UnifiedVideoMetadata[],
    youtubeVideos: UnifiedVideoMetadata[],
    limit: number
  ): UnifiedVideoMetadata[] {
 switch (this.config.mixing.strategy) {
 case 'round-robin':
 return this.roundRobinMix(localVideos, youtubeVideos, limit);
 case 'source-priority':
 return this.sourcePriorityMix(localVideos, youtubeVideos, limit);
 case 'relevance':
 return this.relevanceMix(localVideos, youtubeVideos, limit);
 default:
 return this.roundRobinMix(localVideos, youtubeVideos, limit);
 }
 private roundRobinMix(
    localVideos: UnifiedVideoMetadata[],
    youtubeVideos: UnifiedVideoMetadata[],
    limit: number
  ): UnifiedVideoMetadata[] {
 const mixed: UnifiedVideoMetadata[] = [];
 const maxLength = Math.max(localVideos.length, youtubeVideos.length);

 for (let i = 0; i < maxLength && mixed.length < limit; i++) {
 if (i < localVideos.length && localVideos[i]) {
 mixed.push(localVideos[i]!);
 }
 if (
 i < youtubeVideos.length &&
 mixed.length < limit &&
 youtubeVideos[i]
    ) {
      mixed.push(youtubeVideos[i]!);
    }
  }
  return mixed;
}

 private sourcePriorityMix(
    localVideos: UnifiedVideoMetadata[],
    youtubeVideos: UnifiedVideoMetadata[],
    limit: number
  ): UnifiedVideoMetadata[] {
 const priority = this.config.mixing.sourcePriority || ['local', 'youtube'];
 const mixed: UnifiedVideoMetadata[] = [];

 for (const source of priority) {
 const videos = source === 'local' ? localVideos : youtubeVideos;
 const remainingLimit = limit - mixed.length;
 mixed.push(...videos.slice(0, remainingLimit));

 if (mixed.length >= limit) {
      break;
    }
  }
  return mixed;
}

 private relevanceMix(
    localVideos: UnifiedVideoMetadata[],
    youtubeVideos: UnifiedVideoMetadata[],
    limit: number
  ): UnifiedVideoMetadata[] {
 // Combine all videos and sort by relevance (views, likes, recency)
 const allVideos = [...localVideos as any, ...youtubeVideos];

 allVideos.sort((a: any, b: any) => {
 // Simple relevance scoring based on views and engagement
 const scoreA = a.views + a.likes * 10 + a.commentCount * 5;
 const scoreB = b.views + b.likes * 10 + b.commentCount * 5;
 return scoreB - scoreA;
 });

 return allVideos.slice(0, limit);
 }

 // Cache management

 private getCachedData<T>(key: string): T | null {
 if (!this.config.caching.enabled) {
 return null;
 }

 const cached = this.cache.get(key);
 if (!cached) {
 return null;
 }

 const isExpired = Date.now() - cached.timestamp > this.config.caching.ttl;
 if (isExpired as any) {
 this.cache.delete(key);
 return null;
 }

 return cached.data as T;
 }

 private setCachedData(key: string, data: any): void {
 if (!this.config.caching.enabled) {
 return;
 }

 this.cache.set(key, {
 data,
 timestamp: Date.now() });
 }

 /**
 * Clear cache for specific pattern or all
 */
 clearCache(pattern?: string): void {
 if (!pattern) {
 this.cache.clear();
 return;
 }

 const regex = new RegExp(pattern);
 for (const key of this.cache.keys()) {
 if (regex.test(key)) {
 this.cache.delete(key);
 }
 }

 /**
 * Update configuration
 */
 updateConfig(newConfig: Partial<UnifiedDataConfig>): void {
 this.config = { ...this.config, ...newConfig };
 }

 /**
 * Get current configuration
 */
 getConfig(): UnifiedDataConfig {
 return { ...this.config };
 }

 // Utility methods

 private formatViews(count: number): string {
 if (count >= 1000000000) {
 return `${(count / 1000000000).toFixed(1)}B views`;
 }
 if (count >= 1000000) {
 return `${(count / 1000000).toFixed(1)}M views`;
 }
 if (count >= 1000) {
 return `${(count / 1000).toFixed(1)}K views`;
 }
 return `${count} views`;
 }

 private formatTimeAgo(dateString: string): string {
 if (!dateString) {
 return '';
 }

 const date = new Date(dateString);
 const now = new Date();
 const diffMs = now.getTime() - date.getTime();

 const seconds = Math.floor(diffMs / 1000);
 const minutes = Math.floor(seconds / 60);
 const hours = Math.floor(minutes / 60);
 const days = Math.floor(hours / 24);
 const weeks = Math.floor(days / 7);
 const months = Math.floor(days / 30);
 const years = Math.floor(days / 365);

 if (years > 0) {
 return `${years} year${years > 1 ? 's' : ''} ago`;
 }
 if (months > 0) {
 return `${months} month${months > 1 ? 's' : ''} ago`;
 }
 if (weeks > 0) {
 return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
 }
 if (days > 0) {
 return `${days} day${days > 1 ? 's' : ''} ago`;
 }
 if (hours > 0) {
 return `${hours} hour${hours > 1 ? 's' : ''} ago`;
 }
 if (minutes > 0) {
 return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
 }
 return 'Just now';
 }
// Export singleton instance
export const unifiedDataService = new UnifiedDataService();
export default unifiedDataService;
