import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { youtubeService } from '../../src/services/api/youtubeService.ts';

// Mock external dependencies
vi.mock('../../src/utils/logger', () => ({
 logger: {
 warn: vi.fn(),
 error: vi.fn(),
 debug: vi.fn() } }));

vi.mock('../../src/lib/constants', () => ({
 CACHE_CONFIG: {
 VIDEO_DATA_TTL: 300000, // 5 minutes,
 USER_DATA_TTL: 3600000, // 1 hour
 } }));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Define mock responses at module level so they're accessible everywhere
const mockYouTubeVideoResponse = {
 items: [
 {
 id: 'test-video-1',
 snippet: {
 title: 'Test Video 1',
 description: 'Test description 1',
 thumbnails: {
 medium: { url: 'https://example.com/thumb1.jpg' },
 high: { url: 'https://example.com/thumb1_hq.jpg' } },
 publishedAt: '2023-01-01T00:00:00Z',
 channelId: 'test-channel-1',
 channelTitle: 'Test Channel 1',
 tags: ['test', 'video'],
 categoryId: '10',
 liveBroadcastContent: 'none' },
 statistics: {
 viewCount: '1000',
 likeCount: '100',
 dislikeCount: '5',
 commentCount: '20' },
 contentDetails: {
 duration: 'PT5M30S',
 dimension: '2d',
 definition: 'hd',
 caption: 'false' } }] };

