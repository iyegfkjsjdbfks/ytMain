/**
 * Example test file demonstrating comprehensive testing practices
 * for the VideoDescription component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { VideoDescription } from '../../components/VideoDescription';
import { testUtils, customRender } from '../../utils/testUtils';
import { testHelpers, TestPerformanceTracker } from '../setup';
import { performanceMonitor } from '../../utils/performanceMonitor';

// Mock data
const mockVideo = testUtils.generateMockVideo({
  title: 'Test Video Title',
  description: 'This is a test video description with some content to test the expand/collapse functionality.',
  viewCount: 1000000,
  likeCount: 50000,
  publishedAt: '2024-01-15T10:00:00Z',
  channel: {
    id: 'channel-1',
    name: 'Test Channel',
    avatar: 'https://example.com/avatar.jpg',
    subscriberCount: 100000,
    isVerified: true
  }
});

const mockChannel = testUtils.generateMockChannel({
  id: 'channel-1',
  name: 'Test Channel',
  subscriberCount: 100000,
  isVerified: true
});

describe('VideoDescription Component', () => {
  let endPerformanceTracking: () => void;

  beforeEach(() => {
    // Start performance tracking for each test
    endPerformanceTracking = TestPerformanceTracker.startTest('VideoDescription');
    
    // Setup API mocks
    testHelpers.mockApiSuccess({
      video: mockVideo,
      channel: mockChannel
    });
  });

  afterEach(() => {
    endPerformanceTracking();
  });

  describe('Rendering', () => {
    it('should render video information correctly', async () => {
      const { container } = customRender(
        <VideoDescription video={mockVideo} />
      );

      // Check if video title is rendered
      expect(screen.getByText(mockVideo.title)).toBeInTheDocument();
      
      // Check if view count is formatted correctly
      expect(screen.getByText(/1M views/)).toBeInTheDocument();
      
      // Check if publish date is rendered
      expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
      
      // Check if channel information is rendered
      expect(screen.getByText(mockVideo.channel.name)).toBeInTheDocument();
      
      // Check if subscriber count is formatted
      expect(screen.getByText(/100K subscribers/)).toBeInTheDocument();
      
      // Accessibility check
      const auditResults = await testHelpers.checkAccessibility(container);
      expect(auditResults.violations).toHaveLength(0);
    });

    it('should render verified badge for verified channels', () => {
      customRender(<VideoDescription video={mockVideo} />);
      
      const verifiedBadge = screen.getByLabelText(/verified channel/i);
      expect(verifiedBadge).toBeInTheDocument();
    });

    it('should handle missing channel data gracefully', () => {
      const videoWithoutChannel = {
        ...mockVideo,
        channel: undefined
      };
      
      customRender(<VideoDescription video={videoWithoutChannel} />);
      
      expect(screen.getByText(mockVideo.title)).toBeInTheDocument();
      expect(screen.queryByText(/subscribers/)).not.toBeInTheDocument();
    });
  });

  describe('Description Expansion', () => {
    it('should expand and collapse description when clicked', async () => {
      const longDescription = 'A'.repeat(300); // Long description to trigger truncation
      const videoWithLongDescription = {
        ...mockVideo,
        description: longDescription
      };
      
      customRender(<VideoDescription video={videoWithLongDescription} />);
      
      // Initially should show truncated description
      const showMoreButton = screen.getByText(/show more/i);
      expect(showMoreButton).toBeInTheDocument();
      
      // Click to expand
      await testHelpers.simulateUserInteraction.click(showMoreButton);
      
      // Should show full description and "Show less" button
      await waitFor(() => {
        expect(screen.getByText(/show less/i)).toBeInTheDocument();
      });
      
      // Click to collapse
      const showLessButton = screen.getByText(/show less/i);
      await testHelpers.simulateUserInteraction.click(showLessButton);
      
      // Should show truncated description again
      await waitFor(() => {
        expect(screen.getByText(/show more/i)).toBeInTheDocument();
      });
    });

    it('should not show expand button for short descriptions', () => {
      const shortDescription = 'Short description';
      const videoWithShortDescription = {
        ...mockVideo,
        description: shortDescription
      };
      
      customRender(<VideoDescription video={videoWithShortDescription} />);
      
      expect(screen.queryByText(/show more/i)).not.toBeInTheDocument();
      expect(screen.getByText(shortDescription)).toBeInTheDocument();
    });
  });

  describe('Interaction Handling', () => {
    it('should handle like button click', async () => {
      const onLike = vi.fn();
      
      customRender(
        <VideoDescription 
          video={mockVideo} 
          onLike={onLike}
        />
      );
      
      const likeButton = screen.getByLabelText(/like video/i);
      await testHelpers.simulateUserInteraction.click(likeButton);
      
      expect(onLike).toHaveBeenCalledWith(mockVideo.id);
    });

    it('should handle subscribe button click', async () => {
      const onSubscribe = vi.fn();
      
      customRender(
        <VideoDescription 
          video={mockVideo} 
          onSubscribe={onSubscribe}
        />
      );
      
      const subscribeButton = screen.getByText(/subscribe/i);
      await testHelpers.simulateUserInteraction.click(subscribeButton);
      
      expect(onSubscribe).toHaveBeenCalledWith(mockVideo.channel.id);
    });

    it('should handle share button click', async () => {
      const onShare = vi.fn();
      
      customRender(
        <VideoDescription 
          video={mockVideo} 
          onShare={onShare}
        />
      );
      
      const shareButton = screen.getByLabelText(/share video/i);
      await testHelpers.simulateUserInteraction.click(shareButton);
      
      expect(onShare).toHaveBeenCalledWith(mockVideo.id);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation', async () => {
      customRender(<VideoDescription video={mockVideo} />);
      
      const likeButton = screen.getByLabelText(/like video/i);
      
      // Focus the like button
      likeButton.focus();
      expect(document.activeElement).toBe(likeButton);
      
      // Navigate with Tab
      await testHelpers.simulateUserInteraction.keyPress(likeButton, 'Tab');
      
      // Should move to next focusable element
      const subscribeButton = screen.getByText(/subscribe/i);
      expect(document.activeElement).toBe(subscribeButton);
      
      // Activate with Enter
      const onSubscribe = vi.fn();
      customRender(
        <VideoDescription 
          video={mockVideo} 
          onSubscribe={onSubscribe}
        />
      );
      
      await testHelpers.simulateUserInteraction.keyPress(subscribeButton, 'Enter');
      expect(onSubscribe).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should render within performance budget', async () => {
      const startTime = performance.now();
      
      customRender(<VideoDescription video={mockVideo} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Track render time
      TestPerformanceTracker.trackRender('VideoDescription', renderTime);
      
      // Should render within 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it('should not cause memory leaks', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      const { unmount } = customRender(<VideoDescription video={mockVideo} />);
      
      // Simulate component lifecycle
      await testHelpers.waitForTime(100);
      
      unmount();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      await testHelpers.waitForTime(100);
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be minimal (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      testHelpers.mockApiError(500, 'Server Error');
      
      const { container } = customRender(<VideoDescription video={mockVideo} />);
      
      // Should still render basic video information
      expect(screen.getByText(mockVideo.title)).toBeInTheDocument();
      
      // Should not crash the component
      expect(container).toBeInTheDocument();
    });

    it('should handle malformed video data', () => {
      const malformedVideo = {
        ...mockVideo,
        viewCount: null,
        likeCount: undefined,
        publishedAt: 'invalid-date'
      };
      
      expect(() => {
        customRender(<VideoDescription video={malformedVideo} />);
      }).not.toThrow();
      
      // Should still render title
      expect(screen.getByText(mockVideo.title)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      
      window.dispatchEvent(new Event('resize'));
      
      customRender(<VideoDescription video={mockVideo} />);
      
      // Check if mobile-specific elements are present
      const component = screen.getByTestId('video-description');
      expect(component).toHaveClass('mobile-layout');
    });

    it('should adapt to tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });
      
      window.dispatchEvent(new Event('resize'));
      
      customRender(<VideoDescription video={mockVideo} />);
      
      const component = screen.getByTestId('video-description');
      expect(component).toHaveClass('tablet-layout');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      customRender(<VideoDescription video={mockVideo} />);
      
      expect(screen.getByLabelText(/like video/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/share video/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/verified channel/i)).toBeInTheDocument();
    });

    it('should support screen readers', () => {
      customRender(<VideoDescription video={mockVideo} />);
      
      // Check for screen reader friendly content
      expect(screen.getByText(/1 million views/i)).toBeInTheDocument();
      expect(screen.getByText(/published on january 15, 2024/i)).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      customRender(<VideoDescription video={mockVideo} />);
      
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveTextContent(mockVideo.title);
      
      const channelName = screen.getByRole('heading', { level: 2 });
      expect(channelName).toHaveTextContent(mockVideo.channel.name);
    });

    it('should have sufficient color contrast', async () => {
      const { container } = customRender(<VideoDescription video={mockVideo} />);
      
      const auditResults = await testHelpers.checkAccessibility(container);
      const contrastViolations = auditResults.violations.filter(
        violation => violation.type === 'color-contrast'
      );
      
      expect(contrastViolations).toHaveLength(0);
    });
  });

  describe('Security', () => {
    it('should sanitize description content', () => {
      const maliciousDescription = '<script>alert("XSS")</script><p>Safe content</p>';
      const videoWithMaliciousContent = {
        ...mockVideo,
        description: maliciousDescription
      };
      
      customRender(<VideoDescription video={videoWithMaliciousContent} />);
      
      // Should not render script tags
      expect(screen.queryByText(/alert/)).not.toBeInTheDocument();
      
      // Should render safe content
      expect(screen.getByText(/safe content/i)).toBeInTheDocument();
    });

    it('should validate external links', () => {
      const descriptionWithLinks = 'Check out https://example.com and https://malicious-site.com';
      const videoWithLinks = {
        ...mockVideo,
        description: descriptionWithLinks
      };
      
      customRender(<VideoDescription video={videoWithLinks} />);
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link).toHaveAttribute('target', '_blank');
      });
    });
  });

  describe('Integration', () => {
    it('should integrate with performance monitoring', async () => {
      const performanceSpy = vi.spyOn(performanceMonitor, 'trackCustomMetric');
      
      customRender(<VideoDescription video={mockVideo} />);
      
      // Should track component mount
      expect(performanceSpy).toHaveBeenCalledWith(
        'component_mount',
        expect.any(Number),
        { component: 'VideoDescription' }
      );
    });

    it('should work with React Query', async () => {
      // Mock React Query response
      testHelpers.mockApiSuccess({
        video: mockVideo,
        relatedVideos: [testUtils.generateMockVideo()]
      });
      
      customRender(<VideoDescription video={mockVideo} />);
      
      // Should handle loading states
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
      
      // Should display data
      expect(screen.getByText(mockVideo.title)).toBeInTheDocument();
    });
  });
});