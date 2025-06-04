import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Comment, Video } from '../../../types/core';
import { VideoPlayer } from '../components/VideoPlayer';
import { CommentSection } from '../../comments/components/CommentSection';
import { VideoInteractions } from '../components/VideoInteractions';
import { formatCount } from '../../../utils/numberUtils';
import { formatDistanceToNow } from '../../../utils/dateUtils';
import {
  UserPlusIcon
} from '@heroicons/react/24/outline';
import {
  BellIcon as BellSolidIcon
} from '@heroicons/react/24/solid';







const WatchPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const [video, setVideo] = useState<Video | null>(null);

  const [recommendedVideos, setRecommendedVideos] = useState<Video[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);


  useEffect(() => {
    if (videoId) {
      loadVideoData(videoId);
      loadComments(videoId);
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
        channelAvatar: 'https://picsum.photos/seed/tech-insights/150/150',
        tags: ['React', 'JavaScript', 'Web Development', 'Programming', 'Tutorial'],
        category: 'Education',
        isLive: false,
        isShort: false,
        visibility: 'public' as const,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      };
      setVideo(mockVideo);
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (_id: string) => {
    try {
      // Mock comments data
      const mockComments: Comment[] = [
        {
          id: '1',
          authorId: 'user1',
          authorName: 'Sarah Developer',
          authorAvatar: 'https://picsum.photos/seed/sarah/150/150',
          content: 'This is exactly what I needed! The custom hooks section was particularly helpful. Thanks for the clear explanations!',
          createdAt: '2024-01-16T14:30:00Z',
          updatedAt: '2024-01-16T14:30:00Z',
          videoId: videoId || 'default-video',
          likes: 234,
          dislikes: 2,
          isPinned: true,
          isEdited: false,
          isHearted: false,
          replies: [
            {
              id: '1-1',
              authorId: 'tech-insights',
              authorName: 'Tech Insights',
              authorAvatar: 'https://picsum.photos/seed/tech-insights/150/150',
              content: 'Thank you Sarah! Glad it helped. More advanced React content coming soon!',
              createdAt: '2024-01-16T15:45:00Z',
              updatedAt: '2024-01-16T15:45:00Z',
              videoId: videoId || 'default-video',
              parentId: '1',
              likes: 45,
              dislikes: 0,
              isPinned: false,
              isEdited: false,
              isHearted: true,
              replies: []
            }
          ]
        },
        {
          id: '2',
          authorId: 'user2',
          authorName: 'Mike Frontend',
          authorAvatar: 'https://picsum.photos/seed/mike/150/150',
          content: 'Great tutorial! Could you do a follow-up on React Server Components?',
          createdAt: '2024-01-16T16:20:00Z',
          updatedAt: '2024-01-16T16:20:00Z',
          videoId: videoId || 'default-video',
          likes: 89,
          dislikes: 1,
          isPinned: false,
          isEdited: false,
          isHearted: false,
          replies: []
        },
        {
          id: '3',
          authorId: 'user3',
          authorName: 'Alex CodeMaster',
          authorAvatar: 'https://picsum.photos/seed/alex/150/150',
          content: 'The performance optimization section saved me hours of debugging. Subscribed!',
          createdAt: '2024-01-16T18:10:00Z',
          updatedAt: '2024-01-16T18:10:00Z',
          videoId: videoId || 'default-video',
          likes: 156,
          dislikes: 3,
          isPinned: false,
          isEdited: false,
          isHearted: false,
          replies: []
        }
      ];
      setComments(mockComments);
    } catch (error) {
      console.error('Error loading comments:', error);
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
          channelAvatar: 'https://picsum.photos/seed/webdevpro/150/150',
          category: 'Education',
          tags: ['nextjs', 'react', 'web development'],
          isLive: false,
          isShort: false,
          visibility: 'public'
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
          channelAvatar: 'https://picsum.photos/seed/codeacademy/150/150',
          category: 'Education',
          tags: ['typescript', 'programming', 'types'],
          isLive: false,
          isShort: false,
          visibility: 'public'
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
          channelAvatar: 'https://picsum.photos/seed/testingguru/150/150',
          category: 'Education',
          tags: ['react', 'testing', 'javascript'],
          isLive: false,
          isShort: false,
          visibility: 'public'
        }
      ];
      setRecommendedVideos(mockRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };



  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
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
              <VideoPlayer
                videoId={video.id}
                src={video.videoUrl || `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`}
                poster={video.thumbnailUrl}
                title={video.title}
                autoplay={false}
                className="w-full"
                useYouTube={false}
                onTimeUpdate={(currentTime, duration) => {
                  // Track watch progress
                  console.log(`Watch progress: ${currentTime}/${duration}`);
                }}
                onPlay={() => console.log('Video started playing')}
                onPause={() => console.log('Video paused')}
                onEnded={() => console.log('Video ended')}
              />
            </div>

            {/* Video Info */}
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                {video.title}
              </h1>

              {/* Video Stats and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                  <span>{formatCount(typeof video.views === 'string' ? parseInt(video.views, 10) : video.views)} views</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(video.uploadedAt))}</span>
                </div>

                <VideoInteractions
                  videoId={video.id}
                  channelId={video.channelId}
                  initialLikes={video.likes}
                  initialDislikes={video.dislikes}
                  className="flex-wrap"
                />
              </div>

              {/* Channel Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={video.channelAvatar}
                    alt={video.channelName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="font-medium text-neutral-900 dark:text-white">
                        {video.channelName}
                      </h3>
                      {video.channelId && (
                        <svg className="w-4 h-4 text-neutral-600 dark:text-neutral-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {formatCount(1000000)} subscribers
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSubscribe}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                    isSubscribed
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isSubscribed ? (
                    <>
                      <BellSolidIcon className="w-4 h-4" />
                      <span>Subscribed</span>
                    </>
                  ) : (
                    <>
                      <UserPlusIcon className="w-4 h-4" />
                      <span>Subscribe</span>
                    </>
                  )}
                </button>
              </div>

              {/* Description */}
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
                <div className="text-sm text-neutral-700 dark:text-neutral-300">
                  <div className="flex items-center gap-2 mb-2 text-neutral-900 dark:text-white font-medium">
                    <span>{formatCount(typeof video.views === 'string' ? parseInt(video.views, 10) : video.views)} views</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(video.uploadedAt))}</span>
                  </div>
                  <div className={`whitespace-pre-wrap ${
                    showFullDescription ? '' : 'line-clamp-3'
                  }`}>
                    {video.description}
                  </div>
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-neutral-900 dark:text-white font-medium mt-2 hover:underline"
                  >
                    {showFullDescription ? 'Show less' : 'Show more'}
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <CommentSection
                videoId={video.id}
                channelId={video.channelId}
                isChannelOwner={false} // This should be determined based on current user
                className="mt-6"
              />
            </div>
          </div>

          {/* Sidebar - Recommended Videos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
              Recommended
            </h3>
            <div className="space-y-3">
              {recommendedVideos.map((video) => (
                <Link
                  key={video.id}
                  to={`/watch/${video.id}`}
                  className="flex gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 p-2 rounded-lg transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-40 h-24 object-cover rounded-lg"
                    />
                    <span className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                      {video.duration}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-neutral-900 dark:text-white line-clamp-2 mb-1">
                      {video.title}
                    </h4>
                    <div className="flex items-center gap-1 mb-1">
                      <img
                        src={video.channelAvatar}
                        alt={video.channelName}
                        className="w-4 h-4 rounded-full"
                      />
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                        {video.channelName}
                      </p>
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                      <span>{video.views}</span>
                      <span className="mx-1">•</span>
                      <span>{video.uploadedAt}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
