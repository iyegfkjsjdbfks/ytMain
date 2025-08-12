import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { MouseEvent } from 'react';
import { FC } from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
  showIcon?: boolean;
  className?: string;
  variant?: 'overlay' | 'inline' | 'card';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  retryText = 'Click to retry',
  showIcon = true,
  className = '',
  variant = 'overlay' }) => {
  const variantClasses = {
    overlay: 'absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 cursor-pointer',
          inline: 'flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-md',
    card: 'p-6 bg-white border border-red-200 rounded-lg shadow-sm' };

  const textColorClasses = {
    overlay: 'text-white',
          inline: 'text-red-800',
    card: 'text-red-800' };

  const iconColorClasses = {
    overlay: 'text-white',
          inline: 'text-red-500',
    card: 'text-red-500' };

  const handleClick: any = (e: React.MouseEvent) => {
    if (onRetry as any) {
      e.stopPropagation();
      onRetry();
    }
  };

  return (
    <div
      className={`${variantClasses[variant]} ${className}`}
      onClick={(e: any) => handleClick(e)}
      role="alert"
    >
      <div className="text-center">
        {showIcon && (
          <ExclamationTriangleIcon
            className={`w-8 h-8 mx-auto mb-2 ${iconColorClasses[variant]}`}
          />
        )}
        <p className={`text-sm mb-2 ${textColorClasses[variant]}`}>
          {message}
        </p>
        {onRetry && (
          <p className={`text-xs opacity-75 ${textColorClasses[variant]}`}>
            {retryText}
          </p>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;