/**
 * Accessibility utilities for WCAG compliance and enhanced user experience
 */

// TODO: Fix import - import React from "react";
import { useEffect,
  useRef,
  useState,
  useCallback,
  createContext,
  useContext,
    type ReactNode,
    type KeyboardEvent,
    type FocusEvent,
} from 'react';

// Accessibility context for global settings
interface AccessibilityContextType {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  announcements: string;
  addAnnouncement: (message) => void;
  clearAnnouncements: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<AccessibilityContextType['fontSize']>('medium');
  const [announcements, setAnnouncements] = useState<string[]>([]);

  // Detect user preferences
  useEffect(() => {
    // Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    // Check for high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrast(contrastQuery.matches);

    const handleContrastChange = (e: MediaQueryListEvent) => setHighContrast(e.matches);
    contrastQuery.addEventListener('change', handleContrastChange);

    // Load saved preferences
    const savedFontSize = localStorage.getItem('accessibility-font-size') as AccessibilityContextType['fontSize'];
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Apply font size to document
  useEffect(() => {
    const fontSizeMap = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '20px',
    };

    document.documentElement.style.fontSize = fontSizeMap[fontSize];
    localStorage.setItem('accessibility-font-size', fontSize);
  }, [fontSize]);

  const addAnnouncement = useCallback((message) => {
    setAnnouncements(prev => [...prev, message]);

    // Auto-clear announcement after 5 seconds
    setTimeout(() => {
      setAnnouncements(prev => prev.filter((msg) => msg !== message));
    }, 5000);
  }, []);

  const clearAnnouncements = useCallback(() => {
    setAnnouncements([]);
  }, []);

  return (
    <AccessibilityContext.Provider value={{
      reducedMotion,
      highContrast,
      fontSize,
      announcements,
      addAnnouncement,
      clearAnnouncements,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

// Screen reader announcements
export function ScreenReaderAnnouncer() {
  const { announcements } = useAccessibility();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {announcements.map((announcement, index) => (
        <div key={`${announcement}-${index}`}>
          {announcement}
        </div>
      ))}
    </div>
  );
}

// Focus management hook
export function useFocusManagement() {
  const focusableElementsSelector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  const getFocusableElements = useCallback((container: HTMLElement) => {
    return Array.from(container.querySelectorAll(focusableElementsSelector));
  }, [focusableElementsSelector]);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') {
return;
}

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          (lastElement as HTMLElement)?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          (firstElement as HTMLElement)?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown as any);
    (firstElement as HTMLElement)?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown as any);
    };
  }, [getFocusableElements]);

  const restoreFocus = useCallback((previousElement: HTMLElement | null) => {
    if (previousElement && document.contains(previousElement)) {
      previousElement.focus();
    }
  }, []);

  return {
    getFocusableElements,
    trapFocus,
    restoreFocus,
  };
}

// Keyboard navigation hook
export function useKeyboardNavigation({
  onEnter,
  onEscape,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onHome,
  onEnd,
  disabled = false,
}: {
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  disabled?: boolean;
}) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (disabled) {
return;
}

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        onEnter?.();
        break;
      case 'Escape':
        e.preventDefault();
        onEscape?.();
        break;
      case 'ArrowUp':
        e.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        e.preventDefault();
        onArrowDown?.();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        onArrowLeft?.();
        break;
      case 'ArrowRight':
        e.preventDefault();
        onArrowRight?.();
        break;
      case 'Home':
        e.preventDefault();
        onHome?.();
        break;
      case 'End':
        e.preventDefault();
        onEnd?.();
        break;
    }
  }, [disabled, onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onHome, onEnd]);

  return { handleKeyDown };
}

// ARIA live region hook
export function useAriaLiveRegion(initialMessage = '') {
  const [message, setMessage] = useState(initialMessage);
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');

  const announce = useCallback((newMessage, priority: 'polite' | 'assertive' = 'polite') => {
    setPoliteness(priority);
    setMessage(newMessage);

    // Clear message after announcement
    setTimeout(() => setMessage(''), 1000);
  }, []);

  const LiveRegion = useCallback(() => (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {message}
    </div>
  ), [message, politeness]);

  return { announce, LiveRegion };
}

// Color contrast utilities
export function getContrastRatio(color1, color2): number {
  const getLuminance = (color): number => {
    const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const [r = 0, g = 0, b = 0] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

export function checkColorContrast(foreground, background): {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  wcagAALarge: boolean;
} {
  const ratio = getContrastRatio(foreground, background);

  return {
    ratio,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7,
    wcagAALarge: ratio >= 3,
  };
}

// Skip link component
export function SkipLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:shadow-lg"
      onFocus={(e) => {
        e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }}
    >
      {children}
    </a>
  );
}

