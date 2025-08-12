import { useQuery, useMutation, queryCache } from '@/hooks/unified/useApi';

import { commentService, type CommentFilters, type CreateCommentData } from '../services/commentService';
import type { Comment } from '../../../types/core';

/**
 * Comment Hooks
 * Comprehensive hooks for comment management
 */

// Query hooks
export function useVideoComments(videoId: any, filters: CommentFilters = {}) {
  return useQuery(
    ['comments', 'video', videoId, JSON.stringify(filters)],
    () => commentService.getVideoComments(videoId, filters),
    {
      enabled: !!videoId,
      staleTime: 30 * 1000, // 30 seconds
      refetchOnWindowFocus: true,
    }
  );
}

export function useCommentReplies(
  commentId: any,
  filters: Omit<CommentFilters, 'parentId'> = {}
) {
  return useQuery(
    ['comments', 'replies', commentId, JSON.stringify(filters)],
    () => commentService.getCommentReplies(commentId, filters),
    {
      enabled: !!commentId,
      staleTime: 60 * 1000, // 1 minute
    }
  );
}

export function useComment(commentId: any) {
  return useQuery(
    ['comment', commentId],
    () => commentService.getComment(commentId),
    {
      enabled: !!commentId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

export function useCommentThread(commentId: any) {
  return useQuery(
    ['comment', 'thread', commentId],
    () => commentService.getCommentThread(commentId),
    {
      enabled: !!commentId,
      staleTime: 60 * 1000, // 1 minute
    }
  );
}

export function useUserComments(
  userId: any,
  filters: Omit<CommentFilters, 'parentId'> = {}
) {
  return useQuery(
    ['comments', 'user', userId, JSON.stringify(filters)],
    () => commentService.getUserComments(userId, filters),
    {
      enabled: !!userId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

export function usePendingComments(
  videoId?: string,
  filters: CommentFilters = {}
) {
  return useQuery(
    ['comments', 'pending', videoId || '', JSON.stringify(filters)],
    () => commentService.getPendingComments(videoId, filters),
    {
      staleTime: 30 * 1000, // 30 seconds
      refetchOnWindowFocus: true,
    }
  );
}

export function useCommentStats(videoId: any) {
  return useQuery(
    ['comments', 'stats', videoId],
    () => commentService.getCommentStats(videoId),
    {
      enabled: !!videoId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function useTrendingComments(
  timeframe: '1h' | '24h' | '7d' | '30d' = '24h',
  limit: number = 20
) {
  return useQuery(
    ['comments', 'trending', timeframe, limit.toString()],
    () => commentService.getTrendingComments(timeframe, limit),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function useCommentMentions(userId: any, filters: CommentFilters = {}) {
  return useQuery(
    ['comments', 'mentions', userId, JSON.stringify(filters)],
    () => commentService.getCommentMentions(userId, filters),
    {
      enabled: !!userId,
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: true,
    }
  );
}

export function useCommentAnalytics(
  videoId: any,
  timeframe: '7d' | '30d' | '90d' = '30d'
) {
  return useQuery(
    ['comments', 'analytics', videoId, timeframe],
    () => commentService.getCommentAnalytics(videoId, timeframe),
    {
      enabled: !!videoId,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

export function useSearchComments(
  query: any,
  videoId?: string,
  filters: CommentFilters = {}
) {
  return useQuery(
    ['comments', 'search', query, videoId || '', JSON.stringify(filters)],
    () => commentService.searchComments(query, videoId, filters),
    {
      enabled: !!query && query.length > 2,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

// Mutation hooks
export function useCreateComment() {
  return useMutation<Comment, CreateCommentData>(
    data => commentService.createComment(data),
    {
      onSuccess: (_, { videoId, parentId }) => {
        // Invalidate relevant caches
        queryCache.invalidate(`comments:video:${videoId}`);
        if (parentId) {
          queryCache.invalidate(`comments:replies:${parentId}`);
          queryCache.invalidate(`comment:thread:${parentId}`);
        }
        queryCache.invalidate(`comments:stats:${videoId}`);
      },
    }
  );
}

export function useUpdateComment() {
  return useMutation<Comment, { commentId: string; content: string }>(
    data => commentService.updateComment(data),
    {
      onSuccess: updatedComment => {
        // Invalidate comment cache
        queryCache.invalidate(`comment:${updatedComment.id}`);
        if (updatedComment.videoId) {
          queryCache.invalidate(`comments:video:${updatedComment.videoId}`);
        }
        if (updatedComment.parentId) {
          queryCache.invalidate(`comments:replies:${updatedComment.parentId}`);
        }
      },
    }
  );
}

export function useDeleteComment() {
  return useMutation<void, string>(
    commentId => commentService.deleteComment(commentId),
    {
      onSuccess: (_, commentId) => {
        // Invalidate all comment-related caches
        queryCache.invalidate(`comment:${commentId}`);
        queryCache.invalidate('comments');
      },
    }
  );
}

export function useReactToComment() {
  return useMutation<
    void,
    {
      commentId: string;
      type: 'like' | 'dislike' | 'heart' | 'laugh' | 'angry' | 'sad';
    }
  >(data => commentService.reactToComment(data), {
    onSuccess: (_, { commentId }) => {
      // Invalidate comment cache
      queryCache.invalidate(`comment:${commentId}`);
    },
  });
}

export function useRemoveReaction() {
  return useMutation<void, string>(
    commentId => commentService.removeReaction(commentId),
    {
      onSuccess: (_, commentId) => {
        // Invalidate comment cache
        queryCache.invalidate(`comment:${commentId}`);
      },
    }
  );
}

export function usePinComment() {
  return useMutation<void, string>(
    commentId => commentService.pinComment(commentId),
    {
      onSuccess: (_, commentId) => {
        // Invalidate comment and video comments cache
        queryCache.invalidate(`comment:${commentId}`);
        queryCache.invalidate('comments:video');
      },
    }
  );
}

export function useUnpinComment() {
  return useMutation<void, string>(
    commentId => commentService.unpinComment(commentId),
    {
      onSuccess: (_, commentId) => {
        // Invalidate comment and video comments cache
        queryCache.invalidate(`comment:${commentId}`);
        queryCache.invalidate('comments:video');
      },
    }
  );
}

export function useHeartComment() {
  return useMutation<void, string>(
    commentId => commentService.heartComment(commentId),
    {
      onSuccess: (_, commentId) => {
        // Invalidate comment cache
        queryCache.invalidate(`comment:${commentId}`);
      },
    }
  );
}

export function useUnheartComment() {
  return useMutation<void, string>(
    commentId => commentService.unheartComment(commentId),
    {
      onSuccess: (_, commentId) => {
        // Invalidate comment cache
        queryCache.invalidate(`comment:${commentId}`);
      },
    }
  );
}

export function useReportComment() {
  return useMutation<
    void,
    { commentId: string; reason: string; description?: string }
  >(
    ({ commentId, reason, description }) =>
      commentService.reportComment(commentId, reason, description),
    {
      onSuccess: () => {},
    }
  );
}

export function useModerateComment() {
  return useMutation<
    void,
    {
      commentId: string;
      action: 'approve' | 'reject' | 'hold' | 'spam';
      reason?: string;
    }
  >(data => commentService.moderateComment(data), {
    onSuccess: (_, { commentId }) => {
      // Invalidate moderation-related caches
      queryCache.invalidate(`comment:${commentId}`);
      queryCache.invalidate('comments:pending');
    },
  });
}

export function useBulkModerateComments() {
  return useMutation<
    { success: string; failed: string[] },
    {
      commentIds: string;
      action: 'approve' | 'reject' | 'hold' | 'spam';
      reason?: string;
    }
  >(
    ({ commentIds, action, reason }) =>
      commentService.bulkModerateComments(commentIds, action, reason),
    {
      onSuccess: () => {
        // Invalidate moderation-related caches
        queryCache.invalidate('comments:pending');
        queryCache.invalidate('comments');
      },
    }
  );
}

export function useAutoModerateComments() {
  return useMutation<any, { videoId: string; settings }>(
    ({ videoId, settings }) =>
      commentService.autoModerateComments(videoId, settings),
    {
      onSuccess: (_, { videoId }) => {
        // Invalidate video comments cache
        queryCache.invalidate(`comments:video:${videoId}`);
        queryCache.invalidate('comments:pending');
      },
    }
  );
}

export function useMarkMentionsAsRead() {
  return useMutation<void, string[]>(
    commentIds => commentService.markMentionsAsRead(commentIds),
    {
      onSuccess: () => {
        // Invalidate mentions cache
        queryCache.invalidate('comments:mentions');
      },
    }
  );
}

// Combined hooks for common patterns
export function useCommentManagement(videoId: any) {
  const comments = useVideoComments(videoId);
  const stats = useCommentStats(videoId);
  const createComment = useCreateComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const moderateComment = useModerateComment();

  return {
    comments: comments.data || [],
    stats: stats.data,
    loading: comments.loading || stats.loading,
    error: comments.error || stats.error,
    actions: {
      create: createComment.mutate,
      update: updateComment.mutate,
      delete: deleteComment.mutate,
      moderate: moderateComment.mutate,
    },
    refetch: () => {
      comments.refetch();
      stats.refetch();
    },
  };
}

export function useCommentInteractions(_commentId: any) {
  const reactToComment = useReactToComment();
  const removeReaction = useRemoveReaction();
  const pinComment = usePinComment();
  const unpinComment = useUnpinComment();
  const heartComment = useHeartComment();
  const unheartComment = useUnheartComment();
  const reportComment = useReportComment();

  return {
    react: reactToComment.mutate,
    removeReaction: removeReaction.mutate,
    pin: pinComment.mutate,
    unpin: unpinComment.mutate,
    heart: heartComment.mutate,
    unheart: unheartComment.mutate,
    report: reportComment.mutate,
    loading:
      reactToComment.loading || pinComment.loading || heartComment.loading,
  };
}
