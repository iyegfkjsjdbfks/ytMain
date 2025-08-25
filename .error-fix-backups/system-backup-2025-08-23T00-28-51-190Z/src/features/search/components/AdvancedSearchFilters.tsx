import React, { FC } from 'react';
import type { Video } from '../types';
import { FunnelIcon, XMarkIcon, VideoCameraIcon, UserIcon, PlayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export interface SearchFilters {
 type: "all" | 'video' | 'channel' | 'playlist' | 'live';
 uploadDate: 'any' | 'hour' | 'today' | 'week' | 'month' | 'year';
 duration: 'any' | 'short' | 'medium' | 'long';
 features: string;
 sortBy: 'relevance' | 'upload_date' | 'view_count' | 'rating';
 quality: 'any' | 'hd' | '4k' | 'hdr';
 captions: 'any' | 'with_captions' | 'without_captions';
 location?: string;
 language?: string;
}

interface AdvancedSearchFiltersProps {
 filters: SearchFilters;
 onFiltersChange: (filters: SearchFilters) => void;
 isOpen: boolean;
 onToggle: () => void;
 className?: string;
}

export const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({
 filters,
 onFiltersChange,
 isOpen,
 onToggle,
 className = '' }) => {
 const updateFilter = <K extends keyof SearchFilters>(,
 key: K,
 value: SearchFilters[K]
 ) => {
 onFiltersChange({
 ...filters as any,
 [key]: value });
 };

 const toggleFeature = (feature) => {
 const newFeatures = filters.features.includes(feature)
 ? filters.features.filter((f) => f !== feature)
 : [...filters.features, feature];

 updateFilter('features', newFeatures);
 };

 const resetFilters = () => {
 onFiltersChange({
 type: "all",
 uploadDate: 'any',
 duration: 'any',
 features: [],
 sortBy: 'relevance',
 quality: 'any',
 captions: 'any' });
 };

 const hasActiveFilters = () => {
 return (
 filters.type !== 'all' ||
 filters.uploadDate !== 'any' ||
 filters.duration !== 'any' ||
 filters.features.length > 0 ||
 filters.sortBy !== 'relevance' ||
 filters.quality !== 'any' ||
 filters.captions !== 'any'
 );
 };

 const getActiveFilterCount = () => {
 let count = 0;
 if (filters.type !== 'all') {
 count++;
 }
 if (filters.uploadDate !== 'any') {
 count++;
 }
 if (filters.duration !== 'any') {
 count++;
 }
 if (filters.features.length > 0) {
 count += filters.features.length;
 }
 if (filters.sortBy !== 'relevance') {
 count++;
 }
 if (filters.quality !== 'any') {
 count++;
 }
 if (filters.captions !== 'any') {
 count++;
 }
 return count;
 };

 return (
 <div className={className}>
 {/* Filter Toggle Button */}
 <button />
// FIXED:  onClick={(e) => onToggle(e)}
// FIXED:  className={'fle}x items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
 >
 <FunnelIcon className={'w}-5 h-5' />
 <span>Filters</span>
 {hasActiveFilters() && (
 <span className={'bg}-blue-600 text-white text-xs px-2 py-0.5 rounded-full'>
 {getActiveFilterCount()}
// FIXED:  </span>
 )}
// FIXED:  </button>

 {/* Filter Panel */}
 {isOpen && (
 <div className={'absolut}e top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 p-6'>
 <div className={'fle}x items-center justify-between mb-6'>
 <h3 className={'text}-lg font-semibold text-gray-900 dark:text-white'>
 Search Filters
// FIXED:  </h3>
 <div className={'fle}x items-center gap-2'>
 {hasActiveFilters() && (
 <button />
// FIXED:  onClick={(e) => resetFilters(e)}
// FIXED:  className={'text}-sm text-blue-600 hover:text-blue-700 font-medium'
 >
 Clear all
// FIXED:  </button>
 )}
 <button />
// FIXED:  onClick={(e) => onToggle(e)}
// FIXED:  className={'p}-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'
 >
 <XMarkIcon className={'w}-5 h-5' />
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>

 <div className={'gri}d grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
 {/* Type Filter */}
 <div>
 <h4 className={'font}-medium text-gray-900 dark:text-white mb-3'>
 Type
// FIXED:  </h4>
 <div className={'space}-y-2'>
 {[
 { value: 'all',
 label: 'All', icon: DocumentTextIcon },
 { value: 'video',
 label: 'Video', icon: VideoCameraIcon },
 { value: 'channel',
 label: 'Channel', icon: UserIcon },
 { value: 'playlist',
 label: 'Playlist', icon: PlayIcon },
 { value: 'live',
 label: 'Live', icon: PlayIcon }].map(({ value, label, icon: Icon }) => (
 <label>
 key={value}
// FIXED:  className={'fle}x items-center gap-2 cursor-pointer'/>
 <input>
// FIXED:  type='radio'
// FIXED:  name='type'
// FIXED:  value={value}
// FIXED:  checked={filters.type === value} />
// FIXED:  onChange={e =>
 updateFilter('type', e.target.value)
 }
// FIXED:  className={'text}-blue-600'
 />
 <Icon className={'w}-4 h-4 text-gray-500' />
 <span className={'text}-sm text-gray-700 dark:text-gray-300'>
 {label}
// FIXED:  </span>
// FIXED:  </label>
 ))}
// FIXED:  </div>
// FIXED:  </div>

 {/* Upload Date Filter */}
 <div>
 <h4 className={'font}-medium text-gray-900 dark:text-white mb-3'>
 Upload Date
// FIXED:  </h4>
 <div className={'space}-y-2'>
 {[
 { value: 'any',
 label: 'Any time' },
 { value: 'hour',
 label: 'Last hour' },
 { value: 'today',
 label: 'Today' },
 { value: 'week',
 label: 'This week' },
 { value: 'month',
 label: 'This month' },
 { value: 'year',
 label: 'This year' }].map(({ value, label }) => (
 <label>
 key={value}
// FIXED:  className={'fle}x items-center gap-2 cursor-pointer'/>
 <input>
// FIXED:  type='radio'
// FIXED:  name='uploadDate'
// FIXED:  value={value}
// FIXED:  checked={filters.uploadDate === value} />
// FIXED:  onChange={e =>
 updateFilter('uploadDate', e.target.value)
 }
// FIXED:  className={'text}-blue-600'
 />
 <span className={'text}-sm text-gray-700 dark:text-gray-300'>
 {label}
// FIXED:  </span>
// FIXED:  </label>
 ))}
// FIXED:  </div>
// FIXED:  </div>

 {/* Duration Filter */}
 <div>
 <h4 className={'font}-medium text-gray-900 dark:text-white mb-3'>
 Duration
// FIXED:  </h4>
 <div className={'space}-y-2'>
 {[
 { value: 'any',
 label: 'Any duration' },
 { value: 'short',
 label: 'Under 4 minutes' },
 { value: 'medium',
 label: '4-20 minutes' },
 { value: 'long',
 label: 'Over 20 minutes' }].map(({ value, label }) => (
 <label>
 key={value}
// FIXED:  className={'fle}x items-center gap-2 cursor-pointer'/>
 <input>
// FIXED:  type='radio'
// FIXED:  name='duration'
// FIXED:  value={value}
// FIXED:  checked={filters.duration === value} />
// FIXED:  onChange={e =>
 updateFilter('duration', e.target.value)
 }
// FIXED:  className={'text}-blue-600'
 />
 <span className={'text}-sm text-gray-700 dark:text-gray-300'>
 {label}
// FIXED:  </span>
// FIXED:  </label>
 ))}
// FIXED:  </div>
// FIXED:  </div>

 {/* Features Filter */}
 <div>
 <h4 className={'font}-medium text-gray-900 dark:text-white mb-3'>
 Features
// FIXED:  </h4>
 <div className={'space}-y-2'>
 {[
 { value: 'live',
 label: 'Live' },
 { value: '4k',
 label: '4K' },
 { value: 'hd',
 label: 'HD' },
 { value: 'subtitles',
 label: 'Subtitles/CC' },
 { value: 'creative_commons',
 label: 'Creative Commons' },
 { value: '360',
 label: '360°' },
 { value: 'vr180',
 label: 'VR180' },
 { value: '3d',
 label: '3D' },
 { value: 'hdr',
 label: 'HDR' },
 { value: 'location',
 label: 'Location' },
 { value: 'purchased',
 label: 'Purchased' }].map(({ value, label }) => (
 <label>
 key={value}
// FIXED:  className={'fle}x items-center gap-2 cursor-pointer'/>
 <input>
// FIXED:  type='checkbox'
// FIXED:  checked={filters.features.includes(value)} />
// FIXED:  onChange={() => toggleFeature(value)}
// FIXED:  className={'text}-blue-600'
 />
 <span className={'text}-sm text-gray-700 dark:text-gray-300'>
 {label}
// FIXED:  </span>
// FIXED:  </label>
 ))}
// FIXED:  </div>
// FIXED:  </div>

 {/* Sort By Filter */}
 <div>
 <h4 className={'font}-medium text-gray-900 dark:text-white mb-3'>
 Sort by
// FIXED:  </h4>
 <div className={'space}-y-2'>
 {[
 { value: 'relevance',
 label: 'Relevance' },
 { value: 'upload_date',
 label: 'Upload date' },
 { value: 'view_count',
 label: 'View count' },
 { value: 'rating',
 label: 'Rating' }].map(({ value, label }) => (
 <label>
 key={value}
// FIXED:  className={'fle}x items-center gap-2 cursor-pointer'/>
 <input>
// FIXED:  type='radio'
// FIXED:  name='sortBy'
// FIXED:  value={value}
// FIXED:  checked={filters.sortBy === value} />
// FIXED:  onChange={e =>
 updateFilter('sortBy', e.target.value)
 }
// FIXED:  className={'text}-blue-600'
 />
 <span className={'text}-sm text-gray-700 dark:text-gray-300'>
 {label}
// FIXED:  </span>
// FIXED:  </label>
 ))}
// FIXED:  </div>
// FIXED:  </div>

 {/* Quality Filter */}
 <div>
 <h4 className={'font}-medium text-gray-900 dark:text-white mb-3'>
 Quality
// FIXED:  </h4>
 <div className={'space}-y-2'>
 {[
 { value: 'any',
 label: 'Any quality' },
 { value: 'hd',
 label: 'HD' },
 { value: '4k',
 label: '4K' },
 { value: 'hdr',
 label: 'HDR' }].map(({ value, label }) => (
 <label>
 key={value}
// FIXED:  className={'fle}x items-center gap-2 cursor-pointer'/>
 <input>
// FIXED:  type='radio'
// FIXED:  name='quality'
// FIXED:  value={value}
// FIXED:  checked={filters.quality === value} />
// FIXED:  onChange={e =>
 updateFilter('quality', e.target.value)
 }
// FIXED:  className={'text}-blue-600'
 />
 <span className={'text}-sm text-gray-700 dark:text-gray-300'>
 {label}
// FIXED:  </span>
// FIXED:  </label>
 ))}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 {/* Apply Button */}
 <div className={'fle}x justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700'>
 <button />
// FIXED:  onClick={(e) => onToggle(e)}
// FIXED:  className={'px}-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
 >
 Apply Filters
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
 )}
// FIXED:  </div>
 );
};

export default AdvancedSearchFilters;
