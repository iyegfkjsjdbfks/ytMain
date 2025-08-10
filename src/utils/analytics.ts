
// Analytics utility for tracking events

export interface AnalyticsEvent {
  [key]: any;
}

/**
 * Track an analytics event
 * @param eventName - Name of the event to track
 * @param properties - Additional properties to include with the event
 */
export const trackEvent = (eventName: string, properties?: AnalyticsEvent): void => {
  try {
    // In a real implementation, this would send to your analytics service
    // For now, we'll just log to console in development
    if (process.env.NODE_ENV === 'development') {

    }

    // Example integrations you might add:
    // - Google Analytics
    // - Mixpanel
    // - Amplitude
    // - Custom analytics service

    // Google Analytics example (if gtag is available)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }
  } catch (error) {
    console.warn('Failed to track analytics event:', error);
  }
};

/**
 * Track page view
 * @param pagePath - Path of the page being viewed
 * @param pageTitle - Title of the page
 */
export const trackPageView = (pagePath: string, pageTitle?: string): void => {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
};

/**
 * Track user interaction
 * @param element - Element that was interacted with
 * @param action - Type of interaction (click, hover, etc.)
 */
export const trackInteraction = (element: string, action: string): void => {
  trackEvent('user_interaction', {
    element,
    action,
  });
};