/// <reference types="react/jsx-runtime" />
import React, { useState } from 'react';
import { logger } from '../../../utils/logger';
import {
  usePlaylists,
  useCreatePlaylist,
  useDeletePlaylist,
} from '../hooks/usePlaylists';
import type { CreatePlaylistData } from '../services/playlistService';
import type { Playlist } from '../../../types/core';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PlayIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  ListBulletIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

interface PlaylistManagerProps {
  className?: string;
}

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'public' as 'public' | 'unlisted' | 'private',
    tags: [] as string,
  });
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return;
    }

    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      visibility: 'public',
      tags: [],
    });
    setTagInput('');
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: any) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((tag: any) => tag !== tagToRemove),
    }));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
          Create New Playlist
        </h3>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <div className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Title *
            </div>
            <input
              type='text'
              value={formData.title}
              onChange={e =>
                setFormData(prev => ({ ...prev, title: e.target.value }))
              }
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              placeholder='Enter playlist title...'
              required
            />
          </div>

          <div>
            <div className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Description
            </div>
            <textarea
              value={formData.description}
              onChange={e =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              rows={3}
              placeholder='Enter playlist description...'
            />
          </div>

          <div>
            <div className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Visibility
            </div>
            <select
              value={formData.visibility}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  visibility: e.target.value as any,
                }))
              }
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            >
              <option value='public'>Public</option>
              <option value='unlisted'>Unlisted</option>
              <option value='private'>Private</option>
            </select>
          </div>

          <div>
            <div className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Tags
            </div>
            <div className='flex gap-2 mb-2'>
              <input
                type='text'
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={e =>
                  e.key === 'Enter' && (e.preventDefault(), addTag())
                }
                className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                placeholder='Add tags...'
              />
              <button
                type='button'
                onClick={addTag}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
              >
                Add
              </button>
            </div>
            <div className='flex flex-wrap gap-2'>
              {formData.tags.map((tag: any) => (
                <span
                  key={tag}
                  className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm'
                >
                  {tag}
                  <button
                    type='button'
                    onClick={() => removeTag(tag)}
                    className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200'
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className='flex gap-2 justify-end pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
            >
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<
    'recent' | 'alphabetical' | 'most_videos'
  >('recent');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showPlaylistMenu, setShowPlaylistMenu] = useState<string | null>(null);

  const { data: playlists = [] } = usePlaylists({
    sortBy:
      sortBy === 'recent'
        ? 'updated'
        : sortBy === 'alphabetical'
          ? 'title'
          : sortBy === 'most_videos'
            ? 'videoCount'
            : 'updated',
  });
  const isLoading = false; // Placeholder
  const createPlaylistMutation = useCreatePlaylist();

  const deletePlaylistMutation = useDeletePlaylist();

  const filteredPlaylists = playlists.filter(
    (playlist: Playlist) =>
      playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      playlist.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePlaylist = async (data: any) => {
    try {
      await createPlaylistMutation.mutate(data);
    } catch (error) {
      logger.error('Failed to create playlist:', error);
    }
  };

  const handleDeletePlaylist = async (playlistId: any) => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      try {
        await deletePlaylistMutation.mutate(playlistId);
      } catch (error) {
        logger.error('Failed to delete playlist:', error);
      }
    }
  };

  const handleDuplicatePlaylist = async (playlist: Playlist) => {
    try {
      const duplicateData: CreatePlaylistData = {
        title: `${playlist.title} (Copy)`,
        visibility: playlist.visibility,
        ...(playlist.description && { description: playlist.description }),
        ...(playlist.tags && { tags: playlist.tags }),
      };
      await createPlaylistMutation.mutate(duplicateData);
    } catch (error) {
      logger.error('Failed to duplicate playlist:', error);
    }
  };

  const getVisibilityIcon = (visibility: any) => {
    switch (visibility) {
      case 'public':
        return <EyeIcon className='w-4 h-4' />;
      case 'unlisted':
        return <EyeSlashIcon className='w-4 h-4' />;
      case 'private':
        return <EyeSlashIcon className='w-4 h-4' />;
      default:
        return <EyeIcon className='w-4 h-4' />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Playlist Manager
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Organize and manage your video playlists
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          <PlusIcon className='w-5 h-5' />
          Create Playlist
        </button>
      </div>

      {/* Search and Filters */}
      <div className='flex items-center justify-between gap-4'>
        <div className='flex-1 max-w-md relative'>
          <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
          <input
            type='text'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='Search playlists...'
            className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
          />
        </div>

        <div className='flex items-center gap-4'>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
          >
            <option value='recent'>Recently updated</option>
            <option value='alphabetical'>Alphabetical</option>
            <option value='most_videos'>Most videos</option>
          </select>

          <div className='flex items-center border border-gray-300 dark:border-gray-600 rounded-lg'>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}
            >
              <Squares2X2Icon className='w-5 h-5' />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}
            >
              <ListBulletIcon className='w-5 h-5' />
            </button>
          </div>
        </div>
      </div>

      {/* Playlists Grid/List */}
      {isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className='bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse'
            >
              <div className='w-full h-32 bg-gray-300 dark:bg-gray-700 rounded mb-4' />
              <div className='h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2' />
              <div className='h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3' />
            </div>
          ))}
        </div>
      ) : filteredPlaylists.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredPlaylists.map((playlist: Playlist) => (
            <div
              key={playlist.id}
              className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow ${
                viewMode === 'list' ? 'flex items-center p-4' : 'p-4'
              }`}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className='relative mb-4'>
                    <img
                      src={
                        playlist.thumbnailUrl ||
                        `https://picsum.photos/300/200?random=${playlist.id}`
                      }
                      alt={playlist.title}
                      className='w-full h-32 object-cover rounded'
                    />
                    <div className='absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded'>
                      <PlayIcon className='w-8 h-8 text-white' />
                    </div>
                    <div className='absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs'>
                      {playlist.videoCount || 0} videos
                    </div>
                  </div>

                  <div className='flex items-start justify-between'>
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-semibold text-gray-900 dark:text-white truncate'>
                        {playlist.title}
                      </h3>
                      {playlist.description && (
                        <p className='text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2'>
                          {playlist.description}
                        </p>
                      )}
                      <div className='flex items-center gap-2 mt-2'>
                        {getVisibilityIcon(playlist.visibility)}
                        <span className='text-xs text-gray-500 dark:text-gray-400 capitalize'>
                          {playlist.visibility}
                        </span>
                      </div>
                    </div>

                    <div className='relative'>
                      <button
                        onClick={() =>
                          setShowPlaylistMenu(
                            showPlaylistMenu === playlist.id
                              ? null
                              : playlist.id
                          )
                        }
                        className='p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'
                      >
                        <EllipsisVerticalIcon className='w-5 h-5 text-gray-500' />
                      </button>

                      {showPlaylistMenu === playlist.id && (
                        <div className='absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-10 min-w-[160px]'>
                          <button className='w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2'>
                            <PlayIcon className='w-4 h-4' />
                            Play all
                          </button>
                          <button className='w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2'>
                            <PencilIcon className='w-4 h-4' />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDuplicatePlaylist(playlist)}
                            className='w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2'
                          >
                            <DocumentDuplicateIcon className='w-4 h-4' />
                            Duplicate
                          </button>
                          <button className='w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2'>
                            <ShareIcon className='w-4 h-4' />
                            Share
                          </button>
                          <hr className='my-2 border-gray-200 dark:border-gray-600' />
                          <button
                            onClick={() => handleDeletePlaylist(playlist.id)}
                            className='w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600'
                          >
                            <TrashIcon className='w-4 h-4' />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <img
                    src={
                      playlist.thumbnailUrl ||
                      `https://picsum.photos/120/80?random=${playlist.id}`
                    }
                    alt={playlist.title}
                    className='w-20 h-12 object-cover rounded mr-4'
                  />
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-semibold text-gray-900 dark:text-white'>
                      {playlist.title}
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      {playlist.videoCount || 0} videos • {playlist.visibility}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setShowPlaylistMenu(
                        showPlaylistMenu === playlist.id ? null : playlist.id
                      )
                    }
                    className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'
                  >
                    <EllipsisVerticalIcon className='w-5 h-5 text-gray-500' />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center py-12'>
          <FolderIcon className='w-16 h-16 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
            No playlists found
          </h3>
          <p className='text-gray-600 dark:text-gray-400 mb-4'>
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Create your first playlist to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowCreateModal(true)}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              Create Playlist
            </button>
          )}
        </div>
      )}

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePlaylist}
      />
    </div>
  );
};

export default PlaylistManager;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string];
    }
  }
}
