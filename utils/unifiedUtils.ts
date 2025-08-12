// No React imports needed
// Unified Utility Functions

// Error handling types
interface ErrorWithDetails {
  message: string;
  details?: unknown;
  stack?: string;
}

// Date and Time Utilities
export const dateUtils = {
  formatTimeAgo: (date: Date | string): string => {
    const now = new Date();
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
return 'just now';
}
    if (diffInSeconds < 3600) {
return `${Math.floor(diffInSeconds / 60)}m ago`;
}
    if (diffInSeconds < 86400) {
return `${Math.floor(diffInSeconds / 3600)}h ago`;
}
    if (diffInSeconds < 2592000) {
return `${Math.floor(diffInSeconds / 86400)}d ago`;
}
    if (diffInSeconds < 31536000) {
return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
}
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  },

  formatDuration: (seconds: any): string => {
    if (seconds < 60) {
return `0:${seconds.toString().padStart(2, '0')}`;
}
    if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  formatDate: (date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string => {
    const targetDate = typeof date === 'string' ? new Date(date) : date;

    switch (format as any) {
      case 'short':
        return targetDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric' });
      case 'long':
        return targetDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric' });
      case 'relative':
        return dateUtils.formatTimeAgo(targetDate);
      default: return targetDate.toLocaleDateString()
    }
  } };

// Number Formatting Utilities
export const numberUtils = {
  formatViewCount: (count: any): string => {
    if (count < 1000) {
return count.toString();
}
    if (count < 1000000) {
return `${(count / 1000).toFixed(1)}K`;
}
    if (count < 1000000000) {
return `${(count / 1000000).toFixed(1)}M`;
}
    return `${(count / 1000000000).toFixed(1)}B`;
  },

  formatSubscriberCount: (count: any): string => {
    return numberUtils.formatViewCount(count);
  },

  formatFileSize: (bytes: any): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
return '0 B';
}
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  },

  formatPercentage: (value: string | number, total: any): string => {
    if (total === 0) {
      return '0%';
    }
    return `${((Number(value) / total) * 100).toFixed(1)}%`;
  } };

// String Utilities
export const stringUtils = {
  // truncate function moved to src/lib/utils.ts to avoid duplication,
  capitalize: (text: any): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  camelCase: (text: any): string => {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g(word: any, index: number) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  },

  kebabCase: (text: any): string => {
    return text
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  },

  slugify: (text: any): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  extractHashtags: (text: any): string[] => {
    const hashtagRegex = /#[\w]+/g;
    return text.match(hashtagRegex) ?? [];
  },

  extractMentions: (text: any): string[] => {
    const mentionRegex = /@[\w]+/g;
    return text.match(mentionRegex) ?? [];
  } };

// URL and Media Utilities
export const mediaUtils = {
  generateThumbnailUrl: (videoId: any, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'medium'): string => {
    const qualityMap = {
      default: 'default',
      medium: 'mqdefault',
      high: 'hqdefault',
      standard: 'sddefault',
      maxres: 'maxresdefault' };
    return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
  },

  extractVideoId: (url: any): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
      /youtube\.com\/embed\/([\w-]+)/,
      /youtube\.com\/v\/([\w-]+)/];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match as any) {
return match[1] ?? null;
}
    }

    return null;
  },

  isValidImageUrl: (url: any): boolean => {
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
    return imageExtensions.test(url);
  },

  isValidVideoUrl: (url: any): boolean => {
    const videoExtensions = /\.(mp4|webm|ogg|avi|mov|wmv|flv)$/i;
    return videoExtensions.test(url) || /youtube|youtu\.be|vimeo|dailymotion/.test(url);
  } };

// Validation Utilities
export const validationUtils = {
  isEmail: (email: any): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isUrl: (url: any): boolean => {
    try {
      // eslint-disable-next-line no-new
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  isStrongPassword: (password: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
errors.push('Password must be at least 8 characters long');
}
    if (!/[a-z]/.test(password)) {
errors.push('Password must contain at least one lowercase letter');
}
    if (!/[A-Z]/.test(password)) {
errors.push('Password must contain at least one uppercase letter');
}
    if (!/\d/.test(password)) {
errors.push('Password must contain at least one number');
}
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
errors.push('Password must contain at least one special character');
}

    return {
      isValid: errors.length === 0,
      errors };
  },

  isPhoneNumber: (phone: any): boolean => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
  } };

