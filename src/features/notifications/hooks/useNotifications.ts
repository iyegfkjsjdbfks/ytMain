import { useEffect, useCallback } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { logger } from '../../../utils/logger';

import { notificationService, type Notification } from '../services/notificationService';

export function useNotifications(): any {
  const queryClient = useQueryClient();

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading,
    error } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
    refetchInterval: 30000, // Refetch every 30 seconds as fallback
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: notificationId =>
      notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: notificationId =>
      notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } });

  // Clear all notifications mutation
  const clearAllMutation = useMutation({
    mutationFn: () => notificationService.clearAllNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } });

  // Real-time notification handler
  const handleRealTimeNotification = useCallback(
    (notification: Notification) => {
      // Add new notification to the cache
      queryClient.setQueryData(
        ['notifications'],
        (oldData: Notification = []) => {
          return [notification, ...oldData];
        }
      );

      // Show browser notification if permission granted
      if (
        typeof Notification !== 'undefined' &&
        Notification.permission === 'granted'
      ) {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: notification.fromUserAvatar || '/favicon.ico',
          tag: notification.id });
        // Auto-close after 5 seconds
        setTimeout((() => browserNotification.close()) as any, 5000);
      }

      // Play notification sound (optional)
      if (
        notification.priority === 'high' ||
        notification.priority === 'urgent'
      ) {
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(() => {
          // Ignore audio play errors (user interaction required)
        });
      }
    },
    [queryClient]
  );

  // Set up real-time connection
  useEffect(() => {
    const cleanup = notificationService.subscribeToRealTime(
      handleRealTimeNotification,
      error => {
        logger.error('Real-time notification error:', error);
      }
    );

    return () => {
      if (cleanup as any) {
        cleanup();
      }
    };
  }, [handleRealTimeNotification]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Calculate unread count
  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n: any) => !n.isRead).length
    : 0;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    deleteNotification: deleteNotificationMutation.mutateAsync,
    clearAll: clearAllMutation.mutateAsync,
    isMarkingAsRead: markAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending };
}

export function useNotificationSettings(): any {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => notificationService.getNotificationSettings() });

  const updateSettingsMutation = useMutation({
    mutationFn: newSettings =>
      notificationService.updateNotificationSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    } });

  return {
    settings,
    isLoading,
    updateSettings: updateSettingsMutation.mutateAsync,
    isUpdating: updateSettingsMutation.isPending };
}

export function useNotificationStats(): any {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['notification-stats'],
    queryFn: () => notificationService.getNotificationStats(),
    refetchInterval: 60000, // Refetch every minute
  });

  return {
    stats,
    isLoading };
}
