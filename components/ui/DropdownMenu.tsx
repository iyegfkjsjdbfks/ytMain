import type { ReactNode, RefObject, MouseEvent } from 'react';

import { cn } from '../../utils/cn';

interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  menuRef?: RefObject<HTMLDivElement>;
}

interface DropdownMenuItemProps {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'danger';
  icon?: ReactNode;
  disabled?: boolean;
}

interface DropdownMenuSeparatorProps {
  className?: string;
}

const positionClasses = {
  'top-left': 'bottom-full left-0 mb-2',
  'top-right': 'bottom-full right-0 mb-2',
  'bottom-left': 'top-full left-0 mt-2',
  'bottom-right': 'top-full right-0 mt-2',
};

const DropdownMenu = ({
  isOpen,
  children,
  className = '',
  position = 'bottom-right',
  menuRef,
}: DropdownMenuProps) => {
  if (!isOpen) {
return null;
}

  return (
    <div
      ref={menuRef}
      className={cn(
        'absolute z-50 min-w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2',
        positionClasses[position],
        className,
      )}
    >
      {children}
    </div>
  );
};

const DropdownMenuItem = ({
  onClick,
  children,
  className = '',
  variant = 'default',
  icon,
  disabled = false,
}: DropdownMenuItemProps) => {
  const variantClasses = {
    default: 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700',
    danger: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors',
        variantClasses[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

const DropdownMenuSeparator = ({
  className = '',
}: DropdownMenuSeparatorProps) => {
  return (
    <hr className={cn('my-2 border-gray-200 dark:border-gray-600', className)} />
  );
};

export { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator };
export type { DropdownMenuProps, DropdownMenuItemProps, DropdownMenuSeparatorProps };