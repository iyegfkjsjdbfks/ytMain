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
    home: Video;
    trending: Video;
    subscriptions: Video;
    watchLater: Video;
    history: Video;
    liked: Video;
  };

  // Channel State
  channels: {
    subscribed: Channel;
    recommended: Channel;
  };

  // Playlist State
  playlists: UserPlaylist;

  // Search State
  search: {
    query: string;
    results: Video;
    suggestions: string;
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
  setSidebarCollapsed: (collapsed) => void;
  showMiniplayer: (video: Video) => void;
  hideMiniplayer: () => void;

  // User Actions
  setUser: (user: Partial<AppState['user']>) => void;
  logout: () => void;

  // Video Actions
  setVideos: (category: keyof AppState['videos'], videos: Video) => void;
  addToWatchLater: (video: Video) => void;
  removeFromWatchLater: (videoId) => void;
  addToHistory: (video: Video) => void;
  clearHistory: () => void;
  likeVideo: (video: Video) => void;
  unlikeVideo: (videoId) => void;

  // Channel Actions
  setChannels: (category: keyof AppState['channels'], channels: Channel) => void;
  subscribeToChannel: (channel: Channel) => void;
  unsubscribeFromChannel: (channelId) => void;

  // Playlist Actions
  setPlaylists: (playlists: UserPlaylist) => void;
  createPlaylist: (playlist: Omit<UserPlaylist, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePlaylist: (id, updates: Partial<UserPlaylist>) => void;
  deletePlaylist: (id) => void;
  addVideoToPlaylist: (playlistId, video: Video) => void;
  removeVideoFromPlaylist: (playlistId, videoId) => void;

  // Search Actions
  setSearchQuery: (query) => void;
  setSearchResults: (results: Video) => void;
  setSearchSuggestions: (suggestions) => void;
  setSearchLoading: (loading) => void;
  clearSearch: () => void;

  // Loading Actions
  setLoading: (category: keyof AppState['loading'], loading) => void;

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
        immer((set) => ({
          ...initialState,

          // UI Actions
          setTheme: (theme) => set((state) => {
            state.theme = theme;
          }),

          toggleSidebar: () => set((state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
          }),

          setSidebarCollapsed: (collapsed) => set((state) => {
            state.sidebarCollapsed = collapsed;
          }),

          showMiniplayer: (video) => set((state) => {
            state.miniplayerVisible = true;
            state.miniplayerVideo = video;
          }),

          hideMiniplayer: () => set((state) => {
            state.miniplayerVisible = false;
            state.miniplayerVideo = null;
          }),

          // User Actions
          setUser: (user) => set((state) => {
            Object.assign(state.user, user);
          }),

          logout: () => set((state) => {
            state.user = initialState.user;
            state.videos.subscriptions = [];
            state.videos.watchLater = [];
            state.videos.history = [];
            state.videos.liked = [];
            state.channels.subscribed = [];
            state.playlists = [];
          }),

          // Video Actions
          setVideos: (category, videos) => set((state) => {
            state.videos[category] = videos;
          }),

          addToWatchLater: (video) => set((state) => {
            const exists = state.videos.watchLater.find((v: Video) => v.id === video.id);
            if (!exists) {
              state.videos.watchLater.unshift(video);
            }
          }),

          removeFromWatchLater: (videoId) => set((state) => {
            state.videos.watchLater = state.videos.watchLater.filter((v: Video) => v.id !== videoId);
          }),

          addToHistory: (video) => set((state) => {
            // Remove if already exists
            state.videos.history = state.videos.history.filter((v: Video) => v.id !== video.id);
            // Add to beginning
            state.videos.history.unshift(video);
            // Keep only last 100 videos
            if (state.videos.history.length > 100) {
              state.videos.history = state.videos.history.slice(0, 100);
            }
          }),

          clearHistory: () => set((state) => {
            state.videos.history = [];
          }),

          likeVideo: (video) => set((state) => {
            const exists = state.videos.liked.find((v: Video) => v.id === video.id);
            if (!exists) {
              state.videos.liked.unshift(video);
            }
          }),

          unlikeVideo: (videoId) => set((state) => {
            state.videos.liked = state.videos.liked.filter((v: Video) => v.id !== videoId);
          }),

          // Channel Actions
          setChannels: (category, channels) => set((state) => {
            state.channels[category] = channels;
          }),

          subscribeToChannel: (channel) => set((state) => {
            const exists = state.channels.subscribed.find((c) => c.id === channel.id);
            if (!exists) {
              state.channels.subscribed.push(channel);
            }
          }),

          unsubscribeFromChannel: (channelId) => set((state) => {
            state.channels.subscribed = state.channels.subscribed.filter((c) => c.id !== channelId);
          }),

          // Playlist Actions
          setPlaylists: (playlists) => set((state) => {
            state.playlists = playlists;
          }),

          createPlaylist: (playlist) => set((state) => {
            const newPlaylist: UserPlaylist = {
              ...playlist,
              id: `playlist_${Date.now()}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            state.playlists.push(newPlaylist);
          }),

          updatePlaylist: (id, updates) => set((state) => {
            const index = state.playlists.findIndex((p) => p.id === id);
            if (index !== -1) {
              Object.assign(state.playlists[index], updates, {
                updatedAt: new Date().toISOString(),
              });
            }
          }),

          deletePlaylist: (id) => set((state) => {
            state.playlists = state.playlists.filter((p) => p.id !== id);
          }),

          addVideoToPlaylist: (playlistId, video) => set((state) => {
            const playlist = state.playlists.find((p) => p.id === playlistId);
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

          removeVideoFromPlaylist: (playlistId, videoId) => set((state) => {
            const playlist = state.playlists.find((p) => p.id === playlistId);
            if (playlist?.videos) {
              playlist.videos = playlist.videos.filter((v: Video) => v.id !== videoId);
              playlist.videoCount = playlist.videos.length;
              playlist.updatedAt = new Date().toISOString();
            }
          }),

          // Search Actions
          setSearchQuery: (query) => set((state) => {
            state.search.query = query;
          }),

          setSearchResults: (results) => set((state) => {
            state.search.results = results;
          }),

          setSearchSuggestions: (suggestions) => set((state) => {
            state.search.suggestions = suggestions;
          }),

          setSearchLoading: (loading) => set((state) => {
            state.search.isLoading = loading;
          }),

          clearSearch: () => set((state) => {
            state.search.query = '';
            state.search.results = [];
            state.search.suggestions = [];
            state.search.isLoading = false;
          }),

          // Loading Actions
          setLoading: (category, loading) => set((state) => {
            state.loading[category] = loading;
          }),

          // Error Actions
          setError: (category, error: Error) => set((state) => {
            state.errors[category] = error;
          }),

          clearErrors: () => set((state) => {
            state.errors = initialState.errors;
          }),

          // Utility Actions
          reset: () => set(() => initialState),
        })),
      ),
      {
        name: 'youtube-studio-store',
        partialize: (state) => ({
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
export const useTheme = () => useAppStore((state) => state.theme);
export const useSidebar = () => useAppStore((state) => ({
  collapsed: state.sidebarCollapsed,
  toggle: state.toggleSidebar,
  setCollapsed: state.setSidebarCollapsed,
}));
export const useMiniplayer = () => useAppStore((state) => ({
  visible: state.miniplayerVisible,
  video: state.miniplayerVideo,
  show: state.showMiniplayer,
  hide: state.hideMiniplayer,
}));
export const useUser = () => useAppStore((state) => ({
  ...state.user,
  setUser: state.setUser,
  logout: state.logout,
}));
export const useVideos = (category?: keyof AppState['videos']) => {
  return useAppStore((state) => {
    if (category) {
      return {
        videos: state.videos[category],
        setVideos: (videos: Video) => state.setVideos(category, videos),
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
export const useChannels = () => useAppStore((state) => ({
  ...state.channels,
  setChannels: state.setChannels,
  subscribe: state.subscribeToChannel,
  unsubscribe: state.unsubscribeFromChannel,
  loading: state.loading.channels,
  error: state.errors.channels,
}));
export const usePlaylists = () => useAppStore((state) => ({
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
export const useSearch = () => useAppStore((state) => ({
  ...state.search,
  setQuery: state.setSearchQuery,
  setResults: state.setSearchResults,
  setSuggestions: state.setSearchSuggestions,
  setLoading: state.setSearchLoading,
  clear: state.clearSearch,
}));