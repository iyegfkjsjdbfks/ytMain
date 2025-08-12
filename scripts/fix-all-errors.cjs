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

// Fix OptimizedMiniplayerContext.tsx
fixFile('contexts/OptimizedMiniplayerContext.tsx', [
  (content) => {
    // Fix the return statement outside function
    const lines = content.split('\n');
    let fixedLines = [];
    let inFunction = false;
    let braceCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if we're entering a function
      if (line.includes('export const useMiniplayerVisibility')) {
        inFunction = true;
        braceCount = 0;
      }
      
      if (inFunction) {
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;
        
        if (braceCount === 0 && line.includes('}')) {
          inFunction = false;
        }
      }
      
      // Fix orphaned code after function
      if (!inFunction && i > 0 && lines[i-1].includes('}') && 
          (line.includes('const { state }') || line.includes('return {'))) {
        // Skip these orphaned lines
        continue;
      }
      
      fixedLines.push(line);
    }
    
    return fixedLines.join('\n');
  }
]);

// Fix Header.tsx
fixFile('components/Header.tsx', [
  (content) => {
    // Fix the button element with missing closing >
    return content
      .replace(/role="menuitem"\s*\n\s*{\s*content}/g, 'role="menuitem">\n    {content}')
      .replace(/role="menuitem"\s+{/g, 'role="menuitem">\n    {');
  }
]);

// Fix Miniplayer.tsx
fixFile('components/Miniplayer.tsx', [
  (content) => {
    // Remove comment lines that break JSX
    return content
      .replace(/\/\/ FIXED:.*$/gm, '')
      .replace(/^\s*title={video\.title}\s*$/m, '')
      .replace(/^\s*>\s*$/m, '')
      .replace(/^\s*{video\.title}\s*$/m, '');
  }
]);

// Fix settingsService.ts
fixFile('services/settingsService.ts', [
  (content) => {
    // Fix the object closing and export placement
    const lines = content.split('\n');
    let fixedLines = [];
    let inObject = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Fix the defaultCategory line
      if (line.includes("defaultCategory: 'youtube' },")) {
        fixedLines.push("  defaultCategory: 'youtube'");
        fixedLines.push("};");
        continue;
      }
      
      // Skip malformed export inside object
      if (line.includes('export const VIDEO_PLAYER_CONFIGS') && i > 0 && !lines[i-1].includes('}')) {
        fixedLines.push('');
        fixedLines.push(line);
        continue;
      }
      
      fixedLines.push(line);
    }
    
    return fixedLines.join('\n');
  }
]);

// Fix FireIcon.tsx
fixFile('components/icons/FireIcon.tsx', [
  (content) => {
    // Fix fragment and closing tags
    return content
      .replace(/<\/><\/>/g, '')
      .replace(/\/>\s*\/>/g, '/>')
      .replace(/(<path[^>]*\/>)\s*(<\/svg>)/g, '$1\n$2');
  }
]);

// Fix HomeIcon.tsx  
fixFile('components/icons/HomeIcon.tsx', [
  (content) => {
    // Ensure path is properly closed and svg is closed
    const lines = content.split('\n');
    let fixedLines = [];
    let inSvg = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('<svg')) {
        inSvg = true;
      }
      
      // Skip duplicate </svg> tags
      if (line.trim() === '</svg>' && i > 0 && lines[i-1].includes('/>')) {
        if (!inSvg) continue;
        inSvg = false;
      }
      
      fixedLines.push(line);
    }
    
    return fixedLines.join('\n');
  }
]);

// Fix ImageWithFallback.tsx
fixFile('components/ImageWithFallback.tsx', [
  (content) => {
    // Fix useMemo closing
    return content.replace(
      /return `https:\/\/picsum\.photos\/\$\{width\}\/\$\{height\}\?random=\$\{Math\.floor\(Math\.random\(\) \* 1000\)\}`;[\s\n]*\}, \[fallbackSrc, src, width, height\]\);/g,
      'return `https://picsum.photos/${width}/${height}?random=${Math.floor(Math.random() * 1000)}`;\n}, [fallbackSrc, src, width, height]);'
    );
  }
]);

// Fix useFormState.ts
fixFile('src/hooks/useFormState.ts', [
  (content) => {
    // Fix the callback closing
    return content.replace(
      /setIsSubmitting\(false\);\s*}\s*}, \[values, validate, onSubmit\]/g,
      'setIsSubmitting(false);\n    }\n  }, [values, validate, onSubmit]'
    );
  }
]);

// Fix useTrendingSearch.ts
fixFile('src/hooks/useTrendingSearch.ts', [
  (content) => {
    // Remove nested export
    const lines = content.split('\n');
    let inFunction = false;
    let braceCount = 0;
    
    return lines.map((line, i) => {
      if (line.includes('function') && (line.includes('export') || lines[i-1]?.includes('export'))) {
        inFunction = true;
        braceCount = 0;
      }
      
      if (inFunction) {
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;
        
        if (braceCount === 0 && line.includes('}')) {
          inFunction = false;
        }
        
        // Remove nested export
        if (braceCount > 0 && line.trim().startsWith('export')) {
          return line.replace(/^\s*export\s+/, '  ');
        }
      }
      
      return line;
    }).join('\n');
  }
]);

