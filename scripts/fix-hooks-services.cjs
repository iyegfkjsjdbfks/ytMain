const fs = require('fs');
const path = require('path');

const fixes = [
  // Fix HoverAutoplayVideoCard declare issue
  {
    file: 'components/HoverAutoplayVideoCard.tsx',
    content: fs.existsSync(path.join(__dirname, '..', 'components/HoverAutoplayVideoCard.tsx')) 
      ? fs.readFileSync(path.join(__dirname, '..', 'components/HoverAutoplayVideoCard.tsx'), 'utf8') : '',
    fix: (content) => {
      return content.replace(/declare\s+const\s+HoverAutoplayVideoCard/g, 'const HoverAutoplayVideoCard');
    }
  },
  // Fix settingsService.ts
  {
    file: 'services/settingsService.ts',
    content: fs.existsSync(path.join(__dirname, '..', 'services/settingsService.ts'))
      ? fs.readFileSync(path.join(__dirname, '..', 'services/settingsService.ts'), 'utf8') : '',
    fix: (content) => {
      return content.replace(
        `  defaultCategory: 'youtube' } };`,
        `  defaultCategory: 'youtube'
  }
};`
      );
    }
  },
  // Fix useFormState.ts
  {
    file: 'src/hooks/useFormState.ts',
    content: fs.existsSync(path.join(__dirname, '..', 'src/hooks/useFormState.ts'))
      ? fs.readFileSync(path.join(__dirname, '..', 'src/hooks/useFormState.ts'), 'utf8') : '',
    fix: (content) => {
      // Fix the misplaced comma issue around line 101
      return content.replace(
        `  setIsSubmitting(false);
  }
  },
  [values, validate, onSubmit]
  );`,
        `  setIsSubmitting(false);
  }
 },
 [values, validate, onSubmit]
);`
      );
    }
  },
  // Fix useDropdownMenu.ts
  {
    file: 'src/hooks/useDropdownMenu.ts',
    content: fs.existsSync(path.join(__dirname, '..', 'src/hooks/useDropdownMenu.ts'))
      ? fs.readFileSync(path.join(__dirname, '..', 'src/hooks/useDropdownMenu.ts'), 'utf8') : '',
    fix: (content) => {
      return content.replace(
        `  return undefined;
  }, [isOpen]);`,
        `  return undefined;
 }, [isOpen]);`
      );
    }
  },
  // Fix useTrendingSearch.ts
  {
    file: 'src/hooks/useTrendingSearch.ts',
    content: fs.existsSync(path.join(__dirname, '..', 'src/hooks/useTrendingSearch.ts'))
      ? fs.readFileSync(path.join(__dirname, '..', 'src/hooks/useTrendingSearch.ts'), 'utf8') : '',
    fix: (content) => {
      return content.replace(
        `const convertSearchResultToVideo: any = (,`,
        `const convertSearchResultToVideo: any = (`
      );
    }
  },
  // Fix useDebounce.ts
  {
    file: 'src/hooks/useDebounce.ts',
    content: fs.existsSync(path.join(__dirname, '..', 'src/hooks/useDebounce.ts'))
      ? fs.readFileSync(path.join(__dirname, '..', 'src/hooks/useDebounce.ts'), 'utf8') : '',
    fix: (content) => {
      return content.replace(
        `export function useDebouncedCallback<T extends (...args) => any>(,`,
        `export function useDebouncedCallback<T extends (...args: any[]) => any>(`
      );
    }
  },
  // Fix useVideosData.ts
  {
    file: 'src/hooks/useVideosData.ts',
    content: fs.existsSync(path.join(__dirname, '..', 'src/hooks/useVideosData.ts'))
      ? fs.readFileSync(path.join(__dirname, '..', 'src/hooks/useVideosData.ts'), 'utf8') : '',
    fix: (content) => {
      return content.replace(
        `export function useVideosData(,`,
        `export function useVideosData(`
      );
    }
  },
  // Fix useOptimizedVideoData.ts
  {
    file: 'src/hooks/useOptimizedVideoData.ts',
    content: fs.existsSync(path.join(__dirname, '..', 'src/hooks/useOptimizedVideoData.ts'))
      ? fs.readFileSync(path.join(__dirname, '..', 'src/hooks/useOptimizedVideoData.ts'), 'utf8') : '',
    fix: (content) => {
      // Fix the catch block issue
      return content.replace(
        `  timestamp: Date.now() });
  }
  } catch (err: any) {`,
        `  timestamp: Date.now()
  });
 }
 } catch (err: any) {`
      );
    }
  },
  // Fix useAsyncState.ts
  {
    file: 'src/hooks/useAsyncState.ts',
    content: fs.existsSync(path.join(__dirname, '..', 'src/hooks/useAsyncState.ts'))
      ? fs.readFileSync(path.join(__dirname, '..', 'src/hooks/useAsyncState.ts'), 'utf8') : '',
    fix: (content) => {
      return content.replace(
        `export const useAsyncState = <T>(,`,
        `export const useAsyncState = <T>(`
      );
    }
  },
  // Fix useVideoPlayer.ts
  {
    file: 'src/hooks/useVideoPlayer.ts',
    content: fs.existsSync(path.join(__dirname, '..', 'src/hooks/useVideoPlayer.ts'))
      ? fs.readFileSync(path.join(__dirname, '..', 'src/hooks/useVideoPlayer.ts'), 'utf8') : '',
    fix: (content) => {
      return content.replace(
        `export const useVideoPlayer: any = (;`,
        `export const useVideoPlayer: any = (`
      );
    }
  },
  // Fix useLocalStorage.ts
  {
    file: 'src/hooks/useLocalStorage.ts',
    content: fs.existsSync(path.join(__dirname, '..', 'src/hooks/useLocalStorage.ts'))
      ? fs.readFileSync(path.join(__dirname, '..', 'src/hooks/useLocalStorage.ts'), 'utf8') : '',
    fix: (content) => {
      return content.replace(
        `export function useLocalStorage<T>(,`,
        `export function useLocalStorage<T>(`
      );
    }
  },
  // Fix unifiedHooks.ts
  {
    file: 'src/hooks/unifiedHooks.ts',
    content: fs.existsSync(path.join(__dirname, '..', 'src/hooks/unifiedHooks.ts'))
      ? fs.readFileSync(path.join(__dirname, '..', 'src/hooks/unifiedHooks.ts'), 'utf8') : '',
    fix: (content) => {
      return content.replace(
        `export function useAsyncState<T>(initialData: T | null = null): [
  AsyncState<T>
  {`,
        `export function useAsyncState<T>(initialData: T | null = null): [
  AsyncState<T>,
  {`
      );
    }
  },
  // Fix useWatchPage.ts
  {
    file: 'src/hooks/useWatchPage.ts',
    content: fs.existsSync(path.join(__dirname, '..', 'src/hooks/useWatchPage.ts'))
      ? fs.readFileSync(path.join(__dirname, '..', 'src/hooks/useWatchPage.ts'), 'utf8') : '',
    fix: (content) => {
      return content.replace(
        `  .slice(0, 20);
  setAllRelatedVideos(related);
  } catch (error: any) {`,
        `  .slice(0, 20);
  setAllRelatedVideos(related);
 } catch (error: any) {`
      );
    }
  },
  // Fix useAsyncData.ts
  {
    file: 'src/hooks/useAsyncData.ts',
    content: fs.existsSync(path.join(__dirname, '..', 'src/hooks/useAsyncData.ts'))
      ? fs.readFileSync(path.join(__dirname, '..', 'src/hooks/useAsyncData.ts'), 'utf8') : '',
    fix: (content) => {
      return content.replace(
        `export function useAsyncData<T>(,`,
        `export function useAsyncData<T>(`
      );
    }
  },
  // Fix useApi.ts
  {
    file: 'src/hooks/unified/useApi.ts',
    content: fs.existsSync(path.join(__dirname, '..', 'src/hooks/unified/useApi.ts'))
      ? fs.readFileSync(path.join(__dirname, '..', 'src/hooks/unified/useApi.ts'), 'utf8') : '',
    fix: (content) => {
      return content.replace(
        `  get<T>(key: string): T | undefined {`,
        `  get<T>(key: string): T | undefined {`
      );
    }
  },
  // Fix useEnhancedQuery.ts
  {
    file: 'src/hooks/useEnhancedQuery.ts',
    content: fs.existsSync(path.join(__dirname, '..', 'src/hooks/useEnhancedQuery.ts'))
      ? fs.readFileSync(path.join(__dirname, '..', 'src/hooks/useEnhancedQuery.ts'), 'utf8') : '',
    fix: (content) => {
      return content.replace(
        `function withPerformanceMonitoring<T>(,`,
        `function withPerformanceMonitoring<T>(`
      );
    }
  },
  // Fix realVideoService.ts
  {
    file: 'services/realVideoService.ts',
    content: fs.existsSync(path.join(__dirname, '..', 'services/realVideoService.ts'))
      ? fs.readFileSync(path.join(__dirname, '..', 'services/realVideoService.ts'), 'utf8') : '',
    fix: (content) => {
      // The export seems to be at the top level without issues, might need to check for specific context
      return content;
    }
  },
  // Fix unifiedDataService.ts
  {
    file: 'src/services/unifiedDataService.ts',
    content: fs.existsSync(path.join(__dirname, '..', 'src/services/unifiedDataService.ts'))
      ? fs.readFileSync(path.join(__dirname, '..', 'src/services/unifiedDataService.ts'), 'utf8') : '',
    fix: (content) => {
      return content.replace(
        `  sourcePriority: ['youtube'] };`,
        `  sourcePriority: ['youtube']
 }
};`
      );
    }
  },
  // Fix dateUtils.ts
  {
    file: 'src/utils/dateUtils.ts',
    content: fs.existsSync(path.join(__dirname, '..', 'src/utils/dateUtils.ts'))
      ? fs.readFileSync(path.join(__dirname, '..', 'src/utils/dateUtils.ts'), 'utf8') : '',
    fix: (content) => {
      return content.replace(
        `export const formatShortDistanceToNow: any = (,`,
        `export const formatShortDistanceToNow: any = (`
      );
    }
  },
  // Fix numberUtils.ts
  {
    file: 'src/utils/numberUtils.ts',
    content: fs.existsSync(path.join(__dirname, '..', 'src/utils/numberUtils.ts'))
      ? fs.readFileSync(path.join(__dirname, '..', 'src/utils/numberUtils.ts'), 'utf8') : '',
    fix: (content) => {
      return content.replace(
        `export const formatPercentage: any = (,`,
        `export const formatPercentage: any = (`
      );
    }
  },
  // Fix useVideo.ts
  {
    file: 'src/features/video/hooks/useVideo.ts',
    content: fs.existsSync(path.join(__dirname, '..', 'src/features/video/hooks/useVideo.ts'))
      ? fs.readFileSync(path.join(__dirname, '..', 'src/features/video/hooks/useVideo.ts'), 'utf8') : '',
    fix: (content) => {
      return content.replace(
        `[...videoKeys.unified.details(), id] as const };`,
        `[...videoKeys.unified.details(), id] as const
 }
};`
      );
    }
  }
];

function applyFixes() {
  console.log('Starting hooks and services syntax error fixes...');
  
  fixes.forEach(({ file, content, fix }) => {
    const filePath = path.join(__dirname, '..', file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${file} - file not found`);
      return;
    }
    
    const originalContent = content || fs.readFileSync(filePath, 'utf8');
    const fixedContent = fix(originalContent);
    
    if (fixedContent !== originalContent) {
      fs.writeFileSync(filePath, fixedContent);
      console.log(`✓ Fixed ${file}`);
    } else {
      console.log(`No changes needed for ${file}`);
    }
  });
  
  console.log('Hooks and services syntax error fixes complete!');
}

applyFixes();
