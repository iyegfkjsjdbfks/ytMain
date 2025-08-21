const fs = require('fs');
const path = require('path');

// Helper function to fix a file
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
        console.log(`  Applied fix: ${fix.description || 'String replacement'}`);
      }
    } else if (fix.search instanceof RegExp) {
      const matches = content.match(fix.search);
      if (matches) {
        content = content.replace(fix.search, fix.replace);
        changesMade = true;
        console.log(`  Applied fix: ${fix.description || 'Regex replacement'}`);
      }
    }
  });
  
  if (changesMade) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Fixed ${path.basename(filePath)}`);
    return true;
  }
  
  console.log(`No changes needed for ${path.basename(filePath)}`);
  return false;
}

// Main fixes object
const fileFixes = {
  // Fix remaining Header.tsx issues
  'components/Header.tsx': [
    {
      search: ` className="text-blue-600 border border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20">
 >`,
      replace: ` className="text-blue-600 border border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20"
>`,
      description: 'Fix Button closing tag'
    },
    {
      search: ` aria-labelledby="create-button">
 >`,
      replace: ` aria-labelledby="create-button"
>`,
      description: 'Fix div closing tag'
    },
    {
      search: ` handleCloseUserMenu={handleCloseUserMenu} />
 />`,
      replace: ` handleCloseUserMenu={handleCloseUserMenu}
/>`,
      description: 'Fix AuthenticatedUserSection closing'
    }
  ],

  // Fix Miniplayer.tsx
  'components/Miniplayer.tsx': [
    {
      search: `// FIXED:  </div>
