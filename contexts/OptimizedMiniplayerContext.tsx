import React from 'react';
import { createContext, useContext, useReducer, useMemo, type ReactNode, ReactNode } from 'react';
import { ReactNode } from 'react';
import { useMemo } from 'react';

import type { Video } from '../src/types/core';

// State interface
interface MiniplayerState {
  isVisible: boolean;,
  currentVideo: Video | null;
  isPlaying: boolean;,
  volume: number;
  currentTime: number;,
  duration: number;
  isMaximized: boolean;,
  queue: Video;
  currentIndex: number
}

// Action types
type MiniplayerAction =
  | { type: "SHOW_MINIPLAYER" as const; payload: Video }
  | { type: "HIDE_MINIPLAYER" as const }
  | { type: "TOGGLE_PLAY" as const }
  | { type: "SET_PLAYING" as const; payload: boolean }
  | { type: "SET_VOLUME" as const; payload: number }
  | { type: "SET_CURRENT_TIME" as const; payload: number }
  | { type: "SET_DURATION" as const; payload: number }
  | { type: "TOGGLE_MAXIMIZE" as const }
  | { type: "SET_MAXIMIZED" as const; payload: boolean }
  | { type: "SET_QUEUE" as const; payload: Video[] }
  | { type: "ADD_TO_QUEUE" as const; payload: Video }
  | { type: "REMOVE_FROM_QUEUE" as const; payload: string }
  | { type: "NEXT_VIDEO" as const }
  | { type: "PREVIOUS_VIDEO" as const }
  | { type: "SET_CURRENT_INDEX" as const; payload: number };

// Initial state
const initialState: MiniplayerState = {,
  isVisible: false,
          currentVideo: null,
  isPlaying: false,
          volume: 1,
  currentTime: 0,
          duration: 0,
  isMaximized: false,
          queue: [],
  currentIndex: -1 };

// Reducer
const miniplayerReducer: any = (state: MiniplayerState,
          action: MiniplayerAction): MiniplayerState => {
  switch (action.type) {
    case 'SHOW_MINIPLAYER':
      return {
        ...state as any,
        isVisible: true,
          currentVideo: action.payload,
        isPlaying: true };

    case 'HIDE_MINIPLAYER':
      return {
        ...state as any,
        isVisible: false,
          currentVideo: null,
        isPlaying: false,
          currentTime: 0 };

    case 'TOGGLE_PLAY':
      return {
        ...state as any,
        isPlaying: !state.isPlaying };

    case 'SET_PLAYING':
      return {
        ...state as any,
        isPlaying: action.payload };

    case 'SET_VOLUME':
      return {
        ...state as any,
        volume: Math.max(0, Math.min(1, action.payload)) };

    case 'SET_CURRENT_TIME':
      return {
        ...state as any,
        currentTime: action.payload };

    case 'SET_DURATION':
      return {
        ...state as any,
        duration: action.payload };

    case 'TOGGLE_MAXIMIZE':
      return {
        ...state as any,
        isMaximized: !state.isMaximized };

    case 'SET_MAXIMIZED':
      return {
        ...state as any,
        isMaximized: action.payload };

    case 'SET_QUEUE':
      return {
        ...state as any,
        queue: action.payload,
          currentIndex: action.payload.length > 0 ? 0 : -1 };

    case 'ADD_TO_QUEUE':
      return {
        ...state as any,
        queue: [...state.queue, action.payload] };

    case 'REMOVE_FROM_QUEUE': {
      const newQueue = state.queue.filter((video: any) => video.id !== action.payload);
      const newIndex = state.currentIndex >= newQueue.length ? newQueue.length - 1 : state.currentIndex;
      return {
        ...state as any,
        queue: newQueue,
          currentIndex: newIndex }}

    case 'NEXT_VIDEO': {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex < state.queue.length) {
        return {
          ...state as any,
          currentIndex: nextIndex,
          currentVideo: state.queue[nextIndex] || null,
          currentTime: 0 }}
      return state;
    }

    case 'PREVIOUS_VIDEO': {
      const prevIndex = state.currentIndex - 1;
      if (prevIndex >= 0) {
        return {
          ...state as any,
          currentIndex: prevIndex,
          currentVideo: state.queue[prevIndex] || null,
          currentTime: 0 }}
      return state;
    }

    case 'SET_CURRENT_INDEX':
      if (action.payload >= 0 && action.payload < state.queue.length) {
        return {
          ...state as any,
          currentIndex: action.payload,
          currentVideo: state.queue[action.payload] || null,
          currentTime: 0 }}
      return state;

    default: return state
  }
};

