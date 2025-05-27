
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Video, Channel, Comment, UserPlaylistDetails } from '../types';
import { 
    getVideoById, 
    getChannelByName, 
    getCommentsByVideoId, 
    getVideos,
    addToWatchHistory, 
    toggleLikeVideo,    
    isVideoLiked,
    toggleWatchLater,   
    isVideoInWatchLater,
    getUserPlaylists,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getAllPlaylistMemberships,
    createUserPlaylist
} from '../services/mockVideoService';
import { summarizeText } from '../services/geminiService'; 
import ThumbsUpIcon from '../components/icons/ThumbsUpIcon';
import ThumbsDownIcon from '../components/icons/ThumbsDownIcon';
import ShareIcon from '../components/icons/ShareIcon';
import SaveIcon from '../components/icons/SaveIcon';
import SaveIconFilled from '../components/icons/SaveIconFilled'; 
import BellIcon from '../components/icons/BellIcon';
import { SparklesIcon as SummarizeIcon, ChevronDownIcon, ChevronUpIcon, EllipsisVerticalIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'; 
import { PaperAirplaneIcon, CheckIcon, PlusIcon as PlusCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useMiniplayer } from '../contexts/MiniplayerContext';
import { parseRelativeDate } from '../utils/dateUtils';
import { parseViewCount, formatCount } from '../utils/numberUtils';
import AddCommentForm from '../components/AddCommentForm';


const RELATED_VIDEOS_INITIAL_COUNT = 8;
const MIN_DESC_LENGTH_FOR_SUMMARY = 150; 
const MAX_COMMENT_LENGTH = 220;

const WatchPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [allRelatedVideos, setAllRelatedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const [isInWatchLater, setIsInWatchLater] = useState(false); 
  const [videoPlaylistMemberships, setVideoPlaylistMemberships] = useState<string[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [userPlaylistsForModal, setUserPlaylistsForModal] = useState<UserPlaylistDetails[]>([]);
  const [saveModalLoading, setSaveModalLoading] = useState(false);
  const [isCreatingPlaylistInModal, setIsCreatingPlaylistInModal] = useState(false);
  const [newPlaylistNameInModal, setNewPlaylistNameInModal] = useState('');
  const [createPlaylistErrorInModal, setCreatePlaylistErrorInModal] = useState<string | null>(null);
  
  const [showAllRelated, setShowAllRelated] = useState(false);
  
  const miniplayerContext = useMiniplayer();
  const location = useLocation();
  const navigate = useNavigate();
  const saveModalRef = useRef<HTMLDivElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);


  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false); 
  const [mockLikeCount, setMockLikeCount] = useState(0);

  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [commentCount, setCommentCount] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  const [commentSortOrder, setCommentSortOrder] = useState<'top' | 'newest'>('top');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [currentReplyText, setCurrentReplyText] = useState('');
  const [editingComment, setEditingComment] = useState<{ id: string; text: string; parentId?: string } | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [activeCommentMenu, setActiveCommentMenu] = useState<{ commentId: string; parentId?: string } | null>(null);
  const commentMenuRef = useRef<HTMLDivElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);


  const isSavedToAnyList = isInWatchLater || videoPlaylistMemberships.length > 0;

  const fetchVideoData = useCallback(async (currentVideoId: string) => {
    setLoading(true);
    setShowFullDescription(false); 
    setIsSubscribed(Math.random() > 0.7); 
    setShowAllRelated(false);
    setSummary(null);
    setIsSummarizing(false);
    setSummaryError(null);
    setIsSaveModalOpen(false);
    setReplyingToCommentId(null);
    setCurrentReplyText('');
    setEditingComment(null);
    setExpandedReplies({});
    setActiveCommentMenu(null);
    setCommentSortOrder('top');

    if (miniplayerContext.miniplayerVideo?.id === currentVideoId) {
        miniplayerContext.hideMiniplayer();
    }

    try {
      const [
        fetchedVideo, 
        allVideosForRelated, 
        initiallyLiked,
        initiallyInWatchLater,
        initialPlaylistMemberships,
        fetchedUserPlaylists
      ] = await Promise.all([
        getVideoById(currentVideoId),
        getVideos(), 
        isVideoLiked(currentVideoId),
        isVideoInWatchLater(currentVideoId),
        getAllPlaylistMemberships(currentVideoId),
        getUserPlaylists()
      ]);

      if (fetchedVideo) {
        setVideo(fetchedVideo);
        addToWatchHistory(fetchedVideo.id); 
        
        const viewsAsNumber = parseViewCount(fetchedVideo.views);
        // Simplified initialMockLikeCount calculation
        const parsedVideoIdForSeed = parseInt(currentVideoId || '1', 10);
        const likeSeedFactor = (parsedVideoIdForSeed % 5 + 1) / 100; // e.g., 0.01 to 0.05
        let initialLikes = Math.floor(viewsAsNumber * likeSeedFactor);
        if (initialLikes <= 0 && viewsAsNumber > 0) { // Ensure some likes if there are views
            initialLikes = Math.floor(Math.random() * Math.min(500, viewsAsNumber / 100) + 10);
        } else if (initialLikes <=0) {
            initialLikes = Math.floor(Math.random()*50 + 5);
        }
        
        setLiked(initiallyLiked);
        setMockLikeCount(initialLikes);
        
        setIsInWatchLater(initiallyInWatchLater);
        setVideoPlaylistMemberships(initialPlaylistMemberships);
        setUserPlaylistsForModal(fetchedUserPlaylists);

        const [fetchedChannel, fetchedCommentsData] = await Promise.all([
          getChannelByName(fetchedVideo.channelName),
          getCommentsByVideoId(currentVideoId)
        ]);
        setChannel(fetchedChannel || null);
        setComments(fetchedCommentsData);
        setCommentCount(fetchedCommentsData.length); 
        setAllRelatedVideos(allVideosForRelated.filter(v => v.id !== currentVideoId)); 
      } else {
        setVideo(null); 
      }
    } catch (error) {
      console.error("Error fetching video data:", error);
      setVideo(null);
    } finally {
      setLoading(false);
    }
  }, [miniplayerContext]);


  useEffect(() => {
    if (videoId) {
      fetchVideoData(videoId);
    }
    window.scrollTo(0, 0);
  }, [videoId, fetchVideoData]);

   useEffect(() => {
    return () => {
      const isNavigatingAwayFromThisVideo = video && !location.pathname.startsWith(`/watch/${video.id}`);
      
      if (isNavigatingAwayFromThisVideo && miniplayerContext.miniplayerVideo?.id !== video.id) {
        miniplayerContext.showMiniplayer(video);
      }
    };
  }, [location, video, miniplayerContext]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSaveModalOpen &&
        saveModalRef.current &&
        !saveModalRef.current.contains(event.target as Node) &&
        saveButtonRef.current &&
        !saveButtonRef.current.contains(event.target as Node)
      ) {
        setIsSaveModalOpen(false);
        setIsCreatingPlaylistInModal(false); 
      }
      if (activeCommentMenu && commentMenuRef.current && !commentMenuRef.current.contains(event.target as Node)) {
        const menuButton = document.getElementById(`comment-menu-button-${activeCommentMenu.commentId}`);
        if(!menuButton || !menuButton.contains(event.target as Node)) {
            setActiveCommentMenu(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSaveModalOpen, activeCommentMenu]);


  const handleSubscribeToggle = () => setIsSubscribed(prev => !prev);
  
  const openSaveModal = async () => {
    if (!video) return;
    setSaveModalLoading(true);
    try {
      const [latestWatchLaterStatus, latestMemberships, latestUserPlaylists] = await Promise.all([
        isVideoInWatchLater(video.id),
        getAllPlaylistMemberships(video.id),
        getUserPlaylists()
      ]);
      setIsInWatchLater(latestWatchLaterStatus);
      setVideoPlaylistMemberships(latestMemberships);
      setUserPlaylistsForModal(latestUserPlaylists.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      setIsSaveModalOpen(true);
    } catch (error) {
      console.error("Error preparing save modal:", error);
    } finally {
      setSaveModalLoading(false);
    }
  };

  const handleToggleWatchLaterInModal = async () => {
    if (!video) return;
    const newStatus = await toggleWatchLater(video.id);
    setIsInWatchLater(newStatus);
  };

  const handleTogglePlaylistInModal = async (playlistId: string) => {
    if (!video) return;
    const isCurrentlyInPlaylist = videoPlaylistMemberships.includes(playlistId);
    if (isCurrentlyInPlaylist) {
      await removeVideoFromPlaylist(playlistId, video.id);
      setVideoPlaylistMemberships(prev => prev.filter(id => id !== playlistId));
    } else {
      await addVideoToPlaylist(playlistId, video.id);
      setVideoPlaylistMemberships(prev => [...prev, playlistId]);
    }
    const latestUserPlaylists = await getUserPlaylists();
    setUserPlaylistsForModal(latestUserPlaylists.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
  };

  const handleCreatePlaylistInModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video || !newPlaylistNameInModal.trim()) {
        setCreatePlaylistErrorInModal("Playlist name cannot be empty.");
        return;
    }
    setCreatePlaylistErrorInModal(null);
    try {
        const newPlaylist = await createUserPlaylist(newPlaylistNameInModal);
        await addVideoToPlaylist(newPlaylist.id, video.id);
        
        const [latestWatchLaterStatus, latestMemberships, latestUserPlaylists] = await Promise.all([
            isVideoInWatchLater(video.id),
            getAllPlaylistMemberships(video.id),
            getUserPlaylists()
        ]);
        setIsInWatchLater(latestWatchLaterStatus);
        setVideoPlaylistMemberships(latestMemberships);
        setUserPlaylistsForModal(latestUserPlaylists.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));

        setIsCreatingPlaylistInModal(false);
        setNewPlaylistNameInModal('');

    } catch (error) {
        console.error("Error creating playlist from modal:", error);
        setCreatePlaylistErrorInModal("Failed to create playlist. Please try again.");
    }
  };


  const handleLike = async () => {
    if (!video) return;
    const newLikedStatus = await toggleLikeVideo(video.id);
    setLiked(newLikedStatus);
    setMockLikeCount(prev => newLikedStatus ? prev + 1 : prev -1);
    if (newLikedStatus && disliked) setDisliked(false);
  };

  const handleDislike = () => { 
    setDisliked(prevDisliked => {
      if (!prevDisliked) { 
        if (liked) { 
          if(video) toggleLikeVideo(video.id); 
          setLiked(false);
          setMockLikeCount(prev => prev - 1);
        }
        return true;
      } else { 
        return false;
      }
    });
  };
  
  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleCopyLink = async () => {
    if (video) {
      const videoUrl = window.location.href;
      try {
        await navigator.clipboard.writeText(videoUrl);
        setShareMessage('Link copied to clipboard!');
        setTimeout(() => setShareMessage(''), 3000);
      } catch (err) {
        console.error('Failed to copy link: ', err);
        setShareMessage('Failed to copy link.');
        setTimeout(() => setShareMessage(''), 3000);
      }
    }
  };

  const handleShareToSocial = (platform: string) => {
    if (!video) return;
    const videoUrl = window.location.href;
    const text = `Check out this video: ${video.title}`;

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(videoUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(videoUrl)}&title=${encodeURIComponent(video.title)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(video.title)}&body=${encodeURIComponent(`${text}\n\n${videoUrl}`)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleSummarizeDescription = async () => {
    if (!video || !video.description || isSummarizing) return;
    setIsSummarizing(true);
    setSummary(null);
    setSummaryError(null);
    try {
      const generatedSummary = await summarizeText(video.description);
      setSummary(generatedSummary);
    } catch (error: any) {
      setSummaryError(error.message || "An unknown error occurred while summarizing.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const sortedComments = useMemo(() => {
    let tempComments = [...comments];
    if (commentSortOrder === 'newest') {
      tempComments.sort((a, b) => parseRelativeDate(b.timestamp) - parseRelativeDate(a.timestamp));
    } else if (commentSortOrder === 'top') {
      tempComments.sort((a, b) => {
        if (b.likes !== a.likes) {
          return b.likes - a.likes;
        }
        return parseRelativeDate(b.timestamp) - parseRelativeDate(a.timestamp);
      });
    }
    return tempComments;
  }, [comments, commentSortOrder]);

  const handleMainCommentSubmitCallback = (commentText: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      userAvatarUrl: 'https://picsum.photos/seed/currentUserComment/40/40',
      userName: 'You', 
      commentText: commentText,
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
                return { ...comment, commentText: newText.trim(), isEdited: true, timestamp: 'Just now (edited)' };
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
          return { ...item, isLikedByCurrentUser: newLiked, isDislikedByCurrentUser: newDisliked, likes: newLikes };
        }
        if (item.replies) {
          return { ...item, replies: updateList(item.replies) };
        }
        return item;
      });
    };
    setComments(prev => updateList(prev));
  };

  useEffect(() => {
    if (editingComment && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.setSelectionRange(editInputRef.current.value.length, editInputRef.current.value.length);
    }
  }, [editingComment]);

  const renderCommentActions = (comment: Comment) => {
    if (comment.userName !== 'You') return null;
    return (
      <div className="relative ml-auto">
        <button
          id={`comment-menu-button-${comment.id}`}
          onClick={(e) => {
            e.stopPropagation();
            setActiveCommentMenu(activeCommentMenu?.commentId === comment.id ? null : { commentId: comment.id, parentId: comment.parentId });
          }}
          className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
          aria-label="Comment actions"
        >
          <EllipsisVerticalIcon className="w-4 h-4" />
        </button>
        {activeCommentMenu?.commentId === comment.id && (
          <div ref={commentMenuRef} className="absolute top-full right-0 mt-1 w-36 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg z-20 py-1 animate-fade-in-fast">
            <button
              onClick={() => { setEditingComment({ id: comment.id, text: comment.commentText, parentId: comment.parentId }); setActiveCommentMenu(null); }}
              className="w-full text-left px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700/70 flex items-center"
            >
              <PencilIcon className="w-4 h-4 mr-2" /> Edit
            </button>
            <button
              onClick={() => handleDeleteComment(comment.id, comment.parentId)}
              className="w-full text-left px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center"
            >
              <TrashIcon className="w-4 h-4 mr-2" /> Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const isEditingThisComment = editingComment?.id === comment.id && editingComment?.parentId === comment.parentId;
    return (
      <div key={comment.id} className={`flex items-start space-x-2.5 ${isReply ? 'ml-8 sm:ml-10' : ''}`}>
        <Link to={comment.userName === 'You' ? '#' : `/user/${encodeURIComponent(comment.userName)}`} aria-label={`View profile of ${comment.userName}`}>
          <img src={comment.userAvatarUrl} alt={`${comment.userName} avatar`} className={`rounded-full flex-shrink-0 ${isReply ? 'w-6 h-6 mt-1' : 'w-9 h-9 mt-0.5'}`} />
        </Link>
        <div className="flex-grow">
          {isEditingThisComment ? (
            <div className="w-full">
              <textarea
                ref={editInputRef}
                value={editingComment!.text}
                onChange={(e) => setEditingComment({ ...editingComment!, text: e.target.value })}
                className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-sm resize-none focus:ring-sky-500 focus:border-sky-500"
                rows={3}
                maxLength={MAX_COMMENT_LENGTH + 20}
              />
              <div className="flex justify-end items-center space-x-2 mt-1.5">
                 <span className={`text-xs ${editingComment!.text.length > MAX_COMMENT_LENGTH ? 'text-red-500 dark:text-red-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    {editingComment!.text.length}/{MAX_COMMENT_LENGTH}
                 </span>
                <button onClick={() => setEditingComment(null)} className="px-3 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700/70 rounded-full">Cancel</button>
                <button 
                    onClick={() => handleEditSave(comment.id, editingComment!.text, comment.parentId)}
                    disabled={!editingComment!.text.trim() || editingComment!.text.length > MAX_COMMENT_LENGTH}
                    className="px-3 py-1 text-xs font-medium bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500 text-white rounded-full disabled:opacity-60"
                >Save</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-baseline space-x-1.5">
                <Link to={comment.userName === 'You' ? '#' : `/user/${encodeURIComponent(comment.userName)}`} className={`text-xs font-medium ${comment.userName === 'You' ? 'text-neutral-800 dark:text-neutral-100' : 'text-neutral-800 dark:text-neutral-100 hover:text-neutral-600 dark:hover:text-neutral-300'}`}>{comment.userName}</Link>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {comment.timestamp}
                  {comment.isEdited && <span className="italic"> (edited)</span>}
                </span>
                 {renderCommentActions(comment)}
              </div>
              <p className="text-sm text-neutral-800 dark:text-neutral-50 mt-0.5 leading-snug whitespace-pre-wrap">
                {comment.replyTo && !isReply && <Link to={`/user/${encodeURIComponent(comment.replyTo)}`} className="text-sky-500 hover:underline">@{comment.replyTo}</Link>} {comment.commentText}
              </p>
              <div className="flex items-center space-x-3 mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                <button 
                  onClick={() => toggleLikeDislikeForCommentOrReply(comment.id, comment.parentId, 'like')}
                  className={`hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center ${comment.isLikedByCurrentUser ? 'text-sky-600 dark:text-sky-400' : ''}`} 
                  title="Like comment" aria-pressed={comment.isLikedByCurrentUser} disabled={comment.userName === 'You'}
                >
                  <ThumbsUpIcon className={`w-4 h-4 mr-1 ${comment.isLikedByCurrentUser ? 'fill-sky-600 dark:fill-sky-400' : ''}`}/> 
                  {comment.likes > 0 ? comment.likes : ''}
                </button>
                 <button 
                  onClick={() => toggleLikeDislikeForCommentOrReply(comment.id, comment.parentId, 'dislike')}
                  className={`hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center ${comment.isDislikedByCurrentUser ? 'text-red-500 dark:text-red-400' : ''}`} 
                  title="Dislike comment" aria-pressed={comment.isDislikedByCurrentUser} disabled={comment.userName === 'You'}
                >
                  <ThumbsDownIcon className={`w-4 h-4 ${comment.isDislikedByCurrentUser ? 'fill-red-500 dark:fill-red-400' : ''}`}/> 
                </button>
                {!isReply && (
                  <button onClick={() => { setReplyingToCommentId(comment.id); setCurrentReplyText(`@${comment.userName} `); setTimeout(() => replyInputRef.current?.focus(),0); }} className="hover:text-neutral-700 dark:hover:text-neutral-200 font-medium">REPLY</button>
                )}
              </div>
            </>
          )}

          {replyingToCommentId === comment.id && !isReply && (
            <div className="flex items-start space-x-2.5 mt-3">
              <img src="https://picsum.photos/seed/currentUserReply/32/32" alt="Your avatar for reply" className="w-6 h-6 rounded-full flex-shrink-0 mt-1" />
              <div className="flex-grow">
                <input 
                  ref={replyInputRef}
                  type="text" 
                  value={currentReplyText}
                  onChange={(e) => setCurrentReplyText(e.target.value)}
                  placeholder={`Replying to ${comment.userName}...`}
                  className="bg-transparent border-b border-neutral-300 dark:border-neutral-700 focus:border-blue-500 dark:focus:border-sky-500 w-full py-1.5 outline-none text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 text-sm transition-colors"
                  maxLength={MAX_COMMENT_LENGTH + 20}
                />
                <div className="flex justify-between items-center mt-1.5">
                    <span className={`text-xs ${currentReplyText.length > MAX_COMMENT_LENGTH ? 'text-red-500 dark:text-red-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
                        {currentReplyText.length}/{MAX_COMMENT_LENGTH}
                    </span>
                    <div className="space-x-2">
                        <button onClick={() => { setReplyingToCommentId(null); setCurrentReplyText(''); }} className="px-3 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700/70 rounded-full">Cancel</button>
                        <button 
                            onClick={() => handleReplySubmit(comment.id)} 
                            disabled={!currentReplyText.trim() || currentReplyText.length > MAX_COMMENT_LENGTH}
                            className="px-3 py-1 text-xs font-medium bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500 text-white rounded-full disabled:opacity-60"
                        >Reply</button>
                    </div>
                </div>
              </div>
            </div>
          )}
          
          {!isReply && comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              <button 
                onClick={() => setExpandedReplies(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                className="flex items-center text-xs font-medium text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 rounded-full px-2 py-1 hover:bg-sky-50 dark:hover:bg-sky-500/10 mb-1"
              >
                {expandedReplies[comment.id] ? <ChevronUpIcon className="w-4 h-4 mr-1" /> : <ChevronDownIcon className="w-4 h-4 mr-1" />}
                {expandedReplies[comment.id] ? 'Hide' : 'View'} {comment.replyCount} repl{comment.replyCount === 1 ? 'y' : 'ies'}
              </button>
              {expandedReplies[comment.id] && (
                <div className="space-y-3 pt-2">
                  {comment.replies.sort((a,b) => parseRelativeDate(a.timestamp) - parseRelativeDate(b.timestamp)).map(reply => renderComment(reply, true))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };


  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-screen-2xl mx-auto animate-pulse bg-white dark:bg-neutral-950">
        <div className="lg:w-[calc(100%-26rem)] xl:w-[calc(100%-28rem)]">
          <div className="aspect-video bg-neutral-300 dark:bg-neutral-800 rounded-xl"></div>
          <div className="mt-3 px-1">
            <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2.5"></div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
              <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-2 sm:mb-0"></div>
              <div className="flex space-x-2">
                <div className="h-9 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                <div className="h-9 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                <div className="h-9 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                <div className="h-9 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
              </div>
            </div>
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3"> 
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
                        <div className="space-y-1.5">
                            <div className="h-4 w-32 bg-neutral-300 dark:bg-neutral-700 rounded"></div>
                            <div className="h-3 w-24 bg-neutral-300 dark:bg-neutral-700 rounded"></div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-9 w-24 bg-neutral-300 dark:bg-neutral-700 rounded-full"></div>
                      <div className="h-9 w-9 bg-neutral-300 dark:bg-neutral-700 rounded-full"></div>
                    </div>
                </div>
                 <div className="h-3 w-full bg-neutral-300 dark:bg-neutral-700 rounded mt-2"></div>
                 <div className="h-3 w-5/6 bg-neutral-300 dark:bg-neutral-700 rounded mt-1.5"></div>
                 <div className="h-3 w-full bg-neutral-300 dark:bg-neutral-700 rounded mt-1.5"></div>
            </div>
            <div className="mt-6 space-y-4">
                <div className="h-5 w-1/4 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                {Array.from({length: 3}).map((_, i) => (
                    <div key={i} className="flex items-start space-x-3">
                        <div className="w-9 h-9 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
                        <div className="flex-grow space-y-1.5">
                            <div className="h-3 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                            <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                            <div className="h-3 w-1/4 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
        <div className="lg:w-[24rem] xl:w-[26rem] space-y-2.5">
          <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-2 hidden lg:block"></div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-2.5 p-1">
              <div className="w-2/5 aspect-video bg-neutral-300 dark:bg-neutral-700 rounded-md"></div>
              <div className="w-3/5 pt-0.5 space-y-1.5">
                <div className="h-4 bg-neutral-300 dark:bg-neutral-700 rounded"></div>
                <div className="h-3 bg-neutral-300 dark:bg-neutral-700 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-300 dark:bg-neutral-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!video) {
    return <div className="text-center py-16 text-xl text-neutral-600 dark:text-neutral-400">Video not found. It might have been removed or the link is incorrect.</div>;
  }
  
  const channelLink = channel ? `/channel/${encodeURIComponent(channel.name)}` : '#';
  const displayedRelatedVideos = showAllRelated ? allRelatedVideos : allRelatedVideos.slice(0, RELATED_VIDEOS_INITIAL_COUNT);
  const canSummarize = video.description && video.description.length > MIN_DESC_LENGTH_FOR_SUMMARY;


  return (
    <div className="flex flex-col lg:flex-row gap-x-6 max-w-screen-2xl mx-auto bg-white dark:bg-neutral-950">
      <div className="lg:flex-grow lg:w-[calc(100%-26rem)] xl:w-[calc(100%-28rem)]">
        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
          <video 
            key={video.id} 
            src={video.videoUrl} 
            controls 
            autoPlay 
            className="w-full h-full" 
            poster={video.thumbnailUrl}
            aria-label={`Video player for ${video.title}`}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="py-3">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-1.5 break-words">{video.title}</h1>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-y-3 md:gap-y-2">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              <span>{video.views}</span> &bull; <span>{video.uploadedAt}</span>
            </div>
            <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto no-scrollbar relative">
              <div className={`flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-full`}>
                <button 
                  onClick={handleLike}
                  className={`flex items-center space-x-1.5 pl-3.5 pr-3 py-2 rounded-l-full text-sm font-medium transition-colors
                    ${liked ? 'text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-500/10 hover:bg-sky-200 dark:hover:bg-sky-500/20' : 'text-neutral-800 dark:text-neutral-50 hover:bg-neutral-200 dark:hover:bg-neutral-700/70'}`} 
                  aria-pressed={liked}
                  title="Like"
                >
                  <ThumbsUpIcon className={`w-5 h-5 ${liked ? 'fill-sky-600 dark:fill-sky-400' : ''}`} />
                  <span>{formatCount(mockLikeCount)}</span>
                </button>
                <div className="h-5 w-px bg-neutral-300 dark:bg-neutral-600/80"></div>
                <button 
                  onClick={handleDislike}
                  className={`hover:bg-neutral-200 dark:hover:bg-neutral-700/70 px-3 py-2 rounded-r-full text-sm font-medium transition-colors
                    ${disliked ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20' : 'text-neutral-800 dark:text-neutral-50'}`}
                  aria-pressed={disliked}
                  title="Dislike"
                >
                  <ThumbsDownIcon className={`w-5 h-5 ${disliked ? 'fill-red-600 dark:fill-red-400' : ''}`} />
                </button>
              </div>
              <div className="relative">
                <button onClick={handleShare} className="flex items-center space-x-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-50 px-3.5 py-2 rounded-full text-sm font-medium transition-colors" aria-label="Share this video" title="Share">
                  <ShareIcon className="w-5 h-5" />
                  <span>Share</span>
                </button>

                {isShareModalOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-50 animate-fade-in-fast">
                    <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                      <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">Share</h3>
                      <button onClick={() => setIsShareModalOpen(false)} className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700" aria-label="Close share modal">
                        <XMarkIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-300" />
                      </button>
                    </div>

                    <div className="p-4 space-y-4">
                      <div className="flex space-x-3">
                        <button onClick={() => handleShareToSocial('twitter')} className="flex flex-col items-center p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                            <span className="text-white font-bold text-sm">T</span>
                          </div>
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">Twitter</span>
                        </button>
                        <button onClick={() => handleShareToSocial('facebook')} className="flex flex-col items-center p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                            <span className="text-white font-bold text-sm">f</span>
                          </div>
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">Facebook</span>
                        </button>
                        <button onClick={() => handleShareToSocial('reddit')} className="flex flex-col items-center p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mb-2">
                            <span className="text-white font-bold text-sm">R</span>
                          </div>
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">Reddit</span>
                        </button>
                        <button onClick={() => handleShareToSocial('email')} className="flex flex-col items-center p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                          <div className="w-10 h-10 bg-neutral-500 rounded-full flex items-center justify-center mb-2">
                            <span className="text-white font-bold text-sm">@</span>
                          </div>
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">Email</span>
                        </button>
                      </div>

                      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={window.location.href}
                            readOnly
                            className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-neutral-50 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                          />
                          <button
                            onClick={handleCopyLink}
                            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-sm font-medium rounded-md transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                        {shareMessage && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-2">{shareMessage}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button 
                  ref={saveButtonRef}
                  onClick={openSaveModal} 
                  disabled={saveModalLoading}
                  className="flex items-center space-x-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-50 px-3.5 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-60" 
                  aria-label="Save this video to a playlist" 
                  title={isSavedToAnyList ? "Edit saved playlists" : "Save to playlist"}
                >
                  {isSavedToAnyList ? <SaveIconFilled className="w-5 h-5" /> : <SaveIcon className="w-5 h-5" />}
                  <span>{isSavedToAnyList ? 'Saved' : 'Save'}</span>
                </button>

                {isSaveModalOpen && (
                  <div 
                    ref={saveModalRef} 
                    className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-50 flex flex-col animate-fade-in-fast"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="save-to-playlist-title"
                  >
                    <div className="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-700">
                      <h3 id="save-to-playlist-title" className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                        {isCreatingPlaylistInModal ? 'Create new playlist' : 'Save to...'}
                      </h3>
                      <button onClick={() => { setIsSaveModalOpen(false); setIsCreatingPlaylistInModal(false); }} className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700" aria-label="Close save to playlist modal">
                        <XMarkIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-300" />
                      </button>
                    </div>

                    {isCreatingPlaylistInModal ? (
                        <form onSubmit={handleCreatePlaylistInModal} className="p-3 space-y-3">
                            <input 
                                type="text"
                                value={newPlaylistNameInModal}
                                onChange={(e) => { setNewPlaylistNameInModal(e.target.value); setCreatePlaylistErrorInModal(null); }}
                                placeholder="Enter playlist name..."
                                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-sm"
                                maxLength={100}
                                autoFocus
                            />
                            {createPlaylistErrorInModal && <p className="text-xs text-red-500 dark:text-red-400">{createPlaylistErrorInModal}</p>}
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">Privacy: Public (mock)</div>
                            <div className="flex justify-end space-x-2 pt-1">
                                <button type="button" onClick={() => setIsCreatingPlaylistInModal(false)} className="px-3 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700/70 rounded-md">Cancel</button>
                                <button type="submit" disabled={!newPlaylistNameInModal.trim()} className="px-3 py-1.5 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500 rounded-md disabled:opacity-60">Create</button>
                            </div>
                        </form>
                    ) : (
                      <>
                        <ul className="py-1 px-1 max-h-60 overflow-y-auto">
                          <li>
                            <label className="flex items-center px-2 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-700/70 rounded-md cursor-pointer transition-colors">
                              <input type="checkbox" checked={isInWatchLater} onChange={handleToggleWatchLaterInModal}
                                className="w-5 h-5 text-blue-600 bg-neutral-100 border-neutral-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-neutral-800 focus:ring-2 dark:bg-neutral-700 dark:border-neutral-600 mr-3 accent-blue-500 dark:accent-blue-400" />
                              <span className="text-sm text-neutral-800 dark:text-neutral-100">Watch Later</span>
                            </label>
                          </li>
                          {userPlaylistsForModal.map(playlist => (
                            <li key={playlist.id}>
                              <label className="flex items-center px-2 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-700/70 rounded-md cursor-pointer transition-colors">
                                <input type="checkbox" checked={videoPlaylistMemberships.includes(playlist.id)} onChange={() => handleTogglePlaylistInModal(playlist.id)}
                                  className="w-5 h-5 text-blue-600 bg-neutral-100 border-neutral-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-neutral-800 focus:ring-2 dark:bg-neutral-700 dark:border-neutral-600 mr-3 accent-blue-500 dark:accent-blue-400" />
                                <span className="text-sm text-neutral-800 dark:text-neutral-100 truncate" title={playlist.title}>{playlist.title}</span>
                              </label>
                            </li>
                          ))}
                        </ul>
                        <div className="p-2 border-t border-neutral-200 dark:border-neutral-700">
                          <button 
                            onClick={() => { setIsCreatingPlaylistInModal(true); setNewPlaylistNameInModal(''); setCreatePlaylistErrorInModal(null);}}
                            className="w-full flex items-center px-2 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors">
                            <PlusCircleIcon className="w-5 h-5 mr-2" /> Create new playlist
                          </button>
                        </div>
                         <div className="p-2 text-right border-t border-neutral-200 dark:border-neutral-700">
                            <button onClick={() => setIsSaveModalOpen(false)}
                                className="px-4 py-1.5 text-sm font-medium bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-md transition-colors">
                                Done
                            </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-neutral-100 dark:bg-neutral-800 p-3.5 rounded-lg text-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {channel && (
                  <Link to={channelLink} aria-label={`Go to ${channel.name} channel`}>
                    <img src={channel.avatarUrl} alt={`${channel.name} avatar`} className="w-10 h-10 rounded-full" />
                  </Link>
                )}
                <div>
                  {channel && (
                    <Link to={channelLink} className="font-semibold text-base text-neutral-900 dark:text-neutral-50 hover:text-neutral-700 dark:hover:text-neutral-200 block">
                      {video.channelName}
                    </Link>
                  )}
                  {channel && <p className="text-xs text-neutral-500 dark:text-neutral-400">{channel.subscribers}</p>}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleSubscribeToggle}
                  className={`text-sm font-medium px-4 py-2 rounded-full transition-colors shrink-0
                    ${isSubscribed 
                      ? 'bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200' 
                      : 'bg-neutral-900 dark:bg-neutral-50 hover:bg-neutral-700 dark:hover:bg-neutral-200 text-white dark:text-neutral-950'
                    }`}
                  title={isSubscribed ? `Unsubscribe from ${video.channelName}` : `Subscribe to ${video.channelName}`}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
                {isSubscribed && (
                   <button className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700/70 text-neutral-700 dark:text-neutral-200" aria-label="Manage notifications for this channel" title="Notifications">
                     <BellIcon className="w-5 h-5"/>
                   </button>
                )}
              </div>
            </div>
            <div 
                className={`text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed cursor-pointer ${!showFullDescription ? 'max-h-20 overflow-hidden' : ''}`}
                onClick={() => setShowFullDescription(!showFullDescription)}
                role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowFullDescription(!showFullDescription);}}
                aria-expanded={showFullDescription} aria-controls="video-description-content"
            >
              <div className="text-sm" id="video-description-content">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">{video.uploadedAt} &bull; {video.views.split(' ')[0]} views</span>
                <br/>
                {video.description}
              </div>
            </div>
             {(video.description.length > 150 || video.description.includes('\n')) && ( 
                 <span 
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowFullDescription(!showFullDescription);}}
                    className="text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-neutral-50 font-semibold mt-1.5 block cursor-pointer"
                  >
                   {showFullDescription ? 'Show less' : '...Show more'}
                 </span>
              )}
          </div>

          {canSummarize && (
            <div className="mt-4">
              <button
                onClick={handleSummarizeDescription}
                disabled={isSummarizing}
                className="flex items-center space-x-1.5 bg-sky-500/10 dark:bg-sky-400/10 hover:bg-sky-500/20 dark:hover:bg-sky-400/20 text-sky-700 dark:text-sky-300 px-3.5 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label="Summarize video description with AI" title="Summarize with AI"
              >
                <SummarizeIcon className="w-5 h-5" />
                <span>{isSummarizing ? 'Summarizing...' : '✨ Summarize Description'}</span>
              </button>
            </div>
          )}

          {summaryError && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 rounded-lg text-sm text-red-700 dark:text-red-300" role="alert">
              <strong>Error:</strong> {summaryError}
            </div>
          )}

          {summary && (
            <div className="mt-3 p-3.5 bg-sky-50 dark:bg-sky-900/40 border border-sky-200 dark:border-sky-700/60 rounded-lg">
              <h3 className="text-sm font-semibold text-sky-800 dark:text-sky-200 mb-1.5 flex items-center">
                <SummarizeIcon className="w-5 h-5 mr-1.5 text-sky-600 dark:text-sky-400" />
                AI Generated Summary
              </h3>
              <p className="text-sm text-neutral-700 dark:text-neutral-200 italic leading-relaxed whitespace-pre-wrap">{summary}</p>
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{commentCount} Comments</h2>
                <div className="flex items-center space-x-2 text-sm">
                    <button onClick={() => setCommentSortOrder('top')} className={`px-2 py-1 rounded-md ${commentSortOrder === 'top' ? 'bg-neutral-200 dark:bg-neutral-700 font-medium' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>Top</button>
                    <button onClick={() => setCommentSortOrder('newest')} className={`px-2 py-1 rounded-md ${commentSortOrder === 'newest' ? 'bg-neutral-200 dark:bg-neutral-700 font-medium' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>Newest</button>
                </div>
            </div>
            
            <div className="mb-6">
              <AddCommentForm
                currentUserAvatarUrl="https://picsum.photos/seed/currentUserComment/40/40"
                onCommentSubmit={handleMainCommentSubmitCallback}
                maxCommentLength={MAX_COMMENT_LENGTH}
              />
            </div>

            <div className="space-y-5">
              {sortedComments.map(comment => renderComment(comment))}
            </div>
          </div>
        </div>
      </div>

      <aside className="lg:w-[24rem] xl:w-[26rem] flex-shrink-0 space-y-2.5 lg:pt-0 bg-white dark:bg-neutral-950">
        <div className="sticky top-[calc(3.5rem)] z-10 bg-white dark:bg-neutral-950 pt-1 pb-2"> 
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 hidden lg:block">Up next</h2>
        </div>
        <div className="lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto pr-1 space-y-2.5 no-scrollbar"> 
          {displayedRelatedVideos.map(relatedVideo => (
            <Link key={relatedVideo.id} to={`/watch/${relatedVideo.id}`} className="block group" aria-label={`Watch related video: ${relatedVideo.title}`}>
              <div className="flex space-x-2 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 rounded-lg transition-colors">
                <div className="w-2/5 sm:w-1/3 lg:w-[168px] aspect-video flex-shrink-0 relative">
                  <img src={relatedVideo.thumbnailUrl} alt={`Thumbnail for ${relatedVideo.title}`} className="w-full h-full object-cover rounded-md" loading="lazy"/>
                  <div className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 py-0.5 rounded-sm">{relatedVideo.duration}</div>
                </div>
                <div className="flex-grow overflow-hidden pt-0.5">
                  <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-50 leading-snug max-h-10 overflow-hidden text-ellipsis whitespace-normal" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {relatedVideo.title}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 mt-1 truncate transition-colors">{relatedVideo.channelName}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {relatedVideo.views} &bull; {relatedVideo.uploadedAt}
                  </p>
                </div>
              </div>
            </Link>
          ))}
          {allRelatedVideos.length > RELATED_VIDEOS_INITIAL_COUNT && !showAllRelated && (
            <button 
              onClick={() => setShowAllRelated(true)}
              className="w-full mt-2 py-2 text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 rounded-lg transition-colors">
              Show more
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};

export default WatchPage;
