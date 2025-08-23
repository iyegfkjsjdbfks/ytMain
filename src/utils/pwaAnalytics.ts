// PWA Analytics - Minimal Implementation
export interface PWAAnalyticsEvent {
  type: string;
  action: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class PWAAnalytics {
  private events: PWAAnalyticsEvent[] = [];
  private isEnabled: boolean = true;

  private trackEvent(event: PWAAnalyticsEvent): void {
    if (!this.isEnabled) return;
    
    this.events.push({
      ...event,
      timestamp: Date.now()
    });
  }

  trackInstallPromptShown(): void {
    this.trackEvent({ type: 'install', action: 'prompt_shown' });
  }

  trackInstallPromptAccepted(): void {
    this.trackEvent({ type: 'install', action: 'prompt_accepted' });
  }

  trackInstallPromptDismissed(): void {
    this.trackEvent({ type: 'install', action: 'prompt_dismissed' });
  }

  trackAppInstalled(): void {
    this.trackEvent({ type: 'install', action: 'app_installed' });
  }

  trackInstallError(error: Error): void {
    this.trackEvent({ 
      type: 'install', 
      action: 'error',
      metadata: { error: error.message }
    });
  }

  trackPWALaunch(): void {
    this.trackEvent({ type: 'usage', action: 'pwa_launch' });
  }

  trackOfflineUsage(): void {
    this.trackEvent({ type: 'usage', action: 'offline_usage' });
  }

  trackOnlineReturn(): void {
    this.trackEvent({ type: 'usage', action: 'online_return' });
  }

  getStoredEvents(): PWAAnalyticsEvent[] {
    return [...this.events];
  }

  clearStoredEvents(): void {
    this.events = [];
  }

  async syncOfflineEvents(): Promise<void> {
    if (this.events.length === 0) return;
    
    try {
      // Placeholder for syncing events to analytics service
      console.log('Syncing PWA analytics events:', this.events.length);
      this.clearStoredEvents();
    } catch (error) {
      console.warn('Failed to sync PWA analytics:', error);
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  isAnalyticsEnabled(): boolean {
    return this.isEnabled;
  }
}

export default new PWAAnalytics();