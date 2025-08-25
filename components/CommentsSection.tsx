import React, { FC, useState, useRef } from 'react';

import { EllipsisHorizontalIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons / react / 24 / outline';

import AddCommentForm from 'AddCommentForm';
import ThumbsDownIcon from './icons / ThumbsDownIcon';
import ThumbsUpIcon from './icons / ThumbsUpIcon';
export interface Comment {}
 id: string;
 parentId?: string;
 userAvatarUrl: string;,
 userName: string;
 commentText: string;,
 timestamp: string;
 likes: number;,
 isLikedByCurrentUser: boolean;
 isDislikedByCurrentUser: boolean;,
 isEdited: boolean;
 replyTo?: string;
 replies?: Comment;
 replyCount?: number;

export interface CommentsSectionProps {}
 comments: Comment;,
 commentCount: number;
 commentSortOrder: 'top' | 'newest';,
 replyingToCommentId: string | null;
 currentReplyText: string;,
 editingComment: {id: string; parentId ?  : string} | null;
 activeCommentMenu: string | null;,
 expandedReplies: Record < string, boolean>;
 maxCommentLength: number;,
 onCommentSubmit: (commentText: string) => void;
 onReplySubmit: (parentId) => void;,
 onEditSave: (commentId,)
 newText, parentId?: string) => void;
 onDeleteComment: (commentId, parentId?: string) => void;
 onToggleLikeDislike: (id,)
 parentId: string | undefined, action: 'like' | 'dislike') => void;,
 onSortChange: (order: 'top' | 'newest') => void;,
 onSetReplyingTo: (commentId: string | null, text?: string) => void;
 onSetCurrentReplyText: (text: string) => void;,
 onSetEditingComment: (comment: {id: string; parentId ?  : string} | null) => void;
 onSetActiveCommentMenu: (commentId: string | null) => void;,
 onSetExpandedReplies: (updater: (prev: Record < string, boolean>) => Record < string, boolean>) => void;

const CommentsSection: React.FC < CommentsSectionProps> = ({, })
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
 onSetExpandedReplies }) => {}
 const replyInputRef = useRef < HTMLInputElement>(null);
 const [editText, setEditText] = useState < string>('');

 const parseRelativeDate = (timestamp): (number) => {, }
 if (timestamp.includes('Just now') || timestamp.includes('edited')) {}
return 0;
 const match = timestamp.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s + ago/);
 if (!match) {}
return 0;

 const [ num, unit] = match;
 if (!num || !unit) {}
