import { useState, useCallback, useEffect } from 'react';

interface UseModalOptions {
  defaultOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
}

interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  modalProps: {
    isOpen: boolean;
    onClose: () => void;
  };
}

/**
 * Custom hook for managing modal state and behavior
 */
export function useModal({
  defaultOpen = false,
  onOpen,
  onClose,
  closeOnEscape = true
}: UseModalOptions = {}): UseModalReturn {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, close, closeOnEscape]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return {
    isOpen,
    open,
    close,
    toggle,
    modalProps: {
      isOpen,
      onClose: close
    }
  };
}

/**
 * Hook for managing multiple modals with string keys
 */
export function useModals<T extends string>() {
  const [openModals, setOpenModals] = useState<Set<T>>(new Set());

  const openModal = useCallback((key: T) => {
    setOpenModals(prev => new Set([...prev, key]));
  }, []);

  const closeModal = useCallback((key: T) => {
    setOpenModals(prev => {
      const newSet = new Set(prev);
      newSet.delete(key);
      return newSet;
    });
  }, []);

  const toggleModal = useCallback((key: T) => {
    setOpenModals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setOpenModals(new Set());
  }, []);

  const isModalOpen = useCallback((key: T) => {
    return openModals.has(key);
  }, [openModals]);

  return {
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,
    isModalOpen,
    openModals: Array.from(openModals)
  };
}