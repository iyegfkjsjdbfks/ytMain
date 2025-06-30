import { describe, it, expect, vi, beforeEach } from 'vitest';
import { unifiedDataService } from '../unifiedDataService';

// Mock dependencies
vi.mock('../api/youtubeService', () => ({
  youtubeService: {
    fetchVideos: vi.fn(),
    fetchChannel: vi.fn(),
    clearCache: vi.fn()
  }
}));

vi.mock('../metadataNormalizationService', () => ({
  metadataNormalizationService: {
    normalizeLocalVideo: vi.fn(),
    normalizeYouTubeVideo: vi.fn(),
    normalizeLocalChannel: vi.fn(),
    normalizeYouTubeChannel: vi.fn()
  }
}));

vi.mock('../../../services/mockVideoService', () => ({
  getVideos: vi.fn(),
  getShortsVideos: vi.fn(),
  getVideosByCategory: vi.fn(),
  searchVideos: vi.fn(),
  getVideoById: vi.fn(),
  getChannelById: vi.fn()
}));

describe('UnifiedDataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    unifiedDataService.clearCache();
  });

  describe('Basic Functionality', () => {
    it('should have correct default configuration', () => {
      const config = unifiedDataService.getConfig();
      
      expect(config.sources.local).toBe(true);
      expect(config.sources.youtube).toBe(true);
      expect(config.caching.enabled).toBe(true);
      expect(config.mixing.strategy).toBe('round-robin');
    });

    it('should allow configuration updates', () => {
      unifiedDataService.updateConfig({
        sources: { local: true, youtube: false },
        caching: { enabled: false, ttl: 0 }
      });

      const config = unifiedDataService.getConfig();
      expect(config.sources.youtube).toBe(false);
      expect(config.caching.enabled).toBe(false);
    });

    it('should clear cache successfully', () => {
      expect(() => unifiedDataService.clearCache()).not.toThrow();
      expect(() => unifiedDataService.clearCache('video:')).not.toThrow();
    });
  });

  describe('API Methods', () => {
    it('should call getTrendingVideos without errors', async () => {
      const result = await unifiedDataService.getTrendingVideos(10);
      
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.sources).toBeDefined();
      expect(typeof result.totalCount).toBe('number');
    });

    it('should call searchVideos with query', async () => {
      const result = await unifiedDataService.searchVideos('test query', {}, 10);
      
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should handle getVideoById calls', async () => {
      const result = await unifiedDataService.getVideoById('test-video');
      
      // Should either return video data or null, not throw
      expect(result === null || typeof result === 'object').toBe(true);
    });

    it('should handle getChannelById calls', async () => {
      const result = await unifiedDataService.getChannelById('test-channel');
      
      // Should either return channel data or null, not throw
      expect(result === null || typeof result === 'object').toBe(true);
    });

    it('should handle getShortsVideos calls', async () => {
      const result = await unifiedDataService.getShortsVideos(20);
      
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully in getTrendingVideos', async () => {
      // This tests that the service doesn't throw unhandled errors
      const result = await unifiedDataService.getTrendingVideos(10);
      expect(result).toBeDefined();
    });

    it('should handle empty search queries', async () => {
      const result = await unifiedDataService.searchVideos('', {}, 10);
      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});
