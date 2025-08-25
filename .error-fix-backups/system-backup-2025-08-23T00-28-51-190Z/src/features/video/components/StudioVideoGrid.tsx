import React, { useState, FC } from 'react';
import { Link } from 'react-router-dom';
import type { Video } from '../types';

interface StudioVideoGridProps {
 videos: Video;
 title?: string;
 loading?: boolean;
 emptyMessage?: string;
 onEdit?: (videoId) => void;
 onDelete?: (videoId) => void;
 onVisibilityChange?: (videoId,
 visibility: VideoVisibility) => void
}

/**
 * StudioVideoGrid - A specialized grid component for managing videos in YouTube Studio
 * Includes video thumbnails, analytics, and management actions
 */
const StudioVideoGrid: React.FC<StudioVideoGridProps> = ({
 videos,
 title = 'Videos',
 loading = false,
 emptyMessage = 'No videos found',
 onEdit,
 onDelete,
 onVisibilityChange }) => {
 const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
 const [sortBy, setSortBy] = useState<'date' | 'views' | 'comments'>('date');
 const [filterVisibility, setFilterVisibility] = useState<
 VideoVisibility | 'all'
 >('all');

 const handleVideoSelect = (videoId,
 selected) => {
 const newSelection = new Set(selectedVideos);

 if (selected) {
 newSelection.add(videoId);
 } else {
 newSelection.delete(videoId);
 }

 setSelectedVideos(newSelection);
 };

 const handleSelectAll = (selected) => {
 if (selected) {
 const allIds = videos.map((video) => video.id);
 setSelectedVideos(new Set(allIds));
 } else {
 setSelectedVideos(new Set());
 };

 const handleDeleteSelected = () => {
 if (selectedVideos.size === 0 || !onDelete) {
 return;
 }

 // Confirm before deleting multiple videos
 if (
 window.confirm(
 `Are you sure you want to delete ${selectedVideos.size} videos?`
 )
 ) {
 selectedVideos.forEach(videoId => {
 onDelete(videoId);
 });
 setSelectedVideos(new Set());
 };

 const formatDate = (dateString) => {
 const date = new Date(dateString);
 return date.toLocaleDateString('en-US', {
 year: 'numeric',
 month: 'short',
 day: 'numeric' });
 };

 // Filter videos based on visibility
 const filteredVideos =
 filterVisibility === 'all'
 ? videos
 : videos.filter((video) => video.visibility === filterVisibility);

 // Sort videos based on selected sort option
 const sortedVideos = [...filteredVideos].sort((a, b) => {
 switch (sortBy) {
 case 'views':
 const aViews =
 typeof a.views === 'string' ? parseInt(a.views, 10) : a.views;
 const bViews =
 typeof b.views === 'string' ? parseInt(b.views, 10) : b.views;
 return bViews - aViews;
 case 'comments':
 // If we had comments count, we'd use it here
 return 0;
 case 'date':
 default:
 return (
 new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
 );
 }

 });

 // Show loading indicator if data is being fetched
 if (loading) {
 return (
 <div className={'bg}-white shadow-md rounded-md p-5'>
 <div className={'animate}-pulse space-y-4'>
 <div className={'h}-10 bg-gray-200 rounded w-1/4' />
 <div className={'h}-14 bg-gray-200 rounded' />
 <div className={'gri}d grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
 {[...Array(6)].map((_, i) => (
 <div key={i} className={'borde}r rounded-md p-4 space-y-3'>
 <div className={'h}-32 bg-gray-200 rounded' />
 <div className={'h}-5 bg-gray-200 rounded w-3/4' />
 <div className={'h}-4 bg-gray-200 rounded w-1/2' />
 <div className={'h}-4 bg-gray-200 rounded w-1/4' />
// FIXED:  </div>
 ))}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
 }

 return (
 <div className={'bg}-white shadow-md rounded-md overflow-hidden'>
 <div className={'p}-5 border-b'>
 <div className={'fle}x justify-between items-center mb-4'>
 <h2 className={'text}-xl font-semibold'>{title}</h2>
 <Link>
 to='/studio/videos/upload'
// FIXED:  className={'bg}-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center'/>
 <svg>
 xmlns='http://www.w3.org/2000/svg'
// FIXED:  className={'h}-5 w-5 mr-2'
 fill='none'
 viewBox='0 0 24 24'
 stroke='currentColor'/>
 <path>
 strokeLinecap='round'
 strokeLinejoin='round'
 strokeWidth={2}
 d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
 />
// FIXED:  </svg>
 Upload Video
// FIXED:  </Link>
// FIXED:  </div>

 <div className={'fle}x flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0'>
 {/* Filters and sorting */}
 <div className={'fle}x flex-wrap gap-2'>
 <select>
// FIXED:  className={'borde}r rounded px-3 py-1 text-sm'
// FIXED:  value={filterVisibility} />
// FIXED:  onChange={e =>
 setFilterVisibility(e.target.value as VideoVisibility | 'all')
 }
 >
 <option value='all'>All Videos</option>
 <option value='public'>Public</option>
 <option value='unlisted'>Unlisted</option>
 <option value='private'>Private</option>
// FIXED:  </select>

 <select>
// FIXED:  className={'borde}r rounded px-3 py-1 text-sm'
// FIXED:  value={sortBy} />
// FIXED:  onChange={e =>
 setSortBy(e.target.value as 'date' | 'views' | 'comments')
 }
 >
 <option value='date'>Date</option>
 <option value='views'>Views</option>
 <option value='comments'>Comments</option>
// FIXED:  </select>
// FIXED:  </div>

 {/* Bulk actions */}
 <div className={'fle}x items-center gap-2'>
 <input>
// FIXED:  type='checkbox'
// FIXED:  className={'h}-4 w-4'
// FIXED:  checked={ />
 selectedVideos.size === videos.length && videos.length > 0
 }
// FIXED:  onChange={e => handleSelectAll(e.target.checked)}
 />
 <span className={'text}-sm text-gray-600 mr-3'>
 {selectedVideos.size} selected
// FIXED:  </span>

 {selectedVideos.size > 0 && (
 <button>
// FIXED:  className={'text}-red-600 hover:text-red-800 text-sm border border-red-600 hover:bg-red-50 rounded px-3 py-1' />
// FIXED:  onClick={(e) => handleDeleteSelected(e)}
 >
 Delete
// FIXED:  </button>
 )}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 {/* Video list */}
 {sortedVideos.length > 0 ? (
 <div className={'divide}-y'>
 {sortedVideos.map((video) => (
 <div>
 key={video.id}
// FIXED:  className={'fle}x items-center p-4 hover:bg-gray-50'/>
 <input>
// FIXED:  type='checkbox'
// FIXED:  className={'h}-4 w-4 mr-4'
// FIXED:  checked={selectedVideos.has(video.id)} />
// FIXED:  onChange={e => handleVideoSelect(video.id, e.target.checked)}
 />

 <div className={'fle}x flex-col md:flex-row items-start md:items-center flex-grow'>
 <div className={'fle}x items-center flex-grow min-w-0'>
 <div className={'relativ}e w-28 h-16 md:w-40 md:h-24 flex-shrink-0'>
 <img>
// FIXED:  src={video.thumbnailUrl}
// FIXED:  alt={video.title}
// FIXED:  className={'w}-full h-full object-cover rounded' />
 />
 <div className={'absolut}e bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded'>
 {Math.floor(
 (typeof video.duration === 'string'
 ? parseInt(video.duration, 10)
 : video.duration) / 60
 )}
 :
 {(
 (typeof video.duration === 'string'
 ? parseInt(video.duration, 10)
 : video.duration) % 60
 )
 .toString()
 .padStart(2, '0')}
// FIXED:  </div>
// FIXED:  </div>

 <div className={'ml}-3 min-w-0 flex-grow'>
 <Link>
 to={`/studio/videos/edit/${video.id}`}
// FIXED:  className={'bloc}k hover:underline'/>
 <h3 className={'font}-medium line-clamp-2'>
 {video.title}
// FIXED:  </h3>
// FIXED:  </Link>
 <p className={'text}-sm text-gray-600 line-clamp-1 mt-1'>
 {video.description}
// FIXED:  </p>
 <div className={'mt}-1 flex items-center flex-wrap gap-x-3 text-xs text-gray-500'>
 <span>{formatDate(video.createdAt)}</span>
 <span>{video.views.toLocaleString()} views</span>
 <span>
// FIXED:  className={`
 ${video.visibility === 'public' ? 'text-green-600' : ''}
 ${video.visibility === 'unlisted' ? 'text-yellow-600' : ''}
 ${video.visibility === 'private' ? 'text-gray-600' : ''}
 `}/>
 {video.visibility}
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 <div className={'fle}x mt-3 md:mt-0 ml-0 md:ml-4 space-x-2'>
 {onVisibilityChange && (
 <select>
// FIXED:  className={'borde}r rounded text-sm p-1'
// FIXED:  value={video.visibility} />
// FIXED:  onChange={e =>
 onVisibilityChange(
 video.id,
 e.target.value as VideoVisibility
 )
 }
 >
 <option value='public'>Public</option>
 <option value='unlisted'>Unlisted</option>
 <option value='private'>Private</option>
// FIXED:  </select>
 )}

 {onEdit && (
 <button>
// FIXED:  className={'p}-1 hover:bg-gray-200 rounded' />
// FIXED:  onClick={() => onEdit(video.id)}
 >
 <svg>
 xmlns='http://www.w3.org/2000/svg'
// FIXED:  className={'h}-5 w-5'
 fill='none'
 viewBox='0 0 24 24'
 stroke='currentColor'/>
 <path>
 strokeLinecap='round'
 strokeLinejoin='round'
 strokeWidth={2}
 d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' />
 />
// FIXED:  </svg>
// FIXED:  </button>
 )}

 {onDelete && (
 <button>
// FIXED:  className={'p}-1 hover:bg-gray-200 rounded text-red-600' />
// FIXED:  onClick={() => {
 if (
 window.confirm(
 'Are you sure you want to delete this video?'
 )
 ) {
 onDelete(video.id);
 }
 }
 >
 <svg>
 xmlns='http://www.w3.org/2000/svg'
// FIXED:  className={'h}-5 w-5'
 fill='none'
 viewBox='0 0 24 24'
 stroke='currentColor'/>
 <path>
 strokeLinecap='round'
 strokeLinejoin='round'
 strokeWidth={2}
 d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
 />
// FIXED:  </svg>
// FIXED:  </button>
 )}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 ))}
// FIXED:  </div>
 ) : (
 <div className={'py}-16 text-center'>
 <svg>
 xmlns='http://www.w3.org/2000/svg'
// FIXED:  className={'h}-16 w-16 mx-auto text-gray-400 mb-4'
 fill='none'
 viewBox='0 0 24 24'
 stroke='currentColor'/>
 <path>
 strokeLinecap='round'
 strokeLinejoin='round'
 strokeWidth={1.5}
 d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' />
 />
// FIXED:  </svg>
 <p className={'text}-gray-600'>{emptyMessage}</p>
 <Link>
 to='/studio/videos/upload'
// FIXED:  className={'mt}-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700'/>
 Upload a video
// FIXED:  </Link>
// FIXED:  </div>
 )}
// FIXED:  </div>
 );
};

export default StudioVideoGrid;
