
/// <reference types="react/jsx-runtime" />
import type * as React from 'react';
import {  useState, useEffect  } from 'react';

import { ShieldCheckIcon, TrashIcon, EyeIcon, EyeSlashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

import { getWatchHistoryVideos, getLikedVideos, getRecentSearches, clearAllRecentSearches } from '../services/realVideoService';

const YourDataPage: React.FC = () => {
  const [watchHistoryCount, setWatchHistoryCount] = useState(0);
  const [likedVideosCount, setLikedVideosCount] = useState(0);
  const [searchHistoryCount, setSearchHistoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dataVisibility, setDataVisibility] = useState({
    watchHistory: true,
    searchHistory: true, likedVideos: true
  });

  useEffect(() => {
    const fetchDataCounts = async () => {
      setLoading(true);
      try {
        const [watchHistory, likedVideos, searchHistory] = await Promise.all([
          getWatchHistoryVideos(),
          getLikedVideos(),
          getRecentSearches(),
        ]);

        setWatchHistoryCount(watchHistory.length);
        setLikedVideosCount(likedVideos.length);
        setSearchHistoryCount(searchHistory.length);
      } catch (error) {
        console.error('Failed to fetch data counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataCounts();
  }, []);

  const handleClearSearchHistory = async () => {
    const confirmed = window.confirm('Are you sure you want to clear your search history? This action cannot be undone.');
    if (confirmed) {
      try {
        await clearAllRecentSearches();
        setSearchHistoryCount(0);
      } catch (error) {
        console.error('Failed to clear search history:', error);
      }
    }
  };

  const handleClearWatchHistory = () => {
    const confirmed = window.confirm('Are you sure you want to clear your watch history? This action cannot be undone.');
    if (confirmed) {
      localStorage.removeItem('youtubeCloneWatchHistory_v1');
      setWatchHistoryCount(0);
    }
  };

  const handleClearLikedVideos = () => {
    const confirmed = window.confirm('Are you sure you want to clear your liked videos? This action cannot be undone.');
    if (confirmed) {
      localStorage.removeItem('youtubeCloneLikedVideos_v1');
      setLikedVideosCount(0);
    }
  };

  const handleToggleVisibility = (dataType: keyof typeof dataVisibility) => {
    setDataVisibility(prev => ({
      ...prev,
      [dataType]: !prev[dataType],
    }));
  };

  const handleDownloadData = () => {
    const data = {
      watchHistory: JSON.parse(localStorage.getItem('youtubeCloneWatchHistory_v1') || '[]'),
      likedVideos: JSON.parse(localStorage.getItem('youtubeCloneLikedVideos_v1') || '[]'),
      searchHistory: JSON.parse(localStorage.getItem('youtubeCloneRecentSearches_v2') || '[]'),
      userPlaylists: JSON.parse(localStorage.getItem('youtubeCloneUserPlaylists_v1') || '[]'), exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const DataSection: React.FC<{
    title, description: string;
    count, isVisible: boolean;
    onToggleVisibility: () => void, onClear: () => void; loading: boolean
  }> = ({ title, description, count, isVisible, onToggleVisibility, onClear, loading }) => (
    <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{title}</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">{description}</p>
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            {loading ? 'Loading...' : `${count} items`}
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onToggleVisibility}
            className={`p-2 rounded-full transition-colors ${
              isVisible
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'
            }`}
            title={isVisible ? 'Data visible' : 'Data hidden'}
          >
            {isVisible ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onClear}
          disabled={loading || count === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 text-white disabled:text-neutral-500 text-sm font-medium rounded-md transition-colors disabled:cursor-not-allowed"
        >
          <TrashIcon className="w-4 h-4" />
          <span>Clear All</span>
        </button>
        <button
          onClick={() => window.open(`/${title.toLowerCase().replace(' ', '-')}`, '_blank')}
          className="flex items-center space-x-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded-md transition-colors"
        >
          <EyeIcon className="w-4 h-4" />
          <span>View</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-neutral-950 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <ShieldCheckIcon className="w-8 h-8 text-sky-500 dark:text-sky-400 mr-3" />
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Your Data in YouTube
          </h1>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Data Overview</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Manage your YouTube activity data, control what's saved, and download your information.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleDownloadData}
              className="flex items-center space-x-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-medium rounded-lg transition-colors"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Download Your Data</span>
            </button>
            <button
              onClick={() => window.open('https://myaccount.google.com/data-and-privacy', '_blank')}
              className="flex items-center space-x-2 px-6 py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-lg transition-colors"
            >
              <ShieldCheckIcon className="w-5 h-5" />
              <span>Google Account Privacy</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <DataSection
            title="Watch History"
            description="Videos you've watched are saved here to improve your recommendations and help you find videos you've seen before."
            count={watchHistoryCount}
            isVisible={dataVisibility.watchHistory}
            onToggleVisibility={() => handleToggleVisibility('watchHistory')}
            onClear={handleClearWatchHistory}
            loading={loading}
          />

          <DataSection
            title="Search History"
            description="Your searches help improve your search suggestions and recommendations."
            count={searchHistoryCount}
            isVisible={dataVisibility.searchHistory}
            onToggleVisibility={() => handleToggleVisibility('searchHistory')}
            onClear={handleClearSearchHistory}
            loading={loading}
          />

          <DataSection
            title="Liked Videos"
            description="Videos you've liked are saved here for easy access."
            count={likedVideosCount}
            isVisible={dataVisibility.likedVideos}
            onToggleVisibility={() => handleToggleVisibility('likedVideos')}
            onClear={handleClearLikedVideos}
            loading={loading}
          />
        </div>

        <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Important Note</h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            This is a demo application. In the real YouTube, your data would be managed through your Google Account settings.
            The data shown here is stored locally in your browser and can be cleared at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default YourDataPage;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any }
  }
}