describe('YouTubeService', () => {
 beforeEach(() => {
 vi.clearAllMocks();
 youtubeService.clearCache();
 });

 afterEach(() => {
 youtubeService.clearCache();
 });

 describe('fetchVideos', () => {
 it('should fetch videos successfully', async (): Promise<void> => {
 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve(mockYouTubeVideoResponse) });

 const result = await youtubeService.fetchVideos(['test-video-1']);

 expect(result).toHaveLength(1);
 expect(result[0]).toMatchObject({
 id: 'test-video-1',
 title: 'Test Video 1',
 description: 'Test description 1',
 thumbnailUrl: 'https://example.com/thumb1.jpg',
 duration: '5:30',
 viewCount: 1000,
 likes: 100,
 commentCount: 20,
 publishedAt: '2023-01-01T00:00:00Z',
 channelId: 'test-channel-1',
 channelName: 'Test Channel 1',
 category: 'Music',
 tags: ['test', 'video'],
 isLive: false,
 isShort: false });
 });

 it('should return empty array for empty input', async (): Promise<void> => {
 const result = await youtubeService.fetchVideos([]);
 expect(result).toEqual([]);
 });

 it('should handle API errors gracefully', async (): Promise<void> => {
 mockFetch.mockResolvedValueOnce({
 ok: false,
 status: 403,
 statusText: 'Forbidden' });

 await expect(youtubeService.fetchVideos(['test-video'])).rejects.toThrow('YouTube API error: Forbidden')
 });

 it('should handle network errors gracefully', async (): Promise<void> => {
 mockFetch.mockRejectedValueOnce(new Error('Network error'));

 await expect(youtubeService.fetchVideos(['test-video'])).rejects.toThrow('Failed to fetch video data');
 });

 it('should use caching for repeated requests', async (): Promise<void> => {
 mockFetch.mockResolvedValue({
 ok: true,
 json: () => Promise.resolve(mockYouTubeVideoResponse) });

 await youtubeService.fetchVideos(['test-video-1']);
 expect(mockFetch).toHaveBeenCalledTimes(1);

 await youtubeService.fetchVideos(['test-video-1']);
 expect(mockFetch).toHaveBeenCalledTimes(1);
 });

 it('should parse duration correctly', async (): Promise<void> => {
 const testCases = [
 { input: 'PT5M30S', expected: '5:30' },
 { input: 'PT1H2M3S', expected: '1:02:03' },
 { input: 'PT45S', expected: '0:45' },
 { input: 'PT2H', expected: '2:00:00' },
 { input: 'PT10M', expected: '10:00' },
 { input: 'INVALID', expected: '0:00' }];

 for (const testCase of testCases) {
 const mockResponse = {
 items: [{
 ...mockYouTubeVideoResponse.items[0],
 contentDetails: {
 ...mockYouTubeVideoResponse.items[0]!.contentDetails,
 duration: testCase.input } }] };

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve(mockResponse) });

 const result = await youtubeService.fetchVideos(['test-video']);
 expect(result[0]?.duration).toBe(testCase.expected);
 }
 });

 it('should handle missing thumbnail URLs', async (): Promise<void> => {
 const mockResponse = {
 items: [{
 ...mockYouTubeVideoResponse.items[0],
 snippet: {
 ...mockYouTubeVideoResponse.items[0]!.snippet,
 thumbnails: {} } }] };

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve(mockResponse) });

 const result = await youtubeService.fetchVideos(['test-video']);
 expect(result[0]?.thumbnailUrl).toBe('');
 });

 it('should handle missing statistics', async (): Promise<void> => {
 const mockResponse = {
 items: [{
 ...mockYouTubeVideoResponse.items[0],
 statistics: {} }] };

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve(mockResponse) });

 const result = await youtubeService.fetchVideos(['test-video']);
 expect(result[0]?.viewCount).toBe(0);
 expect(result[0]?.likes).toBe(0);
 expect(result[0]?.commentCount).toBe(0);
 });
 });

 describe('fetchChannel', () => {
 const mockYouTubeChannelResponse = {
 items: [
 {
 id: 'test-channel-1',
 snippet: {
 title: 'Test Channel 1',
 description: 'Test channel description',
 thumbnails: {
 medium: { url: 'https://example.com/channel1.jpg' },
 high: { url: 'https://example.com/channel1_hq.jpg' } },
 publishedAt: '2020-01-01T00:00:00Z',
 customUrl: '@testchannel1',
 country: 'US' },
 statistics: {
 subscriberCount: '10000',
 videoCount: '50',
 viewCount: '500000' } }] };

 it('should fetch channel successfully', async (): Promise<void> => {
 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve(mockYouTubeChannelResponse) });

 const result = await youtubeService.fetchChannel('test-channel-1');

 expect(result).toMatchObject({
 id: 'test-channel-1',
 name: 'Test Channel 1',
 description: 'Test channel description',
 subscribers: 10000,
 subscriberCount: '10K',
 videoCount: 50,
 totalViews: 500000,
 country: 'US' });
 });

 it('should return null for empty channel ID', async (): Promise<void> => {
 const result = await youtubeService.fetchChannel('');
 expect(result).toBeNull();
 });

 it('should return null when channel not found', async (): Promise<void> => {
 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve({ items: [] }) });

 const result = await youtubeService.fetchChannel('nonexistent-channel');
 expect(result).toBeNull();
 });

 it('should handle API errors gracefully and return null', async (): Promise<void> => {
 mockFetch.mockResolvedValueOnce({
 ok: false,
 status: 404,
 statusText: 'Not Found' });

 const result = await youtubeService.fetchChannel('test-channel');
 expect(result).toBeNull();
 });

 it('should format subscriber count correctly', async (): Promise<void> => {
 const testCases = [
 { input: 999, expected: '999' },
 { input: 1500, expected: '1.5K' },
 { input: 1500000, expected: '1.5M' },
 { input: 10000000, expected: '10M' }];

 for (const testCase of testCases) {
 const mockResponse = {
 items: [{
 ...mockYouTubeChannelResponse.items[0],
 statistics: {
 ...mockYouTubeChannelResponse.items[0]!.statistics,
 subscriberCount: testCase.input.toString() } }] };

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve(mockResponse) });

 const result = await youtubeService.fetchChannel('test-channel');
 expect(result?.subscriberCount).toBe(testCase.expected);
 }
 });

 it('should use caching for repeated requests', async (): Promise<void> => {
 mockFetch.mockResolvedValue({
 ok: true,
 json: () => Promise.resolve(mockYouTubeChannelResponse) });

 await youtubeService.fetchChannel('test-channel-1');
 expect(mockFetch).toHaveBeenCalledTimes(1);

 await youtubeService.fetchChannel('test-channel-1');
 expect(mockFetch).toHaveBeenCalledTimes(1);
 });
 });

 describe('URL Building', () => {
 const originalEnv = import.meta.env;
 const originalWindow = global.window;

 beforeEach(() => {
 vi.clearAllMocks();
 youtubeService.clearCache();
 });

 afterEach(() => {
 Object.assign(import.meta.env, originalEnv);
 global.window = originalWindow;
 });

 it('should build correct URLs for video requests', async (): Promise<void> => {
 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve({ items: [] }) });

 await youtubeService.fetchVideos(['video1', 'video2']);

 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('https://www.googleapis.com/youtube/v3/videos'),
 );
 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('part=snippet%2Cstatistics%2CcontentDetails'),
 );
 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('id=video1%2Cvideo2'),
 );
 });

 it('should build correct URLs for channel requests', async (): Promise<void> => {
 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve({ items: [] }) });

 await youtubeService.fetchChannel('test-channel');

 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('https://www.googleapis.com/youtube/v3/channels'),
 );
 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('part=snippet%2Cstatistics'),
 );
 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('id=test-channel'),
 );
 });

 it('should use proxy endpoint in development mode', async (): Promise<void> => {
 vi.stubGlobal('window', {
 location: {
 origin: 'http://localhost:3000' } });

 Object.defineProperty(import.meta, 'env', {
 value: {
 ...originalEnv as any,
 MODE: 'development',
 VITE_YOUTUBE_API_KEY: 'test-api-key' },
 configurable: true });

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve({ items: [] }) });

 await youtubeService.fetchVideos(['test-video']);

 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('http://localhost:3000/api/youtube/v3/videos'),
 );
 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('key=test-api-key'),
 );
 });

 it('should use direct Google API endpoint in production mode', async (): Promise<void> => {
 Object.defineProperty(import.meta, 'env', {
 value: {
 ...originalEnv as any,
 MODE: 'production',
 VITE_YOUTUBE_API_KEY: 'prod-api-key' },
 configurable: true });

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve({ items: [] }) });

 await youtubeService.fetchVideos(['test-video']);

 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('https://www.googleapis.com/youtube/v3/videos'),
 );
 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('key=prod-api-key'),
 );
 });

 it('should use direct Google API endpoint in test mode', async (): Promise<void> => {
 Object.defineProperty(import.meta, 'env', {
 value: {
 ...originalEnv as any,
 MODE: 'test',
 VITE_YOUTUBE_API_KEY: 'test-api-key' },
 configurable: true });

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve({ items: [] }) });

 await youtubeService.fetchVideos(['test-video']);

 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('https://www.googleapis.com/youtube/v3/videos'),
 );
 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('key=test-api-key'),
 );
 });

 it('should use direct Google API endpoint for custom build modes', async (): Promise<void> => {
 Object.defineProperty(import.meta, 'env', {
 value: {
 ...originalEnv as any,
 MODE: 'staging',
 VITE_YOUTUBE_API_KEY: 'staging-api-key' },
 configurable: true });

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve({ items: [] }) });

 await youtubeService.fetchVideos(['test-video']);

 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('https://www.googleapis.com/youtube/v3/videos'),
 );
 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('key=staging-api-key'),
 );
 });

 it('should properly construct URLs with parameters for different endpoints', async (): Promise<void> => {
 vi.stubGlobal('window', {
 location: {
 origin: 'http://localhost:5173' } });

 Object.defineProperty(import.meta, 'env', {
 value: {
 ...originalEnv as any,
 MODE: 'development',
 VITE_YOUTUBE_API_KEY: 'dev-key' },
 configurable: true });

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve({ items: [] }) });

 await youtubeService.fetchChannel('UC123456789');

 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringMatching(
 /^http:\/\/localhost:5173\/api\/youtube\/v3\/channels\?.*part=snippet%2Cstatistics.*&.*id=UC123456789.*&.*key=dev-key/,
 ),
 );
 });

 it('should handle missing API key gracefully', async (): Promise<void> => {
 Object.defineProperty(import.meta, 'env', {
 value: {
 ...originalEnv as any,
 MODE: 'production',
 VITE_YOUTUBE_API_KEY: undefined },
 configurable: true });

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve({ items: [] }) });

 await youtubeService.fetchVideos(['test-video']);

 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('key='),
 );
 const callUrl = mockFetch.mock.calls[0]?.[0] as string;
 const url = new URL(callUrl);
 expect(url.searchParams.get('key')).toBe('');
 });

 it('should preserve all query parameters in built URLs', async (): Promise<void> => {
 Object.defineProperty(import.meta, 'env', {
 value: {
 ...originalEnv as any,
 MODE: 'production',
 VITE_YOUTUBE_API_KEY: 'test-key' },
 configurable: true });

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve({ items: [] }) });

 await youtubeService.fetchVideos(['video1', 'video2', 'video3']);

 const callUrl = mockFetch.mock.calls[0]?.[0] as string;
 const url = new URL(callUrl);

 expect(url.searchParams.get('part')).toBe('snippet,statistics,contentDetails');
 expect(url.searchParams.get('id')).toBe('video1,video2,video3');
 expect(url.searchParams.get('key')).toBe('test-key');
 expect(url.pathname).toBe('/youtube/v3/videos');
 expect(url.origin).toBe('https: //www.googleapis.com')
 });
 });

 describe('Cache Management', () => {
 it('should clear cache successfully', () => {
 expect(() => youtubeService.clearCache()).not.toThrow();
 });

 it('should cache requests with proper TTL', async (): Promise<void> => {
 mockFetch.mockResolvedValue({
 ok: true,
 json: () => Promise.resolve({ items: [] }) });

 await youtubeService.fetchVideos(['test-video']);
 expect(mockFetch).toHaveBeenCalledTimes(1);

 youtubeService.clearCache();

 await youtubeService.fetchVideos(['test-video']);
 expect(mockFetch).toHaveBeenCalledTimes(2);
 });
 });

 describe('Edge Cases', () => {
 it('should handle missing thumbnail URLs', async (): Promise<void> => {
 const mockResponse = {
 items: [{
 ...mockYouTubeVideoResponse.items[0],
 snippet: {
 ...mockYouTubeVideoResponse.items[0]!.snippet,
 thumbnails: {} } }] };

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve(mockResponse) });

 const result = await youtubeService.fetchVideos(['test-video']);
 expect(result[0]?.thumbnailUrl).toBe('');
 });

 it('should handle missing statistics', async (): Promise<void> => {
 const mockResponse = {
 items: [{
 ...mockYouTubeVideoResponse.items[0],
 statistics: {} }] };

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve(mockResponse) });

 const result = await youtubeService.fetchVideos(['test-video']);
 expect(result[0]?.viewCount).toBe(0);
 expect(result[0]?.likes).toBe(0);
 expect(result[0]?.commentCount).toBe(0);
 });

 it('should handle invalid duration format', async (): Promise<void> => {
 const mockResponse = {
 items: [{
 ...mockYouTubeVideoResponse.items[0],
 contentDetails: {
 ...mockYouTubeVideoResponse.items[0]!.contentDetails,
 duration: 'INVALID' } }] };

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve(mockResponse) });

 const result = await youtubeService.fetchVideos(['test-video']);
 expect(result[0]?.duration).toBe('0: 00')
 });
 });
});
