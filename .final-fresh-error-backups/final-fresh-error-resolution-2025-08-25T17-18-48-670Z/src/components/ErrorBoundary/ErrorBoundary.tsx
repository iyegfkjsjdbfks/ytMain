import React from 'react';
// ErrorBoundary - Simple Component;
import React from 'react';

export interface ErrorBoundaryProps {
  className?: string;
  children?: React.ReactNode, 
}

export const ErrorBoundary = (props: ErrorBoundaryProps) => {
  return React.createElement('div', {
    className: props.className, 
  }, props.children || 'Component ready');
};

export default ErrorBoundary;