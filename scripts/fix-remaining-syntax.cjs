const fs = require('fs');
const path = require('path');

// Track fixed files
const fixedFiles = [];

// Helper function to fix file
function fixFile(filePath, fixes) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    fixes.forEach(fix => {
      const before = content;
      content = fix(content);
      if (before !== content) {
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixedFiles.push(path.basename(filePath));
      console.log(`✓ Fixed: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`✗ Error fixing ${path.basename(filePath)}: ${error.message}`);
  }
}

// Fix OptimizedMiniplayerContext.tsx - duplicate export
fixFile('contexts/OptimizedMiniplayerContext.tsx', [
  (content) => {
    // Remove duplicate export
    return content.replace(
      /export const useMiniplayerVisibility = \(\) => \{[\s\S]*?export const useMiniplayerVisibility = \(\) => \{/,
      'export const useMiniplayerVisibility = () => {'
    );
  }
]);

// Fix Miniplayer.tsx - mismatched tags
fixFile('components/Miniplayer.tsx', [
  (content) => {
    // Fix the Link structure - seems like there's a misplaced closing tag
    return content
      .replace(
        /<Link[\s\S]*?to=\{`\/watch\/\$\{video\.id\}`\}[\s\S]*?<PlayIcon className="w-10 h-10 text-white\/80" \/>\s*<\/div>\s*<\/Link>/,
        `<Link to={\`/watch/\${video.id}\`} className="block">
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <PlayIcon className="w-10 h-10 text-white/80" />
          </div>
        </Link>`
      )
      .replace(
        /<Link\s+to=\{`\/watch\/\$\{video\.id\}`\} \/>/g,
        '<Link to={`/watch/${video.id}`}>'
      );
  }
]);

// Fix Header.tsx - extra > characters
fixFile('components/Header.tsx', [
  (content) => {
    // Remove standalone > characters on their own lines
    return content
      .replace(/^\s*>\s*$/gm, '')
      .replace(/className="[^"]*">\s*>\s*$/gm, (match) => match.replace(/>\s*>\s*$/, '>'));
  }
]);

// Fix settingsService.ts - object syntax
fixFile('services/settingsService.ts', [
  (content) => {
    // Fix object closing syntax
    return content.replace(
      /defaultCategory: 'youtube' \} \};/,
      "defaultCategory: 'youtube' },"
    );
  }
]);

// Fix FireIcon.tsx - wrap paths in fragment
fixFile('components/icons/FireIcon.tsx', [
  (content) => {
    // Wrap multiple path elements in a fragment
    if (content.includes('/>') && content.includes('<path') && !content.includes('<>')) {
      return content
        .replace(
          /(stroke="currentColor"[\s\S]*?>\s*)(<path[\s\S]*?\/>\s*<path[\s\S]*?\/>)/,
          '$1<>$2</>'
        );
    }
    return content;
  }
]);

// Fix HomeIcon.tsx - closing tag issue
fixFile('components/icons/HomeIcon.tsx', [
  (content) => {
    // Remove duplicate </svg> tag
    return content.replace(
      /\/>\s*<\/svg>\s*<\/svg>/,
      '/>\n</svg>'
    );
  }
]);

// Fix ImageWithFallback.tsx - misplaced bracket
fixFile('components/ImageWithFallback.tsx', [
  (content) => {
    // Fix useMemo closing
    return content.replace(
      /return `https:\/\/picsum\.photos\/\$\{width\}\/\$\{height\}\?random=\$\{Math\.floor\(Math\.random\(\) \* 1000\)\}`;[\s\n]*\}, \[fallbackSrc, src, width, height\]\);/,
      'return `https://picsum.photos/${width}/${height}?random=${Math.floor(Math.random() * 1000)}`;\n  }, [fallbackSrc, src, width, height]);'
    );
  }
]);

