import React, { FC, type React } from 'react';
import type { Video } from '../types';
import type { Channel } from '../types';
import { Link } from 'react-router-dom';

import { BellIcon } from '@heroicons/react/24/outline';

import { formatCount } from '../utils/numberUtils';

import { SummarizeIcon } from './icons/SummarizeIcon';

interface Channel {
 id: string;
 name: string;
 avatarUrl: string;
 subscriberCount: string; isVerified: boolean
}

interface Video {
 id: string;
 title: string;
 description: string;
 views: string; uploadedAt: string
}

interface RefactoredVideoDescriptionProps {
 video: Video;
 channel: Channel | null;
 isSubscribed: boolean;
 showFullDescription: boolean;
 summary?: string;
 summaryError?: string;
 isSummarizing: boolean;
 canSummarize: boolean;
 onSubscribe: () => void;
 onToggleDescription: () => void; onSummarizeDescription: () => void
}

/**
 * Refactored Video Description Component
 *
 * This component demonstrates improved patterns: * - Extracted reusable sub-components
 * - Better separation of concerns
 * - Consistent styling patterns
 * - Improved accessibility
 * - Cleaner component composition
 */

// Reusable Channel Info Component
interface ChannelInfoProps {
 channel: Channel | null;
 isSubscribed: boolean; onSubscribe: () => void
}

