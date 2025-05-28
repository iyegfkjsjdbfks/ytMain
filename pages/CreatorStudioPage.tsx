import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  ChartBarIcon,
  LightBulbIcon,
  AcademicCapIcon,
  MegaphoneIcon,
  CameraIcon,
  PencilSquareIcon,
  CalendarDaysIcon,
  GlobeAltIcon,
  TrendingUpIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { formatNumber } from '../utils/numberUtils';
import { formatDistanceToNow } from '../utils/dateUtils';

interface AudienceInsight {
  metric: string;
  value: string | number;
  change: number;
  period: string;
}

interface ContentIdea {
  id: string;
  title: string;
  category: string;
  trending: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedViews: number;
  tags: string[];
}

interface CreatorResource {
  title: string;
  description: string;
  type: 'tutorial' | 'template' | 'tool' | 'guide';
  link: string;
  icon: React.ReactNode;
}

interface ScheduledContent {
  id: string;
  title: string;
  type: 'video' | 'short' | 'live';
  scheduledDate: Date;
  status: 'scheduled' | 'processing' | 'ready';
}

const CreatorStudioPage: React.FC = () => {
  const [audienceInsights, setAudienceInsights] = useState<AudienceInsight[]>([]);
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'insights' | 'ideas' | 'resources' | 'schedule'>('insights');

  useEffect(() => {
    const fetchCreatorData = async () => {
      setLoading(true);
      
      // Mock audience insights
      const mockInsights: AudienceInsight[] = [
        {
          metric: 'Average View Duration',
          value: '4:32',
          change: 12.5,
          period: 'vs last month'
        },
        {
          metric: 'Subscriber Growth',
          value: formatNumber(1250),
          change: 8.3,
          period: 'this month'
        },
        {
          metric: 'Top Traffic Source',
          value: 'YouTube Search',
          change: 15.2,
          period: 'vs last month'
        },
        {
          metric: 'Peak Viewing Time',
          value: '8:00 PM',
          change: -2.1,
          period: 'vs last month'
        },
        {
          metric: 'Audience Retention',
          value: '68%',
          change: 5.7,
          period: 'vs last month'
        },
        {
          metric: 'Click-through Rate',
          value: '4.2%',
          change: 3.8,
          period: 'vs last month'
        }
      ];

      // Mock content ideas
      const mockIdeas: ContentIdea[] = [
        {
          id: '1',
          title: 'React 18 New Features Explained',
          category: 'Technology',
          trending: true,
          difficulty: 'Medium',
          estimatedViews: 25000,
          tags: ['React', 'JavaScript', 'Web Development']
        },
        {
          id: '2',
          title: 'AI Tools for Content Creators',
          category: 'Technology',
          trending: true,
          difficulty: 'Easy',
          estimatedViews: 35000,
          tags: ['AI', 'Content Creation', 'Tools']
        },
        {
          id: '3',
          title: 'Building a Personal Brand Online',
          category: 'Business',
          trending: false,
          difficulty: 'Hard',
          estimatedViews: 18000,
          tags: ['Branding', 'Marketing', 'Social Media']
        },
        {
          id: '4',
          title: 'TypeScript Best Practices 2024',
          category: 'Technology',
          trending: true,
          difficulty: 'Medium',
          estimatedViews: 22000,
          tags: ['TypeScript', 'Programming', 'Best Practices']
        },
        {
          id: '5',
          title: 'Productivity Hacks for Developers',
          category: 'Lifestyle',
          trending: false,
          difficulty: 'Easy',
          estimatedViews: 15000,
          tags: ['Productivity', 'Development', 'Tips']
        }
      ];

      // Mock scheduled content
      const mockScheduled: ScheduledContent[] = [
        {
          id: '1',
          title: 'Weekly Tech News Roundup',
          type: 'video',
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          status: 'ready'
        },
        {
          id: '2',
          title: 'Quick CSS Tip #47',
          type: 'short',
          scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          status: 'processing'
        },
        {
          id: '3',
          title: 'Live Q&A Session',
          type: 'live',
          scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          status: 'scheduled'
        }
      ];

      setTimeout(() => {
        setAudienceInsights(mockInsights);
        setContentIdeas(mockIdeas);
        setScheduledContent(mockScheduled);
        setLoading(false);
      }, 1000);
    };

    fetchCreatorData();
  }, []);

  const creatorResources: CreatorResource[] = [
    {
      title: 'Thumbnail Templates',
      description: 'Professional thumbnail designs for your videos',
      type: 'template',
      link: '/resources/thumbnails',
      icon: <CameraIcon className="w-5 h-5" />
    },
    {
      title: 'Content Calendar',
      description: 'Plan and schedule your content strategy',
      type: 'tool',
      link: '/resources/calendar',
      icon: <CalendarDaysIcon className="w-5 h-5" />
    },
    {
      title: 'SEO Optimization Guide',
      description: 'Improve your video discoverability',
      type: 'guide',
      link: '/resources/seo-guide',
      icon: <AcademicCapIcon className="w-5 h-5" />
    },
    {
      title: 'Video Editing Tutorial',
      description: 'Learn professional editing techniques',
      type: 'tutorial',
      link: '/resources/editing-tutorial',
      icon: <PencilSquareIcon className="w-5 h-5" />
    },
    {
      title: 'Analytics Deep Dive',
      description: 'Understanding your channel metrics',
      type: 'guide',
      link: '/analytics',
      icon: <ChartBarIcon className="w-5 h-5" />
    },
    {
      title: 'Community Building',
      description: 'Strategies to grow your audience',
      type: 'guide',
      link: '/resources/community',
      icon: <UserGroupIcon className="w-5 h-5" />
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <CameraIcon className="w-4 h-4" />;
      case 'short': return <ClockIcon className="w-4 h-4" />;
      case 'live': return <GlobeAltIcon className="w-4 h-4" />;
      default: return <CameraIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-neutral-700 rounded w-1/3 mb-8"></div>
            <div className="h-12 bg-gray-200 dark:bg-neutral-700 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-neutral-700 rounded-lg"></div>
              <div className="h-96 bg-gray-200 dark:bg-neutral-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Creator Studio
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tools and insights to help you create better content
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200 dark:border-neutral-700">
            {[
              { id: 'insights', label: 'Audience Insights', icon: <ChartBarIcon className="w-5 h-5" /> },
              { id: 'ideas', label: 'Content Ideas', icon: <LightBulbIcon className="w-5 h-5" /> },
              { id: 'resources', label: 'Creator Resources', icon: <AcademicCapIcon className="w-5 h-5" /> },
              { id: 'schedule', label: 'Content Schedule', icon: <CalendarDaysIcon className="w-5 h-5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'insights' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audienceInsights.map((insight, index) => (
              <div key={index} className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {insight.metric}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {insight.value}
                  </span>
                  <div className={`flex items-center text-sm ${
                    insight.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUpIcon className={`w-4 h-4 mr-1 ${
                      insight.change < 0 ? 'transform rotate-180' : ''
                    }`} />
                    {Math.abs(insight.change)}%
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {insight.period}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ideas' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contentIdeas.map((idea) => (
              <div key={idea.id} className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {idea.title}
                      </h3>
                      {idea.trending && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <TrendingUpIcon className="w-3 h-3 mr-1" />
                          Trending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {idea.category}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(idea.difficulty)}`}>
                    {idea.difficulty}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <EyeIcon className="w-4 h-4 mr-1" />
                    Est. {formatNumber(idea.estimatedViews)} views
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {idea.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="px-2 py-1 bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <Link
                    to={`/ai-content-spark?idea=${encodeURIComponent(idea.title)}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors text-center"
                  >
                    Develop Idea
                  </Link>
                  <Link
                    to={`/upload?title=${encodeURIComponent(idea.title)}`}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors text-center"
                  >
                    Create Video
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creatorResources.map((resource, index) => (
              <Link
                key={index}
                to={resource.link}
                className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400">
                    {resource.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {resource.title}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {resource.type}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {resource.description}
                </p>
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700">
            <div className="p-6 border-b border-gray-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Upcoming Content
                </h2>
                <Link
                  to="/upload"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Schedule New
                </Link>
              </div>
            </div>
            <div className="p-6">
              {scheduledContent.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No scheduled content
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start planning your content calendar
                  </p>
                  <Link
                    to="/upload"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Schedule Content
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledContent.map((content) => (
                    <div key={content.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-neutral-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 dark:bg-neutral-700 rounded-lg">
                          {getTypeIcon(content.type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {content.title}
                          </h3>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDistanceToNow(content.scheduledDate)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
                              {content.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorStudioPage;