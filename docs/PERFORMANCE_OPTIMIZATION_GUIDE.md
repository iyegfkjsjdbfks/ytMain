# Performance Optimization Guide

## Overview

This comprehensive guide outlines strategies and techniques to optimize the performance of the YouTubeX application, covering bundle size optimization, runtime performance, user experience enhancements, and monitoring.

## Table of Contents

1. [Performance Metrics](#performance-metrics)
2. [Bundle Optimization](#bundle-optimization)
3. [Runtime Performance](#runtime-performance)
4. [Image and Media Optimization](#image-and-media-optimization)
5. [Network Optimization](#network-optimization)
6. [Memory Management](#memory-management)
7. [Rendering Optimization](#rendering-optimization)
8. [Progressive Web App Optimization](#progressive-web-app-optimization)
9. [Monitoring and Analytics](#monitoring-and-analytics)
10. [Performance Budget](#performance-budget)

## Performance Metrics

### Core Web Vitals

#### 1. **Largest Contentful Paint (LCP)**
- **Target**: < 2.5 seconds
- **Measures**: Loading performance
- **Optimization**: Image optimization, server response times, render-blocking resources

#### 2. **First Input Delay (FID)**
- **Target**: < 100 milliseconds
- **Measures**: Interactivity
- **Optimization**: JavaScript execution time, main thread blocking

#### 3. **Cumulative Layout Shift (CLS)**
- **Target**: < 0.1
- **Measures**: Visual stability
- **Optimization**: Image dimensions, font loading, dynamic content

### Additional Metrics

```typescript
// Performance monitoring utility
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  measureCoreWebVitals(): void {
    // LCP
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.set('lcp', lastEntry.startTime);
      this.reportMetric('lcp', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // FID
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        this.metrics.set('fid', entry.processingStart - entry.startTime);
        this.reportMetric('fid', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });
    
    // CLS
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.metrics.set('cls', clsValue);
      this.reportMetric('cls', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
  
  measureCustomMetrics(): void {
    // Time to Interactive
    this.measureTTI();
    
    // First Contentful Paint
    this.measureFCP();
    
    // Bundle size
    this.measureBundleSize();
  }
  
  private measureTTI(): void {
    // Implementation for TTI measurement
  }
  
  private measureFCP(): void {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.set('fcp', entry.startTime);
          this.reportMetric('fcp', entry.startTime);
        }
      });
    }).observe({ entryTypes: ['paint'] });
  }
  
  private measureBundleSize(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.metrics.set('effectiveType', connection.effectiveType);
      this.metrics.set('downlink', connection.downlink);
    }
  }
  
  private reportMetric(name: string, value: number): void {
    // Send to analytics service
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: Math.round(value),
        custom_parameter: 'performance_monitoring'
      });
    }
  }
}
```

## Bundle Optimization

### 1. **Code Splitting**

```typescript
// Route-based code splitting
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Lazy load route components
const HomePage = lazy(() => import('@/pages/HomePage'));
const WatchPage = lazy(() => import('@/pages/WatchPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const ChannelPage = lazy(() => import('@/pages/ChannelPage'));
const PlaylistPage = lazy(() => import('@/pages/PlaylistPage'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/watch/:videoId" element={<WatchPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/channel/:channelId" element={<ChannelPage />} />
        <Route path="/playlist/:playlistId" element={<PlaylistPage />} />
      </Routes>
    </Suspense>
  );
};

// Component-based code splitting
const VideoPlayer = lazy(() => 
  import('@/components/VideoPlayer').then(module => ({
    default: module.VideoPlayer
  }))
);

const CommentsSection = lazy(() => 
  import('@/components/CommentsSection')
);

const WatchPage = () => {
  return (
    <div className="watch-page">
      <Suspense fallback={<VideoPlayerSkeleton />}>
        <VideoPlayer />
      </Suspense>
      
      <Suspense fallback={<CommentsSkeleton />}>
        <CommentsSection />
      </Suspense>
    </div>
  );
};
```

### 2. **Dynamic Imports**

```typescript
// Conditional loading based on user interaction
const VideoEditor = () => {
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);
  const [AdvancedEditor, setAdvancedEditor] = useState<React.ComponentType | null>(null);
  
  const loadAdvancedEditor = async () => {
    if (!AdvancedEditor) {
      const module = await import('@/components/AdvancedVideoEditor');
      setAdvancedEditor(() => module.AdvancedVideoEditor);
    }
    setShowAdvancedEditor(true);
  };
  
  return (
    <div>
      <BasicEditor />
      
      {!showAdvancedEditor && (
        <button onClick={loadAdvancedEditor}>
          Load Advanced Editor
        </button>
      )}
      
      {showAdvancedEditor && AdvancedEditor && (
        <Suspense fallback={<EditorSkeleton />}>
          <AdvancedEditor />
        </Suspense>
      )}
    </div>
  );
};

// Feature-based dynamic loading
const useFeatureLoader = (featureName: string) => {
  const [feature, setFeature] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const loadFeature = useCallback(async () => {
    if (feature) return feature;
    
    setLoading(true);
    try {
      const module = await import(`@/features/${featureName}`);
      setFeature(module.default);
      return module.default;
    } catch (error) {
      console.error(`Failed to load feature: ${featureName}`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [featureName, feature]);
  
  return { feature, loading, loadFeature };
};
```

### 3. **Tree Shaking Optimization**

```typescript
// ✅ Import only what you need
import { debounce } from 'lodash-es';
import { format } from 'date-fns/format';
import { isValid } from 'date-fns/isValid';

// ❌ Avoid importing entire libraries
import _ from 'lodash'; // Imports entire library
import * as dateFns from 'date-fns'; // Imports entire library

// Custom utility functions to reduce dependencies
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
```

### 4. **Bundle Analysis**

```javascript
// webpack-bundle-analyzer configuration
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html',
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
};
```

## Runtime Performance

### 1. **React Optimization**

```tsx
// Memoization strategies
const VideoCard = memo(({ video, onPlay }: VideoCardProps) => {
  const handlePlay = useCallback(() => {
    onPlay(video.id);
  }, [video.id, onPlay]);
  
  const formattedDuration = useMemo(() => {
    return formatDuration(video.duration);
  }, [video.duration]);
  
  const formattedViews = useMemo(() => {
    return formatViews(video.views);
  }, [video.views]);
  
  return (
    <div className="video-card" onClick={handlePlay}>
      <img src={video.thumbnail} alt={video.title} loading="lazy" />
      <h3>{video.title}</h3>
      <p>{formattedViews} views • {formattedDuration}</p>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.video.id === nextProps.video.id &&
    prevProps.video.updatedAt === nextProps.video.updatedAt
  );
});

// Optimized list rendering
const VideoList = ({ videos }: VideoListProps) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleScroll = useCallback(
    throttle(() => {
      if (!containerRef.current) return;
      
      const { scrollTop, clientHeight } = containerRef.current;
      const itemHeight = 200;
      
      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(
        start + Math.ceil(clientHeight / itemHeight) + 5,
        videos.length
      );
      
      setVisibleRange({ start, end });
    }, 16),
    [videos.length]
  );
  
  const visibleVideos = useMemo(() => {
    return videos.slice(visibleRange.start, visibleRange.end);
  }, [videos, visibleRange]);
  
  return (
    <div
      ref={containerRef}
      className="video-list"
      onScroll={handleScroll}
      style={{ height: '100vh', overflowY: 'auto' }}
    >
      {/* Spacer for items before visible range */}
      <div style={{ height: visibleRange.start * 200 }} />
      
      {visibleVideos.map((video) => (
        <VideoCard key={video.id} video={video} onPlay={handlePlay} />
      ))}
      
      {/* Spacer for items after visible range */}
      <div style={{ height: (videos.length - visibleRange.end) * 200 }} />
    </div>
  );
};
```

### 2. **State Management Optimization**

```tsx
// Optimized context providers
const VideoContext = createContext<VideoContextType>(null!);
const VideoDispatchContext = createContext<VideoDispatchType>(null!);

const VideoProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(videoReducer, initialState);
  
  // Memoize context values to prevent unnecessary re-renders
  const contextValue = useMemo(() => state, [state]);
  const dispatchValue = useMemo(() => dispatch, [dispatch]);
  
  return (
    <VideoContext.Provider value={contextValue}>
      <VideoDispatchContext.Provider value={dispatchValue}>
        {children}
      </VideoDispatchContext.Provider>
    </VideoContext.Provider>
  );
};

// Selector pattern for fine-grained subscriptions
const useVideoSelector = <T,>(selector: (state: VideoState) => T): T => {
  const state = useContext(VideoContext);
  return useMemo(() => selector(state), [state, selector]);
};

// Usage
const VideoTitle = ({ videoId }: { videoId: string }) => {
  const title = useVideoSelector(state => 
    state.videos[videoId]?.title
  );
  
  return <h1>{title}</h1>;
};
```

### 3. **Efficient Data Fetching**

```tsx
// Optimized data fetching with caching
const useVideoData = (videoId: string) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['video', videoId],
    queryFn: () => fetchVideo(videoId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Prefetching for better UX
const VideoCard = ({ video }: VideoCardProps) => {
  const queryClient = useQueryClient();
  
  const handleMouseEnter = useCallback(() => {
    // Prefetch video data on hover
    queryClient.prefetchQuery({
      queryKey: ['video', video.id],
      queryFn: () => fetchVideo(video.id),
      staleTime: 5 * 60 * 1000,
    });
  }, [video.id, queryClient]);
  
  return (
    <div onMouseEnter={handleMouseEnter}>
      {/* Video card content */}
    </div>
  );
};

// Infinite scrolling with optimized loading
const useInfiniteVideos = (category: string) => {
  return useInfiniteQuery({
    queryKey: ['videos', category],
    queryFn: ({ pageParam = 1 }) => fetchVideos(category, pageParam),
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextPage : undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

## Image and Media Optimization

### 1. **Progressive Image Loading**

```tsx
// Progressive image component
const ProgressiveImage = ({ 
  src, 
  placeholder, 
  alt, 
  className 
}: ProgressiveImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && imgRef.current) {
          const img = imgRef.current;
          img.src = src;
          img.onload = () => setLoaded(true);
          img.onerror = () => setError(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [src]);
  
  return (
    <div className={`progressive-image ${className}`}>
      {!loaded && !error && (
        <img
          src={placeholder}
          alt={alt}
          className="placeholder"
          style={{ filter: 'blur(5px)' }}
        />
      )}
      
      <img
        ref={imgRef}
        alt={alt}
        className={`main-image ${loaded ? 'loaded' : 'loading'}`}
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
      
      {error && (
        <div className="error-placeholder">
          <span>Failed to load image</span>
        </div>
      )}
    </div>
  );
};

// WebP support with fallback
const OptimizedImage = ({ src, alt, ...props }: ImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  
  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };
    
    const supportsWebP = checkWebPSupport();
    const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
    if (supportsWebP) {
      // Try WebP first
      const img = new Image();
      img.onload = () => setImageSrc(webpSrc);
      img.onerror = () => setImageSrc(src);
      img.src = webpSrc;
    } else {
      setImageSrc(src);
    }
  }, [src]);
  
  return imageSrc ? (
    <img src={imageSrc} alt={alt} {...props} />
  ) : (
    <div className="image-skeleton" />
  );
};
```

### 2. **Video Optimization**

```tsx
// Optimized video player
const OptimizedVideoPlayer = ({ videoSrc, poster }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [quality, setQuality] = useState<VideoQuality>('auto');
  
  // Intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.25 }
    );
    
    if (videoRef.current) {
      observer.observe(videoRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  // Adaptive quality based on network
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection.effectiveType;
      
      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          setQuality('240p');
          break;
        case '3g':
          setQuality('480p');
          break;
        case '4g':
          setQuality('720p');
          break;
        default:
          setQuality('auto');
      }
    }
  }, []);
  
  const getVideoSrc = useCallback(() => {
    if (quality === 'auto') {
      return videoSrc;
    }
    return videoSrc.replace(/\.(mp4|webm)$/, `_${quality}.$1`);
  }, [videoSrc, quality]);
  
  return (
    <video
      ref={videoRef}
      poster={poster}
      preload={isInView ? 'metadata' : 'none'}
      controls
      playsInline
    >
      {isInView && (
        <>
          <source src={getVideoSrc()} type="video/mp4" />
          <source src={getVideoSrc().replace('.mp4', '.webm')} type="video/webm" />
        </>
      )}
    </video>
  );
};
```

## Network Optimization

### 1. **Request Optimization**

```typescript
// Request batching
class RequestBatcher {
  private batches: Map<string, BatchRequest[]> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  
  batch<T>(
    key: string,
    request: () => Promise<T>,
    delay: number = 50
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const batch = this.batches.get(key) || [];
      batch.push({ request, resolve, reject });
      this.batches.set(key, batch);
      
      // Clear existing timeout
      const existingTimeout = this.timeouts.get(key);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      
      // Set new timeout
      const timeout = setTimeout(() => {
        this.executeBatch(key);
      }, delay);
      
      this.timeouts.set(key, timeout);
    });
  }
  
  private async executeBatch(key: string): Promise<void> {
    const batch = this.batches.get(key);
    if (!batch || batch.length === 0) return;
    
    this.batches.delete(key);
    this.timeouts.delete(key);
    
    try {
      // Execute all requests in parallel
      const results = await Promise.allSettled(
        batch.map(item => item.request())
      );
      
      // Resolve/reject individual promises
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          batch[index].resolve(result.value);
        } else {
          batch[index].reject(result.reason);
        }
      });
    } catch (error) {
      // Reject all promises if batch fails
      batch.forEach(item => item.reject(error));
    }
  }
}

