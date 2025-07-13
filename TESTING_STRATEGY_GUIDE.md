# Comprehensive Testing Strategy Guide

## Overview

This document outlines a comprehensive testing strategy for the YouTubeX application, focusing on ensuring code quality, reliability, and maintainability through systematic testing approaches.

## 🧪 Testing Pyramid

### Unit Tests (70%)
Fast, isolated tests for individual functions and components.

### Integration Tests (20%)
Tests for component interactions and API integrations.

### End-to-End Tests (10%)
Full user journey tests across the entire application.

## 📋 Testing Categories

### 1. Component Testing

#### PWA Hook Testing
```typescript
// usePWA.test.ts
import { renderHook, act } from '@testing-library/react';
import { usePWA } from '../hooks/usePWA';

describe('usePWA Hook', () => {
  beforeEach(() => {
    // Mock service worker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: jest.fn().mockResolvedValue({}),
        ready: Promise.resolve({})
      },
      writable: true
    });
  });

  it('should initialize PWA state correctly', () => {
    const { result } = renderHook(() => usePWA());
    
    expect(result.current.isOnline).toBe(true);
    expect(result.current.canInstall).toBe(false);
    expect(result.current.isInstalled).toBe(false);
  });

  it('should handle install prompt correctly', async () => {
    const mockPrompt = {
      prompt: jest.fn().mockResolvedValue({}),
      userChoice: Promise.resolve({ outcome: 'accepted' })
    };

    const { result } = renderHook(() => usePWA());
    
    act(() => {
      // Simulate beforeinstallprompt event
      window.dispatchEvent(new CustomEvent('beforeinstallprompt', {
        detail: mockPrompt
      }));
    });

    expect(result.current.canInstall).toBe(true);

    await act(async () => {
      await result.current.installPWA();
    });

    expect(mockPrompt.prompt).toHaveBeenCalled();
  });

  it('should track network status changes', () => {
    const { result } = renderHook(() => usePWA());
    
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    
    expect(result.current.isOnline).toBe(false);
    
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    
    expect(result.current.isOnline).toBe(true);
  });
});
```

#### Component Rendering Tests
```typescript
// PWAInstallBanner.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PWAInstallBanner } from '../components/PWAInstallBanner';
import { usePWA } from '../hooks/usePWA';

// Mock the usePWA hook
jest.mock('../hooks/usePWA');
const mockUsePWA = usePWA as jest.MockedFunction<typeof usePWA>;

describe('PWAInstallBanner', () => {
  const defaultPWAState = {
    canInstall: true,
    isInstalled: false,
    isOnline: true,
    installPWA: jest.fn(),
    dismissPrompt: jest.fn()
  };

  beforeEach(() => {
    mockUsePWA.mockReturnValue(defaultPWAState);
  });

  it('should render install banner when PWA can be installed', () => {
    render(<PWAInstallBanner />);
    
    expect(screen.getByText(/Install YouTubeX/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /install/i })).toBeInTheDocument();
  });

  it('should not render when PWA cannot be installed', () => {
    mockUsePWA.mockReturnValue({
      ...defaultPWAState,
      canInstall: false
    });

    const { container } = render(<PWAInstallBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('should call installPWA when install button is clicked', async () => {
    const mockInstall = jest.fn().mockResolvedValue(undefined);
    mockUsePWA.mockReturnValue({
      ...defaultPWAState,
      installPWA: mockInstall
    });

    render(<PWAInstallBanner />);
    
    const installButton = screen.getByRole('button', { name: /install/i });
    fireEvent.click(installButton);

    await waitFor(() => {
      expect(mockInstall).toHaveBeenCalled();
    });
  });

  it('should show offline indicator when offline', () => {
    mockUsePWA.mockReturnValue({
      ...defaultPWAState,
      isOnline: false
    });

    render(<PWAInstallBanner />);
    
    expect(screen.getByText(/offline/i)).toBeInTheDocument();
  });

  it('should handle different banner variants', () => {
    render(<PWAInstallBanner variant="minimal" />);
    
    expect(screen.getByTestId('minimal-banner')).toBeInTheDocument();
  });
});
```

