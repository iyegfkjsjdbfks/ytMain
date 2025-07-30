import { useState } from 'react';

import {
  Cog6ToothIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  BellIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

import type { LiveStream } from '../../../types/livestream';

interface StreamSettingsProps {
  stream?: LiveStream;
  onSave: (settings: Partial<LiveStream>) => void;
  onCancel: () => void;
  className?: string;
}

interface QualityPreset {
  name: string;
  quality: string;
  bitrate: number;
  frameRate: number;
  description: string;
}

interface Platform {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  enabled: boolean;
  requiresAuth: boolean;
  maxBitrate?: number;
  supportedQualities: string[];
}

const StreamSettings: React.FC<StreamSettingsProps> = ({
  stream,
  onSave,
  onCancel,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<Partial<LiveStream>>({
    title: '',
    description: '',
    category: 'Gaming',
    tags: [],
    visibility: 'public',
    thumbnailUrl: '',
    settings: {
      enableChat: true,
      enableSuperChat: true,
      enablePolls: true,
      enableQA: true,
      chatMode: 'live',
      slowMode: 0,
      subscribersOnly: false,
      moderationLevel: 'moderate',
      quality: '1080p',
      bitrate: 4500,
      frameRate: 30,
      enableRecording: true,
      enableMultiplatform: false,
      platforms: [{ name: 'youtube', enabled: true }],
    },
    ...stream,
  });

  const qualityPresets: QualityPreset[] = [
    {
      name: '4K Ultra',
      quality: '2160p',
      bitrate: 15000,
      frameRate: 60,
      description: 'Ultra high quality for premium content',
    },
    {
      name: 'Full HD',
      quality: '1080p',
      bitrate: 4500,
      frameRate: 30,
      description: 'High quality streaming (recommended)',
    },
    {
      name: 'HD',
      quality: '720p',
      bitrate: 2500,
      frameRate: 30,
      description: 'Good quality with lower bandwidth',
    },
    {
      name: 'Standard',
      quality: '480p',
      bitrate: 1000,
      frameRate: 30,
      description: 'Standard quality for slower connections',
    },
  ];

  const platforms: Platform[] = [
    {
      id: 'youtube',
      name: 'youtube',
      displayName: 'YouTube',
      icon: '🔴',
      enabled: true,
      requiresAuth: true,
      maxBitrate: 51000,
      supportedQualities: ['2160p', '1440p', '1080p', '720p', '480p'],
    },
    {
      id: 'twitch',
      name: 'twitch',
      displayName: 'Twitch',
      icon: '💜',
      enabled: false,
      requiresAuth: true,
      maxBitrate: 6000,
      supportedQualities: ['1080p', '720p', '480p'],
    },
    {
      id: 'facebook',
      name: 'facebook',
      displayName: 'Facebook Gaming',
      icon: '📘',
      enabled: false,
      requiresAuth: true,
      maxBitrate: 4000,
      supportedQualities: ['1080p', '720p', '480p'],
    },
    {
      id: 'tiktok',
      name: 'tiktok',
      displayName: 'TikTok Live',
      icon: '🎵',
      enabled: false,
      requiresAuth: true,
      maxBitrate: 2000,
      supportedQualities: ['720p', '480p'],
    },
  ];

  const categories = [
    'Gaming',
    'Music',
    'Education',
    'Entertainment',
    'Sports',
    'Technology',
    'Art',
    'Cooking',
    'Travel',
    'Fitness',
    'News',
    'Talk Shows',
    'Other',
  ];

  const moderationLevels = [
    { value: 'strict', label: 'Strict', description: 'Heavy moderation with auto-timeout' },
    { value: 'moderate', label: 'Moderate', description: 'Balanced moderation (recommended)' },
    { value: 'relaxed', label: 'Relaxed', description: 'Light moderation, mostly manual' },
    { value: 'off', label: 'Off', description: 'No automatic moderation' },
  ];

  const tabs = [
    { id: 'general', label: 'General', icon: Cog6ToothIcon },
    { id: 'video', label: 'Video & Audio', icon: VideoCameraIcon },
    { id: 'chat', label: 'Chat & Interaction', icon: ChatBubbleLeftRightIcon },
    { id: 'monetization', label: 'Monetization', icon: CurrencyDollarIcon },
    { id: 'moderation', label: 'Moderation', icon: ShieldCheckIcon },
    { id: 'platforms', label: 'Multi-Platform', icon: GlobeAltIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'scheduling', label: 'Scheduling', icon: ClockIcon },
  ];

  const updateSettings = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (key && !current[key]) {
current[key] = {};
}
        if (key) {
current = current[key];
}
      }

      const finalKey = keys[keys.length - 1];
      if (finalKey) {
current[finalKey] = value;
}
      return newSettings;
    });
  };

  const handleQualityPresetSelect = (preset: QualityPreset) => {
    updateSettings('settings.quality', preset.quality);
    updateSettings('settings.bitrate', preset.bitrate);
    updateSettings('settings.frameRate', preset.frameRate);
  };

  const handlePlatformToggle = (platformId: string) => {
    const currentPlatforms = settings.settings?.platforms || [];
    const platformExists = currentPlatforms.find(p => p.name === platformId);

    if (platformExists) {
      const updatedPlatforms = currentPlatforms.map(p =>
        p.name === platformId ? { ...p, enabled: !p.enabled } : p,
      );
      updateSettings('settings.platforms', updatedPlatforms);
    } else {
      const newPlatform = { name: platformId, enabled: true };
      updateSettings('settings.platforms', [...currentPlatforms, newPlatform]);
    }
  };

  const isPlatformEnabled = (platformId: string) => {
    const platforms = settings.settings?.platforms || [];
    const platform = platforms.find(p => p.name === platformId);
    return platform?.enabled || false;
  };

  const handleSave = () => {
    onSave(settings);
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="stream-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Stream Title *
        </label>
        <input
          id="stream-title"
          type="text"
          value={settings.title || ''}
          onChange={(e) => updateSettings('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your stream title"
        />
      </div>

      <div>
        <label htmlFor="stream-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          id="stream-description"
          value={settings.description || ''}
          onChange={(e) => updateSettings('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe your stream content"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="stream-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            id="stream-category"
            value={settings.category || 'Gaming'}
            onChange={(e) => updateSettings('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="stream-visibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Visibility
          </label>
          <select
            id="stream-visibility"
            value={settings.visibility || 'public'}
            onChange={(e) => updateSettings('visibility', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="public">Public</option>
            <option value="unlisted">Unlisted</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="stream-tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags (comma separated)
        </label>
        <input
          id="stream-tags"
          type="text"
          value={settings.tags?.join(', ') || ''}
          onChange={(e) => updateSettings('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="gaming, live, interactive"
        />
      </div>
    </div>
  );

  const renderVideoTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quality Presets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {qualityPresets.map(preset => (
            <button
              key={preset.name}
              onClick={() => handleQualityPresetSelect(preset)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                settings.settings?.quality === preset.quality
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">{preset.name}</h4>
                {settings.settings?.quality === preset.quality && (
                  <CheckIcon className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{preset.description}</p>
              <div className="text-xs text-gray-500">
                {preset.quality} • {preset.bitrate} kbps • {preset.frameRate} fps
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Resolution
          </label>
          <select
            id="resolution"
            value={settings.settings?.quality || '1080p'}
            onChange={(e) => updateSettings('settings.quality', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="2160p">4K (2160p)</option>
            <option value="1440p">2K (1440p)</option>
            <option value="1080p">Full HD (1080p)</option>
            <option value="720p">HD (720p)</option>
            <option value="480p">SD (480p)</option>
          </select>
        </div>

        <div>
          <label htmlFor="bitrate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bitrate (kbps)
          </label>
          <input
            id="bitrate"
            type="number"
            value={settings.settings?.bitrate || 4500}
            onChange={(e) => updateSettings('settings.bitrate', parseInt(e.target.value, 10))}
            min="500"
            max="50000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="frame-rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Frame Rate (fps)
          </label>
          <select
            id="frame-rate"
            value={settings.settings?.frameRate || 30}
            onChange={(e) => updateSettings('settings.frameRate', parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={24}>24 fps</option>
            <option value={30}>30 fps</option>
            <option value={60}>60 fps</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recording & Archive</h3>

        <label htmlFor="enable-recording" className="flex items-center space-x-3">
          <input
            id="enable-recording"
            type="checkbox"
            checked={settings.settings?.enableRecording || false}
            onChange={(e) => updateSettings('settings.enableRecording', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Enable automatic recording
          </span>
        </label>
      </div>
    </div>
  );

  const renderChatTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Chat Features</h3>

        <label htmlFor="enable-chat" className="flex items-center space-x-3">
          <input
            id="enable-chat"
            type="checkbox"
            checked={settings.settings?.enableChat || false}
            onChange={(e) => updateSettings('settings.enableChat', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Enable live chat
          </span>
        </label>

        <label htmlFor="enable-super-chat" className="flex items-center space-x-3">
          <input
            id="enable-super-chat"
            type="checkbox"
            checked={settings.settings?.enableSuperChat || false}
            onChange={(e) => updateSettings('settings.enableSuperChat', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Enable Super Chat (monetization)
          </span>
        </label>

        <label htmlFor="subscribers-only" className="flex items-center space-x-3">
          <input
            id="subscribers-only"
            type="checkbox"
            checked={settings.settings?.subscribersOnly || false}
            onChange={(e) => updateSettings('settings.subscribersOnly', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Subscribers only chat
          </span>
        </label>
      </div>

      <div>
        <label htmlFor="slow-mode-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Slow Mode (seconds between messages)
        </label>
        <select
          id="slow-mode-select"
          value={settings.settings?.slowMode || 0}
          onChange={(e) => updateSettings('settings.slowMode', parseInt(e.target.value, 10))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={0}>Off</option>
          <option value={5}>5 seconds</option>
          <option value={10}>10 seconds</option>
          <option value={30}>30 seconds</option>
          <option value={60}>1 minute</option>
          <option value={300}>5 minutes</option>
        </select>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Interactive Features</h3>

        <label htmlFor="enable-polls" className="flex items-center space-x-3">
          <input
            id="enable-polls"
            type="checkbox"
            checked={settings.settings?.enablePolls || false}
            onChange={(e) => updateSettings('settings.enablePolls', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Enable live polls
          </span>
        </label>

        <label htmlFor="enable-qa" className="flex items-center space-x-3">
          <input
            id="enable-qa"
            type="checkbox"
            checked={settings.settings?.enableQA || false}
            onChange={(e) => updateSettings('settings.enableQA', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Enable Q&A system
          </span>
        </label>
      </div>
    </div>
  );

  const renderModerationTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Moderation Level</h3>
        <div className="space-y-3">
          {moderationLevels.map(level => (
            <label htmlFor={`moderation-level-${level.value}`} key={level.value} className="flex items-start space-x-3">
              <input
                id={`moderation-level-${level.value}`}
                type="radio"
                name="moderationLevel"
                value={level.value}
                checked={settings.settings?.moderationLevel === level.value}
                onChange={(e) => updateSettings('settings.moderationLevel', e.target.value)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {level.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {level.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPlatformsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Streaming Platforms</h3>
        <div className="space-y-4">
          {platforms.map(platform => (
            <div
              key={platform.id}
              className={`p-4 border rounded-lg ${
                isPlatformEnabled(platform.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{platform.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {platform.displayName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Max bitrate: {platform.maxBitrate?.toLocaleString()} kbps
                    </p>
                  </div>
                </div>

                <label htmlFor={`platform-toggle-${platform.id}`} className="flex items-center space-x-2">
                  <input
                    id={`platform-toggle-${platform.id}`}
                    type="checkbox"
                    checked={isPlatformEnabled(platform.id)}
                    onChange={() => handlePlatformToggle(platform.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Enable
                  </span>
                </label>
              </div>

              {platform.requiresAuth && isPlatformEnabled(platform.id) && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ Authentication required. Connect your {platform.displayName} account in settings.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralTab();
      case 'video': return renderVideoTab();
      case 'chat': return renderChatTab();
      case 'moderation': return renderModerationTab();
      case 'platforms': return renderPlatformsTab();
      default: return <div>Tab content not implemented yet</div>;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {stream ? 'Edit Stream Settings' : 'Stream Settings'}
        </h2>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700">
          <nav className="p-4 space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="p-6">
            {renderTabContent()}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamSettings;