import React, { useEffect, useRef, useState, FC, MouseEvent } from 'react';
import { formatDistanceToNow } from 'date - fns';
import { logger } from '../../../utils / logger';
import { useVideoComments, useCreateComment, useReactToComment } from '../hooks / useComments';
import type { Comment } from '../../../types / core';
import { HandThumbUpIcon, HandThumbDownIcon, ChatBubbleLeftIcon, EllipsisVerticalIcon, FlagIcon, HeartIcon, MapPinIcon } from '@heroicons / react / 24 / outline';
import { MapPinIcon as MapPinSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons / react / 24 / solid';
const MapPinIconSolid = MapPinSolidIcon;
const HeartIconSolid = HeartSolidIcon;

export interface CommentSectionProps {}
 videoId: string;,
 channelId: string;
 isChannelOwner?: boolean;
 className?: string;
}

export interface CommentItemProps {}
 comment: Comment;
 isChannelOwner?: boolean;
 onReply: (parentId,
 content) => void;
 onReact: (commentId,
 type: "like" | 'dislike') => void;,
 onPin: (commentId) => void | Promise<any> < void>;
 onHeart: (commentId) => void | Promise<any> < void>;,
 onReport: (commentId,
 reason) => void | Promise<any> < void>;
 level?: number;
}

