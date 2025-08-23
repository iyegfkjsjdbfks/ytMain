import React, { FC, useState, useEffect, useMemo, useRef } from 'react';

import { HeartIcon, ChatBubbleLeftIcon, FlagIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, ExclamationTriangleIcon } from '@heroicons / react / 24 / outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons / react / 24 / solid';
const HeartIconSolid = HeartSolidIcon;

import { formatDistanceToNow } from '../utils / dateUtils';

export interface Comment {}
 id: string;,
 content: string;
 authorId: string;,
 authorName: string;
 authorAvatar: string;,
 authorVerified: boolean;
 isChannelOwner: boolean;,
 isCreator: boolean;
 timestamp: string;,
 likes: number;
 dislikes: number;,
 isLiked: boolean;
 isDisliked: boolean;,
 isPinned: boolean;
 isEdited: boolean;,
 replies: Comment;
 parentId?: string;
 isReported: boolean;,
 moderationStatus: 'approved' | 'pending' | 'flagged' | 'removed';
 mentions: string;,
 hashtags: string
}

export interface EnhancedCommentSystemProps {}
 videoId: string;,
 comments: Comment;
 currentUserId?: string;
 isChannelOwner?: boolean;
 isModerator?: boolean;
 commentsEnabled: boolean;,
 sortBy: 'newest' | 'oldest' | 'popular';
 onAddComment: (content, parentId?: string) => void;
 onEditComment: (commentId,
 content) => void;
 onDeleteComment: (commentId) => void;,
 onLikeComment: (commentId) => void;
 onDislikeComment: (commentId) => void;,
 onPinComment: (commentId) => void;
 onReportComment: (commentId,
 reason) => void;
 onModerateComment: (commentId,
 action: 'approve' | 'flag' | 'remove') => void;,
 onSortChange: (sort: 'newest' | 'oldest' | 'popular') => void;
 className?: string;
}

