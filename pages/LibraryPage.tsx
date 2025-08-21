import React, { useState, useEffect, FC, ReactNode } from 'react';

import { ChevronRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import { QueueListIcon as QueueListSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
const QueueListIconSolid = QueueListSolidIcon;
const HeartIconSolid = HeartSolidIcon;
import { Link } from 'react-router-dom';

import LocalHistoryIcon from '../components/icons/HistoryIcon'; // Renamed to avoid clash with Heroicons;
import CustomPlaylistIcon from '../components/icons/PlaylistIcon'; // Use custom playlist icon;
import VideoCard from '../components/VideoCard';
import { getWatchHistoryVideos, getWatchLaterVideos, getUserPlaylists, getLikedVideos } from '../services/realVideoService';

import type { Video } from '../types';

const MAX_HORIZONTAL_VIDEOS = 8;
const MAX_PLAYLISTS_GRID = 6;

interface SectionProps {
 title: string;
 icon: React.ReactNode;
 viewAllLink: string;
 children: React.ReactNode;
 itemCount?: number;
 isLoading: boolean;
 hasContent: boolean;
 emptyMessage: string;
 isPlaylistSection?: boolean;
}

const LibrarySection: React.FC<SectionProps> = ({ title, icon, viewAllLink, children, itemCount, isLoading, hasContent, emptyMessage, isPlaylistSection }: any) => {
 const renderSkeletonItems = () => {
 const numSkeletons = isPlaylistSection ? (itemCount || 4) : (itemCount || MAX_HORIZONTAL_VIDEOS / 2);
 return Array.from({ length: numSkeletons }).map((_, index) => (
 <div key={index} className={`animate-pulse ${isPlaylistSection ? 'w-full' : 'w-48 md:w-52 lg:w-56 flex-shrink-0'}`}>
 <div className={`aspect-video bg-neutral-200 dark:bg-neutral-800 rounded-lg ${isPlaylistSection ? 'mb-2' : ''}`} />
 {isPlaylistSection && (
 <>
 <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mt-1.5" />
 <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mt-1" />
// FIXED:  </>
 )}
 {!isPlaylistSection && (
 <>
 <div className="h-4 bg-neutral-300 dark:bg-neutral-700/80 rounded w-5/6 mt-2" />
 <div className="h-3 bg-neutral-300 dark:bg-neutral-700/80 rounded w-3/4 mt-1" />
// FIXED:  </>
 )}
// FIXED:  </div>
 ));
 };

 return (
 <section className="mb-8">
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center">
 <span className="mr-2.5 text-neutral-600 dark:text-neutral-400">{icon}</span>
 <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
 {itemCount !== undefined && <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">({itemCount})</span>}
// FIXED:  </div>
 {hasContent && (
 <Link to={viewAllLink} className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 flex items-center">
 View all <ChevronRightIcon className="w-4 h-4 ml-0.5" />
// FIXED:  </Link>
 )}
// FIXED:  </div>
 {isLoading ? (
 isPlaylistSection ? (
 <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 md:gap-x-4 gap-y-5 md:gap-y-6">
 {renderSkeletonItems()}
// FIXED:  </div>
 ) : (
 <div className="flex space-x-3 md:space-x-4 overflow-x-hidden pb-1"> {/* Hide scrollbar during loading */}
 {renderSkeletonItems()}
// FIXED:  </div>
 )
 ) : hasContent ? (
 children
 ) : (
 <p className="text-neutral-500 dark:text-neutral-400 text-sm py-4">{emptyMessage}</p>
 )}
// FIXED:  </section>
 );
};

function LibraryPage(): any { // Removed React.FC
 const [historyVideos, setHistoryVideos] = useState<Video[]>([]);
 const [watchLaterVideos, setWatchLaterVideos] = useState<Video[]>([]);
 const [userPlaylists, setUserPlaylists] = useState<UserPlaylistDetails[]>([]);
 const [likedVideos, setLikedVideos] = useState<Video[]>([]);

 const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
 const [loadingWatchLater, setLoadingWatchLater] = useState<boolean>(true);
 const [loadingPlaylists, setLoadingPlaylists] = useState<boolean>(true);
 const [loadingLiked, setLoadingLiked] = useState<boolean>(true);

 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 const fetchAllData = async (): Promise<void> => {
 try {
 setLoadingHistory(true);
 getWatchHistoryVideos().then(data => setHistoryVideos(data.slice(0, MAX_HORIZONTAL_VIDEOS))).finally(() => setLoadingHistory(false));

 setLoadingWatchLater(true);
 getWatchLaterVideos().then(data => setWatchLaterVideos(data.slice(0, MAX_HORIZONTAL_VIDEOS))).finally(() => setLoadingWatchLater(false));

 setLoadingPlaylists(true);
 getUserPlaylists().then(data => {
 const sortedPlaylists = data.sort((a, b) => new Date((b as any).updatedAt).getTime() - new Date((a as any).updatedAt).getTime());
 setUserPlaylists(sortedPlaylists.slice(0, MAX_PLAYLISTS_GRID));
 }).finally(() => setLoadingPlaylists(false));

 setLoadingLiked(true);
 getLikedVideos().then(data => setLikedVideos(data.slice(0, MAX_HORIZONTAL_VIDEOS))).finally(() => setLoadingLiked(false));

 } catch (err) {
 (console as any).error('Error fetching library data:', err);
 setError('Could not load library content. Please try again later.');
 // Individual loading states will handle UI for sections that might have loaded
 };
 fetchAllData();
 window.scrollTo(0, 0);
 }, []);

 if (error as any) {
 return <div className="p-6 text-center text-red-500 dark:text-red-400 text-lg">{error}</div>;
 }

 const overallLoading = loadingHistory || loadingWatchLater || loadingPlaylists || loadingLiked;

 return (
 <div className="p-4 md:p-6 bg-white dark:bg-neutral-950">
 <div className="flex items-center mb-6 sm:mb-8">
 <SolidQueueListIcon className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-700 dark:text-neutral-300 mr-3" />
 <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Library</h1>
// FIXED:  </div>

 {/* History Section */}
 <LibrarySection
 title="History" />
 icon={<LocalHistoryIcon className="w-5 h-5" />}
 viewAllLink="/history"
 isLoading={loadingHistory}
 hasContent={historyVideos.length > 0}
 emptyMessage="Your watch history is empty."
 itemCount={historyVideos.length}
 >
 <div className="flex space-x-3 md:space-x-4 overflow-x-auto pb-2 no-scrollbar">
 {historyVideos.map((video) => (
 <div key={`hist-${video.id}`} className="w-56 sm:w-60 md:w-64 lg:w-72 flex-shrink-0">
 <VideoCard video={video} />
// FIXED:  </div>
 ))}
// FIXED:  </div>
// FIXED:  </LibrarySection>

 {/* Watch Later Section */}
 <LibrarySection
 title="Watch Later" />
 icon={<OutlineClockIcon className="w-5 h-5" />}
 viewAllLink="/watch-later"
 isLoading={loadingWatchLater}
 hasContent={watchLaterVideos.length > 0}
 emptyMessage="No videos saved for later."
 itemCount={watchLaterVideos.length}
 >
 <div className="flex space-x-3 md:space-x-4 overflow-x-auto pb-2 no-scrollbar">
 {watchLaterVideos.map((video) => (
 <div key={`wl-${video.id}`} className="w-56 sm:w-60 md:w-64 lg:w-72 flex-shrink-0">
 <VideoCard video={video} />
// FIXED:  </div>
 ))}
// FIXED:  </div>
// FIXED:  </LibrarySection>

 {/* Playlists Section */}
 <LibrarySection
 title="Playlists" />
 icon={<CustomPlaylistIcon className="w-5 h-5" />}
 viewAllLink="/playlists"
 isLoading={loadingPlaylists}
 hasContent={userPlaylists.length > 0}
 emptyMessage="You haven't created or saved any playlists."
 itemCount={userPlaylists.length}
 isPlaylistSection
 >
 <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-3 md:gap-x-4 gap-y-5 md:gap-y-6">
 {userPlaylists.map((playlist) => (
 <Link to={`/playlist/${playlist.id}`} key={playlist.id} className="group block bg-white dark:bg-neutral-800/60 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
 <div className="relative aspect-video bg-neutral-200 dark:bg-neutral-700">
 <img
// FIXED:  src={playlist.thumbnailUrl || 'https://picsum.photos/seed/playlistplaceholder/320/180'}
// FIXED:  alt={`Thumbnail for ${playlist.title}`}
// FIXED:  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
 />
 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
 <SolidPlayIcon className="w-10 h-10 text-white" aria-hidden="true" />
// FIXED:  </div>
 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 text-white">
 <p className="text-xs font-semibold">{playlist.videoCount} video{playlist.videoCount !== 1 && 's'}</p>
// FIXED:  </div>
// FIXED:  </div>
 <div className="p-2.5">
 <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-50 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 mb-0.5">{playlist.title}</h3>
 <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
 Updated {new Date(playlist.updatedAt).toLocaleDateString([], { year: 'numeric',
 month: 'short', day: 'numeric' })}
// FIXED:  </p>
// FIXED:  </div>
// FIXED:  </Link>
 ))}
// FIXED:  </div>
// FIXED:  </LibrarySection>

 {/* Liked Videos Section */}
 <LibrarySection
 title="Liked Videos" />
 icon={<SolidHeartIcon className="w-5 h-5 text-red-500 dark:text-red-400" />}
 viewAllLink="/liked-videos"
 isLoading={loadingLiked}
 hasContent={likedVideos.length > 0}
 emptyMessage="You haven't liked any videos yet."
 itemCount={likedVideos.length}
 >
 <div className="flex space-x-3 md:space-x-4 overflow-x-auto pb-2 no-scrollbar">
 {likedVideos.map((video) => (
 <div key={`liked-${video.id}`} className="w-56 sm:w-60 md:w-64 lg:w-72 flex-shrink-0">
 <VideoCard video={video} />
// FIXED:  </div>
 ))}
// FIXED:  </div>
// FIXED:  </LibrarySection>

 {/* Fallback if all sections are empty after loading */}
 {!overallLoading && !loadingHistory && !historyVideos.length &&
 !loadingWatchLater && !watchLaterVideos.length &&
 !loadingPlaylists && !userPlaylists.length &&
 !loadingLiked && !likedVideos.length && !error && (
 <div className="text-center py-10">
 <SolidQueueListIcon className="w-16 h-16 text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
 <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">Your library is empty</p>
 <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Watch videos, save them for later, or create playlists to see them here.</p>
// FIXED:  </div>
 )}
// FIXED:  </div>
 );
}

export default LibraryPage;
