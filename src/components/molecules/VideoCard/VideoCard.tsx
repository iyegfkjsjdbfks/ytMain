import React from 'react';
// VideoCard - Simple Component;
import React from 'react';

export interface VideoCardProps {
  className?: string;
  children?: React.ReactNode, 

export const VideoCard = (props: VideoCardProps) => {
  return React.createElement('div', {)
    className: props.className, 
  }, props.children || 'Component ready');

export default VideoCard;