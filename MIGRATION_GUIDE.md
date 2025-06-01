# Migration Guide: Unified Components

This guide helps you migrate from the legacy components to the new unified component system.

## 🎯 Overview

The refactoring introduces unified components that consolidate functionality and improve consistency:

- **UnifiedButton** - Replaces multiple button components
- **UnifiedVideoCard** - Replaces VideoCard and OptimizedVideoCard
- **UnifiedFormSystem** - Replaces scattered form components

## 🔄 Component Migrations

### Button Components

#### Before (Multiple Components)
```tsx
// components/ui/Button.tsx
import { Button } from '../ui/Button';

// components/ui/ActionButton.tsx
import { ActionButton } from '../ui/ActionButton';

// components/forms/Button.tsx
import { Button } from '../forms/Button';
```

#### After (Unified)
```tsx
// Single import for all button needs
import { UnifiedButton } from '../ui/UnifiedButton';
// or
import { UnifiedButton } from '../components';
```

#### Migration Examples

**Basic Button:**
```tsx
// Before
<Button variant="primary" size="md">
  Click me
</Button>

// After
<UnifiedButton variant="primary" size="md">
  Click me
</UnifiedButton>
```

**Action Button:**
```tsx
// Before
<ActionButton variant="like" size="sm">
  Like
</ActionButton>

// After
<UnifiedButton variant="action" size="sm">
  Like
</UnifiedButton>
```

**Loading Button:**
```tsx
// Before
<Button loading={isLoading} leftIcon={<Icon />}>
  Submit
</Button>

// After
<UnifiedButton loading={isLoading} leftIcon={<Icon />}>
  Submit
</UnifiedButton>
```

### Video Card Components

#### Before (Multiple Components)
```tsx
// Basic video card
import { VideoCard } from '../VideoCard';

// Optimized version
import { OptimizedVideoCard } from '../OptimizedVideoCard';
```

#### After (Unified)
```tsx
// Single import for all video card needs
import { UnifiedVideoCard } from '../UnifiedVideoCard';
// or
import { UnifiedVideoCard } from '../components';
```

#### Migration Examples

**Basic Video Card:**
```tsx
// Before
<VideoCard video={video} />

// After
<UnifiedVideoCard video={video} />
```

**Optimized Video Card:**
```tsx
// Before
<OptimizedVideoCard 
  video={video} 
  autoplay={true}
  showActions={true}
/>

// After
<UnifiedVideoCard 
  video={video} 
  optimized={true}
  autoplay={true}
  showActions={true}
/>
```

**Different Variants:**
```tsx
// Compact layout
<UnifiedVideoCard 
  video={video} 
  variant="compact" 
  size="sm"
/>

// Detailed layout
<UnifiedVideoCard 
  video={video} 
  variant="detailed" 
  showDescription={true}
  showActions={true}
/>

// Grid layout
<UnifiedVideoCard 
  video={video} 
  variant="grid" 
  size="md"
/>
```

### Form Components

#### Before (Scattered Components)
```tsx
// Different imports for different form components
import { Input } from '../forms/Input';
import { Textarea } from '../forms/Textarea';
import { Button } from '../forms/Button';
import { BaseForm } from '../BaseForm';
```

#### After (Unified System)
```tsx
// Single import for entire form system
import {
  UnifiedForm,
  UnifiedInput,
  UnifiedTextarea,
  UnifiedSelect,
  FormProvider,
  useFormContext,
} from '../forms/UnifiedFormSystem';
// or
import {
  UnifiedForm,
  UnifiedInput,
  UnifiedTextarea,
  UnifiedSelect,
} from '../components';
```

#### Migration Examples

**Basic Form:**
```tsx
// Before
<BaseForm onSubmit={handleSubmit}>
  <Input name="email" label="Email" required />
  <Textarea name="message" label="Message" />
  <Button type="submit">Submit</Button>
</BaseForm>

// After
<UnifiedForm 
  onSubmit={handleSubmit}
  validationSchema={{
    email: (value) => !value ? 'Email is required' : undefined,
    message: (value) => !value ? 'Message is required' : undefined,
  }}
>
  <UnifiedInput name="email" label="Email" required />
  <UnifiedTextarea name="message" label="Message" required />
</UnifiedForm>
```

**Advanced Form with Context:**
```tsx
// Before - Manual state management
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});

// After - Automatic state management
<FormProvider 
  initialValues={{ email: '', message: '' }}
  validationSchema={validationSchema}
>
  <UnifiedInput name="email" label="Email" required />
  <UnifiedTextarea name="message" label="Message" required />
  <UnifiedSelect 
    name="category" 
    label="Category"
    options={[
      { value: 'bug', label: 'Bug Report' },
      { value: 'feature', label: 'Feature Request' },
    ]}
  />
</FormProvider>
```

