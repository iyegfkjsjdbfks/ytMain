
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
import SettingsPage from './pages/SettingsPage'; 
import AIContentSparkPage from './pages/AIContentSparkPage'; // New Import
import { MiniplayerProvider } from './contexts/MiniplayerContext'; 


function App() { // Removed React.FC
  return (
    <HashRouter>
      <MiniplayerProvider> {/* Wrap with MiniplayerProvider */}
        <Layout>
          <Routes>
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
            <Route path="/account/data" element={<YourDataPage />} /> 
            <Route path="/account/settings" element={<SettingsPage />} /> 
            <Route path="/ai-content-spark" element={<AIContentSparkPage />} /> {/* New Route */}
          </Routes>
        </Layout>
      </MiniplayerProvider>
    </HashRouter>
  );
}

export default App;
