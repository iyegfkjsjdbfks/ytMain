/**
 * Comprehensive testing utilities for React components with enhanced setup
 */

import type { ReactElement, ReactNode } from 'react';


import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { render, screen, waitFor, type RenderOptions, renderHook, type RenderHookOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MemoryRouter } from 'react-router-dom';

import { vi } from 'vitest';

// Mock data generators
export const mockGenerators = {
  video: (overrides: Partial<any> = {}) => ({
    id: `video-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Test Video Title',
    description: 'Test video description',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    videoUrl: 'https://example.com/video.mp4',
    duration: '5:00',
    views: '1,000',
    likes: 50,
    dislikes: 5,
    uploadedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    channelName: 'Test Channel',
    channelId: 'channel-123',
    channelAvatarUrl: 'https://example.com/avatar.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: 'Entertainment',
    tags: ['test', 'video'],
    visibility: 'public' as const,
    ...overrides,
  }),

  channel: (overrides: Partial<any> = {}) => ({
    id: `channel-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Channel',
    description: 'Test channel description',
    avatarUrl: 'https://example.com/avatar.jpg',
    banner: 'https://example.com/banner.jpg',
    subscribers: 10000,
    subscriberCount: '10K',
    videoCount: 100,
    isVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),

  user: (overrides: Partial<any> = {}) => ({
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    username: 'testuser',
    email: 'test@example.com',
    displayName: 'Test User',
    avatar: 'https://example.com/user-avatar.jpg',
    isVerified: false,
    subscriberCount: 0,
    preferences: {
      theme: 'system' as const,
      language: 'en',
      autoplay: true,
      notifications: {
        email: true,
        push: true,
        subscriptions: true,
        comments: true,
        likes: true,
        mentions: true,
      },
      privacy: {
        showSubscriptions: true,
        showPlaylists: true,
        allowComments: true,
        restrictedMode: false,
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),

  comment: (overrides: Partial<any> = {}) => ({
    id: `comment-${Math.random().toString(36).substr(2, 9)}`,
    text: 'This is a test comment',
    authorId: `user-${Math.random().toString(36).substr(2, 9)}`,
    authorName: 'Test User',
    authorAvatar: 'https://example.com/user-avatar.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likes: 10,
    replies: [],
    ...overrides,
  }),

  playlist: (overrides: Partial<any> = {}) => ({
    id: `playlist-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Test Playlist',
    description: 'Test playlist description',
    thumbnail: 'https://example.com/playlist-thumb.jpg',
    videos: [mockGenerators.video()],
    owner: mockGenerators.user(),
    isPublic: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  }),
};

// API mocking utilities
export const apiMocks = {
  // Mock successful API responses
  mockApiSuccess<T>(data: T, delay: number = 0) {
    return vi.fn().mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve(data), delay)),
    );
  },

  // Mock API errors
  mockApiError: (error: { status?: number; message?: string } = {}, delay: number = 0) => {
    const apiError = {
      status: error.status || 500,
      message: error.message || 'Internal Server Error',
      response: {
        status: error.status || 500,
        data: { message: error.message || 'Internal Server Error' },
      },
    };

    return vi.fn().mockImplementation(() =>
      new Promise((_, reject) => setTimeout(() => reject(apiError instanceof Error ? apiError : new Error(JSON.stringify(apiError))), delay)),
    );
  },

  // Mock paginated responses
  mockPaginatedResponse<T>(items: T[], page: number = 1, pageSize: number = 10) {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      data: paginatedItems,
      pagination: {
        page,
        pageSize,
        total: items.length,
        totalPages: Math.ceil(items.length / pageSize),
        hasNext: endIndex < items.length,
        hasPrev: page > 1,
      },
    };
  },
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Router options
  initialEntries?: string[];

  // Query client options
  queryClient?: QueryClient;

  // Custom wrapper
  wrapper?: ({ children }: { children: ReactNode }) => ReactElement;

  // Mock user for authentication
  mockUser?: any;
}

function createTestQueryClient(): QueryClient {
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
}

function AllTheProviders({
  children,
  queryClient,
  initialEntries = ['/'],
  mockUser: _mockUser,
}: {
  children: ReactNode;
  queryClient: QueryClient;
  initialEntries?: string[];
  mockUser?: any;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
}

export function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {},
) {
  const {
    queryClient = createTestQueryClient(),
    initialEntries = ['/'],
    mockUser,
    wrapper,
    ...renderOptions
  } = options;

  const Wrapper = wrapper || (({ children }: { children: ReactNode }) => (
    <AllTheProviders
      queryClient={queryClient}
      initialEntries={initialEntries}
      mockUser={mockUser}
    >
      {children}
    </AllTheProviders>
  ));

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...result,
    user: userEvent.setup(),
    queryClient,
  };
}

// Custom render hook function
export function customRenderHook<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options: RenderHookOptions<TProps> & {
    queryClient?: QueryClient;
    initialEntries?: string[];
    mockUser?: any;
  } = {},
) {
  const {
    queryClient = createTestQueryClient(),
    initialEntries = ['/'],
    mockUser,
    wrapper,
    ...renderHookOptions
  } = options;

  const Wrapper = wrapper || (({ children }: { children: ReactNode }) => (
    <AllTheProviders
      queryClient={queryClient}
      initialEntries={initialEntries}
      mockUser={mockUser}
    >
      {children}
    </AllTheProviders>
  ));

  return renderHook(hook, { wrapper: Wrapper, ...renderHookOptions });
}

// Testing utilities for common patterns
export const testUtils = {
  // Wait for loading states to complete
  waitForLoadingToFinish: async () => {
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  },

  // Wait for error states
  waitForError: async (errorMessage?: string) => {
    await waitFor(() => {
      if (errorMessage) {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      } else {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      }
    });
  },

  // Simulate network delays
  simulateNetworkDelay: (ms: number = 100) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Mock intersection observer for lazy loading tests
  mockIntersectionObserver: () => {
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });
    window.IntersectionObserver = mockIntersectionObserver;
    return mockIntersectionObserver;
  },

  // Mock resize observer
  mockResizeObserver: () => {
    const mockResizeObserver = vi.fn();
    mockResizeObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });
    window.ResizeObserver = mockResizeObserver;
    return mockResizeObserver;
  },

  // Mock media query
  mockMediaQuery: (matches: boolean = false) => {
    const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    return mockMatchMedia;
  },

  // Mock local storage
  mockLocalStorage: () => {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });

    return localStorageMock;
  },

  // Mock fetch API
  mockFetch: () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;
    return mockFetch;
  },

  // Create mock file for upload tests
  createMockFile: (name: string = 'test.mp4', type: string = 'video/mp4') => {
    return new File(['test content'], name, { type, lastModified: Date.now() });
  },

  // Simulate drag and drop events
  simulateDragAndDrop: async (element: HTMLElement, files: File[]) => {
    const user = userEvent.setup();

    const dataTransfer = {
      files,
      items: files.map(file => ({
        kind: 'file',
        type: file.type,
        getAsFile: () => file,
      })),
      types: ['Files'],
    };

    await user.pointer([
      { target: element },
      { keys: '[MouseLeft>]', target: element },
    ]);

    // Simulate drop event
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: dataTransfer,
    });

    element.dispatchEvent(dropEvent);
  },

  // Mock data generators
  generateMockVideo: mockGenerators.video,
  generateMockChannel: mockGenerators.channel,
  generateMockComment: mockGenerators.comment,
  generateMockUser: mockGenerators.user,
};

// Performance testing utilities
export const performanceUtils = {
  // Measure component render time
  measureRenderTime: async (renderFn: () => void) => {
    const startTime = performance.now();
    renderFn();
    await waitFor(() => {});
    const endTime = performance.now();
    return endTime - startTime;
  },

  // Test for memory leaks
  checkForMemoryLeaks: (component: ReactElement, iterations: number = 100) => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

    for (let i = 0; i < iterations; i++) {
      const { unmount } = customRender(component);
      unmount();
    }

    // Force garbage collection if available
    if ((global as any).gc) {
      (global as any).gc();
    }

    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;

    return {
      initialMemory,
      finalMemory,
      memoryIncrease,
      potentialLeak: memoryIncrease > 1024 * 1024, // 1MB threshold
    };
  },
};

// Accessibility testing utilities
export const a11yUtils = {
  // Check for basic accessibility requirements
  checkBasicA11y: async () => {
    // Check for proper heading hierarchy
    const headings = screen.getAllByRole('heading');
    const headingLevels = headings.map(h => parseInt(h.tagName.charAt(1), 10));

    // Check for alt text on images
    const images = screen.getAllByRole('img');
    const imagesWithoutAlt = images.filter((img: any) => !img.getAttribute('alt'));

    // Check for form labels
    const inputs = screen.getAllByRole('textbox');
    const inputsWithoutLabels = inputs.filter((input: any) => {
      const id = input.getAttribute('id');
      return !id || !screen.queryByLabelText(new RegExp(id, 'i'));
    });

    return {
      headingLevels,
      imagesWithoutAlt: imagesWithoutAlt.length,
      inputsWithoutLabels: inputsWithoutLabels.length,
    };
  },

  // Test keyboard navigation
  testKeyboardNavigation: async (startElement?: HTMLElement) => {
    const user = userEvent.setup();
    const focusableElements: HTMLElement[] = [];

    if (startElement) {
      startElement.focus();
    }

    // Tab through all focusable elements
    for (let i = 0; i < 20; i++) {
      await user.keyboard('{Tab}');
      const activeElement = document.activeElement as HTMLElement;

      if (focusableElements.includes(activeElement)) {
        break;
      }

      focusableElements.push(activeElement);
    }

    return focusableElements;
  },
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { userEvent };
export { customRender as render };
export { customRenderHook as renderHook };