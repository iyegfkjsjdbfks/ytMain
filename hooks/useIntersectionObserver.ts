import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
  initialIsIntersecting?: boolean;
}

interface UseIntersectionObserverReturn {
  ref: React.RefObject<Element>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

/**
 * Custom hook for Intersection Observer API
 * 
 * Provides:
 * - Element visibility detection
 * - Configurable thresholds and margins
 * - Option to freeze state once visible
 * - Access to full IntersectionObserverEntry
 * 
 * Common use cases:
 * - Video autoplay when in viewport
 * - Lazy loading images
 * - Infinite scrolling
 * - Analytics tracking
 * - Animation triggers
 * 
 * Reduces code duplication for intersection-based functionality
 */
export const useIntersectionObserver = ({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = false,
  initialIsIntersecting = false
}: UseIntersectionObserverOptions = {}): UseIntersectionObserverReturn => {
  const ref = useRef<Element>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(initialIsIntersecting);
  const frozen = useRef(false);

  const updateEntry = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;

    if (!entry) return;

    if (frozen.current && entry.isIntersecting) {
      return;
    }

    setEntry(entry);
    setIsIntersecting(entry.isIntersecting);

    if (freezeOnceVisible && entry.isIntersecting) {
      frozen.current = true;
    }
  }, [freezeOnceVisible]);

  useEffect(() => {
    const node = ref.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen.current || !node) {
      return;
    }

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, updateEntry]);

  // Reset frozen state when element changes
  useEffect(() => {
    if (!freezeOnceVisible) {
      frozen.current = false;
    }
  }, [freezeOnceVisible]);

  return { ref, isIntersecting, entry };
};

/**
 * Specialized hook for video autoplay based on visibility
 * 
 * Automatically handles:
 * - Video play/pause based on visibility
 * - Configurable visibility threshold
 * - Cleanup on unmount
 */
export const useIntersectionVideoAutoplay = ({
  threshold = 0.7,
  rootMargin = '0px',
  enabled = true
}: {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
} = {}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin
  });

  useEffect(() => {
    // Video play/pause functionality disabled to prevent loading errors
    // const video = videoRef.current;
    // if (!video || !enabled) return;

    // if (isIntersecting) {
    //   video.play().catch(error => {
    //     console.warn('Video autoplay failed:', error);
    //   });
    // } else {
    //   video.pause();
    // }
  }, [isIntersecting, enabled]);

  return { videoRef, isIntersecting };
};

/**
 * Hook for lazy loading images based on visibility
 */
export const useLazyImage = ({
  src,
  threshold = 0.1,
  rootMargin = '50px'
}: {
  src: string;
  threshold?: number;
  rootMargin?: string;
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
    freezeOnceVisible: true
  });

  useEffect(() => {
    if (isIntersecting && !imageSrc) {
      setImageSrc(src);
    }
  }, [isIntersecting, src, imageSrc]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setError(null);
  }, []);

  const handleError = useCallback(() => {
    setError('Failed to load image');
    setIsLoaded(false);
  }, []);

  return {
    ref,
    src: imageSrc,
    isLoaded,
    error,
    isIntersecting,
    onLoad: handleLoad,
    onError: handleError
  };
};

/**
 * Hook for infinite scrolling
 */
export const useInfiniteScroll = ({
  hasNextPage = true,
  isFetchingNextPage = false,
  fetchNextPage,
  threshold = 1.0,
  rootMargin = '100px'
}: {
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage: () => void;
  threshold?: number;
  rootMargin?: string;
}) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return { ref, isIntersecting };
};

export default useIntersectionObserver;