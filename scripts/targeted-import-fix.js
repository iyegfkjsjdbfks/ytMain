#!/usr/bin/env node
/**
 * Targeted Import Fixer
 * 
 * Fixes specific broken import patterns from the refactoring
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

class TargetedImportFixer {
  constructor() {
    this.fixes = [];
  }

  log(message) {
    console.log(`✅ ${message}`);
    this.fixes.push(message);
  }

  fixFileImports(relativePath) {
    const fullPath = join(projectRoot, relativePath);
    if (!existsSync(fullPath)) return false;
    
    let content = readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Remove duplicate React imports
    content = content.replace(/import React from ['"]react['"];\s*\n/g, '');
    content = `import React from 'react';\n${content}`;
    
    // Fix broken import patterns
    content = content.replace(/import { import { ([^}]+) } from ([^;]+);/g, 'import { $1 } from $2;');
    content = content.replace(/import React from ["']react["'];\s*\nimport { ([^}]+)/g, 'import React from "react";\nimport { $1');
    
    // Fix multiline import destructuring
    content = content.replace(/import {\s*([^}]+),?\s*}\s*from\s*([^;]+);/g, (match, imports, from) => {
      const cleanImports = imports.split(',').map(imp => imp.trim()).filter(imp => imp).join(', ');
      return `import { ${cleanImports} } from ${from};`;
    });
    
    // Fix spread operator issues in TypeScript
    content = content.replace(/\.\.\.(\w+):\s*any\[\]/g, '...$1');
    
    // Fix optional chaining
    content = content.replace(/(\w+)\?\?\._(\w+)/g, '$1?.$2');
    
    if (content !== originalContent) {
      writeFileSync(fullPath, content);
      return true;
    }
    
    return false;
  }

  async run() {
    console.log('🚀 Running targeted import fixes...');
    
    // List of files with known import issues
    const filesToFix = [
      'src/components/mobile/MobileVideoPlayer.tsx',
      'src/components/unified/UnifiedVideoCard.tsx',
      'src/features/comments/components/CommentSection.tsx',
      'src/features/community/components/CommunityPost.tsx',
      'src/features/livestream/components/ComprehensiveLiveStudio.tsx',
      'src/features/livestream/components/LivePolls.tsx',
      'src/features/livestream/components/LiveQA.tsx',
      'src/features/livestream/components/LiveStreamStudio.tsx',
      'src/features/livestream/components/LiveStreamViewer.tsx',
      'src/features/livestream/components/MultiplatformStreaming.tsx',
      'src/features/livestream/components/StreamAnalyticsDashboard.tsx',
      'src/features/livestream/components/StreamManagementDashboard.tsx',
      'src/features/livestream/components/StreamScheduler.tsx',
      'src/features/livestream/components/StreamSettings.tsx',
      'src/features/livestream/components/SuperChatPanel.tsx',
      'src/features/notifications/components/NotificationCenter.tsx',
      'src/features/playlist/components/PlaylistCard.tsx',
      'src/features/playlist/components/PlaylistManager.tsx',
      'src/features/video/components/VideoPlayer.tsx',
      'src/hooks/useLiveStream.ts',
      'src/services/unifiedDataService.ts',
      'utils/advancedMonitoring.ts',
      'utils/componentOptimization.tsx',
      'utils/developmentWorkflow.ts'
    ];
    
    for (const filePath of filesToFix) {
      if (this.fixFileImports(filePath)) {
        this.log(`Fixed imports in ${filePath}`);
      }
    }
    
    // Run TypeScript check to see improvement
    try {
      execSync('npm run type-check', { 
        cwd: projectRoot, 
        stdio: 'pipe' 
      });
      this.log('TypeScript compilation now passes!');
    } catch (error) {
      console.log('⚠️ TypeScript compilation still has errors, but should be fewer now');
    }
    
    console.log(`🎉 Targeted fixes completed! Fixed ${this.fixes.length} issues`);
  }
}

const fixer = new TargetedImportFixer();
fixer.run().catch(console.error);