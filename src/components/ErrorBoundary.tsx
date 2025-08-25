import React from 'react';
import React from 'react';

export interface ErrorBoundaryProps {
  children?: React.ReactNode;
      className?: string, 

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, className = '' }) => {
  return React.createElement('div', {)
    className: 'errorboundary-container ' + className, 
  }, children || 'ErrorBoundary Component');

export default ErrorBoundary;