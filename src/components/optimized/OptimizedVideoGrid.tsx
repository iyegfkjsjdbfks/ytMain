// TODO: Fix import - import React from "react";
// TODO: Fix import - import { FixedSizeGrid as Grid } from 'react-window';

// TODO: Fix import - import { memo, useMemo, useCallback, useState } from 'react';
import type { Video } from '../../types/core';

interface OptimizedVideoGridProps {
  videos: Video;
  onVideoClick: (video: Video) => void;
  loading?: boolean;
  className?: string;
  itemsPerRow?: number;
  itemHeight?: number;
  containerHeight?: number;
}

// Memoized video item component
const VideoGridItem = memo<{
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    videos: Video;
    itemsPerRow: number;
    onVideoClick:(video: Video) => void;
  };
}>(({ columnIndex, rowIndex, style, data }) => {
  const { videos, itemsPerRow, onVideoClick } = data;
  const index = rowIndex * itemsPerRow + columnIndex;
  const video = videos[index];

  const handleClick = useCallback(() => {
    if (video) {
      onVideoClick(video);
    }
  }, [video, onVideoClick]);

  if (!video) {
    return <div style={style} />;
  }

  return (
    <div style={style} className="p-2">
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleClick}
      >
        <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="p-3">
          <h3 className="font-medium text-sm line-clamp-2 text-gray-900 dark:text-white">
            {video.title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {video.channel?.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {video.views} views • {video.publishedAt || video.uploadedAt}
          </p>
        </div>
      </div>
    </div>
  );
});

VideoGridItem.displayName = 'VideoGridItem';

const OptimizedVideoGrid = memo<OptimizedVideoGridProps>(({
  videos,
  onVideoClick,
  loading = false,
  className = '',
  itemsPerRow = 4,
  itemHeight = 280,
  containerHeight = 600,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);

  // Calculate grid dimensions
  const { rowCount, columnCount, itemWidth } = useMemo(() => {
    const count = Math.ceil(videos.length / itemsPerRow);
    const width = Math.floor(containerWidth / itemsPerRow);

    return {
      rowCount: count,
      columnCount: itemsPerRow,
      itemWidth: width,
    };
  }, [videos.length, itemsPerRow, containerWidth]);

  // Memoized grid data
  const gridData = useMemo(() => ({
    videos,
    itemsPerRow,
    onVideoClick,
  }), [videos, itemsPerRow, onVideoClick]);

  // Container ref for measuring width
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          setContainerWidth(entry.contentRect.width);
        }
      });

      resizeObserver.observe(node);
      setContainerWidth(node.offsetWidth);

      return () => {
        resizeObserver.disconnect();
      };
    }
    return undefined;
  }, []);

  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">No videos found</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {containerWidth > 0 && (
        <Grid
          columnCount={columnCount}
          columnWidth={itemWidth}
          width={containerWidth}
          height={containerHeight}
          rowCount={rowCount}
          rowHeight={itemHeight}
          itemData={gridData}
          overscanRowCount={2}
          overscanColumnCount={1}
        >
          {VideoGridItem}
        </Grid>
      )}
    </div>
  );
});

OptimizedVideoGrid.displayName = 'OptimizedVideoGrid';

export default OptimizedVideoGrid;