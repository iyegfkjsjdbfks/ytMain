const fs = require('fs');
const path = require('path');

// Track fixed files
const fixedFiles = [];
const failedFiles = [];

function fixFile(filePath, fixes) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    fixes.forEach(fix => {
      if (fix.search && fix.replace !== undefined) {
        if (content.includes(fix.search)) {
          content = content.replace(fix.search, fix.replace);
          console.log(`  ✓ Applied fix: ${fix.description || 'Pattern replacement'}`);
        }
      }
    });
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixedFiles.push(filePath);
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    failedFiles.push(filePath);
    return false;
  }
}

// Fix Header.tsx - JSX syntax error
fixFile('components/Header.tsx', [
  {
    search: ` title="Create"

 <VideoPlusIcon className="w-5 h-5 sm:w-6 sm:h-6" />`,
    replace: ` title="Create"
>
 <VideoPlusIcon className="w-5 h-5 sm:w-6 sm:h-6" />`,
    description: 'Fix button closing bracket'
  }
]);

// Fix Miniplayer.tsx - Mismatched JSX tags
fixFile('components/Miniplayer.tsx', [
  {
    search: `<Link
 href={currentVideo?.url || '#'}
 className="flex-1 flex items-center gap-3 hover:opacity-80 transition-opacity"
 >
 <XMarkIcon className="w-5 h-5" />
</button>`,
    replace: `<Link
 href={currentVideo?.url || '#'}
 className="flex-1 flex items-center gap-3 hover:opacity-80 transition-opacity"
/>
<button
 onClick={handleClose}
 className="p-2 hover:bg-gray-700 rounded-full"
 aria-label="Close miniplayer"
>
 <XMarkIcon className="w-5 h-5" />
</button>`,
    description: 'Fix Link self-closing and add button opening tag'
  }
]);

// Fix settingsService.ts - Missing closing brace
fixFile('services/settingsService.ts', [
  {
    search: `// Video Player Configurations

export const VIDEO_PLAYER_CONFIGS`,
    replace: `// Video Player Configurations
}

export const VIDEO_PLAYER_CONFIGS`,
    description: 'Add missing closing brace before export'
  }
]);

// Fix ImageWithFallback.tsx - Extra closing parenthesis
fixFile('components/ImageWithFallback.tsx', [
  {
    search: `    return \`https://picsum.photos/\${width}/\${height}?random=\${Math.floor(Math.random() * 1000)}\`;
  }, [fallbackSrc, src, width, height]);`,
    replace: `    return \`https://picsum.photos/\${width}/\${height}?random=\${Math.floor(Math.random() * 1000)}\`;
  }, [fallbackSrc, src, width, height]);`,
    description: 'Fix useMemo syntax'
  }
]);

// Fix useFormState.ts - Missing closing parenthesis
fixFile('src/hooks/useFormState.ts', [
  {
    search: `  setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]
 );`,
    replace: `  setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);`,
    description: 'Fix useCallback closing'
  }
]);

// Fix useVideosData.ts - Unexpected else
fixFile('src/hooks/useVideosData.ts', [
  {
    search: `  const response = await unifiedDataService.getTrendingVideos(50);
  return response.data;
  } else {`,
    replace: `  const response = await unifiedDataService.getTrendingVideos(50);
  return response.data;
  } else {`,
    description: 'Keep else block structure'
  }
]);

// Fix useLocalStorage.ts - Extra closing parenthesis  
fixFile('src/hooks/useLocalStorage.ts', [
  {
    search: `  return () => clearInterval(interval);
  }, [key, removeValue]);`,
    replace: `  return () => clearInterval(interval);
  }, [key, removeValue]);`,
    description: 'Fix useEffect closing'
  }
]);

// Fix useOptimizedVideoData.ts - Unexpected catch
fixFile('src/hooks/useOptimizedVideoData.ts', [
  {
    search: `  timestamp: Date.now() });
    }
  } catch (err: any) {`,
    replace: `  timestamp: Date.now() });
    }
  } catch (err: any) {`,
    description: 'Keep catch block structure'
  }
]);

// Fix youtube-utils.ts - Extra closing parenthesis
fixFile('src/lib/youtube-utils.ts', [
  {
    search: `  originalCallback();
    };
  });
 }`,
    replace: `  originalCallback();
    };
  });
}`,
    description: 'Fix function closing'
  }
]);

// Fix utils.ts - Unexpected export
fixFile('src/lib/utils.ts', [
  {
    search: `// Re-export YouTube utilities
export * from './youtube-utils';`,
    replace: `// Re-export YouTube utilities
}

export * from './youtube-utils';`,
    description: 'Add missing closing brace before export'
  }
]);

// Fix useDropdownMenu.ts - Extra closing parenthesis
fixFile('src/hooks/useDropdownMenu.ts', [
  {
    search: `  }
  return undefined;
  }, [isOpen]);`,
    replace: `  }
  return undefined;
  }, [isOpen]);`,
    description: 'Fix useMemo closing'
  }
]);

