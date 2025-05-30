# Testing Guide

This guide covers the comprehensive testing strategy for the YouTube Studio Clone application, including unit tests, integration tests, end-to-end tests, and performance testing.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Testing Stack](#testing-stack)
- [Test Structure](#test-structure)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Performance Testing](#performance-testing)
- [Visual Regression Testing](#visual-regression-testing)
- [API Testing](#api-testing)
- [Accessibility Testing](#accessibility-testing)
- [Security Testing](#security-testing)
- [Test Data Management](#test-data-management)
- [Continuous Integration](#continuous-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Testing Philosophy

### Testing Pyramid

Our testing strategy follows the testing pyramid approach:

```
    /\     E2E Tests (10%)
   /  \    - Critical user journeys
  /____\   - Cross-browser compatibility
 /      \  
/________\ Integration Tests (20%)
          - Component interactions
          - API integrations
          
__________ Unit Tests (70%)
          - Individual functions
          - Component logic
          - Utility functions
```

### Testing Principles

1. **Fast Feedback**: Tests should run quickly to provide immediate feedback
2. **Reliable**: Tests should be deterministic and not flaky
3. **Maintainable**: Tests should be easy to understand and modify
4. **Comprehensive**: Critical paths should have high test coverage
5. **Realistic**: Tests should simulate real user scenarios

## Testing Stack

### Core Testing Tools

- **Test Runner**: Vitest
- **Testing Library**: React Testing Library
- **E2E Testing**: Playwright
- **Mocking**: MSW (Mock Service Worker)
- **Coverage**: c8 (built into Vitest)
- **Visual Testing**: Playwright + Percy
- **Performance**: Lighthouse CI

### Additional Tools

- **Accessibility**: axe-core
- **Security**: npm audit, Snyk
- **API Testing**: Supertest
- **Load Testing**: Artillery
- **Browser Testing**: BrowserStack

## Test Structure

### Directory Structure

```
tests/
├── __mocks__/              # Global mocks
│   ├── fileMock.js
│   └── styleMock.js
├── e2e/                    # End-to-end tests
│   ├── auth.spec.ts
│   ├── video-upload.spec.ts
│   └── video-playback.spec.ts
├── integration/            # Integration tests
│   ├── api/
│   └── components/
├── unit/                   # Unit tests
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── utils/
├── fixtures/               # Test data
│   ├── videos.json
│   └── users.json
├── helpers/                # Test utilities
│   ├── render.tsx
│   └── setup.ts
└── performance/            # Performance tests
    ├── lighthouse/
    └── load-testing/
```

### Naming Conventions

- **Unit Tests**: `ComponentName.test.tsx`
- **Integration Tests**: `feature.integration.test.tsx`
- **E2E Tests**: `feature.spec.ts`
- **Performance Tests**: `feature.perf.test.ts`

## Unit Testing

### Component Testing

#### Basic Component Test

```typescript
// tests/unit/components/VideoCard.test.tsx
import { render, screen } from '@testing-library/react';
import { VideoCard } from '@/components/VideoCard';
import { mockVideo } from '@/tests/fixtures/videos';

describe('VideoCard', () => {
  it('displays video title and duration', () => {
    render(<VideoCard video={mockVideo} />);
    
    expect(screen.getByText(mockVideo.title)).toBeInTheDocument();
    expect(screen.getByText('10:30')).toBeInTheDocument();
  });
  
  it('handles click events', async () => {
    const onPlay = vi.fn();
    const user = userEvent.setup();
    
    render(<VideoCard video={mockVideo} onPlay={onPlay} />);
    
    await user.click(screen.getByRole('button', { name: /play/i }));
    
    expect(onPlay).toHaveBeenCalledWith(mockVideo.id);
  });
  
  it('shows loading state', () => {
    render(<VideoCard video={mockVideo} loading />);
    
    expect(screen.getByTestId('video-card-skeleton')).toBeInTheDocument();
  });
});
```

#### Testing with Context

```typescript
// tests/unit/components/VideoPlayer.test.tsx
import { render, screen } from '@testing-library/react';
import { MiniplayerProvider } from '@/contexts/MiniplayerContext';
import { VideoPlayer } from '@/components/VideoPlayer';

const renderWithContext = (component: React.ReactElement) => {
  return render(
    <MiniplayerProvider>
      {component}
    </MiniplayerProvider>
  );
};

describe('VideoPlayer', () => {
  it('integrates with miniplayer context', () => {
    renderWithContext(<VideoPlayer videoId="abc123" />);
    
    expect(screen.getByRole('button', { name: /minimize/i })).toBeInTheDocument();
  });
});
```

### Hook Testing

```typescript
// tests/unit/hooks/useVideoData.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useVideoData } from '@/hooks/useVideoData';
import { mockVideos } from '@/tests/fixtures/videos';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useVideoData', () => {
  it('fetches videos successfully', async () => {
    const { result } = renderHook(() => useVideoData(), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toEqual(mockVideos);
  });
  
  it('handles errors gracefully', async () => {
    // Mock API error
    vi.mocked(fetch).mockRejectedValueOnce(new Error('API Error'));
    
    const { result } = renderHook(() => useVideoData(), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
```

### Service Testing

```typescript
// tests/unit/services/api.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiService } from '@/services/api';

// Mock fetch
global.fetch = vi.fn();

describe('API Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  describe('getVideos', () => {
    it('fetches videos with correct parameters', async () => {
      const mockResponse = {
        videos: [{ id: '1', title: 'Test Video' }],
        pagination: { page: 1, total: 1 }
      };
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);
      
      const result = await apiService.getVideos({ page: 1, limit: 20 });
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/videos?page=1&limit=20'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      
      expect(result).toEqual(mockResponse);
    });
    
    it('handles API errors', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);
      
      await expect(apiService.getVideos()).rejects.toThrow('API Error: 500');
    });
  });
});
```

### Utility Function Testing

```typescript
// tests/unit/utils/formatters.test.ts
import { formatDuration, formatViewCount, formatDate } from '@/utils/formatters';

describe('Formatters', () => {
  describe('formatDuration', () => {
    it('formats seconds correctly', () => {
      expect(formatDuration(65)).toBe('1:05');
      expect(formatDuration(3661)).toBe('1:01:01');
      expect(formatDuration(30)).toBe('0:30');
    });
    
    it('handles edge cases', () => {
      expect(formatDuration(0)).toBe('0:00');
      expect(formatDuration(-1)).toBe('0:00');
    });
  });
  
  describe('formatViewCount', () => {
    it('formats view counts with appropriate suffixes', () => {
      expect(formatViewCount(999)).toBe('999');
      expect(formatViewCount(1000)).toBe('1K');
      expect(formatViewCount(1500)).toBe('1.5K');
      expect(formatViewCount(1000000)).toBe('1M');
      expect(formatViewCount(1500000)).toBe('1.5M');
    });
  });
});
```

## Integration Testing

### Component Integration

```typescript
// tests/integration/components/VideoUpload.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VideoUploadPage } from '@/pages/VideoUploadPage';
import { server } from '@/tests/mocks/server';
import { rest } from 'msw';

describe('Video Upload Integration', () => {
  it('uploads video successfully', async () => {
    const user = userEvent.setup();
    
    // Mock successful upload
    server.use(
      rest.post('/api/upload', (req, res, ctx) => {
        return res(
          ctx.json({
            uploadId: 'upload_123',
            videoId: 'video_123',
            status: 'processing'
          })
        );
      })
    );
    
    render(<VideoUploadPage />);
    
    // Upload file
    const fileInput = screen.getByLabelText(/select video file/i);
    const file = new File(['video content'], 'test-video.mp4', {
      type: 'video/mp4'
    });
    
    await user.upload(fileInput, file);
    
    // Fill form
    await user.type(screen.getByLabelText(/title/i), 'Test Video Title');
    await user.type(screen.getByLabelText(/description/i), 'Test description');
    
    // Submit
    await user.click(screen.getByRole('button', { name: /upload/i }));
    
    // Verify upload started
    await waitFor(() => {
      expect(screen.getByText(/uploading/i)).toBeInTheDocument();
    });
  });
  
  it('handles upload errors', async () => {
    const user = userEvent.setup();
    
    // Mock upload error
    server.use(
      rest.post('/api/upload', (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({ error: 'File too large' })
        );
      })
    );
    
    render(<VideoUploadPage />);
    
    const fileInput = screen.getByLabelText(/select video file/i);
    const file = new File(['large video'], 'large-video.mp4', {
      type: 'video/mp4'
    });
    
    await user.upload(fileInput, file);
    await user.click(screen.getByRole('button', { name: /upload/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/file too large/i)).toBeInTheDocument();
    });
  });
});
```

### API Integration

```typescript
// tests/integration/api/youtube.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { youtubeService } from '@/services/youtubeService';

const server = setupServer(
  rest.get('https://www.googleapis.com/youtube/v3/videos', (req, res, ctx) => {
    return res(
      ctx.json({
        items: [
          {
            id: 'abc123',
            snippet: {
              title: 'Test Video',
              description: 'Test Description'
            },
            statistics: {
              viewCount: '1000',
              likeCount: '50'
            }
          }
        ]
      })
    );
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('YouTube API Integration', () => {
  it('fetches video data correctly', async () => {
    const video = await youtubeService.getVideo('abc123');
    
    expect(video).toEqual({
      id: 'abc123',
      title: 'Test Video',
      description: 'Test Description',
      viewCount: 1000,
      likeCount: 50
    });
  });
});
```

## End-to-End Testing

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Examples

#### User Authentication Flow

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can sign in with Google', async ({ page }) => {
    await page.goto('/');
    
    // Click sign in button
    await page.click('[data-testid="sign-in-button"]');
    
    // Should redirect to Google OAuth
    await expect(page).toHaveURL(/accounts\.google\.com/);
    
    // Mock successful authentication
    await page.route('**/oauth2/callback', async route => {
      await route.fulfill({
        status: 302,
        headers: {
          'Location': '/?token=mock_token'
        }
      });
    });
    
    // Complete OAuth flow
    await page.goto('/?token=mock_token');
    
    // Verify user is signed in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
  
  test('user can sign out', async ({ page }) => {
    // Set up authenticated state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock_token');
    });
    await page.reload();
    
    // Sign out
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="sign-out-button"]');
    
    // Verify user is signed out
    await expect(page.locator('[data-testid="sign-in-button"]')).toBeVisible();
  });
});
```

#### Video Playback

```typescript
// tests/e2e/video-playback.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Video Playback', () => {
  test('plays video when clicked', async ({ page }) => {
    await page.goto('/watch?v=abc123');
    
    // Wait for video to load
    await page.waitForSelector('video');
    
    // Click play button
    await page.click('[data-testid="play-button"]');
    
    // Verify video is playing
    const video = page.locator('video');
    await expect(video).toHaveAttribute('data-playing', 'true');
    
    // Check video progress
    await page.waitForTimeout(2000);
    const currentTime = await video.evaluate((el: HTMLVideoElement) => el.currentTime);
    expect(currentTime).toBeGreaterThan(0);
  });
  
  test('controls work correctly', async ({ page }) => {
    await page.goto('/watch?v=abc123');
    
    const video = page.locator('video');
    
    // Test volume control
    await page.click('[data-testid="volume-button"]');
    await page.fill('[data-testid="volume-slider"]', '50');
    
    const volume = await video.evaluate((el: HTMLVideoElement) => el.volume);
    expect(volume).toBe(0.5);
    
    // Test fullscreen
    await page.click('[data-testid="fullscreen-button"]');
    await expect(page.locator('.fullscreen')).toBeVisible();
  });
});
```

#### Video Upload Flow

```typescript
// tests/e2e/video-upload.spec.ts
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Video Upload', () => {
  test('uploads video successfully', async ({ page }) => {
    // Navigate to upload page
    await page.goto('/upload');
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/test-video.mp4'));
    
    // Fill metadata
    await page.fill('[data-testid="video-title"]', 'Test Video Upload');
    await page.fill('[data-testid="video-description"]', 'This is a test video');
    
    // Select category
    await page.selectOption('[data-testid="video-category"]', 'Education');
    
    // Set privacy
    await page.click('[data-testid="privacy-public"]');
    
    // Submit upload
    await page.click('[data-testid="upload-button"]');
    
    // Verify upload progress
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
    
    // Wait for upload completion
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({
      timeout: 30000
    });
    
    // Verify video appears in library
    await page.goto('/library');
    await expect(page.locator('text=Test Video Upload')).toBeVisible();
  });
});
```

## Performance Testing

### Lighthouse Testing

```typescript
// tests/performance/lighthouse.test.ts
import { test, expect } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