### 2. Integration Testing

#### API Integration Tests
```typescript
// api.integration.test.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { videoAPI } from '../api/videoAPI';

const server = setupServer(
  rest.get('/api/videos/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.json({
        id,
        title: 'Test Video',
        description: 'Test Description',
        duration: 120,
        views: 1000
      })
    );
  }),

  rest.post('/api/videos/:id/like', (req, res, ctx) => {
    return res(
      ctx.json({ success: true, liked: true })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Video API Integration', () => {
  it('should fetch video data successfully', async () => {
    const video = await videoAPI.getVideo('test-id');
    
    expect(video).toEqual({
      id: 'test-id',
      title: 'Test Video',
      description: 'Test Description',
      duration: 120,
      views: 1000
    });
  });

  it('should handle like action', async () => {
    const result = await videoAPI.likeVideo('test-id');
    
    expect(result).toEqual({
      success: true,
      liked: true
    });
  });

  it('should handle network errors gracefully', async () => {
    server.use(
      rest.get('/api/videos/:id', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    await expect(videoAPI.getVideo('test-id')).rejects.toThrow('Network Error');
  });
});
```

#### Service Worker Integration
```typescript
// serviceWorker.integration.test.ts
import { setupServiceWorkerTest } from '../test-utils/serviceWorkerTestUtils';

describe('Service Worker Integration', () => {
  let swContainer: ServiceWorkerContainer;

  beforeEach(async () => {
    swContainer = await setupServiceWorkerTest();
  });

  it('should register service worker successfully', async () => {
    const registration = await swContainer.register('/sw.js');
    expect(registration).toBeDefined();
    expect(registration.active).toBeTruthy();
  });

  it('should cache resources correctly', async () => {
    const cache = await caches.open('test-cache');
    await cache.add('/test-resource');
    
    const cachedResponse = await cache.match('/test-resource');
    expect(cachedResponse).toBeTruthy();
  });

  it('should handle cache updates', async () => {
    // Test cache update mechanism
    const oldCache = await caches.open('v1');
    const newCache = await caches.open('v2');
    
    await oldCache.add('/resource');
    await newCache.add('/resource');
    
    // Verify cache migration
    const oldResponse = await oldCache.match('/resource');
    const newResponse = await newCache.match('/resource');
    
    expect(oldResponse).toBeTruthy();
    expect(newResponse).toBeTruthy();
  });
});
```

### 3. End-to-End Testing

#### Critical User Flows
```typescript
// e2e/video-playback.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Video Playback Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should play video from homepage', async ({ page }) => {
    // Click on first video
    await page.click('[data-testid="video-thumbnail"]:first-child');
    
    // Wait for video page to load
    await expect(page.locator('[data-testid="video-player"]')).toBeVisible();
    
    // Click play button
    await page.click('[data-testid="play-button"]');
    
    // Verify video is playing
    await expect(page.locator('[data-testid="video-player"]')).toHaveAttribute('data-playing', 'true');
    
    // Test pause functionality
    await page.click('[data-testid="pause-button"]');
    await expect(page.locator('[data-testid="video-player"]')).toHaveAttribute('data-playing', 'false');
  });

  test('should handle video quality changes', async ({ page }) => {
    await page.goto('/watch?v=test-video');
    
    // Open quality menu
    await page.click('[data-testid="quality-button"]');
    await expect(page.locator('[data-testid="quality-menu"]')).toBeVisible();
    
    // Select 720p quality
    await page.click('[data-testid="quality-720p"]');
    
    // Verify quality change
    await expect(page.locator('[data-testid="current-quality"]')).toHaveText('720p');
  });

  test('should handle fullscreen mode', async ({ page }) => {
    await page.goto('/watch?v=test-video');
    
    // Enter fullscreen
    await page.click('[data-testid="fullscreen-button"]');
    
    // Verify fullscreen state
    await expect(page.locator('[data-testid="video-container"]')).toHaveClass(/fullscreen/);
    
    // Exit fullscreen with Escape
    await page.keyboard.press('Escape');
    
    // Verify exit fullscreen
    await expect(page.locator('[data-testid="video-container"]')).not.toHaveClass(/fullscreen/);
  });
});
```

