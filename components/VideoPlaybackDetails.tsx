import { RefObject } from 'react';
import AdvancedVideoPlayer from './AdvancedVideoPlayer';
import YouTubePlayerWrapper from './YouTubePlayerWrapper';
import VideoActions from './VideoActions';
import VideoDescription from './VideoDescription';
import { formatCount } from '../utils/numberUtils';
import { formatDistanceToNow } from '../utils/dateUtils';
import { isYouTubeUrl, getYouTubeVideoId } from '../src/lib/youtube-utils';
import { Video, Channel } from '../types'; // Assuming types are defined in types.ts

interface VideoPlaybackDetailsProps {
  video: Video;
  channel: Channel | null; // Channel can be null initially
  liked: boolean;
  disliked: boolean;
  isSubscribed: boolean;
  isSavedToAnyList: boolean;
  mockLikeCount: number;
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
    isSavedToAnyList: _isSavedToAnyList,
    mockLikeCount,
    showFullDescription,
    summary,
    summaryError,
    isSummarizing,
    canSummarize,
    isSaveModalOpen: _isSaveModalOpen,
    saveModalLoading,
    saveButtonRef: _saveButtonRef,
    saveModalRef: _saveModalRef,
    handleLike,
    handleDislike,
    handleSubscribe,
    openSaveModal,
    handleToggleDescription,
    handleSummarizeDescription,
  } = props;
  if (!video) return null; // Should be handled by parent, but good practice

  return (
    <>
      {/* Video player */}
      <div className="mb-4">
        {isYouTubeUrl(video.videoUrl) ? (
          <YouTubePlayerWrapper
            videoId={getYouTubeVideoId(video.videoUrl) || ''}
            title={video.title}
            autoplay={false}
            priority={true}
            width="100%"
            height={480}
            controls={true}
          />
        ) : (
          <AdvancedVideoPlayer
            src={video.videoUrl}
            poster={video.thumbnailUrl}
            title={video.title}
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
            {formatCount(parseInt(video.views))} views • {formatDistanceToNow(video.uploadedAt)}
          </div>
        </div>
      </div>

      {/* Video actions */}
      <VideoActions
        liked={liked}
        disliked={disliked}
        likeCount={mockLikeCount}
        onLike={handleLike}
        onDislike={handleDislike}
        onShare={() => { /* Implement share functionality */ }}
        onSave={openSaveModal}
      />

      {/* Video description */}
      {channel && (
        <VideoDescription
          isSummarizing={isSummarizing}
          canSummarize={canSummarize}
          onSummarize={handleSummarizeDescription}
          summaryError={summaryError || undefined}
          summary={summary || undefined}
          video={video}
          channel={channel}
          isSubscribed={isSubscribed}
          onSubscribe={handleSubscribe}
          showFullDescription={showFullDescription}
          onToggleDescription={handleToggleDescription}
        />
      )}
    </>
  );
};

export default VideoPlaybackDetails;