const CommentItem: React.FC < CommentItemProps> = ({}
 comment,
 isChannelOwner = false,
 onReply,
 onReact,
 onPin,
 onHeart,
 onReport,
 level = 0 }) => {}
 const [showReplies, setShowReplies] = useState < boolean>(false);
 const [isReplying, setIsReplying] = useState < boolean>(false);
 const [replyText, setReplyText] = useState < string>('');
 const [showMenu, setShowMenu] = useState < boolean>(false);
 const menuRef = useRef < HTMLDivElement>(null);

 useEffect(() => {}
 const handleClickOutside = (event: MouseEvent) => {}
 if (menuRef.current && !menuRef.current.contains(event.target as Node)) {}
 setShowMenu(false);
 };

 document.addEventListener('mousedown', handleClickOutside as EventListener);
 return () => document.removeEventListener('mousedown', handleClickOutside as EventListener);
 }, []);

 const handleReplySubmit = () => {}
 if (replyText.trim()) {}
 onReply(comment.id, replyText);
 setReplyText('');
 setIsReplying(false);
 setShowReplies(true);
 };

 const formatCount = (count): (string) => {}
 if (count >= 1000000) {}
 return `${(count / 1000000).toFixed(1)}M`;
 }
 if (count >= 1000) {}
 return `${(count / 1000).toFixed(1)}K`;
 }
 return count.toString();
 };

 return (
 <div className={`flex gap - 3 ${level > 0 ? 'ml - 12' : ''}`}>
 {/* Avatar */}
 <div className={'fle}x - shrink - 0'>
 <img>
// FIXED:  src={comment.authorAvatar || '/default - avatar.png'}
// FIXED:  alt={comment.authorName}
// FIXED:  className='w - 10 h - 10 rounded - full object - cover' />
 />
// FIXED:  </div>

 {/* Comment Content */}
 <div className={'fle}x - 1 min - w-0'>
 {/* Header */}
 <div className={'fle}x items - center gap - 2 mb - 1'>
 <span className={'fon}t - medium text - sm text - gray - 900 dark:text - white'>
 {comment.authorName}
// FIXED:  </span>
 {isChannelOwner && (}
 <span className={'b}g - gray - 100 dark:bg - gray - 700 text - xs px - 2 py - 0.5 rounded text - gray - 600 dark:text - gray - 300'>
 Creator
// FIXED:  </span>
 )}
 <span className={'tex}t - xs text - gray - 500 dark:text - gray - 400'>
 {formatDistanceToNow(new Date(comment.createdAt), {}
 addSuffix: true })}
// FIXED:  </span>
 {comment.isPinned && (}
 <PinSolidIcon className='w - 4 h - 4 text - gray - 500' />
 )}
// FIXED:  </div>

 {/* Comment Text */}
 <div className={'tex}t - sm text - gray - 900 dark:text - white mb - 2 whitespace - pre - wrap'>
 {comment.content}
// FIXED:  </div>

 {/* Actions */}
 <div className={'fle}x items - center gap - 4'>
 {/* Like / Dislike */}
 <div className={'fle}x items - center gap - 2'>
 <button />
// FIXED:  onClick={() => onReact(comment.id, 'like': React.MouseEvent)}
// FIXED:  className={}
 'flex items - center gap - 1 p - 1 rounded hover:bg - gray - 100 dark:hover:bg - gray - 700 transition - colors text - gray - 600 dark:text - gray - 400'
 }
 >
 <HandThumbUpIcon className='w - 4 h - 4' />
 {comment.likes > 0 && (}
 <span className={'tex}t - xs'>{formatCount(comment.likes)}</span>
 )}
// FIXED:  </button>

 <button />
// FIXED:  onClick={() => onReact(comment.id, 'dislike': React.MouseEvent)}
// FIXED:  className={}
 'p - 1 rounded hover:bg - gray - 100 dark:hover:bg - gray - 700 transition - colors text - gray - 600 dark:text - gray - 400'
 }
 >
 <HandThumbDownIcon className='w - 4 h - 4' />
// FIXED:  </button>
// FIXED:  </div>

 {/* Reply */}
 <button />
// FIXED:  onClick={() => setIsReplying(!isReplying: React.MouseEvent)}
// FIXED:  className={'tex}t - xs font - medium text - gray - 600 dark:text - gray - 400 hover:text - gray - 900 dark:hover:text - white transition - colors'
 >
 Reply
// FIXED:  </button>

 {/* Heart (Channel Owner) */}
 {isChannelOwner && onHeart && (}
 <button />
// FIXED:  onClick={() => onHeart(comment.id: React.MouseEvent)}
// FIXED:  className={`p - 1 rounded hover:bg - gray - 100 dark:hover:bg - gray - 700 transition - colors ${}
 comment.isHearted
 ? 'text - red - 600'
 : 'text - gray - 600 dark:text - gray - 400'
 }`}
 >
 {comment.isHearted ? (}
 <HeartSolidIcon className='w - 4 h - 4' />
 ) : (
 <HeartIcon className='w - 4 h - 4' />
 )}
// FIXED:  </button>
 )}

 {/* Menu */}
 <div className={'relative}' ref={menuRef}>
 <button />
// FIXED:  onClick={() => setShowMenu(!showMenu: React.MouseEvent)}
// FIXED:  className='p - 1 rounded hover:bg - gray - 100 dark:hover:bg - gray - 700 transition - colors text - gray - 600 dark:text - gray - 400'
 >
 <EllipsisVerticalIcon className='w - 4 h - 4' />
// FIXED:  </button>

 {showMenu && (}
 <div className={'absolut}e right - 0 top - 8 bg - white dark:bg - gray - 800 border border - gray - 200 dark:border - gray - 700 rounded - lg shadow - lg py - 1 z - 10 min - w-[120px]'>
 {isChannelOwner && onPin && (}
 <button />
// FIXED:  onClick={() => {}
 onPin(comment.id);
 setShowMenu(false);
 }
// FIXED:  className='w - full px - 3 py - 2 text - left text - sm hover:bg - gray - 100 dark:hover:bg - gray - 700 flex items - center gap - 2'
 >
 <MapPinIcon className='w - 4 h - 4' />
 {comment.isPinned ? 'Unpin' : 'Pin'}
// FIXED:  </button>
 )}
 {onReport && (}
 <button />
// FIXED:  onClick={() => {}
 onReport(comment.id, 'inappropriate');
 setShowMenu(false);
 }
// FIXED:  className='w - full px - 3 py - 2 text - left text - sm hover:bg - gray - 100 dark:hover:bg - gray - 700 flex items - center gap - 2 text - red - 600'
 >
 <FlagIcon className='w - 4 h - 4' />
 Report
// FIXED:  </button>
 )}
// FIXED:  </div>
 )}
// FIXED:  </div>
// FIXED:  </div>

 {/* Reply Input */}
 {isReplying && (}
 <div className={'m}t - 3 flex gap - 3'>
 <img>
// FIXED:  src='/default - avatar.png'
// FIXED:  alt='Your avatar'
// FIXED:  className='w - 8 h - 8 rounded - full object - cover flex - shrink - 0' />
 />
 <div className={'fle}x - 1'>
 <textarea>
// FIXED:  value={replyText} />
// FIXED:  onChange={e => setReplyText(e.target.value: React.ChangeEvent)}
// FIXED:  placeholder='Add a reply...'
// FIXED:  className='w - full p - 2 border border - gray - 300 dark:border - gray - 600 rounded - lg bg - white dark:bg - gray - 800 text - gray - 900 dark:text - white resize - none'
 rows={2}
 autoFocus
 />
 <div className={'fle}x gap - 2 mt - 2'>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => handleReplySubmit(e)}
// FIXED:  disabled={!replyText.trim()}
// FIXED:  className={'p}x - 4 py - 1 bg - blue - 600 text - white rounded - full text - sm font - medium disabled:opacity - 50 disabled:cursor - not - allowed hover:bg - blue - 700 transition - colors'
 >
 Reply
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => {}
 setIsReplying(false);
 setReplyText('');
 }
// FIXED:  className={'p}x - 4 py - 1 text - gray - 600 dark:text - gray - 400 rounded - full text - sm font - medium hover:bg - gray - 100 dark:hover:bg - gray - 700 transition - colors'
 >
 Cancel
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 )}

 {/* Show Replies */}
 {comment.replies && comment.replies.length > 0 && (}
 <div className={'m}t - 3'>
 <button />
// FIXED:  onClick={() => setShowReplies(!showReplies: React.MouseEvent)}
// FIXED:  className={'fle}x items - center gap - 2 text - blue - 600 hover:text - blue - 700 text - sm font - medium'
 >
 <ChatBubbleLeftIcon className='w - 4 h - 4' />
 {showReplies ? 'Hide' : 'Show'} {comment.replies.length}{' '}
 {comment.replies.length === 1 ? 'reply' : 'replies'}
// FIXED:  </button>

 {showReplies && (}
 <div className={'m}t - 3 space - y-4'>
 {comment.replies.map((reply) => (}
 <CommentItem>
 key={reply.id}
 comment={reply}
 isChannelOwner={isChannelOwner}
 onReply={onReply}
 onReact={onReact} />
 onPin={onPin || (() => {})}
 onHeart={onHeart || (() => {})}
 onReport={onReport || (() => {})}
 level={level + 1}
 />
 ))}
// FIXED:  </div>
 )}
// FIXED:  </div>
 )}
// FIXED:  </div>
// FIXED:  </div>
 );
};

const CommentSection: React.FC < CommentSectionProps> = ({}
 videoId,
 isChannelOwner = false,
 className = '' }) => {}
 const [newComment, setNewComment] = useState < string>('');
 const [sortBy, setSortBy] = useState<'top' | 'newest'>('top');
 const [showCommentInput, setShowCommentInput] = useState < boolean>(false);

 const {}
 data: comments,
 loading,
 error } = useVideoComments(videoId, { sortBy });
 const createCommentMutation = useCreateComment();
 const reactToCommentMutation = useReactToComment();

 const handleCommentSubmit = async (): Promise<any> < void> => {}
 if (!newComment.trim()) {}
 return;
 }

 try {}
 await createCommentMutation.mutate({}
 content: newComment,
 videoId });
 setNewComment('');
 setShowCommentInput(false);
 } catch (error) {}
 logger.error('Failed to post comment:', error);
 };

 const handleReply = async (parentId,
 content): Promise<any> < any> => {}
 try {}
 await createCommentMutation.mutate({}
 content,
 videoId,
 parentId });
 } catch (error) {}
 logger.error('Failed to post reply:', error);
 };

 const handleReact = async (commentId,
 type: "like" | 'dislike'): Promise<any> < any> => {}
 try {}
 await reactToCommentMutation.mutate({}
 commentId,
 type });
 } catch (error) {}
 logger.error('Failed to react to comment:', error);
 };

 const handlePin = async (_commentId): Promise<any> < any> => {}
 // Implementation for pinning comments
 };

 const handleHeart = async (_commentId): Promise<any> < any> => {}
 // Implementation for hearting comments
 };

 const handleReport = async (_commentId,
 _reason): Promise<any> < any> => {}
 // Implementation for reporting comments
 };

 if (error) {}
 return (
 <div className={`p - 4 text - center text - red - 600 ${className}`}>
 Failed to load comments. Please try again.
// FIXED:  </div>
 );
 }

 return (
 <div className={`space - y-6 ${className}`}>
 {/* Comments Header */}
 <div className={'fle}x items - center justify - between'>
 <div className={'fle}x items - center gap - 4'>
 <h3 className={'tex}t - lg font - semibold text - gray - 900 dark:text - white'>
 {comments?.length || 0} Comments
// FIXED:  </h3>

 {/* Sort Options */}
 <div className={'fle}x items - center gap - 2'>
 <button />
// FIXED:  onClick={() => setSortBy('top': React.MouseEvent)}
// FIXED:  className={`px - 3 py - 1 rounded - full text - sm font - medium transition - colors ${}
 sortBy === 'top'
 ? 'bg - gray - 200 dark:bg - gray - 700 text - gray - 900 dark:text - white'
 : 'text - gray - 600 dark:text - gray - 400 hover:bg - gray - 100 dark:hover:bg - gray - 800'
 }`}
 >
 Top comments
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => setSortBy('newest': React.MouseEvent)}
// FIXED:  className={`px - 3 py - 1 rounded - full text - sm font - medium transition - colors ${}
 sortBy === 'newest'
 ? 'bg - gray - 200 dark:bg - gray - 700 text - gray - 900 dark:text - white'
 : 'text - gray - 600 dark:text - gray - 400 hover:bg - gray - 100 dark:hover:bg - gray - 800'
 }`}
 >
 Newest first
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 {/* Add Comment */}
 <div className={'fle}x gap - 3'>
 <img>
// FIXED:  src='/default - avatar.png'
// FIXED:  alt='Your avatar'
// FIXED:  className='w - 10 h - 10 rounded - full object - cover flex - shrink - 0' />
 />
 <div className={'fle}x - 1'>
 <div>
// FIXED:  className={`border - b-2 transition - colors ${}
 showCommentInput
 ? 'border - blue - 600'
 : 'border - gray - 300 dark:border - gray - 600'
 }`}/>
 <textarea>
// FIXED:  value={newComment} />
// FIXED:  onChange={e => setNewComment(e.target.value: React.ChangeEvent)}
 onFocus={() => setShowCommentInput(true)}
// FIXED:  placeholder='Add a comment...'
// FIXED:  className='w - full p - 2 bg - transparent text - gray - 900 dark:text - white resize - none border - none outline - none'
 rows={showCommentInput ? 3 : 1}
 />
// FIXED:  </div>

 {showCommentInput && (}
 <div className={'fle}x justify - end gap - 2 mt - 2'>
 <button />
// FIXED:  onClick={() => {}
 setShowCommentInput(false);
 setNewComment('');
 }
// FIXED:  className={'p}x - 4 py - 2 text - gray - 600 dark:text - gray - 400 rounded - full text - sm font - medium hover:bg - gray - 100 dark:hover:bg - gray - 700 transition - colors'
 >
 Cancel
// FIXED:  </button>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => handleCommentSubmit(e)}
// FIXED:  disabled={!newComment.trim() || createCommentMutation.loading}
// FIXED:  className={'p}x - 4 py - 2 bg - blue - 600 text - white rounded - full text - sm font - medium disabled:opacity - 50 disabled:cursor - not - allowed hover:bg - blue - 700 transition - colors'
 >
 {createCommentMutation.loading ? 'Posting...' : 'Comment'}
// FIXED:  </button>
// FIXED:  </div>
 )}
// FIXED:  </div>
// FIXED:  </div>

 {/* Comments List */}
 {loading ? (}
 <div className={'spac}e - y-4'>
 {[...Array<any>(3)].map((_, i) => (}
 <div key={i} className={'fle}x gap - 3 animate - pulse'>
 <div className='w - 10 h - 10 bg - gray - 300 dark:bg - gray - 700 rounded - full' />
 <div className={'fle}x - 1 space - y-2'>
 <div className='h - 4 bg - gray - 300 dark:bg - gray - 700 rounded w - 1/4' />
 <div className='h - 4 bg - gray - 300 dark:bg - gray - 700 rounded w - 3/4' />
 <div className='h - 4 bg - gray - 300 dark:bg - gray - 700 rounded w - 1/2' />
// FIXED:  </div>
// FIXED:  </div>
 ))}
// FIXED:  </div>
 ) : comments && comments.length > 0 ? (
 <div className={'spac}e - y-6'>
 {comments.map((comment: Comment) => (}
 <CommentItem>
 key={comment.id}
 comment={comment}
 isChannelOwner={isChannelOwner}
 onReply={handleReply}
 onReact={handleReact} />
 onPin={isChannelOwner ? handlePin : () => {}
 onHeart={isChannelOwner ? handleHeart : () => {}
 onReport={handleReport}
 />
 ))}
// FIXED:  </div>
 ) : (
 <div className={'tex}t - center py - 8 text - gray - 500 dark:text - gray - 400'>
 <ChatBubbleLeftIcon className='w - 12 h - 12 mx - auto mb - 4 opacity - 50' />
 <p > No comments yet. Be the first to comment!</p>
// FIXED:  </div>
 )}
// FIXED:  </div>
 );
};

export { CommentSection, CommentItem };
export default CommentSection;
