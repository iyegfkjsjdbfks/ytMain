# Comprehensive Testing Guide

This guide covers all the testing utilities, best practices, and patterns implemented in this project to ensure high-quality, maintainable code.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Testing Setup](#testing-setup)
3. [Testing Utilities](#testing-utilities)
4. [Component Testing](#component-testing)
5. [Integration Testing](#integration-testing)
6. [Performance Testing](#performance-testing)
7. [Accessibility Testing](#accessibility-testing)
8. [Security Testing](#security-testing)
9. [Best Practices](#best-practices)
10. [Common Patterns](#common-patterns)
11. [Troubleshooting](#troubleshooting)

## Testing Philosophy

Our testing approach follows the testing pyramid:

- **Unit Tests (70%)**: Fast, isolated tests for individual components and functions
- **Integration Tests (20%)**: Tests for component interactions and workflows
- **E2E Tests (10%)**: Full user journey tests using Playwright

### Key Principles

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **Write Tests First**: Use TDD when possible to drive better design
3. **Maintainable Tests**: Tests should be easy to read, understand, and modify
4. **Fast Feedback**: Tests should run quickly to enable rapid development
5. **Comprehensive Coverage**: Aim for high test coverage while focusing on critical paths

## Testing Setup

### Configuration Files

- `tests/setup.ts`: Global test configuration and mocks
- `vitest.config.ts`: Vitest configuration
- `playwright.config.ts`: Playwright E2E test configuration

### Environment Setup

The test environment automatically mocks:

- Browser APIs (localStorage, sessionStorage, IntersectionObserver, etc.)
- Network requests (fetch)
- Performance monitoring
- Security utilities

```typescript
// Example test setup
import { testHelpers } from '../tests/setup';

beforeEach(() => {
  testHelpers.resetMocks();
  testHelpers.mockApiSuccess(mockData);
});
```

## Testing Utilities

### Core Utilities (`utils/testUtils.tsx`)

#### Mock Data Generators

```typescript
// Generate mock data
const mockVideo = testUtils.generateMockVideo({
  title: 'Custom Title',
  viewCount: 1000000
});

const mockChannel = testUtils.generateMockChannel();
const mockUser = testUtils.generateMockUser();
const mockComment = testUtils.generateMockComment();
```

#### API Mocking

```typescript
// Mock successful API responses
testUtils.mockApiSuccess({ data: mockVideo });

// Mock API errors
testUtils.mockApiError(404, 'Not Found');

// Mock paginated responses
testUtils.mockPaginatedResponse(mockVideos, {
  page: 1,
  pageSize: 10,
  total: 100
});
```

#### Custom Render Functions

```typescript
// Render with providers
const { container } = customRender(
  <VideoComponent video={mockVideo} />
);

// Render hooks with context
const { result } = customRenderHook(() => useVideoData(videoId));
```

### Performance Testing (`utils/performanceMonitor.ts`)

```typescript
// Track component performance
const endTracking = TestPerformanceTracker.startTest('ComponentName');
// ... test code ...
endTracking();

// Get performance metrics
const metrics = TestPerformanceTracker.getMetrics('ComponentName');
expect(metrics.renderTime).toBeLessThan(100); // 100ms budget
```

### Accessibility Testing (`utils/accessibilityUtils.tsx`)

```typescript
// Run accessibility audit
const auditResults = await testHelpers.checkAccessibility(container);
expect(auditResults.violations).toHaveLength(0);

// Test keyboard navigation
const { result } = renderHook(() => useKeyboardNavigation());
fireEvent.keyDown(element, { key: 'Tab' });
```

### Security Testing (`utils/securityUtils.ts`)

```typescript
// Test input sanitization
const sanitized = securityUtils.InputValidator.sanitizeHtml(maliciousInput);
expect(sanitized).not.toContain('<script>');

// Test CSRF protection
const token = securityUtils.CSRFProtection.generateToken();
expect(securityUtils.CSRFProtection.validateToken(token)).toBe(true);
```

## Component Testing

### Basic Component Test Structure

```typescript
describe('ComponentName', () => {
  let endPerformanceTracking: () => void;

  beforeEach(() => {
    endPerformanceTracking = TestPerformanceTracker.startTest('ComponentName');
    testHelpers.resetMocks();
  });

  afterEach(() => {
    endPerformanceTracking();
  });

  describe('Rendering', () => {
    it('should render correctly', () => {
      customRender(<ComponentName {...props} />);
      expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should handle user interactions', async () => {
      const onAction = vi.fn();
      customRender(<ComponentName onAction={onAction} />);
      
      await testHelpers.simulateUserInteraction.click(
        screen.getByRole('button')
      );
      
      expect(onAction).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should render within performance budget', () => {
      const startTime = performance.now();
      customRender(<ComponentName />);
      const renderTime = performance.now() - startTime;
      
      expect(renderTime).toBeLessThan(100);
    });
  });

  describe('Accessibility', () => {
    it('should be accessible', async () => {
      const { container } = customRender(<ComponentName />);
      const auditResults = await testHelpers.checkAccessibility(container);
      expect(auditResults.violations).toHaveLength(0);
    });
  });
});
```

### Testing Patterns

#### Testing Loading States

```typescript
it('should show loading state', async () => {
  testUtils.mockApiDelay(1000);
  customRender(<AsyncComponent />);
  
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});
```

#### Testing Error States

```typescript
it('should handle errors gracefully', async () => {
  testUtils.mockApiError(500, 'Server Error');
  customRender(<AsyncComponent />);
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

#### Testing Form Validation

```typescript
it('should validate form inputs', async () => {
  const user = userEvent.setup();
  customRender(<FormComponent />);
  
  const input = screen.getByLabelText('Email');
  await user.type(input, 'invalid-email');
  await user.tab(); // Trigger blur
  
  expect(screen.getByText('Invalid email format')).toBeInTheDocument();
});
```

## Integration Testing

### Testing Component Interactions

```typescript
describe('Video Player Integration', () => {
  it('should handle complete video workflow', async () => {
    const user = userEvent.setup();
    customRender(<VideoPage />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('video-player')).toBeInTheDocument();
    });
    
    // Play video
    await user.click(screen.getByLabelText('Play'));
    
    // Add comment
    await user.type(screen.getByLabelText('Comment'), 'Great video!');
    await user.click(screen.getByText('Submit'));
    
    // Verify comment appears
    await waitFor(() => {
      expect(screen.getByText('Great video!')).toBeInTheDocument();
    });
  });
});
```

### Testing API Integration

```typescript
it('should handle API responses correctly', async () => {
  const mockResponse = { data: mockVideos };
  testUtils.mockApiSuccess(mockResponse);
  
  customRender(<VideoList />);
  
  await waitFor(() => {
    mockVideos.forEach(video => {
      expect(screen.getByText(video.title)).toBeInTheDocument();
    });
  });
  
  expect(fetch).toHaveBeenCalledWith('/api/videos');
});
```

## Performance Testing

### Render Performance

```typescript
it('should render within performance budget', () => {
  const { renderTime } = testUtils.performanceUtils.measureRenderTime(() => {
    customRender(<ExpensiveComponent data={largeDataSet} />);
  });
  
  expect(renderTime).toBeLessThan(100); // 100ms budget
});
```

### Memory Leak Detection

```typescript
it('should not cause memory leaks', async () => {
  const initialMemory = testUtils.performanceUtils.getMemoryUsage();
  
  const { unmount } = customRender(<Component />);
  
  // Simulate component lifecycle
  await testHelpers.waitForTime(100);
  unmount();
  
  const memoryIncrease = testUtils.performanceUtils.checkMemoryLeaks(initialMemory);
  expect(memoryIncrease).toBeLessThan(1024 * 1024); // 1MB threshold
});
```

### Bundle Size Testing

```typescript
// In build tests
it('should meet bundle size requirements', () => {
  const bundleSize = getBundleSize('dist/main.js');
  expect(bundleSize).toBeLessThan(500 * 1024); // 500KB limit
});
```

## Accessibility Testing

### WCAG Compliance

```typescript
it('should meet WCAG 2.1 AA standards', async () => {
  const { container } = customRender(<Component />);
  
  const auditResults = await testHelpers.checkAccessibility(container);
  
  // Check for violations
  expect(auditResults.violations).toHaveLength(0);
  
  // Check color contrast
  const contrastIssues = auditResults.violations.filter(
    v => v.type === 'color-contrast'
  );
  expect(contrastIssues).toHaveLength(0);
});
```

### Keyboard Navigation

```typescript
it('should support keyboard navigation', async () => {
  const user = userEvent.setup();
  customRender(<NavigationComponent />);
  
  // Tab through elements
  await user.tab();
  expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
  
  await user.tab();
  expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();
  
  // Test arrow key navigation
  await user.keyboard('{ArrowDown}');
  expect(screen.getByRole('button', { name: 'Third' })).toHaveFocus();
});
```

### Screen Reader Testing

```typescript
it('should provide proper screen reader support', () => {
  customRender(<Component />);
  
  // Check ARIA labels
  expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
  
  // Check live regions
  expect(screen.getByRole('status')).toBeInTheDocument();
  
  // Check heading hierarchy
  const headings = screen.getAllByRole('heading');
  expect(headings[0]).toHaveAttribute('aria-level', '1');
});
```

## Security Testing

### XSS Prevention

```typescript
it('should prevent XSS attacks', () => {
  const maliciousInput = '<script>alert("XSS")</script><p>Safe content</p>';
  
  customRender(<UserContent content={maliciousInput} />);
  
  // Should not render script tags
  expect(screen.queryByText(/alert/)).not.toBeInTheDocument();
  
  // Should render safe content
  expect(screen.getByText('Safe content')).toBeInTheDocument();
});
```

### Input Validation

```typescript
it('should validate user inputs', () => {
  const validator = securityUtils.InputValidator;
  
  // Test email validation
  expect(validator.isValidEmail('test@example.com')).toBe(true);
  expect(validator.isValidEmail('invalid-email')).toBe(false);
  
  // Test SQL injection prevention
  const sqlInput = "'; DROP TABLE users; --";
  expect(validator.containsSQLInjection(sqlInput)).toBe(true);
});
```

### CSRF Protection

```typescript
it('should include CSRF tokens in requests', async () => {
  const csrfToken = securityUtils.CSRFProtection.generateToken();
  
  customRender(<FormComponent />);
  
  const form = screen.getByRole('form');
  fireEvent.submit(form);
  
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-CSRF-Token': expect.any(String)
        })
      })
    );
  });
});
```

## Best Practices

### 1. Test Organization

```typescript
// ✅ Good: Organized by feature
describe('VideoPlayer', () => {
  describe('Rendering', () => { /* ... */ });
  describe('Playback Controls', () => { /* ... */ });
  describe('Error Handling', () => { /* ... */ });
});

// ❌ Bad: Flat structure
describe('VideoPlayer', () => {
  it('should render');
  it('should play');
  it('should pause');
  it('should handle errors');
});
```

### 2. Descriptive Test Names

```typescript
// ✅ Good: Describes behavior
it('should display error message when video fails to load');

// ❌ Bad: Vague description
it('should handle errors');
```

### 3. Arrange-Act-Assert Pattern

```typescript
it('should increment counter when button is clicked', async () => {
  // Arrange
  const user = userEvent.setup();
  customRender(<Counter initialValue={0} />);
  
  // Act
  await user.click(screen.getByText('Increment'));
  
  // Assert
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

### 4. Mock External Dependencies

```typescript
// ✅ Good: Mock external services
vi.mock('../services/apiService', () => ({
  fetchVideos: vi.fn().mockResolvedValue(mockVideos)
}));

// ❌ Bad: Testing with real API calls
// This makes tests slow and unreliable
```

### 5. Test Edge Cases

```typescript
describe('VideoList', () => {
  it('should handle empty video list');
  it('should handle loading state');
  it('should handle network errors');
  it('should handle malformed data');
  it('should handle very long video titles');
});
```

## Common Patterns

### Testing Custom Hooks

```typescript
import { renderHook, act } from '@testing-library/react';

it('should manage video state correctly', () => {
  const { result } = renderHook(() => useVideoPlayer());
  
  expect(result.current.isPlaying).toBe(false);
  
  act(() => {
    result.current.play();
  });
  
  expect(result.current.isPlaying).toBe(true);
});
```

### Testing Context Providers

```typescript
it('should provide theme context', () => {
  const TestComponent = () => {
    const { theme } = useTheme();
    return <div>{theme}</div>;
  };
  
  customRender(
    <ThemeProvider theme="dark">
      <TestComponent />
    </ThemeProvider>
  );
  
  expect(screen.getByText('dark')).toBeInTheDocument();
});
```

### Testing Error Boundaries

```typescript
it('should catch and display errors', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };
  
  customRender(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );
  
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});
```

## Troubleshooting

### Common Issues

#### 1. Tests Timing Out

```typescript
// ✅ Solution: Use proper async/await
it('should load data', async () => {
  customRender(<AsyncComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  }, { timeout: 5000 });
});
```

#### 2. Memory Leaks in Tests

```typescript
// ✅ Solution: Proper cleanup
afterEach(() => {
  cleanup(); // React Testing Library cleanup
  vi.clearAllMocks();
  vi.clearAllTimers();
});
```

#### 3. Flaky Tests

```typescript
// ✅ Solution: Wait for specific conditions
it('should update UI after API call', async () => {
  customRender(<Component />);
  
  // Wait for specific element instead of arbitrary timeout
  await waitFor(() => {
    expect(screen.getByTestId('loaded-content')).toBeInTheDocument();
  });
});
```

#### 4. Mock Not Working

```typescript
// ✅ Solution: Ensure mock is set up before import
vi.mock('../utils/api', () => ({
  fetchData: vi.fn()
}));

// Import after mock
import { Component } from '../Component';
```

### Debugging Tips

1. **Use `screen.debug()`** to see current DOM state
2. **Use `logRoles(container)`** to see available roles
3. **Use `prettyDOM(element)`** to inspect specific elements
4. **Check console for warnings** about accessibility issues
5. **Use browser dev tools** with `debug()` breakpoints

### Performance Debugging

```typescript
// Enable performance tracking in tests
beforeEach(() => {
  performanceMonitor.init();
});

afterEach(() => {
  const report = performanceMonitor.getReport();
  console.log('Performance Report:', report);
});
```

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test VideoDescription.test.tsx

# Run tests matching pattern
npm test -- --grep "should render"

# Run E2E tests
npm run test:e2e

# Run performance tests
npm run test:performance
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Run Tests
  run: |
    npm run test:coverage
    npm run test:e2e
    npm run test:performance

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

## Conclusion

This testing guide provides a comprehensive foundation for writing high-quality tests. Remember:

- **Start with the user's perspective**: Test what users actually do
- **Keep tests simple and focused**: One concept per test
- **Maintain tests like production code**: Refactor and improve regularly
- **Use the testing pyramid**: More unit tests, fewer E2E tests
- **Test the critical path first**: Focus on the most important user journeys

For questions or improvements to this guide, please refer to the team's testing standards or contribute to the documentation.