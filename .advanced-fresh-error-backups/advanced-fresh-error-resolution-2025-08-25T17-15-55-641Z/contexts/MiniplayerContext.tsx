import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration?: number;
  channelName?: string;
}

interface MiniplayerContextType {
  isOpen: boolean;
  currentVideo: Video | null;
  isPlaying: boolean;
  openMiniplayer: (video: Video) => void;
  closeMiniplayer: () => void;
  togglePlay: () => void;
}

const MiniplayerContext = createContext<MiniplayerContextType | undefined>(undefined);

export const useMiniplayer = () => {
  const context = useContext(MiniplayerContext);
  if (!context) {
    throw new Error('useMiniplayer must be used within a MiniplayerProvider');
  }
  return context;
};

interface MiniplayerProviderProps {
  children: ReactNode;
}

export const MiniplayerProvider: React.FC<MiniplayerProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const openMiniplayer = (video: Video) => {
    setCurrentVideo(video);
    setIsOpen(true);
    setIsPlaying(true);
  };

  const closeMiniplayer = () => {
    setIsOpen(false);
    setCurrentVideo(null);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const value = {
    isOpen,
    currentVideo,
    isPlaying,
    openMiniplayer,
    closeMiniplayer,
    togglePlay;
  };

  return (
    <MiniplayerContext.Provider value={value}>
      {children}
    </MiniplayerContext.Provider>
  );
};

export default MiniplayerProvider;
