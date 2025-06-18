import React, { useState, useEffect } from 'react';
import { 
  getSettings, 
  saveSettings, 
  YouTubeSearchProvider,
  YouTubePlayerType,
  LocalVideoPlayerType,
  VideoPlayerType,
  VideoPlayerConfig,
  VIDEO_PLAYER_CONFIGS,
  getVideoPlayersByCategory,
  getAllVideoPlayers,
  setLocalVideoPlayerType,
  setDefaultVideoPlayerCategory,
  isGoogleSearchAvailable,
  isYouTubeApiAvailable,
  isHybridModeAvailable
} from '../services/settingsService';
import { PlayIcon, VideoCameraIcon, CogIcon, SparklesIcon, RocketLaunchIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

const AdminPage: React.FC = () => {
  const [provider, setProvider] = useState<YouTubeSearchProvider>('youtube-api');
  const [playerType, setPlayerType] = useState<YouTubePlayerType>('optimized');
  const [localPlayerType, setLocalPlayerType] = useState<LocalVideoPlayerType>('advanced-video');
  const [defaultCategory, setDefaultCategory] = useState<'youtube' | 'local'>('youtube');
  const [activeTab, setActiveTab] = useState<'search' | 'youtube-players' | 'local-players' | 'overview'>('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Load current settings
    const settings = getSettings();
    setProvider(settings.youtubeSearchProvider);
    setPlayerType(settings.youtubePlayerType);
    setLocalPlayerType(settings.localVideoPlayerType);
    setDefaultCategory(settings.defaultVideoPlayerCategory);
  }, []);

  const handleProviderChange = async (newProvider: YouTubeSearchProvider) => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const settings = getSettings();
      settings.youtubeSearchProvider = newProvider;
      saveSettings(settings);
      setProvider(newProvider);
      setSaveMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handlePlayerTypeChange = async (newPlayerType: YouTubePlayerType) => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const settings = getSettings();
      settings.youtubePlayerType = newPlayerType;
      saveSettings(settings);
      setPlayerType(newPlayerType);
      setSaveMessage('YouTube player type updated successfully!');
    } catch (error) {
      console.error('Error saving player type:', error);
      setSaveMessage('Error saving player type. Please try again.');
    } finally {
      setIsSaving(false);
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleLocalPlayerTypeChange = async (newPlayerType: LocalVideoPlayerType) => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      setLocalVideoPlayerType(newPlayerType);
      setLocalPlayerType(newPlayerType);
      setSaveMessage('Local video player type updated successfully!');
    } catch (error) {
      console.error('Error saving local player type:', error);
      setSaveMessage('Error saving local player type. Please try again.');
    } finally {
      setIsSaving(false);
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleDefaultCategoryChange = async (newCategory: 'youtube' | 'local') => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      setDefaultVideoPlayerCategory(newCategory);
      setDefaultCategory(newCategory);
      setSaveMessage('Default video player category updated successfully!');
    } catch (error) {
      console.error('Error saving default category:', error);
      setSaveMessage('Error saving default category. Please try again.');
    } finally {
      setIsSaving(false);
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const youtubeApiAvailable = isYouTubeApiAvailable();
  const googleSearchAvailable = isGoogleSearchAvailable();
  const hybridModeAvailable = isHybridModeAvailable();

  const renderPlayerCard = (config: VideoPlayerConfig, isSelected: boolean, onSelect: () => void) => {
    const getPerformanceColor = (performance: string) => {
      switch (performance) {
        case 'high': return 'text-green-600 bg-green-100';
        case 'medium': return 'text-yellow-600 bg-yellow-100';
        case 'low': return 'text-red-600 bg-red-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    const getComplexityColor = (complexity: string) => {
      switch (complexity) {
        case 'simple': return 'text-blue-600 bg-blue-100';
        case 'moderate': return 'text-purple-600 bg-purple-100';
        case 'advanced': return 'text-orange-600 bg-orange-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    const getCategoryIcon = (category: string) => {
      return category === 'youtube' ? 
        <PlayIcon className="h-5 w-5 text-red-500" /> : 
        <VideoCameraIcon className="h-5 w-5 text-blue-500" />;
    };

    return (
      <div 
        className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected 
            ? 'border-blue-500 bg-blue-50 shadow-md' 
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
        onClick={onSelect}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getCategoryIcon(config.category)}
            <h3 className="text-lg font-semibold text-gray-900">{config.name}</h3>
          </div>
          <div className="flex space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPerformanceColor(config.performance)}`}>
              {config.performance} performance
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getComplexityColor(config.complexity)}`}>
              {config.complexity}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{config.description}</p>
        
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Features:</h4>
          <div className="flex flex-wrap gap-1">
            {config.features.map((feature, index) => (
              <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                {feature}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Best for:</h4>
          <ul className="text-xs text-gray-600 list-disc list-inside">
            {config.useCases.slice(0, 2).map((useCase, index) => (
              <li key={index}>{useCase}</li>
            ))}
          </ul>
        </div>
        
        {isSelected && (
          <div className="absolute top-2 right-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Video Player Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Configure video players, search providers, and default settings for your application.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Overview', icon: CogIcon },
                { id: 'youtube-players', name: 'YouTube Players', icon: PlayIcon },
                { id: 'local-players', name: 'Local Video Players', icon: VideoCameraIcon },
                { id: 'search', name: 'Search Settings', icon: SparklesIcon }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="px-6 py-6">
            {/* Save Message */}
            {saveMessage && (
              <div className={`mb-6 p-4 rounded-md ${
                saveMessage.includes('Error') 
                  ? 'bg-red-50 border border-red-200 text-red-700' 
                  : 'bg-green-50 border border-green-200 text-green-700'
              }`}>
                {saveMessage}
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Settings Summary */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CogIcon className="h-5 w-5 mr-2" />
                      Current Configuration
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Search Provider:</span>
                        <span className="ml-2 text-sm text-gray-900 capitalize">{provider.replace('-', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">YouTube Player:</span>
                        <span className="ml-2 text-sm text-gray-900">{VIDEO_PLAYER_CONFIGS[playerType].name}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Local Video Player:</span>
                        <span className="ml-2 text-sm text-gray-900">{VIDEO_PLAYER_CONFIGS[localPlayerType].name}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Default Category:</span>
                        <span className="ml-2 text-sm text-gray-900 capitalize">{defaultCategory}</span>
                      </div>
                    </div>
                  </div>

                  {/* Default Category Selection */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <RocketLaunchIcon className="h-5 w-5 mr-2" />
                      Default Video Player Category
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Choose which type of video player to use by default in your application.
                    </p>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="default-category"
                          value="youtube"
                          checked={defaultCategory === 'youtube'}
                          onChange={() => handleDefaultCategoryChange('youtube')}
                          disabled={isSaving}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">YouTube Players</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="default-category"
                          value="local"
                          checked={defaultCategory === 'local'}
                          onChange={() => handleDefaultCategoryChange('local')}
                          disabled={isSaving}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">Local Video Players</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <PlayIcon className="h-8 w-8 text-red-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">YouTube Players</p>
                        <p className="text-2xl font-semibold text-gray-900">{getVideoPlayersByCategory('youtube').length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <VideoCameraIcon className="h-8 w-8 text-blue-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">Local Players</p>
                        <p className="text-2xl font-semibold text-gray-900">{getVideoPlayersByCategory('local').length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <SparklesIcon className="h-8 w-8 text-green-500" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">Total Players</p>
                        <p className="text-2xl font-semibold text-gray-900">{getAllVideoPlayers().length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* YouTube Players Tab */}
            {activeTab === 'youtube-players' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                    <PlayIcon className="h-5 w-5 mr-2 text-red-500" />
                    YouTube Video Players
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Choose which YouTube player implementation to use for YouTube video playback.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getVideoPlayersByCategory('youtube').map((config) => (
                    <div key={config.type}>
                      {renderPlayerCard(
                        config,
                        playerType === config.type,
                        () => handlePlayerTypeChange(config.type as YouTubePlayerType)
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Local Video Players Tab */}
            {activeTab === 'local-players' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                    <VideoCameraIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Local Video Players
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Choose which player implementation to use for local video files and custom video sources.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getVideoPlayersByCategory('local').map((config) => (
                    <div key={config.type}>
                      {renderPlayerCard(
                        config,
                        localPlayerType === config.type,
                        () => handleLocalPlayerTypeChange(config.type as LocalVideoPlayerType)
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Settings Tab */}
            {activeTab === 'search' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                    <SparklesIcon className="h-5 w-5 mr-2 text-green-500" />
                    YouTube Search Provider
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Choose which API to use for searching YouTube videos.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* YouTube Data API v3 Option */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="youtube-api"
                        name="search-provider"
                        type="radio"
                        checked={provider === 'youtube-api'}
                        onChange={() => handleProviderChange('youtube-api')}
                        disabled={!youtubeApiAvailable || isSaving}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 disabled:opacity-50"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="youtube-api" className="font-medium text-gray-700">
                        YouTube Data API v3
                        {!youtubeApiAvailable && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Not Configured
                          </span>
                        )}
                      </label>
                      <p className="text-gray-500">
                        Official YouTube API with detailed video information and metadata.
                        {!youtubeApiAvailable && (
                          <span className="block mt-1 text-red-600">
                            Missing VITE_YOUTUBE_API_KEY in environment variables.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Google Custom Search Option */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="google-search"
                        name="search-provider"
                        type="radio"
                        checked={provider === 'google-search'}
                        onChange={() => handleProviderChange('google-search')}
                        disabled={!googleSearchAvailable || isSaving}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 disabled:opacity-50"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="google-search" className="font-medium text-gray-700">
                        Google Custom Search JSON API
                        {!googleSearchAvailable && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Not Configured
                          </span>
                        )}
                      </label>
                      <p className="text-gray-500">
                        Search YouTube videos through Google Custom Search with iframe embedding.
                        {!googleSearchAvailable && (
                          <span className="block mt-1 text-red-600">
                            Missing VITE_GOOGLE_SEARCH_API_KEY or VITE_GOOGLE_SEARCH_ENGINE_ID in environment variables.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Hybrid Mode Option */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="hybrid-mode"
                        name="search-provider"
                        type="radio"
                        checked={provider === 'hybrid'}
                        onChange={() => handleProviderChange('hybrid')}
                        disabled={!hybridModeAvailable || isSaving}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 disabled:opacity-50"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="hybrid-mode" className="font-medium text-gray-700">
                        Hybrid Mode (YouTube API + Custom Search Fallback)
                        {!hybridModeAvailable && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Not Configured
                          </span>
                        )}
                        {hybridModeAvailable && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Recommended
                          </span>
                        )}
                      </label>
                      <p className="text-gray-500">
                        Uses YouTube Data API v3 first for optimal results, then automatically switches to Google Custom Search when quota is reached.
                        {!hybridModeAvailable && (
                          <span className="block mt-1 text-red-600">
                            Requires both VITE_YOUTUBE_API_KEY and VITE_GOOGLE_SEARCH_API_KEY + VITE_GOOGLE_SEARCH_ENGINE_ID in environment variables.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* API Configuration Help */}
                <div className="mt-6 p-4 bg-blue-50 rounded-md">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    API Configuration Help
                  </h3>
                  <div className="text-sm text-blue-700 space-y-2">
                    <p>
                      <strong>YouTube Data API v3:</strong> Add <code className="bg-blue-100 px-1 rounded">VITE_YOUTUBE_API_KEY</code> to your .env.local file.
                    </p>
                    <p>
                      <strong>Google Custom Search:</strong> Add both <code className="bg-blue-100 px-1 rounded">VITE_GOOGLE_SEARCH_API_KEY</code> and <code className="bg-blue-100 px-1 rounded">VITE_GOOGLE_SEARCH_ENGINE_ID</code> to your .env.local file.
                    </p>
                    <p>
                      <strong>Hybrid Mode:</strong> Requires all three environment variables above. Provides the best user experience by using YouTube API first, then falling back to Custom Search when quota limits are reached.
                    </p>
                    <p className="text-xs">
                      Restart the development server after adding environment variables.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;