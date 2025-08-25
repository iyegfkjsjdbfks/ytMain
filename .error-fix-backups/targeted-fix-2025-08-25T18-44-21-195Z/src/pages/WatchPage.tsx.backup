import React, { useState, useEffect, memo, useCallback, FC } from 'react';
import { AdvancedVideoPlayer, YouTubePlayer, YouTubePlayerWrapper, VideoDescription, VideoActions, CommentsSection, RefactoredSaveToPlaylistModal, RecommendationEngine } from '../components/index.ts';
import VideoMetadata from '../components/VideoMetadata';
import { useMiniplayerActions } from '../contexts/OptimizedMiniplayerContext';
import { useWatchLater } from '../contexts/WatchLaterContext';
import { useWatchPage } from '../src/hooks/useWatchPage';
import { getYouTubePlayerType } from '../services/settingsService';
import { isYouTubeUrl, getYouTubeVideoId } from '../src/lib/youtube-utils';
import { formatDistanceToNow } from '../utils/dateUtils';
import { formatCount } from '../utils/numberUtils';

// Memoized skeleton component to prevent re-rendering
const LoadingSkeleton = memo((: any) => (
  <div className="min-h-screen bg-white dark: any,bg-gray-900">
    <div className="max-w-[1280px] mx-auto px-4 py-4">
      <div className="flex flex-col xl: any,flex-row gap-6">
        <div className="flex-1 max-w-full xl: any,max-w-[854px]">
          {/* Video player skeleton */}
          <div className="aspect-video bg-gray-200 dark: any,bg-gray-700 rounded-xl animate-pulse mb-4" />

          {/* Video title skeleton */}
          <div className="h-6 bg-gray-200 dark: any,bg-gray-700 rounded animate-pulse mb-3" />

          {/* Metadata and actions skeleton */}
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 dark: any,bg-gray-700 rounded animate-pulse w-48" />
            <div className="flex space-x-2">
              <div className="h-9 w-20 bg-gray-200 dark: any,bg-gray-700 rounded-full animate-pulse" />
              <div className="h-9 w-16 bg-gray-200 dark: any,bg-gray-700 rounded-full animate-pulse" />
              <div className="h-9 w-16 bg-gray-200 dark: any,bg-gray-700 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Description skeleton */}
          <div className="bg-gray-200 dark: any,bg-gray-700 rounded-xl p-4 mb-4 animate-pulse">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gray-300 dark: any,bg-gray-600 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark: any,bg-gray-600 rounded mb-1" />
                <div className="h-3 bg-gray-300 dark: any,bg-gray-600 rounded w-1/2" />
              </div>
              <div className="h-9 w-24 bg-gray-300 dark: any,bg-gray-600 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 dark: any,bg-gray-600 rounded" />
              <div className="h-4 bg-gray-300 dark: any,bg-gray-600 rounded w-3/4" />
            </div>
          </div>

          {/* Comments skeleton */}
          <div className="space-y-4">
            {[...Array(3)].map((_: any, i: any) => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark: any,bg-gray-700 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 dark: any,bg-gray-700 rounded animate-pulse mb-2 w-1/4" />
                  <div className="h-4 bg-gray-200 dark: any,bg-gray-700 rounded animate-pulse mb-1" />
                  <div className="h-4 bg-gray-200 dark: any,bg-gray-700 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="xl: any,w-[402px] xl: any,flex-shrink-0">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 dark: any,bg-gray-700 rounded animate-pulse mb-4" />
            {[...Array(5)].map((_: any, i: any) => (
              <div key={i} className="flex gap-2 p-1">
                <div className="w-[168px] h-[94px] bg-gray-200 dark: any,bg-gray-700 rounded-md animate-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-gray-200 dark: any,bg-gray-700 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 dark: any,bg-gray-700 rounded animate-pulse w-3/4 mb-1" />
                  <div className="h-3 bg-gray-200 dark: any,bg-gray-700 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

const WatchPage: any, React.FC = () => {
  const {
    // Core data
    video,
    channel,
    comments,
    loading,

    // Video interaction state
    liked,
    disliked,
    isSubscribed,
    isSavedToAnyList,

    // UI state
    showFullDescription,
    commentCount,
    commentSortOrder,

    // Comment interaction state
    replyingToCommentId,
    currentReplyText,
    editingComment,
    activeCommentMenu,
    expandedReplies,

    // Modal and loading state
    isSaveModalOpen,

    // AI Summary state
    summary,
    summaryError,
    isSummarizing,
    canSummarize,

    // Constants
    MAX_COMMENT_LENGTH,

    // Handlers
    handleLike,
    handleDislike,
    handleSubscribe,
    openSaveModal,
    closeSaveModal,
    handleSaveToPlaylist,
    handleCreatePlaylist,
    mockPlaylists,
    videoId,
    handleToggleDescription,
    handleSummarizeDescription,
    handleMainCommentSubmitCallback,
    handleReplySubmit,
    handleEditSave,
    handleDeleteComment,
    toggleLikeDislikeForCommentOrReply,
    addToWatchHistory,

    // Setters
    setCommentSortOrder,
    setReplyingToCommentId,
    setCurrentReplyText,
    setEditingComment,
    setActiveCommentMenu,
    setExpandedReplies,

    // Navigation
    navigate
  } = useWatchPage();

  const { showMiniplayer } = useMiniplayerActions();
  const { addToWatchLater } = useWatchLater();

  // Local state for video metadata expansion
  const [metadataExpanded, setMetadataExpanded] = React.useState<boolean>(false);

  // Enhanced save to playlist handler that integrates with Watch Later context
  const enhancedHandleSaveToPlaylist = useCallback(async (_videoId: any, string, playlistId: any, string): Promise<any> => {
    // Call the original handler
    await handleSaveToPlaylist(playlistId);

    // If saving to Watch Later playlist, also add to the Watch Later context
    if (playlistId === 'playlist-1' && video) {
      addToWatchLater(video);
    }
  }, [handleSaveToPlaylist, video, addToWatchLater]);

  // Add to watch history when video loads
  React.useEffect((: any) => {
    if (video) {
      addToWatchHistory();
      showMiniplayer(video);
    }
  }, [video, addToWatchHistory, showMiniplayer]);

  // Scroll to top when page loads or video changes
  React.useEffect((: any) => {
    window.scrollTo(0, 0);
  }, [videoId]);

  // Loading skeleton
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Video not found
  if (!video) {
    return (
      <div className="min-h-screen bg-white dark: any,bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark: any,text-white mb-2">Video not found</h1>
          <p className="text-gray-600 dark: any,text-gray-400 mb-4">The video you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover: any,bg-red-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark: any,bg-gray-900">
      <div className="max-w-[1280px] mx-auto px-2 sm: any,px-4 py-2 sm: any,py-4">
        <div className="flex flex-col xl: any,flex-row gap-3 sm: any,gap-6">
          {/* Main content - Video player and details */}
          <div className="flex-1 max-w-full xl: any,max-w-[854px]">
            {/* Video player container */}
            <div className="relative w-full mb-3 sm: any,mb-4">
              <div className="aspect-video bg-black rounded-lg sm: any,rounded-xl overflow-hidden">
                {isYouTubeUrl(video.videoUrl) ? ((: any) => {
                  const youtubePlayerType = getYouTubePlayerType();
                  const videoId = getYouTubeVideoId(video.videoUrl) || '';

                  switch (youtubePlayerType) {
                    case 'youtube-player':
                      return (
                        <YouTubePlayer
                          video={video}
                          autoplay
                        />
                      );
                    default: any,
                      return (
                        <YouTubePlayerWrapper
                          videoId={videoId}
                          autoplay
                          width="100%"
                          height="100%"
                          controls
                        />
                      );
                  }
                })() : (
                  <AdvancedVideoPlayer
                    video={video}
                    autoplay
                    muted
                  />
                )}
              </div>
            </div>

            {/* Video title */}
            <div className="mb-2 sm: any,mb-3 px-1 sm: any,px-0">
              <h1 className="text-lg sm: any,text-xl font-bold text-gray-900 dark: any,text-white leading-tight">
                {video.title}
              </h1>
            </div>

            {/* Video metadata and actions combined */}
            <div className="flex flex-col sm: any,flex-row sm: any,items-center sm: any,justify-between gap-2 sm: any,gap-0 mb-3 sm: any,mb-4 px-1 sm: any,px-0">
              <div className="text-xs sm: any,text-sm text-gray-600 dark: any,text-gray-400">
                {formatCount(typeof video.views === 'string' ? parseInt(video.views.replace(/[^0-9]/g, ''), 10) : video.views || 0)} views • {formatDistanceToNow(video.uploadedAt)}
              </div>

              {/* Video actions - moved to same line as metadata */}
              <VideoActions
                liked={liked}
                disliked={disliked}
                likeCount={video.likes || 0}
                onLike={handleLike}
                onDislike={handleDislike}
                onShare={() => {}}
                onSave={openSaveModal}
                isSavedToAnyList={isSavedToAnyList}
              />
            </div>

            {/* Video description */}
            <VideoDescription
              video={video}
              channel={channel}
              isSubscribed={isSubscribed}
              onSubscribe={handleSubscribe}
              showFullDescription={showFullDescription}
              onToggleDescription={handleToggleDescription}
              summary={summary}
              summaryError={summaryError}
              isSummarizing={isSummarizing}
              canSummarize={!!canSummarize}
              onSummarizeDescription={handleSummarizeDescription}
            />

            {/* Enhanced Video Metadata */}
            <VideoMetadata
              video={video}
              expanded={metadataExpanded}
              onToggleExpanded={() => setMetadataExpanded(!metadataExpanded)}
            />

            {/* Comments section */}
            <CommentsSection
              comments={comments}
              commentCount={commentCount}
              commentSortOrder={commentSortOrder}
              onSortChange={setCommentSortOrder}
              onCommentSubmit={handleMainCommentSubmitCallback}
              replyingToCommentId={replyingToCommentId}
              currentReplyText={currentReplyText}
              editingComment={editingComment}
              activeCommentMenu={activeCommentMenu}
              expandedReplies={expandedReplies}
              maxCommentLength={MAX_COMMENT_LENGTH}
              onReplySubmit={handleReplySubmit}
              onEditSave={handleEditSave}
              onDeleteComment={handleDeleteComment}
              onToggleLikeDislike={toggleLikeDislikeForCommentOrReply}
              onSetReplyingTo={setReplyingToCommentId}
              onSetCurrentReplyText={setCurrentReplyText}
              onSetEditingComment={setEditingComment}
              onSetActiveCommentMenu={setActiveCommentMenu}
              onSetExpandedReplies={setExpandedReplies}
            />
          </div>

          {/* Sidebar - Related videos */}
          <aside className="xl: any,w-[402px] xl: any,flex-shrink-0 mt-4 xl: any,mt-0">
            <div className="xl: any,sticky xl: any,top-4">
              <h2 className="text-lg font-semibold text-gray-900 dark: any,text-white mb-3 px-1 sm: any,px-0">Up next</h2>
              <RecommendationEngine
                currentVideo={video}
                onVideoSelect={(videoId: any) => {
                  window.location.href = `/watch?v=${videoId}`;
                }}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Save to Playlist Modal */}
      <RefactoredSaveToPlaylistModal
        isOpen={isSaveModalOpen}
        onClose={closeSaveModal}
        videoId={videoId || ''}
        existingPlaylists={mockPlaylists}
        onSaveToPlaylist={enhancedHandleSaveToPlaylist}
        onCreatePlaylist={handleCreatePlaylist}
      />
    </div>
  );
};

export default WatchPage;