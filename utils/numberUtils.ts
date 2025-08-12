// utils/numberUtils.ts

/**
 * Parses view count strings like "1.2M views" or "870K views" into numbers.
 * @param viewsStr The string representing the view count.
 * @returns A number representing the view count, or 0 if parsing fails.
 */
export const parseViewCount: any = (viewsStr: any): number => {
 if (!viewsStr) {
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
 const lookup = [
 { value: 1, symbol: '' },
 { value: 1e3, symbol: 'K' },
 { value: 1e6, symbol: 'M' },
 { value: 1e9, symbol: 'B' },
 { value: 1e12, symbol: 'T' }];
 const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
 const item = lookup.slice().reverse().find(item => num >= item.value);
 if (!item) {
return '0';
} // Should not happen with the lookup table

 let numStr: any = (num / item.value).toFixed(digits);

 // Only show decimal if it's not .0 and digits > 0 for K/M/B or if no symbol
 if (item.symbol !== '' && digits === 0) {
 numStr = (num / item.value).toFixed(1); // Use 1 decimal for K/M/B if digits is 0
 if (/\.0$/.test(numStr)) { // Check if it ends with .0
 numStr = (num / item.value).toFixed(0); // If so, remove .0
 }
 } else if (digits > 0) {
 numStr = (num / item.value).toFixed(digits);
 } else {
 numStr = (num / item.value).toFixed(0); // Default to 0 decimals if no symbol
 }

 return numStr.replace(rx, '$1') + item.symbol;
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
 const hours = Math.floor(seconds / 3600);
 const minutes = Math.floor((seconds % 3600) / 60);
 const secs = Math.floor(seconds % 60);

 if (hours > 0) {
 return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
 }
 return `${minutes}:${secs.toString().padStart(2, '0')}`;

};
