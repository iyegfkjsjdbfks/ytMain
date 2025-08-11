
import React, { useState } from 'react';

import PaintBrushIcon, { PhotoIcon } from '@heroicons/react/24/outline';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/solid';

interface ChannelBranding {
  channelArt: string;
  profilePicture: string;
  channelName: string;
  channelDescription: string;
  channelKeywords: string;
  channelTrailer: string;
  featuredChannels: string;
  socialLinks: {
    website: string;
    twitter: string;
    instagram: string;
    facebook: string;
  };
  channelLayout: 'default' | 'compact' | 'showcase';
  watermark: string;
  endScreenTemplate: string;
}

interface ChannelStats {
  subscribers: number;
  totalViews: number;
  videosCount: number;
  joinDate: string;
}

const ChannelCustomizationPage: React.FC = () => {
  const [branding, setBranding] = useState<ChannelBranding>({
    channelArt: '/api/placeholder/2560/1440',
    profilePicture: '/api/placeholder/800/800',
    channelName: 'My Awesome Channel',
    channelDescription: 'Welcome to my channel! Here you\'ll find amazing content about technology, tutorials, and more.',
    channelKeywords: ['technology', 'tutorials', 'reviews', 'gaming'],
    channelTrailer: '',
    featuredChannels: [],
    socialLinks: {
      website: '',
      twitter: '',
      instagram: '',
      facebook: '',
    },
    channelLayout: 'default',
    watermark: '',
    endScreenTemplate: 'default',
  });

  const [stats] = useState<ChannelStats>({
    subscribers: 125000,
    totalViews: 2500000,
    videosCount: 156,
    joinDate: 'Jan 15, 2020',
  });

  const [activeTab, setActiveTab] = useState<'branding' | 'layout' | 'info' | 'featured'>('branding');
  const [previewMode, setPreviewMode] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const handleInputChange = (field: keyof ChannelBranding, value: string | number) => {
    setBranding(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  const handleSocialLinkChange = (platform: keyof ChannelBranding['socialLinks'], value: string | number) => {
    setBranding(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
    setUnsavedChanges(true);
  };

  const handleKeywordAdd = (keyword: any) => {
    if (keyword.trim() && !branding.channelKeywords.includes(keyword.trim())) {
      setBranding(prev => ({
        ...prev,
        channelKeywords: [...prev.channelKeywords, keyword.trim()],
      }));
      setUnsavedChanges(true);
    }
  };

  const handleKeywordRemove = (keyword: any) => {
    setBranding(prev => ({
      ...prev,
      channelKeywords: prev.channelKeywords.filter((k: any) => k !== keyword),
    }));
    setUnsavedChanges(true);
  };

  const handleSave = () => {
    // Simulate API call
    setUnsavedChanges(false);
    alert('Channel customization saved successfully!');
  };

  const handleDiscard = () => {
    // Reset to original state
    setUnsavedChanges(false);
    alert('Changes discarded');
  };

  const formatNumber = (num: any): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)  }M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)  }K`;
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Channel Customization</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Customize your channel's appearance and branding</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                {previewMode ? 'Edit Mode' : 'Preview'}
              </button>
              {unsavedChanges && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleDiscard}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Discard
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {[
                { id: 'branding', label: 'Branding', icon: PaintBrushIcon },
                { id: 'layout', label: 'Layout', icon: DocumentTextIcon },
                { id: 'info', label: 'Basic Info', icon: DocumentTextIcon },
                { id: 'featured', label: 'Featured Content', icon: LinkIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-3" />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Channel Stats */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Channel Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subscribers</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(stats.subscribers)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Views</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(stats.totalViews)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Videos</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats.videosCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Joined</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats.joinDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {/* Branding Tab */}
              {activeTab === 'branding' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Channel Branding</h2>

                  {/* Channel Art */}
                  <div className="mb-8">
                    <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Channel Art
                    </div>
                    <div className="relative">
                      <img
                        src={branding.channelArt}
                        alt="Channel Art"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                      <button
                        onClick={() => {
                          // Open file picker for channel art
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              // Handle file upload
                            }
                          };
                          input.click();
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-lg opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <PhotoIcon className="w-8 h-8 mr-2" />
                        Change Channel Art
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Recommended size: 2560 x 1440 pixels. Max file size: 6MB.
                    </p>
                  </div>

                  {/* Profile Picture */}
                  <div className="mb-8">
                    <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Profile Picture
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={branding.profilePicture}
                          alt="Profile"
                          className="w-24 h-24 rounded-full border border-gray-200 dark:border-gray-700"
                        />
                        <button
                          onClick={() => {
                            // Open file picker for profile picture
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                // Handle file upload
                              }
                            };
                            input.click();
                          }}
                          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full opacity-0 hover:opacity-100 transition-opacity"
                          title="Change profile picture"
                        >
                          <PhotoIcon className="w-6 h-6" />
                        </button>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Recommended size: 800 x 800 pixels
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Your profile picture will appear across YouTube
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Watermark */}
                  <div>
                    <div id="video-watermark-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Video Watermark
                    </div>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Upload a watermark to appear on your videos
                      </p>
                      <button
                        onClick={() => {
                          // Open file picker for watermark
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              // Handle file upload
                            }
                          };
                          input.click();
                        }}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                        aria-labelledby="video-watermark-label"
                      >
                        Choose File
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Layout Tab */}
              {activeTab === 'layout' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Channel Layout</h2>

                  <div className="space-y-6">
                    <div>
                      <div id="layout-style-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Layout Style
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="radiogroup" aria-labelledby="layout-style-label">
                        {[
                          { id: 'default', name: 'Default', description: 'Standard YouTube layout' },
                          { id: 'compact', name: 'Compact', description: 'More videos visible' },
                          { id: 'showcase', name: 'Showcase', description: 'Highlight featured content' },
                        ].map((layout) => (
                          <button
                            key={layout.id}
                            onClick={() => handleInputChange('channelLayout', layout.id)}
                            className={`p-4 border rounded-lg text-left transition-colors ${
                              branding.channelLayout === layout.id
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                            role="radio"
                            aria-checked={branding.channelLayout === layout.id}
                          >
                            <h3 className="font-medium text-gray-900 dark:text-white">{layout.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{layout.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="end-screen-template" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Screen Template
                      </label>
                      <select
                        id="end-screen-template"
                        value={branding.endScreenTemplate}
                        onChange={(e) => handleInputChange('endScreenTemplate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="default">Default Template</option>
                        <option value="subscribe">Subscribe Focus</option>
                        <option value="playlist">Playlist Promotion</option>
                        <option value="custom">Custom Template</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Info Tab */}
              {activeTab === 'info' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Basic Information</h2>

                  <div className="space-y-6">
                    <div>
                      <label htmlFor="channel-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Channel Name
                      </label>
                      <input
                        type="text"
                        id="channel-name"
                        value={branding.channelName}
                        onChange={(e) => handleInputChange('channelName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter your channel name"
                      />
                    </div>

                    <div>
                      <label htmlFor="channel-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Channel Description
                      </label>
                      <textarea
                        id="channel-description"
                        value={branding.channelDescription}
                        onChange={(e) => handleInputChange('channelDescription', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Describe your channel..."
                      />
                    </div>

                    <div>
                      <label htmlFor="channel-keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Channel Keywords
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {branding.channelKeywords.map((keyword: any) => (
                          <span
                            key={keyword}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                          >
                            {keyword}
                            <button
                              onClick={() => handleKeywordRemove(keyword)}
                              className="ml-2 text-red-600 hover:text-red-800"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        id="channel-keywords"
                        placeholder="Add a keyword and press Enter"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleKeywordAdd(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>

                    <div>
                      <div id="social-links-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Social Links
                      </div>
                      <div className="space-y-4" aria-labelledby="social-links-label">
                        {Object.entries(branding.socialLinks).map(([platform, url]) => (
                          <div key={platform}>
                            <label htmlFor={`${platform}-link`} className="block text-sm text-gray-600 dark:text-gray-400 mb-1 capitalize">
                              {platform}
                            </label>
                            <input
                              type="url"
                              id={`${platform}-link`}
                              value={url}
                              onChange={(e) => handleSocialLinkChange(platform as keyof ChannelBranding['socialLinks'], e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder={`Your ${platform} URL`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Featured Content Tab */}
              {activeTab === 'featured' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Featured Content</h2>

                  <div className="space-y-6">
                    <div>
                      <label htmlFor="channel-trailer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Channel Trailer
                      </label>
                      <input
                        type="text"
                        id="channel-trailer"
                        value={branding.channelTrailer}
                        onChange={(e) => handleInputChange('channelTrailer', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Video ID or URL for your channel trailer"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        This video will be shown to new visitors to introduce your channel
                      </p>
                    </div>

                    <div>
                      <div id="featured-channels-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Featured Channels
                      </div>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <GlobeAltIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Add channels you want to feature on your channel page
                        </p>
                        <button
                          onClick={() => {                          }}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                          aria-labelledby="featured-channels-label"
                        >
                          Add Featured Channels
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelCustomizationPage;
