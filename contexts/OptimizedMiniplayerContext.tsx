/// <reference types="react/jsx-runtime" />
import { createContext, useContext, useReducer, useMemo, type ReactNode } from 'react';

import type { Video } from '../src/types/core';

// State interface
interface MiniplayerState {
  isVisible: boolean;
  currentVideo: Video | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isMaximized: boolean;
  queue: Video;
  currentIndex: number;
}

// Action types
type MiniplayerAction =
  | { type: 'SHOW_MINIPLAYER'; payload: Video }
  | { type: 'HIDE_MINIPLAYER' }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'TOGGLE_MAXIMIZE' }
  | { type: 'SET_MAXIMIZED'; payload: boolean }
  | { type: 'SET_QUEUE'; payload: Video[] }
  | { type: 'ADD_TO_QUEUE'; payload: Video }
  | { type: 'REMOVE_FROM_QUEUE'; payload: string }
  | { type: 'NEXT_VIDEO' }
  | { type: 'PREVIOUS_VIDEO' }
  | { type: 'SET_CURRENT_INDEX'; payload: number };

// Initial state
const initialState: MiniplayerState = {
  isVisible: false,
  currentVideo: null,
  isPlaying: false,
  volume: 1,
  currentTime: 0,
  duration: 0,
  isMaximized: false,
  queue: [],
  currentIndex: -1,
};

// Reducer
const miniplayerReducer = (state: MiniplayerState, action: MiniplayerAction): MiniplayerState => {
  switch (action.type) {
    case 'SHOW_MINIPLAYER':
      return {
        ...state,
        isVisible: true,
        currentVideo: action.payload,
        isPlaying: true,
      };

    case 'HIDE_MINIPLAYER':
      return {
        ...state,
        isVisible: false,
        currentVideo: null,
        isPlaying: false,
        currentTime: 0,
      };

    case 'TOGGLE_PLAY':
      return {
        ...state,
        isPlaying: !state.isPlaying,
      };

    case 'SET_PLAYING':
      return {
        ...state,
        isPlaying: action.payload,
      };

    case 'SET_VOLUME':
      return {
        ...state,
        volume: Math.max(0, Math.min(1, action.payload)),
      };

    case 'SET_CURRENT_TIME':
      return {
        ...state,
        currentTime: action.payload,
      };

    case 'SET_DURATION':
      return {
        ...state,
        duration: action.payload,
      };

    case 'TOGGLE_MAXIMIZE':
      return {
        ...state,
        isMaximized: !state.isMaximized,
      };

    case 'SET_MAXIMIZED':
      return {
        ...state,
        isMaximized: action.payload,
      };

    case 'SET_QUEUE':
      return {
        ...state,
        queue: action.payload,
        currentIndex: action.payload.length > 0 ? 0 : -1,
      };

    case 'ADD_TO_QUEUE':
      return {
        ...state,
        queue: [...state.queue, action.payload],
      };

    case 'REMOVE_FROM_QUEUE': {
      const newQueue = state.queue.filter((video: any) => video.id !== action.payload);
      const newIndex = state.currentIndex >= newQueue.length ? newQueue.length - 1 : state.currentIndex;
      return {
        ...state,
        queue: newQueue,
        currentIndex: newIndex,
      };
    }

    case 'NEXT_VIDEO': {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex < state.queue.length) {
        return {
          ...state,
          currentIndex: nextIndex,
          currentVideo: state.queue[nextIndex] || null,
          currentTime: 0,
        };
      }
      return state;
    }

    case 'PREVIOUS_VIDEO': {
      const prevIndex = state.currentIndex - 1;
      if (prevIndex >= 0) {
        return {
          ...state,
          currentIndex: prevIndex,
          currentVideo: state.queue[prevIndex] || null,
          currentTime: 0,
        };
      }
      return state;
    }

    case 'SET_CURRENT_INDEX':
      if (action.payload >= 0 && action.payload < state.queue.length) {
        return {
          ...state,
          currentIndex: action.payload,
          currentVideo: state.queue[action.payload] || null,
          currentTime: 0,
        };
      }
      return state;

    default:
      return state;
  }
};

