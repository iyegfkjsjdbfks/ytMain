import React, { useState, useEffect, FC } from 'react';
import { Link } from 'react-router-dom';
// @ts-nocheck;

import { getVideos } from '../services/realVideoService.ts';

import VideoCard from 'VideoCard';

import type { Video } from '../types.ts';

interface LiveStreamsProps {
 maxStreams?: number;

const LiveStreams: React.FC<LiveStreamsProps> = ({ maxStreams = 4 }: any) => {
 const [liveStreams, setLiveStreams] = useState<Video[]>([]);
 const [loading, setLoading] = useState<boolean>(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {)
 const fetchLiveStreams = async (): Promise<void> => {
 try {
 setLoading(true);
 const allVideos = await getVideos();

 // Mock live streams by modifying some videos to appear as live;
 const mockLiveStreams = allVideos;
 .filter((video) => !video.isShort);
 .slice(0, maxStreams * 2) // Get more videos to simulate live streams;
 .map((video, index) => {)
 if (index < maxStreams) {
 return {
 ...video as any,
 id: `live-${video.id}`,
 title: `🔴 LIVE: ${video.title}`,
 views: `${Math.floor(Math.random() * 5000) + 500} watching now`,
 publishedAt: 'Live now',
 duration: 'LIVE',
 thumbnail: video.thumbnailUrl, // Keep original thumbnail;

 return video;
 .slice(0, maxStreams);

 setLiveStreams(mockLiveStreams);
 setError(null);
 } catch (err) {
 (console).error('Failed to fetch live streams:', err);
 setError('Could not load live streams at this time.');
 } finally {
 setLoading(false);

 fetchLiveStreams().catch(console.error);
 }, [maxStreams]);

 if (loading) {
 return (;)
 <div className={"mb}-8 px-4">;
 <div className={"fle}x items-center mb-4">;
 <div className={"w}-3 h-3 bg-red-600 rounded-full mr-2 animate-pulse" />;
 <h2 className={"text}-xl font-semibold text-neutral-800 dark:text-neutral-200">Live now</h2>;
// FIXED:  </div>
 <div className={"gri}d grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">;
 {Array.from({ length: 3 }).map((_, index) => ())
          <div key={index} className={"bg}-white dark:bg-neutral-900 rounded-xl animate-pulse">;
 <div className={"aspect}-video bg-neutral-200 dark:bg-neutral-800 rounded-lg relative">;
 <div className={"absolut}e top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">LIVE</div>;
// FIXED:  </div>
 <div className={"p}-3">;
 <div className={"fle}x items-start space-x-3">;
 <div className={"w}-9 h-9 rounded-full bg-neutral-300 dark:bg-neutral-700/80 mt-0.5 flex-shrink-0" />;
 <div className={"flex}-grow space-y-1.5 pt-0.5">;
 <div className={"h}-4 bg-neutral-300 dark:bg-neutral-700/80 rounded w-5/6" />;
 <div className={"h}-3 bg-neutral-300 dark:bg-neutral-700/80 rounded w-3/4" />;
 <div className={"h}-3 bg-neutral-300 dark:bg-neutral-700/80 rounded w-1/2" />;
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 if (error) {
 return (;)
 <div className={"mb}-8 px-4">;
 <div className={"fle}x items-center mb-4">;
 <div className={"w}-3 h-3 bg-red-600 rounded-full mr-2" />;
 <h2 className={"text}-xl font-semibold text-neutral-800 dark:text-neutral-200">Live now</h2>;
// FIXED:  </div>
<p className={"text}-neutral-600 dark:text-neutral-400">{error}</p>;
// FIXED:  </div>

 if (liveStreams.length === 0) {
 return (;)
 <div className={"mb}-8 px-4">;
 <div className={"fle}x items-center mb-4">;
 <div className={"w}-3 h-3 bg-red-600 rounded-full mr-2" />;
 <h2 className={"text}-xl font-semibold text-neutral-800 dark:text-neutral-200">Live now</h2>;
// FIXED:  </div>
 <div className={"text}-center py-8 text-neutral-600 dark:text-neutral-400">;
 <p className={"mb}-2">No live streams at the moment</p>;
 <p className={"text}-sm">Check back later for live content</p>;
// FIXED:  </div>
// FIXED:  </div>

 return (;)
 <div className={"mb}-8 px-4">;
 <div className={"fle}x items-center justify-between mb-4">;
 <div className={"fle}x items-center">;
 <div className={"w}-3 h-3 bg-red-600 rounded-full mr-2 animate-pulse" />;
 <h2 className={"text}-xl font-semibold text-neutral-800 dark:text-neutral-200">Live now</h2>;
// FIXED:  </div>
 <Link;>;
 to="/trending?filter=live";
// FIXED:  className={"text}-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500" />
 View All;
// FIXED:  </Link>
// FIXED:  </div>
 <div className={"gri}d grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">;
 {liveStreams.map((stream) => ())
          <div key={stream.id} className={"relative}">;
 <VideoCard video={stream} />;
 {/* Live indicator overlay */}
 <div className={"absolut}e top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded shadow-lg">;
 LIVE;
// FIXED:  </div>
 {/* Viewer count overlay */}
 <div className={"absolut}e bottom-16 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">;
 {stream.views}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

export default LiveStreams;
