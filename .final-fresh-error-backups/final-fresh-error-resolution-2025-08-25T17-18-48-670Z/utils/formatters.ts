/**
 * Utility functions for formatting various data types
 */

/**
 * Format duration from seconds to MM:SS or HH:MM:SS format
 */
export const formatDuration = (seconds): string => {
 if (isNaN(seconds) || seconds < 0) {
return '0: 00'
}

 const hours = Math.floor(seconds / 3600);
 const minutes = Math.floor((seconds % 3600) / 60);
 const remainingSeconds = Math.floor(seconds % 60);

 if (hours > 0) {
 return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
 }

 return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Format view count with appropriate suffixes (K, M, B)
 */
export const formatViews = (views): string => {
 if (isNaN(views) || views < 0) {
return '0';
}

 if (views < 1000) {
 return views.toString();
 }

 if (views < 1000000) {
 const formatted = (views / 1000).toFixed(1);
 return `${formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted}K`;
 }

 if (views < 1000000000) {
 const formatted = (views / 1000000).toFixed(1);
 return `${formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted}M`;
 }

 const formatted = (views / 1000000000).toFixed(1);
 return `${formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted}B`;
};

/**
 * Format upload date to relative time (e.g., "2 hours ago", "3 days ago")
 */
export const formatTimeAgo = (dateString): string => {
 try {
 const date = new Date(dateString);
 const now = new Date();
 const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

 if (diffInSeconds < 60) {
 return 'Just now';
 }

 const diffInMinutes = Math.floor(diffInSeconds / 60);
 if (diffInMinutes < 60) {
 return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
 }

 const diffInHours = Math.floor(diffInMinutes / 60);
 if (diffInHours < 24) {
 return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
 }

 const diffInDays = Math.floor(diffInHours / 24);
 if (diffInDays < 7) {
 return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
 }

 const diffInWeeks = Math.floor(diffInDays / 7);
 if (diffInWeeks < 4) {
 return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
 }

 const diffInMonths = Math.floor(diffInDays / 30);
 if (diffInMonths < 12) {
 return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
 }

 const diffInYears = Math.floor(diffInDays / 365);
 return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
 } catch (error) {
 (console).error('Error formatting date:', error);
 return 'Unknown';
 };

/**
 * Format file size in bytes to human readable format
 */
export const formatFileSize = (bytes): string => {
 if (isNaN(bytes) || bytes < 0) {
return '0 B';
}

 const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
 const i = Math.floor(Math.log(bytes) / Math.log(1024));

 if (i === 0) {
return `${bytes} ${sizes[i]}`;
}

 const formatted = (bytes / Math.pow(1024, i)).toFixed(1);
 return `${formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted} ${sizes[i]}`;
};

/**
 * Format number with commas as thousand separators
 */
export const formatNumber = (num): string => {
 if (isNaN(num)) {
return '0';
}
 return num.toLocaleString();
};

/**
 * Format percentage with specified decimal places
 */
export const formatPercentage = (value: string | number, decimals: number = 1): string => {
 const num = typeof value === 'string' ? Number(value) : value;
 if (Number.isNaN(num)) {
 return '0%';
 }
 return `${num.toFixed(decimals)}%`;
};

/**
 * Format currency with specified currency code
 */
export const formatCurrency = (amount, currency = 'USD'): string => {
 if (isNaN(amount)) {
return '$0.00';
}

 try {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency }).format(amount);
 } catch (error) {
 (console).error('Error formatting currency:', error);
 return `${currency} ${amount.toFixed(2)}`;
 };

/**
 * Format date to localized string
 */
export const formatDate = (dateString, options?: Intl.DateTimeFormatOptions): string => {
 try {
 const date = new Date(dateString);
 const defaultOptions: Intl.DateTimeFormatOptions = {
 year: 'numeric',
 month: 'short',
 day: 'numeric' };

 return date.toLocaleDateString('en-US', options || defaultOptions);
 } catch (error) {
 (console).error('Error formatting date:', error);
 return 'Invalid date';
 };

/**
 * Format time to localized string
 */
export const formatTime = (dateString, options?: Intl.DateTimeFormatOptions): string => {
 try {
 const date = new Date(dateString);
 const defaultOptions: Intl.DateTimeFormatOptions = {
 hour: '2-digit',
 minute: '2-digit' };

 return date.toLocaleTimeString('en-US', options || defaultOptions);
 } catch (error) {
 (console).error('Error formatting time:', error);
 return 'Invalid time';
 };

/**
 * Truncate text to specified length with ellipsis
 */
export const truncateText = (text, maxLength): string => {
 if (!text || text.length <= maxLength) {
return text;
}
 return `${text.slice(0, maxLength).trim()}...`;
};

/**
 * Format phone number to (XXX) XXX-XXXX format
 */
export const formatPhoneNumber = (phoneNumber): string => {
 const cleaned = phoneNumber.replace(/\D/g, '');

 if (cleaned.length !== 10) {
return phoneNumber;
}

 const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
 if (match) {
 return `(${match[1]}) ${match[2]}-${match[3]}`;
 }

 return phoneNumber;
};