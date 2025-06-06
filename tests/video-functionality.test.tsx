/**
 * Video Functionality Tests
 * Comprehensive tests for video-related features
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Import components
import VideoCard from '../components/VideoCard';
import ShortDisplayCard from '../components/ShortDisplayCard';
import VideoPlayer from '../components/video/VideoPlayer';
import CommentsSection from '../components/CommentsSection';
import { RefactoredAppProviders } from '../providers/RefactoredAppProviders';

// Mock data
const mockVideo = {
  id: 'test123',
  title: 'Test Video Title',
  description: 'Test video description',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  videoUrl: 'https://example.com/video.mp4',
  duration: '10:30',
  views: '1,234,567',
  likes: 12345,
  dislikes: 123,
  channelName: 'Test Channel',
  channelAvatarUrl: 'https://example.com/avatar.jpg',
  channelId: 'channel123',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  uploadedAt: '2024-01-01T00:00:00Z',
  category: 'Entertainment',
  tags: ['test', 'video'],
  visibility: 'public' as const,
  isLiked: false,
  isDisliked: false,
  isSaved: false
};

const mockShort = {
  id: 'short123',
  title: 'Test Short',
  videoUrl: 'https://example.com/short.mp4',
  thumbnailUrl: 'https://example.com/short-thumb.jpg',
  duration: '0:30',
  views: '50K',
  likes: 1000,
  channelName: 'Test Channel',
  channelAvatar: 'https://example.com/avatar.jpg',
  channelAvatarUrl: 'https://example.com/avatar.jpg',
  uploadedAt: '2024-01-15',
  description: 'Test short video',
  category: 'Entertainment',
  tags: ['test', 'short'],
  isLiked: false,
  isDisliked: false,
  isSaved: false,
  isVertical: true,
  isShort: true as const
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RefactoredAppProviders>
          {children}
        </RefactoredAppProviders>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Video Functionality', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('VideoCard Component', () => {
    it('should render video information correctly', () => {
      render(
        <TestWrapper>
          <VideoCard video={mockVideo} />
        </TestWrapper>
      );

      expect(screen.getByText(mockVideo.title)).toBeInTheDocument();
      expect(screen.getByText(mockVideo.channelName)).toBeInTheDocument();
      expect(screen.getByText(mockVideo.views)).toBeInTheDocument();
      expect(screen.getByText(mockVideo.duration)).toBeInTheDocument();
    });

    it('should handle video click navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <VideoCard video={mockVideo} />
        </TestWrapper>
      );

      const videoLink = screen.getByRole('link');
      await user.click(videoLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/watch');
        expect(window.location.search).toContain(`v=${mockVideo.id}`);
      });
    });

    it('should display thumbnail with proper alt text', () => {
      render(
        <TestWrapper>
          <VideoCard video={mockVideo} />
        </TestWrapper>
      );

      const thumbnail = screen.getByRole('img');
      expect(thumbnail).toHaveAttribute('src', mockVideo.thumbnailUrl);
      expect(thumbnail).toHaveAttribute('alt', expect.stringContaining(mockVideo.title));
    });

    it('should handle like/unlike functionality', async () => {
      const user = userEvent.setup();
      const onLike = vi.fn();
      
      render(
        <TestWrapper>
          <VideoCard video={mockVideo} onLike={onLike} />
        </TestWrapper>
      );

      const likeButton = screen.getByTestId('like-button');
      await user.click(likeButton);

      expect(onLike).toHaveBeenCalledWith(mockVideo.id);
    });
  });

  describe('ShortDisplayCard Component', () => {
    it('should render short video correctly', () => {
      render(
        <TestWrapper>
          <ShortDisplayCard short={mockShort} />
        </TestWrapper>
      );

      expect(screen.getByText(mockShort.title)).toBeInTheDocument();
      expect(screen.getByText(mockShort.channelName)).toBeInTheDocument();
      expect(screen.getByText(mockShort.views)).toBeInTheDocument();
    });

    it('should handle follow/unfollow functionality', async () => {
      const user = userEvent.setup();
      const onFollow = vi.fn();
      
      render(
        <TestWrapper>
          <ShortDisplayCard 
            short={mockShort} 
            onFollow={onFollow}
            isFollowed={false}
          />
        </TestWrapper>
      );

      const followButton = screen.getByText('Follow');
      await user.click(followButton);

      expect(onFollow).toHaveBeenCalledWith(mockShort.channelName);
    });

    it('should show following state when followed', () => {
      render(
        <TestWrapper>
          <ShortDisplayCard 
            short={mockShort} 
            isFollowed={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Following')).toBeInTheDocument();
    });

    it('should handle video autoplay on intersection', async () => {
      const mockIntersectionObserver = vi.fn();
      mockIntersectionObserver.mockReturnValue({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      });
      
      window.IntersectionObserver = mockIntersectionObserver;

      render(
        <TestWrapper>
          <ShortDisplayCard short={mockShort} isActive={true} />
        </TestWrapper>
      );

      const video = screen.getByRole('video');
      expect(video).toBeInTheDocument();
    });
  });

  describe('Video Player Controls', () => {
    it('should render video player with controls', () => {
      render(
        <TestWrapper>
          <VideoPlayer videoId={mockVideo.id} />
        </TestWrapper>
      );

      expect(screen.getByRole('video')).toBeInTheDocument();
      expect(screen.getByTestId('play-button')).toBeInTheDocument();
      expect(screen.getByTestId('volume-button')).toBeInTheDocument();
      expect(screen.getByTestId('fullscreen-button')).toBeInTheDocument();
    });

    it('should handle play/pause toggle', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <VideoPlayer videoId={mockVideo.id} />
        </TestWrapper>
      );

      const playButton = screen.getByTestId('play-button');
      
      // Initially should show play
      expect(playButton).toHaveAttribute('aria-label', 'Play');

      await user.click(playButton);

      // Should change to pause
      await waitFor(() => {
        expect(playButton).toHaveAttribute('aria-label', 'Pause');
      });
    });

    it('should handle volume controls', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <VideoPlayer videoId={mockVideo.id} />
        </TestWrapper>
      );

      const volumeButton = screen.getByTestId('volume-button');
      
      await user.click(volumeButton);

      await waitFor(() => {
        expect(volumeButton).toHaveAttribute('aria-label', 'Unmute');
      });
    });

    it('should handle fullscreen toggle', async () => {
      const user = userEvent.setup();
      
      // Mock fullscreen API
      document.fullscreenElement = null;
      document.exitFullscreen = vi.fn();
      HTMLElement.prototype.requestFullscreen = vi.fn();

      render(
        <TestWrapper>
          <VideoPlayer videoId={mockVideo.id} />
        </TestWrapper>
      );

      const fullscreenButton = screen.getByTestId('fullscreen-button');
      await user.click(fullscreenButton);

      expect(HTMLElement.prototype.requestFullscreen).toHaveBeenCalled();
    });

    it('should handle keyboard shortcuts', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <VideoPlayer videoId={mockVideo.id} />
        </TestWrapper>
      );

      const videoContainer = screen.getByTestId('video-container');
      videoContainer.focus();

      // Test spacebar for play/pause
      await user.keyboard(' ');
      
      const playButton = screen.getByTestId('play-button');
      await waitFor(() => {
        expect(playButton).toHaveAttribute('aria-label', 'Pause');
      });

      // Test 'f' for fullscreen
      await user.keyboard('f');
      expect(HTMLElement.prototype.requestFullscreen).toHaveBeenCalled();
    });
  });

  describe('Comment Functionality', () => {
    const mockComments = [
      {
        id: 'comment1',
        userAvatarUrl: 'https://example.com/user1.jpg',
        userName: 'User1',
        commentText: 'Great video!',
        timestamp: '2024-01-01T00:00:00Z',
        likes: 5,
        isLikedByCurrentUser: false,
        isDislikedByCurrentUser: false,
        isEdited: false,
        replies: [],
        replyCount: 0,
        videoId: 'test123',
        authorId: 'user1',
        authorName: 'User1',
        authorAvatar: 'https://example.com/user1.jpg',
        content: 'Great video!',
        dislikes: 0,
        isPinned: false,
        isHearted: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'comment2',
        userAvatarUrl: 'https://example.com/user2.jpg',
        userName: 'User2',
        commentText: 'Thanks for sharing',
        timestamp: '2024-01-02T00:00:00Z',
        likes: 2,
        isLikedByCurrentUser: false,
        isDislikedByCurrentUser: false,
        isEdited: false,
        replies: [],
        replyCount: 0,
        videoId: 'test123',
        authorId: 'user2',
        authorName: 'User2',
        authorAvatar: 'https://example.com/user2.jpg',
        content: 'Thanks for sharing',
        dislikes: 0,
        isPinned: false,
        isHearted: false,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      }
    ];

    it('should render comments list', () => {
      render(
        <TestWrapper>
          <CommentsSection videoId={mockVideo.id} comments={mockComments} />
        </TestWrapper>
      );

      expect(screen.getByText('Great video!')).toBeInTheDocument();
      expect(screen.getByText('Thanks for sharing')).toBeInTheDocument();
      expect(screen.getByText('User1')).toBeInTheDocument();
      expect(screen.getByText('User2')).toBeInTheDocument();
    });

    it('should handle comment submission', async () => {
      const user = userEvent.setup();
      const onSubmitComment = vi.fn();
      
      render(
        <TestWrapper>
          <CommentsSection 
            videoId={mockVideo.id} 
            comments={mockComments}
            onSubmitComment={onSubmitComment}
          />
        </TestWrapper>
      );

      const commentInput = screen.getByPlaceholderText('Add a comment...');
      const submitButton = screen.getByText('Comment');

      await user.type(commentInput, 'New comment');
      await user.click(submitButton);

      expect(onSubmitComment).toHaveBeenCalledWith('New comment');
    });

    it('should handle comment like/unlike', async () => {
      const user = userEvent.setup();
      const onLikeComment = vi.fn();
      
      render(
        <TestWrapper>
          <CommentsSection 
            videoId={mockVideo.id} 
            comments={mockComments}
            onLikeComment={onLikeComment}
          />
        </TestWrapper>
      );

      const likeButtons = screen.getAllByTestId('comment-like-button');
      await user.click(likeButtons[0]);

      expect(onLikeComment).toHaveBeenCalledWith('comment1');
    });

    it('should handle comment replies', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CommentsSection videoId={mockVideo.id} comments={mockComments} />
        </TestWrapper>
      );

      const replyButtons = screen.getAllByText('Reply');
      await user.click(replyButtons[0]);

      expect(screen.getByPlaceholderText('Add a reply...')).toBeInTheDocument();
    });
  });

  describe('Video Recommendations', () => {
    it('should display related videos', () => {
      const relatedVideos = [mockVideo, { ...mockVideo, id: 'related1' }];
      
      render(
        <TestWrapper>
          <div data-testid="related-videos">
            {relatedVideos.map(video => (
              <VideoCard key={video.id} video={video} variant="compact" />
            ))}
          </div>
        </TestWrapper>
      );

      const relatedSection = screen.getByTestId('related-videos');
      expect(relatedSection).toBeInTheDocument();
      
      const videoCards = screen.getAllByText(mockVideo.title);
      expect(videoCards).toHaveLength(2);
    });
  });
});
