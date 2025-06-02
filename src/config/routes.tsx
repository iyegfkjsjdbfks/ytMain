import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
// Import components from features/common instead of directly from components
import { Layout } from '../features/common/components/Layout';
import { StudioLayout } from '../features/common/components/StudioLayout';
import { ErrorBoundary } from '../features/common/components/ErrorBoundary';
// Auth components
import { ProtectedRoute } from '../features/auth';

// Lazy load components for better performance
// Video feature pages
const HomePage = lazy(() => import('../features/video/pages/HomePage'));
const WatchPage = lazy(() => import('../features/video/pages/WatchPage'));
const SearchResultsPage = lazy(() => import('../features/video/pages/SearchResultsPage'));
const TrendingPage = lazy(() => import('../features/video/pages/TrendingPage'));
const ShortsPage = lazy(() => import('../features/video/pages/ShortsPage'));
const VideoDemo = lazy(() => import('../features/video/pages/VideoDemo'));

// User feature pages
const SubscriptionsPage = lazy(() => import('../features/user/pages/SubscriptionsPage'));
const HistoryPage = lazy(() => import('../features/user/pages/HistoryPage'));
const WatchLaterPage = lazy(() => import('../features/user/pages/WatchLaterPage'));
const LikedVideosPage = lazy(() => import('../features/user/pages/LikedVideosPage'));
const LibraryPage = lazy(() => import('../features/user/pages/LibraryPage'));
const YourDataPage = lazy(() => import('../features/user/pages/YourDataPage'));
const SettingsPage = lazy(() => import('../features/user/pages/SettingsPage'));

// Channel feature pages
const ChannelPage = lazy(() => import('../features/channel/pages/ChannelPage'));
const UserPage = lazy(() => import('../features/channel/pages/UserPage'));

// Playlist feature pages
const PlaylistsPage = lazy(() => import('../features/playlist/pages/PlaylistsPage'));
const PlaylistDetailPage = lazy(() => import('../features/playlist/pages/PlaylistDetailPage'));

// Creator feature pages
const GoLivePage = lazy(() => import('../features/creator/pages/GoLivePage'));
const AIContentSparkPage = lazy(() => import('../features/creator/pages/AIContentSparkPage'));
const VideoUploadPage = lazy(() => import('../features/creator/pages/VideoUploadPage'));

// Auth feature pages
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));

// Studio feature pages
const StudioDashboardPage = lazy(() => import('../features/studio/pages/StudioDashboardPage'));
const AnalyticsPage = lazy(() => import('../features/studio/pages/AnalyticsPage'));
const CommentModerationPage = lazy(() => import('../features/studio/pages/CommentModerationPage'));
const MonetizationPage = lazy(() => import('../features/studio/pages/MonetizationPage'));
const ContentManagerPage = lazy(() => import('../features/studio/pages/ContentManagerPage'));
const CreatorStudioPage = lazy(() => import('../features/studio/pages/CreatorStudioPage'));
const CommunityPage = lazy(() => import('../features/studio/pages/CommunityPage'));
const PlaylistManagerPage = lazy(() => import('../features/studio/pages/PlaylistManagerPage'));
const ChannelCustomizationPage = lazy(() => import('../features/studio/pages/ChannelCustomizationPage'));
const VideoEditorPage = lazy(() => import('../features/studio/pages/VideoEditorPage'));

// Route configuration for main application
export const mainRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'watch/:videoId',
        element: <WatchPage />,
      },
      {
        path: 'watch',
        element: <WatchPage />,
      },
      {
        path: 'search',
        element: <SearchResultsPage />,
      },
      {
        path: 'trending',
        element: <TrendingPage />,
      },
      {
        path: 'shorts',
        element: <ShortsPage />,
      },
      {
        path: 'subscriptions',
        element: 
          <ProtectedRoute>
            <SubscriptionsPage />
          </ProtectedRoute>
      },
      {
        path: 'history',
        element: 
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
      },
      {
        path: 'playlists',
        element: 
          <ProtectedRoute>
            <PlaylistsPage />
          </ProtectedRoute>
      },
      {
        path: 'playlist/:playlistId',
        element: <PlaylistDetailPage />,
      },
      {
        path: 'watch-later',
        element: 
          <ProtectedRoute>
            <WatchLaterPage />
          </ProtectedRoute>
      },
      {
        path: 'liked-videos',
        element: 
          <ProtectedRoute>
            <LikedVideosPage />
          </ProtectedRoute>
      },
      {
        path: 'channel/:channelIdOrName',
        element: <ChannelPage />,
      },
      {
        path: 'user/:userName',
        element: <UserPage />,
      },
      {
        path: 'library',
        element: 
          <ProtectedRoute>
            <LibraryPage />
          </ProtectedRoute>
      },
      {
        path: 'your-data',
        element: 
          <ProtectedRoute>
            <YourDataPage />
          </ProtectedRoute>
      },
      {
        path: 'go-live',
        element: 
          <ProtectedRoute>
            <GoLivePage />
          </ProtectedRoute>
      },
      {
        path: 'ai-content-spark',
        element: <AIContentSparkPage />,
      },
      {
        path: 'upload',
        element: 
          <ProtectedRoute>
            <VideoUploadPage />
          </ProtectedRoute>
      },
      {
        path: 'settings',
        element: 
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
      },
      {
        path: 'video-demo',
        element: <VideoDemo />
      },
    ],
  },
];

// Route configuration for studio
export const studioRoutes: RouteObject[] = [
  {
    path: 'studio',
    element: 
      <ProtectedRoute>
        <StudioLayout />
      </ProtectedRoute>,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <StudioDashboardPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      {
        path: 'comments',
        element: <CommentModerationPage />,
      },
      {
        path: 'monetization',
        element: <MonetizationPage />,
      },
      {
        path: 'content',
        element: <ContentManagerPage />,
      },
      {
        path: 'creator',
        element: <CreatorStudioPage />,
      },
      {
        path: 'community',
        element: <CommunityPage />,
      },
      {
        path: 'playlists',
        element: <PlaylistManagerPage />,
      },
      {
        path: 'customization',
        element: <ChannelCustomizationPage />,
      },
      {
        path: 'editor',
        element: <VideoEditorPage />,
      },
    ],
  },
];

// Authentication routes (outside main layout)
const authRoutes: RouteObject[] = [
  {
    path: '/login',
    element: (
      <ProtectedRoute requireAuth={false} redirectTo="/">
        <LoginPage />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/register',
    element: (
      <ProtectedRoute requireAuth={false} redirectTo="/">
        <RegisterPage />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
];

// Combined route configuration
export const routes: RouteObject[] = [...mainRoutes, ...studioRoutes, ...authRoutes];
