import type { Video } from '../types/core';

export interface YouTubePlayerProps {
  video: Video;
  autoplay?: boolean;
  width?: string | number;
  height?: string | number;
  controls?: boolean;
  className?: string;
  onStateChange?: (state: number) => void;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  video,
  autoplay = false,
  width = '100%',
  height = 315,
  controls = true,
  className = '',
  // onStateChange, // TODO: Implement YouTube iframe API for state change callbacks
}) => {
  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match?.[1] ? match[1] : null;
  };

  const videoId = getYouTubeVideoId(video.videoUrl || '');

  if (!videoId) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-800 flex items-center justify-center ${className}`} style={{ width, height }}>
        <p className="text-gray-500 dark:text-gray-400">Invalid YouTube URL</p>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?${new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    controls: controls ? '1' : '0',
    rel: '0',
    modestbranding: '1',
  }).toString()}`;

  return (
    <div className={className} style={{ width, height }}>
      <iframe
        src={embedUrl}
        title={video.title || 'YouTube Video'}
        width="100%"
        height="100%"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
};

export default YouTubePlayer;