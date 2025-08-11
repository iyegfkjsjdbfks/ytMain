#!/usr/bin/env node
/**
 * Repair malformed import statements produced by duplicate import deduper.
 * Patterns seen:
 *  - import useRef }, { useEffect } from 'react';
 *  - import useLocation }, { useNavigate } from 'react-router-dom';
 *  - import useEffect, { useState } from 'react'; (should be named-only)
 * Strategy:
 *  - Detect lines with '}, {' pattern and rebuild as named list
 *  - Detect default identifier that is actually a hook (useX / useEffect) followed by named block; merge into single named import
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const exts = ['.ts', '.tsx'];

function walk(dir, acc=[]) {
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e.startsWith('.')) continue;
    const full = join(dir, e);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc); else if (exts.some(x=> full.endsWith(x))) acc.push(full);
  }
  return acc;
}

const malformedPattern = /^import\s+([A-Za-z_$][\w$]*)\s*},\s*\{\s*([^}]*)\}\s*from\s+(['"][^'"]+['"]);?$/;
const defaultPlusNamed = /^import\s+([A-Za-z_$][\w$]*)\s*,\s*\{\s*([^}]*)\}\s*from\s+(['"][^'"]+['"]);?$/;

let fixes = 0;
for (const file of walk(root)) {
  let text = readFileSync(file,'utf8');
  if (!text.includes('import')) continue;
  const lines = text.split(/\n/);
  let changed = false;
  for (let i=0;i<lines.length;i++) {
    let line = lines[i];
    let m;
    if ((m = line.match(malformedPattern))) {
      const first = m[1];
      const rest = m[2].split(',').map(s=>s.trim()).filter(Boolean);
      const source = m[3];
      const names = [first, ...rest];
      const rebuilt = `import { ${Array.from(new Set(names)).join(', ')} } from ${source};`;
      lines[i] = rebuilt;
      changed = true; fixes++; continue;
    }
    if ((m = line.match(defaultPlusNamed))) {
      const def = m[1];
      const rest = m[2].split(',').map(s=>s.trim()).filter(Boolean);
      const source = m[3];
      // If default looks like a hook/useSomething or useEffect etc, treat as named
      if (/^use[A-Z0-9_]/.test(def) || def === 'useEffect' || def === 'useState') {
        const names = [def, ...rest];
        lines[i] = `import { ${Array.from(new Set(names)).join(', ')} } from ${source};`;
        changed = true; fixes++; continue;
      }
    }
  }
  if (changed) {
    writeFileSync(file, lines.join('\n'),'utf8');
    console.log('Fixed malformed imports in', file);
  }
}
console.log(`Fixed ${fixes} malformed import lines`);
