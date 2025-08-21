import React, { FC } from 'react';
interface Tab {
 id: string; label: string
}

interface ChannelTabsProps {
 tabs: Tab;
 activeTab: string; onTabClick: (tabId) => void
}

const ChannelTabs: React.FC<ChannelTabsProps> = ({ tabs, activeTab, onTabClick }: any) => {
 return (
 <div className="border-b border-neutral-300 dark:border-neutral-700/80 mb-1">
 <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto no-scrollbar" aria-label="Channel tabs">
 {tabs.map((tab) => (
 <button
 key={tab.id} />


 ${
 activeTab === tab.id
 ? 'border-neutral-800 dark:border-neutral-50 text-neutral-800 dark:text-neutral-50'
 : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:border-neutral-400 dark:hover:border-neutral-500'
 }`}

 >
 {tab.label.toUpperCase()}

 ))}


 );
};

export default ChannelTabs;