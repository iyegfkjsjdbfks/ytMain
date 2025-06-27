
import type React from 'react';
import { useState } from 'react';

import { BellAlertIcon, ChatBubbleLeftRightIcon, VideoCameraIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface NotificationItem {
  id: string;
  icon: React.ElementType;
  iconColorClass: string;
  title: string;
  description: string;
  time: string;
  isNew?: boolean;
}

const mockNotifications: NotificationItem[] = [
  { id: '1', icon: VideoCameraIcon, iconColorClass: 'text-red-500', title: 'New video from TechLevelUp!', description: "'Ultimate Gaming Setup Tour 2024' was just uploaded.", time: '15m ago', isNew: true },
  { id: '2', icon: ChatBubbleLeftRightIcon, iconColorClass: 'text-blue-500', title: 'Comment reply', description: "Alice W. replied to your comment on 'Exploring the Alps'.", time: '1h ago', isNew: true },
  { id: '3', icon: BellAlertIcon, iconColorClass: 'text-yellow-500', title: 'Subscription update', description: 'Nature Explorers just went live!', time: '3h ago' },
  { id: '4', icon: VideoCameraIcon, iconColorClass: 'text-red-500', title: 'Recommended for you', description: "Check out 'Delicious & Easy Pasta Recipe' by Chef Studio.", time: 'Yesterday' },
];


interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState(mockNotifications);

  if (!isOpen) {
return null;
}

  const hasNewNotifications = notifications.some(n => n.isNew);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, isNew: false })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === id ? { ...notification, isNew: false } : notification,
    ));
  };

  return (
    <div
      className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 rounded-xl shadow-2xl z-[100] animate-fade-in-down-notif flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notifications-panel-title"
    >
      <header className="flex items-center justify-between p-3.5 border-b border-neutral-200 dark:border-neutral-700/80">
        <h2 id="notifications-panel-title" className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
          Notifications
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-neutral-500 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/70 transition-colors"
          aria-label="Close notifications panel"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-grow overflow-y-auto max-h-[calc(100vh-12rem)] p-1.5">
        {notifications.length > 0 ? (
          <ul className="space-y-1">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <button
                  onClick={() => {
                    markAsRead(notification.id);
                    onClose();
                  }}
                  className={`flex items-start p-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/70 transition-colors ${notification.isNew ? 'bg-sky-50 dark:bg-sky-500/10' : ''}`}
                >
                  <notification.icon className={`w-6 h-6 mr-3 flex-shrink-0 ${notification.iconColorClass} ${notification.isNew ? '' : 'opacity-70'}`} />
                  <div className="flex-grow">
                    <p className={`text-sm font-medium text-neutral-800 dark:text-neutral-100 ${notification.isNew ? 'font-semibold' : ''}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-snug mt-0.5">
                      {notification.description}
                    </p>
                    <p className={`text-xs mt-1 ${notification.isNew ? 'text-sky-600 dark:text-sky-400 font-medium' : 'text-neutral-500 dark:text-neutral-400'}`}>
                      {notification.time}
                    </p>
                  </div>
                  {notification.isNew && (
                    <div className="w-2 h-2 bg-sky-500 rounded-full ml-2 mt-1 flex-shrink-0" aria-label="New notification" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-12 text-center">
            <BellAlertIcon className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">No new notifications</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Check back later for updates.</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
         <footer className="p-3 border-t border-neutral-200 dark:border-neutral-700/80 text-center">
            <button
              onClick={() => {
                if (hasNewNotifications) {
                  void markAllAsRead();
                } else {
                  onClose();
                }
              }}
              className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 transition-colors px-3 py-1.5 rounded-md hover:bg-sky-50 dark:hover:bg-sky-500/10"
            >
              {hasNewNotifications ? 'Mark all as read' : 'View all notifications'}
            </button>
         </footer>
      )}
    </div>
  );
};

export default NotificationsPanel;