// FIXED:  </Link>`,
      replace: ` </div>
 </Link>`,
      description: 'Fix closing tags'
    },
    {
      search: ` to={\`/watch/\${video.id}\`} />
 onClick={(e: any) => {`,
      replace: ` to={\`/watch/\${video.id}\`}
 onClick={(e: any) => {`,
      description: 'Fix Link tag'
    }
  ],

  // Fix OptimizedMiniplayerContext.tsx
  'contexts/OptimizedMiniplayerContext.tsx': [
    {
      search: `}
  const { state } = useOptimizedMiniplayer();
  return state.isVisible;
};`,
      replace: `export const useMiniplayerVisibility = () => {
  const { state } = useOptimizedMiniplayer();
  return state.isVisible;
};`,
      description: 'Fix function declaration'
    }
  ],

  // Fix settingsService.ts
  'services/settingsService.ts': [
    {
      search: `  defaultCategory: 'youtube' } };`,
      replace: `  defaultCategory: 'youtube'
  }
};`,
      description: 'Fix object syntax'
    }
  ],

  // Fix icon files
  'components/icons/FireIcon.tsx': [
    {
      search: ` d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A7.986 7.986 0 0112 2c2.21 0 4.207.896 5.657 2.343A8 8 0 0117.657 18.657z" />
 />`,
      replace: ` d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A7.986 7.986 0 0112 2c2.21 0 4.207.896 5.657 2.343A8 8 0 0117.657 18.657z"
/>`,
      description: 'Fix path closing'
    }
  ],

  'components/icons/HomeIcon.tsx': [
    {
      search: ` d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
 />`,
      replace: ` d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
/>`,
      description: 'Fix path closing'
    },
    {
      search: `// FIXED:  </svg>`,
      replace: ` </svg>`,
      description: 'Fix svg closing'
    }
  ],

  'components/icons/ShortsIcon.tsx': [
    {
      search: ` d="M13.535 8.168L9.244 5.314a.75.75 0 00-1.136.644v5.95l-2.181-1.26a.75.75 0 00-1.136.645v5.296a.75.75 0 001.136.644l2.181-1.26v1.646a.75.75 0 001.136.644l8.582-4.955a.75.75 0 000-1.289l-4.291-2.476zm-.882 3.007L16.26 13.03v-2.186l-3.607-2.082v5.413zM8.858 11.69l3.607 2.082V8.359L8.858 10.44v1.25zM6.927 15.36l1.181-.682v-3.482l-1.181-.681v4.845z" />
 />`,
      replace: ` d="M13.535 8.168L9.244 5.314a.75.75 0 00-1.136.644v5.95l-2.181-1.26a.75.75 0 00-1.136.645v5.296a.75.75 0 001.136.644l2.181-1.26v1.646a.75.75 0 001.136.644l8.582-4.955a.75.75 0 000-1.289l-4.291-2.476zm-.882 3.007L16.26 13.03v-2.186l-3.607-2.082v5.413zM8.858 11.69l3.607 2.082V8.359L8.858 10.44v1.25zM6.927 15.36l1.181-.682v-3.482l-1.181-.681v4.845z"
/>`,
      description: 'Fix path closing'
    },
    {
      search: `// FIXED:  </svg>;_c = ShortsIcon;`,
      replace: ` </svg>`,
      description: 'Fix svg closing'
    }
  ],

  'components/icons/SubscriptionsIcon.tsx': [
    {
      search: ` d="M6.75 7.25a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H6.75zM6 11.75A.75.75 0 016.75 11h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zm-.75 3.75a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H6.75zM19.5 3.75H4.5a.75.75 0 00-.75.75v15c0 .414.336.75.75.75h15a.75.75 0 00.75-.75V4.5a.75.75 0 00-.75-.75zM4.5 2.25A2.25 2.25 0 002.25 4.5v15A2.25 2.25 0 004.5 21.75h15A2.25 2.25 0 0021.75 19.5V4.5A2.25 2.25 0 0019.5 2.25H4.5zM10.75 6l4.5 3.25-4.5 3.25V6z" />
 />`,
      replace: ` d="M6.75 7.25a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H6.75zM6 11.75A.75.75 0 016.75 11h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zm-.75 3.75a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H6.75zM19.5 3.75H4.5a.75.75 0 00-.75.75v15c0 .414.336.75.75.75h15a.75.75 0 00.75-.75V4.5a.75.75 0 00-.75-.75zM4.5 2.25A2.25 2.25 0 002.25 4.5v15A2.25 2.25 0 004.5 21.75h15A2.25 2.25 0 0021.75 19.5V4.5A2.25 2.25 0 0019.5 2.25H4.5zM10.75 6l4.5 3.25-4.5 3.25V6z"
/>`,
      description: 'Fix path closing'
    },
    {
      search: `// FIXED:  </svg>;_c = SubscriptionsIcon;`,
      replace: ` </svg>`,
      description: 'Fix svg closing'
    }
  ],

  'components/ImageWithFallback.tsx': [
    {
      search: ` return \`https://picsum.photos/\${width}/\${height}?random=\${Math.floor(Math.random() * 1000)}\`;
 }, [fallbackSrc, src, width, height]);`,
      replace: ` return \`https://picsum.photos/\${width}/\${height}?random=\${Math.floor(Math.random() * 1000)}\`;
}, [fallbackSrc, src, width, height]);`,
      description: 'Fix useMemo closing'
    }
  ],

  // Fix hook files
  'src/hooks/useLocalStorage.ts': [
    {
      search: `  const item = window.(localStorage as any).getItem(key);`,
      replace: `  const item = window.localStorage.getItem(key);`,
      description: 'Fix localStorage access'
    }
  ],

  'src/hooks/useAsyncState.ts': [
    {
      search: ` asyncFunction: () => Promise<T>
  dependencies = [],`,
      replace: ` asyncFunction: () => Promise<T>,
  dependencies = [],`,
      description: 'Fix function parameters'
    }
  ],

  'src/hooks/useTrendingSearch.ts': [
    {
      search: `  projection: 'rectangular' };
 };`,
      replace: `  projection: 'rectangular'
 };
};`,
      description: 'Fix object closing'
    }
  ],

  'src/hooks/useDebounce.ts': [
    {
      search: `   clearTimeout(timeoutRef.current);
  };
  }, []);`,
      replace: `    clearTimeout(timeoutRef.current);
   };
  }, []);`,
      description: 'Fix useEffect closing'
    }
  ],

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
);`,
      description: 'Fix useCallback closing'
    }
  ],

  'src/hooks/useVideosData.ts': [
    {
      search: `  return response.data;
  }
  } else {`,
      replace: `  return response.data;
  } else {`,
      description: 'Fix else block'
    }
  ],

  'src/hooks/useWatchPage.ts': [
    {
      search: `  .slice(0, 20);
  setAllRelatedVideos(related);
  } catch (error: any) {`,
      replace: `  .slice(0, 20);
  setAllRelatedVideos(related);
 } catch (error: any) {`,
      description: 'Fix catch block'
    }
  ],

  'src/hooks/useOptimizedVideoData.ts': [
    {
      search: `  timestamp: Date.now() });
  }
  } catch (err: any) {`,
      replace: `  timestamp: Date.now()
  });
 } catch (err: any) {`,
      description: 'Fix catch block'
    }
  ],

  'src/hooks/useDropdownMenu.ts': [
    {
      search: `  return undefined;
  }, [isOpen]);`,
      replace: `  return undefined;
 }, [isOpen]);`,
      description: 'Fix useEffect closing'
    }
  ],

  'src/hooks/useVideoPlayer.ts': [
    {
      search: `  const error = new Error(;
  \`Video error: \${video.error?.message || 'Unknown error'}\`,
  );`,
      replace: `  const error = new Error(
   \`Video error: \${video.error?.message || 'Unknown error'}\`
  );`,
      description: 'Fix Error constructor'
    }
  ],

  'src/hooks/unifiedHooks.ts': [
    {
      search: `export function useAsyncState<T>(initialData: T | null = null): [
  AsyncState<T>
  {`,
      replace: `export function useAsyncState<T>(initialData: T | null = null): [
  AsyncState<T>,
  {`,
      description: 'Fix return type'
    }
  ],

  'src/hooks/unified/useApi.ts': [
    // This might be a class method, leave as is
  ],

  'src/hooks/useEnhancedQuery.ts': [
    // Check if there's something before the export
  ],

  // Fix lib files
  'src/lib/utils.ts': [
    {
      search: `export function formatCount(,`,
      replace: `export function formatCount(`,
      description: 'Fix function parameters'
    }
  ],

  'src/lib/youtube-utils.ts': [
    {
      search: `export function getYouTubeVideoId(,`,
      replace: `export function getYouTubeVideoId(`,
      description: 'Fix function parameters'
    }
  ],

  // Fix service files
  'src/services/unifiedDataService.ts': [
    {
      search: `  sourcePriority: ['youtube'] };`,
      replace: `  sourcePriority: ['youtube']
  }
};`,
      description: 'Fix object closing'
    }
  ],

  'src/utils/dateUtils.ts': [
    // The export seems ok, might be context issue
  ],

  'src/features/video/services/videoService.ts': [
    {
      search: `  async getRecommendedVideos(,`,
      replace: `  async getRecommendedVideos(`,
      description: 'Fix method parameters'
    }
  ]
};

// Apply all fixes
console.log('Starting final comprehensive syntax fixes...\n');

let totalFixed = 0;
let totalProcessed = 0;

Object.entries(fileFixes).forEach(([file, fixes]) => {
  if (fixes && fixes.length > 0) {
    totalProcessed++;
    const filePath = path.join(__dirname, '..', file);
    console.log(`Processing ${file}...`);
    if (fixFile(filePath, fixes)) {
      totalFixed++;
    }
    console.log('');
  }
});

console.log(`\n✅ Fixed ${totalFixed} out of ${totalProcessed} files processed.`);
console.log('Final syntax fixes complete!');
