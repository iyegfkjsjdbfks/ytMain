import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon, ScissorsIcon, SpeakerWaveIcon, SpeakerXMarkIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon, DocumentArrowDownIcon, DocumentIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface VideoProject {
  id: string;
  name: string;
  duration: number;
  resolution: string;
  fps: number;
  lastModified: Date;
  thumbnail: string;
}

interface TimelineClip {
  id: string;
  type: 'video' | 'audio' | 'text' | 'image';
  name: string;
  startTime: number;
  duration: number;
  track: number;
  thumbnail?: string;
  volume?: number;
  effects?: string[];
}

interface EditAction {
  type: 'cut' | 'trim' | 'volume' | 'effect' | 'text';
  timestamp: number;
  description: string;
}

const VideoEditorPage: React.FC = () => {
  const [currentProject, setCurrentProject] = useState<VideoProject>({
    id: '1',
    name: 'My Video Project',
    duration: 180,
    resolution: '1920x1080',
    fps: 30,
    lastModified: new Date(),
    thumbnail: '/api/placeholder/320/180'
  });

  const [clips, setClips] = useState<TimelineClip[]>([
    {
      id: '1',
      type: 'video',
      name: 'Main Video.mp4',
      startTime: 0,
      duration: 120,
      track: 0,
      thumbnail: '/api/placeholder/160/90',
      volume: 80
    },
    {
      id: '2',
      type: 'audio',
      name: 'Background Music.mp3',
      startTime: 0,
      duration: 180,
      track: 1,
      volume: 40
    },
    {
      id: '3',
      type: 'video',
      name: 'Intro Clip.mp4',
      startTime: 120,
      duration: 30,
      track: 0,
      thumbnail: '/api/placeholder/160/90',
      volume: 90
    },
    {
      id: '4',
      type: 'text',
      name: 'Title Text',
      startTime: 5,
      duration: 10,
      track: 2
    }
  ]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [editHistory, setEditHistory] = useState<EditAction[]>([]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'effects' | 'audio' | 'text'>('timeline');
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const timelineWidth = rect.width;
      const newTime = (clickX / timelineWidth) * currentProject.duration;
      setCurrentTime(Math.max(0, Math.min(newTime, currentProject.duration)));
    }
  };

  const handleClipSelect = (clipId: string) => {
    setSelectedClip(selectedClip === clipId ? null : clipId);
  };

  const handleClipSplit = (clipId: string, splitTime: number) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip) return;

    const relativeTime = splitTime - clip.startTime;
    if (relativeTime <= 0 || relativeTime >= clip.duration) return;

    const newClip: TimelineClip = {
      ...clip,
      id: `${clipId}_split_${Date.now()}`,
      startTime: clip.startTime + relativeTime,
      duration: clip.duration - relativeTime
    };

    setClips(prev => [
      ...prev.filter(c => c.id !== clipId),
      { ...clip, duration: relativeTime },
      newClip
    ]);

    setEditHistory(prev => [...prev, {
      type: 'cut',
      timestamp: Date.now(),
      description: `Split ${clip.name} at ${formatTime(splitTime)}`
    }]);
  };

  const handleVolumeChange = (clipId: string, volume: number) => {
    setClips(prev => prev.map(clip => 
      clip.id === clipId ? { ...clip, volume } : clip
    ));

    setEditHistory(prev => [...prev, {
      type: 'volume',
      timestamp: Date.now(),
      description: `Changed volume to ${volume}%`
    }]);
  };

  const handleSaveProject = () => {
    const projectData = {
      ...currentProject,
      clips,
      editHistory,
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem(`youtubeCloneProject_${currentProject.id}`, JSON.stringify(projectData));
    
    // Show save confirmation
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg z-50';
    notification.textContent = 'Project saved successfully!';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const handleUndo = () => {
    if (editHistory.length > 0) {
      const lastAction = editHistory[editHistory.length - 1];
      setEditHistory(prev => prev.slice(0, -1));
      
      // Simple undo logic - in a real app, this would be more sophisticated
      if (lastAction.type === 'cut') {
        // Restore original clip before split
        const splitClips = clips.filter(c => c.id.includes('_split_'));
        if (splitClips.length > 0) {
          const originalId = splitClips[0].id.split('_split_')[0];
          const originalClip = clips.find(c => c.id === originalId);
          if (originalClip) {
            setClips(prev => prev.filter(c => !c.id.includes('_split_') && c.id !== originalId));
          }
        }
      }
    }
  };

  const handleRedo = () => {
    // In a real app, you'd maintain a separate redo stack
    console.log('Redo functionality would be implemented here');
  };

  const handleExport = () => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          
          // Create download link for exported video
          const exportData = {
            project: currentProject,
            clips,
            exportSettings: {
              format: 'mp4',
              quality: '1080p',
              fps: currentProject.fps
            },
            exportDate: new Date().toISOString()
          };
          
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${currentProject.name}-export-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          alert('Video exported successfully! Export settings saved.');
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const getClipColor = (type: TimelineClip['type']): string => {
    switch (type) {
      case 'video': return 'bg-blue-500';
      case 'audio': return 'bg-green-500';
      case 'text': return 'bg-purple-500';
      case 'image': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrackLabel = (track: number): string => {
    switch (track) {
      case 0: return 'Video';
      case 1: return 'Audio';
      case 2: return 'Text/Graphics';
      default: return `Track ${track + 1}`;
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= currentProject.duration) {
            setIsPlaying(false);
            return currentProject.duration;
          }
          return newTime;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentProject.duration]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-full px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">{currentProject.name}</h1>
              <span className="text-sm text-gray-400">
                {currentProject.resolution} • {currentProject.fps}fps • {formatTime(currentProject.duration)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleUndo}
                disabled={editHistory.length === 0}
                className="flex items-center px-3 py-2 text-sm bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
              >
                <ArrowUturnLeftIcon className="w-4 h-4 mr-1" />
                Undo
              </button>
              <button 
                onClick={handleRedo}
                className="flex items-center px-3 py-2 text-sm bg-gray-700 rounded hover:bg-gray-600"
              >
                <ArrowUturnRightIcon className="w-4 h-4 mr-1" />
                Redo
              </button>
              <button 
                onClick={handleSaveProject}
                className="flex items-center px-3 py-2 text-sm bg-blue-600 rounded hover:bg-blue-700"
              >
                <DocumentIcon className="w-4 h-4 mr-1" />
                Save
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center px-4 py-2 text-sm bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                {isExporting ? `Exporting... ${exportProgress}%` : 'Export'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Preview */}
          <div className="flex-1 bg-black flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full">
              <video
                ref={videoRef}
                className="w-full h-auto rounded-lg"
                poster={currentProject.thumbnail}
                controls={false}
              >
                <source src="/api/placeholder/video" type="video/mp4" />
              </video>
              
              {/* Video Controls Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handlePlayPause}
                      className="flex items-center justify-center w-10 h-10 bg-red-600 rounded-full hover:bg-red-700"
                    >
                      {isPlaying ? (
                        <PauseIcon className="w-5 h-5" />
                      ) : (
                        <PlayIcon className="w-5 h-5 ml-0.5" />
                      )}
                    </button>
                    <span className="text-sm font-mono">
                      {formatTime(currentTime)} / {formatTime(currentProject.duration)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <SpeakerWaveIcon className="w-5 h-5" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="80"
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-800 border-t border-gray-700 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">Timeline</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                    className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600"
                  >
                    -
                  </button>
                  <span className="text-xs text-gray-400">{Math.round(zoom * 100)}%</span>
                  <button
                    onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                    className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex space-x-2">
                {['timeline', 'effects', 'audio', 'text'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-3 py-1 text-sm rounded capitalize ${
                      activeTab === tab
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline Tracks */}
            <div className="relative">
              {/* Time Ruler */}
              <div className="flex items-center mb-2">
                <div className="w-20 text-xs text-gray-400">Time</div>
                <div
                  ref={timelineRef}
                  className="flex-1 h-6 bg-gray-700 rounded relative cursor-pointer"
                  onClick={handleTimelineClick}
                >
                  {/* Time markers */}
                  {Array.from({ length: Math.ceil(currentProject.duration / 10) + 1 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-l border-gray-600"
                      style={{ left: `${(i * 10 / currentProject.duration) * 100}%` }}
                    >
                      <span className="absolute -top-5 text-xs text-gray-400 transform -translate-x-1/2">
                        {formatTime(i * 10)}
                      </span>
                    </div>
                  ))}
                  
                  {/* Playhead */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: `${(currentTime / currentProject.duration) * 100}%` }}
                  >
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Tracks */}
              {[0, 1, 2].map((trackIndex) => (
                <div key={trackIndex} className="flex items-center mb-2">
                  <div className="w-20 text-xs text-gray-400 pr-2">
                    {getTrackLabel(trackIndex)}
                  </div>
                  <div className="flex-1 h-12 bg-gray-700 rounded relative">
                    {clips
                      .filter(clip => clip.track === trackIndex)
                      .map((clip) => (
                        <div
                          key={clip.id}
                          className={`absolute top-1 bottom-1 rounded cursor-pointer border-2 ${
                            selectedClip === clip.id ? 'border-white' : 'border-transparent'
                          } ${getClipColor(clip.type)}`}
                          style={{
                            left: `${(clip.startTime / currentProject.duration) * 100}%`,
                            width: `${(clip.duration / currentProject.duration) * 100}%`
                          }}
                          onClick={() => handleClipSelect(clip.id)}
                          onDoubleClick={() => handleClipSplit(clip.id, currentTime)}
                        >
                          <div className="p-1 h-full flex items-center">
                            {clip.thumbnail && (
                              <img
                                src={clip.thumbnail}
                                alt={clip.name}
                                className="w-6 h-6 rounded mr-1 object-cover"
                              />
                            )}
                            <span className="text-xs font-medium truncate">
                              {clip.name}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700">
          {/* Properties Panel */}
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Properties</h3>
            
            {selectedClip ? (
              <div className="space-y-4">
                {(() => {
                  const clip = clips.find(c => c.id === selectedClip);
                  if (!clip) return null;
                  
                  return (
                    <>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Clip Name</label>
                        <input
                          type="text"
                          value={clip.name}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                          readOnly
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Duration</label>
                        <input
                          type="text"
                          value={formatTime(clip.duration)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                          readOnly
                        />
                      </div>
                      
                      {clip.volume !== undefined && (
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">
                            Volume: {clip.volume}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={clip.volume}
                            onChange={(e) => handleVolumeChange(clip.id, parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleClipSplit(clip.id, currentTime)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 rounded hover:bg-blue-700"
                        >
                          <ScissorsIcon className="w-4 h-4 mr-1" />
                          Split
                        </button>
                        <button className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 rounded hover:bg-red-700">
                          <XMarkIcon className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Select a clip to edit its properties</p>
            )}
          </div>

          {/* Edit History */}
          <div className="border-t border-gray-700 p-4">
            <h3 className="text-lg font-semibold mb-4">Edit History</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {editHistory.slice(-10).reverse().map((action, index) => (
                <div key={action.timestamp} className="text-xs text-gray-400 p-2 bg-gray-700 rounded">
                  <div className="font-medium capitalize">{action.type}</div>
                  <div>{action.description}</div>
                  <div className="text-gray-500">
                    {new Date(action.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {editHistory.length === 0 && (
                <p className="text-gray-500 text-sm">No edits yet</p>
              )}
            </div>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <div className="border-t border-gray-700 p-4">
              <h3 className="text-lg font-semibold mb-4">Exporting</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{exportProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Estimated time remaining: {Math.ceil((100 - exportProgress) / 2)} seconds
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoEditorPage;