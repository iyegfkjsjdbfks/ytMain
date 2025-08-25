import React, { FC, useState, useEffect } from 'react';

import type { Video } from '../types.ts';

import { VideoCameraIcon, PlayIcon } from '@heroicons / react / 24 / outline';

import { getSettings, saveSettings, VIDEO_PLAYER_CONFIGS, getVideoPlayersByCategory, getAllVideoPlayers, setLocalVideoPlayerType, getEnabledYouTubePlayers, getEnabledLocalPlayers, toggleYouTubePlayer, toggleLocalPlayer, isGoogleSearchAvailable, isYouTubeApiAvailable, isYouTubeApiConfigured, isHybridModeAvailable, getInitialSearchKeyword, setInitialSearchKeyword, getAllPageConfigurations, getPageDisplayName, getPlayerUsageByPage, type YouTubeSearchProvider, type YouTubePlayerType, type LocalVideoPlayerType, type VideoPlayerConfig, type PageType } from '../services / settingsService';
import { CogIcon } from '@heroicons / react / 24 / outline';
import { SparklesIcon } from '@heroicons / react / 24 / outline';
import { BugAntIcon } from '@heroicons / react / 24 / outline';

interface StoreVideo {}
 id: string;,
 title: string;
 channelName: string;,
 videoUrl: string;
 viewCount?: number;
}