#### PWA Installation Flow
```typescript
// e2e/pwa-installation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('PWA Installation', () => {
  test('should show install banner and handle installation', async ({ page, context }) => {
    // Mock beforeinstallprompt event
    await page.addInitScript(() => {
      let deferredPrompt;
      
      window.addEventListener('load', () => {
        setTimeout(() => {
          deferredPrompt = {
            prompt: () => Promise.resolve(),
            userChoice: Promise.resolve({ outcome: 'accepted' })
          };
          
          window.dispatchEvent(new CustomEvent('beforeinstallprompt', {
            detail: deferredPrompt
          }));
        }, 1000);
      });
    });

    await page.goto('/');
    
    // Wait for install banner to appear
    await expect(page.locator('[data-testid="pwa-install-banner"]')).toBeVisible();
    
    // Click install button
    await page.click('[data-testid="install-button"]');
    
    // Verify installation success message
    await expect(page.locator('[data-testid="install-success"]')).toBeVisible();
  });

  test('should handle install banner dismissal', async ({ page }) => {
    await page.goto('/');
    
    // Wait for banner and dismiss it
    await page.click('[data-testid="dismiss-button"]');
    
    // Verify banner is hidden
    await expect(page.locator('[data-testid="pwa-install-banner"]')).not.toBeVisible();
    
    // Verify dismissal is persisted (reload page)
    await page.reload();
    await expect(page.locator('[data-testid="pwa-install-banner"]')).not.toBeVisible();
  });
});
```

### 4. Performance Testing

#### Load Testing
```typescript
// performance/load.test.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load homepage within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for main content to load
    await page.waitForSelector('[data-testid="video-grid"]');
    
    const loadTime = Date.now() - startTime;
    
    // Assert load time is under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle large video lists efficiently', async ({ page }) => {
    await page.goto('/trending');
    
    // Scroll to load more videos
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(500);
    }
    
    // Measure memory usage
    const metrics = await page.evaluate(() => {
      return {
        usedJSHeapSize: (performance as any).memory?.usedJSHeapSize || 0,
        totalJSHeapSize: (performance as any).memory?.totalJSHeapSize || 0
      };
    });
    
    // Assert memory usage is reasonable (less than 100MB)
    expect(metrics.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024);
  });

  test('should maintain 60fps during video playback', async ({ page }) => {
    await page.goto('/watch?v=test-video');
    
    // Start performance monitoring
    await page.evaluate(() => {
      (window as any).performanceData = {
        frames: [],
        startTime: performance.now()
      };
      
      function measureFrame() {
        const now = performance.now();
        (window as any).performanceData.frames.push(now);
        requestAnimationFrame(measureFrame);
      }
      
      requestAnimationFrame(measureFrame);
    });
    
    // Play video for 5 seconds
    await page.click('[data-testid="play-button"]');
    await page.waitForTimeout(5000);
    
    // Calculate FPS
    const fps = await page.evaluate(() => {
      const data = (window as any).performanceData;
      const duration = (data.frames[data.frames.length - 1] - data.frames[0]) / 1000;
      return data.frames.length / duration;
    });
    
    // Assert FPS is close to 60
    expect(fps).toBeGreaterThan(55);
  });
});
```

### 5. Accessibility Testing

