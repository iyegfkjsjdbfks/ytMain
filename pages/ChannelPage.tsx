
import type * as React from 'react';
import {  useEffect, useState  } from 'react';

import { useParams } from 'react-router-dom';


import ChannelHeader from '../components/ChannelHeader';
import ChannelTabContent from '../components/ChannelTabContent';
import ChannelTabs from '../components/ChannelTabs';
import ChannelPageSkeleton from '../components/LoadingStates/ChannelPageSkeleton';
import { getChannelByName, getVideosByChannelName, getChannelPlaylists, getChannelCommunityPosts } from '../services/mockVideoService';

import type { Video, Channel, PlaylistSummary, CommunityPost } from '../types';


const ChannelPage: React.FC = () => {
  const { channelIdOrName } = useParams<{ channelIdOrName: string }>();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [channelPlaylists, setChannelPlaylists] = useState<PlaylistSummary[]>([]);
  const [channelCommunityPosts, setChannelCommunityPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('HOME');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const tabs = [
    { id: 'HOME', label: 'Home' },
    { id: 'VIDEOS', label: 'Videos' },
    { id: 'SHORTS', label: 'Shorts' },
    { id: 'LIVE', label: 'Live' },
    { id: 'PLAYLISTS', label: 'Playlists' },
    { id: 'COMMUNITY', label: 'Community' },
    { id: 'ABOUT', label: 'About' },
  ];

  useEffect(() => {
    const fetchChannelData = async () => {
      if (!channelIdOrName) {
        setError('Channel identifier is missing.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      setActiveTab('HOME'); // Reset to home on new channel load
      setIsSubscribed(Math.random() > 0.5);

      try {
        const decodedName = decodeURIComponent(channelIdOrName);
        const fetchedChannel = await getChannelByName(decodedName);

        if (fetchedChannel) {
          setChannel(fetchedChannel);
          // Fetch all data concurrently
          const [
            fetchedVideos,
            fetchedPlaylists,
            fetchedCommunityPosts,
          ] = await Promise.all([
            getVideosByChannelName(fetchedChannel.name),
            getChannelPlaylists(fetchedChannel.name),
            getChannelCommunityPosts(fetchedChannel.name),
          ]);
          setVideos(fetchedVideos);
          setChannelPlaylists(fetchedPlaylists);
          setChannelCommunityPosts(fetchedCommunityPosts);

        } else {
          setError(`Channel "${decodedName}" not found.`);
          setChannel(null);
          setVideos([]);
          setChannelPlaylists([]);
          setChannelCommunityPosts([]);
        }
      } catch (err) {
        console.error('Error fetching channel data:', err);
        setError('Failed to load channel data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
    window.scrollTo(0, 0);
  }, [channelIdOrName]);

  const handleSubscribeToggle = () => {
    setIsSubscribed(prev => !prev);
  };

  if (loading) {
    return <ChannelPageSkeleton />;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500 dark:text-red-400 text-lg">{error}</div>;
  }

  if (!channel) {
    return <div className="p-6 text-center text-neutral-600 dark:text-neutral-400 text-lg">Channel not found.</div>;
  }

  return (
    <div className="bg-white dark:bg-neutral-950 min-h-full">
      <ChannelHeader
        channel={channel}
        videoCount={videos.length}
        isSubscribed={isSubscribed}
        onSubscribeToggle={handleSubscribeToggle}
      />

      <div className="px-4 md:px-6 lg:px-8">
        <ChannelTabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />
      </div>

      <div className="px-4 md:px-6 lg:px-8 py-1 sm:py-2 md:py-3"> {/* Reduced py for less space */}
        <ChannelTabContent
          activeTab={activeTab}
          channel={channel}
          videos={videos}
          playlists={channelPlaylists}
          communityPosts={channelCommunityPosts}
          onPlaylistTabSelect={() => setActiveTab('PLAYLISTS')}
        />
      </div>
    </div>
  );
};

export default ChannelPage;
