/// <reference types="react/jsx-runtime" />
import { forwardRef, type ReactNode } from 'react';


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
  onReady?: (event: Event) => void;
  onStateChange?: (event: Event) => void;
  onError?: (event: Event) => void;
  lazy?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  placeholder?: ReactNode;
  // IFrame API specific props
  onPlaybackQualityChange?: (event: Event) => void;
  onPlaybackRateChange?: (event: Event) => void;
}

// Union type for player methods
export interface YouTubePlayerWrapperMethods {}

const YouTubePlayerWrapper = forwardRef<YouTubePlayerWrapperMethods, YouTubePlayerWrapperProps>((
  props,
  _ref,
) => {
  // YouTubePlayerWrapper rendering


  // Create mock video object for YouTubePlayer component
  const createMockVideo = (videoId): YouTubeSearchResult => ({
    id: videoId,
    title: 'Video',
    description: '',
    thumbnailUrl: '',
    channelName: '',
    channelId: '',
    channelAvatarUrl: '',
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    duration: '0:00',
    uploadedAt: new Date().toISOString(),
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
      {...(props.onStateChange !== undefined && { onStateChange: props.onStateChange })}
      {...(props.onReady !== undefined && { onReady: props.onReady })}
      {...(props.onError !== undefined && { onError: props.onError })}
    />
  );
});

YouTubePlayerWrapper.displayName = 'YouTubePlayerWrapper';

export default YouTubePlayerWrapper;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