## 📋 Step-by-Step Migration Process

### Phase 1: Install New Components (✅ Complete)
1. ✅ Create `UnifiedButton.tsx`
2. ✅ Create `UnifiedVideoCard.tsx`
3. ✅ Create `UnifiedFormSystem.tsx`
4. ✅ Update export files

### Phase 2: Update Imports
1. **Find and replace button imports:**
   ```bash
   # Find all button imports
   grep -r "from.*Button" src/
   
   # Replace with unified imports
   # Manual replacement recommended for accuracy
   ```

2. **Update video card imports:**
   ```bash
   # Find video card imports
   grep -r "VideoCard\|OptimizedVideoCard" src/
   ```

3. **Update form imports:**
   ```bash
   # Find form component imports
   grep -r "from.*forms" src/
   ```

### Phase 3: Update Component Usage
1. **Update button props:**
   - Change `variant="like"` to `variant="action"`
   - Ensure `loading` prop usage is consistent
   - Update icon prop names if needed

2. **Update video card props:**
   - Add `optimized={true}` for performance features
   - Use new `variant` prop for layout control
   - Update event handler prop names

3. **Update form structure:**
   - Wrap forms with `FormProvider` or `UnifiedForm`
   - Update validation logic
   - Remove manual state management

### Phase 4: Testing
1. **Component testing:**
   ```bash
   npm test -- --testPathPattern=Button
   npm test -- --testPathPattern=VideoCard
   npm test -- --testPathPattern=Form
   ```

2. **Visual testing:**
   - Check all pages with buttons
   - Verify video card layouts
   - Test form functionality

3. **Performance testing:**
   - Measure bundle size changes
   - Check runtime performance
   - Verify lazy loading works

### Phase 5: Cleanup
1. **Remove legacy components:**
   ```bash
   # After confirming everything works
   rm components/ui/Button.tsx
   rm components/ui/ActionButton.tsx
   rm components/forms/Button.tsx
   rm components/VideoCard.tsx
   rm components/OptimizedVideoCard.tsx
   ```

2. **Update documentation:**
   - Update component documentation
   - Update Storybook stories
   - Update README files

## 🎨 New Features Available

### UnifiedButton Features
- **Consistent styling** across all button types
- **Loading states** with built-in spinner
- **Icon support** (left and right)
- **Multiple variants** (primary, secondary, outline, ghost, danger, action, link)
- **Size options** (xs, sm, md, lg)
- **Accessibility** improvements

### UnifiedVideoCard Features
- **Multiple layouts** (default, compact, detailed, grid, list)
- **Performance optimizations** with intersection observer
- **Autoplay support** with hover controls
- **Flexible metadata** display options
- **Action buttons** integration
- **Responsive design** built-in

### UnifiedFormSystem Features
- **Automatic state management** with context
- **Built-in validation** with custom schemas
- **Consistent styling** across all form elements
- **Error handling** with field-level errors
- **Accessibility** with proper labeling
- **TypeScript support** with full type safety

## ⚠️ Breaking Changes

### Button Components
- `variant="like"` → `variant="action"`
- Some size classes may differ slightly
- Icon prop structure may change

### Video Card Components
- Event handler prop names may change
- Some styling classes may differ
- Performance features require `optimized={true}`

### Form Components
- Manual state management no longer needed
- Validation schema format changed
- Error handling approach changed

## 🔧 Troubleshooting

### Common Issues

1. **Import errors:**
   ```tsx
   // Wrong
   import { Button } from '../ui/Button';
   
   // Correct
   import { UnifiedButton } from '../ui/UnifiedButton';
   ```

2. **Missing props:**
   ```tsx
   // If you get prop errors, check the new interface
   // Old props may have been renamed or restructured
   ```

3. **Styling differences:**
   ```tsx
   // Use className prop to override styles if needed
   <UnifiedButton className="custom-styles">
     Button
   </UnifiedButton>
   ```

4. **Form state issues:**
   ```tsx
   // Ensure you're using FormProvider or UnifiedForm
   // for automatic state management
   ```

### Getting Help

1. **Check the component interfaces** in TypeScript files
2. **Review the examples** in this migration guide
3. **Test incrementally** - migrate one component type at a time
4. **Use TypeScript** to catch prop mismatches early

## 📊 Benefits After Migration

### Code Quality
- **50% fewer** component files to maintain
- **Consistent** styling and behavior
- **Better** TypeScript support
- **Improved** accessibility

### Performance
- **Smaller** bundle size
- **Better** tree shaking
- **Optimized** re-renders
- **Lazy loading** support

### Developer Experience
- **Single** import for related functionality
- **Comprehensive** prop interfaces
- **Built-in** state management
- **Better** documentation

---

*This migration guide will be updated as we complete the refactoring process. Please refer to the latest version for the most current information.*