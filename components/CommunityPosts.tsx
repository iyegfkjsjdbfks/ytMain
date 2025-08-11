
/// <reference types="react/jsx-runtime" />
import { Link } from 'react-router-dom';
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName]: any;
    }
  }
}
import { useState } from 'react';
import React from 'react';

import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  PhotoIcon,
  VideoCameraIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

import { formatDistanceToNow } from '../utils/dateUtils';

export interface CommunityPost {
  id: string;
  channelId: string;
  channelName: string;
  channelAvatar: string;
  channelVerified: boolean;
  type: 'text' | 'image' | 'video' | 'poll' | 'link';
  content: string;
  images?: string;
  videoId?: string;
  videoThumbnail?: string;
  videoTitle?: string;
  poll?: {
    question: string;
    options: Array<{
      id: string;
      text: string;
      votes: number;
    }>;
    totalVotes: number;
    userVote?: string;
  };
  link?: {
    url: string;
    title: string;
    description: string;
    thumbnail: string;
  };
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  isLiked: boolean;
  isPinned?: boolean;
}

interface CommunityPostsProps {
  channelId?: string;
  posts: CommunityPost;
  onLike: (postId: any) => void;
  onComment: (postId: any) => void;
  onShare: (postId: any) => void;
  onVote?: (postId: any, optionId: any) => void;
  className?: string;
}

const CommunityPosts: React.FC<CommunityPostsProps> = ({
  posts,
  onLike,
  onComment,
  onShare,
  onVote,
  className = '',
}) => {
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  const toggleExpanded = (postId: any) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
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

  const getPostIcon = (type: CommunityPost['type']) => {
    switch (type) {
      case 'image': return <PhotoIcon className="w-4 h-4" />;
      case 'video': return <VideoCameraIcon className="w-4 h-4" />;
      case 'poll': return <ChatBubbleLeftIcon className="w-4 h-4" />;
      case 'link': return <LinkIcon className="w-4 h-4" />;
      default: return null;
    }
  };

  const renderPostContent = (post: CommunityPost) => {
    const isExpanded = expandedPosts.has(post.id);
    const shouldTruncate = post.content.length > 200;
    const displayContent = shouldTruncate && !isExpanded
      ? `${post.content.substring(0, 200)  }...`
      : post.content;

    return (
      <div className="space-y-3">
        {/* Text Content */}
        <div className="text-gray-900 dark:text-white">
          <p className="whitespace-pre-wrap">{displayContent}</p>
          {shouldTruncate && (
            <button
              onClick={() => toggleExpanded(post.id)}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-1"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-2 ${
            post.images.length === 1 ? 'grid-cols-1' :
            post.images.length === 2 ? 'grid-cols-2' :
            'grid-cols-2 md:grid-cols-3'
          }`}>
            {post.images.map((image: any, index: number) => (
              <img
                key={index}
                src={image}
                alt={`Post ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {
                  // Open image in modal/lightbox
                  }}
              />
            ))}
          </div>
        )}

        {/* Video */}
        {post.type === 'video' && post.videoThumbnail && (
          <div className="relative cursor-pointer group">
            <img
              src={post.videoThumbnail}
              alt="Video thumbnail"
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                <VideoCameraIcon className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
            {post.videoTitle && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
                <p className="text-white font-medium">{post.videoTitle}</p>
              </div>
            )}
          </div>
        )}

        {/* Poll */}
        {post.type === 'poll' && post.poll && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              {post.poll.question}
            </h4>
            <div className="space-y-2">
              {post.poll.options.map((option) => {
                const percentage = post.poll!.totalVotes > 0
                  ? (option.votes / post.poll!.totalVotes) * 100
                  : 0;
                const isSelected = post.poll!.userVote === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => onVote?.(post.id, option.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 dark:text-white">{option.text}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isSelected ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              {formatNumber(post.poll.totalVotes)} votes
            </p>
          </div>
        )}

        {/* Link Preview */}
        {post.type === 'link' && post.link && (
          <a
            href={post.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex">
              {post.link.thumbnail && (
                <img
                  src={post.link.thumbnail}
                  alt={post.link.title}
                  className="w-24 h-24 object-cover flex-shrink-0"
                />
              )}
              <div className="p-3 flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                  {post.link.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {post.link.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {new URL(post.link.url).hostname}
                </p>
              </div>
            </div>
          </a>
        )}
      </div>
    );
  };

  if (posts.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 dark:text-gray-600 mb-4">
          <ChatBubbleLeftIcon className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No community posts yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This channel hasn't shared any community posts.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {posts.map((post: any) => (
        <div
          key={post.id}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <img
                src={post.channelAvatar}
                alt={post.channelName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {post.channelName}
                  </h3>
                  {post.channelVerified && (
                    <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {post.isPinned && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                      Pinned
                    </span>
                  )}
                  {getPostIcon(post.type) && (
                    <span className="text-gray-500 dark:text-gray-400">
                      {getPostIcon(post.type)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(post.timestamp))} ago
                </p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          {renderPostContent(post)}

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => onLike(post.id)}
                className={`flex items-center space-x-2 transition-colors ${
                  post.isLiked
                    ? 'text-red-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
                }`}
              >
                {post.isLiked ? (
                  <HeartSolidIcon className="w-5 h-5" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
                <span className="text-sm">{formatNumber(post.likes)}</span>
              </button>

              <button
                onClick={() => onComment(post.id)}
                className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
              >
                <ChatBubbleLeftIcon className="w-5 h-5" />
                <span className="text-sm">{formatNumber(post.comments)}</span>
              </button>

              <button
                onClick={() => onShare(post.id)}
                className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
                <span className="text-sm">{formatNumber(post.shares)}</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommunityPosts;

