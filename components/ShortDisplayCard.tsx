import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Video } from '../types';
import { Link } from 'react-router-dom';
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, HeartIcon, ChatBubbleOvalLeftEllipsisIcon, ArrowUturnRightIcon } from '@heroicons/react/24/solid';

interface ShortDisplayCardProps {
  short: Video;
}

const ShortDisplayCard: React.FC<ShortDisplayCardProps> = ({ short }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay policies
  const [showControls, setShowControls] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused || videoRef.current.ended) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(err => console.warn("Autoplay prevented for short:", err));
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, []);
  
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent video click if clicking mute button
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  useEffect(() => {
    const currentVideoRef = videoRef.current; // Capture ref for cleanup

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (currentVideoRef) {
                currentVideoRef.play().then(() => setIsPlaying(true)).catch(err => {
                    // console.warn("Autoplay was prevented for short. User interaction might be required.", err);
                    setIsPlaying(false); // Ensure isPlaying is false if autoplay fails
                });
            }
          } else {
            if (currentVideoRef) {
              currentVideoRef.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { threshold: 0.7 } // Play when 70% visible
    );

    if (currentVideoRef) {
      observer.current.observe(currentVideoRef);
      // Initial mute state for the video element
      currentVideoRef.muted = isMuted;
    }

    return () => {
      if (observer.current && currentVideoRef) {
        observer.current.unobserve(currentVideoRef);
      }
      if(currentVideoRef) {
        currentVideoRef.pause(); // Ensure video is paused on unmount
      }
    };
  }, [isMuted, short.id]); // Re-run if short.id changes, though less likely in a list
  
  // Show controls briefly on mouse enter, hide on mouse leave
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const handleMouseEnter = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setShowControls(true);
  };
  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => setShowControls(false), 1000); // Hide after 1 second
  };


  return (
    <section 
      className="h-full w-full snap-start flex items-center justify-center relative overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={`Short video: ${short.title}`}
    >
      <video
        ref={videoRef}
        src={short.videoUrl}
        loop
        playsInline // Important for mobile
        className="w-auto h-full object-contain max-w-full max-h-full"
        onClick={handlePlayPause}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        poster={short.thumbnailUrl}
      />

      {/* Play/Pause button overlay (centered) */}
      {showControls && !isPlaying && (
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-200 z-10"
          aria-label="Play video"
        >
          <PlayIcon className="w-16 h-16 text-white/80 drop-shadow-lg" />
        </button>
      )}

      {/* Bottom Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent text-white z-20 pointer-events-none">
        <h3 className="text-base font-semibold drop-shadow-md">{short.title}</h3>
        <Link 
            to={`/channel/${encodeURIComponent(short.channelName)}`} 
            onClick={(e) => e.stopPropagation()} // Allow navigation without affecting video play/pause
            className="text-sm hover:underline pointer-events-auto drop-shadow-sm"
        >
          {short.channelName}
        </Link>
      </div>

      {/* Side Action Buttons Overlay */}
      <div className="absolute right-2 bottom-20 sm:bottom-24 flex flex-col space-y-4 z-20">
        {/* Mute/Unmute Button - always visible when controls are shown, or fixed */}
        <button onClick={toggleMute} className="p-2.5 bg-black/40 hover:bg-black/60 rounded-full transition-colors" aria-label={isMuted ? "Unmute" : "Mute"}>
          {isMuted ? <SpeakerXMarkIcon className="w-6 h-6 text-white" /> : <SpeakerWaveIcon className="w-6 h-6 text-white" />}
        </button>
        
        {/* Mock Action Buttons */}
        {[
          { icon: HeartIcon, label: 'Like', count: '1.2K' }, // Mock counts
          { icon: ChatBubbleOvalLeftEllipsisIcon, label: 'Comment', count: '105' },
          { icon: ArrowUturnRightIcon, label: 'Share', count: 'Share' },
        ].map((action) => (
          <button 
            key={action.label} 
            onClick={(e) => e.stopPropagation()} 
            className="flex flex-col items-center p-1.5 text-white hover:bg-black/20 rounded-lg transition-colors pointer-events-auto"
            aria-label={action.label}
          >
            <action.icon className="w-7 h-7 mb-0.5 drop-shadow-md" />
            <span className="text-xs font-medium drop-shadow-sm">{action.count}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default ShortDisplayCard;