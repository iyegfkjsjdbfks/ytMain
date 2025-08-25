import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

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
  login: (email, password) => Promise<boolean>;
  register: (username, email, password) => Promise<boolean>;
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

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem('youtube_clone_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const login = async (email, password): Promise<boolean> => {
    try {
      setIsLoading(true);
      if (email && password.length >= 6) {
        const username = email.split('@')[0] || 'user';
        const mockUser: User = {
          id: `user_${Date.now()}`,
          username,
          email,
          avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
          isVerified: Math.random() > 0.5,
          subscriberCount: Math.floor(Math.random() * 10000),
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('youtube_clone_user', JSON.stringify(mockUser));
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

  const register = async (username, email, password): Promise<boolean> => {
    try {
      setIsLoading(true);
      if (username && email && password.length >= 6) {
        const mockUser: User = {
          id: `user_${Date.now()}`,
          username,
          email,
          avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
          isVerified: false,
          subscriberCount: 0,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('youtube_clone_user', JSON.stringify(mockUser));
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
      if (!user) return false;
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