// Context interface
interface MiniplayerContextValue {
  state: MiniplayerState;,
  actions: {
    showMiniplayer: (video: Video) => void;,
    hideMiniplayer: () => void;
    togglePlay: () => void;,
    setPlaying: (playing: any) => void;,
    setVolume: (volume: any) => void;,
    setCurrentTime: (time: any) => void;,
    setDuration: (duration: any) => void;,
    toggleMaximize: () => void;
    setMaximized: (maximized: any) => void;,
    setQueue: (queue: Video) => void;,
    addToQueue: (video: Video) => void;,
    removeFromQueue: (videoId: any) => void;,
    nextVideo: () => void;
    previousVideo: () => void;,
    setCurrentIndex: (index: number) => void
  
        }}

// Create contexts
const MiniplayerContext = createContext<MiniplayerContextValue | null>(null);

// Provider component
interface MiniplayerProviderProps {
  children?: React.ReactNode
}

export const OptimizedMiniplayerProvider: any = ({ children }: MiniplayerProviderProps) => {
  const [state, dispatch] = useReducer<any, any>(miniplayerReducer, initialState);

  // Memoized actions to prevent unnecessary re-renders
  const actions = useMemo(() => ({
    showMiniplayer: (video: Video) => dispatch({ type: "SHOW_MINIPLAYER" as const,
          payload: video }),
    hideMiniplayer: () => dispatch({ type: "HIDE_MINIPLAYER" as const }),
          togglePlay: () => dispatch({ type: "TOGGLE_PLAY" as const }),
          setPlaying: (playing: any) => dispatch({ type: "SET_PLAYING" as const,
          payload: playing }),
    setVolume: (volume: any) => dispatch({ type: "SET_VOLUME" as const,
          payload: volume }),
    setCurrentTime: (time: any) => dispatch({ type: "SET_CURRENT_TIME" as const,
          payload: time }),
    setDuration: (duration: any) => dispatch({ type: "SET_DURATION" as const,
          payload: duration }),
    toggleMaximize: () => dispatch({ type: "TOGGLE_MAXIMIZE" as const }),
          setMaximized: (maximized: any) => dispatch({ type: "SET_MAXIMIZED" as const,
          payload: maximized }),
    setQueue: (queue: Video) => dispatch({ type: "SET_QUEUE" as const,
          payload: queue }),
    addToQueue: (video: Video) => dispatch({ type: "ADD_TO_QUEUE" as const,
          payload: video }),
    removeFromQueue: (videoId: any) => dispatch({ type: "REMOVE_FROM_QUEUE" as const,
          payload: videoId }),
    nextVideo: () => dispatch({ type: "NEXT_VIDEO" as const }),
          previousVideo: () => dispatch({ type: "PREVIOUS_VIDEO" as const }),
          setCurrentIndex: (index: number) => dispatch({ type: "SET_CURRENT_INDEX" as const,
          payload: index }) }), []);

  const value = useMemo(() => ({ state, actions }), [state]);

  return (
    <MiniplayerContext.Provider value={value}>
      {children}
    </MiniplayerContext.Provider>
  );
};

// Hook to use the context
export const useOptimizedMiniplayer: any = () => {
  const context = useContext<any>(MiniplayerContext);
  if (!context) {
    throw new Error('useOptimizedMiniplayer must be used within an OptimizedMiniplayerProvider');
  }
  return context;
};

// Selector hooks for specific parts of the state to prevent unnecessary re-renders
export const useMiniplayerVideo: any = () => {
  const { state } = useOptimizedMiniplayer();
  return state.currentVideo;
};

export const useMiniplayerVisibility: any = () => {
  const { state } = useOptimizedMiniplayer();
  return state.isVisible;
};

export const useMiniplayerPlayback: any = () => {
  const { state } = useOptimizedMiniplayer();
  return {
    isPlaying: state.isPlaying,
          currentTime: state.currentTime,
    duration: state.duration,
          volume: state.volume }};

export const useMiniplayerQueue: any = () => {
  const { state } = useOptimizedMiniplayer();
  return {
    queue: state.queue,
          currentIndex: state.currentIndex }};

export const useMiniplayerActions: any = () => {
  const { actions } = useOptimizedMiniplayer();
  return actions;
};

