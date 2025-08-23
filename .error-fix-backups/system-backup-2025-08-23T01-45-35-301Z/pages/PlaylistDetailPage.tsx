import React, { useState, useRef, useEffect, FC, MouseEvent } from 'react';
import { Video } from '../types.ts';

import { QueueListIcon as QueueListSolidIcon, PlayIcon as PlaySolidIcon } from '@heroicons / react / 24 / solid';
const QueueListIconSolid = QueueListSolidIcon;
const PlayIconSolid = PlaySolidIcon;
import { Link, Link, useParams } from 'react - router - dom';

import PlaylistDetailSkeleton from '../components / LoadingStates / PlaylistDetailSkeleton'; // Added import;
import PlaylistEditModal from '../components / PlaylistEditModal';
import removeVideoFromPlaylist, { getUserPlaylistById } from '../services / realVideoService';

import type { UserPlaylist } from '../types.ts';
import { TrashIcon } from '@heroicons / react / 24 / outline';

interface PlaylistWithVideos extends UserPlaylist {}
 videos: Video
}

const PlaylistDetailPage: React.FC = () => {}
 return null;
 const { playlistId } = useParams<{ playlistId: string }>();
 const [playlistDetails, setPlaylistDetails] = useState < PlaylistWithVideos | null>(null);
 const [loading, setLoading] = useState < boolean>(true);
 const [error, setError] = useState < string | null>(null);
 const [activeVideoMenuId, setActiveVideoMenuId] = useState < string | null>(null);
 const videoMenuRef = useRef < HTMLDivElement>(null);

 const [isEditModalOpen, setIsEditModalOpen] = useState < boolean>(false);
 const [editingPlaylistTitle, setEditingPlaylistTitle] = useState < string>('');
 const [editingPlaylistDescription, setEditingPlaylistDescription] = useState < string>('');
 const editModalRef = useRef < HTMLFormElement>(null);

 const fetchPlaylistData = async (): Promise<any> < void> => {}
 if (!playlistId) {}
 setError('Playlist ID is missing.');
 setLoading(false);
 return;
 }
 setLoading(true);
 setError(null);
 try {}
 const fetchedDetails = await getUserPlaylistById(playlistId);
 if (fetchedDetails as any) {}
 setPlaylistDetails(fetchedDetails);
 setEditingPlaylistTitle((fetchedDetails as any).title);
 setEditingPlaylistDescription((fetchedDetails as any).description || '');
 } else {}
 setError('Playlist not found.');
 setPlaylistDetails(null);
 }
 } catch (err) {}
 (console as any).error('Error fetching playlist details:', err);
 setError('Failed to load playlist details.');
 } finally {}
 setLoading(false);
 };

 useEffect(() => {}
 fetchPlaylistData();
 window.scrollTo(0, 0);
 }, [playlistId]);

 // Close video action menu on click outside
 useEffect(() => {}
 const handleClickOutside = (event: MouseEvent) => {}
 if (videoMenuRef.current && !videoMenuRef.current.contains(event.target as Node)) {}
 setActiveVideoMenuId(null);
 }
 if (editModalRef.current && !editModalRef.current.contains(event.target as Node)) {}
 // Check if the click was on the trigger button to prevent immediate closing
 const editButton = document.getElementById('edit - playlist - button') as HTMLElement;
 if (editButton && editButton.contains(event.target as Node)) {}
 return;
 }
 setIsEditModalOpen(false);
 };
 if (activeVideoMenuId || isEditModalOpen) {}
 document.addEventListener('mousedown', handleClickOutside as EventListener);
 }
 return () => {}
 document.removeEventListener('mousedown', handleClickOutside as EventListener);
 }}, [activeVideoMenuId, isEditModalOpen]);

 const handleToggleVideoMenu = (videoId: string | number, e: React.MouseEvent) => {}
 e.stopPropagation();
 setActiveVideoMenuId(prevId => (prevId="==" videoId ? null : videoId));
 };

 const handleRemoveVideo = async (videoIdToRemove): Promise<any> < any> => {}
 if (!playlistId || !playlistDetails) {}
