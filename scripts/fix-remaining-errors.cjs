const fs = require('fs');
const path = require('path');

function fixFile(filePath, fixes) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changesMade = false;
  
  fixes.forEach(fix => {
    if (typeof fix.search === 'string') {
      if (content.includes(fix.search)) {
        content = content.replace(fix.search, fix.replace);
        changesMade = true;
      }
    } else if (fix.search instanceof RegExp) {
      const newContent = content.replace(fix.search, fix.replace);
      if (newContent !== content) {
        content = newContent;
        changesMade = true;
      }
    }
  });
  
  if (changesMade) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Fixed ${path.basename(filePath)}`);
    return true;
  }
  
  return false;
}

const fixes = {
  // Header.tsx - fix useEffect closing
  'components/Header.tsx': [
    {
      search: ` return () => {
 document.removeEventListener('mousedown', handleClickOutside as EventListener);
 }}, [isUserMenuOpen, isNotificationsPanelOpen, isCreateMenuOpen]);`,
      replace: ` return () => {
  document.removeEventListener('mousedown', handleClickOutside as EventListener);
 };
 }, [isUserMenuOpen, isNotificationsPanelOpen, isCreateMenuOpen]);`
    },
    // Fix toggleUserMenu closing brace
    {
      search: `setIsCreateMenuOpen(false);
};`,
      replace: `setIsCreateMenuOpen(false);
 }
 };`
    },
    // Fix toggleCreateMenu closing brace
    {
      search: `setIsNotificationsPanelOpen(false);
};`,
      replace: `setIsNotificationsPanelOpen(false);
 }
 };`
    },
    // Fix handleClickOutside closing brace
    {
      search: `setIsCreateMenuOpen(false);
 };`,
      replace: `setIsCreateMenuOpen(false);
 }
 };`
    }
  ],
  
  // OptimizedMiniplayerContext.tsx - fix return outside function
  'contexts/OptimizedMiniplayerContext.tsx': [
    {
      search: `}
  const { state } = useOptimizedMiniplayer();
  return state.currentVideo;
};`,
      replace: `  const { state } = useOptimizedMiniplayer();
  return state.currentVideo;
};`
    }
  ],
  
  // Sidebar.tsx - fix aside tag
  'components/Sidebar.tsx': [
    {
      search: ` <aside
