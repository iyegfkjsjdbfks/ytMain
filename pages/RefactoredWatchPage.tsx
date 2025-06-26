import type React from 'react';
import { useState, useEffect, useCallback } from 'react';

import CommentsSection from '../components/CommentsSection';
import RecommendationEngine from '../components/RecommendationEngine';
import RefactoredSaveToPlaylistModal from '../components/RefactoredSaveToPlaylistModal';
import RefactoredVideoDescription from '../components/RefactoredVideoDescription';
import RefactoredVideoPlayer from '../components/RefactoredVideoPlayer';
import StandardPageLayout from '../components/StandardPageLayout';
import VideoActions from '../components/VideoActions';
import { useWatchLater } from '../contexts/WatchLaterContext';
// Removed unused useAuth import

// Removed unused ReusableVideoGrid import
// Removed unused LoadingSpinner import
import type { Comment, CommentsSectionProps } from '../components/CommentsSection';
import type { Video, Playlist, PlaylistVisibility } from '../src/types/core';


// Removed unused useWatchPage import
// Removed unused useRefactoredHooks import

// Removed unused Playlist interface

// Removed unused LocalVideo interface

// Mock data for initial rendering
const mockVideo: Video = {
  id: '1',
  createdAt: '2023-05-15T12:00:00Z',
  updatedAt: '2023-05-15T12:00:00Z',
  title: 'Sample Video',
  description: 'This is a sample video description.',
  thumbnailUrl: 'https://via.placeholder.com/1280x720',
  videoUrl: 'https://example.com/video.mp4',
  duration: '10:30',
  views: '1,234,567',
  likes: 12345,
  dislikes: 123,
  uploadedAt: '2023-05-15T12:00:00Z',
  publishedAt: '2023-05-15T12:00:00Z',
  channelName: 'Sample Channel',
  channelId: '1',
  channelAvatarUrl: 'https://via.placeholder.com/48',
  channel: {
    id: '1',
    name: 'Sample Channel',
    avatarUrl: 'https://via.placeholder.com/48',
    subscribers: 1200000,
    isVerified: true,
  },
  category: 'Entertainment',
  tags: ['sample', 'video', 'entertainment'],
  visibility: 'public' as const,
  commentCount: 150,
  isLive: false,
  isShort: false,
};

interface RefactoredWatchPageProps {
  video?: Video;
  error?: Error | null;
  loading?: boolean;
  handleLike?: (videoId: string) => Promise<void>;
  handleDislike?: (videoId: string) => Promise<void>;
  handleSubscribe?: (channelId: string) => Promise<void>;
  handleShare?: (videoId: string) => void;
  handleAddToWatchLater?: (video: Video) => Promise<void>;
  handleSaveToPlaylist?: (videoId: string, playlistId: string) => Promise<void>;
  // Removed unused comment-related props from interface
}

