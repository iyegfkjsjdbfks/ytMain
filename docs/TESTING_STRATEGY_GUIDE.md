# Testing Strategy Guide

## Overview

This guide outlines a comprehensive testing strategy for the YouTubeX application, covering unit tests, integration tests, end-to-end tests, and performance testing.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Testing Pyramid](#testing-pyramid)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [End-to-End Testing](#end-to-end-testing)
6. [Performance Testing](#performance-testing)
7. [Accessibility Testing](#accessibility-testing)
8. [Visual Regression Testing](#visual-regression-testing)
9. [Testing Tools and Setup](#testing-tools-and-setup)
10. [Best Practices](#best-practices)

## Testing Philosophy

### Core Principles

1. **Test Behavior, Not Implementation**
   - Focus on what the component does, not how it does it
   - Test user interactions and expected outcomes
   - Avoid testing internal state or implementation details

2. **Write Tests That Give Confidence**
   - Tests should catch real bugs
   - Tests should be maintainable and reliable
   - False positives and negatives should be minimized

3. **Test-Driven Development (TDD)**
   - Write tests before implementation when possible
   - Use tests to drive design decisions
   - Refactor with confidence

## Testing Pyramid

```
    /\     E2E Tests (10%)
   /  \    - Full user workflows
  /    \   - Critical user paths
 /______\  - Cross-browser testing

 /______\  Integration Tests (20%)
/        \ - Component interactions
\        / - API integrations
 \______/  - Context providers

 /______\  Unit Tests (70%)
/        \ - Individual components
\        / - Utility functions
 \______/  - Custom hooks
```

## Unit Testing

### Component Testing

#### 1. **Basic Component Testing**

```tsx
// VideoCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VideoCard } from './VideoCard';
import { mockVideo } from '@/test-utils/mocks';

describe('VideoCard', () => {
  const defaultProps = {
    video: mockVideo,
    onPlay: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('displays video title', () => {
      render(<VideoCard {...defaultProps} />);
      expect(screen.getByText(mockVideo.title)).toBeInTheDocument();
    });

    it('displays video duration', () => {
      render(<VideoCard {...defaultProps} />);
      expect(screen.getByText('5:30')).toBeInTheDocument();
    });

    it('displays video thumbnail', () => {
      render(<VideoCard {...defaultProps} />);
      const thumbnail = screen.getByRole('img', { name: /video thumbnail/i });
      expect(thumbnail).toHaveAttribute('src', mockVideo.thumbnail);
    });
  });

  describe('Interactions', () => {
    it('calls onPlay when play button is clicked', () => {
      render(<VideoCard {...defaultProps} />);
      
      fireEvent.click(screen.getByRole('button', { name: /play/i }));
      
      expect(defaultProps.onPlay).toHaveBeenCalledWith(mockVideo.id);
    });

    it('navigates to video page when card is clicked', () => {
      const mockNavigate = jest.fn();
      jest.mocked(useNavigate).mockReturnValue(mockNavigate);
      
      render(<VideoCard {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('video-card'));
      
      expect(mockNavigate).toHaveBeenCalledWith(`/watch/${mockVideo.id}`);
    });
  });

  describe('Loading States', () => {
    it('shows skeleton loader when loading', () => {
      render(<VideoCard {...defaultProps} loading />);
      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    });

    it('shows error state when video fails to load', () => {
      render(<VideoCard {...defaultProps} error="Failed to load video" />);
      expect(screen.getByText('Failed to load video')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<VideoCard {...defaultProps} />);
      
      expect(screen.getByRole('article')).toHaveAttribute(
        'aria-label',
        `Video: ${mockVideo.title}`
      );
    });

    it('supports keyboard navigation', () => {
      render(<VideoCard {...defaultProps} />);
      
      const card = screen.getByTestId('video-card');
      fireEvent.keyDown(card, { key: 'Enter' });
      
      expect(defaultProps.onPlay).toHaveBeenCalled();
    });
  });
});
```

#### 2. **Hook Testing**

```tsx
// useVideo.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useVideo } from './useVideo';
import { videoAPI } from '@/services/videoAPI';

jest.mock('@/services/videoAPI');

describe('useVideo', () => {
  const mockVideoAPI = jest.mocked(videoAPI);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches video data on mount', async () => {
    const mockVideo = { id: '1', title: 'Test Video' };
    mockVideoAPI.getVideo.mockResolvedValue(mockVideo);

    const { result } = renderHook(() => useVideo('1'));

    expect(result.current.loading).toBe(true);
    expect(result.current.video).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.video).toEqual(mockVideo);
    expect(mockVideoAPI.getVideo).toHaveBeenCalledWith('1');
  });

  it('handles fetch errors', async () => {
    const error = new Error('Network error');
    mockVideoAPI.getVideo.mockRejectedValue(error);

    const { result } = renderHook(() => useVideo('1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(error);
    expect(result.current.video).toBeNull();
  });

  it('refetches video when ID changes', async () => {
    const mockVideo1 = { id: '1', title: 'Video 1' };
    const mockVideo2 = { id: '2', title: 'Video 2' };
    
    mockVideoAPI.getVideo
      .mockResolvedValueOnce(mockVideo1)
      .mockResolvedValueOnce(mockVideo2);

    const { result, rerender } = renderHook(
      ({ videoId }) => useVideo(videoId),
      { initialProps: { videoId: '1' } }
    );

    await waitFor(() => {
      expect(result.current.video).toEqual(mockVideo1);
    });

    rerender({ videoId: '2' });

    await waitFor(() => {
      expect(result.current.video).toEqual(mockVideo2);
    });

    expect(mockVideoAPI.getVideo).toHaveBeenCalledTimes(2);
  });
});
```

#### 3. **Utility Function Testing**

```tsx
// formatDuration.test.ts
import { formatDuration } from './formatDuration';

describe('formatDuration', () => {
  it('formats seconds correctly', () => {
    expect(formatDuration(30)).toBe('0:30');
    expect(formatDuration(59)).toBe('0:59');
  });

  it('formats minutes correctly', () => {
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(90)).toBe('1:30');
    expect(formatDuration(3599)).toBe('59:59');
  });

  it('formats hours correctly', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(7200)).toBe('2:00:00');
  });

  it('handles edge cases', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(-1)).toBe('0:00');
    expect(formatDuration(NaN)).toBe('0:00');
  });
});
```

### Testing Context Providers

```tsx
// UserProvider.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserProvider, useUser } from './UserProvider';
import { authAPI } from '@/services/authAPI';

jest.mock('@/services/authAPI');

const TestComponent = () => {
  const { user, login, logout, loading } = useUser();
  
  return (
    <div>
      {loading && <div>Loading...</div>}
      {user ? (
        <div>
          <span>Welcome, {user.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login('test@example.com', 'password')}>
          Login
        </button>
      )}
    </div>
  );
};

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <UserProvider>{ui}</UserProvider>
  );
};

describe('UserProvider', () => {
  const mockAuthAPI = jest.mocked(authAPI);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial state', () => {
    renderWithProvider(<TestComponent />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
    mockAuthAPI.login.mockResolvedValue({ user: mockUser, token: 'abc123' });

    renderWithProvider(<TestComponent />);
    
    fireEvent.click(screen.getByText('Login'));
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument();
    });
    
    expect(mockAuthAPI.login).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('handles logout', async () => {
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
    mockAuthAPI.login.mockResolvedValue({ user: mockUser, token: 'abc123' });
    mockAuthAPI.logout.mockResolvedValue(undefined);

    renderWithProvider(<TestComponent />);
    
    // Login first
    fireEvent.click(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument();
    });
    
    // Then logout
    fireEvent.click(screen.getByText('Logout'));
    
    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument();
    });
    
    expect(mockAuthAPI.logout).toHaveBeenCalled();
  });
});
```

## Integration Testing

### API Integration Testing

```tsx
// VideoList.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { VideoList } from './VideoList';
import { AppProviders } from '@/app/providers';

const server = setupServer(
  rest.get('/api/videos', (req, res, ctx) => {
    const page = req.url.searchParams.get('page') || '1';
    
    return res(
      ctx.json({
        data: [
          {
            id: '1',
            title: 'Test Video 1',
            thumbnail: 'https://example.com/thumb1.jpg',
            duration: 120,
          },
          {
            id: '2',
            title: 'Test Video 2',
            thumbnail: 'https://example.com/thumb2.jpg',
            duration: 180,
          },
        ],
        meta: {
          page: parseInt(page),
          totalPages: 5,
          totalItems: 50,
        },
      })
    );
  })
);

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <AppProviders>{ui}</AppProviders>
  );
};

describe('VideoList Integration', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('loads and displays videos from API', async () => {
    renderWithProviders(<VideoList />);

    // Should show loading state initially
    expect(screen.getByText('Loading videos...')).toBeInTheDocument();

    // Wait for videos to load
    await waitFor(() => {
      expect(screen.getByText('Test Video 1')).toBeInTheDocument();
      expect(screen.getByText('Test Video 2')).toBeInTheDocument();
    });

    // Should show pagination
    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    server.use(
      rest.get('/api/videos', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    renderWithProviders(<VideoList />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load videos/i)).toBeInTheDocument();
    });

    // Should show retry button
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('supports pagination', async () => {
    renderWithProviders(<VideoList />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test Video 1')).toBeInTheDocument();
    });

    // Click next page
    fireEvent.click(screen.getByRole('button', { name: /next page/i }));

    // Should make new API request
    await waitFor(() => {
      expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
    });
  });
});
```

### Component Integration Testing

```tsx
// WatchPage.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WatchPage } from './WatchPage';
import { AppProviders } from '@/app/providers';

const renderWatchPage = (videoId: string) => {
  return render(
    <MemoryRouter initialEntries={[`/watch/${videoId}`]}>
      <AppProviders>
        <WatchPage />
      </AppProviders>
    </MemoryRouter>
  );
};

describe('WatchPage Integration', () => {
  it('loads video and related content', async () => {
    renderWatchPage('test-video-id');

    // Should show loading state
    expect(screen.getByText('Loading video...')).toBeInTheDocument();

    // Wait for video to load
    await waitFor(() => {
      expect(screen.getByTestId('video-player')).toBeInTheDocument();
    });

    // Should show video metadata
    expect(screen.getByText('Test Video Title')).toBeInTheDocument();
    expect(screen.getByText('1.2M views')).toBeInTheDocument();

    // Should show related videos
    expect(screen.getByText('Related Videos')).toBeInTheDocument();

    // Should show comments section
    expect(screen.getByText('Comments')).toBeInTheDocument();
  });

  it('handles video playback interactions', async () => {
    renderWatchPage('test-video-id');

    await waitFor(() => {
      expect(screen.getByTestId('video-player')).toBeInTheDocument();
    });

    // Click play button
    fireEvent.click(screen.getByRole('button', { name: /play/i }));

    // Should update play state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });
  });

  it('handles like/dislike interactions', async () => {
    renderWatchPage('test-video-id');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /like/i })).toBeInTheDocument();
    });

    // Click like button
    fireEvent.click(screen.getByRole('button', { name: /like/i }));

    // Should update like state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /unlike/i })).toBeInTheDocument();
    });
  });
});
```

## End-to-End Testing

### Playwright E2E Tests

```typescript
// e2e/video-playback.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Video Playback', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/api/videos/*', async route => {
      const videoId = route.request().url().split('/').pop();
      await route.fulfill({
        json: {
          id: videoId,
          title: 'Test Video',
          src: 'https://example.com/video.mp4',
          thumbnail: 'https://example.com/thumb.jpg',
          duration: 300,
          views: 1000000,
        },
      });
    });
  });

  test('should play video when play button is clicked', async ({ page }) => {
    await page.goto('/watch/test-video-id');

    // Wait for video player to load
    await page.waitForSelector('[data-testid="video-player"]');

    // Click play button
    await page.click('[data-testid="play-button"]');

    // Verify video is playing
    await expect(page.locator('[data-testid="video-player"]')).toHaveAttribute(
      'data-playing',
      'true'
    );

    // Verify play button changed to pause
    await expect(page.locator('[data-testid="play-button"]')).toHaveAttribute(
      'aria-label',
      'Pause video'
    );
  });

  test('should control volume', async ({ page }) => {
    await page.goto('/watch/test-video-id');
    await page.waitForSelector('[data-testid="video-player"]');

    // Click volume button
    await page.click('[data-testid="volume-button"]');

    // Volume slider should appear
    await expect(page.locator('[data-testid="volume-slider"]')).toBeVisible();

    // Adjust volume
    await page.fill('[data-testid="volume-slider"]', '50');

    // Verify volume changed
    await expect(page.locator('[data-testid="volume-slider"]')).toHaveValue('50');
  });

  test('should seek through video', async ({ page }) => {
    await page.goto('/watch/test-video-id');
    await page.waitForSelector('[data-testid="video-player"]');

    // Click on progress bar to seek
    const progressBar = page.locator('[data-testid="progress-bar"]');
    await progressBar.click({ position: { x: 100, y: 10 } });

    // Verify current time changed
    const currentTime = await page.textContent('[data-testid="current-time"]');
    expect(currentTime).not.toBe('0:00');
  });

  test('should toggle fullscreen', async ({ page }) => {
    await page.goto('/watch/test-video-id');
    await page.waitForSelector('[data-testid="video-player"]');

    // Click fullscreen button
    await page.click('[data-testid="fullscreen-button"]');

    // Verify fullscreen mode
    await expect(page.locator('[data-testid="video-player"]')).toHaveClass(
      /fullscreen/
    );

    // Exit fullscreen
    await page.keyboard.press('Escape');

    // Verify exited fullscreen
    await expect(page.locator('[data-testid="video-player"]')).not.toHaveClass(
      /fullscreen/
    );
  });
});
```

### User Journey Tests

```typescript
// e2e/user-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Journey', () => {
  test('complete video discovery and watching flow', async ({ page }) => {
    // Start at home page
    await page.goto('/');

    // Should see trending videos
    await expect(page.locator('[data-testid="trending-videos"]')).toBeVisible();

    // Search for a video
    await page.fill('[data-testid="search-input"]', 'test video');
    await page.press('[data-testid="search-input"]', 'Enter');

    // Should navigate to search results
    await expect(page).toHaveURL(/\/search\?q=test\+video/);
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();

    // Click on first video result
    await page.click('[data-testid="video-card"]:first-child');

    // Should navigate to watch page
    await expect(page).toHaveURL(/\/watch\//);
    await expect(page.locator('[data-testid="video-player"]')).toBeVisible();

    // Play the video
    await page.click('[data-testid="play-button"]');
    await expect(page.locator('[data-testid="video-player"]')).toHaveAttribute(
      'data-playing',
      'true'
    );

    // Like the video
    await page.click('[data-testid="like-button"]');
    await expect(page.locator('[data-testid="like-button"]')).toHaveClass(
      /liked/
    );

    // Add comment
    await page.fill('[data-testid="comment-input"]', 'Great video!');
    await page.click('[data-testid="submit-comment"]');

    // Should see comment in list
    await expect(page.locator('[data-testid="comment-list"]')).toContainText(
      'Great video!'
    );
  });

  test('user authentication flow', async ({ page }) => {
    await page.goto('/');

    // Click login button
    await page.click('[data-testid="login-button"]');

    // Should show login modal
    await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();

    // Fill login form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="submit-login"]');

    // Should close modal and show user menu
    await expect(page.locator('[data-testid="login-modal"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // Should show user name
    await expect(page.locator('[data-testid="user-name"]')).toContainText(
      'Test User'
    );
  });
});
```

## Performance Testing

### Load Testing

```typescript
// performance/load-test.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('home page loads within performance budget', async ({ page }) => {
    // Start performance monitoring
    await page.coverage.startJSCoverage();
    await page.coverage.startCSSCoverage();

    const startTime = Date.now();
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Performance assertions
    expect(loadTime).toBeLessThan(3000); // 3 seconds

    // Check Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const vitals = {};
          
          entries.forEach(entry => {
            if (entry.name === 'largest-contentful-paint') {
              vitals.lcp = entry.value;
            }
            if (entry.name === 'first-input-delay') {
              vitals.fid = entry.value;
            }
            if (entry.name === 'cumulative-layout-shift') {
              vitals.cls = entry.value;
            }
          });
          
          resolve(vitals);
        }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      });
    });

    // Assert Core Web Vitals
    expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s
    expect(metrics.fid).toBeLessThan(100);  // FID < 100ms
    expect(metrics.cls).toBeLessThan(0.1);  // CLS < 0.1
  });

  test('video list scrolling performance', async ({ page }) => {
    await page.goto('/trending');
    await page.waitForSelector('[data-testid="video-list"]');

    // Measure scroll performance
    const scrollMetrics = await page.evaluate(() => {
      return new Promise(resolve => {
        let frameCount = 0;
        let startTime = performance.now();
        
        const measureFrame = () => {
          frameCount++;
          if (frameCount < 60) {
            requestAnimationFrame(measureFrame);
          } else {
            const endTime = performance.now();
            const fps = 60 / ((endTime - startTime) / 1000);
            resolve({ fps, duration: endTime - startTime });
          }
        };
        
        // Start scrolling
        window.scrollBy(0, 1000);
        requestAnimationFrame(measureFrame);
      });
    });

    // Should maintain 60 FPS during scrolling
    expect(scrollMetrics.fps).toBeGreaterThan(55);
  });
});
```

## Accessibility Testing

### Automated Accessibility Testing

```typescript
// accessibility/a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('home page should not have accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('video player should be keyboard accessible', async ({ page }) => {
    await page.goto('/watch/test-video-id');
    await page.waitForSelector('[data-testid="video-player"]');

    // Tab to video player
    await page.keyboard.press('Tab');
    
    // Should focus on play button
    await expect(page.locator('[data-testid="play-button"]')).toBeFocused();

    // Press space to play
    await page.keyboard.press('Space');
    
    // Should start playing
    await expect(page.locator('[data-testid="video-player"]')).toHaveAttribute(
      'data-playing',
      'true'
    );

    // Tab to volume control
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="volume-button"]')).toBeFocused();

    // Arrow keys should control volume
    await page.keyboard.press('ArrowUp');
    const volume = await page.getAttribute('[data-testid="volume-slider"]', 'value');
    expect(parseInt(volume)).toBeGreaterThan(50);
  });

  test('forms should have proper labels and error messages', async ({ page }) => {
    await page.goto('/login');

    // Check form labels
    await expect(page.locator('label[for="email"]')).toContainText('Email');
    await expect(page.locator('label[for="password"]')).toContainText('Password');

    // Submit empty form
    await page.click('[data-testid="submit-login"]');

    // Should show error messages
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();

    // Error messages should be associated with inputs
    const emailInput = page.locator('#email');
    const emailErrorId = await emailInput.getAttribute('aria-describedby');
    await expect(page.locator(`#${emailErrorId}`)).toBeVisible();
  });
});
```

## Visual Regression Testing

### Screenshot Testing

```typescript
// visual/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('home page visual consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('home-page.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('video card component variations', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=components-videocard--default');
    
    // Default variant
    await expect(page.locator('[data-testid="video-card"]')).toHaveScreenshot(
      'video-card-default.png'
    );
    
    // Compact variant
    await page.goto('/storybook/iframe.html?id=components-videocard--compact');
    await expect(page.locator('[data-testid="video-card"]')).toHaveScreenshot(
      'video-card-compact.png'
    );
    
    // Loading state
    await page.goto('/storybook/iframe.html?id=components-videocard--loading');
    await expect(page.locator('[data-testid="video-card"]')).toHaveScreenshot(
      'video-card-loading.png'
    );
  });

  test('dark mode consistency', async ({ page }) => {
    // Test light mode
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('home-light-mode.png');
    
    // Switch to dark mode
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500); // Wait for theme transition
    await expect(page).toHaveScreenshot('home-dark-mode.png');
  });
});
```

## Testing Tools and Setup

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/test-utils/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
  ],
};
```

