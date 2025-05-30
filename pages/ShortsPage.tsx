import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ShortDisplayCard from '../components/ShortDisplayCard'; // New component
import { useShortsVideos } from '../hooks';

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
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <p className="text-white text-lg">Loading Shorts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <p className="text-white text-lg">No shorts available right now.</p>
      </div>
    );
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