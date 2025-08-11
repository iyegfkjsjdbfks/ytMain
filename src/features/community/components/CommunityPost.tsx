/// <reference types="react/jsx-runtime" />
import React from "react";
import { useState } from 'react';
import type * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { HandThumbUpIcon, HandThumbDownIcon, ChatBubbleLeftIcon, ShareIcon, EllipsisHorizontalIcon, PlayIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolidIcon, HandThumbDownIcon as HandThumbDownSolidIcon } from '@heroicons/react/24/solid';

export interface CommunityPostData {
  id: string;
  channelId: string;
  channelName: string;
  channelAvatar: string;
  channelHandle: string;
  isVerified: boolean;
  content: string;
  type: 'text' | 'image' | 'video' | 'poll' | 'quiz';
  media?: Array<{
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
    alt?: string;
  }>;
  poll?: {
    question: string;
    options: Array<{
      id: string;
      text: string;
      votes: number;
      percentage: number;
    }>;
    totalVotes: number;
    endsAt?: string;
    hasVoted: boolean;
    userVote?: string;
  };
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isDisliked: boolean;
  createdAt: string;
  updatedAt?: string;
  isPinned?: boolean;
}

interface CommunityPostProps {
  post: CommunityPostData;
  onLike: (postId: any) => void;
  onDislike: (postId: any) => void;
  onComment: (postId: any) => void;
  onShare: (postId: any) => void;
  onVote?: (postId: any, optionId: any) => void;
  className?: string;
}

export const CommunityPost: React.FC<CommunityPostProps> = ({
  post,
  onLike,
  onDislike,
  onComment,
  onShare,
  onVote,
  className = '',
}) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
return `${(count / 1000000).toFixed(1)}M`;
}
    if (count >= 1000) {
return `${(count / 1000).toFixed(1)}K`;
}
    return count.toString();
  };

  const shouldTruncateContent = post.content.length > 300;
  const displayContent = shouldTruncateContent && !showFullContent
    ? `${post.content.slice(0, 300)}...`
    : post.content;

  const handleVote = (optionId: any) => {
    if (post.poll && !post.poll.hasVoted && onVote) {
      onVote(post.id, optionId);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={post.channelAvatar}
            alt={post.channelName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {post.channelName}
              </h3>
              {post.isVerified && (
                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                </svg>
              )}
              {post.isPinned && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-0.5 rounded">
                  Pinned
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{post.channelHandle}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <div className="text-gray-900 dark:text-white whitespace-pre-wrap">
          {displayContent}
          {shouldTruncateContent && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-blue-600 hover:text-blue-700 ml-2 font-medium"
            >
              {showFullContent ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="mb-4">
          {post.media.length === 1 ? (
            <div className="relative rounded-lg overflow-hidden">
              {post.media[0]?.type === 'image' ? (
                <img
                  src={post.media[0]?.url || ''}
                  alt={post.media[0]?.alt || 'Post image'}
                  className="w-full max-h-96 object-cover cursor-pointer"
                  onClick={() => setSelectedImage(0)}
                />
              ) : (
                <div className="relative">
                  <img
                    src={post.media[0]?.thumbnail || post.media[0]?.url || ''}
                    alt="Video thumbnail"
                    className="w-full max-h-96 object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="bg-black bg-opacity-70 text-white p-4 rounded-full hover:bg-opacity-80 transition-colors">
                      <PlayIcon className="w-8 h-8" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {post.media.slice(0, 4).map((media, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden aspect-square">
                  <img
                    src={media.type === 'image' ? media.url : media.thumbnail || media.url}
                    alt={media.alt || `Post media ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setSelectedImage(index)}
                  />
                  {media.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayIcon className="w-6 h-6 text-white" />
                    </div>
                  )}
                  {index === 3 && post.media && post.media.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        +{post.media.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Poll */}
      {post.poll && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            {post.poll.question}
          </h4>
          <div className="space-y-2">
            {post.poll.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={post.poll!.hasVoted}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  post.poll!.hasVoted
                    ? post.poll!.userVote === option.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                } ${!post.poll!.hasVoted ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 dark:text-white">{option.text}</span>
                  {post.poll!.hasVoted && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {option.percentage}%
                    </span>
                  )}
                </div>
                {post.poll!.hasVoted && (
                  <div className="mt-2 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${option.percentage}%` }}
                    />
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            {formatCount(post.poll.totalVotes)} votes
            {post.poll.endsAt && (
              <>
                {' • '}
                Ends {formatDistanceToNow(new Date(post.poll.endsAt), { addSuffix: true })}
              </>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          {/* Like */}
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
              post.isLiked
                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {post.isLiked ? (
              <HandThumbUpSolidIcon className="w-5 h-5" />
            ) : (
              <HandThumbUpIcon className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{formatCount(post.likes)}</span>
          </button>

          {/* Dislike */}
          <button
            onClick={() => onDislike(post.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
              post.isDisliked
                ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {post.isDisliked ? (
              <HandThumbDownSolidIcon className="w-5 h-5" />
            ) : (
              <HandThumbDownIcon className="w-5 h-5" />
            )}
          </button>

          {/* Comment */}
          <button
            onClick={() => onComment(post.id)}
            className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChatBubbleLeftIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{formatCount(post.comments)}</span>
          </button>

          {/* Share */}
          <button
            onClick={() => onShare(post.id)}
            className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ShareIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{formatCount(post.shares)}</span>
          </button>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage !== null && post.media && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full p-4">
            <img
              src={post.media[selectedImage]?.url || ''}
              alt={post.media[selectedImage]?.alt || 'Post image'}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPost;


declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
