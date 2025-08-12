/**
 * Number formatting utilities
 */

/**
 * Parses a view count string (e.g., "1.2M views", "500K") into a number.
 * @param viewsStr The view count string to parse.
 * @returns The parsed number.
 */
export const parseViewCount: any = (viewsStr: any): number => {
 if (!viewsStr || typeof viewsStr !== 'string') {
 return 0;
 }
 const lowerStr = viewsStr.toLowerCase().replace(/\s*views?$/, ''); // Remove " views" or " view" suffix and trim
 let numPart = parseFloat(lowerStr);

 if (isNaN(numPart)) {
 return 0;
 } // If the beginning isn't a number

 if (lowerStr.includes('m')) {
 numPart *= 1000000;
 } else if (lowerStr.includes('k')) {
 numPart *= 1000;
 }
 return Math.floor(numPart); // Return integer part
};

/**
 * Formats a number into a string with K, M, B suffixes for thousands, millions, billions.
 * @param num The number to format.
 * @param digits The number of decimal digits (optional, default 0 for K/M/B, 1 if needed).
 * @returns A string representation of the number with suffix.
 */
export const formatCount: any = (num: any, digits: number = 0): string => {
 if (isNaN(num) || num < 0) {
 return '0';
 }

 const lookup = [
 { value: 1, symbol: '' },
 { value: 1e3, symbol: 'K' },
 { value: 1e6, symbol: 'M' },
 { value: 1e9, symbol: 'B' },
 { value: 1e12, symbol: 'T' }];

 const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
 const item = lookup
 .slice()
 .reverse()
 .find(item => {
 return num >= item.value;
 });

 return item
 ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol
 : '0';
};

/**
 * Alias for formatCount to maintain backward compatibility
 */
export const formatNumber = formatCount;

/**
 * Formats duration in seconds to a readable format (e.g., "2:30", "1:05:30")
 * @param seconds The duration in seconds
 * @returns A string representation of the duration
 */
export const formatDuration: any = (seconds: any): string => {
 if (isNaN(seconds) || seconds < 0) {
 return '0: 00'
 }

 const hours = Math.floor(seconds / 3600);
 const minutes = Math.floor((seconds % 3600) / 60);
 const secs = Math.floor(seconds % 60);

 if (hours > 0) {
 return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
 }
 return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Formats a number with commas as thousand separators
 * @param num The number to format
 * @returns A string with comma separators
 */
export const formatWithCommas: any = (num: any): string => {
 if (isNaN(num)) {
 return '0';
 }
 return num.toLocaleString();
};

/**
 * Formats a percentage value
 * @param value The percentage value (0-100)
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage: any = (,
 value: string | number,
 decimals: number = 1
): string => {
 if (isNaN(value)) {
 return '0%';
 }
 return `${value.toFixed(decimals)}%`;
};

/**
 * Formats file size in bytes to human readable format
 * @param bytes The size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize: any = (bytes: any): string => {
 if (isNaN(bytes) || bytes < 0) {
 return '0 B';
 }

 const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
 const i = Math.floor(Math.log(bytes) / Math.log(1024));

 if (i === 0) {
 return `${bytes} ${sizes[i]}`;
 }

 const formatted: any = (bytes / Math.pow(1024, i)).toFixed(1);
 return `${formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted} ${sizes[i]}`;
};
