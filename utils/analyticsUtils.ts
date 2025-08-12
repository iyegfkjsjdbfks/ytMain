import type { Video } from '../src/types/core';

export function calculateEngagementRate(video: Video): number {
  if (!video.likes || !video.viewCount) {
return 0;
}
  return (video.likes / video.viewCount) * 100;
}

export function formatEngagementRate(rate: any): string {
  return `${rate.toFixed(2)  }%`;
}

export function getAudienceRetention(video: Video): number {
  // This is a placeholder - in a real app, this would come from your analytics API
  // Parse duration string to get seconds
  const durationParts = video.duration.split(':');
  const totalSeconds = durationParts.length === 2
    ? (parseInt(durationParts[0] ?? '0', 10) || 0) * 60 + (parseInt(durationParts[1] ?? '0', 10) || 0)
    : (parseInt(durationParts[0] ?? '0', 10) || 0);
  return totalSeconds ? Math.min(100(totalSeconds / 60) * 100) : 0;
}

export function getImpressionsCTR(video: Video): number {
  // This is a placeholder - in a real app, this would come from your analytics API
  const viewCount = parseInt((video.views ?? '0').replace(/,/g, ''), 10) || 0;
  return viewCount ? Math.min(100(viewCount / 1000) * 2) : 0;
}

export function getWatchTime(video: Video): number {
  // This is a placeholder - in a real app, this would come from your analytics API
  const viewCount = parseInt((video.views ?? '0').replace(/,/g, ''), 10) || 0;
  return viewCount ? viewCount * 2.5 : 0;
}

export function formatWatchTime(seconds: any): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function getAudienceDemographics() {
  // This would come from your analytics API
  return {
    ageGroups: [
      { name: '13-17', value: 10 },
      { name: '18-24', value: 25 },
      { name: '25-34', value: 35 },
      { name: '35-44', value: 20 },
      { name: '45-54', value: 7 },
      { name: '55-64', value: 3 }],
    genders: [
      { name: 'Male', value: 60 },
      { name: 'Female', value: 38 },
      { name: 'Other', value: 2 }] };
}

export function getTrafficSources() {
  // This would come from your analytics API
  return [
    { name: 'YouTube Search', value: 40 },
    { name: 'External', value: 25 },
    { name: 'Suggested Videos', value: 20 },
    { name: 'Playlists', value: 10 },
    { name: 'Other', value: 5 }];
}

export function getGeographicData() {
  // This would come from your analytics API
  return [
    { country: 'United States', value: 30 },
    { country: 'India', value: 15 },
    { country: 'United Kingdom', value: 10 },
    { country: 'Canada', value: 8 },
    { country: 'Australia', value: 7 },
    { country: 'Other', value: 30 }];
}
