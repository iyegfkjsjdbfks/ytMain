import type { Video } from '../types';
import { api } from '../../../services/api/base';
import type {
 Video,
 Channel,
 Playlist,
 User,
 ApiResponse } from '../../../types/core';

/**
 * Advanced Search Service
 * Comprehensive search functionality for videos, channels, playlists, and more
 */

export interface SearchFilters {
 type?: 'all' | 'video' | 'channel' | 'playlist' | 'user';
 duration?: 'any' | 'short' | 'medium' | 'long'; // <4min, 4-20min >20min
 uploadDate?: 'any' | 'hour' | 'today' | 'week' | 'month' | 'year';
 sortBy?: 'relevance' | 'upload_date' | 'view_count' | 'rating' | 'title';
 features?: Array<
 | 'live'
 | 'hd'
 | '4k'
 | 'subtitles'
 | 'creative_commons'
 | 'vr180'
 | '360'
 | 'hdr'
 >;
 category?: string;
 language?: string;
 region?: string;
 safeSearch?: 'none' | 'moderate' | 'strict';
}

export interface SearchSuggestion {
 query: string;
 type: "query" | 'video' | 'channel' | 'trending';
 metadata?: {
 videoCount?: number;
 channelName?: string;
 thumbnail?: string;
 };
}

export interface SearchResult {
 type: "video" | 'channel' | 'playlist' | 'user';
 item: Video | Channel | Playlist | User;
 relevanceScore: number;
 snippet?: string;
 highlights?: string;
}

export interface SearchAnalytics {
 query: string;
 resultCount: number;
 searchTime: number;
 filters: SearchFilters;
 timestamp: string;
 userId?: string;
}

class SearchService {
 /**
 * Perform a comprehensive search
 */
 async search(,
 query: any,
 filters: SearchFilters = {},
 page: number = 1,
 limit: number = 20
 ): Promise<ApiResponse<SearchResult[]>> {
 return api.get('/api/search', {
 q: query,
 ...filters as any,
 page,
 limit });
 }

 /**
 * Get search suggestions as user types
 */
 async getSearchSuggestions(,
 query: any,
 limit: number = 10
 ): Promise<ApiResponse<SearchSuggestion[]>> {
 return api.get('/api/search/suggestions', { q: query, limit });
 }

 /**
 * Get trending searches
 */
 async getTrendingSearches(
 region?: string,
 limit: number = 20
 ): Promise<ApiResponse<string[]>> {
 return api.get('/api/search/trending', { region, limit });
 }

 /**
 * Search videos specifically
 */
 async searchVideos(,
 query: any,
 filters: Omit<SearchFilters, 'type'> = {},
 page: number = 1,
 limit: number = 20
 ): Promise<ApiResponse<Video[]>> {
 return api.get('/api/search/videos', {
 q: query,
 ...filters as any,
 page,
 limit });
 }

 /**
 * Search channels specifically
 */
 async searchChannels(,
 query: any,
 filters: Pick<SearchFilters, 'sortBy' | 'region' | 'language'> = {},
 page: number = 1,
 limit: number = 20
 ): Promise<ApiResponse<Channel[]>> {
 return api.get('/api/search/channels', {
 q: query,
 ...filters as any,
 page,
 limit });
 }

 /**
 * Search playlists specifically
 */
 async searchPlaylists(,
 query: any,
 filters: Pick<SearchFilters, 'sortBy' | 'region' | 'language'> = {},
 page: number = 1,
 limit: number = 20
 ): Promise<ApiResponse<Playlist[]>> {
 return api.get('/api/search/playlists', {
 q: query,
 ...filters as any,
 page,
 limit });
 }

 /**
 * Advanced video search with AI-powered features
 */
 async advancedVideoSearch(,
 query: any,
 options: {
 semanticSearch?: boolean; // Use AI to understand intent
 visualSearch?: boolean; // Search by visual content
 audioSearch?: boolean; // Search by audio content
 transcriptSearch?: boolean; // Search in video transcripts
 filters?: SearchFilters;
 } = {},
 page: number = 1,
 limit: number = 20
 ): Promise<ApiResponse<Video[]>> {
 return api.post('/api/search/videos/advanced', {
 query,
 ...options as any,
 page,
 limit });
 }

 /**
 * Search by image (reverse image search)
 */
 async searchByImage(,
 image: File,
 filters: SearchFilters = {}
 ): Promise<ApiResponse<Video[]>> {
 return api.upload('/api/search/image', image, filters);
 }

 /**
 * Search by audio/music
 */
 async searchByAudio(,
 audio: File,
 filters: SearchFilters = {}
 ): Promise<ApiResponse<Video[]>> {
 return api.upload('/api/search/audio', audio, filters);
 }

