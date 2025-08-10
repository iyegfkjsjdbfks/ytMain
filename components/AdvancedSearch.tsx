
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
// TODO: Fix import - import { useState, useEffect, useRef } from 'react';
// TODO: Fix import - import React from 'react';

import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ClockIcon,
  CalendarDaysIcon,
  VideoCameraIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
// TODO: Fix import - import { useNavigate } from 'react-router-dom';

export interface SearchFilters {
  duration: 'any' | 'short' | 'medium' | 'long'; // <4min, 4-20min, >20min
  uploadDate: 'any' | 'hour' | 'today' | 'week' | 'month' | 'year';
  type: 'any' | 'video' | 'channel' | 'playlist' | 'live';
  quality: 'any' | 'hd' | '4k';
  features: string[]; // subtitles, creative_commons, 3d, live, purchased, 4k, 360, location, hdr
  sortBy: 'relevance' | 'upload_date' | 'view_count' | 'rating';
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  initialQuery?: string;
  className?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  initialQuery = '',
  className = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    duration: 'any',
    uploadDate: 'any',
    type: 'any',
    quality: 'any',
    features: [],
    sortBy: 'relevance',
  });

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 1) {
      generateSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const generateSuggestions = (searchQuery: string) => {
    // Mock search suggestions - in real app, this would call an API
    const mockSuggestions = [
      'react tutorial',
      'react hooks',
      'react native',
      'javascript tutorial',
      'typescript guide',
      'web development',
      'programming basics',
      'coding interview',
      'algorithm tutorial',
      'data structures',
    ];

    const filtered = mockSuggestions
      .filter(suggestion =>
        suggestion.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .slice(0, 8);

    setSuggestions(filtered);
  };

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      // Save to search history
      const searchHistory = JSON.parse(localStorage.getItem('youtubeCloneSearchHistory_v1') || '[]');
      const updatedHistory = [finalQuery, ...searchHistory.filter((h: string) => h !== finalQuery)].slice(0, 20);
      localStorage.setItem('youtubeCloneSearchHistory_v1', JSON.stringify(updatedHistory));

      onSearch(finalQuery, filters);
      setShowSuggestions(false);
      setShowFilters(false);

      // Navigate to search results
      const searchParams = new URLSearchParams();
      searchParams.set('q', finalQuery);

      // Add filters to URL if they're not default
      if (filters.duration !== 'any') {
searchParams.set('duration', filters.duration);
}
      if (filters.uploadDate !== 'any') {
searchParams.set('upload_date', filters.uploadDate);
}
      if (filters.type !== 'any') {
searchParams.set('type', filters.type);
}
      if (filters.quality !== 'any') {
searchParams.set('quality', filters.quality);
}
      if (filters.features.length > 0) {
searchParams.set('features', filters.features.join(','));
}
      if (filters.sortBy !== 'relevance') {
searchParams.set('sort_by', filters.sortBy);
}

      navigate(`/search?${searchParams.toString()}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setShowFilters(false);
    }
  };

  const toggleFeature = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const clearFilters = () => {
    setFilters({
      duration: 'any',
      uploadDate: 'any',
      type: 'any',
      quality: 'any',
      features: [],
      sortBy: 'relevance',
    });
  };

  const hasActiveFilters = () => {
    return filters.duration !== 'any' ||
           filters.uploadDate !== 'any' ||
           filters.type !== 'any' ||
           filters.quality !== 'any' ||
           filters.features.length > 0 ||
           filters.sortBy !== 'relevance';
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="flex">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search videos, channels, playlists..."
              className="w-full px-4 py-2 pl-10 pr-12 border border-gray-300 dark:border-gray-600 rounded-l-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={() => handleSearch()}
            className="px-6 py-2 bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`ml-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              hasActiveFilters() ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600' : 'bg-white dark:bg-gray-800'
            }`}
          >
            <FunnelIcon className={`w-5 h-5 ${hasActiveFilters() ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`} />
          </button>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            {suggestions.map((suggestion: any, index: number) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(suggestion);
                  handleSearch(suggestion);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="flex items-center space-x-3">
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search Filters</h3>
            <div className="flex space-x-2">
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Duration Filter */}
            <div>
              <label htmlFor="duration-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <ClockIcon className="w-4 h-4 inline mr-1" />
                Duration
              </label>
              <select
                id="duration-filter"
                value={filters.duration}
                onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="any">Any duration</option>
                <option value="short">Under 4 minutes</option>
                <option value="medium">4-20 minutes</option>
                <option value="long">Over 20 minutes</option>
              </select>
            </div>

            {/* Upload Date Filter */}
            <div>
              <label htmlFor="upload-date-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                Upload date
              </label>
              <select
                id="upload-date-filter"
                value={filters.uploadDate}
                onChange={(e) => setFilters(prev => ({ ...prev, uploadDate: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="any">Any time</option>
                <option value="hour">Last hour</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="year">This year</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <VideoCameraIcon className="w-4 h-4 inline mr-1" />
                Type
              </label>
              <select
                id="type-filter"
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="any">Any type</option>
                <option value="video">Video</option>
                <option value="channel">Channel</option>
                <option value="playlist">Playlist</option>
                <option value="live">Live</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label htmlFor="sort-by-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <AdjustmentsHorizontalIcon className="w-4 h-4 inline mr-1" />
                Sort by
              </label>
              <select
                id="sort-by-filter"
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="relevance">Relevance</option>
                <option value="upload_date">Upload date</option>
                <option value="view_count">View count</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          {/* Features */}
          <div className="mt-6">
            <label htmlFor="features-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Features
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: 'subtitles', label: 'Subtitles/CC' },
                { id: 'creative_commons', label: 'Creative Commons' },
                { id: '3d', label: '3D' },
                { id: 'live', label: 'Live' },
                { id: '4k', label: '4K' },
                { id: '360', label: '360°' },
                { id: 'location', label: 'Location' },
                { id: 'hdr', label: 'HDR' },
              ].map((feature) => (
                <label key={feature.id} htmlFor={feature.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    id={feature.id}
                    type="checkbox"
                    checked={filters.features.includes(feature.id)}
                    onChange={() => toggleFeature(feature.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => handleSearch()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
