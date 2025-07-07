#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Find all TypeScript React files
const files = glob.sync('**/*.{tsx,ts}', {
  ignore: ['node_modules/**', 'dist/**', 'build/**']
});

let fixedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Pattern to match duplicate React imports
  const duplicateReactImportPattern = /import type React from 'react';\s*\n\s*import\s*{([^}]+)}\s*from\s*'react';/g;
  
  // Replace with single import
  const newContent = content.replace(duplicateReactImportPattern, (match, hooks) => {
    return `import React, {${hooks}} from 'react';`;
  });
  
  if (newContent !== content) {
    fs.writeFileSync(file, newContent);
    console.log(`Fixed ${file}`);
    fixedCount++;
  }
});

console.log(`Fixed ${fixedCount} files with duplicate React imports`);
