import React, { forwardRef, ReactNode, Ref, useState, useEffect, useRef, useImperativeHandle } from 'react';
import { getYouTubePlayerType } from '../services/settingsService';
import OptimizedYouTubePlayer from './OptimizedYouTubePlayer';
import IFrameAPIYouTubePlayer, { IFrameAPIYouTubePlayerMethods } from './IFrameAPIYouTubePlayer';
import AdvancedVideoPlayer from './AdvancedVideoPlayer';
import YouTubePlayer from './YouTubePlayer';
import OptimizedVideoPlayer from './OptimizedVideoPlayer';
import { YouTubePlayerMethods } from './OptimizedYouTubePlayer';
import { YouTubeSearchResult } from '../services/googleSearchService';

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
  ref
) => {
  const playerType = getYouTubePlayerType();

  // Convert videoId to YouTube URL for non-YouTube specific players
  const getYouTubeUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;
  
  // Create mock video object for YouTubePlayer component
  const createMockVideo = (videoId: string): YouTubeSearchResult => ({
    id: { videoId },
    snippet: {
      title: 'Video',
      description: '',
      thumbnails: { default: { url: '', width: 120, height: 90 } },
      channelTitle: '',
      publishedAt: new Date().toISOString()
    }
  });

  switch (playerType) {
    case 'iframe-api':
      // Use IFrame API Player - Best for advanced YouTube API features
      return (
        <IFrameAPIYouTubePlayer
          ref={ref as Ref<IFrameAPIYouTubePlayerMethods>}
          videoId={props.videoId}
          width={props.width}
          height={props.height}
          autoplay={props.autoplay}
          muted={props.muted}
          controls={props.controls}
          loop={props.loop}
          start={props.start}
          end={props.end}
          className={props.className}
          onReady={props.onReady}
          onStateChange={props.onStateChange}
          onError={props.onError}
          onPlaybackQualityChange={props.onPlaybackQualityChange}
          onPlaybackRateChange={props.onPlaybackRateChange}
        />
      );

    case 'advanced':
      // Use Advanced Video Player - Best for custom video files with advanced features
      return (
        <AdvancedVideoPlayer
          src={getYouTubeUrl(props.videoId)}
          autoPlay={props.autoplay}
          muted={props.muted}
          loop={props.loop}
          className={props.className}
          onPlay={props.onReady}
          onPause={() => {}}
          onEnded={() => {}}
        />
      );

    case 'youtube-player':
      // Use YouTube Player - Best for simple YouTube integration
      return (
        <YouTubePlayer
          video={createMockVideo(props.videoId)}
          width={props.width}
          height={props.height}
          autoplay={props.autoplay}
          controls={props.controls}
          className={props.className}
        />
      );

    case 'optimized-video':
      // Use Optimized Video Player - Best for performance-critical applications
      return (
        <OptimizedVideoPlayer
          videoId={props.videoId}
          autoplay={props.autoplay}
          muted={props.muted}
          controls={props.controls}
          width={props.width}
          height={props.height}
          className={props.className}
          onPlay={props.onReady}
          onError={props.onError}
          lazy={props.lazy}
          preload={props.preload}
        />
      );

    case 'optimized':
    default:
      // Use Optimized YouTube Player (default) - Best balance of features and performance
      return (
        <OptimizedYouTubePlayer
          ref={ref as Ref<YouTubePlayerMethods>}
          videoId={props.videoId}
          width={props.width}
          height={props.height}
          autoplay={props.autoplay}
          muted={props.muted}
          controls={props.controls}
          loop={props.loop}
          start={props.start}
          end={props.end}
          quality={props.quality}
          className={props.className}
          onReady={props.onReady}
          onStateChange={props.onStateChange}
          onError={props.onError}
          lazy={props.lazy}
          preload={props.preload}
          placeholder={props.placeholder}
        />
      );
  }
});

YouTubePlayerWrapper.displayName = 'YouTubePlayerWrapper';

export default YouTubePlayerWrapper;