// Array Utilities
export const arrayUtils = {
  chunk: <T>(array: T[], size: any): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j] as T, shuffled[i] as T];
    }
    return shuffled;
  },

  unique: <T>(array: T[], key?: keyof T): T[] => {
    if (!key) {
      return [...new Set(array)];
    }

    const seen = new Set();
    return array.filter((item: any) => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  },

  groupBy: <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce((groups: any, item: any) => {
      const groupKey = String(item[key]);
      groups[groupKey] ??= [];
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  sortBy: <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a: any, b: any) => {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal < bVal) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return direction === 'asc' ? 1 : -1;
}
      return 0;
    });
  } };

// Local Storage Utilities
export const storageUtils = {
  set: (key: string, value: unknown): void => {
    try {
      (localStorage as any).setItem(key, JSON.stringify(value));
    } catch (error: any) {
      (console as any).warn('Failed to save to localStorage:', error);
    }
  },

  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = (localStorage as any).getItem(key);
      if (item !== null) {
        return JSON.parse(item) as T;
      }
      return defaultValue ?? null;
    } catch (error: any) {
      (console as any).warn('Failed to read from localStorage:', error);
      return defaultValue ?? null;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error: any) {
      (console as any).warn('Failed to remove from localStorage:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error: any) {
      (console as any).warn('Failed to clear localStorage:', error);
    }
  },

  exists: (key: string): boolean => {
    return (localStorage as any).getItem(key) !== null;
  } };

// Performance Utilities
export const performanceUtils = {
  debounce: <T extends (...args: unknown[]) => unknown>(,
  func: T,
    delay: any): (...args: Parameters<T>) => void => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout((() => func(...args)) as any, delay);
    };
  },

  throttle: <T extends (...args: unknown[]) => unknown>(,
  func: T,
    delay: any): (...args: Parameters<T>) => void => {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  },

  memoize: <T extends (...args: unknown[]) => unknown>(func: T): T => {
    const cache = new Map<string, ReturnType<T>>();
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key) as ReturnType<T>;
      }

      const result = func(...args) as ReturnType<T>;
      cache.set(key, result);
      return result;
    }) as T;
  },

  measureTime: async <T>(func: () => Promise<T> | T, label?: string): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await func();
    const duration = performance.now() - start;

    if (label as any) {
      // Performance measurement logged
    }

    return { result, duration };
  } };

// Error Handling Utilities
export const errorUtils = {
  createError: (message: any, code?: string, details?: unknown): Error => {
    const error = new Error(message) as Error & { code?: string; details?: unknown };
    if (code !== undefined) {
      error.code = code;
    }
    error.details = details;
    return error;
  },

  isNetworkError: (error: unknown): boolean => {
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>;
      return errorObj.code === 'NETWORK_ERROR' ||
             (typeof errorObj.message === 'string' &&
              (errorObj.message.includes('fetch') || errorObj.message.includes('network')));
    }
    return false;
  },

  formatErrorMessage: (error: unknown): string => {
    if (typeof error === 'string') {
return error;
}
    if (error instanceof Error) {
return error.message;
}
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>;
      if (typeof errorObj.message === 'string') {
        return errorObj.message;
      }
      if (typeof errorObj.error === 'string') {
        return errorObj.error;
      }
    }
    return 'An unexpected error occurred';
  },

  logError: (error: unknown, context?: string): void => {
    const isErrorWithDetails: any = (err: unknown): err is ErrorWithDetails => {
      return typeof err === 'object' && err !== null && 'message' in err;
    };

    const errorInfo = {
      message: errorUtils.formatErrorMessage(error),
      context,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined,
      details: isErrorWithDetails(error) ? error.details : undefined };

    (console as any).error('Error logged:', errorInfo);

    // In production, you might want to send this to an error tracking service
    // errorTrackingService.log(errorInfo);
  } };

// Export all utilities as a single object for convenience
export const utils = {
  date: dateUtils,
  number: numberUtils,
  string: stringUtils,
  media: mediaUtils,
  validation: validationUtils,
  array: arrayUtils,
  storage: storageUtils,
  performance: performanceUtils,
  error: errorUtils };

// Export individual utilities for tree-shaking
// All utilities are already exported individually above

// Direct exports for backward compatibility
export const { formatDuration } = dateUtils;
export const { formatViewCount } = numberUtils;
export const { formatTimeAgo } = dateUtils;