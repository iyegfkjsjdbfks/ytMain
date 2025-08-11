#!/usr/bin/env node
/**
 * Fixer: Remove placeholder identifier 'elemName' injected in many component files.
 * Strategy: For import lines or top-level where 'elemName' appears, delete that token.
 * If a bare 'elemName' statement exists, remove the line.
 */
import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
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

let filesChanged = 0, totalEdits = 0;
for (const file of walk(join(root))) {
  let txt = readFileSync(file, 'utf8');
  if (!/elemName/.test(txt)) continue;
  const before = txt;
  // Remove occurrences inside import braces: { elemName, X }
  txt = txt.replace(/\{([^}]*?)elemName\s*,?/g, (m, inner)=> '{' + inner.replace(/elemName\s*,?\s*/,'') );
  // Remove standalone import of elemName
  txt = txt.replace(/,?\s*elemName\s+from\s+['"][^'"]+"?;?/g,'');
  // Remove simple declarations like const elemName = ... or let elemName = ... if right side is trivial placeholder
  txt = txt.replace(/(?:const|let|var)\s+elemName\s*=.*?;\n?/g,'');
  // Remove property shorthand usages in objects: elemName,
  txt = txt.replace(/\n\s*elemName,?\n/g,'\n');
  // Remove leftover identifier tokens alone
  txt = txt.replace(/\belemName\b/g,'');
  if (txt !== before) {
    writeFileSync(file, txt, 'utf8');
    filesChanged++; totalEdits++;
    console.log('Cleaned elemName in', file);
  }
}
console.log(`Removed placeholder 'elemName' in ${filesChanged} files.`);
