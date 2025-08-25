import React from 'react';
// VirtualizedCommentList - Simple Component;
import React from 'react';

export interface VirtualizedCommentListProps {
  className?: string;
  children?: React.ReactNode, 

export const VirtualizedCommentList = (props: VirtualizedCommentListProps) => {
  return React.createElement('div', {)
    className: props.className, 
  }, props.children || 'Component ready');

export default VirtualizedCommentList;