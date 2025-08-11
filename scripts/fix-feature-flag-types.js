#!/usr/bin/env node
/**
 * Targeted fixer for utils/featureFlagSystem.ts
 * - Aligns interfaces to array shapes where code uses array operations
 * - Normalizes some any/unknown types for flexibility
 * - Fixes optional chaining assignment on rolloutStrategy config
 * - Fixes typos _config -> config and strategy? -> _flag.rolloutStrategy?
 * - Fixes a few common declaration issues in the file
 */

import fs from 'fs';
import path from 'path';

const root = path.join(process.cwd());
const targetPath = path.join(root, 'utils', 'featureFlagSystem.ts');

if (!fs.existsSync(targetPath)) {
  console.error('Target file not found:', targetPath);
  process.exit(1);
}

let src = fs.readFileSync(targetPath, 'utf8');

// 1) Interface fixes: singular -> array types where code uses .length/.forEach/for..of
src = src
  // FeatureFlag
  .replace(/(\btargeting:\s*)TargetingRule\b/g, '$1TargetingRule[]')
  .replace(/(\bvariants\?:\s*)FlagVariant\b/g, '$1FlagVariant[]')
  .replace(/(\balertThresholds:\s*)AlertThreshold\b/g, '$1AlertThreshold[]')
  .replace(/(\btags:\s*)string\b/g, '$1string[]')
  // TargetingRule and related
  .replace(/(\bconditions:\s*)TargetingCondition\b/g, '$1TargetingCondition[]')
  // Generic value/defaultValue types to any for flexibility
  .replace(/\bdefaultValue\b(?=\s*[;=])/g, 'defaultValue: any')
  .replace(/(\bvalue\s*)(?=;)/g, 'value: any')
  // FlagEvaluation array history
  .replace(/(\bevaluationHistory:\s*)FlagEvaluation\b/g, '$1FlagEvaluation[]')
  // evaluationCache value typing
  .replace(/evaluationCache:\s*Map<[^>]*>\s*=\s*new Map\(/g, 'evaluationCache: Map<string, { value: any; expiry: number }> = new Map(');

// 2) Results type for A/B tests
src = src.replace(/const\s+results:\s*ABTestResult\s*=\s*\[\]/g, 'const results: ABTestResult[] = []');

// 3) Optional chaining assignment on rolloutStrategy.config
// Replace `_flag.rolloutStrategy?._config.percentage = X;` with safe inline AND assignment
src = src.replace(/_flag\.rolloutStrategy\?\._config\.percentage\s*=\s*(\d+);/g, '_flag.rolloutStrategy && (_flag.rolloutStrategy.config.percentage = $1);');

// 4) strategy?._config -> _flag.rolloutStrategy?.config
src = src.replace(/strategy\?\._config/g, '_flag.rolloutStrategy?.config');

// 5) Rename _config to config where used with _flag.rolloutStrategy
src = src.replace(/_flag\.rolloutStrategy\?\._config/g, '_flag.rolloutStrategy?.config');

// 6) Fix getUserHash parameter order: required after optional triggers TS1016
src = src.replace(/private\s+getUserHash\(userId\?:\s*string,\s*flagId:\s*any\)/, 'private getUserHash(flagId: string, userId?: string)');

// 7) keysToDelete typed as array
src = src.replace(/const\s+keysToDelete:\s*string\s*=\s*\[\]/g, 'const keysToDelete: string[] = []');

// 8) Replace property access errors for variants length/find due to earlier singular type
// (Now the interfaces are arrays; no change needed beyond interface fixes)

// 9) General typo: _config -> config in other contexts
src = src.replace(/\._config\b/g, '.config');

// 10) Ensure for-of over targeting uses array (handled by interface), no change needed

fs.writeFileSync(targetPath, src, 'utf8');
console.log('Applied targeted fixes to', targetPath);

