
/// <reference types="react/jsx-runtime" />
// TODO: Fix import - import { Link } from 'react-router-dom';
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName]: any;
    }
  }
}
// TODO: Fix import - import type React from 'react';

// TODO: Fix import - import { BellIcon } from '@heroicons/react/24/outline';
// TODO: Fix import - import { Link } from 'react-router-dom';

import { formatCount } from '../utils/numberUtils';

import { SummarizeIcon } from './icons/SummarizeIcon';

import type { Video, Channel } from '../src/types/core';

interface VideoDescriptionProps {
  video: Video;
  channel?: Channel;
  isSubscribed?: boolean;
  showFullDescription?: boolean;
  isSummarizing?: boolean;
  onSubscribe?: (channelId) => void;
  onLike?: (videoId) => void;
  onShare?: (videoId) => void;
  onToggleDescription?: () => void;
}

const VideoDescription: React.FC<VideoDescriptionProps> = ({
  video,
  channel,
  isSubscribed,
  showFullDescription,
  summary,
  summaryError,
  isSummarizing,
  canSummarize,
  onSubscribe,
  onToggleDescription,
  onSummarizeDescription,
}) => {
  const channelLink = channel ? `/channel/${encodeURIComponent(channel.name)}` : '#';

  return (
    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4 mt-4">
      {/* Channel Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Link to={channelLink} className="flex-shrink-0">
            <img
              src={video.channelAvatarUrl || channel?.avatarUrl || 'https://picsum.photos/seed/defaultChannel/40/40'}
              alt={`${video.channelName || channel?.name || 'Unknown'} channel avatar`}
              className="w-10 h-10 rounded-full object-cover"
            />
          </Link>
          <div className="min-w-0 flex-grow">
            <Link
              to={channelLink}
              className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors block truncate"
            >
              {video.channelName || channel?.name || 'Unknown Channel'}
              {channel?.isVerified && (
                <span className="ml-1 text-neutral-500 dark:text-neutral-400" title="Verified channel">✓</span>
              )}
            </Link>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {channel?.subscriberCount ? `${formatCount(parseInt(((channel.subscriberCount as string)).replace(/[^0-9]/g, ''), 10))} subscribers` : 'No subscriber data'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onSubscribe}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              isSubscribed
                ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                : 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200'
            }`}
            aria-pressed={isSubscribed}
          >
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
          {isSubscribed && (
            <button
              className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700/70 text-neutral-700 dark:text-neutral-200"
              aria-label="Manage notifications for this channel"
              title="Notifications"
            >
              <BellIcon className="w-5 h-5"/>
            </button>
          )}
        </div>
      </div>

      {/* Video Description */}
      <div
        className={`text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed cursor-pointer ${
          !showFullDescription ? 'max-h-20 overflow-hidden' : ''
        }`}
        onClick={onToggleDescription}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
onToggleDescription();
}
        }}
        aria-expanded={showFullDescription}
        aria-controls="video-description-content"
      >
        <div className="text-sm" id="video-description-content">
          <span className="font-medium text-neutral-800 dark:text-neutral-200">
            {video.uploadedAt} &bull; {typeof video.views === 'string' && ((video.views as string)).includes(' ') ? ((video.views as string)).split(' ')[0] : video.views} views
          </span>
          <br/>
          {video.description}
        </div>
      </div>

      {/* Show More/Less Button */}
      {(video.description.length > 150 || video.description.includes('\n')) && (
        <span
          onClick={onToggleDescription}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
onToggleDescription();
}
          }}
          className="text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-neutral-50 font-semibold mt-1.5 block cursor-pointer"
        >
          {showFullDescription ? 'Show less' : '...Show more'}
        </span>
      )}

      {/* AI Summarize Button */}
      {canSummarize && (
        <div className="mt-4">
          <button
            onClick={onSummarizeDescription}
            disabled={isSummarizing}
            className="flex items-center space-x-1.5 bg-sky-500/10 dark:bg-sky-400/10 hover:bg-sky-500/20 dark:hover:bg-sky-400/20 text-sky-700 dark:text-sky-300 px-3.5 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Summarize video description with AI"
            title="Summarize with AI"
          >
            <SummarizeIcon className="w-5 h-5" />
            <span>{isSummarizing ? 'Summarizing...' : '✨ Summarize Description'}</span>
          </button>
        </div>
      )}

      {/* Summary Error */}
      {summaryError && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 rounded-lg text-sm text-red-700 dark:text-red-300" role="alert">
          <strong>Error:</strong> {summaryError}
        </div>
      )}

      {/* AI Summary */}
      {summary && (
        <div className="mt-3 p-3.5 bg-sky-50 dark:bg-sky-900/40 border border-sky-200 dark:border-sky-700/60 rounded-lg">
          <h3 className="text-sm font-semibold text-sky-800 dark:text-sky-200 mb-1.5 flex items-center">
            <SummarizeIcon className="w-5 h-5 mr-1.5 text-sky-600 dark:text-sky-400" />
            AI Generated Summary
          </h3>
          <p className="text-sm text-neutral-700 dark:text-neutral-200 italic leading-relaxed whitespace-pre-wrap">
            {summary}
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoDescription;