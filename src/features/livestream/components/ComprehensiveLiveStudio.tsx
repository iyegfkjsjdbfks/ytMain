// TODO: Fix import - import React from "react";
// TODO: Fix import - import { useState, useRef, useEffect } from 'react';
import { logger } from '../../../utils/logger';
import { useLiveStream } from '@/hooks/useLiveStream';
import type { LiveStream, StreamPlatform } from '../../../types/livestream';
// TODO: Fix import - import { VideoCameraIcon, MicrophoneIcon, StopIcon, Cog6ToothIcon, ChatBubbleLeftRightIcon, EyeIcon, HeartIcon, SignalIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
// TODO: Fix import - import { VideoCameraIcon as VideoCameraSolidIcon, MicrophoneIcon as MicrophoneSolidIcon, PlayIcon as PlaySolidIcon } from '@heroicons/react/24/solid';
import { AdvancedLiveChat, LivePolls, LiveQA, SuperChatPanel, StreamScheduler, MultiplatformStreaming } from '.';

interface ComprehensiveLiveStudioProps {
  className?: string;
}

const ComprehensiveLiveStudio: React.FC<ComprehensiveLiveStudioProps> = ({
  className = '',
}) => {
  const [currentStream, setCurrentStream] = useState<LiveStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'polls' | 'qa' | 'superchat' | 'schedule' | 'multiplatform'>('chat');

  const videoRef = useRef<HTMLVideoElement>(null);
  const { createStream, startStream, endStream } = useLiveStream();

  const [streamSettings, setStreamSettings] = useState({
    title: '',
    description: '',
    category: 'Gaming',
    visibility: 'public' as 'public' | 'unlisted' | 'private',
    enableChat: true,
    enableSuperChat: true,
    enablePolls: true,
    enableQA: true,
    enableRecording: true,
    enableMultiplatform: false,
    quality: '1080p' as '720p' | '1080p' | '1440p' | '4k',
    bitrate: 4500,
    frameRate: 30 as 30 | 60,
    platforms: [] as StreamPlatform,
    scheduledStartTime: undefined as Date | undefined,
  });

  const [stats, setStats] = useState({
    viewers: 0,
    peakViewers: 0,
    duration: 0,
    likes: 0,
    chatMessages: 0,
    superChatAmount: 0,
    streamHealth: 'excellent' as 'excellent' | 'good' | 'fair' | 'poor',
    bitrate: 4500,
    latency: 2000,
  });

  // Setup camera and microphone
  const setupMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: streamSettings.frameRate },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsPreviewing(true);
    } catch (error) {
      logger.error('Failed to access media devices:', error);
      alert('Could not access camera and microphone. Please check permissions.');
    }
  };

  const startPreview = async () => {
    if (!stream) {
      await setupMedia();
    } else {
      setIsPreviewing(true);
    }
  };

  const stopPreview = () => {
    setIsPreviewing(false);
    if (stream && !isStreaming) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleStartStream = async () => {
    if (!stream || !streamSettings.title.trim()) {
      alert('Please set up camera and enter a stream title');
      return;
    }

    try {
      // Create stream in service
      const streamData: Partial<LiveStream> = {
        title: streamSettings.title,
        description: streamSettings.description,
        category: streamSettings.category,
        visibility: streamSettings.visibility,
        settings: {
          enableChat: streamSettings.enableChat,
          enableSuperChat: streamSettings.enableSuperChat,
          enablePolls: streamSettings.enablePolls,
          enableQA: streamSettings.enableQA,
          chatMode: 'live',
          slowMode: 0,
          subscribersOnly: false,
          moderationLevel: 'moderate',
          quality: streamSettings.quality,
          bitrate: streamSettings.bitrate,
          frameRate: streamSettings.frameRate,
          enableRecording: streamSettings.enableRecording,
          enableMultiplatform: streamSettings.enableMultiplatform,
          platforms: streamSettings.platforms,
        },
      };

      if (streamSettings.scheduledStartTime) {
        streamData.scheduledStartTime = streamSettings.scheduledStartTime;
      }

      const newStream = await createStream(streamData);

      if (!newStream) {
        console.error('Failed to create stream');
        return;
      }

      setCurrentStream(newStream);

      // Start streaming
      await startStream();
      setIsStreaming(true);

      // Enable multiplatform if configured
      if (streamSettings.enableMultiplatform && streamSettings.platforms.length > 0) {
        const enabledPlatforms = streamSettings.platforms
          .filter((p) => p.enabled)
          .map(p => p.name);

        // TODO: Implement multiplatform streaming
        logger.debug('Multiplatform streaming enabled for:', enabledPlatforms);
      }

    } catch (error) {
      logger.error('Failed to start stream:', error);
      alert('Failed to start stream. Please try again.');
    }
  };

  const handleEndStream = async () => {
    if (!currentStream) {
return;
}

    try {
      await endStream();
      setIsStreaming(false);
      setCurrentStream(null);

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setIsPreviewing(false);

      // Show stream summary
      alert('Stream ended successfully!');
    } catch (error) {
      logger.error('Failed to end stream:', error);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Listen for stream stats updates
  useEffect(() => {
    if (!currentStream) {
return;
}

    // TODO: Implement real-time stats updates
    const interval = setInterval(() => {
      if (isStreaming) {
        setStats(prev => ({
          ...prev,
          viewers: Math.floor(Math.random() * 1000) + 100,
          duration: prev.duration + 1,
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStream]);

  const getStreamHealthColor = () => {
    switch (stats.streamHealth) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-yellow-500';
      case 'fair': return 'text-orange-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Live Studio
          </h1>
          <div className="flex items-center space-x-2">
            {isStreaming && (
              <div className="flex items-center space-x-2 text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">LIVE</span>
              </div>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stream Stats */}
        {isStreaming && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <EyeIcon className="w-4 h-4 text-gray-500" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.viewers.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500">Viewers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <ClockIcon className="w-4 h-4 text-gray-500" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatDuration(stats.duration)}
                </span>
              </div>
              <p className="text-xs text-gray-500">Duration</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <HeartIcon className="w-4 h-4 text-gray-500" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.likes.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500">Likes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-500" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.chatMessages.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500">Messages</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ${stats.superChatAmount.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500">Super Chat</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <SignalIcon className={`w-4 h-4 ${getStreamHealthColor()}`} />
                <span className={`text-lg font-bold ${getStreamHealthColor()}`}>
                  {stats.streamHealth.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-500">Health</p>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="stream-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stream Title *
                </label>
                <input
                  id="stream-title"
                  type="text"
                  value={streamSettings.title}
                  onChange={(e) => setStreamSettings(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter stream title"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={isStreaming}
                />
              </div>
              <div>
                <label htmlFor="stream-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  id="stream-category"
                  value={streamSettings.category}
                  onChange={(e) => setStreamSettings(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={isStreaming}
                >
                  <option value="Gaming">Gaming</option>
                  <option value="Just Chatting">Just Chatting</option>
                  <option value="Music">Music</option>
                  <option value="Art">Art</option>
                  <option value="Technology">Technology</option>
                  <option value="Education">Education</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>
              <div>
                <label htmlFor="stream-visibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Visibility
                </label>
                <select
                  id="stream-visibility"
                  value={streamSettings.visibility}
                  onChange={(e) => setStreamSettings(prev => ({ ...prev, visibility: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={isStreaming}
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="stream-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="stream-description"
                value={streamSettings.description}
                onChange={(e) => setStreamSettings(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your stream..."
                rows={3}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isStreaming}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Preview */}
        <div className="lg:col-span-2">
          <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />

            {!isPreviewing && !isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <VideoCameraIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Camera Preview Off</p>
                  <button
                    onClick={startPreview}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Preview
                  </button>
                </div>
              </div>
            )}

            {/* Stream Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleVideo}
                    className={`p-2 rounded-lg transition-colors ${
                      isVideoEnabled
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isVideoEnabled ? (
                      <VideoCameraSolidIcon className="w-5 h-5" />
                    ) : (
                      <VideoCameraIcon className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={toggleAudio}
                    className={`p-2 rounded-lg transition-colors ${
                      isAudioEnabled
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isAudioEnabled ? (
                      <MicrophoneSolidIcon className="w-5 h-5" />
                    ) : (
                      <MicrophoneIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  {isPreviewing && !isStreaming && (
                    <button
                      onClick={stopPreview}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Stop Preview
                    </button>
                  )}

                  {!isStreaming ? (
                    <button
                      onClick={handleStartStream}
                      disabled={!stream || !streamSettings.title.trim()}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <PlaySolidIcon className="w-4 h-4" />
                      <span>Go Live</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleEndStream}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <StopIcon className="w-4 h-4" />
                      <span>End Stream</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1">
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab('polls')}
                className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'polls'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Polls
              </button>
              <button
                onClick={() => setActiveTab('qa')}
                className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'qa'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Q&A
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1 mt-1">
              <button
                onClick={() => setActiveTab('superchat')}
                className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'superchat'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Super Chat
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'schedule'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Schedule
              </button>
              <button
                onClick={() => setActiveTab('multiplatform')}
                className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'multiplatform'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Multi-Platform
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            {activeTab === 'chat' && currentStream && (
              <AdvancedLiveChat
                streamId={currentStream.id}
                isOwner={true}
                isModerator={true}
              />
            )}
            {activeTab === 'polls' && currentStream && (
              <LivePolls
                streamId={currentStream.id}
                isOwner={true}
              />
            )}
            {activeTab === 'qa' && currentStream && (
              <LiveQA
                streamId={currentStream.id}
                isOwner={true}
              />
            )}
            {activeTab === 'superchat' && currentStream && (
              <SuperChatPanel streamId={currentStream.id} />
            )}
            {activeTab === 'schedule' && (
              <StreamScheduler
                onStreamScheduled={(stream) => {
                  logger.debug('Stream scheduled:', stream);
                }}
              />
            )}
            {activeTab === 'multiplatform' && (
              <MultiplatformStreaming
                isStreaming={isStreaming}
              />
            )}

            {!currentStream && activeTab !== 'schedule' && activeTab !== 'multiplatform' && (
              <div className="p-6 text-center">
                <p className="text-gray-500">Start a stream to access this feature</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveLiveStudio;
