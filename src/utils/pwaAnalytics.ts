import { conditionalLogger } from './conditionalLogger';
import React from 'react';
import { createNetworkError } from '../types/errors';

// PWA Analytics Utilities

interface PWAAnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

class PWAAnalytics {
  private isEnabled: boolean = true;
  private events: PWAAnalyticsEvent = [];

  constructor() {
    this.initializeAnalytics();
  }

  private initializeAnalytics() {
    // Check if analytics is available (Google Analytics, etc.)
    this.isEnabled = typeof window !== 'undefined' && 'gtag' in window;
  }

  private trackEvent(event: PWAAnalyticsEvent) {
    if (!this.isEnabled) {
      conditionalLogger.debug(
        'PWA Analytics Event (disabled)',
        event,
        'PWAAnalytics'
      );
      return;
    }

    // Store event for offline tracking
    this.events.push({
      ...event,
      timestamp: Date.now(),
    } as PWAAnalyticsEvent & { timestamp: number });

    // Send to Google Analytics if available
    if ('gtag' in window) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.custom_parameters,
      });
    }
  }

  // PWA Installation Events
  trackInstallPromptShown() {
    this.trackEvent({
      action: 'install_prompt_shown',
      category: 'PWA',
      label: 'Install Banner Displayed',
    });
  }

  trackInstallPromptAccepted() {
    this.trackEvent({
      action: 'install_prompt_accepted',
      category: 'PWA',
      label: 'User Clicked Install',
    });
  }

  trackInstallPromptDismissed() {
    this.trackEvent({
      action: 'install_prompt_dismissed',
      category: 'PWA',
      label: 'User Dismissed Install',
    });
  }

  trackAppInstalled() {
    this.trackEvent({
      action: 'app_installed',
      category: 'PWA',
      label: 'App Successfully Installed',
    });
  }

  trackInstallError(error: Error) {
    this.trackEvent({
      action: 'install_error',
      category: 'PWA',
      label: 'Installation Failed',
      custom_parameters: { error },
    });
  }

  // PWA Usage Events
  trackPWALaunch() {
    this.trackEvent({
      action: 'pwa_launch',
      category: 'PWA',
      label: 'App Launched in Standalone Mode',
    });
  }

  trackOfflineUsage() {
    this.trackEvent({
      action: 'offline_usage',
      category: 'PWA',
      label: 'App Used While Offline',
    });
  }

  trackOnlineReturn() {
    this.trackEvent({
      action: 'online_return',
      category: 'PWA',
      label: 'App Returned Online',
    });
  }

  // Service Worker Events
  trackServiceWorkerInstalled() {
    this.trackEvent({
      action: 'sw_installed',
      category: 'PWA',
      label: 'Service Worker Installed',
    });
  }

  trackServiceWorkerUpdated() {
    this.trackEvent({
      action: 'sw_updated',
      category: 'PWA',
      label: 'Service Worker Updated',
    });
  }

  trackServiceWorkerError(error: Error) {
    this.trackEvent({
      action: 'sw_error',
      category: 'PWA',
      label: 'Service Worker Error',
      custom_parameters: { error },
    });
  }

  // Cache Events
  trackCacheHit(resource: any) {
    this.trackEvent({
      action: 'cache_hit',
      category: 'PWA',
      label: 'Resource Served from Cache',
      custom_parameters: { resource },
    });
  }

  trackCacheMiss(resource: any) {
    this.trackEvent({
      action: 'cache_miss',
      category: 'PWA',
      label: 'Resource Not in Cache',
      custom_parameters: { resource },
    });
  }

  trackCacheError(error: Error) {
    this.trackEvent({
      action: 'cache_error',
      category: 'PWA',
      label: 'Cache Operation Failed',
      custom_parameters: { error },
    });
  }

  // Background Sync Events
  trackBackgroundSync(tag: any) {
    this.trackEvent({
      action: 'background_sync',
      category: 'PWA',
      label: 'Background Sync Triggered',
      custom_parameters: { tag },
    });
  }

  trackBackgroundSyncSuccess(tag: any) {
    this.trackEvent({
      action: 'background_sync_success',
      category: 'PWA',
      label: 'Background Sync Completed',
      custom_parameters: { tag },
    });
  }

  trackBackgroundSyncError(tag: any, error: Error) {
    this.trackEvent({
      action: 'background_sync_error',
      category: 'PWA',
      label: 'Background Sync Failed',
      custom_parameters: { tag, error },
    });
  }

  // Push Notification Events
  trackNotificationPermissionRequested() {
    this.trackEvent({
      action: 'notification_permission_requested',
      category: 'PWA',
      label: 'Notification Permission Requested',
    });
  }

  trackNotificationPermissionGranted() {
    this.trackEvent({
      action: 'notification_permission_granted',
      category: 'PWA',
      label: 'Notification Permission Granted',
    });
  }

  trackNotificationPermissionDenied() {
    this.trackEvent({
      action: 'notification_permission_denied',
      category: 'PWA',
      label: 'Notification Permission Denied',
    });
  }

  trackNotificationReceived() {
    this.trackEvent({
      action: 'notification_received',
      category: 'PWA',
      label: 'Push Notification Received',
    });
  }

  trackNotificationClicked() {
    this.trackEvent({
      action: 'notification_clicked',
      category: 'PWA',
      label: 'Push Notification Clicked',
    });
  }

  // Offline Storage Events
  trackOfflineVideoSaved(videoId: any) {
    this.trackEvent({
      action: 'offline_video_saved',
      category: 'PWA',
      label: 'Video Saved for Offline',
      custom_parameters: { videoId },
    });
  }

  trackOfflineVideoPlayed(videoId: any) {
    this.trackEvent({
      action: 'offline_video_played',
      category: 'PWA',
      label: 'Offline Video Played',
      custom_parameters: { videoId },
    });
  }

  trackStorageQuotaExceeded() {
    this.trackEvent({
      action: 'storage_quota_exceeded',
      category: 'PWA',
      label: 'Storage Quota Exceeded',
    });
  }

  trackStorageCleanup(itemsRemoved: any) {
    this.trackEvent({
      action: 'storage_cleanup',
      category: 'PWA',
      label: 'Storage Cleanup Performed',
      value: itemsRemoved,
    });
  }

  // Update Events
  trackUpdateAvailable() {
    this.trackEvent({
      action: 'update_available',
      category: 'PWA',
      label: 'App Update Available',
    });
  }

  trackUpdateInstalled() {
    this.trackEvent({
      action: 'update_installed',
      category: 'PWA',
      label: 'App Update Installed',
    });
  }

  trackUpdateDismissed() {
    this.trackEvent({
      action: 'update_dismissed',
      category: 'PWA',
      label: 'App Update Dismissed',
    });
  }

  // Share Events
  trackShareAttempt(method: any) {
    this.trackEvent({
      action: 'share_attempt',
      category: 'PWA',
      label: 'Share Attempted',
      custom_parameters: { method },
    });
  }

  trackShareSuccess(method: any) {
    this.trackEvent({
      action: 'share_success',
      category: 'PWA',
      label: 'Share Completed',
      custom_parameters: { method },
    });
  }

  trackShareError(method: any, error: Error) {
    this.trackEvent({
      action: 'share_error',
      category: 'PWA',
      label: 'Share Failed',
      custom_parameters: { method, error },
    });
  }

  // Performance Events
  trackPerformanceMetric(metric: any, value: string | number, unit: any) {
    this.trackEvent({
      action: 'performance_metric',
      category: 'PWA',
      label: `Performance: ${metric}`,
      value,
      custom_parameters: { metric, unit },
    });
  }

  // Utility Methods
  getStoredEvents(): PWAAnalyticsEvent[] {
    return [...this.events];
  }

  clearStoredEvents(): void {
    this.events = [];
  }

  async syncOfflineEvents(): Promise<void> {
    if (this.events.length === 0) {
      return;
    }

    try {
      // In a real implementation, you would send these to your analytics endpoint
      conditionalLogger.debug(
        'Syncing offline PWA events',
        { eventCount: this.events.length },
        'PWAAnalytics'
      );

      // Clear events after successful sync
      this.clearStoredEvents();
    } catch (error) {
      const networkError = createNetworkError(
        `Failed to sync PWA analytics events: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'analytics-endpoint'
      );
      conditionalLogger.error(
        'Failed to sync PWA analytics events',
        networkError,
        'PWAAnalytics'
      );
    }
  }

  // Enable/disable analytics
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  isAnalyticsEnabled(): boolean {
    return this.isEnabled;
  }
}

// Create singleton instance
export const pwaAnalytics = new PWAAnalytics();

// Export class for testing
export { PWAAnalytics };

// Export types
export type { PWAAnalyticsEvent };
