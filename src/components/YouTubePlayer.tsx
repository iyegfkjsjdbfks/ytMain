import React from 'react';
// YouTubePlayer - Simple Component;
import React from 'react';

export interface YouTubePlayerProps {
  className?: string;
  children?: React.ReactNode, 

export const YouTubePlayer = (props: YouTubePlayerProps) => {
  return React.createElement('div', {)
    className: props.className, 
}
  }, props.children || 'Component ready');

export default YouTubePlayer;