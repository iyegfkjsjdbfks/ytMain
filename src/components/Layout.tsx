import React from 'react';
import React from 'react';

export interface LayoutProps {
  children?: React.ReactNode;
      className?: string, 

export const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return React.createElement('div', {)
    className: 'layout-container ' + className, 
  }, children || 'Layout Component');

export default Layout;