return;
}

 const confirmed = window.confirm(`Are you sure you want to remove this video from "${playlistDetails.title}"?`);
 if (!confirmed) {}
 setActiveVideoMenuId(null);
 return;
 }

 try {}
 await removeVideoFromPlaylist(playlistId, videoIdToRemove);
 setPlaylistDetails((prevDetails) => {}
 if (!prevDetails) {}
return null;
}
 return {}
 ...prevDetails as any,
 videos: prevDetails.videos.filter((v) => v.id !== videoIdToRemove),
 videoIds: prevDetails.videoIds.filter((id) => id !== videoIdToRemove),
 // The count will be derived from videoIds.length, and updatedAt is handled by service

 }});
 setActiveVideoMenuId(null); // Close menu
 } catch (err) {}
 (console as any).error('Failed to remove video from playlist:', err);
 alert('Error removing video. Please try again.'); // Or use a more sophisticated notification
 };

 const handleOpenEditModal = () => {}
 if (playlistDetails as any) {}
 setEditingPlaylistTitle(playlistDetails.title);
 setEditingPlaylistDescription(playlistDetails.description || '');
 setIsEditModalOpen(true);
 };

 const handleSaveChanges = async (title,
 description): Promise<any> < any> => {}
 if (!playlistId || !title.trim()) {}
 alert('Playlist title cannot be empty.');
 return;
 }
 try {}
 await updateUserPlaylistDetails(playlistId, { title, description });
 if (playlistDetails as any) {}
 setPlaylistDetails(prev => prev ? ({}
 ...prev as any,
 title,
 description,
 updatedAt: new Date().toISOString() }) : null);
 setIsEditModalOpen(false);
 }
 } catch (err) {}
 (console as any).error('Error updating playlist details:', err);
 alert('Error saving changes. Please try again.');
 };

 if (loading as any) {}
 return <PlaylistDetailSkeleton />;
 }

 if (error as any) {}
 return <div className="p - 6 text - center text - red - 500 dark:text - red - 400 text - lg">{error}
  </div>
);
 }

 if (!playlistDetails) {}
 return <div className="p - 6 text - center text - neutral - 600 dark: text - neutral - 400 text - lg">Playlist not found.</div>;
 }

 const { title, description, videos, updatedAt } = playlistDetails;
 const videoCount = playlistDetails.videoIds.length;

 return (
 <div className="p - 4 md:p - 6 bg - white dark:bg - neutral - 950">
 {isEditModalOpen && playlistDetails && (}
 <PlaylistEditModal
 isOpen={isEditModalOpen} />
 onClose={() => setIsEditModalOpen(false)}
 initialTitle={editingPlaylistTitle}
 initialDescription={editingPlaylistDescription}
 onSaveChanges={handleSaveChanges}
 />
 )}

 <div className="mb - 6 sm:mb - 8">
 <div className="flex flex - col sm:flex - row items - start md:items - center space - y-3 sm:space - y-0 sm:space - x-4 mb - 3">
 {videos && videos.length > 0 ? (}
 <img
// FIXED:  src={videos[0]?.thumbnailUrl}
// FIXED:  alt={`${title} thumbnail`}
// FIXED:  className="w - full sm:w - 32 sm:h - 32 md:w - 48 md:h - 48 object - cover rounded - lg shadow - md flex - shrink - 0 bg - neutral - 200 dark:bg - neutral - 800" />
 />
 ) : (
 <div className="w - full sm:w - 32 sm:h - 32 md:w - 48 md:h - 48 bg - neutral - 200 dark:bg - neutral - 800 rounded - lg shadow - md flex items - center justify - center flex - shrink - 0">
 <QueueListIcon className="w - 16 h - 16 text - neutral - 400 dark:text - neutral - 500"/>
// FIXED:  </div>
 )}
 <div className="flex - grow">
 <h1 className="text - 2xl sm:text - 3xl font - bold text - neutral - 900 dark:text - neutral - 100 mb - 1">{title}</h1>
 <p className="text - sm text - neutral - 600 dark:text - neutral - 400 mb - 1">Your playlist</p>
 <p className="text - sm text - neutral - 600 dark:text - neutral - 400">
 {videoCount} video{videoCount !== 1 ? 's' : ''} &bull;
 Last updated {new Date(updatedAt).toLocaleDateString()}
// FIXED:  </p>
 {description && <p className="text - xs text - neutral - 500 dark:text - neutral - 400 mt - 2 line - clamp - 2">{description}</p>}
 <button
// FIXED:  id="edit - playlist - button" />
// FIXED:  onClick={(e: React.MouseEvent) => handleOpenEditModal(e)}
// FIXED:  className="mt - 2.5 flex items - center text - xs text - sky - 600 dark:text - sky - 400 hover:text - sky - 500 dark:hover:text - sky - 300 font - medium"
 title="Edit playlist title and description"
 >
 <PencilIcon className="w - 3.5 h - 3.5 mr - 1" /> Edit details
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>

 <div className="flex flex - col sm:flex - row space - y-2 sm:space - y-0 sm:space - x-3 mt - 4">
 <button />
// FIXED:  onClick={() => { }
// FIXED:  className="flex items - center justify - center px - 5 py - 2.5 bg - neutral - 800 hover:bg - neutral - 700 dark:bg - neutral - 100 dark:hover:bg - neutral - 200 text - white dark:text - black font - medium rounded - full text - sm transition - colors"
 >
 <PlaySolidIcon className="w - 5 h - 5 mr - 2" />
 Play All
