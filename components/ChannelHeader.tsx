import type React from 'react';

import BellIcon from './icons/BellIcon';

import type { Channel } from '../types';


interface ChannelHeaderProps {
  channel: Channel;
  videoCount: number;
  isSubscribed: boolean;
  onSubscribeToggle: () => void;
}

const ChannelHeader: React.FC<ChannelHeaderProps> = ({
  channel,
  videoCount,
  isSubscribed,
  onSubscribeToggle,
}) => {
  return (
    <>
      <div className="h-32 sm:h-48 md:h-56 lg:h-64 bg-neutral-200 dark:bg-neutral-700/30">
        <img
          src={`https://picsum.photos/seed/${channel.id}banner/1200/300`}
          alt={`${channel.name} banner`}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="px-4 md:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-10 sm:-mt-12 md:-mt-16 mb-4 sm:mb-6 relative z-10">
          <img
            src={channel.avatarUrl || ''}
            alt={`${channel.name} avatar`}
            onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/default_channel_avatar/160/160')}
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full mr-0 sm:mr-5 object-cover border-4 border-white dark:border-neutral-950 flex-shrink-0 shadow-lg"
          />
          <div className="flex-grow mt-3 sm:mt-0 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-50">{channel.name}</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              @{channel.name.toLowerCase().replace(/\s+/g, '')} &bull; {channel.subscribers} &bull; {videoCount} videos
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-auto flex-shrink-0">
            <button
              onClick={onSubscribeToggle}
              className={`text-sm font-medium px-5 py-2.5 rounded-full transition-colors flex items-center space-x-2
                ${isSubscribed
                  ? 'bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200'
                  : 'bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black'
                }`}
              title={isSubscribed ? `Unsubscribe from ${channel.name}` : `Subscribe to ${channel.name}`}
            >
              <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
              {isSubscribed && <BellIcon className="w-4 h-4"/>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChannelHeader;