// Re-export all protected components for easy access
export { default as ProtectedLiveStreamViewer } from '../../features/livestream/components/ProtectedLiveStreamViewer';
export { default as ProtectedStreamAnalyticsDashboard } from '../../features/livestream/components/ProtectedStreamAnalyticsDashboard';
export { default as ProtectedYouTubePlayer } from '../../../components/ProtectedYouTubePlayer';
export { default as ProtectedVideoPlayer } from '../../features/video/components/ProtectedVideoPlayer';
export { default as ProtectedWatchPage } from '../../features/video/pages/ProtectedWatchPage';
export { default as ProtectedSearchResultsPage } from '../../features/video/pages/ProtectedSearchResultsPage';

// Type exports for protected components
// Note: These types should be defined in their respective component files
export type ProtectedLiveStreamViewerProps = any;
export type ProtectedStreamAnalyticsDashboardProps = any;
export type ProtectedYouTubePlayerProps = any;
export type ProtectedVideoPlayerProps = any;
export type ProtectedWatchPageProps = any;
export type ProtectedSearchResultsPageProps = any;
