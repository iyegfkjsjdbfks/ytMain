// LiveStreamErrorBoundary - Simple Component;
import React from 'react';

export interface LiveStreamErrorBoundaryProps {
  className?: string;
  children?: React.ReactNode, 
}

export const LiveStreamErrorBoundary = (props: LiveStreamErrorBoundaryProps) => {
  return React.createElement('div', {
    className: props.className, 
  }, props.children || 'Component ready');
};

export default LiveStreamErrorBoundary;