
import * as React from 'react';
import {  useState  } from 'react';
import { Cog8ToothIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../contexts/ThemeContext';

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [autoplay, setAutoplay] = useState(true);
  const [annotations, setAnnotations] = useState(true);
  const [captions, setCaptions] = useState(false);
  const [restrictedMode, setRestrictedMode] = useState(false);
  const [location, setLocation] = useState('United States');
  const [language, setLanguage] = useState('English');
  const [videoQuality, setVideoQuality] = useState('Auto');
  const [notifications, setNotifications] = useState({
    subscriptions: true,
    recommendedVideos: false,
    activityOnMyChannel: true,
    repliesComments: true,
    mentions: true
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 border-b border-neutral-200 dark:border-neutral-700 pb-2">
        {title}
      </h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const ToggleSetting: React.FC<{
    label: string;
    description?: string;
    checked: boolean;
    onChange: () => void
  }> = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200 cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 ${
          checked ? 'bg-sky-600' : 'bg-neutral-300 dark:bg-neutral-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SelectSetting: React.FC<{
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void
  }> = ({ label, value, options, onChange }) => (
    <div className="flex items-center justify-between py-2">
      <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Cog8ToothIcon className="w-6 h-6 text-neutral-600 dark:text-neutral-400 mr-3" />
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            General Settings
          </h2>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Manage your account preferences and application settings
        </p>
      </div>

      <div className="space-y-8">
        <SettingSection title="Appearance">
            <div className="space-y-3">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Choose your preferred theme</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => toggleTheme()}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    theme === 'light'
                      ? 'bg-sky-100 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300'
                      : 'border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <SunIcon className="w-4 h-4" />
                  <span className="text-sm">Light</span>
                  {theme === 'light' && <CheckIcon className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => toggleTheme()}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-sky-100 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300'
                      : 'border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <MoonIcon className="w-4 h-4" />
                  <span className="text-sm">Dark</span>
                  {theme === 'dark' && <CheckIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </SettingSection>

        <SettingSection title="Playback and Performance">
            <ToggleSetting
              label="Autoplay"
              description="Automatically play the next video"
              checked={autoplay}
              onChange={() => setAutoplay(!autoplay)}
            />
            <ToggleSetting
              label="Annotations and in-video notifications"
              description="Show annotations and notifications on videos"
              checked={annotations}
              onChange={() => setAnnotations(!annotations)}
            />
            <ToggleSetting
              label="Always show captions"
              description="Show captions on all videos when available"
              checked={captions}
              onChange={() => setCaptions(!captions)}
            />
            <SelectSetting
              label="Video quality"
              value={videoQuality}
              options={['Auto', '144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p']}
              onChange={setVideoQuality}
            />
        </SettingSection>

        <SettingSection title="General">
            <SelectSetting
              label="Location"
              value={location}
              options={['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Japan', 'Other']}
              onChange={setLocation}
            />
            <SelectSetting
              label="Language"
              value={language}
              options={['English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Portuguese', 'Other']}
              onChange={setLanguage}
            />
            <ToggleSetting
              label="Restricted Mode"
              description="Filter out potentially mature content"
              checked={restrictedMode}
              onChange={() => setRestrictedMode(!restrictedMode)}
            />
        </SettingSection>

        <SettingSection title="Notifications">
            <ToggleSetting
              label="Subscriptions"
              description="Get notified about new videos from channels you subscribe to"
              checked={notifications.subscriptions}
              onChange={() => handleNotificationChange('subscriptions')}
            />
            <ToggleSetting
              label="Recommended videos"
              description="Get notified about videos we think you'll like"
              checked={notifications.recommendedVideos}
              onChange={() => handleNotificationChange('recommendedVideos')}
            />
            <ToggleSetting
              label="Activity on my channel"
              description="Get notified about comments, likes, and new subscribers"
              checked={notifications.activityOnMyChannel}
              onChange={() => handleNotificationChange('activityOnMyChannel')}
            />
            <ToggleSetting
              label="Replies to my comments"
              description="Get notified when someone replies to your comments"
              checked={notifications.repliesComments}
              onChange={() => handleNotificationChange('repliesComments')}
            />
            <ToggleSetting
              label="Mentions"
              description="Get notified when someone mentions you"
              checked={notifications.mentions}
              onChange={() => handleNotificationChange('mentions')}
            />
        </SettingSection>

        <SettingSection title="Privacy">
            <div className="space-y-4">
              <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-2">Watch History</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                  Your watch history helps improve your recommendations and remember where you left off.
                </p>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      // Clear watch history                      if (confirm('Are you sure you want to clear your watch history?')) {
                        // Clear history logic here
                      }
                    }}
                    className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                  >
                    Clear History
                  </button>
                  <button 
                    onClick={() => {
                      // Pause watch history                    }}
                    className="px-3 py-1 text-xs border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors"
                  >
                    Pause History
                  </button>
                </div>
              </div>
              <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-2">Search History</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                  Your search history helps improve your search suggestions.
                </p>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      // Clear search history                      if (confirm('Are you sure you want to clear your search history?')) {
                        // Clear search history logic here
                      }
                    }}
                    className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                  >
                    Clear Search History
                  </button>
                  <button 
                    onClick={() => {
                      // Pause search history                    }}
                    className="px-3 py-1 text-xs border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors"
                  >
                    Pause Search History
                  </button>
                </div>
              </div>
            </div>
        </SettingSection>

        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Settings are saved automatically
                </p>
              </div>
              <button 
                onClick={() => {
                  // Reset all settings to defaults                  if (confirm('Are you sure you want to reset all settings to their default values?')) {
                    // Reset settings logic here
                  }
                }}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Reset to Defaults
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;