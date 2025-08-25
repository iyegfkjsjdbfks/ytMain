import React from 'react';

export interface ChannelHeaderProps {
  channel: {
    id: string;
    name: string;
    avatar: string;
    bannerUrl?: string;
    description?: string;
    subscriberCount: number;
  };
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
  const formatSubscriberCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="w-full">
      {/* Banner */}
      {channel.bannerUrl &&& (
        <div className="h-32 sm:h-48 md:h-64 bg-gray-200 rounded-lg mb-4 overflow-hidden">
          <img />
            src={channel.bannerUrl}
            alt={`${channel.name} banner`}
            className="w-full h-full object-cover"
 /  />
        </div>
      )}

      {/* Channel info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <img />
          src={channel.avatar}
          alt={`${channel.name} avatar`}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full"
 /  />
        
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {channel.name}
          </h1>
          
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-3">
            <span>{formatSubscriberCount(channel.subscriberCount)} subscribers</span>
            <span>•</span>
            <span>{videoCount} videos</span>
          </div>
          
          {channel.description && (
            <p className="text-gray-600 text-sm line-clamp-2">
              {channel.description}
            </p>
          )}
        </div>

        <button
          onClick={onSubscribeToggle}
          className={`
            px-6 py-2 rounded-full font-medium transition-colors
            ${isSubscribed
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-red-600 text-white hover:bg-red-700'
            }
          `}
        >
          {isSubscribed ? 'Subscribed' : 'Subscribe'}
        </button>
      </div>
    </div>
  );
};

export default ChannelHeader;
