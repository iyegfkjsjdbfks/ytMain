import React, { useRef, memo, useMemo, useState, useEffect, lazy, FC, MouseEvent } from 'react';
// @ts - nocheck
import { useIntersectionObserver } from '../src / hooks / useIntersectionObserver';
import { getYouTubeVideoId } from '../src / lib / youtube - utils';
import { performanceMonitor } from '../utils / performance';

import type { YouTubeSearchResult, GoogleSearchResult } from '../services / googleSearchService';
import type { Video } from '../types.ts';

// Helper function to convert search results to Video type
const convertToVideo = (item: Video | YouTubeSearchResult | GoogleSearchResult): (Video) => {}
 if ('views' in item && 'likes' in item && 'visibility' in item) {}
 // Already a Video type
 return item;
 }

 // Convert YouTubeSearchResult or GoogleSearchResult to Video
 const searchResult = item;
 const now = new Date().toISOString();
 return {}
 id: searchResult.id,
 title: searchResult.title,
 description: searchResult.description || '',
 thumbnailUrl: searchResult.thumbnailUrl,
 videoUrl: searchResult.videoUrl,
 duration: searchResult.duration || '0:00',
 views: (("viewCount" in searchResult && (("viewCount" in searchResult) ? searchResult.viewCount : searchResult.views)) || ("views" in searchResult && searchResult.views) || 0).toString(),
 likes: (("likeCount" in searchResult && (("likeCount" in searchResult) ? searchResult.likeCount : searchResult.likes)) || ("likes" in searchResult && searchResult.likes) || 0),
 dislikes: (("dislikeCount" in searchResult && (("dislikeCount" in searchResult && searchResult.dislikeCount) || ("dislikes" in searchResult && searchResult.dislikes) || 0)) || ("dislikes" in searchResult && searchResult.dislikes) || 0) || 0,
 uploadedAt: searchResult.uploadedAt || now,
 channelName: searchResult.channelName,
 channelId: searchResult.channelId || 'unknown',
 channelAvatarUrl: searchResult.channelAvatarUrl || '',
 category: (("categoryId" in searchResult && (("categoryId" in searchResult && searchResult.categoryId) || ("category" in searchResult && searchResult.category) || "general")) || ("category" in searchResult && searchResult.category) || "general") || '',
 tags: searchResult.tags || [],
 visibility: 'public' as const,
 // Required BaseEntity properties,
 createdAt: now,
 updatedAt: now 
 };

export interface OptimizedSearchResultsProps {}
 videos: Video;,
 youtubeVideos: YouTubeSearchResult;
 googleSearchVideos: GoogleSearchResult;,
 loading: boolean;
 query: string;,
 sortBy: string;
 onVideoClick: (video: Video | YouTubeSearchResult | GoogleSearchResult) => void;
 onLoadMore?: () => void;
 hasMore?: boolean;
}

// Debounce hook for search optimization
export function useDebounce < T>(value: T,;
 delay): T {}
 const [debouncedValue, setDebouncedValue] = useState < T>(value);

 useEffect(() => {}
 const handler = setTimeout((() => {}
 setDebouncedValue(value);
 }) as any, delay);

 return () => {}
 clearTimeout(handler);
 }}, [value, delay]);

 return debouncedValue;
}

// Memoized sorting functions
const sortingFunctions: object = {}
 relevance: (items,
 query) => {}
 return items.sort((a,
 b) => {}
 const aRelevance = a.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
 const bRelevance = b.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
 return bRelevance - aRelevance;
 });
 },
 date: (items) => {}
 return items.sort((a,
 b) => {}
 const dateA = a.uploadedAt || a.publishedAt || '';
 const dateB = b.uploadedAt || b.publishedAt || '';
 return new Date(dateB).getTime() - new Date(dateA).getTime();
 });
 },
 views: (items) => {}
 return items.sort((a,
 b) => {}
 const viewsA = typeof a.views === 'string' ? parseInt(a.views, 10) || 0 : (a.views || 0);
 const viewsB = typeof b.views === 'string' ? parseInt(b.views, 10) || 0 : (b.views || 0);
 return viewsB - viewsA;
 });
 };

// Helper function to extract video ID for iframe embedding
const extractVideoId = (video: Video) => {}
 let videoId = getYouTubeVideoId(video.videoUrl);
 if (!videoId) {}
 videoId = video.id;
 if (videoId && videoId.includes('-')) {}
 const parts = videoId.split('-');
 const lastPart = parts[parts.length - 1];
 if (lastPart && lastPart.length === 11) {}
 videoId = lastPart;
 }
 }
 return videoId && videoId.length === 11 ? videoId : null;
};

