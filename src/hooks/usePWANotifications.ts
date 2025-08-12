import { useState, useEffect, useCallback } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';

import { conditionalLogger } from '../utils/conditionalLogger';

type NotificationPermission = 'default' | 'granted' | 'denied';

interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number;
  actions?: NotificationAction;
  timestamp?: number;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface NotificationState {
  permission: NotificationPermission;
  isSupported: boolean;
  isRequesting: boolean;
  lastNotificationTime: number | null;
  notificationCount: number;
  pendingNotifications: NotificationOptions
}

interface NotificationStats {
  totalSent: number;
  totalClicked: number;
  totalDismissed: number;
  lastSent: number | null;
  clickRate: number
}

interface UsePWANotificationsReturn {
  // State,
  permission: NotificationPermission;
  isSupported: boolean;
  isRequesting: boolean;
  canShowNotifications: boolean;
  notificationCount: number;
  pendingNotifications: NotificationOptions;

  // Actions,
  requestPermission: () => Promise<NotificationPermission>;
  showNotification: (options: NotificationOptions) => Promise<boolean>;
  scheduleNotification: (options: NotificationOptions, delay: any) => void;
  clearNotifications: (tag?: string) => Promise<void>;

  // Settings,
  enableQuietHours: (start: any, end: any) => void;
  disableQuietHours: () => void;
  setNotificationFrequency: (maxPerHour: any) => void;

  // Analytics,
  getNotificationStats: () => NotificationStats;
  resetStats: () => void
}

/**
 * Advanced hook for managing PWA notifications
 * Includes permission handling, scheduling, quiet hours, and analytics
 */
