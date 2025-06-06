import * as React from 'react';
import {  useState  } from 'react';
import {
  UnifiedButton,
  UnifiedVideoCard,
  UnifiedForm,
  UnifiedInput,
  UnifiedTextarea,
  UnifiedSelect,
  FormProvider,
} from '../components';
import { Video } from '../types';

// Example data
const sampleVideo: Video = {
  id: 'sample-video-1',
  title: 'Amazing React Tutorial - Learn Hooks in 30 Minutes',
  description: 'A comprehensive guide to React Hooks covering useState, useEffect, useContext, and custom hooks with practical examples.',
  thumbnail: 'https://example.com/thumbnail.jpg',
  duration: 1800, // 30 minutes
  views: 125000,
  publishedAt: new Date('2024-01-15'),
  channelId: 'tech-channel-1',
  channelName: 'TechMaster Pro',
  channelAvatar: 'https://example.com/avatar.jpg',
  videoUrl: 'https://example.com/video.mp4',
};

// Button Examples Component
const ButtonExamples: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleAsyncAction = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold mb-4">UnifiedButton Examples</h2>
      
      {/* Basic Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Button Variants</h3>
        <div className="flex flex-wrap gap-4">
          <UnifiedButton variant="primary">
            Primary
          </UnifiedButton>
          
          <UnifiedButton variant="secondary">
            Secondary
          </UnifiedButton>
          
          <UnifiedButton variant="outline">
            Outline
          </UnifiedButton>
          
          <UnifiedButton variant="ghost">
            Ghost
          </UnifiedButton>
          
          <UnifiedButton variant="danger">
            Danger
          </UnifiedButton>
          
          <UnifiedButton variant="action">
            Action
          </UnifiedButton>
          
          <UnifiedButton variant="link">
            Link
          </UnifiedButton>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Button Sizes</h3>
        <div className="flex items-center gap-4">
          <UnifiedButton size="xs">Extra Small</UnifiedButton>
          <UnifiedButton size="sm">Small</UnifiedButton>
          <UnifiedButton size="md">Medium</UnifiedButton>
          <UnifiedButton size="lg">Large</UnifiedButton>
        </div>
      </div>

      {/* With Icons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Buttons with Icons</h3>
        <div className="flex flex-wrap gap-4">
          <UnifiedButton
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add Item
          </UnifiedButton>
          
          <UnifiedButton
            variant="outline"
            rightIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            }
          >
            Next
          </UnifiedButton>
          
          <UnifiedButton
            variant="action"
            leftIcon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7v13m-3-4h-2m0-4h2m-2-4h2" />
              </svg>
            }
          >
            Like
          </UnifiedButton>
        </div>
      </div>

      {/* Loading States */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Loading States</h3>
        <div className="flex gap-4">
          <UnifiedButton loading={loading} onClick={handleAsyncAction}>
            {loading ? 'Processing...' : 'Start Process'}
          </UnifiedButton>
          
          <UnifiedButton variant="outline" loading={true}>
            Loading...
          </UnifiedButton>
          
          <UnifiedButton 
            variant="action" 
            loading={true}
            leftIcon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            }
          >
            Saving...
          </UnifiedButton>
        </div>
      </div>

      {/* Full Width */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Full Width Button</h3>
        <UnifiedButton fullWidth variant="primary">
          Full Width Button
        </UnifiedButton>
      </div>
    </div>
  );
};

// Video Card Examples Component
const VideoCardExamples: React.FC = () => {
  const handleVideoClick = (video: Video) => {
    console.log('Video clicked:', video.title);
  };

  const handleChannelClick = (channelId: string) => {
    console.log('Channel clicked:', channelId);
  };

  const handleActionClick = (action: string, video: Video) => {
    console.log(`${action} clicked for video:`, video.title);
  };

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold mb-4">UnifiedVideoCard Examples</h2>
      
      {/* Default Variant */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Default Layout</h3>
        <div className="max-w-sm">
          <UnifiedVideoCard
            video={sampleVideo}
            onVideoClick={handleVideoClick}
            onChannelClick={handleChannelClick}
          />
        </div>
      </div>

      {/* Compact Variant */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Compact Layout</h3>
        <div className="max-w-2xl">
          <UnifiedVideoCard
            video={sampleVideo}
            variant="compact"
            size="sm"
            onVideoClick={handleVideoClick}
            onChannelClick={handleChannelClick}
          />
        </div>
      </div>

      {/* Detailed Variant */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Detailed Layout</h3>
        <div className="max-w-md">
          <UnifiedVideoCard
            video={sampleVideo}
            variant="detailed"
            showDescription={true}
            showActions={true}
            onVideoClick={handleVideoClick}
            onChannelClick={handleChannelClick}
            onActionClick={handleActionClick}
          />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Grid Layout</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <UnifiedVideoCard
              key={i}
              video={{
                ...sampleVideo,
                id: `video-${i}`,
                title: `Video ${i}: ${sampleVideo.title}`,
              }}
              variant="grid"
              size="md"
              optimized={true}
              onVideoClick={handleVideoClick}
            />
          ))}
        </div>
      </div>

      {/* List Layout */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">List Layout</h3>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <UnifiedVideoCard
              key={i}
              video={{
                ...sampleVideo,
                id: `video-${i}`,
                title: `Video ${i}: ${sampleVideo.title}`,
              }}
              variant="list"
              size="sm"
              showActions={true}
              onVideoClick={handleVideoClick}
              onChannelClick={handleChannelClick}
              onActionClick={handleActionClick}
            />
          ))}
        </div>
      </div>

      {/* With Autoplay */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">With Autoplay (Hover to Preview)</h3>
        <div className="max-w-sm">
          <UnifiedVideoCard
            video={sampleVideo}
            autoplay={true}
            optimized={true}
            onVideoClick={handleVideoClick}
          />
        </div>
      </div>
    </div>
  );
};

