import React from 'react';
import { useParams } from 'react-router-dom';
import { UserIcon } from '@heroicons/react/24/solid'; 


const UserPage: React.FC = () => {
  const { userName } = useParams<{ userName: string }>();

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto bg-neutral-50 dark:bg-neutral-900 p-6 sm:p-8 rounded-xl shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-28 h-28 sm:w-32 sm:h-32 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center mb-5 ring-4 ring-white dark:ring-neutral-800">
            <UserIcon className="w-16 h-16 sm:w-20 sm:h-20 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
            {decodeURIComponent(userName || 'User Profile')}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base">
            Welcome to the profile page for @{decodeURIComponent(userName || 'thisuser')}.
          </p>
          <div className="mt-6 space-y-3 text-neutral-500 dark:text-neutral-500 text-sm">
            <p>This is a placeholder page.</p>
            <p>In a full YouTube application, you would find user-specific content here, such as:</p>
            <ul className="list-disc list-inside text-left max-w-md mx-auto">
              <li>Uploaded videos</li>
              <li>Created playlists</li>
              <li>Community posts</li>
              <li>About section</li>
            </ul>
          </div>
          <button className="mt-8 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-medium rounded-full text-sm transition-colors">
            View Channel (Mock)
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
