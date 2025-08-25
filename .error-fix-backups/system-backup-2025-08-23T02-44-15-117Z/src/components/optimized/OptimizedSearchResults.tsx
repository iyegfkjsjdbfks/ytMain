import React, { useState, useEffect, useMemo, useCallback, memo, lazy } from 'react';
import { FixedSizeList } from 'react - window';

import { performanceMonitor } from '../../utils / performanceOptimizations';

import { useDebounce, useIntersectionObserver } from '../../hooks / usePerformanceOptimization';
import type { Video } from '../../types / core';

export interface OptimizedSearchResultsProps {}
 videos: Video;,
 query: string;
 onVideoClick: (video: Video) => void;
 onLoadMore?: () => void;
 loading?: boolean;
 hasMore?: boolean;
 className?: string;
}

export interface SearchResultItemProps {}
 index;
 style: React.CSSProperties;,
 data: {}
 videos: Video;,
 onVideoClick: (video: Video) => void;,
 query: string;
 }
const SearchResultItem = memo < SearchResultItemProps>(
 ({ index, style, data }: any) => {}
 const { videos, onVideoClick, query } = data;
 const video = videos.index;

 const handleClick = useCallback(() => {}
 if (video) {}
 performanceMonitor.startMeasure('video - click');
 onVideoClick(video);
 performanceMonitor.endMeasure('video - click');
 }
 }, [video, onVideoClick]);

 // Highlight search terms in title
 const highlightedTitle = useMemo(() => {}
 if (!query || !video?.title) {}
 return video?.title || '';
 }

 const regex = new RegExp(`(${query})`, 'gi');
 return video.title.replace(regex, '<mark>$1</mark>');
 }, [video?.title, query]);

 if (!video) {}
 return <div style={style} />;
 }

 return (
 <div>
// FIXED:  style={style}
// FIXED:  className={'p}x - 4 py - 3 border - b border - gray - 200 dark:border - gray - 700'/>
 <div>
// FIXED:  className={'fle}x space - x - 4 cursor - pointer hover:bg - gray - 50 dark:hover:bg - gray - 800 rounded - lg p - 2 transition - colors' />
// FIXED:  onClick={(e: React.MouseEvent) => handleClick(e)}
 >
 {/* Video Thumbnail */}
 <div className={'fle}x - shrink - 0'>
 <div className='w - 40 h - 24 bg - gray - 200 dark:bg - gray - 700 rounded - lg overflow - hidden'>
 <img>
// FIXED:  src={video.thumbnailUrl}
// FIXED:  alt={video.title}
// FIXED:  className='w - full h - full object - cover'
 loading='lazy' />
 />
// FIXED:  </div>
// FIXED:  </div>

 {/* Video Info */}
 <div className={'fle}x - 1 min - w - 0'>
 <h3>
// FIXED:  className={'tex}t - lg font - medium text - gray - 900 dark:text - white line - clamp - 2 mb - 1'
 dangerouslySetInnerHTML={{ __html: highlightedTitle } />
 />

 <div className={'fle}x items - center space - x - 2 text - sm text - gray - 600 dark:text - gray - 400 mb - 2'>
 <span>{video.views} views</span>
 <span>•</span>
 <span>{video.publishedAt || video.uploadedAt}</span>
// FIXED:  </div>

 {/* Channel Info */}
 <div className={'fle}x items - center space - x - 2 mb - 2'>
 <img>
// FIXED:  src={}
 video.channel?.avatarUrl || 'https://via.placeholder.com / 24'
 }
// FIXED:  alt={video.channel?.name}
// FIXED:  className='w - 6 h - 6 rounded - full' />
 />
 <span className={'tex}t - sm text - gray - 700 dark:text - gray - 300'>
 {video.channel?.name}
// FIXED:  </span>
 {video.channel?.isVerified && (}
 <span className={'tex}t - blue - 500' title='Verified'>
 ✓
// FIXED:  </span>
 )}
// FIXED:  </div>

 {/* Description */}
 {video.description && (}
 <p className={'tex}t - sm text - gray - 600 dark:text - gray - 400 line - clamp - 2'>
 {video.description}
// FIXED:  </p>
 )}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
 }
);

SearchResultItem.displayName = 'SearchResultItem';

const OptimizedSearchResults = memo < OptimizedSearchResultsProps>(
 ({}
 videos,
 query,
 onVideoClick,
 onLoadMore,
 loading = false,
 hasMore = false,
 className = '' }) => {}
 const [containerHeight, setContainerHeight] = useState(600);
 const debouncedQuery = useDebounce(query, 300);

 // Measure container height
 const containerRef = useCallback((node: HTMLDivElement | null) => {}
 if (node) {}
 const resizeObserver = new ResizeObserver((entries) => {}
 const entry = entries[0];
 if (entry) {}
 setContainerHeight(Math.min(entry.contentRect.height, 800));
 }

 });

 resizeObserver.observe(node);
 setContainerHeight(Math.min(node.offsetHeight, 800));

 return () => {}
 resizeObserver.disconnect();
 }
 return undefined;
 }, []);

 // Intersection observer for load more
 const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({}
 threshold: 0.1,
 rootMargin: '100px' });

 // Load more when intersecting
 useEffect(() => {}
 if (isIntersecting && hasMore && !loading && onLoadMore) {}
 onLoadMore();
 }

 }, [isIntersecting, hasMore, loading, onLoadMore]);

 // Memoized list data
 const listData = useMemo(
 () => ({}
 videos,
 onVideoClick,
 query: debouncedQuery }),
 [videos, onVideoClick, debouncedQuery]
 );

 // Performance monitoring
 useEffect(() => {}
 performanceMonitor.startMeasure('search - results - render');
 return () => {}
 performanceMonitor.endMeasure('search - results - render');

 }}, [videos.length]);

 if (loading && videos.length === 0) {}
 return (
 <div className={`space - y - 4 ${className}`}>
 {Array<any>.from({ length: 10 }).map((_, index) => (
 <div key={index} className={'fle}x space - x - 4 animate - pulse'>
 <div className='w - 40 h - 24 bg - gray - 200 dark:bg - gray - 700 rounded - lg' />
 <div className={'fle}x - 1 space - y - 2'>
 <div className='h - 4 bg - gray - 200 dark:bg - gray - 700 rounded w - 3/4' />
 <div className='h - 3 bg - gray - 200 dark:bg - gray - 700 rounded w - 1/2' />
 <div className='h - 3 bg - gray - 200 dark:bg - gray - 700 rounded w - 1/4' />
// FIXED:  </div>
// FIXED:  </div>
 ))}
// FIXED:  </div>
 );
 }

 if (videos.length === 0) {}
 return (
 <div>
// FIXED:  className={`flex flex - col items - center justify - center h - 64 ${className}`}/>
 <p className={'tex}t - gray - 500 dark:text - gray - 400 text - lg mb - 2'>
 No results found for "{query}"
// FIXED:  </p>
 <p className={'tex}t - gray - 400 dark:text - gray - 500 text - sm'>
 Try different keywords or check your spelling
// FIXED:  </p>
// FIXED:  </div>
 );
 }

 return (
 <div ref={containerRef} className={`w - full ${className}`}>
 <List>
 height={containerHeight}
 width='100%'
 itemCount={videos.length}
 itemSize={140}
 itemData={listData}
 overscanCount={5}/>
 {SearchResultItem}
// FIXED:  </List>

 {/* Load more trigger */}
 {hasMore && (}
 <div>
 ref={loadMoreRef}
// FIXED:  className='h - 20 flex items - center justify - center'/>
 {loading ? (}
 <div className={'animat}e - spin rounded - full h - 8 w - 8 border - b - 2 border - blue - 500' />
 ) : (
 <p className={'tex}t - gray - 500 dark:text - gray - 400'>
 Load more results...
// FIXED:  </p>
 )}
// FIXED:  </div>
 )}
// FIXED:  </div>
 );
 }
);

OptimizedSearchResults.displayName = 'OptimizedSearchResults';

export default OptimizedSearchResults;