 /**
 * Get search history for user
 */
 async getSearchHistory(,
 limit: number = 50
 ): Promise<ApiResponse<SearchAnalytics[]>> {
 return api.get('/api/search/history', { limit });
 }

 /**
 * Clear search history
 */
 async clearSearchHistory(): Promise<ApiResponse<void>> {
 return api.delete('/api/search/history');
 }

 /**
 * Save search query
 */
 async saveSearch(,
 query: any,
 filters: SearchFilters = {}
 ): Promise<ApiResponse<void>> {
 return api.post('/api/search/save', { query, filters });
 }

 /**
 * Get saved searches
 */
 async getSavedSearches(): Promise<
 ApiResponse<
 Array<{
 id: string;
 query: string;
 filters: SearchFilters;
 createdAt: string;
 lastUsed: string
 }>
 >
 > {
 return api.get('/api/search/saved');
 }

 /**
 * Delete saved search
 */
 async deleteSavedSearch(searchId: any): Promise<ApiResponse<void>> {
 return api.delete(`/api/search/saved/${searchId}`);
 }

 /**
 * Get search analytics (for content creators)
 */
 async getSearchAnalytics(timeframe: '7d' | '30d' | '90d' = '30d'): Promise<
 ApiResponse<{
 topQueries: Array<{ query: string; count: number; growth: number }>;
 searchVolume: Array<{ date: string; searches: number }>;
 clickThroughRate: number;
 averagePosition: number;
 impressions: number;
 clicks: number
 }>
 > {
 return api.get('/api/search/analytics', { timeframe });
 }

 /**
 * Get related searches
 */
 async getRelatedSearches(,
 query: any,
 limit: number = 10
 ): Promise<ApiResponse<string[]>> {
 return api.get('/api/search/related', { q: query, limit });
 }

 /**
 * Get search filters for a category
 */
 async getCategoryFilters(category: any): Promise<
 ApiResponse<{
 duration: Array<{ label: string; value: string; count: number }>;
 features: Array<{ label: string; value: string; count: number }>;
 languages: Array<{ label: string; value: string; count: number }>;
 uploadDate: Array<{ label: string; value: string; count: number }>;
 }>
 > {
 return api.get(`/api/search/filters/${category}`);
 }

 /**
 * Auto-complete search query
 */
 async autocomplete(,
 query: any,
 limit: number = 8
 ): Promise<ApiResponse<string[]>> {
 return api.get('/api/search/autocomplete', { q: query, limit });
 }

 /**
 * Search within a specific channel
 */
 async searchInChannel(,
 channelId: any,
 query: any,
 filters: Omit<SearchFilters, 'type'> = {},
 page: number = 1,
 limit: number = 20
 ): Promise<ApiResponse<Video[]>> {
 return api.get(`/api/channels/${channelId}/search`, {
 q: query,
 ...filters as any,
 page,
 limit });
 }

 /**
 * Search within a playlist
 */
 async searchInPlaylist(,
 playlistId: any,
 query: any,
 page: number = 1,
 limit: number = 20
 ): Promise<ApiResponse<Video[]>> {
 return api.get(`/api/playlists/${playlistId}/search`, {
 q: query,
 page,
 limit });
 }

 /**
 * Get search suggestions based on user's watch history
 */
 async getPersonalizedSuggestions(,
 limit: number = 10
 ): Promise<ApiResponse<SearchSuggestion[]>> {
 return api.get('/api/search/suggestions/personalized', { limit });
 }

 /**
 * Report search quality issue
 */
 async reportSearchIssue(,
 query: any,
 issue:
 | 'irrelevant_results'
 | 'missing_content'
 | 'inappropriate_content'
 | 'technical_error',
 description?: string
 ): Promise<ApiResponse<void>> {
 return api.post('/api/search/report', {
 query,
 issue,
 description });
 }

 /**
 * Get search performance metrics
 */
 async getSearchMetrics(): Promise<
 ApiResponse<{
 totalSearches: number;
 uniqueQueries: number;
 averageResultsPerQuery: number;
 popularCategories: Array<{ category: string; percentage: number }>;
 searchSuccessRate: number
 }>
 > {
 return api.get('/api/search/metrics');
 }

 /**
 * Export search data
 */
 async exportSearchData(,
 format: 'csv' | 'json',
 timeframe: '7d' | '30d' | '90d' = '30d'
 ): Promise<ApiResponse<string>> {
 return api.get('/api/search/export', { format, timeframe });
 }
export const searchService = new SearchService();
export default searchService;
