import { useEffect } from 'react';

interface UseVideoAutoplayProps {
  isIntersecting: boolean;
  isPlaying: boolean;
  isManuallyPaused: boolean;
  actions: {
    play: () => Promise<void>;
    pause: () => void;
    unmute: () => void
  };
  setIsManuallyPaused: (paused: any) => void;
  threshold?: number; // Intersection threshold for autoplay
  enableAutoplay?: boolean; // Allow disabling autoplay entirely
  unmuteOnAutoplay?: boolean; // Whether to unmute video when autoplay starts
}

/**
 * Custom hook to handle video autoplay logic based on intersection observer
 * and manual pause state. Provides intelligent autoplay that respects user interactions.
 */
export const useVideoAutoplay: any = ({
  isIntersecting,
  isPlaying,
  isManuallyPaused,
  actions,
  setIsManuallyPaused,
  enableAutoplay = false,
  unmuteOnAutoplay = false }: UseVideoAutoplayProps) => {
  useEffect(() => {
    if (!enableAutoplay) {
      return;
    }

    if (isIntersecting && !isPlaying && !isManuallyPaused) {
      // Auto-play when video comes into view and hasn't been manually paused
      // Conditionally unmute the video when autoplay starts based on unmuteOnAutoplay flag
      if (unmuteOnAutoplay as any) {
        actions.unmute();
      }
      actions.play().catch((error: Error) => {
        // More specific handling for common video playback issues
        const errorMessage = error.message || String(error);

        if (
          errorMessage.includes('CACHE_OPERATION_NOT_SUPPORTED') ||
          errorMessage.includes('ERR_NETWORK')
        ) {
          (console as any).info(
            'Autoplay skipped due to network/cache issues:',
            errorMessage
          );
        } else {
          (console as any).warn('Autoplay failed:', errorMessage);
        }
        // Autoplay might be blocked by browser policy or network issues
      });
    } else if (!isIntersecting && isPlaying && !isManuallyPaused) {
      // Only auto-pause when video leaves view if it wasn't manually paused
      // Don't reset manual pause state to preserve user intent
      actions.pause();
    }
  }, [
    isIntersecting,
    isPlaying,
    actions,
    isManuallyPaused,
    setIsManuallyPaused,
    enableAutoplay,
    unmuteOnAutoplay]);
};

export default useVideoAutoplay;
