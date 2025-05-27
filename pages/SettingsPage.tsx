
import React from 'react';
import { Cog8ToothIcon } from '@heroicons/react/24/outline';

const SettingsPage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 bg-white dark:bg-neutral-950">
      <div className="max-w-3xl mx-auto bg-neutral-50 dark:bg-neutral-900 p-6 sm:p-8 rounded-xl shadow-xl">
        <div className="flex flex-col items-center text-center">
          <Cog8ToothIcon className="w-16 h-16 text-neutral-600 dark:text-neutral-400 mb-5" aria-hidden="true" />
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-3">
            Settings
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base leading-relaxed">
            This page is a placeholder for YouTube application settings.
          </p>
          <div className="mt-6 space-y-3 text-neutral-500 dark:text-neutral-400 text-sm text-left max-w-md mx-auto">
            <p>Typical settings categories you might find here include:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-4">
              <li><strong>General:</strong> Language, Appearance (Theme), Restricted Mode.</li>
              <li><strong>Account:</strong> Channel settings, Memberships, Google Account link.</li>
              <li><strong>Notifications:</strong> Choose when and how you're notified.</li>
              <li><strong>Privacy:</strong> Manage what you share, ad settings, history settings.</li>
              <li><strong>Playback and performance:</strong> Video quality defaults, captions.</li>
              <li><strong>Downloads:</strong> Download quality, storage.</li>
              <li><strong>Billing and payments:</strong> Manage payment methods for purchases and memberships.</li>
              <li><strong>Advanced settings:</strong> Less frequently used options.</li>
            </ul>
            <p className="mt-4">
              For actual settings, please visit the official YouTube website or app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;