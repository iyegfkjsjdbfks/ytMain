import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Video } from '../types';

import type { Video as VideoType } from '../src/types/core';

// Use the Video type for items in the watch later list
// We can alias it to VideoItem if preferred, or just use VideoType directly.
// For clarity, let's stick to VideoType where it's used for the list items.

interface WatchLaterContextType {
  watchLaterList: VideoType;
  addToWatchLater: (video: VideoType) => void;
  removeFromWatchLater: (videoId: any) => void;
  isWatchLater: (videoId: any) => boolean
}

const WatchLaterContext = createContext<WatchLaterContextType | undefined>(undefined);

export const WatchLaterProvider: any = ({ children }: any) => {
  const [watchLaterList, setWatchLaterList] = useState<VideoType[]>(() => {
    const storedList = (localStorage as any).getItem('youtubeCloneWatchLater_v1');
    return storedList ? JSON.parse(storedList) : [];
  });

  useEffect(() => {
    (localStorage as any).setItem('youtubeCloneWatchLater_v1', JSON.stringify(watchLaterList));
  }, [watchLaterList]);

  const addToWatchLater: any = (video: VideoType) => {
    setWatchLaterList((prevList: any) => {
      if (!prevList.find(item => item.id === video.id)) {
        return [...prevList as any, video];
      }
      return prevList;
    });
  };

  const removeFromWatchLater: any = (videoId: any) => {
    setWatchLaterList((prevList) => prevList.filter((video) => video.id !== videoId));
  };

  const isWatchLater: any = (videoId: any) => {
    return watchLaterList.some(video => video.id === videoId);
  };

  return (
    <WatchLaterContext.Provider value={{ watchLaterList, addToWatchLater, removeFromWatchLater, isWatchLater }}>
      {children}
    </WatchLaterContext.Provider>
  );
};

export const useWatchLater: any = () => {
  const context = useContext<any>(WatchLaterContext);
  if (context === undefined) {
    throw new Error('useWatchLater must be used within a WatchLaterProvider');
  }
  return context;
};