const RefactoredWatchPage: React.FC<RefactoredWatchPageProps> = ({
  video: propVideo = mockVideo,
  error: propError = null,
  loading: propLoading = false,
  handleLike: propHandleLike = async (_videoId: string) => {},
  handleDislike: propHandleDislike = async (_videoId: string) => {},
  handleSubscribe: propHandleSubscribe = async (_channelId: string) => {},
  handleShare = (_videoId: string) => {},
  // Removed duplicate handleAddToWatchLater
  // Removed unused handleSaveToPlaylist
  // Removed unused props: handleCreatePlaylist, handleSummarizeDescription, handleToggleDescription, handleMainCommentSubmit, handleReplySubmit
  // Removed unused handleEditSave prop
  // Removed unused comment-related props
}) => {
  const [liked] = useState<boolean>(false);
  const [disliked] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSavedToAnyList, setIsSavedToAnyList] = useState(false);
  // Removed unused openSaveModal state

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [summary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [commentSortOrder, setCommentSortOrder] = useState<'newest' | 'top'>('top');
  const [activeCommentMenu, setActiveCommentMenu] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);

  // Add missing closeSaveModal function
  // Removed unused closeSaveModal function


  // Get data from hooks
  // Removed unused miniplayer destructuring

  // Local state for video page
  const [videoState, setVideoState] = useState(propVideo || mockVideo);
  const [isLoading, setIsLoading] = useState(false);
  const [comments] = useState<Comment[]>([]);
  const [currentReplyText, setCurrentReplyText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<{ id: string; parentId?: string } | null>(null);

  // Watch later hook
  const { addToWatchLater } = useWatchLater();

  // Removed unused closeSaveModal function

  // Mock channel data
  const channel = {
    id: propVideo?.channelId || '1',
    name: propVideo?.channelName || 'Sample Channel',
    avatarUrl: propVideo?.channelAvatarUrl || 'https://via.placeholder.com/48',
    subscriberCount: '1.2M',
    isVerified: true,
  };

  // Sync props with state
  useEffect(() => {
    if (propVideo) {
      const updatedVideo = {
        ...propVideo,
        viewCount: typeof propVideo.views === 'string' ? parseInt(propVideo.views, 10) || 0 : propVideo.viewCount || 0,
        createdAt: propVideo.createdAt || new Date().toISOString(),
        updatedAt: propVideo.updatedAt || new Date().toISOString(),
      };
      setVideoState(updatedVideo);
      // TODO: Handle like/dislike state from video props
      setIsSubscribed(false); // Default value as property doesn't exist on Video type
      setIsSavedToAnyList(false); // Default value as property doesn't exist on Video type
    }
    setIsLoading(propLoading);
    // setError(propError); // Removed as setError is not defined
  }, [propVideo, propLoading, propError]);

  // Handle video like
  const handleLike = useCallback(async () => {
    if (!videoState?.id) {
return;
}
    try {
      await propHandleLike(videoState.id);
      // TODO: Update UI state when like functionality is implemented
    } catch (err) {
      setActionError('Failed to like video');
    }
  }, [propHandleLike, videoState?.id]);

  // Handle video dislike
  const handleDislike = useCallback(async () => {
    if (!videoState?.id) {
return;
}
    try {
      await propHandleDislike(videoState.id);
      // TODO: Update UI state when dislike functionality is implemented
    } catch (actionErr) {
      setActionError('Failed to dislike video');
    }
  }, [propHandleDislike, videoState?.id]);

  // Handle channel subscription
  const handleSubscribe = useCallback(async () => {
    if (!videoState?.channel?.id) {
return;
}
    try {
      await propHandleSubscribe(videoState.channel.id);
      setIsSubscribed(true);
    } catch (err) {
      setActionError('Failed to subscribe to channel');
    }
  }, [propHandleSubscribe, videoState?.channel?.id]);

  // Handle adding video to watch later
  const handleAddToWatchLater = useCallback(async () => {
    if (!videoState) {
return;
}
    try {
      await addToWatchLater(videoState);
      // TODO: Update UI state when save functionality is implemented
    } catch (err) {
      setActionError('Failed to add to watch later');
    }
  }, [addToWatchLater, videoState]);

  // Removed unused handleSaveToPlaylist function

  // Handle creating new playlist - removed as unused

  // State variables already declared above - removing duplicate declarations

  // UI state (some variables already declared above)

  // Comment state (already declared above)

  // Playlist state - removed unused selectedPlaylistId

  // Loading and error states (already declared above)

  // Update state when props change
  useEffect(() => {
    if (propVideo) {
      setVideoState(propVideo);
      // TODO: Initialize proper state from video props
      setIsSubscribed(false); // TODO: Add proper subscribed state from video
    }
    setIsLoading(propLoading || false);
  }, [propVideo, propLoading, propError]);


  // Handler functions already declared above - removing duplicates

  // Handle create playlist
  const handleCreatePlaylist = useCallback(async (name: string, description?: string): Promise<Playlist> => {
    try {
      // TODO: Implement playlist creation functionality
      console.log('Creating playlist:', name, description);
      // Return a mock playlist for now
      return {
        id: `playlist-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: name,
        description: description || '',
        videoCount: 0,
        totalDuration: '0:00',
        visibility: 'private' as PlaylistVisibility,
        ownerId: 'current-user',
        ownerName: 'Current User',
        videos: [],
        tags: [],
      } as Playlist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  }, []);


  // Toggle like/dislike functionality removed as unused

  // Handle summarize description
  const handleSummarize = useCallback(async () => {
    if (!videoState?.id) {
return;
}

    try {
      setIsSummarizing(true);
      // TODO: Implement description summarization functionality
      console.log('Summarizing description for video:', videoState.id);
    } catch (error) {
      console.error('Error summarizing description:', error);
      setSummaryError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSummarizing(false);
    }
  }, [videoState?.id]);

  // Handler functions with fallbacks to props or default implementations
  // handleLike already declared above - removing duplicate

  // handleSubscribe and handleAddToWatchLater already declared above - removing duplicates

  // Enhanced save to playlist handler that integrates with Watch Later context
  const enhancedHandleSaveToPlaylist = useCallback(async (_videoId: string, playlistId: string) => {
    try {
      // Call the original handler if it exists
      // TODO: Implement save to playlist functionality
      console.log('Saving to playlist:', playlistId);

      // If saving to Watch Later, also add to Watch Later context
      if (playlistId === 'playlist-1' && videoState) {
        const now = new Date().toISOString();
        const coreVideo: Video = {
          id: videoState.id,
          title: videoState.title || 'Untitled Video',
          description: videoState.description || '',
          thumbnailUrl: videoState.thumbnailUrl || '',
          videoUrl: videoState.videoUrl || '',
          duration: videoState.duration || '0:00',
          views: videoState.views || '0',
          likes: mockVideo.likes || 0,
          dislikes: mockVideo.dislikes || 0,
          uploadedAt: videoState.uploadedAt || videoState.createdAt || new Date().toISOString(),
          publishedAt: videoState.publishedAt || videoState.createdAt || new Date().toISOString(),
          channelName: videoState.channelName || 'Unknown Channel',
          channelId: videoState.channelId || '',
          channelAvatarUrl: videoState.channelAvatarUrl || '',
          channel: {
            id: videoState.channelId || '',
            name: videoState.channelName || 'Unknown Channel',
            avatarUrl: videoState.channelAvatarUrl || '',
            subscribers: 0,
            isVerified: false,
          },
          category: videoState.category || 'Entertainment',
          tags: mockVideo.tags || [],
          visibility: mockVideo.visibility || 'public',
          commentCount: mockVideo.commentCount || 0,
          isLive: videoState.isLive || false,
          // Removed isUpcoming and isPremiere as they don't exist on Video type
          isShort: videoState.isShort || false,
          createdAt: now,
          updatedAt: now,
        };

        if (addToWatchLater) {
          await addToWatchLater(coreVideo);
        }
      }

      // Close the modal
      setIsSaveModalOpen(false);
    } catch (error) {
      console.error('Error saving to playlist:', error);
      setActionError(error instanceof Error ? error.message : 'Error saving to playlist');
    }
  }, [videoState, addToWatchLater]);


  const handleDeleteComment = useCallback((commentId: string) => {
    console.log('Deleting comment:', commentId);
  }, []);

  const handleMainCommentSubmitCallback = useCallback((commentText: string) => {
    console.log('Submitting main comment:', commentText);
  }, []);

  const handleReplySubmit = useCallback((commentId: string, replyText: string) => {
    console.log('Submitting reply:', commentId, replyText);
  }, []);

  const handleEditSave = useCallback((commentId: string, newText: string) => {
    console.log('Editing comment:', commentId, newText);
  }, []);

  const handleToggleDescription = useCallback(() => {
    setShowFullDescription(!showFullDescription);
  }, [showFullDescription]);

  // Enhanced action handlers with error handling
  const handleEnhancedLike = useCallback(() => {
    try {
      handleLike();
    } catch (err) {
      console.error('Error liking video:', err);
      setActionError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [handleLike]);

  const handleEnhancedSubscribe = useCallback(() => {
    try {
      handleSubscribe();
    } catch (err) {
      console.error('Error subscribing to channel:', err);
      setActionError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [handleSubscribe]);

  const handleEnhancedShare = useCallback(() => {
    try {
      if (videoState?.id) {
        handleShare(videoState.id);
      }
    } catch (err) {
      console.error('Error sharing video:', err);
      setActionError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [handleShare, videoState?.id]);

  const handleEnhancedDislike = useCallback(() => {
    try {
      handleDislike();
    } catch (err) {
      console.error('Error disliking video:', err);
      setActionError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [handleDislike]);

  // Video player configuration
  const videoPlayerProps = {
    video: videoState,
    autoplay: true,
    muted: false,
    onTimeUpdate: (_currentTime: number) => {
      // Handle time update
    },
    onEnded: () => {
      // Handle video end
    },
    onError: (error: string) => {
      console.error('Video player error:', error);
      setActionError(error);
    },
  };

  // Video actions configuration
  const videoActionsProps = {
    liked,
    disliked,
    isSubscribed,
    isSavedToAnyList,
    likeCount: videoState?.likes || 0,
    dislikeCount: videoState?.dislikes || 0,
    commentCount: videoState?.commentCount || 0,
    viewCount: videoState?.viewCount || 0,
    onLike: handleEnhancedLike,
    onDislike: handleEnhancedDislike,
    onSubscribe: handleEnhancedSubscribe,
    onShare: handleEnhancedShare,
    onSave: () => setIsSaveModalOpen(true),
    onAddToWatchLater: handleAddToWatchLater,
    onComment: () => {
      // Handle comment action
    },
    onMore: () => {
      // Handle more options
    },
  };


  // Video description configuration
  const videoDescriptionProps = {
    video: videoState,
    channel,
    showFullDescription,
    ...(summary && { summary }),
    ...(summaryError && { summaryError }),
    isSummarizing,
    canSummarize: true,
    onToggleDescription: handleToggleDescription,
    onSummarizeDescription: handleSummarize,
    onSubscribe: handleEnhancedSubscribe,
    isSubscribed,
  };

  // Comments section configuration
  const commentsSectionProps: CommentsSectionProps = videoState ? {
    comments: comments || [],
    commentCount: (comments || []).length,
    commentSortOrder,
    replyingToCommentId: replyingToCommentId || null,
    currentReplyText: currentReplyText || '',
    editingComment: editingComment || null,
    activeCommentMenu: activeCommentMenu || null,
    expandedReplies: Array.from(expandedReplies).reduce((acc, id) => ({ ...acc, [id]: true }), {} as Record<string, boolean>),
    maxCommentLength: 500,
    onCommentSubmit: handleMainCommentSubmitCallback,
    onReplySubmit: (parentId: string) => handleReplySubmit(parentId, currentReplyText),
    onEditSave: handleEditSave,
    onDeleteComment: handleDeleteComment,
    onToggleLikeDislike: (_id: string, _parentId: string | undefined, _action: 'like' | 'dislike') => {}, // TODO: Implement comment like/dislike functionality
    onSortChange: setCommentSortOrder,
    onSetReplyingTo: (id: string | null, _text?: string) => setReplyingToCommentId(id),
    onSetCurrentReplyText: setCurrentReplyText,
    onSetEditingComment: setEditingComment,
    onSetActiveCommentMenu: setActiveCommentMenu,
    onSetExpandedReplies: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => {
      const currentRecord: Record<string, boolean> = {};
      expandedReplies.forEach(id => {
        currentRecord[id] = true;
      });
      const newRecord = updater(currentRecord);
      const newSet = new Set(Object.keys(newRecord).filter(key => newRecord[key]));
      setExpandedReplies(newSet);
    },
  } : {
    comments: [],
    commentCount: 0,
    commentSortOrder: 'top' as const,
    replyingToCommentId: null,
    currentReplyText: '',
    editingComment: null,
    activeCommentMenu: null,
    expandedReplies: {},
    maxCommentLength: 500,
    onCommentSubmit: (_commentText: string) => {},
    onReplySubmit: (_parentId: string) => {},
    onEditSave: (_commentId: string, _newText: string, _parentId?: string) => {},
    onDeleteComment: (_commentId: string, _parentId?: string) => {},
    onToggleLikeDislike: (_id: string, _parentId: string | undefined, _action: 'like' | 'dislike') => {},
    onSortChange: (_order: 'top' | 'newest') => {},
    onSetReplyingTo: (_commentId: string | null, _text?: string) => {},
    onSetCurrentReplyText: (_text: string) => {},
    onSetEditingComment: (_comment: { id: string; parentId?: string } | null) => {},
    onSetActiveCommentMenu: (_commentId: string | null) => {},
    onSetExpandedReplies: (_updater: (prev: Record<string, boolean>) => Record<string, boolean>) => {},
  };


  // Save to playlist modal props
  const saveToPlaylistModalProps = {
    isOpen: isSaveModalOpen,
    onClose: () => {
      setIsSaveModalOpen(false);
    },
    videoId: videoState?.id || '',
    existingPlaylists: [],
    onSaveToPlaylist: enhancedHandleSaveToPlaylist,
    onCreatePlaylist: handleCreatePlaylist,
  };

  if (isLoading) {
    return (
      <StandardPageLayout>
        <div className="flex justify-center items-center h-64">
          <p>Loading video...</p>
        </div>
      </StandardPageLayout>
    );
  }

  if (propError) {
    return (
      <StandardPageLayout>
        <div className="p-4 text-red-600 dark:text-red-400">
          {propError.message}
        </div>
      </StandardPageLayout>
    );
  }

  if (!videoState) {
    return (
      <StandardPageLayout>
        <div className="p-4">
          <p>Video not found</p>
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1">
          {/* Video player */}
          <div className="mb-6">
            <RefactoredVideoPlayer {...videoPlayerProps} />
          </div>

          {/* Video info */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{videoState.title}</h1>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
              <span>{videoState.views} views</span>
              <span className="mx-2">•</span>
              <span>{new Date(videoState.uploadedAt || '').toLocaleDateString()}</span>
            </div>
          </div>

          {/* Video actions */}
          <div className="mb-6">
            <VideoActions {...videoActionsProps} />
          </div>

          {/* Video description */}
          <div className="mb-6">
            <RefactoredVideoDescription {...videoDescriptionProps} />
          </div>

          {/* Comments section */}
          <div id="comments-section" className="mb-6">
            <CommentsSection {...commentsSectionProps} />
          </div>
        </div>

        {/* Sidebar - Recommendations */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <RecommendationEngine
            currentVideoId={videoState.id}
            onVideoSelect={(_videoId: string) => {
              // Handle video selection
              }}
          />
        </div>
      </div>

      {/* Save to playlist modal */}
      <RefactoredSaveToPlaylistModal {...saveToPlaylistModalProps} />

      {/* Error message */}
      {actionError && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg">
          <p className="text-red-600 dark:text-red-400">{actionError}</p>
        </div>
      )}
    </StandardPageLayout>
  );
};

export default RefactoredWatchPage;