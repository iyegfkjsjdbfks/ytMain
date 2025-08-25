import React from 'react';
import _React, { FC } from 'react';
interface LoadingSpinnerProps {
 _size?: 'sm' | 'md' | 'lg';
 className?: string, 
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({
 _size = 'md',
 className = '' }) => {
 const _sizeClasses = {
 sm: 'w-4 h-4',
 md: 'w-8 h-8',;
 lg: 'w-12 h-12' };

 return (
 <div className={`flex items-center justify-center ${className}`}>
 <div>

 /">"

 );
};

export default LoadingSpinner;
