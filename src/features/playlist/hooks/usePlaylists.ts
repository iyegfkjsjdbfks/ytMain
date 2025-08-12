import { useQuery, useMutation, queryCache } from '@/hooks/unified/useApi';

import { playlistService, type PlaylistFilters, type CreatePlaylistData } from '../services/playlistService';
import type { Playlist } from '../../../types/core';

/**
 * Playlist Hooks
 * Comprehensive hooks for playlist management
 */

// Query hooks
export function usePlaylists(filters: PlaylistFilters = {}): any {
  return useQuery(
    ['playlists', JSON.stringify(filters)],
    () => playlistService.getUserPlaylists(filters),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes,
  refetchOnWindowFocus: true }
  );
}

export function usePlaylist(playlistId: any): any {
  return useQuery(
    ['playlist', playlistId],
    () => playlistService.getPlaylist(playlistId),
    {
      enabled: !!playlistId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function usePlaylistVideos(,
  playlistId: any,
  page: number = 1,
  limit: number = 50
): any {
  return useQuery(
    ['playlist', playlistId, 'videos', page.toString(), limit.toString()],
    () => playlistService.getPlaylistVideos(playlistId, page, limit),
    {
      enabled: !!playlistId,
      staleTime: 3 * 60 * 1000, // 3 minutes
    }
  );
}

export function useFeaturedPlaylists(page: number = 1, limit: number = 20): any {
  return useQuery(
    ['playlists', 'featured', page.toString(), limit.toString()],
    () => playlistService.getFeaturedPlaylists(page, limit),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

export function useRecommendedPlaylists(page: number = 1, limit: number = 20): any {
  return useQuery(
    ['playlists', 'recommended', page.toString(), limit.toString()],
    () => playlistService.getRecommendedPlaylists(page, limit),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function useFollowedPlaylists(page: number = 1, limit: number = 20): any {
  return useQuery(
    ['playlists', 'followed', page.toString(), limit.toString()],
    () => playlistService.getFollowedPlaylists(page, limit),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

export function usePlaylistStats(playlistId: any): any {
  return useQuery(
    ['playlist', playlistId, 'stats'],
    () => playlistService.getPlaylistStats(playlistId),
    {
      enabled: !!playlistId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function usePlaylistCollaborators(playlistId: any): any {
  return useQuery(
    ['playlist', playlistId, 'collaborators'],
    () => playlistService.getPlaylistCollaborators(playlistId),
    {
      enabled: !!playlistId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function useSearchPlaylists(,
  query: any,
  filters: Omit<PlaylistFilters, 'search'> = {}
): any {
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
export function useCreatePlaylist(): any {
  return useMutation<Playlist, CreatePlaylistData>(
    data => playlistService.createPlaylist(data),
    {
      onSuccess: () => {
        // Invalidate playlists cache
        queryCache.invalidate('playlists');
      } }
  );
}

export function useUpdatePlaylist(): any {
  return useMutation<
    Playlist,
    { id: string; data: Partial<CreatePlaylistData> }
  >(({ id, data }: any) => playlistService.updatePlaylist({ id, ...data }), {
    onSuccess: (_, { id }) => {
      // Invalidate specific playlist and playlists list
      queryCache.invalidate(`playlist:${id}`);
      queryCache.invalidate('playlists');
    } });
}

export function useDeletePlaylist(): any {
  return useMutation<void, string>(
    playlistId => playlistService.deletePlaylist(playlistId),
    {
      onSuccess: (_: any, playlistId: any) => {
        // Invalidate caches
        queryCache.invalidate(`playlist:${playlistId}`);
        queryCache.invalidate('playlists');
      } }
  );
}

export function useAddVideoToPlaylist(): any {
  return useMutation<
    void,
    { playlistId: string; videoId: string; position?: number }
  >(data => playlistService.addVideoToPlaylist(data), {
    onSuccess: (_, { playlistId }) => {
      // Invalidate playlist videos cache
      queryCache.invalidate(`playlist:${playlistId}:videos`);
      queryCache.invalidate(`playlist:${playlistId}`);
    } });
}

export function useRemoveVideoFromPlaylist(): any {
  return useMutation<void, { playlistId: string; videoId: string }>(
    ({ playlistId, videoId }: any) =>
      playlistService.removeVideoFromPlaylist(playlistId, videoId),
    {
      onSuccess: (_, { playlistId }) => {
        // Invalidate playlist videos cache
        queryCache.invalidate(`playlist:${playlistId}:videos`);
        queryCache.invalidate(`playlist:${playlistId}`);
      } }
  );
}

export function useReorderPlaylistVideos(): any {
  return useMutation<
    void,
    { playlistId: string; videoId: string; newPosition: number }
  >(data => playlistService.reorderPlaylistVideos(data), {
    onSuccess: (_, { playlistId }) => {
      // Invalidate playlist videos cache
      queryCache.invalidate(`playlist:${playlistId}:videos`);
    } });
}

export function useDuplicatePlaylist(): any {
  return useMutation<Playlist, { playlistId: string; newTitle?: string }>(
    ({ playlistId, newTitle }: any) =>
      playlistService.duplicatePlaylist(playlistId, newTitle),
    {
      onSuccess: () => {
        // Invalidate playlists cache
        queryCache.invalidate('playlists');
      } }
  );
}

export function useFollowPlaylist(): any {
  return useMutation<void, string>(
    playlistId => playlistService.followPlaylist(playlistId),
    {
      onSuccess: () => {
        // Invalidate followed playlists cache
        queryCache.invalidate('playlists: followed')
      } }
  );
}

export function useUnfollowPlaylist(): any {
  return useMutation<void, string>(
    playlistId => playlistService.unfollowPlaylist(playlistId),
    {
      onSuccess: () => {
        // Invalidate followed playlists cache
        queryCache.invalidate('playlists: followed')
      } }
  );
}

export function useBulkAddVideos(): any {
  return useMutation<
    { success: string; failed: string[] },
    { playlistId: string; videoIds: string[] }
  >(
    ({ playlistId, videoIds }: any) =>
      playlistService.bulkAddVideos(playlistId, videoIds),
    {
      onSuccess: (_, { playlistId }) => {
        // Invalidate playlist videos cache
        queryCache.invalidate(`playlist:${playlistId}:videos`);
        queryCache.invalidate(`playlist:${playlistId}`);
      } }
  );
}

export function useBulkRemoveVideos(): any {
  return useMutation<
    { success: string; failed: string[] },
    { playlistId: string; videoIds: string[] }
  >(
    ({ playlistId, videoIds }: any) =>
      playlistService.bulkRemoveVideos(playlistId, videoIds),
    {
      onSuccess: (_, { playlistId }) => {
        // Invalidate playlist videos cache
        queryCache.invalidate(`playlist:${playlistId}:videos`);
        queryCache.invalidate(`playlist:${playlistId}`);
      } }
  );
}

export function useUploadPlaylistThumbnail(): any {
  return useMutation<string, { playlistId: string; thumbnail: File }>(
    ({ playlistId, thumbnail }: any) =>
      playlistService.uploadThumbnail(playlistId, thumbnail),
    {
      onSuccess: (_, { playlistId }) => {
        // Invalidate playlist cache
        queryCache.invalidate(`playlist:${playlistId}`);
        queryCache.invalidate('playlists');
      } }
  );
}

// Combined hooks for common patterns
export function usePlaylistWithVideos(playlistId: any): any {
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
      playlist.re(fetch as any)();
      videos.re(fetch as any)();
      stats.re(fetch as any)();
    } };
}

export function usePlaylistManagement(): any {
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
    error: createPlaylist.error || updatePlaylist.error || deletePlaylist.error };
}
