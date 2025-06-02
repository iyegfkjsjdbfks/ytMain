import React from 'react';

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  autoplay?: boolean;
  startTime?: number;
  className?: string;
  onReady?: () => void;
}

/**
 * YouTube video player component that uses an iframe to embed videos
 * with configurable parameters like autoplay and start time.
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  title,
  autoplay = false,
  startTime = 0,
  className = '',
  onReady,
}) => {
  // Build YouTube embed URL with appropriate parameters
  const videoUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&start=${Math.floor(startTime)}&enablejsapi=1&origin=${window.location.origin}`;

  return (
    <div className={`video-player-container ${className}`}>
      <div className="video-player-wrapper relative">
        <iframe
          src={videoUrl}
          title={title || `Video ${videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full aspect-video"
          onLoad={onReady}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
