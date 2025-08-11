
import { useMemo, useRef,  useEffect, useState } from 'react';

import {
  HeartIcon,
  ChatBubbleLeftIcon,
  FlagIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';

import { formatDistanceToNow } from '../utils/dateUtils';

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorVerified: boolean;
  isChannelOwner: boolean;
  isCreator: boolean;
  timestamp: string;
  likes: number;
  dislikes: number;
  isLiked: boolean;
  isDisliked: boolean;
  isPinned: boolean;
  isEdited: boolean;
  replies: Comment;
  parentId?: string;
  isReported: boolean;
  moderationStatus: 'approved' | 'pending' | 'flagged' | 'removed';
  mentions: string;
  hashtags: string;
}

interface EnhancedCommentSystemProps {
  videoId: string;
  comments: Comment;
  currentUserId?: string;
  isChannelOwner?: boolean;
  isModerator?: boolean;
  commentsEnabled: boolean;
  sortBy: 'newest' | 'oldest' | 'popular';
  onAddComment: (content: any, parentId?: string) => void;
  onEditComment: (commentId: any, content: any) => void;
  onDeleteComment: (commentId: any) => void;
  onLikeComment: (commentId: any) => void;
  onDislikeComment: (commentId: any) => void;
  onPinComment: (commentId: any) => void;
  onReportComment: (commentId: any, reason: any) => void;
  onModerateComment: (commentId: any, action: 'approve' | 'flag' | 'remove') => void;
  onSortChange: (sort: 'newest' | 'oldest' | 'popular') => void;
  className?: string;
}

