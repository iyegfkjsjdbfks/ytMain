const fs = require('fs');
const path = require('path');

const fixes = [
  // Header.tsx fixes
  {
    file: 'components/Header.tsx',
    fixes: [
      // Fix malformed button tags and comments throughout
      {
        search: /\/\/ FIXED:\s+([^<\n]+)\s*\/>/g,
        replace: '$1>'
      },
      {
        search: /<button\s+\/>/g,
        replace: '<button'
      },
      // Fix specific button issues
      {
        search: `<button
 ref={userMenuButtonRef} />
// FIXED:  onClick={(e: any) => toggleUserMenu(e)}
// FIXED:  className={\`p-1.5 rounded-full transition-colors \${isUserMenuOpen ? 'bg-neutral-300 dark:bg-neutral-700' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700/80'}\`}
// FIXED:  aria-label="User account options"
// FIXED:  aria-expanded={isUserMenuOpen}
// FIXED:  aria-haspopup="true"
// FIXED:  aria-controls="user-menu"
// FIXED:  id="user-menu-button"
 title="Your Account"
 >`,
        replace: `<button
 ref={userMenuButtonRef}
 onClick={toggleUserMenu}
 className={\`p-1.5 rounded-full transition-colors \${isUserMenuOpen ? 'bg-neutral-300 dark:bg-neutral-700' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700/80'}\`}
 aria-label="User account options"
 aria-expanded={isUserMenuOpen}
 aria-haspopup="true"
 aria-controls="user-menu"
 id="user-menu-button"
 title="Your Account"
 >`
      },
      {
        search: `<Button
 variant="secondary"
 size="sm"
// FIXED:  className="text-blue-600 border border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20" />
 >`,
        replace: `<Button
 variant="secondary"
 size="sm"
 className="text-blue-600 border border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20"
 >`
      },
      // Fix closing tags
      {
        search: /\/\/ FIXED:\s+<\/(\w+)>/g,
        replace: '</$1>'
      },
      // Fix missing closing braces
      {
        search: 'setIsCreateMenuOpen(false);\n};',
        replace: 'setIsCreateMenuOpen(false);\n }\n };'
      },
      {
        search: 'setIsNotificationsPanelOpen(false);\n};',
        replace: 'setIsNotificationsPanelOpen(false);\n }\n };'
      },
      // Fix more button issues
      {
        search: `<button />
// FIXED:  onClick={(e: any) => toggleSidebar(e)}
// FIXED:  className="p-1.5 sm:p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700/80 mr-1 sm:mr-3 text-neutral-700 dark:text-neutral-100 transition-colors"
// FIXED:  aria-label="Toggle sidebar menu"
 title="Menu"
 >`,
        replace: `<button
 onClick={toggleSidebar}
 className="p-1.5 sm:p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700/80 mr-1 sm:mr-3 text-neutral-700 dark:text-neutral-100 transition-colors"
 aria-label="Toggle sidebar menu"
 title="Menu"
 >`
      },
      {
        search: `<button
 ref={createButtonRef} />
// FIXED:  onClick={(e: any) => toggleCreateMenu(e)}`,
        replace: `<button
 ref={createButtonRef}
 onClick={toggleCreateMenu}`
      },
      // Fix CreateMenuItem issues
      {
        search: `<CreateMenuItem />
 icon={<LightBulbIcon />}
 to="/ai-content-spark"
// FIXED:  onClick={(e: any) => handleCloseCreateMenu(e)}
 >`,
        replace: `<CreateMenuItem
 icon={<LightBulbIcon />}
 to="/ai-content-spark"
 onClick={handleCloseCreateMenu}
 >`
      },
      // Fix closing div tag at end
      {
        search: `handleCloseUserMenu={handleCloseUserMenu} />
 />
// FIXED:  </div>`,
        replace: `handleCloseUserMenu={handleCloseUserMenu}
 />
 </div>`
      },
      // Remove misplaced comments and fix structure
      {
        search: /\/\/ FIXED:\s+/g,
        replace: ''
      }
    ]
  },
  // MinimizedSidebar.tsx fixes
  {
    file: 'components/MinimizedSidebar.tsx',
    fixes: [
      {
        search: ` title={title || label}
// FIXED:  className={\`flex flex-col items-center justify-center p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors duration-150 group min-h-[64px]
 \${isActive ? 'bg-neutral-200 dark:bg-neutral-800 font-medium text-neutral-900 dark:text-neutral-50' : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100'}\`}
// FIXED:  aria-current={isActive ? 'page' : undefined} />
 >`,
        replace: ` title={title || label}
 className={\`flex flex-col items-center justify-center p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors duration-150 group min-h-[64px] \${isActive ? 'bg-neutral-200 dark:bg-neutral-800 font-medium text-neutral-900 dark:text-neutral-50' : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100'}\`}
 aria-current={isActive ? 'page' : undefined}
 >`
      }
    ]
  },
  // Miniplayer.tsx fixes
  {
    file: 'components/Miniplayer.tsx',
    fixes: [
      {
        search: `// FIXED:  className="w-[160px] aspect-video block flex-shrink-0 group relative bg-black"
// FIXED:  aria-label={\`Maximize video: \${video.title}\`}
 title={\`Maximize: \${video.title}\`}
 >`,
        replace: ` className="w-[160px] aspect-video block flex-shrink-0 group relative bg-black"
 aria-label={\`Maximize video: \${video.title}\`}
 title={\`Maximize: \${video.title}\`}
 >`
      }
    ]
  },
  // Sidebar.tsx fixes
  {
    file: 'components/Sidebar.tsx',
    fixes: [
      {
        search: ` title={title || label}
// FIXED:  className={\`flex items-center px-3 py-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors duration-150 group 
 \${isActive ? 'bg-neutral-200 dark:bg-neutral-800 font-medium text-neutral-900 dark:text-neutral-50' : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100'}\`}
// FIXED:  aria-current={isActive ? 'page' : undefined} />
 >`,
        replace: ` title={title || label}
 className={\`flex items-center px-3 py-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors duration-150 group \${isActive ? 'bg-neutral-200 dark:bg-neutral-800 font-medium text-neutral-900 dark:text-neutral-50' : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100'}\`}
 aria-current={isActive ? 'page' : undefined}
 >`
      }
    ]
  },
  // CategoryChips.tsx fixes
  {
    file: 'components/CategoryChips.tsx',
    fixes: [
      {
        search: `// FIXED:  className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-2 px-10 sm:px-12"
// FIXED:  style={{ scrollbarWidth: 'none',
 msOverflowStyle: 'none' } />
 >`,
        replace: ` className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-2 px-10 sm:px-12"
 style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
 >`
      }
    ]
  },
  // HoverAutoplayVideoCard.tsx - remove declare keyword
  {
    file: 'components/HoverAutoplayVideoCard.tsx',
    fixes: [
      {
        search: 'declare const HoverAutoplayVideoCard',
        replace: 'const HoverAutoplayVideoCard'
      }
    ]
  },
  // OptimizedMiniplayerContext.tsx - fix return outside function
  {
    file: 'contexts/OptimizedMiniplayerContext.tsx',
    fixes: [
      {
        search: `}
  }
  return context;
};`,
        replace: `  }
  return context;
};`
      }
    ]
  },
  // settingsService.ts - fix object syntax
  {
    file: 'services/settingsService.ts',
    fixes: [
      {
        search: `  youtubePlayer: 'youtube-player-wrapper',
  localPlayer: 'advanced-video-player',
  defaultCategory: 'youtube' } };`,
        replace: `  youtubePlayer: 'youtube-player-wrapper',
  localPlayer: 'advanced-video-player',
  defaultCategory: 'youtube'
 }
};`
      }
    ]
  }
];

function applyFixes() {
  console.log('Starting comprehensive syntax error fixes...');
  
  fixes.forEach(({ file, fixes: fileFixes }) => {
    const filePath = path.join(__dirname, '..', file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${file} - file not found`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changesMade = false;
    
    fileFixes.forEach(fix => {
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
      console.log(`✓ Fixed ${file}`);
    } else {
      console.log(`No changes needed for ${file}`);
    }
  });
  
  console.log('Syntax error fixes complete!');
}

applyFixes();