test.describe('Performance Audits', () => {
  test('homepage meets performance standards', async ({ page }) => {
    await page.goto('/');
    
    const audit = await playAudit({
      page,
      thresholds: {
        performance: 90,
        accessibility: 95,
        'best-practices': 90,
        seo: 90,
      },
    });
    
    expect(audit.lhr.categories.performance.score * 100).toBeGreaterThan(90);
  });
  
  test('video page loads quickly', async ({ page }) => {
    await page.goto('/watch?v=abc123');
    
    // Measure Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics = {};
          
          entries.forEach((entry) => {
            if (entry.name === 'largest-contentful-paint') {
              metrics.lcp = entry.startTime;
            }
            if (entry.name === 'first-input-delay') {
              metrics.fid = entry.processingStart - entry.startTime;
            }
          });
          
          resolve(metrics);
        }).observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
      });
    });
    
    expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s
    expect(metrics.fid).toBeLessThan(100);  // FID < 100ms
  });
});
```

### Load Testing

```yaml
# tests/performance/load-test.yml
config:
  target: 'http://localhost:5173'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 10
  processor: './load-test-processor.js'

scenarios:
  - name: 'Browse videos'
    weight: 70
    flow:
      - get:
          url: '/'
      - think: 2
      - get:
          url: '/api/videos'
      - think: 3
      - get:
          url: '/watch?v={{ $randomString() }}'
  
  - name: 'Search videos'
    weight: 20
    flow:
      - get:
          url: '/'
      - post:
          url: '/api/search'
          json:
            query: '{{ $randomString() }}'
  
  - name: 'Upload video'
    weight: 10
    flow:
      - post:
          url: '/api/upload'
          beforeRequest: 'setAuthToken'
          formData:
            title: 'Test Video {{ $randomString() }}'
            file: '@test-video.mp4'
```

## Visual Regression Testing

### Percy Configuration

```typescript
// tests/visual/visual.spec.ts
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Visual Regression Tests', () => {
  test('homepage visual test', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await percySnapshot(page, 'Homepage');
  });
  
  test('video player visual test', async ({ page }) => {
    await page.goto('/watch?v=abc123');
    await page.waitForSelector('video');
    await percySnapshot(page, 'Video Player');
  });
  
  test('dark mode visual test', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500); // Wait for theme transition
    await percySnapshot(page, 'Homepage Dark Mode');
  });
});
```

## API Testing

### Supertest API Tests

```typescript
// tests/api/videos.api.test.ts
import request from 'supertest';
import { app } from '@/server/app';

describe('Videos API', () => {
  describe('GET /api/videos', () => {
    it('returns paginated videos', async () => {
      const response = await request(app)
        .get('/api/videos')
        .query({ page: 1, limit: 10 })
        .expect(200);
      
      expect(response.body).toHaveProperty('videos');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.videos).toHaveLength(10);
    });
    
    it('validates query parameters', async () => {
      await request(app)
        .get('/api/videos')
        .query({ page: -1 })
        .expect(400);
    });
  });
  
  describe('POST /api/videos', () => {
    it('creates video with valid data', async () => {
      const videoData = {
        title: 'Test Video',
        description: 'Test Description',
        categoryId: '22'
      };
      
      const response = await request(app)
        .post('/api/videos')
        .set('Authorization', 'Bearer valid_token')
        .send(videoData)
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(videoData.title);
    });
    
    it('requires authentication', async () => {
      await request(app)
        .post('/api/videos')
        .send({ title: 'Test' })
        .expect(401);
    });
  });
});
```

## Accessibility Testing

### Axe Integration

```typescript
// tests/accessibility/a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { HomePage } from '@/pages/HomePage';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('homepage has no accessibility violations', async () => {
    const { container } = render(<HomePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('video player is keyboard accessible', async () => {
    const { container } = render(<VideoPlayer videoId="abc123" />);
    
    // Test keyboard navigation
    const playButton = container.querySelector('[data-testid="play-button"]');
    expect(playButton).toHaveAttribute('tabindex', '0');
    expect(playButton).toHaveAttribute('aria-label');
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Playwright Accessibility

```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility E2E', () => {
  test('homepage is accessible', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Test skip links
    await page.keyboard.press('Tab');
    const skipLink = page.locator('[href="#main-content"]');
    if (await skipLink.isVisible()) {
      await page.keyboard.press('Enter');
      await expect(page.locator('#main-content')).toBeFocused();
    }
  });
});
```

## Security Testing

### Security Test Suite

```typescript
// tests/security/security.test.ts
import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {
  test('prevents XSS attacks', async ({ page }) => {
    await page.goto('/search');
    
    const maliciousScript = '<script>alert("XSS")</script>';
    await page.fill('[data-testid="search-input"]', maliciousScript);
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify script is not executed
    const alerts = [];
    page.on('dialog', dialog => {
      alerts.push(dialog.message());
      dialog.dismiss();
    });
    
    await page.waitForTimeout(1000);
    expect(alerts).toHaveLength(0);
    
    // Verify content is escaped
    const searchResults = page.locator('[data-testid="search-results"]');
    await expect(searchResults).toContainText('&lt;script&gt;');
  });
  
  test('validates file uploads', async ({ page }) => {
    await page.goto('/upload');
    
    // Try to upload malicious file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'malicious.exe',
      mimeType: 'application/x-executable',
      buffer: Buffer.from('malicious content')
    });
    
    await expect(page.locator('[data-testid="file-error"]'))
      .toContainText('Invalid file type');
  });
  
  test('enforces rate limiting', async ({ page }) => {
    await page.goto('/');
    
    // Make multiple rapid requests
    const requests = [];
    for (let i = 0; i < 100; i++) {
      requests.push(
        page.request.get('/api/videos')
      );
    }
    
    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter(r => r.status() === 429);
    
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });
});
```

## Test Data Management

### Fixtures

```typescript
// tests/fixtures/videos.ts
export const mockVideo = {
  id: 'abc123',
  title: 'Test Video',
  description: 'This is a test video',
  duration: 630, // 10:30
  viewCount: 1000,
  likeCount: 50,
  publishedAt: '2024-01-15T10:30:00Z',
  thumbnails: {
    default: 'https://example.com/thumb.jpg',
    medium: 'https://example.com/thumb_medium.jpg',
    high: 'https://example.com/thumb_high.jpg'
  },
  channel: {
    id: 'channel123',
    name: 'Test Channel',
    subscriberCount: 10000
  }
};

export const mockVideos = [
  mockVideo,
  {
    ...mockVideo,
    id: 'def456',
    title: 'Another Test Video'
  }
];
```

### MSW Handlers

```typescript
// tests/mocks/handlers.ts
import { rest } from 'msw';
import { mockVideos } from '../fixtures/videos';

export const handlers = [
  rest.get('/api/videos', (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page')) || 1;
    const limit = Number(req.url.searchParams.get('limit')) || 20;
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedVideos = mockVideos.slice(startIndex, endIndex);
    
    return res(
      ctx.json({
        videos: paginatedVideos,
        pagination: {
          page,
          limit,
          total: mockVideos.length,
          pages: Math.ceil(mockVideos.length / limit)
        }
      })
    );
  }),
  
  rest.get('/api/videos/:id', (req, res, ctx) => {
    const { id } = req.params;
    const video = mockVideos.find(v => v.id === id);
    
    if (!video) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Video not found' })
      );
    }
    
    return res(ctx.json(video));
  }),
  
  rest.post('/api/upload', (req, res, ctx) => {
    return res(
      ctx.json({
        uploadId: 'upload_123',
        videoId: 'new_video_123',
        status: 'processing'
      })
    );
  })
];
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
  
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm run test:integration
  
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Build application
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
  
  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Run Lighthouse CI
        run: npm run lighthouse:ci
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

## Best Practices

### Test Organization

1. **Arrange, Act, Assert**: Structure tests clearly
2. **Single Responsibility**: One test per behavior
3. **Descriptive Names**: Test names should explain what they test
4. **Independent Tests**: Tests should not depend on each other
5. **Fast Execution**: Keep tests fast and focused

### Mocking Guidelines

1. **Mock External Dependencies**: API calls, third-party services
2. **Don't Mock What You Don't Own**: Avoid mocking React, DOM APIs
3. **Use Real Data**: Mock with realistic data structures
4. **Reset Mocks**: Clean up mocks between tests
5. **Verify Mock Calls**: Assert that mocks are called correctly

### Coverage Guidelines

1. **Aim for 80%+ Coverage**: But focus on critical paths
2. **Test Edge Cases**: Error conditions, boundary values
3. **Integration Over Unit**: Prefer integration tests for complex flows
4. **Don't Test Implementation**: Test behavior, not internals
5. **Maintain Tests**: Keep tests up-to-date with code changes

### Performance Testing

1. **Baseline Metrics**: Establish performance baselines
2. **Regular Monitoring**: Run performance tests in CI
3. **Real-World Scenarios**: Test with realistic data and conditions
4. **Mobile Testing**: Include mobile performance testing
5. **Core Web Vitals**: Focus on LCP, FID, CLS metrics

## Troubleshooting

### Common Issues

#### Flaky Tests

```typescript
// Bad: Race condition
test('loads data', async () => {
  render(<Component />);
  expect(screen.getByText('Data')).toBeInTheDocument(); // May fail
});

// Good: Wait for data
test('loads data', async () => {
  render(<Component />);
  await waitFor(() => {
    expect(screen.getByText('Data')).toBeInTheDocument();
  });
});
```

#### Memory Leaks

```typescript
// Bad: Doesn't cleanup
test('component with timer', () => {
  render(<ComponentWithTimer />);
  // Timer keeps running
});

// Good: Cleanup after test
test('component with timer', () => {
  const { unmount } = render(<ComponentWithTimer />);
  // Test logic
  unmount(); // Cleanup
});
```

#### Slow Tests

```typescript
// Bad: Unnecessary waiting
test('button click', async () => {
  render(<Button />);
  await page.waitForTimeout(5000); // Arbitrary wait
  await user.click(screen.getByRole('button'));
});

// Good: Wait for specific condition
test('button click', async () => {
  render(<Button />);
  const button = await screen.findByRole('button');
  await user.click(button);
});
```

### Debugging Tests

#### Debug Mode

```bash
# Run tests in debug mode
npm run test:debug

# Run specific test file
npm run test -- VideoCard.test.tsx

# Run tests with coverage
npm run test:coverage
```

#### Browser Debugging

```typescript
// Add debug points in Playwright
test('debug test', async ({ page }) => {
  await page.goto('/');
  await page.pause(); // Opens browser debugger
  // Continue with test
});
```

#### Console Debugging

```typescript
// Debug React Testing Library
import { screen, debug } from '@testing-library/react';

test('debug component', () => {
  render(<Component />);
  screen.debug(); // Prints DOM to console
});
```

### Test Environment Issues

#### Environment Variables

```typescript
// tests/setup.ts
import { vi } from 'vitest';

// Mock environment variables
vi.mock('process', () => ({
  env: {
    VITE_API_BASE_URL: 'http://localhost:3000',
    VITE_YOUTUBE_API_KEY: 'test_key'
  }
}));
```

#### DOM Cleanup

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
});

// tests/setup.ts
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

This comprehensive testing guide provides the foundation for maintaining high-quality code through thorough testing practices. Regular testing ensures the YouTube Studio Clone remains reliable, performant, and user-friendly.