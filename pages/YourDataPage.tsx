
import React from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const YourDataPage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 bg-white dark:bg-neutral-950">
      <div className="max-w-3xl mx-auto bg-neutral-50 dark:bg-neutral-900 p-6 sm:p-8 rounded-xl shadow-xl">
        <div className="flex flex-col items-center text-center">
          <ShieldCheckIcon className="w-16 h-16 text-sky-500 dark:text-sky-400 mb-5" aria-hidden="true" />
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-3">
            Your Data in YouTube
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base leading-relaxed">
            This page is a placeholder for where you would manage your YouTube data.
          </p>
          <div className="mt-6 space-y-3 text-neutral-500 dark:text-neutral-400 text-sm text-left max-w-md mx-auto">
            <p>Here, you would typically find options to:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-4">
              <li>View and manage your watch and search history.</li>
              <li>Control your activity data and personalization settings.</li>
              <li>Download your YouTube data (Takeout).</li>
              <li>Manage ad settings related to your Google Account.</li>
              <li>Understand how your data improves your YouTube experience.</li>
            </ul>
            <p className="mt-4">
              For actual data management, please visit your Google Account settings on the official YouTube or Google websites.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourDataPage;