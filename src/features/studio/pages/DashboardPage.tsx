import React from 'react';

/**
 * DashboardPage component for YouTube Studio Dashboard
 */
const DashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Studio Dashboard</h1>
      <p className="text-gray-600 mb-4">Overview of your channel performance</p>
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-blue-700">
        <p>This is a placeholder for the Studio Dashboard that will display analytics, recent videos, and channel performance metrics.</p>
        <p className="mt-2">For demonstration of video components, please visit the <strong>Video Demo</strong> page using the user menu dropdown.</p>
      </div>
    </div>
  );
};

export default DashboardPage;
