import React from 'react';

/**
 * CommentsPage component for managing video comments in YouTube Studio
 */
const CommentsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Comments</h1>
      <p className="text-gray-600 mb-4">Review and respond to comments on your videos</p>
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-blue-700">
        <p>This is a placeholder for the Comments page in YouTube Studio that will allow you to manage comments on your videos.</p>
        <p className="mt-2">For demonstration of video components, please visit the <strong>Video Demo</strong> page using the user menu dropdown.</p>
      </div>
    </div>
  );
};

export default CommentsPage;
