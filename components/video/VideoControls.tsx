import React from 'react';
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { MouseEvent } from 'react';
import { ChangeEvent } from 'react';
import { FC } from 'react';

import { ActionButton } from '../ui';

interface VideoControlsProps {
  isPlaying: boolean;,
  isMuted: boolean;
  isFullscreen: boolean;,
  volume: number;
  currentTime: number;,
  duration: number;
  playbackRate: number;,
  onPlayPause: () => void;
  onMuteToggle: () => void;,
  onVolumeChange: (volume: any) => void;,
  onSeek: (time: any) => void;,
  onFullscreenToggle: () => void;
  onPlaybackRateChange: (rate: any) => void;,
  onSettingsToggle: () => void;
  className?: string;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  isMuted,
  isFullscreen,
  volume,
  currentTime,
  duration,
  playbackRate,
  onPlayPause,
  onMuteToggle,
  onVolumeChange,
  onSeek,
  onFullscreenToggle,
  onPlaybackRateChange,
  onSettingsToggle,
  className = '' }) => {
  const formatTime: any = (time: any) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick: any = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime: any = (clickX / rect.width) * duration;
    onSeek(newTime);
  };

  const handleVolumeChange: any = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseFloat(e.target.value));
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`bg-gradient-to-t from-black/80 to-transparent p-4 ${className}`}>
      {/* Progress Bar */}
      <div
        className="w-full h-1 bg-gray-600 rounded-full cursor-pointer mb-4 group"
        onClick={(e: any) => handleProgressClick(e)}
      >
        <div
          className="h-full bg-red-600 rounded-full relative group-hover:h-1.5 transition-all"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Play/Pause */}
          <ActionButton
            onClick={(e: any) => onPlayPause(e)}
            ariaLabel={isPlaying ? 'Pause' : 'Play'}
            size="lg"
          >
            {isPlaying ? (
              <PauseIcon className="w-6 h-6" />
            ) : (
              <PlayIcon className="w-6 h-6" />
            )}
          </ActionButton>

          {/* Volume Controls */}
          <div className="flex items-center space-x-2 group">
            <ActionButton
              onClick={(e: any) => onMuteToggle(e)}
              ariaLabel={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="w-5 h-5" />
              ) : (
                <SpeakerWaveIcon className="w-5 h-5" />
              )}
            </ActionButton>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e: any) => handleVolumeChange(e)}
              className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Time Display */}
          <span className="text-white text-sm font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Playback Rate */}
          <select
            value={playbackRate}
            onChange={(e) => onPlaybackRateChange(parseFloat(e.target.value))}
            className="bg-black bg-opacity-50 text-white text-sm rounded px-2 py-1 border-none outline-none"
          >
            <option value={0.25}>0.25x</option>
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>

          {/* Settings */}
          <ActionButton
            onClick={(e: any) => onSettingsToggle(e)}
            ariaLabel="Settings"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </ActionButton>

          {/* Fullscreen */}
          <ActionButton
            onClick={(e: any) => onFullscreenToggle(e)}
            ariaLabel={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon className="w-5 h-5" />
            ) : (
              <ArrowsPointingOutIcon className="w-5 h-5" />
            )}
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default VideoControls;