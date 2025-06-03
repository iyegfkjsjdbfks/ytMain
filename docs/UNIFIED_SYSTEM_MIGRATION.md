# Unified System Migration Guide

This guide helps you migrate from the old component and utility system to the new unified architecture.

## Overview

The refactoring introduces several unified systems:
- **UnifiedProviders**: Consolidated context providers
- **UnifiedComponents**: Standardized UI components
- **unifiedApiService**: Centralized API management
- **unifiedHooks**: Common React hook patterns
- **unifiedUtils**: Helper functions and utilities
- **unifiedTypes**: Comprehensive type definitions

## Migration Steps

### 1. Provider Migration

**Before:**
```tsx
// Old nested provider structure
<AuthProvider>
  <ThemeProvider>
    <MiniplayerProvider>
      <WatchLaterProvider>
        <App />
      </WatchLaterProvider>
    </MiniplayerProvider>
  </ThemeProvider>
</AuthProvider>
```

**After:**
```tsx
// New unified provider
import { UnifiedProviders } from './providers/UnifiedProviders';

<UnifiedProviders>
  <App />
</UnifiedProviders>
```

### 2. Component Migration

#### Button Components

**Before:**
```tsx
// Multiple button implementations
import { Button } from './components/ui/Button';
import { ActionButton } from './components/ui/ActionButton';
import { UnifiedButton } from './components/ui/UnifiedButton';
```

**After:**
```tsx
// Single unified button
import { Button } from './components/ui/UnifiedComponents';

<Button 
  variant="primary" 
  size="md" 
  loading={isLoading}
  icon={<PlusIcon />}
  onClick={handleClick}
>
  Create Video
</Button>
```

#### Input Components

**Before:**
```tsx
// Separate input and form components
import { Input } from './components/forms/Input';
import { FormField } from './components/forms/FormField';
```

**After:**
```tsx
// Unified input with built-in validation
import { Input } from './components/ui/UnifiedComponents';

<Input
  label="Video Title"
  placeholder="Enter video title"
  error={errors.title}
  helperText="Choose a descriptive title"
  leftIcon={<VideoIcon />}
  fullWidth
/>
```

#### Card Components

**Before:**
```tsx
// Multiple card variations
import { VideoCard } from './components/VideoCard';
import { OptimizedVideoCard } from './components/OptimizedVideoCard';
import { UnifiedVideoCard } from './components/UnifiedVideoCard';
```

**After:**
```tsx
// Single unified card system
import { Card } from './components/ui/UnifiedComponents';

<Card 
  padding="md" 
  shadow="sm" 
  hover
  className="video-card"
>
  {/* Card content */}
</Card>
```

### 3. Hook Migration

#### API Data Fetching

**Before:**
```tsx
// Multiple hook patterns
import { useVideoData } from './hooks/useVideoData';
import { useAsyncData } from './hooks/useAsyncData';
import { useAsyncState } from './hooks/useAsyncState';
```

**After:**
```tsx
// Unified API hook
import { useApi } from './hooks/unifiedHooks';

const { data, loading, error, refetch } = useApi(
  () => apiService.getVideo(videoId),
  {
    immediate: true,
    refreshInterval: 30000,
    onSuccess: (data) => console.log('Video loaded:', data)
  }
);
```

#### Form Management

**Before:**
```tsx
// Custom form state management
const [values, setValues] = useState({});
const [errors, setErrors] = useState({});
const [touched, setTouched] = useState({});
```

**After:**
```tsx
// Unified form hook
import { useForm } from './hooks/unifiedHooks';

const {
  values,
  errors,
  touched,
  isValid,
  setValue,
  handleSubmit
} = useForm({
  initialValues: { title: '', description: '' },
  validationSchema: {
    title: [{ type: 'required', message: 'Title is required' }]
  },
  onSubmit: async (values) => {
    await apiService.createVideo(values);
  }
});
```

### 4. Utility Migration

#### Date Formatting

**Before:**
```tsx
// Scattered utility functions
import { formatTimeAgo } from './utils/dateUtils';
import { parseViewCount } from './utils/numberUtils';
import { truncateText } from './utils/stringUtils';
```

**After:**
```tsx
// Unified utilities
import { utils } from './utils/unifiedUtils';

const timeAgo = utils.date.formatTimeAgo(video.createdAt);
const viewCount = utils.number.formatViewCount(video.views);
const shortTitle = utils.string.truncate(video.title, 50);
```

#### Local Storage

**Before:**
```tsx
// Manual localStorage handling
const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Storage error:', error);
  }
};
```

**After:**
```tsx
// Unified storage utilities
import { storageUtils } from './utils/unifiedUtils';

storageUtils.set('user-preferences', preferences);
const preferences = storageUtils.get('user-preferences', defaultPreferences);
```

### 5. API Service Migration

