import type * as React from 'react';
import {  useState, useRef, useEffect  } from 'react';

import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  FlagIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import {
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
} from '@heroicons/react/24/solid';

import { logger } from '../../../utils/logger';
import { useVideoInteractions } from '../hooks/useVideoInteractions';

interface VideoInteractionsProps {
  videoId: string;
  channelId: string;
  initialLikes?: number;
  initialDislikes?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical';
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoTitle: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  videoTitle,
}) => {
  const [copied, setCopied] = useState(false);
  const [startTime, setStartTime] = useState('');

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logger.error('Failed to copy to clipboard:', error);
    }
  };

  const getShareUrl = () => {
    const baseUrl = videoUrl;
    return startTime ? `${baseUrl}&t=${startTime}` : baseUrl;
  };

  const shareToSocial = (platform: string) => {
    const url = encodeURIComponent(getShareUrl());
    const title = encodeURIComponent(videoTitle);

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      reddit: `https://reddit.com/submit?url=${url}&title=${title}`,
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${title}`,
    };

    const shareUrl = shareUrls[platform as keyof typeof shareUrls];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (!isOpen) {
return null;
}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Share
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Start time input */}
        <div className="mb-4">
          <label htmlFor="start-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start at (optional)
          </label>
          <input
            id="start-time"
            type="text"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="e.g., 1m30s or 90"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Copy link */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={getShareUrl()}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={() => copyToClipboard(getShareUrl())}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <ClipboardDocumentIcon className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Social sharing */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'Twitter', icon: '🐦', platform: 'twitter' },
            { name: 'Facebook', icon: '📘', platform: 'facebook' },
            { name: 'LinkedIn', icon: '💼', platform: 'linkedin' },
            { name: 'Reddit', icon: '🤖', platform: 'reddit' },
            { name: 'WhatsApp', icon: '💬', platform: 'whatsapp' },
            { name: 'Telegram', icon: '✈️', platform: 'telegram' },
          ].map((social) => (
            <button
              key={social.platform}
              onClick={() => shareToSocial(social.platform)}
              className="flex flex-col items-center gap-2 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-2xl">{social.icon}</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">{social.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const VideoInteractions: React.FC<VideoInteractionsProps> = ({
  videoId,
  initialLikes = 0,
  initialDislikes = 0,
  className = '',
  size = 'md',
  layout = 'horizontal',
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const {
    isLiked,
    isDisliked,
    isSaved,
    likes,
    isLoading,
    toggleLike,
    toggleDislike,
    toggleSave,
    reportVideo,
  } = useVideoInteractions(videoId, {
    initialLikes,
    initialDislikes,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
return `${(count / 1000000).toFixed(1)}M`;
}
    if (count >= 1000) {
return `${(count / 1000).toFixed(1)}K`;
}
    return count.toString();
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const buttonClasses = `${getSizeClasses()} font-medium rounded-full transition-all duration-200 flex items-center gap-2 disabled:opacity-50`;

  const containerClasses = layout === 'vertical'
    ? 'flex flex-col gap-2'
    : 'flex items-center gap-2 flex-wrap';

  return (
    <div className={`${containerClasses} ${className}`}>
      {/* Like/Dislike Group */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full">
        <button
          onClick={() => toggleLike()}
          disabled={isLoading}
          className={`${buttonClasses} rounded-l-full border-r border-gray-200 dark:border-gray-700 ${
            isLiked
              ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {isLiked ? (
            <HandThumbUpSolidIcon className={getIconSize()} />
          ) : (
            <HandThumbUpIcon className={getIconSize()} />
          )}
          <span>{formatCount(likes)}</span>
        </button>

        <button
          onClick={() => toggleDislike()}
          disabled={isLoading}
          className={`${buttonClasses} rounded-r-full ${
            isDisliked
              ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {isDisliked ? (
            <HandThumbDownSolidIcon className={getIconSize()} />
          ) : (
            <HandThumbDownIcon className={getIconSize()} />
          )}
        </button>
      </div>

      {/* Share Button */}
      <button
        onClick={() => setShowShareModal(true)}
        className={`${buttonClasses} bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700`}
      >
        <ShareIcon className={getIconSize()} />
        <span>Share</span>
      </button>

      {/* Save Button */}
      <button
        onClick={() => toggleSave()}
        disabled={isLoading}
        className={`${buttonClasses} ${
          isSaved
            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        {isSaved ? (
          <BookmarkSolidIcon className={getIconSize()} />
        ) : (
          <BookmarkIcon className={getIconSize()} />
        )}
        <span>{isSaved ? 'Saved' : 'Save'}</span>
      </button>

      {/* More Menu */}
      <div className="relative" ref={moreMenuRef}>
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`${buttonClasses} bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700`}
        >
          <EllipsisHorizontalIcon className={getIconSize()} />
        </button>

        {showMoreMenu && (
          <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-10 min-w-[160px]">
            <button
              onClick={() => {
                reportVideo('inappropriate');
                setShowMoreMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-red-600"
            >
              <FlagIcon className="w-4 h-4" />
              Report
            </button>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        videoUrl={`${window.location.origin}/watch/${videoId}`}
        videoTitle="Video Title" // This should come from props or context
      />
    </div>
  );
};

export default VideoInteractions;
