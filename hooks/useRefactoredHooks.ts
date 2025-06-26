import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';

import { useUnifiedApp } from '../contexts/UnifiedAppContext';

/**
 * Enhanced useLocalStorage hook with error handling and type safety
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Enhanced useDebounce hook with cleanup
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Enhanced useThrottle hook
 */
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + delay) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
      return;
    }
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, delay);

      return () => clearTimeout(timer);

  }, [value, delay]);

  return throttledValue;
}

/**
 * Enhanced useToggle hook with callback support
 */
export function useToggle(
  initialValue: boolean = false,
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const setToggle = useCallback((newValue: boolean) => setValue(newValue), []);

  return [value, toggle, setToggle];
}

/**
 * Enhanced useArray hook for array state management
 */
export function useArray<T>(initialArray: T[] = []) {
  const [array, setArray] = useState<T[]>(initialArray);

  const push = useCallback((element: T) => {
    setArray(arr => [...arr, element]);
  }, []);

  const filter = useCallback((callback: (item: T, index: number) => boolean) => {
    setArray(arr => arr.filter(callback));
  }, []);

  const update = useCallback((index: number, newElement: T) => {
    setArray(arr => [
      ...arr.slice(0, index),
      newElement,
      ...arr.slice(index + 1),
    ]);
  }, []);

  const remove = useCallback((index: number) => {
    setArray(arr => [
      ...arr.slice(0, index),
      ...arr.slice(index + 1),
    ]);
  }, []);

  const clear = useCallback(() => {
    setArray([]);
  }, []);

  return {
    array,
    set: setArray,
    push,
    filter,
    update,
    remove,
    clear,
  };
}

/**
 * Enhanced useAsync hook for async operations
 */
export function useAsync<T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true,
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error as E);
      setStatus('error');
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    execute,
    status,
    data,
    error,
    isIdle: status === 'idle',
    isPending: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}

/**
 * Enhanced useIntersectionObserver hook
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {},
): [React.RefObject<HTMLElement>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
return;
}

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry !== undefined) {
        setIsIntersecting(entry.isIntersecting);
      }
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options]);

  return [ref, isIntersecting];
}

/**
 * Enhanced useClickOutside hook
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handler]);

  return ref;
}

/**
 * Enhanced useMediaQuery hook
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * Enhanced usePrevious hook
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

/**
 * Enhanced useUnifiedAppState hook that provides commonly used app state
 */
export function useUnifiedAppState() {
  const {
    state,
    login,
    logout,
    setTheme,
    openMiniplayer,
    toggleMiniplayer,
    addToWatchLater,
    removeFromWatchLater,
    isInWatchLater,
    toggleSidebar,
    addNotification,
    removeNotification,
  } = useUnifiedApp();

  return {
    // Auth state
    user: state.user,
    isAuthenticated: state.isAuthenticated || false,
    login,
    logout,

    // Theme state
    theme: state.theme || 'light',
    setTheme,
    isDarkMode: (state.theme || 'light') === 'dark',

    // Miniplayer state
    miniplayerVideo: state.miniplayerVideo,
    isMiniplayerOpen: state.isMiniplayerOpen || false,
    openMiniplayer,
    toggleMiniplayer,

    // Watch Later state
    watchLaterVideos: state.watchLaterVideos || [],
    addToWatchLater,
    removeFromWatchLater,
    isInWatchLater,

    // UI state
    sidebarCollapsed: state.sidebarCollapsed || false,
    toggleSidebar,

    // Notifications state
    notifications: state.notifications || [],
    addNotification,
    removeNotification,
  };
}

// Export useRefactoredHooks as an alias to useUnifiedAppState
export const useRefactoredHooks = useUnifiedAppState;
