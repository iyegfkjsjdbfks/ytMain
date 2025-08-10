// TODO: Fix import - import type * as React from 'react';
// TODO: Fix import - import {  useState, useRef, useCallback  } from 'react';

// TODO: Fix import - import { useNavigate } from 'react-router-dom';

import { uploadVideo } from '../services/realVideoService';

import type { VideoUploadData, UploadProgress } from '../types';

const VideoUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [uploadData, setUploadData] = useState<VideoUploadData>({
    title: '',
    description: '',
    category: 'Entertainment',
    tags: [],
    visibility: 'public',
    videoFile: null,
    thumbnailFile: null,
    isShorts: false,
  });

  const [progress, setProgress] = useState<UploadProgress>({
    percentage: 0,
    status: 'idle',
    message: '',
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);

  const categories = [
    'Entertainment', 'Music', 'Gaming', 'Sports', 'News & Politics',
    'Education', 'Science & Technology', 'Comedy', 'Film & Animation',
    'Howto & Style', 'Travel & Events', 'Pets & Animals',
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!uploadData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!uploadData.videoFile) {
      newErrors.videoFile = 'Please select a video file';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (file: File) => {
    const isShorts = file.size < 100 * 1024 * 1024; // Less than 100MB considered Shorts
    setUploadData(prev: any => ({
      ...prev,
      videoFile: file,
      isShorts,
      title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
    }));
    setErrors(prev: any => ({ ...prev: any, videoFile: '' }));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));

    if (videoFile) {
      handleFileSelect(videoFile);
    }
  }, []);

  const handleAddTag = () => {
    if (tagInput.trim() && !uploadData.tags.includes(tagInput.trim())) {
      setUploadData(prev: any => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setUploadData(prev: any => ({
      ...prev,
      tags: prev.tags.filter((tag: any) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
return;
}

    try {
      setProgress({ percentage: 0, status: 'uploading', message: 'Starting upload...' });

      await uploadVideo(uploadData, (progressData) => {
        setProgress(progressData);
      });

      setProgress({ percentage: 100, status: 'completed', message: 'Upload completed successfully!' });

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setProgress({
        percentage: 0,
        status: 'error',
        message: 'Upload failed. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Upload Video
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Video Upload Area */}
            <div className="space-y-2">
              <label htmlFor="video-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Video File *
              </label>

              {!uploadData.videoFile ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-4">
                    <div className="text-4xl text-gray-400">
                      📹
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        Drag and drop your video here
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        or click to browse files
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Select File
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {uploadData.videoFile.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(uploadData.videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        {uploadData.isShorts && (
                          <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            Shorts
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadData(prev: any => ({ ...prev: any, videoFile: null }))}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={(e: Event) => {
                  const file = e.target.files?.[0];
                  if (file) {
handleFileSelect(file);
}
                }}
                className="hidden"
              />

              {errors.videoFile && (
                <p className="text-sm text-red-600">{errors.videoFile}</p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="video-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title *
              </label>
              <input
                type="text"
                value={uploadData.title}
                onChange={(e: Event) => {
                  setUploadData(prev: any => ({ ...prev: any, title: e.target.value }));
                  setErrors(prev: any => ({ ...prev: any, title: '' }));
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter video title"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="video-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={uploadData.description}
                onChange={(e: Event) => setUploadData(prev: any => ({ ...prev: any, description: e: Event.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Tell viewers about your video"
              />
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <label htmlFor="thumbnail-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Thumbnail
              </label>

              {uploadData.thumbnailFile ? (
                <div className="flex items-center space-x-4">
                  <img
                    src={URL.createObjectURL(uploadData.thumbnailFile)}
                    alt="Thumbnail preview"
                    className="w-32 h-18 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setUploadData(prev: any => ({ ...prev: any, thumbnailFile: null }))}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Upload Thumbnail
                </button>
              )}

              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={(e: Event) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadData(prev: any => ({ ...prev: any, thumbnailFile: file }));
                  }
                }}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="video-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <select
                  value={uploadData.category}
                  onChange={(e: Event) => setUploadData(prev: any => ({ ...prev: any, category: e: Event.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <label htmlFor="video-visibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Visibility
                </label>
                <select
                  value={uploadData.visibility}
                  onChange={(e: Event) => setUploadData(prev: any => ({ ...prev: any, visibility: e: Event.target.value as 'public' | 'unlisted' | 'private' }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label htmlFor="video-tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e: Event) => setTagInput(e: Event.target.value)}
                  onKeyPress={(e: Event) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Add
                </button>
              </div>

              {uploadData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {uploadData.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {progress.status !== 'idle' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {progress.message}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {progress.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      progress.status === 'error'
                        ? 'bg-red-600'
                        : progress.status === 'completed'
                        ? 'bg-green-600'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={progress.status === 'uploading' || progress.status === 'processing'}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={progress.status === 'uploading' || progress.status === 'processing'}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {progress.status === 'uploading' || progress.status === 'processing'
                  ? 'Uploading...'
                  : 'Upload Video'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadPage;