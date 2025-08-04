import { api } from '../../../services/api/base';
import type { ApiResponse } from '../../../types/core';

/**
 * Notification Service
 * Comprehensive notification management system
 */



export interface Notification {
  id: string;
  type: 'video_upload' | 'comment_reply' | 'like' | 'subscribe' | 'live_stream' | 'mention' | 'system' | 'milestone';
  title: string;
  message: string;
  data?: Record<string, any>;
  userId: string;
  fromUserId?: string;
  fromUserName?: string;
  fromUserAvatar?: string;
  videoId?: string;
  channelId?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'engagement' | 'content' | 'social' | 'system' | 'monetization';
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  thumbnail?: string;
  expiresAt?: string;
}

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    frequency: 'instant' | 'daily' | 'weekly';
    types: NotificationType[];
  };
  push: {
    enabled: boolean;
    types: NotificationType[];
  };
  inApp: {
    enabled: boolean;
    types: NotificationType[];
  };
  sms: {
    enabled: boolean;
    types: NotificationType[];
  };
}

export type NotificationType = Notification['type'];

export interface NotificationFilters {
  type?: NotificationType | NotificationType[];
  category?: Notification['category'];
  priority?: Notification['priority'];
  isRead?: boolean;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface CreateNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  data?: Record<string, any>;
  priority?: Notification['priority'];
  category?: Notification['category'];
  actionUrl?: string;
  thumbnail?: string;
  expiresAt?: string;
}

