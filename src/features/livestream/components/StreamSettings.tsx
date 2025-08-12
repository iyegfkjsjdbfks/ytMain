import React, { useState, FC } from 'react';
// Import statements fixed

interface StreamQuality {
  resolution: string;,
  bitrate: number;
  fps: number
}

interface StreamSettingsProps {
  onSettingsChange?: (settings: any) => void
}

export const StreamSettings: React.FC<StreamSettingsProps> = ({
  onSettingsChange }) => {
  const [settings, setSettings] = useState({
    title: '',
          description: '',
    category: 'Gaming',
          privacy: 'public',
    quality: { resolution: '1080p',
          bitrate: 5000, fps: 30 } as StreamQuality,
          enableChat: true,
    enableDonations: false });

  const updateSettings = (newSettings: Partial<typeof settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    onSettingsChange?.(updated);
  };

  return (
    <div className='space-y-6'>
      <h3 className='text-lg font-semibold'>Stream Settings</h3>

      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium mb-1'>Stream Title</label>
          <input
            type='text'
            value={settings.title}
            onChange={e => updateSettings({ title: e.target.value })}
            className='w-full px-3 py-2 border rounded-lg'
            placeholder='Enter stream title'
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-1'>Description</label>
          <textarea
            value={settings.description}
            onChange={e => updateSettings({ description: e.target.value })}
            className='w-full px-3 py-2 border rounded-lg h-24'
            placeholder='Enter stream description'
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-1'>Category</label>
          <select
            value={settings.category}
            onChange={e => updateSettings({ category: e.target.value })}
            className='w-full px-3 py-2 border rounded-lg'
          >
            <option value='Gaming'>Gaming</option>
            <option value='Music'>Music</option>
            <option value='Education'>Education</option>
            <option value='Entertainment'>Entertainment</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium mb-1'>Privacy</label>
          <select
            value={settings.privacy}
            onChange={e => updateSettings({ privacy: e.target.value })}
            className='w-full px-3 py-2 border rounded-lg'
          >
            <option value='public'>Public</option>
            <option value='unlisted'>Unlisted</option>
            <option value='private'>Private</option>
          </select>
        </div>

        <div className='grid grid-cols-3 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Resolution</label>
            <select
              value={settings.quality.resolution}
              onChange={e =>
                updateSettings({
                  quality: { ...settings.quality,
          resolution: e.target.value } })
              }
              className='w-full px-3 py-2 border rounded-lg'
            >
              <option value='720p'>720p</option>
              <option value='1080p'>1080p</option>
              <option value='1440p'>1440p</option>
              <option value='4K'>4K</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>
              Bitrate (kbps)
            </label>
            <input
              type='number'
              value={settings.quality.bitrate}
              onChange={e =>
                updateSettings({
                  quality: {
                    ...settings.quality,
                    bitrate: parseInt(e.target.value) } })
              }
              className='w-full px-3 py-2 border rounded-lg'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>FPS</label>
            <select
              value={settings.quality.fps}
              onChange={e =>
                updateSettings({
                  quality: {
                    ...settings.quality,
                    fps: parseInt(e.target.value) } })
              }
              className='w-full px-3 py-2 border rounded-lg'
            >
              <option value={30}>30</option>
              <option value={60}>60</option>
            </select>
          </div>
        </div>

        <div className='space-y-2'>
          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={settings.enableChat}
              onChange={e => updateSettings({ enableChat: e.target.checked })}
              className='mr-2'
            />
            Enable Live Chat
          </label>

          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={settings.enableDonations}
              onChange={e =>
                updateSettings({ enableDonations: e.target.checked })
              }
              className='mr-2'
            />
            Enable Donations/Super Chat
          </label>
        </div>
      </div>
    </div>
  );
};

export default StreamSettings;

