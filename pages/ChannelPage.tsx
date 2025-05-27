
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Video, Channel, PlaylistSummary, CommunityPost } from '../types';
import { getChannelByName, getVideosByChannelName, getChannelPlaylists, getChannelCommunityPosts } from '../services/mockVideoService';
import VideoCard from '../components/VideoCard';
import UserIcon from '../components/icons/UserIcon'; // Fallback
import BellIcon from '../components/icons/BellIcon'; 
import { ChevronRightIcon, PlayIcon as PlaySolidIcon } from '@heroicons/react/24/solid';
import { LightBulbIcon, CalendarDaysIcon, ChartBarIcon, SignalSlashIcon } from '@heroicons/react/24/outline'; // Added SignalSlashIcon
import { parseRelativeDate } from '../utils/dateUtils'; // Import the utility


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
    { id: 'SHORTS', label: 'Shorts'},
    { id: 'LIVE', label: 'Live'},
    { id: 'PLAYLISTS', label: 'Playlists' },
    { id: 'COMMUNITY', label: 'Community' },
    { id: 'ABOUT', label: 'About' },
  ];

  useEffect(() => {
    const fetchChannelData = async () => {
      if (!channelIdOrName) {
        setError("Channel identifier is missing.");
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
            fetchedCommunityPosts
          ] = await Promise.all([
            getVideosByChannelName(fetchedChannel.name),
            getChannelPlaylists(fetchedChannel.name),
            getChannelCommunityPosts(fetchedChannel.name)
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
        console.error("Error fetching channel data:", err);
        setError("Failed to load channel data. Please try again later.");
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

  const renderHomeTab = () => {
    const popularVideos = [...videos].sort((a,b) => parseInt(b.views.replace(/,/g, '')) - parseInt(a.views.replace(/,/g, ''))).slice(0,5);
    // Sort recent videos correctly using the new utility
    const recentVideos = [...videos]
      .sort((a, b) => parseRelativeDate(b.uploadedAt) - parseRelativeDate(a.uploadedAt))
      .slice(0, 10);
    
    return (
      <div className="space-y-8 pt-4">
        {popularVideos.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Popular Videos</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 md:gap-x-4 gap-y-5 md:gap-y-6">
              {popularVideos.map(video => <VideoCard key={video.id} video={video} />)}
            </div>
          </section>
        )}
        {recentVideos.length > 0 && (
           <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Uploads</h2>
             <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 md:gap-x-4 gap-y-5 md:gap-y-6">
              {recentVideos.map(video => <VideoCard key={video.id} video={video} />)}
            </div>
          </section>
        )}
        {channelPlaylists.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Playlists</h2>
            {renderPlaylistsTab(true)}
          </section>
        )}
      </div>
    );
  };

  const renderVideosTab = (isShorts: boolean = false) => {
    const filteredVideos = videos.filter(v => isShorts ? v.isShort : !v.isShort);
    if (filteredVideos.length > 0) {
      return (
        <div className={`grid grid-cols-1 ${isShorts ? 'xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7' : 'xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'} 2xl:${isShorts ? 'grid-cols-8' : 'grid-cols-5'} gap-x-3 md:gap-x-4 gap-y-5 md:gap-y-6 pt-4`}>
          {filteredVideos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      );
    }
    return <p className="text-neutral-600 dark:text-neutral-400 mt-8 text-center py-10 text-lg">This channel has no {isShorts ? 'Shorts' : 'videos'} yet.</p>;
  };
  
  const renderPlaylistsTab = (isHomePageSlice: boolean = false) => {
    const playlistsToRender = isHomePageSlice ? channelPlaylists.slice(0, 4) : channelPlaylists; // Show fewer on home
     if (playlistsToRender.length > 0) {
      return (
        <div className={`grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${isHomePageSlice ? 'xl:grid-cols-4' : 'xl:grid-cols-5'} gap-x-4 md:gap-x-5 gap-y-5 md:gap-y-6 pt-4`}>
          {playlistsToRender.map(playlist => (
            <Link to={`/playlist/${playlist.id}`} key={playlist.id} className="group block"> {/* Corrected link */}
              <div className="relative aspect-video bg-neutral-200 dark:bg-neutral-700 rounded-xl overflow-hidden">
                <img 
                  src={playlist.thumbnailUrl || 'https://picsum.photos/seed/playlistplaceholder/320/180'} 
                  alt={`Thumbnail for ${playlist.title}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <PlaySolidIcon className="w-12 h-12 text-white" aria-hidden="true" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2.5 py-2 text-white">
                  <p className="text-xs font-semibold">{playlist.videoCount} videos</p>
                </div>
              </div>
              <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-100 mt-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2">{playlist.title}</h3>
            </Link>
          ))}
          {isHomePageSlice && channelPlaylists.length > 4 && (
             <div className="flex items-center justify-center aspect-video bg-neutral-100 dark:bg-neutral-800 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                <button onClick={() => setActiveTab('PLAYLISTS')} className="text-sky-600 dark:text-sky-400 font-medium text-sm">
                    View All Playlists ({channelPlaylists.length})
                </button>
             </div>
          )}
        </div>
      );
    }
    return <p className="text-neutral-600 dark:text-neutral-400 mt-8 text-center py-10 text-lg">This channel has no playlists yet.</p>;
  };
  
  const renderCommunityTab = () => {
    if (channelCommunityPosts.length > 0) {
      return (
        <div className="max-w-2xl mx-auto space-y-6 py-6">
          {channelCommunityPosts.map(post => (
            <div key={post.id} className="bg-white dark:bg-neutral-800/70 p-4 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700/50">
              <div className="flex items-center mb-3">
                <img src={post.channelAvatarUrl} alt={post.channelName} className="w-10 h-10 rounded-full mr-3"/>
                <div>
                  <p className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">{post.channelName}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{post.timestamp}</p>
                </div>
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-200 whitespace-pre-wrap mb-3 leading-relaxed">{post.textContent}</p>
              {post.imageUrl && <img src={post.imageUrl} alt="Community post image" className="rounded-md max-h-96 w-full object-cover my-3 border border-neutral-200 dark:border-neutral-700" />}
              <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 space-x-4">
                <span>{post.likes} Likes</span>
                <span>{post.commentsCount} Comments</span>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return <p className="text-neutral-600 dark:text-neutral-400 mt-8 text-center py-10 text-lg">No community posts yet.</p>;
  };

  const renderAboutTab = () => {
    return (
      <div className="max-w-3xl py-6 text-neutral-800 dark:text-neutral-200 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
        <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">Description</h3>
            <p className="whitespace-pre-line leading-relaxed text-sm mb-6">
            {channel?.channelDescription || "No description available for this channel."}
            </p>
             <Link to="#" className="inline-flex items-center text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 mt-2 text-sm font-medium">
              <span>Report user</span>
              <ChevronRightIcon className="w-4 h-4 ml-1" aria-hidden="true" />
            </Link>
        </div>
        <div className="md:col-span-1 space-y-5">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2 border-b pb-2 border-neutral-300 dark:border-neutral-700">Stats</h3>
            <div className="flex items-center text-sm">
                <CalendarDaysIcon className="w-5 h-5 mr-2.5 text-neutral-500 dark:text-neutral-400 flex-shrink-0" aria-hidden="true" />
                <span>Joined {channel?.joinDate || 'N/A'}</span>
            </div>
             <div className="flex items-center text-sm">
                <ChartBarIcon className="w-5 h-5 mr-2.5 text-neutral-500 dark:text-neutral-400 flex-shrink-0" aria-hidden="true" />
                <span>{channel?.totalViews || '0'} views</span>
            </div>
            {/* Add more stats here if available, like country */}
        </div>
      </div>
    );
  };

  const renderLiveTab = () => {
    return (
      <div className="text-center py-16 text-neutral-600 dark:text-neutral-400 mt-8">
        <SignalSlashIcon className="w-16 h-16 mx-auto mb-4 text-neutral-400 dark:text-neutral-500" />
        <h2 className="text-xl font-semibold mb-2 text-neutral-800 dark:text-neutral-200">This channel isn't live right now</h2>
        <p className="text-sm">Check back later or see if there are any scheduled upcoming streams.</p>
      </div>
    );
  };


  const renderTabContent = () => {
    switch (activeTab) {
      case 'HOME': return renderHomeTab();
      case 'VIDEOS': return renderVideosTab(false);
      case 'SHORTS': return renderVideosTab(true);
      case 'LIVE': return renderLiveTab();
      case 'PLAYLISTS': return renderPlaylistsTab();
      case 'COMMUNITY': return renderCommunityTab();
      case 'ABOUT': return renderAboutTab();
      default:
        // This case should ideally not be hit if all tabs in `tabs` array have a corresponding case.
        return <p className="text-neutral-600 dark:text-neutral-400 mt-8 text-center py-10 text-lg">Content for {tabs.find(t=>t.id === activeTab)?.label || activeTab} is not available yet.</p>;
    }
  };


  if (loading) {
    return (
      <div className="p-4 md:p-0 animate-pulse bg-white dark:bg-neutral-950"> 
        <div className="h-32 sm:h-48 md:h-56 lg:h-64 bg-neutral-200 dark:bg-neutral-700/50"></div> 
        <div className="px-4 md:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-10 sm:-mt-12 md:-mt-16 mb-4 relative z-10">
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-neutral-300 dark:bg-neutral-700 mr-0 sm:mr-5 border-4 border-white dark:border-neutral-950 flex-shrink-0"></div>
              <div className="flex-grow mt-3 sm:mt-0 text-center sm:text-left">
                <div className="h-8 w-48 sm:w-64 bg-neutral-300 dark:bg-neutral-700 rounded mb-2 mx-auto sm:mx-0"></div>
                <div className="h-5 w-32 sm:w-40 bg-neutral-300 dark:bg-neutral-700 rounded mx-auto sm:mx-0"></div>
              </div>
              <div className="h-10 w-32 bg-neutral-300 dark:bg-neutral-700 rounded-full mt-3 sm:mt-0 sm:ml-auto"></div>
            </div>
            <div className="flex border-b border-neutral-300 dark:border-neutral-700 space-x-1 mb-4">
                {Array.from({length: 5}).map((_, i) => (
                    <div key={i} className="h-10 w-24 bg-neutral-200 dark:bg-neutral-700/60 rounded-t-md"></div>
                ))}
            </div>
            <div className="h-6 w-48 bg-neutral-300 dark:bg-neutral-700 rounded mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="bg-white dark:bg-neutral-900 rounded-xl">
                  <div className="aspect-video bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
                  <div className="p-3"><div className="h-4 bg-neutral-300 dark:bg-neutral-700/80 rounded w-5/6 mb-1.5"></div><div className="h-3 bg-neutral-300 dark:bg-neutral-700/80 rounded w-3/4"></div></div>
                </div>
              ))}
            </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-500 dark:text-red-400 text-lg">{error}</div>;
  }

  if (!channel) {
    return <div className="p-6 text-center text-neutral-600 dark:text-neutral-400 text-lg">Channel not found.</div>;
  }

  return (
    <div className="bg-white dark:bg-neutral-950 min-h-full">
      <div className="h-32 sm:h-48 md:h-56 lg:h-64 bg-neutral-200 dark:bg-neutral-700/30">
        <img src={`https://picsum.photos/seed/${channel.id}banner/1200/300`} alt={`${channel.name} banner`} className="w-full h-full object-cover"/>
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
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">@{channel.name.toLowerCase().replace(/\s+/g, '')} &bull; {channel.subscribers} &bull; {videos.length} videos</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-auto flex-shrink-0">
            <button 
              onClick={handleSubscribeToggle}
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

        <div className="border-b border-neutral-300 dark:border-neutral-700/80 mb-1">
          <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto no-scrollbar" aria-label="Channel tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap pb-2.5 pt-1 px-1 border-b-2 text-sm font-medium transition-colors
                  ${activeTab === tab.id
                    ? 'border-neutral-800 dark:border-neutral-50 text-neutral-800 dark:text-neutral-50'
                    : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:border-neutral-400 dark:hover:border-neutral-500'
                  }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.label.toUpperCase()}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      <div className="px-4 md:px-6 lg:px-8 py-1 sm:py-2 md:py-3"> {/* Reduced py for less space */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ChannelPage;
