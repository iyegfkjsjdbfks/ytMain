import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface WatchLaterContextType {
  watchLaterVideos: string[];
  addToWatchLater: (videoId: string) => void;
  removeFromWatchLater: (videoId: string) => void;
  isInWatchLater: (videoId: string) => boolean;
  clearWatchLater: () => void}


const WatchLaterContext = createContext<WatchLaterContextType | undefined>(undefined);

export const useWatchLater = () => {
  const context = useContext(WatchLaterContext);
  if (!context) {
    throw new Error('useWatchLater must be used within a WatchLaterProvider')}
  }
  return context;
};

interface WatchLaterProviderProps {
  children: ReactNode}


import React from 'react';
export const WatchLaterProvider: React.FC<WatchLaterProviderProps> = ({ children }: Record<string, unknown>) => {
  const [watchLaterVideos, setWatchLaterVideos] = useState<string[]>([]);

  // Load from localStorage on mount;
  useEffect(() => {
    const stored = localStorage.getItem('watchLaterVideos');
    if (stored) {
      try {
        setWatchLaterVideos(JSON.parse(stored))}
      } catch (error) {
        console.error('Error loading watch later videos:', error)}
      }
    ,}
  }, []);

  // Save to localStorage whenever the list changes;
  useEffect(() => {
    localStorage.setItem('watchLaterVideos', JSON.stringify(watchLaterVideos))}
  ,}, [watchLaterVideos]);

  const addToWatchLater = (videoId: string) => {
    setWatchLaterVideos(prev,: unknown=> {
      if (prev.includes(videoId,: string)) return,  prev;
      return [...prev, videoId]}
    ,,},);
  };

  const removeFromWatchLater = (videoId: string) => {
    setWatchLaterVideos(prev,: unknown=> prev.filter(i,d,: unknown=> id !== videoId)), ;
  };

  const isInWatchLater = (videoId: string): boolean: unknown=> {
    return,  watchLaterVideos.includes(videoId,: string), ;
  };

  const clearWatchLater = () => {
    setWatchLaterVideos([]), ;
  };

  const value = {
    watchLaterVideos,
    addToWatchLater,
    removeFromWatchLater}
    isInWatchLater,;
    clearWatchLater, ;
  };

  return (
    <WatchLaterContext.Provider value={value}>
      {children}
    </WatchLaterContext.Provider>
  );
};

export default WatchLaterProvider;
