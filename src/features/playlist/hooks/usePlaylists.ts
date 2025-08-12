import { useQuery, useMutation, queryCache } from '@/hooks/unified/useApi';

import { playlistService, type PlaylistFilters, type CreatePlaylistData } from '../services/playlistService';
import type { Playlist } from '../../../types/core';

/**
 * Playlist Hooks
 * Comprehensive hooks for playlist management
 */

// Query hooks
export function usePlaylists(filters: PlaylistFilters = {}) {
  return useQuery(
    ['playlists', JSON.stringify(filters)],
    () => playlistService.getUserPlaylists(filters),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: true,
    }
  );
}

export function usePlaylist(playlistId: any) {
  return useQuery(
    ['playlist', playlistId],
    () => playlistService.getPlaylist(playlistId),
    {
      enabled: !!playlistId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function usePlaylistVideos(
  playlistId: any,
  page: number = 1,
  limit: number = 50
) {
  return useQuery(
    ['playlist', playlistId, 'videos', page.toString(), limit.toString()],
    () => playlistService.getPlaylistVideos(playlistId, page, limit),
    {
      enabled: !!playlistId,
      staleTime: 3 * 60 * 1000, // 3 minutes
    }
  );
}

export function useFeaturedPlaylists(page: number = 1, limit: number = 20) {
  return useQuery(
    ['playlists', 'featured', page.toString(), limit.toString()],
    () => playlistService.getFeaturedPlaylists(page, limit),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

export function useRecommendedPlaylists(page: number = 1, limit: number = 20) {
  return useQuery(
    ['playlists', 'recommended', page.toString(), limit.toString()],
    () => playlistService.getRecommendedPlaylists(page, limit),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function useFollowedPlaylists(page: number = 1, limit: number = 20) {
  return useQuery(
    ['playlists', 'followed', page.toString(), limit.toString()],
    () => playlistService.getFollowedPlaylists(page, limit),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

export function usePlaylistStats(playlistId: any) {
  return useQuery(
    ['playlist', playlistId, 'stats'],
    () => playlistService.getPlaylistStats(playlistId),
    {
      enabled: !!playlistId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function usePlaylistCollaborators(playlistId: any) {
  return useQuery(
    ['playlist', playlistId, 'collaborators'],
    () => playlistService.getPlaylistCollaborators(playlistId),
    {
      enabled: !!playlistId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function useSearchPlaylists(
  query: any,
  filters: Omit<PlaylistFilters, 'search'> = {}
) {
  return useQuery(
    ['playlists', 'search', query, JSON.stringify(filters)],
    () => playlistService.searchPlaylists(query, filters),
    {
      enabled: !!query && query.length > 2,
      staleTime: 3 * 60 * 1000, // 3 minutes
    }
  );
}

// Mutation hooks
export function useCreatePlaylist() {
  return useMutation<Playlist, CreatePlaylistData>(
    data => playlistService.createPlaylist(data),
    {
      onSuccess: () => {
        // Invalidate playlists cache
        queryCache.invalidate('playlists');
      },
    }
  );
}

export function useUpdatePlaylist() {
  return useMutation<
    Playlist,
    { id: string; data: Partial<CreatePlaylistData> }
  >(({ id, data }) => playlistService.updatePlaylist({ id, ...data }), {
    onSuccess: (_, { id }) => {
      // Invalidate specific playlist and playlists list
      queryCache.invalidate(`playlist:${id}`);
      queryCache.invalidate('playlists');
    },
  });
}

export function useDeletePlaylist() {
  return useMutation<void, string>(
    playlistId => playlistService.deletePlaylist(playlistId),
    {
      onSuccess: (_, playlistId) => {
        // Invalidate caches
        queryCache.invalidate(`playlist:${playlistId}`);
        queryCache.invalidate('playlists');
      },
    }
  );
}

export function useAddVideoToPlaylist() {
  return useMutation<
    void,
    { playlistId: string; videoId: string; position?: number }
  >(data => playlistService.addVideoToPlaylist(data), {
    onSuccess: (_, { playlistId }) => {
      // Invalidate playlist videos cache
      queryCache.invalidate(`playlist:${playlistId}:videos`);
      queryCache.invalidate(`playlist:${playlistId}`);
    },
  });
}

export function useRemoveVideoFromPlaylist() {
  return useMutation<void, { playlistId: string; videoId: string }>(
    ({ playlistId, videoId }) =>
      playlistService.removeVideoFromPlaylist(playlistId, videoId),
    {
      onSuccess: (_, { playlistId }) => {
        // Invalidate playlist videos cache
        queryCache.invalidate(`playlist:${playlistId}:videos`);
        queryCache.invalidate(`playlist:${playlistId}`);
      },
    }
  );
}

export function useReorderPlaylistVideos() {
  return useMutation<
    void,
    { playlistId: string; videoId: string; newPosition: number }
  >(data => playlistService.reorderPlaylistVideos(data), {
    onSuccess: (_, { playlistId }) => {
      // Invalidate playlist videos cache
      queryCache.invalidate(`playlist:${playlistId}:videos`);
    },
  });
}

export function useDuplicatePlaylist() {
  return useMutation<Playlist, { playlistId: string; newTitle?: string }>(
    ({ playlistId, newTitle }) =>
      playlistService.duplicatePlaylist(playlistId, newTitle),
    {
      onSuccess: () => {
        // Invalidate playlists cache
        queryCache.invalidate('playlists');
      },
    }
  );
}

export function useFollowPlaylist() {
  return useMutation<void, string>(
    playlistId => playlistService.followPlaylist(playlistId),
    {
      onSuccess: () => {
        // Invalidate followed playlists cache
        queryCache.invalidate('playlists:followed');
      },
    }
  );
}

export function useUnfollowPlaylist() {
  return useMutation<void, string>(
    playlistId => playlistService.unfollowPlaylist(playlistId),
    {
      onSuccess: () => {
        // Invalidate followed playlists cache
        queryCache.invalidate('playlists:followed');
      },
    }
  );
}

export function useBulkAddVideos() {
  return useMutation<
    { success: string; failed: string[] },
    { playlistId: string; videoIds: string[] }
  >(
    ({ playlistId, videoIds }) =>
      playlistService.bulkAddVideos(playlistId, videoIds),
    {
      onSuccess: (_, { playlistId }) => {
        // Invalidate playlist videos cache
        queryCache.invalidate(`playlist:${playlistId}:videos`);
        queryCache.invalidate(`playlist:${playlistId}`);
      },
    }
  );
}

export function useBulkRemoveVideos() {
  return useMutation<
    { success: string; failed: string[] },
    { playlistId: string; videoIds: string[] }
  >(
    ({ playlistId, videoIds }) =>
      playlistService.bulkRemoveVideos(playlistId, videoIds),
    {
      onSuccess: (_, { playlistId }) => {
        // Invalidate playlist videos cache
        queryCache.invalidate(`playlist:${playlistId}:videos`);
        queryCache.invalidate(`playlist:${playlistId}`);
      },
    }
  );
}

export function useUploadPlaylistThumbnail() {
  return useMutation<string, { playlistId: string; thumbnail: File }>(
    ({ playlistId, thumbnail }) =>
      playlistService.uploadThumbnail(playlistId, thumbnail),
    {
      onSuccess: (_, { playlistId }) => {
        // Invalidate playlist cache
        queryCache.invalidate(`playlist:${playlistId}`);
        queryCache.invalidate('playlists');
      },
    }
  );
}

// Combined hooks for common patterns
export function usePlaylistWithVideos(playlistId: any) {
  const playlist = usePlaylist(playlistId);
  const videos = usePlaylistVideos(playlistId);
  const stats = usePlaylistStats(playlistId);

  return {
    playlist: playlist.data,
    videos: videos.data || [],
    stats: stats.data,
    loading: playlist.loading || videos.loading || stats.loading,
    error: playlist.error || videos.error || stats.error,
    refetch: () => {
      playlist.refetch();
      videos.refetch();
      stats.refetch();
    },
  };
}

export function usePlaylistManagement() {
  const createPlaylist = useCreatePlaylist();
  const updatePlaylist = useUpdatePlaylist();
  const deletePlaylist = useDeletePlaylist();
  const addVideo = useAddVideoToPlaylist();
  const removeVideo = useRemoveVideoFromPlaylist();
  const reorderVideos = useReorderPlaylistVideos();

  return {
    create: createPlaylist.mutate,
    update: updatePlaylist.mutate,
    delete: deletePlaylist.mutate,
    addVideo: addVideo.mutate,
    removeVideo: removeVideo.mutate,
    reorderVideos: reorderVideos.mutate,
    loading:
      createPlaylist.loading ||
      updatePlaylist.loading ||
      deletePlaylist.loading,
    error: createPlaylist.error || updatePlaylist.error || deletePlaylist.error,
  };
}