// Request deduplication
class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<any>> = new Map();
  
  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    const existingRequest = this.pendingRequests.get(key);
    
    if (existingRequest) {
      return existingRequest;
    }
    
    const request = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, request);
    return request;
  }
}

// Usage
const batcher = new RequestBatcher();
const deduplicator = new RequestDeduplicator();

const fetchVideo = async (videoId: string) => {
  return deduplicator.dedupe(`video-${videoId}`, () => {
    return batcher.batch('videos', () => 
      fetch(`/api/videos/${videoId}`).then(res => res.json())
    );
  });
};
```

### 2. **Caching Strategies**

```typescript
// Multi-level caching
class CacheManager {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private readonly maxMemorySize = 50; // MB
  private currentMemorySize = 0;
  
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      return memoryEntry.data;
    }
    
    // Check IndexedDB cache
    const dbEntry = await this.getFromIndexedDB(key);
    if (dbEntry && !this.isExpired(dbEntry)) {
      // Promote to memory cache
      this.setInMemory(key, dbEntry.data, dbEntry.ttl);
      return dbEntry.data;
    }
    
    return null;
  }
  
  async set<T>(
    key: string, 
    data: T, 
    ttl: number = 5 * 60 * 1000
  ): Promise<void> {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
      size: this.estimateSize(data),
    };
    
    // Store in memory cache
    this.setInMemory(key, data, ttl);
    
    // Store in IndexedDB for persistence
    await this.setInIndexedDB(key, entry);
  }
  
  private setInMemory<T>(key: string, data: T, ttl: number): void {
    const size = this.estimateSize(data);
    
    // Evict if necessary
    while (this.currentMemorySize + size > this.maxMemorySize) {
      this.evictLRU();
    }
    
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
      size,
    };
    
    this.memoryCache.set(key, entry);
    this.currentMemorySize += size;
  }
  
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.memoryCache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      const entry = this.memoryCache.get(oldestKey);
      if (entry) {
        this.currentMemorySize -= entry.size;
        this.memoryCache.delete(oldestKey);
      }
    }
  }
  
  private estimateSize(data: any): number {
    return JSON.stringify(data).length / 1024 / 1024; // MB
  }
  
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }
  
  private async getFromIndexedDB(key: string): Promise<CacheEntry | null> {
    // IndexedDB implementation
    return null;
  }
  
  private async setInIndexedDB(key: string, entry: CacheEntry): Promise<void> {
    // IndexedDB implementation
  }
}
```

## Memory Management

### 1. **Memory Leak Prevention**

```tsx
// Cleanup utilities
const useCleanup = () => {
  const cleanupFunctions = useRef<(() => void)[]>([]);
  
  const addCleanup = useCallback((fn: () => void) => {
    cleanupFunctions.current.push(fn);
  }, []);
  
  useEffect(() => {
    return () => {
      cleanupFunctions.current.forEach(fn => fn());
      cleanupFunctions.current = [];
    };
  }, []);
  
  return addCleanup;
};

