import type React from 'react';
import { useState, useEffect } from 'react';

import { useParams, Link } from 'react-router-dom';

import YouTubePlayerWrapper from '../../../../components/YouTubePlayerWrapper';
import { getYouTubeVideoId, isYouTubeUrl } from '../../../lib/youtube-utils';
import { VideoPlayer } from '../components/VideoPlayer';

import type { Video } from '../../../types/core';


const WatchPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const [video, setVideo] = useState<Video | null>(null);

  const [_recommendedVideos, setRecommendedVideos] = useState<Video[]>([]);

  const [loading, setLoading] = useState(true);
  const [_showFullDescription, _setShowFullDescription] = useState(false);
  // const [isSubscribed, setIsSubscribed] = useState(false);


  useEffect(() => {
    if (videoId) {
      loadVideoData(videoId);
      // loadComments(videoId); // Removed as comments are handled by CommentSection component
      loadRecommendations();
    }
  }, [videoId]);

  const loadVideoData = async (id: string) => {
    setLoading(true);
    try {
      // Mock video data
      const mockVideo: Video = {
        id,
        title: 'Advanced React Patterns and Best Practices 2024',
        description: `In this comprehensive tutorial, we'll explore advanced React patterns that every developer should know in 2024. We'll cover:

🔥 Key Topics:
• Custom Hooks and Advanced Hook Patterns
• Compound Components
• Render Props vs Children as Functions
• Higher-Order Components (HOCs)
• Context API Best Practices
• Performance Optimization Techniques
• Error Boundaries and Suspense
• TypeScript Integration

⏰ Timestamps:
0:00 Introduction
2:30 Custom Hooks Deep Dive
8:15 Compound Components Pattern
15:45 Render Props Explained
22:10 HOCs in Modern React
28:30 Context API Mastery
35:20 Performance Tips
42:15 Error Handling
48:30 TypeScript Best Practices
55:00 Conclusion

📚 Resources:
• GitHub Repository: https://github.com/example/react-patterns
• Documentation: https://reactpatterns.dev
• Discord Community: https://discord.gg/reactdev

🏷️ Tags: #React #JavaScript #WebDevelopment #Programming #Tutorial`,
        thumbnailUrl: 'https://picsum.photos/seed/react-tutorial/1280/720',
        videoUrl: '/api/placeholder/video',
        duration: '57:00',
        views: '125,847',
        likes: 8934,
        dislikes: 127,
        uploadedAt: '2024-01-15T10:30:00Z',
        channelName: 'Tech Insights',
        channelId: 'tech-insights',
        channelAvatarUrl: 'https://picsum.photos/seed/tech-insights/150/150',
        tags: ['React', 'JavaScript', 'Web Development', 'Programming', 'Tutorial'],
        category: 'Education',
        isLive: false,
        isShort: false,
        visibility: 'public' as const,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      };
      setVideo(mockVideo);
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setLoading(false);
    }
  };


  const loadRecommendations = async () => {
    try {
      // Mock recommended videos
      const mockRecommendations: Video[] = [
        {
          id: 'rec1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          title: 'Next.js 14 Complete Guide',
          description: 'Complete guide to Next.js 14',
          thumbnailUrl: 'https://picsum.photos/seed/nextjs/320/180',
          videoUrl: 'https://example.com/video/rec1',
          duration: '45:32',
          views: '89K views',
          likes: 1200,
          dislikes: 15,
          uploadedAt: '3 days ago',
          channelName: 'Web Dev Pro',
          channelId: 'webdevpro',
          channelAvatarUrl: 'https://picsum.photos/seed/webdevpro/150/150',
          category: 'Education',
          tags: ['nextjs', 'react', 'web development'],
          isLive: false,
          isShort: false,
          visibility: 'public',
        },
        {
          id: 'rec2',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          title: 'TypeScript Advanced Types',
          description: 'Advanced TypeScript types tutorial',
          thumbnailUrl: 'https://picsum.photos/seed/typescript/320/180',
          videoUrl: 'https://example.com/video/rec2',
          duration: '32:18',
          views: '156K views',
          likes: 2100,
          dislikes: 25,
          uploadedAt: '1 week ago',
          channelName: 'Code Academy',
          channelId: 'codeacademy',
          channelAvatarUrl: 'https://picsum.photos/seed/codeacademy/150/150',
          category: 'Education',
          tags: ['typescript', 'programming', 'types'],
          isLive: false,
          isShort: false,
          visibility: 'public',
        },
        {
          id: 'rec3',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          title: 'React Testing Library Tutorial',
          description: 'Learn React Testing Library',
          thumbnailUrl: 'https://picsum.photos/seed/testing/320/180',
          videoUrl: 'https://example.com/video/rec3',
          duration: '28:45',
          views: '67K views',
          likes: 890,
          dislikes: 12,
          uploadedAt: '5 days ago',
          channelName: 'Testing Guru',
          channelId: 'testingguru',
          channelAvatarUrl: 'https://picsum.photos/seed/testingguru/150/150',
          category: 'Education',
          tags: ['react', 'testing', 'javascript'],
          isLive: false,
          isShort: false,
          visibility: 'public',
        },
      ];
      setRecommendedVideos(mockRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };


  // const _handleSubscribe = () => {
  //   setIsSubscribed(!isSubscribed);
  // };


  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Video not found</h1>
          <Link to="/" className="text-red-600 hover:text-red-700">Go back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden mb-4">
              {isYouTubeUrl(video.videoUrl || '') ? (
                <YouTubePlayerWrapper
                  videoId={getYouTubeVideoId(video.videoUrl || '') || video.id}
                  autoplay={false}
                  width="100%"
                  height={480}
                  controls={true}
                />
              ) : (
                <VideoPlayer
                  videoId={video.id}
                  src={video.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                  poster={video.thumbnailUrl}
                  title={video.title}
                  autoplay={false}
                  className="w-full"
                  useYouTube={false}
                  onTimeUpdate={(_currentTime, _duration) => {
                    // Track watch progress
                    }}
                  onPlay={() => {
                    // Handle play event
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
