import type React from 'react';
import { useState, useEffect } from 'react';

import {
  GlobeAltIcon,
  ExclamationCircleIcon,
  SignalIcon,
  EyeIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolidIcon,
} from '@heroicons/react/24/solid';

import type { StreamPlatform } from '../../../types/livestream';

interface MultiplatformStreamingProps {
  isStreaming: boolean;
  className?: string;
}

interface PlatformConfig {
  name: StreamPlatform['name'];
  displayName: string;
  icon: string;
  color: string;
  maxBitrate: number;
  supportedQualities: string[];
  requiresStreamKey: boolean;
}

const MultiplatformStreaming: React.FC<MultiplatformStreamingProps> = ({
  isStreaming,
  className = '',
}) => {
  const [platforms, setPlatforms] = useState<StreamPlatform[]>([]);
  const [platformStats, setPlatformStats] = useState<Record<string, {
    viewers: number;
    quality: string;
    bitrate: number;
    status: 'connected' | 'connecting' | 'error' | 'disconnected';
  }>>({});
  const [showSettings, setShowSettings] = useState<string | null>(null);

  const platformConfigs: PlatformConfig[] = [
    {
      name: 'youtube',
      displayName: 'YouTube',
      icon: '🔴',
      color: 'bg-red-500',
      maxBitrate: 9000,
      supportedQualities: ['720p', '1080p', '1440p', '4k'],
      requiresStreamKey: true,
    },
    {
      name: 'twitch',
      displayName: 'Twitch',
      icon: '💜',
      color: 'bg-purple-500',
      maxBitrate: 6000,
      supportedQualities: ['720p', '1080p'],
      requiresStreamKey: true,
    },
    {
      name: 'facebook',
      displayName: 'Facebook Live',
      icon: '📘',
      color: 'bg-blue-600',
      maxBitrate: 4000,
      supportedQualities: ['720p', '1080p'],
      requiresStreamKey: true,
    },
    {
      name: 'twitter',
      displayName: 'Twitter Spaces',
      icon: '🐦',
      color: 'bg-sky-500',
      maxBitrate: 2500,
      supportedQualities: ['720p'],
      requiresStreamKey: false,
    },
  ];

  useEffect(() => {
    // Load platform configurations
    const initialPlatforms: StreamPlatform[] = platformConfigs.map(config => ({
      name: config.name,
      enabled: false,
      streamKey: '',
      settings: {
        quality: '1080p',
        bitrate: 3000,
        autoReconnect: true,
      },
    }));
    setPlatforms(initialPlatforms);

    // Initialize platform stats
    const initialStats = platformConfigs.reduce((acc, config) => {
      acc[config.name] = {
        viewers: 0,
        quality: '1080p',
        bitrate: 3000,
        status: 'disconnected',
      };
      return acc;
    }, {} as typeof platformStats);
    setPlatformStats(initialStats);

    // Simulate platform updates
    const interval = setInterval(() => {
      if (isStreaming) {
        setPlatformStats(prev => {
          const updated = { ...prev };
          platforms.forEach(platform => {
            if (platform.enabled && updated[platform.name]) {
              const currentStats = updated[platform.name];
              if (currentStats) {
                updated[platform.name] = {
                  viewers: Math.max(0, currentStats.viewers + Math.floor(Math.random() * 10) - 3),
                  quality: currentStats.quality,
                  bitrate: currentStats.bitrate,
                  status: Math.random() > 0.1 ? 'connected' : 'error',
                };
              }
            }
          });
          return updated;
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isStreaming, platforms]);

  const handleTogglePlatform = (platformName: StreamPlatform['name']) => {
    setPlatforms(prev => prev.map(platform => {
      if (platform.name === platformName) {
        const enabled = !platform.enabled;

        // Update platform stats when toggling
        setPlatformStats(prevStats => {
          const prevStat = prevStats[platformName];
          return {
            ...prevStats,
            [platformName]: {
              viewers: enabled ? Math.floor(Math.random() * 100) : 0,
              quality: prevStat?.quality || '1080p',
              bitrate: prevStat?.bitrate || 3000,
              status: enabled ? 'connecting' : 'disconnected',
            },
          };
        });

        return { ...platform, enabled };
      }
      return platform;
    }));
  };

  const handleUpdatePlatformSettings = (
    platformName: StreamPlatform['name'],
    settings: Partial<StreamPlatform['settings']>,
  ) => {
    setPlatforms(prev => prev.map(platform => {
      if (platform.name === platformName) {
        return {
          ...platform,
          settings: { ...platform.settings, ...settings },
        };
      }
      return platform;
    }));
  };

  const handleUpdateStreamKey = (platformName: StreamPlatform['name'], streamKey: string) => {
    setPlatforms(prev => prev.map(platform => {
      if (platform.name === platformName) {
        return { ...platform, streamKey };
      }
      return platform;
    }));
  };

  const getTotalViewers = () => {
    return Object.values(platformStats).reduce((total, stats) => total + stats.viewers, 0);
  };

  const getConnectedPlatforms = () => {
    return platforms.filter(p => p.enabled && platformStats[p.name]?.status === 'connected').length;
  };

  const getPlatformConfig = (name: StreamPlatform['name']) => {
    return platformConfigs.find(config => config.name === name)!;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'connecting': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircleSolidIcon className="w-4 h-4 text-green-600" />;
      case 'connecting': return <SignalIcon className="w-4 h-4 text-yellow-600 animate-pulse" />;
      case 'error': return <ExclamationCircleIcon className="w-4 h-4 text-red-600" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <GlobeAltIcon className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Multi-Platform Streaming</span>
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <EyeIcon className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{getTotalViewers()} total viewers</span>
          </div>
          <div className="flex items-center space-x-1">
            <SignalIcon className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">
              {getConnectedPlatforms()}/{platforms.filter(p => p.enabled).length} connected
            </span>
          </div>
        </div>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((platform) => {
          const config = getPlatformConfig(platform.name);
          const stats = platformStats[platform.name];

          if (!stats) {
return null;
}

          return (
            <div
              key={platform.name}
              className={`p-4 border rounded-lg transition-all ${
                platform.enabled ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{config.displayName}</h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(stats.status)}
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(stats.status)}`}>
                        {stats.status.charAt(0).toUpperCase() + stats.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowSettings(showSettings === platform.name ? null : platform.name)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <Cog6ToothIcon className="w-4 h-4" />
                  </button>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={platform.enabled}
                      onChange={() => handleTogglePlatform(platform.name)}
                      disabled={isStreaming}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                      isStreaming ? 'opacity-50 cursor-not-allowed' : ''
                    }`} />
                  </label>
                </div>
              </div>

              {platform.enabled && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Viewers:</span>
                    <span className="font-medium">{stats.viewers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Quality:</span>
                    <span className="font-medium">{stats.quality}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Bitrate:</span>
                    <span className="font-medium">{stats.bitrate} kbps</span>
                  </div>
                </div>
              )}

              {/* Platform Settings */}
              {showSettings === platform.name && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  {config.requiresStreamKey && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stream Key
                      </label>
                      <input
                        type="password"
                        value={platform.streamKey || ''}
                        onChange={(e) => handleUpdateStreamKey(platform.name, e.target.value)}
                        placeholder="Enter your stream key..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quality
                    </label>
                    <select
                      value={platform.settings?.quality || '1080p'}
                      onChange={(e) => handleUpdatePlatformSettings(platform.name, { quality: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      {config.supportedQualities.map(quality => (
                        <option key={quality} value={quality}>{quality}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bitrate (kbps)
                    </label>
                    <input
                      type="number"
                      value={platform.settings?.bitrate || 3000}
                      onChange={(e) => handleUpdatePlatformSettings(platform.name, { bitrate: parseInt(e.target.value) })}
                      min="1000"
                      max={config.maxBitrate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Max for {config.displayName}: {config.maxBitrate} kbps
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`auto-reconnect-${platform.name}`}
                      checked={platform.settings?.autoReconnect || false}
                      onChange={(e) => handleUpdatePlatformSettings(platform.name, { autoReconnect: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`auto-reconnect-${platform.name}`} className="ml-2 block text-sm text-gray-700">
                      Auto-reconnect on disconnect
                    </label>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      {platforms.some(p => p.enabled) && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{getTotalViewers()}</div>
              <div className="text-sm text-green-600">Total Viewers</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{getConnectedPlatforms()}</div>
              <div className="text-sm text-blue-600">Connected Platforms</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">{platforms.filter(p => p.enabled).length}</div>
              <div className="text-sm text-purple-600">Enabled Platforms</div>
            </div>
          </div>
        </div>
      )}

      {!platforms.some(p => p.enabled) && (
        <div className="text-center py-8 text-gray-500">
          <GlobeAltIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No platforms enabled</p>
          <p className="text-sm mt-1">Enable platforms to start multi-streaming!</p>
        </div>
      )}
    </div>
  );
};

export default MultiplatformStreaming;