// Event listener cleanup
const useEventListener = (
  target: EventTarget | null,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions
) => {
  const addCleanup = useCleanup();
  
  useEffect(() => {
    if (!target) return;
    
    target.addEventListener(event, handler, options);
    
    const cleanup = () => {
      target.removeEventListener(event, handler, options);
    };
    
    addCleanup(cleanup);
    return cleanup;
  }, [target, event, handler, options, addCleanup]);
};

// Observer cleanup
const useIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const addCleanup = useCleanup();
  
  useEffect(() => {
    observerRef.current = new IntersectionObserver(callback, options);
    
    const cleanup = () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
    
    addCleanup(cleanup);
    return cleanup;
  }, [callback, options, addCleanup]);
  
  const observe = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);
  
  const unobserve = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element);
    }
  }, []);
  
  return { observe, unobserve };
};
```

### 2. **Object Pool Pattern**

```typescript
// Object pooling for frequently created objects
class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;
  
  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    maxSize: number = 100
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }
  
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }
  
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }
  
  clear(): void {
    this.pool = [];
  }
}

// Usage for video thumbnails
interface ThumbnailData {
  src: string;
  loaded: boolean;
  error: boolean;
}

const thumbnailPool = new ObjectPool<ThumbnailData>(
  () => ({ src: '', loaded: false, error: false }),
  (obj) => {
    obj.src = '';
    obj.loaded = false;
    obj.error = false;
  }
);

