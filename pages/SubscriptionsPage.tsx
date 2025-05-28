
import React, { useEffect } from 'react';
import VideoCard from '../components/VideoCard';
import SubscriptionsIcon from '../components/icons/SubscriptionsIcon'; // Using local icon
import { useSubscriptionsFeed } from '../hooks';

const SubscriptionsPage: React.FC = () => {
  const { data: subscribedVideos, loading, error } = useSubscriptionsFeed();

  useEffect(() => {
    window.scrollTo(0,0);
  }, []);

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-3 md:gap-x-4 gap-y-5 md:gap-y-6">
      {Array.from({ length: 18 }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-neutral-900 rounded-xl animate-pulse">
          <div className="aspect-video bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
          <div className="p-3">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-full bg-neutral-300 dark:bg-neutral-700/80 mt-0.5 flex-shrink-0"></div>
              <div className="flex-grow space-y-1.5 pt-0.5">
                <div className="h-4 bg-neutral-300 dark:bg-neutral-700/80 rounded w-5/6"></div>
                <div className="h-3 bg-neutral-300 dark:bg-neutral-700/80 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-300 dark:bg-neutral-700/80 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-neutral-950">
      <div className="flex items-center mb-6 sm:mb-8">
        <SubscriptionsIcon className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-700 dark:text-neutral-300 mr-3" />
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Subscriptions</h1>
      </div>

      {loading ? (
        renderSkeleton()
      ) : error ? (
        <div className="text-center py-12 text-red-500 dark:text-red-400">
          <p className="text-lg">{error}</p>
        </div>
      ) : subscribedVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-3 md:gap-x-4 gap-y-5 md:gap-y-6">
          {subscribedVideos.map(video => (
            <VideoCard key={`${video.id}-sub`} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-xl shadow-lg">
          <SubscriptionsIcon className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mx-auto mb-6" />
          <p className="text-xl sm:text-2xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">No new videos from your subscriptions</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-md mx-auto">
            Subscribe to channels to see their latest videos here. Your feed will update automatically.
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;
