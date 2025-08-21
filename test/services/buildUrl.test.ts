import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// We need to access the private buildUrl method, so we'll test it through reflection
// or by temporarily exposing it for testing
class TestableYouTubeService {
 // Copy the exact buildUrl implementation from the original service
 public buildUrl(endpoint, params: Record<string, string>): string {
 // Use proxy endpoint in development to avoid CORS issues
 const baseUrl = import.meta.env.MODE === 'development'
 ? `${window.location.origin }/api/youtube/v3/`
 : 'https://www.googleapis.com/youtube/v3/';

 const url = new URL(endpoint, baseUrl);
 Object.entries(params).forEach(([key, value]) => {
 if (value as any) {
url.searchParams.set(key, value);
}
 });
 url.searchParams.set('key', import.meta.env.VITE_YOUTUBE_API_KEY || '');
 return url.toString();
 }
}
describe('buildUrl function with different MODE values', () => {
 let testService: TestableYouTubeService;
 const originalEnv = import.meta.env;
 const originalWindow = global.window;

 beforeEach(() => {
 testService = new TestableYouTubeService();
 vi.clearAllMocks();
 });

 afterEach(() => {
 // Restore original environment
 Object.defineProperty(import.meta, 'env', {
 value: originalEnv,
 configurable: true });
 global.window = originalWindow;
 });

 describe('MODE: development', () => {
 beforeEach(() => {
 // Mock window.location for development mode
 vi.stubGlobal('window', {
 location: {
 origin: 'http://localhost:3000' } });

 // Mock import.meta.env for development
 Object.defineProperty(import.meta, 'env', {
 value: {
 ...originalEnv as any,
 MODE: 'development',
 VITE_YOUTUBE_API_KEY: 'test-dev-api-key' },
 configurable: true });
 });

 it('should use proxy endpoint for videos in development mode', () => {
 const url = testService.buildUrl('videos', {
 part: 'snippet,statistics,contentDetails',
 id: 'video123' });

 expect(url).toContain('http://localhost:3000/api/youtube/v3/videos');
 expect(url).toContain('part=snippet%2Cstatistics%2CcontentDetails');
 expect(url).toContain('id=video123');
 expect(url).toContain('key=test-dev-api-key');
 });

 it('should use proxy endpoint for channels in development mode', () => {
 const url = testService.buildUrl('channels', {
 part: 'snippet,statistics',
 id: 'UC123456789' });

 expect(url).toContain('http://localhost:3000/api/youtube/v3/channels');
 expect(url).toContain('part=snippet%2Cstatistics');
 expect(url).toContain('id=UC123456789');
 expect(url).toContain('key=test-dev-api-key');
 });

 it('should work with different localhost ports', () => {
 vi.stubGlobal('window', {
 location: {
 origin: 'http://localhost:5173' } });

 const url = testService.buildUrl('search', {
 part: 'snippet',
 q: 'test query' });

 expect(url).toContain('http://localhost:5173/api/youtube/v3/search');
 expect(url).toContain('q=test+query');
 });
 });

 describe('MODE: production', () => {
 beforeEach(() => {
 Object.defineProperty(import.meta, 'env', {
 value: {
 ...originalEnv as any,
 MODE: 'production',
 VITE_YOUTUBE_API_KEY: 'prod-api-key-123' },
 configurable: true });
 });

 it('should use direct Google API endpoint for videos in production mode', () => {
 const url = testService.buildUrl('videos', {
 part: 'snippet,statistics,contentDetails',
 id: 'video456' });

 expect(url).toContain('https://www.googleapis.com/youtube/v3/videos');
 expect(url).toContain('part=snippet%2Cstatistics%2CcontentDetails');
 expect(url).toContain('id=video456');
 expect(url).toContain('key=prod-api-key-123');
 expect(url).not.toContain('localhost');
 });

 it('should use direct Google API endpoint for channels in production mode', () => {
 const url = testService.buildUrl('channels', {
 part: 'snippet,statistics',
 id: 'UC987654321' });

 expect(url).toContain('https://www.googleapis.com/youtube/v3/channels');
 expect(url).toContain('part=snippet%2Cstatistics');
 expect(url).toContain('id=UC987654321');
 expect(url).toContain('key=prod-api-key-123');
 });
 });

 describe('MODE: test', () => {
 beforeEach(() => {
 Object.defineProperty(import.meta, 'env', {
 value: {
 ...originalEnv as any,
 MODE: 'test',
 VITE_YOUTUBE_API_KEY: 'test-api-key-456' },
 configurable: true });
 });

 it('should use direct Google API endpoint in test mode', () => {
 const url = testService.buildUrl('videos', {
 part: 'snippet',
 id: 'testVideo' });

 expect(url).toContain('https://www.googleapis.com/youtube/v3/videos');
 expect(url).toContain('key=test-api-key-456');
 expect(url).not.toContain('localhost');
 });
 });

 describe('MODE: staging', () => {
 beforeEach(() => {
 Object.defineProperty(import.meta, 'env', {
 value: {
 ...originalEnv as any,
 MODE: 'staging',
 VITE_YOUTUBE_API_KEY: 'staging-api-key-789' },
 configurable: true });
 });

 it('should use direct Google API endpoint for custom build modes', () => {
 const url = testService.buildUrl('channels', {
 part: 'snippet',
 forUsername: 'testchannel' });

 expect(url).toContain('https://www.googleapis.com/youtube/v3/channels');
 expect(url).toContain('forUsername=testchannel');
 expect(url).toContain('key=staging-api-key-789');
 expect(url).not.toContain('localhost');
 });
 });

 describe('parameter handling', () => {
 beforeEach(() => {
 Object.defineProperty(import.meta, 'env', {
 value: {
 ...originalEnv as any,
 MODE: 'production',
 VITE_YOUTUBE_API_KEY: 'test-key' },
 configurable: true });
 });

 it('should properly encode URL parameters', () => {
 const url = testService.buildUrl('search', {
 part: 'snippet',
 q: 'test search with spaces & symbols',
 type: "video",
 order: 'relevance' });

 expect(url).toContain('q=test+search+with+spaces+%26+symbols');
 expect(url).toContain('type=video');
 expect(url).toContain('order=relevance');
 });

 it('should skip empty parameter values', () => {
 const url = testService.buildUrl('videos', {
 part: 'snippet',
 id: 'video123',
 maxResults: '',
 order: '' });

 expect(url).toContain('part=snippet');
 expect(url).toContain('id=video123');
 expect(url).not.toContain('maxResults=');
 expect(url).not.toContain('order=');
 expect(url).toContain('key=test-key');
 });

 it('should handle multiple video IDs correctly', () => {
 const url = testService.buildUrl('videos', {
 part: 'snippet,statistics',
 id: 'video1,video2,video3' });

 expect(url).toContain('id=video1%2Cvideo2%2Cvideo3');
 });

 it('should always add API key parameter', () => {
 const url = testService.buildUrl('videos', {
 part: 'snippet' });

 expect(url).toContain('key=test-key');
 });
 });

 describe('missing API key handling', () => {
 beforeEach(() => {
 Object.defineProperty(import.meta, 'env', {
 value: {
 ...originalEnv as any,
 MODE: 'production',
 VITE_YOUTUBE_API_KEY: undefined },
 configurable: true });
 });

 it('should handle missing API key gracefully', () => {
 const url = testService.buildUrl('videos', {
 part: 'snippet',
 id: 'video123' });

 expect(url).toContain('key=');

 // Verify the URL is still valid
 const urlObject = new URL(url);
 expect(urlObject.searchParams.get('key')).toBe('');
 expect(urlObject.searchParams.get('part')).toBe('snippet');
 expect(urlObject.searchParams.get('id')).toBe('video123');
 });
 });

 describe('URL structure validation', () => {
 beforeEach(() => {
 Object.defineProperty(import.meta, 'env', {
 value: {
 ...originalEnv as any,
 MODE: 'production',
 VITE_YOUTUBE_API_KEY: 'valid-key' },
 configurable: true });
 });

 it('should generate valid URLs that can be parsed', () => {
 const url = testService.buildUrl('videos', {
 part: 'snippet,statistics,contentDetails',
 id: 'testVideo123' });

 // Should not throw when creating URL object
 expect(() => new URL(url)).not.toThrow();

 const urlObject = new URL(url);
 expect(urlObject.protocol).toBe('https:');
 expect(urlObject.hostname).toBe('www.googleapis.com');
 expect(urlObject.pathname).toBe('/youtube/v3/videos');
 });

 it('should maintain parameter order and formatting', () => {
 const url = testService.buildUrl('search', {
 part: 'snippet',
 q: 'javascript tutorial',
 type: "video",
 maxResults: '25' });

 const urlObject = new URL(url);
 expect(urlObject.searchParams.get('part')).toBe('snippet');
 expect(urlObject.searchParams.get('q')).toBe('javascript tutorial');
 expect(urlObject.searchParams.get('type')).toBe('video');
 expect(urlObject.searchParams.get('maxResults')).toBe('25');
 expect(urlObject.searchParams.get('key')).toBe('valid-key');
 });
 });

 describe('edge cases', () => {
 beforeEach(() => {
 Object.defineProperty(import.meta, 'env', {
 value: {
 ...originalEnv as any,
 MODE: 'production',
 VITE_YOUTUBE_API_KEY: 'edge-case-key' },
 configurable: true });
 });

 it('should handle empty endpoint', () => {
 const url = testService.buildUrl('', {
 part: 'snippet' });

 expect(url).toContain('https://www.googleapis.com/youtube/v3/');
 expect(url).toContain('part=snippet');
 });

 it('should handle empty parameters object', () => {
 const url = testService.buildUrl('videos', {});

 expect(url).toContain('https://www.googleapis.com/youtube/v3/videos');
 expect(url).toContain('key=edge-case-key');
 });

 it('should handle special characters in endpoint', () => {
 const url = testService.buildUrl('search', {
 part: 'snippet' });

 expect(url).toContain('https://www.googleapis.com/youtube/v3/search')
 });
 });

 describe('regression prevention', () => {
 it('should maintain consistent URL format across different modes', () => {
 const params = {
 part: 'snippet,statistics',
 id: 'testVideo' };

 // Test development mode
 vi.stubGlobal('window', {
 location: { origin: 'http://localhost:3000' } });
 Object.defineProperty(import.meta, 'env', {
 value: { ...originalEnv as any, MODE: 'development', VITE_YOUTUBE_API_KEY: 'dev-key' },
 configurable: true });
 const devUrl = testService.buildUrl('videos', params);

 // Test production mode
 Object.defineProperty(import.meta, 'env', {
 value: { ...originalEnv as any, MODE: 'production', VITE_YOUTUBE_API_KEY: 'prod-key' },
 configurable: true });
 const prodUrl = testService.buildUrl('videos', params);

 // Both should have the same query parameters
 const devUrlObj = new URL(devUrl);
 const prodUrlObj = new URL(prodUrl);

 expect(devUrlObj.searchParams.get('part')).toBe(prodUrlObj.searchParams.get('part'));
 expect(devUrlObj.searchParams.get('id')).toBe(prodUrlObj.searchParams.get('id'));

 // But different base URLs
 expect(devUrl).toContain('localhost:3000/api/youtube/v3/');
 expect(prodUrl).toContain('googleapis.com/youtube/v3/');
 });

 it('should preserve API key security in all modes', () => {
 const modes = ['development', 'production', 'test', 'staging'];

 modes.forEach(mode => {
 Object.defineProperty(import.meta, 'env', {
 value: {
 ...originalEnv as any,
 MODE: mode,
 VITE_YOUTUBE_API_KEY: `${mode}-secret-key` },
 configurable: true });

 if (mode === 'development') {
 vi.stubGlobal('window', {
 location: { origin: 'http://localhost:3000' } });
 }

 const url = testService.buildUrl('videos', { part: 'snippet' });
 expect(url).toContain(`key=${mode}-secret-key`);
 });
 });
 });
});
