import { useState, useEffect } from 'react';
import type React from 'react';

import {
  CalendarIcon,
  ClockIcon,
  PlayIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

import { liveStreamService } from '../../../services/livestreamAPI';

import type { LiveStream } from '../../../types/livestream';

interface StreamSchedulerProps {
  onStreamScheduled?: (stream: LiveStream) => void;
  className?: string;
}

interface ScheduledStreamForm {
  title: string;
  description: string;
  category: string;
  tags: string[];
  visibility: 'public' | 'unlisted' | 'private';
  scheduledStartTime: string;
  thumbnailUrl: string;
  reminderSet: boolean;
}

const StreamScheduler: React.FC<StreamSchedulerProps> = ({
  onStreamScheduled,
  className = '',
}) => {
  const [scheduledStreams, setScheduledStreams] = useState<LiveStream[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStream, setEditingStream] = useState<string | null>(null);
  const [formData, setFormData] = useState<ScheduledStreamForm>({
    title: '',
    description: '',
    category: 'Gaming',
    tags: [],
    visibility: 'public',
    scheduledStartTime: '',
    thumbnailUrl: '',
    reminderSet: false,
  });
  const [newTag, setNewTag] = useState('');

  const categories = [
    'Gaming', 'Just Chatting', 'Music', 'Art', 'Science & Technology',
    'Sports', 'Travel & Outdoors', 'Food & Cooking', 'Beauty & Fashion',
    'Entertainment', 'Education', 'News & Politics', 'Other',
  ];

  useEffect(() => {
    // Load scheduled streams
    liveStreamService.scheduling.getScheduledStreams().then(setScheduledStreams);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.scheduledStartTime) {
      return;
    }

    try {
      const streamData = {
        ...formData,
        scheduledStartTime: new Date(formData.scheduledStartTime),
        status: 'scheduled' as const,
      };

      // Create a new scheduled stream using the existing createStream method
      const stream = await liveStreamService.streams.createStream(streamData);

      setScheduledStreams(prev => {
        if (editingStream) {
          return prev.map(s => s.id === stream.id ? stream : s);
        }
          return [...prev, stream];

      });

      onStreamScheduled?.(stream);
      resetForm();
    } catch (error) {
      console.error('Failed to schedule stream:', error);
    }
  };

  const handleDeleteStream = async (streamId: string) => {
    if (!confirm('Are you sure you want to delete this scheduled stream?')) {
      return;
    }

    try {
      // For now, just remove from local state
      // In a real implementation, this would call a delete API
      setScheduledStreams(prev => prev.filter(s => s.id !== streamId));
    } catch (error) {
      console.error('Failed to delete stream:', error);
    }
  };

  const handleStartStream = async (streamId: string) => {
    try {
      // Start the scheduled stream
      await liveStreamService.streams.startStream(streamId);
    } catch (error) {
      console.error('Failed to start stream:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Gaming',
      tags: [],
      visibility: 'public',
      scheduledStartTime: '',
      thumbnailUrl: '',
      reminderSet: false,
    });
    setNewTag('');
    setShowCreateForm(false);
    setEditingStream(null);
  };

  const handleEditStream = (stream: LiveStream) => {
    setFormData({
      title: stream.title,
      description: stream.description,
      category: stream.category,
      tags: stream.tags,
      visibility: stream.visibility,
      scheduledStartTime: stream.scheduledStartTime
        ? new Date(stream.scheduledStartTime).toISOString().slice(0, 16)
        : '',
      thumbnailUrl: stream.thumbnailUrl,
      reminderSet: false,
    });
    setEditingStream(stream.id);
    setShowCreateForm(true);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTimeUntilStream = (scheduledTime: Date) => {
    const now = new Date();
    const diff = scheduledTime.getTime() - now.getTime();

    if (diff <= 0) {
return 'Starting now';
}

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
return `${days}d ${hours}h`;
}
    if (hours > 0) {
return `${hours}h ${minutes}m`;
}
    return `${minutes}m`;
  };

  const isStreamStartable = (stream: LiveStream) => {
    if (!stream.scheduledStartTime) {
return false;
}
    const now = new Date();
    const scheduledTime = new Date(stream.scheduledStartTime);
    const diff = scheduledTime.getTime() - now.getTime();
    return diff <= 15 * 60 * 1000; // 15 minutes before
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Stream Scheduler</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {scheduledStreams.length} scheduled
          </span>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <CalendarIcon className="w-4 h-4" />
          <span>{editingStream ? 'Cancel Edit' : 'Schedule Stream'}</span>
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="stream-title" className="block text-sm font-medium text-gray-700 mb-1">
                Stream Title *
              </label>
              <input
                id="stream-title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter stream title..."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="stream-category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="stream-category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="stream-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="stream-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your stream..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label htmlFor="stream-start-time" className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Start Time *
              </label>
              <input
                id="stream-start-time"
                type="datetime-local"
                value={formData.scheduledStartTime}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledStartTime: e.target.value }))}
                min={new Date().toISOString().slice(0, 16)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="stream-visibility" className="block text-sm font-medium text-gray-700 mb-1">
                Visibility
              </label>
              <select
                id="stream-visibility"
                value={formData.visibility}
                onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="stream-tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  id="stream-tags"
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-lg"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-2 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingStream ? 'Update Stream' : 'Schedule Stream'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Scheduled Streams List */}
      <div className="space-y-3">
        {scheduledStreams.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No scheduled streams</p>
            <p className="text-sm mt-1">Schedule your first stream to get started!</p>
          </div>
        ) : (
          scheduledStreams.map((stream) => (
            <div
              key={stream.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-900">{stream.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      stream.visibility === 'public' ? 'bg-green-100 text-green-800' :
                      stream.visibility === 'unlisted' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {stream.visibility}
                    </span>
                  </div>

                  {stream.description && (
                    <p className="text-sm text-gray-600 mb-2">{stream.description}</p>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>
                        {stream.scheduledStartTime && formatDateTime(stream.scheduledStartTime)}
                      </span>
                    </div>
                    <span>•</span>
                    <span>{stream.category}</span>
                    <span>•</span>
                    <span className="font-medium text-blue-600">
                      {stream.scheduledStartTime && getTimeUntilStream(stream.scheduledStartTime)}
                    </span>
                  </div>

                  {stream.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {stream.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {stream.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{stream.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {isStreamStartable(stream) && (
                    <button
                      onClick={() => handleStartStream(stream.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <PlayIcon className="w-4 h-4" />
                      <span>Go Live</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleEditStream(stream)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteStream(stream.id)}
                    className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StreamScheduler;
