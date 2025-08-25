"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayerUsageByPage = exports.getPageDisplayName = exports.getAllPageConfigurations = exports.setPagePlayerConfig = exports.getPagePlayerConfig = exports.setInitialSearchKeyword = exports.getInitialSearchKeyword = exports.isHybridModeAvailable = exports.isYouTubeApiAvailable = exports.isYouTubeApiConfigured = exports.isGoogleSearchAvailable = exports.setYouTubeSearchProvider = exports.getYouTubeSearchProvider = exports.isPlayerEnabled = exports.toggleLocalPlayer = exports.toggleYouTubePlayer = exports.setEnabledLocalPlayers = exports.setEnabledYouTubePlayers = exports.getEnabledLocalPlayers = exports.getEnabledYouTubePlayers = exports.getAllVideoPlayers = exports.getVideoPlayersByCategory = exports.getVideoPlayerConfig = exports.setDefaultVideoPlayerCategory = exports.getDefaultVideoPlayerCategory = exports.setLocalVideoPlayerType = exports.getLocalVideoPlayerType = exports.setYouTubePlayerType = exports.getYouTubePlayerType = exports.saveSettings = exports.getSettings = exports.VIDEO_PLAYER_CONFIGS = void 0;
const youtubeApiUtils_ts_1 = require("../src/utils/youtubeApiUtils.ts");
const defaultSettings = {
    youtubeSearchProvider: 'hybrid',
    youtubePlayerType: 'youtube-player',
    localVideoPlayerType: 'advanced-video-player',
    defaultVideoPlayerCategory: 'youtube',
    enabledYouTubePlayers: ['youtube-player', 'youtube-player-wrapper'],
    enabledLocalPlayers: ['advanced-video-player', 'video-player'],
    initialSearchKeyword: 'trending',
    pageConfigurations: {
        watchPage: {
            youtubePlayer: 'youtube-player',
            localPlayer: 'video-player',
            defaultCategory: 'youtube'
        },
        homePage: {
            youtubePlayer: 'youtube-player',
            localPlayer: 'advanced-video-player',
            defaultCategory: 'youtube'
        },
        searchResultsPage: {
            youtubePlayer: 'youtube-player-wrapper',
            localPlayer: 'advanced-video-player',
            defaultCategory: 'youtube'
        }
    }
};
// Video Player Configurations
exports.VIDEO_PLAYER_CONFIGS = {
    'youtube-player': {
        type: 'youtube-player',
        category: 'youtube',
        name: 'YouTube Player',
        description: 'Direct YouTube player component with YouTube API integration for seamless video playback',
        features: ['YouTube API Integration', 'Responsive Design', 'Lightweight', 'Auto Quality', 'Fullscreen Support'],
        useCases: ['YouTube video embedding', 'Search result playback', 'Video streaming'],
        performance: 'high',
        complexity: 'simple'
    },
    'youtube-player-wrapper': {
        type: 'youtube-player-wrapper',
        category: 'youtube',
        name: 'YouTube Player Wrapper',
        description: 'Simplified wrapper component that provides easy-to-use props interface for YouTube Player',
        features: ['Simplified API', 'Props-based configuration', 'Mock video object creation', 'YouTube Player integration'],
        useCases: ['Quick YouTube embedding', 'Simplified integration', 'Video cards', 'Component reusability'],
        performance: 'high',
        complexity: 'simple'
    },
    'youtube-player-example': {
        type: 'youtube-player-example',
        category: 'youtube',
        name: 'YouTube Player Example',
        description: 'Educational/demo implementation showcasing YouTube player capabilities and usage patterns',
        features: ['Demo functionality', 'Player state tracking', 'Control examples', 'Progress monitoring', 'Educational code'],
        useCases: ['Development demos', 'Testing', 'Learning examples', 'Prototyping'],
        performance: 'medium',
        complexity: 'simple'
    },
    'advanced-video-player': {
        type: 'advanced-video-player',
        category: 'local',
        name: 'Advanced Video Player',
        description: 'Feature-rich video player with advanced controls and modern React patterns for local video files',
        features: ['Advanced Controls', 'Custom Hooks', 'State Management', 'Quality Selection', 'Fullscreen Support', 'Chapter Support'],
        useCases: ['Local video files', 'Advanced playback features', 'Custom video experiences', 'Professional video playback'],
        performance: 'high',
        complexity: 'advanced'
    },
    'video-player': {
        type: 'video-player',
        category: 'local',
        name: 'Video Player',
        description: 'Hybrid player supporting both YouTube embeds and local videos with custom controls overlay',
        features: ['Dual-mode operation', 'YouTube iframe support', 'HTML5 video', 'Custom controls', 'Fullscreen support', 'Time tracking'],
        useCases: ['Mixed content', 'Flexible video sources', 'Alternative watch page', 'Unified video interface'],
        performance: 'high',
        complexity: 'moderate'
    },
    'shorts-player': {
        type: 'shorts-player',
        category: 'local',
        name: 'Shorts Player',
        description: 'Dedicated player optimized for short-form vertical videos with mobile-first design',
        features: ['Vertical video optimization', 'Swipe navigation', 'Mobile-first design', 'Auto-loop', 'Social interactions'],
        useCases: ['Short-form content', 'Vertical videos', 'Mobile viewing', 'Social media style videos', 'TikTok-like experience'],
        performance: 'high',
        complexity: 'moderate'
    },
    'short-display-card': {
        type: 'short-display-card',
        category: 'local',
        name: 'Short Display Card',
        description: 'Individual short video player with social features and intersection observer autoplay',
        features: ['Intersection observer autoplay', 'Social action buttons', 'Loading states', 'Manual pause tracking', 'Muted autoplay'],
        useCases: ['Shorts feed', 'Home page shorts', 'Social video cards', 'Auto-playing video previews'],
        performance: 'high',
        complexity: 'moderate'
    }
};
const getSettings = () => {
    const stored = localStorage.getItem('appSettings');
    if (stored) {
        try {
            return { ...defaultSettings, ...JSON.parse(stored) };
        }
        catch (error) {
            console.error('Error parsing stored settings:', error);
        }
    }
    return defaultSettings;
};
exports.getSettings = getSettings;
const saveSettings = (settings) => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
};
exports.saveSettings = saveSettings;
const getYouTubePlayerType = () => {
    return (0, exports.getSettings)().youtubePlayerType;
};
exports.getYouTubePlayerType = getYouTubePlayerType;
const setYouTubePlayerType = (playerType) => {
    const settings = (0, exports.getSettings)();
    (0, exports.saveSettings)({ ...settings, youtubePlayerType: playerType });
};
exports.setYouTubePlayerType = setYouTubePlayerType;
const getLocalVideoPlayerType = () => {
    return (0, exports.getSettings)().localVideoPlayerType;
};
exports.getLocalVideoPlayerType = getLocalVideoPlayerType;
const setLocalVideoPlayerType = (playerType) => {
    const settings = (0, exports.getSettings)();
    (0, exports.saveSettings)({ ...settings, localVideoPlayerType: playerType });
};
exports.setLocalVideoPlayerType = setLocalVideoPlayerType;
const getDefaultVideoPlayerCategory = () => {
    return (0, exports.getSettings)().defaultVideoPlayerCategory;
};
exports.getDefaultVideoPlayerCategory = getDefaultVideoPlayerCategory;
const setDefaultVideoPlayerCategory = (category) => {
    const settings = (0, exports.getSettings)();
    (0, exports.saveSettings)({ ...settings, defaultVideoPlayerCategory: category });
};
exports.setDefaultVideoPlayerCategory = setDefaultVideoPlayerCategory;
const getVideoPlayerConfig = (type) => {
    return exports.VIDEO_PLAYER_CONFIGS[type];
};
exports.getVideoPlayerConfig = getVideoPlayerConfig;
const getVideoPlayersByCategory = (category) => {
    return Object.values(exports.VIDEO_PLAYER_CONFIGS).filter((config) => config.category === category);
};
exports.getVideoPlayersByCategory = getVideoPlayersByCategory;
const getAllVideoPlayers = () => {
    return Object.values(exports.VIDEO_PLAYER_CONFIGS);
};
exports.getAllVideoPlayers = getAllVideoPlayers;
// Enabled Players Management
const getEnabledYouTubePlayers = () => {
    return (0, exports.getSettings)().enabledYouTubePlayers;
};
exports.getEnabledYouTubePlayers = getEnabledYouTubePlayers;
const getEnabledLocalPlayers = () => {
    return (0, exports.getSettings)().enabledLocalPlayers;
};
exports.getEnabledLocalPlayers = getEnabledLocalPlayers;
const setEnabledYouTubePlayers = (players) => {
    const settings = (0, exports.getSettings)();
    (0, exports.saveSettings)({ ...settings, enabledYouTubePlayers: players });
};
exports.setEnabledYouTubePlayers = setEnabledYouTubePlayers;
const setEnabledLocalPlayers = (players) => {
    const settings = (0, exports.getSettings)();
    (0, exports.saveSettings)({ ...settings, enabledLocalPlayers: players });
};
exports.setEnabledLocalPlayers = setEnabledLocalPlayers;
const toggleYouTubePlayer = (playerType) => {
    const settings = (0, exports.getSettings)();
    const enabled = settings.enabledYouTubePlayers;
    const isEnabled = enabled.includes(playerType);
    if (isEnabled) {
        // Don't allow disabling if it's the only enabled player
        if (enabled.length > 1) {
            settings.enabledYouTubePlayers = enabled.filter((p) => p !== playerType);
        }
    }
    else {
        settings.enabledYouTubePlayers = [...enabled, playerType];
    }
    (0, exports.saveSettings)(settings);
};
exports.toggleYouTubePlayer = toggleYouTubePlayer;
const toggleLocalPlayer = (playerType) => {
    const settings = (0, exports.getSettings)();
    const enabled = settings.enabledLocalPlayers;
    const isEnabled = enabled.includes(playerType);
    if (isEnabled) {
        // Don't allow disabling if it's the only enabled player
        if (enabled.length > 1) {
            settings.enabledLocalPlayers = enabled.filter((p) => p !== playerType);
        }
    }
    else {
        settings.enabledLocalPlayers = [...enabled, playerType];
    }
    (0, exports.saveSettings)(settings);
};
exports.toggleLocalPlayer = toggleLocalPlayer;
const isPlayerEnabled = (playerType) => {
    const settings = (0, exports.getSettings)();
    const config = exports.VIDEO_PLAYER_CONFIGS[playerType];
    if (config.category === 'youtube') {
        return settings.enabledYouTubePlayers.includes(playerType);
    }
    return settings.enabledLocalPlayers.includes(playerType);
};
exports.isPlayerEnabled = isPlayerEnabled;
// Get current YouTube search provider
const getYouTubeSearchProvider = () => {
    // Always use hybrid mode to ensure fallback mechanism works
    return 'hybrid';
};
exports.getYouTubeSearchProvider = getYouTubeSearchProvider;
// Set YouTube search provider
const setYouTubeSearchProvider = (provider) => {
    const settings = (0, exports.getSettings)();
    settings.youtubeSearchProvider = provider;
    (0, exports.saveSettings)(settings);
};
exports.setYouTubeSearchProvider = setYouTubeSearchProvider;
// Check if Google Custom Search is available
const isGoogleSearchAvailable = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
    const engineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;
    return !!(apiKey && engineId);
};
exports.isGoogleSearchAvailable = isGoogleSearchAvailable;
// Check if YouTube Data API is configured (has API key)
const isYouTubeApiConfigured = () => {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    return !!apiKey;
};
exports.isYouTubeApiConfigured = isYouTubeApiConfigured;
// Check if YouTube Data API is available for use (configured and not blocked)
const isYouTubeApiAvailable = () => {
    return (0, exports.isYouTubeApiConfigured)() && !(0, youtubeApiUtils_ts_1.isYouTubeDataApiBlocked)();
};
exports.isYouTubeApiAvailable = isYouTubeApiAvailable;
// Check if hybrid mode is available (both APIs configured)
const isHybridModeAvailable = () => {
    return (0, exports.isYouTubeApiConfigured)() && (0, exports.isGoogleSearchAvailable)();
};
exports.isHybridModeAvailable = isHybridModeAvailable;
// Get initial search keyword
const getInitialSearchKeyword = () => {
    return (0, exports.getSettings)().initialSearchKeyword || 'trending';
};
exports.getInitialSearchKeyword = getInitialSearchKeyword;
// Set initial search keyword
const setInitialSearchKeyword = (keyword) => {
    const settings = (0, exports.getSettings)();
    (0, exports.saveSettings)({ ...settings, initialSearchKeyword: keyword });
};
exports.setInitialSearchKeyword = setInitialSearchKeyword;
const getPagePlayerConfig = (page) => {
    const settings = (0, exports.getSettings)();
    return settings.pageConfigurations?.[page] || defaultSettings.pageConfigurations[page];
};
exports.getPagePlayerConfig = getPagePlayerConfig;
const setPagePlayerConfig = (page, config) => {
    const settings = (0, exports.getSettings)();
    const pageConfigurations = settings.pageConfigurations || defaultSettings.pageConfigurations;
    (0, exports.saveSettings)({
        ...settings,
        pageConfigurations: {
            ...pageConfigurations,
            [page]: config
        }
    });
};
exports.setPagePlayerConfig = setPagePlayerConfig;
const getAllPageConfigurations = () => {
    const settings = (0, exports.getSettings)();
    return settings.pageConfigurations || defaultSettings.pageConfigurations;
};
exports.getAllPageConfigurations = getAllPageConfigurations;
const getPageDisplayName = (page) => {
    const displayNames = {
        watchPage: 'WatchPage',
        homePage: 'HomePage',
        searchResultsPage: 'SearchResultsPage'
    };
    return displayNames[page];
};
exports.getPageDisplayName = getPageDisplayName;
const getPlayerUsageByPage = (playerType) => {
    const pageConfigs = (0, exports.getAllPageConfigurations)();
    const config = exports.VIDEO_PLAYER_CONFIGS[playerType];
    const pages = [];
    Object.entries(pageConfigs).forEach(([page, pageConfig]) => {
        const isUsed = config.category === 'youtube'
            ? pageConfig.youtubePlayer === playerType
            : pageConfig.localPlayer === playerType;
        if (isUsed) {
            pages.push(page);
        }
    });
    return pages;
};
exports.getPlayerUsageByPage = getPlayerUsageByPage;
//# sourceMappingURL=settingsService.js.map