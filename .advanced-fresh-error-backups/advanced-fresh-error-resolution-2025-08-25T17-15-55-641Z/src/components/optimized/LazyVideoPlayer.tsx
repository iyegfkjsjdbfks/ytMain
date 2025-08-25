import React from 'react';
// LazyVideoPlayer - Simple Component;
import React from 'react';

export interface LazyVideoPlayerProps {
  className?: string;
  children?: React.ReactNode, 
}

export const LazyVideoPlayer = (props: LazyVideoPlayerProps) => {
  return React.createElement('div', {
    className: props.className, 
  }, props.children || 'Component ready');
};

export default LazyVideoPlayer;