#!/usr/bin/env node

/**
 * Conservative TypeScript Error Resolution System
 * Focuses on fixing only critical syntax errors without breaking existing code
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class ConservativeErrorResolver {
    constructor() {
        this.fixedFiles = new Set();
        this.backupDir = '.error-fix-backups-conservative';
        this.setupBackupDir();
    }

    setupBackupDir() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    backup(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const backupPath = path.join(this.backupDir, path.basename(filePath) + '.backup');
            fs.writeFileSync(backupPath, content);
            console.log(`✅ Backed up: ${filePath}`);
            return true;
        } catch (error) {
            console.error(`❌ Backup failed for ${filePath}:`, error.message);
            return false;
        }
    }

    // Very specific, conservative fixes for critical files
    fixVideoCardConservative(content) {
        return content
            // Fix only the most obvious JSX syntax errors
            .replace(/<ImageWithFallback;/g, '<ImageWithFallback')
            .replace(/<IconButton;/g, '<IconButton')
            .replace(/<div;/g, '<div')
            .replace(/<img;/g, '<img')
            .replace(/\/\{">"\}/g, '/>')
            .replace(/\)\{"\}/g, '}');
    }

    fixButtonConservative(content) {
        return content
            // Fix only the button element syntax error
            .replace(/<button;/g, '<button')
            .replace(/<svg;/g, '<svg')
            .replace(/<circle;/g, '<circle')
            .replace(/<path;/g, '<path')
            .replace(/\/\{">"\}/g, '/>')
            // Fix the specific destructuring issue
            .replace(/...props;\s*}\s*\)\s*=>/g, '...props\n}) =>');
    }

    fixYouTubeLogoConservative(content) {
        return content
            // Fix the specific path element issue
            .replace(/<path;>/g, '<path')
            // Fix the nesting issue
            .replace(/<div><\/svg><\/div>/g, '</svg>');
    }

    async fixCriticalFiles() {
        const criticalFiles = [
            'components/VideoCard.tsx',
            'components/forms/Button.tsx', 
            'components/icons/YouTubeLogo.tsx'
        ];

        let fixedCount = 0;

        for (const filePath of criticalFiles) {
            if (!fs.existsSync(filePath)) {
                console.log(`⚠️ File not found: ${filePath}`);
                continue;
            }

            console.log(`\n🔧 Fixing: ${filePath}`);
            
            // Backup
            if (!this.backup(filePath)) {
                continue;
            }

            try {
                const originalContent = fs.readFileSync(filePath, 'utf8');
                let fixedContent = originalContent;

                // Apply conservative fixes based on file type
                if (filePath.includes('VideoCard.tsx')) {
                    fixedContent = this.fixVideoCardConservative(fixedContent);
                } else if (filePath.includes('Button.tsx')) {
                    fixedContent = this.fixButtonConservative(fixedContent);
                } else if (filePath.includes('YouTubeLogo.tsx')) {
                    fixedContent = this.fixYouTubeLogoConservative(fixedContent);
                }

                // Only write if changes were made
                if (fixedContent !== originalContent) {
                    fs.writeFileSync(filePath, fixedContent);
                    this.fixedFiles.add(filePath);
                    fixedCount++;
                    console.log(`  ✅ Applied conservative fixes`);
                } else {
                    console.log(`  ℹ️ No changes needed`);
                }

            } catch (error) {
                console.error(`❌ Failed to fix ${filePath}:`, error.message);
            }
        }

        return fixedCount;
    }

    async getTypeScriptErrors() {
        return new Promise((resolve) => {
            const tsc = spawn('npm', ['run', 'type-check'], { 
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true 
            });
            
            let output = '';
            let errorOutput = '';
            
            tsc.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            tsc.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            
            tsc.on('close', (code) => {
                const allOutput = output + errorOutput;
                const errorCount = (allOutput.match(/error TS\d+:/g) || []).length;
                resolve({ errorCount, output: allOutput });
            });
        });
    }

    async run() {
        console.log('🚀 Starting Conservative TypeScript Error Resolution...\n');
        
        try {
            // Get initial error count
            const initialErrors = await this.getTypeScriptErrors();
            console.log(`📊 Initial error count: ${initialErrors.errorCount}`);
            
            // Fix critical files with conservative approach
            const fixedCount = await this.fixCriticalFiles();
            
            // Get final error count
            const finalErrors = await this.getTypeScriptErrors();
            console.log(`\n📊 Final error count: ${finalErrors.errorCount}`);
            console.log(`📈 Errors reduced by: ${initialErrors.errorCount - finalErrors.errorCount}`);
            
            // Summary
            console.log('\n🎯 CONSERVATIVE ERROR RESOLUTION COMPLETE');
            console.log(`✅ Files fixed: ${fixedCount}`);
            console.log(`📉 Error reduction: ${initialErrors.errorCount - finalErrors.errorCount}`);

        } catch (error) {
            console.error('💥 Critical error in conservative resolver:', error);
            process.exit(1);
        }
    }
}

// Run the conservative error resolver
if (require.main === module) {
    const resolver = new ConservativeErrorResolver();
    resolver.run().catch(console.error);
}

module.exports = ConservativeErrorResolver;