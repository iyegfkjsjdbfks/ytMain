/// <reference types="react/jsx-runtime" />
// TODO: Fix import - import React from "react";
// TODO: Fix import - import { FixedSizeList as List } from 'react-window';

// TODO: Fix import - import { memo, useMemo, useCallback } from 'react';

import { usePerformanceMonitor } from '../../hooks/usePerformanceOptimization';
import type { Comment } from '../../types/core';

interface VirtualizedCommentListProps {
  comments: Comment;
  onReply: (commentId, content) => void;
  onLike: (commentId) => void;
  onDislike: (commentId) => void;
  className?: string;
  height?: number;
  itemHeight?: number;
}

interface CommentItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    comments: Comment;
    onReply: (commentId, content) => void;
    onLike: (commentId) => void; onDislike: (commentId) => void
  };
}

const CommentItem = memo<CommentItemProps>(({ index, style, data }: {data: any; style: any; index: number}) => {
  const { comments, onReply, onLike, onDislike } = data;
  const comment = comments[index];

  const handleReply = useCallback(() => {
    const content = prompt('Enter your reply:');
    if (content && comment) {
      onReply(comment.id, content);
    }
  }, [comment, onReply]);

  const handleLike = useCallback(() => {
    if (comment) {
      onLike(comment.id);
    }
  }, [comment, onLike]);

  const handleDislike = useCallback(() => {
    if (comment) {
      onDislike(comment.id);
    }
  }, [comment, onDislike]);

  if (!comment) {
    return <div style={style} />;
  }

  return (
    <div style={style} className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="flex space-x-3">
        <img
          src={comment.authorAvatar || comment.authorAvatarUrl || 'https://via.placeholder.com/32'}
          alt={comment.authorName}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm text-gray-900 dark:text-white">
              {comment.authorName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {comment.publishedAt}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            {comment.content}
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <button
              onClick={handleLike}
              className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span>👍</span>
              <span>{comment.likeCount || 0}</span>
            </button>
            <button
              onClick={handleDislike}
              className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span>👎</span>
            </button>
            <button
              onClick={handleReply}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

CommentItem.displayName = 'CommentItem';

const VirtualizedCommentList = memo<VirtualizedCommentListProps>(({
  comments,
  onReply,
  onLike,
  onDislike,
  className = '',
  height = 400,
  itemHeight = 120,
}) => {
  usePerformanceMonitor('VirtualizedCommentList');

  const listData = useMemo(() => ({
    comments,
    onReply,
    onLike,
    onDislike,
  }), [comments, onReply, onLike, onDislike]);

  if (comments.length === 0) {
    return (
      <div className={`flex items-center justify-center h-32 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">No comments yet</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <List
        height={height}
        width="100%"
        itemCount={comments.length}
        itemSize={itemHeight}
        itemData={listData}
        overscanCount={5}
      >
        {CommentItem}
      </List>
    </div>
  );
});

VirtualizedCommentList.displayName = 'VirtualizedCommentList';

export default VirtualizedCommentList;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
