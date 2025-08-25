import React from 'react';
// VideoGrid - Simple Component;
import React from 'react';

export interface VideoGridProps {
  className?: string;
  children?: React.ReactNode, 
}

export const VideoGrid = (props: VideoGridProps) => {
  return React.createElement('div', {
    className: props.className, 
  }, props.children || 'Component ready');
};

export default VideoGrid;