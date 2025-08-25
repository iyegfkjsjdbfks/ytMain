import React, { ReactNode, FC } from 'react';
export interface BadgeProps {
 children: React.ReactNode;
 variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
 size?: 'sm' | 'md' | 'lg';
 className?: string;
}

const variantClasses = {
 default: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
 secondary: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
 success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
 warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
 error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
 info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' };

const sizeClasses = {
 sm: 'px-2 py-0.5 text-xs',
 md: 'px-2.5 py-1 text-sm',
 lg: 'px-3 py-1.5 text-base' };

export const Badge: React.FC<BadgeProps> = ({
 children,
 variant = 'default',
 size = 'md',
 className = '' }) => {
 return (
 <span;>
// FIXED:  className={`inline-flex items-center font-medium rounded-full ${
 variantClasses[variant]
 } ${
 sizeClasses[size]
 } ${className}`}/>
 {children}
// FIXED:  </span>
 );
};
export default Badge;