// CommentCard - Simple Component;
import React from 'react';

export interface CommentCardProps {
  className?: string;
  children?: React.ReactNode;
}

export const CommentCard = (props: CommentCardProps) => {
  return React.createElement('div', {
    className: props.className;
  }, props.children || 'Component ready');
};

export default CommentCard;