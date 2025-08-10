import { type RefObject } from 'react';

import { isYouTubeUrl, getYouTubeVideoId } from '../src/lib/youtube-utils';
import { formatDistanceToNow } from '../utils/dateUtils';
import { formatCount } from '../utils/numberUtils';

import AdvancedVideoPlayer from './AdvancedVideoPlayer';
import VideoActions from './VideoActions';
import VideoDescription from './VideoDescription';
import YouTubePlayerWrapper from './YouTubePlayerWrapper';

import type { Video, Channel } from '../src/types/core';

interface VideoPlaybackDetailsProps {
  video: Video;
  channel: Channel | null; // Channel can be null initially
  liked: boolean;
  disliked: boolean;
  isSubscribed: boolean;
  isSavedToAnyList: boolean;
  showFullDescription: boolean;
  summary?: string | null;
  summaryError?: string | null;
  isSummarizing?: boolean;
  canSummarize?: boolean;
  isSaveModalOpen: boolean;
  saveModalLoading: boolean;
  saveButtonRef: RefObject<HTMLButtonElement>;
  saveModalRef: RefObject<HTMLDivElement>;
  handleLike: () => void;
  handleDislike: () => void;
  handleSubscribe: () => void;
  openSaveModal: () => void;
  handleToggleDescription: () => void;
  handleSummarizeDescription?: () => void; // Optional as per VideoDescription
}

const VideoPlaybackDetails = (props: VideoPlaybackDetailsProps) => {
  const {
    video,
    channel,
    liked,
    disliked,
    isSubscribed,
    showFullDescription,
    summary,
    summaryError,
    isSummarizing,
    canSummarize,
    handleLike,
    handleDislike,
    handleSubscribe,
    openSaveModal,
    handleToggleDescription,
    handleSummarizeDescription,
  } = props;
  if (!video) {
return null;
} // Should be handled by parent, but good practice

  return (
    <>
      {/* Video player */}
      <div className="mb-4">
        {isYouTubeUrl(video.videoUrl) ? (
          <YouTubePlayerWrapper
            videoId={getYouTubeVideoId(video.videoUrl) || ''}
            autoplay={false}
            width="100%"
            height={480}
            controls={true}
          />
        ) : (
          <AdvancedVideoPlayer
            video={video}
          />
        )}
      </div>

      {/* Video title and stats */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {video.title}
        </h1>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {formatCount(typeof video.views === 'string' ? parseInt(((video.views as string)).replace(/[^0-9]/g, ''), 10) : video.views || 0)} views • {formatDistanceToNow(video.uploadedAt)}
          </div>
        </div>
      </div>

      {/* Video actions */}
      <VideoActions
        liked={liked}
        disliked={disliked}
        likeCount={video.likes || 0}
        isSavedToAnyList={props.isSavedToAnyList}
        onLike={handleLike}
        onDislike={handleDislike}
        onShare={() => { /* Implement share functionality */ }}
        onSave={openSaveModal}
      />

      {/* Video description */}
      {channel && (
        <VideoDescription
          video={video}
          channel={channel}
          isSubscribed={isSubscribed}
          showFullDescription={showFullDescription}
          isSummarizing={isSummarizing || false}
          canSummarize={canSummarize || false}
          onSubscribe={handleSubscribe}
          onToggleDescription={handleToggleDescription}
          onSummarizeDescription={handleSummarizeDescription || (() => {})}
          {...(summaryError !== null && summaryError !== undefined && { summaryError })}
          {...(summary !== null && summary !== undefined && { summary })}
        />
      )}
    </>
  );
};

export default VideoPlaybackDetails;