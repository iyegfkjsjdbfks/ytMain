/// <reference types="react/jsx-runtime" />
import React from 'react';



declare namespace React {
  interface JSX {
    IntrinsicElements;
  }
  interface Component<P = {}, S = {}> {
    props: P;
    state: S;
  }
  interface FC<P = {}> {
    (props: P): JSX.Element;
  }
}

import { useState, useEffect } from 'react';

import { PlusIcon, PencilIcon, TrashIcon, EyeSlashIcon, GlobeAltIcon, LockClosedIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { DragDropContext, Droppable, Draggable, type DropResult } from 'react-beautiful-dnd';

interface PlaylistVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
  uploadDate: Date;
}

interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoCount: number;
  totalViews: number;
  visibility: 'public' | 'unlisted' | 'private';
  createdDate: Date;
  lastUpdated: Date;
  videos: PlaylistVideo;
}

interface PlaylistStats {
  totalPlaylists: number;
  totalVideos: number;
  totalViews: number;
  publicPlaylists: number;
  privatePlaylists: number;
  unlistedPlaylists: number;
}

const PlaylistManagerPage: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [stats, setStats] = useState<PlaylistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'created' | 'updated' | 'views'>('updated');
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'public' | 'unlisted' | 'private'>('all');
  const [newPlaylist, setNewPlaylist] = useState({
    title: '',
    description: '',
    visibility: 'public' as 'public' | 'unlisted' | 'private',
  });

  // Generate mock data
  useEffect(() => {
    const generateMockVideos = (count: number): PlaylistVideo[] => {
      const titles = [
        'Getting Started with React Hooks',
        'Advanced TypeScript Patterns',
        'Building Responsive Layouts',
        'State Management Best Practices',
        'Performance Optimization Tips',
        'Testing React Components',
        'CSS Grid vs Flexbox',
        'Modern JavaScript Features',
        'API Integration Strategies',
        'Deployment and DevOps',
      ];

      return Array.from({ length: count }, (_, i) => ({
        id: `video-${i + 1}`,
        title: titles[Math.floor(Math.random() * titles.length)] || `Video ${i + 1}`,
        thumbnail: `https://picsum.photos/320/180?random=${i}`,
        duration: `${Math.floor(Math.random() * 20) + 5}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        views: Math.floor(Math.random() * 100000) + 1000,
        uploadDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      }));
    };

    const generateMockPlaylists = (): Playlist[] => {
      const playlistTitles = [
        'React Tutorial Series',
        'JavaScript Fundamentals',
        'Web Development Tips',
        'CSS Masterclass',
        'Node.js Backend',
        'Database Design',
        'Mobile Development',
        'DevOps and Deployment',
        'UI/UX Design Principles',
        'Programming Challenges',
      ];

      const visibilityOptions: Array<'public' | 'unlisted' | 'private'> = ['public', 'unlisted', 'private'];

      return Array.from({ length: 8 }, (_, i) => {
        const videoCount = Math.floor(Math.random() * 15) + 3;
        const videos = generateMockVideos(videoCount);
        const totalViews = videos.reduce((sum, video) => sum + video.views, 0);

        const title = playlistTitles[i] || `Playlist ${i + 1}`;
        return {
          id: `playlist-${i + 1}`,
          title,
          description: `A comprehensive collection of videos about ${title.toLowerCase()}. Perfect for beginners and advanced learners alike.`,
          thumbnail: `https://picsum.photos/480/270?random=${i + 100}`,
          videoCount,
          totalViews,
          visibility: visibilityOptions[Math.floor(Math.random() * visibilityOptions.length)] || 'public',
          createdDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          videos,
        };
      }).sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
    };

    const generateMockStats = (playlists: Playlist): PlaylistStats => {
      return {
        totalPlaylists: playlists.length,
        totalVideos: playlists.reduce((sum: any, playlist: any) => sum + playlist.videoCount, 0),
        totalViews: playlists.reduce((sum: any, playlist: any) => sum + playlist.totalViews, 0),
        publicPlaylists: playlists.filter((p: any) => p.visibility === 'public').length,
        privatePlaylists: playlists.filter((p: any) => p.visibility === 'private').length,
        unlistedPlaylists: playlists.filter((p: any) => p.visibility === 'unlisted').length,
      };
    };

    setTimeout(() => {
      const mockPlaylists = generateMockPlaylists();
      setPlaylists(mockPlaylists);
      setStats(generateMockStats(mockPlaylists));
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPlaylists = playlists
    .filter((playlist) => {
      const matchesSearch = playlist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           playlist.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVisibility = filterVisibility === 'all' || playlist.visibility === filterVisibility;
      return matchesSearch && matchesVisibility;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return b.createdDate.getTime() - a.createdDate.getTime();
        case 'updated':
          return b.lastUpdated.getTime() - a.lastUpdated.getTime();
        case 'views':
          return b.totalViews - a.totalViews;
        default:
          return 0;
      }
    });

  const handleCreatePlaylist = () => {
    if (!newPlaylist.title.trim()) {
return;
}

    const playlist: Playlist = {
      id: `playlist-${Date.now()}`,
      title: newPlaylist.title,
      description: newPlaylist.description,
      thumbnail: `https://picsum.photos/480/270?random=${Date.now()}`,
      videoCount: 0,
      totalViews: 0,
      visibility: newPlaylist.visibility,
      createdDate: new Date(),
      lastUpdated: new Date(),
      videos: [],
    };

    setPlaylists([playlist, ...playlists]);
    setNewPlaylist({ title: '', description: '', visibility: 'public' });
    setShowCreateModal(false);
  };

  const handleDeletePlaylist = (playlistId: any) => {
    if (confirm('Are you sure you want to delete this playlist?')) {
      setPlaylists(playlists.filter((p) => p.id !== playlistId));
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(null);
      }
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !selectedPlaylist) {
return;
}

    const items = Array.from(selectedPlaylist.videos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    if (reorderedItem) {
      items.splice(result.destination.index, 0, reorderedItem);

      const updatedPlaylist = { ...selectedPlaylist, videos: items };
      setSelectedPlaylist(updatedPlaylist);
      setPlaylists(playlists.map(p => p.id === selectedPlaylist.id ? updatedPlaylist : p));
    }
  };

  const getVisibilityIcon = (visibility: any) => {
    switch (visibility) {
      case 'public':
        return <GlobeAltIcon className="w-4 h-4" />;
      case 'unlisted':
        return <EyeSlashIcon className="w-4 h-4" />;
      case 'private':
        return <LockClosedIcon className="w-4 h-4" />;
      default:
        return <GlobeAltIcon className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Playlist Manager</h1>
          <p className="text-gray-600 dark:text-gray-400">Organize and manage your video playlists</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Playlists</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPlaylists}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Videos</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalVideos}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Public</h3>
              <p className="text-2xl font-bold text-green-600">{stats.publicPlaylists}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Unlisted</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.unlistedPlaylists}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Private</h3>
              <p className="text-2xl font-bold text-red-600">{stats.privatePlaylists}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Playlists List */}
          <div className="lg:col-span-2">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Create Playlist</span>
              </button>

              <input
                type="text"
                placeholder="Search playlists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="updated">Last Updated</option>
                <option value="created">Date Created</option>
                <option value="title">Title</option>
                <option value="views">Views</option>
              </select>

              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Visibility</option>
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>

            {/* Playlists Grid */}
            <div className="space-y-4">
              {filteredPlaylists.map((playlist) => (
                <div
                  key={playlist.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer transition-all ${
                    selectedPlaylist?.id === playlist.id
                      ? 'ring-2 ring-blue-500 border-blue-500'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedPlaylist(playlist)}
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={playlist.thumbnail}
                      alt={playlist.title}
                      className="w-24 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{playlist.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{playlist.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              {getVisibilityIcon(playlist.visibility)}
                              <span className="capitalize">{playlist.visibility}</span>
                            </div>
                            <span>{playlist.videoCount} videos</span>
                            <span>{playlist.totalViews.toLocaleString()} views</span>
                            <span>Updated {formatDate(playlist.lastUpdated)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPlaylist(playlist);
}}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlaylist(playlist.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Playlist Details */}
          <div className="lg:col-span-1">
            {selectedPlaylist ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{selectedPlaylist.title}</h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Description:</span>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedPlaylist.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Videos:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedPlaylist.videoCount}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Views:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedPlaylist.totalViews.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Visibility:</span>
                      <div className="flex items-center space-x-1">
                        {getVisibilityIcon(selectedPlaylist.visibility)}
                        <span className="font-medium text-gray-900 dark:text-white capitalize">{selectedPlaylist.visibility}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedPlaylist.createdDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Videos List */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Videos ({selectedPlaylist.videos.length})</h4>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="playlist-videos">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                          {selectedPlaylist.videos.map((video: any, index: number) => (
                            <Draggable key={video.id} draggableId={video.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`flex items-center space-x-3 p-2 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 ${
                                    snapshot.isDragging ? 'shadow-lg' : ''
                                  }`}
                                >
                                  <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-12 h-8 object-cover rounded"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{video.title}</p>
                                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                      <span>{video.duration}</span>
                                      <span>•</span>
                                      <span>{video.views.toLocaleString()} views</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
                <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Select a playlist to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Playlist Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Playlist</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="new-playlist-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    id="new-playlist-title"
                    value={newPlaylist.title}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter playlist title"
                  />
                </div>

                <div>
                  <label htmlFor="new-playlist-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    id="new-playlist-description"
                    value={newPlaylist.description}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    rows={3}
                    placeholder="Enter playlist description"
                  />
                </div>

                <div>
                  <label htmlFor="new-playlist-visibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visibility</label>
                  <select
                    id="new-playlist-visibility"
                    value={newPlaylist.visibility}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, visibility: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylist.title.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistManagerPage;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string];
    }
  }
}