// Fix useLocalStorage.ts
fixFile('src/hooks/useLocalStorage.ts', [
  (content) => {
    // Fix function parameter syntax
    return content.replace(
      /export function useLocalStorageWithExpiry<T>\(,/g,
      'export function useLocalStorageWithExpiry<T>('
    );
  }
]);

// Fix youtube-utils.ts
fixFile('src/lib/youtube-utils.ts', [
  (content) => {
    // Fix the closing bracket
    return content.replace(
      /originalCallback\(\);\s*};\s*}\);/g,
      'originalCallback();\n    };\n  });'
    );
  }
]);

// Fix useWatchPage.ts
fixFile('src/hooks/useWatchPage.ts', [
  (content) => {
    // Fix orphaned catch block
    return content.replace(
      /setAllRelatedVideos\(related\);\s*} catch \(error: any\) {/g,
      'setAllRelatedVideos(related);\n  } catch (error: any) {'
    );
  }
]);

// Fix useDropdownMenu.ts
fixFile('src/hooks/useDropdownMenu.ts', [
  (content) => {
    // Fix closing bracket
    return content.replace(
      /return undefined;\s*}, \[isOpen\]\);/g,
      'return undefined;\n}, [isOpen]);'
    );
  }
]);

// Fix utils.ts
fixFile('src/lib/utils.ts', [
  (content) => {
    // Fix function parameter
    return content.replace(
      /function formatDate\(,/g,
      'function formatDate('
    );
  }
]);

// Fix useDebounce.ts
fixFile('src/hooks/useDebounce.ts', [
  (content) => {
    // Fix closing bracket
    return content.replace(
      /clearTimeout\(timeoutRef\.current\);\s*};\s*}, \[\]\);/g,
      'clearTimeout(timeoutRef.current);\n    };\n}, []);'
    );
  }
]);

// Fix useVideosData.ts
fixFile('src/hooks/useVideosData.ts', [
  (content) => {
    // Fix else block placement
    return content.replace(
      /return response\.data;\s*} else {/g,
      'return response.data;\n  } else {'
    );
  }
]);

// Fix useVideoPlayer.ts
fixFile('src/hooks/useVideoPlayer.ts', [
  (content) => {
    // Fix event listener syntax
    return content.replace(
      /addEventListener\('enterpictureinpicture', \( as EventListener\)/g,
      "addEventListener('enterpictureinpicture', (()"
    );
  }
]);

// Fix useOptimizedVideoData.ts
fixFile('src/hooks/useOptimizedVideoData.ts', [
  (content) => {
    // Fix catch block
    return content.replace(
      /timestamp: Date\.now\(\) \}\);\s*}\s*} catch \(err: any\) {/g,
      'timestamp: Date.now() });\n    }\n  } catch (err: any) {'
    );
  }
]);

// Fix unifiedHooks.ts
fixFile('src/hooks/unifiedHooks.ts', [
  (content) => {
    // Fix function parameter
    return content.replace(
      /export function useApi<T>\(,/g,
      'export function useApi<T>('
    );
  }
]);

// Fix useApi.ts
fixFile('src/hooks/unified/useApi.ts', [
  (content) => {
    // This appears to be a class method, should be fine as is
    return content;
  }
]);

// Fix useEnhancedQuery.ts
fixFile('src/hooks/useEnhancedQuery.ts', [
  (content) => {
    // Remove nested export
    const lines = content.split('\n');
    let inFunction = false;
    let braceCount = 0;
    
    return lines.map((line, i) => {
      if (line.includes('export function') && !inFunction) {
        inFunction = true;
        braceCount = 0;
      }
      
      if (inFunction) {
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;
        
        if (braceCount === 0 && line.includes('}')) {
          inFunction = false;
        }
        
        // Remove nested export
        if (braceCount > 0 && line.trim().startsWith('export')) {
          return line.replace(/^\s*export\s+/, '  ');
        }
      }
      
      return line;
    }).join('\n');
  }
]);

// Fix dateUtils.ts
fixFile('src/utils/dateUtils.ts', [
  (content) => {
    // Fix function parameter
    return content.replace(
      /const formatDate: any = \(,/g,
      'const formatDate: any = ('
    );
  }
]);

// Fix unifiedDataService.ts
fixFile('src/services/unifiedDataService.ts', [
  (content) => {
    // Fix missing closing brace before export
    const lines = content.split('\n');
    let fixedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Add missing closing brace before export interface
      if (line.includes('export interface UnifiedSearchFilters') && 
          i > 0 && !lines[i-1].includes('}')) {
        fixedLines.push('}');
        fixedLines.push('');
      }
      
      fixedLines.push(line);
    }
    
    return fixedLines.join('\n');
  }
]);

// Fix videoService.ts
fixFile('src/features/video/services/videoService.ts', [
  (content) => {
    // Fix async method syntax
    return content
      .replace(/async getVideoInteractions/g, 'async getVideoInteractions')
      .replace(/async getRecommendedVideos\(\s*videoId/g, 'async getRecommendedVideos(videoId');
  }
]);

console.log('\n✨ Fix complete!');
console.log(`📝 Fixed ${fixedFiles.length} files:`, fixedFiles.join(', '));