const useThumbnail = (src: string) => {
  const [thumbnail] = useState(() => thumbnailPool.acquire());
  
  useEffect(() => {
    thumbnail.src = src;
    // Load thumbnail logic
    
    return () => {
      thumbnailPool.release(thumbnail);
    };
  }, [src, thumbnail]);
  
  return thumbnail;
};
```

## Rendering Optimization

### 1. **Virtual Scrolling**

```tsx
// Advanced virtual scrolling implementation
const VirtualScrollList = <T,>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
}: VirtualScrollListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  
  const handleScroll = useCallback(
    throttle((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }, 16),
    []
  );
  
  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      {/* Spacer for items before visible range */}
      <div style={{ height: startIndex * itemHeight }} />
      
      {/* Visible items */}
      {visibleItems.map((item, index) => (
        <div
          key={startIndex + index}
          style={{ height: itemHeight }}
        >
          {renderItem(item, startIndex + index)}
        </div>
      ))}
      
      {/* Spacer for items after visible range */}
      <div style={{ 
        height: (items.length - endIndex - 1) * itemHeight 
      }} />
    </div>
  );
};

// Dynamic height virtual scrolling
const DynamicVirtualScrollList = <T,>({
  items,
  estimatedItemHeight,
  containerHeight,
  renderItem,
}: DynamicVirtualScrollListProps<T>) => {
  const [itemHeights, setItemHeights] = useState<number[]>(
    new Array(items.length).fill(estimatedItemHeight)
  );
  const [scrollTop, setScrollTop] = useState(0);
  
  const itemOffsets = useMemo(() => {
    const offsets = [0];
    for (let i = 1; i < itemHeights.length; i++) {
      offsets[i] = offsets[i - 1] + itemHeights[i - 1];
    }
    return offsets;
  }, [itemHeights]);
  
  const findStartIndex = useCallback((scrollTop: number) => {
    let low = 0;
    let high = itemOffsets.length - 1;
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (itemOffsets[mid] <= scrollTop) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    
    return Math.max(0, high);
  }, [itemOffsets]);
  
  const startIndex = findStartIndex(scrollTop);
  const endIndex = useMemo(() => {
    let index = startIndex;
    let currentOffset = itemOffsets[startIndex];
    
    while (index < items.length && currentOffset < scrollTop + containerHeight) {
      currentOffset += itemHeights[index];
      index++;
    }
    
    return Math.min(items.length - 1, index);
  }, [startIndex, scrollTop, containerHeight, itemOffsets, itemHeights, items.length]);
  
  const updateItemHeight = useCallback((index: number, height: number) => {
    setItemHeights(prev => {
      const newHeights = [...prev];
      newHeights[index] = height;
      return newHeights;
    });
  }, []);
  
  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: itemOffsets[startIndex] }} />
      
      {items.slice(startIndex, endIndex + 1).map((item, index) => (
        <MeasuredItem
          key={startIndex + index}
          onHeightChange={(height) => updateItemHeight(startIndex + index, height)}
        >
          {renderItem(item, startIndex + index)}
        </MeasuredItem>
      ))}
      
      <div style={{ 
        height: itemOffsets[itemOffsets.length - 1] + 
                itemHeights[itemHeights.length - 1] - 
                (itemOffsets[endIndex] + itemHeights[endIndex])
      }} />
    </div>
  );
};
```

## Progressive Web App Optimization

### 1. **Service Worker Optimization**

```typescript
// Optimized service worker
const CACHE_NAME = 'youtubex-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const IMAGE_CACHE = 'images-v1';

