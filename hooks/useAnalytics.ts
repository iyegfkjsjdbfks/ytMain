import { useEffect, useCallback, useRef } from 'react';

import { useLocation } from 'react-router-dom';

import { analyticsService } from '../services/analyticsService';

import { usePerformanceMonitor } from './usePerformanceMonitor';

import type { AnalyticsEvent } from '../services/analyticsService';

interface UseAnalyticsOptions {
  trackPageViews?: boolean;
  trackPerformance?: boolean;
  trackClicks?: boolean;
  trackScrollDepth?: boolean;
  trackTimeOnPage?: boolean;
  componentName?: string;
}

const DEFAULT_OPTIONS: UseAnalyticsOptions = {
  trackPageViews: true,
  trackPerformance: false,
  trackClicks: false,
  trackScrollDepth: false,
  trackTimeOnPage: false,
};

export const useAnalytics = (options: UseAnalyticsOptions = {}) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const location = useLocation();
  const pageStartTime = useRef<number>(Date.now());
  const maxScrollDepth = useRef<number>(0);
  const scrollDepthMarkers = useRef<Set<number>>(new Set());

  const { trackAsyncOperation, measureFunction } = usePerformanceMonitor(
    opts.componentName || 'Unknown',
    { enableRenderTracking: opts.trackPerformance },
  );

  // Track page views
  useEffect(() => {
    if (opts.trackPageViews) {
      analyticsService.trackPageView(location.pathname);
      pageStartTime.current = Date.now();
      maxScrollDepth.current = 0;
      scrollDepthMarkers.current.clear();
    }
  }, [location.pathname, opts.trackPageViews]);

  // Track time on page
  useEffect(() => {
    if (!opts.trackTimeOnPage) {
return;
}

    const handleBeforeUnload = () => {
      const timeOnPage = Date.now() - pageStartTime.current;
      analyticsService.track('time_on_page', {
        duration: timeOnPage,
        path: location.pathname,
        maxScrollDepth: maxScrollDepth.current,
      }, 'engagement');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [location.pathname, opts.trackTimeOnPage]);

  // Track scroll depth
  useEffect(() => {
    if (!opts.trackScrollDepth) {
return;
}

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);

      maxScrollDepth.current = Math.max(maxScrollDepth.current, scrollPercentage);

      // Track milestone markers (25%, 50%, 75%, 100%)
      const markers = [25, 50, 75, 100];
      markers.forEach(marker => {
        if (scrollPercentage >= marker && !scrollDepthMarkers.current.has(marker)) {
          scrollDepthMarkers.current.add(marker);
          analyticsService.track('scroll_depth', {
            percentage: marker,
            path: location.pathname,
          }, 'engagement');
        }
      });
    };

    const throttledScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [location.pathname, opts.trackScrollDepth]);

  // Track clicks
  useEffect(() => {
    if (!opts.trackClicks) {
return;
}

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const { className } = target;
      const { id } = target;
      const text = target.textContent?.slice(0, 100); // Limit text length

      // Only track meaningful clicks
      if (['button', 'a', 'input'].includes(tagName) || target.onclick || className.includes('clickable')) {
        analyticsService.trackClick('element', {
          tagName,
          className,
          id,
          text,
          path: location.pathname,
          coordinates: {
            x: event.clientX,
            y: event.clientY,
          },
        });
      }
    };

    document.addEventListener('click', handleClick, { passive: true });
    return () => document.removeEventListener('click', handleClick);
  }, [location.pathname, opts.trackClicks]);

  // Analytics methods
  const track = useCallback((
    eventName: string,
    properties?: Record<string, any>,
    category?: AnalyticsEvent['category'],
  ) => {
    analyticsService.track(eventName, {
      ...properties,
      componentName: opts.componentName,
      path: location.pathname,
    }, category);
  }, [location.pathname, opts.componentName]);

  const trackClick = useCallback((element: string, properties?: Record<string, any>) => {
    analyticsService.trackClick(element, {
      ...properties,
      componentName: opts.componentName,
      path: location.pathname,
    });
  }, [location.pathname, opts.componentName]);

  const trackVideoEvent = useCallback((
    action: string,
    videoId: string,
    properties?: Record<string, any>,
  ) => {
    analyticsService.trackVideoEvent(action, videoId, {
      ...properties,
      componentName: opts.componentName,
      path: location.pathname,
    });
  }, [location.pathname, opts.componentName]);

  const trackSearch = useCallback((query: string, results?: number) => {
    analyticsService.trackSearch(query, results);
  }, []);

  const trackEngagement = useCallback((type: string, properties?: Record<string, any>) => {
    analyticsService.trackEngagement(type, {
      ...properties,
      componentName: opts.componentName,
      path: location.pathname,
    });
  }, [location.pathname, opts.componentName]);

  const trackAsyncAction = useCallback(async <T>(
    action: () => Promise<T>,
    actionName: string,
    properties?: Record<string, any>,
  ): Promise<T> => {
    const startTime = Date.now();

    try {
      const result = await trackAsyncOperation(action, actionName);
      const duration = Date.now() - startTime;

      track(`${actionName}_success`, {
        duration,
        ...properties,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      track(`${actionName}_error`, {
        duration,
        error: error instanceof Error ? error.message : String(error),
        ...properties,
      });

      throw error;
    }
  }, [track, trackAsyncOperation]);

  const trackFunction = useCallback(<T extends any[], R>(
    fn: (...args: T) => R,
    functionName: string,
    properties?: Record<string, any>,
  ) => {
    return measureFunction((...args: T) => {
      track(`function_${functionName}`, {
        args: args.length,
        ...properties,
      });
      return fn(...args);
    }, functionName);
  }, [track, measureFunction]);

  return {
    track,
    trackClick,
    trackVideoEvent,
    trackSearch,
    trackEngagement,
    trackAsyncAction,
    trackFunction,
  };
};

// Hook for video analytics
export const useVideoAnalytics = (videoId?: string) => {
  const { trackVideoEvent } = useAnalytics();
  const watchStartTime = useRef<number | null>(null);
  const lastProgressUpdate = useRef<number>(0);
  const watchedSegments = useRef<Array<{ start: number; end: number }>>([]);

  const trackPlay = useCallback((currentTime: number = 0) => {
    watchStartTime.current = Date.now();
    trackVideoEvent('play', videoId || '', {
      currentTime,
      timestamp: Date.now(),
    });
  }, [trackVideoEvent, videoId]);

  const trackPause = useCallback((currentTime: number = 0) => {
    if (watchStartTime.current) {
      const watchDuration = Date.now() - watchStartTime.current;
      trackVideoEvent('pause', videoId || '', {
        currentTime,
        watchDuration,
        timestamp: Date.now(),
      });
      watchStartTime.current = null;
    }
  }, [trackVideoEvent, videoId]);

  const trackProgress = useCallback((currentTime: number, duration: number) => {
    const progressPercentage = Math.round((currentTime / duration) * 100);

    // Track progress milestones
    const milestones = [25, 50, 75, 90, 100];
    milestones.forEach(milestone => {
      if (progressPercentage >= milestone && lastProgressUpdate.current < milestone) {
        trackVideoEvent('progress', videoId || '', {
          percentage: milestone,
          currentTime,
          duration,
        });
      }
    });

    lastProgressUpdate.current = progressPercentage;
  }, [trackVideoEvent, videoId]);

  const trackSeek = useCallback((fromTime: number, toTime: number) => {
    trackVideoEvent('seek', videoId || '', {
      fromTime,
      toTime,
      seekDistance: Math.abs(toTime - fromTime),
    });
  }, [trackVideoEvent, videoId]);

  const trackComplete = useCallback((duration: number) => {
    const totalWatchTime = watchedSegments.current.reduce(
      (total, segment) => total + (segment.end - segment.start),
      0,
    );

    trackVideoEvent('complete', videoId || '', {
      duration,
      totalWatchTime,
      completionRate: (totalWatchTime / duration) * 100,
    });
  }, [trackVideoEvent, videoId]);

  const trackError = useCallback((error: string) => {
    trackVideoEvent('error', videoId || '', {
      error,
      timestamp: Date.now(),
    });
  }, [trackVideoEvent, videoId]);

  const trackQualityChange = useCallback((quality: string) => {
    trackVideoEvent('quality_change', videoId || '', {
      quality,
      timestamp: Date.now(),
    });
  }, [trackVideoEvent, videoId]);

  const trackVolumeChange = useCallback((volume: number, muted: boolean) => {
    trackVideoEvent('volume_change', videoId || '', {
      volume,
      muted,
      timestamp: Date.now(),
    });
  }, [trackVideoEvent, videoId]);

  const trackFullscreen = useCallback((isFullscreen: boolean) => {
    trackVideoEvent(isFullscreen ? 'fullscreen_enter' : 'fullscreen_exit', videoId || '', {
      timestamp: Date.now(),
    });
  }, [trackVideoEvent, videoId]);

  return {
    trackPlay,
    trackPause,
    trackProgress,
    trackSeek,
    trackComplete,
    trackError,
    trackQualityChange,
    trackVolumeChange,
    trackFullscreen,
  };
};

// Hook for form analytics
export const useFormAnalytics = (formName: string) => {
  const { track } = useAnalytics();
  const formStartTime = useRef<number | null>(null);
  const fieldInteractions = useRef<Record<string, number>>({});

  const trackFormStart = useCallback(() => {
    formStartTime.current = Date.now();
    track('form_start', { formName });
  }, [track, formName]);

  const trackFormSubmit = useCallback((success: boolean, errors?: string[]) => {
    const duration = formStartTime.current ? Date.now() - formStartTime.current : 0;

    track('form_submit', {
      formName,
      success,
      duration,
      errors,
      fieldInteractions: Object.keys(fieldInteractions.current).length,
    });
  }, [track, formName]);

  const trackFieldInteraction = useCallback((fieldName: string) => {
    fieldInteractions.current[fieldName] = (fieldInteractions.current[fieldName] || 0) + 1;

    track('form_field_interaction', {
      formName,
      fieldName,
      interactionCount: fieldInteractions.current[fieldName],
    });
  }, [track, formName]);

  const trackFormAbandon = useCallback((lastField?: string) => {
    const duration = formStartTime.current ? Date.now() - formStartTime.current : 0;

    track('form_abandon', {
      formName,
      duration,
      lastField,
      fieldInteractions: Object.keys(fieldInteractions.current).length,
    });
  }, [track, formName]);

  return {
    trackFormStart,
    trackFormSubmit,
    trackFieldInteraction,
    trackFormAbandon,
  };
};

// Utility function for throttling
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export default useAnalytics;