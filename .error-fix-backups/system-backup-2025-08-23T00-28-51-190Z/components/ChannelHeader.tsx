import React, { FC } from 'react';
import BellIcon from './icons/BellIcon';

import type { Channel } from '../src/types/core';

interface ChannelHeaderProps {
 channel: Channel;
 videoCount: number;
 isSubscribed: boolean;
 onSubscribeToggle: () => void
}

const ChannelHeader: React.FC<ChannelHeaderProps> = ({
 channel,
 videoCount,
 isSubscribed,
 onSubscribeToggle }) => {
 return (
 <>
 <div className={"h}-32 sm:h-48 md:h-56 lg:h-64 bg-neutral-200 dark:bg-neutral-700/30">
 <img />
 <div className={"px}-4 md:px-6 lg:px-8">
 <div className={"fle}x flex-col sm:flex-row items-center sm:items-end -mt-10 sm:-mt-12 md:-mt-16 mb-4 sm:mb-6 relative z-10">
 <img>
 onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/default_channel_avatar/160/160')}

 />
 <div className={"flex}-grow mt-3 sm:mt-0 text-center sm:text-left">
 <h1 className={"text}-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-50">{((channel.name || channel.title) || channel.title)}</h1>
 <p className={"text}-sm text-neutral-600 dark:text-neutral-400 mt-1">
 @{((channel.name || channel.title) || channel.title).toLowerCase().replace(/\s+/g, '')} &bull; {((channel.subscribers || channel.subscriberCount) || channel.subscriberCount)} &bull; {videoCount} videos


 <div className={"mt}-4 sm:mt-0 sm:ml-auto flex-shrink-0">
 <button />
 ${isSubscribed
 ? 'bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200'
 : 'bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black'
 }`}
 title={isSubscribed ? `Unsubscribe from ${((channel.name || channel.title) || channel.title)}` : `Subscribe to ${((channel.name || channel.title) || channel.title)}`}
 >
 <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
 {isSubscribed && <BellIcon className={"w}-4 h-4"/>}





 );
};

export default ChannelHeader;