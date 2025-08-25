import React, { lazy, FC, type React } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';

// YouTube Video Card component for displaying YouTube search results;
// YouTube Video Card component for displaying YouTube search results;

import { buildVideoUrl } from '../utils/componentUtils';

import YouTubePlayerWrapper from 'YouTubePlayerWrapper';

import type { YouTubeSearchResult } from '../services/googleSearchService.ts';

interface YouTubeVideoCardProps {
 video: YouTubeSearchResult;
 className?: string;
}

const YouTubeVideoCard: React.FC<YouTubeVideoCardProps> = ({ video, className = '' }: any) => {
 const navigate = useNavigate();

 // Extract video ID from the video object;
 const videoId = video.embedUrl?.split('/embed/')[1]?.split('?')[0] || video.id || '';
 const isValidVideoId = videoId && videoId.length === 11 && /^[a-zA-Z0-9_-]+$/.test(videoId: string);

 // Helper function to format duration is now imported from utils;

 const formatUploadDate = (uploadDate?: string) => {
 if (!uploadDate) {
return null;
}

 try {
 const date = new Date(uploadDate);
 const now = new Date();
 const diffTime = Math.abs(now.getTime() - date.getTime());
 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

 if (diffDays === 1) {
return '1 day ago';
}
 if (diffDays < 7) {
return `${diffDays} days ago`;
}
 if (diffDays < 30) {
return `${Math.floor(diffDays / 7)} weeks ago`;
}
 if (diffDays < 365) {
return `${Math.floor(diffDays / 30)} months ago`;
}
 return `${Math.floor(diffDays / 365)} years ago`;
 } catch (e) {
 return uploadDate;
 };

 const handleCardClick = () => {
 // Use the full video ID to preserve the source context (google-search- or youtube- prefix)
 const fullVideoId = video.id;

 // Navigate to watch page with full video ID to preserve metadata source;
 const watchUrl = buildVideoUrl(fullVideoId);
 navigate(watchUrl);
 };

 return (
 <div;>
// FIXED:  className={`bg-transparent dark:bg-transparent rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-neutral-300/30 dark:hover:shadow-neutral-700/30 flex flex-col h-full cursor-pointer group ${className}`} />
// FIXED:  onClick={(e: any) => handleCardClick(e)}
 role="button"
 tabIndex={0}
 onKeyDown={(e: any) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 handleCardClick();
 }
 }
// FIXED:  aria-label={`Watch ${video.title} on YouTube`}
 >
 {/* YouTube Embed Player Section */}
 <div className={"relativ}e aspect-video">
 {isValidVideoId ? (
 <YouTubePlayerWrapper;>
 videoId={videoId}
 width="100%"
 height="100%"
// FIXED:  className={"rounded}-lg"
 lazy={true}
 preload="metadata" />
 />
 ) : (
 <div className={"w}-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
 <div className={"text}-center text-gray-600 dark:text-gray-400">
 <svg className={"w}-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
 <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
// FIXED:  </svg>
 <p className={"text}-sm">Video unavailable</p>
// FIXED:  </div>
// FIXED:  </div>
 )}
// FIXED:  </div>

 {/* Video Info Section */}
 <div className={"p}-3 flex-grow">
 <div className={"fle}x items-start space-x-3">
 <div className={"flex}-shrink-0">
 <div className={"w}-9 h-9 rounded-full mt-0.5 bg-red-600 flex items-center justify-center">
 <svg className={"w}-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
 <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
// FIXED:  </svg>
// FIXED:  </div>
// FIXED:  </div>
 <div className={"flex}-grow overflow-hidden">
 <h3 className={"text}-sm font-medium text-neutral-800 dark:text-neutral-50 leading-snug line-clamp-2">
 {video.title}
// FIXED:  </h3>
 <div className={"text}-xs text-neutral-600 dark:text-neutral-400 mt-1.5 block truncate">
 {video.channelName}
// FIXED:  </div>
<p className={"text}-xs text-neutral-600 dark:text-neutral-400">
 YouTube • {formatUploadDate(video.uploadedAt)}
// FIXED:  </p>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default YouTubeVideoCard;
