
import { api } from '../../../services/api/base';
import type { Comment, ApiResponse } from '../../../types/core';

/**
 * Comment Service
 * Comprehensive comment management service
 */

export interface CreateCommentData {
  content: string;
  videoId: string;
  parentId?: string; // For replies
}

export interface UpdateCommentData {
  commentId: string;
  content: string;
}

export interface CommentFilters {
  sortBy?: 'newest' | 'oldest' | 'top' | 'controversial';
  parentId?: string; // Get replies for specific comment
  includeReplies?: boolean;
  page?: number;
  limit?: number;
}

export interface CommentReaction {
  type: 'like' | 'dislike' | 'heart' | 'laugh' | 'angry' | 'sad';
  commentId: string;
}

export interface CommentModerationAction {
  commentId: string;
  action: 'approve' | 'reject' | 'hold' | 'spam';
  reason?: string;
}

class CommentService {
  /**
   * Get comments for a video
   */
  async getVideoComments(
    videoId: string,
    filters: CommentFilters = {},
  ): Promise<ApiResponse<Comment[]>> {
    return api.get(`/api/videos/${videoId}/comments`, filters);
  }

  /**
   * Get replies for a comment
   */
  async getCommentReplies(
    commentId: string,
    filters: Omit<CommentFilters, 'parentId'> = {},
  ): Promise<ApiResponse<Comment[]>> {
    return api.get(`/api/comments/${commentId}/replies`, filters);
  }

  /**
   * Get a specific comment
   */
  async getComment(commentId: string): Promise<ApiResponse<Comment>> {
    return api.get(`/api/comments/${commentId}`);
  }

  /**
   * Create a new comment
   */
  async createComment(data: CreateCommentData): Promise<ApiResponse<Comment>> {
    return api.post('/api/comments', data);
  }

