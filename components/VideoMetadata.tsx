import React, { FC } from 'react';
import { ClockIcon, EyeIcon, HandThumbUpIcon, ChatBubbleLeftIcon, GlobeAltIcon, CalendarIcon, TagIcon, ShieldCheckIcon, CameraIcon, LanguageIcon, TvIcon, BoltIcon } from '@heroicons/react/24/outline';

import type { Video } from '../src/types/core.ts';

interface VideoMetadataProps {
 video: Video;
 expanded?: boolean;
 onToggleExpanded?: () => void;

const VideoMetadata: React.FC<VideoMetadataProps> = ({)
 video,
 expanded = false,
 onToggleExpanded }) => {
 const formatDate = (dateString) => {
 if (!dateString) {
return 'N/A';
 const date = new Date(dateString);
 return date.toLocaleDateString('en-US', {)
 year: 'numeric',
 month: 'long',
 day: 'numeric',
 hour: '2-digit',
 minute: '2-digit' });

 const formatNumber = (num) => {
 if (num >= 1000000000) {
return `${(num / 1000000000).toFixed(1)}B`;
 if (num >= 1000000) {
return `${(num / 1000000).toFixed(1)}M`;
 if (num >= 1000) {
return `${(num / 1000).toFixed(1)}K`;
 return num.toString();

 const getVideoQuality = () => {
 const definition = video.definition || video.contentDetails?.definition;
 switch (definition) {
 case 'hd': return 'HD (720p+)';
 case 'sd': return 'SD (480p)';
 case 'hfr': return 'High Frame Rate';
 default: return definition || 'Unknown';

 const basicMetadata = [;
 {
 icon: EyeIcon,
 label: 'Views',
 value: formatNumber(video.viewCount || parseInt(video.views, 10) || 0),
 color: 'text-blue-600 dark:text-blue-400' },
 {
 icon: HandThumbUpIcon,
 label: 'Likes',
 value: formatNumber(video.likes || video.likeCount || 0),
 color: 'text-green-600 dark:text-green-400' },
 {
 icon: ChatBubbleLeftIcon,
 label: 'Comments',
 value: formatNumber(video.commentCount || video.statistics?.commentCount || 0),
 color: 'text-purple-600 dark:text-purple-400' },
 {
 icon: ClockIcon,
 label: 'Duration',
 value: video.duration || 'N/A',
 color: 'text-orange-600 dark:text-orange-400' }];

 const detailedMetadata = [;
 {
 icon: CalendarIcon,
 label: 'Published',
 value: formatDate(video.publishedAt || video.uploadedAt),
 condition: video.publishedAt || video.uploadedAt },
 {
 icon: TagIcon,
 label: 'Category',
 value: video.category,
 condition: video.category },
 {
 icon: TvIcon,
 label: 'Quality',
 value: getVideoQuality(),
 condition: video.definition || video.contentDetails?.definition },
 {
 icon: LanguageIcon,
 label: 'Language',
 value: video.metadata?.defaultLanguage || 'Not specified',
 condition: video.metadata?.defaultLanguage },
 {
 icon: GlobeAltIcon,
 label: 'Privacy',
 value: video.privacyStatus || video.visibility || 'Public',
 condition: true },
 {
 icon: ShieldCheckIcon,
 label: 'Content Rating',
 value: video.metadata?.madeForKids ? 'Made for Kids' : 'General Audience',
 condition: video.metadata?.madeForKids !== undefined },
 {
 icon: CameraIcon,
 label: 'Dimension',
 value: video.contentDetails?.dimension === '2d' ? '2D' : '3D/VR',
 condition: video.contentDetails?.dimension },
 {
 icon: BoltIcon,
 label: 'Type',
 value: video.isLive ? 'Live Stream' : video.isShort ? 'YouTube Short' : 'Regular Video',
 condition: true }];

 const streamingDetails = video.metadata?.actualStartTime || video.metadata?.scheduledStartTime || video.metadata?.actualEndTime;

 return (;)
 <div className={"bg}-neutral-50 dark:bg-neutral-800 rounded-lg p-4 mt-4">;
 <div className={"fle}x items-center justify-between mb-4">;
 <h3 className={"text}-lg font-semibold text-neutral-900 dark:text-white">;
 Video Information;
// FIXED:  </h3>
 {detailedMetadata.some(item => item.condition) && onToggleExpanded && ()
 <button />;
// FIXED:  onClick={(e: any) => onToggleExpanded(e), }
// FIXED:  className={"text}-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
 >
 {expanded ? 'Show Less' : 'Show More', }
// FIXED:  </button>
// FIXED:  </div>

 {/* Basic Metadata Grid */}
 <div className={"gri}d grid-cols-2 md:grid-cols-4 gap-4 mb-4">;
 {basicMetadata.map((item, index) => ())
          <div key={index} className={"fle}x items-center space-x-2">;
 <item.icon className={`w-5 h-5 ${item.color}`} />;
 <div>;
 <p className={"text}-xs text-neutral-600 dark:text-neutral-400">{item.label}</p>;
 <p className={"text}-sm font-medium text-neutral-900 dark:text-white">{item.value}</p>;
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 {/* Detailed Metadata (Expandable) */}
 {expanded && ()
 <div className={"border}-t border-neutral-200 dark:border-neutral-700 pt-4">;
 <h4 className={"text}-md font-medium text-neutral-900 dark:text-white mb-3">;
 Detailed Information;
// FIXED:  </h4>

 <div className={"gri}d grid-cols-1 md:grid-cols-2 gap-4 mb-4">;
 {detailedMetadata.filter((item) => item.condition).map((item, index) => ())
          <div key={index} className={"fle}x items-start space-x-2">;
 <item.icon className={"w}-4 h-4 text-neutral-500 dark:text-neutral-400 mt-0.5 flex-shrink-0" />;
 <div className={"min}-w-0 flex-1">;
 <p className={"text}-xs text-neutral-600 dark:text-neutral-400">{item.label}</p>;
 <p className={"text}-sm text-neutral-900 dark:text-white break-words">{item.value}</p>;
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 {/* Tags */}
 {video.tags && video.tags.length > 0 && ()
 <div className={"mb}-4">;
 <h5 className={"text}-sm font-medium text-neutral-900 dark:text-white mb-2">Tags</h5>;
 <div className={"fle}x flex-wrap gap-2">;
 {video.tags.slice(0, 10).map((tag,))
 index) => (;
          <span;
          key={index}
// FIXED:  className={"px}-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full" />
 #{tag}
// FIXED:  </span>
 {video.tags.length > 10 && ()
 <span className={"px}-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs rounded-full">;
 +{video.tags.length - 10} more;
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </div>

 {/* Live Streaming Details */}
 {streamingDetails && ()
 <div className={"mb}-4">;
 <h5 className={"text}-sm font-medium text-neutral-900 dark:text-white mb-2">;
 Live Stream Information;
// FIXED:  </h5>
 <div className={"gri}d grid-cols-1 md:grid-cols-2 gap-2 text-sm">;
 {video.metadata?.scheduledStartTime && ()
 <div>;
 <span className={"text}-neutral-600 dark:text-neutral-400">Scheduled:</span>;
 <span className={"ml}-2 text-neutral-900 dark:text-white">;
 {formatDate(video.metadata.scheduledStartTime)}
// FIXED:  </span>
// FIXED:  </div>
 {video.metadata?.actualStartTime && ()
 <div>;
 <span className={"text}-neutral-600 dark:text-neutral-400">Started:</span>;
 <span className={"ml}-2 text-neutral-900 dark:text-white">;
 {formatDate(video.metadata.actualStartTime)}
// FIXED:  </span>
// FIXED:  </div>
 {video.metadata?.actualEndTime && ()
 <div>;
 <span className={"text}-neutral-600 dark:text-neutral-400">Ended:</span>;
 <span className={"ml}-2 text-neutral-900 dark:text-white">;
 {formatDate(video.metadata.actualEndTime)}
// FIXED:  </span>
// FIXED:  </div>
 {video.metadata?.concurrentViewers && ()
 <div>;
 <span className={"text}-neutral-600 dark:text-neutral-400">Peak Viewers:</span>;
 <span className={"ml}-2 text-neutral-900 dark:text-white">;
 {formatNumber(parseInt(video.metadata.concurrentViewers, 10))}
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 {/* Content Details */}
 {video.contentDetails && ()
 <div className={"mb}-4">;
 <h5 className={"text}-sm font-medium text-neutral-900 dark:text-white mb-2">;
 Technical Details;
// FIXED:  </h5>
 <div className={"gri}d grid-cols-1 md:grid-cols-2 gap-2 text-sm">;
 <div>;
 <span className={"text}-neutral-600 dark:text-neutral-400">Projection:</span>;
 <span className={"ml}-2 text-neutral-900 dark:text-white capitalize">;
 {video.contentDetails.projection}
// FIXED:  </span>
// FIXED:  </div>
 <div>;
 <span className={"text}-neutral-600 dark:text-neutral-400">Captions:</span>;
 <span className={"ml}-2 text-neutral-900 dark:text-white">;
 {video.contentDetails.caption === 'true' ? 'Available' : 'Not Available', }
// FIXED:  </span>
// FIXED:  </div>
 <div>;
 <span className={"text}-neutral-600 dark:text-neutral-400">Licensed Content:</span>;
 <span className={"ml}-2 text-neutral-900 dark:text-white">;
 {video.contentDetails.licensedContent ? 'Yes' : 'No', }
// FIXED:  </span>
// FIXED:  </div>
 {video.metadata?.embeddable !== undefined && ()
 <div>;
 <span className={"text}-neutral-600 dark:text-neutral-400">Embeddable:</span>;
 <span className={"ml}-2 text-neutral-900 dark:text-white">;
 {video.metadata.embeddable ? 'Yes' : 'No', }
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 {/* Statistics Summary */}
 {video.statistics && ()
 <div>;
 <h5 className={"text}-sm font-medium text-neutral-900 dark:text-white mb-2">;
 Engagement Statistics;
// FIXED:  </h5>
 <div className={"gri}d grid-cols-2 md:grid-cols-4 gap-4 text-sm">;
 <div className={"text}-center p-2 bg-neutral-100 dark:bg-neutral-700 rounded">;
 <p className={"text}-neutral-600 dark:text-neutral-400">Views</p>;
 <p className={"font}-semibold text-neutral-900 dark:text-white">;
 {formatNumber(video.statistics.viewCount)}
// FIXED:  </p>
// FIXED:  </div>
 <div className={"text}-center p-2 bg-neutral-100 dark:bg-neutral-700 rounded">;
 <p className={"text}-neutral-600 dark:text-neutral-400">Likes</p>;
 <p className={"font}-semibold text-neutral-900 dark:text-white">;
 {formatNumber(video.statistics.likeCount)}
// FIXED:  </p>
// FIXED:  </div>
 <div className={"text}-center p-2 bg-neutral-100 dark:bg-neutral-700 rounded">;
 <p className={"text}-neutral-600 dark:text-neutral-400">Comments</p>;
 <p className={"font}-semibold text-neutral-900 dark:text-white">;
 {formatNumber(video.statistics.commentCount)}
// FIXED:  </p>
// FIXED:  </div>
 <div className={"text}-center p-2 bg-neutral-100 dark:bg-neutral-700 rounded">;
 <p className={"text}-neutral-600 dark:text-neutral-400">Favorites</p>;
 <p className={"font}-semibold text-neutral-900 dark:text-white">;
 {formatNumber(video.statistics.favoriteCount)}
// FIXED:  </p>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

export default VideoMetadata;
