import React, { type ReactNode } from 'react';

import { cn } from '../src/lib/utils';

// Common component patterns and utilities

// Conditional rendering utility
export const conditionalRender = (
  condition: boolean,
  component: ReactNode,
  fallback?: ReactNode,
): ReactNode => {
  return condition ? component : fallback || null;
};

// Safe array rendering with key generation
export function safeArrayRender<T>(
  items: T[] | undefined | null,
  renderItem: (item: T, index: number) => ReactNode,
  keyExtractor?: (item: T, index: number) => string | number,
): ReactNode[] {
  if (!items || !Array.isArray(items)) {
return [];
}

  return items.map((item, index) => {
    const key = keyExtractor ? keyExtractor(item, index) : index;
    return React.createElement(
      'div',
      { key },
      renderItem(item, index),
    );
  });
}

// Common loading state wrapper
export function withLoadingState(
  isLoading: boolean,
  content: ReactNode,
  loadingComponent: ReactNode,
): ReactNode {
  return isLoading ? loadingComponent : content;
}

// Error boundary wrapper utility
export function withErrorBoundary(
  content: ReactNode,
  errorComponent: ReactNode,
  hasError: boolean,
): ReactNode {
  return hasError ? errorComponent : content;
}

// Common class name builders
export const buildCardClasses = (
  variant: 'default' | 'elevated' | 'outlined' = 'default',
  size: 'sm' | 'md' | 'lg' = 'md',
  className?: string,
): string => {
  const baseClasses = 'rounded-lg transition-all duration-200';

  const variantClasses = {
    default: 'bg-white shadow-sm hover:shadow-md',
    elevated: 'bg-white shadow-md hover:shadow-lg',
    outlined: 'bg-white border border-gray-200 hover:border-gray-300',
  };

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
};

// Avatar/Image utilities
export const getAvatarFallback = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const buildAvatarClasses = (
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md',
  className?: string,
): string => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  return cn(
    'rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-600',
    sizeClasses[size],
    className,
  );
};

// Text truncation utilities - using shared utility
export { truncateText } from './formatters';

export const buildTruncateClasses = (
  lines: 1 | 2 | 3 | 4 = 1,
  className?: string,
): string => {
  const truncateClasses = {
    1: 'truncate',
    2: 'line-clamp-2',
    3: 'line-clamp-3',
    4: 'line-clamp-4',
  };

  return cn(truncateClasses[lines], className);
};

// Focus management utilities
export const trapFocus = (element: HTMLElement): (() => void) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') {
return;
}

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);
  firstElement?.focus();

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

// Responsive utilities
export const buildResponsiveClasses = (
  mobile: string,
  tablet?: string,
  desktop?: string,
  className?: string,
): string => {
  return cn(
    mobile,
    tablet && `md:${tablet}`,
    desktop && `lg:${desktop}`,
    className,
  );
};

// Animation utilities
export const buildTransitionClasses = (
  type: 'fade' | 'slide' | 'scale' | 'bounce' = 'fade',
  duration: 'fast' | 'normal' | 'slow' = 'normal',
  className?: string,
): string => {
  const durationClasses = {
    fast: 'duration-150',
    normal: 'duration-300',
    slow: 'duration-500',
  };

  const typeClasses = {
    fade: 'transition-opacity',
    slide: 'transition-transform',
    scale: 'transition-transform',
    bounce: 'transition-all',
  };

  return cn(
    'transition-all ease-in-out',
    typeClasses[type],
    durationClasses[duration],
    className,
  );
};

// Form validation utilities
export const validateRequired = (value: string | undefined | null): boolean => {
  return value !== undefined && value !== null && value.trim() !== '';
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

// URL and navigation utilities
export const buildVideoUrl = (videoId: string): string => {
  return `/watch?v=${videoId}`;
};

export const buildChannelUrl = (channelId: string): string => {
  return `/channel/${channelId}`;
};

export const buildPlaylistUrl = (playlistId: string): string => {
  return `/playlist?list=${playlistId}`;
};

export const isExternalUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://');
};

// Performance utilities - using shared utilities
export { debounce, throttle } from '../src/lib/utils';

// Local storage utilities with error handling
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  getJSON: <T, >(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  setJSON: <T, >(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
};

export default {
  conditionalRender,
  safeArrayRender,
  withLoadingState,
  withErrorBoundary,
  buildCardClasses,
  getAvatarFallback,
  buildAvatarClasses,
  buildTruncateClasses,
  trapFocus,
  buildResponsiveClasses,
  buildTransitionClasses,
  validateRequired,
  validateEmail,
  validateMinLength,
  validateMaxLength,
  buildVideoUrl,
  buildChannelUrl,
  buildPlaylistUrl,
  isExternalUrl,
  debounce,
  throttle,
  safeLocalStorage,
};