const EnhancedCommentSystem: React.FC<EnhancedCommentSystemProps> = ({
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
  className = '',
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [showReportModal, setShowReportModal] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const reportReasons = [
    'Spam or misleading',
    'Hate speech or harassment',
    'Inappropriate content',
    'Copyright infringement',
    'Violence or dangerous content',
    'Other',
  ];

  useEffect(() => {
    if (replyingTo && replyTextareaRef.current) {
      replyTextareaRef.current.focus();
    }
  }, [replyingTo]);

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const handleSubmitReply = (parentId: any, content: any) => {
    if (content.trim()) {
      onAddComment(content.trim(), parentId);
      setReplyingTo(null);
    }
  };

  const handleEditSubmit = (commentId: any) => {
    if (editContent.trim()) {
      onEditComment(commentId, editContent.trim());
      setEditingComment(null);
      setEditContent('');
    }
  };

  const handleReport = (commentId: any) => {
    if (reportReason) {
      onReportComment(commentId, reportReason);
      setShowReportModal(null);
      setReportReason('');
    }
  };

  const toggleReplies = (commentId: any) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const formatNumber = (num: any): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)  }M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)  }K`;
    }
    return num.toString();
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isOwner = comment.authorId === currentUserId;
    const canModerate = isChannelOwner || isModerator;
    const isEditing = editingComment === comment.id;

    return (
      <div
        key={comment.id}
        className={`${isReply ? 'ml-12 mt-3' : 'mb-6'} ${
          comment.isPinned ? 'bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg' : ''
        }`}
      >
        <div className="flex space-x-3">
          {/* Avatar */}
          <img
            src={comment.authorAvatar}
            alt={comment.authorName}
            className="w-10 h-10 rounded-full flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            {/* Author Info */}
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-gray-900 dark:text-white">
                {comment.authorName}
              </span>

              {comment.authorVerified && (
                <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {comment.isChannelOwner && (
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs">
                  Creator
                </span>
              )}

              {comment.isPinned && (
                <span className="text-blue-500 text-xs">📌</span>
              )}

              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(comment.timestamp))} ago
              </span>

              {comment.isEdited && (
                <span className="text-xs text-gray-400">(edited)</span>
              )}
            </div>

            {/* Comment Content */}
            {isEditing ? (
              <div className="mb-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  rows={3}
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleEditSubmit(comment.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent('');
                    }}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-900 dark:text-white mb-2 whitespace-pre-wrap">
                {comment.content}
              </p>
            )}

            {/* Moderation Status */}
            {comment.moderationStatus !== 'approved' && canModerate && (
              <div className={`mb-2 p-2 rounded text-sm ${
                comment.moderationStatus === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200' :
                comment.moderationStatus === 'flagged' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200' :
                'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>Status: {comment.moderationStatus}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            {!isEditing && (
              <div className="flex items-center space-x-4">
                {/* Like/Dislike */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onLikeComment(comment.id)}
                    className={`flex items-center space-x-1 text-sm transition-colors ${
                      comment.isLiked
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {comment.isLiked ? (
                      <HeartSolidIcon className="w-4 h-4" />
                    ) : (
                      <HeartIcon className="w-4 h-4" />
                    )}
                    <span>{formatNumber(comment.likes)}</span>
                  </button>

                  <button
                    onClick={() => onDislikeComment(comment.id)}
                    className={`text-sm transition-colors ${
                      comment.isDisliked
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    👎 {comment.dislikes > 0 && formatNumber(comment.dislikes)}
                  </button>
                </div>

                {/* Reply */}
                {!isReply && (
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Reply
                  </button>
                )}

                {/* Owner/Moderator Actions */}
                {(isOwner || canModerate) && (
                  <div className="flex items-center space-x-2">
                    {isOwner && (
                      <button
                        onClick={() => {
                          setEditingComment(comment.id);
                          setEditContent(comment.content);
                        }}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    )}

                    {canModerate && !comment.isPinned && !isReply && (
                      <button
                        onClick={() => onPinComment(comment.id)}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        title="Pin comment"
                      >
                        📌
                      </button>
                    )}

                    {(isOwner || canModerate) && (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Report */}
                {!isOwner && (
                  <button
                    onClick={() => setShowReportModal(comment.id)}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <FlagIcon className="w-4 h-4" />
                  </button>
                )}

                {/* Moderation Actions */}
                {canModerate && comment.moderationStatus !== 'approved' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onModerateComment(comment.id, 'approve')}
                      className="text-sm text-green-600 hover:text-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onModerateComment(comment.id, 'flag')}
                      className="text-sm text-yellow-600 hover:text-yellow-700"
                    >
                      Flag
                    </button>
                    <button
                      onClick={() => onModerateComment(comment.id, 'remove')}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Reply Input */}
            {replyingTo === comment.id && (
              <div className="mt-3">
                <textarea
                  ref={replyTextareaRef}
                  placeholder={`Reply to ${comment.authorName}...`}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitReply(comment.id, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => {
                      const textarea = replyTextareaRef.current;
                      if (textarea) {
                        handleSubmitReply(comment.id, textarea.value);
                        textarea.value = '';
                      }
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  {expandedReplies.has(comment.id) ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                  <span>
                    {expandedReplies.has(comment.id) ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                  </span>
                </button>

                {expandedReplies.has(comment.id) && (
                  <div className="mt-3">
                    {comment.replies.map((reply: any) => renderComment(reply, true))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Filter and sort comments with memoization
  const sortedComments = useMemo(() => {
    const topLevelComments = comments.filter((comment: any) => !comment.parentId);
    const pinnedComments = topLevelComments.filter((comment: any) => comment.isPinned);
    const regularComments = topLevelComments.filter((comment: any) => !comment.isPinned);

    const sorted = regularComments.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'popular':
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

    return [...pinnedComments, ...sorted];
  }, [comments, sortBy]);

  if (!commentsEnabled) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <ChatBubbleLeftIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Comments are disabled for this video.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {formatNumber(comments.length)} Comments
        </h3>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as any)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        >
          <option value="popular">Top comments</option>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {/* Add Comment */}
      {currentUserId && (
        <div className="flex space-x-3">
          <img
            src={`https://picsum.photos/40/40?random=${currentUserId}`}
            alt="Your avatar"
            className="w-10 h-10 rounded-full flex-shrink-0"
          />
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              rows={3}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setNewComment('')}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {sortedComments.map(comment => renderComment(comment))}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Report Comment
            </h3>

            <div className="space-y-3 mb-6">
              {reportReasons.map((reason) => (
                <label key={reason} className="flex items-center">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-900 dark:text-white">{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowReportModal(null);
                  setReportReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReport(showReportModal)}
                disabled={!reportReason}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedCommentSystem;
