import * as React from 'react';
import {  useState  } from 'react';
import {
  UnifiedButton,
  UnifiedInput,
  UnifiedCard,
  UnifiedAlert,
  UnifiedLoading,
  UnifiedModal
} from '../components/ui/UnifiedComponents';
import { useApi, useForm, useToggle, useDebounce } from '../hooks/unifiedHooks';
import { apiService } from '../services/unifiedApiService';
import { utils } from '../utils/unifiedUtils';
import type { Video, User } from '../types/unifiedTypes';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ShareIcon,
  PlayIcon,
  UserIcon
} from '@heroicons/react/24/outline';

/**
 * Comprehensive examples of the unified system components and utilities
 */
export const UnifiedSystemExamples: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, toggleModal] = useToggle(false);
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Example: Using unified API hook
  const {
    data: videos,
    loading: videosLoading,
    error: videosError,
    refetch: refetchVideos
  } = useApi<Video[]>(
    () => apiService.getVideos({ page: 1, limit: 10 }),
    { immediate: true }
  );

  // Example: Using unified form hook
  const {
    values,
    errors,
    touched,
    isValid,
    setValue,
    handleSubmit
  } = useForm({
    initialValues: {
      title: '',
      description: '',
      email: '',
      category: ''
    },
    validationSchema: {
      title: [
        { type: 'required', message: 'Title is required' },
        { type: 'minLength', value: 3, message: 'Title must be at least 3 characters' }
      ],
      email: [
        { type: 'required', message: 'Email is required' },
        { type: 'email', message: 'Please enter a valid email' }
      ]
    },
    onSubmit: async (formValues) => {
      console.log('Form submitted:', formValues);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  });

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Unified System Examples
      </h1>

      {/* Button Examples */}
      <UnifiedCard title="Button Examples">
        <h2 className="text-xl font-semibold mb-4">Unified Buttons</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <UnifiedButton variant="primary" size="sm">
              Primary Small
            </UnifiedButton>
            <UnifiedButton variant="secondary" size="md">
              Secondary Medium
            </UnifiedButton>
            <UnifiedButton variant="ghost" size="lg">
              Ghost Large
            </UnifiedButton>
            <UnifiedButton variant="danger">
              Danger
            </UnifiedButton>
            <UnifiedButton variant="success">
              Success
            </UnifiedButton>
          </div>

          <div className="flex flex-wrap gap-4">
            <UnifiedButton
              variant="primary"
              icon={<PlusIcon className="w-4 h-4" />}
              iconPosition="left"
            >
              With Left Icon
            </UnifiedButton>
            <UnifiedButton
              variant="secondary"
              icon={<ShareIcon className="w-4 h-4" />}
              iconPosition="right"
            >
              With Right Icon
            </UnifiedButton>
            <UnifiedButton variant="primary" loading>
              Loading Button
            </UnifiedButton>
            <UnifiedButton variant="ghost" disabled>
              Disabled Button
            </UnifiedButton>
          </div>

          <UnifiedButton variant="primary" fullWidth>
            Full Width Button
          </UnifiedButton>
        </div>
      </UnifiedCard>

      {/* Input Examples */}
      <UnifiedCard title="Input Examples">
        <h2 className="text-xl font-semibold mb-4">Unified Inputs</h2>
        <div className="space-y-4 max-w-md">
          <UnifiedInput
            label="Basic Input"
            placeholder="Enter some text"
            value={values.title}
            onChange={(e) => setValue('title', e.target.value)}
            error={touched.title ? errors.title : undefined}
          />

          <UnifiedInput
            label="Email Input"
            type="email"
            placeholder="Enter your email"
            value={values.email}
            onChange={(e) => setValue('email', e.target.value)}
            error={touched.email ? errors.email : undefined}
            helperText="We'll never share your email"
          />

          <UnifiedInput
            label="Search Input"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
          />

          <UnifiedInput
            label="Input with Right Icon"
            placeholder="Username"
            rightIcon={<UserIcon className="w-4 h-4" />}
          />

          <UnifiedInput
            label="Input with Error"
            placeholder="This has an error"
            error="This field is required"
          />
        </div>
      </UnifiedCard>

      {/* Card Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UnifiedCard padding="sm" shadow="sm">
          <h3 className="font-semibold mb-2">Small Card</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This is a small card with minimal padding and shadow.
          </p>
        </UnifiedCard>

        <UnifiedCard padding="md" shadow="md" hover>
          <h3 className="font-semibold mb-2">Medium Card with Hover</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This card has hover effects and medium styling.
          </p>
        </UnifiedCard>

        <UnifiedCard padding="lg" shadow="lg" border={false}>
          <h3 className="font-semibold mb-2">Large Card No Border</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This card has no border and large padding.
          </p>
        </UnifiedCard>
      </div>

      {/* Alert Examples */}
      <UnifiedCard title="Alert Examples">
        <h2 className="text-xl font-semibold mb-4">Unified Alerts</h2>
        <div className="space-y-4">
          <UnifiedAlert type="info" title="Information">
            This is an informational alert with additional context.
          </UnifiedAlert>

          <UnifiedAlert type="success" title="Success!">
            Your video has been uploaded successfully.
          </UnifiedAlert>

          <UnifiedAlert type="warning" title="Warning">
            Your storage is almost full. Consider upgrading your plan.
          </UnifiedAlert>

          <UnifiedAlert 
            type="error" 
            title="Error" 
            dismissible 
            onDismiss={() => console.log('Alert dismissed')}
          >
            Failed to upload video. Please try again.
          </UnifiedAlert>

          <UnifiedAlert type="info">
            Alert without title - just the message content.
          </UnifiedAlert>
        </div>
      </UnifiedCard>

      {/* Loading Examples */}
      <UnifiedCard title="Loading Examples">
        <h2 className="text-xl font-semibold mb-4">Unified Loading States</h2>
        <div className="space-y-6">
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <UnifiedLoading type="spinner" size="sm" />
              <p className="text-xs mt-2">Small Spinner</p>
            </div>
            <div className="text-center">
              <UnifiedLoading type="spinner" size="md" />
              <p className="text-xs mt-2">Medium Spinner</p>
            </div>
            <div className="text-center">
              <UnifiedLoading type="spinner" size="lg" />
              <p className="text-xs mt-2">Large Spinner</p>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <div className="text-center">
              <UnifiedLoading type="dots" size="sm" />
              <p className="text-xs mt-2">Small Dots</p>
            </div>
            <div className="text-center">
              <UnifiedLoading type="dots" size="md" />
              <p className="text-xs mt-2">Medium Dots</p>
            </div>
            <div className="text-center">
              <UnifiedLoading type="dots" size="lg" />
              <p className="text-xs mt-2">Large Dots</p>
            </div>
          </div>

          <div className="space-y-2">
            <UnifiedLoading type="pulse" size="sm" className="w-full h-4" />
            <UnifiedLoading type="pulse" size="md" className="w-3/4 h-4" />
            <UnifiedLoading type="pulse" size="lg" className="w-1/2 h-4" />
          </div>

          <UnifiedLoading type="spinner" text="Loading videos..." />
        </div>
      </UnifiedCard>

      {/* Modal Example */}
      <UnifiedCard title="Modal Example">
        <h2 className="text-xl font-semibold mb-4">Unified Modal</h2>
        <UnifiedButton onClick={toggleModal}>
          Open Modal
        </UnifiedButton>

        <UnifiedModal
          isOpen={isModalOpen}
          onClose={toggleModal}
          title="Example Modal"
          size="md"
        >
          <div className="space-y-4">
            <p>This is an example modal with the unified modal component.</p>
            <UnifiedInput
              label="Modal Input"
              placeholder="Enter something..."
            />
            <div className="flex justify-end space-x-2">
              <UnifiedButton variant="ghost" onClick={toggleModal}>
                Cancel
              </UnifiedButton>
              <UnifiedButton variant="primary">
                Save
              </UnifiedButton>
            </div>
          </div>
        </UnifiedModal>
      </UnifiedCard>

      {/* Form Example */}
      <UnifiedCard title="Form Example">
        <h2 className="text-xl font-semibold mb-4">Unified Form</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <UnifiedInput
            label="Video Title"
            placeholder="Enter video title"
            value={values.title}
            onChange={(e) => setValue('title', e.target.value)}
            error={touched.title ? errors.title : undefined}
          />

          <UnifiedInput
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={values.email}
            onChange={(e) => setValue('email', e.target.value)}
            error={touched.email ? errors.email : undefined}
          />

          <div className="flex space-x-2">
            <UnifiedButton type="submit" disabled={!isValid}>
              Submit Form
            </UnifiedButton>
            <UnifiedButton type="button" variant="ghost" onClick={() => window.location.reload()}>
              Reset
            </UnifiedButton>
          </div>
        </form>
      </UnifiedCard>

      {/* API Data Example */}
      <UnifiedCard title="API Data Example">
        <h2 className="text-xl font-semibold mb-4">Unified API Hook</h2>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <UnifiedButton onClick={refetchVideos} disabled={videosLoading}>
              Refresh Videos
            </UnifiedButton>
          </div>

          {videosLoading && (
            <UnifiedLoading type="spinner" text="Loading videos..." />
          )}

          {videosError && (
            <UnifiedAlert type="error" title="Error">
              {videosError}
            </UnifiedAlert>
          )}

          {videos && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.slice(0, 4).map((video) => (
                <UnifiedCard key={video.id} hover padding="sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                      <PlayIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{video.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {utils.number.formatViewCount(video.views)} views • {utils.date.formatTimeAgo(video.createdAt)}
                      </p>
                    </div>
                  </div>
                </UnifiedCard>
              ))}
            </div>
          )}
        </div>
      </UnifiedCard>

      {/* Utility Examples */}
      <UnifiedCard title="Utility Examples">
        <h2 className="text-xl font-semibold mb-4">Unified Utilities</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Date Utilities</h3>
              <div className="space-y-1 text-sm">
                <p>Time ago: {utils.date.formatTimeAgo(new Date(Date.now() - 3600000))}</p>
                <p>Duration: {utils.date.formatDuration(3665)}</p>
                <p>Short date: {utils.date.formatDate(new Date(), 'short')}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Number Utilities</h3>
              <div className="space-y-1 text-sm">
                <p>View count: {utils.number.formatViewCount(1234567)}</p>
                <p>File size: {utils.number.formatFileSize(1024 * 1024 * 5.5)}</p>
                <p>Percentage: {utils.number.formatPercentage(75, 100)}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">String Utilities</h3>
              <div className="space-y-1 text-sm">
                <p>Truncated: {utils.string.truncate('This is a very long title that should be truncated', 30)}</p>
                <p>Capitalized: {utils.string.capitalize('hello world')}</p>
                <p>Slugified: {utils.string.slugify('Hello World! This is a Test')}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Validation Utilities</h3>
              <div className="space-y-1 text-sm">
                <p>Valid email: {utils.validation.isEmail('test@example.com') ? '✅' : '❌'}</p>
                <p>Valid URL: {utils.validation.isUrl('https://example.com') ? '✅' : '❌'}</p>
                <p>Strong password: {utils.validation.isStrongPassword('Password123!').isValid ? '✅' : '❌'}</p>
              </div>
            </div>
          </div>
        </div>
      </UnifiedCard>

      {/* Performance Examples */}
      <UnifiedCard title="Performance Examples">
        <h2 className="text-xl font-semibold mb-4">Performance Utilities</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Debounced Search</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Search query: "{searchQuery}" → Debounced: "{debouncedQuery}"
            </p>
            <UnifiedInput
              placeholder="Type to see debouncing in action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <h3 className="font-medium mb-2">Array Utilities</h3>
            <div className="text-sm space-y-1">
              <p>Shuffled array: {JSON.stringify(utils.array.shuffle([1, 2, 3, 4, 5]))}</p>
              <p>Chunked array: {JSON.stringify(utils.array.chunk([1, 2, 3, 4, 5, 6, 7, 8], 3))}</p>
            </div>
          </div>
        </div>
      </UnifiedCard>
    </div>
  );
};

export default UnifiedSystemExamples;