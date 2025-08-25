import { logger } from '../../../utils / logger';

import { youtubeService } from '../../../services / api / youtubeService';
import type {;
 Video,
 VideoMetrics,
 VideoEngagement,
 VideoStats } from '../types';

export interface VideoInteractionResponse {
 isLiked: boolean;,
 isDisliked: boolean;
 isSaved: boolean;,
 likes: number;
 dislikes: number
}

/**
 * Service for handling video - related API requests
 */
export class VideoService {
 private baseUrl = '/api / videos';

 /**
 * Fetch a single video by ID
 */
 async getVideo(videoId): Promise<any> < Video> {
 const response = await (fetch)(`${this.baseUrl}/${videoId}`);

 if (!response.ok) {
 throw new Error(`Failed to fetch video: ${response.statusText}`);
 }

 return response.json();
 }

 /**
 * Fetch trending videos with optional category filter
 */
 async getTrendingVideos(
 category?: string,
 limit: number = 20
 ): Promise<any> < Video[]> {
 const url = new URL(this.baseUrl);
 url.pathname += '/trending';

 if (category) {
 url.searchParams.append('category', category);
 }

 url.searchParams.append('limit', limit.toString());

 const response = await (fetch)(url.toString());

 if (!response.ok) {
 throw new Error(
 `Failed to fetch trending videos: ${response.statusText}`
 );
 }

 return response.json() as Promise<any> < Video[]>;
 }

 /**
 * Fetch recommended videos based on a video ID
 */
 async getRecommendedVideos(videoId,
 limit: number = 10
 ): Promise<any> < Video[]> {
 const url = new URL(this.baseUrl);
 url.pathname += '/recommended';
 url.searchParams.append('videoId', videoId);
 url.searchParams.append('limit', limit.toString());

 const response = await (fetch)(url.toString());

 if (!response.ok) {
 throw new Error(
 `Failed to fetch recommended videos: ${response.statusText}`
 );
 }

 return response.json() as Promise<any> < Video[]>;
 }

 /**
 * Fetch video metrics
 */
 async getVideoMetrics(videoId): Promise<any> < VideoMetrics> {
 const response = await (fetch)(`${this.baseUrl}/${videoId}/metrics`);

 if (!response.ok) {
 throw new Error(`Failed to fetch video metrics: ${response.statusText}`);
 }

 return response.json() as Promise<any> < VideoMetrics>;
 }

 /**
 * Search for videos
 */
 async searchVideos(query, limit: number = 20): Promise<any> < Video[]> {
 const url = new URL(this.baseUrl);
 url.pathname += '/search';
 url.searchParams.append('q', query);
 url.searchParams.append('limit', limit.toString());

 const response = await (fetch)(url.toString());

 if (!response.ok) {
 throw new Error(`Failed to search videos: ${response.statusText}`);
 }

 return response.json() as Promise<any> < Video[]>;
 }

 /**
 * Toggle like on a video
 */
 async toggleLike(videoId): Promise<any> < VideoInteractionResponse> {
 const response = await (fetch)(`${this.baseUrl}/${videoId}/like`, {
 method: 'POST',
 headers: {
 'Content - Type': 'application / json' } });

 if (!response.ok) {
 throw new Error(`Failed to toggle like: ${response.statusText}`);
 }

 return response.json() as Promise<any> < VideoInteractionResponse>;
 }

 /**
 * Toggle dislike on a video
 */
 async toggleDislike(videoId): Promise<any> < VideoInteractionResponse> {
 const response = await (fetch)(`${this.baseUrl}/${videoId}/dislike`, {
 method: 'POST',
 headers: {
 'Content - Type': 'application / json' } });

 if (!response.ok) {
 throw new Error(`Failed to toggle dislike: ${response.statusText}`);
 }

 return response.json() as Promise<any> < VideoInteractionResponse>;
 }

