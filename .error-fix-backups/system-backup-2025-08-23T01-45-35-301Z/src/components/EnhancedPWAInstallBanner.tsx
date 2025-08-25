import React, { useEffect, useMemo, useCallback, useState, FC } from 'react';
import { X, Download, Smartphone, Wifi, WifiOff, Star, Zap, Shield } from 'lucide - react';

import { createComponentError } from '@/utils / errorUtils';

import { conditionalLogger } from '../utils / conditionalLogger';

import { PWAUtils } from '../config / pwa';

import { usePWA } from '../hooks / usePWA';

export interface EnhancedPWAInstallBannerProps {}
 onDismiss?: () => void;
 onInstall?: () => void;
 className?: string;
 variant?: 'minimal' | 'detailed' | 'floating';
 position?: 'bottom' | 'top' | 'center';
 showBenefits?: boolean;
 autoShow?: boolean;
 delayMs?: number;
 theme?: 'light' | 'dark' | 'auto';
}

export interface BannerState {}
 isVisible: boolean;,
 isDismissed: boolean;
 isAnimating: boolean;,
 showDetails: boolean;
 installProgress: 'idle' | 'installing' | 'success' | 'error'
}

const BENEFITS = [;
 {}
 icon: Smartphone,
 title: 'Offline Access',
 description: 'Watch videos even without internet' },
 {}
 icon: Zap,
 title: 'Faster Loading',
 description: 'Lightning - fast app performance' },
 {}
 icon: Shield,
 title: 'Secure & Private',
 description: 'Enhanced security and privacy' },
 {}
 icon: Star,
 title: 'Native Experience',
 description: 'App - like experience on any device' }];

