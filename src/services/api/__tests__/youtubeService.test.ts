import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { youtubeService } from '../youtubeService';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('YouTubeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    youtubeService.clearCache();
  });

  afterEach(() => {
    youtubeService.clearCache();
  });

  describe('fetchVideos', () => {
    const mockYouTubeVideoResponse = {
      items: [
        {
          id: 'test-video-1',
          snippet: {
            title: 'Test Video 1',
            description: 'Test description 1',
            thumbnails: {
              medium: { url: 'https://example.com/thumb1.jpg' },
              high: { url: 'https://example.com/thumb1_hq.jpg' },
            },
            publishedAt: '2023-01-01T00:00:00Z',
            channelId: 'test-channel-1',
            channelTitle: 'Test Channel 1',
            tags: ['test', 'video'],
            categoryId: '10',
          },
          statistics: {
            viewCount: '1000',
            likeCount: '100',
            dislikeCount: '5',
            commentCount: '20',
          },
          contentDetails: {
            duration: 'PT5M30S',
            dimension: '2d',
            definition: 'hd',
            caption: 'false',
          },
        },
      ],
    };

    it('should fetch videos successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockYouTubeVideoResponse),
      });

      const result = await youtubeService.fetchVideos(['test-video-1']);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'test-video-1',
        title: 'Test Video 1',
        description: 'Test description 1',
        duration: '5:30',
        viewCount: 1000,
        likes: 100,
        channelId: 'test-channel-1',
        channelName: 'Test Channel 1',
      });
    });

    it('should return empty array for empty input', async () => {
      const result = await youtubeService.fetchVideos([]);
      expect(result).toEqual([]);
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      await expect(youtubeService.fetchVideos(['test-video'])).rejects.toThrow();
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(youtubeService.fetchVideos(['test-video'])).rejects.toThrow();
    });

    it('should use caching for repeated requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockYouTubeVideoResponse),
      });

      // First request
      await youtubeService.fetchVideos(['test-video-1']);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second request (should use cache)
      await youtubeService.fetchVideos(['test-video-1']);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should parse duration correctly', async () => {
      const testCases = [
        { input: 'PT5M30S', expected: '5:30' },
        { input: 'PT1H2M3S', expected: '1:02:03' },
        { input: 'PT45S', expected: '0:45' },
        { input: 'PT2H', expected: '2:00:00' },
        { input: 'PT10M', expected: '10:00' },
      ];

      for (const testCase of testCases) {
        const mockResponse = {
          items: [{
            ...mockYouTubeVideoResponse.items[0],
            contentDetails: {
              ...mockYouTubeVideoResponse.items[0].contentDetails,
              duration: testCase.input,
            },
          }],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await youtubeService.fetchVideos(['test-video']);
        expect(result[0].duration).toBe(testCase.expected);
      }
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
              high: { url: 'https://example.com/channel1_hq.jpg' },
            },
            publishedAt: '2020-01-01T00:00:00Z',
            customUrl: '@testchannel1',
            country: 'US',
          },
          statistics: {
            subscriberCount: '10000',
            videoCount: '50',
            viewCount: '500000',
          },
        },
      ],
    };

    it('should fetch channel successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockYouTubeChannelResponse),
      });

      const result = await youtubeService.fetchChannel('test-channel-1');

      expect(result).toMatchObject({
        id: 'test-channel-1',
        name: 'Test Channel 1',
        description: 'Test channel description',
        subscribers: 10000,
        subscriberCount: '10.0K',
        videoCount: 50,
        totalViews: 500000,
        country: 'US',
      });
    });

    it('should return null for empty channel ID', async () => {
      const result = await youtubeService.fetchChannel('');
      expect(result).toBeNull();
    });

    it('should return null when channel not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      const result = await youtubeService.fetchChannel('nonexistent-channel');
      expect(result).toBeNull();
    });

    it('should handle API errors gracefully and return null', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await youtubeService.fetchChannel('test-channel');
      expect(result).toBeNull();
    });

    it('should format subscriber count correctly', async () => {
      const testCases = [
        { input: 999, expected: '999' },
        { input: 1500, expected: '1.5K' },
        { input: 1500000, expected: '1.5M' },
        { input: 10000000, expected: '10.0M' },
      ];

      for (const testCase of testCases) {
        const mockResponse = {
          items: [{
            ...mockYouTubeChannelResponse.items[0],
            statistics: {
              ...mockYouTubeChannelResponse.items[0].statistics,
              subscriberCount: testCase.input.toString(),
            },
          }],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await youtubeService.fetchChannel('test-channel');
        expect(result?.subscriberCount).toBe(testCase.expected);
      }
    });

    it('should use caching for repeated requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockYouTubeChannelResponse),
      });

      // First request
      await youtubeService.fetchChannel('test-channel-1');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second request (should use cache)
      await youtubeService.fetchChannel('test-channel-1');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('URL Building', () => {
    it('should build correct URLs for video requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

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

    it('should build correct URLs for channel requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

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
  });

  describe('buildUrl with different MODE values', () => {
    const originalEnv = import.meta.env;
    const originalWindow = global.window;

    beforeEach(() => {
      // Reset environment and window mocks
      vi.clearAllMocks();
      youtubeService.clearCache();
    });

    afterEach(() => {
      // Restore original environment
      import.meta.env = originalEnv;
      global.window = originalWindow;
    });

    it('should use proxy endpoint in development mode', async () => {
      // Mock development environment
      vi.stubGlobal('window', {
        location: {
          origin: 'http://localhost:3000',
        },
      });

      // Mock import.meta.env for development
      Object.defineProperty(import.meta, 'env', {
        value: {
          ...originalEnv,
          MODE: 'development',
          VITE_YOUTUBE_API_KEY: 'test-api-key',
        },
        configurable: true,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      await youtubeService.fetchVideos(['test-video']);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:3000/api/youtube/v3/videos'),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('key=test-api-key'),
      );
    });

    it('should use direct Google API endpoint in production mode', async () => {
      // Mock production environment
      Object.defineProperty(import.meta, 'env', {
        value: {
          ...originalEnv,
          MODE: 'production',
          VITE_YOUTUBE_API_KEY: 'prod-api-key',
        },
        configurable: true,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      await youtubeService.fetchVideos(['test-video']);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://www.googleapis.com/youtube/v3/videos'),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('key=prod-api-key'),
      );
    });

    it('should use direct Google API endpoint in test mode', async () => {
      // Mock test environment
      Object.defineProperty(import.meta, 'env', {
        value: {
          ...originalEnv,
          MODE: 'test',
          VITE_YOUTUBE_API_KEY: 'test-api-key',
        },
        configurable: true,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      await youtubeService.fetchVideos(['test-video']);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://www.googleapis.com/youtube/v3/videos'),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('key=test-api-key'),
      );
    });

    it('should use direct Google API endpoint for custom build modes', async () => {
      // Mock custom build environment (e.g., staging)
      Object.defineProperty(import.meta, 'env', {
        value: {
          ...originalEnv,
          MODE: 'staging',
          VITE_YOUTUBE_API_KEY: 'staging-api-key',
        },
        configurable: true,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      await youtubeService.fetchVideos(['test-video']);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://www.googleapis.com/youtube/v3/videos'),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('key=staging-api-key'),
      );
    });

    it('should properly construct URLs with parameters for different endpoints', async () => {
      // Test development mode with channel endpoint
      vi.stubGlobal('window', {
        location: {
          origin: 'http://localhost:5173',
        },
      });

      Object.defineProperty(import.meta, 'env', {
        value: {
          ...originalEnv,
          MODE: 'development',
          VITE_YOUTUBE_API_KEY: 'dev-key',
        },
        configurable: true,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      await youtubeService.fetchChannel('UC123456789');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(
          /^http:\/\/localhost:5173\/api\/youtube\/v3\/channels\?.*part=snippet%2Cstatistics.*&.*id=UC123456789.*&.*key=dev-key/,
        ),
      );
    });

    it('should handle missing API key gracefully', async () => {
      // Mock environment without API key
      Object.defineProperty(import.meta, 'env', {
        value: {
          ...originalEnv,
          MODE: 'production',
          VITE_YOUTUBE_API_KEY: undefined,
        },
        configurable: true,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      await youtubeService.fetchVideos(['test-video']);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('key='),
      );
      // Should still make the request but with empty key
      const callUrl = mockFetch.mock.calls[0][0] as string;
      const url = new URL(callUrl);
      expect(url.searchParams.get('key')).toBe('');
    });

    it('should preserve all query parameters in built URLs', async () => {
      Object.defineProperty(import.meta, 'env', {
        value: {
          ...originalEnv,
          MODE: 'production',
          VITE_YOUTUBE_API_KEY: 'test-key',
        },
        configurable: true,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      await youtubeService.fetchVideos(['video1', 'video2', 'video3']);

      const callUrl = mockFetch.mock.calls[0][0] as string;
      const url = new URL(callUrl);

      expect(url.searchParams.get('part')).toBe('snippet,statistics,contentDetails');
      expect(url.searchParams.get('id')).toBe('video1,video2,video3');
      expect(url.searchParams.get('key')).toBe('test-key');
      expect(url.pathname).toBe('/youtube/v3/videos');
      expect(url.origin).toBe('https://www.googleapis.com');
    });
  });

  describe('Cache Management', () => {
    it('should clear cache successfully', () => {
      expect(() => youtubeService.clearCache()).not.toThrow();
    });

    it('should cache requests with proper TTL', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      // Make initial request
      await youtubeService.fetchVideos(['test-video']);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Clear cache manually
      youtubeService.clearCache();

      // Make same request again (should hit API again)
      await youtubeService.fetchVideos(['test-video']);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing thumbnail URLs', async () => {
      const mockResponse = {
        items: [{
          ...mockYouTubeVideoResponse.items[0],
          snippet: {
            ...mockYouTubeVideoResponse.items[0].snippet,
            thumbnails: {},
          },
        }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await youtubeService.fetchVideos(['test-video']);
      expect(result[0].thumbnailUrl).toBe('');
    });

    it('should handle missing statistics', async () => {
      const mockResponse = {
        items: [{
          ...mockYouTubeVideoResponse.items[0],
          statistics: {},
        }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await youtubeService.fetchVideos(['test-video']);
      expect(result[0].viewCount).toBe(0);
      expect(result[0].likes).toBe(0);
      expect(result[0].commentCount).toBe(0);
    });

    it('should handle invalid duration format', async () => {
      const mockResponse = {
        items: [{
          ...mockYouTubeVideoResponse.items[0],
          contentDetails: {
            ...mockYouTubeVideoResponse.items[0].contentDetails,
            duration: 'INVALID',
          },
        }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await youtubeService.fetchVideos(['test-video']);
      expect(result[0].duration).toBe('0:00');
    });
  });
});
