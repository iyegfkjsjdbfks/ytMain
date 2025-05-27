import React, { useEffect, useState, useRef } from 'react';
import { Video } from '../types';
import { getShortsVideos } from '../services/mockVideoService';
import ShortDisplayCard from '../components/ShortDisplayCard'; // New component

const ShortsPage: React.FC = () => {
  const [shorts, setShorts] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchShorts = async () => {
      setLoading(true);
      try {
        const fetchedShorts = await getShortsVideos();
        setShorts(fetchedShorts);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch shorts:", err);
        setError("Could not load shorts. Please try again later.");
        setShorts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShorts();
  }, []);

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
        <ShortDisplayCard key={short.id || index} short={short} />
      ))}
    </div>
  );
};

export default ShortsPage;