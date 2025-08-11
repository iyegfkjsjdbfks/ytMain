
/// <reference types="react/jsx-runtime" />
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName]: any;
    }
  }
}
import type React from 'react';

import { cn } from '../../utils/cn';

// Base loading props interface
export interface LoadingProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  text?: string;
}

// Size mappings
const sizeMap = {
  xs: { spinner: 'w-3 h-3', text: 'text-xs' },
  sm: { spinner: 'w-4 h-4', text: 'text-sm' },
  md: { spinner: 'w-5 h-5', text: 'text-base' },
  lg: { spinner: 'w-6 h-6', text: 'text-lg' },
  xl: { spinner: 'w-8 h-8', text: 'text-xl' },
};

// Color mappings
const colorMap = {
  primary: 'text-red-600',
  secondary: 'text-gray-600',
  white: 'text-white',
  gray: 'text-gray-400',
};

// Base Spinner Component
export const Spinner: React.FC<LoadingProps> = ({
  className = '',
  size = 'md',
  color = 'primary',
}) => {
  const sizeClass = sizeMap[size].spinner;
  const colorClass = colorMap[color];

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClass,
        colorClass,
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
};

// Dots Loading Component
export const DotsLoader: React.FC<LoadingProps> = ({
  className = '',
  size = 'md',
  color = 'primary',
}) => {
  const colorClass = colorMap[color];
  const dotSize = size === 'xs' ? 'w-1 h-1' : size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-3 h-3';

  return (
    <div className={cn('flex space-x-1', className)} role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-pulse',
            dotSize,
            colorClass,
            'bg-current',
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
};

// Pulse Loading Component
export const PulseLoader: React.FC<LoadingProps & { children?: React.ReactNode }> = ({
  className = '',
  children,
}) => {
  return (
    <div className={cn('animate-pulse', className)} role="status" aria-label="Loading">
      {children}
    </div>
  );
};

// Skeleton Loading Component
export const Skeleton: React.FC<{
  className?: string;
  width?: string;
  height?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}> = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = 'md',
}) => {
  const roundedClass = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }[rounded];

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        width,
        height,
        roundedClass,
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
};

// Main Loading Component
export const Loading: React.FC<LoadingProps> = ({
  className = '',
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  text,
}) => {
  const textSizeClass = sizeMap[size].text;
  const colorClass = colorMap[color];

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader size={size} color={color} />;
      case 'pulse':
        return (
          <PulseLoader>
            <div className={cn('rounded-full bg-current', sizeMap[size].spinner)} />
          </PulseLoader>
        );
      case 'skeleton':
        return <Skeleton className={sizeMap[size].spinner} rounded="full" />;
      default:
        return <Spinner size={size} color={color} />;
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      {renderLoader()}
      {text && (
        <span className={cn('font-medium', textSizeClass, colorClass)}>
          {text}
        </span>
      )}
    </div>
  );
};

// Specialized Loading Components for common use cases
export const VideoCardSkeleton: React.FC<{ className?: string }> = ({ className }: {className: any}) => (
  <div className={cn('space-y-3', className)}>
    <Skeleton height="h-48" rounded="lg" />
    <div className="space-y-2">
      <Skeleton height="h-4" width="w-3/4" />
      <Skeleton height="h-3" width="w-1/2" />
      <Skeleton height="h-3" width="w-1/3" />
    </div>
  </div>
);

export const CommentSkeleton: React.FC<{ className?: string }> = ({ className }: {className: any}) => (
  <div className={cn('flex space-x-3', className)}>
    <Skeleton width="w-8" height="h-8" rounded="full" />
    <div className="flex-1 space-y-2">
      <Skeleton height="h-3" width="w-1/4" />
      <Skeleton height="h-4" width="w-full" />
      <Skeleton height="h-4" width="w-3/4" />
    </div>
  </div>
);

export const ChannelSkeleton: React.FC<{ className?: string }> = ({ className }: {className: any}) => (
  <div className={cn('flex items-center space-x-3', className)}>
    <Skeleton width="w-12" height="h-12" rounded="full" />
    <div className="flex-1 space-y-2">
      <Skeleton height="h-4" width="w-1/2" />
      <Skeleton height="h-3" width="w-1/3" />
    </div>
  </div>
);

export const PlaylistSkeleton: React.FC<{ className?: string }> = ({ className }: {className: any}) => (
  <div className={cn('space-y-3', className)}>
    <Skeleton height="h-32" rounded="lg" />
    <div className="space-y-2">
      <Skeleton height="h-4" width="w-2/3" />
      <Skeleton height="h-3" width="w-1/2" />
    </div>
  </div>
);

// Loading Screen Component
export const LoadingScreen: React.FC<{
  message?: string;
  className?: string;
}> = ({ message = 'Loading...', className }: {className: any}) => (
  <div className={cn('flex items-center justify-center min-h-screen', className)}>
    <Loading size="lg" text={message} />
  </div>
);

// Page Loading Component
export const PageLoading: React.FC<{
  message?: string;
  className?: string;
}> = ({ message = 'Loading...', className }: {className: any}) => (
  <div className={cn('flex items-center justify-center py-12', className)}>
    <Loading size="md" text={message} />
  </div>
);

// Button Loading Component
export const ButtonLoading: React.FC<{
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}> = ({ size = 'sm', className = '' }) => (
  <Spinner size={size} color="white" className={className} />
);

export default Loading;