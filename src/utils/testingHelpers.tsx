
/// <reference types="react/jsx-runtime" />
// TODO: Fix import - import { BrowserRouter } from 'react-router-dom';
// TODO: Fix import - import React from "react";
// TODO: Fix import - import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// TODO: Fix import - import React from "react";
// TODO: Fix import - import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// TODO: Fix import - import type { ReactElement, ReactNode } from 'react';
// TODO: Fix import - import userEvent from '@testing-library/user-event';
import type { Video, Channel, Comment } from '../types/core';





// Test utilities for consistent testing
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// Wrapper component for tests
interface TestWrapperProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

export const TestWrapper = ({ children, queryClient }: TestWrapperProps) => {
  const client = queryClient || createTestQueryClient();

  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render function
export const renderWithProviders = (
  ui: ReactElement,
  options?: {
    queryClient?: QueryClient;
    [key]: any;
  },
) => {
  const { queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  }), ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }: {children: any}) => (
      <TestWrapper queryClient={queryClient}>
        {children}
      </TestWrapper>
    ),
    ...renderOptions,
  });
};

// Mock data factories
export const createMockVideo = (overrides: Partial<Video> = {}): Video => ({
  id: 'test-video-1',
  title: 'Test Video Title',
  description: 'Test video description',
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
  videoUrl: 'https://example.com/video.mp4',
  duration: '300',
  views: 1000,
  likes: 50,
  dislikes: 2,
  uploadedAt: '2024-01-01T00:00:00Z',
  publishedAt: '2024-01-01T00:00:00Z',
  channelId: 'test-channel-1',
  channelName: 'Test Channel',
  channelAvatarUrl: 'https://example.com/avatar.jpg',
  category: 'Entertainment',
  tags: ['test', 'video'],
  visibility: 'public',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockChannel = (overrides: Partial<Channel> = {}): Channel => ({
  id: 'test-channel-1',
  name: 'Test Channel',
  description: 'Test channel description',
  avatarUrl: 'https://example.com/avatar.jpg',
  banner: 'https://example.com/banner.jpg',
  subscribers: 1000,
  subscriberCount: 1000,
  videoCount: 50,
  isVerified: false,
  joinedDate: '2023-01-01',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockComment = (overrides: Partial<Comment> = {}): Comment => ({
  id: 'test-comment-1',
  userAvatarUrl: 'https://example.com/user-avatar.jpg',
  userName: 'Test User',
  commentText: 'Test comment content',
  timestamp: '2024-01-01T00:00:00Z',
  likes: 5,
  isLikedByCurrentUser: false,
  isDislikedByCurrentUser: false,
  isEdited: false,
  replies: [],
  replyCount: 2,
  videoId: 'test-video-1',
  authorId: 'test-user-1',
  authorName: 'Test User',
  authorAvatar: 'https://example.com/user-avatar.jpg',
  content: 'Test comment content',
  dislikes: 0,
  isPinned: false,
  isHearted: false,
  createdAt: '2024-01-01T00:00:00Z',
  likeCount: 5,
  publishedAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now();
  renderFn();
  await waitFor(() => {
    // Wait for any async operations to complete
  });
  const end = performance.now();
  return end - start;
};

// Accessibility testing helpers
export const checkAccessibility = async (_container: HTMLElement) => {
  const axeCore = await import('@axe-core/react');
  const React = await import('react');
  const ReactDOM = await import('react-dom');
  const results = await axeCore.default(React, ReactDOM, 1000);
  return results;
};

// User interaction helpers
export const userInteraction = {
  clickVideo: async (videoTitle) => {
    const video = screen.getByRole('button', { name: new RegExp(videoTitle, 'i') });
    await userEvent.click(video);
  },

  searchFor: async (query) => {
    const searchInput = screen.getByRole('searchbox');
    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, query);
    await userEvent.keyboard('{Enter}');
  },

  likeVideo: async () => {
    const likeButton = screen.getByRole('button', { name: /like/i });
    await userEvent.click(likeButton);
  },

  addComment: async (content) => {
    const commentInput = screen.getByRole('textbox', { name: /add.*comment/i });
    await userEvent.clear(commentInput);
    await userEvent.type(commentInput, content);

    const submitButton = screen.getByRole('button', { name: /comment/i });
    await userEvent.click(submitButton);
  },

  subscribeToChannel: async () => {
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i });
    await userEvent.click(subscribeButton);
  },
};

// Mock API responses
export const mockApiResponses = {
  videos: {
    trending: [createMockVideo({ id: '1', title: 'Trending Video 1' })],
    search: (query) => [
      createMockVideo({ id: '2', title: `Search Result for ${query}` }),
    ],
  },

  channels: {
    byId: (id) => createMockChannel({ id, name: `Channel ${id}` }),
  },

  comments: {
    byVideoId: (videoId) => [
      createMockComment({ id: '1', content: `Comment for video ${videoId}` }),
    ],
  },
};

// Test scenarios
export const testScenarios = {
  videoPlayback: {
    'should play video when clicked': async () => {
      await userInteraction.clickVideo('Test Video');
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    },

    'should show video controls': () => {
      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
      expect(screen.getByRole('slider', { name: /seek/i })).toBeInTheDocument();
    },
  },

  userInteractions: {
    'should allow liking videos': async () => {
      await userInteraction.likeVideo();
      expect(screen.getByRole('button', { name: /liked/i })).toBeInTheDocument();
    },

    'should allow adding comments': async () => {
      await userInteraction.addComment('Great video!');
      expect(screen.getByText('Great video!')).toBeInTheDocument();
    },
  },

  navigation: {
    'should navigate to video page': async () => {
      await userInteraction.clickVideo('Test Video');
      expect(window.location.pathname).toMatch(/\/watch/);
    },

    'should search for videos': async () => {
      await userInteraction.searchFor('test query');
      expect(window.location.search).toContain('q=test+query');
    },
  },
};

// Performance benchmarks
export const performanceBenchmarks = {
  videoGridRender: {
    maxRenderTime: 100, // ms
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
  },

  videoPlayerLoad: {
    maxLoadTime: 500, // ms
    maxBundleSize: 200 * 1024, // 200KB
  },

  commentSection: {
    maxRenderTime: 50, // ms per 100 comments
    maxScrollPerformance: 60, // fps
  },
};

export { screen, fireEvent, waitFor, userEvent };

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
