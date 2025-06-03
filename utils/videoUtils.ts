import { Video } from '../types';

export function getVideoThumbnail(video: Video): string {
  return video.thumbnail || video.thumbnailUrl || '';
}

export function getChannelAvatar(video: Video): string {
  return video.channelAvatar || video.channelAvatarUrl || '';
}

export function getViewCount(video: Video): string | number {
  if (video.views) return video.views;
  if (video.viewCount !== undefined) return formatViewCount(video.viewCount);
  return 0;
}

export function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export function isVideoLive(video: Video): boolean {
  return !!video.isLiveNow || !!video.scheduledStartTime;
}

export function getVideoDuration(video: Video): string {
  if (isVideoLive(video)) {
    return video.viewerCount ? `${video.viewerCount} watching` : 'Live';
  }
  return video.duration || '';
}

export function getVideoAspectRatio(video: Video): number {
  if (video.aspectRatio) return video.aspectRatio;
  return video.isShort ? 9 / 16 : 16 / 9;
}

export function getVideoPrivacyBadge(video: Video): string | null {
  if (!video.privacyStatus) return null;
  
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
  if (!video.tags || !Array.isArray(video.tags)) return [];
  return video.tags.slice(0, 5); // Return first 5 tags
}

export function getVideoUploadDate(video: Video): string {
  return video.publishedAt || video.uploadedAt || '';
}

export function isVideoMonetized(video: Video): boolean {
  return !!(
    video.monetizationDetails?.access?.allowed ||
    video.monetizationDetails?.monetizationStatus === 'monetized'
  );
}

export function getVideoDimensions(video: Video): { width: number; height: number } {
  const aspectRatio = getVideoAspectRatio(video);
  const width = 1280; // Default width
  return {
    width,
    height: Math.round(width / aspectRatio)
  };
}
