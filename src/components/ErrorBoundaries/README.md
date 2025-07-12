# Error Boundaries Implementation

This directory contains specialized error boundaries for different types of components in the YouTube clone application, providing enhanced error handling, recovery mechanisms, and user experience.

## Overview

Error boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of the component tree that crashed.

## Available Error Boundaries

### 1. VideoErrorBoundary
**Purpose**: Handles errors in video playback components

**Features**:
- Retry mechanism for video loading failures
- Reload option for persistent issues
- Video-specific error context
- Development mode error details

**Usage**:
```tsx
import { VideoErrorBoundary } from '@/components/ErrorBoundaries';

<VideoErrorBoundary
  videoId="abc123"
  onRetry={handleRetry}
  onReload={handleReload}
>
  <VideoPlayer videoId="abc123" />
</VideoErrorBoundary>
```

### 2. LiveStreamErrorBoundary
**Purpose**: Handles errors in live streaming components

**Features**:
- Retry mechanism for stream connection failures
- Reconnect option for network issues
- Stream-specific error context
- Live stream status indicators

**Usage**:
```tsx
import { LiveStreamErrorBoundary } from '@/components/ErrorBoundaries';

<LiveStreamErrorBoundary
  streamId="stream123"
  onRetry={handleRetry}
  onReconnect={handleReconnect}
>
  <LiveStreamViewer streamId="stream123" />
</LiveStreamErrorBoundary>
```

### 3. DataFetchErrorBoundary
**Purpose**: Handles errors in data fetching and API operations

**Features**:
- Retry mechanism for failed API calls
- Offline detection and messaging
- Data-type specific error context
- Network status awareness

**Usage**:
```tsx
import { DataFetchErrorBoundary } from '@/components/ErrorBoundaries';

<DataFetchErrorBoundary
  dataType="video metadata"
  onRetry={handleRetry}
  showOfflineMessage={true}
>
  <VideoMetadataComponent />
</DataFetchErrorBoundary>
```

## Protected Components

Pre-wrapped components with appropriate error boundaries:

### Video Components
- `ProtectedYouTubePlayer` - YouTube player with video error boundary
- `ProtectedVideoPlayer` - Custom video player with video error boundary

### Live Stream Components
- `ProtectedLiveStreamViewer` - Live stream viewer with stream error boundary
- `ProtectedStreamAnalyticsDashboard` - Analytics dashboard with data fetch error boundary

### Page Components
- `ProtectedWatchPage` - Watch page with data fetch error boundary
- `ProtectedSearchResultsPage` - Search results with data fetch error boundary

### Usage Example
```tsx
import { ProtectedYouTubePlayer } from '@/components/ErrorBoundaries';

// Instead of:
// <YouTubePlayer video={video} />

// Use:
<ProtectedYouTubePlayer video={video} />
```

## Higher-Order Components (HOCs)

For wrapping existing components with error boundaries:

```tsx
import { withVideoErrorBoundary } from '@/components/ErrorBoundaries';

const ProtectedComponent = withVideoErrorBoundary(MyVideoComponent, {
  videoId: 'abc123',
  onRetry: handleRetry
});
```

## Error Boundary Props

### Common Props
- `children`: React components to wrap
- `onRetry?`: Callback function for retry actions
- `fallbackComponent?`: Custom fallback UI component

### VideoErrorBoundary Props
- `videoId`: Video identifier for context
- `onReload?`: Callback for reload actions

### LiveStreamErrorBoundary Props
- `streamId`: Stream identifier for context
- `onReconnect?`: Callback for reconnection actions

### DataFetchErrorBoundary Props
- `dataType`: Description of data being fetched
- `showOfflineMessage?`: Whether to show offline status

## Best Practices

### 1. Choose the Right Error Boundary
- Use `VideoErrorBoundary` for video playback components
- Use `LiveStreamErrorBoundary` for live streaming features
- Use `DataFetchErrorBoundary` for API calls and data fetching

### 2. Provide Context
- Always provide relevant IDs (videoId, streamId)
- Include descriptive dataType for data fetch boundaries
- Implement meaningful retry/reconnect callbacks

### 3. Error Recovery
```tsx
const handleRetry = useCallback(() => {
  // Clear error state
  setError(null);
  // Refetch data or restart operation
  refetchData();
}, [refetchData]);
```

### 4. Logging Integration
Error boundaries automatically integrate with the application's logging system:
```tsx
// Errors are logged with context
conditionalLogger.error('Video playback error', {
  videoId,
  error: error.message,
  stack: error.stack
});
```

### 5. Development vs Production
- Development: Shows detailed error information
- Production: Shows user-friendly error messages
- Error details are always logged for debugging

## Error Boundary Hierarchy

```
App
├── BaseErrorBoundary (catches all unhandled errors)
│   ├── DataFetchErrorBoundary (API/data errors)
│   │   ├── VideoErrorBoundary (video-specific errors)
│   │   └── LiveStreamErrorBoundary (stream-specific errors)
│   └── Other components
```

## Testing Error Boundaries

```tsx
import { render, screen } from '@testing-library/react';
import { VideoErrorBoundary } from '@/components/ErrorBoundaries';

const ThrowError = () => {
  throw new Error('Test error');
};

test('VideoErrorBoundary catches and displays error', () => {
  render(
    <VideoErrorBoundary videoId="test">
      <ThrowError />
    </VideoErrorBoundary>
  );
  
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  expect(screen.getByText(/retry/i)).toBeInTheDocument();
});
```

## Migration Guide

### From Console Logging to Error Boundaries

**Before**:
```tsx
try {
  await fetchVideoData();
} catch (error) {
  console.error('Failed to fetch video:', error);
  // Manual error handling
}
```

**After**:
```tsx
<DataFetchErrorBoundary 
  dataType="video data"
  onRetry={refetchVideoData}
>
  <VideoComponent />
</DataFetchErrorBoundary>
```

### Wrapping Existing Components

1. **Identify component type** (video, stream, data-fetch)
2. **Choose appropriate error boundary**
3. **Wrap component or use protected version**
4. **Implement retry/recovery logic**
5. **Test error scenarios**

## Performance Considerations

- Error boundaries have minimal performance impact
- Only active during error states
- Logging is conditional based on environment
- Fallback UIs are lightweight

## Troubleshooting

### Common Issues

1. **Error boundary not catching errors**
   - Ensure errors occur in child components
   - Check that errors are thrown during render
   - Verify error boundary is properly wrapped

2. **Retry not working**
   - Implement proper state reset in retry callback
   - Clear error conditions before retry
   - Ensure component re-renders after retry

3. **Missing error context**
   - Provide relevant IDs and descriptions
   - Include error boundary props
   - Check logging configuration

### Debug Mode

Enable detailed error information in development:
```tsx
// Error boundaries automatically detect NODE_ENV
// In development: shows stack traces and component tree
// In production: shows user-friendly messages
```

## Future Enhancements

- [ ] Error reporting integration (Sentry, Bugsnag)
- [ ] User feedback collection on errors
- [ ] Automatic retry with exponential backoff
- [ ] Error analytics and monitoring
- [ ] Custom error boundary themes
- [ ] Internationalization support