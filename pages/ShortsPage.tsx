import * as React from 'react';
import {  useRef, useState, useEffect, useCallback, useMemo  } from 'react';
import { useLocation } from 'react-router-dom';
import ShortDisplayCard from '../components/ShortDisplayCard';
import CommentModal from '../components/CommentModal';
import ShortsNavigation from '../components/ShortsNavigation';
import ShortsFilters from '../components/ShortsFilters';

import { useShortsVideos, useLocalStorage, useDebounce } from '../hooks';
import ShortsPageSkeleton from '../components/LoadingStates/ShortsPageSkeleton';
import ShortsPageError from '../components/ErrorStates/ShortsPageError';
import EmptyShortsState from '../components/ErrorStates/EmptyShortsState';
import { Short } from '../src/types/core';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ShortsPage: React.FC = () => {
  const { data: allShorts, loading, error } = useShortsVideos();
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();


  // Enhanced state management with proper Set handling and error recovery
  const [likedShortsArray, setLikedShortsArray] = useLocalStorage<string[]>('likedShorts', []);
  const [followedChannelsArray, setFollowedChannelsArray] = useLocalStorage<string[]>('followedChannels', []);

  // Convert arrays to Sets for easier manipulation with comprehensive type checking
  const likedShorts = useMemo(() => {
    try {
      // Ensure we have a valid array
      const validArray = Array.isArray(likedShortsArray) ? likedShortsArray : [];
      return new Set(validArray.filter(item => typeof item === 'string'));
    } catch (error) {
      console.warn('Error creating likedShorts Set:', error);
      // Clear invalid data and return empty Set
      setLikedShortsArray([]);
      return new Set<string>();
    }
  }, [likedShortsArray, setLikedShortsArray]);

  const followedChannels = useMemo(() => {
    try {
      // Ensure we have a valid array
      const validArray = Array.isArray(followedChannelsArray) ? followedChannelsArray : [];
      return new Set(validArray.filter(item => typeof item === 'string'));
    } catch (error) {
      console.warn('Error creating followedChannels Set:', error);
      // Clear invalid data and return empty Set
      setFollowedChannelsArray([]);
      return new Set<string>();
    }
  }, [followedChannelsArray, setFollowedChannelsArray]);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedShortForComment, setSelectedShortForComment] = useState<{ id: string; title: string } | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isAutoAdvanceEnabled] = useLocalStorage('autoAdvanceShorts', true);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Get video ID from query parameter
  const searchParams = new URLSearchParams(location.search);
  const targetVideoId = searchParams.get('v');

  // Convert Videos to Shorts and filter
  const filteredShorts = useMemo((): Short[] => {
    if (!allShorts) return [];

    // Convert Video[] to Short[] with proper type conversion
    let converted: Short[] = allShorts
      .filter(video => video.visibility !== 'scheduled') // Filter out scheduled videos
      .map(video => {
        const { duration: _, ...videoWithoutDuration } = video; // Remove duration from video
        const shortVideo: Short = {
          ...videoWithoutDuration,
          duration: 60, // Convert duration to number for shorts
          isVertical: true,
          visibility: video.visibility as 'public' | 'private' | 'unlisted' // Type assertion after filtering
        };
        return shortVideo;
      });

    // Apply category filter
    if (selectedCategory !== 'all') {
      converted = converted.filter(short =>
        short.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Apply search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      converted = converted.filter(short =>
        short.title.toLowerCase().includes(query) ||
        short.channelName.toLowerCase().includes(query) ||
        short.description.toLowerCase().includes(query)
      );
    }

    return converted;
  }, [allShorts, selectedCategory, debouncedSearchQuery]);

  // Get unique categories for filtering
  const categories = useMemo(() => {
    if (!allShorts) return [];
    const uniqueCategories = [...new Set(allShorts.map(short => short.category))];
    return ['all', ...uniqueCategories];
  }, [allShorts]);
  
  // Enhanced event handlers with proper type checking
  const handleLike = useCallback((shortId: string) => {
    setLikedShortsArray(prev => {
      const currentArray = Array.isArray(prev) ? prev : [];
      if (currentArray.includes(shortId)) {
        return currentArray.filter(id => id !== shortId);
      } else {
        return [...currentArray, shortId];
      }
    });
  }, [setLikedShortsArray]);

  const handleFollow = useCallback((channelName: string) => {
    setFollowedChannelsArray(prev => {
      const currentArray = Array.isArray(prev) ? prev : [];
      if (currentArray.includes(channelName)) {
        return currentArray.filter(name => name !== channelName);
      } else {
        return [...currentArray, channelName];
      }
    });
  }, [setFollowedChannelsArray]);

  const handleComment = useCallback((shortId: string) => {
    const short = filteredShorts.find(s => s.id === shortId);
    setSelectedShortForComment({ id: shortId, title: short?.title || 'Short video' });
    setCommentModalOpen(true);
  }, [filteredShorts]);

  const handleCommentSubmit = useCallback(async (commentText: string) => {
    if (!selectedShortForComment) return;

    try {
      // TODO: Implement actual comment submission to API
      console.log('Comment submitted for short:', selectedShortForComment.id, 'Text:', commentText);

      // Close modal and reset state
      setCommentModalOpen(false);
      setSelectedShortForComment(null);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  }, [selectedShortForComment]);

  const handleVideoChange = useCallback((index: number) => {
    setCurrentVideoIndex(index);

    // Update URL with current video ID
    if (filteredShorts[index]) {
      const newUrl = `/shorts?v=${filteredShorts[index].id}`;
      window.history.replaceState(null, '', newUrl);
    }

    // Scroll to the video
    if (containerRef.current) {
      const targetElement = containerRef.current.children[index] as HTMLElement;
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    }
  }, [filteredShorts]);

  const handleNextVideo = useCallback(() => {
    if (currentVideoIndex < filteredShorts.length - 1) {
      const nextIndex = currentVideoIndex + 1;
      console.log('Navigating to next video:', nextIndex);
      handleVideoChange(nextIndex);
    }
  }, [currentVideoIndex, filteredShorts.length, handleVideoChange]);

  const handlePreviousVideo = useCallback(() => {
    if (currentVideoIndex > 0) {
      const prevIndex = currentVideoIndex - 1;
      console.log('Navigating to previous video:', prevIndex);
      handleVideoChange(prevIndex);
    }
  }, [currentVideoIndex, handleVideoChange]);

  const handleSearchToggle = useCallback(() => {
    setShowSearch(prev => !prev);
    if (showSearch) {
      setSearchQuery('');
    }
  }, [showSearch]);

  const handleFilterToggle = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setCurrentVideoIndex(0);
  }, []);

  const handleKeyboardNavigation = useCallback((event: KeyboardEvent) => {
    if (commentModalOpen) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        handlePreviousVideo();
        break;
      case 'ArrowDown':
        event.preventDefault();
        handleNextVideo();
        break;
      case 'Escape':
        if (showSearch) {
          handleSearchToggle();
        } else if (showFilters) {
          handleFilterToggle();
        }
        break;
    }
  }, [commentModalOpen, handlePreviousVideo, handleNextVideo, showSearch, showFilters, handleSearchToggle, handleFilterToggle]);

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

  // One-time cleanup effect to handle corrupted localStorage data
  useEffect(() => {
    try {
      // Check if localStorage contains invalid data and clean it up
      const likedShortsRaw = localStorage.getItem('likedShorts');
      const followedChannelsRaw = localStorage.getItem('followedChannels');

      if (likedShortsRaw && likedShortsRaw !== 'null') {
        const parsed = JSON.parse(likedShortsRaw);
        if (!Array.isArray(parsed)) {
          console.warn('Cleaning up invalid likedShorts data');
          localStorage.removeItem('likedShorts');
          setLikedShortsArray([]);
        }
      }

      if (followedChannelsRaw && followedChannelsRaw !== 'null') {
        const parsed = JSON.parse(followedChannelsRaw);
        if (!Array.isArray(parsed)) {
          console.warn('Cleaning up invalid followedChannels data');
          localStorage.removeItem('followedChannels');
          setFollowedChannelsArray([]);
        }
      }
    } catch (error) {
      console.warn('Error during localStorage cleanup:', error);
      // Clear all potentially corrupted data
      localStorage.removeItem('likedShorts');
      localStorage.removeItem('followedChannels');
      setLikedShortsArray([]);
      setFollowedChannelsArray([]);
    }
  }, []); // Run only once on mount

  // Enhanced useEffect hooks
  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardNavigation);
    return () => document.removeEventListener('keydown', handleKeyboardNavigation);
  }, [handleKeyboardNavigation]);

  // Scroll to specific video when component mounts or when shorts data changes
  useEffect(() => {
    if (targetVideoId && filteredShorts.length > 0 && containerRef.current) {
      const targetIndex = filteredShorts.findIndex(short => short.id === targetVideoId);
      if (targetIndex !== -1) {
        setCurrentVideoIndex(targetIndex);
        const targetElement = containerRef.current.children[targetIndex] as HTMLElement;
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  }, [targetVideoId, filteredShorts]);

  // Auto-advance to next video when current video ends
  useEffect(() => {
    if (isAutoAdvanceEnabled && currentVideoIndex < filteredShorts.length - 1) {
      // This would be triggered by video end event in ShortDisplayCard
      // Implementation would be in the video player component
    }
  }, [isAutoAdvanceEnabled, currentVideoIndex, filteredShorts.length]);

  // Set up intersection observer to track which video is currently in view
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const videoElement = entry.target as HTMLElement;
            const index = Array.from(containerRef.current?.children || []).indexOf(videoElement);
            if (index !== -1 && index !== currentVideoIndex) {
              setCurrentVideoIndex(index);

              // Update URL without triggering scroll
              if (filteredShorts[index]) {
                const newUrl = `/shorts?v=${filteredShorts[index].id}`;
                window.history.replaceState(null, '', newUrl);
              }
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.5,
        rootMargin: '0px'
      }
    );

    // Observe all video elements
    Array.from(containerRef.current.children).forEach((child) => {
      observer.observe(child);
    });

    return () => observer.disconnect();
  }, [filteredShorts, currentVideoIndex]);

  if (loading) {
    return <ShortsPageSkeleton />;
  }

  if (error) {
    return <ShortsPageError error={error} />;
  }

  if (filteredShorts.length === 0) {
    return (
      <div className="h-[calc(100vh-3.5rem)] bg-black flex flex-col">
        {/* Enhanced Header with Search and Filters */}
        <div className="relative z-10 bg-black/80 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-white text-lg font-semibold">Shorts</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSearchToggle}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                aria-label="Search shorts"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleFilterToggle}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                aria-label="Filter shorts"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="px-4 pb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search shorts..."
                  className="w-full bg-white/10 text-white placeholder-white/60 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-white/20"
                  autoFocus
                />
                <button
                  onClick={handleSearchToggle}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-white/60 hover:text-white"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <ShortsFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              onClose={() => setShowFilters(false)}
            />
          )}
        </div>

        <EmptyShortsState
          hasFilters={selectedCategory !== 'all' || debouncedSearchQuery !== ''}
          onClearFilters={() => {
            setSelectedCategory('all');
            setSearchQuery('');
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-black relative">
      {/* Enhanced Header with Search and Filters */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-white text-lg font-semibold">Shorts</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSearchToggle}
              className={`p-2 rounded-full transition-colors ${
                showSearch ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'
              }`}
              aria-label="Search shorts"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleFilterToggle}
              className={`p-2 rounded-full transition-colors ${
                showFilters ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'
              }`}
              aria-label="Filter shorts"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="px-4 pb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shorts..."
                className="w-full bg-white/10 text-white placeholder-white/60 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-white/20"
                autoFocus
              />
              <button
                onClick={handleSearchToggle}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-white/60 hover:text-white"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <ShortsFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onClose={() => setShowFilters(false)}
          />
        )}
      </div>





      {/* Navigation Controls */}
      <div className="absolute right-20 top-1/2 transform -translate-y-1/2 z-30 pointer-events-auto">
        <ShortsNavigation
          onPrevious={handlePreviousVideo}
          onNext={handleNextVideo}
          canGoPrevious={currentVideoIndex > 0}
          canGoNext={currentVideoIndex < filteredShorts.length - 1}
        />
      </div>

      {/* Shorts Feed */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        role="feed"
        aria-label="Shorts feed"
      >
        {filteredShorts.map((short, index) => (
          <div key={short.id || index} className="h-full w-full snap-start">
            <ShortDisplayCard
              short={short}
              isLiked={likedShorts.has(short.id)}
              isFollowed={followedChannels.has(short.channelName)}
              onLike={handleLike}
              onFollow={handleFollow}
              onComment={handleComment}
              onShare={handleShare}
              onVideoChange={() => handleVideoChange(index)}
              onVideoEnd={isAutoAdvanceEnabled ? handleNextVideo : () => {}}
              isActive={index === currentVideoIndex}
            />
          </div>
        ))}
      </div>

      {/* Comment Modal */}
      <CommentModal
        isOpen={commentModalOpen}
        onClose={() => {
          setCommentModalOpen(false);
          setSelectedShortForComment(null);
        }}
        shortId={selectedShortForComment?.id || ''}
        shortTitle={selectedShortForComment?.title || 'Short video'}
        onCommentSubmit={handleCommentSubmit}
      />
    </div>
  );
};

export default ShortsPage;