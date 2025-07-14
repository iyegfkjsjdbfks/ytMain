import { useState, useEffect, useCallback } from 'react';
import { conditionalLogger } from '../utils/conditionalLogger';
import { createComponentError } from '@/utils/errorUtils';

interface NetworkConnection {
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

interface OfflineState {
  isOnline: boolean;
  wasOffline: boolean;
  offlineDuration: number;
  lastOnlineTime: number | null;
  connectionType: string | null;
  networkInfo: NetworkConnection | null;
}

interface UseOfflineStatusReturn {
  // State
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean;
  offlineDuration: number;
  connectionType: string | null;
  networkInfo: NetworkConnection | null;
  
  // Utilities
  getNetworkQuality: () => 'fast' | 'slow' | 'offline';
  isSlowConnection: () => boolean;
  shouldReduceData: () => boolean;
  getOfflineStats: () => {
    totalOfflineTime: number;
    offlineEvents: number;
    lastOfflineTime: number | null;
  };
  
  // Actions
  pingServer: (url?: string) => Promise<boolean>;
  testConnection: () => Promise<{
    online: boolean;
    latency: number;
    speed: 'fast' | 'slow' | 'offline';
  }>;
}

/**
 * Enhanced hook for managing offline status and network conditions
 * Provides detailed network information and offline handling
 */
export const useOfflineStatus = (): UseOfflineStatusReturn => {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    wasOffline: false,
    offlineDuration: 0,
    lastOnlineTime: Date.now(),
    connectionType: null,
    networkInfo: null
  });

  // Get network quality assessment
  const getNetworkQuality = useCallback((): 'fast' | 'slow' | 'offline' => {
    if (!state.isOnline) {
      return 'offline';
    }

    if (state.networkInfo) {
      const { effectiveType, downlink } = state.networkInfo;
      
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        return 'slow';
      }
      
      if (downlink && downlink < 1.5) {
        return 'slow';
      }
    }

    return 'fast';
  }, [state.isOnline, state.networkInfo]);

  // Check if connection is slow
  const isSlowConnection = useCallback((): boolean => {
    return getNetworkQuality() === 'slow';
  }, [getNetworkQuality]);

  // Check if should reduce data usage
  const shouldReduceData = useCallback((): boolean => {
    if (!state.isOnline) {
      return true;
    }

    // Check for data saver mode
    if (state.networkInfo?.saveData) {
      return true;
    }

    // Check for slow connection
    return isSlowConnection();
  }, [state.isOnline, state.networkInfo, isSlowConnection]);

  // Get offline statistics
  const getOfflineStats = useCallback(() => {
    const stats = localStorage.getItem('offline-stats');
    
    if (stats) {
      try {
        return JSON.parse(stats);
      } catch (error) {
        conditionalLogger.error('Failed to parse offline stats', error, 'useOfflineStatus');
      }
    }

    return {
      totalOfflineTime: 0,
      offlineEvents: 0,
      lastOfflineTime: null
    };
  }, []);

  // Ping server to test connectivity
  const pingServer = useCallback(async (url: string = '/api/ping'): Promise<boolean> => {
    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      const latency = Date.now() - startTime;
      
      conditionalLogger.debug(
        `Server ping successful`,
        { latency, status: response.status },
        'useOfflineStatus'
      );
      
      return response.ok;
    } catch (error) {
      conditionalLogger.debug(
        'Server ping failed',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'useOfflineStatus'
      );
      
      return false;
    }
  }, []);

  // Test connection speed and quality
  const testConnection = useCallback(async (): Promise<{
    online: boolean;
    latency: number;
    speed: 'fast' | 'slow' | 'offline';
  }> => {
    if (!state.isOnline) {
      return { online: false, latency: -1, speed: 'offline' };
    }

    try {
      const startTime = Date.now();
      const response = await fetch('/api/speed-test', {
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout(10000)
      });
      
      const latency = Date.now() - startTime;
      const online = response.ok;
      
      let speed: 'fast' | 'slow' | 'offline' = 'fast';
      
      if (!online) {
        speed = 'offline';
      } else if (latency > 2000 || getNetworkQuality() === 'slow') {
        speed = 'slow';
      }
      
      return { online, latency, speed };
    } catch (error) {
      return { online: false, latency: -1, speed: 'offline' };
    }
  }, [state.isOnline, getNetworkQuality]);

  // Update offline statistics
  const updateOfflineStats = useCallback((isOffline: boolean) => {
    const stats = getOfflineStats();
    
    if (isOffline && !state.wasOffline) {
      // Going offline
      stats.offlineEvents += 1;
      stats.lastOfflineTime = Date.now();
    } else if (!isOffline && state.wasOffline) {
      // Coming back online
      if (stats.lastOfflineTime) {
        const offlineTime = Date.now() - stats.lastOfflineTime;
        stats.totalOfflineTime += offlineTime;
      }
    }
    
    try {
      localStorage.setItem('offline-stats', JSON.stringify(stats));
    } catch (error) {
      conditionalLogger.error('Failed to save offline stats', error, 'useOfflineStatus');
    }
  }, [state.wasOffline, getOfflineStats]);

  // Get network information
  const getNetworkInfo = useCallback((): NetworkConnection | null => {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (!connection) {
      return null;
    }

    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }, []);

  // Set up event listeners and state management
  useEffect(() => {
    let offlineTimer: NodeJS.Timeout | null = null;

    const handleOnline = () => {
      const now = Date.now();
      
      setState(prev => {
        const offlineDuration = prev.wasOffline && prev.lastOnlineTime 
          ? now - prev.lastOnlineTime 
          : 0;
        
        return {
          ...prev,
          isOnline: true,
          lastOnlineTime: now,
          offlineDuration
        };
      });
      
      updateOfflineStats(false);
      
      if (offlineTimer) {
        clearInterval(offlineTimer);
        offlineTimer = null;
      }
      
      conditionalLogger.debug('Connection restored', undefined, 'useOfflineStatus');
    };

    const handleOffline = () => {
      setState(prev => ({
        ...prev,
        isOnline: false,
        wasOffline: true
      }));
      
      updateOfflineStats(true);
      
      // Start tracking offline duration
      offlineTimer = setInterval(() => {
        setState(prev => ({
          ...prev,
          offlineDuration: prev.lastOnlineTime ? Date.now() - prev.lastOnlineTime : 0
        }));
      }, 1000);
      
      conditionalLogger.debug('Connection lost', undefined, 'useOfflineStatus');
    };

    const handleConnectionChange = () => {
      const networkInfo = getNetworkInfo();
      const connectionType = networkInfo?.effectiveType || null;
      
      setState(prev => ({
        ...prev,
        networkInfo,
        connectionType
      }));
      
      conditionalLogger.debug(
        'Network connection changed',
        { connectionType, networkInfo },
        'useOfflineStatus'
      );
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen for connection changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Initialize network info
    handleConnectionChange();

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
      
      if (offlineTimer) {
        clearInterval(offlineTimer);
      }
    };
  }, [getNetworkInfo, updateOfflineStats]);

  return {
    // State
    isOnline: state.isOnline,
    isOffline: !state.isOnline,
    wasOffline: state.wasOffline,
    offlineDuration: state.offlineDuration,
    connectionType: state.connectionType,
    networkInfo: state.networkInfo,
    
    // Utilities
    getNetworkQuality,
    isSlowConnection,
    shouldReduceData,
    getOfflineStats,
    
    // Actions
    pingServer,
    testConnection
  };
};

export default useOfflineStatus;