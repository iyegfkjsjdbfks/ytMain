import { useState, useRef, useEffect, type FC } from 'react';

import { CheckIcon } from '@heroicons/react/24/solid';

import AdjustmentsHorizontalIcon from './icons/AdjustmentsHorizontalIcon';

export type SortByType = 'relevance' | 'uploadDate' | 'viewCount';

export const sortOptions: Array<{ value: SortByType; label: string }> = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'uploadDate', label: 'Upload date' },
  { value: 'viewCount', label: 'View count' },
];

interface SortFilterPanelProps {
  currentSortBy: SortByType;
  onSortChange: (newSortBy: SortByType) => void;
  disabled?: boolean;
}

const SortFilterPanel: React.FC<SortFilterPanelProps> = ({ currentSortBy, onSortChange, disabled }) => {
  const [showPanel, setShowPanel] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPanel(false);
      }
    };
    if (showPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPanel]);

  const handleSortOptionClick = (newSortBy: SortByType) => {
    onSortChange(newSortBy);
    setShowPanel(false);
  };

  if (disabled) {
return null;
}

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowPanel(prev => !prev)}
        className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-expanded={showPanel}
        aria-haspopup="true"
        aria-controls="sort-options-panel"
        id="filter-button"
        title="Sort search results"
        disabled={disabled}
      >
        <AdjustmentsHorizontalIcon className="w-4 h-4 mr-1.5" />
        Sort by
      </button>
      {showPanel && (
        <div
          ref={panelRef}
          id="sort-options-panel"
          className="absolute top-full right-0 mt-1.5 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-30 py-1 animate-fade-in-fast"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="filter-button"
        >
          {sortOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleSortOptionClick(option.value)}
              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between
                ${currentSortBy === option.value
                  ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 font-medium'
                  : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700/70'
                } transition-colors`}
              role="menuitemradio"
              aria-checked={currentSortBy === option.value}
            >
              <span>{option.label}</span>
              {currentSortBy === option.value && <CheckIcon className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortFilterPanel;