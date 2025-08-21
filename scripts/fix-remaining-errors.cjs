const fs = require('fs');
const path = require('path');

// Track fixed files
const fixedFiles = [];
const failedFiles = [];

function fixFile(filePath, fixes) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️ File not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    fixes.forEach(fix => {
      if (fix.pattern && fix.replacement) {
        const before = content.length;
        content = content.replace(fix.pattern, fix.replacement);
        const after = content.length;
        if (before !== after || content !== originalContent) {
          console.log(`  ✓ Applied: ${fix.description}`);
        }
      }
    });
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixedFiles.push(filePath);
      console.log(`✅ Fixed: ${path.basename(filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    failedFiles.push(filePath);
    return false;
  }
}

// Fixes to apply
const filesToFix = [
  // Fix useFormState.ts
  {
    path: 'src/hooks/useFormState.ts',
    fixes: [
      {
        pattern: /}\s*}, \[values, validate, onSubmit\]\);/g,
        replacement: '    }\n  }, [values, validate, onSubmit]);',
        description: 'Fix useCallback closing'
      }
    ]
  },
  
  // Fix useVideosData.ts
  {
    path: 'src/hooks/useVideosData.ts',
    fixes: [
      {
        pattern: /return response\.data;\s*} else {/g,
        replacement: 'return response.data;\n  } else {',
        description: 'Ensure proper if-else structure'
      }
    ]
  },
  
  // Fix useLocalStorage.ts
  {
    path: 'src/hooks/useLocalStorage.ts',
    fixes: [
      {
        pattern: /return \(\) => clearInterval\(interval\);\s*}, \[key, removeValue\]\);/g,
        replacement: 'return () => clearInterval(interval);\n  }, [key, removeValue]);',
        description: 'Fix useEffect closing'
      }
    ]
  },
  
  // Fix useOptimizedVideoData.ts
  {
    path: 'src/hooks/useOptimizedVideoData.ts',
    fixes: [
      {
        pattern: /timestamp: Date\.now\(\) \}\);\s*}\s*} catch \(err: any\) {/g,
        replacement: 'timestamp: Date.now() });\n    }\n  } catch (err: any) {',
        description: 'Fix try-catch structure'
      }
    ]
  },
  
  // Fix youtube-utils.ts
  {
    path: 'src/lib/youtube-utils.ts',
    fixes: [
      {
        pattern: /originalCallback\(\);\s*};\s*}\);\s*}/g,
        replacement: 'originalCallback();\n    };\n  });\n}',
        description: 'Fix function closing'
      }
    ]
  },
  
  // Fix utils.ts
  {
    path: 'src/lib/utils.ts',
    fixes: [
      {
        pattern: /searchParams\.append\(key, String\(value\)\);\s*}\s*}\);\s*return searchParams/g,
        replacement: 'searchParams.append(key, String(value));\n    }\n  });\n\n  return searchParams',
        description: 'Fix forEach and return statement'
      }
    ]
  },
  
  // Fix useDropdownMenu.ts
  {
    path: 'src/hooks/useDropdownMenu.ts',
    fixes: [
      {
        pattern: /return undefined;\s*}, \[isOpen\]\);/g,
        replacement: 'return undefined;\n  }, [isOpen]);',
        description: 'Fix useMemo closing'
      }
    ]
  },
  
  // Fix useDebounce.ts
  {
    path: 'src/hooks/useDebounce.ts',
    fixes: [
      {
        pattern: /clearTimeout\(timeoutRef\.current\);\s*};\s*}, \[\]\);/g,
        replacement: 'clearTimeout(timeoutRef.current);\n    };\n  }, []);',
        description: 'Fix useEffect closing'
      }
    ]
  },
  
  // Fix useVideoPlayer.ts
  {
    path: 'src/hooks/useVideoPlayer.ts',
    fixes: [
      {
        pattern: /video\.addEventListener\('ended', \( as EventListener\) => onEnded\?\.\(\)\);/g,
        replacement: "video.addEventListener('ended', (() => onEnded?.()) as EventListener);",
        description: 'Fix event listener syntax'
      }
    ]
  },
  
  // Fix useTrendingSearch.ts
  {
    path: 'src/hooks/useTrendingSearch.ts',
    fixes: [
      {
        pattern: /return \(\) => window\.removeEventListener\('storage', handleStorageChange as EventListener\);\s*}, \[fetchTrendingVideos\]\);/g,
        replacement: "return () => window.removeEventListener('storage', handleStorageChange as EventListener);\n  }, [fetchTrendingVideos]);",
        description: 'Fix useEffect closing'
      }
    ]
  },
  
  // Fix unifiedHooks.ts
  {
    path: 'src/hooks/unifiedHooks.ts',
    fixes: [
      {
        pattern: /retryCountRef\.current = 0;\s*}\s*}, \[/g,
        replacement: 'retryCountRef.current = 0;\n    }\n  }, [',
        description: 'Fix useCallback dependency array'
      }
    ]
  },
  
  // Fix useWatchPage.ts
  {
    path: 'src/hooks/useWatchPage.ts',
    fixes: [
      {
        pattern: /setAllRelatedVideos\(related\);\s*} catch \(error: any\) {/g,
        replacement: 'setAllRelatedVideos(related);\n  } catch (error: any) {',
        description: 'Fix try-catch structure'
      }
    ]
  },
  
  // Fix useApi.ts
  {
    path: 'src/hooks/unified/useApi.ts',
    fixes: [
      {
        pattern: /get<T>\(key: string\): T \| undefined {/g,
        replacement: 'get<T>(key: string): T | undefined {',
        description: 'Class method syntax already correct'
      }
    ]
  },
  
  // Fix useEnhancedQuery.ts
  {
    path: 'src/hooks/useEnhancedQuery.ts',
    fixes: [
      {
        pattern: /} & Omit<\s*UseQueryOptions<TData, TError>\s*'queryKey'/g,
        replacement: "} & Omit<\n    UseQueryOptions<TData, TError>,\n    'queryKey'",
        description: 'Fix generic type syntax'
      }
    ]
  },
  
  // Fix unifiedDataService.ts
  {
    path: 'src/services/unifiedDataService.ts',
    fixes: [
      {
        pattern: /return normalized;\s*}\s*} catch \(error: any\) {/g,
        replacement: 'return normalized;\n    }\n  } catch (error: any) {',
        description: 'Fix try-catch structure'
      }
    ]
  },
  
  // Fix dateUtils.ts
  {
    path: 'src/utils/dateUtils.ts',
    fixes: [
      {
        pattern: /return now - 10 \* 365 \* 24 \* 60 \* 60 \* 1000;[^}]*$/,
        replacement: 'return now - 10 * 365 * 24 * 60 * 60 * 1000; // Approx 10 years ago\n};\n\nexport { parseRelativeDate };',
        description: 'Add missing closing brace and export'
      }
    ]
  },
  
  // Fix videoService.ts
  {
    path: 'src/features/video/services/videoService.ts',
    fixes: [
      {
        pattern: /\*\/\s*async getYouTubeVideo/g,
        replacement: '*/\n  async getYouTubeVideo',
        description: 'Fix method declaration'
      }
    ]
  }
];

console.log('Starting comprehensive error fixes...\n');

filesToFix.forEach(file => {
  console.log(`Processing ${file.path}...`);
  fixFile(file.path, file.fixes);
});

// Summary
console.log('\n=== Fix Summary ===');
console.log(`✅ Fixed files: ${fixedFiles.length}`);
if (fixedFiles.length > 0) {
  console.log('Files fixed:');
  fixedFiles.forEach(file => console.log(`  - ${path.basename(file)}`));
}

if (failedFiles.length > 0) {
  console.log(`\n❌ Failed files: ${failedFiles.length}`);
  failedFiles.forEach(file => console.log(`  - ${path.basename(file)}`));
}

console.log('\nComprehensive fix script completed!');
