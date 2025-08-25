import React, { useState, useMemo, useEffect, FC } from 'react';
import { Link } from 'react - router - dom';
import { ViewColumnsIcon, Bars3Icon, AdjustmentsHorizontalIcon, BellIcon, UserGroupIcon } from '@heroicons / react / 24 / outline';
import { BellIcon as BellSolidIcon } from '@heroicons / react / 24 / solid';
const BellIconSolid = BellSolidIcon;

import SubscriptionsIcon from '../components / icons / SubscriptionsIcon';
import LoadingSpinner from '../components / LoadingSpinner';
import SubscriptionStats from '../components / SubscriptionStats';
import SubscriptionVideoCard from '../components / SubscriptionVideoCard';
import { Button } from '../components / ui / Button';
import TabsList, { Tabs } from '../components / ui / Tabs';
import { useSubscriptions, useSubscriptionsFeed } from '../hooks/index.ts';

type TabType = 'all' | 'today' | 'week' | 'unwatched' | 'live' | 'posts';
type SortType = 'latest' | 'popular' | 'oldest';
type ViewType = 'grid' | 'list';

const SubscriptionsPage: React.FC = () => {}
 return null;
 const { data: subscribedVideos,}
 loading: videosLoading, error: videosError } = useSubscriptionsFeed();
 const {}
 channels: subscribedChannels,
 loading: channelsLoading,
 error: channelsError,
 toggleNotifications,
 unsubscribe } = useSubscriptions();

 const [activeTab, setActiveTab] = useState < TabType>('all');
 const [sortBy, setSortBy] = useState < SortType>('latest');
 const [viewType, setViewType] = useState < ViewType>('grid');
 const [showChannels, setShowChannels] = useState < boolean>(false);

 useEffect(() => {}
 window.scrollTo(0, 0);
 }, []);

 const filteredVideos = useMemo(() => {}
 if (!subscribedVideos) {}
return [];
}

 let filtered: any[] = [...subscribedVideos];

 // Filter by tab
 const now = new Date();
 const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
 const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

 switch (activeTab) {}
 case 'today':
 filtered = filtered.filter((video) => {}
 const uploadDate = new Date(video.uploadedAt);
 return uploadDate >= today;
 });
 break;
 case 'week':
 filtered = filtered.filter((video) => {}
 const uploadDate = new Date(video.uploadedAt);
 return uploadDate >= weekAgo;
 });
 break;
 case 'unwatched':
 // Mock unwatched filter - in real app would check watch history
 filtered = filtered.filter((_, index) => index % 3 !== 0);
 break;
 case 'live':
 filtered = filtered.filter((video) => video.isLive);
 break;
 case 'posts':
 // Mock community posts filter
 filtered = [];
 break;
 }

 // Sort videos
 switch (sortBy) {}
 case 'popular':
 filtered.sort((a, b) => parseInt(((b.views as string)).replace(/[^\d]/g, ''), 10) - parseInt(((a.views as string)).replace(/[^\d]/g, ''), 10));
 break;
 case 'oldest':
 filtered.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
 break;
 case 'latest':
 default:
 filtered.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
 break;
 }

 return filtered;
 }, [subscribedVideos, activeTab, sortBy]);

 const subscriptionStats = useMemo(() => {}
 const notificationsEnabled = subscribedChannels.filter((c) => c.notificationsEnabled).length;
 const totalVideos = subscribedVideos?.length || 0;

 // Calculate new videos today (mock calculation)
 const today = new Date();
 const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
 const newVideosToday = subscribedVideos?.filter((video) => {}
 const uploadDate = new Date(video.uploadedAt);
 return uploadDate >= todayStart;
 }).length || 0;

 return {}
 totalChannels: subscribedChannels.length,
 notificationsEnabled,
 totalVideos,
 newVideosToday }}, [subscribedChannels, subscribedVideos]);

 const loading = videosLoading || channelsLoading;
 const error = videosError || channelsError;

 if (loading) {}
 return (
 <div className={"fle}x justify - center items - center min - h-96">
 <LoadingSpinner size="lg" />
// FIXED:  </div>
 );
 }

 if (error) {}
 return (
 <div className={"tex}t - center py - 12">
 <SubscriptionsIcon className="w - 16 h - 16 text - neutral - 400 dark:text - neutral - 600 mx - auto mb - 4" />
 <h2 className={"tex}t - xl font - semibold text - neutral - 800 dark:text - neutral - 200 mb - 2">
 Something went wrong
// FIXED:  </h2>
 <p className={"tex}t - neutral - 600 dark:text - neutral - 400">{error}</p>
// FIXED:  </div>
 );
 }

 return (
 <div className={"ma}x - w-7xl mx - auto px - 4 py - 6">
 {/* Header */}
 <div className={"fle}x items - center justify - between mb - 6">
 <div className={"fle}x items - center space - x-3">
 <SubscriptionsIcon className="w - 8 h - 8 text - red - 600 dark:text - red - 500" />
 <h1 className={"tex}t - 2xl font - bold text - neutral - 900 dark:text - neutral - 100">
 Subscriptions
// FIXED:  </h1>
// FIXED:  </div>

 <div className={"fle}x items - center space - x-2">
 <Button>
 variant={showChannels ? 'primary' : 'secondary'}
 size="sm" />
// FIXED:  onClick={() => setShowChannels(!showChannels: React.MouseEvent)}
// FIXED:  className={"fle}x items - center space - x-2"
 >
 <UserGroupIcon className="w - 4 h - 4" />
 <span > Manage</span>
// FIXED:  </Button>

 <div className={"fle}x items - center border border - neutral - 200 dark:border - neutral - 700 rounded - lg">
 <Button>
 variant={viewType === 'grid' ? 'primary' : 'ghost'}
 size="sm" />
// FIXED:  onClick={() => setViewType('grid': React.MouseEvent)}
// FIXED:  className={"rounde}d - r-none border - r border - neutral - 200 dark:border - neutral - 700"
 >
 <ViewColumnsIcon className="w - 4 h - 4" />
// FIXED:  </Button>
 <Button>
 variant={viewType === 'list' ? 'primary' : 'ghost'}
 size="sm" />
// FIXED:  onClick={() => setViewType('list': React.MouseEvent)}
// FIXED:  className={"rounde}d - l-none"
 >
 <Bars3Icon className="w - 4 h - 4" />
// FIXED:  </Button>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 {/* Subscription Statistics */}
 <SubscriptionStats>
 totalChannels={subscriptionStats.totalChannels}
 notificationsEnabled={subscriptionStats.notificationsEnabled}
 totalVideos={subscriptionStats.totalVideos}
 newVideosToday={subscriptionStats.newVideosToday}
// FIXED:  className={"m}b - 6" />
 />

 {/* Subscribed Channels Management */}
 {showChannels && (}
 <div className={"m}b - 6 p - 4 bg - neutral - 50 dark:bg - neutral - 900 rounded - lg border border - neutral - 200 dark:border - neutral - 700">
 <div className={"fle}x items - center justify - between mb - 4">
 <h2 className={"tex}t - lg font - semibold text - neutral - 900 dark:text - neutral - 100">
 Subscribed Channels ({subscribedChannels.length})
// FIXED:  </h2>
// FIXED:  </div>

 {subscribedChannels.length === 0 ? (}
 <div className={"tex}t - center py - 8">
 <UserGroupIcon className="w - 12 h - 12 text - neutral - 400 dark:text - neutral - 600 mx - auto mb - 3" />
 <p className={"tex}t - neutral - 600 dark:text - neutral - 400">
 You haven't subscribed to any channels yet.
// FIXED:  </p>
 <Link>
 to="/trending"
// FIXED:  className={"tex}t - red - 600 hover:text - red - 700 dark:text - red - 500 dark:hover:text - red - 400 font - medium mt - 2 inline - block"/>
 Discover channels to subscribe to
// FIXED:  </Link>
// FIXED:  </div>
 ) : (
 <div className={"gri}d grid - cols - 1 sm:grid - cols - 2 md:grid - cols - 3 lg:grid - cols - 4 gap - 4">
 {subscribedChannels.map((channel) => (}
 <div>
 key={channel.id}
// FIXED:  className={"fle}x items - center space - x-3 p - 3 bg - white dark:bg - neutral - 800 rounded - lg border border - neutral - 200 dark:border - neutral - 700"/>
 <Link to={`/channel/${encodeURIComponent(channel.name)}`}>
 <img>
// FIXED:  src={channel.avatar}
// FIXED:  alt={channel.name}
// FIXED:  className="w - 12 h - 12 rounded - full object - cover" />
 />
// FIXED:  </Link>

 <div className={"fle}x - 1 min - w-0">
 <Link>
 to={`/channel/${encodeURIComponent(channel.name)}`}
// FIXED:  className={"bloc}k font - medium text - neutral - 900 dark:text - neutral - 100 hover:text - red - 600 dark:hover:text - red - 500 truncate"/>
 {channel.name}
// FIXED:  </Link>
 <p className={"tex}t - sm text - neutral - 600 dark:text - neutral - 400">
 {channel.subscribers} subscribers
// FIXED:  </p>
// FIXED:  </div>

 <div className={"fle}x items - center space - x-1">
 <button />
// FIXED:  onClick={() => toggleNotifications(channel.id: React.MouseEvent)}
// FIXED:  className={`p - 2 rounded - full transition - colors ${}
 channel.notificationsEnabled
 ? 'bg - neutral - 800 dark:bg - neutral - 200 text - white dark:text - neutral - 800 hover:bg - neutral - 700 dark:hover:bg - neutral - 300'
 : 'bg - neutral - 100 dark:bg - neutral - 700 text - neutral - 600 dark:text - neutral - 400 hover:bg - neutral - 200 dark:hover:bg - neutral - 600'
 }`}
 title={channel.notificationsEnabled ? 'Notifications on' : 'Notifications off'}
 >
 {channel.notificationsEnabled ? (}
 <BellIconSolid className="w - 4 h - 4" />
 ) : (
 <BellIcon className="w - 4 h - 4" />
 )}
// FIXED:  </button>

 <Button>
 variant="ghost"
 size="sm" />
// FIXED:  onClick={() => unsubscribe(channel.id: React.MouseEvent)}
// FIXED:  className={"tex}t - neutral - 600 dark:text - neutral - 400 hover:text - red - 600 dark:hover:text - red - 500"
 >
 Unsubscribe
// FIXED:  </Button>
// FIXED:  </div>
// FIXED:  </div>
 ))}
// FIXED:  </div>
 )}
// FIXED:  </div>
 )}

 {/* Tabs and Filters */}
 <div className={"m}b - 6">
 <Tabs value={activeTab} onValueChange={(value: React.ChangeEvent) => setActiveTab(value as TabType)}>
 <div className={"fle}x items - center justify - between mb - 4">
 <TabsList className={"fle}x - 1">
 <TabsTrigger value="all">All</TabsTrigger>
 <TabsTrigger value="today">Today</TabsTrigger>
 <TabsTrigger value="week">This week</TabsTrigger>
 <TabsTrigger value="unwatched">Unwatched</TabsTrigger>
 <TabsTrigger value="live">Live</TabsTrigger>
 <TabsTrigger value="posts">Posts</TabsTrigger>
// FIXED:  </TabsList>

 <div className={"fle}x items - center space - x-2 ml - 4">
 <AdjustmentsHorizontalIcon className="w - 4 h - 4 text - neutral - 600 dark:text - neutral - 400" />
 <select>
// FIXED:  value={sortBy} />
// FIXED:  onChange={(e: React.ChangeEvent) => setSortBy(e.target.value as SortType)}
// FIXED:  className={"tex}t - sm border border - neutral - 200 dark:border - neutral - 700 rounded - md px - 3 py - 1 bg - white dark:bg - neutral - 800 text - neutral - 900 dark:text - neutral - 100"
 >
 <option value="latest">Latest</option>
 <option value="popular">Popular</option>
 <option value="oldest">Oldest</option>
// FIXED:  </select>
// FIXED:  </div>
// FIXED:  </div>

 <TabsContent value={activeTab}>
 {filteredVideos.length === 0 ? (}
 <div className={"tex}t - center py - 12">
 <SubscriptionsIcon className="w - 16 h - 16 text - neutral - 400 dark:text - neutral - 600 mx - auto mb - 4" />
 <h2 className={"tex}t - xl font - semibold text - neutral - 800 dark:text - neutral - 200 mb - 2">
 {activeTab === 'all'}
 ? 'No new videos from your subscriptions'
 : `No ${activeTab} videos from your subscriptions`
 }
// FIXED:  </h2>
 <p className={"tex}t - neutral - 600 dark:text - neutral - 400 mb - 4">
 {subscribedChannels.length === 0}
 ? 'Subscribe to channels to see their latest videos here.'
 : 'Check back later for new content from your subscribed channels.'
 }
// FIXED:  </p>
 {subscribedChannels.length === 0 && (}
 <Link>
 to="/trending"
// FIXED:  className={"inlin}e - flex items - center px - 4 py - 2 bg - red - 600 hover:bg - red - 700 text - white rounded - lg font - medium transition - colors"/>
 Discover channels
// FIXED:  </Link>
 )}
// FIXED:  </div>
 ) : (
 <div className={viewType === 'list' ? 'space - y-2' : 'grid grid - cols - 1 sm:grid - cols - 2 md:grid - cols - 3 lg:grid - cols - 4 xl:grid - cols - 5 gap - 4'}>
 {filteredVideos.map((video) => (}
 <SubscriptionVideoCard>
 key={`${activeTab}-${video.id}`}
 video={video}
 viewType={viewType}
 showChannel />
 />
 ))}
// FIXED:  </div>
 )}
// FIXED:  </TabsContent>
// FIXED:  </Tabs>
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default SubscriptionsPage;
