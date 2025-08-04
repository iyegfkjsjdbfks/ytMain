import React from "react";
import { useState, useRef, useEffect } from 'react';
import type * as React from 'react';
import { logger } from '../../../utils/logger';
import { VideoCameraIcon, MicrophoneIcon, StopIcon, PlayIcon, Cog6ToothIcon, ChatBubbleLeftRightIcon, EyeIcon, HeartIcon, ShareIcon, SignalIcon } from '@heroicons/react/24/outline';
import { VideoCameraIcon as VideoCameraSolidIcon, MicrophoneIcon as MicrophoneSolidIcon } from '@heroicons/react/24/solid';

interface StreamSettings {
  title: string;
  description: string;
  category: string;
  visibility: 'public' | 'unlisted' | 'private';
  enableChat: boolean;
  enableDonations: boolean;
  quality: '720p' | '1080p' | '1440p' | '4k';
  bitrate: number;
  frameRate: 30 | 60;
}

interface StreamStats {
  viewers: number;
  peakViewers: number;
  duration: number;
  likes: number;
  chatMessages: number;
  streamHealth: 'excellent' | 'good' | 'poor';
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  isModerator?: boolean;
  isOwner?: boolean;
  badges?: string[];
}

export const LiveStreamStudio: React.FC = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [chatMessage, setChatMessage] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<StreamSettings>({
    title: '',
    description: '',
    category: 'Gaming',
    visibility: 'public',
    enableChat: true,
    enableDonations: false,
    quality: '1080p',
    bitrate: 4500,
    frameRate: 30,
  });

  const [stats, setStats] = useState<StreamStats>({
    viewers: 0,
    peakViewers: 0,
    duration: 0,
    likes: 0,
    chatMessages: 0,
    streamHealth: 'excellent',
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      username: 'StreamMod',
      message: 'Welcome to the stream! Please follow the community guidelines.',
      timestamp: new Date(),
      isModerator: true,
      badges: ['moderator'],
    },
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming) {
      interval = setInterval(() => {
        setStats(prev => ({
          ...prev,
          duration: prev.duration + 1,
          viewers: Math.max(0, prev.viewers + Math.floor(Math.random() * 3) - 1),
          likes: prev.likes + (Math.random() > 0.95 ? 1 : 0),
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  const setupCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: settings.frameRate },
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
      logger.error('Error accessing camera:', error);
      alert('Could not access camera/microphone. Please check permissions.');
    }
  };

  const startStream = async () => {
    if (!stream) {
      await setupCamera();
      return;
    }

    if (!settings.title.trim()) {
      alert('Please enter a stream title');
      return;
    }

    setIsStreaming(true);
    setStats(prev => ({ ...prev, duration: 0 }));
  };

  const stopStream = () => {
    setIsStreaming(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsPreviewing(false);
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

  const sendChatMessage = () => {
    if (!chatMessage.trim()) {
return;
}

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username: 'You',
      message: chatMessage,
      timestamp: new Date(),
      isOwner: true,
      badges: ['owner'],
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage('');
    setStats(prev => ({ ...prev, chatMessages: prev.chatMessages + 1 }));
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Live Stream Studio
          </h1>
          <div className="flex items-center gap-4">
            {isStreaming && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-600 font-medium">LIVE</span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {formatDuration(stats.duration)}
                </span>
              </div>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Stream Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Preview */}
            <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
              {isPreviewing ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-white">
                    <VideoCameraIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Click "Start Preview" to begin</p>
                  </div>
                </div>
              )}

              {/* Stream Overlay */}
              {isStreaming && (
                <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  LIVE
                </div>
              )}

              {/* Stream Stats Overlay */}
              {isStreaming && (
                <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <EyeIcon className="w-4 h-4" />
                      <span>{stats.viewers}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HeartIcon className="w-4 h-4" />
                      <span>{stats.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <SignalIcon className="w-4 h-4" />
                      <span className="text-green-400">{stats.streamHealth}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stream Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {!isStreaming ? (
                    <button
                      onClick={isPreviewing ? startStream : setupCamera}
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <PlayIcon className="w-5 h-5" />
                      {isPreviewing ? 'Go Live' : 'Start Preview'}
                    </button>
                  ) : (
                    <button
                      onClick={stopStream}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <StopIcon className="w-5 h-5" />
                      End Stream
                    </button>
                  )}

                  <button
                    onClick={toggleVideo}
                    className={`p-3 rounded-lg transition-colors ${
                      isVideoEnabled
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
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
                    className={`p-3 rounded-lg transition-colors ${
                      isAudioEnabled
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                    }`}
                  >
                    {isAudioEnabled ? (
                      <MicrophoneSolidIcon className="w-5 h-5" />
                    ) : (
                      <MicrophoneIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    Chat
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    <ShareIcon className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Stream Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Stream Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="stream-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={settings.title}
                    onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter stream title..."
                  />
                </div>
                <div>
                  <label htmlFor="stream-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={settings.category}
                    onChange={(e) => setSettings(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Gaming">Gaming</option>
                    <option value="Music">Music</option>
                    <option value="Education">Education</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Technology">Technology</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          {showChat && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 h-fit">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Live Chat
              </h3>

              <div
                ref={chatContainerRef}
                className="h-96 overflow-y-auto mb-4 space-y-2 border border-gray-200 dark:border-gray-600 rounded-lg p-3"
              >
                {chatMessages.map((message) => (
                  <div key={message.id} className="text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${
                        message.isOwner ? 'text-red-600' :
                        message.isModerator ? 'text-green-600' :
                        'text-gray-900 dark:text-white'
                      }`}>
                        {message.username}
                      </span>
                      {message.badges?.map((badge) => (
                        <span
                          key={badge}
                          className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{message.message}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <button
                  onClick={sendChatMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveStreamStudio;
