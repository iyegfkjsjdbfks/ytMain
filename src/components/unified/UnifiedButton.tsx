import React, { forwardRef } from 'react';
import { forwardRef, ReactNode } from 'react';

import { cn } from '@/lib/utils';
import LoadingSpinner from '@components/LoadingSpinner';

/**
 * Unified Button Component
 * Consolidates all button variants into a single, comprehensive component
 */

// Button variant types
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'warning'
  | 'outline'
  | 'link';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface UnifiedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

// Base button styles
const baseStyles = [
  'inline-flex items-center justify-center',
  'font-medium transition-all duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'relative overflow-hidden',
].join(' ');

// Size variants
const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs rounded gap-1',
  sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm rounded-md gap-2',
  lg: 'px-6 py-3 text-base rounded-lg gap-2',
  xl: 'px-8 py-4 text-lg rounded-lg gap-3',
};

// Variant styles
const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-red-600 text-white border border-red-600',
    'hover:bg-red-700 hover:border-red-700',
    'focus:ring-red-500',
    'active:bg-red-800',
  ].join(' '),

  secondary: [
    'bg-neutral-100 text-neutral-900 border border-neutral-200',
    'hover:bg-neutral-200 hover:border-neutral-300',
    'focus:ring-neutral-500',
    'dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700',
    'dark:hover:bg-neutral-700 dark:hover:border-neutral-600',
  ].join(' '),

  ghost: [
    'bg-transparent text-neutral-700 border border-transparent',
    'hover:bg-neutral-100 hover:text-neutral-900',
    'focus:ring-neutral-500',
    'dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
  ].join(' '),

  danger: [
    'bg-red-600 text-white border border-red-600',
    'hover:bg-red-700 hover:border-red-700',
    'focus:ring-red-500',
    'active:bg-red-800',
  ].join(' '),

  success: [
    'bg-green-600 text-white border border-green-600',
    'hover:bg-green-700 hover:border-green-700',
    'focus:ring-green-500',
    'active:bg-green-800',
  ].join(' '),

  warning: [
    'bg-yellow-500 text-white border border-yellow-500',
    'hover:bg-yellow-600 hover:border-yellow-600',
    'focus:ring-yellow-500',
    'active:bg-yellow-700',
  ].join(' '),

  outline: [
    'bg-transparent text-neutral-700 border border-neutral-300',
    'hover:bg-neutral-50 hover:border-neutral-400',
    'focus:ring-neutral-500',
    'dark:text-neutral-300 dark:border-neutral-600',
    'dark:hover:bg-neutral-800 dark:hover:border-neutral-500',
  ].join(' '),

  link: [
    'bg-transparent text-red-600 border border-transparent',
    'hover:text-red-700 hover:underline',
    'focus:ring-red-500',
    'dark:text-red-400 dark:hover:text-red-300',
    'p-0 h-auto font-normal',
  ].join(' '),
};

export const UnifiedButton = forwardRef<HTMLButtonElement, UnifiedButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      className,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const buttonClasses = cn(
      baseStyles,
      sizeStyles[size],
      variantStyles[variant],
      fullWidth && 'w-full',
      className
    );

    const content = (
      <>
        {loading && (
          <LoadingSpinner
            size={size === 'xs' || size === 'sm' ? 'sm' : 'md'}
            className='absolute inset-0 m-auto'
          />
        )}

        <span
          className={cn(
            'flex items-center gap-inherit',
            loading && 'opacity-0'
          )}
        >
          {leftIcon && <span className='flex-shrink-0'>{leftIcon}</span>}

          <span className='flex-1'>{children}</span>

          {rightIcon && <span className='flex-shrink-0'>{rightIcon}</span>}
        </span>
      </>
    );

    if (asChild) {
      return <span className={buttonClasses}>{content}</span>;
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        {...props}
      >
        {content}
      </button>
    );
  }
);

UnifiedButton.displayName = 'UnifiedButton';

// Export convenience components for common use cases
export const PrimaryButton = forwardRef<
  HTMLButtonElement,
  Omit<UnifiedButtonProps, 'variant'>
>((props, ref) => <UnifiedButton ref={ref} variant='primary' {...props} />);

export const SecondaryButton = forwardRef<
  HTMLButtonElement,
  Omit<UnifiedButtonProps, 'variant'>
>((props, ref) => <UnifiedButton ref={ref} variant='secondary' {...props} />);

export const DangerButton = forwardRef<
  HTMLButtonElement,
  Omit<UnifiedButtonProps, 'variant'>
>((props, ref) => <UnifiedButton ref={ref} variant='danger' {...props} />);

export const GhostButton = forwardRef<
  HTMLButtonElement,
  Omit<UnifiedButtonProps, 'variant'>
>((props, ref) => <UnifiedButton ref={ref} variant='ghost' {...props} />);

export const LinkButton = forwardRef<
  HTMLButtonElement,
  Omit<UnifiedButtonProps, 'variant'>
>((props, ref) => <UnifiedButton ref={ref} variant='link' {...props} />);

PrimaryButton.displayName = 'PrimaryButton';
SecondaryButton.displayName = 'SecondaryButton';
DangerButton.displayName = 'DangerButton';
GhostButton.displayName = 'GhostButton';
LinkButton.displayName = 'LinkButton';

export default UnifiedButton;


