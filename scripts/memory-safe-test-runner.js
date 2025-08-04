// Simplified memory-safe test approach
// Run tests one file at a time to avoid memory accumulation

import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import { join } from 'path';

const testDir = 'test';
const testFiles = readdirSync(testDir, { recursive: true })
  .filter(file => file.toString().endsWith('.test.ts') || file.toString().endsWith('.test.tsx'))
  .map(file => join(testDir, file.toString()));

console.log(`Found ${testFiles.length} test files`);

let passed = 0;
let failed = 0;

for (const testFile of testFiles) {
  console.log(`\n🧪 Running ${testFile}...`);
  
  try {
    const result = execSync(
      `NODE_OPTIONS="--max-old-space-size=1024" npx vitest run "${testFile}" --pool=forks --poolOptions.forks.singleFork=true --reporter=json`,
      { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 60000
      }
    );
    
    const testResult = JSON.parse(result);
    if (testResult.success) {
      console.log(`✅ ${testFile} - PASSED`);
      passed++;
    } else {
      console.log(`❌ ${testFile} - FAILED`);
      failed++;
    }
    
  } catch (error) {
    console.log(`❌ ${testFile} - ERROR: ${error.message}`);
    failed++;
  }
  
  // Force garbage collection between tests
  if (global.gc) {
    global.gc();
  }
  
  // Small delay to allow memory cleanup
  await new Promise(resolve => setTimeout(resolve, 1000));
}

console.log(`\n📊 Final Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);