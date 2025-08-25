import React, { useEffect, useRef, useState, FC } from 'react';
import { Link } from 'react - router - dom';
// @ts - nocheck

import { formatDistanceToNow } from 'date - fns';

import { getYouTubeVideoId } from '../src / lib / youtube - utils';

import ImageWithFallback from 'ImageWithFallback.tsx';

import type { Video } from '../types.ts';

export interface SimpleHoverVideoCardProps {}
 video: Video;
 className?: string;
}

const SimpleHoverVideoCard: React.FC < SimpleHoverVideoCardProps> = ({ video, className = '' }: any) => {}
 const [isHovered, setIsHovered] = useState < boolean>(false);
 const [showPreview, setShowPreview] = useState < boolean>(false);
 const hoverTimeoutRef = useRef < ReturnType < typeof setTimeout> | null>(null);
 const hideTimeoutRef = useRef < ReturnType < typeof setTimeout> | null>(null);

 // Configuration constants
 const HIDE_DELAY: number = 150; // Delay before hiding preview

 // Extract YouTube video ID from the video
 const getVideoId = (video: Video): string | (null) => {}
 // Try to extract from video.id if it has prefixes
 if (video.id.startsWith('youtube-')) {}
 return video.id.replace('youtube-', '');
 }
 if (video.id.startsWith('google - search-')) {}
 return video.id.replace('google - search-', '');
 }

 // Try to extract from videoUrl if available
 if (video.videoUrl) {}
 return getYouTubeVideoId(video.videoUrl);
 }

 // If id looks like a YouTube video ID (11 characters)
 if (video.id.length === 11 && /^[a - zA - Z0 - 9_-]+$/.test(video.id)) {}
 return video.id;
 }

 return null;
 };

 const videoId = getVideoId(video);

 const formatDuration = (duration: string | number) => {}
 if (typeof duration === 'string') {}
