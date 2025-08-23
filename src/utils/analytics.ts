// Analytics - Minimal Implementation
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
}

export const trackEvent = (
  name: string,
  properties?: AnalyticsEvent['properties']
): void => {
  try {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now()
    };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
    }
    
    // Send to analytics service (placeholder)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', name, properties);
    }
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
};

export const trackPageView = (path: string): void => {
  trackEvent('page_view', { path });
};

export const trackUserAction = (action: string, details?: Record<string, any>): void => {
  trackEvent('user_action', { action, ...details });
};

export const trackError = (error: Error, context?: string): void => {
  trackEvent('error', {
    message: error.message,
    stack: error.stack,
    context
  });
};