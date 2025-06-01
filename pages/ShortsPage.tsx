import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ShortDisplayCard from '../components/ShortDisplayCard'; // New component
import CommentModal from '../components/CommentModal';
import { useShortsVideos } from '../hooks';
import ShortsPageSkeleton from '../components/LoadingStates/ShortsPageSkeleton';
import ShortsPageError from '../components/ErrorStates/ShortsPageError';
import EmptyShortsState from '../components/ErrorStates/EmptyShortsState';

const ShortsPage: React.FC = () => {
  const { data: shorts, loading, error } = useShortsVideos();
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for tracking liked shorts and comment modal
  const [likedShorts, setLikedShorts] = useState<Set<string>>(new Set());
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedShortForComment, setSelectedShortForComment] = useState<{ id: string; title: string } | null>(null);
  
  // Get video ID from query parameter
  const searchParams = new URLSearchParams(location.search);
  const targetVideoId = searchParams.get('v');
  
  // Event handlers
  const handleLike = (shortId: string) => {
    setLikedShorts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(shortId)) {
        newSet.delete(shortId);
      } else {
        newSet.add(shortId);
      }
      return newSet;
    });
  };

  const handleComment = (shortId: string) => {
    // Find the short to get its title
    const short = shorts.find(s => s.id === shortId);
    setSelectedShortForComment({ id: shortId, title: short?.title || 'Short video' });
    setCommentModalOpen(true);
  };

  const handleCommentSubmit = async (commentText: string) => {
    if (!selectedShortForComment) return;
    
    try {
      // TODO: Implement actual comment submission to API
      console.log('Comment submitted for short:', selectedShortForComment.id, 'Text:', commentText);
      // You can add API call here to submit the comment
      
      // Close modal and reset state
      setCommentModalOpen(false);
      setSelectedShortForComment(null);
    } catch (error) {
      console.error('Failed to submit comment:', error);
      // Handle error (show toast, etc.)
    }
  };

  const handleShare = async (shortId: string) => {
    const shareUrl = `${window.location.origin}/shorts?v=${shortId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this Short!',
          url: shareUrl
        });
      } catch (error) {
        // Fallback to clipboard if share fails
        copyToClipboard(shareUrl);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  // Scroll to specific video when component mounts or when shorts data changes
  useEffect(() => {
    if (targetVideoId && shorts.length > 0 && containerRef.current) {
      const targetIndex = shorts.findIndex(short => short.id === targetVideoId);
      if (targetIndex !== -1) {
        // Scroll to the target video
        const targetElement = containerRef.current.children[targetIndex] as HTMLElement;
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  }, [targetVideoId, shorts]);

  if (loading) {
    return <ShortsPageSkeleton />;
  }

  if (error) {
    return <ShortsPageError error={error} />;
  }

  if (shorts.length === 0) {
    return <EmptyShortsState />;
  }

  return (
    <div 
      ref={containerRef}
      className="h-[calc(100vh-3.5rem)] overflow-y-scroll snap-y snap-mandatory bg-black relative no-scrollbar" // 3.5rem is header height
      role="feed"
      aria-label="Shorts feed"
    >
      {shorts.map((short, index) => (
        <div key={short.id || index} className="h-full w-full snap-start">
          <ShortDisplayCard 
            short={short} 
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
          />
        </div>
      ))}
      
      {/* Comment Modal */}
      <CommentModal
        isOpen={commentModalOpen}
        onClose={() => {
          setCommentModalOpen(false);
          setSelectedShortForComment(null);
        }}
        shortId={selectedShortForComment?.id || ''}
        shortTitle={selectedShortForComment?.title}
        onCommentSubmit={handleCommentSubmit}
      />
    </div>
  );
};

export default ShortsPage;