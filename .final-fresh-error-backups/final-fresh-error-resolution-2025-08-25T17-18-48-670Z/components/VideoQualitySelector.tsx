import React, { MouseEvent, FC, useState, useEffect, useRef } from 'react';

import type { Video } from '../types.ts';

import { Cog6ToothIcon, CheckIcon, PlayIcon, SpeakerWaveIcon, SpeakerXIcon, ForwardIcon, BackwardIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';

export interface VideoQuality {
 label: string;
 value: string;
 resolution: string;
 bitrate?: number;
}

export interface PlaybackSpeed {
 label: string;
 value: number;
}

interface VideoQualitySelectorProps {
 qualities: VideoQuality;
 currentQuality: string;
 onQualityChange: (quality) => void;
 playbackSpeeds?: PlaybackSpeed;
 currentSpeed?: number;
 onSpeedChange?: (speed) => void;
 volume?: number;
 onVolumeChange?: (volume) => void;
 isPlaying?: boolean;
 onPlayPause?: () => void;
 isFullscreen?: boolean;
 onFullscreenToggle?: () => void;
 isPictureInPicture?: boolean;
 onPictureInPictureToggle?: () => void;
 className?: string;
}

const VideoQualitySelector: React.FC<VideoQualitySelectorProps> = ({
 qualities,
 currentQuality,
 onQualityChange,
 playbackSpeeds = [
 { label: '0.25x',
 value: 0.25 },
 { label: '0.5x',
 value: 0.5 },
 { label: '0.75x',
 value: 0.75 },
 { label: 'Normal',
 value: 1 },
 { label: '1.25x',
 value: 1.25 },
 { label: '1.5x',
 value: 1.5 },
 { label: '1.75x',
 value: 1.75 },
 { label: '2x',
 value: 2 }],
 currentSpeed = 1,
 onSpeedChange,
 volume = 100,
 onVolumeChange,
 isPlaying = false,
 onPlayPause,
 isFullscreen = false,
 onFullscreenToggle,
 isPictureInPicture = false,
 onPictureInPictureToggle,
 className = '' }) => {
 const [showSettings, setShowSettings] = useState<boolean>(false);
 const [activePanel, setActivePanel] = useState<'main' | 'quality' | 'speed'>('main');
 const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
 const settingsRef = useRef<HTMLDivElement>(null);
 const volumeRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
 setShowSettings(false);
 setActivePanel('main');
 }
 if (volumeRef.current && !volumeRef.current.contains(event.target as Node)) {
 setShowVolumeSlider(false);
 };

 document.addEventListener('mousedown', handleClickOutside as EventListener);
 return () => document.removeEventListener('mousedown', handleClickOutside as EventListener);
 }, []);

 const getCurrentQualityLabel = () => {
 const quality = qualities.find((q) => q.value === currentQuality);
 return quality?.label || 'Auto';
 };

 const getCurrentSpeedLabel = () => {
 const speed = playbackSpeeds.find((s) => s.value === currentSpeed);
 return speed?.label || 'Normal';
 };

 const handleQualitySelect = (qualityValue) => {
 onQualityChange(qualityValue);
 setShowSettings(false);
 setActivePanel('main');
 };

 const handleSpeedSelect = (speedValue) => {
 onSpeedChange?.(speedValue);
 setShowSettings(false);
 setActivePanel('main');
 };

 return (
 <div className={`flex items-center space-x-2 ${className}`}>
 {/* Play/Pause Button */}
 {onPlayPause && (
 <button />
// FIXED:  onClick={(e: any) => onPlayPause(e)}
// FIXED:  className={"p}-2 text-white hover:bg-white/20 rounded-full transition-colors"
// FIXED:  aria-label={isPlaying ? 'Pause' : 'Play'}
 >
 <PlayIcon className={`w-6 h-6 ${isPlaying ? 'hidden' : 'block'}`} />
 <div className={`w-6 h-6 ${isPlaying ? 'block' : 'hidden'}`}>
 <div className={"fle}x space-x-1">
 <div className={"w}-1.5 h-6 bg-white rounded-sm" />
 <div className={"w}-1.5 h-6 bg-white rounded-sm" />
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </button>
 )}

 {/* Skip Backward */}
 <button;>
// FIXED:  className={"p}-2 text-white hover:bg-white/20 rounded-full transition-colors"
// FIXED:  aria-label="Skip backward 10 seconds"/>
 <BackwardIcon className={"w}-5 h-5" />
// FIXED:  </button>

 {/* Skip Forward */}
 <button;>
// FIXED:  className={"p}-2 text-white hover:bg-white/20 rounded-full transition-colors"
// FIXED:  aria-label="Skip forward 10 seconds"/>
 <ForwardIcon className={"w}-5 h-5" />
// FIXED:  </button>

 {/* Volume Control */}
 <div className={"relative}" ref={volumeRef}>
 <button />
// FIXED:  onClick={() => setShowVolumeSlider(!showVolumeSlider)}
 onMouseEnter={() => setShowVolumeSlider(true)}
// FIXED:  className={"p}-2 text-white hover:bg-white/20 rounded-full transition-colors"
// FIXED:  aria-label="Volume"
 >
 {volume === 0 ? (
 <SpeakerXIcon className={"w}-5 h-5" />
 ) : (
 <SpeakerWaveIcon className={"w}-5 h-5" />
 )}
// FIXED:  </button>

 {/* Volume Slider */}
 {showVolumeSlider && (
 <div;>
// FIXED:  className={"absolut}e bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-3" />
 onMouseLeave={() => setShowVolumeSlider(false)}
 >
 <div className={"fle}x flex-col items-center space-y-2">
 <span className={"text}-white text-xs">{Math.round(volume)}%</span>
 <input;>
// FIXED:  type="range"
 min="0"
 max="100"
// FIXED:  value={volume} />
// FIXED:  onChange={(e: any) => onVolumeChange?.(parseInt(e.target.value, 10))}
// FIXED:  className={"w}-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider-vertical"
// FIXED:  style={{ writingMode: 'vertical-lr' as const WebkitAppearance: 'slider-vertical' }
 />
// FIXED:  </div>
// FIXED:  </div>
 )}
// FIXED:  </div>

 {/* Spacer */}
 <div className={"flex}-1" />

 {/* Picture-in-Picture */}
 {onPictureInPictureToggle && (
 <button />
// FIXED:  onClick={(e: any) => onPictureInPictureToggle(e)}
// FIXED:  className={`p-2 text-white hover:bg-white/20 rounded-full transition-colors ${
 isPictureInPicture ? 'bg-white/20' : ''
 }`}
// FIXED:  aria-label="Picture in Picture"
 >
 <div className={"w}-5 h-5 border-2 border-white rounded relative">
 <div className={"absolut}e top-0 right-0 w-2 h-1.5 border border-white bg-white/20 rounded-sm" />
// FIXED:  </div>
// FIXED:  </button>
 )}

 {/* Settings */}
 <div className={"relative}" ref={settingsRef}>
 <button />
// FIXED:  onClick={() => setShowSettings(!showSettings)}
// FIXED:  className={"p}-2 text-white hover:bg-white/20 rounded-full transition-colors"
// FIXED:  aria-label="Settings"
 >
 <Cog6ToothIcon className={"w}-5 h-5" />
// FIXED:  </button>

 {/* Settings Menu */}
 {showSettings && (
 <div className={"absolut}e bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg min-w-48 overflow-hidden">
 {activePanel === 'main' && (
 <div className={"py}-2">
 {/* Quality Option */}
 <button />
// FIXED:  onClick={() => setActivePanel('quality')}
// FIXED:  className={"w}-full px-4 py-2 text-left text-white hover:bg-white/20 transition-colors flex items-center justify-between"
 >
 <span>Quality</span>
 <span className={"text}-gray-300 text-sm">{getCurrentQualityLabel()}</span>
// FIXED:  </button>

 {/* Speed Option */}
 {onSpeedChange && (
 <button />
// FIXED:  onClick={() => setActivePanel('speed')}
// FIXED:  className={"w}-full px-4 py-2 text-left text-white hover:bg-white/20 transition-colors flex items-center justify-between"
 >
 <span>Playback speed</span>
 <span className={"text}-gray-300 text-sm">{getCurrentSpeedLabel()}</span>
// FIXED:  </button>
 )}

 {/* Subtitles/Captions */}
 <button className={"w}-full px-4 py-2 text-left text-white hover:bg-white/20 transition-colors flex items-center justify-between">
 <span>Subtitles/CC</span>
 <span className={"text}-gray-300 text-sm">Off</span>
// FIXED:  </button>

 {/* Audio Track */}
 <button className={"w}-full px-4 py-2 text-left text-white hover:bg-white/20 transition-colors flex items-center justify-between">
 <span>Audio track</span>
 <span className={"text}-gray-300 text-sm">Default</span>
// FIXED:  </button>
// FIXED:  </div>
 )}

 {activePanel === 'quality' && (
 <div className={"py}-2">
 {/* Back Button */}
 <button />
// FIXED:  onClick={() => setActivePanel('main')}
// FIXED:  className={"w}-full px-4 py-2 text-left text-white hover:bg-white/20 transition-colors border-b border-gray-600"
 >
 ← Quality;
// FIXED:  </button>

 {/* Auto Quality */}
 <button />
// FIXED:  onClick={() => handleQualitySelect('auto')}
// FIXED:  className={"w}-full px-4 py-2 text-left text-white hover:bg-white/20 transition-colors flex items-center justify-between"
 >
 <div>
 <div>Auto</div>
<div className={"text}-xs text-gray-400">Adjust to connection</div>
// FIXED:  </div>
 {currentQuality === 'auto' && <CheckIcon className={"w}-4 h-4" />}
// FIXED:  </button>

 {/* Quality Options */}
 {qualities.map((quality) => (
          <button;
          key={quality.value} />
// FIXED:  onClick={() => handleQualitySelect(quality.value)}
// FIXED:  className={"w}-full px-4 py-2 text-left text-white hover:bg-white/20 transition-colors flex items-center justify-between"
 >
 <div>
 <div>{quality.label}</div>
<div className={"text}-xs text-gray-400">{quality.resolution}</div>
// FIXED:  </div>
 {currentQuality === quality.value && <CheckIcon className={"w}-4 h-4" />}
// FIXED:  </button>
 ))}
// FIXED:  </div>
 )}

 {activePanel === 'speed' && (
 <div className={"py}-2">
 {/* Back Button */}
 <button />
// FIXED:  onClick={() => setActivePanel('main')}
// FIXED:  className={"w}-full px-4 py-2 text-left text-white hover:bg-white/20 transition-colors border-b border-gray-600"
 >
 ← Playback speed;
// FIXED:  </button>

 {/* Speed Options */}
 {playbackSpeeds.map((speed) => (
          <button;
          key={speed.value} />
// FIXED:  onClick={() => handleSpeedSelect(speed.value)}
// FIXED:  className={"w}-full px-4 py-2 text-left text-white hover:bg-white/20 transition-colors flex items-center justify-between"
 >
 <span>{speed.label}</span>
 {currentSpeed === speed.value && <CheckIcon className={"w}-4 h-4" />}
// FIXED:  </button>
 ))}
// FIXED:  </div>
 )}
// FIXED:  </div>
 )}
// FIXED:  </div>

 {/* Fullscreen */}
 {onFullscreenToggle && (
 <button />
// FIXED:  onClick={(e: any) => onFullscreenToggle(e)}
// FIXED:  className={"p}-2 text-white hover:bg-white/20 rounded-full transition-colors"
// FIXED:  aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
 >
 {isFullscreen ? (
 <ArrowsPointingInIcon className={"w}-5 h-5" />
 ) : (
 <ArrowsPointingOutIcon className={"w}-5 h-5" />
 )}
// FIXED:  </button>
 )}
// FIXED:  </div>
 );
};

export default VideoQualitySelector;
