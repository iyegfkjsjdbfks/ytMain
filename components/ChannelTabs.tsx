import React, { FC } from 'react';
import type React from 'react';

interface Tab {
  id: string; label: string
}

interface ChannelTabsProps {
  tabs: Tab;
  activeTab: string; onTabClick: (tabId) => void
}

const ChannelTabs: React.FC<ChannelTabsProps> = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div className="border-b border-neutral-300 dark:border-neutral-700/80 mb-1">
      <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto no-scrollbar" aria-label="Channel tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`whitespace-nowrap pb-2.5 pt-1 px-1 border-b-2 text-sm font-medium transition-colors
              ${
                activeTab === tab.id
                  ? 'border-neutral-800 dark:border-neutral-50 text-neutral-800 dark:text-neutral-50'
                  : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:border-neutral-400 dark:hover:border-neutral-500'
              }`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label.toUpperCase()}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ChannelTabs;