export type YouTubeSearchProvider = 'youtube-api' | 'google-search' | 'hybrid';
export type YouTubePlayerType = 'youtube-player' | 'youtube-player-wrapper' | 'youtube-player-example';
export type LocalVideoPlayerType = 'advanced-video-player' | 'video-player' | 'shorts-player' | 'short-display-card';
export type VideoPlayerType = YouTubePlayerType | LocalVideoPlayerType;
export interface VideoPlayerConfig {
    type: VideoPlayerType;
    category: 'youtube' | 'local';
    name: string;
    description: string;
    features: string;
    useCases: string;
    performance: 'high' | 'medium' | 'low';
    complexity: 'simple' | 'moderate' | 'advanced';
}
export interface PagePlayerConfig {
    youtubePlayer: YouTubePlayerType;
    localPlayer: LocalVideoPlayerType;
    defaultCategory: 'youtube' | 'local';
}
export interface Settings {
    youtubeSearchProvider: YouTubeSearchProvider;
    youtubePlayerType: YouTubePlayerType;
    localVideoPlayerType: LocalVideoPlayerType;
    defaultVideoPlayerCategory: 'youtube' | 'local';
    enabledYouTubePlayers: YouTubePlayerType;
    enabledLocalPlayers: LocalVideoPlayerType;
    initialSearchKeyword?: string;
    pageConfigurations?: {
        watchPage: PagePlayerConfig;
        homePage: PagePlayerConfig;
        searchResultsPage: PagePlayerConfig;
    };
}
export declare const VIDEO_PLAYER_CONFIGS: Record<VideoPlayerType, VideoPlayerConfig>;
export declare const getSettings: () => Settings;
export declare const saveSettings: (settings: Settings) => void;
export declare const getYouTubePlayerType: () => YouTubePlayerType;
export declare const setYouTubePlayerType: (playerType: YouTubePlayerType) => void;
export declare const getLocalVideoPlayerType: () => LocalVideoPlayerType;
export declare const setLocalVideoPlayerType: (playerType: LocalVideoPlayerType) => void;
export declare const getDefaultVideoPlayerCategory: () => "youtube" | "local";
export declare const setDefaultVideoPlayerCategory: (category: "youtube" | "local") => void;
export declare const getVideoPlayerConfig: (type: VideoPlayerType) => VideoPlayerConfig;
export declare const getVideoPlayersByCategory: (category: "youtube" | "local") => VideoPlayerConfig[];
export declare const getAllVideoPlayers: () => VideoPlayerConfig[];
export declare const getEnabledYouTubePlayers: () => YouTubePlayerType[];
export declare const getEnabledLocalPlayers: () => LocalVideoPlayerType[];
export declare const setEnabledYouTubePlayers: (players: YouTubePlayerType) => void;
export declare const setEnabledLocalPlayers: (players: LocalVideoPlayerType) => void;
export declare const toggleYouTubePlayer: (playerType: YouTubePlayerType) => void;
export declare const toggleLocalPlayer: (playerType: LocalVideoPlayerType) => void;
export declare const isPlayerEnabled: (playerType: VideoPlayerType) => boolean;
export declare const getYouTubeSearchProvider: () => YouTubeSearchProvider;
export declare const setYouTubeSearchProvider: (provider: YouTubeSearchProvider) => void;
export declare const isGoogleSearchAvailable: () => boolean;
export declare const isYouTubeApiConfigured: () => boolean;
export declare const isYouTubeApiAvailable: () => boolean;
export declare const isHybridModeAvailable: () => boolean;
export declare const getInitialSearchKeyword: () => string;
export declare const setInitialSearchKeyword: (keyword: any) => void;
export type PageType = 'watchPage' | 'homePage' | 'searchResultsPage';
export declare const getPagePlayerConfig: (page: PageType) => PagePlayerConfig;
export declare const setPagePlayerConfig: (page: PageType, config: PagePlayerConfig) => void;
export declare const getAllPageConfigurations: () => Record<PageType, PagePlayerConfig>;
export declare const getPageDisplayName: (page: PageType) => string;
export declare const getPlayerUsageByPage: (playerType: VideoPlayerType) => PageType[];
//# sourceMappingURL=settingsService.d.ts.map