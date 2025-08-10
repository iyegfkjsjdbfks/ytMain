
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
import type React from 'react';

interface ActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  ariaLabel,
  children,
  className = '',
  variant = 'default',
  size = 'md',
}) => {
  const baseClasses = 'text-white rounded-full hover:bg-opacity-70 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50';

  const variantClasses = {
    default: 'bg-black bg-opacity-50',
    primary: 'bg-blue-600 bg-opacity-80',
    secondary: 'bg-gray-600 bg-opacity-80',
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

export default ActionButton;