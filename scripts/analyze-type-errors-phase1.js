#!/usr/bin/env node
/**
 * Phase 1 Type Error Analyzer
 * Reads ./type-errors.txt and produces categorized counts & representative samples.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const file = join(process.cwd(), 'type-errors.txt');
const out = join(process.cwd(), 'phase1-error-analysis.json');

const content = readFileSync(file, 'utf8');
const lines = content.split(/\r?\n/).filter(l => /error TS\d+:/.test(l));

const categories = {
  syntax: [/TS1005/, /TS1109/, /TS1128/, /TS1068/, /TS1144/, /TS1434/],
  unused: [/TS6133/],
  duplicate: [/TS2300/],
  missingName: [/TS2304/],
  missingModule: [/TS2307/],
  missingExport: [/TS2305/],
  typeAssign: [/TS2322/, /TS2345/, /TS2352/, /TS2353/, /TS2362/],
  property: [/TS2339/, /TS2551/, /TS7053/, /TS2488/],
  structure: [/TS2740/, /TS2739/],
  implicitAny: [/TS7006/, /TS7008/, /TS7019/, /TS7031/],
  narrowing: [/TS18048/],
  jsx: [/TS2786/, /TS2604/],
  other: []
};

function categorize(code){
  for (const [k, regs] of Object.entries(categories)) {
    if (regs.some(r => r.test(code))) return k;
  }
  return 'other';
}

const summary = {};
const samples = {};

for (const line of lines) {
  const match = line.match(/TS(\d+)/);
  if (!match) continue;
  const code = 'TS' + match[1];
  const category = categorize(code);
  summary[code] = (summary[code] || 0) + 1;
  samples[code] = samples[code] || line.trim();
}

// Aggregate per category
const categoryTotals = {};
for (const [code, count] of Object.entries(summary)) {
  const cat = categorize(code);
  categoryTotals[cat] = (categoryTotals[cat] || 0) + count;
}

const rootCauseHypotheses = {
  syntax: 'Likely residual malformed edits from automated scripts (placeholders, missing punctuation).',
  unused: 'Dead code / leftover imports from refactors.',
  duplicate: 'Multiple identical import/variable declarations (often multiple React imports).',
  missingName: 'Placeholders like elemName or variables removed during refactor; need declaration or removal.',
  missingModule: 'Incorrect import paths or deleted files.',
  missingExport: 'Imported symbol no longer exported; stale usage.',
  typeAssign: 'Union narrowing issues or incorrect field types in model interfaces.',
  property: 'Interfaces define singular object but code treats variable as array or richer shape.',
  structure: 'Model/interface mismatch: arrays defined as single object types.',
  implicitAny: 'Missing parameter / member annotations due to aggressive code insertion.',
  narrowing: 'Optional chaining or undefined risk not guarded.',
  jsx: 'Dynamic component values typed too loosely (ElementType confusion).',
  other: 'Miscellaneous.'
};

const result = { generatedAt: new Date().toISOString(), totalErrors: lines.length, perCode: summary, perCategory: categoryTotals, samples, rootCauseHypotheses };
writeFileSync(out, JSON.stringify(result, null, 2));
console.log(`Phase 1 analysis saved to ${out}`);
