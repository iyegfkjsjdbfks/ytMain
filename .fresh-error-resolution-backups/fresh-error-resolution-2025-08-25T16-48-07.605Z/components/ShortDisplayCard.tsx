import { useLocation } from 'react-router-dom';
import React, { useState, useRef, useEffect, FC, MouseEvent } from 'react';
import { useLocation } from 'react - router - dom';
// @ts - nocheck - Temporary during refactoring;
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXIcon, HeartIcon, ChatBubbleLeftIcon, ShareIcon } from '@heroicons / react / 24 / outline';
import { HeartIcon as HeartIcon } from '@heroicons / react / 24 / solid';
const HeartIconSolid = HeartIcon;

import { useIntersectionObserver, useVideoAutoplay } from '../hooks/index.ts';
import { useVideoPlayer } from '../src / hooks / useVideoPlayer';

import LoadingSpinner from 'LoadingSpinner';
import { ActionButton, ErrorMessage } from 'ui/index.ts';

import type { Short } from '../src / types / core'
export interface ShortDisplayCardProps {}
 short: Short;
 isLiked?: boolean;
 isFollowed?: boolean;
 onLike?: (shortId: any) => void;
 onFollow?: (channelName: any) => void;
 onComment?: (shortId: any) => void;
 onShare?: (shortId: any) => void;
 onVideoChange?: () => void;
 onVideoEnd?: () => void;
 isActive?: boolean;
}

// Video - specific components;

// Extracted PlayPauseOverlay component
export interface PlayPauseOverlayProps {}
 isPlaying: boolean;,
 onToggle: () => void;
}

const PlayPauseOverlay: React.FC < PlayPauseOverlayProps> = ({ isPlaying, onToggle }: any) => (
 <div;>
// FIXED:  className={"absolut}e inset - 0 flex items - center justify - center cursor - pointer" />
// FIXED:  onClick={(e: React.MouseEvent) => {}
 e.stopPropagation();
 onToggle();
 }
 >
 <button;>
