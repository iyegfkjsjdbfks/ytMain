import { forwardRef, ReactNode, Ref } from 'react';
import { getYouTubePlayerType } from '../services/settingsService';
import OptimizedYouTubePlayer from './OptimizedYouTubePlayer';
import IFrameAPIYouTubePlayer, { IFrameAPIYouTubePlayerMethods } from './IFrameAPIYouTubePlayer';
import { YouTubePlayerMethods } from './OptimizedYouTubePlayer';

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

  if (playerType === 'iframe-api') {
    // Use IFrame API Player
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
  }

  // Use Optimized Player (default)
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
});

YouTubePlayerWrapper.displayName = 'YouTubePlayerWrapper';

export default YouTubePlayerWrapper;