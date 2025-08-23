import type { Video } from '../types';
import { api, type PaginatedRequest } from 'base.ts';
import type {;
 Video,
 Short,
 ApiResponse,
 SearchFilters } from '../../types / core';

/**
 * Video API Service
 * Centralized video - related API calls
 */

// Video service interfaces
export interface GetVideosParams extends PaginatedRequest {
 category?: string;
 featured?: boolean;
 trending?: boolean;
 channelId?: string;
}

export interface GetShortsParams extends PaginatedRequest {
 category?: string;
 trending?: boolean;
}

export interface SearchVideosParams extends PaginatedRequest {
 query: string;
 filters?: SearchFilters;
}

export interface VideoUploadData {
 title: string;
 description?: string;
 category: string;
 tags?: string;
 visibility: 'public' | 'unlisted' | 'private';
 thumbnail?: File;
}

// Video API endpoints
export const videoApi = {
 /**
 * Get videos with optional filtering and pagination
 */
 async getVideos(params: GetVideosParams = {}): Promise<any> < ApiResponse < Video[]>> {
 return api.getPaginated < Video>('/api / videos', params);
 },

 /**
 * Get a single video by ID
 */
 async getVideo(videoId): Promise<any> < ApiResponse < Video>> {
 return api.get < Video>(`/api / videos/${videoId}`);
 },

 /**
 * Get trending videos
 */
 async getTrendingVideos(,
 params: PaginatedRequest = {}
 ): Promise<any> < ApiResponse < Video[]>> {
 return api.getPaginated < Video>('/api / videos / trending', params);
 },

 /**
 * Get featured videos
 */
 async getFeaturedVideos(,
 params: PaginatedRequest = {}
 ): Promise<any> < ApiResponse < Video[]>> {
 return api.getPaginated < Video>('/api / videos / featured', params);
 },

 /**
 * Get videos by category
 */
 async getVideosByCategory(,
 category,
 params: PaginatedRequest = {}
 ): Promise<any> < ApiResponse < Video[]>> {
 return api.getPaginated < Video>('/api / videos / category', {
 ...params as any,
 category } as PaginatedRequest & { category: string });
 },

 /**
 * Get videos from subscribed channels
 */
 async getSubscriptionFeed(,
 params: PaginatedRequest = {}
 ): Promise<any> < ApiResponse < Video[]>> {
 return api.getPaginated < Video>('/api / videos / subscriptions', params);
 },

 /**
 * Get shorts videos
 */
 async getShorts(params: GetShortsParams = {}): Promise<any> < ApiResponse < Short[]>> {
 return api.getPaginated < Short>('/api / shorts', params);
 },

 /**
 * Get trending shorts
 */
 async getTrendingShorts(,
 params: PaginatedRequest = {}
 ): Promise<any> < ApiResponse < Short[]>> {
 return api.getPaginated < Short>('/api / shorts / trending', params);
 },

 /**
 * Search videos
 */
 async searchVideos(,
 params: SearchVideosParams
 ): Promise<any> < ApiResponse < Video[]>> {
 return api.getPaginated < Video>('/api / videos / search', params);
 },

 /**
 * Get related videos
 */
 async getRelatedVideos(,
 videoId,
 params: PaginatedRequest = {}
 ): Promise<any> < ApiResponse < Video[]>> {
 return api.getPaginated < Video>(`/api / videos/${videoId}/related`, params);
 },

 /**
 * Upload a new video
 */
 async uploadVideo(,
 videoFile: File,
 data: VideoUploadData
 ): Promise<any> < ApiResponse < Video>> {
 return api.upload < Video>('/api / videos / upload', videoFile, data);
 },

 /**
 * Update video metadata
 */
 async updateVideo(,
 videoId,
 data: Partial < VideoUploadData>
 ): Promise<any> < ApiResponse < Video>> {
 return api.put < Video>(`/api / videos/${videoId}`, data);
 },

 /**
 * Delete a video
 */
 async deleteVideo(videoId): Promise<any> < ApiResponse < void>> {
 return api.delete < void>(`/api / videos/${videoId}`);
 },

 /**
 * Like a video
 */
 async likeVideo(videoId): Promise<any> < ApiResponse < void>> {
 return api.post < void>(`/api / videos/${videoId}/like`);
 },

 /**
 * Unlike a video
 */
 async unlikeVideo(videoId): Promise<any> < ApiResponse < void>> {
 return api.delete < void>(`/api / videos/${videoId}/like`);
 },

 /**
 * Get video analytics
 */
 async getVideoAnalytics(videoId): Promise<any> < ApiResponse < any>> {
 return api.get < any>(`/api / videos/${videoId}/analytics`);
 },

 /**
 * Increment video view count
 */
 async incrementViews(videoId): Promise<any> < ApiResponse < void>> {
 return api.post < void>(`/api / videos/${videoId}/views`);
 },

 /**
 * Report a video
 */
 async reportVideo(,
 videoId,
 reason,
 description?: string
 ): Promise<any> < ApiResponse < void>> {
 return api.post < void>(`/api / videos/${videoId}/report`, {
 reason,
 description });
 },

 /**
 * Get video categories
 */
 async getCategories(): Promise<any> < ApiResponse < string[]>> {
 return api.get < string[]>('/api / videos / categories');
 },

 /**
 * Get video recommendations for user
 */
 async getRecommendations(,
 params: PaginatedRequest = {}
 ): Promise<any> < ApiResponse < Video[]>> {
 return api.getPaginated < Video>('/api / videos / recommendations', params);
 },

 /**
 * Get watch history
 */
 async getWatchHistory(,
 params: PaginatedRequest = {}
 ): Promise<any> < ApiResponse < Video[]>> {
 return api.getPaginated < Video>('/api / videos / history', params);
 },

 /**
 * Add video to watch history
 */
 async addToWatchHistory(,
 videoId,
 watchTime?: number
 ): Promise<any> < ApiResponse < void>> {
 return api.post < void>('/api / videos / history', { videoId, watchTime });
 },

 /**
 * Remove video from watch history
 */
 async removeFromWatchHistory(videoId): Promise<any> < ApiResponse < void>> {
 return api.delete < void>(`/api / videos / history/${videoId}`);
 },

 /**
 * Clear watch history
 */
 async clearWatchHistory(): Promise<any> < ApiResponse < void>> {
 return api.delete < void>('/api / videos / history');
 },

 /**
 * Get liked videos
 */
 async getLikedVideos(,
 params: PaginatedRequest = {}
 ): Promise<any> < ApiResponse < Video[]>> {
 return api.getPaginated < Video>('/api / videos / liked', params);
 },

 /**
 * Get saved videos (Watch Later)
 */
 async getSavedVideos(,
 params: PaginatedRequest = {}
 ): Promise<any> < ApiResponse < Video[]>> {
 return api.getPaginated < Video>('/api / videos / saved', params);
 },

 /**
 * Save video to Watch Later
 */
 async saveVideo(videoId): Promise<any> < ApiResponse < void>> {
 return api.post < void>(`/api / videos/${videoId}/save`);
 },

 /**
 * Remove video from Watch Later
 */
 async unsaveVideo(videoId): Promise<any> < ApiResponse < void>> {
 return api.delete < void>(`/api / videos/${videoId}/save`);
 };

export default videoApi;
