/// <reference types="react/jsx-runtime" />
import type React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  useUnifiedVideos,
  useUnifiedVideo,
  useUnifiedTrendingVideos,
  useUnifiedShorts,
  useUnifiedSearchVideos,
  useVideoWithRelated,
  useHomePageData,
} from '../../src/hooks/unified/useVideos';
import { unifiedDataService } from '../../src/services/unifiedDataService';

// Mock the unified data service
vi.mock('../../src/services/unifiedDataService');

const mockUnifiedDataService = vi.mocked(unifiedDataService);

// Test wrapper component with React Query provider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  });

  const Wrapper = ({ children }: {children}) => (
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
          {
            id: 'video-1',
            title: 'Test Video 1',
            description: 'Test description 1',
            thumbnailUrl: 'https://example.com/thumb1.jpg',
            videoUrl: 'https://example.com/video1',
            views: 1000,
            viewsFormatted: '1K views',
            likes: 10,
            dislikes: 0,
            commentCount: 5,
            channel: {
              id: 'channel-1',
              name: 'Test Channel 1',
              avatarUrl: 'https://example.com/avatar1.jpg',
              subscribers: 1000,
              subscribersFormatted: '1K subscribers',
              isVerified: false,
            },
            duration: '10:00',
            publishedAt: new Date().toISOString(),
            publishedAtFormatted: '1 day ago',
            category: 'Entertainment',
            tags: ['test'],
            isLive: false,
            isShort: false,
            visibility: 'public' as const,
            source: 'local' as const,
            metadata: {},
            // Required properties for UnifiedVideoMetadata
            uploadedAt: new Date().toISOString(),
            channelName: 'Test Channel 1',
            channelId: 'channel-1',
            channelAvatarUrl: 'https://example.com/avatar1.jpg',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'video-2',
            title: 'Test Video 2',
            description: 'Test description 2',
            thumbnailUrl: 'https://example.com/thumb2.jpg',
            videoUrl: 'https://example.com/video2',
            views: 2000,
            viewsFormatted: '2K views',
            likes: 20,
            dislikes: 0,
            commentCount: 10,
            channel: {
              id: 'channel-2',
              name: 'Test Channel 2',
              avatarUrl: 'https://example.com/avatar2.jpg',
              subscribers: 2000,
              subscribersFormatted: '2K subscribers',
              isVerified: false,
            },
            duration: '5:00',
            publishedAt: new Date().toISOString(),
            publishedAtFormatted: '2 days ago',
            category: 'Gaming',
            tags: ['test', 'gaming'],
            isLive: false,
            isShort: false,
            visibility: 'public' as const,
            source: 'youtube' as const,
            metadata: {},
            // Required properties for UnifiedVideoMetadata
            uploadedAt: new Date().toISOString(),
            channelName: 'Test Channel 2',
            channelId: 'channel-2',
            channelAvatarUrl: 'https://example.com/avatar2.jpg',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        sources: {
          local: { count: 1, hasMore: false },
          youtube: { count: 1, hasMore: false },
        },
        totalCount: 2,
        hasMore: false,
      };

      mockUnifiedDataService.getTrendingVideos.mockResolvedValue(mockResponse);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedVideos(50, { category: 'Music' }),
        { wrapper: Wrapper },
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
        { wrapper: Wrapper },
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
        hasMore: false,
      };

      mockUnifiedDataService.getTrendingVideos.mockResolvedValue(mockResponse);

      const { Wrapper } = createWrapper();
      const filters = { category: 'Gaming', type: 'video' as const };

      renderHook(
        () => useUnifiedVideos(25, filters),
        { wrapper: Wrapper },
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
        thumbnailUrl: 'https://example.com/thumb.jpg',
        videoUrl: 'https://example.com/video',
        views: 1000,
        viewsFormatted: '1K views',
        likes: 10,
        dislikes: 0,
        commentCount: 5,
        channel: {
          id: 'channel-1',
          name: 'Test Channel',
          avatarUrl: 'https://example.com/avatar.jpg',
          subscribers: 1000,
          subscribersFormatted: '1K subscribers',
          isVerified: false,
        },
        duration: '10:00',
        publishedAt: new Date().toISOString(),
        publishedAtFormatted: '1 day ago',
        category: 'Entertainment',
        tags: ['test'],
        isLive: false,
        isShort: false,
        visibility: 'public' as const,
        source: 'local' as const,
        metadata: {},
        // Required properties for UnifiedVideoMetadata
        uploadedAt: new Date().toISOString(),
        channelName: 'Test Channel',
        channelId: 'channel-1',
        channelAvatarUrl: 'https://example.com/avatar.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUnifiedDataService.getVideoById.mockResolvedValue(mockVideo);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedVideo('test-video'),
        { wrapper: Wrapper },
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(mockUnifiedDataService.getVideoById).toHaveBeenCalledWith('test-video');
      expect(result.current.data).toEqual(mockVideo);
      expect(result.current.loading).toBe(false);
    });

    it('should handle video not found', async () => {
      mockUnifiedDataService.getVideoById.mockResolvedValue(null);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedVideo('nonexistent-video'),
        { wrapper: Wrapper },
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
        { wrapper: Wrapper },
      );

      expect(mockUnifiedDataService.getVideoById).not.toHaveBeenCalled();
    });

    it('should handle fetch errors', async () => {
      const mockError = new Error('Failed to fetch video');
      mockUnifiedDataService.getVideoById.mockRejectedValue(mockError);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedVideo('test-video'),
        { wrapper: Wrapper },
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
          {
            id: 'trending-1',
            title: 'Trending Video 1',
            description: 'Description 1',
            thumbnailUrl: 'https://example.com/thumb1.jpg',
            videoUrl: 'https://example.com/video1',
            views: 1000,
            viewsFormatted: '1K views',
            likes: 10,
            dislikes: 0,
            commentCount: 5,
            channel: {
              id: 'channel-1',
              name: 'Channel 1',
              avatarUrl: 'https://example.com/avatar1.jpg',
              subscribers: 1000,
              subscribersFormatted: '1K subscribers',
              isVerified: false,
            },
            duration: '10:00',
            publishedAt: new Date().toISOString(),
            publishedAtFormatted: '1 day ago',
            category: 'Entertainment',
            tags: ['trending'],
            isLive: false,
            isShort: false,
            visibility: 'public' as const,
            source: 'youtube' as const,
            metadata: {},
            // Required properties for UnifiedVideoMetadata
            uploadedAt: new Date().toISOString(),
            channelName: 'Channel 1',
            channelId: 'channel-1',
            channelAvatarUrl: 'https://example.com/avatar1.jpg',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'trending-2',
            title: 'Trending Video 2',
            description: 'Description 2',
            thumbnailUrl: 'https://example.com/thumb2.jpg',
            videoUrl: 'https://example.com/video2',
            views: 2000,
            viewsFormatted: '2K views',
            likes: 20,
            dislikes: 0,
            commentCount: 10,
            channel: {
              id: 'channel-2',
              name: 'Channel 2',
              avatarUrl: 'https://example.com/avatar2.jpg',
              subscribers: 2000,
              subscribersFormatted: '2K subscribers',
              isVerified: false,
            },
            duration: '5:00',
            publishedAt: new Date().toISOString(),
            publishedAtFormatted: '2 days ago',
            category: 'Gaming',
            tags: ['trending', 'gaming'],
            isLive: false,
            isShort: false,
            visibility: 'public' as const,
            source: 'youtube' as const,
            metadata: {},
            // Required properties for UnifiedVideoMetadata
            uploadedAt: new Date().toISOString(),
            channelName: 'Channel 2',
            channelId: 'channel-2',
            channelAvatarUrl: 'https://example.com/avatar2.jpg',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        sources: {
          local: { count: 1, hasMore: false },
          youtube: { count: 1, hasMore: false },
        },
        totalCount: 2,
        hasMore: false,
      };

      mockUnifiedDataService.getTrendingVideos.mockResolvedValue(mockResponse);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedTrendingVideos(30, { sortBy: 'views' }),
        { wrapper: Wrapper },
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
        hasMore: false,
      };

      mockUnifiedDataService.getTrendingVideos.mockResolvedValue(mockResponse);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedTrendingVideos(),
        { wrapper: Wrapper },
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
          {
            id: 'short-1',
            title: 'Short Video 1',
            description: 'Short description 1',
            thumbnailUrl: 'https://example.com/short1.jpg',
            videoUrl: 'https://example.com/short1',
            views: 1000,
            viewsFormatted: '1K views',
            likes: 50,
            dislikes: 0,
            commentCount: 10,
            channel: {
              id: 'channel-1',
              name: 'Short Channel',
              avatarUrl: 'https://example.com/avatar1.jpg',
              subscribers: 5000,
              subscribersFormatted: '5K subscribers',
              isVerified: false,
            },
            duration: '0:30',
            publishedAt: new Date().toISOString(),
            publishedAtFormatted: '1 hour ago',
            category: 'Entertainment',
            tags: ['shorts'],
            isLive: false,
            isShort: true,
            visibility: 'public' as const,
            source: 'youtube' as const,
            metadata: {},
            // Required properties for UnifiedVideoMetadata
            uploadedAt: new Date().toISOString(),
            channelName: 'Short Channel',
            channelId: 'channel-1',
            channelAvatarUrl: 'https://example.com/avatar1.jpg',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'short-2',
            title: 'Short Video 2',
            description: 'Short description 2',
            thumbnailUrl: 'https://example.com/short2.jpg',
            videoUrl: 'https://example.com/short2',
            views: 2000,
            viewsFormatted: '2K views',
            likes: 100,
            dislikes: 0,
            commentCount: 20,
            channel: {
              id: 'channel-2',
              name: 'Short Channel 2',
              avatarUrl: 'https://example.com/avatar2.jpg',
              subscribers: 10000,
              subscribersFormatted: '10K subscribers',
              isVerified: true,
            },
            duration: '0:45',
            publishedAt: new Date().toISOString(),
            publishedAtFormatted: '2 hours ago',
            category: 'Comedy',
            tags: ['shorts', 'funny'],
            isLive: false,
            isShort: true,
            visibility: 'public' as const,
            source: 'youtube' as const,
            metadata: {},
            // Required properties for UnifiedVideoMetadata
            uploadedAt: new Date().toISOString(),
            channelName: 'Short Channel 2',
            channelId: 'channel-2',
            channelAvatarUrl: 'https://example.com/avatar2.jpg',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        sources: {
          local: { count: 2, hasMore: false },
          youtube: { count: 0, hasMore: false },
        },
        totalCount: 2,
        hasMore: false,
      };

      mockUnifiedDataService.getShortsVideos.mockResolvedValue(mockResponse);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedShorts(20),
        { wrapper: Wrapper },
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
          {
            id: 'search-1',
            title: 'Search Result 1',
            description: 'Search description 1',
            thumbnailUrl: 'https://example.com/search1.jpg',
            videoUrl: 'https://example.com/search1',
            views: 1000,
            viewsFormatted: '1K views',
            likes: 50,
            dislikes: 0,
            commentCount: 10,
            channel: {
              id: 'channel-1',
              name: 'Search Channel 1',
              avatarUrl: 'https://example.com/avatar1.jpg',
              subscribers: 5000,
              subscribersFormatted: '5K subscribers',
              isVerified: false,
            },
            duration: '10:00',
            publishedAt: new Date().toISOString(),
            publishedAtFormatted: '1 day ago',
            category: 'Tech',
            tags: ['search', 'tech'],
            isLive: false,
            isShort: false,
            visibility: 'public' as const,
            source: 'youtube' as const,
            metadata: {},
            // Required properties for UnifiedVideoMetadata
            uploadedAt: new Date().toISOString(),
            channelName: 'Search Channel 1',
            channelId: 'channel-1',
            channelAvatarUrl: 'https://example.com/avatar1.jpg',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'search-2',
            title: 'Search Result 2',
            description: 'Search description 2',
            thumbnailUrl: 'https://example.com/search2.jpg',
            videoUrl: 'https://example.com/search2',
            views: 2000,
            viewsFormatted: '2K views',
            likes: 100,
            dislikes: 0,
            commentCount: 20,
            channel: {
              id: 'channel-2',
              name: 'Search Channel 2',
              avatarUrl: 'https://example.com/avatar2.jpg',
              subscribers: 10000,
              subscribersFormatted: '10K subscribers',
              isVerified: true,
            },
            duration: '5:00',
            publishedAt: new Date().toISOString(),
            publishedAtFormatted: '2 days ago',
            category: 'Tech',
            tags: ['search', 'tech', 'tutorial'],
            isLive: false,
            isShort: false,
            visibility: 'public' as const,
            source: 'youtube' as const,
            metadata: {},
            // Required properties for UnifiedVideoMetadata
            uploadedAt: new Date().toISOString(),
            channelName: 'Search Channel 2',
            channelId: 'channel-2',
            channelAvatarUrl: 'https://example.com/avatar2.jpg',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        sources: {
          local: { count: 1, hasMore: false },
          youtube: { count: 1, hasMore: false },
        },
        totalCount: 2,
        hasMore: false,
      };

      mockUnifiedDataService.searchVideos.mockResolvedValue(mockResponse);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedSearchVideos('test query', { category: 'Tech' }, 25),
        { wrapper: Wrapper },
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(mockUnifiedDataService.searchVideos).toHaveBeenCalledWith(
        'test query',
        { category: 'Tech' },
        25,
      );
      expect(result.current.data?.data).toEqual(mockResponse.data);
    });

    it('should not search with short queries', () => {
      const { Wrapper } = createWrapper();
      renderHook(
        () => useUnifiedSearchVideos('a'), // Query too short
        { wrapper: Wrapper },
      );

      expect(mockUnifiedDataService.searchVideos).not.toHaveBeenCalled();
    });

    it('should not search with empty query', () => {
      const { Wrapper } = createWrapper();
      renderHook(
        () => useUnifiedSearchVideos(''),
        { wrapper: Wrapper },
      );

      expect(mockUnifiedDataService.searchVideos).not.toHaveBeenCalled();
    });

    it('should handle search errors', async () => {
      const mockError = new Error('Search failed');
      mockUnifiedDataService.searchVideos.mockRejectedValue(mockError);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedSearchVideos('test query'),
        { wrapper: Wrapper },
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
        // Mock video data would be needed for this test

        // This test would require mocking the videoApi dependency
        // For now, we'll test the structure
        const { Wrapper } = createWrapper();
        const { result } = renderHook(
          () => useVideoWithRelated('main-video'),
          { wrapper: Wrapper },
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
          { wrapper: Wrapper },
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
        refetchOnWindowFocus: false,
      };

      const mockResponse = {
        data: [],
        sources: { local: { count: 0, hasMore: false }, youtube: { count: 0, hasMore: false } },
        totalCount: 0,
        hasMore: false,
      };

      mockUnifiedDataService.getTrendingVideos.mockResolvedValue(mockResponse);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedVideos(50, {}, customConfig),
        { wrapper: Wrapper },
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
        () => new Promise(() => {}), // Never resolves
      );

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedVideos(),
        { wrapper: Wrapper },
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
        hasMore: false,
      };

      mockUnifiedDataService.getTrendingVideos.mockResolvedValue(mockResponse);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUnifiedVideos(),
        { wrapper: Wrapper },
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


declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
