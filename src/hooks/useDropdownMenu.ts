import { useState, useRef, useEffect, useCallback, KeyboardEvent, MouseEvent } from 'react';

/**
 * Custom hook for managing dropdown menu state and behavior
 * Handles opening/closing, click outside detection, and cleanup
 */
export const useDropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside as EventListener);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside as EventListener);
    }
    return undefined;
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey as EventListener);
      return () => document.removeEventListener('keydown', handleEscapeKey as EventListener);
    }
    return undefined;
  }, [isOpen]);

  return {
    isOpen,
    toggle,
    open,
    close,
    menuRef };
};
