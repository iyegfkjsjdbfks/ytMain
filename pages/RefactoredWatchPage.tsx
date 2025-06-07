import React, { useState, useEffect, useCallback, useRef   } from 'react';
import { useParams } from 'react-router-dom';
import { useWatchLater } from '../contexts/WatchLaterContext';
import { useMiniplayer } from '../contexts/MiniplayerContext';
import StandardPageLayout from '../components/StandardPageLayout';
import RefactoredVideoPlayer from '../components/RefactoredVideoPlayer';
import RefactoredVideoDescription from '../components/RefactoredVideoDescription';
import CommentsSection from '../components/CommentsSection';
import RefactoredSaveToPlaylistModal from '../components/RefactoredSaveToPlaylistModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Video, Channel, Comment } from '../src/types/core';
import VideoActions from '../components/VideoActions';
import RecommendationEngine from '../components/RecommendationEngine';

// Define interfaces for our data structures
interface Playlist {
  id: string;
  title: string;
  videoCount: number;
  thumbnail: string;
}

// Use a local interface that extends the core Video type
interface LocalVideo extends Video {
  timestamp: string;
  isSubscribed?: boolean;
  isSavedToAnyList?: boolean;
  recommendations?: Video[];
}

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
  handleCreatePlaylist?: (name: string, videoId: string) => Promise<void>;
  handleSummarizeDescription?: (videoId: string) => Promise<string>;
  handleToggleDescription?: () => void;
  handleMainCommentSubmit?: (videoId: string, text: string) => Promise<Comment>;
  handleReplySubmit?: (commentId: string, text: string) => Promise<Comment>;
  handleEditSave?: (commentId: string, text: string) => Promise<void>;
  handleDeleteComment?: (commentId: string) => Promise<void>;
  toggleLikeDislikeForCommentOrReply?: (commentId: string, isLike: boolean) => Promise<void>;
}

