import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, HeartIcon, ChatBubbleOvalLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Short } from '../types';
import { formatNumber } from '../utils/formatters';
import { useVideoPlayer, useIntersectionObserver, useVideoAutoplay } from '../hooks';
import { ActionButton, LoadingSpinner, ErrorMessage } from './ui';

interface ShortDisplayCardProps {
  short: Short;
  isLiked?: boolean;
  onLike?: (shortId: string) => void;
  onComment?: (shortId: string) => void;
  onShare?: (shortId: string) => void;
}

// Video-specific components

// Extracted PlayPauseOverlay component
interface PlayPauseOverlayProps {
  isPlaying: boolean;
  onToggle: () => void;
}

const PlayPauseOverlay: React.FC<PlayPauseOverlayProps> = ({ isPlaying, onToggle }) => (
  <div 
    className="absolute inset-0 flex items-center justify-center cursor-pointer"
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
  >
    <button
      className={`
        bg-black bg-opacity-50 text-white p-4 rounded-full 
        transition-opacity duration-200 pointer-events-none
        ${!isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 hover:opacity-100'}
        hover:bg-opacity-70
      `}
      aria-label={isPlaying ? 'Pause video' : 'Play video'}
    >
      {isPlaying ? (
        <PauseIcon className="w-8 h-8" />
      ) : (
        <PlayIcon className="w-8 h-8" />
      )}
    </button>
  </div>
);

// Extracted VideoInfo component
interface VideoInfoProps {
  title: string;
  channelName: string;
  views: number;
}

const VideoInfo: React.FC<VideoInfoProps> = ({ title, channelName, views }) => (
  <div className="flex-1 mr-4 pointer-events-auto">
    <h3 className="text-white font-medium text-sm mb-1 line-clamp-2">
      {title}
    </h3>
    <p className="text-gray-300 text-xs">
      {channelName} • {formatNumber(views)} views
    </p>
  </div>
);

// Extracted ActionButtons component
interface ActionButtonsProps {
  isMuted: boolean;
  isLiked: boolean;
  onToggleMute: () => void;
  onLike: (e: React.MouseEvent) => void;
  onComment: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isMuted,
  isLiked,
  onToggleMute,
  onLike,
  onComment,
  onShare
}) => (
  <div className="flex flex-col space-y-3 pointer-events-auto">
    {/* Mute/Unmute */}
    <ActionButton
      onClick={(e) => {
        e.stopPropagation();
        onToggleMute();
      }}
      ariaLabel={isMuted ? 'Unmute video' : 'Mute video'}
    >
      {isMuted ? (
        <SpeakerXMarkIcon className="w-5 h-5" />
      ) : (
        <SpeakerWaveIcon className="w-5 h-5" />
      )}
    </ActionButton>
    
    {/* Like */}
    <ActionButton
      onClick={onLike}
      ariaLabel="Like video"
    >
      {isLiked ? (
        <HeartIconSolid className="w-5 h-5 text-red-500" />
      ) : (
        <HeartIcon className="w-5 h-5" />
      )}
    </ActionButton>
    
    {/* Comment */}
    <ActionButton
      onClick={onComment}
      ariaLabel="Comment on video"
    >
      <ChatBubbleOvalLeftIcon className="w-5 h-5" />
    </ActionButton>
    
    {/* Share */}
    <ActionButton
      onClick={onShare}
      ariaLabel="Share video"
    >
      <ShareIcon className="w-5 h-5" />
    </ActionButton>
  </div>
);

// Extracted LoadingIndicator component
const LoadingIndicator: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <LoadingSpinner size="md" color="white" />
  </div>
);

// Extracted ErrorState component
interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <ErrorMessage 
    message={error}
    onRetry={onRetry}
    variant="overlay"
    showIcon={false}
  />
);



// Main component
const ShortDisplayCard: React.FC<ShortDisplayCardProps> = ({ 
  short, 
  isLiked = false,
  onLike, 
  onComment, 
  onShare 
}) => {
  const location = useLocation();
  const isOnShortsPage = location.pathname === '/shorts';
  const [isManuallyPaused, setIsManuallyPaused] = React.useState(false);
  
  // Real video player implementation
  const { videoRef, state, actions, events } = useVideoPlayer({
    autoplay: false,
    muted: true,
    loop: true,
    playsinline: true
  });
  
  // Use intersection observer for visibility tracking and autoplay
  const { ref: intersectionRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.7,
    rootMargin: '0px'
  });
  
  // Enable autoplay when video is in view
  useVideoAutoplay({
    isIntersecting,
    isPlaying: state.isPlaying,
    isManuallyPaused,
    actions,
    setIsManuallyPaused,
    enableAutoplay: isOnShortsPage // Only enable autoplay on shorts page
  });
  
  // Event handlers
  const handlePlayPauseToggle = async () => {
    if (state.isPlaying) {
      actions.pause();
      setIsManuallyPaused(true);
    } else {
      await actions.play();
      setIsManuallyPaused(false);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.(short.id);
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComment?.(short.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(short.id);
  };

  const handleRetry = async () => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  return (
    <div 
      ref={intersectionRef}
      className={`relative bg-black overflow-hidden group cursor-pointer ${
        isOnShortsPage 
          ? 'w-full h-full' 
          : 'w-40 h-72 rounded-lg'
      }`}
    >
      {/* Real video element */}
      <video
        ref={videoRef}
        src={short.videoUrl}
        poster={short.thumbnailUrl}
        className="w-full h-full object-cover"
        playsInline
        muted={state.muted}
        loop
        preload="metadata"
        onLoadStart={events.onLoadStart}
        onLoadedMetadata={events.onLoadedMetadata}
        onCanPlay={events.onCanPlay}
        onPlay={events.onPlay}
        onPause={events.onPause}
        onTimeUpdate={events.onTimeUpdate}
        onDurationChange={events.onDurationChange}
        onVolumeChange={events.onVolumeChange}
        onError={events.onError}
        onEnded={events.onEnded}
        onProgress={events.onProgress}
        onWaiting={events.onWaiting}
        onCanPlayThrough={events.onCanPlayThrough}
      />
      
      {/* Loading Indicator */}
      {state.isLoading && <LoadingIndicator />}
      
      {/* Error State */}
      {state.error && (
        <ErrorState 
          error={state.error}
          onRetry={handleRetry}
        />
      )}
      
      {/* Play/Pause Overlay */}
      <PlayPauseOverlay 
        isPlaying={state.isPlaying}
        onToggle={handlePlayPauseToggle}
      />

      {/* Video Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-none">
        <div className="flex items-end justify-between">
          <VideoInfo 
            title={short.title}
            channelName={short.channelName}
            views={short.views}
          />
          
          {/* Action Buttons */}
          <ActionButtons
            isMuted={state.muted}
            isLiked={isLiked}
            onToggleMute={actions.toggleMute}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
          />
        </div>
      </div>
    </div>
  );
};

export default ShortDisplayCard;

// Export video-specific sub-components for reuse in other parts of the application
export { PlayPauseOverlay, VideoInfo, ActionButtons, LoadingIndicator, ErrorState };