import React, { useState, FC } from 'react';
// Import statements fixed

interface Platform {
 id: string;
 name: string;
 enabled: boolean;
 streamKey?: string;
}

interface MultiplatformStreamingProps {
 onPlatformToggle?: (platformId: any,
 enabled: any) => void
}

export const MultiplatformStreaming: React.FC<MultiplatformStreamingProps> = ({
 onPlatformToggle }) => {
 const [platforms, setPlatforms] = useState<Platform[]>([
 { id: 'youtube',
 name: 'YouTube', enabled: true },
 { id: 'twitch',
 name: 'Twitch', enabled: false },
 { id: 'facebook',
 name: 'Facebook', enabled: false },
 { id: 'twitter',
 name: 'Twitter', enabled: false }]);

 const togglePlatform: any = (platformId: any) => {
 setPlatforms(prev =>
 prev.map((platform: any) => {
 if (platform.id === platformId) {
 const enabled = !platform.enabled;
 onPlatformToggle?.(platformId, enabled);
 return { ...platform as any, enabled }
 return platform;
 })
 );
 };

 return (
 <div className='space-y-4'>
 <h3 className='text-lg font-semibold'>Multiplatform Streaming</h3>

 <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
 {platforms.map((platform: any) => (
 <div key={platform.id} className='border rounded-lg p-4'>
 <div className='flex items-center justify-between mb-2'>
 <span className='font-medium'>{platform.name}</span>
 <button />
// FIXED:  onClick={() => togglePlatform(platform.id)}
// FIXED:  className={`px-3 py-1 rounded ${
 platform.enabled
 ? 'bg-green-500 text-white'
 : 'bg-gray-200 text-gray-700'
 }`}
 >
 {platform.enabled ? 'Enabled' : 'Disabled'}
// FIXED:  </button>
// FIXED:  </div>

 {platform.enabled && (
 <input
// FIXED:  type='text'
// FIXED:  placeholder='Stream key'
// FIXED:  className='w-full px-3 py-2 border rounded'
// FIXED:  value={platform.streamKey || ''} />
// FIXED:  onChange={e => {
 setPlatforms(prev =>
 prev.map((p: any) =>
 p.id === platform.id
 ? { ...p as any, streamKey: e.target.value }
 : p
 )
 );
 }
 />
 )}
// FIXED:  </div>
 ))}
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default MultiplatformStreaming;
