import { createBrowserRouter, RouterProvider, BrowserRouter, Route, Link, NavLink, useNavigate } from 'react-router-dom';
#!/usr/bin/env node
/**
 * Simple TS2339 Error Fixer
 * Applies conservative fixes for TS2339 errors
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class SimpleTS2339Fixer {
  constructor() {
    this.fixedFiles = new Set();
    this.fixedCount = 0;
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '🔧';
    console.log(colors[type] + prefix + ' ' + message + colors.reset);
  }

  getErrors() {
    try {
      execSync('npm run type-check', {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: projectRoot
      });
      return [];
    } catch (error) {
      const output = error.stdout + error.stderr;
      const errors = [];
      const lines = output.split('\n');
      
      for (const line of lines) {
        const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS2339: (.+)$/);
        if (match) {
          const [, filePath, lineNum, colNum, message] = match;
          errors.push({
            file: filePath,
            line: parseInt(lineNum),
            column: parseInt(colNum),
            message
          });
        }
      }
      
      return errors.slice(0, 20); // Limit to 20 errors per run
    }
  }

  async fixBasicImports(filePath, content) {
    let newContent = content;
    let fixed = false;

    // Add basic React imports if missing
    const commonImports = [
      { check: /\buseState\b/, import: "import { useState } from 'react';" },
      { check: /\buseEffect\b/, import: "import { useEffect } from 'react';" },
      { check: /\buseCallback\b/, import: "import { useCallback } from 'react';" },
      { check: /\buseMemo\b/, import: "import { useMemo } from 'react';" },
      { check: /\buseRef\b/, import: "import { useRef } from 'react';" },
      { check: /\buseContext\b/, import: "import { useContext } from 'react';" },
      { check: /\bReact\b/, import: "import React from 'react';" },
      { check: /\buseNavigate\b/, import: "import { useNavigate } from 'react-router-dom';" },
      { check: /\bLink\b/, import: "import { Link } from 'react-router-dom';" },
      { check: /\bNavLink\b/, import: "import { NavLink } from 'react-router-dom';" },
      { check: /\bOutlet\b/, import: "import { Outlet } from 'react-router-dom';" },
      { check: /\bcreateBrowserRouter\b/, import: "import { createBrowserRouter } from 'react-router-dom';" },
      { check: /\bRouterProvider\b/, import: "import { RouterProvider } from 'react-router-dom';" }
    ];

    for (const importRule of commonImports) {
      if (importRule.check.test(newContent) && !newContent.includes(importRule.import)) {
        const lines = newContent.split('\n');
        let insertIndex = 0;
        
        // Find the right place to insert (after existing imports)
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ') || lines[i].startsWith('//') || lines[i].trim() === '') {
            insertIndex = i + 1;
          } else {
            break;
          }
        }
        
        lines.splice(insertIndex, 0, importRule.import);
        newContent = lines.join('\n');
        fixed = true;
      }
    }

    return { content: newContent, fixed };
  }

  async fixError(error) {
    const filePath = join(projectRoot, error.file);
    
    if (!existsSync(filePath)) {
      this.log('File not found: ' + error.file, 'warning');
      return false;
    }

    try {
      const content = readFileSync(filePath, 'utf8');
      
      // Apply appropriate fixes based on error code
      let result = { content, fixed: false };
      
      if ('2339' === '2304') {
        result = await this.fixBasicImports(filePath, content);
      } else if ('2339' === '7006') {
        // Add simple any type annotations
        let newContent = content;
        const lines = newContent.split('\n');
        if (error.line <= lines.length) {
          const line = lines[error.line - 1];
          if (line.includes('(') && line.includes(')') && !line.includes(': any')) {
            lines[error.line - 1] = line.replace(/\(([^):]+)\)/g, '($1: any)');
            newContent = lines.join('\n');
            result = { content: newContent, fixed: true };
          }
        }
      } else if ('2339' === '6133') {
        // Remove simple unused variables (conservative)
        let newContent = content;
        const unusedMatch = error.message.match(/'([^']+)' is declared but its value is never read/);
        if (unusedMatch) {
          const unusedName = unusedMatch[1];
          newContent = newContent.replace(new RegExp('import\\s+' + unusedName + '\\s+from[^;]+;\\s*', 'g'), '');
          newContent = newContent.replace(new RegExp(',\\s*' + unusedName + '\\s*', 'g'), '');
          newContent = newContent.replace(new RegExp(unusedName + '\\s*,\\s*', 'g'), '');
          if (newContent !== content) {
            result = { content: newContent, fixed: true };
          }
        }
      }
      
      if (result.fixed) {
        writeFileSync(filePath, result.content);
        this.fixedFiles.add(error.file);
        this.fixedCount++;
        this.log('Fixed TS2339 in ' + error.file);
        return true;
      }
      
      return false;
    } catch (err) {
      this.log('Error fixing ' + error.file + ': ' + err.message, 'error');
      return false;
    }
  }

  async run() {
    this.log('🚀 Starting simple TS2339 fixes...');
    
    const errors = this.getErrors();
    
    if (errors.length === 0) {
      this.log('✨ No TS2339 errors found!', 'success');
      return;
    }

    this.log('Found ' + errors.length + ' TS2339 errors to fix');

    let totalFixed = 0;
    for (const error of errors) {
      const fixed = await this.fixError(error);
      if (fixed) {
        totalFixed++;
      }
    }

    this.log('\n📊 Summary:');
    this.log('• Fixed ' + totalFixed + ' errors');
    this.log('• Modified files: ' + this.fixedFiles.size);
    
    if (this.fixedFiles.size > 0) {
      this.log('• Fixed files: ' + Array.from(this.fixedFiles).join(', '));
    }
  }
}

// Execute if run directly
if (import.meta.url.endsWith('fix-ts2339-simple.js')) {
  const fixer = new SimpleTS2339Fixer();
  fixer.run().catch(console.error);
}

export { SimpleTS2339Fixer };
