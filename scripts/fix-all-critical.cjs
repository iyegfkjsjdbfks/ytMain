const fs = require('fs');
const path = require('path');

/**
 * Final comprehensive fix for all critical files
 */

function fixAuthContext() {
  const content = `import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isVerified: boolean;
  subscriberCount?: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children?: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem('youtube_clone_user');
        const token = localStorage.getItem('youtube_clone_token');

        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear invalid data
        localStorage.removeItem('youtube_clone_user');
        localStorage.removeItem('youtube_clone_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Mock authentication - in real app, this would be an API call
      if (email && password.length >= 6) {
        const username = email.split('@')[0] || 'user';
        const mockUser: User = {
          id: \`user_\${Date.now()}\`,
          username,
          email,
          avatar: \`https://ui-avatars.com/api/?name=\${username}&background=random\`,
          isVerified: Math.random() > 0.5,
          subscriberCount: Math.floor(Math.random() * 10000),
          createdAt: new Date().toISOString()
        };

        const mockToken = \`token_\${Date.now()}_\${Math.random().toString(36).substring(2, 11)}\`;

        // Store in localStorage
        localStorage.setItem('youtube_clone_user', JSON.stringify(mockUser));
        localStorage.setItem('youtube_clone_token', mockToken);

        setUser(mockUser);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Mock registration - in real app, this would be an API call
      if (username && email && password.length >= 6) {
        const mockUser: User = {
          id: \`user_\${Date.now()}\`,
          username,
          email,
          avatar: \`https://ui-avatars.com/api/?name=\${username}&background=random\`,
          isVerified: false,
          subscriberCount: 0,
          createdAt: new Date().toISOString()
        };

        const mockToken = \`token_\${Date.now()}_\${Math.random().toString(36).substring(2, 11)}\`;

        // Store in localStorage
        localStorage.setItem('youtube_clone_user', JSON.stringify(mockUser));
        localStorage.setItem('youtube_clone_token', mockToken);

        setUser(mockUser);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('youtube_clone_user');
    localStorage.removeItem('youtube_clone_token');
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      if (!user) {
        return false;
      }

      const updatedUser = { ...user, ...updates };
      localStorage.setItem('youtube_clone_user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
`;

  fs.writeFileSync('contexts/AuthContext.tsx', content, 'utf8');
  console.log('✅ Fixed AuthContext.tsx');
}

function fixWatchLaterContext() {
  const content = `import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface WatchLaterContextType {
  watchLaterVideos: string[];
  addToWatchLater: (videoId: string) => void;
  removeFromWatchLater: (videoId: string) => void;
  isInWatchLater: (videoId: string) => boolean;
  clearWatchLater: () => void;
}

const WatchLaterContext = createContext<WatchLaterContextType | undefined>(undefined);

export const useWatchLater = () => {
  const context = useContext(WatchLaterContext);
  if (!context) {
    throw new Error('useWatchLater must be used within a WatchLaterProvider');
  }
  return context;
};

interface WatchLaterProviderProps {
  children: ReactNode;
}

export const WatchLaterProvider: React.FC<WatchLaterProviderProps> = ({ children }) => {
  const [watchLaterVideos, setWatchLaterVideos] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('watchLaterVideos');
    if (stored) {
      try {
        setWatchLaterVideos(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading watch later videos:', error);
      }
    }
  }, []);

  // Save to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem('watchLaterVideos', JSON.stringify(watchLaterVideos));
  }, [watchLaterVideos]);

  const addToWatchLater = (videoId: string) => {
    setWatchLaterVideos(prev => {
      if (prev.includes(videoId)) return prev;
      return [...prev, videoId];
    });
  };

  const removeFromWatchLater = (videoId: string) => {
    setWatchLaterVideos(prev => prev.filter(id => id !== videoId));
  };

  const isInWatchLater = (videoId: string): boolean => {
    return watchLaterVideos.includes(videoId);
  };

  const clearWatchLater = () => {
    setWatchLaterVideos([]);
  };

  const value = {
    watchLaterVideos,
    addToWatchLater,
    removeFromWatchLater,
    isInWatchLater,
    clearWatchLater
  };

  return (
    <WatchLaterContext.Provider value={value}>
      {children}
    </WatchLaterContext.Provider>
  );
};

export default WatchLaterProvider;
`;

  fs.writeFileSync('contexts/WatchLaterContext.tsx', content, 'utf8');
  console.log('✅ Fixed WatchLaterContext.tsx');
}

