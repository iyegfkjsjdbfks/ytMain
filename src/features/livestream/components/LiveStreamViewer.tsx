import { useState, useEffect, useRef, type FC } from 'react';

import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  Cog6ToothIcon,
  ShareIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import {
  HandThumbUpIcon as ThumbsUpSolidIcon,
  BellIcon as BellSolidIcon,
} from '@heroicons/react/24/solid';

import { useLiveStream } from '@/hooks/useLiveStream';
import { liveStreamService } from '@/services/livestreamAPI';
import { conditionalLogger } from '@/utils/conditionalLogger';
import { createComponentError } from '@/utils/errorUtils';

import AdvancedLiveChat from './AdvancedLiveChat';
import LivePolls from './LivePolls';
import LiveQA from './LiveQA';
import SuperChatPanel from './SuperChatPanel';


interface LiveStreamViewerProps {
  streamId: string;
  className?: string;
}

interface ViewerStats {
  currentViewers: number;
  totalViews: number;
  likes: number;
  dislikes: number;
  isLiked: boolean;
  isDisliked: boolean;
  isSubscribed: boolean;
  hasNotifications: boolean;
}

interface QualityOption {
  label: string;
  value: string;
  bitrate: number;
}

interface LiveStreamViewerProps {
  streamId: string;
  className?: string;
}