// Fix utils.ts - nested export
fixFile('src/lib/utils.ts', [
  (content) => {
    // Remove nested export
    const lines = content.split('\n');
    let inFunction = false;
    let braceCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('export function') && !inFunction) {
        inFunction = true;
        braceCount = 0;
      }
      
      if (inFunction) {
        braceCount += (lines[i].match(/\{/g) || []).length;
        braceCount -= (lines[i].match(/\}/g) || []).length;
        
        if (braceCount === 0 && lines[i].includes('}')) {
          inFunction = false;
        }
        
        // Remove nested export
        if (braceCount > 0 && lines[i].trim().startsWith('export')) {
          lines[i] = lines[i].replace(/^\s*export\s+/, '  ');
        }
      }
    }
    
    return lines.join('\n');
  }
]);

// Fix useTrendingSearch.ts - object syntax
fixFile('src/hooks/useTrendingSearch.ts', [
  (content) => {
    return content.replace(
      /projection: 'rectangular' \};/,
      "projection: 'rectangular' }"
    );
  }
]);

// Fix useLocalStorage.ts - window syntax
fixFile('src/hooks/useLocalStorage.ts', [
  (content) => {
    return content.replace(
      /window\.\(localStorage as any\)/g,
      'window.localStorage'
    );
  }
]);

// Fix youtube-utils.ts - nested export
fixFile('src/lib/youtube-utils.ts', [
  (content) => {
    // Similar to utils.ts, remove nested exports
    const lines = content.split('\n');
    let inFunction = false;
    let braceCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('export') && lines[i].includes('function') && !inFunction) {
        inFunction = true;
        braceCount = 0;
      }
      
      if (inFunction) {
        braceCount += (lines[i].match(/\{/g) || []).length;
        braceCount -= (lines[i].match(/\}/g) || []).length;
        
        if (braceCount === 0 && lines[i].includes('}')) {
          inFunction = false;
        }
        
        // Remove nested export
        if (braceCount > 0 && lines[i].trim().startsWith('export')) {
          lines[i] = lines[i].replace(/^\s*export\s+/, '  ');
        }
      }
    }
    
    return lines.join('\n');
  }
]);

// Fix useAsyncState.ts - parameter syntax
fixFile('src/hooks/useAsyncState.ts', [
  (content) => {
    return content.replace(
      /asyncFunction: \(\) => Promise<T>\s*dependencies = \[\],/,
      'asyncFunction: () => Promise<T>,\n  dependencies = [],'
    );
  }
]);

// Fix useFormState.ts - extra comma
fixFile('src/hooks/useFormState.ts', [
  (content) => {
    // Find and fix the extra comma after catch block
    return content.replace(
      /setIsSubmitting\(false\);\s*\}\s*\},\s*\[values, validate, onSubmit\]/,
      'setIsSubmitting(false);\n    }\n  }, [values, validate, onSubmit]'
    );
  }
]);

// Fix useDebounce.ts - closing bracket
fixFile('src/hooks/useDebounce.ts', [
  (content) => {
    return content.replace(
      /clearTimeout\(timeoutRef\.current\);\s*\};\s*\}, \[\]\);/,
      'clearTimeout(timeoutRef.current);\n    };\n  }, []);'
    );
  }
]);

