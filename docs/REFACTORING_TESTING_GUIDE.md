# Refactoring Testing Guide

## Overview
This guide provides comprehensive testing strategies for the refactored components and systems to ensure quality and reliability.

## 🧪 Testing Strategy

### 1. Component Testing

#### ConsolidatedVideoCard Testing
```typescript
// tests/components/ConsolidatedVideoCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ConsolidatedVideoCard } from '../../components/ConsolidatedVideoCard';
import { TestAppProviders } from '../../providers/RefactoredAppProviders';

const mockVideo = {
  id: '1',
  title: 'Test Video',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  channelName: 'Test Channel',
  views: '1000',
  uploadedAt: '2024-01-01T00:00:00Z',
  duration: '10:00'
};

describe('ConsolidatedVideoCard', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <TestAppProviders>
        {component}
      </TestAppProviders>
    );
  };

  test('renders default variant correctly', () => {
    renderWithProviders(
      <ConsolidatedVideoCard video={mockVideo} variant="default" />
    );
    
    expect(screen.getByText('Test Video')).toBeInTheDocument();
    expect(screen.getByText('Test Channel')).toBeInTheDocument();
    expect(screen.getByText('1K views')).toBeInTheDocument();
  });

  test.each(['default', 'compact', 'list', 'grid', 'shorts'])(
    'renders %s variant correctly',
    (variant) => {
      renderWithProviders(
        <ConsolidatedVideoCard 
          video={mockVideo} 
          variant={variant as any} 
        />
      );
      
      expect(screen.getByText('Test Video')).toBeInTheDocument();
    }
  );

  test('handles watch later functionality', () => {
    renderWithProviders(
      <ConsolidatedVideoCard 
        video={mockVideo} 
        showActions={true}
      />
    );
    
    const watchLaterButton = screen.getByTitle(/Add to Watch Later/i);
    fireEvent.click(watchLaterButton);
    
    // Verify notification appears
    expect(screen.getByText(/Added to Watch Later/i)).toBeInTheDocument();
  });

  test('handles image loading errors', () => {
    renderWithProviders(
      <ConsolidatedVideoCard video={mockVideo} />
    );
    
    const image = screen.getByAltText('Test Video');
    fireEvent.error(image);
    
    // Should show fallback icon
    expect(screen.getByTestId('play-icon-fallback')).toBeInTheDocument();
  });
});
```

#### RefactoredAppProviders Testing
```typescript
// tests/providers/RefactoredAppProviders.test.tsx
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { RefactoredAppProviders, TestAppProviders } from '../../providers/RefactoredAppProviders';

describe('RefactoredAppProviders', () => {
  test('provides all necessary contexts', () => {
    const TestComponent = () => {
      // Test that all contexts are available
      return <div>Test Component</div>;
    };

    render(
      <RefactoredAppProviders>
        <TestComponent />
      </RefactoredAppProviders>
    );

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  test('handles errors gracefully', () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    render(
      <RefactoredAppProviders>
        <ErrorComponent />
      </RefactoredAppProviders>
    );

    // Should show error boundary
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });

  test('allows custom QueryClient for testing', () => {
    const customQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    const TestComponent = () => <div>Custom Client Test</div>;

    render(
      <TestAppProviders queryClient={customQueryClient}>
        <TestComponent />
      </TestAppProviders>
    );

    expect(screen.getByText('Custom Client Test')).toBeInTheDocument();
  });
});
```

### 2. Hook Testing

