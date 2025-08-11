#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🎯 elemName Placeholder Cleanup (Clean Version)');
console.log('=================================================');

async function cleanupElemNamePlaceholders() {
  // Get all TypeScript/TSX files
  const { execSync } = await import('child_process');
  
  try {
    const output = execSync('dir /S /B *.ts *.tsx', { 
      cwd: rootDir, 
      encoding: 'utf8',
      shell: 'cmd'
    });
    
    const files = output.split('\r\n')
      .filter(file => file.trim() && !file.includes('node_modules'))
      .map(file => file.trim());
    
    console.log(`🔍 Found ${files.length} TypeScript files to process`);
    
    let filesProcessed = 0;
    let filesFixed = 0;
    let totalPlaceholdersRemoved = 0;
    
    for (const filePath of files) {
      filesProcessed++;
      
      // Show progress every 50 files
      if (filesProcessed % 50 === 0) {
        console.log(`📊 Progress: ${filesProcessed}/${files.length} files processed`);
      }
      
      try {
        let content = await fs.readFile(filePath, 'utf8');
        const originalContent = content;
        
        // Target specific JSX namespace placeholder patterns that cause TS2304 elemName errors
        const patterns = [
          // Pattern 1: Full declare global JSX namespace with elemName
          {
            pattern: /declare global\s*\{\s*namespace JSX\s*\{\s*interface IntrinsicElements\s*\{\s*\[elemName:\s*string\]:\s*any;\s*\}\s*\}\s*\}/g,
            description: 'Full JSX namespace declaration with elemName'
          },
          
          // Pattern 2: Inline elemName interface property
          {
            pattern: /\[elemName:\s*string\]:\s*any;?/g,
            description: 'Inline elemName property declaration'
          },
          
          // Pattern 3: elemName variable declarations
          {
            pattern: /(?:declare\s+)?(?:const|let|var)\s+elemName\s*[:=][^;]+;?/g,
            description: 'elemName variable declarations'
          }
        ];
        
        let placeholdersRemoved = 0;
        
        for (const { pattern, description } of patterns) {
          const matches = content.match(pattern);
          if (matches) {
            content = content.replace(pattern, '');
            placeholdersRemoved += matches.length;
          }
        }
        
        // Clean up extra whitespace left by removals
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        content = content.replace(/^\s*\n/, ''); // Remove leading empty lines
        
        if (content !== originalContent) {
          await fs.writeFile(filePath, content, 'utf8');
          filesFixed++;
          totalPlaceholdersRemoved += placeholdersRemoved;
          
          const relativePath = path.relative(rootDir, filePath);
          console.log(`📂 Processing: ${relativePath}`);
          console.log(`  🗑️  Found ${placeholdersRemoved} elemName placeholder declarations`);
          console.log(`  ✅ Cleaned ${relativePath}`);
        }
      } catch (error) {
        console.log(`❌ Error processing ${filePath}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 elemName Placeholder Cleanup Complete!');
    console.log(`📊 Files processed: ${filesProcessed}`);
    console.log(`✅ Files fixed: ${filesFixed}`);
    console.log(`🗑️  Total placeholders removed: ${totalPlaceholdersRemoved}`);
    
    // Check remaining elemName references
    console.log('\n🔍 Checking remaining elemName references...');
    try {
      const grepOutput = execSync('findstr /S /R "elemName" *.ts *.tsx', { 
        cwd: rootDir, 
        encoding: 'utf8' 
      });
      const remainingRefs = grepOutput.split('\n').filter(line => line.trim()).length;
      console.log(`📈 Remaining elemName references: ${remainingRefs}`);
      
      if (remainingRefs === 0) {
        console.log('🎉 All elemName placeholders successfully removed!');
      }
    } catch (error) {
      // If grep finds no matches, it returns non-zero exit code
      console.log('📈 Remaining elemName references: 0');
      console.log('🎉 All elemName placeholders successfully removed!');
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

cleanupElemNamePlaceholders().catch(console.error);
