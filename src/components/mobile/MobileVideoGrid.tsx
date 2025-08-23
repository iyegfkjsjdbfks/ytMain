import React, { memo, useCallback, useMemo, useState } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Video } from '../src/../types/video';
import EnhancedYouTubeVideoCard from '../src/EnhancedYouTubeVideoCard';
import { useMobileDetection } from '../src/../hooks/useMobileDetection';

interface MobileVideoGridProps {
  videos: Video[];
  onVideoSelect: (video: Video) => void;
}

const MobileVideoGrid: React.FC<MobileVideoGridProps> = memo(({ videos, onVideoSelect }) => {
  const { isMobile } = useMobileDetection();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const columnCount = isMobile ? 2 : 4;
  const rowCount = Math.ceil(videos.length / columnCount);

  const handleVideoClick = useCallback((video: Video) => {
    setSelectedVideo(video);
    onVideoSelect(video);
  }, [onVideoSelect]);

  const Cell = useMemo(() => ({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= videos.length) {
      return null;
    }
    const video = videos[index];
    return (
      <div style={style}>
        <EnhancedYouTubeVideoCard
          video={video}
          onClick={() => handleVideoClick(video)}
          isSelected={selectedVideo?.id === video.id}
        />
      </div>
    );
  }, [videos, columnCount, handleVideoClick, selectedVideo]);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <AutoSizer>
        {({ height, width }) => (
          <Grid
            columnCount={columnCount}
            columnWidth={width / columnCount}
            height={height}
            rowCount={rowCount}
            rowHeight={isMobile ? 280 : 320}
            width={width}
          >
            {Cell}
          </Grid>
        )}
      </AutoSizer>
    </div>
  );
});

MobileVideoGrid.displayName = 'MobileVideoGrid';

export default MobileVideoGrid;