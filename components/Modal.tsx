import React, { MouseEvent, ReactNode, FC, useEffect, useRef } from 'react';

import { XIcon } from '@heroicons/react/24/outline';

interface ModalProps {
 isOpen: boolean;
 onClose: () => void;
 title?: string;
 children: React.ReactNode;
 footer?: React.ReactNode;
 size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
 closeOnOutsideClick?: boolean;
 hideCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
 isOpen,
 onClose,
 title,
 children,
 footer,
 size = 'md',
 closeOnOutsideClick = true,
 hideCloseButton = false }) => {
 const modalRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const handleOutsideClick = (event: MouseEvent) => {
 if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(event.target as Node)) {
 onClose();
 };

 if (isOpen) {
 document.addEventListener('mousedown', handleOutsideClick as EventListener);
 } else {
 document.removeEventListener('mousedown', handleOutsideClick as EventListener);
 }

 return () => {
 document.removeEventListener('mousedown', handleOutsideClick as EventListener);
 }}, [isOpen, onClose, closeOnOutsideClick]);

 useEffect(() => {
 if (isOpen) {
 document.body.style.overflow = 'hidden';
 } else {
 document.body.style.overflow = 'unset';
 }
 return () => {
 document.body.style.overflow = 'unset';
 }}, [isOpen]);

 if (!isOpen) {
return null;
}

 const sizeClasses = {
 sm: 'max-w-sm',
 md: 'max-w-md',
 lg: 'max-w-lg',
 xl: 'max-w-xl',
 full: 'max-w-full h-full' };

 return (
 <div;>
// FIXED:  className={"fixe}d inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
 role="dialog"
// FIXED:  aria-modal="true"
// FIXED:  aria-labelledby={title ? 'modal-title' : undefined}/>
 <div;>
 ref={modalRef}
// FIXED:  className={`bg-white dark:bg-neutral-800 rounded-xl shadow-2xl flex flex-col overflow-hidden w-full ${sizeClasses[size]} animate-slide-up-fade`}/>
 {title && (
 <div className={"fle}x items-center justify-between p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-700">
 <h3 id="modal-title" className={"text}-lg font-semibold text-neutral-900 dark:text-neutral-100">
 {title}
// FIXED:  </h3>
 {!hideCloseButton && (
 <button />
// FIXED:  onClick={(e: any) => onClose(e)}
// FIXED:  className={"p}-1 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
// FIXED:  aria-label="Close modal"
 >
 <XIcon className={"w}-6 h-6" />
// FIXED:  </button>
 )}
// FIXED:  </div>
 )}
 <div className={"p}-4 sm:p-5 flex-grow overflow-y-auto">
 {children}
// FIXED:  </div>
 {footer && (
 <div className={"p}-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
 {footer}
// FIXED:  </div>
 )}
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default Modal;