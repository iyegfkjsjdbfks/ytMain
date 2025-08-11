/// <reference types="react/jsx-runtime" />
import React from 'react';
import { useParams } from 'react-router-dom';
import type React from 'react';

/**
 * UserPage component for displaying a user's public profile
 */
const UserPage: React.FC = () => {
  const { userName } = useParams<{ userName: string }>();

  return (
    <div className='container mx-auto py-6'>
      <h1 className='text-2xl font-bold mb-6'>User Profile</h1>
      <p className='text-gray-600 mb-4'>
        {userName ? `Viewing user: @${userName}` : 'No user specified'}
      </p>
      <div className='p-4 bg-blue-50 rounded-lg border border-blue-200 text-blue-700'>
        <p>
          This is a placeholder for the user profile page that will display
          public information about a user.
        </p>
        <p className='mt-2'>
          For demonstration of video components, please visit the{' '}
          <strong>Video Demo</strong> page using the user menu dropdown.
        </p>
      </div>
    </div>
  );
};

export default UserPage;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
