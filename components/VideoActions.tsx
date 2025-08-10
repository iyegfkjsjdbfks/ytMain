
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
import { useState, useRef, useEffect } from 'react';
import React from 'react';

import {
  ShareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import { formatCount } from '../utils/numberUtils';

import SaveIcon from './icons/SaveIcon';
import SaveIconFilled from './icons/SaveIconFilled';
import ThumbsDownIcon from './icons/ThumbsDownIcon';
import ThumbsUpIcon from './icons/ThumbsUpIcon';


interface VideoActionsProps {
  liked: boolean;
  disliked: boolean;
  likeCount: number;
  isSavedToAnyList: boolean;
  onLike: () => void;
  onDislike: () => void;
  onShare: () => void;
  onSave: () => void;
  saveModalLoading?: boolean;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareToSocial: (platform: string) => void;
  onCopyLink: () => void;
  shareMessage?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  onShareToSocial,
  onCopyLink,
  shareMessage,
}) => {
  if (!isOpen) {
return null;
}

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-50 animate-fade-in-fast">
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
        <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">Share</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"
          aria-label="Close share modal"
        >
          <XMarkIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-300" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex space-x-3">
          <button
            onClick={() => onShareToSocial('twitter')}
            className="flex flex-col items-center p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-2">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Twitter</span>
          </button>
          <button
            onClick={() => onShareToSocial('facebook')}
            className="flex flex-col items-center p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mb-2">
              <span className="text-white font-bold text-sm">f</span>
            </div>
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Facebook</span>
          </button>
          <button
            onClick={() => onShareToSocial('reddit')}
            className="flex flex-col items-center p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mb-2">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Reddit</span>
          </button>
          <button
            onClick={() => onShareToSocial('email')}
            className="flex flex-col items-center p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <div className="w-10 h-10 bg-neutral-500 rounded-full flex items-center justify-center mb-2">
              <span className="text-white font-bold text-sm">@</span>
            </div>
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Email</span>
          </button>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={window.location.href}
              readOnly
              className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-neutral-50 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
            />
            <button
              onClick={onCopyLink}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-sm font-medium rounded-md transition-colors"
            >
              Copy
            </button>
          </div>
          {shareMessage && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">{shareMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const VideoActions: React.FC<VideoActionsProps> = ({
  liked,
  disliked,
  likeCount,
  isSavedToAnyList,
  onLike,
  onDislike,
  onShare,
  onSave,
  saveModalLoading = false,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState<string>('');
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  const handleShare = () => {
    setIsShareModalOpen(true);
    onShare();
  };

  const handleShareToSocial = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${url}&title=${title}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${title}&body=${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    setIsShareModalOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareMessage('Link copied to clipboard!');
      setTimeout(() => setShareMessage(''), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      setShareMessage('Failed to copy link');
      setTimeout(() => setShareMessage(''), 3000);
    }
  };

  // Close share modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isShareModalOpen && !(event.target as Element).closest('.share-modal-container')) {
        setIsShareModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isShareModalOpen]);

  return (
    <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar relative">
      {/* Like/Dislike Button Group */}
      <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-full">
        <button
          onClick={onLike}
          className={`flex items-center space-x-1.5 pl-3 pr-2.5 py-2 rounded-l-full text-sm font-medium transition-colors
            ${liked ? 'text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-500/10 hover:bg-sky-200 dark:hover:bg-sky-500/20' : 'text-neutral-800 dark:text-neutral-50 hover:bg-neutral-200 dark:hover:bg-neutral-700/70'}`}
          aria-pressed={liked}
          title="Like"
        >
          <ThumbsUpIcon className={`w-4 h-4 ${liked ? 'fill-sky-600 dark:fill-sky-400' : ''}`} />
          <span className="text-xs">{formatCount(likeCount)}</span>
        </button>
        <div className="h-5 w-px bg-neutral-300 dark:bg-neutral-600/80" />
        <button
          onClick={onDislike}
          className={`hover:bg-neutral-200 dark:hover:bg-neutral-700/70 px-2.5 py-2 rounded-r-full text-sm font-medium transition-colors
            ${disliked ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20' : 'text-neutral-800 dark:text-neutral-50'}`}
          aria-pressed={disliked}
          title="Dislike"
        >
          <ThumbsDownIcon className={`w-4 h-4 ${disliked ? 'fill-red-600 dark:fill-red-400' : ''}`} />
        </button>
      </div>

      {/* Share Button */}
      <div className="relative share-modal-container">
        <button
          onClick={handleShare}
          className="flex items-center space-x-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-50 px-3 py-2 rounded-full text-sm font-medium transition-colors"
          aria-label="Share this video"
          title="Share"
        >
          <ShareIcon className="w-4 h-4" />
          <span className="text-xs">Share</span>
        </button>

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          onShareToSocial={handleShareToSocial}
          onCopyLink={handleCopyLink}
          shareMessage={shareMessage}
        />
      </div>

      {/* Save Button */}
      <div className="relative">
        <button
          ref={saveButtonRef}
          onClick={onSave}
          disabled={saveModalLoading}
          className="flex items-center space-x-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-50 px-3 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-60"
          aria-label="Save this video to a playlist"
          title={isSavedToAnyList ? 'Edit saved playlists' : 'Save to playlist'}
        >
          {isSavedToAnyList ? <SaveIconFilled className="w-4 h-4" /> : <SaveIcon className="w-4 h-4" />}
          <span className="text-xs">{isSavedToAnyList ? 'Saved' : 'Save'}</span>
        </button>
      </div>
    </div>
  );
};

export default VideoActions;