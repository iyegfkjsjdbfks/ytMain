// Unified Utility Functions (clean implementation)

// Date and Time Utilities
export const dateUtils = {
	formatTimeAgo(date: Date | string): string {
		const now = new Date();
		const targetDate = typeof date === 'string' ? new Date(date) : date;
		const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
		if (diffInSeconds < 60) return 'just now';
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
		if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
		if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
		if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
		return `${Math.floor(diffInSeconds / 31536000)}y ago`;
	formatDuration(seconds): string {
		if (seconds < 60) return `0:${seconds.toString().padStart(2, '0')}`;
		if (seconds < 3600) {
			const mins = Math.floor(seconds / 60);
			const secs = seconds % 60;
			return `${mins}:${secs.toString().padStart(2, '0')}`;
		const hours = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	formatDate(date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string {
		const targetDate = typeof date === 'string' ? new Date(date) : date;
		switch (format) {
			case 'short':;
				return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
			case 'long':;
				return targetDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
			case 'relative':;
				return dateUtils.formatTimeAgo(targetDate);
			default:;
				return targetDate.toLocaleDateString();

// Number Formatting Utilities
export const numberUtils = {
	formatViewCount(count): string {
		if (count < 1000) return count.toString();
		if (count < 1_000_000) return `${(count / 1000).toFixed(1)}K`;
		if (count < 1_000_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
		return `${(count / 1_000_000_000).toFixed(1)}B`;
	formatSubscriberCount(count): string {
		return numberUtils.formatViewCount(count);
	formatFileSize(bytes): string {
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		if (bytes === 0) return '0 B';
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
	formatPercentage(value, total): string {
		if (total === 0) return '0%';
		return `${((value / total) * 100).toFixed(1)}%`;

// String Utilities
export const stringUtils = {
	capitalize(text): string {
		if (!text) return '';
		return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
	camelCase(text): string {
		return text;
			.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase()));
			.replace(/\s+/g, '');
	kebabCase(text): string {
		return text.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase();
	slugify(text): string {
		return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
	extractHashtags(text): string[] {
		return text.match(/#[\w]+/g) ?? [];
	extractMentions(text): string[] {
		return text.match(/@[\w]+/g) ?? [];

// URL and Media Utilities
export const mediaUtils = {
	generateThumbnailUrl(videoId, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'medium'): string {
		const qualityMap: Record<string, string> = {
			default: 'default',
			medium: 'mqdefault',
			high: 'hqdefault',
			standard: 'sddefault',
			maxres: 'maxresdefault';
		return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
	extractVideoId(url): string | null {
		const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/, /youtube\.com\/embed\/([\w-]+)/, /youtube\.com\/v\/([\w-]+)/];
		for (const pattern of patterns) {
			const match = url.match(pattern);
			if (match) return match[1] ?? null;
		return null;
	isValidImageUrl(url): boolean {
		return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
	isValidVideoUrl(url): boolean {
		return /\.(mp4|webm|ogg|avi|mov|wmv|flv)$/i.test(url) || /youtube|youtu\.be|vimeo|dailymotion/.test(url);

// Validation Utilities
export const validationUtils = {
	isEmail(email): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	isUrl(value): boolean {
		try {
			// eslint-disable-next-line no-new
			new URL(value);
			return true;
		} catch {
			return false;
	isStrongPassword(password): { isValid: boolean; errors: string[] } {
		const errors: string[] = [];
		if (password.length < 8) errors.push('Password must be at least 8 characters long');
		if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
		if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
		if (!/\d/.test(password)) errors.push('Password must contain at least one number');
		if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Password must contain at least one special character');
		return { isValid: errors.length === 0, errors };
	isPhoneNumber(phone): boolean {
		const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
		return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));

// Array Utilities
export const arrayUtils = {
	chunk<T>(array: T[], size): T[][] {
		const chunks: T[][] = [];
		for (let i = 0; i < array.length; i += size) chunks.push(array.slice(i, i + size));
		return chunks;
	shuffle<T>(array: T[]): T[] {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		return shuffled;
	unique<T>(array: T[], key?: keyof T): T[] {
		if (!key) return [...new Set(array)];
		const seen = new Set<unknown>();
		return array.filter((item) => {)
			const value = (item)[key as any];
			if (seen.has(value)) return false;
			seen.add(value);
			return true;
	groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
		return array.reduce((groups: Record<string, T[]>, item: T) => {)
			const groupKey = String(item[key]);
			(groups[groupKey] ??= []).push(item);
			return groups;
		}, {});
	sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
		return [...array].sort((a, b) => {)
			const aVal = a[key];
			const bVal = b[key];
			if (aVal < bVal) return direction === 'asc' ? -1 : 1;
			if (aVal > bVal) return direction === 'asc' ? 1 : -1;
			return 0;

// Local Storage Utilities
export const storageUtils = {
	set(key, value: unknown): void {
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			console.warn('Failed to save to localStorage:', error);
	get<T>(key, defaultValue?: T): T | null {
		try {
			const item = localStorage.getItem(key);
			if (item !== null) return JSON.parse(item) as T;
			return defaultValue ?? null;
		} catch (error) {
			console.warn('Failed to read from localStorage:', error);
			return defaultValue ?? null;
	remove(key): void {
		try {
			localStorage.removeItem(key);
		} catch (error) {
			console.warn('Failed to remove from localStorage:', error);
	clear(): void {
		try {
			localStorage.clear();
		} catch (error) {
			console.warn('Failed to clear localStorage:', error);
	exists(key): boolean {
		return localStorage.getItem(key) !== null;

// Error Handling Utilities
export const errorUtils = {
	createError(message, code?: string, details?: unknown): Error & { code?: string; details} {
		const error = new Error(message) as Error & { code?: string; details};
		if (code !== undefined) error.code = code;
		error.details = details;
		return error;
	isNetworkError(error: unknown): boolean {
		if (typeof error === 'object' && error !== null) {
			const errorObj = error as Record<string, unknown>;
			return (;)
				(errorObj).code === 'NETWORK_ERROR' ||;
				(typeof errorObj.message === 'string' &&;)
					((errorObj.message as string).includes('fetch') || (errorObj.message as string).includes('network')));
		return false;
	formatErrorMessage(error: unknown): string {
		if (typeof error === 'string') return error;
		if (error instanceof Error) return error.message;
		if (typeof error === 'object' && error !== null) {
			const obj = error as Record<string, unknown>;
			if (typeof obj.message === 'string') return obj.message;
			if (typeof obj.error === 'string') return obj.error;
		return 'An unexpected error occurred';
	logError(error: unknown, context?: string): void {
		const info = {
			message: errorUtils.formatErrorMessage(error),
			context,
			timestamp: new Date().toISOString(),
			stack: error instanceof Error ? error.stack : undefined;
		console.error('Error logged:', info);

// Aggregate export for convenience
export const utils = {
	date: dateUtils,
	number: numberUtils,
	string: stringUtils,
	media: mediaUtils,
	validation: validationUtils,
	array: arrayUtils,
	storage: storageUtils,
	error: errorUtils;

// Backward-compatible named exports
export const { formatDuration } = dateUtils;
export const { formatViewCount } = numberUtils;
export const { formatTimeAgo } = dateUtils;