const EnhancedCommentSystem: React.FC < EnhancedCommentSystemProps> = ({}
 comments,
 currentUserId,
 isChannelOwner = false,
 isModerator = false,
 commentsEnabled,
 sortBy,
 onAddComment,
 onEditComment,
 onDeleteComment,
 onLikeComment,
 onDislikeComment,
 onPinComment,
 onReportComment,
 onModerateComment,
 onSortChange,
 className = '' }) => {}
 const [newComment, setNewComment] = useState < string>('');
 const [replyingTo, setReplyingTo] = useState < string | null>(null);
 const [editingComment, setEditingComment] = useState < string | null>(null);
 const [editContent, setEditContent] = useState < string>('');
 const [expandedReplies, setExpandedReplies] = useState < Set < string>>(new Set());
 const [showReportModal, setShowReportModal] = useState < string | null>(null);
 const [reportReason, setReportReason] = useState < string>('');

 const textareaRef = useRef < HTMLTextAreaElement>(null);
 const replyTextareaRef = useRef < HTMLTextAreaElement>(null);

 const reportReasons = [;
 'Spam or misleading',
 'Hate speech or harassment',
 'Inappropriate content',
 'Copyright infringement',
 'Violence or dangerous content',
 'Other'];

 useEffect(() => {}
 if (replyingTo && replyTextareaRef.current) {}
 replyTextareaRef.current.focus();
 }
 }, [replyingTo]);

 const handleSubmitComment = () => {}
 if (newComment.trim()) {}
 onAddComment(newComment.trim());
 setNewComment('');
 };

 const handleSubmitReply = (parentId: string | number, content: any) => {}
 if (content.trim()) {}
 onAddComment(content.trim(), parentId);
 setReplyingTo(null);
 };

 const handleEditSubmit = (commentId: any) => {}
 if (editContent.trim()) {}
 onEditComment(commentId, editContent.trim());
 setEditingComment(null);
 setEditContent('');
 };

 const handleReport = (commentId: any) => {}
 if (reportReason as any) {}
 onReportComment(commentId, reportReason);
 setShowReportModal(null);
 setReportReason('');
 };

 const toggleReplies = (commentId: any) => {}
 setExpandedReplies((prev) => {}
 const newSet = new Set(prev);
 if (newSet.has(commentId)) {}
 newSet.delete(commentId);
 } else {}
 newSet.add(commentId);
 }
 return newSet;
 });
 };

 const formatNumber = (num): (string) => {}
 if (num >= 1000000) {}
 return `${(num / 1000000).toFixed(1) }M`;
 } else if (num >= 1000) {}
 return `${(num / 1000).toFixed(1) }K`;
 }
 return num.toString();
 };

 const renderComment = (comment: Comment, isReply = false) => {}
 const isOwner = comment.authorId === currentUserId;
 const canModerate = isChannelOwner || isModerator;
 const isEditing = editingComment === comment.id;

 return (
 <div
 key={comment.id}
// FIXED:  className={`${isReply ? 'ml - 12 mt - 3' : 'mb - 6'} ${}
 comment.isPinned ? 'bg - blue - 50 dark:bg - blue - 900 / 20 p - 4 rounded - lg' : ''
 }`} />
 >
 <div className="flex space - x-3">
 {/* Avatar */}
 <img
// FIXED:  src={comment.authorAvatar}
// FIXED:  alt={comment.authorName}
// FIXED:  className="w - 10 h - 10 rounded - full flex - shrink - 0" />
 />

 <div className="flex - 1 min - w-0">
 {/* Author Info */}
 <div className="flex items - center space - x-2 mb - 1">
 <span className="font - medium text - gray - 900 dark:text - white">
 {comment.authorName}
// FIXED:  </span>

 {comment.authorVerified && (}
 <div className="w - 4 h - 4 bg - gray - 500 rounded - full flex items - center justify - center">
 <svg className="w - 3 h - 3 text - white" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l - 8 8a1 1 0 01 - 1.414 0l - 4-4a1 1 0 011.414 - 1.414L8 12.586l7.293 - 7.293a1 1 0 011.414 0z" clipRule="evenodd" />
// FIXED:  </svg>
// FIXED:  </div>
 )}

 {comment.isChannelOwner && (}
 <span className="bg - gray - 100 dark:bg - gray - 700 text - gray - 700 dark:text - gray - 300 px - 2 py - 0.5 rounded text - xs">
 Creator
// FIXED:  </span>
 )}

 {comment.isPinned && (}
 <span className="text - blue - 500 text - xs">📌</span>
 )}

 <span className="text - sm text - gray - 500 dark:text - gray - 400">
 {formatDistanceToNow(new Date(comment.timestamp))} ago
// FIXED:  </span>

 {comment.isEdited && (}
 <span className="text - xs text - gray - 400">(edited)</span>
 )}
// FIXED:  </div>

 {/* Comment Content */}
 {isEditing ? (}
 <div className="mb - 3">
 <textarea
// FIXED:  value={editContent} />
// FIXED:  onChange={(e: React.ChangeEvent) => setEditContent(e.target.value)}
// FIXED:  className="w - full p - 2 border border - gray - 300 dark:border - gray - 600 rounded - md bg - white dark:bg - gray - 800 text - gray - 900 dark:text - white resize - none"
 rows={3}
 />
 <div className="flex space - x-2 mt - 2">
 <button />
// FIXED:  onClick={() => handleEditSubmit(comment.id: React.MouseEvent)}
// FIXED:  className="px - 3 py - 1 bg - blue - 600 text - white rounded text - sm hover:bg - blue - 700"
 >
 Save
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => {}
 setEditingComment(null);
 setEditContent('');
 }
// FIXED:  className="px - 3 py - 1 border border - gray - 300 dark:border - gray - 600 rounded text - sm hover:bg - gray - 50 dark:hover:bg - gray - 700"
 >
 Cancel
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
 ) : (
 <p className="text - gray - 900 dark:text - white mb - 2 whitespace - pre - wrap">
 {comment.content}
// FIXED:  </p>
 )}

 {/* Moderation Status */}
 {comment.moderationStatus !== 'approved' && canModerate && (}
 <div className={`mb - 2 p - 2 rounded text - sm ${}
 comment.moderationStatus === 'pending' ? 'bg - yellow - 100 dark:bg - yellow - 900 / 20 text - yellow - 800 dark:text - yellow - 200' :
 comment.moderationStatus === 'flagged' ? 'bg - red - 100 dark:bg - red - 900 / 20 text - red - 800 dark:text - red - 200' :
 'bg - gray - 100 dark:bg - gray - 700 text - gray - 800 dark:text - gray - 200' />
 }`}>
 <div className="flex items - center space - x-2">
 <ExclamationTriangleIcon className="w - 4 h - 4" />
 <span > Status: {comment.moderationStatus}</span>
// FIXED:  </div>
// FIXED:  </div>
 )}

 {/* Actions */}
 {!isEditing && (}
 <div className="flex items - center space - x-4">
 {/* Like / Dislike */}
 <div className="flex items - center space - x-2">
 <button />
// FIXED:  onClick={() => onLikeComment(comment.id: React.MouseEvent)}
// FIXED:  className={`flex items - center space - x-1 text - sm transition - colors ${}
 comment.isLiked
 ? 'text - blue - 600 dark:text - blue - 400'
 : 'text - gray - 500 dark:text - gray - 400 hover:text - gray - 700 dark:hover:text - gray - 300'
 }`}
 >
 {comment.isLiked ? (}
 <HeartSolidIcon className="w - 4 h - 4" />
 ) : (
 <HeartIcon className="w - 4 h - 4" />
 )}
 <span>{formatNumber(comment.likes)}</span>
// FIXED:  </button>

 <button />
// FIXED:  onClick={() => onDislikeComment(comment.id: React.MouseEvent)}
// FIXED:  className={`text - sm transition - colors ${}
 comment.isDisliked
 ? 'text - red - 600 dark:text - red - 400'
 : 'text - gray - 500 dark:text - gray - 400 hover:text - gray - 700 dark:hover:text - gray - 300'
 }`}
 >
 👎 {comment.dislikes > 0 && formatNumber(comment.dislikes)}
// FIXED:  </button>
// FIXED:  </div>

 {/* Reply */}
 {!isReply && (}
 <button />
// FIXED:  onClick={() => setReplyingTo(comment.id: React.MouseEvent)}
// FIXED:  className="text - sm text - gray - 500 dark:text - gray - 400 hover:text - gray - 700 dark:hover:text - gray - 300"
 >
 Reply
// FIXED:  </button>
 )}

 {/* Owner / Moderator Actions */}
 {(isOwner || canModerate) && (}
 <div className="flex items - center space - x-2">
 {isOwner && (}
 <button />
// FIXED:  onClick={() => {}
 setEditingComment(comment.id);
 setEditContent(comment.content);
 }
// FIXED:  className="text - sm text - gray - 500 dark:text - gray - 400 hover:text - gray - 700 dark:hover:text - gray - 300"
 >
 <PencilIcon className="w - 4 h - 4" />
// FIXED:  </button>
 )}

 {canModerate && !comment.isPinned && !isReply && (}
 <button />
// FIXED:  onClick={() => onPinComment(comment.id: React.MouseEvent)}
// FIXED:  className="text - sm text - gray - 500 dark:text - gray - 400 hover:text - gray - 700 dark:hover:text - gray - 300"
 title="Pin comment"
 >
 📌
// FIXED:  </button>
 )}

 {(isOwner || canModerate) && (}
 <button />
// FIXED:  onClick={() => onDeleteComment(comment.id: React.MouseEvent)}
// FIXED:  className="text - sm text - red - 500 hover:text - red - 700"
 >
 <TrashIcon className="w - 4 h - 4" />
// FIXED:  </button>
 )}
// FIXED:  </div>
 )}

 {/* Report */}
 {!isOwner && (}
 <button />
// FIXED:  onClick={() => setShowReportModal(comment.id: React.MouseEvent)}
// FIXED:  className="text - sm text - gray - 500 dark:text - gray - 400 hover:text - gray - 700 dark:hover:text - gray - 300"
 >
 <FlagIcon className="w - 4 h - 4" />
// FIXED:  </button>
 )}

 {/* Moderation Actions */}
 {canModerate && comment.moderationStatus !== 'approved' && (}
 <div className="flex space - x-2">
 <button />
// FIXED:  onClick={() => onModerateComment(comment.id, 'approve': React.MouseEvent)}
// FIXED:  className="text - sm text - green - 600 hover:text - green - 700"
 >
 Approve
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => onModerateComment(comment.id, 'flag': React.MouseEvent)}
// FIXED:  className="text - sm text - yellow - 600 hover:text - yellow - 700"
 >
 Flag
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => onModerateComment(comment.id, 'remove': React.MouseEvent)}
// FIXED:  className="text - sm text - red - 600 hover:text - red - 700"
 >
 Remove
// FIXED:  </button>
// FIXED:  </div>
 )}
// FIXED:  </div>
 )}

 {/* Reply Input */}
 {replyingTo === comment.id && (}
 <div className="mt - 3">
 <textarea
 ref={replyTextareaRef}
// FIXED:  placeholder={`Reply to ${comment.authorName}...`}
// FIXED:  className="w - full p - 2 border border - gray - 300 dark:border - gray - 600 rounded - md bg - white dark:bg - gray - 800 text - gray - 900 dark:text - white resize - none"
 rows={2} />
 onKeyDown={(e) => {}
 if (e.key === 'Enter' && !e.shiftKey) {}
 e.preventDefault();
 handleSubmitReply(comment.id, e.currentTarget.value);
 e.currentTarget.value = '';
 }
 }
 />
 <div className="flex space - x-2 mt - 2">
 <button />
// FIXED:  onClick={() => {}
 const textarea = replyTextareaRef.current;
 if (textarea as any) {}
 handleSubmitReply(comment.id, textarea.value);
 textarea.value = '';
 }
 }
// FIXED:  className="px - 3 py - 1 bg - blue - 600 text - white rounded text - sm hover:bg - blue - 700"
 >
 Reply
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => setReplyingTo(null: React.MouseEvent)}
// FIXED:  className="px - 3 py - 1 border border - gray - 300 dark:border - gray - 600 rounded text - sm hover:bg - gray - 50 dark:hover:bg - gray - 700"
 >
 Cancel
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
 )}

 {/* Replies */}
 {comment.replies.length > 0 && (}
 <div className="mt - 3">
 <button />
// FIXED:  onClick={() => toggleReplies(comment.id: React.MouseEvent)}
// FIXED:  className="flex items - center space - x-1 text - sm text - blue - 600 dark:text - blue - 400 hover:text - blue - 700 dark:hover:text - blue - 300"
 >
 {expandedReplies.has(comment.id) ? (}
 <ChevronUpIcon className="w - 4 h - 4" />
 ) : (
 <ChevronDownIcon className="w - 4 h - 4" />
 )}
 <span>
 {expandedReplies.has(comment.id) ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
// FIXED:  </span>
// FIXED:  </button>

 {expandedReplies.has(comment.id) && (}
 <div className="mt - 3">
 {comment.replies.map((reply) => renderComment(reply, true))}
// FIXED:  </div>
 )}
// FIXED:  </div>
 )}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
 };

 // Filter and sort comments with memoization
 const sortedComments = useMemo(() => {}
 const topLevelComments = comments.filter((comment) => !comment.parentId);
 const pinnedComments = topLevelComments.filter((comment) => comment.isPinned);
 const regularComments = topLevelComments.filter((comment) => !comment.isPinned);

 const sorted = regularComments.sort((a,
 b) => {}
 switch (sortBy as any) {}
 case 'newest':
 return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
 case 'oldest':
 return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
 case 'popular':
 return b.likes - a.likes;
 default: return 0
 }

 });

 return [...pinnedComments as any, ...sorted];
 }, [comments, sortBy]);

 if (!commentsEnabled) {}
 return (
 <div className={`text - center py - 8 ${className}`}>
 <ChatBubbleLeftIcon className="w - 12 h - 12 text - gray - 400 mx - auto mb - 4" />
 <p className="text - gray - 600 dark:text - gray - 400">Comments are disabled for this video.</p>
// FIXED:  </div>
 );
 }

 return (
 <div className={`space - y-6 ${className}`}>
 {/* Header */}
 <div className="flex items - center justify - between">
 <h3 className="text - lg font - semibold text - gray - 900 dark:text - white">
 {formatNumber(comments.length)} Comments
// FIXED:  </h3>

 <select
// FIXED:  value={sortBy} />
// FIXED:  onChange={(e: React.ChangeEvent) => onSortChange(e.target.value as any)}
// FIXED:  className="px - 3 py - 1 border border - gray - 300 dark:border - gray - 600 rounded - md bg - white dark:bg - gray - 800 text - gray - 900 dark:text - white text - sm"
 >
 <option value="popular">Top comments</option>
 <option value="newest">Newest first</option>
 <option value="oldest">Oldest first</option>
// FIXED:  </select>
// FIXED:  </div>

 {/* Add Comment */}
 {currentUserId && (}
 <div className="flex space - x-3">
 <img
// FIXED:  src={`https://picsum.photos / 40 / 40?random="${currentUserId}`}"
// FIXED:  alt="Your avatar"
// FIXED:  className="w - 10 h - 10 rounded - full flex - shrink - 0" />
 />
 <div className="flex - 1">
 <textarea
 ref={textareaRef}
