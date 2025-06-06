import * as React from 'react';
import {  useMemo, useCallback, useState, useEffect  } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Video } from '../types';
import OptimizedVideoCard from './OptimizedVideoCard';
import LoadingSpinner from './LoadingSpinner';
import { cn } from '../utils/cn';

interface VirtualizedVideoGridProps {
  videos: Video[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onVideoClick?: (video: Video) => void;
  onChannelClick?: (channelId: string) => void;
  className?: string;
  cardSize?: 'sm' | 'md' | 'lg';
  showChannel?: boolean;
  showDescription?: boolean;
}

interface GridItemProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    videos: Video[];
    columnsPerRow: number;
    onVideoClick?: (video: Video) => void;
    onChannelClick?: (channelId: string) => void;
    cardSize: 'sm' | 'md' | 'lg';
    showChannel: boolean;
    showDescription: boolean;
  };
}

const GridItem: React.FC<GridItemProps> = ({ columnIndex, rowIndex, style, data }) => {
  const {
    videos,
    columnsPerRow,
    onVideoClick,
    onChannelClick,
    cardSize,
    showChannel,
    showDescription,
  } = data;

  const videoIndex = rowIndex * columnsPerRow + columnIndex;
  const video = videos[videoIndex];

  if (!video) {
    return <div style={style} />;
  }

  return (
    <div style={style} className="p-2">
      <OptimizedVideoCard
        video={video}
        size={cardSize}
        showChannel={showChannel}
        showDescription={showDescription}
        {...(onVideoClick && { onClick: onVideoClick })}
        {...(onChannelClick && { onChannelClick })}
      />
    </div>
  );
};

const VirtualizedVideoGrid: React.FC<VirtualizedVideoGridProps> = ({
  videos,
  loading = false,
  hasMore = false,
  onLoadMore,
  onVideoClick,
  onChannelClick,
  className,
  cardSize = 'md',
  showChannel = true,
  showDescription = false,
}) => {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  // Calculate grid dimensions based on card size and container width
  const { columnsPerRow, columnWidth, rowHeight } = useMemo(() => {
    const cardWidths = {
      sm: 280,
      md: 320,
      lg: 360,
    };
    
    const cardHeights = {
      sm: 240,
      md: 280,
      lg: 320,
    };

    const cardWidth = cardWidths[cardSize];
    const cardHeight = cardHeights[cardSize];
    const gap = 16; // 1rem gap
    
    const availableWidth = containerSize.width - gap;
    const cols = Math.max(1, Math.floor(availableWidth / (cardWidth + gap)));
    const actualColumnWidth = Math.floor(availableWidth / cols);
    
    return {
      columnsPerRow: cols,
      columnWidth: actualColumnWidth,
      rowHeight: cardHeight + gap,
    };
  }, [containerSize.width, cardSize]);

  const rowCount = Math.ceil(videos.length / columnsPerRow);

  // Handle container resize
  useEffect(() => {
    if (!containerRef) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    resizeObserver.observe(containerRef);
    return () => resizeObserver.disconnect();
  }, [containerRef]);

  // Handle infinite scrolling
  const handleScroll = useCallback(
    ({ scrollTop, scrollHeight, clientHeight }: any) => {
      if (!hasMore || loading || !onLoadMore) return;

      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      if (scrollPercentage > 0.8) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore]
  );

  // Grid item data
  const itemData = useMemo(
    () => ({
      videos,
      columnsPerRow,
      ...(onVideoClick && { onVideoClick }),
      ...(onChannelClick && { onChannelClick }),
      cardSize,
      showChannel,
      showDescription,
    }),
    [videos, columnsPerRow, onVideoClick, onChannelClick, cardSize, showChannel, showDescription]
  );

  if (videos.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <div className="text-6xl mb-4">📺</div>
        <h3 className="text-lg font-medium mb-2">No videos found</h3>
        <p className="text-sm text-center max-w-md">
          There are no videos to display at the moment. Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('w-full h-full', className)}>
      <div
        ref={setContainerRef}
        className="w-full h-full min-h-[400px]"
      >
        {containerSize.width > 0 && (
          <>
            <Grid
              columnCount={columnsPerRow}
              columnWidth={columnWidth}
              height={containerSize.height}
              rowCount={rowCount}
              rowHeight={rowHeight}
              width={containerSize.width}
              itemData={itemData}
              onScroll={handleScroll}
              overscanRowCount={2}
              overscanColumnCount={1}
            >
              {GridItem}
            </Grid>
            
            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            )}
            
            {/* Load more button */}
            {hasMore && !loading && onLoadMore && (
              <div className="flex justify-center py-8">
                <button
                  onClick={onLoadMore}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Load More Videos
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VirtualizedVideoGrid;