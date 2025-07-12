# Accessibility Guide

## Overview

This comprehensive accessibility guide outlines best practices, implementation strategies, and guidelines for making the YouTubeX application accessible to all users, including those with disabilities. Following WCAG 2.1 AA standards and modern accessibility practices.

## Table of Contents

1. [Accessibility Principles](#accessibility-principles)
2. [Semantic HTML](#semantic-html)
3. [ARIA Implementation](#aria-implementation)
4. [Keyboard Navigation](#keyboard-navigation)
5. [Focus Management](#focus-management)
6. [Screen Reader Support](#screen-reader-support)
7. [Color and Contrast](#color-and-contrast)
8. [Typography and Readability](#typography-and-readability)
9. [Media Accessibility](#media-accessibility)
10. [Form Accessibility](#form-accessibility)
11. [Interactive Elements](#interactive-elements)
12. [Testing and Validation](#testing-and-validation)
13. [Accessibility Hooks and Utilities](#accessibility-hooks-and-utilities)
14. [Implementation Examples](#implementation-examples)

## Accessibility Principles

### WCAG 2.1 Four Principles

1. **Perceivable**: Information must be presentable in ways users can perceive
2. **Operable**: Interface components must be operable by all users
3. **Understandable**: Information and UI operation must be understandable
4. **Robust**: Content must be robust enough for various assistive technologies

### Implementation Strategy

```typescript
// Accessibility configuration
const ACCESSIBILITY_CONFIG = {
  // WCAG compliance level
  wcagLevel: 'AA' as const,
  
  // Minimum contrast ratios
  contrastRatios: {
    normal: 4.5,
    large: 3.0,
    nonText: 3.0,
  },
  
  // Focus management
  focusManagement: {
    trapFocus: true,
    restoreFocus: true,
    skipLinks: true,
  },
  
  // Animation preferences
  respectMotionPreferences: true,
  
  // Screen reader announcements
  announcements: {
    polite: true,
    assertive: false, // Use sparingly
  },
};

// Accessibility context
interface AccessibilityContextType {
  isHighContrast: boolean;
  isReducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void;
  focusElement: (element: HTMLElement | null) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'extra-large'>('medium');
  
  useEffect(() => {
    // Detect user preferences
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    setIsHighContrast(highContrastQuery.matches);
    setIsReducedMotion(reducedMotionQuery.matches);
    
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    
    highContrastQuery.addEventListener('change', handleHighContrastChange);
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    
    return () => {
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);
  
  const announceMessage = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.getElementById(`aria-announcer-${priority}`);
    if (announcer) {
      announcer.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        announcer.textContent = '';
      }, 1000);
    }
  }, []);
  
  const focusElement = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);
  
  return (
    <AccessibilityContext.Provider value={{
      isHighContrast,
      isReducedMotion,
      fontSize,
      announceMessage,
      focusElement,
    }}>
      {children}
      {/* ARIA live regions for announcements */}
      <div
        id="aria-announcer-polite"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      <div
        id="aria-announcer-assertive"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </AccessibilityContext.Provider>
  );
};

const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};
```

## Semantic HTML

### 1. **Proper HTML Structure**

```typescript
// Semantic layout components
const SemanticLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip navigation links */}
      <SkipNavigation />
      
      {/* Main header */}
      <header role="banner" className="bg-white shadow-sm">
        <Navigation />
      </header>
      
      {/* Main content area */}
      <main role="main" id="main-content" className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <footer role="contentinfo" className="bg-gray-800 text-white">
        <FooterContent />
      </footer>
    </div>
  );
};

// Skip navigation component
const SkipNavigation: React.FC = () => {
  return (
    <div className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50">
      <a
        href="#main-content"
        className="bg-blue-600 text-white px-4 py-2 rounded-br-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="bg-blue-600 text-white px-4 py-2 rounded-br-md focus:outline-none focus:ring-2 focus:ring-blue-500 ml-2"
      >
        Skip to navigation
      </a>
    </div>
  );
};

// Semantic video card component
const AccessibleVideoCard: React.FC<VideoCardProps> = ({ video, onPlay }) => {
  const { announceMessage } = useAccessibility();
  
  const handlePlay = () => {
    onPlay(video.id);
    announceMessage(`Playing ${video.title}`);
  };
  
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Video thumbnail with proper alt text */}
      <div className="relative">
        <img
          src={video.thumbnail}
          alt={`Thumbnail for ${video.title}`}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        
        {/* Play button with proper labeling */}
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
          aria-label={`Play ${video.title}`}
        >
          <PlayIcon className="w-12 h-12 text-white" aria-hidden="true" />
        </button>
        
        {/* Duration badge */}
        <div
          className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm"
          aria-label={`Duration: ${video.duration}`}
        >
          {video.duration}
        </div>
      </div>
      
      {/* Video information */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          <a
            href={`/watch/${video.id}`}
            className="text-gray-900 hover:text-blue-600 focus:text-blue-600 focus:outline-none focus:underline"
          >
            {video.title}
          </a>
        </h3>
        
        <p className="text-gray-600 text-sm mb-2">
          <a
            href={`/channel/${video.channelId}`}
            className="hover:text-gray-800 focus:text-gray-800 focus:outline-none focus:underline"
          >
            {video.channelName}
          </a>
        </p>
        
        <div className="flex items-center text-gray-500 text-sm space-x-2">
          <span>{video.views} views</span>
          <span aria-hidden="true">•</span>
          <time dateTime={video.publishedAt}>
            {formatRelativeTime(video.publishedAt)}
          </time>
        </div>
      </div>
    </article>
  );
};
```

### 2. **Heading Hierarchy**

```typescript
// Heading component with proper hierarchy
const Heading: React.FC<HeadingProps> = ({ 
  level, 
  children, 
  className = '', 
  id,
  ...props 
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  // Ensure proper heading hierarchy
  const headingClasses = {
    1: 'text-3xl font-bold',
    2: 'text-2xl font-semibold',
    3: 'text-xl font-semibold',
    4: 'text-lg font-medium',
    5: 'text-base font-medium',
    6: 'text-sm font-medium',
  };
  
  return (
    <Tag
      id={id}
      className={`${headingClasses[level]} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};

// Page title component
const PageTitle: React.FC<PageTitleProps> = ({ title, description }) => {
  useEffect(() => {
    document.title = `${title} - YouTubeX`;
  }, [title]);
  
  return (
    <div className="mb-6">
      <Heading level={1} className="mb-2">
        {title}
      </Heading>
      {description && (
        <p className="text-gray-600 text-lg">
          {description}
        </p>
      )}
    </div>
  );
};
```

## ARIA Implementation

### 1. **ARIA Labels and Descriptions**

```typescript
// ARIA utilities
class ARIAUtils {
  static generateId(prefix: string = 'aria'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  static describedBy(ids: (string | undefined)[]): string | undefined {
    const validIds = ids.filter(Boolean);
    return validIds.length > 0 ? validIds.join(' ') : undefined;
  }
  
  static labelledBy(ids: (string | undefined)[]): string | undefined {
    const validIds = ids.filter(Boolean);
    return validIds.length > 0 ? validIds.join(' ') : undefined;
  }
}

// Search component with proper ARIA
const AccessibleSearch: React.FC<SearchProps> = ({ onSearch, placeholder = "Search videos" }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const searchId = useMemo(() => ARIAUtils.generateId('search'), []);
  const listboxId = useMemo(() => ARIAUtils.generateId('listbox'), []);
  const { announceMessage } = useAccessibility();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      announceMessage(`Searching for ${query.trim()}`);
      setIsOpen(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
        
      case 'Enter':
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          setQuery(suggestions[activeIndex]);
          onSearch(suggestions[activeIndex]);
          setIsOpen(false);
        }
        break;
        
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };
  
  return (
    <div className="relative">
      <form onSubmit={handleSubmit} role="search">
        <label htmlFor={searchId} className="sr-only">
          {placeholder}
        </label>
        
        <div className="relative">
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-owns={isOpen ? listboxId : undefined}
            aria-activedescendant={
              activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
            }
            autoComplete="off"
          />
          
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:text-gray-600"
            aria-label="Search"
          >
            <SearchIcon className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        
        {/* Search suggestions */}
        {isOpen && suggestions.length > 0 && (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={`px-4 py-2 cursor-pointer ${
                  index === activeIndex
                    ? 'bg-blue-100 text-blue-900'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => {
                  setQuery(suggestion);
                  onSearch(suggestion);
                  setIsOpen(false);
                }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </form>
    </div>
  );
};

// Modal component with proper ARIA
const AccessibleModal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'medium' 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useMemo(() => ARIAUtils.generateId('modal-title'), []);
  const descriptionId = useMemo(() => ARIAUtils.generateId('modal-description'), []);
  
  // Focus management
  useFocusTrap(modalRef, isOpen);
  useRestoreFocus(isOpen);
  
  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    full: 'max-w-full mx-4',
  };
  
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal content */}
      <div
        ref={modalRef}
        className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} max-h-[90vh] overflow-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 id={titleId} className="text-xl font-semibold">
            {title}
          </h2>
          
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 focus:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Close modal"
          >
            <XIcon className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
        
        {/* Content */}
        <div id={descriptionId} className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
```

### 2. **ARIA Live Regions**

```typescript
// Live region component for dynamic content
const LiveRegion: React.FC<LiveRegionProps> = ({ 
  children, 
  politeness = 'polite',
  atomic = true,
  relevant = 'all'
}) => {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className="sr-only"
    >
      {children}
    </div>
  );
};

// Status announcer hook
const useStatusAnnouncer = () => {
  const [status, setStatus] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const announce = useCallback((message: string, delay: number = 100) => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Clear current status
    setStatus('');
    
    // Set new status after a brief delay to ensure screen readers pick it up
    timeoutRef.current = setTimeout(() => {
      setStatus(message);
    }, delay);
  }, []);
  
  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setStatus('');
  }, []);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return {
    announce,
    clear,
    StatusComponent: () => (
      <LiveRegion politeness="polite">
        {status}
      </LiveRegion>
    ),
  };
};

// Loading state with announcements
const AccessibleLoadingState: React.FC<LoadingStateProps> = ({ 
  isLoading, 
  message = "Loading content",
  children 
}) => {
  const { announce } = useStatusAnnouncer();
  
  useEffect(() => {
    if (isLoading) {
      announce(message);
    } else {
      announce("Content loaded");
    }
  }, [isLoading, message, announce]);
  
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center p-8"
        role="status"
        aria-label={message}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600">{message}</span>
      </div>
    );
  }
  
  return <>{children}</>;
};
```

## Keyboard Navigation

### 1. **Focus Management**

```typescript
// Focus management hooks
const useFocusTrap = (containerRef: RefObject<HTMLElement>, isActive: boolean) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive, containerRef]);
};

const useRestoreFocus = (isActive: boolean) => {
  const previousActiveElement = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (isActive) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus();
      previousActiveElement.current = null;
    }
  }, [isActive]);
};

// Roving tabindex for lists
const useRovingTabIndex = (itemCount: number) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const handleKeyDown = useCallback((e: KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % itemCount);
        break;
        
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount);
        break;
        
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
        
      case 'End':
        e.preventDefault();
        setActiveIndex(itemCount - 1);
        break;
    }
  }, [itemCount]);
  
  return {
    activeIndex,
    setActiveIndex,
    getTabIndex: (index: number) => (index === activeIndex ? 0 : -1),
    handleKeyDown,
  };
};

// Accessible video grid with keyboard navigation
const AccessibleVideoGrid: React.FC<VideoGridProps> = ({ videos, onVideoSelect }) => {
  const { activeIndex, getTabIndex, handleKeyDown } = useRovingTabIndex(videos.length);
  const gridRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const activeElement = gridRef.current?.children[activeIndex] as HTMLElement;
    activeElement?.focus();
  }, [activeIndex]);
  
  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      role="grid"
      aria-label="Video grid"
    >
      {videos.map((video, index) => (
        <div
          key={video.id}
          role="gridcell"
          tabIndex={getTabIndex(index)}
          className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
          onKeyDown={(e) => {
            handleKeyDown(e.nativeEvent, index);
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onVideoSelect(video);
            }
          }}
          onClick={() => onVideoSelect(video)}
        >
          <AccessibleVideoCard video={video} />
        </div>
      ))}
    </div>
  );
};
```

### 2. **Custom Keyboard Shortcuts**

```typescript
// Keyboard shortcuts hook
const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }
      
      for (const shortcut of shortcuts) {
        if (matchesShortcut(e, shortcut)) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};

const matchesShortcut = (e: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
  return (
    e.key.toLowerCase() === shortcut.key.toLowerCase() &&
    !!e.ctrlKey === !!shortcut.ctrl &&
    !!e.altKey === !!shortcut.alt &&
    !!e.shiftKey === !!shortcut.shift &&
    !!e.metaKey === !!shortcut.meta
  );
};

// Video player with keyboard controls
const AccessibleVideoPlayer: React.FC<VideoPlayerProps> = ({ video, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef<HTMLVideoElement>(null);
  const { announceMessage } = useAccessibility();
  
  const shortcuts: KeyboardShortcut[] = [
    {
      key: ' ',
      action: () => {
        if (isPlaying) {
          pause();
        } else {
          play();
        }
      },
      description: 'Play/Pause',
    },
    {
      key: 'ArrowLeft',
      action: () => seek(-10),
      description: 'Seek backward 10 seconds',
    },
    {
      key: 'ArrowRight',
      action: () => seek(10),
      description: 'Seek forward 10 seconds',
    },
    {
      key: 'ArrowUp',
      action: () => adjustVolume(0.1),
      description: 'Increase volume',
    },
    {
      key: 'ArrowDown',
      action: () => adjustVolume(-0.1),
      description: 'Decrease volume',
    },
    {
      key: 'm',
      action: () => toggleMute(),
      description: 'Toggle mute',
    },
    {
      key: 'f',
      action: () => toggleFullscreen(),
      description: 'Toggle fullscreen',
    },
    {
      key: 'Escape',
      action: onClose,
      description: 'Close player',
    },
  ];
  
  useKeyboardShortcuts(shortcuts);
  
  const play = () => {
    playerRef.current?.play();
    setIsPlaying(true);
    announceMessage('Video playing');
  };
  
  const pause = () => {
    playerRef.current?.pause();
    setIsPlaying(false);
    announceMessage('Video paused');
  };
  
  const seek = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime += seconds;
      announceMessage(`Seeked ${seconds > 0 ? 'forward' : 'backward'} ${Math.abs(seconds)} seconds`);
    }
  };
  
  const adjustVolume = (delta: number) => {
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.volume = newVolume;
    }
    announceMessage(`Volume ${Math.round(newVolume * 100)}%`);
  };
  
  return (
    <div className="relative bg-black">
      {/* Video element */}
      <video
        ref={playerRef}
        src={video.url}
        className="w-full h-auto"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        aria-label={`Video: ${video.title}`}
      />
      
      {/* Accessible controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={isPlaying ? pause : play}
            className="text-white hover:text-gray-300 focus:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white rounded"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? (
              <PauseIcon className="w-8 h-8" aria-hidden="true" />
            ) : (
              <PlayIcon className="w-8 h-8" aria-hidden="true" />
            )}
          </button>
          
          {/* Volume control */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVolume(volume === 0 ? 1 : 0)}
              className="text-white hover:text-gray-300 focus:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white rounded"
              aria-label={volume === 0 ? 'Unmute' : 'Mute'}
            >
              {volume === 0 ? (
                <VolumeOffIcon className="w-6 h-6" aria-hidden="true" />
              ) : (
                <VolumeUpIcon className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                setVolume(newVolume);
                if (playerRef.current) {
                  playerRef.current.volume = newVolume;
                }
              }}
              className="w-20"
              aria-label="Volume"
            />
          </div>
          
          {/* Time display */}
          <div className="text-white text-sm" aria-live="polite">
            {formatTime(currentTime)} / {formatTime(video.duration)}
          </div>
        </div>
      </div>
      
      {/* Keyboard shortcuts help */}
      <KeyboardShortcutsHelp shortcuts={shortcuts} />
    </div>
  );
};
```

## Color and Contrast

### 1. **Color Contrast Utilities**

```typescript
// Color contrast utilities
class ColorContrastUtils {
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }
  
  static getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }
  
  static getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    const lum1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }
  
  static meetsWCAGAA(foreground: string, background: string, isLargeText: boolean = false): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return ratio >= (isLargeText ? 3.0 : 4.5);
  }
  
  static meetsWCAGAAA(foreground: string, background: string, isLargeText: boolean = false): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return ratio >= (isLargeText ? 4.5 : 7.0);
  }
}

// High contrast theme provider
const HighContrastTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isHighContrast } = useAccessibility();
  
  const highContrastStyles = {
    '--color-primary': isHighContrast ? '#000000' : '#3b82f6',
    '--color-primary-contrast': isHighContrast ? '#ffffff' : '#ffffff',
    '--color-secondary': isHighContrast ? '#ffffff' : '#6b7280',
    '--color-secondary-contrast': isHighContrast ? '#000000' : '#ffffff',
    '--color-background': isHighContrast ? '#ffffff' : '#f9fafb',
    '--color-surface': isHighContrast ? '#ffffff' : '#ffffff',
    '--color-border': isHighContrast ? '#000000' : '#e5e7eb',
    '--color-text': isHighContrast ? '#000000' : '#111827',
    '--color-text-secondary': isHighContrast ? '#000000' : '#6b7280',
  };
  
  return (
    <div
      style={highContrastStyles}
      className={isHighContrast ? 'high-contrast' : ''}
    >
      {children}
    </div>
  );
};

// Accessible button with proper contrast
const AccessibleButton: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  size = 'medium',
  children,
  disabled = false,
  ...props 
}) => {
  const { isHighContrast } = useAccessibility();
  
  const baseClasses = 'font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  
  const variantClasses = {
    primary: isHighContrast
      ? 'bg-black text-white border-2 border-black hover:bg-white hover:text-black focus:ring-black'
      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: isHighContrast
      ? 'bg-white text-black border-2 border-black hover:bg-black hover:text-white focus:ring-black'
      : 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: isHighContrast
      ? 'bg-black text-white border-2 border-black hover:bg-white hover:text-black focus:ring-black'
      : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };
  
  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed'
    : '';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
```

## Media Accessibility

### 1. **Video Accessibility**

```typescript
// Accessible video component with captions and audio descriptions
const AccessibleVideo: React.FC<AccessibleVideoProps> = ({ 
  src,
  title,
  captions,
  audioDescription,
  transcript,
  poster,
  ...props 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCaptions, setShowCaptions] = useState(true);
  const [showAudioDescription, setShowAudioDescription] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  
  return (
    <div className="relative">
      <video
        ref={videoRef}
        poster={poster}
        controls
        className="w-full h-auto"
        aria-label={title}
        {...props}
      >
        <source src={src} type="video/mp4" />
        
        {/* Captions */}
        {captions && (
          <track
            kind="captions"
            src={captions.src}
            srcLang={captions.language}
            label={captions.label}
            default={showCaptions}
          />
        )}
        
        {/* Audio descriptions */}
        {audioDescription && (
          <track
            kind="descriptions"
            src={audioDescription.src}
            srcLang={audioDescription.language}
            label={audioDescription.label}
            default={showAudioDescription}
          />
        )}
        
        {/* Fallback content */}
        <p>
          Your browser doesn't support HTML5 video. 
          <a href={src} download>
            Download the video file
          </a>.
        </p>
      </video>
      
      {/* Accessibility controls */}
      <div className="mt-4 space-y-2">
        {captions && (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showCaptions}
              onChange={(e) => setShowCaptions(e.target.checked)}
              className="rounded border-gray-300 focus:ring-blue-500"
            />
            <span>Show captions</span>
          </label>
        )}
        
        {audioDescription && (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showAudioDescription}
              onChange={(e) => setShowAudioDescription(e.target.checked)}
              className="rounded border-gray-300 focus:ring-blue-500"
            />
            <span>Enable audio descriptions</span>
          </label>
        )}
        
        {transcript && (
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="text-blue-600 hover:text-blue-800 focus:text-blue-800 underline"
            aria-expanded={showTranscript}
          >
            {showTranscript ? 'Hide' : 'Show'} transcript
          </button>
        )}
      </div>
      
      {/* Transcript */}
      {transcript && showTranscript && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Video Transcript</h3>
          <div className="prose max-w-none">
            {transcript}
          </div>
        </div>
      )}
    </div>
  );
};

// Image with proper alt text and lazy loading
const AccessibleImage: React.FC<AccessibleImageProps> = ({ 
  src,
  alt,
  caption,
  decorative = false,
  loading = 'lazy',
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const handleError = () => {
    setHasError(true);
  };
  
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  if (hasError) {
    return (
      <div className="bg-gray-200 flex items-center justify-center p-4 rounded">
        <span className="text-gray-500">Image failed to load</span>
      </div>
    );
  }
  
  return (
    <figure className="relative">
      <img
        src={src}
        alt={decorative ? '' : alt}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...(decorative && { 'aria-hidden': 'true' })}
        {...props}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-600">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
```

## Form Accessibility

### 1. **Accessible Form Components**

```typescript
// Accessible form field component
const AccessibleFormField: React.FC<FormFieldProps> = ({ 
  label,
  id,
  error,
  help,
  required = false,
  children 
}) => {
  const fieldId = id || ARIAUtils.generateId('field');
  const errorId = error ? ARIAUtils.generateId('error') : undefined;
  const helpId = help ? ARIAUtils.generateId('help') : undefined;
  
  return (
    <div className="space-y-1">
      <label
        htmlFor={fieldId}
        className={`block text-sm font-medium ${
          error ? 'text-red-700' : 'text-gray-700'
        }`}
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {React.cloneElement(children as React.ReactElement, {
        id: fieldId,
        'aria-invalid': !!error,
        'aria-describedby': ARIAUtils.describedBy([errorId, helpId]),
        'aria-required': required,
      })}
      
      {help && (
        <p id={helpId} className="text-sm text-gray-600">
          {help}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// Accessible input component
const AccessibleInput: React.FC<InputProps> = ({ 
  type = 'text',
  error,
  className = '',
  ...props 
}) => {
  const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2';
  const errorClasses = error
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
  
  return (
    <input
      type={type}
      className={`${baseClasses} ${errorClasses} ${className}`}
      {...props}
    />
  );
};

// Accessible select component
const AccessibleSelect: React.FC<SelectProps> = ({ 
  options,
  placeholder,
  error,
  className = '',
  ...props 
}) => {
  const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2';
  const errorClasses = error
    ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
  
  return (
    <select
      className={`${baseClasses} ${errorClasses} ${className}`}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Accessible checkbox group
const AccessibleCheckboxGroup: React.FC<CheckboxGroupProps> = ({ 
  legend,
  options,
  value,
  onChange,
  error,
  required = false 
}) => {
  const groupId = ARIAUtils.generateId('checkbox-group');
  const errorId = error ? ARIAUtils.generateId('error') : undefined;
  
  return (
    <fieldset
      className="space-y-2"
      aria-describedby={errorId}
      aria-invalid={!!error}
      aria-required={required}
    >
      <legend className="text-sm font-medium text-gray-700">
        {legend}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </legend>
      
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center space-x-2">
            <input
              type="checkbox"
              value={option.value}
              checked={value.includes(option.value)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...value, option.value]);
                } else {
                  onChange(value.filter(v => v !== option.value));
                }
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              aria-describedby={option.description ? `${groupId}-${option.value}-desc` : undefined}
            />
            <div>
              <span className="text-sm text-gray-700">{option.label}</span>
              {option.description && (
                <p id={`${groupId}-${option.value}-desc`} className="text-xs text-gray-500">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
};
```

## Testing and Validation

### 1. **Accessibility Testing Utilities**

```typescript
// Accessibility testing utilities
class AccessibilityTester {
  static async runAxeTests(element?: HTMLElement): Promise<AxeResults> {
    if (typeof window === 'undefined' || !window.axe) {
      throw new Error('axe-core is not available');
    }
    
    try {
      const results = await window.axe.run(element || document);
      return results;
    } catch (error) {
      console.error('Accessibility testing failed:', error);
      throw error;
    }
  }
  
  static checkColorContrast(foreground: string, background: string): ContrastResult {
    const ratio = ColorContrastUtils.getContrastRatio(foreground, background);
    
    return {
      ratio,
      meetsAA: ratio >= 4.5,
      meetsAAA: ratio >= 7.0,
      meetsAALarge: ratio >= 3.0,
      meetsAAALarge: ratio >= 4.5,
    };
  }
  
  static checkFocusManagement(container: HTMLElement): FocusTestResult {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const issues: string[] = [];
    
    // Check if all focusable elements are reachable
    focusableElements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      
      // Check if element has visible focus indicator
      const computedStyle = window.getComputedStyle(htmlElement, ':focus');
      const hasOutline = computedStyle.outline !== 'none' && computedStyle.outline !== '0px';
      const hasBoxShadow = computedStyle.boxShadow !== 'none';
      const hasBorder = computedStyle.borderColor !== computedStyle.color;
      
      if (!hasOutline && !hasBoxShadow && !hasBorder) {
        issues.push(`Element ${index + 1} lacks visible focus indicator`);
      }
      
      // Check tabindex values
      const tabIndex = htmlElement.tabIndex;
      if (tabIndex > 0) {
        issues.push(`Element ${index + 1} has positive tabindex (${tabIndex}), which can disrupt tab order`);
      }
    });
    
    return {
      focusableCount: focusableElements.length,
      issues,
      isValid: issues.length === 0,
    };
  }
  
  static checkARIALabels(container: HTMLElement): ARIATestResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    
    // Check for missing alt text on images
    const images = container.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.alt && !img.hasAttribute('aria-hidden')) {
        issues.push(`Image ${index + 1} is missing alt text`);
      }
    });
    
    // Check for form labels
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      const htmlInput = input as HTMLInputElement;
      const hasLabel = !!htmlInput.labels?.length;
      const hasAriaLabel = !!htmlInput.getAttribute('aria-label');
      const hasAriaLabelledBy = !!htmlInput.getAttribute('aria-labelledby');
      
      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
        issues.push(`Form control ${index + 1} lacks accessible label`);
      }
    });
    
    // Check for heading hierarchy
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (index === 0 && level !== 1) {
        warnings.push('Page should start with h1');
      }
      
      if (level > previousLevel + 1) {
        warnings.push(`Heading level jumps from h${previousLevel} to h${level}`);
      }
      
      previousLevel = level;
    });
    
    return {
      issues,
      warnings,
      isValid: issues.length === 0,
    };
  }
}

// React testing utilities
const renderWithAccessibility = (component: React.ReactElement) => {
  const { container, ...rest } = render(
    <AccessibilityProvider>
      {component}
    </AccessibilityProvider>
  );
  
  return {
    container,
    ...rest,
    // Helper methods for accessibility testing
    async checkAccessibility() {
      return AccessibilityTester.runAxeTests(container);
    },
    checkFocus() {
      return AccessibilityTester.checkFocusManagement(container);
    },
    checkARIA() {
      return AccessibilityTester.checkARIALabels(container);
    },
  };
};

// Example test
describe('VideoCard Accessibility', () => {
  it('should be accessible', async () => {
    const { checkAccessibility, checkFocus, checkARIA } = renderWithAccessibility(
      <AccessibleVideoCard video={mockVideo} onPlay={jest.fn()} />
    );
    
    // Run axe tests
    const axeResults = await checkAccessibility();
    expect(axeResults.violations).toHaveLength(0);
    
    // Check focus management
    const focusResults = checkFocus();
    expect(focusResults.isValid).toBe(true);
    
    // Check ARIA implementation
    const ariaResults = checkARIA();
    expect(ariaResults.isValid).toBe(true);
  });
  
  it('should support keyboard navigation', () => {
    const onPlay = jest.fn();
    const { getByRole } = renderWithAccessibility(
      <AccessibleVideoCard video={mockVideo} onPlay={onPlay} />
    );
    
    const playButton = getByRole('button', { name: /play/i });
    
    // Test keyboard activation
    fireEvent.keyDown(playButton, { key: 'Enter' });
    expect(onPlay).toHaveBeenCalledWith(mockVideo.id);
    
    fireEvent.keyDown(playButton, { key: ' ' });
    expect(onPlay).toHaveBeenCalledTimes(2);
  });
  
  it('should announce actions to screen readers', () => {
    const { getByRole } = renderWithAccessibility(
      <AccessibleVideoCard video={mockVideo} onPlay={jest.fn()} />
    );
    
    const playButton = getByRole('button', { name: `Play ${mockVideo.title}` });
    expect(playButton).toBeInTheDocument();
    
    const videoLink = getByRole('link', { name: mockVideo.title });
    expect(videoLink).toHaveAttribute('href', `/watch/${mockVideo.id}`);
  });
});
```

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
1. **Setup Accessibility Context**
   - Implement AccessibilityProvider
   - Add ARIA live regions
   - Setup user preference detection

2. **Basic Components**
   - Create accessible button components
   - Implement form field components
   - Add focus management utilities

### Phase 2: Navigation and Interaction (Week 3-4)
1. **Keyboard Navigation**
   - Implement roving tabindex for lists
   - Add keyboard shortcuts
   - Create focus trap utilities

2. **Screen Reader Support**
   - Add proper ARIA labels
   - Implement live regions
   - Create announcement system

### Phase 3: Media and Content (Week 5-6)
1. **Media Accessibility**
   - Add video captions support
   - Implement audio descriptions
   - Create transcript functionality

2. **Content Structure**
   - Ensure proper heading hierarchy
   - Add semantic HTML structure
   - Implement skip navigation

### Phase 4: Testing and Validation (Week 7-8)
1. **Automated Testing**
   - Setup axe-core integration
   - Create accessibility test utilities
   - Add CI/CD accessibility checks

2. **Manual Testing**
   - Screen reader testing
   - Keyboard navigation testing
   - Color contrast validation

## Best Practices Summary

### 1. **Always Provide Text Alternatives**
- Use meaningful alt text for images
- Provide captions for videos
- Include transcripts for audio content

### 2. **Ensure Keyboard Accessibility**
- All interactive elements must be keyboard accessible
- Provide visible focus indicators
- Implement logical tab order

### 3. **Use Semantic HTML**
- Choose appropriate HTML elements
- Maintain proper heading hierarchy
- Use landmarks and regions

### 4. **Provide Clear Instructions**
- Label form fields clearly
- Provide error messages and help text
- Use consistent navigation patterns

### 5. **Test with Real Users**
- Include users with disabilities in testing
- Use actual assistive technologies
- Gather feedback and iterate

## Resources and Tools

### Testing Tools
- **axe-core**: Automated accessibility testing
- **WAVE**: Web accessibility evaluation
- **Lighthouse**: Performance and accessibility audits
- **Color Oracle**: Color blindness simulator

### Screen Readers
- **NVDA**: Free Windows screen reader
- **JAWS**: Popular Windows screen reader
- **VoiceOver**: Built-in macOS/iOS screen reader
- **TalkBack**: Built-in Android screen reader

### Guidelines and Standards
- **WCAG 2.1**: Web Content Accessibility Guidelines
- **Section 508**: US federal accessibility requirements
- **EN 301 549**: European accessibility standard
- **ARIA Authoring Practices**: Implementation patterns

This comprehensive accessibility guide provides the foundation for creating an inclusive YouTubeX application that works for all users, regardless of their abilities or the assistive technologies they use.