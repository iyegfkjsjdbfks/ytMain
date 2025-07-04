import { useState, useEffect, useCallback } from 'react';

import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

import { getVideos, getVideoById, getChannelByName, getCommentsByVideoId } from '../services/realVideoService';
import { unifiedDataService } from '../src/services/unifiedDataService';

import type { VideoVisibility } from '../types';

interface Comment {
  id: string;
  parentId?: string;
  userAvatarUrl: string;
  userName: string;
  commentText: string;
  timestamp: string;
  likes: number;
  isLikedByCurrentUser: boolean;
  isDislikedByCurrentUser: boolean;
  isEdited: boolean;
  replyTo?: string;
  replies?: Comment[];
  replyCount?: number;
}

interface Video {
  id: string;
  title: string;
  description: string;
  views: string;
  uploadedAt: string;
  thumbnailUrl: string;
  videoUrl: string;
  channelId: string;
  channelName: string;
  channelAvatarUrl: string;
  duration: string;
  category: string;
  likes: number;
  dislikes: number;
  tags: string[];
  visibility: VideoVisibility;
  isLive?: boolean;
  isShort?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Channel {
  id: string;
  name: string;
  avatarUrl: string;
  subscriberCount: string;
  isVerified: boolean;
}

const MAX_COMMENT_LENGTH = 500;
const MIN_DESC_LENGTH_FOR_SUMMARY = 100;
const RELATED_VIDEOS_INITIAL_COUNT = 10;

// YouTube video detection patterns
const YOUTUBE_URL_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([\w-]+)/i,
  /youtube/i, // Simple fallback for any mention of 'youtube'
];

// Type guard to detect YouTube videos
const isYouTubeVideo = (video: Video | null): boolean => {
  if (!video) {
return false;
}

  // Check video URL
  if (video.videoUrl && YOUTUBE_URL_PATTERNS.some(pattern => pattern.test(video.videoUrl))) {
    return true;
  }

  // Check video ID (if it has youtube- prefix or similar patterns)
  if (video.id && /youtube|yt-/i.test(video.id)) {
    return true;
  }

  // Check thumbnail URL for YouTube patterns
  if (video.thumbnailUrl && /youtube|ytimg/i.test(video.thumbnailUrl)) {
    return true;
  }

  return false;
};

