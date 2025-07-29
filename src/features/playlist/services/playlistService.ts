/**1
 * Playlist Service
 * Comprehensive playlist management service
 */

import { api } from '../../../services/api/base';

import type { Playlist, Video, ApiResponse } from '../../../types/core';

export interface CreatePlaylistData {
  title: string;
  description?: string;
  visibility: 'public' | 'unlisted' | 'private';
  tags?: string[];
}

export interface UpdatePlaylistData extends Partial<CreatePlaylistData> {
  id: string;
}

export interface AddVideoToPlaylistData {
  playlistId: string;
  videoId: string;
  position?: number;
}

export interface ReorderPlaylistData {
  playlistId: string;
  videoId: string;
  newPosition: number;
}

export interface PlaylistFilters {
  visibility?: 'public' | 'unlisted' | 'private' | 'all';
  sortBy?: 'created' | 'updated' | 'title' | 'videoCount';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

class PlaylistService {
  /**
   * Get user's playlists
   */
  async getUserPlaylists(filters: PlaylistFilters = {}): Promise<ApiResponse<Playlist[]>> {
    return api.get('/api/playlists', filters);
  }

  /**
   * Get a specific playlist by ID
   */
  async getPlaylist(playlistId: string): Promise<ApiResponse<Playlist>> {
    return api.get(`/api/playlists/${playlistId}`);
  }

