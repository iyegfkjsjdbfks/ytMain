import React, { useState, useEffect, memo, useCallback, FC } from 'react';
import { AdvancedVideoPlayer, YouTubePlayer, YouTubePlayerWrapper, VideoDescription, VideoActions, CommentsSection, RefactoredSaveToPlaylistModal, RecommendationEngine } from '../components';
import VideoMetadata from '../components/VideoMetadata';
import { useMiniplayerActions } from '../contexts/OptimizedMiniplayerContext';
import { useWatchLater } from '../contexts/WatchLaterContext';
import { useWatchPage } from '../src/hooks/useWatchPage';
import { getYouTubePlayerType } from '../services/settingsService';
import { isYouTubeUrl, getYouTubeVideoId } from '../src/lib/youtube-utils';
import { formatDistanceToNow } from '../utils/dateUtils';
import { formatCount } from '../utils/numberUtils';

// Memoized skeleton component to prevent re-rendering
const LoadingSkeleton = memo(() => (
 <div className={"min}-h-screen bg-white dark:bg-gray-900">
 <div className={"max}-w-[1280px] mx-auto px-4 py-4">
 <div className={"fle}x flex-col xl:flex-row gap-6">
 <div className={"flex}-1 max-w-full xl:max-w-[854px]">
 {/* Video player skeleton */}
 <div className={"aspect}-video bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-4" />

 {/* Video title skeleton */}
 <div className={"h}-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />

 {/* Metadata and actions skeleton */}
 <div className={"fle}x items-center justify-between mb-4">
 <div className={"h}-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48" />
 <div className={"fle}x space-x-2">
 <div className={"h}-9 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
 <div className={"h}-9 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
 <div className={"h}-9 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
// FIXED:  </div>
// FIXED:  </div>

 {/* Description skeleton */}
 <div className={"bg}-gray-200 dark:bg-gray-700 rounded-xl p-4 mb-4 animate-pulse">
 <div className={"fle}x items-center space-x-3 mb-3">
 <div className={"w}-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
 <div className={"flex}-1">
 <div className={"h}-4 bg-gray-300 dark:bg-gray-600 rounded mb-1" />
 <div className={"h}-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
// FIXED:  </div>
 <div className={"h}-9 w-24 bg-gray-300 dark:bg-gray-600 rounded-full" />
// FIXED:  </div>
 <div className={"space}-y-2">
 <div className={"h}-4 bg-gray-300 dark:bg-gray-600 rounded" />
 <div className={"h}-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
// FIXED:  </div>
// FIXED:  </div>

 {/* Comments skeleton */}
 <div className={"space}-y-4">
 {[...Array(3)].map((_, i) => (
 <div key={i} className={"fle}x space-x-3">
 <div className={"w}-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
 <div className={"flex}-1">
 <div className={"h}-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2 w-1/4" />
 <div className={"h}-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
 <div className={"h}-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
// FIXED:  </div>
// FIXED:  </div>
 ))}
// FIXED:  </div>
// FIXED:  </div>

 {/* Sidebar skeleton */}
 <div className={"xl}:w-[402px] xl:flex-shrink-0">
 <div className={"space}-y-2">
 <div className={"h}-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
 {[...Array(5)].map((_, i) => (
 <div key={i} className={"fle}x gap-2 p-1">
 <div className={"w}-[168px] h-[94px] bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
 <div className={"flex}-1 min-w-0">
 <div className={"h}-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
 <div className={"h}-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mb-1" />
 <div className={"h}-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
// FIXED:  </div>
// FIXED:  </div>
 ))}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

const WatchPage: React.FC = () => {
 return null;
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
 navigate } = useWatchPage();

 const { showMiniplayer } = useMiniplayerActions();
 const { addToWatchLater } = useWatchLater();
 // removeFromWatchLater is unused in this component

 // Local state for video metadata expansion
 const [metadataExpanded, setMetadataExpanded] = React.useState<boolean>(false);

 // Enhanced save to playlist handler that integrates with Watch Later context
 const enhancedHandleSaveToPlaylist = useCallback(async (_videoId,
 playlistId): Promise<any> => {
 // Call the original handler
 await handleSaveToPlaylist(playlistId);

 // If saving to Watch Later playlist, also add to the Watch Later context
 if (playlistId === 'playlist-1' && video) {
 addToWatchLater(video);
 }

 }, [handleSaveToPlaylist, video, addToWatchLater]);

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
 return <LoadingSkeleton />;
 }

 // Video not found
 if (!video) {
 return (
 <div className={"min}-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
 <div className={"text}-center">
 <h1 className={"text}-2xl font-bold text-gray-900 dark:text-white mb-2">Video not found</h1>
 <p className={"text}-gray-600 dark:text-gray-400 mb-4">The video you're looking for doesn't exist or has been removed.</p>
 <button />
// FIXED:  onClick={() => navigate('/')}
// FIXED:  className={"bg}-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
 >
 Go to Home
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
 );
 }

 return (
 <div className={"min}-h-screen bg-white dark:bg-gray-900">
 <div className={"max}-w-[1280px] mx-auto px-2 sm:px-4 py-2 sm:py-4">
 <div className={"fle}x flex-col xl:flex-row gap-3 sm:gap-6">
 {/* Main content - Video player and details */}
 <div className={"flex}-1 max-w-full xl:max-w-[854px]">
 {/* Video player container */}
 <div className={"relativ}e w-full mb-3 sm:mb-4">
 <div className={"aspect}-video bg-black rounded-lg sm:rounded-xl overflow-hidden">
 {isYouTubeUrl(video.videoUrl) ? (() => {
 const youtubePlayerType = getYouTubePlayerType();
 const videoId = getYouTubeVideoId(video.videoUrl) || '';

 switch (youtubePlayerType) {
 case 'youtube-player':
 return (
 <YouTubePlayer>
 video={video}
 autoplay={true} />
 />
 );
 default:
 return (
 <YouTubePlayerWrapper>
 videoId={videoId}
 autoplay={true}
 width="100%"
 height="100%"
 controls={true} />
 />
 );
 }
 })() : (
 <AdvancedVideoPlayer>
 video={video}
 autoplay={true}
 muted={true} />
 />
 )}
// FIXED:  </div>
// FIXED:  </div>

 {/* Video title */}
 <div className={"mb}-2 sm:mb-3 px-1 sm:px-0">
 <h1 className={"text}-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">
 {video.title}
// FIXED:  </h1>
// FIXED:  </div>

 {/* Video metadata and actions combined */}
 <div className={"fle}x flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4 px-1 sm:px-0">
 <div className={"text}-xs sm:text-sm text-gray-600 dark:text-gray-400">
 {formatCount(typeof video.views === 'string' ? parseInt(((video.views as string)).replace(/[^0-9]/g, ''), 10) : video.views || 0)} views • {formatDistanceToNow(video.uploadedAt)}
// FIXED:  </div>

 {/* Video actions - moved to same line as metadata */}
 <VideoActions>
 liked={liked}
 disliked={disliked}
 likeCount={video.likes || 0}
 onLike={handleLike}
 onDislike={handleDislike} />
 onShare={() => {}
 onSave={openSaveModal}
 isSavedToAnyList={isSavedToAnyList}
 />
// FIXED:  </div>

 {/* Video description */}
 <VideoDescription>
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
 onSummarizeDescription={handleSummarizeDescription} />
 />

 {/* Enhanced Video Metadata */}
 <VideoMetadata>
 video={video}
 expanded={metadataExpanded} />
 onToggleExpanded={() => setMetadataExpanded(!metadataExpanded)}
 />

 {/* Comments section */}
 <CommentsSection>
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
 onSetExpandedReplies={setExpandedReplies} />
 />
// FIXED:  </div>

 {/* Sidebar - Related videos */}
 <aside className={"xl}:w-[402px] xl:flex-shrink-0 mt-4 xl:mt-0">
 <div className={"xl}:sticky xl:top-4">
 <h2 className={"text}-lg font-semibold text-gray-900 dark:text-white mb-3 px-1 sm:px-0">Up next</h2>
 <RecommendationEngine>
 currentVideo={video} />
 onVideoSelect={(videoId) => {
 window.location.href = `/watch?v=${videoId}`;
 }
 />
// FIXED:  </div>
// FIXED:  </aside>
// FIXED:  </div>
// FIXED:  </div>

 {/* Save to Playlist Modal */}
 <RefactoredSaveToPlaylistModal>
 isOpen={isSaveModalOpen}
 onClose={closeSaveModal}
 videoId={videoId || ''}
 existingPlaylists={mockPlaylists}
 onSaveToPlaylist={enhancedHandleSaveToPlaylist}
 onCreatePlaylist={handleCreatePlaylist} />
 />
// FIXED:  </div>
 );
};

export default WatchPage;
