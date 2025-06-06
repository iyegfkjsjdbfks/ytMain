import React, { useState, useCallback, useEffect } from 'react';
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

  // Watch later hook
  const { addToWatchLater } = useWatchLater();

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
  const [error, setError] = useState<Error | null>(propError || null);
  
  // Video interaction state
  const [isLiked, setIsLiked] = useState(propVideo?.isLiked ?? false);
  const [isDisliked, setIsDisliked] = useState(propVideo?.isDisliked ?? false);
  const [isSubscribed, setIsSubscribed] = useState(propVideo?.isSubscribed ?? false);
  const [isSaved, setIsSaved] = useState(propVideo?.isSavedToAnyList ?? false);
  
  // UI state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [commentSortOrder, setCommentSortOrder] = useState<'top' | 'newest'>('top');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  // Comment state
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [currentReplyText, setCurrentReplyText] = useState('');
  const [editingComment, setEditingComment] = useState<{ id: string; text: string } | null>(null);
  const [activeCommentMenu, setActiveCommentMenu] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  
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
    setError(propError || null);
  }, [propVideo, propLoading, propError]);
  
  // Get watch later context
  const { addToWatchLater } = useWatchLater();
  
  // Close save modal function
  const closeSaveModal = useCallback(() => {
    setIsSaveModalOpen(false);
  }, []);
  
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
        title: video.title || 'Untitled Video',
        description: video.description || '',
        duration: video.duration || '0:00',
        thumbnailUrl: video.thumbnailUrl || '',
        videoUrl: video.videoUrl || '',
        viewCount: video.viewCount || 0,
        channelName: video.channelName || 'Unknown Channel',
        channelAvatarUrl: video.channelAvatarUrl || '',
        uploadedAt: video.uploadedAt || new Date().toISOString(),
        channelId: video.channelId || 'unknown-channel',
        status: video.status || 'public',
        ...video
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
      // Handle error appropriately
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
    if (!video?.id) return;
    
    try {
      const videoToAdd: Video = {
        id: video.id,
        title: video.title || 'Untitled Video',
        description: video.description || '',
        duration: video.duration || '0:00',
        thumbnailUrl: video.thumbnailUrl || '',
        videoUrl: video.videoUrl || '',
        viewCount: video.viewCount || 0,
        channelName: video.channelName || 'Unknown Channel',
        channelAvatarUrl: video.channelAvatarUrl || '',
        uploadedAt: video.uploadedAt || new Date().toISOString(),
        ...video
      };
      
      if (propHandleAddToWatchLater) {
        await propHandleAddToWatchLater(videoToAdd);
      } else if (addToWatchLater) {
        await addToWatchLater(videoToAdd);
      }
    } catch (err) {
      console.error('Error adding to watch later:', err);
    }
  }, [video, propHandleAddToWatchLater, addToWatchLater]);

  const { videoId = '' } = useParams<{ videoId: string }>();
  const {
    video = mockVideo,
  } = {}; // TODO: Replace with actual data fetching logic

  // Handle add to watch later
  const handleAddToWatchLater = useCallback(() => {
    if (!video) return;

    const videoToAdd: Video = {
      ...video,
      id: video.id || '',
      title: video.title || 'Untitled',
      description: video.description || '',
      views: video.views || '0',
      uploadedAt: video.uploadedAt || new Date().toISOString(),
      thumbnailUrl: video.thumbnailUrl || '',
      videoUrl: video.videoUrl || '',
      channelId: video.channelId || '',
      channelName: video.channelName || '',
      channelAvatarUrl: video.channelAvatarUrl || '',
      duration: video.duration || '0:00',
      category: video.category || 'Education',
      createdAt: video.createdAt || new Date().toISOString(),
      updatedAt: video.updatedAt || new Date().toISOString(),
    };

    if (video.id) {
      addToWatchLater(videoToAdd);
    }
  }, [video, addToWatchLater]);

  // Enhanced save to playlist handler that integrates with Watch Later context
  const enhancedHandleSaveToPlaylist = useCallback(async (playlistId: string) => {
    try {
      // Call the original handler if it exists
      if (handleSaveToPlaylist) {
        await handleSaveToPlaylist(playlistId);
      }

      // If saving to Watch Later, also add to Watch Later context
      if (playlistId === 'playlist-1' && video) {
        const now = new Date().toISOString();
        const coreVideo: Video = {
          ...video,
          id: video.id,
          title: video.title || 'Untitled Video',
          description: video.description || '',
          views: video.views || '0',
          uploadedAt: video.uploadedAt || now,
          thumbnailUrl: video.thumbnailUrl || '',
          videoUrl: video.videoUrl || '',
          channelId: video.channelId || 'unknown-channel',
          channelName: video.channelName || 'Unknown Channel',
          channelAvatarUrl: video.channelAvatarUrl || '',
          duration: video.duration || '0:00',
          category: video.category || 'Other',
          likes: 0,
          dislikes: 0,
          tags: [],
          visibility: 'public',
          commentCount: 0,
          viewCount: 0,
          createdAt: now,
          updatedAt: now,
          status: 'published',
        };

        if (addToWatchLater) {
          await addToWatchLater(coreVideo);
        }
      }
    } catch (error) {
      console.error('Error saving to playlist:', error);
    }
  }, [video, handleSaveToPlaylist, addToWatchLater]);

  // Handle watch later
  const handleAddToWatchLater = useCallback(async () => {
    if (!video) return;

    const videoToAdd: Video = {
      ...video,
      id: video.id,
      title: video.title,
      description: video.description || '',
      views: video.views || '0',
      uploadedAt: video.uploadedAt || new Date().toISOString(),
      thumbnailUrl: video.thumbnailUrl || '',
      videoUrl: video.videoUrl || '',
      channelId: video.channelId || '',
      channelName: video.channelName || 'Unknown Channel',
      channelAvatarUrl: video.channelAvatarUrl || '',
      duration: video.duration || '0:00',
      category: video.category || 'Other',
      likes: 0,
      dislikes: 0,
      tags: [],
      visibility: 'public',
      createdAt: video.createdAt || new Date().toISOString(),
      updatedAt: video.updatedAt || new Date().toISOString(),
    };

    await addToWatchLater(videoToAdd);
  }, [video, addToWatchLater]);

  // Handle save to playlist
  const handleSaveToPlaylist = useCallback(async (playlistId: string) => {
    try {
      // Implementation for saving to playlist
      console.log(`Saving video to playlist: ${playlistId}`);
      // Close the modal if it exists
      if (closeSaveModal) {
        closeSaveModal();
      }
    } catch (error) {
      console.error('Error saving to playlist:', error);
    }
  }, [closeSaveModal]);

  // Handle miniplayer
  const handleMiniplayer = useCallback(() => {
    if (!video) return;

    const now = new Date().toISOString();
    const videoForMiniplayer: Video = {
      ...video,
      id: video.id,
      title: video.title || 'Untitled Video',
      description: video.description || '',
      views: video.views || '0',
      uploadedAt: video.uploadedAt || now,
      thumbnailUrl: video.thumbnailUrl || '',
      videoUrl: video.videoUrl || '',
      channelId: video.channelId || 'unknown-channel',
      channelName: video.channelName || 'Unknown Channel',
      channelAvatarUrl: video.channelAvatarUrl || '',
      duration: video.duration || '0:00',
      category: video.category || 'Other',
      likes: 0,
      dislikes: 0,
      tags: [],
      visibility: 'public',
      commentCount: 0,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
      status: 'published',
    };

    // Show miniplayer if the function exists
    if (showMiniplayer) {
      showMiniplayer(videoForMiniplayer);
    }
  }, [video, showMiniplayer]);

  // Enhanced action handlers with error handling
  const handleEnhancedLike = useCallback(() => {
    try {
      handleLike();
    } catch (err) {
      console.error('Error liking video:', err);
      setActionError(err as Error);
    }
  }, [handleLike]);

  const handleEnhancedSubscribe = useCallback(() => {
    try {
      handleSubscribe();
    } catch (err) {
      console.error('Error subscribing to channel:', err);
      setActionError(err as Error);
    }
  }, [handleSubscribe]);

  const handleEnhancedShare = useCallback(() => {
    try {
      handleShare();
    } catch (err) {
      console.error('Error sharing video:', err);
      setActionError(err as Error);
    }
  }, [handleShare]);

  const handleEnhancedDislike = useCallback(() => {
    try {
      handleDislike();
    } catch (err) {
      console.error('Error disliking video:', err);
      setActionError(err as Error);
    }
  }, [handleDislike]);

  // Video player configuration
  const videoPlayerProps = video
    ? {
        video: {
          ...video,
          captions: video.captions || [],
          duration: video.duration || '0:00',
          thumbnailUrl: video.thumbnailUrl || '',
          videoUrl: video.videoUrl || '',
        },
        autoPlay: true,
        showControls: true,
        loop: false,
        muted: false,
        volume: 1,
        playbackRate: 1,
        isTheaterMode: false,
        isMiniPlayer: false,
        isFullscreen: false,
        showCaptions: true,
        captions: video?.captions?.map((caption) => ({
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
        onTimeUpdate: (currentTime: number) => {
          // Handle time update
        },
        onEnded: () => {
          // Handle video end
        },
        onError: (error: string) => {
          console.error('Video player error:', error);
          setActionError(new Error(error));
        },
      }
    : null;

  // Video actions configuration
  const videoActionsProps = {
    liked,
    disliked,
    isSubscribed,
    isSavedToAnyList,
    likeCount: video?.likes || 0,
    dislikeCount: video?.dislikes || 0,
    commentCount: video?.commentCount || 0,
    viewCount: video?.viewCount || 0,
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

  // Handle summarize description
  const handleSummarize = useCallback(async () => {
    if (!video?.description) return;

    setIsSummarizing(true);
    setSummaryError(null);

    try {
      const result = await handleSummarizeDescription();
      setSummary(result);
    } catch (err) {
      console.error('Error summarizing description:', err);
      setSummaryError(err as Error);
    } finally {
      setIsSummarizing(false);
    }
  }, [video?.description, handleSummarizeDescription]);

  // Video description configuration
  const videoDescriptionProps = {
    video: video!,
    channel: channel!,
    showFullDescription,
    summary: summary || undefined,
    summaryError: summaryError?.message,
    isSummarizing,
    onToggleDescription: handleToggleDescription,
    onSummarize: handleSummarize,
    onSubscribe: handleEnhancedSubscribe,
    isSubscribed,
  };

  // Comments section configuration
  const commentsSectionProps = video ? {
    comments: comments || [],
    sortOrder: commentSortOrder,
    onSortChange: setCommentSortOrder,
    onCommentSubmit: handleMainCommentSubmitCallback,
    onReplySubmit: handleReplySubmit,
    onEditSave: handleEditSave,
    onDelete: handleDeleteComment,
    onLike: toggleLikeDislikeForCommentOrReply,
    onDislike: toggleLikeDislikeForCommentOrReply,
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
      captions: video.captions?.map((caption) => ({
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
      onTimeUpdate: (currentTime: number) => {
        // Handle time update
      },
      onEnded: () => {
        // Handle video end
      },
      onError: (error: string) => {
        console.error('Video player error:', error);
        setActionError(new Error(error));
      }
    }
  } : null;

  // Video actions configuration
const videoActionsProps = {
  liked,
  disliked,
  isSubscribed,
  isSavedToAnyList,
  likeCount: video?.likes || 0,
  dislikeCount: video?.dislikes || 0,
  commentCount: video?.commentCount || 0,
  viewCount: video?.viewCount || 0,
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

// Handle summarize description
const handleSummarize = useCallback(async () => {
  if (!video?.description) return;

  setIsSummarizing(true);
  setSummaryError(null);

  try {
    const result = await handleSummarizeDescription();
    setSummary(result);
  } catch (err) {
    console.error('Error summarizing description:', err);
    setSummaryError(err as Error);
  } finally {
    setIsSummarizing(false);
  }
}, [video?.description, handleSummarizeDescription]);

// Video description configuration
const videoDescriptionProps = {
  video: video!,
  channel: channel!,
  showFullDescription,
  summary: summary || undefined,
  summaryError: summaryError?.message,
  isSummarizing,
  onToggleDescription: handleToggleDescription,
  onSummarize: handleSummarize,
  onSubscribe: handleEnhancedSubscribe,
  isSubscribed,
};

// Comments section configuration
  // Prepare comments section props
  const commentsSectionProps = {
    comments: [], // Initialize with empty array or actual comments data
    sortOrder: commentSortOrder,
    onSortChange: (order: 'top' | 'newest') => setCommentSortOrder(order),
    onCommentSubmit: (commentText: string) => {
      if (propHandleMainCommentSubmitCallback) {
        propHandleMainCommentSubmitCallback(commentText);
      }
    },
    onReplySubmit: (commentId: string, replyText: string) => {
      if (propHandleReplySubmit) {
        propHandleReplySubmit(commentId, replyText);
      }
    },
    onEditSave: (commentId: string, newText: string) => {
      if (propHandleEditSave) {
        propHandleEditSave(commentId, newText);
      }
    },
    onDelete: (commentId: string) => {
      if (propHandleDeleteComment) {
        propHandleDeleteComment(commentId);
      }
    },
    onLike: (commentId: string) => {
      if (propToggleLikeDislikeForCommentOrReply) {
        propToggleLikeDislikeForCommentOrReply(commentId, 'like');
      }
    },
    onDislike: (commentId: string) => {
      if (propToggleLikeDislikeForCommentOrReply) {
        propToggleLikeDislikeForCommentOrReply(commentId, 'dislike');
      }
    },
    replyingToCommentId: replyingToCommentId || undefined,
    onSetReplyingToCommentId: (id: string | null) => setReplyingToCommentId(id),
    currentReplyText: currentReplyText || '',
    onCurrentReplyTextChange: (text: string) => setCurrentReplyText(text),
    editingComment: editingComment || undefined,
    onSetEditingComment: (comment: { id: string; text: string } | null) => setEditingComment(comment),
    activeCommentMenu: activeCommentMenu || undefined,
    onSetActiveCommentMenu: (id: string | null) => setActiveCommentMenu(id),
    expandedReplies: expandedReplies || [],
    onToggleReplies: (commentId: string) => {
      setExpandedReplies(prev => 
        prev.includes(commentId)
          ? prev.filter(id => id !== commentId)
          : [...prev, commentId]
      );
    },
    currentUser: {
      id: 'current-user-id',
      name: 'Current User',
      avatarUrl: ''
    }
  };

  // Video player props
  const videoPlayerProps = {
    video: videoState,
    src: videoState?.videoUrl || '',
    poster: videoState?.thumbnailUrl || '',
    title: videoState?.title || '',
    duration: videoState?.duration || '0:00',
    isPlaying: true,
    isMuted: false,
    volume: 1,
    playbackRate: 1,
    currentTime: 0,
    isFullscreen: false,
    isTheaterMode: false,
    isMiniPlayer: false,
    showControls: true,
    onPlay: () => {},
    onPause: () => {},
    onSeek: () => {},
    onEnded: () => {},
    onError: (error: string) => {
      console.error('Video error:', error);
      setActionError('Error playing video');
    },
    onCaptionChange: () => {},
    onPlaybackRateChange: () => {},
    onVolumeChange: () => {},
    onToggleMute: () => {},
    onToggleTheaterMode: () => {},
    onToggleMiniPlayer: () => {},
    onToggleFullscreen: () => {},
    onTimeUpdate: () => {}
  };

  // Video actions props
  const videoActionsProps = {
    likes: videoState?.likes || 0,
    dislikes: videoState?.dislikes || 0,
    isLiked: videoState?.isLiked || false,
    isDisliked: videoState?.isDisliked || false,
    isSubscribed: videoState?.isSubscribed || false,
    isSaved: videoState?.isSavedToAnyList || false,
    onLike: () => propHandleLike(videoState?.id || ''),
    onDislike: () => propHandleDislike(videoState?.id || ''),
    onSubscribe: () => propHandleSubscribe(videoState?.channelId || ''),
    onShare: () => propHandleShare(videoState?.id || ''),
    onSave: () => setIsSaveModalOpen(true),
    onAddToWatchLater: handleAddToWatchLater,
    onComment: () => {
      const commentsSection = document.getElementById('comments-section');
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: 'smooth' });
      }
    },
    onMore: () => {}
  };

  // Video description props
  const videoDescriptionProps = {
    title: videoState?.title || '',
    viewCount: videoState?.views || 0,
    uploadedAt: videoState?.uploadedAt || new Date().toISOString(),
    description: videoState?.description || '',
    channel: videoState?.channel || {
      id: videoState?.channelId || '',
      name: videoState?.channelName || 'Unknown Channel',
      avatarUrl: videoState?.channelAvatarUrl || '',
      isSubscribed: videoState?.isSubscribed || false
    },
    showFullDescription: isDescriptionExpanded,
    onToggleDescription: () => {
      setIsDescriptionExpanded(!isDescriptionExpanded);
      propHandleToggleDescription();
    },
    summary: summary || '',
    isSummarizing: isSummaryLoading,
    onSummarize: handleSummarize,
    summaryError: summaryError || null,
    onSubscribe: () => propHandleSubscribe(videoState?.channel?.id || ''),
    isSubscribed: videoState?.isSubscribed || false
  };

  // Save to playlist modal props
  const saveToPlaylistModalProps = {
    isOpen: isSaveModalOpen,
    onClose: () => {
      setIsSaveModalOpen(false);
    },
    onSave: handleSaveToPlaylist,
    playlists: [], // Empty array as we don't have mock playlists
    selectedPlaylistId: '',
    onSelectPlaylist: () => {},
    onCreatePlaylist: handleCreatePlaylist,
    videoId: videoState?.id || '',
    existingPlaylists: [],
    onSaveToPlaylist: handleSaveToPlaylist
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
              console.log('Selected video:', videoId);
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