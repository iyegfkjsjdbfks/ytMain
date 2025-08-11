
/// <reference types="react/jsx-runtime" />
import { useNavigate } from 'react-router-dom';
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName]: any;
    }
  }
}
import type React from 'react';

import { useNavigate } from 'react-router-dom';

const VideoNotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Video not found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">The video you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default VideoNotFound;