
/// <reference types="react/jsx-runtime" />
declare global {
  namespace JSX {
    interface IntrinsicElements {
      []: any;
    }
  }
}
import { useEffect, useState } from 'react';

import { useAsyncState } from '../src/hooks';


import BaseForm from './BaseForm';
import BaseModal from './BaseModal';

import type { Playlist } from '../src/types/core';

interface RefactoredSaveToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  existingPlaylists: Playlist;
  onSaveToPlaylist: (videoId: any, playlistId: any) => Promise<void>;
  onCreatePlaylist: (name: string, description?: string) => Promise<Playlist>;
}

/**
 * Refactored Save to Playlist Modal demonstrating the use of reusable components
 *
 * This modal shows how the new reusable components reduce code duplication:
 * - BaseModal handles modal functionality (overlay, escape key, focus management)
 * - BaseForm handles form state, validation, and submission
 * - useAsyncState manages loading and error states
 *
 * Compare this with the original SaveToPlaylistModal to see the reduction in boilerplate
 */
const RefactoredSaveToPlaylistModal: React.FC<RefactoredSaveToPlaylistModalProps> = ({
  isOpen,
  onClose,
  videoId,
  existingPlaylists,
  onSaveToPlaylist,
  onCreatePlaylist,
}) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Auto-select first playlist when modal opens
  useEffect(() => {
    if (isOpen && existingPlaylists.length > 0 && !selectedPlaylistId && existingPlaylists[0]) {
      setSelectedPlaylistId(existingPlaylists[0].id);
    }
  }, [isOpen, existingPlaylists, selectedPlaylistId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPlaylistId('');
      setShowCreateForm(false);
    }
  }, [isOpen]);

  const {
    loading: saveLoading,
    error: saveError,
  } = useAsyncState(async () => {}, [], { initialLoading: false });

  const {
    loading: createLoading,
    error: createError,
  } = useAsyncState(async () => {}, [], { initialLoading: false });

  // Handle saving to existing playlist
  const handleSaveToExisting = async () => {
    if (!selectedPlaylistId) {
return;
}

    try {
      await onSaveToPlaylist(videoId, selectedPlaylistId);
      onClose();
    } catch (error) {
      console.error('Error saving to playlist:', error);
    }
  };

  // Handle creating new playlist
  const handleCreatePlaylist = async (formData: Record<string, any>) => {
    try {
      const newPlaylist = await onCreatePlaylist(formData.name, formData.description);
      await onSaveToPlaylist(videoId, newPlaylist.id);
      onClose();
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  // Form fields for creating new playlist
  const createPlaylistFields = [
    {
      name: 'name',
      label: 'Playlist Name',
      type: 'text' as const,
      placeholder: 'Enter playlist name',
      required: true,
      validation: (value: string | number) => {
        if (value.length < 3) {
return 'Playlist name must be at least 3 characters';
}
        if (value.length > 100) {
return 'Playlist name must be less than 100 characters';
}
        return null;
      },
    },
    {
      name: 'description',
      label: 'Description (Optional)',
      type: 'textarea' as const,
      placeholder: 'Enter playlist description',
      rows: 3,
    },
  ];

  const modalFooter = (
    <div className="flex gap-3">
      <button
        onClick={onClose}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        Cancel
      </button>

      {!showCreateForm && (
        <>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            Create New Playlist
          </button>

          <button
            onClick={handleSaveToExisting}
            disabled={!selectedPlaylistId || saveLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saveLoading ? 'Saving...' : 'Save to Playlist'}
          </button>
        </>
      )}
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={showCreateForm ? 'Create New Playlist' : 'Save to Playlist'}
      size="md"
      footer={!showCreateForm ? modalFooter : undefined}
    >
      {/* Error messages */}
      {saveError && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{saveError}</p>
        </div>
      )}

      {showCreateForm ? (
        /* Create new playlist form */
        <BaseForm
          fields={createPlaylistFields}
          onSubmit={handleCreatePlaylist}
          loading={createLoading}
          error={createError}
          submitLabel="Create and Save"
          cancelLabel="Back to Selection"
          onCancel={() => setShowCreateForm(false)}
        />
      ) : (
        /* Select existing playlist */
        <div className="space-y-4">
          <div>
            <label htmlFor="select-playlist" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select a playlist
            </label>

            {existingPlaylists.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  You don't have any playlists yet.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Playlist
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {existingPlaylists.map((playlist: any) => (
                  <label
                    key={playlist.id}
                    htmlFor={`playlist-${playlist.id}`}
                    className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <input
                      id={`playlist-${playlist.id}`}
                      type="radio"
                      name="playlist"
                      value={playlist.id}
                      checked={selectedPlaylistId === playlist.id}
                      onChange={(e) => setSelectedPlaylistId(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {playlist.title}
                      </div>
                      {playlist.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {playlist.description}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {playlist.videoCount} videos
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </BaseModal>
  );
};

export default RefactoredSaveToPlaylistModal;