const AdminPage: React.FC = () => {}
 return null;
 const [provider, setProvider] = useState < YouTubeSearchProvider>('hybrid');
 const [playerType, setPlayerType] = useState < YouTubePlayerType>('youtube - player');
 const [localPlayerType, setLocalPlayerType] = useState < LocalVideoPlayerType>('advanced - video - player');
 const [enabledYouTubePlayers, setEnabledYouTubePlayersState] = useState < YouTubePlayerType[]>([]);
 const [enabledLocalPlayers, setEnabledLocalPlayersState] = useState < LocalVideoPlayerType[]>([]);
 const [activeTab, setActiveTab] = useState<'search' | 'youtube - players' | 'local - players' | 'overview' | 'api - testing' | 'player - config'>('overview');
 const [isSaving, setIsSaving] = useState < boolean>(false);
 const [saveMessage, setSaveMessage] = useState < string>('');

 // Google Search Debug state
 const [storeVideos, setStoreVideos] = useState < StoreVideo[]>([]);
 const [testVideoId, setTestVideoId] = useState('bnVUHWCynig');
 const [testResult, setTestResult] = useState < any>(null);
 const [unifiedServiceTest, setUnifiedServiceTest] = useState < any>(null);
 const [loading, setLoading] = useState < boolean>(false);
 const [initialSearchKeyword, setInitialSearchKeywordState] = useState < string>('');

 // YouTube Metadata Debug state
 const [youtubeMetadataTest, setYoutubeMetadataTest] = useState < any>(null);
 const [proxyTest, setProxyTest] = useState < any>(null);
 const [directApiTest, setDirectApiTest] = useState < any>(null);
 const [environmentCheck, setEnvironmentCheck] = useState < any>(null);

 useEffect(() => {}
 // Load current settings
 const settings = getSettings();
 setProvider(settings.youtubeSearchProvider);
 setPlayerType(settings.youtubePlayerType);
 setLocalPlayerType(settings.localVideoPlayerType);
 setEnabledYouTubePlayersState(getEnabledYouTubePlayers());
 setEnabledLocalPlayersState(getEnabledLocalPlayers());
 setInitialSearchKeywordState(getInitialSearchKeyword());

 // Load Google Search store videos
 loadStoreVideos().catch(() => {}
 // Handle promise rejection silently
 });
 }, []);

 const loadStoreVideos = async (): Promise<any> < void> => {}
 try {}
 const { googleSearchVideoStore } = await import('../services / googleSearchVideoStore');
 const googleVideos = googleSearchVideoStore.getAllVideos();

 // Convert GoogleSearchResult[] to StoreVideo[]
 const videos: StoreVideo[] = googleVideos.map((video) => ({,}
 id: video.id,
 title: video.title,
 channelName: video.channelName,
 videoUrl: video.videoUrl,
 viewCount: video.viewCount || 0 }));

 setStoreVideos(videos);
 } catch (error) {}
 (console).error('Failed to load store videos:', error);
 };

 const handleTestFetch = async (): Promise<any> < void> => {}
 setLoading(true);
 try {}
 (console).log(`🧪 Testing fetch for video ID: ${testVideoId}`);

 // Check environment variables first
 const searchApiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
 const searchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;
 (console).log('🔑 API Key available:', !!searchApiKey);
 (console).log('🔍 Search Engine ID available:', !!searchEngineId);

 if (!searchApiKey || !searchEngineId) {}
 setTestResult({}
 error: 'Google Custom Search API not configured',
 details: {,}
 apiKey: !!searchApiKey,
 engineId: !!searchEngineId } 
 });
 return;
 }

 const { fetchSingleVideoFromGoogleSearch } = await import('../services / googleSearchService');
 const result = await fetchSingleVideoFromGoogleSearch(testVideoId);
 setTestResult(result);

 // Refresh store videos
 await loadStoreVideos();
 } catch (error) {}
 (console).error('Test fetch error:', error);
 setTestResult({ error: error.message });
 } finally {}
 setLoading(false);
 };

 const handleTestUnifiedService = async (): Promise<any> < void> => {}
 setLoading(true);
 try {}
 (console).log(`🧪 Testing unified service for video ID: google - search-${testVideoId}`);

 // Import unified data service
 const { unifiedDataService } = await import('../src / services / unifiedDataService');

 // Clear cache first
 unifiedDataService.clearCache(`video:google - search-${testVideoId}`);

 // Test the unified service
 const result = await unifiedDataService.getVideoById(`google - search-${testVideoId}`);
 setUnifiedServiceTest(result);

 (console).log('🧪 Unified service result:', result);
 } catch (error) {}
 (console).error('Unified service test error:', error);
 setUnifiedServiceTest({ error: error.message });
 } finally {}
 setLoading(false);
 };

 const handleClearStore = async (): Promise<any> < void> => {}
 try {}
 const { googleSearchVideoStore } = await import('../services / googleSearchVideoStore');
 googleSearchVideoStore.clear();
 await loadStoreVideos();
 } catch (error) {}
 (console).error('Failed to clear store:', error);
 };

 // YouTube Metadata Debug handlers
 const checkEnvironment = () => {}
 const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
 const proxyUrl: string = `${window.location.origin}/api / youtube / v3 / videos`;

 setEnvironmentCheck({}
 mode: isDevelopment ? 'Development' : 'Production',
 host: window.location.hostname,
 port: window.location.port,
 protocol: window.location.protocol,
 origin: window.location.origin,
 proxyUrl,
 proxyActive: isDevelopment,
 youtubeApiKey: !!import.meta.env.VITE_YOUTUBE_API_KEY,
 googleSearchApiKey: !!import.meta.env.VITE_GOOGLE_SEARCH_API_KEY,
 googleSearchEngineId: !!import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID });
 };

 const testProxyEndpoint = async (): Promise<any> < void> => {}
 setLoading(true);
 try {}
 const testVideoId: string = 'bnVUHWCynig';
 const proxyUrl: string = `/api / youtube / v3 / videos?part = snippet,statistics,contentDetails&id="${testVideoId}`;"

 (console).log('🔄 Testing proxy endpoint:', proxyUrl);

 const response = await (fetch)(proxyUrl);

 if (response.ok) {}
 const data = await response.json();

 if (data.items?.[0]) {}
 const video = data.items[0];
 setProxyTest({}
 success: true,
 status: response.status,
 url: proxyUrl,
 video: {,}
 title: video.snippet.title,
 channel: video.snippet.channelTitle,
 views: parseInt(video.statistics.viewCount, 10).toLocaleString(),
 likes: parseInt(video.statistics.likeCount || 0, 10).toLocaleString(),
 published: video.snippet.publishedAt,
 duration: video.contentDetails.duration },
 fullResponse: data });
 } else {}
 setProxyTest({}
 success: false,
 status: response.status,
 url: proxyUrl,
 error: 'No video data in response',
 fullResponse: data });
 }
 } else {}
 const errorText = await response.text();
 setProxyTest({}
 success: false,
 status: response.status,
 url: proxyUrl,
 error: `${response.status} ${response.statusText}`,
 fullResponse: errorText });
 }
 } catch (error) {}
 setProxyTest({}
 success: false,
 error: error.message,
 note: 'This might indicate proxy configuration issues or that the dev server is not running.' });
 } finally {}
 setLoading(false);
 };

 const testDirectAPI = async (): Promise<any> < void> => {}
 setLoading(true);
 try {}
 const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
 const testVideoId: string = 'bnVUHWCynig';
 const directUrl = `https://www.googleapis.com / youtube / v3 / videos?key="${apiKey}&part" = snippet,statistics,contentDetails&id="${testVideoId}`;"

 (console).log('🔄 Testing direct API:', directUrl.replace(apiKey, '[API_KEY]'));

 const response = await (fetch)(directUrl);

 if (response.ok) {}
 const data = await response.json();
 setDirectApiTest({}
 success: true,
 status: response.status,
 url: directUrl.replace(apiKey, '[API_KEY]'),
 note: 'Direct API call succeeded (CORS allowed)',
 fullResponse: data });
 } else {}
 const errorData = await response.json();
 setDirectApiTest({}
 success: false,
 status: response.status,
 url: directUrl.replace(apiKey, '[API_KEY]'),
 error: `${response.status} ${response.statusText}`,
 fullResponse: errorData });
 }
 } catch (error) {}
 setDirectApiTest({}
 success: false,
 error: error.message,
 note: 'This is expected due to CORS restrictions. The proxy should handle this.' });
 } finally {}
 setLoading(false);
 };

 const testYouTubeMetadataFetch = async (): Promise<any> < void> => {}
 setLoading(true);
 try {}
 (console).log('🔄 Testing YouTube metadata fetch using app services...');

 // Import unified data service
 const { unifiedDataService } = await import('../src / services / unifiedDataService');

 // Clear cache first
 unifiedDataService.clearCache(`video:${testVideoId}`);

 // Test the unified service
 const video = await unifiedDataService.getVideoById(testVideoId);

 if (video) {}
 setYoutubeMetadataTest({}
 success: true,
 video: {,}
 id: video.id,
 title: video.title,
 channel: video.channel.name,
 views: video.viewsFormatted,
 source: video.source,
 channelAvatar: video.channel.avatarUrl,
 publishedAt: video.publishedAtFormatted,
 duration: video.duration },
 fullVideo: video });
 } else {}
 setYoutubeMetadataTest({}
 success: false,
 error: 'No video data returned from app service' });
 }
 } catch (error) {}
 setYoutubeMetadataTest({}
 success: false,
 error: error.message,
 stack: error.stack });
 } finally {}
 setLoading(false);
 };

 const clearYouTubeMetadataTests = () => {}
 setYoutubeMetadataTest(null);
 setProxyTest(null);
 setDirectApiTest(null);
 setEnvironmentCheck(null);
 };

 const handleProviderChange = async (newProvider: YouTubeSearchProvider): Promise<any> < any> => {}
 setIsSaving(true);
 setSaveMessage('');

 try {}
 const settings = getSettings();
 settings.youtubeSearchProvider = newProvider;
 saveSettings(settings);
 setProvider(newProvider);
 setSaveMessage('Settings saved successfully!');
 } catch (error) {}
 (console).error('Error saving settings:', error);
 setSaveMessage('Error saving settings. Please try again.');
 } finally {}
 setIsSaving(false);
 // Clear message after 3 seconds
 setTimeout((() => setSaveMessage('')) as any, 3000);
 };

 const handlePlayerTypeChange = async (newPlayerType: YouTubePlayerType): Promise<any> < any> => {}
 setIsSaving(true);
 setSaveMessage('');

 try {}
 const settings = getSettings();
 settings.youtubePlayerType = newPlayerType;
 saveSettings(settings);
 setPlayerType(newPlayerType);
 setSaveMessage('YouTube player type updated successfully!');
 } catch (error) {}
 (console).error('Error saving player type:', error);
 setSaveMessage('Error saving player type. Please try again.');
 } finally {}
 setIsSaving(false);
 // Clear message after 3 seconds
 setTimeout((() => setSaveMessage('')) as any, 3000);
 };

 const handleLocalPlayerTypeChange = async (newPlayerType: LocalVideoPlayerType): Promise<any> < any> => {}
 setIsSaving(true);
 setSaveMessage('');

 try {}
 setLocalVideoPlayerType(newPlayerType);
 setLocalPlayerType(newPlayerType);
 setSaveMessage('Local video player type updated successfully!');
 } catch (error) {}
 (console).error('Error saving local player type:', error);
 setSaveMessage('Error saving local player type. Please try again.');
 } finally {}
 setIsSaving(false);
 // Clear message after 3 seconds
 setTimeout((() => setSaveMessage('')) as any, 3000);
 };

 const handleToggleYouTubePlayer = async (playerType: YouTubePlayerType): Promise<any> < any> => {}
 setIsSaving(true);
 setSaveMessage('');

 try {}
 toggleYouTubePlayer(playerType);
 setEnabledYouTubePlayersState(getEnabledYouTubePlayers());
 setSaveMessage('YouTube player settings updated successfully!');
 } catch (error) {}
 (console).error('Error toggling YouTube player:', error);
 setSaveMessage('Error updating YouTube player settings. Please try again.');
 } finally {}
 setIsSaving(false);
 setTimeout((() => setSaveMessage('')) as any, 3000);
 };

 const handleToggleLocalPlayer = async (playerType: LocalVideoPlayerType): Promise<any> < any> => {}
 setIsSaving(true);
 setSaveMessage('');

 try {}
 toggleLocalPlayer(playerType);
 setEnabledLocalPlayersState(getEnabledLocalPlayers());
 setSaveMessage('Local player settings updated successfully!');
 } catch (error) {}
 (console).error('Error toggling local player:', error);
 setSaveMessage('Error updating local player settings. Please try again.');
 } finally {}
 setIsSaving(false);
 setTimeout((() => setSaveMessage('')) as any, 3000);
 };

 const handleSaveInitialSearchKeyword = async (): Promise<any> < void> => {}
 setIsSaving(true);
 setSaveMessage('');

 try {}
 setInitialSearchKeyword(initialSearchKeyword);
 setSaveMessage('Initial search keyword updated successfully!');
 } catch (error) {}
 (console).error('Error saving initial search keyword:', error);
 setSaveMessage('Error saving initial search keyword. Please try again.');
 } finally {}
 setIsSaving(false);
 setTimeout((() => setSaveMessage('')) as any, 3000);
 };

 const youtubeApiConfigured = isYouTubeApiConfigured();
 const youtubeApiAvailable = isYouTubeApiAvailable();
 const googleSearchAvailable = isGoogleSearchAvailable();
 const hybridModeAvailable = isHybridModeAvailable();

 const renderPlayerCard = (config: VideoPlayerConfig, isSelected: string | number, isEnabled: string | number, onSelect: () => void, onToggleEnabled: () => void) => {}
 const usedOnPages = getPlayerUsageByPage(config.type);

 const getPerformanceColor = (performance: any) => {}
 switch (performance) {}
 case 'high': return 'text - green - 600 bg - green - 100';
 case 'medium': return 'text - yellow - 600 bg - yellow - 100';
 case 'low': return 'text - red - 600 bg - red - 100';
 default: return 'text - gray - 600 bg - gray - 100'
 };

 const getComplexityColor = (complexity: any) => {}
 switch (complexity) {}
 case 'simple': return 'text - blue - 600 bg - blue - 100';
 case 'moderate': return 'text - purple - 600 bg - purple - 100';
 case 'advanced': return 'text - orange - 600 bg - orange - 100';
 default: return 'text - gray - 600 bg - gray - 100'
 };

 const getCategoryIcon = (category: any) => {}
 return category === 'youtube' ?;
 <PlayIcon className="h - 5 w - 5 text - red - 500" /> :
 <VideoCameraIcon className="h - 5 w - 5 text - blue - 500" />;
 };

 return (
 <div>
// FIXED:  className={`relative p - 4 border - 2 rounded - lg cursor - pointer transition - all duration - 200 hover:shadow - md ${}
 isSelected
 ? 'border - blue - 500 bg - blue - 50 shadow - md'
 : 'border - gray - 200 bg - white hover:border - gray - 300'
 }`} />
// FIXED:  onClick={(e: React.MouseEvent) => onSelect(e)}
 >
 <div className={"fle}x items - start justify - between mb - 3">
 <div className={"fle}x items - center space - x - 2">
 {getCategoryIcon(config.category)}
 <h3 className={"tex}t - lg font - semibold text - gray - 900">{config.name}</h3>
 <span className={`px - 2 py - 1 text - xs font - medium rounded - full ${}>
 isEnabled ? 'text - green - 600 bg - green - 100' : 'text - gray - 600 bg - gray - 100' />
 }`}>
 {isEnabled ? 'Enabled' : 'Disabled'}
// FIXED:  </span>
 {isSelected && (}
 <span className={"p}x - 2 py - 1 text - xs font - medium rounded - full bg - blue - 600 text - white">
 ACTIVE
// FIXED:  </span>
 )}
// FIXED:  </div>
 <div className={"fle}x items - center space - x - 2">
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => {}
 e.stopPropagation();
 onToggleEnabled();
 }
// FIXED:  className={`px - 3 py - 1 text - xs font - medium rounded - full transition - colors ${}
 isEnabled
 ? 'bg - red - 100 text - red - 600 hover:bg - red - 200'
 : 'bg - green - 100 text - green - 600 hover:bg - green - 200'
 }`}
 >
 {isEnabled ? 'Disable' : 'Enable'}
// FIXED:  </button>
 <span className={`px - 2 py - 1 text - xs font - medium rounded - full ${getPerformanceColor(config.performance)}`}>
 {config.performance} performance
// FIXED:  </span>
 <span className={`px - 2 py - 1 text - xs font - medium rounded - full ${getComplexityColor(config.complexity)}`}>
 {config.complexity}
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </div>
<p className={"tex}t - sm text - gray - 600 mb - 3">{config.description}</p>

 {/* Page Usage Information */}
 {usedOnPages.length > 0 && (}
 <div className={"m}b - 3 p - 3 bg - blue - 50 rounded - lg border border - blue - 200">
 <h4 className={"tex}t - sm font - medium text - blue - 900 mb - 2 flex items - center">
 <CogIcon className="h - 4 w - 4 mr - 1" />
 Currently Used On:
// FIXED:  </h4>
 <div className={"fle}x flex - wrap gap - 1">
 {usedOnPages.map((page) => (}
 <span key={page} className={"p}x - 2 py - 1 text - xs bg - blue - 600 text - white rounded font - medium">
 {getPageDisplayName(page)}
// FIXED:  </span>
 ))}
// FIXED:  </div>
<p className={"tex}t - xs text - blue - 700 mt - 1">
 {config.category === 'youtube' ? 'For YouTube videos' : 'For local / custom videos'}
// FIXED:  </p>
// FIXED:  </div>
 )}

 <div className={"m}b - 3">
 <h4 className={"tex}t - sm font - medium text - gray - 700 mb - 1">Features:</h4>
 <div className={"fle}x flex - wrap gap - 1">
 {config.features.map((feature,}
 index) => (
 <span key={index} className={"p}x - 2 py - 1 text - xs bg - gray - 100 text - gray - 700 rounded">
 {feature}
// FIXED:  </span>
 ))}
// FIXED:  </div>
// FIXED:  </div>

 <div>
 <h4 className={"tex}t - sm font - medium text - gray - 700 mb - 1">Best for:</h4>
 <ul className={"tex}t - xs text - gray - 600 list - disc list - inside">
 {config.useCases.slice(0, 2).map((useCase,}
 index) => (
 <li key={index}>{useCase}</li>
 ))}
// FIXED:  </ul>
// FIXED:  </div>

 {isSelected && (}
 <div className={"absolut}e top - 2 right - 2">
 <div className="w - 4 h - 4 bg - blue - 500 rounded - full flex items - center justify - center">
 <div className="w - 2 h - 2 bg - white rounded - full" />
// FIXED:  </div>
// FIXED:  </div>
 )}
// FIXED:  </div>
 );
 };

 const pageConfigurations = getAllPageConfigurations();

 return (
 <div className={"mi}n - h - screen bg - gray - 50 py - 8">
 <div className={"ma}x - w - 7xl mx - auto px - 4 sm:px - 6 lg:px - 8">
 <div className={"b}g - white shadow rounded - lg">
 <div className={"p}x - 6 py - 4 border - b border - gray - 200">
 <h1 className={"tex}t - 2xl font - bold text - gray - 900">Video Player Management</h1>
 <p className={"m}t - 1 text - sm text - gray - 600">
 Configure video players, search providers, and default settings for your application.
// FIXED:  </p>
// FIXED:  </div>

 {/* Tab Navigation */}
 <div className={"borde}r - b border - gray - 200">
 <nav className="-mb - px flex space - x - 8 px - 6" aria - label="Tabs">
 {[}
 { id: 'overview',}
 name: 'Overview', icon: CogIcon },
 { id: 'player - config',}
 name: 'Player Configuration', icon: PlayIcon },
 { id: 'youtube - players',}
 name: 'YouTube Players', icon: PlayIcon },
 { id: 'local - players',}
 name: 'Local Video Players', icon: VideoCameraIcon },
 { id: 'search',}
 name: 'Search Settings', icon: SparklesIcon },
 { id: 'api - testing',}
 name: 'API Testing', icon: BugAntIcon }].map((tab) => {}
 const Icon = tab.icon;
 return (
 <button>
 key={tab.id} />
// FIXED:  onClick={() => setActiveTab(tab.id as any: React.MouseEvent)}
// FIXED:  className={`${}
 activeTab === tab.id
 ? 'border - blue - 500 text - blue - 600'
 : 'border - transparent text - gray - 500 hover:text - gray - 700 hover:border - gray - 300'
 } whitespace - nowrap py - 4 px - 1 border - b - 2 font - medium text - sm flex items - center space - x - 2`}
 >
 <Icon className="h - 4 w - 4" />
 <span>{tab.name}</span>
// FIXED:  </button>
 );
 })}
// FIXED:  </nav>
// FIXED:  </div>

 <div className={"p}x - 6 py - 6">
 {/* Save Message */}
 {saveMessage && (}
 <div className={`mb - 6 p - 4 rounded - md ${}>
 saveMessage.includes('Error')
 ? 'bg - red - 50 border border - red - 200 text - red - 700'
 : 'bg - green - 50 border border - green - 200 text - green - 700' />
 }`}>
 {saveMessage}
// FIXED:  </div>
 )}

 {/* Player Configuration Tab */}
 {activeTab === 'player - config' && (}
 <div className={"spac}e - y - 8">
 <div>
 <h2 className={"tex}t - lg font - medium text - gray - 900 mb - 2 flex items - center">
 <CogIcon className="h - 5 w - 5 mr - 2 text - purple - 500" />
 Video Player Configuration
// FIXED:  </h2>
 <p className={"tex}t - sm text - gray - 600 mb - 6">
 Configure video players by category and page. Currently used players are highlighted in each section.
// FIXED:  </p>
// FIXED:  </div>

 {/* 1. YouTube Players Category */}
 <div className={"b}g - red - 50 rounded - lg p - 6 border border - red - 200">
 <h3 className={"tex}t - xl font - bold text - gray - 900 mb - 6 flex items - center">
 <PlayIcon className="h - 6 w - 6 mr - 3 text - red - 500" />
 YouTube Players
// FIXED:  </h3>

 {/* Pages within YouTube Category */}
 <div className={"spac}e - y - 6">
 <div>
 <h4 className={"tex}t - lg font - semibold text - gray - 800 mb - 4">Pages using YouTube Players:</h4>
 <div className={"gri}d grid - cols - 1 md:grid - cols - 2 lg:grid - cols - 3 gap - 4 mb - 6">
 {(['watchPage', 'homePage', 'searchResultsPage'] as PageType).map((page) => {}
 const pageConfig = pageConfigurations.page;
 const isCurrentGlobalPlayer = pageConfig.youtubePlayer === playerType;
 return (
 <div key={page} className={`bg - white border - 2 rounded - lg p - 4 transition - colors ${}>
 isCurrentGlobalPlayer ? 'border - red - 500 bg - red - 50' : 'border - gray - 200 hover:border - red - 300' />
 }`}>
 <h5 className={"fon}t - semibold text - gray - 800 mb - 2 flex items - center">
 <SparklesIcon className="h - 4 w - 4 mr - 1 text - green - 500" />
 {getPageDisplayName(page)}
// FIXED:  </h5>
 <div className={"tex}t - sm">
 <div className={"fon}t - medium text - gray - 900">
 {VIDEO_PLAYER_CONFIGS[pageConfig.youtubePlayer].name}
// FIXED:  </div>
 {isCurrentGlobalPlayer && (}
 <span className={"inlin}e - block mt - 1 px - 2 py - 1 text - xs font - medium rounded - full bg - red - 600 text - white">
 ACTIVE GLOBAL
// FIXED:  </span>
 )}
// FIXED:  </div>
// FIXED:  </div>
 );
 })}
// FIXED:  </div>
// FIXED:  </div>

 {/* Available YouTube Players */}
 <div>
 <h4 className={"tex}t - lg font - semibold text - gray - 800 mb - 4">Available YouTube Video Players:</h4>
 <div className={"gri}d grid - cols - 1 lg:grid - cols - 2 gap - 6">
 {getVideoPlayersByCategory('youtube').map((config) => {}
 const isCurrentPlayer = config.type === playerType;
 const isEnabled = enabledYouTubePlayers.includes(config.type as YouTubePlayerType);
 const usedOnPages = getPlayerUsageByPage(config.type).filter((page) =>
 pageConfigurations.page.youtubePlayer === config.type);

 return (
 <div key={config.type} className={`relative p - 4 border - 2 rounded - lg cursor - pointer transition - all duration - 200 hover:shadow - md ${}>
 isCurrentPlayer
 ? 'border - red - 500 bg - red - 50 shadow - md'
 : 'border - gray - 200 bg - white hover:border - red - 300' />
 }`} onClick={() => handlePlayerTypeChange(config.type as YouTubePlayerType: React.MouseEvent)}>
 <div className={"fle}x items - start justify - between mb - 3">
 <div className={"fle}x items - center space - x - 2">
 <PlayIcon className="h - 5 w - 5 text - red - 500" />
 <h5 className={"tex}t - lg font - semibold text - gray - 900">{config.name}</h5>
 {isCurrentPlayer && (}
 <span className={"p}x - 2 py - 1 text - xs font - medium rounded - full bg - red - 600 text - white">
 CURRENT GLOBAL
// FIXED:  </span>
 )}
 <span className={`px - 2 py - 1 text - xs font - medium rounded - full ${}>
 isEnabled ? 'text - green - 600 bg - green - 100' : 'text - gray - 600 bg - gray - 100' />
 }`}>
 {isEnabled ? 'Enabled' : 'Disabled'}
// FIXED:  </span>
// FIXED:  </div>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => {}
 e.stopPropagation();
 handleToggleYouTubePlayer(config.type as YouTubePlayerType);
 }
// FIXED:  className={`px - 3 py - 1 text - xs font - medium rounded - full transition - colors ${}
 isEnabled
 ? 'bg - red - 100 text - red - 600 hover:bg - red - 200'
 : 'bg - green - 100 text - green - 600 hover:bg - green - 200'
 }`}
 >
 {isEnabled ? 'Disable' : 'Enable'}
// FIXED:  </button>
// FIXED:  </div>
<p className={"tex}t - sm text - gray - 600 mb - 3">{config.description}</p>

 {usedOnPages.length > 0 && (}
 <div className={"m}b - 3 p - 3 bg - red - 100 rounded - lg border border - red - 200">
 <h6 className={"tex}t - sm font - medium text - red - 900 mb - 2">Currently Used On:</h6>
 <div className={"fle}x flex - wrap gap - 1">
 {usedOnPages.map((page) => (}
 <span key={page} className={"p}x - 2 py - 1 text - xs bg - red - 600 text - white rounded font - medium">
 {getPageDisplayName(page)}
// FIXED:  </span>
 ))}
// FIXED:  </div>
// FIXED:  </div>
 )}

 <div className={"gri}d grid - cols - 1 md:grid - cols - 2 gap - 3">
 <div>
 <h6 className={"tex}t - sm font - medium text - gray - 700 mb - 1">Features:</h6>
 <div className={"fle}x flex - wrap gap - 1">
 {config.features.slice(0, 3).map((feature,}
 index) => (
 <span key={index} className={"p}x - 2 py - 1 text - xs bg - gray - 100 text - gray - 700 rounded">
 {feature}
// FIXED:  </span>
 ))}
// FIXED:  </div>
// FIXED:  </div>
 <div>
 <h6 className={"tex}t - sm font - medium text - gray - 700 mb - 1">Performance:</h6>
 <span className={`px - 2 py - 1 text - xs font - medium rounded - full ${}>
 config.performance === 'high' ? 'text - green - 600 bg - green - 100' :
 config.performance === 'medium' ? 'text - yellow - 600 bg - yellow - 100' :
 'text - red - 600 bg - red - 100' />
 }`}>
 {config.performance} performance
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
 })}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 {/* 2. Local Video Players Category */}
 <div className={"b}g - blue - 50 rounded - lg p - 6 border border - blue - 200">
 <h3 className={"tex}t - xl font - bold text - gray - 900 mb - 6 flex items - center">
 <VideoCameraIcon className="h - 6 w - 6 mr - 3 text - blue - 500" />
 Local Video Players
// FIXED:  </h3>

 {/* Pages within Local Video Category */}
 <div className={"spac}e - y - 6">
 <div>
 <h4 className={"tex}t - lg font - semibold text - gray - 800 mb - 4">Pages using Local Video Players:</h4>
 <div className={"gri}d grid - cols - 1 md:grid - cols - 2 lg:grid - cols - 3 gap - 4 mb - 6">
 {(['watchPage', 'homePage', 'searchResultsPage'] as PageType).map((page) => {}
 const pageConfig = pageConfigurations.page;
 const isCurrentGlobalPlayer = pageConfig.localPlayer === localPlayerType;
 return (
 <div key={page} className={`bg - white border - 2 rounded - lg p - 4 transition - colors ${}>
 isCurrentGlobalPlayer ? 'border - blue - 500 bg - blue - 50' : 'border - gray - 200 hover:border - blue - 300' />
 }`}>
 <h5 className={"fon}t - semibold text - gray - 800 mb - 2 flex items - center">
 <SparklesIcon className="h - 4 w - 4 mr - 1 text - green - 500" />
 {getPageDisplayName(page)}
// FIXED:  </h5>
 <div className={"tex}t - sm">
 <div className={"fon}t - medium text - gray - 900">
 {VIDEO_PLAYER_CONFIGS[pageConfig.localPlayer].name}
// FIXED:  </div>
 {isCurrentGlobalPlayer && (}
 <span className={"inlin}e - block mt - 1 px - 2 py - 1 text - xs font - medium rounded - full bg - blue - 600 text - white">
 ACTIVE GLOBAL
// FIXED:  </span>
 )}
// FIXED:  </div>
// FIXED:  </div>
 );
 })}
// FIXED:  </div>
// FIXED:  </div>

 {/* Available Local Video Players */}
 <div>
 <h4 className={"tex}t - lg font - semibold text - gray - 800 mb - 4">Available Local Video Players:</h4>
 <div className={"gri}d grid - cols - 1 lg:grid - cols - 2 gap - 6">
 {getVideoPlayersByCategory('local').map((config) => {}
 const isCurrentPlayer = config.type === localPlayerType;
 const isEnabled = enabledLocalPlayers.includes(config.type as LocalVideoPlayerType);
 const usedOnPages = getPlayerUsageByPage(config.type).filter((page) =>
 pageConfigurations.page.localPlayer === config.type);

 return (
 <div key={config.type} className={`relative p - 4 border - 2 rounded - lg cursor - pointer transition - all duration - 200 hover:shadow - md ${}>
 isCurrentPlayer
 ? 'border - blue - 500 bg - blue - 50 shadow - md'
 : 'border - gray - 200 bg - white hover:border - blue - 300' />
 }`} onClick={() => handleLocalPlayerTypeChange(config.type as LocalVideoPlayerType: React.MouseEvent)}>
 <div className={"fle}x items - start justify - between mb - 3">
 <div className={"fle}x items - center space - x - 2">
 <VideoCameraIcon className="h - 5 w - 5 text - blue - 500" />
 <h5 className={"tex}t - lg font - semibold text - gray - 900">{config.name}</h5>
 {isCurrentPlayer && (}
 <span className={"p}x - 2 py - 1 text - xs font - medium rounded - full bg - blue - 600 text - white">
 CURRENT GLOBAL
// FIXED:  </span>
 )}
 <span className={`px - 2 py - 1 text - xs font - medium rounded - full ${}>
 isEnabled ? 'text - green - 600 bg - green - 100' : 'text - gray - 600 bg - gray - 100' />
 }`}>
 {isEnabled ? 'Enabled' : 'Disabled'}
// FIXED:  </span>
// FIXED:  </div>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => {}
 e.stopPropagation();
 handleToggleLocalPlayer(config.type as LocalVideoPlayerType).catch(() => {}
 // Handle promise rejection silently
 });
 }
// FIXED:  className={`px - 3 py - 1 text - xs font - medium rounded - full transition - colors ${}
 isEnabled
 ? 'bg - red - 100 text - red - 600 hover:bg - red - 200'
 : 'bg - green - 100 text - green - 600 hover:bg - green - 200'
 }`}
 >
 {isEnabled ? 'Disable' : 'Enable'}
// FIXED:  </button>
// FIXED:  </div>
<p className={"tex}t - sm text - gray - 600 mb - 3">{config.description}</p>

 {usedOnPages.length > 0 && (}
 <div className={"m}b - 3 p - 3 bg - blue - 100 rounded - lg border border - blue - 200">
 <h6 className={"tex}t - sm font - medium text - blue - 900 mb - 2">Currently Used On:</h6>
 <div className={"fle}x flex - wrap gap - 1">
 {usedOnPages.map((page) => (}
 <span key={page} className={"p}x - 2 py - 1 text - xs bg - blue - 600 text - white rounded font - medium">
 {getPageDisplayName(page)}
// FIXED:  </span>
 ))}
// FIXED:  </div>
// FIXED:  </div>
 )}

 <div className={"gri}d grid - cols - 1 md:grid - cols - 2 gap - 3">
 <div>
 <h6 className={"tex}t - sm font - medium text - gray - 700 mb - 1">Features:</h6>
 <div className={"fle}x flex - wrap gap - 1">
 {config.features.slice(0, 3).map((feature,}
 index) => (
 <span key={index} className={"p}x - 2 py - 1 text - xs bg - gray - 100 text - gray - 700 rounded">
 {feature}
// FIXED:  </span>
 ))}
// FIXED:  </div>
// FIXED:  </div>
 <div>
 <h6 className={"tex}t - sm font - medium text - gray - 700 mb - 1">Performance:</h6>
 <span className={`px - 2 py - 1 text - xs font - medium rounded - full ${}>
 config.performance === 'high' ? 'text - green - 600 bg - green - 100' :
 config.performance === 'medium' ? 'text - yellow - 600 bg - yellow - 100' :
 'text - red - 600 bg - red - 100' />
 }`}>
 {config.performance} performance
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
 })}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 )}

 {/* Overview Tab */}
 {activeTab === 'overview' && (}
 <div className={"spac}e - y - 6">
 <div className={"gri}d grid - cols - 1 md:grid - cols - 2 gap - 6">
 {/* Current Settings Summary */}
 <div className={"b}g - gray - 50 rounded - lg p - 6">
 <h3 className={"tex}t - lg font - semibold text - gray - 900 mb - 4 flex items - center">
 <CogIcon className="h - 5 w - 5 mr - 2" />
 Current Configuration
// FIXED:  </h3>
 <div className={"spac}e - y - 3">
 <div>
 <span className={"tex}t - sm font - medium text - gray - 600">Search Provider:</span>
 <span className={"m}l - 2 text - sm text - gray - 900 capitalize">{provider.replace('-', ' ')}</span>
// FIXED:  </div>
 <div>
 <span className={"tex}t - sm font - medium text - gray - 600">YouTube Player:</span>
 <span className={"m}l - 2 text - sm text - gray - 900">{VIDEO_PLAYER_CONFIGS.playerType.name}</span>
// FIXED:  </div>
 <div>
 <span className={"tex}t - sm font - medium text - gray - 600">Local Video Player:</span>
 <span className={"m}l - 2 text - sm text - gray - 900">{VIDEO_PLAYER_CONFIGS.localPlayerType.name}</span>
// FIXED:  </div>
 <div>
 <span className={"tex}t - sm font - medium text - gray - 600">Enabled YouTube Players:</span>
 <span className={"m}l - 2 text - sm text - gray - 900">{enabledYouTubePlayers.length}</span>
// FIXED:  </div>
 <div>
 <span className={"tex}t - sm font - medium text - gray - 600">Enabled Local Players:</span>
 <span className={"m}l - 2 text - sm text - gray - 900">{enabledLocalPlayers.length}</span>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

// FIXED:  </div>

 {/* Quick Stats */}
 <div className={"gri}d grid - cols - 1 md:grid - cols - 3 gap - 4">
 <div className={"b}g - white border border - gray - 200 rounded - lg p - 4">
 <div className={"fle}x items - center">
 <PlayIcon className="h - 8 w - 8 text - red - 500" />
 <div className={"m}l - 3">
 <p className={"tex}t - sm font - medium text - gray - 600">YouTube Players</p>
 <p className={"tex}t - 2xl font - semibold text - gray - 900">
 {enabledYouTubePlayers.length} / {getVideoPlayersByCategory('youtube').length}
// FIXED:  </p>
 <p className={"tex}t - xs text - gray - 500">Enabled / Total</p>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 <div className={"b}g - white border border - gray - 200 rounded - lg p - 4">
 <div className={"fle}x items - center">
 <VideoCameraIcon className="h - 8 w - 8 text - blue - 500" />
 <div className={"m}l - 3">
 <p className={"tex}t - sm font - medium text - gray - 600">Local Players</p>
 <p className={"tex}t - 2xl font - semibold text - gray - 900">
 {enabledLocalPlayers.length} / {getVideoPlayersByCategory('local').length}
// FIXED:  </p>
 <p className={"tex}t - xs text - gray - 500">Enabled / Total</p>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 <div className={"b}g - white border border - gray - 200 rounded - lg p - 4">
 <div className={"fle}x items - center">
 <SparklesIcon className="h - 8 w - 8 text - green - 500" />
 <div className={"m}l - 3">
 <p className={"tex}t - sm font - medium text - gray - 600">Total Players</p>
 <p className={"tex}t - 2xl font - semibold text - gray - 900">{getAllVideoPlayers().length}</p>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 )}

 {/* YouTube Players Tab */}
 {activeTab === 'youtube - players' && (}
 <div className={"spac}e - y - 6">
 <div>
 <h2 className={"tex}t - lg font - medium text - gray - 900 mb - 2 flex items - center">
 <PlayIcon className="h - 5 w - 5 mr - 2 text - red - 500" />
 YouTube Video Players
// FIXED:  </h2>
 <p className={"tex}t - sm text - gray - 600 mb - 6">
 Choose which YouTube player implementation to use for YouTube video playback.
// FIXED:  </p>
// FIXED:  </div>
<div className={"gri}d grid - cols - 1 lg:grid - cols - 2 gap - 6">
 {getVideoPlayersByCategory('youtube').map((config) =>}
 renderPlayerCard(
 config,
 playerType === config.type,
 enabledYouTubePlayers.includes(config.type as YouTubePlayerType),
 () => handlePlayerTypeChange(config.type as YouTubePlayerType),
 () => handleToggleYouTubePlayer(config.type as YouTubePlayerType)))}
// FIXED:  </div>
// FIXED:  </div>
 )}

 {/* Local Video Players Tab */}
 {activeTab === 'local - players' && (}
 <div className={"spac}e - y - 6">
 <div>
 <h2 className={"tex}t - lg font - medium text - gray - 900 mb - 2 flex items - center">
 <VideoCameraIcon className="h - 5 w - 5 mr - 2 text - blue - 500" />
 Local Video Players
// FIXED:  </h2>
 <p className={"tex}t - sm text - gray - 600 mb - 6">
 Choose which player implementation to use for local video files and custom video sources.
// FIXED:  </p>
// FIXED:  </div>
<div className={"gri}d grid - cols - 1 lg:grid - cols - 2 gap - 6">
 {getVideoPlayersByCategory('local').map((config) =>}
 renderPlayerCard(
 config,
 localPlayerType === config.type,
 enabledLocalPlayers.includes(config.type as LocalVideoPlayerType),
 () => handleLocalPlayerTypeChange(config.type as LocalVideoPlayerType),
 () => {}
 handleToggleLocalPlayer(config.type as LocalVideoPlayerType).catch(() => {}
 // Handle promise rejection silently
 });
 }))}
// FIXED:  </div>
// FIXED:  </div>
 )}

 {/* Search Settings Tab */}
 {activeTab === 'search' && (}
 <div className={"spac}e - y - 6">
 <div>
 <h2 className={"tex}t - lg font - medium text - gray - 900 mb - 2 flex items - center">
 <SparklesIcon className="h - 5 w - 5 mr - 2 text - green - 500" />
 Search Settings
// FIXED:  </h2>
 <p className={"tex}t - sm text - gray - 600 mb - 6">
 Configure search provider and initial search keyword for the homepage.
// FIXED:  </p>
// FIXED:  </div>

 {/* Initial Search Keyword Section */}
 <div className={"b}g - blue - 50 rounded - lg p - 6">
 <h3 className={"tex}t - lg font - semibold text - gray - 900 mb - 4 flex items - center">
 <SparklesIcon className="h - 5 w - 5 mr - 2 text - blue - 500" />
 Initial Search Keyword
// FIXED:  </h3>
 <p className={"tex}t - sm text - gray - 600 mb - 4">
 Set the keyword that will be used to search and display results when the app loads initially.
// FIXED:  </p>
 <div className={"spac}e - y - 3">
 <label htmlFor="initial - search - keyword" className={"bloc}k text - sm font - medium text - gray - 700">
 Keyword
// FIXED:  </label>
 <input>
// FIXED:  id="initial - search - keyword"
// FIXED:  type="text"
// FIXED:  value={initialSearchKeyword} />
// FIXED:  onChange={(e: React.ChangeEvent) => setInitialSearchKeywordState(e.target.value)}
// FIXED:  placeholder="Enter keyword for initial search (e.g., trending, music, gaming)"
// FIXED:  className={"m}t - 1 block w - full px - 3 py - 2 border border - gray - 300 rounded - md shadow - sm focus:outline - none focus:ring - blue - 500 focus:border - blue - 500 sm:text - sm"
 />
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => handleSaveInitialSearchKeyword(e)}
// FIXED:  disabled={isSaving || !initialSearchKeyword.trim()}
// FIXED:  className={"m}t - 2 px - 4 py - 2 bg - blue - 500 text - white text - sm font - medium rounded - md hover:bg - blue - 600 disabled:opacity - 50 disabled:cursor - not - allowed transition - colors"
 >
 {isSaving ? 'Saving...' : 'Save Keyword'}
// FIXED:  </button>
 <p className={"tex}t - xs text - gray - 500">
 Current keyword: <span className={"fon}t - medium">{getInitialSearchKeyword()}</span>
// FIXED:  </p>
// FIXED:  </div>
// FIXED:  </div>

 {/* YouTube Search Provider Section */}
 <div>
 <h3 className={"tex}t - lg font - semibold text - gray - 900 mb - 4">YouTube Search Provider</h3>
 <p className={"tex}t - sm text - gray - 600 mb - 6">
 Choose which API to use for searching YouTube videos.
// FIXED:  </p>
// FIXED:  </div>

 <div className={"spac}e - y - 4">
 {/* YouTube Data API v3 Option */}
 <div className={"fle}x items - start">
 <div className={"fle}x items - center h - 5">
 <input>
// FIXED:  id="youtube - api"
// FIXED:  name="search - provider"
// FIXED:  type="radio"
// FIXED:  checked={provider === 'youtube - api'} />
// FIXED:  onChange={() => handleProviderChange('youtube - api': React.ChangeEvent)}
// FIXED:  disabled={!youtubeApiConfigured || isSaving}
// FIXED:  className={"focus}:ring - blue - 500 h - 4 w - 4 text - blue - 600 border - gray - 300 disabled:opacity - 50"
 />
// FIXED:  </div>
 <div className={"m}l - 3 text - sm">
 <label htmlFor="youtube - api" className={"fon}t - medium text - gray - 700">
 YouTube Data API v3
 {!youtubeApiConfigured && (}
 <span className={"m}l - 2 inline - flex items - center px - 2.5 py - 0.5 rounded - full text - xs font - medium bg - red - 100 text - red - 800">
 Not Configured
// FIXED:  </span>
 )}
 {youtubeApiConfigured && !youtubeApiAvailable && (}
 <span className={"m}l - 2 inline - flex items - center px - 2.5 py - 0.5 rounded - full text - xs font - medium bg - yellow - 100 text - yellow - 800">
 Disabled
// FIXED:  </span>
 )}
 {youtubeApiAvailable && (}
 <span className={"m}l - 2 inline - flex items - center px - 2.5 py - 0.5 rounded - full text - xs font - medium bg - green - 100 text - green - 800">
 Available
// FIXED:  </span>
 )}
// FIXED:  </label>
 <p className={"tex}t - gray - 500">
 Official YouTube API with detailed video information and metadata.
 {!youtubeApiConfigured && (}
 <span className={"bloc}k mt - 1 text - red - 600">
 Missing VITE_YOUTUBE_API_KEY in environment variables.
// FIXED:  </span>
 )}
 {youtubeApiConfigured && !youtubeApiAvailable && provider === 'google - search' && (}
 <span className={"bloc}k mt - 1 text - yellow - 600">
 YouTube Data API is disabled when Google Custom Search is selected. Switch to enable YouTube API features.
// FIXED:  </span>
 )}
// FIXED:  </p>
// FIXED:  </div>
// FIXED:  </div>

 {/* Google Custom Search Option */}
 <div className={"fle}x items - start">
 <div className={"fle}x items - center h - 5">
 <input>
// FIXED:  id="google - search"
// FIXED:  name="search - provider"
// FIXED:  type="radio"
// FIXED:  checked={provider === 'google - search'} />
// FIXED:  onChange={() => handleProviderChange('google - search': React.ChangeEvent)}
// FIXED:  disabled={!googleSearchAvailable || isSaving}
// FIXED:  className={"focus}:ring - blue - 500 h - 4 w - 4 text - blue - 600 border - gray - 300 disabled:opacity - 50"
 />
// FIXED:  </div>
 <div className={"m}l - 3 text - sm">
 <label htmlFor="google - search" className={"fon}t - medium text - gray - 700">
 Google Custom Search JSON API
 {!googleSearchAvailable && (}
 <span className={"m}l - 2 inline - flex items - center px - 2.5 py - 0.5 rounded - full text - xs font - medium bg - red - 100 text - red - 800">
 Not Configured
// FIXED:  </span>
 )}
// FIXED:  </label>
 <p className={"tex}t - gray - 500">
 Search YouTube videos through Google Custom Search with iframe embedding.
 {!googleSearchAvailable && (}
 <span className={"bloc}k mt - 1 text - red - 600">
 Missing VITE_GOOGLE_SEARCH_API_KEY or VITE_GOOGLE_SEARCH_ENGINE_ID in environment variables.
// FIXED:  </span>
 )}
// FIXED:  </p>
// FIXED:  </div>
// FIXED:  </div>

 {/* Hybrid Mode Option */}
 <div className={"fle}x items - start">
 <div className={"fle}x items - center h - 5">
 <input>
// FIXED:  id="hybrid - mode"
// FIXED:  name="search - provider"
// FIXED:  type="radio"
// FIXED:  checked={provider === 'hybrid'} />
// FIXED:  onChange={() => handleProviderChange('hybrid': React.ChangeEvent)}
// FIXED:  disabled={!hybridModeAvailable || isSaving}
// FIXED:  className={"focus}:ring - blue - 500 h - 4 w - 4 text - blue - 600 border - gray - 300 disabled:opacity - 50"
 />
// FIXED:  </div>
 <div className={"m}l - 3 text - sm">
 <label htmlFor="hybrid - mode" className={"fon}t - medium text - gray - 700">
 Hybrid Mode (YouTube API + Custom Search Fallback)
 {!hybridModeAvailable && (}
 <span className={"m}l - 2 inline - flex items - center px - 2.5 py - 0.5 rounded - full text - xs font - medium bg - red - 100 text - red - 800">
 Not Configured
// FIXED:  </span>
 )}
 {hybridModeAvailable && (}
 <span className={"m}l - 2 inline - flex items - center px - 2.5 py - 0.5 rounded - full text - xs font - medium bg - green - 100 text - green - 800">
 Recommended
// FIXED:  </span>
 )}
// FIXED:  </label>
 <p className={"tex}t - gray - 500">
 Uses YouTube Data API v3 first for optimal results, then automatically switches to Google Custom Search when quota is reached.
 {!hybridModeAvailable && (}
 <span className={"bloc}k mt - 1 text - red - 600">
 Requires both VITE_YOUTUBE_API_KEY and VITE_GOOGLE_SEARCH_API_KEY + VITE_GOOGLE_SEARCH_ENGINE_ID in environment variables.
// FIXED:  </span>
 )}
// FIXED:  </p>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 {/* API Configuration Help */}
 <div className={"m}t - 6 p - 4 bg - blue - 50 rounded - md">
 <h3 className={"tex}t - sm font - medium text - blue - 900 mb - 2">
 API Configuration Help
// FIXED:  </h3>
 <div className={"tex}t - sm text - blue - 700 space - y - 2">
 <p>
 <strong > YouTube Data API v3:</strong> Add <code className={"b}g - blue - 100 px - 1 rounded">VITE_YOUTUBE_API_KEY</code> to your .env.local file.
// FIXED:  </p>
 <p>
 <strong > Google Custom Search:</strong> Add both <code className={"b}g - blue - 100 px - 1 rounded">VITE_GOOGLE_SEARCH_API_KEY</code> and <code className={"b}g - blue - 100 px - 1 rounded">VITE_GOOGLE_SEARCH_ENGINE_ID</code> to your .env.local file.
// FIXED:  </p>
 <p>
 <strong > Hybrid Mode:</strong> Requires all three environment variables above. Provides the best user experience by using YouTube API first, then falling back to Custom Search when quota limits are reached.
// FIXED:  </p>
 <p className={"tex}t - xs">
 Restart the development server after adding environment variables.
// FIXED:  </p>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 )}

 {/* API Testing Tab */}
 {activeTab === 'api - testing' && (}
 <div className={"spac}e - y - 6">
 <div>
 <h2 className={"tex}t - lg font - medium text - gray - 900 mb - 2 flex items - center">
 <BugAntIcon className="h - 5 w - 5 mr - 2 text - purple - 500" />
 API Testing & Debugging
// FIXED:  </h2>
 <p className={"tex}t - sm text - gray - 600 mb - 6">
 Test and debug both Google Custom Search API and YouTube Data API v3, manage video store, and troubleshoot metadata issues.
// FIXED:  </p>
// FIXED:  </div>

 {/* API Configuration Check */}
 <div className={"b}g - gray - 50 rounded - lg p - 6">
 <h3 className={"tex}t - lg font - semibold mb - 4">API Configuration</h3>
 <div className={"spac}e - y - 2 text - sm">
 <div className={"fle}x items - center">
 <span className="w - 48">Google Search API Key:</span>
 <span className={`px - 2 py - 1 rounded text - xs font - medium ${}>
 import.meta.env.VITE_GOOGLE_SEARCH_API_KEY ? 'bg - green - 100 text - green - 800' : 'bg - red - 100 text - red - 800' />
 }`}>
 {import.meta.env.VITE_GOOGLE_SEARCH_API_KEY ? '✅ Set' : '❌ Missing'}
// FIXED:  </span>
// FIXED:  </div>
 <div className={"fle}x items - center">
 <span className="w - 48">Google Search Engine ID:</span>
 <span className={`px - 2 py - 1 rounded text - xs font - medium ${}>
 import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID ? 'bg - green - 100 text - green - 800' : 'bg - red - 100 text - red - 800' />
 }`}>
 {import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID ? '✅ Set' : '❌ Missing'}
// FIXED:  </span>
// FIXED:  </div>
 <div className={"fle}x items - center">
 <span className="w - 48">YouTube API Key:</span>
 <span className={`px - 2 py - 1 rounded text - xs font - medium ${}>
 import.meta.env.VITE_YOUTUBE_API_KEY ? 'bg - green - 100 text - green - 800' : 'bg - red - 100 text - red - 800' />
 }`}>
 {import.meta.env.VITE_YOUTUBE_API_KEY ? '✅ Set' : '❌ Missing'}
// FIXED:  </span>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 {/* Store Statistics */}
 <div className={"b}g - gray - 50 rounded - lg p - 6">
 <h3 className={"tex}t - lg font - semibold mb - 4">Store Statistics</h3>
 <p className={"tex}t - sm text - gray - 600 mb - 4">Videos in store: {storeVideos.length}</p>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => handleClearStore(e)}
// FIXED:  className={"p}x - 4 py - 2 bg - red - 500 text - white rounded hover:bg - red - 600 transition - colors"
 >
 Clear Store
// FIXED:  </button>
// FIXED:  </div>

 {/* Google Custom Search API Tests */}
 <div className={"b}g - orange - 50 rounded - lg p - 6 border border - orange - 200">
 <h3 className={"tex}t - lg font - semibold mb - 4 flex items - center">
 <span className={"tex}t - xl mr - 2">🔍</span>
 Google Custom Search API Tests
// FIXED:  </h3>
 <p className={"tex}t - sm text - gray - 600 mb - 4">
 Test Google Custom Search JSON API for video discovery and metadata fetching.
// FIXED:  </p>
 <div className={"fle}x gap - 2 mb - 4">
 <input>
// FIXED:  type="text"
// FIXED:  value={testVideoId} />
// FIXED:  onChange={(e: React.ChangeEvent) => setTestVideoId(e.target.value)}
// FIXED:  placeholder="YouTube Video ID"
// FIXED:  className={"fle}x - 1 px - 3 py - 2 border border - gray - 300 rounded - md focus:outline - none focus:ring - 2 focus:ring - blue - 500"
 />
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => handleTestFetch(e)}
// FIXED:  disabled={loading}
// FIXED:  className={"p}x - 4 py - 2 bg - orange - 500 text - white rounded hover:bg - orange - 600 disabled:opacity - 50 transition - colors"
 >
 {loading ? 'Testing...' : '🔍 Google Search Direct'}
// FIXED:  </button>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => handleTestUnifiedService(e)}
// FIXED:  disabled={loading}
// FIXED:  className={"p}x - 4 py - 2 bg - orange - 600 text - white rounded hover:bg - orange - 700 disabled:opacity - 50 transition - colors"
 >
 {loading ? 'Testing...' : '🔄 Google Search Unified'}
// FIXED:  </button>
// FIXED:  </div>

 {testResult && (}
 <div className={"m}t - 4 p - 3 bg - white rounded border">
 <h4 className={"fon}t - semibold mb - 2">🔍 Google Custom Search Direct API Result:</h4>
 <pre className={"tex}t - sm overflow - auto bg - gray - 100 p - 2 rounded max - h - 64">
 {JSON.stringify(testResult, null, 2)}
// FIXED:  </pre>
// FIXED:  </div>
 )}

 {unifiedServiceTest && (}
 <div className={"m}t - 4 p - 3 bg - white rounded border">
 <h4 className={"fon}t - semibold mb - 2">🔄 Google Custom Search Unified Service Result:</h4>
 <pre className={"tex}t - sm overflow - auto bg - gray - 100 p - 2 rounded max - h - 64">
 {JSON.stringify(unifiedServiceTest, null, 2)}
// FIXED:  </pre>
// FIXED:  </div>
 )}
// FIXED:  </div>

 {/* YouTube Data API Tests */}
 <div className={"b}g - red - 50 rounded - lg p - 6 border border - red - 200">
 <h3 className={"tex}t - lg font - semibold mb - 4 flex items - center">
 <span className={"tex}t - xl mr - 2">📺</span>
 YouTube Data API v3 Tests
// FIXED:  </h3>
 <p className={"tex}t - sm text - gray - 600 mb - 6">
 Test YouTube Data API v3 for metadata fetching, proxy configuration, and debugging issues.
// FIXED:  </p>

 {/* Environment Check */}
 <div className={"m}b - 6">
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => checkEnvironment(e)}
// FIXED:  className={"p}x - 4 py - 2 bg - purple - 500 text - white rounded hover:bg - purple - 600 transition - colors"
 >
 🔧 Check Environment
// FIXED:  </button>

 {environmentCheck && (}
 <div className={"m}t - 4 p - 3 bg - white rounded border">
 <h4 className={"fon}t - semibold mb - 2">Environment Configuration:</h4>
 <div className={"gri}d grid - cols - 2 gap - 4 text - sm">
 <div>
 <strong > Mode:</strong> {environmentCheck.mode}<br/>
 <strong > Host:</strong> {environmentCheck.host}<br/>
 <strong > Port:</strong> {environmentCheck.port}<br/>
 <strong > Origin:</strong> {environmentCheck.origin}
// FIXED:  </div>
 <div>
 <strong > Proxy Active:</strong> {environmentCheck.proxyActive ? '✅ Yes' : '❌ No'}<br/>
 <strong > YouTube API Key:</strong> {environmentCheck.youtubeApiKey ? '✅ Set' : '❌ Missing'}<br/>
 <strong > Google Search API:</strong> {environmentCheck.googleSearchApiKey ? '✅ Set' : '❌ Missing'}<br/>
 <strong > Search Engine ID:</strong> {environmentCheck.googleSearchEngineId ? '✅ Set' : '❌ Missing'}
// FIXED:  </div>
// FIXED:  </div>
 <div className={"m}t - 3 text - sm text - gray - 600">
 <strong > Proxy URL:</strong> <code className={"b}g - gray - 100 px - 1 rounded">{environmentCheck.proxyUrl}</code>
// FIXED:  </div>
// FIXED:  </div>
 )}
// FIXED:  </div>

 {/* Test Buttons */}
 <div className={"fle}x gap - 2 mb - 4">
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => testProxyEndpoint(e)}
// FIXED:  disabled={loading}
// FIXED:  className={"p}x - 4 py - 2 bg - red - 500 text - white rounded hover:bg - red - 600 disabled:opacity - 50 transition - colors"
 >
 {loading ? 'Testing...' : '🔗 YouTube API Proxy'}
// FIXED:  </button>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => testDirectAPI(e)}
// FIXED:  disabled={loading}
// FIXED:  className={"p}x - 4 py - 2 bg - red - 600 text - white rounded hover:bg - red - 700 disabled:opacity - 50 transition - colors"
 >
 {loading ? 'Testing...' : '🌐 YouTube API Direct'}
// FIXED:  </button>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => testYouTubeMetadataFetch(e)}
// FIXED:  disabled={loading}
// FIXED:  className={"p}x - 4 py - 2 bg - red - 700 text - white rounded hover:bg - red - 800 disabled:opacity - 50 transition - colors"
 >
 {loading ? 'Testing...' : '📊 YouTube API App'}
// FIXED:  </button>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => clearYouTubeMetadataTests(e)}
// FIXED:  className={"p}x - 4 py - 2 bg - gray - 500 text - white rounded hover:bg - gray - 600 transition - colors"
 >
 🗑️ Clear Results
// FIXED:  </button>
// FIXED:  </div>

 {/* Test Results */}
 <div className={"spac}e - y - 4">
 {/* Proxy Test Results */}
 {proxyTest && (}
 <div className={`p - 3 rounded border ${}>
 proxyTest.success ? 'bg - green - 50 border - green - 200' : 'bg - red - 50 border - red - 200' />
 }`}>
 <h4 className={"fon}t - semibold mb - 2 flex items - center">
 {proxyTest.success ? '✅' : '❌'} YouTube Data API v3 Proxy Test
// FIXED:  </h4>
 {proxyTest.success ? (}
 <div>
 <div className={"gri}d grid - cols - 2 gap - 4 mb - 3">
 <div>
 <strong > Title:</strong> {proxyTest.video.title}<br/>
 <strong > Channel:</strong> {proxyTest.video.channel}<br/>
 <strong > Views:</strong> {proxyTest.video.views}
// FIXED:  </div>
 <div>
 <strong > Likes:</strong> {proxyTest.video.likes}<br/>
 <strong > Published:</strong> {proxyTest.video.published}<br/>
 <strong > Duration:</strong> {proxyTest.video.duration}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 ) : (
 <div>
 <strong > Error:</strong> {proxyTest.error}<br/>
 {proxyTest.note && <div className={"tex}t - sm text - gray - 600 mt - 1">{proxyTest.note}</div>}
// FIXED:  </div>
 )}
 <details className={"m}t - 2">
 <summary className={"curso}r - pointer text - sm text - gray - 600">Show Full Response</summary>
 <pre className={"tex}t - xs overflow - auto bg - gray - 100 p - 2 rounded mt - 2 max - h - 32">
 {typeof proxyTest.fullResponse === 'object'}
 ? JSON.stringify(proxyTest.fullResponse, null, 2)
 : proxyTest.fullResponse}
// FIXED:  </pre>
// FIXED:  </details>
// FIXED:  </div>
 )}

 {/* Direct API Test Results */}
 {directApiTest && (}
 <div className={`p - 3 rounded border ${}>
 directApiTest.success ? 'bg - green - 50 border - green - 200' : 'bg - red - 50 border - red - 200' />
 }`}>
 <h4 className={"fon}t - semibold mb - 2 flex items - center">
 {directApiTest.success ? '✅' : '❌'} YouTube Data API v3 Direct Test
// FIXED:  </h4>
 <div>
 <strong > Status:</strong> {directApiTest.status}<br/>
 {directApiTest.error && <div><strong > Error:</strong> {directApiTest.error}</div>}
 {directApiTest.note && <div className={"tex}t - sm text - gray - 600 mt - 1">{directApiTest.note}</div>}
// FIXED:  </div>
 <details className={"m}t - 2">
 <summary className={"curso}r - pointer text - sm text - gray - 600">Show Full Response</summary>
 <pre className={"tex}t - xs overflow - auto bg - gray - 100 p - 2 rounded mt - 2 max - h - 32">
 {typeof directApiTest.fullResponse === 'object'}
 ? JSON.stringify(directApiTest.fullResponse, null, 2)
 : directApiTest.fullResponse}
// FIXED:  </pre>
// FIXED:  </details>
// FIXED:  </div>
 )}

 {/* App Metadata Test Results */}
 {youtubeMetadataTest && (}
 <div className={`p - 3 rounded border ${}>
 youtubeMetadataTest.success ? 'bg - green - 50 border - green - 200' : 'bg - red - 50 border - red - 200' />
 }`}>
 <h4 className={"fon}t - semibold mb - 2 flex items - center">
 {youtubeMetadataTest.success ? '✅' : '❌'} YouTube Data API v3 App Integration Test
// FIXED:  </h4>
 {youtubeMetadataTest.success ? (}
 <div>
 <div className={"gri}d grid - cols - 2 gap - 4 mb - 3">
 <div>
 <strong > ID:</strong> {youtubeMetadataTest.video.id}<br/>
 <strong > Title:</strong> {youtubeMetadataTest.video.title}<br/>
 <strong > Channel:</strong> {youtubeMetadataTest.video.channel}<br/>
 <strong > Views:</strong> {youtubeMetadataTest.video.views}
// FIXED:  </div>
 <div>
 <strong > Source:</strong> {youtubeMetadataTest.video.source}<br/>
 <strong > Published:</strong> {youtubeMetadataTest.video.publishedAt}<br/>
 <strong > Duration:</strong> {youtubeMetadataTest.video.duration}<br/>
 <strong > Has Avatar:</strong> {youtubeMetadataTest.video.channelAvatar ? '✅ Yes' : '❌ No'}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 ) : (
 <div>
 <strong > Error:</strong> {youtubeMetadataTest.error}<br/>
 {youtubeMetadataTest.stack && (}
 <details className={"m}t - 2">
 <summary className={"curso}r - pointer text - sm text - gray - 600">Show Stack Trace</summary>
 <pre className={"tex}t - xs overflow - auto bg - gray - 100 p - 2 rounded mt - 2 max - h - 32">
 {youtubeMetadataTest.stack}
// FIXED:  </pre>
// FIXED:  </details>
 )}
// FIXED:  </div>
 )}
 {youtubeMetadataTest.success && (}
 <details className={"m}t - 2">
 <summary className={"curso}r - pointer text - sm text - gray - 600">Show Full Video Object</summary>
 <pre className={"tex}t - xs overflow - auto bg - gray - 100 p - 2 rounded mt - 2 max - h - 32">
 {JSON.stringify(youtubeMetadataTest.fullVideo, null, 2)}
// FIXED:  </pre>
// FIXED:  </details>
 )}
// FIXED:  </div>
 )}
// FIXED:  </div>
// FIXED:  </div>

 {/* Store Contents */}
 <div className={"b}g - gray - 50 rounded - lg p - 6">
 <h3 className={"tex}t - lg font - semibold mb - 4">Videos in Store</h3>
 {storeVideos.length === 0 ? (}
 <p className={"tex}t - gray - 500">No videos in store</p>
 ) : (
 <div className={"spac}e - y - 3 max - h - 96 overflow - y - auto">
 {storeVideos.map((video, index) => (}
 <div key={index} className={"b}g - white p - 3 rounded border">
 <div className={"fon}t - medium text - sm">{video.title || 'Unknown Title'}</div>
 <div className={"tex}t - xs text - gray - 600 mt - 1">
 <div > ID: {video.id || 'Unknown ID'}</div>
<div > Channel: {video.channelName || 'Unknown Channel'}</div>
 <div > URL: {video.videoUrl || 'No URL'}</div>
 {video.viewCount && typeof video.viewCount === 'number' && (}
 <div > Views: {video.viewCount.toLocaleString()}</div>
 )}
// FIXED:  </div>
// FIXED:  </div>
 ))}
// FIXED:  </div>
 )}
// FIXED:  </div>
// FIXED:  </div>
 )}
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default AdminPage;
