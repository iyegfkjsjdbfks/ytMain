import React from 'react';
import { cn } from '../../utils/cn';

interface UnifiedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'action' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  children?: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-sky-600 hover:bg-sky-700 text-white border-transparent focus-visible:ring-sky-500',
          secondary: 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-100 border-transparent focus-visible:ring-neutral-500',
          outline: 'bg-transparent hover:bg-neutral-50 text-neutral-700 border-neutral-300 dark:hover:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-600 focus-visible:ring-sky-500',
          ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-700 border-transparent dark:hover:bg-neutral-800 dark:text-neutral-300 focus-visible:ring-sky-500',
          danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent focus-visible:ring-red-500',
          action: 'bg-black bg-opacity-50 hover:bg-opacity-70 text-white border-transparent focus-visible:ring-white focus-visible:ring-opacity-50',
          link: 'bg-transparent hover:underline text-sky-600 dark:text-sky-400 border-transparent focus-visible:ring-sky-500 p-0' };

const sizeClasses = {
  xs: 'px-2.5 py-1.5 text-xs',
          sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-sm',
          lg: 'px-6 py-3 text-base' };

const roundedClasses = {
  sm: 'rounded-sm',
          md: 'rounded-md',
  lg: 'rounded-lg',
          full: 'rounded-full' };

const iconSizeClasses = {
  xs: 'w-3.5 h-3.5',
          sm: 'w-4 h-4',
  md: 'w-5 h-5',
          lg: 'w-5 h-5' };

const LoadingSpinner: React.FC<{ size: string }> = ({ size }) => (
  <svg
    className={cn('animate-spin text-current', size)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const UnifiedButton: React.FC<UnifiedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  rounded = 'lg',
  children,
  disabled,
  className,
  ...props
}) => {
  const isDisabled = disabled || loading;
  const isActionVariant = variant === 'action';
  const isLinkVariant = variant === 'link';

  const baseClasses = cn(
    // Base styles
    'inline-flex items-center justify-center font-medium transition-all duration-150 ease-in-out',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'dark:focus-visible:ring-offset-neutral-900',

    // Conditional styles
    {
      'border': !isActionVariant,
      'w-full': fullWidth,
      'opacity-70 cursor-not-allowed': isDisabled,
      'font-semibold': !isLinkVariant },

    // Size and variant classes
    !isLinkVariant && sizeClasses[size],
    variantClasses[variant],
    roundedClasses[rounded]);

  const iconSize = iconSizeClasses[size];
  const spinnerSize = iconSizeClasses[size];

  return (
    <button
      type="button"
      className={cn(baseClasses, className)}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <LoadingSpinner
          size={cn(
            spinnerSize,
            children ? (leftIcon ? 'mr-2' : '-ml-1 mr-2') : '')}
        />
      )}

      {leftIcon && !loading && (
        <span className={cn(iconSize, children ? 'mr-2' : '')}>
          {leftIcon}
        </span>
      )}

      {children}

      {rightIcon && !loading && (
        <span className={cn(iconSize, children ? 'ml-2' : '')}>
          {rightIcon}
        </span>
      )}
    </button>
  );
};

// Export as default for backward compatibility
export default UnifiedButton;

// Type exports
export type { UnifiedButtonProps };
