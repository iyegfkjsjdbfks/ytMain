imported: number;

import { api } from '../../../services/api/base';

import { logger } from '../../../utils/logger';
import type { ApiResponse } from '../../../types/core';
import type { Video } from '../../../types/video';

export interface Subscription {
  id: string;
  channelId: string;
  channelName: string;
  channelAvatar: string;
  channelHandle: string;
  subscriberCount: number;
  subscribedAt: string;
  notificationLevel: 'all' | 'personalized' | 'none';
  isSubscribed: boolean;
  lastVideoUpload?: string;
  isLive?: boolean;
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  newSubscriptionsToday: number;
  notificationSettings: {
    all: number;
    personalized: number;
    none: number;
  };
}

class SubscriptionService {
  /**
   * Get subscription status for a specific channel
   */
  async getSubscriptionStatus(channelId: any): Promise<Subscription | null> {
    try {
      const response = await api.get(`/api/subscriptions/status/${channelId}`);
      return response.data as Subscription;
    } catch (error) {
      logger.error('Failed to get subscription status:', error);
      return null;
    }
  }

  /**
   * Subscribe to a channel
   */
  async subscribe(channelId: any): Promise<ApiResponse<Subscription>> {
    return api.post('/api/subscriptions', { channelId });
  }

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(channelId: any): Promise<ApiResponse<void>> {
    return api.delete(`/api/subscriptions/${channelId}`);
  }

  /**
   * Update notification level for a subscription
   */
  async updateNotificationLevel(
    channelId: any,
    level: 'all' | 'personalized' | 'none'
  ): Promise<ApiResponse<Subscription>> {
    return api.patch(`/api/subscriptions/${channelId}/notifications`, {
      notificationLevel: level });
  }

