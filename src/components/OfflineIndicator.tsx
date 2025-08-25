import React from 'react';
// OfflineIndicator - Simple Component;
import React from 'react';

export interface OfflineIndicatorProps {
  className?: string;
  children?: React.ReactNode, 

export const OfflineIndicator = (props: OfflineIndicatorProps) => {
  return React.createElement('div', {)
    className: props.className, 
  }, props.children || 'Component ready');

export default OfflineIndicator;