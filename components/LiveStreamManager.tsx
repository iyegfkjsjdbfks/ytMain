/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined
  }
  interface Process {
    env: ProcessEnv;
  }
}

import { useRef, useEffect, useState, FC } from 'react';

import { PauseIcon, PlayIcon } from '@heroicons/react/24/outline';
import { VideoCameraIcon as VideoCameraSolidIcon, MicrophoneIcon as MicrophoneSolidIcon } from '@heroicons/react/24/solid';
import { EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/outline';
import { StopIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
const VideoCameraIconSolid = VideoCameraSolidIcon;
const MicrophoneIconSolid = MicrophoneSolidIcon;

interface LiveStreamSettings {
  title: string;,
  description: string;
  category: string;,
  privacy: 'public' | 'unlisted' | 'private';
  enableChat: boolean;,
  enableDonations: boolean;
  maxViewers?: number;
  scheduledStartTime?: string;
}

interface ChatMessage {
  id: string;,
  username: string;
  message: string;,
  timestamp: string;
  isModerator: boolean;,
  isOwner: boolean;
  donation?: {
    amount: number;,
    currency: string;
  }}

interface LiveStreamStats {
  viewers: number;,
  likes: number;
  messages: number;,
  duration: number;
  peakViewers: number;,
  totalDonations: number
}

interface LiveStreamManagerProps {
  onStreamStart?: (settings: LiveStreamSettings) => void;
  onStreamEnd?: (stats: LiveStreamStats) => void;
  className?: string;
}

const LiveStreamManager: React.FC<LiveStreamManagerProps> = ({
  onStreamStart,
  onStreamEnd,
  className = '' }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [settings, setSettings] = useState<LiveStreamSettings>({
    title: '',
          description: '',
    category: 'Gaming',
          privacy: 'public',
    enableChat: true,
          enableDonations: true });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [stats, setStats] = useState<LiveStreamStats>({
    viewers: 0,
          likes: 0,
    messages: 0,
          duration: 0,
    peakViewers: 0,
          totalDonations: 0 });
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const streamStartTime = useRef<number>(0);
  const statsInterval = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatInterval = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (statsInterval.current) {
clearInterval(statsInterval.current);
}
      if (chatInterval.current) {
clearInterval(chatInterval.current);
}
    }}, [stream]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const setupStream = async () => {
    setIsSettingUp(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 } },
          audio: {,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true } });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera/microphone. Please check permissions.');
    } finally {
      setIsSettingUp(false);
    }
  };

  const startStream = async () => {
    if (!stream) {
      await setupStream();
      return;
    }

    if (!settings.title.trim()) {
      alert('Please enter a stream title');
      return;
    }

    setIsStreaming(true);
    streamStartTime.current = Date.now();

    // Start stats tracking
    statsInterval.current = setInterval(() => {
      setStats(prev => {
        const newViewers = Math.floor(Math.random() * 50) + prev.viewers + (Math.random() > 0.7 ? 1 : -1);
        const viewers = Math.max(0, newViewers);
        const duration = Math.floor((Date.now() - streamStartTime.current) / 1000);

        return {
          ...prev,
          viewers,
          duration,
          peakViewers: Math.max(prev.peakViewers, viewers),
          likes: prev.likes + (Math.random() > 0.9 ? 1 : 0) 
        }});
    }, 2000);

    // Start chat simulation
    chatInterval.current = setInterval(() => {
      if (Math.random() > 0.7) {
        generateRandomChatMessage();
      }
    
        }, 3000);

    onStreamStart?.(settings);
  };

  const pauseStream = () => {
    setIsPaused(!isPaused);
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = isPaused;
      });
    }
  };

  const stopStream = () => {
    setIsStreaming(false);
    setIsPaused(false);

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (statsInterval.current) {
      clearInterval(statsInterval.current);
      statsInterval.current = null;
    }

    if (chatInterval.current) {
      clearInterval(chatInterval.current);
      chatInterval.current = null;
    }

    onStreamEnd?.(stats);
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const generateRandomChatMessage = () => {
    const usernames = ['StreamFan123', 'GamerPro', 'MusicLover', 'TechGuru', 'ChatMaster', 'ViewerOne', 'StreamWatcher'];
    const messages = [
      'Great stream!',
      'Love this content',
      'Keep it up!',
      'Amazing quality',
      'First time here, loving it!',
      'Can you do a tutorial on this?',
      'This is so cool!',
      'Thanks for streaming!',
      'How long have you been doing this?',
      'Your setup is incredible!'];

    const username = usernames[Math.floor(Math.random() * usernames.length)] || 'Anonymous';
    const message = messages[Math.floor(Math.random() * messages.length)] || 'Hello!';
    const isDonation = Math.random() > 0.95;

    const newMessage: ChatMessage = {,
      id: Date.now().toString(),
      username,
      message: isDonation ? `${message} 💰` : message,
          timestamp: new Date().toISOString(),
      isModerator: Math.random() > 0.9,
          isOwner: false,
      ...(isDonation && {
        donation: {,
          amount: Math.floor(Math.random() * 50) + 5,
          currency: 'USD' } }) };

    setChatMessages(prev => [...prev.slice(-49), newMessage]);
    setStats(prev => ({
      ...prev,
      messages: prev.messages + 1,
          totalDonations: prev.totalDonations + (newMessage.donation?.amount || 0) }));
  };

  const sendChatMessage = () => {
    if (!newMessage.trim()) {
return;
}

    const message: ChatMessage = {,
      id: Date.now().toString(),
          username: 'You',
      message: newMessage,
          timestamp: new Date().toISOString(),
      isModerator: false,
          isOwner: true };

    setChatMessages(prev => [...prev.slice(-49), message]);
    setStats(prev => ({ ...prev, messages: prev.messages + 1 }));
    setNewMessage('');
  };

  const formatDuration = (seconds: any): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const categories = ['Gaming', 'Music', 'Technology', 'Education', 'Entertainment', 'Sports', 'News', 'Cooking', 'Art', 'Science'];

  return (
    <div className={`bg-neutral-50 dark:bg-neutral-900 ${className}`}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stream Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Preview */}
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              {stream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <VideoCameraIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Camera not connected</p>
                    <p className="text-sm opacity-75">Click "Start Stream" to begin</p>
                  </div>
                </div>
              )}

              {/* Stream Status Overlay */}
              {isStreaming && (
                <div className="absolute top-4 left-4 flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-sm font-medium">LIVE</span>
                  </div>
                  <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {formatDuration(stats.duration)}
                  </div>
                </div>
              )}

              {/* Stream Stats Overlay */}
              {isStreaming && (
                <div className="absolute top-4 right-4 space-y-2">
                  <div className="flex items-center space-x-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    <EyeIcon className="w-4 h-4" />
                    <span>{stats.viewers}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    <HeartIcon className="w-4 h-4" />
                    <span>{stats.likes}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Stream Controls */}
            <div className="flex items-center justify-between bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center space-x-3">
                {!isStreaming ? (
                  <button
                    onClick={startStream}
                    disabled={isSettingUp}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <PlayIcon className="w-5 h-5" />
                    <span>{isSettingUp ? 'Setting up...' : 'Start Stream'}</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={pauseStream}
                      className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {isPaused ? <PlayIcon className="w-5 h-5" /> : <PauseIcon className="w-5 h-5" />}
                      <span>{isPaused ? 'Resume' : 'Pause'}</span>
                    </button>
                    <button
                      onClick={stopStream}
                      className="flex items-center space-x-2 bg-neutral-600 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <StopIcon className="w-5 h-5" />
                      <span>Stop</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleAudio}
                    className={`p-2 rounded-lg transition-colors ${
                      audioEnabled
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}
                    title={audioEnabled ? 'Mute audio' : 'Unmute audio'}
                  >
                    {audioEnabled ? (
                      <MicrophoneIconSolid className="w-5 h-5" />
                    ) : (
                      <MicrophoneIcon className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    onClick={toggleVideo}
                    className={`p-2 rounded-lg transition-colors ${
                      videoEnabled
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}
                    title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
                  >
                    {videoEnabled ? (
                      <VideoCameraIconSolid className="w-5 h-5" />
                    ) : (
                      <VideoCameraIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 px-3 py-2 rounded-lg transition-colors"
                >
                  <ChatBubbleLeftIcon className="w-5 h-5" />
                  <span>Chat</span>
                </button>

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 px-3 py-2 rounded-lg transition-colors"
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                  <span>Settings</span>
                </button>
              </div>
            </div>

            {/* Stream Settings */}
            {showSettings && (
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Stream Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="stream-title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Stream Title *
                    </label>
                    <input
                      id="stream-title"
                      type="text"
                      value={settings.title}
                      onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter stream title"
                    />
                  </div>

                  <div>
                    <label htmlFor="stream-category" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Category
                    </label>
                    <select
                      id="stream-category"
                      value={settings.category}
                      onChange={(e) => setSettings(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="stream-privacy" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Privacy
                    </label>
                    <select
                      id="stream-privacy"
                      value={settings.privacy}
                      onChange={(e) => setSettings(prev => ({ ...prev, privacy: e.target.value as 'public' | 'unlisted' | 'private' }))}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="public">Public</option>
                      <option value="unlisted">Unlisted</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label htmlFor="enable-chat" className="flex items-center space-x-2">
                      <input
                        id="enable-chat"
                        type="checkbox"
                        checked={settings.enableChat}
                        onChange={(e) => setSettings(prev => ({ ...prev, enableChat: e.target.checked }))}
                        className="rounded border-neutral-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Enable Chat</span>
                    </label>

                    <label htmlFor="enable-donations" className="flex items-center space-x-2">
                      <input
                        id="enable-donations"
                        type="checkbox"
                        checked={settings.enableDonations}
                        onChange={(e) => setSettings(prev => ({ ...prev, enableDonations: e.target.checked }))}
                        className="rounded border-neutral-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Enable Donations</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="stream-description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="stream-description"
                    value={settings.description}
                    onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your stream..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Chat and Stats Sidebar */}
          {showChat && (
            <div className="space-y-4">
              {/* Stream Stats */}
              {isStreaming && (
                <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Live Stats</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-neutral-600 dark:text-neutral-400">Viewers</p>
                      <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{stats.viewers}</p>
                    </div>
                    <div>
                      <p className="text-neutral-600 dark:text-neutral-400">Peak</p>
                      <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{stats.peakViewers}</p>
                    </div>
                    <div>
                      <p className="text-neutral-600 dark:text-neutral-400">Likes</p>
                      <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{stats.likes}</p>
                    </div>
                    <div>
                      <p className="text-neutral-600 dark:text-neutral-400">Messages</p>
                      <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{stats.messages}</p>
                    </div>
                    {settings.enableDonations && stats.totalDonations > 0 && (
                      <div className="col-span-2">
                        <p className="text-neutral-600 dark:text-neutral-400">Donations</p>
                        <p className="text-xl font-bold text-green-600">${stats.totalDonations}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Live Chat */}
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 flex flex-col h-96">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Live Chat</h3>
                </div>

                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-2"
                >
                  {chatMessages.length === 0 ? (
                    <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">
                      No messages yet. Start the conversation!
                    </p>
                  ) : (
                    chatMessages.map((message) => (
                      <div key={message.id} className="flex items-start space-x-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${
                              message.isOwner
                                ? 'text-red-600 dark:text-red-400'
                                : message.isModerator
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-neutral-900 dark:text-neutral-100'
                            }`}>
                              {message.username}
                              {message.isOwner && ' (You)'}
                              {message.isModerator && ' (Mod)'}
                            </span>
                            {message.donation && (
                              <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded-full">
                                ${message.donation.amount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">
                            {message.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={sendChatMessage}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveStreamManager;