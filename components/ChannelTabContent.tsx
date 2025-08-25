import React from 'react';

export interface ChannelTabContentProps {
  activeTab: string;
  channelId: string;

}
const ChannelTabContent: React.FC<ChannelTabContentProps> = ({ activeTab, channelId }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'videos':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="text-center py-8">
              <p className="text-gray-500">Videos will be displayed here</p>
            </div>
          </div>
      case 'shorts':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
            <div className="text-center py-8 col-span-full">
              <p className="text-gray-500">Shorts will be displayed here</p>
            </div>
          </div>
      case 'playlists':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center py-8 col-span-full">
              <p className="text-gray-500">Playlists will be displayed here</p>
            </div>
          </div>
      case 'community':
        return (
          <div className="space-y-4">
            <div className="text-center py-8">
              <p className="text-gray-500">Community posts will be displayed here</p>
            </div>
          </div>
      case 'about':
        return (
          <div className="max-w-4xl">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">About this channel</h2>
              <p className="text-gray-600">Channel information will be displayed here</p>
            </div>
          </div>
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Content not available</p>
          </div>
  return (
    <div className="py-6">
      {renderContent()}
    </div>
export default ChannelTabContent;
