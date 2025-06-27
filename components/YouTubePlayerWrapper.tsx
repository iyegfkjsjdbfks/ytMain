import { forwardRef, type ReactNode, type Ref } from 'react';

import { getYouTubePlayerType } from '../services/settingsService';

import AdvancedVideoPlayer from './AdvancedVideoPlayer';
import IFrameAPIYouTubePlayer, { type IFrameAPIYouTubePlayerMethods } from './IFrameAPIYouTubePlayer';
import OptimizedVideoPlayer from './OptimizedVideoPlayer';
import OptimizedYouTubePlayer, { type YouTubePlayerMethods } from './OptimizedYouTubePlayer';
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
export type YouTubePlayerWrapperMethods = YouTubePlayerMethods & IFrameAPIYouTubePlayerMethods;

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

  switch (playerType) {
    case 'iframe-api':
      // Use IFrame API Player - Best for advanced YouTube API features
      return (
        <IFrameAPIYouTubePlayer
          ref={ref as Ref<IFrameAPIYouTubePlayerMethods>}
          videoId={props.videoId}
          {...(props.width !== undefined && { width: props.width })}
          {...(props.height !== undefined && { height: props.height })}
          {...(props.autoplay !== undefined && { autoplay: props.autoplay })}
          {...(props.muted !== undefined && { muted: props.muted })}
          {...(props.controls !== undefined && { controls: props.controls })}
          {...(props.loop !== undefined && { loop: props.loop })}
          {...(props.start !== undefined && { start: props.start })}
          {...(props.end !== undefined && { end: props.end })}
          {...(props.className !== undefined && { className: props.className })}
          {...(props.onReady !== undefined && { onReady: props.onReady })}
          {...(props.onStateChange !== undefined && { onStateChange: props.onStateChange })}
          {...(props.onError !== undefined && { onError: props.onError })}
          {...(props.onPlaybackQualityChange !== undefined && { onPlaybackQualityChange: props.onPlaybackQualityChange })}
          {...(props.onPlaybackRateChange !== undefined && { onPlaybackRateChange: props.onPlaybackRateChange })}
        />
      );

    case 'advanced':
      // Use Advanced Video Player - Best for custom video files with advanced features
      return (
        <AdvancedVideoPlayer
          src={getYouTubeUrl(props.videoId)}
          {...(props.autoplay !== undefined && { autoPlay: props.autoplay })}
          {...(props.muted !== undefined && { muted: props.muted })}
          {...(props.loop !== undefined && { loop: props.loop })}
          {...(props.className !== undefined && { className: props.className })}
          {...(props.onReady && { onPlay: () => props.onReady?.({}) })}
          onPause={() => {}}
          onEnded={() => {}}
        />
      );

    case 'youtube-player':
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

    case 'optimized-video':
      // Use Optimized Video Player - Best for performance-critical applications
      return (
        <OptimizedVideoPlayer
          videoId={props.videoId}
          {...(props.autoplay !== undefined && { autoplay: props.autoplay })}
          {...(props.muted !== undefined && { muted: props.muted })}
          {...(props.controls !== undefined && { controls: props.controls })}
          {...(props.width !== undefined && { width: props.width })}
          {...(props.height !== undefined && { height: props.height })}
          {...(props.className !== undefined && { className: props.className })}
          {...(props.onReady && { onPlay: () => props.onReady?.({}) })}
          {...(props.onError !== undefined && { onError: props.onError })}
          {...(props.lazy !== undefined && { lazy: props.lazy })}
          {...(props.preload !== undefined && { preload: props.preload })}
        />
      );

    case 'optimized':
    default:
      // Use Optimized YouTube Player (default) - Best balance of features and performance
      return (
        <OptimizedYouTubePlayer
          videoId={props.videoId}
          {...(props.width !== undefined && { width: props.width })}
          {...(props.height !== undefined && { height: props.height })}
          {...(props.autoplay !== undefined && { autoplay: props.autoplay })}
          {...(props.muted !== undefined && { muted: props.muted })}
          {...(props.controls !== undefined && { controls: props.controls })}
          {...(props.loop !== undefined && { loop: props.loop })}
          {...(props.start !== undefined && { start: props.start })}
          {...(props.end !== undefined && { end: props.end })}
          {...(props.quality !== undefined && { quality: props.quality })}
          {...(props.className !== undefined && { className: props.className })}
          {...(props.onReady !== undefined && { onReady: props.onReady })}
          {...(props.onStateChange !== undefined && { onStateChange: props.onStateChange })}
          {...(props.onError !== undefined && { onError: props.onError })}
          {...(props.lazy !== undefined && { lazy: props.lazy })}
          {...(props.preload !== undefined && { preload: props.preload })}
          {...(props.placeholder !== undefined && { placeholder: props.placeholder })}
        />
      );
  }
});

YouTubePlayerWrapper.displayName = 'YouTubePlayerWrapper';

export default YouTubePlayerWrapper;