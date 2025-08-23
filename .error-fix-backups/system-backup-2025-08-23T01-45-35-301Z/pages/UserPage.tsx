import React, { FC, useState, useEffect } from 'react';
import { useParams } from 'react - router - dom';

import { CheckIcon, BellIcon } from '@heroicons / react / 24 / outline';
import { PlayIcon as PlaySolidIcon, UserIcon as UserSolidIcon } from '@heroicons / react / 24 / solid';
const PlayIconSolid = PlaySolidIcon;
const UserIconSolid = UserSolidIcon;

import VideoCard from '../components / VideoCard';
import { getVideos } from '../services / realVideoService';

import type { Video } from '../types.ts';
import { QueueListIcon } from '@heroicons / react / 24 / outline';

const UserPage: React.FC = () => {}
 return null;
 const { userName } = useParams<{ userName: string }>();
 const [activeTab, setActiveTab] = useState<'videos' | 'playlists' | 'community' | 'about'>('videos');
 const [userVideos, setUserVideos] = useState < Video[]>([]);
 const [loading, setLoading] = useState < boolean>(true);
 const [isSubscribed, setIsSubscribed] = useState < boolean>(false);
 const [subscriberCount, setSubscriberCount] = useState(125000);

 const decodedUserName = decodeURIComponent(userName || 'User');
 const channelHandle: string = `@${decodedUserName.toLowerCase().replace(/\s+/g, '')}`;

 useEffect(() => {}
 const fetchUserVideos = async (): Promise<any> < void> => {}
 setLoading(true);
 try {}
 const allVideos = await getVideos();
 // Filter videos by channel name (mock implementation)
 const filteredVideos = allVideos.filter((video) =>
 video.channelName.toLowerCase().includes(decodedUserName.toLowerCase()) ||
 Math.random() > 0.7, // Random selection for demo
 ).slice(0, 12);
 setUserVideos(filteredVideos);
 } catch (error) {}
 (console as any).error('Failed to fetch user videos:', error);
 } finally {}
 setLoading(false);
 };

 fetchUserVideos();
 }, [decodedUserName]);

 const handleSubscribe = () => {}
 setIsSubscribed(!isSubscribed);
 setSubscriberCount(prev => isSubscribed ? prev - 1 : prev + 1);
 };

 const tabs = [;
 { id: 'videos' as const label: 'Videos', icon: PlayIcon },
 { id: 'playlists' as const label: 'Playlists', icon: QueueListIcon },
 { id: 'community' as const label: 'Community', icon: ChatBubbleLeftRightIcon },
 { id: 'about' as const label: 'About', icon: InformationCircleIcon }];

 const renderTabContent = () => {}
 switch (activeTab as any) {}
 case 'videos':
 return (
 <div>
 {loading ? (}
 <div className="grid grid - cols - 1 sm:grid - cols - 2 md:grid - cols - 3 lg:grid - cols - 4 gap - 4">
 {Array<any>.from({ length: 8 }).map((_, index) => (
 <div key={index} className="bg - neutral - 100 dark:bg - neutral - 800 rounded - lg animate - pulse">
 <div className="aspect - video bg - neutral - 200 dark:bg - neutral - 700 rounded - lg" />
 <div className="p - 3 space - y-2">
 <div className="h - 4 bg - neutral - 200 dark:bg - neutral - 700 rounded" />
 <div className="h - 3 bg - neutral - 200 dark:bg - neutral - 700 rounded w - 3/4" />
// FIXED:  </div>
// FIXED:  </div>
 ))}
// FIXED:  </div>
 ) : userVideos.length > 0 ? (
 <div className="grid grid - cols - 1 sm:grid - cols - 2 md:grid - cols - 3 lg:grid - cols - 4 gap - 4">
 {userVideos.map((video) => (}
 <VideoCard key={video.id} video={video} />
 ))}
// FIXED:  </div>
 ) : (
 <div className="text - center py - 12">
 <PlayIcon className="w - 16 h - 16 text - neutral - 400 mx - auto mb - 4" />
 <p className="text - lg font - medium text - neutral - 600 dark:text - neutral - 400">No videos uploaded yet</p>
 <p className="text - sm text - neutral - 500 dark:text - neutral - 500 mt - 2">Check back later for new content!</p>
// FIXED:  </div>
 )}
