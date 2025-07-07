import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { UnifiedCard } from '../../components/ui/UnifiedComponents';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Play, Settings, BarChart3, Eye, Users, Calendar, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import live streaming components
import StreamAnalyticsDashboard from '../features/livestream/components/StreamAnalyticsDashboard';
import StreamManagementDashboard from '../features/livestream/components/StreamManagementDashboard';
import LiveStreamViewer from '../features/livestream/components/LiveStreamViewer';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

const LiveStreamingHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(1247);

  const quickActions: QuickAction[] = [
    {
      title: 'Go Live Now',
      description: 'Start streaming immediately',
      icon: <Play className="h-5 w-5" />,
      action: () => window.location.href = '/go-live',
      variant: 'default'
    },
    {
      title: 'Schedule Stream',
      description: 'Plan your next live stream',
      icon: <Calendar className="h-5 w-5" />,
      action: () => setActiveTab('management')
    },
    {
      title: 'Stream Settings',
      description: 'Configure your streaming setup',
      icon: <Settings className="h-5 w-5" />,
      action: () => setActiveTab('settings')
    },
    {
      title: 'View Analytics',
      description: 'Check your streaming performance',
      icon: <BarChart3 className="h-5 w-5" />,
      action: () => setActiveTab('analytics')
    }
  ];

  const liveStreams = [
    {
      id: '1',
      title: 'Building a React App Live!',
      thumbnail: '/api/placeholder/320/180',
      viewers: 1247,
      duration: '2:34:15',
      status: 'live' as const
    },
    {
      id: '2', 
      title: 'Q&A Session with Viewers',
      thumbnail: '/api/placeholder/320/180',
      viewers: 892,
      duration: '1:15:30',
      status: 'live' as const
    },
    {
      id: '3',
      title: 'Gaming Stream - New Release',
      thumbnail: '/api/placeholder/320/180',
      viewers: 2156,
      duration: '3:45:22',
      status: 'live' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Live Streaming Hub
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your live streams, view analytics, and engage with your audience
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {isLive && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    LIVE
                  </span>
                  <Badge variant="secondary">
                    <Eye className="h-3 w-3 mr-1" />
                    {viewerCount.toLocaleString()}
                  </Badge>
                </div>
              )}
              <Link to="/go-live">
                <Button className="bg-red-600 hover:bg-red-700">
                  <Play className="h-4 w-4 mr-2" />
                  Go Live
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <UnifiedCard key={index} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={action.action} hover={true}>
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            </UnifiedCard>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="management">Manage Streams</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="viewer">Live Viewer</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <UnifiedCard>
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Users className="h-5 w-5" />
                    <span className="font-semibold text-gray-900 dark:text-white">Total Viewers</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">12.4K</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">+15% from last week</p>
                </div>
              </UnifiedCard>

              <UnifiedCard>
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Play className="h-5 w-5" />
                    <span className="font-semibold text-gray-900 dark:text-white">Live Streams</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600">3</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Currently active</p>
                </div>
              </UnifiedCard>

              <UnifiedCard>
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Zap className="h-5 w-5" />
                    <span className="font-semibold text-gray-900 dark:text-white">Engagement</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-600">89%</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average engagement rate</p>
                </div>
              </UnifiedCard>
            </div>

            {/* Live Streams Grid */}
            <UnifiedCard>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Currently Live</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Active live streams across your channels
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveStreams.map((stream) => (
                    <div key={stream.id} className="relative group cursor-pointer">
                      <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <img 
                          src={stream.thumbnail} 
                          alt={stream.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-red-600 text-white">
                            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                            LIVE
                          </Badge>
                        </div>
                        <div className="absolute bottom-2 right-2">
                          <Badge variant="secondary">
                            {stream.duration}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {stream.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Eye className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {stream.viewers.toLocaleString()} viewers
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
               </div>
             </UnifiedCard>
          </TabsContent>

          {/* Management Tab */}
          <TabsContent value="management">
            <StreamManagementDashboard />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <StreamAnalyticsDashboard />
          </TabsContent>

          {/* Live Viewer Tab */}
          <TabsContent value="viewer">
            <LiveStreamViewer />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <UnifiedCard>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Stream Settings</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Configure your default streaming preferences
                  </p>
                </div>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Advanced stream settings will be available here
                  </p>
                  <Link to="/go-live">
                    <Button variant="outline">
                      Configure in Live Studio
                    </Button>
                  </Link>
                </div>
              </div>
            </UnifiedCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LiveStreamingHubPage;