// Context interface
interface MiniplayerContextValue {
  state: MiniplayerState;
  actions: {
    showMiniplayer: (video: Video) => void;
    hideMiniplayer: () => void;
    togglePlay: () => void;
    setPlaying: (playing: any) => void;
    setVolume: (volume: any) => void;
    setCurrentTime: (time: any) => void;
    setDuration: (duration: any) => void;
    toggleMaximize: () => void;
    setMaximized: (maximized: any) => void;
    setQueue: (queue: Video) => void;
    addToQueue: (video: Video) => void;
    removeFromQueue: (videoId: any) => void;
    nextVideo: () => void;
    previousVideo: () => void;
    setCurrentIndex: (index: number) => void;
  };
}

// Create contexts
const MiniplayerContext = createContext<MiniplayerContextValue | null>(null);

// Provider component
interface MiniplayerProviderProps {
  children: ReactNode;
}

export const OptimizedMiniplayerProvider = ({ children }: MiniplayerProviderProps) => {
  const [state, dispatch] = useReducer(miniplayerReducer, initialState);

  // Memoized actions to prevent unnecessary re-renders
  const actions = useMemo(() => ({
    showMiniplayer: (video: Video) => dispatch({ type: 'SHOW_MINIPLAYER', payload: video }),
    hideMiniplayer: () => dispatch({ type: 'HIDE_MINIPLAYER' }),
    togglePlay: () => dispatch({ type: 'TOGGLE_PLAY' }),
    setPlaying: (playing: any) => dispatch({ type: 'SET_PLAYING', payload: playing: any }),
    setVolume: (volume: any) => dispatch({ type: 'SET_VOLUME', payload: volume: any }),
    setCurrentTime: (time: any) => dispatch({ type: 'SET_CURRENT_TIME', payload: time: any }),
    setDuration: (duration: any) => dispatch({ type: 'SET_DURATION', payload: duration: any }),
    toggleMaximize: () => dispatch({ type: 'TOGGLE_MAXIMIZE' }),
    setMaximized: (maximized: any) => dispatch({ type: 'SET_MAXIMIZED', payload: maximized: any }),
    setQueue: (queue: Video) => dispatch({ type: 'SET_QUEUE', payload: queue }),
    addToQueue: (video: Video) => dispatch({ type: 'ADD_TO_QUEUE', payload: video }),
    removeFromQueue: (videoId: any) => dispatch({ type: 'REMOVE_FROM_QUEUE', payload: videoId: any }),
    nextVideo: () => dispatch({ type: 'NEXT_VIDEO' }),
    previousVideo: () => dispatch({ type: 'PREVIOUS_VIDEO' }),
    setCurrentIndex: (index: number) => dispatch({ type: 'SET_CURRENT_INDEX', payload: index: number }),
  }), []);

  const value = useMemo(() => ({ state, actions }), [state]);

  return (
    <MiniplayerContext.Provider value={value}>
      {children}
    </MiniplayerContext.Provider>
  );
};

// Hook to use the context
export const useOptimizedMiniplayer = () => {
  const context = useContext(MiniplayerContext);
  if (!context) {
    throw new Error('useOptimizedMiniplayer must be used within an OptimizedMiniplayerProvider');
  }
  return context;
};

// Selector hooks for specific parts of the state to prevent unnecessary re-renders
export const useMiniplayerVideo = () => {
  const { state } = useOptimizedMiniplayer();
  return state.currentVideo;
};

export const useMiniplayerVisibility = () => {
  const { state } = useOptimizedMiniplayer();
  return state.isVisible;
};

export const useMiniplayerPlayback = () => {
  const { state } = useOptimizedMiniplayer();
  return {
    isPlaying: state.isPlaying,
    currentTime: state.currentTime,
    duration: state.duration,
    volume: state.volume,
  };
};

export const useMiniplayerQueue = () => {
  const { state } = useOptimizedMiniplayer();
  return {
    queue: state.queue,
    currentIndex: state.currentIndex,
  };
};

export const useMiniplayerActions = () => {
  const { actions } = useOptimizedMiniplayer();
  return actions;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