return 0;
 const value = parseInt(num, 10);
 const multipliers: object = {, }
 second: 1,
 minute: 60,
 hour: 3600,
 day: 86400,
 week: 604800,
 month: 2592000,
 year: 31536000 };
 return value * (multipliers[unit as keyof typeof multipliers] || 0);

 const sortedComments = [...comments].sort((a, b) => {})
 if (commentSortOrder === 'top') {}
 return b.likes - a.likes;
 return parseRelativeDate(a.timestamp) - parseRelativeDate(b.timestamp);


 const handleEditStart = (comment: Comment) => {, }
 onSetEditingComment({})
 id: comment.id,
 ...(comment.parentId ? { parentId: comment.parentId } : {}) });
 setEditText(comment.commentText);
 onSetActiveCommentMenu(null);

 const handleEditCancel = () => {}
 onSetEditingComment(null);
 setEditText('');

 const handleEditSave = () => {}
 if (editingComment) {}
 onEditSave(editingComment.id, editText, editingComment.parentId);
 setEditText('');

 const renderComment = (comment: Comment, isReply = false): React.JSX.(Element) => {}
 const isEditing = editingComment?.id === comment.id && editingComment?.parentId === comment.parentId;
 const isMenuOpen = activeCommentMenu === comment.id;

 return (;)
 <div key={comment.id} className={`flex items - start space - x - 2.5 ${isReply ? 'ml - 8' : ''}`}>;
 <img />;
 <div className={"fle}x - grow min - w - 0">;
 <div className={"fle}x items - center space - x - 1.5 mb - 1">;
 <span className={"tex}t - sm font - medium text - neutral - 900 dark:text - neutral - 50">;
 {comment.userName}

 <span className={"tex}t - xs text - neutral - 500 dark:text - neutral - 400">;
 {comment.timestamp}

 {comment.isEdited && (})
 <span className={"tex}t - xs text - neutral - 400 dark:text - neutral - 500">(edited)</span>;


 {isEditing ? (})
 <div className={"spac}e - y - 2">;
 <textarea;>;
 rows={3}
 maxLength={maxCommentLength} />
 <div className={"fle}x justify - between items - center">;
 <span className={`text - xs ${}>;
 editText.length > maxCommentLength;
 ? 'text - red - 500 dark:text - red - 400';
 : 'text - neutral - 500 dark:text - neutral - 400';
 }`}>
 {editText.length}/{maxCommentLength}

 <div className={"spac}e - x - 2">;
 <button />;
 <span className={"tex}t - sky - 600 dark:text - sky - 400 font - medium">@{comment.replyTo} </span>;
 {comment.commentText}


 <div className={"fle}x items - center space - x - 4 text - xs text - neutral - 500 dark:text - neutral - 400">;
 <div className={"fle}x items - center space - x - 3">;
 <div className={"relative}">;
 {comment.userName === 'You' && (})
 <button />;
 {isMenuOpen && (})
 <div className={"absolut}e top - full left - 0 mt - 1 bg - white dark:bg - neutral - 800 border border - neutral - 200 dark:border - neutral - 700 rounded - lg shadow - lg z - 10 py - 1 min - w-[120px]">;
 <button />;
 Edit;

 <button />;
 Delete;





 <button />;
 e.preventDefault();
 e.stopPropagation();
 try {}
 onToggleLikeDislike(comment.id, comment.parentId, 'like');
 } catch (error) {}
 (console).error('Error toggling like:', error);

 comment.isLikedByCurrentUser;
 ? 'text - sky - 600 dark:text - sky - 400';
 : 'text - neutral - 500 dark:text - neutral - 400 hover:text - neutral - 700 dark:hover:text - neutral - 200';
 }`}
 title="Like comment";


 >
 <ThumbsUpIcon className="">;
 }`} />
 {comment.likes > 0 && (})
 <span className={"tex}t - xs font - medium">{comment.likes}</span>;


 <button />;
 e.preventDefault();
 e.stopPropagation();
 try {}
 onToggleLikeDislike(comment.id, comment.parentId, 'dislike');
 } catch (error) {}
 (console).error('Error toggling dislike:', error);

 comment.isDislikedByCurrentUser;
 ? 'text - red - 500 dark:text - red - 400';
 : 'text - neutral - 500 dark:text - neutral - 400 hover:text - neutral - 700 dark:hover:text - neutral - 200';
 }`}
 title="Dislike comment";


 >
 <ThumbsDownIcon className="">;
 }`} />


 {!isReply && (})
 <button />;
 onSetReplyingTo(comment.id, `@${comment.userName} `);
 setTimeout((() => replyInputRef.current?.focus()) as any, 0);

 >
 REPLY;




 {/* Reply Input */}
 {replyingToCommentId === comment.id && !isReply && (})
 <div className={"fle}x items - start space - x - 2.5 mt - 3">;
 <img />;
 <div className={"fle}x - grow">;
 <input;>;
 ref={replyInputRef}





 maxLength={maxCommentLength + 20} />
 <div className={"fle}x justify - between items - center mt - 1.5">;
 <span className={`text - xs ${}>;
 currentReplyText.length > maxCommentLength;
 ? 'text - red - 500 dark:text - red - 400';
 : 'text - neutral - 500 dark:text - neutral - 400';
 }`}>
 {currentReplyText.length}/{maxCommentLength}

 <div className={"spac}e - x - 2">;
 <button />;
 onSetReplyingTo(null);
 onSetCurrentReplyText('');

 >
 Cancel;

 <button />;
 Reply;






 {/* Replies */}
 {!isReply && comment.replies && comment.replies.length > 0 && (})
 <div className={"m}t - 3">;
 <button />;
 {expandedReplies[comment.id] ? 'Hide' : 'View'} {comment.replyCount} repl{comment.replyCount === 1 ? 'y' : 'ies', }

 {expandedReplies[comment.id] && (})
 <div className={"spac}e - y - 3 pt - 2">;
 {comment.replies}
 .sort((a,))
 b) => parseRelativeDate(a.timestamp) - parseRelativeDate(b.timestamp));
 .map((reply) => renderComment(reply, true));





 return (;)
 <div className={"m}t - 6">;
 {/* Comments Header */}
 <div className={"fle}x items - center justify - between mb - 3">;
 <h2 className={"tex}t - lg font - semibold text - neutral - 900 dark:text - neutral - 50">;
 {commentCount} Comments;

 <div className={"fle}x items - center space - x - 2 text - sm">;
 <button />;
 commentSortOrder === 'top';
 ? 'bg - neutral - 200 dark:bg - neutral - 700 font - medium';
 : 'hover:bg - neutral - 100 dark:hover:bg - neutral - 800';
 }`}
 >
 Top;

 <button />;
 commentSortOrder === 'newest';
 ? 'bg - neutral - 200 dark:bg - neutral - 700 font - medium';
 : 'hover:bg - neutral - 100 dark:hover:bg - neutral - 800';
 }`}
 >
 Newest;




 {/* Add Comment Form */}
 <div className={"m}b - 6">;
 <AddCommentForm;>;
 currentUserAvatarUrl="https://picsum.photos / seed / currentUserComment / 40 / 40"
 onCommentSubmit={onCommentSubmit}
 maxCommentLength={maxCommentLength} />; />


 {/* Comments List */}
 <div className={"spac}e - y - 5">;
 {sortedComments.map((comment) => renderComment(comment))}



export default CommentsSection;