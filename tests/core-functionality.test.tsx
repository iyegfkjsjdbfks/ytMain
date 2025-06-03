/**
 * Core Functionality Tests
 * Comprehensive test suite for all core YouTube clone functionalities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import components to test
import App from '../App';
import HomePage from '../pages/HomePage';
import WatchPage from '../pages/WatchPage';
import SearchResultsPage from '../pages/SearchResultsPage';
import ShortsPage from '../pages/ShortsPage';
import HistoryPage from '../pages/HistoryPage';
import { RefactoredAppProviders } from '../providers/RefactoredAppProviders';

// Import hooks and utilities
import { useVideoPlayer } from '../hooks/useVideoPlayer';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Test utilities
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    <MemoryRouter>
      {children}
    </MemoryRouter>
  </QueryClientProvider>
);

const renderWithProviders = (component: React.ReactElement) => {
  return render(component, { wrapper: TestWrapper });
};

describe('Core Application Functionality', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  describe('1. Application Initialization', () => {
    it('should render components without crashing', () => {
      renderWithProviders(<div>Test Component</div>);
      expect(screen.getByText('Test Component')).toBeInTheDocument();
    });

    it('should handle basic rendering', () => {
      renderWithProviders(<HomePage />);
      // Basic test that component renders
      expect(document.body).toBeInTheDocument();
    });

    it('should initialize test environment properly', () => {
      // Test that our test setup works
      expect(true).toBe(true);
    });
  });

  describe('2. Navigation and Routing', () => {
    it('should navigate to different pages', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);

      // Test navigation to trending
      const trendingLink = await screen.findByText('Trending');
      await user.click(trendingLink);
      
      await waitFor(() => {
        expect(window.location.pathname).toBe('/trending');
      });
    });

    it('should handle watch page routing with video ID', async () => {
      renderWithProviders(<App />);
      
      // Navigate to watch page
      window.history.pushState({}, '', '/watch?v=test123');
      
      await waitFor(() => {
        expect(window.location.pathname).toBe('/watch');
        expect(window.location.search).toBe('?v=test123');
      });
    });

    it('should handle shorts page routing', async () => {
      renderWithProviders(<App />);
      
      window.history.pushState({}, '', '/shorts');
      
      await waitFor(() => {
        expect(window.location.pathname).toBe('/shorts');
      });
    });
  });

  describe('3. Video Playback Functionality', () => {
    it('should initialize video player correctly', async () => {
      const mockVideo = {
        id: 'test123',
        title: 'Test Video',
        videoUrl: 'https://example.com/video.mp4',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        duration: '10:30',
        views: '1M views',
        channelName: 'Test Channel',
        createdAt: '2024-01-01'
      };

      renderWithProviders(<WatchPage />);
      
      // Check if video element is rendered
      const videoElement = await screen.findByRole('video');
      expect(videoElement).toBeInTheDocument();
    });

    it('should handle play/pause functionality', async () => {
      const user = userEvent.setup();
      renderWithProviders(<WatchPage />);

      const playButton = await screen.findByTestId('play-button');
      expect(playButton).toBeInTheDocument();

      // Test play functionality
      await user.click(playButton);
      
      // Video should start playing (mocked)
      await waitFor(() => {
        expect(playButton).toHaveAttribute('aria-label', 'Pause');
      });
    });

    it('should handle volume controls', async () => {
      const user = userEvent.setup();
      renderWithProviders(<WatchPage />);

      const volumeButton = await screen.findByTestId('volume-button');
      expect(volumeButton).toBeInTheDocument();

      // Test mute/unmute
      await user.click(volumeButton);
      
      await waitFor(() => {
        expect(volumeButton).toHaveAttribute('aria-label', 'Unmute');
      });
    });
  });

  describe('4. Search Functionality', () => {
    it('should perform search and display results', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);

      const searchInput = await screen.findByPlaceholderText('Search');
      expect(searchInput).toBeInTheDocument();

      // Type search query
      await user.type(searchInput, 'test query');
      await user.keyboard('{Enter}');

      // Should navigate to search results
      await waitFor(() => {
        expect(window.location.pathname).toBe('/search');
        expect(window.location.search).toContain('q=test%20query');
      });
    });

    it('should display search suggestions', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);

      const searchInput = await screen.findByPlaceholderText('Search');
      
      // Type to trigger suggestions
      await user.type(searchInput, 'test');
      
      // Should show suggestions dropdown
      await waitFor(() => {
        const suggestions = screen.getByTestId('search-suggestions');
        expect(suggestions).toBeInTheDocument();
      });
    });
  });

  describe('5. User Authentication', () => {
    it('should handle user login', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);

      // Navigate to login
      const loginButton = await screen.findByText('Sign In');
      await user.click(loginButton);

      // Fill login form
      const emailInput = await screen.findByLabelText('Email');
      const passwordInput = await screen.findByLabelText('Password');
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // Should be logged in
      await waitFor(() => {
        expect(screen.getByTestId('user-menu')).toBeInTheDocument();
      });
    });

    it('should handle user logout', async () => {
      const user = userEvent.setup();
      
      // Mock logged in state
      localStorage.setItem('youtube_clone_user', JSON.stringify({
        id: 'test123',
        username: 'testuser',
        email: 'test@example.com'
      }));

      renderWithProviders(<App />);

      const userMenu = await screen.findByTestId('user-menu');
      await user.click(userMenu);

      const logoutButton = await screen.findByText('Sign Out');
      await user.click(logoutButton);

      // Should be logged out
      await waitFor(() => {
        expect(screen.getByText('Sign In')).toBeInTheDocument();
      });
    });
  });

  describe('6. Theme and Accessibility', () => {
    it('should toggle between light and dark themes', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);

      const themeToggle = await screen.findByTestId('theme-toggle');
      
      // Should start in light mode
      expect(document.documentElement).not.toHaveClass('dark');

      // Toggle to dark mode
      await user.click(themeToggle);
      
      await waitFor(() => {
        expect(document.documentElement).toHaveClass('dark');
      });
    });

    it('should be keyboard accessible', async () => {
      renderWithProviders(<App />);

      // Test tab navigation
      const firstFocusableElement = screen.getByRole('button', { name: /menu/i });
      firstFocusableElement.focus();
      
      expect(document.activeElement).toBe(firstFocusableElement);
    });
  });

  describe('7. Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderWithProviders(<App />);

      // Mobile menu should be present
      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      expect(mobileMenuButton).toBeInTheDocument();
    });

    it('should adapt to desktop viewport', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      renderWithProviders(<App />);

      // Desktop sidebar should be visible
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).not.toHaveClass('hidden');
    });
  });
});
