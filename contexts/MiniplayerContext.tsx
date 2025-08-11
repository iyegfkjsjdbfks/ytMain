
/// <reference types="react/jsx-runtime" />
// TODO: Fix import - import { createContext, useState, useContext, useCallback, type ReactNode } from 'react';

import type { Video } from '../src/types/core';

interface MiniplayerContextType {
  miniplayerVideo: Video | null;
  isMiniplayerVisible: boolean;
  showMiniplayer: (video: Video) => void;
  hideMiniplayer: () => void; // Hides but keeps video in state
  clearMiniplayer: () => void; // Clears video and hides
}

const MiniplayerContext = createContext<MiniplayerContextType | undefined>(undefined);

export const MiniplayerProvider: React.FC<{ children: ReactNode }> = ({ children }: {children: any}) => {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showMiniplayer = useCallback((video: Video) => {
    setCurrentVideo(video);
    setIsVisible(true);
  }, []);

  const hideMiniplayer = useCallback(() => {
    setIsVisible(false);
  }, []);

  const clearMiniplayer = useCallback(() => {
    setCurrentVideo(null);
    setIsVisible(false);
  }, []);

  return (
    <MiniplayerContext.Provider value={{ miniplayerVideo: currentVideo, isMiniplayerVisible: isVisible, showMiniplayer, hideMiniplayer, clearMiniplayer }}>
      {children}
    </MiniplayerContext.Provider>
  );
};

export const useMiniplayer = (): MiniplayerContextType => {
  const context = useContext(MiniplayerContext);
  if (!context) {
    throw new Error('useMiniplayer must be used within a MiniplayerProvider');
  }
  return context;
};


declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
