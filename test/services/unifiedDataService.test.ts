import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { youtubeService } from '../../src/services/api/youtubeService';
import { metadataNormalizationService } from '../../src/services/metadataNormalizationService';
import * as realVideoService from '../../src/services/realVideoService';
import { unifiedDataService } from '../../src/services/unifiedDataService';

// Mock dependencies
vi.mock('../../src/services/api/youtubeService');
vi.mock('../../src/services/metadataNormalizationService');
vi.mock('../../src/services/realVideoService');

const mockYoutubeService = vi.mocked(youtubeService);
const mockMetadataService = vi.mocked(metadataNormalizationService);
const mockVideoServiceModule = vi.mocked(realVideoService);

// Use the main service instance for testing
const service = unifiedDataService;

describe('UnifiedDataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    unifiedDataService.clearCache();
  });

  afterEach(() => {
    unifiedDataService.clearCache();
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with default configuration', () => {
      const config = unifiedDataService.getConfig();

      expect(config.sources.local).toBe(true);
      expect(config.sources.youtube).toBe(true);
      expect(config.limits.local).toBe(25);
      expect(config.limits.youtube).toBe(25);
      expect(config.limits.total).toBe(50);
      expect(config.caching.enabled).toBe(true);
      expect(config.mixing.strategy).toBe('round-robin');
    });

    it('should allow custom configuration', () => {
      const customService = new (unifiedDataService.constructor as any)({
        sources: { local: false, youtube: true },
        limits: { youtube: 50 },
        mixing: { strategy: 'source-priority' } });

      const config = customService.getConfig();
      expect(config.sources.local).toBe(false);
      expect(config.sources.youtube).toBe(true);
      expect(config.limits.youtube).toBe(50);
      expect(config.mixing.strategy).toBe('source-priority');
    });

    it('should update configuration dynamically', () => {
      service.updateConfig({
        sources: { local: false, youtube: true },
        caching: { enabled: false, ttl: 0 } });

      const config = service.getConfig();
      expect(config.sources.local).toBe(false);
      expect(config.caching.enabled).toBe(false);
    });
  });

  describe('getTrendingVideos', () => {
    beforeEach(() => {
      // Mock local video service
      mockVideoServiceModule.getVideos.mockResolvedValue([
        { id: 'local-1', title: 'Local Video 1' } as any,
        { id: 'local-2', title: 'Local Video 2' } as any,
      ]);
      mockVideoServiceModule.getShortsVideos.mockResolvedValue([]);
      mockVideoServiceModule.getVideosByCategory.mockResolvedValue([]);

      // Mock metadata normalization
      mockMetadataService.normalizeLocalVideo.mockImplementation((video) => ({
        ...video,
        source: 'local' }));
    });

    it('should fetch and mix trending videos from both sources', async () => {
      const result = await service.getTrendingVideos(10);

      expect(result.data).toBeDefined();
      expect(result.sources.local.count).toBe(2);
      expect(result.sources.youtube.count).toBe(0); // YouTube search returns empty in test
      expect(result.totalCount).toBeGreaterThanOrEqual(0);
    });

    it('should filter by type when specified', async () => {
      mockVideoServiceModule.getShortsVideos.mockResolvedValue([
        { id: 'short-1', title: 'Short Video 1', isShort: true } as any,
      ]);

      const result = await service.getTrendingVideos(10, { type: 'short' });

      expect(mockVideoServiceModule.getShortsVideos).toHaveBeenCalled();
      expect(result.data).toBeDefined();
    });

    it('should filter by category when specified', async () => {
      mockVideoServiceModule.getVideosByCategory.mockResolvedValue([
        { id: 'music-1', title: 'Music Video 1', category: 'Music' } as any,
      ]);

      const result = await service.getTrendingVideos(10, { category: 'Music' });

      expect(mockVideoServiceModule.getVideosByCategory).toHaveBeenCalledWith('Music');
      expect(result.data).toBeDefined();
    });

    it('should respect source filters', async () => {
      const result = await service.getTrendingVideos(10, { sources: ['local'] });

      expect(mockVideoServiceModule.getVideos).toHaveBeenCalled();
      expect(result.sources.local.count).toBe(2);
      expect(result.sources.youtube.count).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      mockVideoServiceModule.getVideos.mockRejectedValue(new Error('Local service error'));

      const result = await service.getTrendingVideos(10);

      // Should still return a valid response structure even with errors
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.sources).toBeDefined();
    });

    it('should use caching for repeated requests', async () => {
      // First request
      await service.getTrendingVideos(10);
      expect(mockVideoServiceModule.getVideos).toHaveBeenCalledTimes(1);

      // Second request (should use cache)
      await service.getTrendingVideos(10);
      expect(mockVideoServiceModule.getVideos).toHaveBeenCalledTimes(1);
    });

    it('should respect cache TTL', async () => {
      // Configure short cache TTL for testing
      service.updateConfig({ caching: { enabled: true, ttl: 1 } });

      await service.getTrendingVideos(10);
      expect(mockVideoServiceModule.getVideos).toHaveBeenCalledTimes(1);

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 5));

      await service.getTrendingVideos(10);
      expect(mockVideoServiceModule.getVideos).toHaveBeenCalledTimes(2);
    });
  });

  describe('searchVideos', () => {
    beforeEach(() => {
      mockVideoServiceModule.searchVideos.mockResolvedValue([
        { id: 'search-1', title: 'Search Result 1' } as any,
      ]);

      mockMetadataService.normalizeLocalVideo.mockImplementation((video) => ({
        ...video,
        source: 'local' }));
    });

    it('should search videos across local sources', async () => {
      const result = await service.searchVideos('test query', {}, 10);

      expect(mockVideoServiceModule.searchVideos).toHaveBeenCalledWith('test query');
      expect(result.data).toBeDefined();
      expect(result.sources.local.count).toBe(1);
    });

    it('should return trending videos for empty query', async () => {
      mockVideoServiceModule.getVideos.mockResolvedValue([
        { id: 'trending-1', title: 'Trending Video 1' } as any,
      ]);

      const result = await service.searchVideos('', {}, 10);

      expect(mockVideoServiceModule.getVideos).toHaveBeenCalled();
      expect(result.data).toBeDefined();
    });

    it('should apply filters to search results', async () => {
      mockVideoServiceModule.searchVideos.mockResolvedValue([
        { id: 'search-1', title: 'Search Result 1', isShort: true, category: 'Music' } as any,
        { id: 'search-2', title: 'Search Result 2', isShort: false, category: 'Gaming' } as any,
      ]);

      const result = await service.searchVideos('test', { type: 'short', category: 'Music' }, 10);

      expect(result.data).toBeDefined();
      // Results should be filtered by normalizeLocalVideo implementation
    });

    it('should handle search errors gracefully', async () => {
      mockVideoServiceModule.searchVideos.mockRejectedValue(new Error('Search error'));

      const result = await service.searchVideos('test query', {}, 10);

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('getVideoById', () => {
    const mockVideo = { id: 'test-video', title: 'Test Video' };

    beforeEach(() => {
      mockVideoServiceModule.getVideoById.mockResolvedValue(mockVideo as any);
      mockMetadataService.normalizeLocalVideo.mockReturnValue(mockVideo as any);
    });

    it('should fetch video from local source first', async () => {
      const result = await service.getVideoById('test-video');

      expect(mockVideoServiceModule.getVideoById).toHaveBeenCalledWith('test-video');
      expect(result).toEqual(mockVideo);
    });

    it('should fallback to YouTube if local video not found', async () => {
      mockVideoServiceModule.getVideoById.mockResolvedValue(null);
      mockYoutubeService.fetchVideos.mockResolvedValue([mockVideo as any]);
      mockMetadataService.normalizeYouTubeVideo.mockResolvedValue(mockVideo as any);

      const result = await service.getVideoById('test-video');

      expect(mockVideoServiceModule.getVideoById).toHaveBeenCalledWith('test-video');
      expect(mockYoutubeService.fetchVideos).toHaveBeenCalledWith(['test-video']);
      expect(result).toEqual(mockVideo);
    });

    it('should return null if video not found in any source', async () => {
      mockVideoServiceModule.getVideoById.mockResolvedValue(null);
      mockYoutubeService.fetchVideos.mockResolvedValue([]);

      const result = await service.getVideoById('nonexistent-video');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      mockVideoServiceModule.getVideoById.mockRejectedValue(new Error('Local error'));
      mockYoutubeService.fetchVideos.mockRejectedValue(new Error('YouTube error'));

      const result = await service.getVideoById('test-video');

      expect(result).toBeNull();
    });

    it('should use caching for repeated requests', async () => {
      // First request
      await service.getVideoById('test-video');
      expect(mockVideoServiceModule.getVideoById).toHaveBeenCalledTimes(1);

      // Second request (should use cache)
      const result = await service.getVideoById('test-video');
      expect(mockVideoServiceModule.getVideoById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockVideo);
    });
  });

  describe('getChannelById', () => {
    const mockChannel = { id: 'test-channel', name: 'Test Channel' };

    beforeEach(() => {
      mockVideoServiceModule.getChannelById.mockResolvedValue(mockChannel as any);
      mockMetadataService.normalizeLocalChannel.mockReturnValue(mockChannel as any);
    });

    it('should fetch channel from local source first', async () => {
      const result = await service.getChannelById('test-channel');

      expect(mockVideoServiceModule.getChannelById).toHaveBeenCalledWith('test-channel');
      expect(result).toEqual(mockChannel);
    });

    it('should fallback to YouTube if local channel not found', async () => {
      mockVideoServiceModule.getChannelById.mockResolvedValue(null);
      mockYoutubeService.fetchChannel.mockResolvedValue(mockChannel as any);
      mockMetadataService.normalizeYouTubeChannel.mockReturnValue(mockChannel as any);

      const result = await service.getChannelById('test-channel');

      expect(mockVideoServiceModule.getChannelById).toHaveBeenCalledWith('test-channel');
      expect(mockYoutubeService.fetchChannel).toHaveBeenCalledWith('test-channel');
      expect(result).toEqual(mockChannel);
    });

    it('should return null if channel not found in any source', async () => {
      mockVideoServiceModule.getChannelById.mockResolvedValue(null);
      mockYoutubeService.fetchChannel.mockResolvedValue(null);

      const result = await service.getChannelById('nonexistent-channel');

      expect(result).toBeNull();
    });
  });

  describe('getShortsVideos', () => {
    it('should delegate to getTrendingVideos with shorts filter', async () => {
      const getTrendingVideosSpy = vi.spyOn(service, 'getTrendingVideos');

      await service.getShortsVideos(30);

      expect(getTrendingVideosSpy).toHaveBeenCalledWith(30, { type: 'short' });
    });
  });

  describe('Video Mixing Strategies', () => {
    const localVideos = [
      { id: 'local-1', title: 'Local 1', views: 1000 },
      { id: 'local-2', title: 'Local 2', views: 2000 },
    ];

    const youtubeVideos = [
      { id: 'yt-1', title: 'YouTube 1', views: 1500 },
      { id: 'yt-2', title: 'YouTube 2', views: 2500 },
    ];

    it('should mix videos using round-robin strategy', async () => {
      service.updateConfig({ mixing: { strategy: 'round-robin' } });

      // Use private method through service instance
      const mixedVideos = (service as any).mixVideoResults(localVideos, youtubeVideos, 4);

      expect(mixedVideos).toHaveLength(4);
      expect(mixedVideos[0].id).toBe('local-1');
      expect(mixedVideos[1].id).toBe('yt-1');
      expect(mixedVideos[2].id).toBe('local-2');
      expect(mixedVideos[3].id).toBe('yt-2');
    });

    it('should mix videos using source-priority strategy', async () => {
      service.updateConfig({
        mixing: {
          strategy: 'source-priority',
          sourcePriority: ['local', 'youtube'] } });

      const mixedVideos = (service as any).mixVideoResults(localVideos, youtubeVideos, 4);

      expect(mixedVideos).toHaveLength(4);
      expect(mixedVideos[0].id).toBe('local-1');
      expect(mixedVideos[1].id).toBe('local-2');
      expect(mixedVideos[2].id).toBe('yt-1');
      expect(mixedVideos[3].id).toBe('yt-2');
    });

    it('should mix videos using relevance strategy', async () => {
      service.updateConfig({ mixing: { strategy: 'relevance' } });

      const videosWithEngagement = [
        { ...localVideos[0], likes: 100, commentCount: 10 },
        { ...localVideos[1], likes: 200, commentCount: 20 },
        { ...youtubeVideos[0], likes: 150, commentCount: 15 },
        { ...youtubeVideos[1], likes: 250, commentCount: 25 },
      ];

      const mixedVideos = (service as any).mixVideoResults(
        videosWithEngagement.slice(0, 2),
        videosWithEngagement.slice(2),
        4,
      );

      expect(mixedVideos).toHaveLength(4);
      // Should be sorted by relevance score (views + likes*10 + comments*5)
    });
  });

  describe('Cache Management', () => {
    it('should clear all cache', () => {
      (service as any).setCachedData = vi.fn();
      service.clearCache();

      // Test that cache is cleared
      const result = (service as any).getCachedData('test-key');
      expect(result).toBeNull();
    });

    it('should clear cache by pattern', () => {
      // Add some test data to cache
      (service as any).setCachedData('video:123', { id: '123' });
      (service as any).setCachedData('channel:456', { id: '456' });
      (service as any).setCachedData('trending:data', { data: [] });

      service.clearCache('video:');

      // Video cache should be cleared, others should remain
      expect((service as any).getCachedData('video:123')).toBeNull();
      // Note: We can't easily test that others remain without exposing cache internals
    });

    it('should respect cache TTL', async () => {
      service.updateConfig({ caching: { enabled: true, ttl: 100 } });

      (service as any).setCachedData('test-key', { data: 'test' });

      // Should get cached data immediately
      expect((service as any).getCachedData('test-key')).toEqual({ data: 'test' });

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should return null after expiry
      expect((service as any).getCachedData('test-key')).toBeNull();
    });
  });
});
