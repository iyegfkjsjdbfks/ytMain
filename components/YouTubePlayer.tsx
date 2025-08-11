
/// <reference types="react/jsx-runtime" />
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName]: any;
    }
  }
}
import { useEffect, useRef, useState } from 'react';
import React from 'react';

import { getYouTubeVideoId } from '../src/lib/youtube-utils';

import type { YouTubeSearchResult } from '../services/googleSearchService';
import type { Video } from '../src/types/core';

// YouTube Player API types


interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: any, allowSeekAhead?: boolean): void;
  clearVideo(): void;
  getVideoLoadedFraction(): number;
  getPlayerState(): number;
  getCurrentTime(): number;
  getDuration(): number;
  getVideoUrl(): string;
  getVideoEmbedCode(): string;
  getPlaylist(): string;
  getPlaylistIndex(): number;
  setLoop(loopPlaylists: any): void;
  setShuffle(shufflePlaylist: any): void;
  getVolume(): number;
  setVolume(volume: any): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setSize(width: any, height: any): object;
  getPlaybackRate(): number;
  setPlaybackRate(suggestedRate: any): void;
  getAvailablePlaybackRates(): number;
  destroy(): void;
}

interface YouTubePlayerProps {
  video: YouTubeSearchResult | Video;
  width?: string | number;
  height?: string | number;
  autoplay?: boolean;
  controls?: boolean;
  className?: string;
  onReady?: (event: Event) => void;
  onStateChange?: (event: Event) => void;
  onError?: (event: Event) => void;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  video,
  width = '100%',
  height = '100%',
  autoplay = false,
  controls = true,
  className = '',
  onReady,
  onStateChange,
  onError,
}) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const [isAPIReady, setIsAPIReady] = useState(false);
  const [, setIsPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const playerIdRef = useRef(`youtube-player-${Math.random().toString(36).substr(2, 9)}`);

  // Extract video ID from the video object
  const videoId = (() => {
    // Handle YouTubeSearchResult type
    if ('embedUrl' in video && video.embedUrl) {
      return video.embedUrl.split('/embed/')[1]?.split('?')[0] || '';
    }
    // Handle Video type
    if ('videoUrl' in video && video.videoUrl) {
      return getYouTubeVideoId(video.videoUrl) || '';
    }
    return '';
  })();

  // Validate video ID
  const isValidVideoId = videoId && videoId.length === 11 && /^[a-zA-Z0-9_-]+$/.test(videoId);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT?.Player) {
      setIsAPIReady(true);
      return;
    }

    // Check if script is already loading
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      // Script is loading, wait for it
      const checkAPI = () => {
        if (window.YT?.Player) {
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

      // Ensure the container element exists and is properly prepared
      const container = document.getElementById(playerIdRef.current);
      if (container && document.body.contains(container)) {
        // Clear any existing content safely
        try {
          // Check if container is still in DOM before clearing
          if (container.parentNode) {
            container.innerHTML = '';
          }
        } catch (error) {
          console.debug('Error clearing container:', error);
        }
      }

      // Create new player
      if (!window.YT) {
        throw new Error('YouTube API not available');
      }
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
          iv_load_policy: 3, // Hide video annotations
          disablekb: 0, // Enable keyboard controls
          // Remove widget_referrer as it might cause origin issues
        },
        events: {
          onReady: (event) => {
            if (isMounted) {
              setIsPlayerReady(true);
              setPlayerError(null);

              // Call the external onReady callback if provided
              if (onReady) {
                try {
                  onReady(event);
                } catch (error) {
                  console.warn('Error in onReady callback:', error);
                }
              }

              // Try to autoplay if autoplay is enabled
              if (autoplay) {
                try {
                  console.log('Attempting to autoplay YouTube video...');
                  // Mute first for better autoplay compliance
                  event.target.mute();
                  event.target.playVideo();

                  // Fallback: try again after a short delay if not playing
                  setTimeout(() => {
                    try {
                      const playerState = event.target.getPlayerState();
                      if (playerState !== 1) { // 1 = playing
                        console.log('Retrying autoplay...');
                        event.target.playVideo();
                      }
                    } catch (retryError) {
                      console.warn('Autoplay retry failed:', retryError);
                    }
                  }, 1000);
                } catch (error) {
                  console.warn('Autoplay failed:', error);
                }
              }
            }
          },
          onStateChange: (event) => {
            // Handle state changes if needed
            console.log('YouTube player state changed:', event.data);

            // Call the external onStateChange callback if provided
            if (onStateChange) {
              try {
                onStateChange(event);
              } catch (error) {
                console.warn('Error in onStateChange callback:', error);
              }
            }

            // Unmute video after autoplay starts (state 1 = playing)
            if (autoplay && event.data === 1) {
              setTimeout(() => {
                try {
                  console.log('Unmuting video after autoplay...');
                  event.target.unMute();

                  // Resume playback after unmuting in case it paused
                  setTimeout(() => {
                    try {
                      const currentState = event.target.getPlayerState();
                      if (currentState !== 1) { // If not playing
                        console.log('Resuming playback after unmute...');
                        event.target.playVideo();
                      }
                    } catch (playError) {
                      console.warn('Failed to resume playback after unmute:', playError);
                    }
                  }, 100); // Short delay to let unmute complete
                } catch (error) {
                  console.warn('Failed to unmute video:', error);
                }
              }, 1000);
            }
          },
          onError: (event) => {
            if (!isMounted) {
return;
}
            const errorMessages: { [key]: string } = {
              2: 'Invalid video ID',
              5: 'HTML5 player error',
              100: 'Video not found or private',
              101: 'Video not available in embedded players',
              150: 'Video not available in embedded players',
            };
            const message = errorMessages[event.data] || 'Unknown error occurred';

            // For embedding errors (101, 150), show a more user-friendly message
            if (event.data === 101 || event.data === 150) {
              console.debug('Video cannot be embedded, this is expected for some videos');
              setPlayerError('This video cannot be played here. Click to watch on YouTube.');
            } else {
              console.error('YouTube player error:', message, event.data);
              setPlayerError(message);
            }

            // Call the external onError callback if provided
            if (onError) {
              try {
                onError(event);
              } catch (error) {
                console.warn('Error in onError callback:', error);
              }
            }
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
          // Check if player still exists and has destroy method
          if (typeof ytPlayerRef.current.destroy === 'function') {
            ytPlayerRef.current.destroy();
          }
        } catch (error) {
          // Silently handle cleanup errors
          console.debug('YouTube player cleanup error:', error);
        } finally {
          ytPlayerRef.current = null;
        }
      }
    };
  }, [isAPIReady, videoId, height, width, autoplay, controls, isValidVideoId, onError, onReady, onStateChange]);

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
    <div className={`relative w-full h-full ${className}`}>
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
        className="w-full h-full"
        style={{
          opacity: isAPIReady ? 1 : 0,
        }}
      />
    </div>
  );
};

export default YouTubePlayer;