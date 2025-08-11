
import type React from 'react';

import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

export interface VideoQuality {
  label: string;
  value: string;
  height: number;
}

export interface Subtitle {
  label: string;
  src: string;
  srcLang: string;
}

interface VideoSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  qualities: VideoQuality;
  currentQuality: string;
  onQualityChange: (quality: any) => void;
  subtitles: Subtitle;
  currentSubtitle: string | null;
  onSubtitleChange: (subtitle: string | null) => void;
  autoplay: boolean;
  onAutoplayChange: (autoplay: any) => void;
  className?: string;
}

const VideoSettings: React.FC<VideoSettingsProps> = ({
  isOpen,
  onClose,
  qualities,
  currentQuality,
  onQualityChange,
  subtitles,
  currentSubtitle,
  onSubtitleChange,
  autoplay,
  onAutoplayChange,
  className = '',
}) => {
  if (!isOpen) {
return null;
}

  return (
    <div className={`absolute bottom-16 right-4 bg-black bg-opacity-90 text-white rounded-lg p-4 min-w-64 z-50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Settings</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close settings"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Quality Settings */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-2 text-gray-300">Quality</h4>
        <div className="space-y-1">
          {qualities.map((quality: any) => (
            <button
              key={quality.value}
              onClick={() => onQualityChange(quality.value)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                currentQuality === quality.value
                  ? 'bg-red-600 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{quality.label}</span>
                {currentQuality === quality.value && (
                  <CheckIcon className="w-4 h-4" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Subtitle Settings */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-2 text-gray-300">Subtitles</h4>
        <div className="space-y-1">
          <button
            onClick={() => onSubtitleChange(null)}
            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
              currentSubtitle === null
                ? 'bg-red-600 text-white'
                : 'hover:bg-gray-700 text-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>Off</span>
              {currentSubtitle === null && (
                <CheckIcon className="w-4 h-4" />
              )}
            </div>
          </button>
          {subtitles.map((subtitle: any) => (
            <button
              key={subtitle.srcLang}
              onClick={() => onSubtitleChange(subtitle.srcLang)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                currentSubtitle === subtitle.srcLang
                  ? 'bg-red-600 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{subtitle.label}</span>
                {currentSubtitle === subtitle.srcLang && (
                  <CheckIcon className="w-4 h-4" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Autoplay Settings */}
      <div>
        <h4 className="text-sm font-medium mb-2 text-gray-300">Autoplay</h4>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={autoplay}
            onChange={(e) => onAutoplayChange(e.target.checked)}
            className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
          />
          <span className="text-sm text-gray-300">Autoplay next video</span>
        </label>
      </div>
    </div>
  );
};

export default VideoSettings;