function fixThemeContext() {
  const content = `import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      let effectiveTheme: 'light' | 'dark' = 'light';
      
      if (theme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        effectiveTheme = theme;
      }

      setActualTheme(effectiveTheme);
      
      if (effectiveTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const value = {
    theme,
    setTheme,
    actualTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
`;

  fs.writeFileSync('contexts/ThemeContext.tsx', content, 'utf8');
  console.log('✅ Fixed ThemeContext.tsx');
}

function fixMiniplayerContext() {
  const content = `import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration?: number;
  channelName?: string;
}

interface MiniplayerContextType {
  isOpen: boolean;
  currentVideo: Video | null;
  isPlaying: boolean;
  openMiniplayer: (video: Video) => void;
  closeMiniplayer: () => void;
  togglePlay: () => void;
}

const MiniplayerContext = createContext<MiniplayerContextType | undefined>(undefined);

export const useMiniplayer = () => {
  const context = useContext(MiniplayerContext);
  if (!context) {
    throw new Error('useMiniplayer must be used within a MiniplayerProvider');
  }
  return context;
};

interface MiniplayerProviderProps {
  children: ReactNode;
}

export const MiniplayerProvider: React.FC<MiniplayerProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const openMiniplayer = (video: Video) => {
    setCurrentVideo(video);
    setIsOpen(true);
    setIsPlaying(true);
  };

  const closeMiniplayer = () => {
    setIsOpen(false);
    setCurrentVideo(null);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const value = {
    isOpen,
    currentVideo,
    isPlaying,
    openMiniplayer,
    closeMiniplayer,
    togglePlay
  };

  return (
    <MiniplayerContext.Provider value={value}>
      {children}
    </MiniplayerContext.Provider>
  );
};

export default MiniplayerProvider;
`;

  fs.writeFileSync('contexts/MiniplayerContext.tsx', content, 'utf8');
  console.log('✅ Fixed MiniplayerContext.tsx');
}

function fixPWAComponents() {
  // Fix PWAStatus
  const pwaStatusContent = `import React from 'react';

const PWAStatus: React.FC = () => {
  return null; // PWA status indicator placeholder
};

export default PWAStatus;
`;
  
  fs.writeFileSync('src/components/PWAStatus.tsx', pwaStatusContent, 'utf8');
  console.log('✅ Fixed PWAStatus.tsx');

  // Fix PWAUpdateNotification
  const pwaUpdateContent = `import React, { useState, useEffect } from 'react';

const PWAUpdateNotification: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdate(true);
              }
            });
          }
        });
      });
    }
  }, []);

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
      <p className="font-semibold mb-2">Update Available!</p>
      <p className="text-sm mb-3">A new version of the app is available.</p>
      <div className="flex gap-2">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100"
        >
          Update Now
        </button>
        <button
          onClick={() => setShowUpdate(false)}
          className="px-4 py-2 bg-blue-700 rounded hover:bg-blue-800"
        >
          Later
        </button>
      </div>
    </div>
  );
};

export default PWAUpdateNotification;
`;
  
  fs.writeFileSync('src/components/PWAUpdateNotification.tsx', pwaUpdateContent, 'utf8');
  console.log('✅ Fixed PWAUpdateNotification.tsx');
}

function fixUseUnifiedApp() {
  const content = `import { useContext } from 'react';
import { UnifiedAppContext } from '../../contexts/UnifiedAppContext';

export const useUnifiedApp = () => {
  const context = useContext(UnifiedAppContext);
  if (context === undefined) {
    throw new Error('useUnifiedApp must be used within a UnifiedAppProvider');
  }
  return context;
};

export default useUnifiedApp;
`;

  // Ensure directory exists
  const dir = 'src/hooks';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync('src/hooks/useUnifiedApp.ts', content, 'utf8');
  console.log('✅ Fixed useUnifiedApp.ts');
}

console.log('🔧 Fixing all critical files...\n');

// Fix all files
fixAuthContext();
fixWatchLaterContext();
fixThemeContext();
fixMiniplayerContext();
fixPWAComponents();
fixUseUnifiedApp();

console.log('\n✨ All critical fixes complete!');
console.log('🎯 Ready to retry build.');