  /**
   * Get playlist videos
   */
  async getPlaylistVideos(
    playlistId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<ApiResponse<Video[]>> {
    return api.get(`/api/playlists/${playlistId}/videos`, { page, limit });
  }

  /**
   * Create a new playlist
   */
  async createPlaylist(data: CreatePlaylistData): Promise<ApiResponse<Playlist>> {
    return api.post('/api/playlists', data);
  }

  /**
   * Update playlist metadata
   */
  async updatePlaylist(data: UpdatePlaylistData): Promise<ApiResponse<Playlist>> {
    const { id, ...updateData } = data;
    return api.put(`/api/playlists/${id}`, updateData);
  }

  /**
   * Delete a playlist
   */
  async deletePlaylist(playlistId: string): Promise<ApiResponse<void>> {
    return api.delete(`/api/playlists/${playlistId}`);
  }

  /**
   * Add video to playlist
   */
  async addVideoToPlaylist(data: AddVideoToPlaylistData): Promise<ApiResponse<void>> {
    return api.post(`/api/playlists/${data.playlistId}/videos`, {
      videoId: data.videoId,
      position: data.position,
    });
  }

  /**
   * Remove video from playlist
   */
  async removeVideoFromPlaylist(
    playlistId: string,
    videoId: string,
  ): Promise<ApiResponse<void>> {
    return api.delete(`/api/playlists/${playlistId}/videos/${videoId}`);
  }

  /**
   * Reorder videos in playlist
   */
  async reorderPlaylistVideos(data: ReorderPlaylistData): Promise<ApiResponse<void>> {
    return api.patch(`/api/playlists/${data.playlistId}/videos/${data.videoId}/position`, {
      newPosition: data.newPosition,
    });
  }

  /**
   * Duplicate a playlist
   */
  async duplicatePlaylist(
    playlistId: string,
    newTitle?: string,
  ): Promise<ApiResponse<Playlist>> {
    return api.post(`/api/playlists/${playlistId}/duplicate`, {
      title: newTitle,
    });
  }

  /**
   * Get public playlists by user
   */
  async getUserPublicPlaylists(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<ApiResponse<Playlist[]>> {
    return api.get(`/api/users/${userId}/playlists`, { page, limit });
  }

  /**
   * Search playlists
   */
  async searchPlaylists(
    query: string,
    filters: Omit<PlaylistFilters, 'search'> = {},
  ): Promise<ApiResponse<Playlist[]>> {
    return api.get('/api/playlists/search', { query, ...filters });
  }

  /**
   * Get featured/trending playlists
   */
  async getFeaturedPlaylists(
    page: number = 1,
    limit: number = 20,
  ): Promise<ApiResponse<Playlist[]>> {
    return api.get('/api/playlists/featured', { page, limit });
  }

  /**
   * Check if video is in playlist
   */
  async isVideoInPlaylist(
    playlistId: string,
    videoId: string,
  ): Promise<ApiResponse<boolean>> {
    return api.get(`/api/playlists/${playlistId}/videos/${videoId}/exists`);
  }

  /**
   * Get playlist statistics
   */
  async getPlaylistStats(playlistId: string): Promise<ApiResponse<{
    totalViews: number;
    totalDuration: number;
    averageRating: number;
    lastUpdated: string;
  }>> {
    return api.get(`/api/playlists/${playlistId}/stats`);
  }

  /**
   * Export playlist
   */
  async exportPlaylist(
    playlistId: string,
    format: 'json' | 'csv' | 'm3u',
  ): Promise<ApiResponse<string>> {
    return api.get(`/api/playlists/${playlistId}/export`, { format });
  }

  /**
   * Import playlist
   */
  async importPlaylist(
    file: File,
    format: 'json' | 'csv' | 'm3u',
  ): Promise<ApiResponse<Playlist>> {
    return api.upload('/api/playlists/import', file, { format });
  }

  /**
   * Get recommended playlists
   */
  async getRecommendedPlaylists(
    page: number = 1,
    limit: number = 20,
  ): Promise<ApiResponse<Playlist[]>> {
    return api.get('/api/playlists/recommendations', { page, limit });
  }

  /**
   * Follow/unfollow a playlist
   */
  async followPlaylist(playlistId: string): Promise<ApiResponse<void>> {
    return api.post(`/api/playlists/${playlistId}/follow`);
  }

  async unfollowPlaylist(playlistId: string): Promise<ApiResponse<void>> {
    return api.delete(`/api/playlists/${playlistId}/follow`);
  }

  /**
   * Get followed playlists
   */
  async getFollowedPlaylists(
    page: number = 1,
    limit: number = 20,
  ): Promise<ApiResponse<Playlist[]>> {
    return api.get('/api/playlists/followed', { page, limit });
  }

  /**
   * Collaborate on playlist (add collaborators)
   */
  async addCollaborator(
    playlistId: string,
    userId: string,
    permissions: Array<'view' | 'edit' | 'manage'>,
  ): Promise<ApiResponse<void>> {
    return api.post(`/api/playlists/${playlistId}/collaborators`, {
      userId,
      permissions,
    });
  }

  async removeCollaborator(
    playlistId: string,
    userId: string,
  ): Promise<ApiResponse<void>> {
    return api.delete(`/api/playlists/${playlistId}/collaborators/${userId}`);
  }

  /**
   * Get playlist collaborators
   */
  async getPlaylistCollaborators(playlistId: string): Promise<ApiResponse<Array<{
    userId: string;
    username: string;
    avatar?: string;
    permissions: string[];
    addedAt: string;
  }>>> {
    return api.get(`/api/playlists/${playlistId}/collaborators`);
  }

  /**
   * Bulk operations
   */
  async bulkAddVideos(
    playlistId: string,
    videoIds: string[],
  ): Promise<ApiResponse<{ success: string[]; failed: string[] }>> {
    return api.post(`/api/playlists/${playlistId}/videos/bulk`, { videoIds });
  }

  async bulkRemoveVideos(
    playlistId: string,
    videoIds: string[],
  ): Promise<ApiResponse<{ success: string[]; failed: string[] }>> {
    return api.delete(`/api/playlists/${playlistId}/videos/bulk`, {
      body: JSON.stringify({ videoIds }),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Generate playlist thumbnail
   */
  async generateThumbnail(playlistId: string): Promise<ApiResponse<string>> {
    return api.post(`/api/playlists/${playlistId}/thumbnail/generate`);
  }

  /**
   * Upload custom playlist thumbnail
   */
  async uploadThumbnail(
    playlistId: string,
    thumbnail: File,
  ): Promise<ApiResponse<string>> {
    return api.upload(`/api/playlists/${playlistId}/thumbnail`, thumbnail);
  }
}

export const playlistService = new PlaylistService();
export default playlistService;