// Form Examples Component
const FormExamples: React.FC = () => {
  const [formData, setFormData] = useState({});

  const validationSchema = {
    email: (value: string) => {
      if (!value) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
      return undefined;
    },
    name: (value: string) => {
      if (!value) return 'Name is required';
      if (value.length < 2) return 'Name must be at least 2 characters';
      return undefined;
    },
    message: (value: string) => {
      if (!value) return 'Message is required';
      if (value.length < 10) return 'Message must be at least 10 characters';
      return undefined;
    },
    category: (value: string) => {
      if (!value) return 'Please select a category';
      return undefined;
    },
  };

  const handleSubmit = async (values: Record<string, any>) => {
    console.log('Form submitted:', values);
    setFormData(values);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Form submitted successfully!');
  };

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold mb-4">UnifiedForm Examples</h2>
      
      {/* Basic Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Contact Form</h3>
        <div className="max-w-md">
          <UnifiedForm
            initialValues={{
              name: '',
              email: '',
              category: '',
              message: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            <UnifiedInput
              name="name"
              label="Full Name"
              placeholder="Enter your full name"
              required
            />
            
            <UnifiedInput
              name="email"
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              required
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />
            
            <UnifiedSelect
              name="category"
              label="Category"
              placeholder="Select a category"
              required
              options={[
                { value: 'general', label: 'General Inquiry' },
                { value: 'support', label: 'Technical Support' },
                { value: 'billing', label: 'Billing Question' },
                { value: 'feature', label: 'Feature Request' },
                { value: 'bug', label: 'Bug Report' },
              ]}
            />
            
            <UnifiedTextarea
              name="message"
              label="Message"
              placeholder="Enter your message here..."
              required
              helpText="Please provide as much detail as possible"
              rows={4}
            />
          </UnifiedForm>
        </div>
      </div>

      {/* Form with Different Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Different Input Variants</h3>
        <div className="max-w-md">
          <FormProvider initialValues={{}}>
            <div className="space-y-4">
              <UnifiedInput
                name="default"
                label="Default Input"
                variant="default"
                placeholder="Default variant"
              />
              
              <UnifiedInput
                name="filled"
                label="Filled Input"
                variant="filled"
                placeholder="Filled variant"
              />
              
              <UnifiedInput
                name="outline"
                label="Outline Input"
                variant="outline"
                placeholder="Outline variant"
              />
              
              <UnifiedTextarea
                name="filled_textarea"
                label="Filled Textarea"
                variant="filled"
                placeholder="Filled textarea variant"
                resize="none"
              />
            </div>
          </FormProvider>
        </div>
      </div>

      {/* Form Data Display */}
      {Object.keys(formData).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Last Submitted Data</h3>
          <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
            <pre className="text-sm">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Examples Component
const UnifiedComponentExamples: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'buttons' | 'videos' | 'forms'>('buttons');

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Unified Component Examples
        </h1>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
            <UnifiedButton
              variant={activeTab === 'buttons' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('buttons')}
            >
              Buttons
            </UnifiedButton>
            
            <UnifiedButton
              variant={activeTab === 'videos' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('videos')}
            >
              Video Cards
            </UnifiedButton>
            
            <UnifiedButton
              variant={activeTab === 'forms' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('forms')}
            >
              Forms
            </UnifiedButton>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg">
          {activeTab === 'buttons' && <ButtonExamples />}
          {activeTab === 'videos' && <VideoCardExamples />}
          {activeTab === 'forms' && <FormExamples />}
        </div>
      </div>
    </div>
  );
};

export default UnifiedComponentExamples;

// Individual component exports for testing
export {
  ButtonExamples,
  VideoCardExamples,
  FormExamples,
};