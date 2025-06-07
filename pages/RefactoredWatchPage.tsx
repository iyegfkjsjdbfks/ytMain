import React, { useState, useEffect, useCallback, useRef   } from 'react';
import { useParams } from 'react-router-dom';
import { useWatchLater } from '../contexts/WatchLaterContext';
// import { useMiniplayer } from '../contexts/MiniplayerContext'; // Unused
import StandardPageLayout from '../components/StandardPageLayout';
import RefactoredVideoPlayer from '../components/RefactoredVideoPlayer';
import RefactoredVideoDescription from '../components/RefactoredVideoDescription';
import CommentsSection from '../components/CommentsSection';
import RefactoredSaveToPlaylistModal from '../components/RefactoredSaveToPlaylistModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Video, Comment } from '../src/types/core';
import VideoActions from '../components/VideoActions';
import RecommendationEngine from '../components/RecommendationEngine';

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
  handleLike: propHandleLike = async () => {},
  handleDislike: propHandleDislike = async () => {},
  handleSubscribe: propHandleSubscribe = async () => {},
  handleShare = () => {},
  // Removed duplicate handleAddToWatchLater
  // Removed unused handleSaveToPlaylist
  // Removed unused props: handleCreatePlaylist, handleSummarizeDescription, handleToggleDescription, handleMainCommentSubmit, handleReplySubmit
  // Removed unused handleEditSave prop
  // Removed unused comment-related props
}) => {
  const { useState, useCallback } = React;
  // Removed unused isSummaryLoading state
  const [summary] = useState<string>('');
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [liked] = useState<boolean>(false);
  const [disliked] = useState<boolean>(false);
  // Removed unused isLiked and isDisliked state variables
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isSavedToAnyList, setIsSavedToAnyList] = useState<boolean>(false);
  // Removed unused isSaved state variable
  const [showFullDescription, setShowFullDescription] = useState<boolean>(false);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [comments] = useState<Comment[]>([]);
  const [commentSortOrder, setCommentSortOrder] = useState<'newest' | 'top'>('top');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [currentReplyText, setCurrentReplyText] = useState<string>('');
  const [editingComment, setEditingComment] = useState<{ id: string; text: string } | null>(null);
  const [activeCommentMenu, setActiveCommentMenu] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [videoState, setVideoState] = useState<Video | null>(propVideo);
  const [errorState, setErrorState] = useState<Error | null>(propError);
  const [isLoading, setIsLoading] = useState<boolean>(propLoading);

  // Miniplayer hook - unused
  // const { showMiniplayer } = useMiniplayer();

  // Watch later hook
  const { addToWatchLater } = useWatchLater();

  // Removed unused closeSaveModal function

  // Mock channel data
  const channel = {
    id: propVideo?.channelId || '1',
    name: propVideo?.channelName || 'Sample Channel',
    avatarUrl: propVideo?.channelAvatarUrl || 'https://via.placeholder.com/48',
    subscribers: 1200000,
    isVerified: true,
  };

  // Sync props with state
  useEffect(() => {
    if (propVideo) {
      const updatedVideo = {
        ...propVideo,
        viewCount: typeof propVideo.views === 'string' ? parseInt(propVideo.views) || 0 : propVideo.viewCount || 0
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
    if (!videoState?.id) return;
    try {
      await propHandleLike(videoState.id);
      // TODO: Update UI state when like functionality is implemented
    } catch (err) {
      setActionError('Failed to like video');
    }
  }, [propHandleLike, videoState?.id]);

  // Handle video dislike
  const handleDislike = useCallback(async () => {
    if (!videoState?.id) return;
    try {
      await propHandleDislike(videoState.id);
      // TODO: Update UI state when dislike functionality is implemented
    } catch (err) {
      setActionError('Failed to dislike video');
    }
  }, [propHandleDislike, videoState?.id]);

  // Handle channel subscription
  const handleSubscribe = useCallback(async () => {
    if (!videoState?.channel?.id) return;
    try {
      await propHandleSubscribe(videoState.channel.id);
      setIsSubscribed(true);
    } catch (err) {
      setActionError('Failed to subscribe to channel');
    }
  }, [propHandleSubscribe, videoState?.channel?.id]);

  // Handle adding video to watch later
  const handleAddToWatchLater = useCallback(async () => {
    if (!videoState) return;
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
    setErrorState(propError);
  }, [propVideo, propLoading, propError]);
  

  
  // Handler functions already declared above - removing duplicates
  
  // Handle create playlist
  const handleCreatePlaylist = useCallback(async (name: string, isPrivate: boolean) => {
    try {
      // TODO: Implement playlist creation functionality
      console.log('Creating playlist:', name, isPrivate);
    } catch (error) {
      console.error('Error creating playlist:', error);
      // Handle error appropriately
    }
  }, []);
  



  

  
  // Toggle like/dislike functionality removed as unused
  
  // Handle summarize description
  const handleSummarize = useCallback(async () => {
    if (!videoState?.id) return;
    
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
  const enhancedHandleSaveToPlaylist = useCallback(async (playlistId: string) => {
    try {
      // Call the original handler if it exists
      // TODO: Implement save to playlist functionality
      console.log('Saving to playlist:', playlistId);

      // If saving to Watch Later, also add to Watch Later context
      if (playlistId === 'playlist-1' && videoState) {
        const now = new Date().toISOString();
        const coreVideo: Video = {
          ...videoState,
          id: videoState.id,
          title: videoState.title || 'Untitled Video',
          description: videoState.description || '',
          views: videoState.views || '0',
          uploadedAt: videoState.uploadedAt || now,
          thumbnailUrl: videoState.thumbnailUrl || '',
          videoUrl: videoState.videoUrl || '',
          channelId: videoState.channelId || 'unknown-channel',
          channelName: videoState.channelName || 'Unknown Channel',
          channelAvatarUrl: videoState.channelAvatarUrl || '',
          duration: videoState.duration || '0:00',
          category: videoState.category || 'Other',
          likes: 0,
          dislikes: 0,
          tags: [],
          visibility: 'public',
          commentCount: 0,
          viewCount: 0,
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
  }, [videoState, propHandleSaveToPlaylist, addToWatchLater]);



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
    video: videoState!,
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
    video: videoState!,
    channel: channel!,
    showFullDescription,
    summary: summary || undefined,
    summaryError: summaryError,
    isSummarizing,
    onToggleDescription: handleToggleDescription,
    onSummarize: handleSummarize,
    onSubscribe: handleEnhancedSubscribe,
    isSubscribed,
  };

  // Comments section configuration
  const commentsSectionProps = videoState ? {
    comments: comments || [],
    commentCount: (comments || []).length,
    commentSortOrder: commentSortOrder,
    replyingToCommentId: replyingToCommentId || null,
    currentReplyText: currentReplyText || '',
    editingComment: editingComment || null,
    activeCommentMenu: activeCommentMenu || null,
    expandedReplies,
    maxCommentLength: 500,
    onCommentSubmit: handleMainCommentSubmitCallback,
    onReplySubmit: handleReplySubmit,
    onEditSave: handleEditSave,
    onDeleteComment: handleDeleteComment,
    onToggleLikeDislike: () => {}, // TODO: Implement comment like/dislike functionality
    onSortChange: setCommentSortOrder,
    onSetReplyingTo: setReplyingToCommentId as (id: string | null, text?: string) => void,
    onSetCurrentReplyText: setCurrentReplyText,
    onSetEditingComment: setEditingComment as (comment: { id: string; parentId?: string } | null) => void,
    onSetActiveCommentMenu: setActiveCommentMenu as (id: string | null) => void,
    onSetExpandedReplies: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => {
      setExpandedReplies(updater);
    },
    playerSettings: {
      isFullscreen: false,
      showCaptions: true,
      captions: videoState.captions?.map((caption: any) => ({
        id: caption.id,
        language: {
          code: caption.language.code,
          name: caption.language.name,
        },
        label: caption.label,
        url: caption.url,
        isAutoGenerated: caption.isAutoGenerated || false,
      })) || [],
      currentCaption: null,
      onCaptionChange: () => {},
      onPlaybackRateChange: () => {},
      onVolumeChange: () => {},
      onToggleMute: () => {},
      onToggleTheaterMode: () => {},
      onToggleMiniPlayer: () => {},
      onToggleFullscreen: () => {},
      onTimeUpdate: () => {
        // Handle time update
      },
      onEnded: () => {
        // Handle video end
      },
      onError: (error: string) => {
        console.error('Video player error:', error);
        setActionError(error);
      }
    }
  } : null;



  // Save to playlist modal props
  const saveToPlaylistModalProps = {
    isOpen: isSaveModalOpen,
    onClose: () => {
      setIsSaveModalOpen(false);
    },
    onSave: enhancedHandleSaveToPlaylist,
    playlists: [], // Empty array as we don't have mock playlists
    selectedPlaylistId: '',
    onSelectPlaylist: () => {},
    onCreatePlaylist: handleCreatePlaylist,
    videoId: videoState?.id || '',
    existingPlaylists: [],
    onSaveToPlaylist: enhancedHandleSaveToPlaylist
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
  
  if (errorState) {
    return (
      <StandardPageLayout>
        <div className="p-4 text-red-600 dark:text-red-400">
          {errorState.message}
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
            onVideoSelect={(videoId: string) => {
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