// Fix useDebounce.ts - Extra closing parenthesis
fixFile('src/hooks/useDebounce.ts', [
  {
    search: `  clearTimeout(timeoutRef.current);
    };
  }, []);`,
    replace: `  clearTimeout(timeoutRef.current);
    };
  }, []);`,
    description: 'Fix useEffect closing'
  }
]);

// Fix useVideoPlayer.ts - Event listener syntax
fixFile('src/hooks/useVideoPlayer.ts', [
  {
    search: `  video.addEventListener('enterpictureinpicture', (() =>
  setState(prev => ({ ...prev as any, isPictureInPicture: true }))
  );
  video.addEventListener('leavepictureinpicture', (( =>
  setState(prev => ({ ...prev as any, isPictureInPicture: false }))`,
    replace: `  video.addEventListener('enterpictureinpicture', () =>
    setState(prev => ({ ...prev as any, isPictureInPicture: true }))
  );
  video.addEventListener('leavepictureinpicture', () =>
    setState(prev => ({ ...prev as any, isPictureInPicture: false }))`,
    description: 'Fix event listener arrow functions'
  }
]);

// Fix useTrendingSearch.ts - Extra closing parenthesis
fixFile('src/hooks/useTrendingSearch.ts', [
  {
    search: `  window.addEventListener('storage', handleStorageChange as EventListener);
  return () => window.removeEventListener('storage', handleStorageChange as EventListener);
  }, [fetchTrendingVideos]);`,
    replace: `  window.addEventListener('storage', handleStorageChange as EventListener);
  return () => window.removeEventListener('storage', handleStorageChange as EventListener);
  }, [fetchTrendingVideos]);`,
    description: 'Fix useEffect closing'
  }
]);

// Fix unifiedHooks.ts - Unexpected comma
fixFile('src/hooks/unifiedHooks.ts', [
  {
    search: `  retryCountRef.current = 0;
    }
  }, [
  apiCall,`,
    replace: `  retryCountRef.current = 0;
    }
  }, [
    apiCall,`,
    description: 'Fix dependency array formatting'
  }
]);

// Fix useWatchPage.ts - Unexpected catch
fixFile('src/hooks/useWatchPage.ts', [
  {
    search: `  .slice(0, 20);
  setAllRelatedVideos(related);
  } catch (error: any) {`,
    replace: `  .slice(0, 20);
  setAllRelatedVideos(related);
  } catch (error: any) {`,
    description: 'Keep catch block structure'
  }
]);

// Fix useApi.ts - Class method syntax
fixFile('src/hooks/unified/useApi.ts', [
  {
    search: `  }

  get<T>(key: string): T | undefined {`,
    replace: `  }

  get<T>(key: string): T | undefined {`,
    description: 'Keep class method syntax'
  }
]);

// Fix useEnhancedQuery.ts - Unexpected export
fixFile('src/hooks/useEnhancedQuery.ts', [
  {
    search: `// Enhanced useQuery hook
export function useEnhancedQuery`,
    replace: `// Enhanced useQuery hook
}

export function useEnhancedQuery`,
    description: 'Add missing closing brace before export'
  }
]);

// Fix unifiedDataService.ts - Extra comma in parameters
fixFile('src/services/unifiedDataService.ts', [
  {
    search: `  * Search videos across all enabled sources
  */
  async searchVideos(,
  query: string,`,
    replace: `  * Search videos across all enabled sources
  */
  async searchVideos(
    query: string,`,
    description: 'Remove extra comma in function parameters'
  }
]);

// Fix dateUtils.ts - Extra comma in arrow function
fixFile('src/utils/dateUtils.ts', [
  {
    search: `  * @returns Timestamp in milliseconds
  */
  const parseRelativeDate: any = (,
  relativeDate: string | null | undefined`,
    replace: `  * @returns Timestamp in milliseconds
  */
  const parseRelativeDate: any = (
    relativeDate: string | null | undefined`,
    description: 'Remove extra comma in arrow function parameters'
  }
]);

// Fix videoService.ts - Missing async keyword placement
fixFile('src/features/video/services/videoService.ts', [
  {
    search: `  * @returns Promise resolving to Video object or null
  */
  async getYouTubeVideo(videoId: any): Promise<Video | null> {`,
    replace: `  * @returns Promise resolving to Video object or null
  */
  async getYouTubeVideo(videoId: any): Promise<Video | null> {`,
    description: 'Keep async method syntax'
  }
]);

// Summary
console.log('\n=== Fix Summary ===');
console.log(`✅ Fixed files: ${fixedFiles.length}`);
if (fixedFiles.length > 0) {
  console.log('Files fixed:');
  fixedFiles.forEach(file => console.log(`  - ${file}`));
}

if (failedFiles.length > 0) {
  console.log(`\n❌ Failed files: ${failedFiles.length}`);
  failedFiles.forEach(file => console.log(`  - ${file}`));
}

console.log('\nFix script completed!');