const LiveStreamViewer: FC<LiveStreamViewerProps> = ({
  streamId,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [showChat, setShowChat] = useState(true);
  const [showPolls, setShowPolls] = useState(false);
  const [showQA, setShowQA] = useState(false);
  const [showSuperChat, setShowSuperChat] = useState(false);

  const { stream, isLoading: streamLoading, setStream } = useLiveStream();

  // Fetch stream data when component mounts
  useEffect(() => {
    const fetchStream = async () => {
      try {
        const streamData = await liveStreamService.streams.getStream(streamId);
        setStream(streamData);
      } catch (error) {
        const componentError = createComponentError('LiveStreamViewer', 'Failed to fetch stream', error);
        conditionalLogger.error('Failed to fetch stream:', componentError);
      }
    };

    if (streamId) {
      fetchStream();
    }
  }, [streamId, setStream]);

  const [viewerStats, setViewerStats] = useState<ViewerStats>({
    currentViewers: 1247,
    totalViews: 15432,
    likes: 342,
    dislikes: 12,
    isLiked: false,
    isDisliked: false,
    isSubscribed: false,
    hasNotifications: false,
  });

  const qualityOptions: QualityOption[] = [
    { label: '1080p60', value: '1080p60', bitrate: 6000 },
    { label: '1080p', value: '1080p', bitrate: 4500 },
    { label: '720p60', value: '720p60', bitrate: 4000 },
    { label: '720p', value: '720p', bitrate: 2500 },
    { label: '480p', value: '480p', bitrate: 1000 },
    { label: '360p', value: '360p', bitrate: 600 },
    { label: 'Auto', value: 'auto', bitrate: 0 },
  ];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
return;
}

    const handleTimeUpdate = () => {
      // Video time update
    };

    const handleLoadedMetadata = () => {
      // Video loaded
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    // Simulate real-time viewer count updates
    const interval = setInterval(() => {
      setViewerStats(prev => ({
        ...prev,
        currentViewers: prev.currentViewers + Math.floor(Math.random() * 20) - 10,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const togglePlayPause = () => {
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

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) {
return;
}

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) {
return;
}

    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) {
return;
}

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
    setShowSettings(false);
    // In a real implementation, this would change the video source
  };

  const handleLike = () => {
    setViewerStats(prev => ({
      ...prev,
      isLiked: !prev.isLiked,
      isDisliked: false,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
      dislikes: prev.isDisliked ? prev.dislikes - 1 : prev.dislikes,
    }));
  };

  const handleDislike = () => {
    setViewerStats(prev => ({
      ...prev,
      isDisliked: !prev.isDisliked,
      isLiked: false,
      dislikes: prev.isDisliked ? prev.dislikes - 1 : prev.dislikes + 1,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes,
    }));
  };

  const handleSubscribe = () => {
    setViewerStats(prev => ({
      ...prev,
      isSubscribed: !prev.isSubscribed,
    }));
  };

  const handleNotificationToggle = () => {
    setViewerStats(prev => ({
      ...prev,
      hasNotifications: !prev.hasNotifications,
    }));
  };


  const formatViewerCount = (count: number) => {
    if (count >= 1000000) {
return `${(count / 1000000).toFixed(1)}M`;
}
    if (count >= 1000) {
return `${(count / 1000).toFixed(1)}K`;
}
    return count.toString();
  };

  if (streamLoading) {
    return (
      <div className={`bg-black aspect-video rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p>Loading stream...</p>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className={`bg-gray-900 aspect-video rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-white text-center">
          <p className="text-xl mb-2">Stream not found</p>
          <p className="text-gray-400">This stream may have ended or is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-black rounded-lg overflow-hidden ${className}`}>
      <div className="relative">
        {/* Video Player */}
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster={stream.thumbnailUrl}
            autoPlay
            playsInline
          >
            <source src={stream.streamUrl} type="application/x-mpegURL" />
            Your browser does not support the video tag.
          </video>

          {/* Live Badge */}
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span>LIVE</span>
          </div>

          {/* Viewer Count */}
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
            <EyeIcon className="h-4 w-4" />
            <span>{formatViewerCount(viewerStats.currentViewers)}</span>
          </div>

          {/* Controls Overlay */}
          {showControls && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={togglePlayPause}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      {isPlaying ? (
                        <PauseIcon className="h-6 w-6" />
                      ) : (
                        <PlayIcon className="h-6 w-6" />
                      )}
                    </button>

                    <button
                      onClick={toggleMute}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      {isMuted ? (
                        <SpeakerXMarkIcon className="h-6 w-6" />
                      ) : (
                        <SpeakerWaveIcon className="h-6 w-6" />
                      )}
                    </button>

                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-20 h-1 bg-white/30 rounded-lg appearance-none slider"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      >
                        <Cog6ToothIcon className="h-6 w-6" />
                      </button>

                      {showSettings && (
                        <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-3 min-w-[150px]">
                          <h4 className="text-sm font-medium mb-2">Quality</h4>
                          <div className="space-y-1">
                            {qualityOptions.map(option => (
                              <button
                                key={option.value}
                                onClick={() => handleQualityChange(option.value)}
                                className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-white/20 ${
                                  selectedQuality === option.value ? 'text-blue-400' : ''
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={toggleFullscreen}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      {isFullscreen ? (
                        <ArrowsPointingInIcon className="h-6 w-6" />
                      ) : (
                        <ArrowsPointingOutIcon className="h-6 w-6" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stream Info */}
        <div className="bg-white dark:bg-gray-800 p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {stream.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>{formatViewerCount(viewerStats.currentViewers)} watching</span>
                <span>Started {stream.actualStartTime?.toLocaleTimeString()}</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  {stream.category}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-2 rounded-lg transition-colors ${
                  showChat
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
              </button>

              <button className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <ShareIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Creator Info and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={stream.creatorAvatar}
                alt={stream.creatorName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {stream.creatorName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  1.2M subscribers
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    viewerStats.isLiked
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {viewerStats.isLiked ? (
                    <ThumbsUpSolidIcon className="h-4 w-4" />
                  ) : (
                    <HandThumbUpIcon className="h-4 w-4" />
                  )}
                  <span className="text-sm">{formatViewerCount(viewerStats.likes)}</span>
                </button>

                <button
                  onClick={handleDislike}
                  className={`p-2 rounded-lg transition-colors ${
                    viewerStats.isDisliked
                      ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <HandThumbDownIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSubscribe}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewerStats.isSubscribed
                      ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {viewerStats.isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>

                {viewerStats.isSubscribed && (
                  <button
                    onClick={handleNotificationToggle}
                    className={`p-2 rounded-lg transition-colors ${
                      viewerStats.hasNotifications
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {viewerStats.hasNotifications ? (
                      <BellSolidIcon className="h-4 w-4" />
                    ) : (
                      <BellIcon className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Panels */}
      {showChat && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex">
            {/* Chat Panel */}
            <div className="flex-1">
              <AdvancedLiveChat
                streamId={streamId}
                isOwner={false}
                isModerator={false}
                className="h-96"
              />
            </div>

            {/* Side Panels */}
            <div className="w-80 border-l border-gray-200 dark:border-gray-700">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowPolls(true);
                    setShowQA(false);
                    setShowSuperChat(false);
                  }}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    showPolls
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Polls
                </button>
                <button
                  onClick={() => {
                    setShowQA(true);
                    setShowPolls(false);
                    setShowSuperChat(false);
                  }}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    showQA
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Q&A
                </button>
                <button
                  onClick={() => {
                    setShowSuperChat(true);
                    setShowPolls(false);
                    setShowQA(false);
                  }}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    showSuperChat
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Super Chat
                </button>
              </div>

              <div className="h-80 overflow-y-auto">
                {showPolls && (
                  <LivePolls
                    streamId={streamId}
                    isOwner={false}
                    className="p-4"
                  />
                )}
                {showQA && (
                  <LiveQA
                    streamId={streamId}
                    isOwner={false}
                    className="p-4"
                  />
                )}
                {showSuperChat && (
                  <SuperChatPanel
                    streamId={streamId}
                    className="p-4"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStreamViewer;