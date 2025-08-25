// WatchPage - Simple Component;
import React from 'react';

export interface WatchPageProps {
  className?: string;
  children?: React.ReactNode, 

export const WatchPage = (props: WatchPageProps) => {
  return React.createElement('div', {)
    className: props.className, 
  }, props.children || 'Component ready');

export default WatchPage;