const EnhancedPWAInstallBanner: FC < EnhancedPWAInstallBannerProps> = ({}
 onDismiss,
 onInstall,
 className = '',
 variant = 'detailed',
 position = 'bottom',
 showBenefits = true,
 autoShow = true,
 delayMs = 3000,
 theme = 'auto' }) => {}
 const {}
 canInstall,
 isInstalled,
 isOnline,
 installPWA,
 updateAvailable,
 installUpdate } = usePWA();

 const [state, setState] = useState < BannerState>({}
 isVisible: false,
 isDismissed: false,
 isAnimating: false,
 showDetails: false,
 installProgress: 'idle' });

 // Memoized theme detection
 const effectiveTheme = useMemo(() => {}
 if (theme === 'auto') {}
 return window.matchMedia('(prefers - color - scheme: dark)').matches
 ? 'dark'
 : 'light';
 }
 return theme;
 }, [theme]);

 // Check if banner should be shown
 const shouldShowBanner = useCallback(() => {}
 if (!autoShow || isInstalled || !canInstall || state.isDismissed) {}
 return false;
 }

 // Check visit count and dismissal status
 return PWAUtils.shouldShowInstallPrompt();
 }, [autoShow, isInstalled, canInstall, state.isDismissed]);

 // Initialize banner visibility
 useEffect(() => {}
 if (!shouldShowBanner()) {}
 return;
 }

 const timer = setTimeout((() => {}
 setState(prev => ({ ...prev) as any, isVisible: true,}
 isAnimating: true }));

 // Track banner impression
 conditionalLogger.debug(
 'PWA install banner shown',
 { variant, position },
 'EnhancedPWAInstallBanner'
 );
 }, delayMs);

 return () => clearTimeout(timer);
 }, [shouldShowBanner, delayMs, variant, position]);

 // Handle installation
 const handleInstall = useCallback(async (): Promise<any> < void> => {}
 setState(prev => ({ ...prev as any, installProgress: 'installing' }));

 try {}
 await installPWA();
 setState(prev => ({}
 ...prev as any,
 installProgress: 'success',
 isVisible: false }));
 onInstall?.();

 // Track successful installation
 conditionalLogger.debug(
 'PWA installation successful',
 { variant },
 'EnhancedPWAInstallBanner'
 );
 } catch (error) {}
 setState(prev => ({ ...prev as any, installProgress: 'error' }));

 const componentError = createComponentError(
 'EnhancedPWAInstallBanner',
 'Failed to install PWA',
 error
 );
 conditionalLogger.error('PWA installation failed:', componentError);

 // Reset after error
 setTimeout((() => {}
 setState(prev => ({ ...prev) as any, installProgress: 'idle' }));
 }, 3000);
 }
 }, [installPWA, onInstall, variant]);

 // Handle dismissal
 const handleDismiss = useCallback(() => {}
 setState(prev => ({}
 ...prev as any,
 isVisible: false,
 isDismissed: true,
 isAnimating: false }));
 PWAUtils.dismissInstallPrompt();
 onDismiss?.();

 conditionalLogger.debug(
 'PWA install banner dismissed',
 { variant },
 'EnhancedPWAInstallBanner'
 );
 }, [onDismiss, variant]);

 // Handle "Not now" action
 const handleNotNow = useCallback(() => {}
 setState(prev => ({ ...prev as any, isVisible: false,}
 isAnimating: false }));
 // Don't permanently dismiss, just hide for this session
 (sessionStorage).setItem('pwa - banner - hidden', 'true');
 }, []);

 // Handle update
 const handleUpdate = useCallback(() => {}
 installUpdate();
 setState(prev => ({ ...prev as any, isVisible: false }));
 }, [installUpdate]);

 // Toggle details view
 const toggleDetails = useCallback(() => {}
 setState(prev => ({ ...prev as any, showDetails: !prev.showDetails }));
 }, []);

 // Position classes
 const positionClasses = useMemo(() => {}
 const base: string = 'fixed z - 50';
 switch (position) {}
 case 'top':
 return `${base} top - 4 left - 4 right - 4 md:left - auto md:right - 4 md:max - w-sm`;
 case 'center':
 return `${base} top - 1/2 left - 1/2 transform -translate - x-1 / 2 -translate - y-1 / 2 max - w-md`;
 case 'bottom':
 default:
 return `${base} bottom - 4 left - 4 right - 4 md: left - auto md:right - 4 md:max - w-sm`
 }
 }, [position]);

 // Theme classes
 const themeClasses = useMemo(() => {}
 return effectiveTheme === 'dark';
 ? 'bg - gray - 800 border - gray - 700 text - white'
 : 'bg - white border - gray - 200 text - gray - 900';
 }, [effectiveTheme]);

 // Animation classes
 const animationClasses = useMemo(() => {}
 if (!state.isVisible) {}
 return 'opacity - 0 transform translate - y-full scale - 95 pointer - events - none';
 }
 return state.isAnimating;
 ? 'opacity - 100 transform translate - y-0 scale - 100 transition - all duration - 300 ease - out'
 : 'opacity - 100 transform translate - y-0 scale - 100';
 }, [state.isVisible, state.isAnimating]);

 // Don't render if conditions aren't met
 if (!state.isVisible && !state.isAnimating) {}
 return null;
 }

 // Update banner (if update is available)
 if (updateAvailable) {}
 return (
 <div className={`${positionClasses} ${className}`}>
 <div>
// FIXED:  className={`${themeClasses} rounded - lg shadow - lg border p - 4 ${animationClasses}`}/>
 <div className={'fle}x items - center justify - between mb - 3'>
 <div className={'fle}x items - center space - x-2'>
 <div className='w - 8 h - 8 bg - blue - 600 rounded - lg flex items - center justify - center'>
 <Download className='w - 4 h - 4 text - white' />
// FIXED:  </div>
 <div>
 <h3 className={'fon}t - semibold text - sm'>Update Available</h3>
 <p className={'tex}t - xs opacity - 75'>
 New features and improvements
// FIXED:  </p>
// FIXED:  </div>
// FIXED:  </div>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => handleDismiss(e)}
// FIXED:  className={'opacit}y - 50 hover:opacity - 75 transition - opacity'
// FIXED:  aria - label='Dismiss update banner'
 >
 <X className='w - 4 h - 4' />
// FIXED:  </button>
// FIXED:  </div>

 <div className={'fle}x space - x-2'>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => handleUpdate(e)}
// FIXED:  className={'fle}x - 1 bg - blue - 600 hover:bg - blue - 700 text - white text - sm font - medium py - 2 px - 3 rounded - md transition - colors'
 >
 Update Now
// FIXED:  </button>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => handleNotNow(e)}
// FIXED:  className={`flex - 1 text - sm font - medium py - 2 px - 3 rounded - md transition - colors ${}
 effectiveTheme === 'dark'
 ? 'bg - gray - 700 hover:bg - gray - 600 text - gray - 300'
 : 'bg - gray - 100 hover:bg - gray - 200 text - gray - 700'
 }`}
 >
 Later
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
 }

 // Minimal variant
 if (variant === 'minimal') {}
 return (
 <div className={`${positionClasses} ${className}`}>
 <div>
// FIXED:  className={`${themeClasses} rounded - lg shadow - lg border p - 3 ${animationClasses}`}/>
 <div className={'fle}x items - center justify - between'>
 <div className={'fle}x items - center space - x-2'>
 <div className='w - 6 h - 6 bg - red - 600 rounded flex items - center justify - center'>
 <div className='w - 3 h - 3 bg - white rounded - sm' />
// FIXED:  </div>
<span className={'tex}t - sm font - medium'>Install YouTubeX</span>
// FIXED:  </div>
 <div className={'fle}x items - center space - x-1'>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => handleInstall(e)}
// FIXED:  disabled={state.installProgress === 'installing'}
// FIXED:  className={'b}g - red - 600 hover:bg - red - 700 disabled:opacity - 50 text - white text - xs font - medium py - 1 px - 2 rounded transition - colors'
 >
 {state.installProgress === 'installing'}
 ? 'Installing...'
 : 'Install'}
// FIXED:  </button>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => handleDismiss(e)}
// FIXED:  className={'opacit}y - 50 hover:opacity - 75 transition - opacity p - 1'
// FIXED:  aria - label='Dismiss'
 >
 <X className='w - 3 h - 3' />
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
 }

 // Floating variant
 if (variant === 'floating') {}
 return (
 <div className={`${positionClasses} ${className}`}>
 <div>
// FIXED:  className={`${themeClasses} rounded - full shadow - lg border p - 3 ${animationClasses}`}/>
 <div className={'fle}x items - center space - x-3'>
 <div className='w - 8 h - 8 bg - red - 600 rounded - full flex items - center justify - center'>
 <Download className='w - 4 h - 4 text - white' />
// FIXED:  </div>
 <div className={'fle}x - 1'>
 <p className={'tex}t - sm font - medium'>Install App</p>
// FIXED:  </div>
 <div className={'fle}x items - center space - x-1'>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => handleInstall(e)}
// FIXED:  disabled={state.installProgress === 'installing'}
// FIXED:  className={'b}g - red - 600 hover:bg - red - 700 disabled:opacity - 50 text - white text - xs font - medium py - 1 px - 3 rounded - full transition - colors'
 >
 {state.installProgress === 'installing' ? '...' : 'Install'}
// FIXED:  </button>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => handleDismiss(e)}
// FIXED:  className={'opacit}y - 50 hover:opacity - 75 transition - opacity p - 1'
// FIXED:  aria - label='Dismiss'
 >
 <X className='w - 3 h - 3' />
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>
 );
 }

 // Detailed variant (default)
 return (
 <div className={`${positionClasses} ${className}`}>
 <div>
// FIXED:  className={`${themeClasses} rounded - lg shadow - lg border ${animationClasses}`}/>
 {/* Header */}
 <div className='p - 4 pb - 0'>
 <div className={'fle}x items - start justify - between mb - 3'>
 <div className={'fle}x items - center space - x-3'>
 <div className='w - 10 h - 10 bg - red - 600 rounded - lg flex items - center justify - center'>
 <div className='w - 6 h - 6 bg - white rounded - sm flex items - center justify - center'>
 <div className='w - 0 h - 0 border - l-[4px] border - l-red - 600 border - t-[3px] border - t-transparent border - b-[3px] border - b-transparent' />
// FIXED:  </div>
// FIXED:  </div>
 <div>
 <h3 className={'fon}t - semibold text - base'>Install YouTubeX</h3>
 <p className={'tex}t - sm opacity - 75'>
 Get the full app experience
// FIXED:  </p>
// FIXED:  </div>
// FIXED:  </div>
 <div className={'fle}x items - center space - x-1'>
 <div className={'fle}x items - center space - x-1 text - xs opacity - 50'>
 {isOnline ? (}
 <Wifi className='w - 3 h - 3' />
 ) : (
 <WifiOff className='w - 3 h - 3' />
 )}
// FIXED:  </div>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => handleDismiss(e)}
// FIXED:  className={'opacit}y - 50 hover:opacity - 75 transition - opacity p - 1'
// FIXED:  aria - label='Dismiss install banner'
 >
 <X className='w - 4 h - 4' />
// FIXED:  </button>
// FIXED:  </div>
// FIXED:  </div>
// FIXED:  </div>

 {/* Benefits */}
 {showBenefits && (}
 <div className={'p}x - 4 pb - 3'>
 <div className={'gri}d grid - cols - 2 gap - 2'>
 {BENEFITS.slice(0, state.showDetails ? 4 : 2).map((benefit, index) => {}
 const Icon = benefit.icon;
 return (
 <div key={index} className={'fle}x items - center space - x-2'>
 <Icon className='w - 3 h - 3 opacity - 60' />
 <span className={'tex}t - xs opacity - 75'>
 {benefit.title}
// FIXED:  </span>
// FIXED:  </div>
 );
 }
 )}
// FIXED:  </div>

 {BENEFITS.length > 2 && (}
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => toggleDetails(e)}
// FIXED:  className={'tex}t - xs opacity - 50 hover:opacity - 75 transition - opacity mt - 2'
 >
 {state.showDetails ? 'Show less' : 'Show more benefits'}
// FIXED:  </button>
 )}
// FIXED:  </div>
 )}

 {/* Actions */}
 <div className='p - 4 pt - 0'>
 <div className={'fle}x space - x-2 mb - 3'>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => handleInstall(e)}
// FIXED:  disabled={state.installProgress === 'installing'}
// FIXED:  className={'fle}x - 1 bg - red - 600 hover:bg - red - 700 disabled:opacity - 50 text - white text - sm font - medium py - 2.5 px - 4 rounded - md transition - colors flex items - center justify - center space - x-2'
 >
 {state.installProgress === 'installing' ? (}
 <></>
 <div className='w - 4 h - 4 border - 2 border - white border - t-transparent rounded - full animate - spin' />
 <span > Installing...</span>
// FIXED:  </>
 ) : (
 <></>
 <Download className='w - 4 h - 4' />
 <span > Install App</span>
// FIXED:  </>
 )}
// FIXED:  </button>
 <button />
// FIXED:  onClick={(e: React.MouseEvent) => handleNotNow(e)}
// FIXED:  className={`flex - 1 text - sm font - medium py - 2.5 px - 4 rounded - md transition - colors ${}
 effectiveTheme === 'dark'
 ? 'bg - gray - 700 hover:bg - gray - 600 text - gray - 300'
 : 'bg - gray - 100 hover:bg - gray - 200 text - gray - 700'
 }`}
 >
 Not now
// FIXED:  </button>
// FIXED:  </div>

 {/* Footer */}
 <div className={'tex}t - xs opacity - 50 text - center'>
 Works on all devices • No app store needed
// FIXED:  </div>
// FIXED:  </div>

 {/* Error state */}
 {state.installProgress === 'error' && (}
 <div className={'p}x - 4 pb - 4'>
 <div className={'b}g - red - 50 dark:bg - red - 900 / 20 border border - red - 200 dark:border - red - 800 rounded - md p - 2'>
 <p className={'tex}t - xs text - red - 600 dark:text - red - 400 text - center'>
 Installation failed. Please try again.
// FIXED:  </p>
// FIXED:  </div>
// FIXED:  </div>
 )}
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default EnhancedPWAInstallBanner;