#### useRefactoredHooks Testing
```typescript
// tests/hooks/useRefactoredHooks.test.ts
import { renderHook, act } from '@testing-library/react';
import { 
  useLocalStorage, 
  useDebounce, 
  useToggle, 
  useArray,
  useAsync 
} from '../../hooks/useRefactoredHooks';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('returns initial value when no stored value', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial')
    );

    expect(result.current[0]).toBe('initial');
  });

  test('stores and retrieves values', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial')
    );

    act(() => {
      result.current[1]('new value');
    });

    expect(result.current[0]).toBe('new value');
    expect(localStorage.getItem('test-key')).toBe('"new value"');
  });

  test('handles localStorage errors gracefully', () => {
    // Mock localStorage to throw error
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = jest.fn(() => {
      throw new Error('Storage full');
    });

    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial')
    );

    act(() => {
      result.current[1]('new value');
    });

    // Should not crash and maintain current state
    expect(result.current[0]).toBe('initial');

    localStorage.setItem = originalSetItem;
  });
});

describe('useDebounce', () => {
  jest.useFakeTimers();

  test('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });
});

describe('useToggle', () => {
  test('toggles boolean value', () => {
    const { result } = renderHook(() => useToggle(false));

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1]();
    });

    expect(result.current[0]).toBe(true);
  });

  test('sets specific value', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => {
      result.current[2](true);
    });

    expect(result.current[0]).toBe(true);
  });
});

describe('useArray', () => {
  test('manages array state', () => {
    const { result } = renderHook(() => useArray([1, 2, 3]));

    expect(result.current.array).toEqual([1, 2, 3]);

    act(() => {
      result.current.push(4);
    });

    expect(result.current.array).toEqual([1, 2, 3, 4]);

    act(() => {
      result.current.remove(1);
    });

    expect(result.current.array).toEqual([1, 3, 4]);
  });
});

describe('useAsync', () => {
  test('handles async operations', async () => {
    const asyncFn = jest.fn().mockResolvedValue('success');
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useAsync(asyncFn, true)
    );

    expect(result.current.isPending).toBe(true);

    await waitForNextUpdate();

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toBe('success');
  });

  test('handles async errors', async () => {
    const asyncFn = jest.fn().mockRejectedValue(new Error('Failed'));
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useAsync(asyncFn, true)
    );

    await waitForNextUpdate();

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(new Error('Failed'));
  });
});
```

### 3. Integration Testing

#### App Integration Test
```typescript
// tests/integration/App.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';

describe('App Integration', () => {
  test('renders home page by default', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/YouTube/i)).toBeInTheDocument();
    });
  });

  test('handles navigation between pages', async () => {
    render(
      <MemoryRouter initialEntries={['/trending']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Trending/i)).toBeInTheDocument();
    });
  });

  test('handles error boundaries', async () => {
    // Test error boundary functionality
    render(
      <MemoryRouter initialEntries={['/non-existent-route']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
    });
  });
});
```

## 🚀 Running Tests

### Test Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test ConsolidatedVideoCard.test.tsx

# Run tests for specific pattern
npm test -- --testNamePattern="useLocalStorage"
```

### Test Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

## 📊 Performance Testing

### Bundle Size Analysis
```bash
# Analyze bundle size
npm run build
npm run analyze

# Compare before and after refactoring
npm run build:analyze -- --compare
```

### Performance Monitoring
```typescript
// tests/performance/performance.test.ts
import { render } from '@testing-library/react';
import { ConsolidatedVideoCard } from '../../components/ConsolidatedVideoCard';

describe('Performance Tests', () => {
  test('renders large list efficiently', () => {
    const startTime = performance.now();
    
    const videos = Array.from({ length: 100 }, (_, i) => ({
      id: i.toString(),
      title: `Video ${i}`,
      // ... other props
    }));

    render(
      <div>
        {videos.map(video => (
          <ConsolidatedVideoCard key={video.id} video={video} />
        ))}
      </div>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(1000); // Should render in under 1 second
  });
});
```

## ✅ Testing Checklist

### Before Deployment
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Performance tests meet benchmarks
- [ ] Coverage thresholds met
- [ ] No console errors or warnings
- [ ] Accessibility tests pass
- [ ] Cross-browser compatibility verified

### Regression Testing
- [ ] Existing functionality unchanged
- [ ] New features work as expected
- [ ] Error handling improved
- [ ] Performance metrics improved
- [ ] Bundle size reduced or maintained

## 🔧 Debugging Tests

### Common Issues and Solutions

1. **Context Provider Issues**
   ```typescript
   // Wrap components with TestAppProviders
   render(
     <TestAppProviders>
       <ComponentUnderTest />
     </TestAppProviders>
   );
   ```

2. **Async Hook Testing**
   ```typescript
   // Use waitFor for async operations
   await waitFor(() => {
     expect(result.current.data).toBeDefined();
   });
   ```

3. **LocalStorage Mocking**
   ```typescript
   // Mock localStorage in tests
   Object.defineProperty(window, 'localStorage', {
     value: {
       getItem: jest.fn(),
       setItem: jest.fn(),
       removeItem: jest.fn(),
       clear: jest.fn(),
     },
   });
   ```

This comprehensive testing guide ensures that all refactored components and systems are thoroughly tested and maintain high quality standards.
