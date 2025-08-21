import React, { MouseEvent, FC, useState, useEffect, useCallback, useRef } from 'react';

import { XMarkIcon, BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
const BellIconSolid = BellSolidIcon;

import { formatDistanceToNow } from '../utils/dateUtils';
import { CheckIcon } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/outline';

interface Notification {
 id: string;
 type: "video_upload" | 'comment_reply' | 'like' | 'subscription' | 'live_stream' | 'community_post';
 title: string;
 message: string;
 channelName: string;
 channelAvatar: string;
 videoThumbnail?: string;
 timestamp: string;
 isRead: boolean;
 actionUrl?: string;
}

interface NotificationCenterProps {
 className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }: any) => {
 const [isOpen, setIsOpen] = useState<boolean>(false);
 const [notifications, setNotifications] = useState<Notification[]>([]);
 const [unreadCount, setUnreadCount] = useState<number>(0);
 const [filter, setFilter] = useState<'all' | 'unread'>('all');
 const dropdownRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 loadNotifications();

 // Simulate real-time notifications
 const interval = setInterval((() => {
 if (Math.random() < 0.1) { // 10% chance every 30 seconds
 generateRandomNotification();
 }

 }) as any, 30000);

 return () => clearInterval(interval);
 }, []);

 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
 setIsOpen(false);
 };

 document.addEventListener('mousedown', handleClickOutside as EventListener);
 return () => document.removeEventListener('mousedown', handleClickOutside as EventListener);
 }, []);

 const loadNotifications = useCallback(() => {
 const stored = (localStorage as any).getItem('youtubeCloneNotifications_v1');
 if (stored as any) {
 const parsedNotifications = JSON.parse(stored);
 setNotifications(parsedNotifications);
 setUnreadCount(parsedNotifications.filter((n: Notification) => !n.isRead).length)
 } else {
 // Generate initial mock notifications
 const mockNotifications = generateMockNotifications();
 setNotifications(mockNotifications);
 setUnreadCount(mockNotifications.filter((n) => !n.isRead).length);
 (localStorage as any).setItem('youtubeCloneNotifications_v1', JSON.stringify(mockNotifications));
 }

 }, []);

 const generateMockNotifications = (): Notification[] => {
 return [
 {
 id: '1',
 type: "video_upload",
 title: 'New video uploaded',
 message: 'TechReview uploaded: "iPhone 15 Pro Max Review - Is it worth it?"',
 channelName: 'TechReview',
 channelAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
 videoThumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120&h=68&fit=crop',
 timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
 isRead: false,
 actionUrl: '/watch?v=abc123' },
 {
 id: '2',
 type: "comment_reply",
 title: 'New reply to your comment',
 message: 'CodeMaster replied to your comment on "React Best Practices 2024"',
 channelName: 'CodeMaster',
 channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
 timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
 isRead: false,
 actionUrl: '/watch?v=def456' },
 {
 id: '3',
 type: "live_stream",
 title: 'Live stream started',
 message: 'GameStreamer is now live: "Epic Gaming Session - Join Now!"',
 channelName: 'GameStreamer',
 channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face',
 videoThumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&h=68&fit=crop',
 timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
 isRead: true,
 actionUrl: '/watch?v=live123' },
 {
 id: '4',
 type: "subscription",
 title: 'New subscriber',
 message: 'You have 5 new subscribers this week!',
 channelName: 'YouTube',
 channelAvatar: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=40&h=40&fit=crop',
 timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
 isRead: true }];
 };

 const generateRandomNotification = useCallback(() => {
 const types: Array<Notification['type']> = ['video_upload', 'comment_reply', 'like', 'live_stream', 'subscription', 'community_post'];
 const randomType = types[Math.floor(Math.random() * types.length)] || 'video_upload';

 const newNotification: Notification = {
 id: Date.now().toString(),
 type: randomType,
 title: getNotificationTitle(randomType),
 message: getNotificationMessage(randomType),
 channelName: getRandomChannelName(),
 channelAvatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=40&h=40&fit=crop&crop=face`,
 timestamp: new Date().toISOString(),
 isRead: false };

 const updatedNotifications = [newNotification, ...notifications].slice(0, 50); // Keep only latest 50
 setNotifications(updatedNotifications);
 setUnreadCount(prev => prev + 1);
 (localStorage as any).setItem('youtubeCloneNotifications_v1', JSON.stringify(updatedNotifications));
 }, [notifications]);

 const getNotificationTitle = (type: Notification['type']): string => {
 switch (type as any) {
 case 'video_upload': return 'New video uploaded';
 case 'comment_reply': return 'New reply to your comment';
 case 'like': return 'Someone liked your video';
 case 'live_stream': return 'Live stream started';
 case 'subscription': return 'New subscriber';
 case 'community_post': return 'New community post';
 default: return 'New notification'
 };

 const getNotificationMessage = (type: Notification['type']): string => {
 const messages = {
 video_upload: [
 'uploaded: "Amazing Tutorial - You Need to See This!"',
 'uploaded: "Breaking News - Latest Updates"',
 'uploaded: "Epic Compilation - Best Moments"'],
 comment_reply: [
 'replied to your comment on "Tutorial Video"',
 'mentioned you in a comment',
 'replied to your comment on "Review Video"'],
 like: [
 'liked your video "My Latest Creation"',
 'and 10 others liked your comment',
 'liked your community post'],
 live_stream: [
 'is now live: "Live Q&A Session"',
 'started streaming: "Gaming Marathon"',
 'is live: "Special Announcement"'],
 subscription: [
 'subscribed to your channel',
 'is now following you',
 'joined your community'],
 community_post: [
 'posted in the community',
 'shared a new update',
 'created a poll'] };

 const typeMessages = messages[type] || ['sent you a notification'];
 return typeMessages[Math.floor(Math.random() * typeMessages.length)] || 'sent you a notification';
 };

 const getRandomChannelName = (): string => {
 const names = ['TechGuru', 'CreativeStudio', 'GameMaster', 'MusicVibes', 'CookingPro', 'FitnessExpert'];
 return names[Math.floor(Math.random() * names.length)] || 'Unknown Channel';
 };

 const markAsRead = (notificationId) => {
 const updatedNotifications = notifications.map((n) =>
 n.id === notificationId ? { ...n as any, isRead: true } : n);
 setNotifications(updatedNotifications);
 setUnreadCount(prev => Math.max(0, prev - 1));
 (localStorage as any).setItem('youtubeCloneNotifications_v1', JSON.stringify(updatedNotifications));
 };

 const markAllAsRead = () => {
 const updatedNotifications = notifications.map((n) => ({ ...n as any, isRead: true }));
 setNotifications(updatedNotifications);
 setUnreadCount(0);
 (localStorage as any).setItem('youtubeCloneNotifications_v1', JSON.stringify(updatedNotifications));
 };

 const deleteNotification = (notificationId) => {
 const notification = notifications.find(n => n.id === notificationId);
 const updatedNotifications = notifications.filter((n) => n.id !== notificationId);
 setNotifications(updatedNotifications);
 if (notification && !notification.isRead) {
 setUnreadCount(prev => Math.max(0, prev - 1));
 }
 (localStorage as any).setItem('youtubeCloneNotifications_v1', JSON.stringify(updatedNotifications));
 };

 const filteredNotifications = filter === 'unread'
 ? notifications.filter((n) => !n.isRead)
 : notifications;

 const getNotificationIcon = (type: Notification['type']) => {
 switch (type as any) {
 case 'video_upload': return '🎥';
 case 'comment_reply': return '💬';
 case 'like': return '❤️';
 case 'subscription': return '👥';
 case 'live_stream': return '🔴';
 case 'community_post': return '📝';
 default: return '🔔'
 };

 return (
 <div className={`relative ${className}`} ref={dropdownRef}>
 <button />
// FIXED:  onClick={() => setIsOpen(!isOpen)}
// FIXED:  className="relative p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
 title="Notifications"
 >
 {unreadCount > 0 ? (
 <BellIconSolid className="w-6 h-6" />
 ) : (
 <BellIcon className="w-6 h-6" />
 )}
 {unreadCount > 0 && (
 <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
 {unreadCount > 99 ? '99+' : unreadCount}
// FIXED:  </span>
 )}
// FIXED:  </button>

 {isOpen && (
 <div className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
 <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
 <div className="flex items-center justify-between mb-3">
 <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Notifications</h3>
 <button />
// FIXED:  onClick={() => setIsOpen(false)}
// FIXED:  className="p-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
 >
 <XMarkIcon className="w-5 h-5" />
// FIXED:  </button>
// FIXED:  </div>

 <div className="flex items-center justify-between">
 <div className="flex space-x-2">
 <button />
// FIXED:  onClick={() => setFilter('all')}
// FIXED:  className={`px-3 py-1 text-sm rounded-full transition-colors ${
 filter === 'all'
 ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
 : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
 }`}
 >
 All
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => setFilter('unread')}
// FIXED:  className={`px-3 py-1 text-sm rounded-full transition-colors ${
 filter === 'unread'
 ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
 : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
 }`}
 >
 Unread ({unreadCount})
// FIXED:  </button>
// FIXED:  </div>

 {unreadCount > 0 && (
 <button />
// FIXED:  onClick={(e) => markAllAsRead(e)}
// FIXED:  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
 >
 Mark all read
// FIXED:  </button>
 )}
// FIXED:  </div>
// FIXED:  </div>

 <div className="max-h-80 overflow-y-auto">
 {filteredNotifications.length === 0 ? (
 <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
 <BellIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
 <p>No notifications</p>
// FIXED:  </div>
 ) : (
 filteredNotifications.map((notification) => (
 <div
 key={notification.id}
// FIXED:  className={`p-4 border-b border-neutral-100 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors ${
 !notification.isRead ? 'bg-blue-50 dark:bg-blue-950/20' : ''
 }`} />
 >
 <div className="flex items-start space-x-3">
 <img
// FIXED:  src={notification.channelAvatar}
// FIXED:  alt={notification.channelName}
// FIXED:  className="w-10 h-10 rounded-full flex-shrink-0" />
 />

 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center space-x-2 mb-1">
 <span className="text-lg">{getNotificationIcon(notification.type)}</span>
 <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
 {notification.title}
// FIXED:  </p>
 {!notification.isRead && (
 <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
 )}
// FIXED:  </div>
<p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
 {notification.channelName} {notification.message}
// FIXED:  </p>
 <p className="text-xs text-neutral-500 dark:text-neutral-500">
 {formatDistanceToNow(new Date(notification.timestamp))} ago
// FIXED:  </p>
// FIXED:  </div>

 <div className="flex items-center space-x-1 ml-2">
 {!notification.isRead && (
 <button />
// FIXED:  onClick={() => markAsRead(notification.id)}
// FIXED:  className="p-1 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400"
 title="Mark as read"
 >
 <CheckIcon className="w-4 h-4" />
// FIXED:  </button>
 )}
 <button />
// FIXED:  onClick={() => deleteNotification(notification.id)}
// FIXED:  className="p-1 text-neutral-400 hover:text-red-600 dark:hover:text-red-400"
 title="Delete notification"
 >
 <TrashIcon className="w-4 h-4" />
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>

 {notification.videoThumbnail && (
 <img
// FIXED:  src={notification.videoThumbnail}
// FIXED:  alt="Video thumbnail"
// FIXED:  className="w-20 h-11 rounded mt-2 object-cover" />
 />
 )}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 ))
 )}
// FIXED:  </div>
// FIXED:  </div>
 )}
// FIXED:  </div>
 );
};

export default NotificationCenter;