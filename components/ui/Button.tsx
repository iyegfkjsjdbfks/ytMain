
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
import { forwardRef } from 'react';
import React from 'react';

import { cn } from '../../utils/cn';

import { ButtonLoading } from './LoadingStates';

// Button variants and sizes
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'link';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  children: React.ReactNode;
}

// Enhanced variant styles with YouTube-like red theme
const variantClasses = {
  primary: 'bg-red-600 hover:bg-red-700 text-white border-transparent focus:ring-red-500',
  secondary: 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border-transparent dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-100 focus:ring-neutral-500',
  outline: 'bg-transparent hover:bg-red-50 text-red-600 border-red-600 hover:text-red-700 focus:ring-red-500',
  ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-700 border-transparent dark:hover:bg-neutral-800 dark:text-neutral-300 focus:ring-neutral-500',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent focus:ring-red-500',
  link: 'bg-transparent text-red-600 border-transparent hover:text-red-700 hover:underline focus:ring-red-500 p-0',
};

// Enhanced size classes
const sizeClasses = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
};

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    rounded = 'md',
    children,
    disabled,
    className = '',
    ...props
  },
  ref,
) => {
  const isDisabled = disabled || loading;

  const buttonClasses = cn(
    'inline-flex items-center justify-center font-medium border transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses[rounded],
    fullWidth && 'w-full',
    variant === 'link' && 'inline',
    className,
  );

  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <ButtonLoading size={size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md'} className="mr-2" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && (
            <span className="mr-2 flex-shrink-0">{leftIcon}</span>
          )}
          <span>{children}</span>
          {rightIcon && (
            <span className="ml-2 flex-shrink-0">{rightIcon}</span>
          )}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

// Icon Button Component
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>((
  {
    icon,
    variant = 'ghost',
    size = 'md',
    rounded = 'md',
    className,
    ...props
  },
  ref,
) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      rounded={rounded}
      className={cn('p-2', className)}
      {...props}
    >
      {icon}
    </Button>
  );
});

IconButton.displayName = 'IconButton';

// Specialized Button Components for YouTube-like functionality
export const SubscribeButton: React.FC<{
  isSubscribed: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}> = ({ isSubscribed, loading = false, onClick, className }) => (
  <Button
    variant={isSubscribed ? 'outline' : 'primary'}
    size="sm"
    loading={loading}
    onClick={onClick}
    className={className}
  >
    {isSubscribed ? 'Subscribed' : 'Subscribe'}
  </Button>
);

export const LikeButton: React.FC<{
  isLiked: boolean;
  count?: number;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}> = ({ isLiked, count, loading = false, onClick, className }) => (
  <Button
    variant={isLiked ? 'primary' : 'ghost'}
    size="sm"
    loading={loading}
    onClick={onClick}
    className={className}
    leftIcon={
      <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
      </svg>
    }
  >
    {count !== undefined ? count : ''}
  </Button>
);

export default Button;