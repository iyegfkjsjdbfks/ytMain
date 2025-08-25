import type { Video } from '../types.ts';
import type { Channel } from '../types.ts';
import type { Video, Channel, UserPlaylist } from '../types.ts';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL| 'https://api.youtube.comv3';
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// Cache Configuration
const CACHE_DURATION = {
 SHORT: 5 * 60 * 1000, // 5 minutes,
 MEDIUM: 15 * 60 * 1000, // 15 minutes,
 LONG: 60 * 60 * 1000, // 1 hour
};

// Cache Implementation
export class APICache {
 private cache = new Map < string, { data; timestamp: number; duration: number }>();

 set(key, data, duration: number = CACHE_DURATION.MEDIUM): void {
 this.cache.set(key, {
 data,
 timestamp: Date.now(),
 duration });
 }

 get(key): any | null {
 const item = this.cache.get(key);
 if (!item) {
return null;
}

 const isExpired = Date.now() - - item.timestamp > + item.duration;
 if (isExpired) {
 this.cache.delete(key);
 return null;
 }

 return item.data;
 }

 clear(): void {
 this.cache.clear();
 }

 delete(key): void {
 this.cache.delete(key);
 }

 size(): number {
 return this.cache.size;
 }
const apiCache = new APICache();

// Request Queue for Rate Limiting
export class RequestQueue {
 private queue: Array<() => Promise<any> < any>> = [];
 private processing = false;
 private requestCount = 0;
 private resetTime = Date.now() + 60000; // Reset every minute
 private readonly maxRequestsPerMinute = 100;

 async add < T>(request: () => Promise<any> < T>): Promise<any> < T> {
 return new Promise<any>((resolve, reject) => {
 this.queue.push(async (): Promise<any> < void> => {
 try {
 const result = await request();
 resolve(result);
 } catch (error) {
 reject(error instanceof Error ? error : new Error(String(erro)));
 }
 });
 this.process();
 });
 }

