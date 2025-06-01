import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getVideos, getVideoById, getChannelByName, getCommentsByVideoId } from '../services/mockVideoService';

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
  duration: string;
  category: string;
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

export const useWatchPage = () => {
  const { videoId: pathVideoId } = useParams<{ videoId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get video ID from either path parameter or query parameter
  const videoId = pathVideoId || searchParams.get('v');
  
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
  const [saveModalLoading, setSaveModalLoading] = useState(false);
  
  // AI Summary state
  const [summary, setSummary] = useState<string>('');
  const [summaryError, setSummaryError] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  // Related videos state
  const [allRelatedVideos, setAllRelatedVideos] = useState<Video[]>([]);
  const [showAllRelated, setShowAllRelated] = useState(false);
  
  // Refs
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const saveModalRef = useRef<HTMLDivElement>(null);
  
  // Mock like count
  const mockLikeCount = 15420;
  
  // Load video data
  useEffect(() => {
    const loadVideoData = async () => {
      if (!videoId) return;
      
      setLoading(true);
      
      try {
        // Load video data
        const foundVideo = await getVideoById(videoId);
        if (!foundVideo) {
          setVideo(null);
          setLoading(false);
          return;
        }
        
        setVideo(foundVideo);
        
        // Load channel data
        const foundChannel = await getChannelByName(foundVideo.channelName);
        setChannel(foundChannel || null);
        
        // Load comments
        const videoComments = await getCommentsByVideoId(videoId);
        const topLevelComments = videoComments.filter(c => !c.parentId);
        setComments(topLevelComments);
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
    if (disliked) setDisliked(false);
  };
  
  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
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

  const handleSaveToPlaylist = async (videoId: string, playlistId: string) => {
    setSaveModalLoading(true);
    try {
      // Simulate API call to save video to playlist
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the saved state
      setIsSavedToAnyList(true);
      
      // Close the modal
      setIsSaveModalOpen(false);
    } catch (error) {
      console.error('Failed to save to playlist:', error);
    } finally {
      setSaveModalLoading(false);
    }
  };

  const handleCreatePlaylist = async (name: string, description?: string) => {
    // Simulate API call to create new playlist
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newPlaylist = {
      id: `playlist-${Date.now()}`,
      title: name,
      description: description || '',
      videoCount: 0,
      thumbnailUrl: '',
      isPrivate: false,
      createdAt: new Date().toISOString()
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
      thumbnailUrl: '',
      isPrivate: false,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'playlist-2',
      title: 'Favorites',
      description: 'My favorite videos',
      videoCount: 12,
      thumbnailUrl: '',
      isPrivate: false,
      createdAt: '2024-01-01T00:00:00Z'
    }
  ];
  
  // Description handlers
  const handleToggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };
  
  const handleSummarizeDescription = async () => {
    if (!video?.description) return;
    
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
    if (!commentText.trim()) return;
    
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
    if (!currentReplyText.trim()) return;
    const parentComment = comments.find(c => c.id === parentId);
    if (!parentComment) return;
    
    const newReply: Comment = {
      id: `reply-${Date.now()}`,
      parentId: parentId,
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
    if (!newText.trim()) return;
    
    const updateCommentState = (prevComments: Comment[]): Comment[] => 
      prevComments.map(comment => {
        if (comment.id === commentId && comment.parentId === parentId) { 
          return { 
            ...comment, 
            commentText: newText.trim(), 
            isEdited: true, 
            timestamp: 'Just now (edited)' 
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
    if (!window.confirm("Are you sure you want to delete this comment? This action cannot be undone.")) return;
    
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
            if (newLiked && newDisliked) newDisliked = false;
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
            likes: newLikes
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
  const addToWatchHistory = (videoId: string) => {
    // Add to watch history logic
    console.log('Added to watch history:', videoId);
  };
  
  const canSummarize = video?.description && video.description.length > MIN_DESC_LENGTH_FOR_SUMMARY;
  const displayedRelatedVideos = showAllRelated ? allRelatedVideos : allRelatedVideos.slice(0, RELATED_VIDEOS_INITIAL_COUNT);
  
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
    saveModalLoading,
    
    // AI Summary state
    summary,
    summaryError,
    isSummarizing,
    canSummarize,
    
    // Related videos
    allRelatedVideos,
    displayedRelatedVideos,
    showAllRelated,
    
    // Refs
    saveButtonRef,
    saveModalRef,
    
    // Constants
    MAX_COMMENT_LENGTH,
    
    // Handlers
    handleLike,
    handleDislike,
    handleSubscribe,
    handleShare,
    openSaveModal,
    closeSaveModal,
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