import type { ReactNode } from 'react';
import React, { createContext, useContext, useReducer, useCallback   } from 'react';

import type { User } from '../src/types/core';
import type { MiniplayerVideo, StrictNotification } from '../types/strictTypes';

// Unified App State Interface
interface UnifiedAppState {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;

  // Theme state
  theme: 'light' | 'dark' | 'system';

  // Miniplayer state
  miniplayerVideo: MiniplayerVideo | null;
  isMiniplayerOpen: boolean;

  // Watch Later state
  watchLaterVideos: string[];

  // UI state
  sidebarCollapsed: boolean;
  notifications: StrictNotification[];
}

// Action Types
type UnifiedAppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_MINIPLAYER_VIDEO'; payload: MiniplayerVideo | null }
  | { type: 'TOGGLE_MINIPLAYER' }
  | { type: 'ADD_TO_WATCH_LATER'; payload: string }
  | { type: 'REMOVE_FROM_WATCH_LATER'; payload: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'ADD_NOTIFICATION'; payload: StrictNotification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string };

// Initial State
const initialState: UnifiedAppState = {
  user: null,
  isAuthenticated: false,
  isAuthLoading: true,
  theme: 'system',
  miniplayerVideo: null,
  isMiniplayerOpen: false,
  watchLaterVideos: [],
  sidebarCollapsed: false,
  notifications: [],
};

// Reducer
function unifiedAppReducer(state: UnifiedAppState, action: UnifiedAppAction): UnifiedAppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };
    case 'SET_AUTH_LOADING':
      return {
        ...state,
        isAuthLoading: action.payload,
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    case 'SET_MINIPLAYER_VIDEO':
      return {
        ...state,
        miniplayerVideo: action.payload,
        isMiniplayerOpen: !!action.payload,
      };
    case 'TOGGLE_MINIPLAYER':
      return {
        ...state,
        isMiniplayerOpen: !state.isMiniplayerOpen,
      };
    case 'ADD_TO_WATCH_LATER':
      return {
        ...state,
        watchLaterVideos: [...state.watchLaterVideos, action.payload],
      };
    case 'REMOVE_FROM_WATCH_LATER':
      return {
        ...state,
        watchLaterVideos: state.watchLaterVideos.filter(id => id !== action.payload),
      };
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed,
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    default:
      return state;
  }
}

// Context Interface
interface UnifiedAppContextType {
  state: UnifiedAppState;

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;

  // Theme actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Miniplayer actions
  openMiniplayer: (video: MiniplayerVideo) => void;
  closeMiniplayer: () => void;
  toggleMiniplayer: () => void;

  // Watch Later actions
  addToWatchLater: (videoId: string) => void;
  removeFromWatchLater: (videoId: string) => void;
  isInWatchLater: (videoId: string) => boolean;

  // UI actions
  toggleSidebar: () => void;
  addNotification: (notification: Omit<StrictNotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
}

// Create Context
const UnifiedAppContext = createContext<UnifiedAppContextType | undefined>(undefined);

// Custom Hook
export const useUnifiedApp = () => {
  const context = useContext(UnifiedAppContext);
  if (context === undefined) {
    throw new Error('useUnifiedApp must be used within a UnifiedAppProvider');
  }
  return context;
};

// Provider Props
interface UnifiedAppProviderProps {
  children: ReactNode;
}

// Provider Component
export const UnifiedAppProvider: React.FC<UnifiedAppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(unifiedAppReducer, initialState);

