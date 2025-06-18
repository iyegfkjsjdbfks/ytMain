import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';

interface IFrameAPIYouTubePlayerProps {
  videoId: string;
  width?: number | string;
  height?: number | string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  start?: number;
  end?: number;
  className?: string;
  onReady?: (event: any) => void;
  onStateChange?: (event: any) => void;
  onError?: (event: any) => void;
  onPlaybackQualityChange?: (event: any) => void;
  onPlaybackRateChange?: (event: any) => void;
}

export interface IFrameAPIYouTubePlayerMethods {
  play: () => void;
  pause: () => void;
  stop: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setSize: (width: number, height: number) => void;
  getVideoUrl: () => string;
  getEmbedCode: () => string;
  getOptions: (module?: string) => any;
  setOption: (module: string, option: string, value: any) => void;
  setPlaybackRate: (suggestedRate: number) => void;
  getPlaybackRate: () => number;
  getAvailablePlaybackRates: () => number[];
  setLoop: (loopPlaylists: boolean) => void;
  setShuffle: (shufflePlaylist: boolean) => void;
  getVideoLoadedFraction: () => number;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoData: () => any;
  getPlaylist: () => string[];
  getPlaylistIndex: () => number;
  getAvailableQualityLevels: () => string[];
  getPlaybackQuality: () => string;
  setPlaybackQuality: (suggestedQuality: string) => void;
}

// YouTube Player States
export const YT_PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5
} as const;

// YouTube Player Errors
export const YT_PLAYER_ERROR = {
  INVALID_PARAM: 2,
  HTML5_ERROR: 5,
  VIDEO_NOT_FOUND: 100,
  EMBED_NOT_ALLOWED: 101,
  EMBED_NOT_ALLOWED_DISGUISE: 150
} as const;

// Global YouTube API state
let isYouTubeAPILoaded = false;
let isYouTubeAPILoading = false;
const apiLoadCallbacks: (() => void)[] = [];

// Load YouTube IFrame API
const loadYouTubeIFrameAPI = (): Promise<void> => {
  return new Promise((resolve) => {
    if (isYouTubeAPILoaded) {
      resolve();
      return;
    }

    apiLoadCallbacks.push(resolve);

    if (isYouTubeAPILoading) {
      return;
    }

    isYouTubeAPILoading = true;

    // Set up the global callback, preserving any existing callback
    const originalCallback = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      isYouTubeAPILoaded = true;
      isYouTubeAPILoading = false;
      apiLoadCallbacks.forEach(callback => callback());
      apiLoadCallbacks.length = 0;
      
      // Call the original callback if it exists
      if (originalCallback && typeof originalCallback === 'function') {
        originalCallback();
      }
    };

    // Load the API script
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(script, firstScriptTag);
    } else {
      document.head.appendChild(script);
    }
  });
};

