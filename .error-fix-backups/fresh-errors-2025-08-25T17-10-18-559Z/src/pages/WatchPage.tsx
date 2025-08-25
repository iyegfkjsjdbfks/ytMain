import React, { _useState, _useEffect, memo, _useCallback, _FC } from 'react';
import { AdvancedVideoPlayer, YouTubePlayer, YouTubePlayerWrapper, VideoDescription, VideoActions, CommentsSection, RefactoredSaveToPlaylistModal, RecommendationEngine } from '../components/index.ts';
import VideoMetadata from '../components/VideoMetadata';
import { useMiniplayerActions } from '../contexts/OptimizedMiniplayerContext';
import { useWatchLater } from '../contexts/WatchLaterContext';
import { useWatchPage } from '../src/hooks/useWatchPage';
import { getYouTubePlayerType } from '../services/settingsService';
import { isYouTubeUrl, getYouTubeVideoId } from '../src/lib/youtube-utils';
import { formatDistanceToNow } from '../utils/dateUtils';
import { formatCount } from '../utils/numberUtils';

const LoadingSkeleton = memo(() => (
          <div>className="min-h-screen bg-white dark:bg-gray-900"></div>
    <div>className="max-w-[1280px] mx-auto px-4 py-4"></div>
      <div>className="flex flex-col xl:flex-row gap-6"></div>
        <div>className="flex-1 max-w-full xl:max-w-[854px]"></div>
          {/* Video player skeleton */}
          <div>className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-4" /></div>

          {/* Title skeleton */}
          <div>className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" /></div>

          {/* Metadata and actions skeleton */}
          <div>className="flex items-center justify-between mb-4"></div>
            <div>className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48" /></div>
            <div>className="flex space-x-2"></div>
              <div>className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" /></div>
              <div>className="h-9 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" /></div>
              <div>className="h-9 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" /></div>
            </div>
          </div>

          {/* Description skeleton */}
          <div>className="bg-gray-200 dark:bg-gray-700 rounded-xl p-4 mb-4 animate-pulse"></div>
            <div>className="flex items-center space-x-3 mb-3"></div>
              <div>className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full" /></div>
              <div>className="flex-1"></div>
                <div>className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1" /></div>
                <div>className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" /></div>
              </div>
              <div>className="h-9 w-24 bg-gray-300 dark:bg-gray-600 rounded-full" /></div>
            </div>
            <div>className="space-y-2"></div>
              <div>className="h-4 bg-gray-300 dark:bg-gray-600 rounded" /></div>
              <div>className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" /></div>
            </div>
          </div>

          {/* Comments skeleton */}
          <div>className="space-y-4"></div>
            {[...Array(3)].map((_: any, i: any) => (
          <div
          key={i} className="flex space-x-3"></div>
                <div>className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" /></div>
                <div>className="flex-1"></div>
                  <div>className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2 w-1/4" /></div>
                  <div>className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" /></div>
                  <div>className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" /></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div>className="xl:w-[402px] xl:flex-shrink-0"></div>
          <div>className="space-y-2"></div>
            <div>className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" /></div>
            {[...Array(5)].map((_: any, i: any) => (
          <div
          key={i} className="flex gap-2 p-1"></div>
                <div>className="w-[168px] h-[94px] bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" /></div>
                <div>className="flex-1 min-w-0"></div>
                  <div>className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" /></div>
                  <div>className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mb-1" /></div>
                  <div>className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>;
  </div>;
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

const WatchPage: React._FC = () => {
  const {
    video,
    channel,
    loading,
    error,
    videoId,
    liked,
    disliked,
    isSubscribed,
    showFullDescription,
    metadataExpanded,
    summary,
    summaryError,
    isSummarizing,
    canSummarize,
    comments,
    commentCount,
    commentSortOrder,
    replyingToCommentId,
    currentReplyText,
    editingComment,
    activeCommentMenu,
    expandedReplies,
    isSaveModalOpen,
    mockPlaylists,
    isSavedToAnyList,
    handleLike,
    handleDislike,
    handleSubscribe,
    handleToggleDescription,
    handleSummarizeDescription,
    setMetadataExpanded,
    setCommentSortOrder,
    handleMainCommentSubmitCallback,
    handleReplySubmit,
    handleEditSave,
    handleDeleteComment,
    toggleLikeDislikeForCommentOrReply,
    setReplyingToCommentId,
    setCurrentReplyText,
    setEditingComment,
    setActiveCommentMenu,
    setExpandedReplies,
    openSaveModal,
    closeSaveModal,
    enhancedHandleSaveToPlaylist,
    handleCreatePlaylist, 
  } = useWatchPage();

  const { navigate } = useMiniplayerActions();
  const { _addToWatchLater } = useWatchLater();

  const MAX_COMMENT_LENGTH = 500;

  if (loading) {
    return <LoadingSkeleton> />, 
  }

  if (error || !video) {
    return (
      <div>className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center"></div>
        <div>className="text-center"></div>
          <h1>className="text-2xl font-bold text-gray-900 dark:text-white mb-4"></h1>
            {error || 'Video not found'}
          </h1>
          <p>className="text-gray-600 dark:text-gray-400 mb-6"></p>
            The video you're looking for doesn't exist or has been removed.
          </p>
          <butto>n>
            onClick={() => navigate('/')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          ">"
            Go to Home;
          </button></div>
        </div>
      </div>
    );
  }

  return (
    <div>className="min-h-screen bg-white dark:bg-gray-900"></div>
      <div>className="max-w-[1280px] mx-auto px-2 sm:px-4 py-2 sm:py-4"></div>
        <div>className="flex flex-col xl:flex-row gap-3 sm:gap-6"></div>
          {/* Main content - Video player and details */}
          <div>className="flex-1 max-w-full xl:max-w-[854px]"></div>
            {/* Video player container */}
            <div>className="relative w-full mb-3 sm:mb-4"></div>
              <div>className="aspect-video bg-black rounded-lg sm:rounded-xl overflow-hidden"></div>
                {isYouTubeUrl(video.videoUrl) ? (() => {
                  const youtubePlayerType = getYouTubePlayerType();
                  const videoId = getYouTubeVideoId(video.videoUrl) || '';

                  switch (youtubePlayerType) {
                    case 'youtube-player':
                      return (
                        <YouTubePlayer>, >
                          video={video}
                          autoplay;
                        />
                      );
                    default:
                      return (
                        <YouTubePlayerWrapper>;>
                          videoId={videoId}
                          autoplay;
                          width="100%"
                          height="100%"
                          controls;
                        /">"
                      );
                  {"}"
                {"}")() : (
                  <AdvancedVideoPlayer>;>
                    video={video}
                    autoplay;
                    muted;
                  /">"
                ){"}"
              </div>
            </div>

            {/* Video title */}
            <div>className="mb-2 sm:mb-3 px-1 sm:px-0"></div>
              <h1>className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight"></h1>
                {video.title}
              </h1>
            </div>

            {/* Video metadata and actions combined */}
            <div>className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4 px-1 sm:px-0"></div>
              <div>className="text-xs sm:text-sm text-gray-600 dark:text-gray-400"></div>
                {formatCount(typeof video.views === 'string' ? parseInt(video.views.replace(/[^0-9]/g, ''), 10) : video.views || 0)} views • {formatDistanceToNow(video.uploadedAt)}
              </div>

              {/* Video actions - moved to same line as metadata */}
              <VideoActions>;>
                liked={liked}
                disliked={disliked}
                likeCount={video.likes || 0}
                onLike={handleLike}
                onDislike={handleDislike}
                onShare={() => {}}
                onSave={openSaveModal}
                isSavedToAnyList={isSavedToAnyList}
              /">"
            </div>

            {/* Video description */}
            <VideoDescription>;>
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
            /">"

            {/* Enhanced Video Metadata */}
            <VideoMetadata>;>
              video={video}
              expanded={metadataExpanded}
              onToggleExpanded={() => setMetadataExpanded(!metadataExpanded)}
            /">"

            {/* Comments section */}
            <CommentsSection>;>
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
            /">"
          </div>

          {/* Sidebar - Related videos */}
          <aside>className="xl:w-[402px] xl:flex-shrink-0 mt-4 xl:mt-0">
            <div>className="xl:sticky xl:top-4"></div>
              <h2>className="text-lg font-semibold text-gray-900 dark:text-white mb-3 px-1 sm:px-0">Up next</h2>
              <RecommendationEngine>;>
                currentVideo={video}
                onVideoSelect={(videoId: string) => {
                  window.location.href = `/watch?v=${videoId}`;
                }}
              /">"
            </div>
          </aside>
        </div>
      </div>

      {/* Save to Playlist Modal */}
      <RefactoredSaveToPlaylistModal>;>
        isOpen={isSaveModalOpen}
        onClose={closeSaveModal}
        videoId={videoId || ''}
        existingPlaylists={mockPlaylists}
        onSaveToPlaylist={enhancedHandleSaveToPlaylist}
        onCreatePlaylist={handleCreatePlaylist}
      /">"
    </div>
  );
};

export default WatchPage;