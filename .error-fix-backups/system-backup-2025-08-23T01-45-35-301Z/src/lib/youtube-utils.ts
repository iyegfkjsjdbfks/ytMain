import { logger } from '../utils / logger';

// YouTube utilities for video handling and API integration

// YouTube API type declarations
interface YT {
 Player: new (elementId, config: YTPlayerConfig) => YTPlayer;,
 PlayerState: {
 UNSTARTED: number;,
 ENDED: number;
 PLAYING: number;,
 PAUSED: number;
 BUFFERING: number;,
 CUED: number
 };
}

interface YTPlayerConfig {
 height: string | number;,
 width: string | number;
 videoId: string;
 playerVars?: {
 autoplay?: 0 | 1;
 controls?: 0 | 1;
 disablekb?: 0 | 1;
 enablejsapi?: 0 | 1;
 end?: number;
 fs?: 0 | 1;
 hl?: string;
 iv_load_policy?: 1 | 3;
 list?: string;
 listType?: 'playlist' | 'user_uploads';
 loop?: 0 | 1;
 modestbranding?: 0 | 1;
 origin?: string;
 playlist?: string;
 playsinline?: 0 | 1;
 rel?: 0 | 1;
 start?: number;
 widget_referrer?: string;
 };
 events?: {
 onReady?: (event: { target: YTPlayer }) => void;
 onStateChange?: (event: { target: YTPlayer; data: number }) => void;
 onPlaybackQualityChange?: (event: {,
 target: YTPlayer;
 data: string
 }) => void;
 onPlaybackRateChange?: (event: { target: YTPlayer; data: number }) => void;
 onError?: (event: { target: YTPlayer; data: number }) => void;
 onApiChange?: (event: { target: YTPlayer }) => void;
 };
}

interface YTPlayer {
 playVideo(): void;
 pauseVideo(): void;
 stopVideo(): void;
 seekTo(seconds, allowSeekAhead?: boolean): void;
 clearVideo(): void;
 getVideoLoadedFraction(): number;
 getPlayerState(): number;
 getCurrentTime(): number;
 getDuration(): number;
 getVideoUrl(): string;
 getVideoEmbedCode(): string;
 getPlaylist(): string;
 getPlaylistIndex(): number;
 setLoop(loopPlaylists): void;
 setShuffle(shufflePlaylist): void;
 getVolume(): number;
 setVolume(volume): void;
 mute(): void;
 unMute(): void;
 isMuted(): boolean;
 setSize(width, height): object;
 getPlaybackRate(): number;
 setPlaybackRate(suggestedRate): void;
 getAvailablePlaybackRates(): number;
 destroy(): void;
}

// Extend Window interface to include YT
declare global {
 interface Window {
 YT?: YT;
 onYouTubeIframeAPIReady?: () => void;
 }
/**
 * Extracts the video ID from a YouTube URL
 * @param url - YouTube URL (can be null or undefined)
 * @returns Video ID or null if not found
 */
export function getYouTubeVideoId(;
 url: string | null | undefined): string | null {
 if (!url) {
 return null;
 }

 try {
 // Handle youtu.be URLs (shortened)
 if (url.includes('youtu.be/')) {
 const id = url.split('youtu.be/')[1]?.split(/[?&#]/)[0];
 return id && id.length === 11 ? id : null;
 }

 // Handle regular YouTube URLs
 const regExp =;
 /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch(?:\?v=|\/))([^#&?]*).*/;
 const match = url.match(regExp);
 return match?.[1] ? match[1].substring(0, 11) : null;
 } catch (e) {
 logger.error('Error extracting YouTube video ID:', e);
 return null;
 }
/**
 * Type - safe wrapper for YouTube Player API
 */
  class YouTubePlayer {
 private player;

 constructor(
 private readonly elementId,
 private readonly videoId,
 private readonly options: {
 width?: number;
 height?: number;
 playerVars?: Record < string, any>;
 events?: {
 onReady?: (event: Event) => void;
 onStateChange?: (event: Event) => void
 };
 } = {}
 ) {
 this.initPlayer().catch(() => {
 // Handle initialization failure silently
 });
 }

 private loadYouTubeAPI(): Promise<any> < void> {
 return new Promise<any>((resolve) => {
 if (window.YT?.Player) {
 resolve();
 return;
 }

 const tag = document.createElement('script');
 tag.src = 'https://www.youtube.com / iframe_api';
 const firstScriptTag = document.getElementsByTagName('script')[0];

 if (firstScriptTag?.parentNode) {
 firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
 } else {
 // Fallback to appending to the document head if firstScriptTag is not available
 document.head.appendChild(tag);
 }

 // Preserve any existing callback
 const originalCallback = window.onYouTubeIframeAPIReady;
 (window).onYouTubeIframeAPIReady = () => {
 resolve();

 // Call the original callback if it exists
 if (originalCallback && typeof originalCallback === 'function') {
 originalCallback();
    };
  });
}

 private async initPlayer() {
 try {
 await this.loadYouTubeAPI();

 // Wait for YT.Player to be available
 const checkYT = () => {
 return new Promise<any> < void>((resolve) => {
 const check = () => {
 if (window.YT?.Player) {
 resolve();
 } else {
 setTimeout((check) as any, 100);
 };
 check();
 });
 };

 await checkYT();

 if (!window.YT) {
 throw new Error('YouTube API not available');
 }
 this.player = new window.YT.Player(this.elementId, {
 height: this.options.height || '360',
 width: this.options.width || '640',
 videoId: this.videoId,
 playerVars: {,
 playsinline: 1,
 origin: window.location.origin,
 ...this.options.playerVars },
 events: {,
 onReady: (event) => {
 this.options.events?.onReady?.(event);
 },
 onStateChange: (event) => {
 this.options.events?.onStateChange?.(event);
 }   });
} catch (error) {
 logger.error('Error initializing YouTube player:', error);
 }
 // Basic player controls
 playVideo(): Promise<any> < void> {
 return new Promise<any>((resolve, reject) => {
 if (this.player) {
 try {
 this.player.playVideo();
 resolve();
 } catch (error) {
 reject(error instanceof Error ? error : new Error(String(error)));
 }
 } else {
 reject(new Error('YouTube player not initialized'));
   });
}

 pauseVideo(): Promise<any> < void> {
 return new Promise<any>((resolve, reject) => {
 if (this.player) {
 try {
 this.player.pauseVideo();
 resolve();
 } catch (error) {
 reject(error instanceof Error ? error : new Error(String(error)));
 }
 } else {
 reject(new Error('YouTube player not initialized'));
   });
}

 stopVideo(): Promise<any> < void> {
 return new Promise<any>((resolve, reject) => {
 if (this.player) {
 try {
 this.player.stopVideo();
 resolve();
 } catch (error) {
 reject(error instanceof Error ? error : new Error(String(error)));
 }
 } else {
 reject(new Error('YouTube player not initialized'));
   });
}

 seekTo(seconds, allowSeekAhead: boolean = true): Promise<any> < void> {
 return new Promise<any>((resolve, reject) => {
 if (this.player) {
 try {
 this.player.seekTo(seconds, allowSeekAhead);
 resolve();
 } catch (error) {
 reject(error instanceof Error ? error : new Error(String(error)));
 }
 } else {
 reject(new Error('YouTube player not initialized'));
   });
}

 // Additional player methods
 getCurrentTime(): Promise<any> < number> {
 return new Promise<any>((resolve, reject) => {
 if (this.player) {
 try {
 const time = this.player.getCurrentTime();
 resolve(time);
 } catch (error) {
 reject(error instanceof Error ? error : new Error(String(error)));
 }
 } else {
 reject(new Error('YouTube player not initialized'));
   });
}

 getDuration(): Promise<any> < number> {
 return new Promise<any>((resolve, reject) => {
 if (this.player) {
 try {
 const duration = this.player.getDuration();
 resolve(duration);
 } catch (error) {
 reject(error instanceof Error ? error : new Error(String(error)));
 }
 } else {
 reject(new Error('YouTube player not initialized'));
   });
}

 getVolume(): Promise<any> < number> {
 return new Promise<any>((resolve, reject) => {
 if (this.player) {
 try {
 const volume = this.player.getVolume();
 resolve(volume);
 } catch (error) {
 reject(error instanceof Error ? error : new Error(String(error)));
 }
 } else {
 reject(new Error('YouTube player not initialized'));
   });
}

 setVolume(volume): Promise<any> < void> {
 return new Promise<any>((resolve, reject) => {
 if (this.player) {
 try {
 this.player.setVolume(volume);
 resolve();
 } catch (error) {
 reject(error instanceof Error ? error : new Error(String(error)));
 }
 } else {
 reject(new Error('YouTube player not initialized'));
   });
}

 isMuted(): Promise<any> < boolean> {
 return new Promise<any>((resolve, reject) => {
 if (this.player) {
 try {
 const isMuted = this.player.isMuted();
 resolve(isMuted);
 } catch (error) {
 reject(error instanceof Error ? error : new Error(String(error)));
 }
 } else {
 reject(new Error('YouTube player not initialized'));
   });
}

 mute(): Promise<any> < void> {
 return new Promise<any>((resolve, reject) => {
 if (this.player) {
 try {
 this.player.mute();
 resolve();
 } catch (error) {
 reject(error instanceof Error ? error : new Error(String(error)));
 }
 } else {
 reject(new Error('YouTube player not initialized'));
   });
}

 unMute(): Promise<any> < void> {
 return new Promise<any>((resolve, reject) => {
 if (this.player) {
 try {
 this.player.unMute();
 resolve();
 } catch (error) {
 reject(error instanceof Error ? error : new Error(String(error)));
 }
 } else {
 reject(new Error('YouTube player not initialized'));
   });
}

 destroy(): void {
 if (this.player) {
 this.player.destroy();
 this.player = null;
 }
}

// Utility function to safely handle YouTube embeds
  function embedYouTubeVideo(: string | number, containerId: string | number, videoId: string | number, options: {
 width?: number;
 height?: number;
 autoplay?: boolean;
 controls?: boolean;
 start?: number;
 end?: number;
 loop?: boolean;
 modestbranding?: boolean;
 rel?: boolean;
 showinfo?: boolean;
 } = {}): YouTubePlayer {
 // Validate container exists
 if (!document.getElementById(containerId) as HTMLElement) {
 throw new Error(`Container element with id "${containerId}" not found`);
 }

 // Validate video ID
 if (!videoId || typeof videoId !== 'string' || videoId.length !== 11) {
 throw new Error('Invalid YouTube video ID');
 }

 // Create player instance with default values
 const playerOptions = {
 width: options.width || 640,
 height: options.height || 360,
 playerVars: {,
 autoplay: options.autoplay ? 1 : 0,
 controls: options.controls !== false ? 1 : 0,
 start: options.start,
 end: options.end,
 loop: options.loop ? 1 : 0,
 modestbranding: options.modestbranding ? 1 : 0,
 rel: options.rel ? 1 : 0,
 showinfo: options.showinfo ? 1 : 0,
 enablejsapi: 1,
 origin: window.location.origin };

 return new YouTubePlayer(containerId, videoId, playerOptions);
}

// Type - safe function to check if a string is a valid YouTube URL
  function isYouTubeUrl(url: any): boolean {
 if (!url) {
 return false;
 }

 const patterns = [;
 /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
 /^https?:\/\/(?:www\.)?youtube\.com\/embed\/([^?]+)/,
 /^https?:\/\/youtu\.be\/([^?]+)/,
 /^https?:\/\/(?:www\.)?youtube\.com\/v\/([^?]+)/,
 /^https?:\/\/(?:www\.)?youtube\.com\/user\/[^/]+#p\/u\/\d+\/\w+/];

 return patterns.some(pattern => pattern.test(url));
}

// Type - safe function to get video ID from various YouTube URL formats
  function extractVideoIdFromUrl(: string | number, url: string | null | undefined): string | null {
 if (!url) {
 return null;
 }

 interface Pattern {
 regex: RegExp;,
 getter: (match: RegExpMatchArray<any>) => string | null
 }

 const patterns: Pattern[] = [;
 // youtu.be / ID
 {
 regex: /youtu\.be\/([^#&?/]+)/,
 getter: match => match[1] || null },
 // youtube.com / watch?v = ID
 {
 regex: /[?&]v=([^&#]+)/,
 getter: match => match[1] || null },
 // youtube.com / embed / ID
 {
 regex: /\/embed\/([^#&?/]+)/,
 getter: match => match[1] || null },
 // youtube.com / v/ID
 {
 regex: /\/v\/([^#&?/]+)/,
 getter: match => match[1] || null }];

 for (const { regex, getter } of patterns) {
 try {
 const match = url.match(regex);
 if (match) {
 const id = getter(match);
 if (id && id.length === 11) {
 return id;
 }
 } catch (e) {
 logger.warn('Error parsing YouTube URL:', e);
 continue;
 }
 return null;
}

// Type - safe YouTube player states
  enum YouTubePlayerState {
 UNSTARTED = -1,
 ENDED = 0,
 PLAYING = 1,
 PAUSED = 2,
 BUFFERING = 3,
 VIDEO_CUED = 5 }

// Type - safe interface for YouTube player events
  interface YouTubePlayerEvent {
 target: any;
 data: number
}

// Type - safe interface for YouTube player parameters
  interface YouTubePlayerParameters {
 autoplay?: 0 | 1;
 cc_load_policy?: 1;
 color?: 'red' | 'white';
 controls?: 0 | 1 | 2;
 disablekb?: 0 | 1;
 enablejsapi?: 0 | 1;
 end?: number;
 fs?: 0 | 1;
 hl?: string;
 iv_load_policy?: 1 | 3;
 list?: string;
 listType?: 'playlist' | 'user_uploads';
 loop?: 0 | 1;
 modestbranding?: 1;
 origin?: string;
 playlist?: string;
 playsinline?: 0 | 1;
 rel?: 0 | 1;
 showinfo?: 0 | 1;
 start?: number;
 wmode?: 'opaque' | 'transparent';
 theme?: 'dark' | 'light';
 autohide?: 0 | 1 | 2;
 cc_lang_pref?: string;
}