#### A11y Compliance Tests
```typescript
// accessibility/a11y.test.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should pass axe accessibility tests on homepage', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus').getAttribute('data-testid');
    expect(focusedElement).toBe('search-input');
    
    await page.keyboard.press('Tab');
    focusedElement = await page.locator(':focus').getAttribute('data-testid');
    expect(focusedElement).toBe('search-button');
    
    // Test arrow key navigation in video grid
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowDown');
    
    focusedElement = await page.locator(':focus').getAttribute('data-testid');
    expect(focusedElement).toContain('video-card');
  });

  test('should provide proper ARIA labels', async ({ page }) => {
    await page.goto('/watch?v=test-video');
    
    // Check video player ARIA labels
    const playButton = page.locator('[data-testid="play-button"]');
    await expect(playButton).toHaveAttribute('aria-label', 'Play video');
    
    const volumeSlider = page.locator('[data-testid="volume-slider"]');
    await expect(volumeSlider).toHaveAttribute('aria-label', 'Volume control');
    
    const progressBar = page.locator('[data-testid="progress-bar"]');
    await expect(progressBar).toHaveAttribute('aria-label', /Video progress/);
  });

  test('should support screen reader announcements', async ({ page }) => {
    await page.goto('/watch?v=test-video');
    
    // Monitor aria-live regions
    const announcements = [];
    
    page.on('console', msg => {
      if (msg.text().includes('Screen reader:')) {
        announcements.push(msg.text());
      }
    });
    
    // Trigger playback
    await page.click('[data-testid="play-button"]');
    
    // Wait for announcement
    await page.waitForTimeout(1000);
    
    expect(announcements).toContain('Screen reader: Video playing');
  });
});
```

### 6. Security Testing

#### XSS and Security Tests
```typescript
// security/security.test.ts
import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {
  test('should prevent XSS in search input', async ({ page }) => {
    await page.goto('/');
    
    const maliciousScript = '<script>window.xssExecuted = true;</script>';
    
    await page.fill('[data-testid="search-input"]', maliciousScript);
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify script was not executed
    const xssExecuted = await page.evaluate(() => (window as any).xssExecuted);
    expect(xssExecuted).toBeUndefined();
    
    // Verify content is properly escaped
    const searchResults = await page.textContent('[data-testid="search-results"]');
    expect(searchResults).toContain('&lt;script&gt;');
  });

  test('should validate CSP headers', async ({ page }) => {
    const response = await page.goto('/');
    const cspHeader = response?.headers()['content-security-policy'];
    
    expect(cspHeader).toBeDefined();
    expect(cspHeader).toContain("default-src 'self'");
    expect(cspHeader).toContain("script-src 'self'");
  });

  test('should handle malicious file uploads', async ({ page }) => {
    await page.goto('/upload');
    
    // Try to upload a malicious file
    const maliciousFile = Buffer.from('<?php echo "hacked"; ?>', 'utf8');
    
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'malicious.php',
      mimeType: 'application/x-php',
      buffer: maliciousFile
    });
    
    await page.click('[data-testid="upload-button"]');
    
    // Verify upload was rejected
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid file type');
  });
});
```

## 🛠️ Testing Tools & Setup

### Test Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-utils/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test-utils/',
        '**/*.d.ts',
        '**/*.config.*'
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    }
  }
});
```

### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

## 📊 Testing Metrics & Reporting

### Coverage Requirements
- **Unit Tests**: 95% coverage minimum
- **Integration Tests**: 85% coverage minimum
- **E2E Tests**: Cover all critical user paths

### Performance Budgets
- **Load Time**: < 3 seconds
- **FPS**: > 55 fps during video playback
- **Memory Usage**: < 100MB for extended sessions

### Quality Gates
- All tests must pass before deployment
- Coverage thresholds must be met
- Performance budgets must be respected
- Accessibility tests must pass
- Security tests must pass

This comprehensive testing strategy ensures the YouTubeX application maintains high quality, reliability, and user experience across all features and platforms.