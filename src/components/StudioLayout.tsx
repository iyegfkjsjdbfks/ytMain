import React from 'react';
import React from 'react';

export interface StudioLayoutProps {
  children?: React.ReactNode
      className?: string, 
}

export const StudioLayout: React.FC<StudioLayoutProps> = ({ children, className = '' }) => {
  return React.createElement('div', {
    className: 'studiolayout-container ' + className, 
  }, children || 'StudioLayout Component');
};

export default StudioLayout;