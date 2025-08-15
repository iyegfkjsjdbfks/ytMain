import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import { PlayIcon as PlaySolidIcon, XMarkIcon as XMarkSolidIcon } from '@heroicons/react/24/solid';
const PlayIconSolid = PlaySolidIcon;
const XMarkIconSolid = XMarkSolidIcon;

import type { Video } from '../src/types/core';

interface MiniplayerProps {
  video: Video | null;
  onClose: () => void;
  onMaximize: (videoId: string) => void;
}

const Miniplayer: React.FC<MiniplayerProps> = ({ video, onClose, onMaximize }) => {
  if (!video) {
    return null;
  }

  const handleMaximize = (e: React.MouseEvent) => {
    e.preventDefault();
    onMaximize(video.id);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className="fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden z-50"
      role="complementary"
    >
      <div className="relative aspect-video bg-black group">
        <Link to={`/watch/${video.id}`} className="block" onClick={handleMaximize}>
          <img
            src={video.thumbnail || ''}
            alt={video.title || ''}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <PlayIconSolid className="w-10 h-10 text-white/80" />
          </div>
        </Link>
      </div>
      
      <div className="p-3">
        <Link to={`/watch/${video.id}`} className="block hover:underline" onClick={handleMaximize}>
          <h3 className="text-sm font-medium line-clamp-2 text-gray-900 dark:text-gray-100">
            {video.title}
          </h3>
        </Link>
        
        <Link
          to={`/channel/${encodeURIComponent(video.channelName || video.channelTitle || "Unknown")}`}
          className="text-xs text-gray-600 dark:text-gray-400 hover:underline mt-1 block"
          title={video.channelName || video.channelTitle || "Unknown"}
        >
          {video.channelName || video.channelTitle || "Unknown"}
        </Link>
      </div>
      
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
        aria-label="Close miniplayer"
        title="Close miniplayer"
      >
        <XMarkIconSolid className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Miniplayer;