  // Auth actions
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'SET_AUTH_LOADING', payload: true });

    try {
      // Simulate API call - password validation would happen here
      if (password.length < 6) {
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful login
      const mockUser: User = {
        id: '1',
        username: email.split('@')[0] || 'user',
        email,
        displayName: email.split('@')[0] || 'user',
        avatar: 'https://via.placeholder.com/40',
        isVerified: false,
        subscriberCount: 0,
        preferences: {
          theme: 'system',
          language: 'en',
          autoplay: true,
          notifications: {
            email: true,
            push: true,
            subscriptions: true,
            comments: true,
            likes: true,
            mentions: true,
          },
          privacy: {
            showSubscriptions: true,
            showLikedVideos: true,
            showWatchHistory: true,
            allowComments: true,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem('youtube_clone_user', JSON.stringify(mockUser));
      localStorage.setItem('youtube_clone_token', 'mock-token');

      dispatch({ type: 'SET_USER', payload: mockUser });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      dispatch({ type: 'SET_AUTH_LOADING', payload: false });
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('youtube_clone_user');
    localStorage.removeItem('youtube_clone_token');
    dispatch({ type: 'SET_USER', payload: null });
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>): Promise<boolean> => {
    if (!state.user) {
return false;
}

    try {
      const updatedUser = { ...state.user, ...updates };
      localStorage.setItem('youtube_clone_user', JSON.stringify(updatedUser));
      dispatch({ type: 'SET_USER', payload: updatedUser });
      return true;
    } catch (error) {
      console.error('Profile update failed:', error);
      return false;
    }
  }, [state.user]);

  // Theme actions
  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    dispatch({ type: 'SET_THEME', payload: theme });
    localStorage.setItem('youtube_clone_theme', theme);
  }, []);

  // Miniplayer actions
  const openMiniplayer = useCallback((video: MiniplayerVideo) => {
    dispatch({ type: 'SET_MINIPLAYER_VIDEO', payload: video });
  }, []);

  const closeMiniplayer = useCallback(() => {
    dispatch({ type: 'SET_MINIPLAYER_VIDEO', payload: null });
  }, []);

  const toggleMiniplayer = useCallback(() => {
    dispatch({ type: 'TOGGLE_MINIPLAYER' });
  }, []);

  // Watch Later actions
  const addToWatchLater = useCallback((videoId: string) => {
    dispatch({ type: 'ADD_TO_WATCH_LATER', payload: videoId });
    const updated = [...state.watchLaterVideos, videoId];
    localStorage.setItem('youtube_clone_watch_later', JSON.stringify(updated));
  }, [state.watchLaterVideos]);

  const removeFromWatchLater = useCallback((videoId: string) => {
    dispatch({ type: 'REMOVE_FROM_WATCH_LATER', payload: videoId });
    const updated = state.watchLaterVideos.filter(id => id !== videoId);
    localStorage.setItem('youtube_clone_watch_later', JSON.stringify(updated));
  }, [state.watchLaterVideos]);

  const isInWatchLater = useCallback((videoId: string) => {
    return state.watchLaterVideos.includes(videoId);
  }, [state.watchLaterVideos]);

  // UI actions
  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const addNotification = useCallback((notification: Omit<StrictNotification, 'id' | 'timestamp'>) => {
    const notificationWithId: StrictNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notificationWithId });
  }, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  // Initialize state from localStorage
  React.useEffect(() => {
    const initializeState = () => {
      try {
        // Initialize auth state
        const storedUser = localStorage.getItem('youtube_clone_user');
        const token = localStorage.getItem('youtube_clone_token');

        if (storedUser && token) {
          dispatch({ type: 'SET_USER', payload: JSON.parse(storedUser) });
        }

        // Initialize theme
        const storedTheme = localStorage.getItem('youtube_clone_theme') as 'light' | 'dark' | 'system';
        if (storedTheme) {
          dispatch({ type: 'SET_THEME', payload: storedTheme });
        }

        // Initialize watch later
        const storedWatchLater = localStorage.getItem('youtube_clone_watch_later');
        if (storedWatchLater) {
          const watchLaterVideos = JSON.parse(storedWatchLater);
          watchLaterVideos.forEach((videoId: string) => {
            dispatch({ type: 'ADD_TO_WATCH_LATER', payload: videoId });
          });
        }
      } catch (error) {
        console.error('Failed to initialize app state:', error);
      } finally {
        dispatch({ type: 'SET_AUTH_LOADING', payload: false });
      }
    };

    initializeState();
  }, []);

  const contextValue: UnifiedAppContextType = {
    state,
    login,
    logout,
    updateProfile,
    setTheme,
    openMiniplayer,
    closeMiniplayer,
    toggleMiniplayer,
    addToWatchLater,
    removeFromWatchLater,
    isInWatchLater,
    toggleSidebar,
    addNotification,
    removeNotification,
  };

  return (
    <UnifiedAppContext.Provider value={contextValue}>
      {children}
    </UnifiedAppContext.Provider>
  );
};

export default UnifiedAppProvider;