// FIXED:  className={\`fixed top-14 left-0 z-50 h-[calc(100vh-3.5rem)] bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-transform duration-300 ease-in-out overflow-y-auto w-64 md:hidden
 \${isOpen ? 'transform translate-x-0' : 'transform -translate-x-full'}
 \`}
// FIXED:  aria-label="Mobile navigation" />
 >`,
      replace: ` <aside
  className={\`fixed top-14 left-0 z-50 h-[calc(100vh-3.5rem)] bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-transform duration-300 ease-in-out overflow-y-auto w-64 md:hidden \${isOpen ? 'transform translate-x-0' : 'transform -translate-x-full'}\`}
  aria-label="Mobile navigation"
 >`
    }
  ],
  
  // CategoryChips.tsx - fix button attributes
  'components/CategoryChips.tsx': [
    {
      search: `// FIXED:  onClick={() => onSelectCategory(category)}
// FIXED:  className={cn(
 'flex-shrink-0 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap touch-manipulation min-h-[36px] sm:min-h-[40px]',
 isSelected
 ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
 : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700')}`,
      replace: ` onClick={() => onSelectCategory(category)}
 className={cn(
  'flex-shrink-0 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap touch-manipulation min-h-[36px] sm:min-h-[40px]',
  isSelected
  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
 )}`
    }
  ],
  
  // Miniplayer.tsx - fix onClick handler
  'components/Miniplayer.tsx': [
    {
      search: ` e.preventDefault(); onMaximize(video.id);
}
 className="w-[160px] aspect-video block flex-shrink-0 group relative bg-black"
 aria-label={\`Maximize video: \${video.title}\`}
 title={\`Maximize: \${video.title}\`}
 >`,
      replace: ` e.preventDefault(); 
  onMaximize(video.id);
 }}
 className="w-[160px] aspect-video block flex-shrink-0 group relative bg-black"
 aria-label={\`Maximize video: \${video.title}\`}
 title={\`Maximize: \${video.title}\`}
 >`
    }
  ],
  
  // HoverAutoplayVideoCard.tsx - remove declare keyword
  'components/HoverAutoplayVideoCard.tsx': [
    {
      search: /declare\s+const\s+HoverAutoplayVideoCard/g,
      replace: 'const HoverAutoplayVideoCard'
    }
  ],
  
  // MinimizedSidebar.tsx - fix closing tags
  'components/MinimizedSidebar.tsx': [
    {
      search: /to="[^"]+"\s+\/>/g,
      replace: (match) => {
        // Extract the "to" value
        const toMatch = match.match(/to="([^"]+)"/);
        if (toMatch) {
          return `to="${toMatch[1]}"`;
        }
        return match;
      }
    },
    // Fix remaining attributes
    {
      search: /\/>\n\s*icon=/g,
      replace: '\n icon='
    },
    {
      search: /\/>\n\s*label=/g,
      replace: '\n label='
    },
    {
      search: /\/>\n\s*currentPath=/g,
      replace: '\n currentPath='
    },
    {
      search: /\/>\n\s*title=/g,
      replace: '\n title='
    },
    {
      search: /title="[^"]+"\n\s*\/>/g,
      replace: (match) => {
        const titleMatch = match.match(/title="([^"]+)"/);
        if (titleMatch) {
          return `title="${titleMatch[1]}"\n />`;
        }
        return match;
      }
    }
  ],
  
  // settingsService.ts - fix object syntax
  'services/settingsService.ts': [
    {
      search: `  defaultCategory: 'youtube' } };`,
      replace: `  defaultCategory: 'youtube'
  }
};`
    }
  ],
  
  // useFormState.ts - fix callback syntax
  'src/hooks/useFormState.ts': [
    {
      search: `  setIsSubmitting(false);
  }
  },
  [values, validate, onSubmit]
  );`,
      replace: `   setIsSubmitting(false);
  }
 },
 [values, validate, onSubmit]
);`
    }
  ],
  
  // useAsyncState.ts - fix parameters
  'src/hooks/useAsyncState.ts': [
    {
      search: `export const useAsyncState = <T>(
  asyncFunction: () => Promise<T>
  dependencies = [],`,
      replace: `export const useAsyncState = <T>(
  asyncFunction: () => Promise<T>,
  dependencies = [],`
    }
  ],
  
  // useTrendingSearch.ts - fix object syntax
  'src/hooks/useTrendingSearch.ts': [
    {
      search: `  projection: 'rectangular' };`,
      replace: `  projection: 'rectangular'
 };`
    }
  ],
  
  // useDebounce.ts - fix useEffect return
  'src/hooks/useDebounce.ts': [
    {
      search: `  clearTimeout(timeoutRef.current);
  };
  }, []);`,
      replace: `   clearTimeout(timeoutRef.current);
  };
 }, []);`
    }
  ],
  
  // useLocalStorage.ts - fix return type
  'src/hooks/useLocalStorage.ts': [
    {
      search: `): [T(value: SetValue<T>) => void() => void] {`,
      replace: `): [T, (value: SetValue<T>) => void, () => void] {`
    }
  ],
  
  // useOptimizedVideoData.ts - fix catch block
  'src/hooks/useOptimizedVideoData.ts': [
    {
      search: `  timestamp: Date.now() });
  }
  } catch (err: any) {`,
      replace: `  timestamp: Date.now()
  });
 } catch (err: any) {`
    }
  ],
  
  // useVideosData.ts - fix else block
  'src/hooks/useVideosData.ts': [
    {
      search: `  return response.data;
  }
  } else {`,
      replace: `  return response.data;
  } else {`
    }
  ],
  
  // useDropdownMenu.ts - fix useEffect
  'src/hooks/useDropdownMenu.ts': [
    {
      search: `  return undefined;
  }, [isOpen]);`,
      replace: `  return undefined;
 }, [isOpen]);`
    }
  ],
  
  // useVideoPlayer.ts - fix error constructor
  'src/hooks/useVideoPlayer.ts': [
    {
      search: `  const error = new Error(;
  \`Video error: \${video.error?.message || 'Unknown error'}\`,
  );`,
      replace: `  const error = new Error(
   \`Video error: \${video.error?.message || 'Unknown error'}\`
  );`
    }
  ],
  
  // useWatchPage.ts - fix catch block
  'src/hooks/useWatchPage.ts': [
    {
      search: `  .slice(0, 20);
  setAllRelatedVideos(related);
  } catch (error: any) {`,
      replace: `  .slice(0, 20);
  setAllRelatedVideos(related);
 } catch (error: any) {`
    }
  ],
  
  // unifiedHooks.ts - fix return type
  'src/hooks/unifiedHooks.ts': [
    {
      search: `export function useAsyncState<T>(initialData: T | null = null): [
  AsyncState<T>
  {`,
      replace: `export function useAsyncState<T>(initialData: T | null = null): [
  AsyncState<T>,
  {`
    }
  ],
  
  // useApi.ts - fix generic method
  'src/hooks/unified/useApi.ts': [
    {
      search: `  get<T>(key: string): T | undefined {`,
      replace: `  get<T>(key: string): T | undefined {`
    }
  ],
  
  // useEnhancedQuery.ts - fix function parameter
  'src/hooks/useEnhancedQuery.ts': [
    {
      search: `export function useEnhancedQuery<TData = unknown, TError = ApiError>(,`,
      replace: `export function useEnhancedQuery<TData = unknown, TError = ApiError>(`
    }
  ],
  
  // unifiedDataService.ts - fix object syntax
  'src/services/unifiedDataService.ts': [
    {
      search: `  sourcePriority: ['youtube'] };`,
      replace: `  sourcePriority: ['youtube']
  }
};`
    }
  ],
  
  // dateUtils.ts - fix export
  'src/utils/dateUtils.ts': [
    {
      search: /export const formatShortDistanceToNow: any = \(/,
      replace: 'export const formatShortDistanceToNow = ('
    }
  ],
  
  // realVideoService.ts - needs context check
  'services/realVideoService.ts': [
    // This might need the full context to fix properly
  ],
  
  // useVideo.ts - fix export
  'src/features/video/hooks/useVideo.ts': [
    {
      search: `export const useUnifiedSearchVideos: any = (,`,
      replace: `export const useUnifiedSearchVideos = (`
    }
  ]
};

console.log('Starting comprehensive error fixes...');

Object.entries(fixes).forEach(([file, fileFixes]) => {
  const filePath = path.join(__dirname, '..', file);
  if (fileFixes.length > 0) {
    fixFile(filePath, fileFixes);
  }
});

console.log('Fixes complete!');
