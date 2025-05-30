import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ShortDisplayCard from '../components/ShortDisplayCard'; // New component
import { useShortsVideos } from '../hooks';
import ShortsPageSkeleton from '../components/LoadingStates/ShortsPageSkeleton';
import ShortsPageError from '../components/ErrorStates/ShortsPageError';
import EmptyShortsState from '../components/ErrorStates/EmptyShortsState';

const ShortsPage: React.FC = () => {
  const { data: shorts, loading, error } = useShortsVideos();
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  // Get video ID from query parameter
  const searchParams = new URLSearchParams(location.search);
  const targetVideoId = searchParams.get('v');
  
  // Scroll to specific video when component mounts or when shorts data changes
  useEffect(() => {
    if (targetVideoId && shorts.length > 0 && containerRef.current) {
      const targetIndex = shorts.findIndex(short => short.id === targetVideoId);
      if (targetIndex !== -1) {
        // Scroll to the target video
        const targetElement = containerRef.current.children[targetIndex] as HTMLElement;
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  }, [targetVideoId, shorts]);

  if (loading) {
    return <ShortsPageSkeleton />;
  }

  if (error) {
    return <ShortsPageError error={error} />;
  }

  if (shorts.length === 0) {
    return <EmptyShortsState />;
  }

  return (
    <div 
      ref={containerRef}
      className="h-[calc(100vh-3.5rem)] overflow-y-scroll snap-y snap-mandatory bg-black relative no-scrollbar" // 3.5rem is header height
      role="feed"
      aria-label="Shorts feed"
    >
      {shorts.map((short, index) => (
        <div key={short.id || index} className="h-full w-full snap-start">
          <ShortDisplayCard short={short} />
        </div>
      ))}
    </div>
  );
};

export default ShortsPage;