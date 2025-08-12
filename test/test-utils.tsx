import React, { ReactNode, ReactElement, type { ReactElement } from 'react';

import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock data generators
export const mockVideo: any = (overrides = {}) => ({
 id: 'video-1',
 title: 'Test Video',
 description: 'Test video description',
 thumbnail: 'https://example.com/thumbnail.jpg',
 duration: 300,
 views: 1000,
 likes: 50,
 dislikes: 5,
 uploadDate: '2024-01-01T00:00:00Z',
 channel: {
 id: 'channel-1',
 name: 'Test Channel',
 avatar: 'https://example.com/avatar.jpg',
 subscribers: 10000 },
 url: 'https://example.com/video.mp4',
 ...overrides });

export const mockUser: any = (overrides = {}) => ({
 id: 'user-1',
 username: 'testuser',
 email: 'test@example.com',
 avatar: 'https://example.com/user-avatar.jpg',
 subscriptions: [],
 watchHistory: [],
 preferences: {
 theme: 'light',
 autoplay: true,
 quality: 'auto' },
 ...overrides });

export const mockComment: any = (overrides = {}) => ({
 id: 'comment-1',
 content: 'Test comment',
 author: mockUser(),
 timestamp: '2024-01-01T00:00:00Z',
 likes: 10,
 replies: [],
 ...overrides });

export const mockPost: any = (overrides = {}) => ({
 id: 'post-1',
 author: 'Test User',
 content: 'Test post content',
 timestamp: '2024-01-01T00:00:00Z',
 likes: 10,
 comments: 5,
 avatar: 'https://example.com/avatar.jpg',
 ...overrides });

// Test providers wrapper
interface AllTheProvidersProps {
 children: React.ReactNode;
 queryClient?: QueryClient;
 initialEntries?: string;
}

const AllTheProviders: any = ({
 children,
 queryClient }: AllTheProvidersProps) => {
 const testQueryClient = queryClient || new QueryClient({
 defaultOptions: {
 queries: {
 retry: false,
 gcTime: 0,
 staleTime: 0 },
 mutations: {
 retry: false } } });

 return (
 <QueryClientProvider client={testQueryClient}>
 <BrowserRouter>
 {children}
// FIXED:  </BrowserRouter>
// FIXED:  </QueryClientProvider>
 );
};

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
 queryClient?: QueryClient;
 initialEntries?: string;
}

const customRender: any = (,
 ui: ReactElement,
 options: CustomRenderOptions = {}) => {
 const { queryClient, initialEntries, ...renderOptions } = options;

 return render(ui, {
 wrapper: ({ children }: any) => (
 <AllTheProviders
 queryClient={queryClient || new QueryClient({
 defaultOptions: {
 queries: { retry: false,
 gcTime: 0, staleTime: 0 },
 mutations: { retry: false } } })} />
 >
 {children}
// FIXED:  </AllTheProviders>
 ),
 ...renderOptions });
};

// Mock implementations
export const mockIntersectionObserver: any = () => {
 const mockIntersectionObserver = vi.fn();
 mockIntersectionObserver.mockReturnValue({
 observe: vi.fn(),
 unobserve: vi.fn(),
 disconnect: vi.fn() });

 Object.defineProperty(window, 'IntersectionObserver', {
 writable: true,
 configurable: true,
 value: mockIntersectionObserver });

 Object.defineProperty(global, 'IntersectionObserver', {
 writable: true,
 configurable: true,
 value: mockIntersectionObserver });

 return mockIntersectionObserver;
};

export const mockResizeObserver: any = () => {
 const mockResizeObserver = vi.fn();
 mockResizeObserver.mockReturnValue({
 observe: vi.fn(),
 unobserve: vi.fn(),
 disconnect: vi.fn() });

 Object.defineProperty(window, 'ResizeObserver', {
 writable: true,
 configurable: true,
 value: mockResizeObserver });

 return mockResizeObserver;
};

export const mockMatchMedia: any = (matches = false) => {
 const mockMatchMedia = vi.fn().mockImplementation((query) => ({
 matches,
 media: query,
 onchange: null,
 addListener: vi.fn(),
 removeListener: vi.fn(),
 addEventListener: vi.fn(),
 removeEventListener: vi.fn(),
 dispatchEvent: vi.fn() }));

 Object.defineProperty(window, 'matchMedia', {
 writable: true,
 value: mockMatchMedia });

 return mockMatchMedia;
};

