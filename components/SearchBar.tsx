
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// TODO: Fix import - import { useState, useEffect, useRef, useCallback, memo } from 'react';
// TODO: Fix import - import React from 'react';

// TODO: Fix import - import { XMarkIcon } from '@heroicons/react/24/solid'; // For remove button
// TODO: Fix import - import { useNavigate } from 'react-router-dom';

import {
  getSearchSuggestions,
  saveRecentSearch,
  getRecentSearches,
  removeRecentSearch,
  clearAllRecentSearches,
} from '../services/realVideoService';

import ClockIcon from './icons/ClockIcon'; // For recent searches
import SearchIcon from './icons/SearchIcon';
import SearchSuggestions from './SearchSuggestions';

const SearchBar: React.FC = memo(() => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const navigate = useNavigate();
  const searchBarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  const loadRecentSearches = useCallback(async () => {
    const fetchedRecent = await getRecentSearches();
    setRecentSearches(fetchedRecent);
    if (fetchedRecent.length > 0) {
      setShowRecentSearches(true);
      setShowSuggestions(false); // Ensure suggestions are hidden
    } else {
      setShowRecentSearches(false);
    }
  }, []);

  const fetchSuggestionsDebounced = useCallback(async (currentQuery: string) => {
    if (currentQuery.trim().length > 1) {
      const fetched = await getSearchSuggestions(currentQuery);
      setSuggestions(fetched);
      setShowSuggestions(fetched.length > 0);
      setShowRecentSearches(false); // Hide recent searches when showing suggestions
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      // If query becomes empty, try to show recent searches
      if (currentQuery.trim().length === 0 && inputRef.current === document.activeElement) {
        loadRecentSearches().catch(console.error);
      }
    }
  }, [loadRecentSearches]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSuggestionsDebounced(query).catch(console.error);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, fetchSuggestionsDebounced]);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      const trimmedQuery = searchQuery.trim();
      setQuery(trimmedQuery);
      setShowSuggestions(false);
      setShowRecentSearches(false);

      saveRecentSearch(trimmedQuery).catch(console.error);
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      if (inputRef.current) {
inputRef.current.blur();
} // Optionally blur input after search
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion);
  };

  const handleInputFocus = () => {
    if (query.trim() === '') {
      loadRecentSearches().catch(console.error);
    } else if (suggestions.length > 0) {
      setShowSuggestions(true);
      setShowRecentSearches(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (newQuery.trim() === '') {
      loadRecentSearches().catch(console.error); // Load recent if input becomes empty
    } else {
      setShowRecentSearches(false); // Hide recent if user starts typing
      // Suggestions will be handled by the debounced useEffect
    }
  };

  const handleRemoveRecentSearch = async (searchToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click on list item
    const updatedSearches = await removeRecentSearch(searchToRemove);
    setRecentSearches(updatedSearches);
    if (updatedSearches.length === 0) {
      setShowRecentSearches(false);
    }
  };

  const handleClearAllRecent = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await clearAllRecentSearches();
    setRecentSearches([]);
    setShowRecentSearches(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowRecentSearches(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isDropdownOpen = (showSuggestions && suggestions.length > 0) || (showRecentSearches && recentSearches.length > 0);

  const inputBorderRadiusClass = isDropdownOpen
    ? 'rounded-t-xl rounded-b-none border-b-transparent dark:border-b-transparent'
    : 'rounded-l-full';

  const buttonBorderRadiusClass = isDropdownOpen
    ? 'rounded-tr-xl rounded-br-none border-b-transparent dark:border-b-transparent'
    : 'rounded-r-full';

  return (
    <div ref={searchBarRef} className="flex-grow max-w-xl mx-1 sm:mx-2 md:mx-4 relative">
      <form onSubmit={handleSubmit} className="flex items-center w-full" role="search">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="Search"
          className={`w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-2 sm:py-2.5 bg-white border border-neutral-300 
            dark:bg-neutral-900 dark:border-neutral-700 
            focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-black
            outline-none text-neutral-900 dark:text-neutral-50 placeholder-neutral-500 dark:placeholder-neutral-400 text-sm shadow-sm
            transition-all duration-100 ease-in-out
            ${inputBorderRadiusClass}
          `}
          aria-label="Search YouTube"
          aria-autocomplete="list"
          aria-controls={
            (() => {
               if (showSuggestions) {
                 return 'search-suggestions-listbox';
               }
               if (showRecentSearches) {
                 return 'recent-searches-listbox';
               }
               return undefined;
             })()
          }
        />
        <button
          type="submit"
          className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 
            border border-neutral-300 dark:border-neutral-700 border-l-0 
            flex items-center justify-center transition-all duration-100 ease-in-out min-w-[44px]
            ${buttonBorderRadiusClass}
          `}
          aria-label="Perform search"
        >
          <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600 dark:text-neutral-300" />
        </button>
      </form>
      {showSuggestions && suggestions.length > 0 && (
          <div id="search-suggestions-listbox">
            <SearchSuggestions
              suggestions={suggestions}
              onSuggestionClick={handleSuggestionClick}
              isVisible={showSuggestions}
            />
          </div>
      )}
      {showRecentSearches && recentSearches.length > 0 && (
        <ul
          id="recent-searches-listbox"
          className="absolute top-full left-0 right-0 mt-0.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-b-xl shadow-2xl z-[101] py-1 overflow-y-auto max-h-80 animate-fade-in-fast"
          aria-label="Recent searches"
        >
          {recentSearches.map((searchTerm: any) => (
            <li key={searchTerm} className="flex items-center justify-between px-4 py-2.5 text-sm text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700/70 transition-colors group">
              <button
                onClick={() => handleSearch(searchTerm)}
                className="flex items-center flex-grow text-left"
              >
                <ClockIcon className="w-4 h-4 mr-3 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                <span>{searchTerm}</span>
              </button>
              <button
                onClick={(e: Event) => {
                  handleRemoveRecentSearch(searchTerm, e).catch(console.error);
                }}
                className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove ${searchTerm} from recent searches`}
                title="Remove"
              >
                <XMarkIcon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </button>
            </li>
          ))}
           <li className="border-t border-neutral-200 dark:border-neutral-700/70 mt-1 pt-1">
                <button
                    onClick={(e: Event) => {
                      handleClearAllRecent(e).catch(console.error);
                    }}
                    className="w-full text-center px-4 py-2 text-xs font-medium text-sky-600 dark:text-sky-400 hover:bg-neutral-100 dark:hover:bg-neutral-700/70 transition-colors"
                >
                    Clear all recent searches
                </button>
            </li>
        </ul>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
