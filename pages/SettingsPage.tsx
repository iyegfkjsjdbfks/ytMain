
// TODO: Fix import - import type * as React from 'react';
// TODO: Fix import - import {  useState  } from 'react';

// TODO: Fix import - import { Cog8ToothIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
// TODO: Fix import - import { CheckIcon } from '@heroicons/react/24/solid';

import { useTheme } from '../contexts/ThemeContext';

const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const ToggleSetting: React.FC<{
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked) => void;
}> = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex-1">
      <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
        {label}
      </label>
      {description && (
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
          {description}
        </p>
      )}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
        checked ? 'bg-sky-600' : 'bg-neutral-200 dark:bg-neutral-600'
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
  options: string;
  onChange: (value) => void
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
    mentions: true,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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

      <div className="space-y-6">
        <SettingSection title="Appearance">
          <div className="space-y-3">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Choose your preferred theme</p>
            <div className="flex space-x-3">
              <button
                onClick={() => toggleTheme()}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'light'
                    ? 'bg-sky-100 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300'
                    : 'bg-neutral-100 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                }`}
              >
                <SunIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Light</span>
                {theme === 'light' && <CheckIcon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => toggleTheme()}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-sky-100 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300'
                    : 'bg-neutral-100 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                }`}
              >
                <MoonIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Dark</span>
                {theme === 'dark' && <CheckIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </SettingSection>

        <SettingSection title="Playback">
          <ToggleSetting
            label="Autoplay"
            description="Automatically play the next video"
            checked={autoplay}
            onChange={setAutoplay}
          />
          <ToggleSetting
            label="Annotations"
            description="Show video annotations and cards"
            checked={annotations}
            onChange={setAnnotations}
          />
          <ToggleSetting
            label="Captions"
            description="Always show captions"
            checked={captions}
            onChange={setCaptions}
          />
          <SelectSetting
            label="Video Quality"
            value={videoQuality}
            options={['Auto', '144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p']}
            onChange={setVideoQuality}
          />
        </SettingSection>

        <SettingSection title="Privacy">
          <ToggleSetting
            label="Restricted Mode"
            description="Hide potentially mature content"
            checked={restrictedMode}
            onChange={setRestrictedMode}
          />
          <SelectSetting
            label="Location"
            value={location}
            options={['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan', 'Australia']}
            onChange={setLocation}
          />
        </SettingSection>

        <SettingSection title="Language & Region">
          <SelectSetting
            label="Language"
            value={language}
            options={['English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Portuguese']}
            onChange={setLanguage}
          />
        </SettingSection>

        <SettingSection title="Notifications">
          <ToggleSetting
            label="Subscriptions"
            description="Notify me about new videos from my subscriptions"
            checked={notifications.subscriptions}
            onChange={() => handleNotificationChange('subscriptions')}
          />
          <ToggleSetting
            label="Recommended videos"
            description="Notify me about recommended videos"
            checked={notifications.recommendedVideos}
            onChange={() => handleNotificationChange('recommendedVideos')}
          />
          <ToggleSetting
            label="Activity on my channel"
            description="Notify me about comments, likes, and new subscribers"
            checked={notifications.activityOnMyChannel}
            onChange={() => handleNotificationChange('activityOnMyChannel')}
          />
          <ToggleSetting
            label="Replies to my comments"
            description="Notify me when someone replies to my comments"
            checked={notifications.repliesComments}
            onChange={() => handleNotificationChange('repliesComments')}
          />
          <ToggleSetting
            label="Mentions"
            description="Notify me when someone mentions me"
            checked={notifications.mentions}
            onChange={() => handleNotificationChange('mentions')}
          />
        </SettingSection>

        <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Reset Settings</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Reset all settings to their default values
              </p>
            </div>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;