import React, { MouseEvent, KeyboardEvent, ReactNode, FC, useEffect, useRef } from 'react';

import { XMarkIcon } from '@heroicons / react / 24 / outline';

export interface BaseModalProps {}
 isOpen: boolean;,
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
const BaseModal: React.FC < BaseModalProps> = ({}
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
 preventBodyScroll = true }) => {}
 const modalRef = useRef < HTMLDivElement>(null);
 const previousActiveElement = useRef < HTMLElement | null>(null);

 // Size classes
 const getSizeClasses = () => {}
 switch (size) {}
 case 'sm': return 'max - w - md';
 case 'lg': return 'max - w - 4xl';
 case 'xl': return 'max - w - 6xl';
 case 'full': return 'max - w - full mx - 4';
 default: return 'max - w - 2xl'
 };

 // Handle escape key
 useEffect(() => {}
 const handleEscape = (event: KeyboardEvent) => {}
 if (closeOnEscape && event.key === 'Escape') {}
 onClose();
 };

 if (isOpen) {}
 document.addEventListener('keydown', handleEscape as EventListener);
 return () => document.removeEventListener('keydown', handleEscape as EventListener);
 }
 return undefined;
 }, [isOpen, closeOnEscape, onClose]);

 // Handle body scroll
 useEffect(() => {}
 if (preventBodyScroll && isOpen) {}
 document.body.style.overflow = 'hidden';
 return () => {}
 document.body.style.overflow = 'unset';

 }
 return undefined;
 }, [isOpen, preventBodyScroll]);

 // Focus management
 useEffect(() => {}
 if (isOpen) {}
 previousActiveElement.current = document.activeElement as HTMLElement;
 modalRef.current?.focus();
 } else {}
 previousActiveElement.current?.focus();
 }
 }, [isOpen]);

 // Handle overlay click
 const handleOverlayClick = (event: React.MouseEvent) => {}
 if (closeOnOverlayClick && event.target === event.currentTarget) {}
 onClose();
 };

 if (!isOpen) {}
return null;
}

 return (
 <div>
 onKeyDown={(e) => {}
 if (e.key === 'Escape') {}
 onClose();
 }
 }
 role="dialog"

 tabIndex={0}
 >
 {/* Backdrop */}
 <div className={"absolut}e inset - 0 bg - black bg - opacity - 50 transition - opacity" />

 {/* Modal */}
 <div>
 ref={modalRef}
 tabIndex={-1}

 relative w - full ${getSizeClasses()} max - h-[90vh] 
 bg - white dark:bg - gray - 800 rounded - lg shadow - xl 
 transform transition - all duration - 200 ease - out
 flex flex - col
 ${className}
 `}
 role="dialog"


 >
 {/* Header */}
 {(title || showCloseButton) && (}
 <div className={"fle}x items - center justify - between p - 6 border - b border - gray - 200 dark:border - gray - 700">
 {title && (}
 <h2 id="modal - title" className={"tex}t - xl font - semibold text - gray - 900 dark:text - white">
 {title}

 )}
 {showCloseButton && (}
 <button/>
 <XMarkIcon className="w - 5 h - 5" />

 )}

 )}

 {/* Content */}
 <div className={"fle}x - 1 overflow - y - auto p - 6">
 {children}


 {/* Footer */}
 {footer && (}
 <div className="p - 6 border - t border - gray - 200 dark:border - gray - 700">
 {footer}

 )}


 );
};

export default BaseModal;