export const useWatchPage = () => {
  const { videoId: pathVideoId } = useParams<{ videoId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get video ID from either path parameter or query parameter
  const rawVideoId = pathVideoId || searchParams.get('v');
  // Keep the original video ID for unified service (it handles YouTube prefixes internally)
  const videoId = rawVideoId || null;

  // Core data state
  const [video, setVideo] = useState<Video | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Video interaction state
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isInWatchLater, setIsInWatchLater] = useState(false);
  const [isSavedToAnyList, setIsSavedToAnyList] = useState(false);

  // UI state
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [commentSortOrder, setCommentSortOrder] = useState<'top' | 'newest'>('top');

  // Comment interaction state
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [currentReplyText, setCurrentReplyText] = useState('');
  const [editingComment, setEditingComment] = useState<{ id: string; parentId?: string } | null>(null);
  const [activeCommentMenu, setActiveCommentMenu] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  // Modal and loading state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // AI Summary state
  const [summary, setSummary] = useState<string>('');
  const [summaryError, setSummaryError] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Related videos state
  const [allRelatedVideos, setAllRelatedVideos] = useState<Video[]>([]);


  // Mock like count
  const mockLikeCount = 15420;

  // Load video data
  useEffect(() => {
    const loadVideoData = async () => {
      if (!videoId) {
return;
}

      setLoading(true);

      try {
        console.log(`useWatchPage: Loading video data for ID: ${videoId}`);

        // Try unified data service first (handles both local and YouTube)
        let foundVideo = null;

        try {
          const unifiedVideo = await unifiedDataService.getVideoById(videoId);
          if (unifiedVideo) {
            // Convert unified video format to expected format
            foundVideo = {
              id: unifiedVideo.id,
              title: unifiedVideo.title,
              description: unifiedVideo.description,
              views: unifiedVideo.views.toString(),
              uploadedAt: unifiedVideo.publishedAt,
              thumbnailUrl: unifiedVideo.thumbnailUrl,
              videoUrl: unifiedVideo.videoUrl || `https://www.youtube.com/watch?v=${unifiedVideo.id.replace('youtube-', '')}`,
              channelId: unifiedVideo.channel.id,
              channelName: unifiedVideo.channel.name,
              channelAvatarUrl: unifiedVideo.channel.avatarUrl,
              duration: unifiedVideo.duration,
              category: unifiedVideo.category || 'General',
              likes: unifiedVideo.likes,
              dislikes: unifiedVideo.dislikes || 0,
              tags: unifiedVideo.tags || [],
              visibility: 'public' as VideoVisibility,
              isLive: unifiedVideo.isLive || false,
              isShort: unifiedVideo.isShort || false,
              createdAt: unifiedVideo.publishedAt,
              updatedAt: unifiedVideo.publishedAt,
            };

            console.log('Successfully loaded video from unified service:', foundVideo);
          }
        } catch (error) {
          console.warn('Failed to load from unified service, trying mock service:', error);
        }

        // Fallback to mock service if unified service didn't find the video
        if (!foundVideo) {
          const cleanVideoId = videoId.replace(/^(youtube-|google-search-)/, '');
          foundVideo = await getVideoById(cleanVideoId);
          console.log('Loaded video from mock service:', foundVideo);
        }

        if (!foundVideo) {
          setVideo(null);
          setLoading(false);
          return;
        }

        // Ensure video has channel info - preserve existing channel name if available
        const videoWithChannelInfo = {
          ...foundVideo,
          channelName: foundVideo.channelName || 'Unknown Channel',
          channelAvatarUrl: foundVideo.channelAvatarUrl || '/default-avatar.png',
        };

        console.log('Final video with channel info:', {
          channelName: videoWithChannelInfo.channelName,
          channelId: videoWithChannelInfo.channelId,
          channelAvatarUrl: videoWithChannelInfo.channelAvatarUrl,
        });
        setVideo(videoWithChannelInfo);

        // Load channel data
        const foundChannel = await getChannelByName(foundVideo.channelName || '');
        if (foundChannel) {
          // Ensure channel has required subscriberCount property
          const channelWithSubscriberCount = {
            ...foundChannel,
            subscriberCount: foundChannel.subscriberCount || foundChannel.subscribers?.toString() || '0',
          };
          setChannel(channelWithSubscriberCount);
        } else {
          setChannel(null);
        }

        // Load comments
        const videoComments = await getCommentsByVideoId(videoId);
        const topLevelComments = videoComments.filter(c => !c.parentId);
        // Ensure comments have all required properties
        const commentsWithDefaults = topLevelComments.map(comment => ({
          ...comment,
          isLikedByCurrentUser: comment.isLikedByCurrentUser ?? false,
          isDislikedByCurrentUser: comment.isDislikedByCurrentUser ?? false,
          isEdited: comment.isEdited ?? false,
          replies: comment.replies ?? [],
          replyCount: comment.replyCount ?? 0,
          content: comment.content ?? comment.commentText,
          dislikes: comment.dislikes ?? 0,
          isPinned: comment.isPinned ?? false,
          isHearted: comment.isHearted ?? false,
          videoId: comment.videoId ?? videoId,
          authorId: comment.authorId ?? '',
          authorName: comment.authorName ?? comment.userName,
          authorAvatar: comment.authorAvatar ?? comment.userAvatarUrl,
        }));
        setComments(commentsWithDefaults);
        setCommentCount(videoComments.length);

        // Load related videos
        const allVideos = await getVideos();
        const related = allVideos
          .filter(v => v.id !== videoId && v.category === foundVideo.category)
          .slice(0, 20);
        setAllRelatedVideos(related);

      } catch (error) {
        console.error('Error loading video data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVideoData();
  }, [videoId]);

  // Video interaction handlers
  const handleLike = () => {
    setLiked(!liked);
    if (disliked) {
setDisliked(false);
}
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) {
setLiked(false);
}
  };

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
  };

  const handleShare = () => {
    // Share logic handled in VideoActions component
  };

  const openSaveModal = () => {
    setIsSaveModalOpen(true);
  };

  const closeSaveModal = () => {
    setIsSaveModalOpen(false);
  };

  const handleSaveToWatchLater = () => {
    if (video) {
      if (isInWatchLater) {
        // Remove from watch later - this would need to be imported from context
        // For now, just update local state
        setIsInWatchLater(false);
      } else {
        // Add to watch later - this would need to be imported from context
        // For now, just update local state
        setIsInWatchLater(true);
      }
    }
  };

  const handleSaveToPlaylist = async (playlistId: string) => {
    // Simulate API call to save video to playlist
    await new Promise(resolve => setTimeout(resolve, 300));

    // Check if this is the "Watch Later" playlist
    if (playlistId === 'playlist-1' && video) {
      // Add to watch later list - this should use the context
      // For now, update local state to match the behavior
      setIsInWatchLater(true);
    }

    // Update the saved state
    setIsSavedToAnyList(true);

    // Note: Modal will handle closing itself via the executeSave wrapper
  };

  const handleCreatePlaylist = async (name: string, description?: string) => {
    // Simulate API call to create new playlist
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newPlaylist = {
      id: `playlist-${Date.now()}`,
      title: name,
      description: description || '',
      videoCount: 0,
      totalDuration: '0:00:00',
      visibility: 'private' as const,
      ownerId: 'user-1',
      ownerName: 'You',
      videos: [],
      tags: [],
      thumbnailUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return newPlaylist;
  };

  // Mock playlists data
  const mockPlaylists = [
    {
      id: 'playlist-1',
      title: 'Watch Later',
      description: 'Videos to watch later',
      videoCount: 5,
      totalDuration: '2:30:45',
      visibility: 'private' as const,
      ownerId: 'user-1',
      ownerName: 'You',
      videos: [],
      tags: [],
      thumbnailUrl: '',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'playlist-2',
      title: 'Favorites',
      description: 'My favorite videos',
      videoCount: 12,
      totalDuration: '5:45:30',
      visibility: 'private' as const,
      ownerId: 'user-1',
      ownerName: 'You',
      videos: [],
      tags: [],
      thumbnailUrl: '',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  // Description handlers
  const handleToggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const handleSummarizeDescription = async () => {
    if (!video?.description) {
return;
}

    setIsSummarizing(true);
    setSummaryError('');

    try {
      // Simulate AI summarization
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock summary
      const mockSummary = `This video discusses ${video.title.toLowerCase()}. The content covers key points about the topic, providing viewers with valuable insights and information. The creator explains the main concepts in an accessible way, making it suitable for both beginners and those with some background knowledge.`;

      setSummary(mockSummary);
    } catch (error) {
      setSummaryError('Failed to generate summary. Please try again later.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Comment handlers
  const handleMainCommentSubmitCallback = (commentText: string) => {
    if (!commentText.trim()) {
return;
}

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      userAvatarUrl: 'https://picsum.photos/seed/currentUserComment/40/40',
      userName: 'You',
      commentText: commentText.trim(),
      timestamp: 'Just now',
      likes: 0,
      isLikedByCurrentUser: false,
      isDislikedByCurrentUser: false,
      isEdited: false,
      replies: [],
      replyCount: 0,
    };

    setComments(prev => [newComment, ...prev]);
    setCommentCount(prev => prev + 1);
  };

  const handleReplySubmit = (parentId: string) => {
    if (!currentReplyText.trim()) {
return;
}
    const parentComment = comments.find(c => c.id === parentId);
    if (!parentComment) {
return;
}

    const newReply: Comment = {
      id: `reply-${Date.now()}`,
      parentId,
      userAvatarUrl: 'https://picsum.photos/seed/currentUserReply/32/32',
      userName: 'You',
      commentText: currentReplyText.trim(),
      timestamp: 'Just now',
      likes: 0,
      isLikedByCurrentUser: false,
      isDislikedByCurrentUser: false,
      isEdited: false,
      replyTo: parentComment.userName,
    };

    setComments(prevComments => prevComments.map(c => {
      if (c.id === parentId) {
        return {
          ...c,
          replies: [newReply, ...(c.replies || [])],
          replyCount: (c.replyCount || 0) + 1,
        };
      }
      return c;
    }));
    setCurrentReplyText('');
    setReplyingToCommentId(null);
  };

  const handleEditSave = (commentId: string, newText: string, parentId?: string) => {
    if (!newText.trim()) {
return;
}

    const updateCommentState = (prevComments: Comment[]): Comment[] =>
      prevComments.map(comment => {
        if (comment.id === commentId && comment.parentId === parentId) {
          return {
            ...comment,
            commentText: newText.trim(),
            isEdited: true,
            timestamp: 'Just now (edited)',
          };
        }
        if (comment.replies && comment.replies.length > 0) {
          return { ...comment, replies: updateCommentState(comment.replies) };
        }
        return comment;
      });

    setComments(updateCommentState);
    setEditingComment(null);
  };

  const handleDeleteComment = (commentId: string, parentId?: string) => {
    if (!window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
return;
}

    const deleteCommentFromList = (list: Comment[], idToDelete: string, parentOfDeleted?: string): Comment[] => {
      return list.reduce((acc, comment) => {
        if (comment.id === idToDelete && comment.parentId === parentOfDeleted) {
          if (!parentOfDeleted) {
            setCommentCount(prev => prev - 1 - (comment.replyCount || 0));
          }
          return acc;
        }
        if (comment.replies) {
          const originalReplyCount = comment.replies.length;
          const updatedReplies = deleteCommentFromList(comment.replies, idToDelete, comment.id);
          if (updatedReplies.length < originalReplyCount && comment.id === parentOfDeleted) {
            comment.replyCount = (comment.replyCount || 0) - (originalReplyCount - updatedReplies.length);
          }
          comment.replies = updatedReplies;
        }
        acc.push(comment);
        return acc;
      }, [] as Comment[]);
    };

    setComments(prevComments => deleteCommentFromList(prevComments, commentId, parentId));
    setActiveCommentMenu(null);
  };

  const toggleLikeDislikeForCommentOrReply = (id: string, parentId: string | undefined, action: 'like' | 'dislike') => {
    const updateList = (list: Comment[]): Comment[] => {
      return list.map(item => {
        if (item.id === id && item.parentId === parentId) {
          let newLiked = item.isLikedByCurrentUser;
          let newDisliked = item.isDislikedByCurrentUser;
          let newLikes = item.likes;

          if (action === 'like') {
            newLiked = !item.isLikedByCurrentUser;
            newLikes = newLiked ? item.likes + 1 : item.likes - 1;
            if (newLiked && newDisliked) {
newDisliked = false;
}
          } else {
            newDisliked = !item.isDislikedByCurrentUser;
            if (newDisliked && newLiked) {
              newLiked = false;
              newLikes = item.likes - 1;
            }
          }

          return {
            ...item,
            isLikedByCurrentUser: newLiked,
            isDislikedByCurrentUser: newDisliked,
            likes: newLikes,
          };
        }

        if (item.replies) {
          return { ...item, replies: updateList(item.replies) };
        }

        return item;
      });
    };

    setComments(updateList);
  };

  // Utility functions
  const addToWatchHistory = useCallback(() => {
    // Add to watch history logic
    }, []);

  const canSummarize = video?.description && video.description.length > MIN_DESC_LENGTH_FOR_SUMMARY;
  const displayedRelatedVideos = allRelatedVideos.slice(0, RELATED_VIDEOS_INITIAL_COUNT);

  // YouTube video detection flag
  const isYouTubeVideoFlag = isYouTubeVideo(video);

  return {
    // Core data
    video,
    channel,
    comments,
    loading,
    videoId,

    // Video interaction state
    liked,
    disliked,
    isSubscribed,
    isInWatchLater,
    isSavedToAnyList,
    mockLikeCount,

    // UI state
    showFullDescription,
    commentCount,
    commentSortOrder,

    // Comment interaction state
    replyingToCommentId,
    currentReplyText,
    editingComment,
    activeCommentMenu,
    expandedReplies,

    // Modal and loading state
    isSaveModalOpen,

    // AI Summary state
    summary,
    summaryError,
    isSummarizing,
    canSummarize,

    // Related videos
    allRelatedVideos,
    displayedRelatedVideos,

    // YouTube video detection
    isYouTubeVideo: isYouTubeVideoFlag,

    // Constants
    MAX_COMMENT_LENGTH,

    // Handlers
    handleLike,
    handleDislike,
    handleSubscribe,
    handleShare,
    openSaveModal,
    closeSaveModal,
    handleSaveToWatchLater,
    handleSaveToPlaylist,
    handleCreatePlaylist,
    handleToggleDescription,
    handleSummarizeDescription,
    handleMainCommentSubmitCallback,
    handleReplySubmit,
    handleEditSave,
    handleDeleteComment,
    toggleLikeDislikeForCommentOrReply,
    addToWatchHistory,

    // Mock data
    mockPlaylists,

    // Setters
    setCommentSortOrder,
    setReplyingToCommentId,
    setCurrentReplyText,
    setEditingComment,
    setActiveCommentMenu,
    setExpandedReplies,

    // Navigation
    navigate,
  };
};

export default useWatchPage;