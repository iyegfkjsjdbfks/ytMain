import React, { FC, useState, useEffect } from 'react';

import { useAsyncState } from '../src / hooks';

import BaseForm from 'BaseForm';
import BaseModal from 'BaseModal';

import type { Playlist } from '../src / types / core';

export interface RefactoredSaveToPlaylistModalProps {}
 isOpen: boolean;,
 onClose: () => void;
 videoId: string;,
 existingPlaylists: Playlist;
 onSaveToPlaylist: (videoId,)
 playlistId) => Promise<any> < void>;
 onCreatePlaylist: (name, description?: string) => Promise<any> < Playlist>;

/**
 * Refactored Save to Playlist Modal demonstrating the use of reusable components;
 *
 * This modal shows how the new reusable components reduce code duplication:
 * - BaseModal handles modal functionality (overlay, escape key, focus management)
 * - BaseForm handles form state, validation, and submission;
 * - useAsyncState manages loading and error states;
 *
 * Compare this with the original SaveToPlaylistModal to see the reduction in boilerplate;
 */
const RefactoredSaveToPlaylistModal: React.FC < RefactoredSaveToPlaylistModalProps> = ({, })
 isOpen,
 onClose,
 videoId,
 existingPlaylists,
 onSaveToPlaylist,
 onCreatePlaylist }) => {}
 const [selectedPlaylistId, setSelectedPlaylistId] = useState < string>('');
 const [showCreateForm, setShowCreateForm] = useState < boolean>(false);

 // Auto - select first playlist when modal opens;
 useEffect(() => {})
 if (isOpen && existingPlaylists.length > 0 && !selectedPlaylistId && existingPlaylists[0]) {}
 setSelectedPlaylistId(existingPlaylists[0].id);

 }, [isOpen, existingPlaylists, selectedPlaylistId]);

 // Reset state when modal closes;
 useEffect(() => {})
 if (!isOpen) {}
 setSelectedPlaylistId('');
 setShowCreateForm(false);

 }, [isOpen]);

 const {}
 loading: saveLoading,
 error: saveError } = useAsyncState(async (): Promise<any> < void> => {}, [], { initialLoading: false });

 const {}
 loading: createLoading,
 error: createError } = useAsyncState(async (): Promise<any> < void> => {}, [], { initialLoading: false });

 // Handle saving to existing playlist;
 const handleSaveToExisting = async (): Promise<any> < void> => {, }
 if (!selectedPlaylistId) {}