// FIXED:  </div>
 );

 case 'playlists':
 return (
 <div className="text - center py - 12">
 <QueueListIcon className="w - 16 h - 16 text - neutral - 400 mx - auto mb - 4" />
 <p className="text - lg font - medium text - neutral - 600 dark:text - neutral - 400">No public playlists</p>
 <p className="text - sm text - neutral - 500 dark:text - neutral - 500 mt - 2">This channel hasn't created any public playlists yet.</p>
// FIXED:  </div>
 );

 case 'community':
 return (
 <div className="text - center py - 12">
 <ChatBubbleLeftRightIcon className="w - 16 h - 16 text - neutral - 400 mx - auto mb - 4" />
 <p className="text - lg font - medium text - neutral - 600 dark:text - neutral - 400">No community posts</p>
 <p className="text - sm text - neutral - 500 dark:text - neutral - 500 mt - 2">This channel hasn't posted to the community tab yet.</p>
// FIXED:  </div>
 );

 case 'about':
 return (
 <div className="max - w-2xl">
 <div className="bg - neutral - 50 dark:bg - neutral - 800 rounded - lg p - 6">
 <h3 className="text - lg font - semibold text - neutral - 900 dark:text - neutral - 100 mb - 4">About {decodedUserName}</h3>
 <div className="space - y-4 text - sm text - neutral - 600 dark:text - neutral - 400">
 <div>
 <span className="font - medium text - neutral - 800 dark:text - neutral - 200">Channel handle:</span> {channelHandle}
// FIXED:  </div>
 <div>
 <span className="font - medium text - neutral - 800 dark:text - neutral - 200">Joined:</span> March 2020
// FIXED:  </div>
 <div>
 <span className="font - medium text - neutral - 800 dark:text - neutral - 200">Total views:</span> 2.5M views
// FIXED:  </div>
 <div>
 <span className="font - medium text - neutral - 800 dark:text - neutral - 200">Description:</span>
 <p className="mt - 2">Welcome to {decodedUserName}'s channel! This is a demo profile showcasing the YTA Studio Aug2 application. In a real implementation, this would contain the channel's actual description and information.</p>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );

 default: return null
 };

 return (
 <div className="bg - white dark:bg - neutral - 950 min - h-screen">
 {/* Channel Header */}
 <div className="bg - gradient - to - r from - sky - 400 to - blue - 500 h - 32 sm:h - 48" />

 <div className="max - w-6xl mx - auto px - 4 sm:px - 6 lg:px - 8">
 {/* Channel Info */}
 <div className="relative -mt - 16 sm:-mt - 24 mb - 8">
 <div className="flex flex - col sm:flex - row items - start sm:items - end space - y-4 sm:space - y-0 sm:space - x-6">
 <div className="w - 32 h - 32 sm:w - 40 sm:h - 40 bg - white dark:bg - neutral - 800 rounded - full flex items - center justify - center ring - 4 ring - white dark:ring - neutral - 900 shadow - lg">
 <UserIcon className="w - 20 h - 20 sm:w - 24 sm:h - 24 text - neutral - 500 dark:text - neutral - 400" />
// FIXED:  </div>

 <div className="flex - 1 min - w-0">
 <h1 className="text - 2xl sm:text - 4xl font - bold text - neutral - 900 dark:text - neutral - 50 mb - 2">
 {decodedUserName}
// FIXED:  </h1>
 <p className="text - neutral - 600 dark:text - neutral - 400 text - sm sm:text - base mb - 2">
 {channelHandle} • {subscriberCount.toLocaleString()} subscribers
// FIXED:  </p>
 <p className="text - neutral - 500 dark:text - neutral - 500 text - sm">
 Content creator and demo channel for YTA Studio Aug2
// FIXED:  </p>
// FIXED:  </div>

 <div className="flex items - center space - x-3">
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => handleSubscribe(e)}
// FIXED:  className={`flex items - center space - x-2 px - 6 py - 2.5 rounded - full font - medium text - sm transition - colors ${}
 isSubscribed
 ? 'bg - neutral - 200 dark:bg - neutral - 700 text - neutral - 800 dark:text - neutral - 200 hover:bg - neutral - 300 dark:hover:bg - neutral - 600'
 : 'bg - red - 600 hover:bg - red - 700 text - white'
 }`}
 >
 {isSubscribed ? (}
 <></>
 <CheckIcon className="w - 4 h - 4" />
 <span > Subscribed</span>
// FIXED:  </>
 ) : (
 <span > Subscribe</span>
 )}
// FIXED:  </button>

 {isSubscribed && (}
 <button />
// FIXED:  onClick={() => {}
 // Toggle notification settings for this channel

 }
// FIXED:  className="p - 2.5 bg - neutral - 200 dark:bg - neutral - 700 hover:bg - neutral - 300 dark:hover:bg - neutral - 600 rounded - full transition - colors"
 title="Notification settings"
 >
 <BellIcon className="w - 5 h - 5 text - neutral - 600 dark:text - neutral - 400" />
// FIXED:  </button>
 )}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 {/* Tabs */}
 <div className="border - b border - neutral - 200 dark:border - neutral - 700 mb - 8">
 <nav className="flex space - x-8 overflow - x-auto">
 {tabs.map((tab) => {}
 const Icon = tab.icon;
 return (
 <button
 key={tab.id} />
// FIXED:  onClick={() => setActiveTab(tab.id: React.MouseEvent)}
// FIXED:  className={`flex items - center space - x-2 py - 4 px - 1 border - b-2 font - medium text - sm whitespace - nowrap transition - colors ${}
 activeTab === tab.id
 ? 'border - red - 500 text - red - 600 dark:text - red - 400'
 : 'border - transparent text - neutral - 500 dark:text - neutral - 400 hover:text - neutral - 700 dark:hover:text - neutral - 300'
 }`}
 >
 <Icon className="w - 5 h - 5" />
 <span>{tab.label}</span>
// FIXED:  </button>
 );
 })}
// FIXED:  </nav>
// FIXED:  </div>

 {/* Tab Content */}
 <div className="pb - 12">
 {renderTabContent()}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default UserPage;