**Before:**
```tsx
// Multiple API service files
import { getVideos } from './services/videoService';
import { getChannels } from './services/channelService';
import { api } from './services/api';
```

**After:**
```tsx
// Unified API service
import { apiService } from './services/unifiedApiService';

// All API methods in one place
const videos = await apiService.getVideos({ page: 1, limit: 20 });
const channel = await apiService.getChannel(channelId);
const searchResults = await apiService.search(query, filters);
```

### 6. Type System Migration

**Before:**
```tsx
// Scattered type definitions
import { Video } from './types/video';
import { User } from './types/user';
import { ApiResponse } from './types/api';
```

**After:**
```tsx
// Unified type system
import type { Video, User, ApiResponse } from './types/unifiedTypes';

// Or use the namespace
import { Types } from './types/unifiedTypes';
type VideoType = Types.Video;
```

## Component Mapping

| Old Component | New Component | Notes |
|---------------|---------------|-------|
| `Button` | `UnifiedButton` | More variants and states |
| `Input` | `UnifiedInput` | Built-in validation and icons |
| `Modal` | `UnifiedModal` | Standardized sizes and behavior |
| `LoadingSpinner` | `UnifiedLoading` | Multiple loading types |
| `ErrorMessage` | `UnifiedAlert` | Multiple alert types |
| `VideoCard` | Use `Card` + custom content | More flexible |

## Hook Mapping

| Old Hook | New Hook | Notes |
|----------|----------|-------|
| `useVideoData` | `useApi` | More generic and powerful |
| `useAsyncState` | `useAsyncState` | Enhanced with better error handling |
| `useFormState` | `useForm` | Built-in validation |
| `useDebounce` | `useDebounce` | Same API |
| `useLocalStorage` | `useLocalStorage` | Enhanced with better error handling |

## Utility Mapping

| Old Utility | New Utility | Notes |
|-------------|-------------|-------|
| `formatTimeAgo` | `utils.date.formatTimeAgo` | Same API |
| `parseViewCount` | `utils.number.formatViewCount` | Same API |
| `truncateText` | `utils.string.truncate` | Enhanced options |
| `debounce` | `utils.performance.debounce` | Better TypeScript support |

## Breaking Changes

### 1. Provider Structure
- All context providers are now consolidated into `UnifiedProviders`
- Individual provider imports are deprecated

### 2. Component Props
- Some component props have been standardized
- Check the new component interfaces for exact prop names

### 3. Hook Return Values
- `useApi` returns a different structure than old data hooks
- Error handling is now more consistent across hooks

### 4. Utility Function Names
- Some utility functions have been renamed for consistency
- All utilities are now namespaced under `utils`

## Migration Checklist

- [ ] Update provider structure in `App.tsx`
- [ ] Replace old button components with `UnifiedButton`
- [ ] Replace old input components with `UnifiedInput`
- [ ] Update API data fetching to use `useApi`
- [ ] Replace form state management with `useForm`
- [ ] Update utility function imports
- [ ] Update type imports to use unified types
- [ ] Replace old API service calls with `unifiedApiService`
- [ ] Update component styling to use new design tokens
- [ ] Test all migrated components
- [ ] Remove old component files
- [ ] Update documentation

## Best Practices

### 1. Gradual Migration
- Migrate one component/page at a time
- Keep old and new systems running in parallel during transition
- Test thoroughly after each migration step

### 2. Type Safety
- Use the unified type system for better type safety
- Leverage TypeScript's strict mode for better error detection

### 3. Performance
- The unified system includes performance optimizations
- Use `React.memo` and `useMemo` where appropriate
- Leverage the built-in caching in `unifiedApiService`

### 4. Testing
- Update tests to use the new component APIs
- Test error states and loading states
- Verify accessibility improvements

## Troubleshooting

### Common Issues

1. **Import Errors**
   - Ensure you're importing from the correct unified modules
   - Check for typos in import paths

2. **Type Errors**
   - Update to use the unified type system
   - Check for breaking changes in component props

3. **Runtime Errors**
   - Verify provider structure is correct
   - Check for missing dependencies

4. **Styling Issues**
   - Update CSS classes to use new design tokens
   - Check for conflicting styles

### Getting Help

- Check the component documentation in `examples/UnifiedComponentExamples.tsx`
- Review the type definitions in `types/unifiedTypes.ts`
- Look at existing migrated components for reference
- Create issues for any migration problems

## Next Steps

After completing the migration:

1. **Performance Audit**: Run performance tests to verify improvements
2. **Accessibility Audit**: Ensure all components meet accessibility standards
3. **Documentation**: Update component documentation
4. **Training**: Train team members on the new unified system
5. **Monitoring**: Set up monitoring for the new system

This migration will result in:
- Reduced code duplication
- Better type safety
- Improved performance
- More consistent UI/UX
- Easier maintenance
- Better developer experience