import { useEffect } from 'react';

interface UseVideoAutoplayProps {
  isIntersecting: boolean;
  isPlaying: boolean;
  isManuallyPaused: boolean;
  actions: {
    play: () => Promise<void>;
    pause: () => void;
    unmute: () => void;
  };
  setIsManuallyPaused: (paused: boolean) => void;
  threshold?: number; // Intersection threshold for autoplay
  enableAutoplay?: boolean; // Allow disabling autoplay entirely
  unmuteOnAutoplay?: boolean; // Whether to unmute video when autoplay starts
}

/**
 * Custom hook to handle video autoplay logic based on intersection observer
 * and manual pause state. Provides intelligent autoplay that respects user interactions.
 */
export const useVideoAutoplay = ({
  isIntersecting,
  isPlaying,
  isManuallyPaused,
  actions,
  setIsManuallyPaused,
  enableAutoplay = false,
  unmuteOnAutoplay = false
}: UseVideoAutoplayProps) => {
  useEffect(() => {
    if (!enableAutoplay) return;
    
    if (isIntersecting && !isPlaying && !isManuallyPaused) {
      // Auto-play when video comes into view and hasn't been manually paused
      // Conditionally unmute the video when autoplay starts based on unmuteOnAutoplay flag
      if (unmuteOnAutoplay) {
        actions.unmute();
      }
      actions.play().catch((error: Error) => {
        console.warn('Autoplay failed:', error);
        // Autoplay might be blocked by browser policy
      });
    } else if (!isIntersecting && isPlaying) {
      // Auto-pause when video leaves view and reset manual pause state
      actions.pause();
      setIsManuallyPaused(false);
    }
  }, [isIntersecting, isPlaying, actions, isManuallyPaused, setIsManuallyPaused, enableAutoplay, unmuteOnAutoplay]);
};

export default useVideoAutoplay;