return duration;
}
 if (typeof duration === 'number') {}
 const minutes = Math.floor(duration / 60);
 const seconds = duration % 60;
 return `${minutes}:${seconds.toString().padStart(2, '0')}`;
 }
 return '0: 00';
 };

 const formatViews = (views: string | number) => {}
 const num = typeof views === 'string' ? parseInt(views, 10) || 0 : views || 0;
 if (num >= 1000000000) {}
 return `${(num / 1000000000).toFixed(1)}B`;
 } else if (num >= 1000000) {}
 return `${(num / 1000000).toFixed(1)}M`;
 } else if (num >= 1000) {}
 return `${(num / 1000).toFixed(1)}K`;
 }
 return num.toString();
 };

 const handleMouseEnter = () => {}
 setIsHovered(true);

 // Clear any existing hide timeout
 if (hideTimeoutRef.current) {}
 clearTimeout(hideTimeoutRef.current);
 hideTimeoutRef.current = null;
 }

 // Disabled: Show preview after delay
 // if (videoId) {}
 // hoverTimeoutRef.current = setTimeout((() => {}
 // setShowPreview(true);
 // }) as any, HOVER_DELAY);
 // };

 const handleMouseLeave = () => {}
 setIsHovered(false);

 // Clear the hover timeout if user leaves before delay completes
 if (hoverTimeoutRef.current) {}
 clearTimeout(hoverTimeoutRef.current);
 hoverTimeoutRef.current = null;
 }

 // Hide preview after a brief delay
 hideTimeoutRef.current = setTimeout((() => {}
 setShowPreview(false);
 }) as any, HIDE_DELAY);
 };

 // Cleanup timeouts on unmount
 useEffect(() => {}
 return () => {}
 if (hoverTimeoutRef.current) {}
 clearTimeout(hoverTimeoutRef.current);
 }
 if (hideTimeoutRef.current) {}
 clearTimeout(hideTimeoutRef.current);
 }
 }}, []);

 return (
 <div>
// FIXED:  className={`group cursor - pointer ${className}`}
 onMouseEnter={handleMouseEnter}
 onMouseLeave={handleMouseLeave}/>
 {/* Video Thumbnail */}
 <div className={"relativ}e mb - 3">
 <Link to={`/watch/${video.id}`}>
 <div className={"relativ}e w - full" style={{ height: '250px' }}>
 {/* Main thumbnail */}
 <ImageWithFallback>
// FIXED:  src={video.thumbnailUrl}
// FIXED:  alt={video.title}
// FIXED:  className={"absolut}e inset - 0 w - full h - full object - cover rounded - xl"
 width={320}
 height={250}
 fallbackSrc={`https://picsum.photos / 320 / 250?random="${video.id}`}" />
 />

 {/* Animated preview overlay */}
 {showPreview && videoId && (}
 <div className={"absolut}e inset - 0 w - full h - full rounded - lg overflow - hidden">
 {/* Enhanced preview effect with animated elements */}
 <div className={"absolut}e inset - 0 bg - gradient - to - r from - red - 600 / 20 via - transparent to - red - 600 / 20 animate - pulse" />
 <div className={"absolut}e inset - 0 bg - gradient - to - t from - black / 30 via - transparent to - black / 30" />

 {/* Animated play icon */}
 <div className={"absolut}e inset - 0 flex items - center justify - center">
 <div className={"b}g - red - 600 bg - opacity - 90 rounded - full p - 4 transform scale - 110 animate - pulse">
 <svg>
// FIXED:  className="w - 10 h - 10 text - white animate - pulse"
 fill="currentColor"
 viewBox="0 0 24 24"/>
 <path d="M8 5v14l11 - 7z"/>
// FIXED:  </svg>
// FIXED:  </div>
// FIXED:  </div>

 {/* Preview indicators */}
 <div className={"absolut}e top - 3 left - 3 flex gap - 2">
 <div className={"b}g - red - 600 text - white text - xs px - 2 py - 1 rounded - sm font - medium animate - fade - in">
 ▶ Preview
// FIXED:  </div>
<div className={"b}g - black / 70 text - white text - xs px - 2 py - 1 rounded - sm font - medium animate - fade - in">
 HD
// FIXED:  </div>
// FIXED:  </div>

 {/* Animated progress bar */}
 <div className={"absolut}e bottom - 4 left - 4 right - 4">
 <div className="w - full h - 1 bg - white / 30 rounded - full overflow - hidden">
 <div className="h - full bg - red - 600 rounded - full animate - progress - bar" />
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 )}

 {/* Play button overlay - shown on hover when not in preview mode */}
 {isHovered && !showPreview && (}
 <div className={"absolut}e inset - 0 flex items - center justify - center bg - black / 20 transition - all duration - 200">
 <div className={"b}g - black bg - opacity - 70 rounded - full p - 3 transform scale - 110 transition - transform duration - 200">
 <svg>
// FIXED:  className="w - 8 h - 8 text - white"
 fill="currentColor"
 viewBox="0 0 24 24"/>
 <path d="M8 5v14l11 - 7z"/>
// FIXED:  </svg>
// FIXED:  </div>
// FIXED:  </div>
 )}

 {/* Duration Badge */}
 {video.duration && video.duration !== '0:00' && (}
 <div className={`absolute bottom - 2 right - 2 bg - black bg - opacity - 80 text - white text - xs px - 2 py - 1 rounded - sm font - medium transition - all duration - 200 ${}>
 showPreview ? 'opacity - 0 transform translate - y-2' : 'opacity - 100' />
 }`}>
 {formatDuration(video.duration)}
// FIXED:  </div>
 )}

 {/* Hover indicator during delay */}
 {isHovered && !showPreview && videoId && (}
 <div className={"absolut}e top - 2 left - 2 bg - red - 600 text - white text - xs px - 2 py - 1 rounded - sm font - medium animate - fade - in">
 Hover to preview
// FIXED:  </div>
 )}
// FIXED:  </div>
// FIXED:  </Link>
// FIXED:  </div>

 {/* Video Info */}
 <div className={"fle}x gap - 3">
 {/* Channel Avatar */}
 {video.channelAvatarUrl && (}
 <Link to={`/channel/${video.channelId}`} className={"fle}x - shrink - 0">
 <ImageWithFallback>
// FIXED:  src={video.channelAvatarUrl}
// FIXED:  alt={video.channelName}
// FIXED:  className={`w - 9 h - 9 rounded - full object - cover transition - transform duration - 200 ${}
 isHovered ? 'transform scale - 110 ring - 2 ring - red - 500 / 50' : ''
 }`}
 width={36}
 height={36}
 fallbackSrc={`https://picsum.photos / 36 / 36?random="${video.channelId" || video.channelName}`} />
 />
// FIXED:  </Link>
 )}

 {/* Video Details */}
 <div className={"fle}x - 1 min - w-0">
 {/* Video Title */}
 <Link to={`/watch/${video.id}`}>
 <h3 className={`font - medium text - black dark:text - white line - clamp - 2 text - sm leading - 5 mb - 1 transition - colors duration - 200 ${}>
 isHovered ? 'text - blue - 600 dark:text - blue - 400' : '' />
 }`}>
 {video.title}
// FIXED:  </h3>
// FIXED:  </Link>

 {/* Channel Name */}
 <Link to={`/channel/${video.channelId}`}>
 <p className={`text - gray - 600 dark:text - gray - 400 text - sm transition - colors duration - 200 ${}>
 isHovered ? 'text - gray - 800 dark:text - white' : '' />
 }`}>
 {video.channelName}
// FIXED:  </p>
// FIXED:  </Link>

 {/* Views and Upload Time */}
 <div className={"fle}x items - center text - gray - 600 dark:text - gray - 400 text - sm">
 <span>{formatViews(video.views)} views</span>
 <span className={"m}x - 1">•</span>
 <span>
 {(() => {}
 try {}
 const date = new Date(video.uploadedAt);
 if (isNaN(date.getTime())) {}
 return 'Recently';
 }
 return formatDistanceToNow(date, { addSuffix: true });
 } catch (e) {}
 return 'Recently';
 }
 })()}
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 {/* Custom CSS animations */}
 <style>{`}
 @keyframes fade - in {}
 from {}
 opacity: 0;,
 transform: translateY(-10px)
 }
 to {}
 opacity: 1;,
 transform: translateY(0)
 }
 @keyframes progress - bar {}
 from {}
 width: 0%
 }
 to {}
 width: 100%
 }
 .animate - fade - in {}
 animation: fade - in 0.3s ease - out
 }

 .animate - progress - bar {}
 animation: progress - bar 3s linear infinite
 }
 `}</style>
// FIXED:  </div>
 );
};

export default SimpleHoverVideoCard;