class NotificationService {
  /**
   * Get user notifications
   */
  async getNotifications(
    filters: NotificationFilters = {},
  ): Promise<ApiResponse<Notification[]>> {
    return api.get('/api/notifications', filters);
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<ApiResponse<number>> {
    return api.get('/api/notifications/unread/count');
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<ApiResponse<void>> {
    return api.patch(`/api/notifications/${notificationId}/read`);
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: string[]): Promise<ApiResponse<void>> {
    return api.patch('/api/notifications/read', { notificationIds });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<ApiResponse<void>> {
    return api.patch('/api/notifications/read-all');
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
    return api.delete(`/api/notifications/${notificationId}`);
  }

  /**
   * Delete multiple notifications
   */
  async deleteMultiple(notificationIds: string[]): Promise<ApiResponse<void>> {
    return api.delete('/api/notifications/bulk', {
      body: JSON.stringify({ notificationIds }),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Clear all notifications
   */
  async clearAll(): Promise<ApiResponse<void>> {
    return api.delete('/api/notifications/all');
  }

  /**
   * Clear all notifications (alias)
   */
  async clearAllNotifications(): Promise<ApiResponse<void>> {
    return this.clearAll();
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<ApiResponse<any>> {
    return api.get('/api/notifications/settings');
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: any): Promise<ApiResponse<any>> {
    return api.put('/api/notifications/settings', settings);
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<ApiResponse<any>> {
    return api.get('/api/notifications/stats');
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    return api.get('/api/notifications/preferences');
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    preferences: Partial<NotificationPreferences>,
  ): Promise<ApiResponse<NotificationPreferences>> {
    return api.put('/api/notifications/preferences', preferences);
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(
    subscription: PushSubscription,
  ): Promise<ApiResponse<void>> {
    return api.post('/api/notifications/push/subscribe', {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.getKey('p256dh'),
        auth: subscription.getKey('auth'),
      },
    });
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<ApiResponse<void>> {
    return api.delete('/api/notifications/push/subscribe');
  }

  /**
   * Test notification delivery
   */
  async testNotification(
    type: 'email' | 'push' | 'sms',
    message?: string,
  ): Promise<ApiResponse<void>> {
    return api.post('/api/notifications/test', { type, message });
  }

  /**
   * Create notification (admin/system use)
   */
  async createNotification(
    data: CreateNotificationData,
  ): Promise<ApiResponse<Notification>> {
    return api.post('/api/notifications', data);
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(
    userIds: string[],
    notification: Omit<CreateNotificationData, 'userId'>,
  ): Promise<ApiResponse<{ sent: number; failed: number }>> {
    return api.post('/api/notifications/bulk', {
      userIds,
      notification,
    });
  }

  /**
   * Get notification templates
   */
  async getTemplates(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    type: NotificationType;
    template: string;
    variables: string[];
  }>>> {
    return api.get('/api/notifications/templates');
  }

  /**
   * Create notification template
   */
  async createTemplate(template: {
    name: string;
    type: NotificationType;
    template: string;
    variables: string[];
  }): Promise<ApiResponse<void>> {
    return api.post('/api/notifications/templates', template);
  }

  /**
   * Get notification analytics
   */
  async getAnalytics(
    timeframe: '7d' | '30d' | '90d' = '30d',
  ): Promise<ApiResponse<{
    totalSent: number;
    totalRead: number;
    readRate: number;
    clickRate: number;
    unsubscribeRate: number;
    byType: Array<{
      type: NotificationType;
      sent: number;
      read: number;
      clicked: number;
    }>;
    byChannel: Array<{
      channel: 'email' | 'push' | 'inApp' | 'sms';
      sent: number;
      delivered: number;
      read: number;
    }>;
    engagement: Array<{
      date: string;
      sent: number;
      read: number;
      clicked: number;
    }>;
  }>> {
    return api.get('/api/notifications/analytics', { timeframe });
  }

  /**
   * Schedule notification
   */
  async scheduleNotification(
    data: CreateNotificationData,
    scheduledFor: string,
  ): Promise<ApiResponse<void>> {
    return api.post('/api/notifications/schedule', {
      ...data,
      scheduledFor,
    });
  }

  /**
   * Cancel scheduled notification
   */
  async cancelScheduledNotification(
    notificationId: string,
  ): Promise<ApiResponse<void>> {
    return api.delete(`/api/notifications/schedule/${notificationId}`);
  }

  /**
   * Get scheduled notifications
   */
  async getScheduledNotifications(): Promise<ApiResponse<Array<{
    id: string;
    notification: CreateNotificationData;
    scheduledFor: string;
    status: 'pending' | 'sent' | 'cancelled';
  }>>> {
    return api.get('/api/notifications/scheduled');
  }

  /**
   * Snooze notification
   */
  async snoozeNotification(
    notificationId: string,
    snoozeUntil: string,
  ): Promise<ApiResponse<void>> {
    return api.patch(`/api/notifications/${notificationId}/snooze`, {
      snoozeUntil,
    });
  }

  /**
   * Get notification delivery status
   */
  async getDeliveryStatus(
    notificationId: string,
  ): Promise<ApiResponse<{
    email?: { status: 'sent' | 'delivered' | 'failed'; timestamp: string };
    push?: { status: 'sent' | 'delivered' | 'failed'; timestamp: string };
    sms?: { status: 'sent' | 'delivered' | 'failed'; timestamp: string };
  }>> {
    return api.get(`/api/notifications/${notificationId}/delivery`);
  }

  /**
   * Archive old notifications
   */
  async archiveOldNotifications(
    olderThan: string,
  ): Promise<ApiResponse<{ archived: number }>> {
    return api.post('/api/notifications/archive', { olderThan });
  }

  /**
   * Get notification digest
   */
  async getDigest(
    period: 'daily' | 'weekly' | 'monthly',
  ): Promise<ApiResponse<{
    period: string;
    summary: {
      totalNotifications: number;
      unreadCount: number;
      topTypes: Array<{ type: NotificationType; count: number }>;
    };
    highlights: Notification[];
    trends: Array<{
      type: NotificationType;
      change: number;
      trend: 'up' | 'down' | 'stable';
    }>;
  }>> {
    return api.get('/api/notifications/digest', { period });
  }

  /**
   * Export notifications
   */
  async exportNotifications(
    format: 'csv' | 'json',
    filters: NotificationFilters = {},
  ): Promise<ApiResponse<string>> {
    return api.get('/api/notifications/export', { format, ...filters });
  }

  /**
   * Real-time notification subscription (WebSocket)
   */
  subscribeToRealTime(
    onNotification: (notification: Notification) => void,
    onError?: (error: Error) => void,
  ): () => void {
    const ws = new WebSocket(`${api.createUrl('/api/notifications/ws').replace('http', 'ws')}`);

    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        onNotification(notification);
      } catch (error) {
        onError?.(new Error('Failed to parse notification'));
      }
    };

    ws.onerror = () => {
      onError?.(new Error('WebSocket connection error'));
    };

    return () => {
      ws.close();
    };
  }
}

export const notificationService = new NotificationService();
export default notificationService;
