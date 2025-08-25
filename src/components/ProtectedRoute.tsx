import React from 'react';
import React from 'react';

export interface ProtectedRouteProps {
  children?: React.ReactNode;
      className?: string, 

}
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, className = '' }) => {
  return React.createElement('div', {)
    className: 'protectedroute-container ' + className, 
  }, children || 'ProtectedRoute Component');

export default ProtectedRoute;