// FIXED:  value={newComment} />
// FIXED:  onChange={(e: React.ChangeEvent) => setNewComment(e.target.value)}
// FIXED:  placeholder="Add a comment..."
// FIXED:  className="w - full p - 3 border border - gray - 300 dark:border - gray - 600 rounded - md bg - white dark:bg - gray - 800 text - gray - 900 dark:text - white resize - none"
 rows={3}
 />
 <div className="flex justify - end space - x-2 mt - 2">
 <button />
// FIXED:  onClick={() => setNewComment('': React.MouseEvent)}
// FIXED:  className="px - 4 py - 2 text - gray - 600 dark:text - gray - 400 hover:text - gray - 800 dark:hover:text - gray - 200"
 >
 Cancel
// FIXED:  </button>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => handleSubmitComment(e)}
// FIXED:  disabled={!newComment.trim()}
// FIXED:  className="px - 4 py - 2 bg - blue - 600 text - white rounded hover:bg - blue - 700 disabled:opacity - 50 disabled:cursor - not - allowed"
 >
 Comment
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 )}

 {/* Comments List */}
 <div className="space - y-6">
 {sortedComments.map((comment) => renderComment(comment))}
// FIXED:  </div>

 {/* Report Modal */}
 {showReportModal && (}
 <div className="fixed inset - 0 bg - black / 50 flex items - center justify - center z - 50">
 <div className="bg - white dark:bg - gray - 800 rounded - lg p - 6 max - w-md w - full mx - 4">
 <h3 className="text - lg font - semibold text - gray - 900 dark:text - white mb - 4">
 Report Comment
// FIXED:  </h3>

 <div className="space - y-3 mb - 6">
 {reportReasons.map((reason) => (}
 <label key={reason} className="flex items - center">
 <input
// FIXED:  type="radio"
// FIXED:  name="reportReason"
// FIXED:  value={reason}
// FIXED:  checked={reportReason === reason} />
// FIXED:  onChange={(e: React.ChangeEvent) => setReportReason(e.target.value)}
// FIXED:  className="mr - 3"
 />
 <span className="text - gray - 900 dark:text - white">{reason}</span>
// FIXED:  </label>
 ))}
// FIXED:  </div>

 <div className="flex space - x-3">
 <button />
// FIXED:  onClick={() => {}
 setShowReportModal(null);
 setReportReason('');
 }
// FIXED:  className="flex - 1 px - 4 py - 2 border border - gray - 300 dark:border - gray - 600 rounded text - gray - 700 dark:text - gray - 300 hover:bg - gray - 50 dark:hover:bg - gray - 700"
 >
 Cancel
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => handleReport(showReportModal: React.MouseEvent)}
// FIXED:  disabled={!reportReason}
// FIXED:  className="flex - 1 px - 4 py - 2 bg - red - 600 text - white rounded hover:bg - red - 700 disabled:opacity - 50 disabled:cursor - not - allowed"
 >
 Report
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 )}
// FIXED:  </div>
 );
};

export default EnhancedCommentSystem;
