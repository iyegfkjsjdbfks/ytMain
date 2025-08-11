#!/usr/bin/env node
/**
 * Targeted fixer for utils/performance.ts and related DOM property access issues
 */

import fs from 'fs';
import path from 'path';

const root = process.cwd();

function apply(file, transforms) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) return false;
  let s = fs.readFileSync(p, 'utf8');
  const before = s;
  for (const [pattern, replacement] of transforms) {
    s = s.replace(pattern, replacement);
  }
  if (s !== before) {
    fs.writeFileSync(p, s, 'utf8');
    console.log('Updated', file);
    return true;
  }
  return false;
}

// utils/performance.ts fixes
apply('utils/performance.ts', [
  [/declare const React;/g, 'import React from "react";'],
  [/\(\.\.\.args\) \=>/g, '(...args: any[]) =>'],
  [/\bsrc\b(?=\s*&&)/g, 'src as any'],
  [/\bhref\b(?=\s*&&)/g, 'href as any'],
]);

// utils/imageUtils.ts fixes
apply('utils/imageUtils.ts', [
  [/\{ \[key\]: string \}/g, '{ [key: string]: string }'],
  [/new IntersectionObserver\(callback/g, 'new IntersectionObserver((entries: IntersectionObserverEntry[]) => callback(entries)'],
]);

console.log('Performance/DOM targeted fixes applied.');