const RefactoredWatchPage: React.FC<RefactoredWatchPageProps> = ({
  video: propVideo = mockVideo,
  error: propError = null,
  loading: propLoading = false,
  handleLike: propHandleLike = async () => {},
  handleDislike: propHandleDislike = async () => {},
  handleSubscribe: propHandleSubscribe = async () => {},
  handleShare = () => {},
  handleAddToWatchLater: propHandleAddToWatchLater = async () => {},
  handleSaveToPlaylist: propHandleSaveToPlaylist = async () => {},
  handleCreatePlaylist: propHandleCreatePlaylist = async () => {},
  handleSummarizeDescription: propHandleSummarizeDescription = async () => '',
  handleToggleDescription: propHandleToggleDescription = () => {},
  handleMainCommentSubmit: propHandleMainCommentSubmit = async () => ({} as Comment),
  handleReplySubmit: propHandleReplySubmit = async () => ({} as Comment),
  handleEditSave: propHandleEditSave = async () => {},
  handleDeleteComment: propHandleDeleteComment = async () => {},
  toggleLikeDislikeForCommentOrReply: propToggleLikeDislikeForCommentOrReply = async () => {},
}) => {
  const { useState, useCallback } = React;
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>('');
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [liked, setLiked] = useState<boolean>(false);
  const [disliked, setDisliked] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isSavedToAnyList, setIsSavedToAnyList] = useState<boolean>(false);
  const [showFullDescription, setShowFullDescription] = useState<boolean>(false);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentSortOrder, setCommentSortOrder] = useState<'newest' | 'top'>('top');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [currentReplyText, setCurrentReplyText] = useState<string>('');
  const [editingComment, setEditingComment] = useState<{ id: string; text: string } | null>(null);
  const [activeCommentMenu, setActiveCommentMenu] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [videoState, setVideoState] = useState<Video | null>(propVideo);
  const [errorState, setErrorState] = useState<Error | null>(propError);
  const [loadingState, setLoadingState] = useState<boolean>(propLoading);

  // Miniplayer hook
  const { showMiniplayer } = useMiniplayer();

  // Watch later hook
  const { addToWatchLater } = useWatchLater();

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
      setVideoState(propVideo);
      setIsLiked(propVideo.isLiked || false);
      setIsDisliked(propVideo.isDisliked || false);
      setIsSubscribed(propVideo.isSubscribed || false);
      setIsSaved(propVideo.isSavedToAnyList || false);
    }
    setIsLoading(propLoading);
    setErrorState(propError);
  }, [propVideo, propLoading, propError]);

  // Handle video like
  const handleLike = useCallback(async () => {
    try {
      await propHandleLike(videoState.id);
      setIsLiked(true);
      setIsDisliked(false);
    } catch (err) {
      setActionError('Failed to like video');
    }
  }, [propHandleLike, videoState.id]);

  // Handle video dislike
  const handleDislike = useCallback(async () => {
    try {
      await propHandleDislike(videoState.id);
      setIsDisliked(true);
      setIsLiked(false);
    } catch (err) {
      setActionError('Failed to dislike video');
    }
  }, [propHandleDislike, videoState.id]);

  // Handle channel subscription
  const handleSubscribe = useCallback(async () => {
    try {
      await propHandleSubscribe(videoState.channel.id);
      setIsSubscribed(true);
    } catch (err) {
      setActionError('Failed to subscribe to channel');
    }
  }, [propHandleSubscribe, videoState.channel.id]);

  // Handle adding video to watch later
  const handleAddToWatchLater = useCallback(async () => {
    try {
      await addToWatchLater(videoState);
      setIsSaved(true);
    } catch (err) {
      setActionError('Failed to add to watch later');
    }
  }, [addToWatchLater, videoState]);

  // Handle saving to playlist
  const handleSaveToPlaylist = useCallback(async (playlistId: string) => {
    try {
      await propHandleSaveToPlaylist(videoState.id, playlistId);
      setIsSaveModalOpen(false);
    } catch (err) {
      setActionError('Failed to save to playlist');
    }
  }, [propHandleSaveToPlaylist, videoState.id]);

  // Handle creating new playlist
  const handleCreateNewPlaylist = useCallback(async (name: string) => {
    try {
      await propHandleCreatePlaylist(name, videoState.id);
      setIsSaveModalOpen(false);
    } catch (err) {
      setActionError('Failed to create playlist');
    }
  }, [propHandleCreatePlaylist, videoState.id]);
  
  // Initialize state with proper types
  const [videoState, setVideoState] = useState<Video>(propVideo || mockVideo);
  const [isLoading, setIsLoading] = useState(propLoading || false);
  const [errorState, setErrorState] = useState<Error | null>(propError || null);
  
  // Video interaction state
  const [isLiked, setIsLiked] = useState(propVideo?.isLiked ?? false);
  const [isDisliked, setIsDisliked] = useState(propVideo?.isDisliked ?? false);
  const [isSubscribed, setIsSubscribed] = useState(propVideo?.isSubscribed ?? false);
  const [isSaved, setIsSaved] = useState(propVideo?.isSavedToAnyList ?? false);
  
  // UI state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [commentSortOrder, setCommentSortOrder] = useState<'top' | 'newest'>('top');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  // Comment state (already declared above)
  
  // Playlist state
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [playlistsError, setPlaylistsError] = useState<string | null>(null);
  
  // Loading and error states
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  
  // Watch later hook
  const { addToWatchLater } = useWatchLater();
  
  // Update state when props change
  useEffect(() => {
    if (propVideo) {
      setVideoState(propVideo);
      setIsLiked(propVideo.isLiked ?? false);
      setIsDisliked(propVideo.isDisliked ?? false);
      setIsSubscribed(propVideo.isSubscribed ?? false);
      setIsSaved(propVideo.isSavedToAnyList ?? false);
    }
    setIsLoading(propLoading || false);
    setErrorState(propError);
  }, [propVideo, propLoading, propError]);
  

  
  // Handle add to watch later
  const handleAddToWatchLater = useCallback(async () => {
    if (!video?.id) return;
    
    try {
      await addToWatchLater(video);
      setIsSaved(true);
    } catch (err) {
      setActionError('Failed to add to watch later');
      console.error('Error adding to watch later:', err);
    }
  }, [video, addToWatchLater]);
  
  // Handle saving to a specific playlist
  const handleSaveToPlaylist = useCallback(async (playlistId: string) => {
    if (!video?.id) return;
    
    try {
      const videoToAdd: Video = {
        id: video.id,
        createdAt: video.createdAt || new Date().toISOString(),
        updatedAt: video.updatedAt || new Date().toISOString(),
        title: video.title || 'Untitled Video',
        description: video.description || '',
        duration: video.duration || '0:00',
        thumbnailUrl: video.thumbnailUrl || '',
        videoUrl: video.videoUrl || '',
        views: video.views || '0',
        likes: video.likes || 0,
        dislikes: video.dislikes || 0,
        channelName: video.channelName || 'Unknown Channel',
        channelAvatarUrl: video.channelAvatarUrl || '',
        uploadedAt: video.uploadedAt || new Date().toISOString(),
        channelId: video.channelId || 'unknown-channel',
        category: video.category || 'Entertainment',
        tags: video.tags || [],
        visibility: video.visibility || 'public',
        commentCount: video.commentCount || 0,
        viewCount: video.viewCount || 0
      };
      
      if (propHandleAddToWatchLater) {
        await propHandleAddToWatchLater(videoToAdd);
      } else if (addToWatchLater) {
        await addToWatchLater(videoToAdd);
      }
    } catch (err) {
      console.error('Error adding to watch later:', err);
      // Handle error appropriately
    }
  }, [video, propHandleAddToWatchLater, addToWatchLater]);
  
  // Handle save to playlist
  const handleSaveToPlaylist = useCallback(async (playlistId: string) => {
    try {
      if (propHandleSaveToPlaylist) {
        await propHandleSaveToPlaylist(playlistId);
      }
      setIsSaveModalOpen(false);
    } catch (error) {
      console.error('Error saving to playlist:', error);
      // Handle error appropriately
    }
  }, [propHandleSaveToPlaylist]);
  
  // Handle create playlist
  const handleCreatePlaylist = useCallback(async (name: string, isPrivate: boolean) => {
    try {
      if (propHandleCreatePlaylist) {
        await propHandleCreatePlaylist(name, isPrivate);
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      // Handle error appropriately
    }
  }, [propHandleCreatePlaylist]);
  
  // Handle comment submission
  const handleMainCommentSubmit = useCallback((commentText: string) => {
    if (propHandleMainCommentSubmitCallback) {
      propHandleMainCommentSubmitCallback(commentText);
    }
  }, [propHandleMainCommentSubmitCallback]);
  
  // Handle reply submission
  const handleReply = useCallback((commentId: string, replyText: string) => {
    if (propHandleReplySubmit) {
      propHandleReplySubmit(commentId, replyText);
    }
    setReplyingToCommentId(null);
    setCurrentReplyText('');
  }, [propHandleReplySubmit]);
  
  // Handle edit save
  const handleEdit = useCallback((commentId: string, newText: string) => {
    if (propHandleEditSave) {
      propHandleEditSave(commentId, newText);
    }
    setEditingComment(null);
  }, [propHandleEditSave]);
  
  // Handle delete comment
  const handleDelete = useCallback((commentId: string) => {
    if (propHandleDeleteComment) {
      propHandleDeleteComment(commentId);
    }
  }, [propHandleDeleteComment]);
  
  // Toggle like/dislike for comment or reply
  const toggleLikeDislike = useCallback((commentId: string, action: 'like' | 'dislike') => {
    if (propToggleLikeDislikeForCommentOrReply) {
      propToggleLikeDislikeForCommentOrReply(commentId, action);
    }
  }, [propToggleLikeDislikeForCommentOrReply]);
  
  // Toggle description expansion
  const toggleDescription = useCallback(() => {
    setIsDescriptionExpanded(prev => !prev);
    if (propHandleToggleDescription) {
      propHandleToggleDescription();
    }
  }, [propHandleToggleDescription]);
  
  // Handle summarize description
  const handleSummarize = useCallback(async () => {
    if (!video?.id || !propHandleSummarizeDescription) return;
    
    try {
      setIsSummarizing(true);
      const result = await propHandleSummarizeDescription(video.id);
      setSummary(result);
    } catch (error) {
      console.error('Error summarizing description:', error);
      setSummaryError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSummarizing(false);
    }
  }, [video?.id, propHandleSummarizeDescription]);
  
  // Handler functions with fallbacks to props or default implementations
  const handleLike = useCallback((videoId: string) => {
    if (propHandleLike) {
      propHandleLike(videoId);
    }
  }, [propHandleLike]);
  
  const handleSubscribe = useCallback((channelId: string) => {
    if (propHandleSubscribe) {
      propHandleSubscribe(channelId);
    }
  }, [propHandleSubscribe]);
  
  // ... other handler functions with similar patterns ...
  
  const handleAddToWatchLater = useCallback(async () => {
    if (!videoState?.id) return;
    
    try {
      const videoToAdd: Video = {
        ...videoState,
        title: videoState.title || 'Untitled Video',
        description: videoState.description || '',
        duration: videoState.duration || '0:00',
        thumbnailUrl: videoState.thumbnailUrl || '',
        videoUrl: videoState.videoUrl || '',
        viewCount: videoState.viewCount || 0,
        channelName: videoState.channelName || 'Unknown Channel',
        channelAvatarUrl: videoState.channelAvatarUrl || '',
        uploadedAt: videoState.uploadedAt || new Date().toISOString()
      };
      
      if (propHandleAddToWatchLater) {
        await propHandleAddToWatchLater(videoToAdd);
      } else if (addToWatchLater) {
        await addToWatchLater(videoToAdd);
      }
    } catch (err) {
      console.error('Error adding to watch later:', err);
    }
  }, [videoState, propHandleAddToWatchLater, addToWatchLater]);

  // Enhanced save to playlist handler that integrates with Watch Later context
  const enhancedHandleSaveToPlaylist = useCallback(async (playlistId: string) => {
    try {
      // Call the original handler if it exists
      if (propHandleSaveToPlaylist) {
        await propHandleSaveToPlaylist(videoState?.id || '', playlistId);
      }

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



  // Define missing prop functions
  const propHandleMainCommentSubmitCallback = useCallback((commentText: string) => {
    console.log('Submitting comment:', commentText);
  }, []);





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
  const videoPlayerProps = videoState
    ? {
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
      }
    : null;

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
    sortOrder: commentSortOrder,
    onSortChange: setCommentSortOrder,
    onCommentSubmit: handleMainCommentSubmitCallback,
    onReplySubmit: handleReplySubmit,
    onEditSave: handleEditSave,
    onDelete: handleDeleteComment,
    onLike: (commentId: string) => propToggleLikeDislikeForCommentOrReply(commentId, true),
    onDislike: (commentId: string) => propToggleLikeDislikeForCommentOrReply(commentId, false),
    replyingToCommentId: replyingToCommentId || undefined,
    onSetReplyingToCommentId: setReplyingToCommentId as (id: string | null) => void,
    currentReplyText: currentReplyText || '',
    onCurrentReplyTextChange: setCurrentReplyText,
    editingComment: editingComment || undefined,
    onSetEditingComment: setEditingComment as (comment: { id: string; text: string } | null) => void,
    activeCommentMenu: activeCommentMenu || undefined,
    onSetActiveCommentMenu: setActiveCommentMenu as (id: string | null) => void,
    expandedReplies,
    onToggleReplies: (commentId: string) => {
      setExpandedReplies(prev => ({
        ...prev,
        [commentId]: !prev[commentId]
      }));
    },
    currentUser: {
      id: 'current-user-id',
      name: 'Current User',
      avatarUrl: ''
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