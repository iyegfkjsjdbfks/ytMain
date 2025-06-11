import React, { useState, useEffect } from 'react';
import { 
  getSettings, 
  saveSettings, 
  YouTubeSearchProvider,
  isGoogleSearchAvailable,
  isYouTubeApiAvailable 
} from '../services/settingsService';

const AdminPage: React.FC = () => {
  const [provider, setProvider] = useState<YouTubeSearchProvider>('youtube-api');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Load current settings
    const settings = getSettings();
    setProvider(settings.youtubeSearchProvider);
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

  const youtubeApiAvailable = isYouTubeApiAvailable();
  const googleSearchAvailable = isGoogleSearchAvailable();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
            <p className="mt-1 text-sm text-gray-600">
              Configure YouTube search provider and other application settings.
            </p>
          </div>

          <div className="px-6 py-6">
            <div className="space-y-6">
              {/* YouTube Search Provider Section */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  YouTube Search Provider
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Choose which API to use for searching YouTube videos.
                </p>

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
                </div>

                {/* Save Message */}
                {saveMessage && (
                  <div className={`mt-4 p-3 rounded-md ${
                    saveMessage.includes('Error') 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    {saveMessage}
                  </div>
                )}

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
                    <p className="text-xs">
                      Restart the development server after adding environment variables.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;