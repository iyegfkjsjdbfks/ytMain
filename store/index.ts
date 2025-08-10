// TODO: Fix import - import { create } from 'zustand';
// TODO: Fix import - import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
// TODO: Fix import - import { immer } from 'zustand/middleware/immer';

import type { Video, Channel } from '../src/types/core';
import type { UserPlaylist } from '../types';

// App State Interface
interface AppState {
  // UI State
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  miniplayerVisible: boolean;
  miniplayerVideo: Video | null;

  // User State
  user: {
    id: string | null;
    name: string | null;
    avatar: string | null;
    isAuthenticated: boolean;
  };

  // Video State
  videos: {
    home: Video[];
    trending: Video[];
    subscriptions: Video[];
    watchLater: Video[];
    history: Video[];
    liked: Video[];
  };

  // Channel State
  channels: {
    subscribed: Channel[];
    recommended: Channel[];
  };

  // Playlist State
  playlists: UserPlaylist[];

  // Search State
  search: {
    query: string;
    results: Video[];
    suggestions: string[];
    isLoading: boolean;
  };

  // Loading States
  loading: {
    videos: boolean;
    channels: boolean;
    playlists: boolean;
    user: boolean;
  };

  // Error States
  errors: {
    videos: string | null;
    channels: string | null;
    playlists: string | null;
    user: string | null;
  };
}

// Actions Interface
interface AppActions {
  // UI Actions
  setTheme: (theme: AppState['theme']) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  showMiniplayer: (video: Video) => void;
  hideMiniplayer: () => void;

  // User Actions
  setUser: (user: Partial<AppState['user']>) => void;
  logout: () => void;

  // Video Actions
  setVideos: (category: keyof AppState['videos'], videos: Video[]) => void;
  addToWatchLater: (video: Video) => void;
  removeFromWatchLater: (videoId: string) => void;
  addToHistory: (video: Video) => void;
  clearHistory: () => void;
  likeVideo: (video: Video) => void;
  unlikeVideo: (videoId: string) => void;

  // Channel Actions
  setChannels: (category: keyof AppState['channels'], channels: Channel[]) => void;
  subscribeToChannel: (channel: Channel) => void;
  unsubscribeFromChannel: (channelId: string) => void;

  // Playlist Actions
  setPlaylists: (playlists: UserPlaylist[]) => void;
  createPlaylist: (playlist: Omit<UserPlaylist, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePlaylist: (id: string, updates: Partial<UserPlaylist>) => void;
  deletePlaylist: (id: string) => void;
  addVideoToPlaylist: (playlistId: string, video: Video) => void;
  removeVideoFromPlaylist: (playlistId: string, videoId: string) => void;

  // Search Actions
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: Video[]) => void;
  setSearchSuggestions: (suggestions: string[]) => void;
  setSearchLoading: (loading: boolean) => void;
  clearSearch: () => void;

  // Loading Actions
  setLoading: (category: keyof AppState['loading'], loading: boolean) => void;

  // Error Actions
  setError: (category: keyof AppState['errors'], error: string | null) => void;
  clearErrors: () => void;

  // Utility Actions
  reset: () => void;
}

// Initial State
const initialState: AppState = {
  theme: 'system',
  sidebarCollapsed: false,
  miniplayerVisible: false,
  miniplayerVideo: null,

  user: {
    id: null,
    name: null,
    avatar: null,
    isAuthenticated: false,
  },

  videos: {
    home: [],
    trending: [],
    subscriptions: [],
    watchLater: [],
    history: [],
    liked: [],
  },

  channels: {
    subscribed: [],
    recommended: [],
  },

  playlists: [],

  search: {
    query: '',
    results: [],
    suggestions: [],
    isLoading: false,
  },

  loading: {
    videos: false,
    channels: false,
    playlists: false,
    user: false,
  },

  errors: {
    videos: null,
    channels: null,
    playlists: null,
    user: null,
  },
};

