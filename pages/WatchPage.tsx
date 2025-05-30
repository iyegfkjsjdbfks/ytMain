
import React from 'react';
import AdvancedVideoPlayer from '../components/AdvancedVideoPlayer';
import RecommendationEngine from '../components/RecommendationEngine';
import VideoActions from '../components/VideoActions';
import VideoDescription from '../components/VideoDescription';
import CommentsSection from '../components/CommentsSection';
import { useWatchPage } from '../hooks/useWatchPage';
import { formatCount } from '../utils/numberUtils';
import { formatDistanceToNow } from '../utils/dateUtils';
import { useMiniplayer } from '../contexts/MiniplayerContext';
import { useWatchLater } from '../contexts/WatchLaterContext';
import WatchPageSkeleton from '../components/LoadingStates/WatchPageSkeleton';
import VideoNotFound from '../components/ErrorStates/VideoNotFound';
import VideoPlaybackDetails from '../components/VideoPlaybackDetails';

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
    isInWatchLater,
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
    saveModalLoading,
    
    // AI Summary state
    summary,
    summaryError,
    isSummarizing,
    canSummarize,
    
    // Related videos
    displayedRelatedVideos,
    showAllRelated,
    
    // Refs
    saveButtonRef,
    saveModalRef,
    
    // Constants
    MAX_COMMENT_LENGTH,
    
    // Handlers
    handleLike,
    handleDislike,
    handleSubscribe,
    openSaveModal,
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
  
  const { showMiniplayer } = useMiniplayer();
  const { addToWatchLater, removeFromWatchLater } = useWatchLater();
  
  // Add to watch history when video loads
  React.useEffect(() => {
    if (video) {
      addToWatchHistory(video.id);
      showMiniplayer(video);
    }
  }, [video, addToWatchHistory, showMiniplayer]);
  
  // Loading skeleton
  if (loading) {
    return <WatchPageSkeleton />;
  }
  
  // Video not found
  if (!video) {
    return <VideoNotFound />;
  }
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <VideoPlaybackDetails
              video={video}
              channel={channel}
              liked={liked}
              disliked={disliked}
              isSubscribed={isSubscribed}
              isSavedToAnyList={isSavedToAnyList}
              mockLikeCount={mockLikeCount}
              showFullDescription={showFullDescription}
              summary={summary}
              summaryError={summaryError}
              isSummarizing={isSummarizing}
              canSummarize={canSummarize}
              isSaveModalOpen={isSaveModalOpen}
              saveModalLoading={saveModalLoading}
              saveButtonRef={saveButtonRef}
              saveModalRef={saveModalRef}
              handleLike={handleLike}
              handleDislike={handleDislike}
              handleSubscribe={handleSubscribe}
              openSaveModal={openSaveModal}
              handleToggleDescription={handleToggleDescription}
              handleSummarizeDescription={handleSummarizeDescription}
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
              setReplyingToCommentId={setReplyingToCommentId}
              setCurrentReplyText={setCurrentReplyText}
              setEditingComment={setEditingComment}
              setActiveCommentMenu={setActiveCommentMenu}
              setExpandedReplies={setExpandedReplies}
            />
          </div>
          
          {/* Sidebar - Related videos */}
          <aside className="space-y-4">
            <RecommendationEngine
              currentVideoId={video.id}
              currentVideoCategory={video.category}
              videos={displayedRelatedVideos}
              showAll={showAllRelated}
              onToggleShowAll={() => {}}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