// Accessible modal hook
export function useAccessibleModal() {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { trapFocus, restoreFocus } = useFocusManagement();
  const { addAnnouncement } = useAccessibility();

  const openModal = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    setIsOpen(true);
    addAnnouncement('Modal opened');
  }, [addAnnouncement]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    restoreFocus(previousFocusRef.current);
    addAnnouncement('Modal closed');
  }, [restoreFocus, addAnnouncement]);

  // Trap focus when modal is open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const cleanup = trapFocus(modalRef.current);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      return () => {
        cleanup();
        document.body.style.overflow = '';
      };
    }
    return undefined;
  }, [isOpen, trapFocus]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape as any);
      return () => document.removeEventListener('keydown', handleEscape as any);
    }
    return undefined;
  }, [isOpen, closeModal]);

  return {
    isOpen,
    openModal,
    closeModal,
    modalRef,
    modalProps: {
      role: 'dialog',
      'aria-modal': true,
      'aria-labelledby': 'modal-title',
      'aria-describedby': 'modal-description',
    },
  };
}

// Accessible form validation
export function useAccessibleForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addAnnouncement } = useAccessibility();

  const setFieldError = useCallback((fieldName, error) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
    addAnnouncement(`Error in ${fieldName}: ${error}`);
  }, [addAnnouncement]);

  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const getFieldProps = useCallback((fieldName) => {
    const hasError = !!errors[fieldName];

    return {
      'aria-invalid': hasError,
      'aria-describedby': hasError ? `${fieldName}-error` : undefined,
      onBlur: (e: FocusEvent<HTMLInputElement>) => {
        // Validate on blur
        if (e.target.value && e.target.validity && !e.target.validity.valid) {
          setFieldError(fieldName, e.target.validationMessage);
        } else {
          clearFieldError(fieldName);
        }
      },
    };
  }, [errors, setFieldError, clearFieldError]);

  const getErrorProps = useCallback((fieldName) => {
    const error = errors[fieldName];

    return error ? {
      id: `${fieldName}-error`,
      role: 'alert',
      'aria-live': 'polite' as const,
      children: error,
    } : null;
  }, [errors]);

  return {
    errors,
    setFieldError,
    clearFieldError,
    getFieldProps,
    getErrorProps,
    hasErrors: Object.keys(errors).length > 0,
  };
}

// Accessible tooltip hook
export function useAccessibleTooltip() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsVisible(true), 500);
  }, []);

  const hideTooltip = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  }, []);

  const triggerProps = {
    'aria-describedby': isVisible ? tooltipId.current : undefined,
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onFocus: showTooltip,
    onBlur: hideTooltip,
  };

  const tooltipProps = {
    id: tooltipId.current,
    role: 'tooltip',
    style: {
      position: 'absolute' as const,
      left: position.x,
      top: position.y,
      transform: 'translateX(-50%) translateY(-100%)',
    },
  };

  return {
    isVisible,
    triggerProps,
    tooltipProps,
  };
}

// Accessibility testing utilities
export function runAccessibilityAudit(element: HTMLElement): {
  issues: Array<{
    type: 'error' | 'warning';
    message: string;
    element: HTMLElement;
  }>;
  score: number;
} {
  const issues: Array<{
    type: 'error' | 'warning';
    message: string;
    element: HTMLElement;
  }> = [];

  // Check for missing alt text on images
  const images = element.querySelectorAll('img');
  images.forEach(img => {
    if (!img.alt && !img.getAttribute('aria-label')) {
      issues.push({
        type: 'error',
        message: 'Image missing alt text',
        element: img,
      });
    }
  });

  // Check for missing form labels
  const inputs = element.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    const hasLabel = input.id && element.querySelector(`label[for="${input.id}"]`);
    const hasAriaLabel = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');

    if (!hasLabel && !hasAriaLabel) {
      issues.push({
        type: 'error',
        message: 'Form control missing label',
        element: input as HTMLElement,
      });
    }
  });

  // Check for proper heading hierarchy
  const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  let previousLevel = 0;

  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1), 10);

    if (level > previousLevel + 1) {
      issues.push({
        type: 'warning',
        message: `Heading level skipped from h${previousLevel} to h${level}`,
        element: heading as HTMLElement,
      });
    }

    previousLevel = level;
  });

  // Check for color contrast (simplified)
  const textElements = element.querySelectorAll('p, span, div, a, button');
  textElements.forEach(el => {
    const styles = window.getComputedStyle(el);
    const { color } = styles;
    const { backgroundColor } = styles;

    if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
      const contrast = checkColorContrast(color, backgroundColor);

      if (!contrast.wcagAA) {
        issues.push({
          type: 'warning',
          message: `Low color contrast ratio: ${contrast.ratio.toFixed(2)}`,
          element: el as HTMLElement,
        });
      }
    }
  });

  const errorCount = issues.filter((issue) => issue.type === 'error').length;
  const warningCount = issues.filter((issue) => issue.type === 'warning').length;

  // Calculate score (0-100)
  const score = Math.max(0, 100 - (errorCount * 10) - (warningCount * 5));

  return { issues, score };
}

// Export all utilities
export const accessibilityUtils = {
  AccessibilityProvider,
  useAccessibility,
  ScreenReaderAnnouncer,
  useFocusManagement,
  useKeyboardNavigation,
  useAriaLiveRegion,
  getContrastRatio,
  checkColorContrast,
  SkipLink,
  useAccessibleModal,
  useAccessibleForm,
  useAccessibleTooltip,
  runAccessibilityAudit,
};

export default accessibilityUtils;