const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== IMAGE_CACHE
            )
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
  } else if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

// Image caching strategy
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return placeholder image on error
    return new Response(
      '<svg>...</svg>', // Placeholder SVG
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// API caching strategy
async function handleAPIRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Navigation caching strategy
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    const cache = await caches.open(STATIC_CACHE);
    return cache.match('/') || new Response('Offline', { status: 503 });
  }
}

// Static asset caching strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    throw error;
  }
}
```

## Monitoring and Analytics

### 1. **Performance Monitoring**

```typescript
// Performance monitoring service
class PerformanceAnalytics {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private reportingEndpoint: string;
  
  constructor(reportingEndpoint: string) {
    this.reportingEndpoint = reportingEndpoint;
    this.initializeMonitoring();
  }
  
  private initializeMonitoring(): void {
    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();
    
    // Monitor custom metrics
    this.monitorCustomMetrics();
    
    // Monitor errors
    this.monitorErrors();
    
    // Report metrics periodically
    setInterval(() => this.reportMetrics(), 30000); // Every 30 seconds
  }
  
  private monitorCoreWebVitals(): void {
    // LCP
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('lcp', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // FID
    new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        this.recordMetric('fid', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });
    
    // CLS
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.recordMetric('cls', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
  
  private monitorCustomMetrics(): void {
    // Time to Interactive
    this.measureTTI();
    
    // Bundle load time
    this.measureBundleLoadTime();
    
    // API response times
    this.monitorAPIPerformance();
  }
  
  private measureTTI(): void {
    // TTI measurement implementation
    const observer = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          // Calculate TTI based on FCP and long tasks
          this.calculateTTI(entry.startTime);
        }
      });
    });
    
    observer.observe({ entryTypes: ['paint', 'longtask'] });
  }
  
  private monitorAPIPerformance(): void {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0] instanceof Request ? args[0].url : args[0];
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        this.recordMetric(`api_${this.getAPIEndpoint(url)}`, endTime - startTime);
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        this.recordMetric(`api_error_${this.getAPIEndpoint(url)}`, endTime - startTime);
        throw error;
      }
    };
  }
  
  private recordMetric(name: string, value: number): void {
    const existing = this.metrics.get(name);
    
    if (existing) {
      existing.values.push(value);
      existing.count++;
      existing.sum += value;
      existing.avg = existing.sum / existing.count;
      existing.max = Math.max(existing.max, value);
      existing.min = Math.min(existing.min, value);
    } else {
      this.metrics.set(name, {
        name,
        values: [value],
        count: 1,
        sum: value,
        avg: value,
        max: value,
        min: value,
        timestamp: Date.now(),
      });
    }
  }
  
  private async reportMetrics(): Promise<void> {
    if (this.metrics.size === 0) return;
    
    const metricsData = Array.from(this.metrics.values()).map(metric => ({
      name: metric.name,
      count: metric.count,
      avg: metric.avg,
      max: metric.max,
      min: metric.min,
      p95: this.calculatePercentile(metric.values, 95),
      timestamp: metric.timestamp,
    }));
    
    try {
      await fetch(this.reportingEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: metricsData,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: Date.now(),
        }),
      });
      
      // Clear metrics after reporting
      this.metrics.clear();
    } catch (error) {
      console.error('Failed to report metrics:', error);
    }
  }
  
  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }
}
```

## Performance Budget

### 1. **Budget Configuration**

```json
{
  "budgets": {
    "bundle": {
      "initial": "250KB",
      "chunks": "100KB",
      "total": "500KB"
    },
    "metrics": {
      "lcp": 2500,
      "fid": 100,
      "cls": 0.1,
      "fcp": 1800,
      "tti": 3800
    },
    "resources": {
      "images": "1MB",
      "fonts": "100KB",
      "scripts": "300KB",
      "styles": "50KB"
    }
  },
  "thresholds": {
    "warning": 0.8,
    "error": 1.0
  }
}
```

### 2. **Budget Monitoring**

```typescript
// Performance budget monitoring
class BudgetMonitor {
  private budgets: PerformanceBudget;
  private violations: BudgetViolation[] = [];
  