  /**
   * Get all user subscriptions
   */
  async getSubscriptions(
    filters: {
      sortBy?: 'recent' | 'alphabetical' | 'most_relevant';
      category?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Subscription[]> {
    try {
      const response = await api.get('/api/subscriptions', filters);
      return (response.data as Subscription) || [];
    } catch (error) {
      logger.error('Failed to get subscriptions:', error);
      return [];
    }
  }

  /**
   * Get subscription feed (videos from subscribed channels)
   */
  async getSubscriptionFeed(
    filters: {
      limit?: number;
      offset?: number;
      timeframe?: '24h' | '7d' | '30d';
      includeShorts?: boolean;
      includeLive?: boolean;
    } = {}
  ): Promise<Video[]> {
    try {
      const response = await api.get('/api/subscriptions/feed', filters);
      return (response.data as Video) || [];
    } catch (error) {
      logger.error('Failed to get subscription feed:', error);
      return [];
    }
  }

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats(): Promise<SubscriptionStats> {
    try {
      const response = await api.get('/api/subscriptions/stats');
      return response.data as SubscriptionStats;
    } catch (error) {
      logger.error('Failed to get subscription stats:', error);
      return {
        totalSubscriptions: 0,
        newSubscriptionsToday: 0,
        notificationSettings: {
          all: 0,
          personalized: 0,
          none: 0 } };
    }
  }

  /**
   * Bulk update notification settings
   */
  async bulkUpdateNotifications(
    updates: Array<{
      channelId: string;
      notificationLevel: 'all' | 'personalized' | 'none';
    }>
  ): Promise<ApiResponse<void>> {
    return api.patch('/api/subscriptions/bulk-notifications', { updates });
  }

  /**
   * Get recommended channels to subscribe to
   */
  async getRecommendedChannels(
    filters: {
      category?: string;
      limit?: number;
      excludeSubscribed?: boolean;
    } = {}
  ): Promise<
    Array<{
      channelId: string;
      channelName: string;
      channelAvatar: string;
      channelHandle: string;
      subscriberCount: number;
      videoCount: number;
      category: string;
      description: string;
      isVerified: boolean;
      recentVideos: Video;
    }>
  > {
    try {
      const response = await api.get('/api/subscriptions/recommended', filters);
      return (
        (response.data as Array<{
          channelId: string;
          channelName: string;
          channelAvatar: string;
          channelHandle: string;
          subscriberCount: number;
          videoCount: number;
          category: string;
          description: string;
          isVerified: boolean;
          recentVideos: Video;
        }>) || []
      );
    } catch (error) {
      logger.error('Failed to get recommended channels:', error);
      return [];
    }
  }

  /**
   * Search within subscribed channels
   */
  async searchSubscriptions(
    query: any,
    filters: {
      includeVideos?: boolean;
      limit?: number;
    } = {}
  ): Promise<{
    channels: Subscription;
    videos: Video;
  }> {
    try {
      const response = await api.get('/api/subscriptions/search', {
        q: query,
        ...filters });
      return response.data as { channels: Subscription; videos: Video[] };
    } catch (error) {
      logger.error('Failed to search subscriptions:', error);
      return {
        channels: [],
        videos: [] };
    }
  }

  /**
   * Get subscription activity (new uploads, live streams, etc.)
   */
  async getSubscriptionActivity(
    filters: {
      timeframe?: '1h' | '6h' | '24h' | '7d';
      types?: Array<'upload' | 'live' | 'premiere' | 'community'>;
      limit?: number;
    } = {}
  ): Promise<
    Array<{
      id: string;
      type: 'upload' | 'live' | 'premiere' | 'community';
      channelId: string;
      channelName: string;
      channelAvatar: string;
      title: string;
      description?: string;
      thumbnail?: string;
      url: string;
      timestamp: string;
      isNew: boolean;
    }>
  > {
    try {
      const response = await api.get('/api/subscriptions/activity', filters);
      return (
        (response.data as Array<{
          id: string;
          type: 'upload' | 'live' | 'premiere' | 'community';
          channelId: string;
          channelName: string;
          channelAvatar: string;
          title: string;
          description?: string;
          thumbnail?: string;
          url: string;
          timestamp: string;
          isNew: boolean;
        }>) || []
      );
    } catch (error) {
      logger.error('Failed to get subscription activity:', error);
      return [];
    }
  }

  /**
   * Export subscription list
   */
  async exportSubscriptions(format: 'json' | 'csv' | 'opml'): Promise<string> {
    try {
      const response = await api.get('/api/subscriptions/export', { format });
      return response.data as string;
    } catch (error) {
      logger.error('Failed to export subscriptions:', error);
      throw error;
    }
  }

  /**
   * Import subscription list
   */
  async importSubscriptions(
    file: File,
    format: 'json' | 'csv' | 'opml'
  ): Promise<
    ApiResponse<{
      skipped: number;
      errors: string;
    }>
  > {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    return api.post('/api/subscriptions/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data' } });
  }

  /**
   * Get subscription trends and insights
   */
  async getSubscriptionInsights(
    timeframe: '7d' | '30d' | '90d' = '30d'
  ): Promise<{
    growthRate: number;
    topCategories: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
    activityTrends: Array<{ date: string; uploads: number; views: number }>;
    engagementMetrics: {
      averageViewsPerVideo: number;
      averageLikesPerVideo: number;
      averageCommentsPerVideo: number;
    };
  }> {
    try {
      const response = await api.get('/api/subscriptions/insights', {
        timeframe });
      return response.data as {
        growthRate: number;
        topCategories: Array<{
          category: string;
          count: number;
          percentage: number;
        }>;
        activityTrends: Array<{ date: string; uploads: number; views: number }>;
        engagementMetrics: {
          averageViewsPerVideo: number;
          averageLikesPerVideo: number;
          averageCommentsPerVideo: number;
        };
      };
    } catch (error) {
      logger.error('Failed to get subscription insights:', error);
      return {
        growthRate: 0,
        topCategories: [],
        activityTrends: [],
        engagementMetrics: {
          averageViewsPerVideo: 0,
          averageLikesPerVideo: 0,
          averageCommentsPerVideo: 0 } };
    }
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
