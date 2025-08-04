import React, { useState, useEffect, useRef } from 'react';

// Import statements fixed
// import { liveStreamService } from '../services/livestreamAPI';

interface LiveStreamViewerProps {
  streamId: string;
  autoplay?: boolean;
  onViewerCountChange?: (count: number) => void;
}

export const LiveStreamViewer: React.FC<LiveStreamViewerProps> = ({
  streamId,
  autoplay = false,
  onViewerCountChange
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Initialize live stream
    const initStream = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setViewerCount(Math.floor(Math.random() * 1000));
        setIsLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setIsLoading(false);
      }
    };

    if (streamId) {
      initStream();
    }
  }, [streamId]);

  useEffect(() => {
    onViewerCountChange?.(viewerCount);
  }, [viewerCount, onViewerCountChange]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading live stream...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        autoPlay={autoplay}
        controls
        muted
      >
        <source src="#" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <div className="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
        LIVE
      </div>
      
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        {viewerCount.toLocaleString()} viewers
      </div>
    </div>
  );
};

export default LiveStreamViewer;