// Create Store
export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set: any) => ({
          ...initialState,

          // UI Actions
          setTheme: (theme: any) => set((state: any) => {
            state.theme = theme;
          }),

          toggleSidebar: () => set((state: any) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
          }),

          setSidebarCollapsed: (collapsed: any) => set((state: any) => {
            state.sidebarCollapsed = collapsed;
          }),

          showMiniplayer: (video: any) => set((state: any) => {
            state.miniplayerVisible = true;
            state.miniplayerVideo = video;
          }),

          hideMiniplayer: () => set((state: any) => {
            state.miniplayerVisible = false;
            state.miniplayerVideo = null;
          }),

          // User Actions
          setUser: (user: any) => set((state: any) => {
            Object.assign(state.user, user);
          }),

          logout: () => set((state: any) => {
            state.user = initialState.user;
            state.videos.subscriptions = [];
            state.videos.watchLater = [];
            state.videos.history = [];
            state.videos.liked = [];
            state.channels.subscribed = [];
            state.playlists = [];
          }),

          // Video Actions
          setVideos: (category: any, videos: any) => set((state: any) => {
            state.videos[category] = videos;
          }),

          addToWatchLater: (video: any) => set((state: any) => {
            const exists = state.videos.watchLater.find((v: Video) => v.id === video.id);
            if (!exists) {
              state.videos.watchLater.unshift(video);
            }
          }),

          removeFromWatchLater: (videoId: any) => set((state: any) => {
            state.videos.watchLater = state.videos.watchLater.filter((v: Video) => v.id !== videoId);
          }),

          addToHistory: (video: any) => set((state: any) => {
            // Remove if already exists
            state.videos.history = state.videos.history.filter((v: Video) => v.id !== video.id);
            // Add to beginning
            state.videos.history.unshift(video);
            // Keep only last 100 videos
            if (state.videos.history.length > 100) {
              state.videos.history = state.videos.history.slice(0, 100);
            }
          }),

          clearHistory: () => set((state: any) => {
            state.videos.history = [];
          }),

          likeVideo: (video: any) => set((state: any) => {
            const exists = state.videos.liked.find((v: Video) => v.id === video.id);
            if (!exists) {
              state.videos.liked.unshift(video);
            }
          }),

          unlikeVideo: (videoId: any) => set((state: any) => {
            state.videos.liked = state.videos.liked.filter((v: Video) => v.id !== videoId);
          }),

          // Channel Actions
          setChannels: (category: any, channels: any) => set((state: any) => {
            state.channels[category] = channels;
          }),

          subscribeToChannel: (channel: any) => set((state: any) => {
            const exists = state.channels.subscribed.find((c: any) => c.id === channel.id);
            if (!exists) {
              state.channels.subscribed.push(channel);
            }
          }),

          unsubscribeFromChannel: (channelId: any) => set((state: any) => {
            state.channels.subscribed = state.channels.subscribed.filter((c: any) => c.id !== channelId);
          }),

          // Playlist Actions
          setPlaylists: (playlists: any) => set((state: any) => {
            state.playlists = playlists;
          }),

          createPlaylist: (playlist: any) => set((state: any) => {
            const newPlaylist: UserPlaylist = {
              ...playlist,
              id: `playlist_${Date.now()}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            state.playlists.push(newPlaylist);
          }),

          updatePlaylist: (id: string, updates: any) => set((state: any) => {
            const index = state.playlists.findIndex((p: any) => p.id === id);
            if (index !== -1) {
              Object.assign(state.playlists[index], updates, {
                updatedAt: new Date().toISOString(),
              });
            }
          }),

          deletePlaylist: (id: string) => set((state: any) => {
            state.playlists = state.playlists.filter((p: any) => p.id !== id);
          }),

          addVideoToPlaylist: (playlistId: any, video: any) => set((state: any) => {
            const playlist = state.playlists.find((p: any) => p.id === playlistId);
            if (playlist) {
              const exists = playlist.videos?.find((v: Video) => v.id === video.id);
              if (!exists) {
                if (!playlist.videos) {
playlist.videos = [];
}
                playlist.videos.push(video);
                playlist.videoCount = playlist.videos.length;
                playlist.updatedAt = new Date().toISOString();
              }
            }
          }),

          removeVideoFromPlaylist: (playlistId: any, videoId: any) => set((state: any) => {
            const playlist = state.playlists.find((p: any) => p.id === playlistId);
            if (playlist?.videos) {
              playlist.videos = playlist.videos.filter((v: Video) => v.id !== videoId);
              playlist.videoCount = playlist.videos.length;
              playlist.updatedAt = new Date().toISOString();
            }
          }),

          // Search Actions
          setSearchQuery: (query: any) => set((state: any) => {
            state.search.query = query;
          }),

          setSearchResults: (results: any) => set((state: any) => {
            state.search.results = results;
          }),

          setSearchSuggestions: (suggestions: any) => set((state: any) => {
            state.search.suggestions = suggestions;
          }),

          setSearchLoading: (loading: any) => set((state: any) => {
            state.search.isLoading = loading;
          }),

          clearSearch: () => set((state: any) => {
            state.search.query = '';
            state.search.results = [];
            state.search.suggestions = [];
            state.search.isLoading = false;
          }),

          // Loading Actions
          setLoading: (category: any, loading: any) => set((state: any) => {
            state.loading[category] = loading;
          }),

          // Error Actions
          setError: (category: any, error: Error) => set((state: any) => {
            state.errors[category] = error;
          }),

          clearErrors: () => set((state: any) => {
            state.errors = initialState.errors;
          }),

          // Utility Actions
          reset: () => set(() => initialState),
        })),
      ),
      {
        name: 'youtube-studio-store',
        partialize: (state: any) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
          user: state.user,
          videos: {
            watchLater: state.videos.watchLater,
            history: state.videos.history,
            liked: state.videos.liked,
          },
          channels: {
            subscribed: state.channels.subscribed,
          },
          playlists: state.playlists,
        }),
      },
    ),
    {
      name: 'youtube-studio-store',
    },
  ));

// Selectors
export const useTheme = () => useAppStore((state: any) => state: any.theme);
export const useSidebar = () => useAppStore((state: any) => ({
  collapsed: state.sidebarCollapsed,
  toggle: state.toggleSidebar,
  setCollapsed: state.setSidebarCollapsed,
}));
export const useMiniplayer = () => useAppStore((state: any) => ({
  visible: state.miniplayerVisible,
  video: state.miniplayerVideo,
  show: state.showMiniplayer,
  hide: state.hideMiniplayer,
}));
export const useUser = () => useAppStore((state: any) => ({
  ...state.user,
  setUser: state.setUser,
  logout: state.logout,
}));
export const useVideos = (category?: keyof AppState['videos']) => {
  return useAppStore((state: any) => {
    if (category) {
      return {
        videos: state.videos[category],
        setVideos: (videos: Video[]) => state.setVideos(category, videos),
        loading: state.loading.videos,
        error: state.errors.videos,
      };
    }
    return {
      videos: state.videos,
      setVideos: state.setVideos,
      addToWatchLater: state.addToWatchLater,
      removeFromWatchLater: state.removeFromWatchLater,
      addToHistory: state.addToHistory,
      clearHistory: state.clearHistory,
      likeVideo: state.likeVideo,
      unlikeVideo: state.unlikeVideo,
      loading: state.loading.videos,
      error: state.errors.videos,
    };
  });
};
export const useChannels = () => useAppStore((state: any) => ({
  ...state.channels,
  setChannels: state.setChannels,
  subscribe: state.subscribeToChannel,
  unsubscribe: state.unsubscribeFromChannel,
  loading: state.loading.channels,
  error: state.errors.channels,
}));
export const usePlaylists = () => useAppStore((state: any) => ({
  playlists: state.playlists,
  setPlaylists: state.setPlaylists,
  create: state.createPlaylist,
  update: state.updatePlaylist,
  delete: state.deletePlaylist,
  addVideo: state.addVideoToPlaylist,
  removeVideo: state.removeVideoFromPlaylist,
  loading: state.loading.playlists,
  error: state.errors.playlists,
}));
export const useSearch = () => useAppStore((state: any) => ({
  ...state.search,
  setQuery: state.setSearchQuery,
  setResults: state.setSearchResults,
  setSuggestions: state.setSearchSuggestions,
  setLoading: state.setSearchLoading,
  clear: state.clearSearch,
}));