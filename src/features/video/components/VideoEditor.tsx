import React, { useEffect, useRef, useState, FC } from 'react';
declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
  interface Process {
    env: ProcessEnv;
  }
}

import { PlayIcon, PauseIcon, ScissorsIcon, DocumentArrowDownIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

interface VideoClip {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  thumbnail: string;
  volume: number;
  effects: string;
}

interface AudioTrack {
  id: string;
  name: string;
  url: string;
  volume: number;
  startTime: number;
  duration: number;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  startTime: number;
  endTime: number;
  fontFamily: string;
  animation?: 'fadeIn' | 'slideIn' | 'bounce';
}

interface EditorState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  zoom: number;
  selectedClip: string | null;
  clips: VideoClip;
  audioTracks: AudioTrack;
  textOverlays: TextOverlay;
}

export const VideoEditor: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [editorState, setEditorState] = useState<EditorState>({
    currentTime: 0,
    duration: 120, // 2 minutes default
    isPlaying: false,
    zoom: 1,
    selectedClip: null,
    clips: [
      {
        id: 'clip1',
        name: 'Main Video',
        startTime: 0,
        endTime: 60,
        duration: 60,
        thumbnail: 'https://picsum.photos/160/90?random=1',
        volume: 1,
        effects: [],
      },
      {
        id: 'clip2',
        name: 'Intro Clip',
        startTime: 60,
        endTime: 120,
        duration: 60,
        thumbnail: 'https://picsum.photos/160/90?random=2',
        volume: 0.8,
        effects: ['fadeIn'],
      },
    ],
    audioTracks: [
      {
        id: 'audio1',
        name: 'Background Music',
        url: '/audio/background.mp3',
        volume: 0.3,
        startTime: 0,
        duration: 120,
      },
    ],
    textOverlays: [
      {
        id: 'text1',
        text: 'Welcome to my video!',
        x: 50,
        y: 20,
        fontSize: 24,
        color: '#ffffff',
        startTime: 5,
        endTime: 10,
        fontFamily: 'Arial',
        animation: 'fadeIn',
      },
    ],
  });

  const [showTextEditor, setShowTextEditor] = useState(false);
  const [newTextOverlay, setNewTextOverlay] = useState<Partial<TextOverlay>>({
    text: '',
    x: 50,
    y: 50,
    fontSize: 24,
    color: '#ffffff',
    fontFamily: 'Arial',
  });

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;
    if (editorState.isPlaying) {
      interval = setInterval(() => {
        setEditorState(prev => ({
          ...prev,
          currentTime: Math.min(prev.currentTime + 0.1, prev.duration),
        }));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [editorState.isPlaying, editorState.duration]);

  const togglePlayPause = () => {
    setEditorState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  };

  const splitClip = (clipId: any, splitTime: any) => {
    setEditorState(prev => {
      const clipIndex = prev.clips.findIndex((c: any) => c.id === clipId);
      if (clipIndex === -1) {
        return prev;
      }

      const originalClip = prev.clips[clipIndex];
      if (!originalClip) {
        return prev;
      } // Additional safety check

      const firstPart: VideoClip = {
        ...originalClip,
        id: `${clipId}_1`,
        name: originalClip.name || `${originalClip.name || 'Clip'} Part 1`,
        endTime: splitTime,
        duration: splitTime - originalClip.startTime,
      };
      const secondPart: VideoClip = {
        ...originalClip,
        id: `${clipId}_2`,
        name: originalClip.name || `${originalClip.name || 'Clip'} Part 2`,
        startTime: splitTime,
        duration: originalClip.endTime - splitTime,
      };

      const newClips = [...prev.clips];
      newClips.splice(clipIndex, 1, firstPart, secondPart);

      return {
        ...prev,
        clips: newClips,
      };
    });
  };

  const deleteClip = (clipId: any) => {
    setEditorState(prev => ({
      ...prev,
      clips: prev.clips.filter((c: any) => c.id !== clipId),
      selectedClip: prev.selectedClip === clipId ? null : prev.selectedClip,
    }));
  };

  const addTextOverlay = () => {
    if (!newTextOverlay.text?.trim()) {
      return;
    }

    const overlay: TextOverlay = {
      id: `text_${Date.now()}`,
      text: newTextOverlay.text,
      x: newTextOverlay.x || 50,
      y: newTextOverlay.y || 50,
      fontSize: newTextOverlay.fontSize || 24,
      color: newTextOverlay.color || '#ffffff',
      fontFamily: newTextOverlay.fontFamily || 'Arial',
      startTime: editorState.currentTime,
      endTime: editorState.currentTime + 5,
    };

    setEditorState(prev => ({
      ...prev,
      textOverlays: [...prev.textOverlays, overlay],
    }));

    setNewTextOverlay({
      text: '',
      x: 50,
      y: 50,
      fontSize: 24,
      color: '#ffffff',
      fontFamily: 'Arial',
    });
    setShowTextEditor(false);
  };

  const exportVideo = () => {
    // In a real implementation: real implementation, this would: this would trigger video processing
    alert(
      'Video export started! This would normally process the video with all edits applied.'
    );
  };

  const formatTime = (seconds: any) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timelineWidth = editorState.duration * editorState.zoom * 10; // 10px per second at 1x zoom

  return (
    <div className='min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col'>
      {/* Header */}
      <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
            Video Editor
          </h1>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => setShowTextEditor(true)}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              <ChatBubbleBottomCenterTextIcon className='w-4 h-4' />
              Add Text
            </button>
            <button
              onClick={exportVideo}
              className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
            >
              <DocumentArrowDownIcon className='w-4 h-4' />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className='flex flex-1'>
        {/* Main Editor Area */}
        <div className='flex-1 flex flex-col'>
          {/* Video Preview */}
          <div className='bg-black flex-1 flex items-center justify-center relative'>
            <div className='relative max-w-4xl max-h-full'>
              <video
                ref={videoRef}
                className='max-w-full max-h-full'
                poster='https://picsum.photos/800/450?random=3'
              />

              {/* Text Overlays Preview */}
              {editorState.textOverlays
                .filter((overlay: any) =>
                    editorState.currentTime >= overlay.startTime &&
                    editorState.currentTime <= overlay.endTime
                )
                .map((overlay: any) => (
                  <div
                    key={overlay.id}
                    className='absolute pointer-events-none'
                    style={{
                      left: `${overlay.x}%`,
                      top: `${overlay.y}%`,
                      fontSize: `${overlay.fontSize}px`,
                      color: overlay.color,
                      fontFamily: overlay.fontFamily,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {overlay.text}
                  </div>
                ))}
            </div>
          </div>

          {/* Controls */}
          <div className='bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4'>
            <div className='flex items-center justify-center gap-4'>
              <button
                onClick={togglePlayPause}
                className='p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors'
              >
                {editorState.isPlaying ? (
                  <PauseIcon className='w-6 h-6' />
                ) : (
                  <PlayIcon className='w-6 h-6' />
                )}
              </button>

              <span className='text-sm font-mono text-gray-600 dark:text-gray-400'>
                {formatTime(editorState.currentTime)} /{' '}
                {formatTime(editorState.duration)}
              </span>

              <div className='flex items-center gap-2'>
                <button
                  onClick={() =>
                    setEditorState(prev => ({
                      ...prev,
                      zoom: Math.max(0.5, prev.zoom - 0.5),
                    }))
                  }
                  className='px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors'
                >
                  -
                </button>
                <span className='text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center'>
                  {editorState.zoom}x
                </span>
                <button
                  onClick={() =>
                    setEditorState(prev => ({
                      ...prev,
                      zoom: Math.min(3, prev.zoom + 0.5),
                    }))
                  }
                  className='px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors'
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className='bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 overflow-x-auto'>
            <div
              className='relative'
              style={{ width: `${timelineWidth}px`, minHeight: '200px' }}
            >
              {/* Time Ruler */}
              <div className='h-6 border-b border-gray-300 dark:border-gray-600 relative'>
                {Array.from(
                  { length: Math.ceil(editorState.duration / 10) + 1 },
                  (_, i) => (
                    <div
                      key={i}
                      className='absolute text-xs text-gray-500 dark:text-gray-400'
                      style={{ left: `${i * 10 * editorState.zoom * 10}px` }}
                    >
                      {formatTime(i * 10)}
                    </div>
                  )
                )}
              </div>

              {/* Video Track */}
              <div className='mt-2'>
                <div className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Video
                </div>
                <div className='relative h-16 bg-gray-200 dark:bg-gray-700 rounded'>
                  {editorState.clips.map((clip: any) => (
                    <div
                      key={clip.id}
                      className={`absolute h-full bg-blue-500 rounded cursor-pointer border-2 ${
                        editorState.selectedClip === clip.id
                          ? 'border-blue-300'
                          : 'border-transparent'
                      }`}
                      style={{
                        left: `${clip.startTime * editorState.zoom * 10}px`,
                        width: `${clip.duration * editorState.zoom * 10}px`,
                      }}
                      onClick={() =>
                        setEditorState(prev => ({
                          ...prev,
                          selectedClip: clip.id,
                        }))
                      }
                    >
                      <div className='p-2 text-white text-xs truncate'>
                        {clip.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audio Track */}
              <div className='mt-4'>
                <div className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Audio
                </div>
                <div className='relative h-12 bg-gray-200 dark:bg-gray-700 rounded'>
                  {editorState.audioTracks.map((track: any) => (
                    <div
                      key={track.id}
                      className='absolute h-full bg-green-500 rounded'
                      style={{
                        left: `${track.startTime * editorState.zoom * 10}px`,
                        width: `${track.duration * editorState.zoom * 10}px`,
                      }}
                    >
                      <div className='p-2 text-white text-xs truncate'>
                        {track.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Text Track */}
              <div className='mt-4'>
                <div className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Text
                </div>
                <div className='relative h-8 bg-gray-200 dark:bg-gray-700 rounded'>
                  {editorState.textOverlays.map((overlay: any) => (
                    <div
                      key={overlay.id}
                      className='absolute h-full bg-purple-500 rounded'
                      style={{
                        left: `${overlay.startTime * editorState.zoom * 10}px`,
                        width: `${(overlay.endTime - overlay.startTime) * editorState.zoom * 10}px`,
                      }}
                    >
                      <div className='p-1 text-white text-xs truncate'>
                        {overlay.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Playhead */}
              <div
                className='absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none'
                style={{
                  left: `${editorState.currentTime * editorState.zoom * 10}px`,
                }}
              >
                <div className='w-3 h-3 bg-red-500 rounded-full -ml-1.5 -mt-1' />
              </div>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <div className='w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Properties
          </h3>

          {editorState.selectedClip ? (
            <div className='space-y-4'>
              <div>
                <div className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Volume
                </div>
                <input
                  type='range'
                  min='0'
                  max='1'
                  step='0.1'
                  value={
                    editorState.clips.find((c: any) => c.id === editorState.selectedClip
                    )?.volume || 1
                  }
                  onChange={e => {
                    const volume = parseFloat(e.target.value);
                    setEditorState(prev => ({
                      ...prev,
                      clips: prev.clips.map((clip: any) =>
                        clip.id === prev.selectedClip
                          ? { ...clip, volume }
                          : clip
                      ),
                    }));
                  }}
                  className='w-full'
                />
              </div>

              <div className='flex gap-2'>
                <button
                  onClick={() =>
                    editorState.selectedClip &&
                    splitClip(editorState.selectedClip, editorState.currentTime)
                  }
                  className='flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm'
                >
                  <ScissorsIcon className='w-4 h-4' />
                  Split
                </button>
                <button
                  onClick={() =>
                    editorState.selectedClip &&
                    deleteClip(editorState.selectedClip)
                  }
                  className='flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm'
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <p className='text-gray-500 dark:text-gray-400 text-sm'>
              Select a clip to edit its properties
            </p>
          )}
        </div>
      </div>

      {/* Text Editor Modal */}
      {showTextEditor && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Add Text Overlay
            </h3>

            <div className='space-y-4'>
              <div>
                <div className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Text
                </div>
                <input
                  type='text'
                  value={newTextOverlay.text || ''}
                  onChange={e =>
                    setNewTextOverlay(prev => ({
                      ...prev,
                      text: e.target.value,
                    }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  placeholder='Enter text...'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <div className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Font Size
                  </div>
                  <div>
                    <div className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Font Size
                    </div>
                    <input
                      type='number'
                      value={newTextOverlay.fontSize || 24}
                      onChange={e =>
                        setNewTextOverlay(prev => ({
                          ...prev,
                          fontSize: parseInt(e.target.value, 10),
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    />
                  </div>
                </div>
                <div>
                  <div>
                    <div className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Color
                    </div>
                    <input
                      type='color'
                      value={newTextOverlay.color || '#ffffff'}
                      onChange={e =>
                        setNewTextOverlay(prev => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                      className='w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md'
                    />
                  </div>
                </div>
              </div>

              <div className='flex gap-2 justify-end'>
                <button
                  onClick={() => setShowTextEditor(false)}
                  className='px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={addTextOverlay}
                  className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
                >
                  Add Text
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoEditor;


