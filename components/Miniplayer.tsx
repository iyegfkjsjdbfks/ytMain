import React, { FC, type React } from 'react';
import { Link } from 'react-router-dom';

import { PlayIcon as PlaySolidIcon, XMarkIcon as XMarkSolidIcon } from '@heroicons/react/24/solid';
const PlayIconSolid = PlaySolidIcon;
const XMarkIconSolid = XMarkSolidIcon;

import type { Video } from '../src/types/core';

interface MiniplayerProps {
 video: Video | null;
 onClose: () => void; onMaximize: (videoId: any) => void
}

const Miniplayer: React.FC<MiniplayerProps> = ({ video, onClose, onMaximize }: any) => {
 if (!video) {
return null;
}

 return (
 <div

  role="complementary">
  <Link to={`/watch/${video.id}`} className="block">
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <PlayIcon className="w-10 h-10 text-white/80" />
          </div>
        </Link>
 <div className="flex-grow p-3 overflow-hidden flex flex-col justify-center">
 <Link to={`/watch/${video.id}`}>

 e.preventDefault(); onMaximize(video.id);
}

 >

 <Link
 to={`/channel/${encodeURIComponent(((video.channelName || video.channelTitle || "Unknown") || video.channelTitle || "Unknown"))}`}

 title={((video.channelName || video.channelTitle || "Unknown") || video.channelTitle || "Unknown")} />

 >
 {((video.channelName || video.channelTitle || "Unknown") || video.channelTitle || "Unknown")}


 <button />

 e.stopPropagation(); onClose();
}


 title="Close miniplayer"
 >
 <XMarkIcon className="w-5 h-5" />
</button>
</div>
</div>


 );
};

export default Miniplayer;
