import { useEffect, useRef, useState, type FC } from 'react';

import type { YouTubeSearchResult } from '../services/googleSearchService';

// YouTube Player API types
declare global {
  interface Window {
    YT: YT;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// YT Player interfaces
interface YT {
  Player: new (elementId: string, config: YTPlayerConfig) => YTPlayer;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

interface YTPlayerConfig {
  height: string | number;
  width: string | number;
  videoId: string;
  playerVars?: {
    autoplay?: 0 | 1;
    controls?: 0 | 1;
    disablekb?: 0 | 1;
    enablejsapi?: 0 | 1;
    end?: number;
    fs?: 0 | 1;
    hl?: string;
    iv_load_policy?: 1 | 3;
    list?: string;
    listType?: 'playlist' | 'user_uploads';
    loop?: 0 | 1;
    modestbranding?: 0 | 1;
    origin?: string;
    playlist?: string;
    playsinline?: 0 | 1;
    rel?: 0 | 1;
    start?: number;
    widget_referrer?: string;
  };
  events?: {
    onReady?: (event: { target: YTPlayer }) => void;
    onStateChange?: (event: { target: YTPlayer; data: number }) => void;
    onPlaybackQualityChange?: (event: { target: YTPlayer; data: string }) => void;
    onPlaybackRateChange?: (event: { target: YTPlayer; data: number }) => void;
    onError?: (event: { target: YTPlayer; data: number }) => void;
    onApiChange?: (event: { target: YTPlayer }) => void;
  };
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  clearVideo(): void;
  getVideoLoadedFraction(): number;
  getPlayerState(): number;
  getCurrentTime(): number;
  getDuration(): number;
  getVideoUrl(): string;
  getVideoEmbedCode(): string;
  getPlaylist(): string[];
  getPlaylistIndex(): number;
  setLoop(loopPlaylists: boolean): void;
  setShuffle(shufflePlaylist: boolean): void;
  getVolume(): number;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setSize(width: number, height: number): object;
  getPlaybackRate(): number;
  setPlaybackRate(suggestedRate: number): void;
  getAvailablePlaybackRates(): number[];
  destroy(): void;
}

interface YouTubePlayerProps {
  video: YouTubeSearchResult;
  width?: string | number;
  height?: string | number;
  autoplay?: boolean;
  controls?: boolean;
  className?: string;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  video,
  width = '100%',
  height = 315,
  autoplay = false,
  controls = true,
  className = '',
}) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const [isAPIReady, setIsAPIReady] = useState(false);
  const [, setIsPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const playerIdRef = useRef(`youtube-player-${Math.random().toString(36).substr(2, 9)}`);

  // Extract video ID from the video object
  const videoId = video.embedUrl?.split('/embed/')[1]?.split('?')[0] || '';

  // Validate video ID
  const isValidVideoId = videoId && videoId.length === 11 && /^[a-zA-Z0-9_-]+$/.test(videoId);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsAPIReady(true);
      return;
    }

    // Check if script is already loading
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      // Script is loading, wait for it
      const checkAPI = () => {
        if (window.YT && window.YT.Player) {
          setIsAPIReady(true);
        } else {
          setTimeout(checkAPI, 100);
        }
      };
      checkAPI();
      return;
    }

    // Load the API script
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;

    const originalCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      setIsAPIReady(true);
      if (originalCallback) {
        originalCallback();
      }
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup: restore original callback
      if (originalCallback) {
        window.onYouTubeIframeAPIReady = originalCallback;
      }
    };
  }, []);

  // Initialize player when API is ready
  useEffect(() => {
    if (!isAPIReady || !playerRef.current || !isValidVideoId) {
return;
}

    let isMounted = true;

    try {
      // Destroy existing player if any
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (error) {
          console.warn('Error destroying previous player:', error);
        }
        ytPlayerRef.current = null;
      }

      // Ensure the container element exists and is empty
      const container = document.getElementById(playerIdRef.current);
      if (container) {
        container.innerHTML = '';
      }

      // Create new player
      ytPlayerRef.current = new window.YT.Player(playerIdRef.current, {
        height,
        width,
        videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: controls ? 1 : 0,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          origin: window.location.origin,
          playsinline: 1,
          fs: 1, // Enable fullscreen button
          // cc_load_policy: 1, // Show closed captions by default (not supported in playerVars)
          iv_load_policy: 3, // Hide video annotations
          disablekb: 0, // Enable keyboard controls
          widget_referrer: window.location.origin,
          // host: window.location.protocol + '//' + window.location.host // Not supported in playerVars
        },
        events: {
          onReady: (_event: any) => {
            if (isMounted) {
              setIsPlayerReady(true);
              setPlayerError(null);
            }
          },
          onStateChange: (_event: any) => {
            // Handle state changes if needed
          },
          onError: (event: any) => {
            if (!isMounted) {
return;
}
            const errorMessages: { [key: number]: string } = {
              2: 'Invalid video ID',
              5: 'HTML5 player error',
              100: 'Video not found or private',
              101: 'Video not available in embedded players',
              150: 'Video not available in embedded players',
            };
            const message = errorMessages[event.data] || 'Unknown error occurred';
            setPlayerError(message);
          },
        },
      });
    } catch (error) {
      console.error('Error creating YouTube player:', error);
      if (isMounted) {
        setPlayerError('Failed to load video player');
      }
    }

    return () => {
      isMounted = false;
      if (ytPlayerRef.current) {
        try {
          // Check if the player element still exists before destroying
          const playerElement = document.getElementById(playerIdRef.current);
          if (playerElement && playerElement.parentNode) {
            ytPlayerRef.current.destroy();
          }
        } catch (error) {
          console.warn('Error destroying YouTube player:', error);
        }
        ytPlayerRef.current = null;
      }
    };
  }, [isAPIReady, videoId, height, width, autoplay, controls]);

  if (!isValidVideoId) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-4 ${className}`}>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Invalid YouTube video ID
        </p>
      </div>
    );
  }

  if (playerError) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
        <p className="text-red-600 dark:text-red-400 text-center">
          {playerError}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!isAPIReady && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
            <p>Loading YouTube player...</p>
          </div>
        </div>
      )}
      <div
        ref={playerRef}
        id={playerIdRef.current}
        className="w-full"
        style={{
          minHeight: typeof height === 'number' ? `${height}px` : height,
          opacity: isAPIReady ? 1 : 0,
        }}
      />
    </div>
  );
};

export default YouTubePlayer;