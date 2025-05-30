import React from 'react';
import { Link } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import { SummarizeIcon } from '../icons/SummarizeIcon';

interface Channel {
  id: string;
  name: string;
  avatarUrl: string;
  subscriberCount: string;
  isVerified: boolean;
}

interface Video {
  id: string;
  title: string;
  description: string;
  views: string;
  uploadedAt: string;
}

interface VideoDescriptionProps {
  video: Video;
  channel: Channel | null;
  isSubscribed: boolean;
  showFullDescription: boolean;
  summary?: string;
  summaryError?: string;
  isSummarizing: boolean;
  canSummarize: boolean;
  onSubscribe: () => void;
  onToggleDescription: () => void;
  onSummarizeDescription: () => void;
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
  onSummarizeDescription
}) => {
  const channelLink = channel ? `/channel/${encodeURIComponent(channel.name)}` : '#';

  return (
    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 mt-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-grow min-w-0">
          <Link to={channelLink} className="flex-shrink-0">
            <img 
              src={channel?.avatarUrl || 'https://picsum.photos/seed/defaultChannel/40/40'} 
              alt={`${channel?.name || 'Unknown'} channel avatar`} 
              className="w-10 h-10 rounded-full object-cover"
            />
          </Link>
          <div className="min-w-0 flex-grow">
            <Link 
              to={channelLink} 
              className="text-sm font-medium text-neutral-900 dark:text-neutral-50 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors block truncate"
            >
              {channel?.name || 'Unknown Channel'}
              {channel?.isVerified && (
                <span className="ml-1 text-blue-500">✓</span>
              )}
            </Link>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {channel?.subscriberCount || '0'} subscribers
            </p>
          </div>
        </div>
        <button
          onClick={onSubscribe}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
            isSubscribed
              ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          <BellIcon className="w-4 h-4 mr-1 inline" />
          {isSubscribed ? 'Subscribed' : 'Subscribe'}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {video.views} views • {video.uploadedAt}
          </div>
          {canSummarize && (
            <button
              onClick={onSummarizeDescription}
              disabled={isSummarizing}
              className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SummarizeIcon className="w-3 h-3" />
              <span>{isSummarizing ? 'Summarizing...' : 'Summarize'}</span>
            </button>
          )}
        </div>

        {summary && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">AI Summary</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">{summary}</p>
          </div>
        )}

        {summaryError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-200">{summaryError}</p>
          </div>
        )}

        <div className="text-sm text-neutral-700 dark:text-neutral-300">
          <div className={showFullDescription ? '' : 'line-clamp-3'}>
            {video.description || 'No description available.'}
          </div>
          {video.description && video.description.length > 150 && (
            <button
              onClick={onToggleDescription}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2 text-sm font-medium"
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoDescription;