#!/usr/bin/env node
/**
 * Script to fix TS1160 unterminated template literal errors
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

class TemplateS1160Fixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
    this.processedFiles = 0;
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    const prefix = {
      info: '🔧',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type] || '🔧';
    
    console.log(`${colors[type]}${prefix} [${new Date().toISOString()}] ${message}${colors.reset}`);
  }

  getAllFiles(dir, extensions = ['.ts', '.tsx']) {
    const files = [];
    
    try {
      const items = readdirSync(dir);
      
      for (const item of items) {
        const fullPath = join(dir, item);
        
        try {
          const stat = statSync(fullPath);
          
          if (stat.isDirectory()) {
            if (!item.startsWith('.') && 
                !['node_modules', 'dist', 'build', 'coverage'].includes(item)) {
              files.push(...this.getAllFiles(fullPath, extensions));
            }
          } else if (extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        } catch (err) {
          // Skip files that can't be accessed
        }
      }
    } catch (err) {
      // Skip directories that can't be read
    }
    
    return files;
  }

  fixTemplateLiterals(content) {
    let fixed = content;
    let fixes = 0;

    // Check for unterminated template literals
    // Count opening and closing backticks
    const backtickCount = (content.match(/`/g) || []).length;
    
    if (backtickCount % 2 !== 0) {
      // Odd number of backticks means there's an unterminated template literal
      
      // Look for common patterns of incomplete template literals
      const lines = fixed.split('\n');
      let inTemplate = false;
      let templateStartLine = -1;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const backticks = (line.match(/`/g) || []).length;
        
        if (!inTemplate && backticks % 2 === 1) {
          // Starting a template literal
          inTemplate = true;
          templateStartLine = i;
        } else if (inTemplate && backticks % 2 === 1) {
          // Ending a template literal
          inTemplate = false;
          templateStartLine = -1;
        }
      }
      
      // If we're still in a template at the end, close it
      if (inTemplate && templateStartLine >= 0) {
        // Add a closing backtick to the last line
        if (lines[lines.length - 1].trim() === '') {
          // If the last line is empty, add the closing backtick on the previous line
          if (lines.length > 1) {
            lines[lines.length - 2] += '`';
          } else {
            lines[lines.length - 1] = '`';
          }
        } else {
          lines[lines.length - 1] += '`';
        }
        
        fixed = lines.join('\n');
        fixes++;
        this.log(`Fixed unterminated template literal starting at line ${templateStartLine + 1}`, 'info');
      }
    }

    // Also check for common malformed template patterns
    // Pattern: Template literal with improper escaping
    fixed = fixed.replace(/`([^`]*?)\\n([^`]*?)$/gm, (match, before, after) => {
      fixes++;
      return `\`${before}\\n${after}\``;
    });

    // Pattern: Template literal missing closing backtick at end of file
    if (fixed.endsWith('\n') && !fixed.trim().endsWith('`') && fixed.includes('`')) {
      const lastBacktickIndex = fixed.lastIndexOf('`');
      const afterLastBacktick = fixed.substring(lastBacktickIndex + 1);
      
      // If everything after the last backtick is just whitespace/newlines, close the template
      if (afterLastBacktick.trim() === '') {
        fixed = fixed.trim() + '`\n';
        fixes++;
        this.log('Added missing closing backtick at end of file', 'info');
      }
    }

    return { content: fixed, fixes };
  }

  processFile(filePath) {
    this.processedFiles++;
    
    try {
      const content = readFileSync(filePath, 'utf8');
      const { content: fixedContent, fixes } = this.fixTemplateLiterals(content);
      
      if (fixes > 0) {
        writeFileSync(filePath, fixedContent, 'utf8');
        this.fixedFiles++;
        this.totalFixes += fixes;
        this.log(`Fixed ${fixes} template literal issues in ${filePath.replace(process.cwd(), '.')}`, 'info');
      }
      
    } catch (err) {
      this.log(`Error processing ${filePath}: ${err.message}`, 'error');
    }
  }

  async run() {
    this.log('🚀 Starting TS1160 template literal fixes...');
    
    const files = this.getAllFiles(process.cwd());
    
    for (const file of files) {
      this.processFile(file);
    }
    
    this.log(`📁 Files processed: ${this.processedFiles}`);
    this.log(`🔧 Files fixed: ${this.fixedFiles}`);
    this.log(`✨ Total fixes applied: ${this.totalFixes}`);
    
    if (this.totalFixes > 0) {
      this.log(`🎉 Successfully fixed ${this.totalFixes} template literal errors!`, 'success');
    } else {
      this.log('No template literal errors found');
    }
  }
}

const fixer = new TemplateS1160Fixer();
fixer.run().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});