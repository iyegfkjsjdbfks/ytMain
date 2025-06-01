import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, HeartIcon, ChatBubbleOvalLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Short } from '../types';
import { formatNumber } from '../utils/formatters';
import { useVideoPlayer, useIntersectionObserver } from '../hooks';

interface ShortDisplayCardProps {
  short: Short;
  onLike?: (shortId: string) => void;
  onComment?: (shortId: string) => void;
  onShare?: (shortId: string) => void;
}

const ShortDisplayCard: React.FC<ShortDisplayCardProps> = ({
  short,
  onLike,
  onComment,
  onShare
}) => {
  const location = useLocation();
  const isOnShortsPage = location.pathname === '/shorts';
  
  // Use the custom video player hook
  const { videoRef, state, actions, events } = useVideoPlayer({
    muted: !isOnShortsPage, // Unmuted on shorts page, muted elsewhere
    loop: true,
    playsinline: true
  });
  
  // Use intersection observer for autoplay
  const { ref: intersectionRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.7,
    rootMargin: '0px'
  });
  
  // Callback ref to attach both video player ref and intersection observer ref
  const videoCallbackRef = useCallback((node: HTMLVideoElement | null) => {
    if (videoRef.current !== node) {
      (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
    }
    if (intersectionRef.current !== node) {
      (intersectionRef as React.MutableRefObject<Element | null>).current = node;
    }
  }, [videoRef, intersectionRef]);
  
  // Sync autoplay with video player
  React.useEffect(() => {
    if (isIntersecting && !state.isPlaying) {
      actions.play();
    } else if (!isIntersecting && state.isPlaying) {
      actions.pause();
    }
  }, [isIntersecting, state.isPlaying, actions]);
  
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

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden group cursor-pointer">
      <video
        ref={videoCallbackRef}
        src={short.videoUrl}
        onClick={(e) => {
          e.stopPropagation();
          actions.togglePlayPause();
        }}
        onPlay={events.onPlay}
        onPause={events.onPause}
        onTimeUpdate={events.onTimeUpdate}
        onLoadedMetadata={events.onLoadedMetadata}
        onVolumeChange={events.onVolumeChange}
        onError={events.onError}
        poster={short.thumbnailUrl}
        className="w-full h-full object-cover"
      />
      
      {/* Play/Pause Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            actions.togglePlayPause();
          }}
          className={`
            bg-black bg-opacity-50 text-white p-4 rounded-full 
            transition-opacity duration-200
            ${!state.isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 hover:opacity-100'}
            hover:bg-opacity-70
          `}
          aria-label={state.isPlaying ? 'Pause video' : 'Play video'}
        >
          {state.isPlaying ? (
            <PauseIcon className="w-8 h-8" />
          ) : (
            <PlayIcon className="w-8 h-8" />
          )}
        </button>
      </div>
      
      {/* Invisible clickable area for pause when playing */}
      {state.isPlaying && (
        <div 
          className="absolute inset-0 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            actions.pause();
          }}
          aria-label="Pause video"
        />
      )}

      {/* Video Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-end justify-between">
          <div className="flex-1 mr-4">
            <h3 className="text-white font-medium text-sm mb-1 line-clamp-2">
              {short.title}
            </h3>
            <p className="text-gray-300 text-xs">
              {short.channelName} • {formatNumber(short.views)} views
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            {/* Mute/Unmute */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                actions.toggleMute();
              }}
              className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
              aria-label={state.isMuted ? 'Unmute video' : 'Mute video'}
            >
              {state.isMuted ? (
                <SpeakerXMarkIcon className="w-5 h-5" />
              ) : (
                <SpeakerWaveIcon className="w-5 h-5" />
              )}
            </button>
            
            {/* Like */}
            <button 
              onClick={handleLike}
              className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
              aria-label="Like video"
            >
              {short.isLiked ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
            </button>
            
            {/* Comment */}
            <button 
              onClick={handleComment}
              className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
              aria-label="Comment on video"
            >
              <ChatBubbleOvalLeftIcon className="w-5 h-5" />
            </button>
            
            {/* Share */}
            <button 
              onClick={handleShare}
              className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
              aria-label="Share video"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}

      {/* Error state */}
      {state.error && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 cursor-pointer"
          onClick={async (e) => {
            e.stopPropagation();
            await actions.play();
          }}
        >
          <div className="text-center">
            <p className="text-white text-sm px-4 mb-2">
              {state.error}
            </p>
            <p className="text-gray-300 text-xs">
              Click to retry
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShortDisplayCard;