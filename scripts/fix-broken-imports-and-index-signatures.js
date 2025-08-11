#!/usr/bin/env node
/**
 * Bulk fixer for common syntax breakages:
 * - Replace "[: string]" with "[key: string]"
 * - Fix broken mixed type/value imports like:
 *   import type { A }, { B } from 'mod';
 *   -> import type { A } from 'mod';\nimport { B } from 'mod';
 * - Fix broken imports missing closing brace:
 *   import type { A from 'mod'; -> import type { A } from 'mod';
 * - Fix broken dual-brace imports where first identifier lost brace:
 *   import X }, { Y } from 'mod'; -> import { X, Y } from 'mod';
 * - Fix broken single missing brace:
 *   import { X from 'mod'; -> import { X } from 'mod';
 * - Fix invalid wildcard + named imports:
 *   import type *, { Y } from 'mod'; -> import { Y } from 'mod';
 *   import *, { Y } from 'mod'; -> import { Y } from 'mod';
 */

import fs from 'fs';
import path from 'path';

const exts = new Set(['.ts', '.tsx']);

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip node_modules and dist
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') continue;
      yield* walk(full);
    } else if (exts.has(path.extname(entry.name))) {
      yield full;
    }
  }
}

function fixFile(file) {
  let src = fs.readFileSync(file, 'utf8');
  const before = src;

  // 1) Index signature: [: string] -> [key: string]
  src = src.replace(/\[:\s*string\]/g, '[key: string]');

  // 2) import type { A }, { B } from 'mod';
  src = src.replace(/import\s+type\s+\{\s*([^}]+?)\s*\}\s*,\s*\{\s*([^}]+?)\s*\}\s+from\s+(['"][^'"]+['"])\s*;/g,
    (m, typeNames, valueNames, mod) => `import type { ${typeNames.trim()} } from ${mod};\nimport { ${valueNames.trim()} } from ${mod};`);

  // 3) import type { A from 'mod';  -> add missing }
  src = src.replace(/import\s+type\s+\{\s*([^}]+?)\s+from\s+(['"][^'"]+['"])\s*;/g,
    (m, names, mod) => `import type { ${names.trim()} } from ${mod};`);

  // 4) import X }, { Y } from 'mod';  -> import { X, Y } from 'mod';
  src = src.replace(/import\s+([A-Za-z_$][\w$\s,]*)\}\s*,\s*\{\s*([^}]+?)\s*\}\s+from\s+(['"][^'"]+['"])\s*;/g,
    (m, first, second, mod) => {
      const names = first.split(',').map(s => s.trim()).filter(Boolean).join(', ');
      return `import { ${names}, ${second.trim()} } from ${mod};`;
    });

  // 5) import { X from 'mod'; -> import { X } from 'mod';
  src = src.replace(/import\s+\{\s*([^}]+?)\s+from\s+(['"][^'"]+['"])\s*;/g,
    (m, names, mod) => `import { ${names.trim()} } from ${mod};`);

  // 6) import type *, { Y } from 'mod'; -> import { Y } from 'mod';
  src = src.replace(/import\s+type\s*\*,\s*\{\s*([^}]+?)\s*\}\s+from\s+(['"][^'"]+['"])\s*;/g,
    (m, names, mod) => `import { ${names.trim()} } from ${mod};`);

  // 7) import \*, { Y } from 'mod'; -> import { Y } from 'mod';
  src = src.replace(/import\s*\*,\s*\{\s*([^}]+?)\s*\}\s+from\s+(['"][^'"]+['"])\s*;/g,
    (m, names, mod) => `import { ${names.trim()} } from ${mod};`);

  if (src !== before) {
    fs.writeFileSync(file, src, 'utf8');
    console.log('Fixed', file);
    return true;
  }
  return false;
}

const root = process.cwd();
let count = 0;
for (const file of walk(root)) {
  count += fixFile(file) ? 1 : 0;
}
console.log(`Completed. Files updated: ${count}`);

