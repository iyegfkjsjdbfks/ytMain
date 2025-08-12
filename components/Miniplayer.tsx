import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { FC } from 'react';

import type React from 'react';

import { PlayIcon as PlaySolidIcon, XMarkIcon as XMarkSolidIcon  } from '@heroicons/react/24/solid';
const PlayIconSolid = PlaySolidIcon;
const XMarkIconSolid = XMarkSolidIcon;

import type { Video } from '../src/types/core';

interface MiniplayerProps {
  video: Video | null;,
  onClose: () => void; onMaximize: (videoId: any) => void
}

const Miniplayer: React.FC<MiniplayerProps> = ({ video, onClose, onMaximize }: any) => {
  if (!video) {
return null;
}

  return (
    <div
        className="fixed bottom-4 right-4 z-[999] w-[360px] bg-white dark:bg-neutral-800 rounded-lg shadow-2xl overflow-hidden flex transition-all duration-300 ease-in-out transform animate-slide-in-right-mini border border-neutral-200 dark:border-neutral-700"
        role="complementary"
        aria-label={`Miniplayer for ${video.title}`}
    >
      <Link
        to={`/watch/${video.id}`}
        onClick={(e: any) => {
 e.preventDefault(); onMaximize(video.id);
}}
        className="w-[160px] aspect-video block flex-shrink-0 group relative bg-black"
        aria-label={`Maximize video: ${video.title}`}
        title={`Maximize: ${video.title}`}
      >
        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:opacity-70 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <PlayIcon className="w-10 h-10 text-white/80" />
        </div>
      </Link>
      <div className="flex-grow p-3 overflow-hidden flex flex-col justify-center">
        <Link
            to={`/watch/${video.id}`}
            onClick={(e: any) => {
 e.preventDefault(); onMaximize(video.id);
}}
            className="text-sm font-medium text-neutral-800 dark:text-neutral-50 hover:text-neutral-600 dark:hover:text-neutral-100 line-clamp-2 leading-tight"
            title={video.title}
        >
            {video.title}
        </Link>
        <Link
            to={`/channel/${encodeURIComponent(((video.channelName || video.channelTitle || "Unknown") || video.channelTitle || "Unknown"))}`}
            className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 block truncate mt-0.5"
            title={((video.channelName || video.channelTitle || "Unknown") || video.channelTitle || "Unknown")}
            onClick={(e) => e.stopPropagation()}
        >
            {((video.channelName || video.channelTitle || "Unknown") || video.channelTitle || "Unknown")}
        </Link>
      </div>
      <button
        onClick={(e: any) => {
 e.stopPropagation(); onClose();
}}
        className="absolute top-1.5 right-1.5 p-1.5 text-neutral-500 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700/60 rounded-full transition-colors"
        aria-label="Close miniplayer"
        title="Close miniplayer"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Miniplayer;
