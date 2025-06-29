
import React from 'react';

import { RefactoredVideoPlayer, YouTubePlayerWrapper, VideoDescription, VideoActions, CommentsSection, RefactoredSaveToPlaylistModal, RecommendationEngine } from '../components';
import { useMiniplayerActions } from '../contexts/OptimizedMiniplayerContext';
import { useWatchLater } from '../contexts/WatchLaterContext';
import { useWatchPage } from '../hooks/useWatchPage';
import { getLocalVideoPlayerType } from '../services/settingsService';
import { isYouTubeUrl, getYouTubeVideoId } from '../src/lib/youtube-utils';
import { formatDistanceToNow } from '../utils/dateUtils';
import { formatCount } from '../utils/numberUtils';


const WatchPage: React.FC = () => {
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
    // isInWatchLater, // unused
    isSavedToAnyList,
    mockLikeCount,

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

    // Related videos
    // displayedRelatedVideos,
    // showAllRelated, // unused
    // Refs
    // saveButtonRef, // unused
    // saveModalRef, // unused

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
    navigate,
  } = useWatchPage();

  const { showMiniplayer } = useMiniplayerActions();
  const { addToWatchLater } = useWatchLater();
  // removeFromWatchLater is unused in this component

  // Enhanced save to playlist handler that integrates with Watch Later context
  const enhancedHandleSaveToPlaylist = async (_videoId: string, playlistId: string) => {
    // Call the original handler
    await handleSaveToPlaylist(playlistId);

    // If saving to Watch Later playlist, also add to the Watch Later context
    if (playlistId === 'playlist-1' && video) {
      addToWatchLater(video);
    }
  };

  // Add to watch history when video loads
  React.useEffect(() => {
    if (video) {
      addToWatchHistory();
      showMiniplayer(video);
    }
  }, [video, addToWatchHistory, showMiniplayer]);

  // Scroll to top when page loads or video changes
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [videoId]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Video player skeleton */}
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-4" />

              {/* Video title skeleton */}
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mb-4" />

              {/* Channel info skeleton */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
                </div>
              </div>

              {/* Comments skeleton */}
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2 w-1/4" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar skeleton */}
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <div className="w-40 h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1 w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Video not found
  if (!video) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Video not found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The video you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Video player */}
            <div className="mb-4">
              {isYouTubeUrl(video.videoUrl) ? (
                <YouTubePlayerWrapper
                  videoId={getYouTubeVideoId(video.videoUrl) || ''}
                  autoplay={false}
                  width="100%"
                  height={480}
                  controls={true}
                />
              ) : (() => {
                const localPlayerType = getLocalVideoPlayerType();
                switch (localPlayerType) {
                  case 'refactored-video':
                    return (
                      <RefactoredVideoPlayer
                        video={video}
                        autoplay={false}
                        muted={false}
                      />
                    );
                  case 'refactored-video':
                  default:
                    return (
                      <RefactoredVideoPlayer
                        src={video.videoUrl}
                        poster={video.thumbnailUrl}
                        title={video.title}
                      />
                    );
                }
              })()}
            </div>

            {/* Video title and stats */}
            <div className="mb-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {video.title}
              </h1>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {formatCount(parseInt(video.views, 10))} views • {formatDistanceToNow(video.uploadedAt)}
                </div>
              </div>
            </div>

            {/* Video actions */}
            <VideoActions
              liked={liked}
              disliked={disliked}
              likeCount={mockLikeCount}
              onLike={handleLike}
              onDislike={handleDislike}
              onShare={() => {}}
              onSave={openSaveModal}
              isSavedToAnyList={isSavedToAnyList}
            />

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
          <aside className="space-y-4">
            <RecommendationEngine
              currentVideoId={video.id}
              onVideoSelect={(videoId) => {
                window.location.href = `/watch?v=${videoId}`;
              }}
            />
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