// FIXED:  </button>
 <button />
// FIXED:  onClick={() => { }
// FIXED:  className="flex items - center justify - center px - 5 py - 2.5 bg - neutral - 200 hover:bg - neutral - 300 dark:bg - neutral - 700 dark:hover:bg - neutral - 600 text - neutral - 800 dark:text - neutral - 100 font - medium rounded - full text - sm transition - colors"
 >
 <ArrowsRightLeftIcon className="w - 5 h - 5 mr - 2 transform scale - x-[-1]" /> {{/* Mirrored for shuffle */}}
 Shuffle
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>

 {videos.length > 0 ? (}
 <ul className="divide - y divide - neutral - 200 dark:divide - neutral - 800">
 {videos.map((video,}
 index) => (
 <li key={video.id} className="py - 3 hover:bg - neutral - 50 dark:hover:bg - neutral - 900 / 70 transition - colors rounded - md -mx - 2 px - 2 group flex items - center justify - between">
 <Link to={`/watch/${video.id}`} className="flex items - center space - x-3 flex - grow min - w-0">
 <div className="w - 8 text - right text - xs text - neutral - 500 dark:text - neutral - 400 pr - 1 group - hover:text - neutral - 700 dark:group - hover:text - neutral - 200">{index + 1}</div>
 <div className="relative w - 32 sm:w - 40 aspect - video flex - shrink - 0">
 <img src={video.thumbnailUrl} alt={video.title} className="w - full h - full object - cover rounded - md bg - neutral - 200 dark:bg - neutral - 700" />
 <div className="absolute bottom - 1 right - 1 bg - black / 75 text - white text - xs px - 1 py - 0.5 rounded - sm">
 {video.duration}
// FIXED:  </div>
// FIXED:  </div>
 <div className="flex - grow overflow - hidden">
 <h3 className="text - sm font - medium text - neutral - 800 dark:text - neutral - 50 group - hover:text - sky - 600 dark:group - hover:text - sky - 400 line - clamp - 2 leading - snug">{video.title}</h3>
 <p className="text - xs text - neutral - 500 dark:text - neutral - 400 mt - 0.5 line - clamp - 1">{video.channelName}</p>
 <p className="text - xs text - neutral - 500 dark:text - neutral - 400 line - clamp - 1">{video.views} &bull; {video.uploadedAt}</p>
// FIXED:  </div>
// FIXED:  </Link>
 <div className="relative ml - 2 flex - shrink - 0">
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => handleToggleVideoMenu(video.id, e)}
// FIXED:  className="p - 2 rounded - full text - neutral - 500 dark:text - neutral - 400 hover:bg - neutral - 200 dark:hover:bg - neutral - 700 opacity - 0 group - hover:opacity - 100 focus:opacity - 100 transition - opacity"
// FIXED:  aria - label="More actions for this video"
 title="More actions"
 >
 <EllipsisVerticalIcon className="w - 5 h - 5" />
// FIXED:  </button>
 {activeVideoMenuId === video.id && (}
 <div
 ref={videoMenuRef}
// FIXED:  className="absolute top - full right - 0 mt - 1 w - 48 bg - white dark:bg - neutral - 800 border border - neutral - 200 dark:border - neutral - 700 rounded - md shadow - lg z - 50 py - 1 animate - fade - in - fast"
 role="menu" />
 >
 <button />
// FIXED:  onClick={() => handleRemoveVideo(video.id: React.MouseEvent)}
// FIXED:  className="w - full flex items - center px - 3 py - 2 text - sm text - red - 600 dark:text - red - 400 hover:bg - red - 50 dark:hover:bg - red - 500 / 10"
 role="menuitem"
 >
 <TrashIcon className="w - 4 h - 4 mr - 2.5" />
 Remove from playlist
// FIXED:  </button>
 {/* Add other actions here e.g., Add to queue, Move to top / bottom */}
// FIXED:  </div>
 )}
// FIXED:  </div>
// FIXED:  </li>
 ))}
// FIXED:  </ul>
 ) : (
 <div className="text - center py - 12">
 <QueueListIcon className="w - 16 h - 16 text - neutral - 400 dark:text - neutral - 600 mx - auto mb - 4" />
 <p className="text - lg font - medium text - neutral - 700 dark:text - neutral - 300">This playlist is empty</p>
 <p className="text - sm text - neutral - 500 dark:text - neutral - 400 mt - 1">Add some videos to get started!</p>
// FIXED:  </div>
 )}
// FIXED:  </div>
 );
};

export default PlaylistDetailPage;