export const mockLocalStorage: any = () => {
 const store: Record<string, string> = {};

 const mockStorage = {
 getItem: vi.fn((key) => store[key] || null),
 setItem: vi.fn((key: any, value: any) => {
 store[key] = value;
 }),
 removeItem: vi.fn((key: any) => {
 delete store[key];
 }),
 clear: vi.fn(() => {
 Object.keys(store).forEach(key => delete store[key]);
 }),
 length: 0,
 key: vi.fn() };

 Object.defineProperty(window, 'localStorage', {
 value: mockStorage,
 writable: true });

 return mockStorage;
};

export const mockSessionStorage: any = () => {
 const store: Record<string, string> = {};

 const mockStorage = {
 getItem: vi.fn((key) => store[key] || null),
 setItem: vi.fn((key: any, value: any) => {
 store[key] = value;
 }),
 removeItem: vi.fn((key: any) => {
 delete store[key];
 }),
 clear: vi.fn(() => {
 Object.keys(store).forEach(key => delete store[key]);
 }),
 length: 0,
 key: vi.fn() };

 Object.defineProperty(window, 'sessionStorage', {
 value: mockStorage,
 writable: true });

 return mockStorage;
};

// Mock fetch with response helpers
export const mockFetch: any = () => {
 const mockFetch = vi.fn();

 const mockResponse: any = (data: any,
 options: { status?: number; ok?: boolean } = {}) => ({
 ok: options.ok ?? true,
 status: options.status ?? 200,
 json: vi.fn().mockResolvedValue(data),
 text: vi.fn().mockResolvedValue(JSON.stringify(data)),
 blob: vi.fn().mockResolvedValue(new Blob([JSON.stringify(data)])),
 headers: new Headers(),
 statusText: 'OK' });

 mockFetch.mockResolvedValue(mockResponse({}));

 Object.defineProperty(global, 'fetch', {
 value: mockFetch,
 writable: true });

 return { mockFetch, mockResponse };

// Performance mock
export const mockPerformance: any = () => {
 const mockPerformance = {
 now: vi.fn(() => Date.now()),
 mark: vi.fn(),
 measure: vi.fn(),
 getEntriesByType: vi.fn(() => []),
 getEntriesByName: vi.fn(() => []),
 clearMarks: vi.fn(),
 clearMeasures: vi.fn(),
 memory: {
 usedJSHeapSize: 1000000,
 totalJSHeapSize: 2000000,
 jsHeapSizeLimit: 4000000 };

 Object.defineProperty(global, 'performance', {
 value: mockPerformance,
 writable: true });

 return mockPerformance;
};

// URL mock
export const mockURL: any = () => {
 const mockURL = {
 createObjectURL: vi.fn(() => 'blob:mock-url'),
 revokeObjectURL: vi.fn() };

 Object.defineProperty(global, 'URL', {
 value: mockURL,
 writable: true });

 return mockURL;
};

// Video element mock
export const mockVideoElement: any = () => {
 const mockVideo = {
 play: vi.fn().mockResolvedValue(undefined),
 pause: vi.fn(),
 load: vi.fn(),
 currentTime: 0,
 duration: 100,
 paused: true,
 ended: false,
 volume: 1,
 muted: false,
 playbackRate: 1,
 addEventListener: vi.fn(),
 removeEventListener: vi.fn(),
 dispatchEvent: vi.fn() };

 Object.defineProperty(global.HTMLMediaElement.prototype, 'play', {
 value: mockVideo.play,
 writable: true });

 Object.defineProperty(global.HTMLMediaElement.prototype, 'pause', {
 value: mockVideo.pause,
 writable: true });

 return mockVideo;
};

// Test helpers
export const waitForLoadingToFinish: any = () => {
 return new Promise(resolve => setTimeout((resolve) as any, 0));
};

export const createMockQueryClient: any = () => {
 return new QueryClient({
 defaultOptions: {
 queries: {
 retry: false,
 gcTime: 0,
 staleTime: 0 },
 mutations: {
 retry: false } } });
};

// Setup function for common mocks
export const setupTestEnvironment: any = () => {
 mockIntersectionObserver();
 mockResizeObserver();
 mockMatchMedia();
 mockLocalStorage();
 mockSessionStorage();
 mockPerformance();
 mockURL();
 mockVideoElement();
 mockFetch();

 // Mock console methods to reduce noise in tests
 vi.spyOn(console, 'log').mockImplementation(() => {});
 vi.spyOn(console, 'warn').mockImplementation(() => {});
 vi.spyOn(console, 'error').mockImplementation(() => {});
};

// Cleanup function
export const cleanupTestEnvironment: any = () => {
 vi.restoreAllMocks();
 vi.clearAllMocks();
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };
