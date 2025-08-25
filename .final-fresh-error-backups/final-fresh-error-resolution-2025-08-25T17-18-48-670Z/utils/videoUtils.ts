import type { Video } from '../src/types/core.ts';

export function getVideoThumbnail(video: Video): string {
 return video.thumbnailUrl || '';
}

export function getChannelAvatar(video: Video): string {
 return video.channelAvatarUrl || '';
}

export function getViewCount(video: Video): string | number {
 if (video.views) {
return video.views;
}
 if (video.viewCount !== undefined) {
return formatViewCount(video.viewCount);
}
 return 0;
}

export function formatViewCount(count): string {
 if (count >= 1000000) {
 return `${(count / 1000000).toFixed(1)}M`;
 }
 if (count >= 1000) {
 return `${(count / 1000).toFixed(1)}K`;
 }
 return count.toString();
}

export function isVideoLive(video: Video): boolean {
 return !!video.isLive;
}

export function getVideoDuration(video: Video): string {
 if (isVideoLive(video)) {
 return video.viewCount ? `${video.viewCount} watching` : 'Live';
 }
 return video.duration || '';
}

export function getVideoAspectRatio(video: Video): number {
 return video.isShort ? 9 / 16 : 16 / 9;
}

export function getVideoPrivacyBadge(video: Video): string | null {
 if (!video.privacyStatus) {
return null;
}

 switch (video.privacyStatus) {
 case 'private':
 return 'Private';
 case 'unlisted':
 return 'Unlisted';
    default:
      return null;
  }
}
export function getVideoTags(video: Video): string[] {
 const tags = video.tags;
 if (!tags || (Array.isArray(tags) && tags.length === 0) || (typeof tags === 'string' && tags.trim() === '')) {
 return [];
 }
 if (Array.isArray(tags)) {
 return tags.map((tag) => tag.trim()).slice(0, 5);
 }
 // Split comma-separated string and return first 5
 return tags.split(',').map((tag) => tag.trim()).slice(0, 5);
}

export function getVideoUploadDate(video: Video): string {
 return video.uploadedAt || '';
}

export function isVideoMonetized(video): boolean {
 return !!(video.monetization?.enabled);
}

export function getVideoDimensions(video: Video): { width: number; height: number } {
 const aspectRatio = getVideoAspectRatio(video);
 const width = 1280; // Default width
 return {
 width,
 height: Math.round(width / aspectRatio) };
}
