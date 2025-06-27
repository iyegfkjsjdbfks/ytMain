import type React from 'react';
import { useState, useRef, useCallback } from 'react';

import {
  CloudArrowUpIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PhotoIcon,
  VideoCameraIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

export interface VideoUploadData {
  title: string;
  description: string;
  tags: string[];
  category: string;
  thumbnail?: File | null;
  customThumbnail?: string | null;
  visibility: 'public' | 'unlisted' | 'private' | 'scheduled';
  scheduledDate?: string;
  monetization: boolean;
  ageRestriction: boolean;
  commentsEnabled: boolean;
  likesVisible: boolean;
  language: string;
  captions?: File[];
}

interface EnhancedVideoUploadProps {
  onUpload: (file: File, data: VideoUploadData) => Promise<void>;
  onCancel?: () => void;
  maxSizeGB?: number;
  allowedFormats?: string[];
  className?: string;
}

const EnhancedVideoUpload: React.FC<EnhancedVideoUploadProps> = ({
  onUpload,
  onCancel,
  maxSizeGB = 2,
  allowedFormats = ['video/mp4', 'video/webm', 'video/mov', 'video/avi'],
  className = '',
}) => {
  const [step, setStep] = useState<'upload' | 'details' | 'processing'>('upload');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const [uploadData, setUploadData] = useState<VideoUploadData>({
    title: '',
    description: '',
    tags: [],
    category: '',
    visibility: 'public',
    monetization: false,
    ageRestriction: false,
    commentsEnabled: true,
    likesVisible: true,
    language: 'en',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Education', 'Entertainment', 'Gaming', 'Music', 'News & Politics',
    'Science & Technology', 'Sports', 'Travel & Events', 'People & Blogs',
    'Comedy', 'Film & Animation', 'Autos & Vehicles', 'Pets & Animals',
  ];


  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => allowedFormats.includes(file.type));

    if (videoFile) {
      handleFileSelect(videoFile);
    }
  }, [allowedFormats]);

  const handleFileSelect = (file: File) => {
    // Validate file size
    const maxSizeBytes = maxSizeGB * 1024 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert(`File size must be less than ${maxSizeGB}GB`);
      return;
    }

    // Validate file type
    if (!allowedFormats.includes(file.type)) {
      alert('Please select a valid video file');
      return;
    }

    setVideoFile(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);

    // Auto-generate title from filename
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    setUploadData(prev => ({
      ...prev,
      title: prev.title || fileName,
    }));

    setStep('details');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith('image/')) {
      setUploadData(prev => ({
        ...prev,
        thumbnail: file,
        customThumbnail: URL.createObjectURL(file),
      }));
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !uploadData.tags.includes(tag.trim())) {
      setUploadData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()],
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setUploadData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async () => {
    if (!videoFile) {
return;
}

    setStep('processing');
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      await onUpload(videoFile, uploadData);

      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload failed:', error);
      setStep('details');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
return '0 Bytes';
}
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`;
  };

  const getVideoDuration = (): string => {
    if (!videoRef.current) {
return '0:00';
}
    const { duration } = videoRef.current;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (step === 'upload') {
    return (
      <div className={`max-w-4xl mx-auto p-6 ${className}`}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Upload Video
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your content with the world
          </p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <CloudArrowUpIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Drag and drop video files to upload
          </h3>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your videos will be private until you publish them.
          </p>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            SELECT FILES
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept={allowedFormats.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p>Maximum file size: {maxSizeGB}GB</p>
            <p>Supported formats: MP4, WebM, MOV, AVI</p>
          </div>
        </div>

        {onCancel && (
          <div className="mt-6 text-center">
            <button
              onClick={onCancel}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className={`max-w-4xl mx-auto p-6 ${className}`}>
        <div className="text-center">
          <div className="mb-8">
            <VideoCameraIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Processing your video
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we process and upload your video
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {uploadProgress.toFixed(0)}% complete
            </p>
          </div>

          {uploadProgress === 100 && (
            <div className="mt-8">
              <div className="text-green-600 dark:text-green-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Upload Complete!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your video has been successfully uploaded and is being processed.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Details step
  return (
    <div className={`max-w-6xl mx-auto p-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Preview
            </h3>

            {videoPreview && (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={videoPreview}
                  className="w-full aspect-video"
                  controls={false}
                  muted={isMuted}
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                    }
                  }}
                />

                {/* Custom Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            if (isPlaying) {
                              videoRef.current.pause();
                            } else {
                              videoRef.current.play();
                            }
                            setIsPlaying(!isPlaying);
                          }
                        }}
                        className="p-1 hover:bg-white/20 rounded"
                      >
                        {isPlaying ? (
                          <PauseIcon className="w-5 h-5" />
                        ) : (
                          <PlayIcon className="w-5 h-5" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setIsMuted(!isMuted);
                          if (videoRef.current) {
                            videoRef.current.muted = !isMuted;
                          }
                        }}
                        className="p-1 hover:bg-white/20 rounded"
                      >
                        {isMuted ? (
                          <SpeakerXMarkIcon className="w-5 h-5" />
                        ) : (
                          <SpeakerWaveIcon className="w-5 h-5" />
                        )}
                      </button>

                      <span className="text-sm">
                        {getVideoDuration()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* File Info */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                File Details
              </h4>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p><span className="font-medium">Name:</span> {videoFile?.name}</p>
                <p><span className="font-medium">Size:</span> {videoFile ? formatFileSize(videoFile.size) : 'N/A'}</p>
                <p><span className="font-medium">Type:</span> {videoFile?.type}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Video Details
              </h2>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="video-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                id="video-title"
                type="text"
                value={uploadData.title}
                onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Add a title that describes your video"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {uploadData.title.length}/100 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="video-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="video-description"
                value={uploadData.description}
                onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Tell viewers about your video"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={5000}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {uploadData.description.length}/5000 characters
              </p>
            </div>

            {/* Thumbnail */}
            <div>
              <label htmlFor="thumbnail-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Thumbnail
              </label>
              <div className="flex items-center space-x-4">
                {uploadData.customThumbnail ? (
                  <div className="relative">
                    <img
                      src={uploadData.customThumbnail}
                      alt="Custom thumbnail"
                      className="w-32 h-18 object-cover rounded border"
                    />
                    <button
                      onClick={() => setUploadData(prev => ({
                        ...prev,
                        thumbnail: null,
                        customThumbnail: null,
                      }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-18 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">
                    <PhotoIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}

                <button
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Upload thumbnail
                </button>

                <input
                  id="thumbnail-upload"
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Upload a custom thumbnail (1280x720 recommended)
              </p>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="video-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                id="video-category"
                value={uploadData.category}
                onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="video-tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="space-y-2">
                <input
                  id="video-tags"
                  type="text"
                  placeholder="Add tags to help people find your video"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const target = e.target as HTMLInputElement;
                      addTag(target.value);
                      target.value = '';
                    }
                  }}
                />

                {uploadData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {uploadData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        <TagIcon className="w-3 h-3 mr-1" />
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Press Enter to add tags. Tags help viewers find your video.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setStep('upload')}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Back
              </button>

              <div className="space-x-3">
                <button
                  onClick={() => setUploadData(prev => ({ ...prev, visibility: 'private' }))}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Save as Draft
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!uploadData.title.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVideoUpload;