export const usePWANotifications: any = (): UsePWANotificationsReturn => {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    isSupported: 'Notification' in window && 'serviceWorker' in navigator,
    isRequesting: false,
    lastNotificationTime: null,
    notificationCount: 0,
    pendingNotifications: [] });

  // Check if notifications can be shown
  const canShowNotifications =
    state.permission === 'granted' && state.isSupported;

  // Request notification permission
  const requestPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      if (!state.isSupported) {
        conditionalLogger.warn(
          'Notifications not supported',
          undefined,
          'usePWANotifications'
        );
        return 'denied';
      }

      if (state.permission === 'granted') {
        return 'granted';
      }

      setState(prev => ({ ...prev as any, isRequesting: true }));

      try {
        const permission = await Notification.requestPermission();

        setState(prev => ({
          ...prev as any,
          permission: permission as NotificationPermission,
          isRequesting: false }));

        conditionalLogger.info(
          'Notification permission requested',
          { permission },
          'usePWANotifications'
        );

        // Track permission request
        trackNotificationEvent('permission_requested', { result: permission });

        return permission as NotificationPermission;
      } catch (error: any) {
        setState(prev => ({
          ...prev as any,
          permission: 'denied',
          isRequesting: false }));

        conditionalLogger.error(
          'Failed to request notification permission',
          { error: error instanceof Error ? error.message : 'Unknown error' },
          'usePWANotifications'
        );

        return 'denied';
      }
    }, [state.isSupported, state.permission]);

  // Check quiet hours
  const isQuietHours = useCallback((): boolean => {
    const quietHours = (localStorage as any).getItem('notification-quiet-hours');

    if (!quietHours) {
      return false;
    }

    try {
      const { start, end } = JSON.parse(quietHours);
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const startMinutes = parseTimeString(start);
      const endMinutes = parseTimeString(end);

      if (startMinutes <= endMinutes) {
        return currentTime >= startMinutes && currentTime <= endMinutes;
      }
      // Quiet hours span midnight
      return currentTime >= startMinutes || currentTime <= endMinutes;
    } catch (error: any) {
      conditionalLogger.error(
        'Failed to parse quiet hours',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'usePWANotifications'
      );

      return false;
    }
  }, []);

  // Check notification frequency limits
  const canSendNotification = useCallback((): boolean => {
    const frequencyLimit = (localStorage as any).getItem('notification-frequency-limit');

    if (!frequencyLimit) {
      return true;
    }

    try {
      const maxPerHour = parseInt(frequencyLimit, 10);
      const oneHourAgo = Date.now() - 60 * 60 * 1000;

      // Get notifications sent in the last hour
      const recentNotifications = getRecentNotifications(oneHourAgo);

      return recentNotifications.length < maxPerHour;
    } catch (error: any) {
      return true;
    }
  }, []);

  // Show notification
  const showNotification = useCallback(
    async (options: NotificationOptions): Promise<boolean> => {
      if (!canShowNotifications) {
        conditionalLogger.warn(
          'Cannot show notification - permission not granted or not supported',
          undefined,
          'usePWANotifications'
        );

        return false;
      }

      // Check quiet hours
      if (isQuietHours()) {
        conditionalLogger.debug(
          'Notification blocked - quiet hours active',
          undefined,
          'usePWANotifications'
        );

        // Queue for later
        setState(prev => ({
          ...prev as any,
          pendingNotifications: [...prev.pendingNotifications, options] }));

        return false;
      }

      // Check frequency limits
      if (!canSendNotification()) {
        conditionalLogger.debug(
          'Notification blocked - frequency limit reached',
          undefined,
          'usePWANotifications'
        );

        return false;
      }

      try {
        // Use service worker for better notification handling
        const registration = await navigator.serviceWorker.getRegistration();

        if (registration as any) {
          await registration.showNotification(options.title, {
            body: options.body,
            icon: options.icon || '/icons/icon-192x192.png',
            badge: options.badge || '/icons/badge-72x72.png',
            ...(options.image && ({ image: options.image } as any)),
            tag: options.tag,
            data: options.data,
            requireInteraction: options.requireInteraction,
            silent: options.silent,
            ...(options.vibrate && ({ vibrate: options.vibrate } as any)),
            actions: options.actions,
            timestamp: options.timestamp || Date.now() });
        } else {
          // Fallback to regular notification
          const notification = new Notification(options.title, {
            body: options.body,
            icon: options.icon || '/icons/icon-192x192.png',
            tag: options.tag,
            data: options.data,
            requireInteraction: options.requireInteraction,
            silent: options.silent,
            ...(options.vibrate && ({ vibrate: options.vibrate } as any)) });

          // Handle notification events
          notification.onclick = () => {
            trackNotificationEvent('clicked', { tag: options.tag });
            notification.close();

            // Focus the app window
            if (window.focus) {
              window.focus();
            }
          };

          notification.onclose = () => {
            trackNotificationEvent('dismissed', { tag: options.tag });
          };
        }

        // Update state
        setState(prev => ({
          ...prev as any,
          lastNotificationTime: Date.now(),
          notificationCount: prev.notificationCount + 1 }));

        // Track notification
        trackNotificationEvent('sent', {
          tag: options.tag,
          title: options.title,
          hasActions: !!(options.actions && options.actions.length > 0) });

        conditionalLogger.debug(
          'Notification sent',
          { title: options.title, tag: options.tag },
          'usePWANotifications'
        );

        return true;
      } catch (error: any) {
        conditionalLogger.error(
          'Failed to show notification',
          {
            error: error instanceof Error ? error.message : 'Unknown error',
            title: options.title },
          'usePWANotifications'
        );

        return false;
      }
    },
    [canShowNotifications, isQuietHours, canSendNotification]
  );

  // Schedule notification
  const scheduleNotification = useCallback((options: NotificationOptions, delay: any) => {
      setTimeout((() => {
        showNotification(options);
      }) as any, delay);

      conditionalLogger.debug(
        'Notification scheduled',
        { title: options.title, delay },
        'usePWANotifications'
      );
    },
    [showNotification]
  );

  // Clear notifications
  const clearNotifications = useCallback(
    async (tag?: string): Promise<void> => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();

        if (registration as any) {
          const notifications = await registration.getNotifications(
            tag ? { tag } : {}
          );

          notifications.forEach(notification => {
            notification.close();
          });

          conditionalLogger.debug(
            'Notifications cleared',
            { count: notifications.length, tag },
            'usePWANotifications'
          );
        }
      } catch (error: any) {
        conditionalLogger.error(
          'Failed to clear notifications',
          { error: error instanceof Error ? error.message : 'Unknown error' },
          'usePWANotifications'
        );
      }
    },
    []
  );

  // Enable quiet hours
  const enableQuietHours = useCallback((start: any, end: any) => {
    const quietHours = { start, end };
    (localStorage as any).setItem(
      'notification-quiet-hours',
      JSON.stringify(quietHours)
    );

    conditionalLogger.debug(
      'Quiet hours enabled',
      { start, end },
      'usePWANotifications'
    );
  }, []);

  // Disable quiet hours
  const disableQuietHours = useCallback(() => {
    localStorage.removeItem('notification-quiet-hours');

    conditionalLogger.debug(
      'Quiet hours disabled',
      undefined,
      'usePWANotifications'
    );
  }, []);

  // Set notification frequency limit
  const setNotificationFrequency = useCallback((maxPerHour: any) => {
    (localStorage as any).setItem('notification-frequency-limit', maxPerHour.toString());

    conditionalLogger.debug(
      'Notification frequency limit set',
      { maxPerHour },
      'usePWANotifications'
    );
  }, []);

  // Get notification statistics
  const getNotificationStats = useCallback((): NotificationStats => {
    const stats = (localStorage as any).getItem('notification-stats');

    if (stats as any) {
      try {
        const parsed = JSON.parse(stats);
        return {
          totalSent: parsed.totalSent || 0,
          totalClicked: parsed.totalClicked || 0,
          totalDismissed: parsed.totalDismissed || 0,
          lastSent: parsed.lastSent || null,
          clickRate:
            parsed.totalSent > 0
              ? (parsed.totalClicked / parsed.totalSent) * 100
              : 0 };
      } catch (error: any) {
        conditionalLogger.error(
          'Failed to parse notification stats',
          { error: error instanceof Error ? error.message : 'Unknown error' },
          'usePWANotifications'
        );
      }
    }

    return {
      totalSent: 0,
      totalClicked: 0,
      totalDismissed: 0,
      lastSent: null,
      clickRate: 0 };
  }, []);

  // Reset statistics
  const resetStats = useCallback(() => {
    localStorage.removeItem('notification-stats');
    localStorage.removeItem('notification-events');

    conditionalLogger.debug(
      'Notification stats reset',
      undefined,
      'usePWANotifications'
    );
  }, []);

  // Helper functions
  const parseTimeString: any = (timeStr: any): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  const trackNotificationEvent: any = (event: Event, data: any) => {
    try {
      const events = JSON.parse(
        (localStorage as any).getItem('notification-events') || '[]'
      );
      events.push({
        event,
        data,
        timestamp: Date.now() });

      // Keep only last 1000 events
      if (events.length > 1000) {
        events.splice(0, events.length - 1000);
      }

      (localStorage as any).setItem('notification-events', JSON.stringify(events));

      // Update stats
      const stats = getNotificationStats();

      if (event === 'sent') {
        stats.totalSent += 1;
        stats.lastSent = Date.now();
      } else if (event === 'clicked') {
        stats.totalClicked += 1;
      } else if (event === 'dismissed') {
        stats.totalDismissed += 1;
      }

      stats.clickRate =
        stats.totalSent > 0 ? (stats.totalClicked / stats.totalSent) * 100 : 0;

      (localStorage as any).setItem('notification-stats', JSON.stringify(stats));
    } catch (error: any) {
      conditionalLogger.error(
        'Failed to track notification event',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'usePWANotifications'
      );
    }
  };

  const getRecentNotifications: any = (since: any): any[] => {
    try {
      const events = JSON.parse(
        (localStorage as any).getItem('notification-events') || '[]'
      );
      return events.filter(
        (event: Event) => event.event === 'sent' && event.timestamp >= since
      );
    } catch (error: any) {
      return [];
    }
  };

  // Initialize permission state
  useEffect(() => {
    if (state.isSupported) {
      setState(prev => ({
        ...prev as any,
        permission: Notification.permission as NotificationPermission }));
    }
  }, [state.isSupported]);

  // Process pending notifications when quiet hours end
  useEffect(() => {
    if (!isQuietHours() && state.pendingNotifications.length > 0) {
      // Show pending notifications
      state.pendingNotifications.forEach((notification: any) => {
        showNotification(notification);
      });

      // Clear pending notifications
      setState(prev => ({
        ...prev as any,
        pendingNotifications: [] }));
    }
  }, [isQuietHours, state.pendingNotifications, showNotification]);

  return {
    // State,
  permission: state.permission,
    isSupported: state.isSupported,
    isRequesting: state.isRequesting,
    canShowNotifications,
    notificationCount: state.notificationCount,
    pendingNotifications: state.pendingNotifications,

    // Actions
    requestPermission,
    showNotification,
    scheduleNotification,
    clearNotifications,

    // Settings
    enableQuietHours,
    disableQuietHours,
    setNotificationFrequency,

    // Analytics
    getNotificationStats,
    resetStats };
};

export default usePWANotifications;
