#!/usr/bin/env node
/**
 * Fixer: Address common TS2300 duplicate identifier errors from repeated import declarations.
 * Strategy: Detect repeated identical import lines from same source and collapse to one; merge named specifiers.
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

const importRegex = /^import\s+([^;]+?)\s+from\s+['"]([^'"]+)['"];?$/gm;

for (const file of walk(root)) {
  let code = readFileSync(file, 'utf8');
  if (!/TS2300|import\s+/.test(code)) continue; // heuristic to limit
  const lines = code.split(/\n/);
  const importsBySource = new Map();
  const indexesToRemove = new Set();
  lines.forEach((line, idx) => {
    const m = line.match(/^import\s+(.+?)\s+from\s+['"]([^'"]+)['"];?$/);
    if (!m) return;
    const [, clause, src] = m;
    if (!importsBySource.has(src)) importsBySource.set(src, { default: null, named: new Set(), side: false, firstIndex: idx });
    const entry = importsBySource.get(src);
    // Parse clause patterns
    if (clause === "'" || clause === '"') return;
    if (/^['"].+['"]$/.test(clause)) { entry.side = true; return; }
    const defaultAndNamed = clause.split(/,/);
    defaultAndNamed.forEach(seg => {
      seg = seg.trim();
      if (!seg) return;
      if (seg.startsWith('{')) {
        seg.replace(/[{}]/g,'').split(',').forEach(n=> { const t=n.trim(); if(t) entry.named.add(t.split(/\sas\s/i)[0].trim()); });
      } else if (seg !== '* as') {
        if (!entry.default) entry.default = seg.split(/\s+as\s+/i)[0].trim(); else if (entry.default !== seg) { /* duplicate differing default ignore */ }
      }
    });
    if (idx !== entry.firstIndex) indexesToRemove.add(idx);
  });
  if (!indexesToRemove.size) continue;
  // Rebuild
  importsBySource.forEach((v, src) => {
    const rebuilt = [];
    if (v.side && !v.default && !v.named.size) {
      rebuilt.push(`import '${src}';`);
    } else {
      let clause = '';
      if (v.default) clause += v.default;
      if (v.named.size) {
        if (clause) clause += ', ';
        clause += '{ ' + Array.from(v.named).sort().join(', ') + ' }';
      }
      rebuilt.push(`import ${clause} from '${src}';`);
    }
    lines[v.firstIndex] = rebuilt.join('\n');
  });
  const newLines = lines.filter((_,i)=> !indexesToRemove.has(i));
  if (newLines.join('\n') !== code) {
    writeFileSync(file, newLines.join('\n'), 'utf8');
    console.log('Deduplicated imports in', file);
  }
}
console.log('Duplicate import pass complete');