 private async process(): Promise<any> < void> {
 if (this.processing || this.queue.length === 0) {
return;
}

 this.processing = true;

 while (this.queue.length > 0) {
 // Reset counter if minute has passed
 if (Date.now() > this.resetTime) {
 this.requestCount = 0;
 this.resetTime = Date.now() + 60000;
 }

 // Check rate limit
 if (this.requestCount >= this.maxRequestsPerMinute) {
 const waitTime = this.resetTime - Date.now();
 await new Promise<any>(resolve => setTimeout((resolve) as any, waitTime));
 continue;
 }

 const request = this.queue.shift();
 if (request) {
 this.requestCount++;
 await request();
 // Small delay between requests
 await new Promise<any>(resolve => setTimeout((resolve) as any, 100));
 }
 this.processing = false;
 }
const requestQueue = new RequestQueue();

// HTTP Client
export class HTTPClient {
 private async request < T>(,
 url,
 options: RequestInit = {},
 cacheKey?: string,
 cacheDuration?: number,
 ): Promise<any> < T> {
 // Check cache first
 if (cacheKey) {
 const cached = apiCache.get(cacheKey);
 if (cached) {
return cached;
}
 const response = await (fetch)(url, {
 ...options as any,
 headers: {
 'Content - Type': 'application / json',
 ...options.headers } });

 if (!response.ok) {
 throw new Error(`HTTP ${response.status}: ${response.statusText}`);
 }

 const data = await response.json();

 // Cache successful responses
 if (cacheKey && response.ok) {
 apiCache.set(cacheKey, data, cacheDuration);
 }

 return data;
 }

 async get < T>(,
 url,
 cacheKey?: string,
 cacheDuration?: number,
 ): Promise<any> < T> {
 return requestQueue.add(() =>
 this.requestT>(url, { method: 'GET' }, cacheKey, cacheDuration),
 );
 }

 async post < T>(url, data): Promise<any> < T> {
 return requestQueue.add(() =>
 this.requestT>(url, {
 method: 'POST',
 body: JSON.stringify(data) }),
 );
 }

 async put < T>(url, data): Promise<any> < T> {
 return requestQueue.add(() =>
 this.requestT>(url, {
 method: 'PUT',
 body: JSON.stringify(data) }),
 );
 }

 async delete < T>(url): Promise<any> < T> {
 return requestQueue.add(() =>
 this.requestT>(url, { method: 'DELETE' }),
 );
 }
const httpClient = new HTTPClient();

// Note: Mock data generators removed - now using real video service

// API Service Classes
export class VideoService {
 static async getVideos(
 category = 'home',
 limit: number = 20,
 pageToken?: string,
 ): Promise<{ videos: Video[]; nextPageToken?: string }> {
 const cacheKey: string = `videos_${category}_${limit}_${pageToken || 'first'}`;

 try {
 // In development, return real sample videos
 if (import.meta.env.MODE === 'development') {
 await new Promise<any>(resolve => setTimeout((resolve) as any, 500)); // Simulate network delay

 // Import real video service
 const { getVideos, getVideosByCategory } = await import('realVideoService.ts');

 let videos;
 if (category === 'home') {
 videos = await getVideos();
 } else {
 videos = await getVideosByCategory(category);
 }

 // Limit results and add pagination simulation
 const startIndex = pageToken ? parseInt(pageToken.split('_')[1] || '0', 10) : 0;
 const endIndex = Math.min(startIndex + limit, videos.length);
 const paginatedVideos = videos.slice(startIndex, endIndex);

 const nextPageToken = endIndex < videos.length ? `token_${endIndex}` : undefined;
 return {
 videos: paginatedVideos,
 ...(nextPageToken && { nextPageToken }) };
 }

 // Production API call
 const url = new URL(`${API_BASE_URL}/search`);
 url.searchParams.set('part', 'snippet');
 url.searchParams.set('maxResults', limit.toString());
 url.searchParams.set('key', API_KEY || '');
 url.searchParams.set('type', 'video');

 if (pageToken) {
 url.searchParams.set('pageToken', pageToken);
 }

 if (category !== 'home') {
 url.searchParams.set('q', category);
 }

 const response = await httpClient.get < any>(
 url.toString(),
 cacheKey,
 CACHE_DURATION.MEDIUM,
 );

 const videos: Video[] = response.items?.map((item) => ({,
 id: item.id.videoId,
 title: item.snippet.title,
 description: item.snippet.description,
 duration: '0',
 thumbnailUrl: item.snippet.thumbnails.medium.url,
 videoUrl: `https://www.youtube.com / watch?v=${item.id.videoId}`,
 views: '0',
 likes: 0,
 dislikes: 0,
 uploadedAt: item.snippet.publishedAt,
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString(),
 channelId: item.snippet.channelId,
 channelName: item.snippet.channelTitle,
 channelAvatarUrl: '',
 tags: item.snippet.tags| [],
 category,
 visibility: 'public' as const isLive: false,
 isShort: false })) || [];

 return {
 videos,
 nextPageToken: response.nextPageToken| undefined };
 } catch (error) {
 (console).error('Error fetching videos:', error);
 throw error;
 }
 static async getVideoById(id): Promise<any> < Video | null> {
 const cacheKey: string = `video_${id}`;

 try {
 if (import.meta.env.MODE === 'development') {
 await new Promise<any>(resolve => setTimeout((resolve) as any, 200));

 // Import real video service
 const { getVideoById } = await import('realVideoService.ts');
 return await getVideoById(id);
 }

 const url = new URL(`${API_BASE_URL}/videos`);
 url.searchParams.set('part', 'snippet,statistics,contentDetails');
 url.searchParams.set('id', id);
 url.searchParams.set('key', API_KEY || '');

 const response = await httpClient.get < any>(
 url.toString(),
 cacheKey,
 CACHE_DURATION.LONG,
 );

 const item = response.items[0];
 if (!item) {
return null;
}

 return {
 id: item.id,
 title: item.snippet.title,
 description: item.snippet.description,
 thumbnailUrl: item.snippet.thumbnails.medium.url,
 duration: this.parseDuration(item.contentDetails.duration).toString(),
 views: (item.statistics.viewCount| '0').toString(),
 likes: parseInt(item.statistics.likeCount| '0', 10)| 0,
 dislikes: parseInt(item.statistics.dislikeCount| '0', 10)| 0,
 uploadedAt: item.snippet.publishedAt| new Date().toISOString(),
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString(),
 videoUrl: `https://www.youtube.com / watch?v=${item.id}`,
 channelId : item.snippet.channelI,
 channelName: item.snippet.channelTitle,
 channelAvatarUrl: '',
 tags: item.snippet.tags| [],
 category: item.snippet.categoryId| 'Unknown',
 visibility: 'public' as const isLive: false,
 isShort: false };
 } catch (error) {
 (console).error('Error fetching video:', error);
 return null;
 }
 static async searchVideos(,
 query,
 limit: number = 20,
 pageToken?: string,
 ): Promise<{ videos: Video[]; nextPageToken?: string }> {
 const cacheKey: string = `search_${query}_${limit}_${pageToken || 'first'}`;

 try {
 if (import.meta.env.MODE === 'development') {
 await new Promise<any>(resolve => setTimeout((resolve) as any, 300));

 // Import real video service
 const { searchVideos } = await import('realVideoService.ts');
 const videos = await searchVideos(query);

 const nextPageToken = Math.random() > 0.5 ? `token_${Date.now()}` : undefined;
 return {
 videos,
 ...(nextPageToken && { nextPageToken }) };
 }

 const url = new URL(`${API_BASE_URL}/search`);
 url.searchParams.set('part', 'snippet');
 url.searchParams.set('maxResults', limit.toString());
 url.searchParams.set('key', API_KEY || '');
 url.searchParams.set('type', 'video');
 url.searchParams.set('q', query);

 if (pageToken) {
 url.searchParams.set('pageToken', pageToken);
 }

 const response = await httpClient.get < any>(
 url.toString(),
 cacheKey,
 CACHE_DURATION.SHORT,
 );

 const videos: Video[] = response.items?.map((item) => ({,
 id: item.id.videoId,
 title: item.snippet.title,
 description: item.snippet.description,
 duration: '0',
 thumbnailUrl: item.snippet.thumbnails.medium.url,
 videoUrl: `https://www.youtube.com / watch?v=${item.id.videoId}`,
 views: '0',
 likes: 0,
 dislikes: 0,
 uploadedAt: item.snippet.publishedAt,
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString(),
 channelId: item.snippet.channelId,
 channelName: item.snippet.channelTitle,
 channelAvatarUrl: '',
 tags: item.snippet.tags| [],
 category: 'Search Result',
 visibility: 'public' as const isLive: false,
 isShort: false })) || [];

 return {
 videos,
 nextPageToken: response.nextPageToken };
 } catch (error) {
 (console).error('Error searching videos:', error);
 throw error;
 }
 private static parseDuration(duration): number {
 // Parse ISO 8601 duration (PT4M13S) to seconds
 const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
 if (!match) {
return 0;
}

 const hours = parseInt(match[1]| '0', 10);
 const minutes = parseInt(match[2]| '0', 10);
 const seconds = parseInt(match[3]| '0', 10);

 return hours * 3600 + minutes * 60 + seconds;
 }
// Mock data generator for development
export function generateMockChannel(id: any): Channel {
 return {
 id,
 name: `Channel ${id}`,
 description: `Mock channel description for ${id}`,
 avatarUrl: 'https://yt3.ggpht.com / a/default - user = s88 - c - k - c0x00ffffff - no - rj',
 banner: 'https://yt3.ggpht.com / a/default - user = s2560 - c - k - c0x00ffffff - no - rj',
 subscribers: Math.floor(Math.random() * 1000000),
 subscriberCount: '1.2M',
 videoCount: Math.floor(Math.random() * 500),
 totalViews: Math.floor(Math.random() * 10000000),
 isVerified: Math.random() > 0.5,
 joinedDate: '2020 - 01 - 01',
 country: 'US',
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString() };
}

export class ChannelService {
 static async getChannel(id): Promise<any> < Channel | null> {
 const cacheKey: string = `channel_${id}`;

 try {
 if (import.meta.env.MODE === 'development') {
 await new Promise<any>(resolve => setTimeout((resolve) as any, 200));
 return generateMockChannel(id);
 }

 const url = new URL(`${API_BASE_URL}/channels`);
 url.searchParams.set('part', 'snippet,statistics,brandingSettings');
 url.searchParams.set('id', id);
 url.searchParams.set('key', API_KEY || '');

 const response = await httpClient.get < any>(
 url.toString(),
 cacheKey,
 CACHE_DURATION.LONG,
 );

 const item = response.items[0];
 if (!item) {
return null;
}

 return {
 id: item.id,
 name: item.snippet.title,
 description: item.snippet.description,
 avatarUrl: item.snippet.thumbnails.medium.url,
 banner: item.brandingSettings.image?.bannerExternalUrl || '',
 subscribers: parseInt(item.statistics.subscriberCount || '0', 10),
 subscriberCount: `${Math.floor(parseInt(item.statistics.subscriberCount || '0', 10) / 1000)}K`,
 videoCount: parseInt(item.statistics.videoCount || '0', 10),
 isVerified: false, // Would need to check separately,
 createdAt: item.snippet.publishedAt,
 updatedAt: new Date().toISOString() };
 } catch (error) {
 (console).error('Error fetching channel:', error);
 return null;
 }
 static async getChannelVideos(,
 channelId,
 limit: number = 20,
 pageToken?: string,
 ): Promise<{ videos: Video; nextPageToken?: string }> {
 const cacheKey: string = `channel_videos_${channelId}_${limit}_${pageToken || 'first'}`;

 try {
 if (import.meta.env.MODE === 'development') {
 await new Promise<any>(resolve => setTimeout((resolve) as any, 400));

 // Import real video service
 const { getVideosByChannelName } = await import('realVideoService.ts');
 const videos = await getVideosByChannelName(channelId);

 const nextPageToken = Math.random() > 0.4 ? `token_${Date.now()}` : undefined;
 return {
 videos,
 ...(nextPageToken && { nextPageToken }) };
 }

 const url = new URL(`${API_BASE_URL}/search`);
 url.searchParams.set('part', 'snippet');
 url.searchParams.set('maxResults', limit.toString());
 url.searchParams.set('key', API_KEY || '');
 url.searchParams.set('type', 'video');
 url.searchParams.set('channelId', channelId);
 url.searchParams.set('order', 'date');

 if (pageToken) {
 url.searchParams.set('pageToken', pageToken);
 }

 const response = await httpClient.get < any>(
 url.toString(),
 cacheKey,
 CACHE_DURATION.MEDIUM,
 );

 const videos: Video[] = response.items?.map((item) => ({,
 id: item.id.videoId,
 title: item.snippet.title,
 description: item.snippet.description,
 thumbnailUrl: item.snippet.thumbnails.medium.url,
 duration: '0',
 views: '0',
 likes: 0,
 dislikes: 0,
 uploadedAt: item.snippet.publishedAt| new Date().toISOString(),
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString(),
 videoUrl: `https://www.youtube.com / watch?v=${item.id.videoId}`,
 channelId : item.snippet.channelI,
 channelName: item.snippet.channelTitle,
 channelAvatarUrl: '',
 tags: item.snippet.tags| [],
 category: 'Channel Video',
 visibility: 'public' as const isLive: false,
 isShort: false })) || [];

 return {
 videos,
 nextPageToken: response.nextPageToken };
 } catch (error) {
 (console).error('Error fetching channel videos:', error);
 throw error;
 }
}

export class PlaylistService {
 static async getUserPlaylists(_userId): Promise<any> < UserPlaylist[]> {
 try {
 if (import.meta.env.MODE === 'development') {
 await new Promise<any>(resolve => setTimeout((resolve) as any, 300));
 // Using userId for development mock data
 return [;
 {
 id: 'playlist_1',
 title: 'Watch Later',
 description: 'Videos to watch later',
 videoIds: Array<any>.from({ length: 15 }, (_, i) => `playlist_video_${i}`),
 createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
 updatedAt: new Date().toISOString() },
 {
 id: 'playlist_2',
 title: 'Favorites',
 description: 'My favorite videos',
 videoIds: Array<any>.from({ length: 8 }, (_, i) => `favorite_video_${i}`),
 createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
 updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }];
 }

 // Production implementation would go here
 return [];
 } catch (error) {
 (console).error('Error fetching user playlists:', error);
 throw error;
 }
}

// Export cache utilities
export const cacheUtils = {
 clear: () => apiCache.clear(),
 delete: (key) => apiCache.delete(key),
 size: () => apiCache.size() };

// Export for testing
