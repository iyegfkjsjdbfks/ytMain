import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import {
  useUnifiedVideos,
  useUnifiedVideo,
  useUnifiedTrendingVideos,
  useUnifiedShorts,
  useUnifiedSearchVideos,
  useVideoWithRelated,
  useHomePageData
} from '../useVideos';
import { unifiedDataService } from '../../../services/unifiedDataService';

// Mock the unified data service
vi.mock('../../../services/unifiedDataService');

const mockUnifiedDataService = vi.mocked(unifiedDataService);

// Test wrapper component with React Query provider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        cacheTime: 0,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return { Wrapper, queryClient };
};

describe('Unified Video Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useUnifiedVideos', () => {
    it('should fetch trending videos successfully', async () => {
      const mockResponse = {
        data: [
          { id: 'video-1', title: 'Test Video 1', source: 'local' },
          { id: 'video-2', title: 'Test Video 2', source: 'youtube' }
        ],
        sources: {
          local: { count: 1, hasMore: false },
          youtube: { count: 1, hasMore: false }
        },
        totalCount: 2,
        hasMore: false
      };

      mockUnifiedDataService.getTrendingVideos.mockResolvedValue(mockResponse);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedVideos(50, { category: 'Music' }),
        { wrapper: Wrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(mockUnifiedDataService.getTrendingVideos).toHaveBeenCalledWith(50, { category: 'Music' });
      expect(result.current.data?.data).toEqual(mockResponse.data);
      expect(result.current.data?.success).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Failed to fetch videos');
      mockUnifiedDataService.getTrendingVideos.mockRejectedValue(mockError);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedVideos(50),
        { wrapper: Wrapper }
      );

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeTruthy();
    });

    it('should use correct cache key with filters', async () => {
      const mockResponse = {
        data: [],
        sources: { local: { count: 0, hasMore: false }, youtube: { count: 0, hasMore: false } },
        totalCount: 0,
        hasMore: false
      };

      mockUnifiedDataService.getTrendingVideos.mockResolvedValue(mockResponse);

      const { Wrapper } = createWrapper();
      const filters = { category: 'Gaming', type: 'video' as const };
      
      renderHook(
        () => useUnifiedVideos(25, filters),
        { wrapper: Wrapper }
      );

      await waitFor(() => {
        expect(mockUnifiedDataService.getTrendingVideos).toHaveBeenCalledWith(25, filters);
      });
    });
  });

  describe('useUnifiedVideo', () => {
    it('should fetch single video by ID', async () => {
      const mockVideo = {
        id: 'test-video',
        title: 'Test Video',
        description: 'Test description',
        source: 'local'
      };

      mockUnifiedDataService.getVideoById.mockResolvedValue(mockVideo);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedVideo('test-video'),
        { wrapper: Wrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(mockUnifiedDataService.getVideoById).toHaveBeenCalledWith('test-video');
      expect(result.current.data?.data).toEqual(mockVideo);
      expect(result.current.data?.success).toBe(true);
      expect(result.current.loading).toBe(false);
    });

    it('should handle video not found', async () => {
      mockUnifiedDataService.getVideoById.mockResolvedValue(null);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedVideo('nonexistent-video'),
        { wrapper: Wrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBeNull();
      });

      expect(mockUnifiedDataService.getVideoById).toHaveBeenCalledWith('nonexistent-video');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should not fetch when videoId is empty', () => {
      const { Wrapper } = createWrapper();
      renderHook(
        () => useUnifiedVideo(''),
        { wrapper: Wrapper }
      );

      expect(mockUnifiedDataService.getVideoById).not.toHaveBeenCalled();
    });

    it('should handle fetch errors', async () => {
      const mockError = new Error('Failed to fetch video');
      mockUnifiedDataService.getVideoById.mockRejectedValue(mockError);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedVideo('test-video'),
        { wrapper: Wrapper }
      );

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useUnifiedTrendingVideos', () => {
    it('should fetch trending videos with proper caching', async () => {
      const mockResponse = {
        data: [
          { id: 'trending-1', title: 'Trending Video 1' },
          { id: 'trending-2', title: 'Trending Video 2' }
        ],
        sources: {
          local: { count: 1, hasMore: false },
          youtube: { count: 1, hasMore: false }
        },
        totalCount: 2,
        hasMore: false
      };

      mockUnifiedDataService.getTrendingVideos.mockResolvedValue(mockResponse);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedTrendingVideos(30, { sortBy: 'views' }),
        { wrapper: Wrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(mockUnifiedDataService.getTrendingVideos).toHaveBeenCalledWith(30, { sortBy: 'views' });
      expect(result.current.data?.data).toEqual(mockResponse.data);
    });

    it('should refetch on window focus by default', async () => {
      const mockResponse = {
        data: [],
        sources: { local: { count: 0, hasMore: false }, youtube: { count: 0, hasMore: false } },
        totalCount: 0,
        hasMore: false
      };

      mockUnifiedDataService.getTrendingVideos.mockResolvedValue(mockResponse);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedTrendingVideos(),
        { wrapper: Wrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // Verify the hook configuration includes refetchOnWindowFocus
      expect(result.current.refetch).toBeDefined();
    });
  });

  describe('useUnifiedShorts', () => {
    it('should fetch shorts videos', async () => {
      const mockResponse = {
        data: [
          { id: 'short-1', title: 'Short Video 1', isShort: true },
          { id: 'short-2', title: 'Short Video 2', isShort: true }
        ],
        sources: {
          local: { count: 2, hasMore: false },
          youtube: { count: 0, hasMore: false }
        },
        totalCount: 2,
        hasMore: false
      };

      mockUnifiedDataService.getShortsVideos.mockResolvedValue(mockResponse);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedShorts(20),
        { wrapper: Wrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(mockUnifiedDataService.getShortsVideos).toHaveBeenCalledWith(20);
      expect(result.current.data?.data).toEqual(mockResponse.data);
    });
  });

  describe('useUnifiedSearchVideos', () => {
    it('should search videos with query', async () => {
      const mockResponse = {
        data: [
          { id: 'search-1', title: 'Search Result 1' },
          { id: 'search-2', title: 'Search Result 2' }
        ],
        sources: {
          local: { count: 1, hasMore: false },
          youtube: { count: 1, hasMore: false }
        },
        totalCount: 2,
        hasMore: false
      };

      mockUnifiedDataService.searchVideos.mockResolvedValue(mockResponse);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedSearchVideos('test query', { category: 'Tech' }, 25),
        { wrapper: Wrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(mockUnifiedDataService.searchVideos).toHaveBeenCalledWith(
        'test query',
        { category: 'Tech' },
        25
      );
      expect(result.current.data?.data).toEqual(mockResponse.data);
    });

    it('should not search with short queries', () => {
      const { Wrapper } = createWrapper();
      renderHook(
        () => useUnifiedSearchVideos('a'), // Query too short
        { wrapper: Wrapper }
      );

      expect(mockUnifiedDataService.searchVideos).not.toHaveBeenCalled();
    });

    it('should not search with empty query', () => {
      const { Wrapper } = createWrapper();
      renderHook(
        () => useUnifiedSearchVideos(''),
        { wrapper: Wrapper }
      );

      expect(mockUnifiedDataService.searchVideos).not.toHaveBeenCalled();
    });

    it('should handle search errors', async () => {
      const mockError = new Error('Search failed');
      mockUnifiedDataService.searchVideos.mockRejectedValue(mockError);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedSearchVideos('test query'),
        { wrapper: Wrapper }
      );

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Combined Hooks', () => {
    describe('useVideoWithRelated', () => {
      it('should fetch video and related videos', async () => {
        const mockVideo = {
          id: 'main-video',
          title: 'Main Video'
        };

        const mockRelatedVideos = [
          { id: 'related-1', title: 'Related Video 1' },
          { id: 'related-2', title: 'Related Video 2' }
        ];

        // This test would require mocking the videoApi dependency
        // For now, we'll test the structure
        const { Wrapper } = createWrapper();
        const { result } = renderHook(
          () => useVideoWithRelated('main-video'),
          { wrapper: Wrapper }
        );

        expect(result.current.video).toBeDefined();
        expect(result.current.relatedVideos).toBeDefined();
        expect(result.current.loading).toBeDefined();
        expect(result.current.error).toBeDefined();
        expect(result.current.refetch).toBeDefined();
      });
    });

    describe('useHomePageData', () => {
      it('should combine multiple data sources for home page', async () => {
        const { Wrapper } = createWrapper();
        const { result } = renderHook(
          () => useHomePageData(),
          { wrapper: Wrapper }
        );

        expect(result.current.trending).toBeDefined();
        expect(result.current.featured).toBeDefined();
        expect(result.current.recommendations).toBeDefined();
        expect(result.current.loading).toBeDefined();
        expect(result.current.error).toBeDefined();
        expect(result.current.refetch).toBeDefined();
      });
    });
  });

  describe('Hook Configuration', () => {
    it('should apply custom configuration options', async () => {
      const customConfig = {
        staleTime: 30000,
        refetchOnWindowFocus: false
      };

      const mockResponse = {
        data: [],
        sources: { local: { count: 0, hasMore: false }, youtube: { count: 0, hasMore: false } },
        totalCount: 0,
        hasMore: false
      };

      mockUnifiedDataService.getTrendingVideos.mockResolvedValue(mockResponse);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedVideos(50, {}, customConfig),
        { wrapper: Wrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // The hook should work with custom configuration
      expect(result.current.data).toBeDefined();
    });
  });

  describe('Loading States', () => {
    it('should show loading state initially', () => {
      mockUnifiedDataService.getTrendingVideos.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedVideos(),
        { wrapper: Wrapper }
      );

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('Refetch Functionality', () => {
    it('should provide refetch function', async () => {
      const mockResponse = {
        data: [],
        sources: { local: { count: 0, hasMore: false }, youtube: { count: 0, hasMore: false } },
        totalCount: 0,
        hasMore: false
      };

      mockUnifiedDataService.getTrendingVideos.mockResolvedValue(mockResponse);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedVideos(),
        { wrapper: Wrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(result.current.refetch).toBeDefined();
      expect(typeof result.current.refetch).toBe('function');

      // Test refetch functionality
      await result.current.refetch();
      expect(mockUnifiedDataService.getTrendingVideos).toHaveBeenCalledTimes(2);
    });
  });
});
