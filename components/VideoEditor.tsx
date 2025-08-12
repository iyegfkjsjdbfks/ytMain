
import { useEffect, useRef, useState, memo, FC, MouseEvent } from 'react';

import {
  PlayIcon,
  PauseIcon,
  ScissorsIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon,
  CloudArrowDownIcon,
} from '@heroicons/react/24/outline';

export interface VideoClip {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  thumbnail: string;
}

export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  volume: number;
  startTime: number;
  duration: number;
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  startTime: number;
  endTime: number;
  animation?: 'fade' | 'slide' | 'bounce';
}

export interface VideoFilter {
  id: string;
  name: string;
  type: 'brightness' | 'contrast' | 'saturation' | 'blur' | 'sepia' | 'grayscale';
  value: number;
}

interface VideoEditorProps {
  videoFile: File;
  onSave: (editedVideo: Blob, metadata) => void;
  onCancel: () => void;
  className?: string;
}

const VideoEditor: React.FC<VideoEditorProps> = ({
  videoFile,
  onSave,
  onCancel,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'trim' | 'audio' | 'text' | 'filters' | 'effects'>('trim');

  // Editing state
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [audioTracks] = useState<AudioTrack[]>([]);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [filters, setFilters] = useState<VideoFilter[]>([]);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  // UI state
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const videoUrl = URL.createObjectURL(videoFile);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
return;
}

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setTrimEnd(video.duration);

      // Create initial clip
      const initialClip: VideoClip = {
        id: 'main',
        startTime: 0,
        endTime: video.duration,
        duration: video.duration,
        thumbnail: generateThumbnail(0),
      };
      setClips([initialClip]);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  const generateThumbnail = (time): string => {
    // In a real implementation, this would capture a frame from the video
    return `https://picsum.photos/160/90?random=${Math.floor(time)}`;
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) {
return;
}

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time) => {
    const video = videoRef.current;
    if (!video) {
return;
}

    video.currentTime = Math.max(0, Math.min(time, duration));
    setCurrentTime(video.currentTime);
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    const timeline = timelineRef.current;
    if (!timeline) {
return;
}

    const rect = timeline.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    seekTo(newTime);
  };

  const addTextOverlay = () => {
    const newText: TextOverlay = {
      id: `text-${Date.now()}`,
      text: 'New Text',
      x: 50,
      y: 50,
      fontSize: 24,
      color: '#ffffff',
      fontFamily: 'Arial',
      startTime: currentTime,
      endTime: currentTime + 5,
      animation: 'fade',
    };
    setTextOverlays(prev => [...prev, newText]);
    setSelectedText(newText.id);
  };

  const updateTextOverlay = (id, updates: Partial<TextOverlay>) => {
    setTextOverlays(prev => prev.map(text =>
      text.id === id ? { ...text, ...updates } : text,
    ));
  };

  const deleteTextOverlay = (id) => {
    setTextOverlays(prev => prev.filter((text) => text.id !== id));
    setSelectedText(null);
  };

  const addFilter = (type: VideoFilter['type']) => {
    const newFilter: VideoFilter = {
      id: `filter-${Date.now()}`,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type,
      value: type === 'brightness' || type === 'contrast' ? 100 :
             type === 'saturation' ? 100 :
             type === 'blur' ? 0 : 50,
    };
    setFilters(prev => [...prev, newFilter]);
  };

  const updateFilter = (id, value: string | number) => {
    setFilters(prev => prev.map(filter =>
      filter.id === id ? { ...filter, value } : filter,
    ));
  };

  const removeFilter = (id) => {
    setFilters(prev => prev.filter((filter) => filter.id !== id));
  };

  const trimVideo = () => {
    const newClip: VideoClip = {
      id: `clip-${Date.now()}`,
      startTime: trimStart,
      endTime: trimEnd,
      duration: trimEnd - trimStart,
      thumbnail: generateThumbnail(trimStart),
    };
    setClips([newClip]);
  };

  const exportVideo = async () => {
    setIsProcessing(true);

    try {
      // In a real implementation, this would use WebCodecs API or similar
      // to actually process the video with all the applied effects

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Create a mock processed video blob
      const processedBlob = new Blob([videoFile], { type: 'video/mp4' });

      const metadata = {
        clips,
        audioTracks,
        textOverlays,
        filters,
        trimStart,
        trimEnd,
        duration: trimEnd - trimStart,
      };

      onSave(processedBlob, metadata);
    } catch (error) {
      console.error('Error exporting video:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (time): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderTimeline = () => (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900 dark:text-white">Timeline</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <div
        ref={timelineRef}
        className="relative h-16 bg-gray-200 dark:bg-gray-700 rounded cursor-pointer"
        onClick={handleTimelineClick}
      >
        {/* Timeline track */}
        <div className="absolute inset-0 flex">
          {clips.map((clip, index) => (
            <div
              key={clip.id}
              className="bg-blue-500 h-full flex items-center justify-center text-white text-xs"
              style={{
                left: `${(clip.startTime / duration) * 100}%`,
                width: `${(clip.duration / duration) * 100}%`,
              }}
            >
              Clip {index + 1}
            </div>
          ))}
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full" />
        </div>

        {/* Trim markers */}
        {activeTab === 'trim' && (
          <>
            <div
              className="absolute top-0 bottom-0 w-1 bg-green-500 cursor-ew-resize"
              style={{ left: `${(trimStart / duration) * 100}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-1 bg-green-500 cursor-ew-resize"
              style={{ left: `${(trimEnd / duration) * 100}%` }}
            />
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 mt-4">
        <button
          onClick={togglePlay}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
        >
          {isPlaying ? (
            <PauseIcon className="w-5 h-5" />
          ) : (
            <PlayIcon className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={() => seekTo(currentTime - 10)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          ⏪
        </button>

        <button
          onClick={() => seekTo(currentTime + 10)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          ⏩
        </button>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          {isMuted ? (
            <SpeakerXMarkIcon className="w-5 h-5" />
          ) : (
            <SpeakerWaveIcon className="w-5 h-5" />
          )}
        </button>

        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(parseInt(e.target.value, 10))}
          className="w-20"
        />
      </div>
    </div>
  );

  const renderTrimPanel = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 dark:text-white">Trim Video</h3>

      <div className="space-y-3">
        <div>
          <label htmlFor="trim-start-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Time
          </label>
          <input
            type="range"
            id="trim-start-time"
            min="0"
            max={duration}
            step="0.1"
            value={trimStart}
            onChange={(e) => setTrimStart(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {formatTime(trimStart)}
          </div>
        </div>

        <div>
          <label htmlFor="trim-end-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Time
          </label>
          <input
            type="range"
            id="trim-end-time"
            min="0"
            max={duration}
            step="0.1"
            value={trimEnd}
            onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {formatTime(trimEnd)}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Duration: {formatTime(trimEnd - trimStart)}
        </p>
      </div>

      <button
        onClick={trimVideo}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Apply Trim
      </button>
    </div>
  );

  const renderTextPanel = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">Text Overlays</h3>
        <button
          onClick={addTextOverlay}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Add Text
        </button>
      </div>

      <div className="space-y-3">
        {textOverlays.map((text) => (
          <div
            key={text.id}
            className={`p-3 border rounded cursor-pointer ${
              selectedText === text.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}
            onClick={() => setSelectedText(text.id)}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">
                {text.text}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTextOverlay(text.id);
                }}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {formatTime(text.startTime)} - {formatTime(text.endTime)}
            </div>
          </div>
        ))}
      </div>

      {selectedText && (
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">Edit Text</h4>
          {(() => {
            const text = textOverlays.find(t => t.id === selectedText);
            if (!text) {
return null;
}

            return (
              <div className="space-y-3">
                <input
                  type="text"
                  value={text.text}
                  onChange={(e) => updateTextOverlay(text.id, { text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter text"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="text-font-size" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Font Size
                    </label>
                    <input
                      type="range"
                      id="text-font-size"
                      min="12"
                      max="72"
                      value={text.fontSize}
                      onChange={(e) => updateTextOverlay(text.id, { fontSize: parseInt(e.target.value, 10) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="text-color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Color
                    </label>
                    <input
                      type="color"
                      id="text-color"
                      value={text.color}
                      onChange={(e) => updateTextOverlay(text.id, { color: e.target.value })}
                      className="w-full h-8 rounded"
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );

  const renderFiltersPanel = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">Filters & Effects</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {['brightness', 'contrast', 'saturation', 'blur', 'sepia', 'grayscale'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => addFilter(filterType as VideoFilter['type'])}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filters.map((filter) => (
          <div key={filter.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {filter.name}
              </span>
              <button
                onClick={() => removeFilter(filter.id)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
            <input
              type="range"
              min="0"
              max={filter.type === 'blur' ? 10 : 200}
              value={filter.value}
              onChange={(e) => updateFilter(filter.id, parseInt(e.target.value, 10))}
              className="w-full"
            />
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filter.value}{filter.type === 'blur' ? 'px' : '%'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Video Preview */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              muted={isMuted}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {renderTimeline()}
        </div>

        {/* Editing Panel */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {[
              { id: 'trim', icon: ScissorsIcon, label: 'Trim' },
              { id: 'text', icon: DocumentTextIcon, label: 'Text' },
              { id: 'filters', icon: AdjustmentsHorizontalIcon, label: 'Filters' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            {activeTab === 'trim' && renderTrimPanel()}
            {activeTab === 'text' && renderTextPanel()}
            {activeTab === 'filters' && renderFiltersPanel()}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={exportVideo}
              disabled={isProcessing}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CloudArrowDownIcon className="w-5 h-5" />
                  <span>Export Video</span>
                </>
              )}
            </button>

            <button
              onClick={onCancel}
              className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(VideoEditor);