// FIXED:  className={`}
 bg - black bg - opacity - 50 text - white p - 4 rounded - full; 
 transition - opacity duration - 200 pointer - events - none;
 ${!isPlaying ? 'opacity - 100' : 'opacity - 0 group - hover:opacity - 100 hover:opacity - 100'}
 hover:bg - opacity - 70;
 `}
// FIXED:  aria - label={isPlaying ? 'Pause video' : 'Play video'}/>
 {isPlaying ? (}
 <PauseIcon className="w - 8 h - 8" />
 ) : (
 <PlayIcon className="w - 8 h - 8" />
 )}
// FIXED:  </button>
// FIXED:  </div>
);

// Extracted VideoInfo component
export interface VideoInfoProps {}
 title: string;,
 channelName: string;
 views: string;,
 isFollowed: boolean;
 onFollow: (() => void) | undefined;
}

const VideoInfo: React.FC < VideoInfoProps> = ({}
 title,
 channelName,
 views,
 isFollowed = false,
 onFollow }) => (
 <div className={"fle}x - 1 mr - 4 pointer - events - auto">
 <h3 className={"tex}t - white font - medium text - sm mb - 1 line - clamp - 2">
 {title}
// FIXED:  </h3>
 <p className={"tex}t - gray - 300 text - xs mb - 2">
 {channelName} • {views}
// FIXED:  </p>
 {onFollow && (}
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => {}
 e.stopPropagation();
 onFollow();
 }
// FIXED:  className={`px - 3 py - 1 text - xs font - medium rounded - full transition - colors ${}
 isFollowed;
 ? 'bg - gray - 600 text - white hover:bg - gray - 700'
 : 'bg - white text - black hover:bg - gray - 200'
 }`}
 >
 {isFollowed ? 'Following' : 'Follow'}
// FIXED:  </button>
 )}
// FIXED:  </div>
);

// Extracted ActionButtons component
export interface ActionButtonsProps {}
 isMuted: boolean;,
 isLiked: boolean;
 onToggleMute: () => void;,
 onLike: (e: React.MouseEvent) => void;,
 onComment: (e: React.MouseEvent) => void;,
 onShare: (e: React.MouseEvent) => void;
}

const ActionButtons: React.FC < ActionButtonsProps> = ({}
 isMuted,
 isLiked,
 onToggleMute,
 onLike,
 onComment,
 onShare }) => (
 <div className={"fle}x flex - col space - y - 3 pointer - events - auto">
 {/* Mute / Unmute */}
 <ActionButton />
// FIXED:  onClick={(e: React.MouseEvent) => {}
 e.stopPropagation();
 onToggleMute();
 }
 ariaLabel={isMuted ? 'Unmute video' : 'Mute video'}
 >
 {isMuted ? (}
 <SpeakerXIcon className="w - 5 h - 5" />
 ) : (
 <SpeakerWaveIcon className="w - 5 h - 5" />
 )}
// FIXED:  </ActionButton>

 {/* Like */}
 <ActionButton />
// FIXED:  onClick={(e: React.MouseEvent) => onLike(e)}
 ariaLabel="Like video"
 >
 {isLiked ? (}
 <HeartIconSolid className="w - 5 h - 5 text - red - 500" />
 ) : (
 <HeartIcon className="w - 5 h - 5" />
 )}
// FIXED:  </ActionButton>

 {/* Comment */}
 <ActionButton />
// FIXED:  onClick={(e: React.MouseEvent) => onComment(e)}
 ariaLabel="Comment on video"
 >
 <ChatBubbleLeftIcon className="w - 5 h - 5" />
// FIXED:  </ActionButton>

 {/* Share */}
 <ActionButton />
// FIXED:  onClick={(e: React.MouseEvent) => onShare(e)}
 ariaLabel="Share video"
 >
 <ShareIcon className="w - 5 h - 5" />
// FIXED:  </ActionButton>
// FIXED:  </div>
);

// Extracted LoadingIndicator component;
const LoadingIndicator: React.FC = () => (
 <div className={"absolut}e inset - 0 flex items - center justify - center bg - black bg - opacity - 50">
 <LoadingSpinner size="md" color="white" />
// FIXED:  </div>
);

// Extracted ErrorState component
export interface ErrorStateProps {}
 error: string;,
 onRetry: () => void;
}

const ErrorState: React.FC < ErrorStateProps> = ({ error, onRetry }: any) => (
 <ErrorMessage;>
 message={error}
 onRetry={onRetry}
 variant="overlay"
 showIcon={false} />
 />
);

// Main component;
const ShortDisplayCard: React.FC < ShortDisplayCardProps> = ({}
 short,
 isLiked = false,
 isFollowed = false,
 onLike,
 onFollow,
 onComment,
 onShare,
 onVideoChange,
 onVideoEnd,
 isActive = false }) => {}
 const location = useLocation();
 const isOnShortsPage = location.pathname === '/shorts';
 const [isManuallyPaused, setIsManuallyPaused] = React.useState < boolean>(false);

 // Real video player implementation;
 const videoPlayer = useVideoPlayer({}
 autoplay: false,
 muted: true,
 loop: true });

 const videoRef = useRef < HTMLVideoElement>(null);

 // Set video ref when component mounts;
 useEffect(() => {}
 if (videoRef.current) {}
 videoPlayer.setVideoRef(videoRef.current);
 }

 }, [videoPlayer]);

 // Use intersection observer for visibility tracking and autoplay;
 const { ref: intersectionRef, isIntersecting } = useIntersectionObserver({}
 threshold: 0.7,
 rootMargin: '0px' });

 // Enable autoplay when video is in view (both on shorts page and home page)
 useVideoAutoplay({}
 isIntersecting,
 isPlaying: videoPlayer.isPlaying,
 isManuallyPaused,
 actions: { }
 play: videoPlayer.play,
 pause: videoPlayer.pause,
 unmute: videoPlayer.unmute },
 setIsManuallyPaused,
 enableAutoplay: true, // Enable autoplay on both shorts page and home page,
 unmuteOnAutoplay: isOnShortsPage, // Only unmute on autoplay when on shorts page;
 });

 // Event handlers;
 const handlePlayPauseToggle = async (): Promise<any> < void> => {}
 try {}
 if (videoPlayer.isPlaying) {}
 videoPlayer.pause();
 setIsManuallyPaused(true);
 } else {}
 await videoPlayer.play();
 setIsManuallyPaused(false);
 }
 } catch (error) {}
 (console).warn('Error toggling play / pause:', error);
 };

 const handleLike = (e: React.MouseEvent) => {}
 e.stopPropagation();
 onLike?.(short.id);
 };

 const handleComment = (e: React.MouseEvent) => {}
 e.stopPropagation();
 onComment?.(short.id);
 };

 const handleShare = (e: React.MouseEvent) => {}
 e.stopPropagation();
 onShare?.(short.id);
 };

 const handleRetry = async (): Promise<any> < void> => {}
 if (videoRef.current) {}
 videoRef.current.load();
 };

 const handleFollow = () => {}
 onFollow?.(short.channelName);
 };

 const handleVideoEnd = () => {}
 onVideoEnd?.();
 };

 // Notify parent when video becomes active;
 React.useEffect(() => {}
 if (isActive && onVideoChange) {}
 onVideoChange();
 }

 }, [isActive, onVideoChange]);

 return (
 <div />
 ref={intersectionRef as React.RefObject < HTMLDivElement>}
// FIXED:  className={`relative bg - black overflow - hidden group cursor - pointer ${}
 isOnShortsPage;
 ? 'w - full h - full'
 : 'w - 40 h - 72 rounded - lg'
 }`}
 >
 {/* Real video element */}
 <video;>
 ref={videoRef}
// FIXED:  src={short.videoUrl}
 poster={short.thumbnailUrl}
// FIXED:  className="w - full h - full object - cover cursor - pointer"
 playsInline;
 muted={videoPlayer.isMuted}
 loop;
 preload="metadata" />
// FIXED:  onClick={(e: React.MouseEvent) => handlePlayPauseToggle(e)}
 onEnded={() => {}
 handleVideoEnd();
 }
 />

 {/* Loading Indicator */}
 {videoPlayer.isLoading && <LoadingIndicator />}

 {/* Error State */}
 {videoPlayer.error && (}
 <ErrorState;>
 error={videoPlayer.error.message}
 onRetry={handleRetry} />
 />
 )}

 {/* Play / Pause Overlay */}
 <PlayPauseOverlay;>
 isPlaying={videoPlayer.isPlaying}
 onToggle={handlePlayPauseToggle} />
 />

 {/* Video Info Overlay */}
 <div className={"absolut}e bottom - 0 left - 0 right - 0 bg - gradient - to - t from - black / 80 to - transparent p - 4 pointer - events - none">
 <div className={"fle}x items - end justify - between">
 <VideoInfo;>
 title={short.title}
 channelName={short.channelName}
 views={short.views}
 isFollowed={isFollowed}
 onFollow={onFollow ? handleFollow : undefined} />
 />

 {/* Action Buttons */}
 <ActionButtons;>
 isMuted={videoPlayer.isMuted}
 isLiked={isLiked}
 onToggleMute={videoPlayer.toggleMute}
 onLike={handleLike}
 onComment={handleComment}
 onShare={handleShare} />
 />
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
}
export default ShortDisplayCard;

// Export video - specific sub - components for reuse in other parts of the application
export { PlayPauseOverlay, VideoInfo, ActionButtons, LoadingIndicator, ErrorState };
