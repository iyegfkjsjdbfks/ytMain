// Re-export all protected components for easy access
export { default as ProtectedLiveStreamViewer } from '../../features/livestream/components/ProtectedLiveStreamViewer';
export { default as ProtectedStreamAnalyticsDashboard } from '../../features/livestream/components/ProtectedStreamAnalyticsDashboard';
export { default as ProtectedYouTubePlayer } from '../../../components/ProtectedYouTubePlayer';
export { default as ProtectedVideoPlayer } from '../../features/video/components/ProtectedVideoPlayer';
export { default as ProtectedWatchPage } from '../../features/video/pages/ProtectedWatchPage';
export { default as ProtectedSearchResultsPage } from '../../features/video/pages/ProtectedSearchResultsPage';

// Type exports
export type { default as ProtectedLiveStreamViewerProps } from '../../features/livestream/components/ProtectedLiveStreamViewer';
import { export type { default as ProtectedStreamAnalyticsDashboardProps } from '../../features/livestream/components/ProtectedStreamAnalyticsDashboard';
import React from "react";
import { export type { default as ProtectedYouTubePlayerProps } from '../../../components/ProtectedYouTubePlayer';
import React from "react";
import { export type { default as ProtectedVideoPlayerProps } from '../../features/video/components/ProtectedVideoPlayer';