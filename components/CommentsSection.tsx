import React, { FC, useState, useRef } from 'react';

import { EllipsisHorizontalIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

import AddCommentForm from './AddCommentForm';
import ThumbsDownIcon from './icons/ThumbsDownIcon';
import ThumbsUpIcon from './icons/ThumbsUpIcon';
export interface Comment {
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
 replies?: Comment;
 replyCount?: number;
}

export interface CommentsSectionProps {
 comments: Comment;
 commentCount: number;
 commentSortOrder: 'top' | 'newest';
 replyingToCommentId: string | null;
 currentReplyText: string;
 editingComment: { id: string; parentId?: string } | null;
 activeCommentMenu: string | null;
 expandedReplies: Record<string, boolean>;
 maxCommentLength: number;
 onCommentSubmit: (commentText) => void;
 onReplySubmit: (parentId) => void;
 onEditSave: (commentId,
 newText, parentId?: string) => void;
 onDeleteComment: (commentId, parentId?: string) => void;
 onToggleLikeDislike: (id,
 parentId: string | undefined, action: 'like' | 'dislike') => void;
 onSortChange: (order: 'top' | 'newest') => void;
 onSetReplyingTo: (commentId: string | null, text?: string) => void;
 onSetCurrentReplyText: (text) => void;
 onSetEditingComment: (comment: { id: string; parentId?: string } | null) => void;
 onSetActiveCommentMenu: (commentId: string | null) => void;
 onSetExpandedReplies: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
 comments,
 commentCount,
 commentSortOrder,
 replyingToCommentId,
 currentReplyText,
 editingComment,
 activeCommentMenu,
 expandedReplies,
 maxCommentLength,
 onCommentSubmit,
 onReplySubmit,
 onEditSave,
 onDeleteComment,
 onToggleLikeDislike,
 onSortChange,
 onSetReplyingTo,
 onSetCurrentReplyText,
 onSetEditingComment,
 onSetActiveCommentMenu,
 onSetExpandedReplies }) => {
 const replyInputRef = useRef<HTMLInputElement>(null);
 const [editText, setEditText] = useState<string>('');

 const parseRelativeDate = (timestamp): number => {
 if (timestamp.includes('Just now') || timestamp.includes('edited')) {
return 0;
}
 const match = timestamp.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/);
 if (!match) {
return 0;
}

 const [ num, unit] = match;
 if (!num || !unit) {
return 0;
}
 const value = parseInt(num, 10);
 const multipliers = {
 second: 1,
 minute: 60,
 hour: 3600,
 day: 86400,
 week: 604800,
 month: 2592000,
 year: 31536000 };
 return value * (multipliers[unit as keyof typeof multipliers] || 0);
 };

 const sortedComments = [...comments].sort((a, b) => {
 if (commentSortOrder === 'top') {
 return b.likes - a.likes;
 }
 return parseRelativeDate(a.timestamp) - parseRelativeDate(b.timestamp);

 });

 const handleEditStart = (comment: Comment) => {
 onSetEditingComment({
 id: comment.id,
 ...(comment.parentId ? { parentId: comment.parentId } : {}) });
 setEditText(comment.commentText);
 onSetActiveCommentMenu(null);
 };

 const handleEditCancel = () => {
 onSetEditingComment(null);
 setEditText('');
 };

 const handleEditSave = () => {
 if (editingComment as any) {
 onEditSave(editingComment.id, editText, editingComment.parentId);
 setEditText('');
 };

 const renderComment = (comment: Comment, isReply = false): React.JSX.Element => {
 const isEditing = editingComment?.id === comment.id && editingComment?.parentId === comment.parentId;
 const isMenuOpen = activeCommentMenu === comment.id;

 return (
 <div key={comment.id} className={`flex items-start space-x-2.5 ${isReply ? 'ml-8' : ''}`}>
 <img
// FIXED:  src={comment.userAvatarUrl}
// FIXED:  alt={`${comment.userName} avatar`}
// FIXED:  className="w-9 h-9 rounded-full flex-shrink-0 mt-0.5" />
 />
 <div className="flex-grow min-w-0">
 <div className="flex items-center space-x-1.5 mb-1">
 <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
 {comment.userName}
// FIXED:  </span>
 <span className="text-xs text-neutral-500 dark:text-neutral-400">
 {comment.timestamp}
// FIXED:  </span>
 {comment.isEdited && (
 <span className="text-xs text-neutral-400 dark:text-neutral-500">(edited)</span>
 )}
// FIXED:  </div>

 {isEditing ? (
 <div className="space-y-2">
 <textarea
// FIXED:  value={editText} />
// FIXED:  onChange={(e) => setEditText(e.target.value)}
// FIXED:  className="w-full p-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 resize-none"
 rows={3}
 maxLength={maxCommentLength}
 />
 <div className="flex justify-between items-center">
 <span className={`text-xs ${ />
 editText.length > maxCommentLength
 ? 'text-red-500 dark:text-red-400'
 : 'text-neutral-500 dark:text-neutral-400'
 }`}>
 {editText.length}/{maxCommentLength}
// FIXED:  </span>
 <div className="space-x-2">
 <button />
// FIXED:  onClick={(e) => handleEditCancel(e)}
// FIXED:  className="px-3 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700/70 rounded-full"
 >
 Cancel
// FIXED:  </button>
 <button />
// FIXED:  onClick={(e) => handleEditSave(e)}
// FIXED:  disabled={!editText.trim() || editText.length > maxCommentLength}
// FIXED:  className="px-3 py-1 text-xs font-medium bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500 text-white rounded-full disabled:opacity-60"
 >
 Save
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 ) : (
 <>
 <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap break-words mb-2">
 {comment.replyTo && (
 <span className="text-sky-600 dark:text-sky-400 font-medium">@{comment.replyTo} </span>
 )}
 {comment.commentText}
// FIXED:  </p>

 <div className="flex items-center space-x-4 text-xs text-neutral-500 dark:text-neutral-400">
 <div className="flex items-center space-x-3">
 <div className="relative">
 {comment.userName === 'You' && (
 <button />
// FIXED:  onClick={() => onSetActiveCommentMenu(isMenuOpen ? null : comment.id)}
// FIXED:  className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700/70 text-neutral-500 dark:text-neutral-400"
// FIXED:  aria-label="Comment options"
 >
 <EllipsisHorizontalIcon className="w-4 h-4" />
// FIXED:  </button>
 )}
 {isMenuOpen && (
 <div className="absolute top-full left-0 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
 <button />
// FIXED:  onClick={() => handleEditStart(comment)}
// FIXED:  className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
 >
 Edit
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => onDeleteComment(comment.id, comment.parentId)}
// FIXED:  className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 text-red-600 dark:text-red-400"
 >
 Delete
// FIXED:  </button>
// FIXED:  </div>
 )}
// FIXED:  </div>
// FIXED:  </div>

 <button />
// FIXED:  onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 try {
 onToggleLikeDislike(comment.id, comment.parentId, 'like');
 } catch (error) {
 (console as any).error('Error toggling like:', error);
 }
 }
// FIXED:  className={`p-1 rounded-full transition-colors duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center space-x-1 ${
 comment.isLikedByCurrentUser
 ? 'text-sky-600 dark:text-sky-400'
 : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
 }`}
 title="Like comment"
// FIXED:  aria-pressed={comment.isLikedByCurrentUser}
// FIXED:  type="button"
 >
 <ThumbsUpIcon className={`w-4 h-4 ${
 comment.isLikedByCurrentUser ? 'fill-sky-600 dark:fill-sky-400' : '' />
 }`}/>
 {comment.likes > 0 && (
 <span className="text-xs font-medium">{comment.likes}</span>
 )}
// FIXED:  </button>

 <button />
// FIXED:  onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 try {
 onToggleLikeDislike(comment.id, comment.parentId, 'dislike');
 } catch (error) {
 (console as any).error('Error toggling dislike:', error);
 }
 }
// FIXED:  className={`p-1 rounded-full transition-colors duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center ${
 comment.isDislikedByCurrentUser
 ? 'text-red-500 dark:text-red-400'
 : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
 }`}
 title="Dislike comment"
// FIXED:  aria-pressed={comment.isDislikedByCurrentUser}
// FIXED:  type="button"
 >
 <ThumbsDownIcon className={`w-4 h-4 ${
 comment.isDislikedByCurrentUser ? 'fill-red-500 dark:fill-red-400' : '' />
 }`}/>
// FIXED:  </button>

 {!isReply && (
 <button />
// FIXED:  onClick={() => {
 onSetReplyingTo(comment.id, `@${comment.userName} `);
 setTimeout((() => replyInputRef.current?.focus()) as any, 0);
 }
// FIXED:  className="hover:text-neutral-700 dark:hover:text-neutral-200 font-medium"
 >
 REPLY
// FIXED:  </button>
 )}
// FIXED:  </div>
// FIXED:  </>
 )}

 {/* Reply Input */}
 {replyingToCommentId === comment.id && !isReply && (
 <div className="flex items-start space-x-2.5 mt-3">
 <img
// FIXED:  src="https://picsum.photos/seed/currentUserReply/32/32"
// FIXED:  alt="Your avatar for reply"
// FIXED:  className="w-6 h-6 rounded-full flex-shrink-0 mt-1" />
 />
 <div className="flex-grow">
 <input
 ref={replyInputRef}
// FIXED:  type="text"
// FIXED:  value={currentReplyText} />
// FIXED:  onChange={(e) => onSetCurrentReplyText(e.target.value)}
// FIXED:  placeholder={`Replying to ${comment.userName}...`}
// FIXED:  className="bg-transparent border-b border-neutral-300 dark:border-neutral-700 focus:border-blue-500 dark:focus:border-sky-500 w-full py-1.5 outline-none text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 text-sm transition-colors"
 maxLength={maxCommentLength + 20}
 />
 <div className="flex justify-between items-center mt-1.5">
 <span className={`text-xs ${ />
 currentReplyText.length > maxCommentLength
 ? 'text-red-500 dark:text-red-400'
 : 'text-neutral-500 dark:text-neutral-400'
 }`}>
 {currentReplyText.length}/{maxCommentLength}
// FIXED:  </span>
 <div className="space-x-2">
 <button />
// FIXED:  onClick={() => {
 onSetReplyingTo(null);
 onSetCurrentReplyText('');
 }
// FIXED:  className="px-3 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700/70 rounded-full"
 >
 Cancel
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => onReplySubmit(comment.id)}
// FIXED:  disabled={!currentReplyText.trim() || currentReplyText.length > maxCommentLength}
// FIXED:  className="px-3 py-1 text-xs font-medium bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500 text-white rounded-full disabled:opacity-60"
 >
 Reply
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 )}

 {/* Replies */}
 {!isReply && comment.replies && comment.replies.length > 0 && (
 <div className="mt-3">
 <button />
// FIXED:  onClick={() => onSetExpandedReplies(prev => ({ ...prev as any, [comment.id]: !prev[comment.id] }))}
// FIXED:  className="flex items-center text-xs font-medium text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 rounded-full px-2 py-1 hover:bg-sky-50 dark:hover:bg-sky-500/10 mb-1"
 >
 {expandedReplies[comment.id] ?
 <ChevronUpIcon className="w-4 h-4 mr-1" /> :
 <ChevronDownIcon className="w-4 h-4 mr-1" />
 }
 {expandedReplies[comment.id] ? 'Hide' : 'View'} {comment.replyCount} repl{comment.replyCount === 1 ? 'y' : 'ies'}
// FIXED:  </button>
 {expandedReplies[comment.id] && (
 <div className="space-y-3 pt-2">
 {comment.replies
 .sort((a,
 b) => parseRelativeDate(a.timestamp) - parseRelativeDate(b.timestamp))
 .map((reply) => renderComment(reply, true))
 }
// FIXED:  </div>
 )}
// FIXED:  </div>
 )}
// FIXED:  </div>
// FIXED:  </div>
 );
 };

 return (
 <div className="mt-6">
 {/* Comments Header */}
 <div className="flex items-center justify-between mb-3">
 <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
 {commentCount} Comments
// FIXED:  </h2>
 <div className="flex items-center space-x-2 text-sm">
 <button />
// FIXED:  onClick={() => onSortChange('top')}
// FIXED:  className={`px-2 py-1 rounded-md ${
 commentSortOrder === 'top'
 ? 'bg-neutral-200 dark:bg-neutral-700 font-medium'
 : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
 }`}
 >
 Top
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => onSortChange('newest')}
// FIXED:  className={`px-2 py-1 rounded-md ${
 commentSortOrder === 'newest'
 ? 'bg-neutral-200 dark:bg-neutral-700 font-medium'
 : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
 }`}
 >
 Newest
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>

 {/* Add Comment Form */}
 <div className="mb-6">
 <AddCommentForm
 currentUserAvatarUrl="https://picsum.photos/seed/currentUserComment/40/40"
 onCommentSubmit={onCommentSubmit}
 maxCommentLength={maxCommentLength} />
 />
// FIXED:  </div>

 {/* Comments List */}
 <div className="space-y-5">
 {sortedComments.map((comment) => renderComment(comment))}
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default CommentsSection;