### Test Utilities

```tsx
// src/test-utils/setup.ts
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { server } from './mocks/server';

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
```

```tsx
// src/test-utils/render.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from '@/contexts/UserContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  user?: User;
}

const AllTheProviders: React.FC<{
  children: React.ReactNode;
  initialEntries?: string[];
  user?: User;
}> = ({ children, initialEntries = ['/'], user }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <MemoryRouter initialEntries={initialEntries}>
      <QueryClientProvider client={queryClient}>
        <UserProvider initialUser={user}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </UserProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { initialEntries, user, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders initialEntries={initialEntries} user={user}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

export * from '@testing-library/react';
export { customRender as render };
```

## Best Practices

### 1. **Test Organization**

- Group related tests using `describe` blocks
- Use descriptive test names that explain the expected behavior
- Follow the AAA pattern: Arrange, Act, Assert
- Keep tests focused and test one thing at a time

### 2. **Test Data Management**

```tsx
// test-utils/factories.ts
import { faker } from '@faker-js/faker';

export const createMockVideo = (overrides?: Partial<Video>): Video => ({
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  thumbnail: faker.image.url(),
  duration: faker.number.int({ min: 30, max: 3600 }),
  views: faker.number.int({ min: 100, max: 1000000 }),
  publishedAt: faker.date.past().toISOString(),
  channel: {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    avatar: faker.image.avatar(),
  },
  ...overrides,
});

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  avatar: faker.image.avatar(),
  subscribedChannels: [],
  ...overrides,
});
```