// Fix unifiedHooks.ts - function signature
fixFile('src/hooks/unifiedHooks.ts', [
  (content) => {
    return content.replace(
      /export function useAsyncState<T>\(initialData: T \| null = null\): \[\s*AsyncState<T>\s*\{/,
      'export function useAsyncState<T>(initialData: T | null = null): [\n  AsyncState<T>,\n  {'
    );
  }
]);

// Fix useVideosData.ts - else block
fixFile('src/hooks/useVideosData.ts', [
  (content) => {
    // Fix orphaned else block
    return content.replace(
      /\}\s*\} else \{/,
      '  } else {'
    );
  }
]);

// Fix useWatchPage.ts - orphaned catch
fixFile('src/hooks/useWatchPage.ts', [
  (content) => {
    // Find and fix orphaned catch block
    return content.replace(
      /setAllRelatedVideos\(related\);\s*\} catch \(error: any\) \{/,
      'setAllRelatedVideos(related);\n    } catch (error: any) {'
    );
  }
]);

// Fix useVideoPlayer.ts - Error constructor
fixFile('src/hooks/useVideoPlayer.ts', [
  (content) => {
    return content.replace(
      /const error = new Error\(;\s*`Video error:/,
      "const error = new Error(\n      `Video error:"
    ).replace(
      /Unknown error'}`,\s*\);/,
      "Unknown error'}`);"
    );
  }
]);

// Fix useDropdownMenu.ts - closing bracket
fixFile('src/hooks/useDropdownMenu.ts', [
  (content) => {
    return content.replace(
      /return undefined;\s*\}, \[isOpen\]\);/,
      'return undefined;\n  }, [isOpen]);'
    );
  }
]);

// Fix useOptimizedVideoData.ts - orphaned catch
fixFile('src/hooks/useOptimizedVideoData.ts', [
  (content) => {
    return content.replace(
      /timestamp: Date\.now\(\) \}\);\s*\}\s*\} catch \(err: any\) \{/,
      'timestamp: Date.now() });\n    }\n  } catch (err: any) {'
    );
  }
]);

// Fix useApi.ts - method syntax
fixFile('src/hooks/unified/useApi.ts', [
  (content) => {
    return content.replace(
      /get<T>\(key: string\): T \| undefined \{/,
      'get<T>(key: string): T | undefined {'
    );
  }
]);

// Fix dateUtils.ts - nested export
fixFile('src/utils/dateUtils.ts', [
  (content) => {
    const lines = content.split('\n');
    let inFunction = false;
    let braceCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('export') && (lines[i].includes('function') || lines[i].includes('const')) && !inFunction) {
        inFunction = true;
        braceCount = 0;
      }
      
      if (inFunction) {
        braceCount += (lines[i].match(/\{/g) || []).length;
        braceCount -= (lines[i].match(/\}/g) || []).length;
        
        if (braceCount === 0 && (lines[i].includes('}') || lines[i].includes(';'))) {
          inFunction = false;
        }
        
        // Remove nested export
        if (braceCount > 0 && lines[i].trim().startsWith('export')) {
          lines[i] = lines[i].replace(/^\s*export\s+/, '  ');
        }
      }
    }
    
    return lines.join('\n');
  }
]);

// Fix unifiedDataService.ts - object syntax
fixFile('src/services/unifiedDataService.ts', [
  (content) => {
    return content.replace(
      /sourcePriority: \['youtube'\] \};/,
      "sourcePriority: ['youtube'] }"
    );
  }
]);

// Fix useEnhancedQuery.ts - nested export
fixFile('src/hooks/useEnhancedQuery.ts', [
  (content) => {
    const lines = content.split('\n');
    let inFunction = false;
    let braceCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('export function') && !inFunction) {
        inFunction = true;
        braceCount = 0;
      }
      
      if (inFunction) {
        braceCount += (lines[i].match(/\{/g) || []).length;
        braceCount -= (lines[i].match(/\}/g) || []).length;
        
        if (braceCount === 0 && lines[i].includes('}')) {
          inFunction = false;
        }
        
        // Remove nested export
        if (braceCount > 0 && lines[i].trim().startsWith('export')) {
          lines[i] = lines[i].replace(/^\s*export\s+/, '  ');
        }
      }
    }
    
    return lines.join('\n');
  }
]);

// Fix videoService.ts - parameter syntax
fixFile('src/features/video/services/videoService.ts', [
  (content) => {
    return content.replace(
      /async getRecommendedVideos\(,\s*videoId: any,/,
      'async getRecommendedVideos(\n    videoId: any,'
    );
  }
]);

console.log('\n✨ Fix complete!');
console.log(`📝 Fixed ${fixedFiles.length} files:`, fixedFiles.join(', '));
