import React, { FC } from 'react';
import LiveStreams from './LiveStreams';
import ShortsSection from './ShortsSection';
import SubscriptionFeed from './SubscriptionFeed';
import TrendingSection from './TrendingSection';
import VideoGrid from './VideoGrid';
import WatchHistory from './WatchHistory';

import type { Video } from '../types'; // Assuming Video type is in types.ts;

interface HomeContentProps {
 selectedCategory: string; videos: Video
}

const HomeContent: React.FC<HomeContentProps> = ({ selectedCategory, videos }: any) => {
 return (
 <>
 {selectedCategory === 'All' && (
 <>
 <ShortsSection maxShorts={8} />
 <WatchHistory maxVideos={4} />
 <SubscriptionFeed maxVideos={4} />
 <LiveStreams maxStreams={4} />
 <TrendingSection maxVideos={6} />
 </>
 )}
 {videos && videos.length > 0 && (
 <div className="px-4">
 <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
 {selectedCategory === 'All' ? 'Recommended' : selectedCategory}
 </h2>
 <VideoGrid videos={videos} />
 </div>
 )}
 </>
 );
};

export default HomeContent;