// YouTube - style search result card component
const YouTubeSearchResultCard: React.FC<{,}
 item: Video | YouTubeSearchResult | GoogleSearchResult;,
 onVideoClick: (video: Video | YouTubeSearchResult | GoogleSearchResult) => void
}> = memo(({ item, onVideoClick }) => {}
 const convertedVideo = convertToVideo(item);

 const formatDuration = (duration: string | number) => {}
 if (typeof duration === 'string') {}
return duration;
}
 if (typeof duration === 'number') {}
 const minutes = Math.floor(duration / 60);
 const seconds = duration % 60;
 return `${minutes}:${seconds.toString().padStart(2, '0')}`;
 }
 return '0: 00';
 };

 const formatViews = (views: string | number) => {}
 const num = typeof views === 'string' ? parseInt(views, 10) || 0 : views || 0;
 if (num >= 1000000000) {}
 return `${(num / 1000000000).toFixed(1)}B`;
 } else if (num >= 1000000) {}
 return `${(num / 1000000).toFixed(1)}M`;
 } else if (num >= 1000) {}
 return `${(num / 1000).toFixed(1)}K`;
 }
 return num.toString();
 };

 const formatTimeAgo = (dateStr: any) => {}
 try {}
 const date = new Date(dateStr);
 const now = new Date();
 const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

 if (diffInSeconds < 60) {}
return 'Just now';
}
 if (diffInSeconds < 3600) {}
return `${Math.floor(diffInSeconds / 60)} minutes ago`;
}
 if (diffInSeconds < 86400) {}
return `${Math.floor(diffInSeconds / 3600)} hours ago`;
}
 if (diffInSeconds < 2592000) {}
return `${Math.floor(diffInSeconds / 86400)} days ago`;
}
 if (diffInSeconds < 31536000) {}
return `${Math.floor(diffInSeconds / 2592000)} months ago`;
}
 return `${Math.floor(diffInSeconds / 31536000)} years ago`;
 } catch (e) {}
 return 'Recently';
 };

 const videoId = extractVideoId(convertedVideo);

 const handleCardClick = (e: React.MouseEvent) => {}
 // Prevent navigation when clicking on video player
 if (videoId && (e.target as HTMLElement).closest('iframe, [id*="youtube - player"]')) {}
 e.stopPropagation();
 return;
 }
 onVideoClick(item);
 };

 return (
 <div>
// FIXED:  className={"fle}x flex - col sm:flex - row gap - 4 sm:gap - 6 cursor - pointer group hover:bg - gray - 50 dark:hover:bg - gray - 800 / 50 rounded - lg p - 3 transition - colors" />
// FIXED:  onClick={(e: React.MouseEvent) => handleCardClick(e)}
 onKeyDown={(e) => {}
 if (e.key === 'Enter' || e.key === ' ') {}
 e.preventDefault();
 onVideoClick(item);
 }
 }
 role="button"
 tabIndex={0}
 >
 {/* YouTube Player or Thumbnail */}
 <div className={"relativ}e flex - shrink - 0">
 <div className="w - full sm:w-[480px] h-[270px] sm:h-[270px] aspect - video sm:aspect - auto bg - gray - 200 dark:bg - gray - 700 rounded - xl overflow - hidden">
 {videoId ? (}
 <div>
// FIXED:  className="w - full h - full" />
// FIXED:  onClick={(e: React.MouseEvent) => e.stopPropagation()}
 onKeyDown={(e) => {}
 if (e.key === 'Enter' || e.key === ' ') {}
 e.stopPropagation();
 }
 }
 role="button"
 tabIndex={0}
 >
 <iframe>
// FIXED:  src={`https://www.youtube - nocookie.com / embed/${videoId}?rel = 0&modestbranding = 1&controls = 1&enablejsapi = 0&origin="${encodeURIComponent(window.location.origin)}`}"
 title={convertedVideo.title}
// FIXED:  className="w - full h - full border - 0 rounded - xl"
 allow="accelerometer; autoplay; clipboard - write; encrypted - media; gyroscope; picture - in - picture; web - share"
 allowFullScreen
 loading="lazy" />
 />
// FIXED:  </div>
 ) : (
 <></><</>/>
 <img>
// FIXED:  src={convertedVideo.thumbnailUrl}
// FIXED:  alt={convertedVideo.title}
// FIXED:  className="w - full h - full object - cover group - hover:scale - 105 transition - transform duration - 200"
 loading="lazy" />
 />
 {/* Duration badge */}
 {convertedVideo.duration && convertedVideo.duration !== '0:00' && (}
 <div className={"absolut}e bottom - 2 right - 2 bg - black bg - opacity - 50 text - white text - xs px - 1.5 py - 0.5 rounded - sm font - medium">
 {formatDuration(convertedVideo.duration)}
// FIXED:  </div>
 )}
// FIXED:  </>
 )}
