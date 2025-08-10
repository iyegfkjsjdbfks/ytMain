
// TODO: Fix import - import { useEffect, useRef, useState, type FC, type ChangeEvent } from 'react';

import { logger } from '../../utils/logger';

import { YouTubePlayer, YouTubePlayerState } from '../../lib/youtube-utils';

interface YouTubePlayerExampleProps {
  videoId: string;
  width?: number;
  height?: number;
  autoplay?: boolean;
  controls?: boolean;
  className?: string;
}

export const YouTubePlayerExample: FC<YouTubePlayerExampleProps> = ({
  videoId,
  width = 800,
  height = 450,
  autoplay = false,
  controls = true,
  className = '',
}) => {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [playerState, setPlayerState] = useState<YouTubePlayerState | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Format time in seconds to MM:SS format
  const formatTime = (timeInSeconds): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Initialize player
  useEffect(() => {
    if (!videoId) {
return;
}

    const playerElement = document.getElementById('youtube-player');
    if (!playerElement) {
return;
}

    let isMounted = true;

    const initializePlayer = async () => {
      try {
        const player = new YouTubePlayer(
          'youtube-player',
          videoId,
          {
            width,
            height,
            playerVars: {
              autoplay: autoplay ? 1 : 0,
              controls: controls ? 1 : 0,
              modestbranding: 1,
              rel: 0,
              enablejsapi: 1,
              origin: window.location.origin,
            },
            events: {
              onReady: async (_event) => {
                if (!isMounted) {
return;
}

                // Start progress tracking
                progressInterval.current = setInterval(async () => {
                  if (playerRef.current && isMounted) {
                    try {
                      const [time, dur, vol, muted] = await Promise.all([
                        playerRef.current.getCurrentTime(),
                        playerRef.current.getDuration(),
                        playerRef.current.getVolume(),
                        playerRef.current.isMuted(),
                      ]);

                      if (isMounted) {
                        setCurrentTime(time);
                        setDuration(dur);
                        setVolume(vol);
                        setIsMuted(muted);
                      }
                    } catch (error) {
                      logger.error('Error updating player state:', error);
                    }
                  }
                }, 500);
              },
              onStateChange: (event) => {
                if (!isMounted) {
return;
}
                const state = event.data;
                setPlayerState(state);
                setIsPlaying(state === YouTubePlayerState.PLAYING);
              },
            },
          },
        );

        if (isMounted) {
          playerRef.current = player;
        } else {
          player.destroy();
        }
      } catch (error) {
        logger.error('Failed to initialize YouTube player:', error);
      }
    };

    initializePlayer();

    // Cleanup
    return () => {
      isMounted = false;

      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }

      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, autoplay, controls, height, width]);

  // Player control methods
  const togglePlay = async () => {
    if (!playerRef.current) {
return;
}

    try {
      if (isPlaying) {
        await playerRef.current.pauseVideo();
      } else {
        await playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      logger.error('Error toggling play/pause:', error);
    }
  };

  const toggleMute = async () => {
    if (!playerRef.current) {
return;
}

    try {
      if (isMuted) {
        await playerRef.current.unMute();
        setIsMuted(false);
      } else {
        await playerRef.current.mute();
        setIsMuted(true);
      }
    } catch (error) {
      logger.error('Error toggling mute:', error);
    }
  };

  const handleSeek = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current) {
return;
}

    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);

    try {
      await playerRef.current.seekTo(newTime, true);
    } catch (error) {
      logger.error('Error seeking video:', error);
    }
  };

  const handleVolumeChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current) {
return;
}

    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    try {
      await playerRef.current.setVolume(newVolume);

      // Update mute state based on volume
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    } catch (error) {
      logger.error('Error setting volume:', error);
    }
  };

  return (
    <div className={`youtube-player-container ${className}`}>
      <div id="youtube-player" className="w-full" />

      {/* Custom Controls */}
      {!controls && (
        <div className="mt-2 bg-gray-100 p-2 rounded">
          <div className="flex items-center space-x-2 mb-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶️'}
            </button>

            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full"
                aria-label="Seek"
              />
            </div>

            <div className="text-sm text-gray-600 w-20 text-right">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            <button
              onClick={toggleMute}
              className="p-2 rounded-full hover:bg-gray-200"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇' : volume > 50 ? '🔊' : '🔉'}
            </button>

            <div className="w-24">
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full"
                aria-label="Volume"
              />
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Player State: {YouTubePlayerState[playerState || -1]}
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubePlayerExample;
