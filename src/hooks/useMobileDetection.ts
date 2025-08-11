
import { useState, useEffect } from 'react';

interface MobileDetectionResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  orientation: 'portrait' | 'landscape';
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export const useMobileDetection = (): MobileDetectionResult => {
  const [detection, setDetection] = useState<MobileDetectionResult>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        screenSize: 'lg',
        orientation: 'landscape',
        deviceType: 'desktop',
      };
    }

    return getDetectionResult();
  });

  function getDetectionResult(): MobileDetectionResult {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const { userAgent } = navigator;

    // Screen size detection
    let screenSize: MobileDetectionResult['screenSize'] = 'lg';
    if (width < 640) {
screenSize = 'xs';
} else if (width < 768) {
screenSize = 'sm';
} else if (width < 1024) {
screenSize = 'md';
} else if (width < 1280) {
screenSize = 'lg';
} else if (width < 1536) {
screenSize = 'xl';
} else {
screenSize = '2xl';
}

    // Device type detection
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTabletUA = /iPad|Android(?!.*Mobile)/i.test(userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // More accurate mobile detection
    const isMobile = (width <= 768 && isTouchDevice) || (isMobileUA && !isTabletUA);
    const isTablet = (width > 768 && width <= 1024 && isTouchDevice) || isTabletUA;
    const isDesktop = !isMobile && !isTablet;

    // Orientation
    const orientation: 'portrait' | 'landscape' = height > width ? 'portrait' : 'landscape';

    // Device type
    let deviceType: MobileDetectionResult['deviceType'] = 'desktop';
    if (isMobile) {
deviceType = 'mobile';
} else if (isTablet) {
deviceType = 'tablet';
}

    return {
      isMobile,
      isTablet,
      isDesktop,
      isTouchDevice,
      screenSize,
      orientation,
      deviceType,
    };
  }

  useEffect(() => {
    const handleResize = () => {
      setDetection(getDetectionResult());
    };

    const handleOrientationChange = () => {
      // Delay to ensure dimensions are updated
      setTimeout(() => {
        setDetection(getDetectionResult());
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return detection;
};

// Hook for responsive breakpoints
export const useBreakpoint = () => {
  const { screenSize } = useMobileDetection();

  return {
    isXs: screenSize === 'xs',
    isSm: screenSize === 'sm',
    isMd: screenSize === 'md',
    isLg: screenSize === 'lg',
    isXl: screenSize === 'xl',
    is2Xl: screenSize === '2xl',
    screenSize,
  };
};

// Hook for touch interactions
export const useTouchInteractions = () => {
  const { isTouchDevice } = useMobileDetection();

  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      setTouchStart({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touch = e.changedTouches[0];
    if (touch) {
      setTouchEnd({ x: touch.clientX, y: touch.clientY });
    }
  };

  const getSwipeDirection = (): 'left' | 'right' | 'up' | 'down' | null => {
    if (!touchStart || !touchEnd) {
return null;
}

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        return deltaX > 0 ? 'right' : 'left';
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        return deltaY > 0 ? 'down' : 'up';
      }
    }

    return null;
  };

  return {
    isTouchDevice,
    touchStart,
    touchEnd,
    handleTouchStart,
    handleTouchEnd,
    getSwipeDirection,
  };
};

// Hook for viewport dimensions
export const useViewport = () => {
  const [viewport, setViewport] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768 };
    }
    return { width: window.innerWidth, height: window.innerHeight };
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
};