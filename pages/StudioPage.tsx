import * as React from 'react';
import {  useState, useEffect  } from 'react';
import { Link } from 'react-router-dom';
import {
  VideoCameraIcon,
  ChartBarIcon,
  CogIcon,

  BellIcon,
  PlayIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowUpIcon,

  PlusIcon
} from '@heroicons/react/24/outline';
import { VideoCameraIcon as VideoCameraIconSolid } from '@heroicons/react/24/solid';
import { UnifiedButton } from '../components/ui/UnifiedButton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';

interface StudioVideo {
  id: string;
  title: string;
  thumbnail: string;
  status: 'published' | 'draft' | 'scheduled' | 'processing';
  views: number;
  likes: number;
  comments: number;
  uploadDate: string;
  duration: string;
  visibility: 'public' | 'unlisted' | 'private';
}

interface AnalyticsData {
  totalViews: number;
  totalSubscribers: number;
  totalVideos: number;
  totalRevenue: number;
  viewsChange: number;
  subscribersChange: number;
  recentViews: number[];
}

const StudioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [videos, setVideos] = useState<StudioVideo[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    const loadStudioData = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock videos data
      const mockVideos: StudioVideo[] = [
        {
          id: '1',
          title: 'How to Build a React App',
          thumbnail: 'https://picsum.photos/320/180?random=1',
          status: 'published',
          views: 15420,
          likes: 892,
          comments: 156,
          uploadDate: '2024-01-15',
          duration: '12:34',
          visibility: 'public'
        },
        {
          id: '2',
          title: 'JavaScript Tips and Tricks',
          thumbnail: 'https://picsum.photos/320/180?random=2',
          status: 'published',
          views: 8765,
          likes: 543,
          comments: 89,
          uploadDate: '2024-01-10',
          duration: '8:45',
          visibility: 'public'
        },
        {
          id: '3',
          title: 'CSS Grid Tutorial',
          thumbnail: 'https://picsum.photos/320/180?random=3',
          status: 'draft',
          views: 0,
          likes: 0,
          comments: 0,
          uploadDate: '2024-01-20',
          duration: '15:22',
          visibility: 'private'
        }
      ];

      // Mock analytics data
      const mockAnalytics: AnalyticsData = {
        totalViews: 125430,
        totalSubscribers: 5420,
        totalVideos: 23,
        totalRevenue: 1250.50,
        viewsChange: 12.5,
        subscribersChange: 8.3,
        recentViews: [1200, 1500, 1800, 2100, 1900, 2300, 2500]
      };

      setVideos(mockVideos);
      setAnalytics(mockAnalytics);
      setLoading(false);
    };

    loadStudioData();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'draft': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'scheduled': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'processing': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const quickActions = [
    {
      title: 'Upload Video',
      description: 'Upload and publish new content',
      icon: <VideoCameraIcon className="w-6 h-6" />,
      link: '/studio/upload',
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      title: 'Go Live',
      description: 'Start a live stream',
      icon: <PlayIcon className="w-6 h-6" />,
      link: '/studio/live',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Create Short',
      description: 'Upload a short video',
      icon: <VideoCameraIconSolid className="w-6 h-6" />,
      link: '/studio/shorts',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics',
      icon: <ChartBarIcon className="w-6 h-6" />,
      link: '/studio/analytics',
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <VideoCameraIconSolid className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              YouTube Studio
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <UnifiedButton variant="outline" size="sm">
              <BellIcon className="w-4 h-4 mr-2" />
              Notifications
            </UnifiedButton>
            <UnifiedButton variant="primary" size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              Create
            </UnifiedButton>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className="group p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {action.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(analytics.totalViews)}
                  </p>
                </div>
                <div className="flex items-center text-green-600">
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                  <span className="text-sm">{analytics.viewsChange}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Subscribers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(analytics.totalSubscribers)}
                  </p>
                </div>
                <div className="flex items-center text-green-600">
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                  <span className="text-sm">{analytics.subscribersChange}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Videos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.totalVideos}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${analytics.totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <TabsList>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="videos">Videos ({videos.length})</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="p-6">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Videos
                </h2>
                <div className="space-y-4">
                  {videos.slice(0, 3).map((video) => (
                    <div key={video.id} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-24 h-14 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {video.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(video.status)}`}>
                            {video.status}
                          </span>
                          <span className="flex items-center">
                            <EyeIcon className="w-4 h-4 mr-1" />
                            {formatNumber(video.views)}
                          </span>
                          <span className="flex items-center">
                            <HeartIcon className="w-4 h-4 mr-1" />
                            {formatNumber(video.likes)}
                          </span>
                          <span className="flex items-center">
                            <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
                            {formatNumber(video.comments)}
                          </span>
                        </div>
                      </div>
                      <UnifiedButton variant="outline" size="sm">
                        Edit
                      </UnifiedButton>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="videos" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    All Videos
                  </h2>
                  <UnifiedButton variant="primary">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Upload Video
                  </UnifiedButton>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Video</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Views</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Likes</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Comments</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {videos.map((video) => (
                        <tr key={video.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-16 h-9 object-cover rounded"
                              />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {video.title}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {video.duration} • {new Date(video.uploadDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(video.status)}`}>
                              {video.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-900 dark:text-white">
                            {formatNumber(video.views)}
                          </td>
                          <td className="py-4 px-4 text-gray-900 dark:text-white">
                            {formatNumber(video.likes)}
                          </td>
                          <td className="py-4 px-4 text-gray-900 dark:text-white">
                            {formatNumber(video.comments)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <UnifiedButton variant="ghost" size="sm">
                                Edit
                              </UnifiedButton>
                              <UnifiedButton variant="ghost" size="sm">
                                Analytics
                              </UnifiedButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="p-6">
              <div className="text-center py-12">
                <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Detailed Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Advanced analytics features coming soon
                </p>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="p-6">
              <div className="text-center py-12">
                <ChatBubbleLeftIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Comment Management
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Comment moderation tools coming soon
                </p>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="p-6">
              <div className="text-center py-12">
                <CogIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Channel Settings
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Channel customization options coming soon
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StudioPage;