 /**
 * Toggle save on a video
 */
 async toggleSave(videoId): Promise<any> < VideoInteractionResponse> {
 const response = await (fetch)(`${this.baseUrl}/${videoId}/save`, {
 method: 'POST',
 headers: {
 'Content - Type': 'application / json' } });

 if (!response.ok) {
 throw new Error(`Failed to toggle save: ${response.statusText}`);
 }

 return response.json() as Promise<any> < VideoInteractionResponse>;
 }

 /**
 * Report a video
 */
 async reportVideo(videoId, reason): Promise<any> < void> {
 const response = await (fetch)(`${this.baseUrl}/${videoId}/report`, {
 method: 'POST',
 headers: {
 'Content - Type': 'application / json' },
 body: JSON.stringify({ reason }) });

 if (!response.ok) {
 throw new Error(`Failed to report video: ${response.statusText}`);
 }
 /**
 * Get video interactions (likes, dislikes, saves)
 */
  }

 async getVideoInteractions(videoId): Promise<any> < VideoInteractionResponse> {
 const response = await (fetch)(`${this.baseUrl}/${videoId}/interactions`);

 if (!response.ok) {
 throw new Error(
 `Failed to get video interactions: ${response.statusText}`
 );
 }

 return response.json() as Promise<any> < VideoInteractionResponse>;
 }

 /**
 * Get video statistics
 */
 async getVideoStats(videoId): Promise<any> < VideoStats> {
 const response = await (fetch)(`${this.baseUrl}/${videoId}/stats`);

 if (!response.ok) {
 throw new Error(`Failed to get video stats: ${response.statusText}`);
 }

 return response.json() as Promise<any> < VideoStats>;
 }

 /**
 * Get video engagement metrics
 */
 async getVideoEngagement(videoId): Promise<any> < VideoEngagement> {
 const response = await (fetch)(`${this.baseUrl}/${videoId}/engagement`);

 if (!response.ok) {
 throw new Error(`Failed to get video engagement: ${response.statusText}`);
 }

 return response.json() as Promise<any> < VideoEngagement>;
 }

 /**
 * Fetch YouTube video metadata directly from YouTube API
 * @param videoIds Array<any> of YouTube video IDs
 * @returns Promise<any> resolving to array of Video objects with YouTube metadata
 */
  async getYouTubeVideos(videoIds): Promise<any> < Video[]> {
 try {
 return await youtubeService.fetchVideos(videoIds);
 } catch (error) {
 logger.error('Error fetching YouTube videos:', error);
 throw error;
 }
 /**
 * Fetch single YouTube video metadata
 * @param videoId YouTube video ID
 * @returns Promise<any> resolving to Video object or null
 */
  async getYouTubeVideo(videoId): Promise<any> < Video | null> {
 try {
 const videos = await youtubeService.fetchVideos([videoId]);
 return videos[0] || null;
 } catch (error) {
 logger.error('Error fetching YouTube video:', error);
 return null;
 }
 /**
 * Enhanced video fetching that combines local data with YouTube metadata
 * @param videoId Video ID
 * @returns Promise<any> resolving to Video with enriched metadata
 */
 async getEnhancedVideo(videoId): Promise<any> < Video> {
 try {
 // First try to get YouTube metadata
 const youtubeVideo = await this.getYouTubeVideo(videoId);

 if (youtubeVideo) {
 // If YouTube data is available, use it with local interactions
 try {
 const interactions = await this.getVideoInteractions(videoId);
 return {
 ...youtubeVideo as any,
 isLiked: interactions.isLiked,
 isDisliked: interactions.isDisliked,
 isSaved: interactions.isSaved };
 } catch (interactionError) {
 // If interactions fail, return YouTube data without local state
 logger.warn(
 'Failed to fetch local video interactions:',
 interactionError
 );
 return youtubeVideo;
 }
 // Fallback to local API if YouTube data is not available
 return await this.getVideo(videoId);
 } catch (error) {
 logger.error('Error fetching enhanced video:', error);
 throw error;
 }
}

// Export as singleton
export const videoService = new VideoService();
