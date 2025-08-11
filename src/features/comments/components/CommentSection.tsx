import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { logger } from '../../../utils/logger';
import {
  useVideoComments,
  useCreateComment,
  useReactToComment,
} from '../hooks/useComments';
import type { Comment } from '../../../types/core';
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftIcon,
  EllipsisVerticalIcon,
  FlagIcon,
  HeartIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import {
  MapPinIcon as PinSolidIcon,
  HeartIcon as HeartSolidIcon,
} from '@heroicons/react/24/solid';

interface CommentSectionProps {
  videoId: string;
  channelId: string;
  isChannelOwner?: boolean;
  className?: string;
}

interface CommentItemProps {
  comment: Comment;
  isChannelOwner?: boolean;
  onReply: (parentId: any, content: any) => void;
  onReact: (commentId: any, type: 'like' | 'dislike') => void;
  onPin: (commentId: any) => void | Promise<void>;
  onHeart: (commentId: any) => void | Promise<void>;
  onReport: (commentId: any, reason: any) => void | Promise<void>;
  level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  isChannelOwner = false,
  onReply,
  onReact,
  onPin,
  onHeart,
  onReport,
  level = 0,
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText('');
      setIsReplying(false);
      setShowReplies(true);
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className={`flex gap-3 ${level > 0 ? 'ml-12' : ''}`}>
      {/* Avatar */}
      <div className='flex-shrink-0'>
        <img
          src={comment.authorAvatar || '/default-avatar.png'}
          alt={comment.authorName}
          className='w-10 h-10 rounded-full object-cover'
        />
      </div>

      {/* Comment Content */}
      <div className='flex-1 min-w-0'>
        {/* Header */}
        <div className='flex items-center gap-2 mb-1'>
          <span className='font-medium text-sm text-gray-900 dark:text-white'>
            {comment.authorName}
          </span>
          {isChannelOwner && (
            <span className='bg-gray-100 dark:bg-gray-700 text-xs px-2 py-0.5 rounded text-gray-600 dark:text-gray-300'>
              Creator
            </span>
          )}
          <span className='text-xs text-gray-500 dark:text-gray-400'>
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
          {comment.isPinned && (
            <PinSolidIcon className='w-4 h-4 text-gray-500' />
          )}
        </div>

        {/* Comment Text */}
        <div className='text-sm text-gray-900 dark:text-white mb-2 whitespace-pre-wrap'>
          {comment.content}
        </div>

        {/* Actions */}
        <div className='flex items-center gap-4'>
          {/* Like/Dislike */}
          <div className='flex items-center gap-2'>
            <button
              onClick={() => onReact(comment.id, 'like')}
              className={
                'flex items-center gap-1 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400'
              }
            >
              <HandThumbUpIcon className='w-4 h-4' />
              {comment.likes > 0 && (
                <span className='text-xs'>{formatCount(comment.likes)}</span>
              )}
            </button>

            <button
              onClick={() => onReact(comment.id, 'dislike')}
              className={
                'p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400'
              }
            >
              <HandThumbDownIcon className='w-4 h-4' />
            </button>
          </div>

          {/* Reply */}
          <button
            onClick={() => setIsReplying(!isReplying)}
            className='text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
          >
            Reply
          </button>

