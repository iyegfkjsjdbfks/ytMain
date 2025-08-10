// TODO: Fix import - import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

import type { Video as VideoType } from '../src/types/core';

// Use the Video type for items in the watch later list
// We can alias it to VideoItem if preferred, or just use VideoType directly.
// For clarity, let's stick to VideoType where it's used for the list items.


interface WatchLaterContextType {
  watchLaterList: VideoType;
  addToWatchLater: (video: VideoType) => void;
  removeFromWatchLater: (videoId) => void;
  isWatchLater: (videoId) => boolean;
}

const WatchLaterContext = createContext<WatchLaterContextType | undefined>(undefined);

export const WatchLaterProvider = ({ children }: { children: ReactNode }) => {
  const [watchLaterList, setWatchLaterList] = useState<VideoType[]>(() => {
    const storedList = localStorage.getItem('youtubeCloneWatchLater_v1');
    return storedList ? JSON.parse(storedList) : [];
  });

  useEffect(() => {
    localStorage.setItem('youtubeCloneWatchLater_v1', JSON.stringify(watchLaterList));
  }, [watchLaterList]);

  const addToWatchLater = (video: VideoType) => {
    setWatchLaterList((prevList) => {
      if (!prevList.find(item => item.id === video.id)) {
        return [...prevList, video];
      }
      return prevList;
    });
  };

  const removeFromWatchLater = (videoId) => {
    setWatchLaterList((prevList) => prevList.filter((video) => video.id !== videoId));
  };

  const isWatchLater = (videoId) => {
    return watchLaterList.some(video => video.id === videoId);
  };

  return (
    <WatchLaterContext.Provider value={{ watchLaterList, addToWatchLater, removeFromWatchLater, isWatchLater }}>
      {children}
    </WatchLaterContext.Provider>
  );
};

export const useWatchLater = () => {
  const context = useContext(WatchLaterContext);
  if (context === undefined) {
    throw new Error('useWatchLater must be used within a WatchLaterProvider');
  }
  return context;
};
