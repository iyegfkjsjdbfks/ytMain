#!/usr/bin/env node
/**
 * Simple TypeScript Error Counter
 * Equivalent to: npx tsc --noEmit --skipLibCheck 2>&1 | Select-String "error TS" | Measure-Object | Select-Object Count
 */

import { execSync } from 'child_process';

function countTSErrors() {
  try {
    // Run TypeScript compiler using npm script (equivalent to npx tsc --noEmit --skipLibCheck 2>&1)
    const command = 'npm run type-check';
    console.log('🔍 Running TypeScript error check...');
    console.log(`Command: ${command}`);

    // Execute the command and capture all output (equivalent to 2>&1)
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: process.cwd()
    });

    // Split output into lines and filter for "error TS" lines
    const lines = output.split('\n');
    const errorLines = lines.filter(line => line.includes('error TS'));

    // Count the errors
    const errorCount = errorLines.length;

    console.log(`\n📊 TypeScript Error Count: ${errorCount}`);

    if (errorCount > 0) {
      console.log('\n🚨 Error Summary:');
      console.log(`   Total TypeScript errors found: ${errorCount}`);

      // Show first few errors as examples
      const examples = errorLines.slice(0, 5);
      if (examples.length > 0) {
        console.log('\n📝 Sample errors:');
        examples.forEach((line, index) => {
          console.log(`   ${index + 1}. ${line.trim()}`);
        });

        if (errorLines.length > 5) {
          console.log(`   ... and ${errorLines.length - 5} more errors`);
        }
      }
    } else {
      console.log('✅ No TypeScript errors found!');
    }

    return errorCount;

  } catch (error) {
    // If the command fails, it means there are compilation errors
    // The error output contains the TypeScript errors
    const output = `${error.stdout || ''}${error.stderr || ''}`;
    const lines = output.split('\n');
    const errorLines = lines.filter(line => line.includes('error TS'));

    const errorCount = errorLines.length;

    console.log(`\n📊 TypeScript Error Count: ${errorCount}`);

    if (errorCount > 0) {
      console.log('\n🚨 Error Summary:');
      console.log(`   Total TypeScript errors found: ${errorCount}`);

      // Show first few errors as examples
      const examples = errorLines.slice(0, 5);
      if (examples.length > 0) {
        console.log('\n📝 Sample errors:');
        examples.forEach((line, index) => {
          console.log(`   ${index + 1}. ${line.trim()}`);
        });

        if (errorLines.length > 5) {
          console.log(`   ... and ${errorLines.length - 5} more errors`);
        }
      }
    } else {
      console.log('✅ No TypeScript errors found!');
    }

    return errorCount;
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const errorCount = countTSErrors();
  process.exit(errorCount > 0 ? 1 : 0);
}

export { countTSErrors };