### 3. **Async Testing**

```tsx
// ✅ Good async testing
it('loads video data', async () => {
  render(<VideoComponent videoId="123" />);
  
  // Wait for loading to complete
  await waitFor(() => {
    expect(screen.getByText('Video Title')).toBeInTheDocument();
  });
  
  // Assert final state
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});

// ❌ Avoid arbitrary timeouts
it('loads video data', async () => {
  render(<VideoComponent videoId="123" />);
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // Bad!
  
  expect(screen.getByText('Video Title')).toBeInTheDocument();
});
```

### 4. **Error Testing**

```tsx
it('handles network errors gracefully', async () => {
  // Mock API to return error
  server.use(
    rest.get('/api/videos/123', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ error: 'Server error' }));
    })
  );
  
  render(<VideoComponent videoId="123" />);
  
  await waitFor(() => {
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });
  
  // Should show retry button
  expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
});
```

### 5. **Performance Testing**

```tsx
it('renders large lists efficiently', () => {
  const manyVideos = Array.from({ length: 1000 }, () => createMockVideo());
  
  const startTime = performance.now();
  render(<VideoList videos={manyVideos} />);
  const renderTime = performance.now() - startTime;
  
  // Should render within reasonable time
  expect(renderTime).toBeLessThan(100); // 100ms
  
  // Should only render visible items
  expect(screen.getAllByTestId('video-card')).toHaveLength(20); // Virtualized
});
```

## Conclusion

This comprehensive testing strategy ensures high code quality, reliability, and maintainability. By following these practices and implementing the suggested test patterns, you'll build confidence in your application's behavior and catch issues early in the development process.

Remember to:
- Start with unit tests for core functionality
- Add integration tests for component interactions
- Use E2E tests for critical user journeys
- Monitor performance and accessibility
- Keep tests maintainable and focused
- Update tests when requirements change