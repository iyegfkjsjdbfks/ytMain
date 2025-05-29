
import React, { useEffect } from 'react';
import SubscriptionsIcon from '../components/icons/SubscriptionsIcon';
import PageLayout from '../components/PageLayout';
import VideoGrid from '../components/VideoGrid';
import { useSubscriptionsFeed } from '../hooks';

const SubscriptionsPage: React.FC = () => {
  const { data: subscribedVideos, loading, error } = useSubscriptionsFeed();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageLayout
      title="Subscriptions"
      icon={<SubscriptionsIcon className="text-neutral-700 dark:text-neutral-300" />}
      data={subscribedVideos}
      loading={loading}
      error={error}
      emptyState={{
        title: "No new videos from your subscriptions",
        message: "Subscribe to channels to see their latest videos here. Your feed will update automatically.",
        icon: <SubscriptionsIcon className="w-16 h-16 text-neutral-400 dark:text-neutral-600" />
      }}
    >
      {(videos) => <VideoGrid videos={videos} keyPrefix="sub" />}
    </PageLayout>
  );
};

export default SubscriptionsPage;
