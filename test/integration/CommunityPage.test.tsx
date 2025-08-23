import React, { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import CommunityPage from '../../pages/CommunityPage.tsx';
// Mock the hooks
vi.mock('@hooks/useRefactoredHooks', () => ({
 useRefactoredHooks: () => ({
 posts: [
 {
 id: '1',
 author: 'Test User',
 content: 'Test post content',
 timestamp: '2024-01-01T00:00:00Z',
 likes: 10,
 comments: 5,
 avatar: 'https://example.com/avatar.jpg' },
 {
 id: '2',
 author: 'Another User',
 content: 'Another test post',
 timestamp: '2024-01-02T00:00:00Z',
 likes: 25,
 comments: 12,
 avatar: 'https://example.com/avatar2.jpg' }],
 loading: false,
 error: null,
 createPost: vi.fn(),
 likePost: vi.fn(),
 addComment: vi.fn() }) }));

const createTestQueryClient = () => new QueryClient({
 defaultOptions: {
 queries: { retry: false },
 mutations: { retry: false } } });

const renderWithQueryClient = (component: React.ReactElement) => {
 const queryClient = createTestQueryClient();
 return render(
 <QueryClientProvider client={queryClient}>
 {component}
// FIXED:  </QueryClientProvider>
 );
};

describe('CommunityPage', () => {
 beforeEach(() => {
 vi.clearAllMocks();
 });

 it('renders community page with posts', () => {
 renderWithQueryClient(<CommunityPage />);

 expect(screen.getByText('Community')).toBeInTheDocument();
 expect(screen.getByText('Test post content')).toBeInTheDocument();
 expect(screen.getByText('Another test post')).toBeInTheDocument();
 expect(screen.getByText('Test User')).toBeInTheDocument();
 expect(screen.getByText('Another User')).toBeInTheDocument();
 });

 it('displays post statistics correctly', () => {
 renderWithQueryClient(<CommunityPage />);

 expect(screen.getByText('10')).toBeInTheDocument(); // likes
 expect(screen.getByText('5')).toBeInTheDocument(); // comments
 expect(screen.getByText('25')).toBeInTheDocument(); // likes for second post
 expect(screen.getByText('12')).toBeInTheDocument(); // comments for second post
 });

 it('shows create post form', () => {
 renderWithQueryClient(<CommunityPage />);

 expect(screen.getByPlaceholderText(/what's on your mind/i)).toBeInTheDocument();
 expect(screen.getByRole('button', { name: /post/i })).toBeInTheDocument();
 });

 it('handles post creation', async (): Promise<void> => {
 const { useRefactoredHooks } = await import('../../src/hooks/useRefactoredHooks');
 const mockCreatePost = vi.fn();

 vi.mocked(useRefactoredHooks).mockReturnValue({
 user: null,
 isAuthenticated: false,
 login: vi.fn(),
 logout: vi.fn(),
 theme: 'light' as const setTheme: vi.fn(),
 isDarkMode: false,
 miniplayerVideo: null,
 isMiniplayerOpen: false,
 openMiniplayer: vi.fn(),
 closeMiniplayer: vi.fn(),
 toggleMiniplayer: vi.fn(),
 watchLaterVideos: [],
 addToWatchLater: vi.fn(),
 removeFromWatchLater: vi.fn(),
 isInWatchLater: vi.fn(),
 sidebarCollapsed: false,
 toggleSidebar: vi.fn(),
 notifications: [],
 addNotification: vi.fn(),
 removeNotification: vi.fn() });

 renderWithQueryClient(<CommunityPage />);

 const textarea = screen.getByPlaceholderText(/what's on your mind/i);
 const postButton = screen.getByRole('button', { name: /post/i });

 fireEvent.change(textarea, { target: { value: 'New test post' } });
 fireEvent.click(postButton);

 await waitFor(() => {
 expect(mockCreatePost).toHaveBeenCalledWith('New test post');
 });
 });

 it('handles like button clicks', async (): Promise<void> => {
 const { useRefactoredHooks } = await import('../../hooks/useRefactoredHooks');
 const mockLikePost = vi.fn();

 vi.mocked(useRefactoredHooks).mockReturnValue({
 user: null,
 isAuthenticated: false,
 login: vi.fn(),
 logout: vi.fn(),
 theme: 'light' as const setTheme: vi.fn(),
 isDarkMode: false,
 miniplayerVideo: null,
 isMiniplayerOpen: false,
 openMiniplayer: vi.fn(),
 closeMiniplayer: vi.fn(),
 toggleMiniplayer: vi.fn(),
 watchLaterVideos: [],
 addToWatchLater: vi.fn(),
 removeFromWatchLater: vi.fn(),
 isInWatchLater: vi.fn(),
 sidebarCollapsed: false,
 toggleSidebar: vi.fn(),
 notifications: [
 ],
 addNotification: vi.fn(),
 removeNotification: vi.fn() });

 renderWithQueryClient(<CommunityPage />);

 const likeButtons = screen.getAllByLabelText(/like post/i);
 if (likeButtons[0]) {
 fireEvent.click(likeButtons[0]);
 }

 await waitFor(() => {
 expect(mockLikePost).toHaveBeenCalledWith('1');
 });
 });

 it('displays loading state', async (): Promise<void> => {
 const { useRefactoredHooks } = await import('../../hooks/useRefactoredHooks');

 vi.mocked(useRefactoredHooks).mockReturnValue({
 user: null,
 isAuthenticated: false,
 login: vi.fn(),
 logout: vi.fn(),
 theme: 'light' as const setTheme: vi.fn(),
 isDarkMode: false,
 miniplayerVideo: null,
 isMiniplayerOpen: false,
 openMiniplayer: vi.fn(),
 toggleMiniplayer: vi.fn(),
 closeMiniplayer: vi.fn(),
 watchLaterVideos: [],
 addToWatchLater: vi.fn(),
 removeFromWatchLater: vi.fn(),
 isInWatchLater: vi.fn(),
 sidebarCollapsed: false,
 toggleSidebar: vi.fn(),
 notifications: [],
 addNotification: vi.fn(),
 removeNotification: vi.fn() });

 renderWithQueryClient(<CommunityPage />);

 expect(screen.getByText(/loading/i)).toBeInTheDocument();
 });

 it('displays error state', async (): Promise<void> => {
 const { useRefactoredHooks } = await import('../../hooks/useRefactoredHooks');

 vi.mocked(useRefactoredHooks).mockReturnValue({
 user: null,
 isAuthenticated: false,
 login: vi.fn(),
 logout: vi.fn(),
 theme: 'light' as const setTheme: vi.fn(),
 isDarkMode: false,
 miniplayerVideo: null,
 isMiniplayerOpen: false,
 openMiniplayer: vi.fn(),
 toggleMiniplayer: vi.fn(),
 closeMiniplayer: vi.fn(),
 watchLaterVideos: [],
 addToWatchLater: vi.fn(),
 removeFromWatchLater: vi.fn(),
 isInWatchLater: vi.fn(),
 sidebarCollapsed: false,
 toggleSidebar: vi.fn(),
 notifications: [],
 addNotification: vi.fn(),
 removeNotification: vi.fn() });

 renderWithQueryClient(<CommunityPage />);

 expect(screen.getByText(/error loading posts/i)).toBeInTheDocument();
 });
});