const ChannelInfo: React.FC<ChannelInfoProps> = ({ channel, isSubscribed, onSubscribe }: any) => {
 const channelLink = channel ? `/channel/${encodeURIComponent(channel.name)}` : '#';

 return (
 <div className={"fle}x items-center justify-between mb-4">
 <div className={"fle}x items-center space-x-3">
 <Link to={channelLink} className={"flex}-shrink-0">
 <img>
// FIXED:  src={channel?.avatarUrl || 'https://picsum.photos/seed/defaultChannel/40/40'}
// FIXED:  alt={`${channel?.name || 'Unknown'} channel avatar`}
// FIXED:  className={"w}-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700" />
 />
// FIXED:  </Link>

 <div className={"min}-w-0 flex-grow">
 <Link>
 to={channelLink}
// FIXED:  className={"text}-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block truncate"/>
 {channel?.name || 'Unknown Channel'}
 {channel?.isVerified && (
 <span className={"ml}-1 text-blue-500" title="Verified channel">✓</span>
 )}
// FIXED:  </Link>
 <p className={"text}-xs text-gray-600 dark:text-gray-400">
 {channel?.subscriberCount
 ? `${formatCount(parseInt(channel.subscriberCount.replace(/[^0-9]/g, ''), 10))} subscribers`
 : 'No subscriber data'
 }
// FIXED:  </p>
// FIXED:  </div>
// FIXED:  </div>

 <div className={"fle}x items-center space-x-2">
 <SubscribeButton isSubscribed={isSubscribed} onSubscribe={onSubscribe} />
 {isSubscribed && <NotificationButton />}
// FIXED:  </div>
// FIXED:  </div>
 );
};

// Reusable Subscribe Button Component
interface SubscribeButtonProps {
 isSubscribed: boolean; onSubscribe: () => void
}

const SubscribeButton: React.FC<SubscribeButtonProps> = ({ isSubscribed, onSubscribe }: any) => {
 return (
 <button />
// FIXED:  onClick={(e) => onSubscribe(e)}
// FIXED:  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
 isSubscribed
 ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
 : 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl'
 }`}
// FIXED:  aria-pressed={isSubscribed}
 >
 {isSubscribed ? 'Subscribed' : 'Subscribe'}
// FIXED:  </button>
 );
};

// Reusable Notification Button Component
const NotificationButton: React.FC = () => {
 return (
 <button>
// FIXED:  className={"p}-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
// FIXED:  aria-label="Manage notifications for this channel"
 title="Notifications"/>
 <BellIcon className={"w}-5 h-5" />
// FIXED:  </button>
 );
};

// Reusable Description Content Component
interface DescriptionContentProps {
 video: Video;
 showFullDescription: boolean; onToggleDescription: () => void
}

const DescriptionContent: React.FC<DescriptionContentProps> = ({
 video,
 showFullDescription,
 onToggleDescription }) => {
 const shouldShowToggle = video.description.length > 150 || video.description.includes('\n');

 return (
 <div className={"space}-y-2">
 {/* Video Metadata */}
 <div className={"text}-sm font-medium text-gray-800 dark:text-gray-200">
 {video.uploadedAt} • {video.views.split(' ')[0]} views
// FIXED:  </div>

 {/* Description Text */}
 <div>
// FIXED:  className={`text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed cursor-pointer transition-all duration-300 ${
 !showFullDescription ? 'max-h-20 overflow-hidden' : ''
 }`} />
// FIXED:  onClick={(e) => onToggleDescription(e)}
 role="button"
 tabIndex={0}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 onToggleDescription();
 }
 }
// FIXED:  aria-expanded={showFullDescription}
// FIXED:  aria-controls="video-description-content"
 >
 <div className={"text}-sm" id="video-description-content">
 {video.description}
// FIXED:  </div>
// FIXED:  </div>

 {/* Show More/Less Button */}
 {shouldShowToggle && (
 <button />
// FIXED:  onClick={(e) => onToggleDescription(e)}
// FIXED:  className={"text}-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-sm transition-colors"
 >
 {showFullDescription ? 'Show less' : '...Show more'}
// FIXED:  </button>
 )}
// FIXED:  </div>
 );
};

// Reusable AI Summary Section Component
interface AISummarySectionProps {
 canSummarize: boolean;
 isSummarizing: boolean;
 summary?: string;
 summaryError?: string; onSummarizeDescription: () => void
}

const AISummarySection: React.FC<AISummarySectionProps> = ({
 canSummarize,
 isSummarizing,
 summary,
 summaryError,
 onSummarizeDescription }) => {
 if (!canSummarize) {
return null;
}

 return (
 <div className={"space}-y-3">
 {/* Summarize Button */}
 <button />
// FIXED:  onClick={(e) => onSummarizeDescription(e)}
// FIXED:  disabled={isSummarizing}
// FIXED:  className={"fle}x items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 text-blue-700 dark:text-blue-300 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105"
// FIXED:  aria-label="Summarize video description with AI"
 title="Summarize with AI"
 >
 <SummarizeIcon className={"w}-5 h-5" />
 <span>{isSummarizing ? 'Summarizing...' : '✨ Summarize Description'}</span>
// FIXED:  </button>

 {/* Error State */}
 {summaryError && (
 <div className={"p}-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 rounded-lg" role="alert">
 <div className={"fle}x items-start space-x-2">
 <span className={"text}-red-500 text-lg">⚠️</span>
 <div>
 <p className={"text}-sm font-medium text-red-800 dark:text-red-200">Error</p>
 <p className={"text}-sm text-red-700 dark:text-red-300">{summaryError}</p>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 )}

 {/* Summary Display */}
 {summary && (
 <div className={"p}-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/40 dark:to-purple-900/40 border border-blue-200 dark:border-blue-700/60 rounded-lg">
 <h3 className={"text}-sm font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
 <SummarizeIcon className={"w}-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
 AI Generated Summary
// FIXED:  </h3>
 <p className={"text}-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
 {summary}
// FIXED:  </p>
// FIXED:  </div>
 )}
// FIXED:  </div>
 );
};

// Main Refactored Component
const RefactoredVideoDescription: React.FC<RefactoredVideoDescriptionProps> = ({
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
 onSummarizeDescription }) => {
 return (
 <div className={"bg}-gray-100 dark:bg-gray-800 rounded-xl p-4 mt-4 shadow-sm border border-gray-200 dark:border-gray-700">
 {/* Channel Information */}
 <ChannelInfo>
 channel={channel}
 isSubscribed={isSubscribed}
 onSubscribe={onSubscribe} />
 />

 {/* Video Description */}
 <DescriptionContent>
 video={video}
 showFullDescription={showFullDescription}
 onToggleDescription={onToggleDescription} />
 />

 {/* AI Summary Section */}
 <div className={"mt}-4">
 <AISummarySection>
 canSummarize={canSummarize}
 isSummarizing={isSummarizing}
 summary={summary || ''}
 summaryError={summaryError || ''}
 onSummarizeDescription={onSummarizeDescription} />
 />
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default RefactoredVideoDescription;
