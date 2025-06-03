import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// =================================
// 1. Class Name Utilities
// =================================

/**
 * Combines class names using clsx and merges Tailwind classes with tailwind-merge
 * @param inputs - Class values to combine and merge
 * @returns A single string of combined and merged class names
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// =================================
// 2. Number Formatting
// =================================

/**
 * Formats a number with appropriate suffix (K, M, B)
 * @param num - The number to format
 * @param decimals - Number of decimal places to show (default: 1)
 * @returns Formatted number as string with suffix
 */
export function formatNumber(num: number, decimals: number = 1): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(decimals) + 'B';
  }
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M';
  }
  
  if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + 'K';
  }
  
  return num.toString();
}

/**
 * Formats a number with commas as thousand separators
 * @param num - The number to format
 * @returns Formatted number string with commas
 */
export function formatNumberWithCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Clamps a number between a minimum and maximum value
 * @param num - The number to clamp
 * @param min - The minimum value
 * @param max - The maximum value
 * @returns The clamped number
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

// =================================
// 3. Date & Time Utilities
// =================================

/**
 * Formats a duration in seconds to HH:MM:SS or MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted time string
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  const parts = [];
  if (h > 0) parts.push(h.toString().padStart(2, '0'));
  parts.push(m.toString().padStart(2, '0'));
  parts.push(s.toString().padStart(2, '0'));
  
  return parts.join(':');
}

/**
 * Formats a date to a relative time string (e.g., "2 hours ago")
 * @param date - Date object or date string
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };
  
  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return 'just now';
}

/**
 * Formats a date to a readable string (e.g., "Jun 3, 2023")
 * @param date - Date object or date string
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
}

// =================================
// 4. String Utilities
// =================================

/**
 * Truncates a string to a specified length and adds an ellipsis if needed
 * @param str - The string to truncate
 * @param maxLength - Maximum length before truncation
 * @param ellipsis - The ellipsis string to append (default: '...')
 * @returns Truncated string with ellipsis if needed
 */
export function truncate(str: string, maxLength: number, ellipsis: string = '...'): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + (str.length > maxLength ? ellipsis : '');
}

/**
 * Converts a string to title case
 * @param str - The string to convert
 * @returns String in title case
 */
export function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

/**
 * Converts a string to kebab-case
 * @param str - The string to convert
 * @returns kebab-case string
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

// =================================
// 5. URL Utilities
// =================================


// Re-export YouTube utilities
export * from './youtube-utils';

/**
 * Builds a query string from an object
 * @param params - Object with query parameters
 * @returns Query string (without leading ?)
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item !== undefined && item !== null) {
            searchParams.append(key, String(item));
          }
        });
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
}

// =================================
// 6. Validation Utilities
// =================================

/**
 * Checks if a value is an object
 * @param value - The value to check
 * @returns True if the value is an object (and not null/array)
 */
export function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Checks if a value is a function
 * @param value - The value to check
 * @returns True if the value is a function
 */
export function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === 'function';
}

/**
 * Checks if a string is a valid URL
 * @param str - The string to check
 * @returns True if the string is a valid URL
 */
export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

// =================================
// 7. Debounce & Throttle
// =================================

/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A new debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Creates a throttled function that only invokes `func` at most once per every `limit` milliseconds
 * @param func - The function to throttle
 * @param limit - The number of milliseconds to throttle invocations to
 * @returns A new throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// =================================
// 8. File Utilities
// =================================

/**
 * Converts a file to a base64 string
 * @param file - The file to convert
 * @returns A promise that resolves to the base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Gets the file extension from a filename
 * @param filename - The filename
 * @returns The file extension (without the dot)
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

// =================================
// 9. Browser Utilities
// =================================

/**
 * Checks if the code is running in a browser environment
 * @returns True if running in a browser
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

/**
 * Copies text to the clipboard
 * @param text - The text to copy
 * @returns A promise that resolves when the text is copied
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (!isBrowser()) return;
  
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

// =================================
// 10. Type Guards & Type Utilities
// =================================

/**
 * Type guard to check if a value is not null or undefined
 * @param value - The value to check
 * @returns True if the value is not null or undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard to check if a value is a string
 * @param value - The value to check
 * @returns True if the value is a string
 */
export function isString(value: any): value is string {
  return typeof value === 'string' || value instanceof String;
}

/**
 * Type guard to check if a value is a number
 * @param value - The value to check
 * @returns True if the value is a number
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

// =================================
// 11. Color Utilities
// =================================

/**
 * Converts a hex color to RGB
 * @param hex - The hex color (with or without #)
 * @returns An object with r, g, b values (0-255)
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  
  return {
    r: parseInt(result[1] || '0', 16),
    g: parseInt(result[2] || '0', 16),
    b: parseInt(result[3] || '0', 16),
  };
}

/**
 * Checks if a color is light or dark
 * @param color - The color in hex format
 * @returns 'light' or 'dark'
 */
export function getColorContrast(hex: string): 'light' | 'dark' {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'dark';
  
  // Calculate relative luminance (per ITU-R BT.709)
  const { r, g, b } = rgb;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  
  // Return light or dark based on luminance threshold
  return luminance > 0.5 ? 'dark' : 'light';
}

// =================================
// 12. Array Utilities
// =================================

/**
 * Removes duplicate values from an array
 * @param array - The array to deduplicate
 * @returns A new array with unique values
 */
export function uniq<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Groups array items by a key
 * @param array - The array to group
 * @param key - The key to group by
 * @returns An object with keys and arrays of grouped items
 */
export function groupBy<T extends Record<string, any>, K extends keyof T>(
  array: T[], 
  key: K
): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

// =================================
// 13. Object Utilities
// =================================

/**
 * Deeply merges two objects
 * @param target - The target object
 * @param source - The source object
 * @returns A new merged object
 */
export function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
  const output = { ...target } as T & U;
  
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const targetValue = (target as any)[key];
      const sourceValue = (source as any)[key];
      
      if (isObject(targetValue) && isObject(sourceValue)) {
        (output as any)[key] = deepMerge(targetValue, sourceValue);
      } else {
        (output as any)[key] = sourceValue;
      }
    }
  }
  
  return output;
}

// =================================
// 14. Promise Utilities
// =================================

/**
 * Creates a promise that resolves after a specified delay
 * @param ms - The delay in milliseconds
 * @returns A promise that resolves after the delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wraps a promise to include a timeout
 * @param promise - The promise to wrap
 * @param timeout - The timeout in milliseconds
 * @param error - Optional custom error message
 * @returns A promise that rejects if it takes longer than the timeout
 */
export function timeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  error: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(error)), timeoutMs)
    ),
  ]);
}

// =================================
// 15. Random Utilities
// =================================

/**
 * Generates a random string of a specified length
 * @param length - The length of the random string
 * @returns A random string
 */
export function randomString(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (inclusive)
 * @returns A random integer between min and max
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