const IFrameAPIYouTubePlayer = forwardRef<IFrameAPIYouTubePlayerMethods, IFrameAPIYouTubePlayerProps>((
  {
    videoId,
    width = '100%',
    height = '100%',
    autoplay = false,
    muted = false,
    controls = true,
    loop = false,
    start,
    end,
    className = '',
    onReady,
    onStateChange,
    onError,
    onPlaybackQualityChange,
    onPlaybackRateChange
  },
  ref
) => {
  const [isAPIReady, setIsAPIReady] = useState(isYouTubeAPILoaded);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const playerIdRef = useRef(`youtube-player-${Math.random().toString(36).substr(2, 9)}`);

  // Load YouTube API on mount
  useEffect(() => {
    loadYouTubeIFrameAPI()
      .then(() => setIsAPIReady(true))
      .catch((err) => {
        console.error('Failed to load YouTube IFrame API:', err);
        setError('Failed to load YouTube player');
      });
  }, []);

  // Initialize player when API is ready
  useEffect(() => {
    if (!isAPIReady || !playerRef.current || !videoId) return;

    try {
      // Build player variables
      const playerVars: any = {
        autoplay: autoplay ? 1 : 0,
        controls: controls ? 1 : 0,
        disablekb: 0, // Enable keyboard controls
        enablejsapi: 1, // Enable JavaScript API
        fs: 1, // Enable fullscreen button
        hl: 'en', // Interface language
        iv_load_policy: 3, // Hide video annotations
        modestbranding: 1, // Modest branding
        playsinline: 1, // Play inline on iOS
        rel: 0, // Don't show related videos from other channels
        origin: window.location.origin
      };

      // Add optional parameters
      if (muted) playerVars.mute = 1;
      if (loop) {
        playerVars.loop = 1;
        playerVars.playlist = videoId; // Required for loop to work
      }
      if (start !== undefined) playerVars.start = start;
      if (end !== undefined) playerVars.end = end;

      // Create the player
      playerInstanceRef.current = new (window as any).YT.Player(playerIdRef.current, {
        height: typeof height === 'number' ? height.toString() : height,
        width: typeof width === 'number' ? width.toString() : width,
        videoId,
        playerVars,
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true);
            setError(null);
            onReady?.(event);
          },
          onStateChange: (event: any) => {
            onStateChange?.(event);
          },
          onError: (event: any) => {
            const errorCode = event.data;
            let errorMessage = 'Video playback error';
            
            switch (errorCode) {
              case YT_PLAYER_ERROR.INVALID_PARAM:
                errorMessage = 'Invalid parameter value';
                break;
              case YT_PLAYER_ERROR.HTML5_ERROR:
                errorMessage = 'HTML5 player error';
                break;
              case YT_PLAYER_ERROR.VIDEO_NOT_FOUND:
                errorMessage = 'Video not found';
                break;
              case YT_PLAYER_ERROR.EMBED_NOT_ALLOWED:
              case YT_PLAYER_ERROR.EMBED_NOT_ALLOWED_DISGUISE:
                errorMessage = 'Video cannot be embedded';
                break;
            }
            
            console.error('YouTube IFrame API error:', errorCode, errorMessage);
            setError(errorMessage);
            onError?.(event);
          },
          onPlaybackQualityChange: onPlaybackQualityChange,
          onPlaybackRateChange: onPlaybackRateChange
        }
      });
    } catch (err) {
      console.error('Error creating YouTube player:', err);
      setError('Failed to create YouTube player');
    }

    // Cleanup function
    return () => {
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (err) {
          console.warn('Error destroying YouTube player:', err);
        }
        playerInstanceRef.current = null;
      }
    };
  }, [isAPIReady, videoId, width, height, autoplay, muted, controls, loop, start, end]);

  // Player methods
  const playerMethods: IFrameAPIYouTubePlayerMethods = {
    play: () => playerInstanceRef.current?.playVideo(),
    pause: () => playerInstanceRef.current?.pauseVideo(),
    stop: () => playerInstanceRef.current?.stopVideo(),
    seekTo: (seconds: number, allowSeekAhead = true) => 
      playerInstanceRef.current?.seekTo(seconds, allowSeekAhead),
    setVolume: (volume: number) => playerInstanceRef.current?.setVolume(volume),
    mute: () => playerInstanceRef.current?.mute(),
    unMute: () => playerInstanceRef.current?.unMute(),
    isMuted: () => playerInstanceRef.current?.isMuted() || false,
    setSize: (width: number, height: number) => 
      playerInstanceRef.current?.setSize(width, height),
    getVideoUrl: () => playerInstanceRef.current?.getVideoUrl() || '',
    getEmbedCode: () => playerInstanceRef.current?.getVideoEmbedCode() || '',
    getOptions: (module?: string) => playerInstanceRef.current?.getOptions(module),
    setOption: (module: string, option: string, value: any) => 
      playerInstanceRef.current?.setOption(module, option, value),
    setPlaybackRate: (suggestedRate: number) => 
      playerInstanceRef.current?.setPlaybackRate(suggestedRate),
    getPlaybackRate: () => playerInstanceRef.current?.getPlaybackRate() || 1,
    getAvailablePlaybackRates: () => 
      playerInstanceRef.current?.getAvailablePlaybackRates() || [1],
    setLoop: (loopPlaylists: boolean) => 
      playerInstanceRef.current?.setLoop(loopPlaylists),
    setShuffle: (shufflePlaylist: boolean) => 
      playerInstanceRef.current?.setShuffle(shufflePlaylist),
    getVideoLoadedFraction: () => 
      playerInstanceRef.current?.getVideoLoadedFraction() || 0,
    getPlayerState: () => playerInstanceRef.current?.getPlayerState() || -1,
    getCurrentTime: () => playerInstanceRef.current?.getCurrentTime() || 0,
    getDuration: () => playerInstanceRef.current?.getDuration() || 0,
    getVideoData: () => playerInstanceRef.current?.getVideoData() || {},
    getPlaylist: () => playerInstanceRef.current?.getPlaylist() || [],
    getPlaylistIndex: () => playerInstanceRef.current?.getPlaylistIndex() || 0,
    getAvailableQualityLevels: () => 
      playerInstanceRef.current?.getAvailableQualityLevels() || [],
    getPlaybackQuality: () => playerInstanceRef.current?.getPlaybackQuality() || 'auto',
    setPlaybackQuality: (suggestedQuality: string) => 
      playerInstanceRef.current?.setPlaybackQuality(suggestedQuality)
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => playerMethods, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    setError(null);
    setIsPlayerReady(false);
    // Force re-initialization by updating a key prop or state
  }, []);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <div className="text-red-600 mb-2">⚠️</div>
          <p className="text-sm text-gray-600 mb-2">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {!isAPIReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading YouTube API...</p>
          </div>
        </div>
      )}
      
      {isAPIReady && !isPlayerReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Initializing player...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={playerRef}
        id={playerIdRef.current}
        className="w-full h-full"
        style={{ opacity: isPlayerReady ? 1 : 0 }}
      />
    </div>
  );
});

IFrameAPIYouTubePlayer.displayName = 'IFrameAPIYouTubePlayer';

export default IFrameAPIYouTubePlayer;