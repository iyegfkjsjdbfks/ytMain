import React, { FC } from 'react';
/**
 * WatchLaterPage component for displaying videos saved to watch later
 */
const WatchLaterPage: React.FC = () => {
 return (
 <div className='container mx-auto py-6'>
 <h1 className='text-2xl font-bold mb-6'>Watch Later</h1>
 <p className='text-gray-600 mb-4'>Videos you've saved to watch later</p>
 <div className='p-4 bg-blue-50 rounded-lg border border-blue-200 text-blue-700'>
 <p>
 This is a placeholder for the watch later page that will display
 videos you've saved to watch later.
// FIXED:  </p>
 <p className='mt-2'>
 For demonstration of video components, please visit the{' '}
 <strong>Video Demo</strong> page using the user menu dropdown.
// FIXED:  </p>
// FIXED:  </div>
// FIXED:  </div>
 );
};

export default WatchLaterPage;
