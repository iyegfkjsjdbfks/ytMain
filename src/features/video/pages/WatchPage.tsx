import React from 'react';
import { useParams } from 'react-router-dom';

/**
 * WatchPage component for displaying and playing a specific video
 */
const WatchPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Watch Page</h1>
      {videoId ? (
        <p className="text-gray-600 mb-4">Currently viewing video with ID: {videoId}</p>
      ) : (
        <p className="text-gray-600 mb-4">No video ID provided</p>
      )}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-blue-700">
        <p>This is a placeholder for the watch page that will display a video player, comments, and related videos.</p>
        <p className="mt-2">For demonstration of video components, please visit the <strong>Video Demo</strong> page using the user menu dropdown.</p>
      </div>
    </div>
  );
};

export default WatchPage;