          {/* Heart (Channel Owner) */}
          {isChannelOwner && onHeart && (
            <button
              onClick={() => onHeart(comment.id)}
              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                comment.isHearted
                  ? 'text-red-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {comment.isHearted ? (
                <HeartSolidIcon className='w-4 h-4' />
              ) : (
                <HeartIcon className='w-4 h-4' />
              )}
            </button>
          )}

          {/* Menu */}
          <div className='relative' ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className='p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400'
            >
              <EllipsisVerticalIcon className='w-4 h-4' />
            </button>

            {showMenu && (
              <div className='absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[120px]'>
                {isChannelOwner && onPin && (
                  <button
                    onClick={() => {
                      onPin(comment.id);
                      setShowMenu(false);
                    }}
                    className='w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2'
                  >
                    <MapPinIcon className='w-4 h-4' />
                    {comment.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                )}
                {onReport && (
                  <button
                    onClick={() => {
                      onReport(comment.id, 'inappropriate');
                      setShowMenu(false);
                    }}
                    className='w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600'
                  >
                    <FlagIcon className='w-4 h-4' />
                    Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reply Input */}
        {isReplying && (
          <div className='mt-3 flex gap-3'>
            <img
              src='/default-avatar.png'
              alt='Your avatar'
              className='w-8 h-8 rounded-full object-cover flex-shrink-0'
            />
            <div className='flex-1'>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder='Add a reply...'
                className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none'
                rows={2}
                autoFocus
              />
              <div className='flex gap-2 mt-2'>
                <button
                  onClick={handleReplySubmit}
                  disabled={!replyText.trim()}
                  className='px-4 py-1 bg-blue-600 text-white rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors'
                >
                  Reply
                </button>
                <button
                  onClick={() => {
                    setIsReplying(false);
                    setReplyText('');
                  }}
                  className='px-4 py-1 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Show Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className='mt-3'>
            <button
              onClick={() => setShowReplies(!showReplies)}
              className='flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium'
            >
              <ChatBubbleLeftIcon className='w-4 h-4' />
              {showReplies ? 'Hide' : 'Show'} {comment.replies.length}{' '}
              {comment.replies.length === 1 ? 'reply' : 'replies'}
            </button>

            {showReplies && (
              <div className='mt-3 space-y-4'>
                {comment.replies.map((reply: any) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    isChannelOwner={isChannelOwner}
                    onReply={onReply}
                    onReact={onReact}
                    onPin={onPin || (() => {})}
                    onHeart={onHeart || (() => {})}
                    onReport={onReport || (() => {})}
                    level={level + 1}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CommentSection: React.FC<CommentSectionProps> = ({
  videoId,
  isChannelOwner = false,
  className = '',
}) => {
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState<'top' | 'newest'>('top');
  const [showCommentInput, setShowCommentInput] = useState(false);

  const {
    data: comments,
    loading,
    error,
  } = useVideoComments(videoId, { sortBy });
  const createCommentMutation = useCreateComment();
  const reactToCommentMutation = useReactToComment();

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      return;
    }

    try {
      await createCommentMutation.mutate({
        content: newComment,
        videoId,
      });
      setNewComment('');
      setShowCommentInput(false);
    } catch (error) {
      logger.error('Failed to post comment:', error);
    }
  };

  const handleReply = async (parentId: any, content: any) => {
    try {
      await createCommentMutation.mutate({
        content,
        videoId,
        parentId,
      });
    } catch (error) {
      logger.error('Failed to post reply:', error);
    }
  };

  const handleReact = async (commentId: any, type: 'like' | 'dislike') => {
    try {
      await reactToCommentMutation.mutate({
        commentId,
        type,
      });
    } catch (error) {
      logger.error('Failed to react to comment:', error);
    }
  };

  const handlePin = async (_commentId: any) => {
    // Implementation for pinning comments
  };

  const handleHeart = async (_commentId: any) => {
    // Implementation for hearting comments
  };

  const handleReport = async (_commentId: any, _reason: any) => {
    // Implementation for reporting comments
  };

  if (error) {
    return (
      <div className={`p-4 text-center text-red-600 ${className}`}>
        Failed to load comments. Please try again.
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Comments Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
            {comments?.length || 0} Comments
          </h3>

          {/* Sort Options */}
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setSortBy('top')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                sortBy === 'top'
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Top comments
            </button>
            <button
              onClick={() => setSortBy('newest')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                sortBy === 'newest'
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Newest first
            </button>
          </div>
        </div>
      </div>

      {/* Add Comment */}
      <div className='flex gap-3'>
        <img
          src='/default-avatar.png'
          alt='Your avatar'
          className='w-10 h-10 rounded-full object-cover flex-shrink-0'
        />
        <div className='flex-1'>
          <div
            className={`border-b-2 transition-colors ${
              showCommentInput
                ? 'border-blue-600'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onFocus={() => setShowCommentInput(true)}
              placeholder='Add a comment...'
              className='w-full p-2 bg-transparent text-gray-900 dark:text-white resize-none border-none outline-none'
              rows={showCommentInput ? 3 : 1}
            />
          </div>

          {showCommentInput && (
            <div className='flex justify-end gap-2 mt-2'>
              <button
                onClick={() => {
                  setShowCommentInput(false);
                  setNewComment('');
                }}
                className='px-4 py-2 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleCommentSubmit}
                disabled={!newComment.trim() || createCommentMutation.loading}
                className='px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors'
              >
                {createCommentMutation.loading ? 'Posting...' : 'Comment'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className='space-y-4'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='flex gap-3 animate-pulse'>
              <div className='w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full' />
              <div className='flex-1 space-y-2'>
                <div className='h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4' />
                <div className='h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4' />
                <div className='h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2' />
              </div>
            </div>
          ))}
        </div>
      ) : comments && comments.length > 0 ? (
        <div className='space-y-6'>
          {comments.map((comment: Comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isChannelOwner={isChannelOwner}
              onReply={handleReply}
              onReact={handleReact}
              onPin={isChannelOwner ? handlePin : () => {}}
              onHeart={isChannelOwner ? handleHeart : () => {}}
              onReport={handleReport}
            />
          ))}
        </div>
      ) : (
        <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
          <ChatBubbleLeftIcon className='w-12 h-12 mx-auto mb-4 opacity-50' />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
};

export { CommentSection, CommentItem };
export default CommentSection;