// FIXED:  </div>
// FIXED:  </div>

 {/* Content */}
 <div className={"fle}x - 1 min - w - 0">
 {/* Title */}
 <h3 className={"tex}t - lg sm:text - xl font - medium text - gray - 900 dark:text - white line - clamp - 2 leading - 6 mb - 1 group - hover:text - blue - 600 dark:group - hover:text - blue - 400 transition - colors">
 {convertedVideo.title}
// FIXED:  </h3>

 {/* Minimal metadata line - YouTube style */}
 <div className={"tex}t - sm text - gray - 600 dark:text - gray - 400 mb - 2">
 <span className={"hover}:text - gray - 900 dark:hover:text - white transition - colors">
 {convertedVideo.channelName}
// FIXED:  </span>
 <span className={"m}x - 1">•</span>
 <span>{formatViews(convertedVideo.views)} views</span>
 <span className={"m}x - 1">•</span>
 <span>{formatTimeAgo(convertedVideo.uploadedAt)}</span>
// FIXED:  </div>

 {/* Description - only first line visible */}
 <p className={"tex}t - sm text - gray - 600 dark:text - gray - 400 line - clamp - 1 leading - 5">
 {convertedVideo.description}
// FIXED:  </p>
// FIXED:  </div>
// FIXED:  </div>
 );
});

// Filter tab types
type FilterTab = 'all' | 'videos' | 'channels' | 'playlists' | 'live' | 'shorts';

// Main component
const OptimizedSearchResults: React.FC < OptimizedSearchResultsProps> = ({}
 videos,
 youtubeVideos,
 googleSearchVideos,
 loading,
 query,
 sortBy,
 onVideoClick,
 onLoadMore,
 hasMore = false }) => {}
 const [activeTab, setActiveTab] = useState < FilterTab>('all');
 const containerRef = React.useRef < HTMLDivElement>(null);

 // Debounce query for performance
 const debouncedQuery = useDebounce(query, 300);

 // Intersection observer for infinite scroll
 const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({}
 threshold: 0.1,
 rootMargin: '100px' });

 // Combine and sort all results
 const allResults = useMemo(() => {}
 performanceMonitor.startMeasure('search - results - processing');

 const combined = [;
 ...(videos || []).map((v) => ({ ...v as any, source: 'local' as const contentType: 'video' as const })),
 ...(youtubeVideos || []).map((v) => ({ ...v as any, source: 'youtube' as const contentType: 'video' as const })),
 ...(googleSearchVideos || []).map((v) => ({ ...v as any, source: 'google - search' as const contentType: 'video' as const }))];

 let sorted = combined;
 if (sortingFunctions[sortBy as keyof typeof sortingFunctions]) {}
 sorted = sortingFunctions[sortBy as keyof typeof sortingFunctions](combined, debouncedQuery);
 }

 if (performanceMonitor.hasMetric('search - results - processing')) {}
 performanceMonitor.endMeasure('search - results - processing');
 }
 return sorted;
 }, [videos, youtubeVideos, googleSearchVideos, sortBy, debouncedQuery]);

 // Filter results based on active tab
 const filteredResults = useMemo(() => {}
 switch (activeTab) {}
 case 'videos':
 return allResults; // All our current content are videos;
 case 'channels':
 case 'playlists':
 return []; // Not implemented yet;
 case 'live':
 return allResults.filter((item) => {}
 const video = 'isLive' in item ? item : convertToVideo(item);
 return video.isLive;
 });
 case 'shorts':
 return allResults.filter((item) => {}
 const video = 'duration' in item ? item : convertToVideo(item);
 if (typeof video.duration === 'string') {}
 const parts = video.duration.split(':');
 if (parts.length === 2 && parts[0] && parts[1]) {}
 const minutes = parseInt(parts[0], 10);
 const seconds = parseInt(parts[1], 10);
 return minutes === 0 && seconds <= 60;
 }
 return false;
 });
 case 'all':
 default: return allResults
 }
 }, [allResults, activeTab]);

 // Handle infinite scroll
 useEffect(() => {}
 if (isIntersecting && hasMore && !loading && onLoadMore) {}
 onLoadMore();
 }

 }, [isIntersecting, hasMore, loading, onLoadMore]);

 // Loading skeleton
 const LoadingSkeleton = memo(() => (
 <div className="w - full max - w-[1280px] mx - auto">
 <div className={"spac}e - y - 4 px - 4">
 {Array<any>.from({ length: 10 }).map((_, index) => (
 <div key={index} className={"fle}x flex - col sm:flex - row gap - 4 sm:gap - 6 animate - pulse p - 3">
 <div className="w - full sm:w-[480px] h-[270px] bg - gray - 200 dark:bg - gray - 700 rounded - xl flex - shrink - 0" />
 <div className={"fle}x - 1 min - w - 0">
 <div className="h - 6 bg - gray - 200 dark:bg - gray - 700 rounded mb - 1" />
 <div className="h - 6 bg - gray - 200 dark:bg - gray - 700 rounded w - 3/4 mb - 2" />
 <div className="h - 4 bg - gray - 200 dark:bg - gray - 700 rounded w - 2/3 mb - 2" />
 <div className="h - 4 bg - gray - 200 dark:bg - gray - 700 rounded w - full" />
// FIXED:  </div>
// FIXED:  </div>
 ))}
// FIXED:  </div>
// FIXED:  </div>
 ));

 // Empty state
 const EmptyState = memo(() => (
 <div className={"fle}x flex - col items - center justify - center py - 12 text - center">
 <div className="w - 24 h - 24 bg - gray - 200 rounded - full flex items - center justify - center mb - 4">
 <svg className="w - 12 h - 12 text - gray - 400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l - 6 - 6m2 - 5a7 7 0 11 - 14 0 7 7 0 0114 0z" />
// FIXED:  </svg>
// FIXED:  </div>
<h3 className={"tex}t - lg font - medium text - gray - 900 mb - 2">No results found</h3>
 <p className={"tex}t - gray - 500 max - w - md">
 Try adjusting your search terms to find what you're looking for.
// FIXED:  </p>
// FIXED:  </div>
 ));

 if (loading && allResults.length === 0) {}
 return <LoadingSkeleton />;
 }

 if (!loading && allResults.length === 0) {}
 return <EmptyState />;
 }

 return (
 <div ref={containerRef} className="w - full max - w-[1280px] mx - auto">
 {/* YouTube - style filter tabs */}
 <div className={"m}b - 4 px - 4">
 <div className={"fle}x items - center gap - 3 mb - 4 overflow - x - auto scrollbar - hide">
 <button />
// FIXED:  onClick={() => setActiveTab('all': React.MouseEvent)}
// FIXED:  className={`flex - shrink - 0 px - 3 py - 1.5 rounded - full text - sm font - medium transition - colors ${}
 activeTab === 'all'
 ? 'bg - black dark:bg - white text - white dark:text - black'
 : 'bg - gray - 100 dark:bg - gray - 800 text - gray - 700 dark:text - gray - 300 hover:bg - gray - 200 dark:hover:bg - gray - 700'
 }`}
 >
 All
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => setActiveTab('videos': React.MouseEvent)}
// FIXED:  className={`flex - shrink - 0 px - 3 py - 1.5 rounded - full text - sm font - medium transition - colors ${}
 activeTab === 'videos'
 ? 'bg - black dark:bg - white text - white dark:text - black'
 : 'bg - gray - 100 dark:bg - gray - 800 text - gray - 700 dark:text - gray - 300 hover:bg - gray - 200 dark:hover:bg - gray - 700'
 }`}
 >
 Videos
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>

 {/* Results header */}
 <div className={"m}b - 4 px - 4">
 <div className={"tex}t - sm text - gray - 600 dark:text - gray - 400">
 About {filteredResults.length.toLocaleString()} results
// FIXED:  </div>
// FIXED:  </div>

 {/* Results */}
 {filteredResults.length > 0 ? (}
 <div className={"spac}e - y - 4 px - 4">
 {filteredResults.map((item, index) => (}
 <YouTubeSearchResultCard>
 key={`${item.id}-${index}`}
 item={item}
 onVideoClick={onVideoClick} />
 />
 ))}
// FIXED:  </div>
 ) : (
 <EmptyState />
 )}

 {/* Load more trigger */}
 {hasMore && (}
 <div ref={loadMoreRef as React.RefObject < HTMLDivElement>} className="h - 20 flex items - center justify - center mt - 8">
 {loading ? (}
 <div className={"animat}e - spin rounded - full h - 6 w - 6 border - b - 2 border - red - 600" />
 ) : (
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => onLoadMore(e)}
// FIXED:  className={"p}x - 6 py - 3 bg - red - 600 text - white rounded - lg hover:bg - red - 700 transition - colors font - medium"
 >
 Load More Videos
// FIXED:  </button>
 )}
// FIXED:  </div>
 )}
// FIXED:  </div>
 );
};

// Export memoized component
export default memo(OptimizedSearchResults);