  constructor(budgets: PerformanceBudget) {
    this.budgets = budgets;
    this.startMonitoring();
  }
  
  private startMonitoring(): void {
    // Monitor bundle sizes
    this.monitorBundleSizes();
    
    // Monitor performance metrics
    this.monitorPerformanceMetrics();
    
    // Monitor resource sizes
    this.monitorResourceSizes();
  }
  
  private monitorBundleSizes(): void {
    const observer = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          const size = entry.transferSize || entry.encodedBodySize;
          this.checkBudget('bundle', size, this.budgets.bundle.chunks);
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }
  
  private monitorPerformanceMetrics(): void {
    // Monitor LCP
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.checkBudget('lcp', lastEntry.startTime, this.budgets.metrics.lcp);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // Monitor FID
    new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        const fid = entry.processingStart - entry.startTime;
        this.checkBudget('fid', fid, this.budgets.metrics.fid);
      });
    }).observe({ entryTypes: ['first-input'] });
  }
  
  private checkBudget(
    metric: string, 
    actual: number, 
    budget: number
  ): void {
    const ratio = actual / budget;
    
    if (ratio >= this.budgets.thresholds.error) {
      this.recordViolation(metric, actual, budget, 'error');
    } else if (ratio >= this.budgets.thresholds.warning) {
      this.recordViolation(metric, actual, budget, 'warning');
    }
  }
  
  private recordViolation(
    metric: string,
    actual: number,
    budget: number,
    severity: 'warning' | 'error'
  ): void {
    const violation: BudgetViolation = {
      metric,
      actual,
      budget,
      ratio: actual / budget,
      severity,
      timestamp: Date.now(),
    };
    
    this.violations.push(violation);
    
    // Report violation
    this.reportViolation(violation);
  }
  
  private reportViolation(violation: BudgetViolation): void {
    console.warn(`Performance budget violation:`, violation);
    
    // Send to monitoring service
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_budget_violation', {
        metric: violation.metric,
        actual: violation.actual,
        budget: violation.budget,
        severity: violation.severity,
      });
    }
  }
}
```

## Conclusion

This comprehensive performance optimization guide provides strategies and techniques to significantly improve the YouTubeX application's performance across multiple dimensions:

- **Bundle optimization** reduces initial load times
- **Runtime performance** improvements enhance user interactions
- **Image and media optimization** reduces bandwidth usage
- **Network optimization** minimizes request overhead
- **Memory management** prevents leaks and improves stability
- **Rendering optimization** ensures smooth user experiences
- **PWA optimization** enables offline functionality
- **Monitoring and analytics** provide insights for continuous improvement

Implementing these optimizations systematically will result in a faster, more responsive, and more reliable application that provides an excellent user experience across all devices and network conditions.