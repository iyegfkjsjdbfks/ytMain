import { forwardRef, type ReactNode, type Ref } from 'react';

import { getYouTubePlayerType } from '../services/settingsService';


import YouTubePlayer from './YouTubePlayer';

import type { YouTubeSearchResult } from '../services/googleSearchService';

interface YouTubePlayerWrapperProps {
  videoId: string;
  width?: number | string;
  height?: number | string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  start?: number;
  end?: number;
  quality?: 'small' | 'medium' | 'large' | 'hd720' | 'hd1080' | 'highres' | 'default';
  className?: string;
  onReady?: (event: any) => void;
  onStateChange?: (event: any) => void;
  onError?: (event: any) => void;
  lazy?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  placeholder?: ReactNode;
  // IFrame API specific props
  onPlaybackQualityChange?: (event: any) => void;
  onPlaybackRateChange?: (event: any) => void;
}

// Union type for player methods
export type YouTubePlayerWrapperMethods = {};

const YouTubePlayerWrapper = forwardRef<YouTubePlayerWrapperMethods, YouTubePlayerWrapperProps>((
  props,
  ref,
) => {
  const playerType = getYouTubePlayerType();
  console.log('YouTubePlayerWrapper rendering with playerType:', playerType);

  // Convert videoId to YouTube URL for non-YouTube specific players
  const getYouTubeUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;

  // Create mock video object for YouTubePlayer component
  const createMockVideo = (videoId: string): YouTubeSearchResult => ({
    id: videoId,
    title: 'Video',
    description: '',
    thumbnailUrl: '',
    channelName: '',
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    isYouTube: true as const,
  });

  // Use YouTube Player - Best for simple YouTube integration
  return (
    <YouTubePlayer
      video={createMockVideo(props.videoId)}
      {...(props.width !== undefined && { width: props.width })}
      {...(props.height !== undefined && { height: props.height })}
      {...(props.autoplay !== undefined && { autoplay: props.autoplay })}
      {...(props.controls !== undefined && { controls: props.controls })}
      {...(props.className !== undefined && { className: props.className })}
    />
  );
});

YouTubePlayerWrapper.displayName = 'YouTubePlayerWrapper';

export default YouTubePlayerWrapper;