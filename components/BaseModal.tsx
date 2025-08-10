
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName]: any;
    }
  }
}
// TODO: Fix import - import { useEffect, useRef } from 'react';
// TODO: Fix import - import React from 'react';

// TODO: Fix import - import { XMarkIcon } from '@heroicons/react/24/outline';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  preventBodyScroll?: boolean;
}

/**
 * Reusable base modal component that provides:
 * - Consistent modal styling and behavior
 * - Accessibility features (focus management, escape key)
 * - Customizable sizes and styling
 * - Optional footer and header
 * - Overlay click and escape key handling
 *
 * Reduces code duplication for modal implementations across the app
 */
const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  className = '',
  overlayClassName = '',
  preventBodyScroll = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'max-w-md';
      case 'lg': return 'max-w-4xl';
      case 'xl': return 'max-w-6xl';
      case 'full': return 'max-w-full mx-4';
      default: return 'max-w-2xl';
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
    return undefined;
  }, [isOpen, closeOnEscape, onClose]);

  // Handle body scroll
  useEffect(() => {
    if (preventBodyScroll && isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
    return undefined;
  }, [isOpen, preventBodyScroll]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
return null;
}

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlayClassName}`}
      onClick={handleOverlayClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      tabIndex={0}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          relative w-full ${getSizeClasses()} max-h-[90vh] 
          bg-white dark:bg-gray-800 rounded-lg shadow-xl 
          transform transition-all duration-200 ease-out
          flex flex-col
          ${className}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            {title && (
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseModal;