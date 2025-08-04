import React from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React from "react";
import { useState, useEffect } from 'react';
import React from "react";
import { videoService } from '../services/videoService';




interface VideoInteractionState {
  isLiked: boolean;
  isDisliked: boolean;
  isSaved: boolean;
  likes: number;
  dislikes: number;
}

interface UseVideoInteractionsOptions {
  initialLikes?: number;
  initialDislikes?: number;
  initialIsLiked?: boolean;
  initialIsDisliked?: boolean;
  initialIsSaved?: boolean;
}

export function useVideoInteractions(
  videoId: string,
  options: UseVideoInteractionsOptions = {},
) {
  const queryClient = useQueryClient();

  const [state, setState] = useState<VideoInteractionState>({
    isLiked: options.initialIsLiked || false,
    isDisliked: options.initialIsDisliked || false,
    isSaved: options.initialIsSaved || false,
    likes: options.initialLikes || 0,
    dislikes: options.initialDislikes || 0,
  });

  // Fetch current interaction state
  const { data: interactionData, isLoading: isLoadingInteractions } = useQuery({
    queryKey: ['video-interactions', videoId],
    queryFn: () => videoService.getVideoInteractions(videoId),
    enabled: !!videoId,
  });

  // Update state when data is loaded
  useEffect(() => {
    if (interactionData) {
      setState({
        isLiked: interactionData.isLiked,
        isDisliked: interactionData.isDisliked,
        isSaved: interactionData.isSaved,
        likes: interactionData.likes,
        dislikes: interactionData.dislikes,
      });
    }
  }, [interactionData]);

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: () => videoService.toggleLike(videoId),
    onMutate: async () => {
      // Optimistic update
      setState(prev => ({
        ...prev,
        isLiked: !prev.isLiked,
        isDisliked: false, // Remove dislike if liking
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
        dislikes: prev.isDisliked ? prev.dislikes - 1 : prev.dislikes,
      }));
    },
    onError: () => {
      // Revert optimistic update on error
      if (interactionData) {
        setState({
          isLiked: interactionData.isLiked,
          isDisliked: interactionData.isDisliked,
          isSaved: interactionData.isSaved,
          likes: interactionData.likes,
          dislikes: interactionData.dislikes,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-interactions', videoId] });
    },
  });

  // Dislike mutation
  const dislikeMutation = useMutation({
    mutationFn: () => videoService.toggleDislike(videoId),
    onMutate: async () => {
      // Optimistic update
      setState(prev => ({
        ...prev,
        isDisliked: !prev.isDisliked,
        isLiked: false, // Remove like if disliking
        dislikes: prev.isDisliked ? prev.dislikes - 1 : prev.dislikes + 1,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes,
      }));
    },
    onError: () => {
      // Revert optimistic update on error
      if (interactionData) {
        setState({
          isLiked: interactionData.isLiked,
          isDisliked: interactionData.isDisliked,
          isSaved: interactionData.isSaved,
          likes: interactionData.likes,
          dislikes: interactionData.dislikes,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-interactions', videoId] });
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: () => videoService.toggleSave(videoId),
    onMutate: async () => {
      // Optimistic update
      setState(prev => ({
        ...prev,
        isSaved: !prev.isSaved,
      }));
    },
    onError: () => {
      // Revert optimistic update on error
      if (interactionData) {
        setState({
          isLiked: interactionData.isLiked,
          isDisliked: interactionData.isDisliked,
          isSaved: interactionData.isSaved,
          likes: interactionData.likes,
          dislikes: interactionData.dislikes,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-interactions', videoId] });
      queryClient.invalidateQueries({ queryKey: ['watch-later'] });
    },
  });

  // Report mutation
  const reportMutation = useMutation({
    mutationFn: (reason: string) => videoService.reportVideo(videoId, reason),
    onSuccess: () => {
      // Show success message
      },
  });

  return {
    ...state,
    isLoading: isLoadingInteractions || likeMutation.isPending || dislikeMutation.isPending || saveMutation.isPending,
    toggleLike: likeMutation.mutateAsync,
    toggleDislike: dislikeMutation.mutateAsync,
    toggleSave: saveMutation.mutateAsync,
    reportVideo: reportMutation.mutateAsync,
    isReporting: reportMutation.isPending,
  };
}

export function useVideoStats(videoId: string) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['video-stats', videoId],
    queryFn: () => videoService.getVideoStats(videoId),
    enabled: !!videoId,
    refetchInterval: 30000, // Refetch every 30 seconds for live stats
  });

  return {
    stats,
    isLoading,
  };
}

export function useVideoEngagement(videoId: string) {
  const { data: engagement, isLoading } = useQuery({
    queryKey: ['video-engagement', videoId],
    queryFn: () => videoService.getVideoEngagement(videoId),
    enabled: !!videoId,
  });

  return {
    engagement,
    isLoading,
  };
}