  /**
   * Update a comment
   */
  async updateComment(data: UpdateCommentData): Promise<ApiResponse<Comment>> {
    const { commentId, ...updateData } = data;
    return api.put(`/api/comments/${commentId}`, updateData);
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<ApiResponse<void>> {
    return api.delete(`/api/comments/${commentId}`);
  }

  /**
   * React to a comment (like, dislike, etc.)
   */
  async reactToComment(data: CommentReaction): Promise<ApiResponse<void>> {
    return api.post(`/api/comments/${data.commentId}/reactions`, {
      type: data.type,
    });
  }

  /**
   * Remove reaction from comment
   */
  async removeReaction(commentId: string): Promise<ApiResponse<void>> {
    return api.delete(`/api/comments/${commentId}/reactions`);
  }

  /**
   * Pin a comment (video owner only)
   */
  async pinComment(commentId: string): Promise<ApiResponse<void>> {
    return api.post(`/api/comments/${commentId}/pin`);
  }

  /**
   * Unpin a comment
   */
  async unpinComment(commentId: string): Promise<ApiResponse<void>> {
    return api.delete(`/api/comments/${commentId}/pin`);
  }

  /**
   * Heart a comment (video owner only)
   */
  async heartComment(commentId: string): Promise<ApiResponse<void>> {
    return api.post(`/api/comments/${commentId}/heart`);
  }

  /**
   * Remove heart from comment
   */
  async unheartComment(commentId: string): Promise<ApiResponse<void>> {
    return api.delete(`/api/comments/${commentId}/heart`);
  }

  /**
   * Report a comment
   */
  async reportComment(
    commentId: string,
    reason: string,
    description?: string,
  ): Promise<ApiResponse<void>> {
    return api.post(`/api/comments/${commentId}/report`, {
      reason,
      description,
    });
  }

  /**
   * Get user's comments
   */
  async getUserComments(
    userId: string,
    filters: Omit<CommentFilters, 'parentId'> = {},
  ): Promise<ApiResponse<Comment[]>> {
    return api.get(`/api/users/${userId}/comments`, filters);
  }

  /**
   * Get comments awaiting moderation
   */
  async getPendingComments(
    videoId?: string,
    filters: CommentFilters = {},
  ): Promise<ApiResponse<Comment[]>> {
    const params = videoId ? { videoId, ...filters } : filters;
    return api.get('/api/comments/pending', params);
  }

  /**
   * Moderate a comment
   */
  async moderateComment(data: CommentModerationAction): Promise<ApiResponse<void>> {
    const { commentId, ...moderationData } = data;
    return api.post(`/api/comments/${commentId}/moderate`, moderationData);
  }

  /**
   * Bulk moderate comments
   */
  async bulkModerateComments(
    commentIds: string[],
    action: CommentModerationAction['action'],
    reason?: string,
  ): Promise<ApiResponse<{ success: string[]; failed: string[] }>> {
    return api.post('/api/comments/bulk-moderate', {
      commentIds,
      action,
      reason,
    });
  }

  /**
   * Search comments
   */
  async searchComments(
    query: string,
    videoId?: string,
    filters: CommentFilters = {},
  ): Promise<ApiResponse<Comment[]>> {
    const params = { query, ...(videoId && { videoId }), ...filters };
    return api.get('/api/comments/search', params);
  }

  /**
   * Get comment statistics
   */
  async getCommentStats(videoId: string): Promise<ApiResponse<{
    totalComments: number;
    totalReplies: number;
    averageRating: number;
    topCommenters: Array<{
      userId: string;
      username: string;
      commentCount: number;
    }>;
    sentimentAnalysis: {
      positive: number;
      negative: number;
      neutral: number;
    };
  }>> {
    return api.get(`/api/videos/${videoId}/comments/stats`);
  }

  /**
   * Get trending comments
   */
  async getTrendingComments(
    timeframe: '1h' | '24h' | '7d' | '30d' = '24h',
    limit: number = 20,
  ): Promise<ApiResponse<Comment[]>> {
    return api.get('/api/comments/trending', { timeframe, limit });
  }

  /**
   * Get comment thread (comment + all replies)
   */
  async getCommentThread(commentId: string): Promise<ApiResponse<{
    comment: Comment;
    replies: Comment[];
    totalReplies: number;
  }>> {
    return api.get(`/api/comments/${commentId}/thread`);
  }

  /**
   * Subscribe to comment notifications
   */
  async subscribeToComments(videoId: string): Promise<ApiResponse<void>> {
    return api.post(`/api/videos/${videoId}/comments/subscribe`);
  }

  /**
   * Unsubscribe from comment notifications
   */
  async unsubscribeFromComments(videoId: string): Promise<ApiResponse<void>> {
    return api.delete(`/api/videos/${videoId}/comments/subscribe`);
  }

  /**
   * Get comment mentions for user
   */
  async getCommentMentions(
    userId: string,
    filters: CommentFilters = {},
  ): Promise<ApiResponse<Comment[]>> {
    return api.get(`/api/users/${userId}/mentions`, filters);
  }

  /**
   * Mark comment mentions as read
   */
  async markMentionsAsRead(commentIds: string[]): Promise<ApiResponse<void>> {
    return api.post('/api/comments/mentions/read', { commentIds });
  }

  /**
   * Get comment analytics for video owner
   */
  async getCommentAnalytics(
    videoId: string,
    timeframe: '7d' | '30d' | '90d' = '30d',
  ): Promise<ApiResponse<{
    totalComments: number;
    commentsOverTime: Array<{ date: string; count: number }>;
    topKeywords: Array<{ keyword: string; count: number }>;
    engagementRate: number;
    responseRate: number;
    averageResponseTime: number;
  }>> {
    return api.get(`/api/videos/${videoId}/comments/analytics`, { timeframe });
  }

  /**
   * Auto-moderate comments using AI
   */
  async autoModerateComments(
    videoId: string,
    settings: {
      enableSpamDetection: boolean;
      enableToxicityDetection: boolean;
      enableLanguageFilter: boolean;
      customKeywords?: string[];
    },
  ): Promise<ApiResponse<{
    processed: number;
    flagged: number;
    approved: number;
    rejected: number;
  }>> {
    return api.post(`/api/videos/${videoId}/comments/auto-moderate`, settings);
  }

  /**
   * Export comments
   */
  async exportComments(
    videoId: string,
    format: 'csv' | 'json' | 'xlsx',
  ): Promise<ApiResponse<string>> {
    return api.get(`/api/videos/${videoId}/comments/export`, { format });
  }
}

export const commentService = new CommentService();
export default commentService;
