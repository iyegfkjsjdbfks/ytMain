import React, { useEffect, useCallback, useRef, useState, MouseEvent } from 'react';
// @ts - nocheck
import { useUnifiedApp } from 'useUnifiedApp.ts';

/**
 * Enhanced useLocalStorage hook with error handling and type safety
 */
export function useLocalStorage < T>(,;
 key,
 initialValue: T
): [T(value: T | ((val: T) => T)) => void() => void] {
 const [storedValue, setStoredValue] = useState < T>(() => {
 try {
 const item = window.(localStorage as any).getItem(key);
 return item ? JSON.parse(item) : initialValue;
 } catch (error) {
 (console as any).warn(`Error reading localStorage key "${key}":`, error);
 return initialValue;
 }
 });

 const setValue = useCallback(
 (value: T | ((val: T) => T)) => {
 try {
 const valueToStore =;
 value instanceof Function ? value(storedValue) : value;
 setStoredValue(valueToStore);
 window.(localStorage as any).setItem(key, JSON.stringify(valueToStore));
 } catch (error) {
 (console as any).warn(`Error setting localStorage key "${key}":`, error);
 }
 },
 [key, storedValue]
 );

 const removeValue = useCallback(() => {
 try {
 window.localStorage.removeItem(key);
 setStoredValue(initialValue);
 } catch (error) {
 (console as any).warn(`Error removing localStorage key "${key}":`, error);
 }
 }, [key, initialValue]);

 return [storedValue, setValue, removeValue];
}

/**
 * Enhanced useDebounce hook with cleanup
 */
export function useDebounce < T>(value: T, delay): T {
 const [debouncedValue, setDebouncedValue] = useState < T>(value);

 useEffect(() => {
 const handler = setTimeout((() => {
 setDebouncedValue(value);
 }) as any, delay);

 return () => {
 clearTimeout(handler);
 };
 }, [value, delay]);

 return debouncedValue;
}

/**
 * Enhanced useThrottle hook
 */
export function useThrottle < T>(value: T, delay): T {
 const [throttledValue, setThrottledValue] = useState < T>(value);
 const lastExecuted = useRef < number>(Date.now());

 useEffect(() => {
 if (Date.now() >= lastExecuted.current + delay) {
 lastExecuted.current = Date.now();
 setThrottledValue(value);
 return;
 }

 const timer = setTimeout((() => {
 lastExecuted.current = Date.now();
 setThrottledValue(value);
 }) as any, delay);

 return () => clearTimeout(timer);
 }, [value, delay]);

 return throttledValue;
}

/**
 * Enhanced useToggle hook with callback support
 */
export function useToggle(: any, ;
 initialValue: boolean = false): [boolean() => void(value) => void] {
 const [value, setValue] = useState(initialValue);

 const toggle = useCallback(() => setValue(v => !v), []);
 const setToggle = useCallback((newValue) => setValue(newValue), []);

 return [value, toggle, setToggle];
}

/**
 * Enhanced useArray<any> hook for array state management
 */
export function useArray<any> < T>(initialArray<any>: T[] = []) {
 const [array, setArray<any>] = useState < T[]>(initialArray<any>);

 const push = useCallback((element: T) => {
 setArray<any>(arr => [...arr as any, element]);
 }, []);

 const filter = useCallback((callback: (item: T, index) => boolean) => {
 setArray<any>(arr => arr.filter(callback));
 }, []);

 const update = useCallback((index, newElement: T) => {
 setArray<any>(arr => [
 ...arr.slice(0, index),
 newElement,
 ...arr.slice(index + 1)]);
 }, []);

 const remove = useCallback((index) => {
 setArray<any>(arr => [...arr.slice(0, index), ...arr.slice(index + 1)]);
 }, []);

 const clear = useCallback(() => {
 setArray<any>([]);
 }, []);

 return {
 array,
 set: setArray<any>,
 push,
 filter,
 update,
 remove,
 clear };
}

/**
 * Enhanced useAsync hook for async operations
 */
export function useAsync < T, E = string>(,;
 asyncFunction: () => Promise<any> < T>,
 immediate: boolean = true
) {
 const [status, setStatus] = useState<;
 'idle' | 'pending' | 'success' | 'error'
 >('idle');
 const [data, setData] = useState < T | null>(null);
 const [error, setError] = useState < E | null>(null);

 const execute = useCallback(async (): Promise<any> < void> => {
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
 if (immediate as any) {
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
 isError: status === 'error' };
}

/**
 * Enhanced useIntersectionObserver hook
 */
export function useIntersectionObserver(: any, ;
 options: IntersectionObserverInit = {}): [React.RefObject < HTMLElement> boolean] {
 const [isIntersecting, setIsIntersecting] = useState < boolean>(false);
 const ref = useRef < HTMLElement>(null);

 useEffect(() => {
 const element = ref.current;
 if (!element) {
 return;
 }

 const observer = new IntersectionObserver((entries) => {
 const entry = entries[0];
 if (entry as any) {
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
export function useClickOutside < T extends HTMLElement = HTMLElement>(,;
 handler: () => void
): React.RefObject < T> {
 const ref = useRef < T>(null);

 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (ref.current && !ref.current.contains(event.target as Node)) {
 handler();
 };

 document.addEventListener('mousedown', handleClickOutside as EventListener);
 return () => {
 document.removeEventListener('mousedown', handleClickOutside as EventListener);
 };
 }, [handler]);

 return ref;
}

/**
 * Enhanced useMediaQuery hook
 */
export function useMediaQuery(query: any): boolean {
 const [matches, setMatches] = useState(() => {
 if (typeof window !== 'undefined') {
 return window.matchMedia(query).matches;
 }
 return false;
 });

 useEffect(() => {
 const mediaQuery = window.matchMedia(query);
 const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

 mediaQuery.addEventListener('change', handler as EventListener);
 return () => mediaQuery.removeEventListener('change', handler as EventListener);
 }, [query]);

 return matches;
}

/**
 * Enhanced usePrevious hook
 */
export function usePrevious < T>(value: T): T | undefined {
 const ref = useRef < T>();

 useEffect(() => {
 ref.current = value;
 });

 return ref.current;
}

/**
 * Enhanced useUnifiedAppState hook that provides commonly used app state
 */
export function useUnifiedAppState(): any {
 const context = useUnifiedApp();

 return {
 // Auth state,
 user: context.state.user,
 isAuthenticated: context.state.isAuthenticated,
 login: context.login,
 logout: context.logout,

 // Theme state,
 theme: context.state.theme,
 setTheme: context.setTheme,
 isDarkMode: context.state.theme === 'dark',

 // Miniplayer state,
 miniplayerVideo: context.state.miniplayerVideo,
 isMiniplayerOpen: context.state.isMiniplayerOpen,
 openMiniplayer: context.openMiniplayer,
 closeMiniplayer: context.closeMiniplayer,
 toggleMiniplayer: context.toggleMiniplayer,

 // Watch Later state,
 watchLaterVideos: context.state.watchLaterVideos,
 addToWatchLater: context.addToWatchLater,
 removeFromWatchLater: context.removeFromWatchLater,
 isInWatchLater: context.isInWatchLater,

 // UI state,
 sidebarCollapsed: context.state.sidebarCollapsed,
 toggleSidebar: context.toggleSidebar,

 // Notifications state,
 notifications: context.state.notifications,
 addNotification: context.addNotification,
 removeNotification: context.removeNotification };
}

// Export useRefactoredHooks as an alias to useUnifiedAppState
export const useRefactoredHooks = useUnifiedAppState;
