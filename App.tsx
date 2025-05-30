
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import WatchPage from './pages/WatchPage';
import SearchResultsPage from './pages/SearchResultsPage';
import TrendingPage from './pages/TrendingPage';
import ShortsPage from './pages/ShortsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import HistoryPage from './pages/HistoryPage';
import WatchLaterPage from './pages/WatchLaterPage';
import LikedVideosPage from './pages/LikedVideosPage';
import ChannelPage from './pages/ChannelPage';
import UserPage from './pages/UserPage'; 
import PlaylistsPage from './pages/PlaylistsPage'; 
import PlaylistDetailPage from './pages/PlaylistDetailPage'; 
import LibraryPage from './pages/LibraryPage';
import YourDataPage from './pages/YourDataPage';
import GoLivePage from './pages/GoLivePage'; // Added import for Go Live page
import AIContentSparkPage from './pages/AIContentSparkPage'; // Added import
import VideoUploadPage from './pages/VideoUploadPage';
import SettingsPage from './pages/SettingsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CommentModerationPage from './pages/CommentModerationPage';
import MonetizationPage from './pages/MonetizationPage';
import ContentManagerPage from './pages/ContentManagerPage';
import StudioDashboardPage from './pages/StudioDashboardPage';
import CreatorStudioPage from './pages/CreatorStudioPage';
import CommunityPage from './pages/CommunityPage';
import PlaylistManagerPage from './pages/PlaylistManagerPage';
import ChannelCustomizationPage from './pages/ChannelCustomizationPage';
import VideoEditorPage from './pages/VideoEditorPage';
import { MiniplayerProvider } from './contexts/MiniplayerContext'; 
import { WatchLaterProvider } from './contexts/WatchLaterContext'; // Added WatchLaterProvider import
import StudioLayout from './components/StudioLayout'; // Added import for StudioLayout


function App() { // Removed React.FC
  return (
    <HashRouter>
      <WatchLaterProvider> {/* Added WatchLaterProvider */}
        <MiniplayerProvider> {/* Wrap with MiniplayerProvider */}
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/watch/:videoId" element={<WatchPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/trending" element={<TrendingPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/shorts" element={<ShortsPage />} />
              <Route path="/subscriptions" element={<SubscriptionsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="/playlist/:playlistId" element={<PlaylistDetailPage />} /> 
              <Route path="/watch-later" element={<WatchLaterPage />} />
              <Route path="/liked-videos" element={<LikedVideosPage />} />
              <Route path="/channel/:channelIdOrName" element={<ChannelPage />} />
              <Route path="/user/:userName" element={<UserPage />} />
              <Route path="/your-data" element={<YourDataPage />} />
              <Route path="/go-live" element={<GoLivePage />} /> {/* Added route for Go Live page */}
              <Route path="/ai-content-spark" element={<AIContentSparkPage />} /> {/* Added route */}
              <Route path="/upload" element={<VideoUploadPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="/studio" element={<StudioLayout />}>
              <Route index element={<StudioDashboardPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="comments" element={<CommentModerationPage />} />
              <Route path="monetization" element={<MonetizationPage />} />
              <Route path="content" element={<ContentManagerPage />} />
              <Route path="creator" element={<CreatorStudioPage />} />
              <Route path="community" element={<CommunityPage />} />
              <Route path="playlists" element={<PlaylistManagerPage />} />
              <Route path="customization" element={<ChannelCustomizationPage />} />
              <Route path="editor" element={<VideoEditorPage />} />
            </Route>
          </Routes>
        </MiniplayerProvider>
      </WatchLaterProvider> {/* Added WatchLaterProvider */}
    </HashRouter>
  );
}

export default App;