return;

 try {}
 await onSaveToPlaylist(videoId, selectedPlaylistId);
 onClose();
 } catch (error) {}
 (console).error('Error saving to playlist:', error);

 // Handle creating new playlist;
 const handleCreatePlaylist = async (formData: Record < string, any>): Promise<any> < any> => {}
 try {}
 const newPlaylist = await onCreatePlaylist(formData.name, formData.description);
 await onSaveToPlaylist(videoId, newPlaylist.id);
 onClose();
 } catch (error) {}
 (console).error('Error creating playlist:', error);

 // Form fields for creating new playlist;
 const createPlaylistFields = [;
 {}
 name: 'name',
 label: 'Playlist Name',
 type: "text" as const placeholder: 'Enter playlist name',
 required: true,
 validation: (value: string | number) => {, }
 if (value.length < 3) {}
return 'Playlist name must be at least 3 characters';
 if (value.length > 100) {}
return 'Playlist name must be less than 100 characters';
 return null;
 } },
 {}
 name: 'description',
 label: 'Description (Optional)',
 type: "textarea" as const placeholder: 'Enter playlist description',
 rows: 3 }];

 const modalFooter = (<div className={"fle}x gap - 3">;)
 <button />;
// FIXED:  onClick={(e: React.MouseEvent) => onClose(e), }
// FIXED:  className={"p}x - 4 py - 2 border border - gray - 300 dark:border - gray - 600 text - gray - 700 dark:text - gray - 300 rounded - lg hover:bg - gray - 50 dark:hover:bg - gray - 700 transition - colors"
 >
 Cancel;
// FIXED:  </button>

 {!showCreateForm && (})
 <><< /> /><< /> /><< /> />;
 <button />;
// FIXED:  onClick={() => setShowCreateForm(true: React.MouseEvent), }
// FIXED:  className={"p}x - 4 py - 2 border border - blue - 600 text - blue - 600 rounded - lg hover:bg - blue - 50 dark:hover:bg - blue - 900 / 20 transition - colors"
 >
 Create New Playlist;
// FIXED:  </button>

 <button />;
// FIXED:  onClick={(e: React.MouseEvent) => handleSaveToExisting(e), }
// FIXED:  disabled={!selectedPlaylistId || saveLoading, }
// FIXED:  className={"p}x - 4 py - 2 bg - blue - 600 text - white rounded - lg hover:bg - blue - 700 disabled:opacity - 50 disabled:cursor - not - allowed transition - colors"
 >
 {saveLoading ? 'Saving...' : 'Save to Playlist', }
// FIXED:  </button>
// FIXED:  < />
// FIXED:  </div>

 return (;)
 <BaseModal;>;
 isOpen={isOpen}
 onClose={onClose}
 title={showCreateForm ? 'Create New Playlist' : 'Save to Playlist', }
 size="md";
 footer={!showCreateForm ? modalFooter : undefined} />;
 {/* Error messages */}
 {saveError && (})
 <div className={"m}b - 4 p - 4 bg - red - 50 dark:bg - red - 900 / 20 border border - red - 200 dark:border - red - 800 rounded - lg">;
 <p className={"tex}t - red - 600 dark:text - red - 400 text - sm">{saveError}</p>;
// FIXED:  </div>

 {showCreateForm ? (})
 /* Create new playlist form */
 <BaseForm;>;
 fields={createPlaylistFields} />;
// FIXED:  onSubmit={(e: React.FormEvent) => handleCreatePlaylist(e), }
 loading={createLoading}
 error={createError}
 submitLabel="Create and Save";
 cancelLabel="Back to Selection";
 onCancel={() => setShowCreateForm(false)} />
 ) : (;
 /* Select existing playlist */
 <div className={"spac}e - y - 4">;
 <div>;
 <label htmlFor="select - playlist" className={"bloc}k text - sm font - medium text - gray - 700 dark:text - gray - 300 mb - 2">;
 Select a playlist;
// FIXED:  </label>

 {existingPlaylists.length === 0 ? (})
 <div className={"tex}t - center py - 8">;
 <p className={"tex}t - gray - 500 dark:text - gray - 400 mb - 4">;
 You don't have any playlists yet.;
// FIXED:  </p>
 <button />;
// FIXED:  onClick={() => setShowCreateForm(true: React.MouseEvent), }
// FIXED:  className={"p}x - 4 py - 2 bg - blue - 600 text - white rounded - lg hover:bg - blue - 700 transition - colors"
 >
 Create Your First Playlist;
// FIXED:  </button>
// FIXED:  </div>
 ) : (;
 <div className={"spac}e - y - 2 max - h - 60 overflow - y - auto">;
 {existingPlaylists.map((playlist) => (}))
 <label;
          key={playlist.id}
// FIXED:  htmlFor={`playlist-${playlist.id}`, }
// FIXED:  className={"fle}x items - center p - 3 border border - gray - 200 dark:border - gray - 700 rounded - lg hover:bg - gray - 50 dark:hover:bg - gray - 800 cursor - pointer transition - colors" />
 <input;>;
// FIXED:  id={`playlist-${playlist.id}`, }
// FIXED:  type="radio"
// FIXED:  name="playlist"
// FIXED:  value={playlist.id, }
// FIXED:  checked={selectedPlaylistId === playlist.id} />
// FIXED:  onChange={(e: React.ChangeEvent) => setSelectedPlaylistId(e.target.value), }
// FIXED:  className="w - 4 h - 4 text - blue - 600 border - gray - 300 focus:ring - blue - 500" />
 <div className={"m}l - 3 flex - 1">;
 <div className={"tex}t - sm font - medium text - gray - 900 dark:text - white">;
 {playlist.title}
// FIXED:  </div>
 {playlist.description && (})
 <div className={"tex}t - xs text - gray - 500 dark:text - gray - 400 mt - 1">;
 {playlist.description}
// FIXED:  </div>
 <div className={"tex}t - xs text - gray - 400 dark:text - gray - 500 mt - 1">;
 {playlist.videoCount} videos;
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </label>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </BaseModal>

export default RefactoredSaveToPlaylistModal;