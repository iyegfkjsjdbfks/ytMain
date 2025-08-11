#!/usr/bin/env node
/**
 * Targeted fixer for utils/intelligentCodeMonitor.ts
 * - Ensure string[] types for improvements/regressions
 * - Normalize insights.files to string[] and adjust interface if needed
 * - Remove leading underscores from property names in objects
 */

import fs from 'fs';
import path from 'path';

const root = path.join(process.cwd());
const targetPath = path.join(root, 'utils', 'intelligentCodeMonitor.ts');

if (!fs.existsSync(targetPath)) {
  console.error('Target file not found:', targetPath);
  process.exit(1);
}

let src = fs.readFileSync(targetPath, 'utf8');

// 1) Fix type annotations for improvements/regressions in CodeQualityTrend interface
src = src.replace(/(improvements:\s*)string(\b)/, '$1string[]$2');
src = src.replace(/(regressions:\s*)string(\b)/, '$1string[]$2');

// 2) Normalize CodeReviewInsight.files to string[]
src = src.replace(/(files:\s*)string(\b)/, '$1string[]$2');

// 3) Remove accidental double-underscore properties in object literals: __id, __title, etc.
src = src.replace(/\b__([a-zA-Z_]+)/g, '$1');

fs.writeFileSync(targetPath, src, 'utf8');
console.log('Applied targeted fixes to', targetPath);

