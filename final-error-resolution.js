#!/usr/bin/env node

/**
 * Final Comprehensive TypeScript Error Resolution
 * Addresses remaining critical errors with targeted fixes
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class FinalErrorResolution {
    constructor() {
        this.criticalPatterns = new Map();
        this.setupCriticalPatterns();
    }

    setupCriticalPatterns() {
        // Target only the most critical and safe patterns
        this.criticalPatterns.set('jsx_comment_artifacts', {
            pattern: /\/\/\s*FIXED:\s*[^\n]*/g,
            fix: '',
            description: 'Remove comment artifacts'
        });

        this.criticalPatterns.set('jsx_expression_errors', {
            pattern: /\{['""]>['""]}/g,
            fix: '>',
            description: 'Fix JSX expression syntax errors'
        });

        this.criticalPatterns.set('jsx_closing_errors', {
            pattern: /\{['""]<['""]}/g,
            fix: '<',
            description: 'Fix JSX closing tag errors'
        });

        this.criticalPatterns.set('jsx_slash_errors', {
            pattern: /\{['""]\/['""]}/g,
            fix: '/',
            description: 'Fix JSX slash errors'
        });

        this.criticalPatterns.set('malformed_conditionals', {
            pattern: /\)\{['""][\}]/g,
            fix: '}',
            description: 'Fix malformed conditional expressions'
        });
    }

    applyTargetedFixes(content, filePath) {
        let fixedContent = content;
        const appliedFixes = [];

        for (const [patternName, pattern] of this.criticalPatterns) {
            try {
                const beforeCount = (fixedContent.match(pattern.pattern) || []).length;
                if (beforeCount > 0) {
                    fixedContent = fixedContent.replace(pattern.pattern, pattern.fix);
                    const afterCount = (fixedContent.match(pattern.pattern) || []).length;
                    const fixedCount = beforeCount - afterCount;
                    
                    if (fixedCount > 0) {
                        appliedFixes.push({
                            pattern: patternName,
                            count: fixedCount,
                            description: pattern.description
                        });
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Pattern ${patternName} failed for ${filePath}:`, error.message);
            }
        }

        return { content: fixedContent, appliedFixes };
    }

    async fixCriticalFiles() {
        const criticalFiles = [
            'components/VideoCard.tsx',
            'components/forms/Button.tsx',
            'components/forms/Input.tsx',
            'components/icons/YouTubeLogo.tsx',
            'contexts/WatchLaterContext.tsx',
            'src/App.tsx'
        ];

        let totalFixes = 0;

        for (const filePath of criticalFiles) {
            if (!fs.existsSync(filePath)) continue;

            try {
                console.log(`🔧 Final fixes for: ${filePath}`);
                
                const originalContent = fs.readFileSync(filePath, 'utf8');
                const { content: fixedContent, appliedFixes } = this.applyTargetedFixes(originalContent, filePath);

                if (fixedContent !== originalContent) {
                    fs.writeFileSync(filePath, fixedContent);
                    totalFixes += appliedFixes.reduce((sum, fix) => sum + fix.count, 0);
                    
                    console.log(`  ✅ Applied ${appliedFixes.length} patterns`);
                    appliedFixes.forEach(fix => {
                        console.log(`    - ${fix.description}: ${fix.count} fixes`);
                    });
                } else {
                    console.log(`  ℹ️ No changes needed`);
                }

            } catch (error) {
                console.error(`❌ Failed to fix ${filePath}:`, error.message);
            }
        }

        return totalFixes;
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
        console.log('🚀 Final Comprehensive Error Resolution...\n');
        
        const initialErrors = await this.getTypeScriptErrors();
        console.log(`📊 Initial error count: ${initialErrors.errorCount}`);
        
        const totalFixes = await this.fixCriticalFiles();
        
        const finalErrors = await this.getTypeScriptErrors();
        console.log(`\n📊 Final error count: ${finalErrors.errorCount}`);
        console.log(`📈 Errors reduced by: ${initialErrors.errorCount - finalErrors.errorCount}`);
        console.log(`🔧 Total fixes applied: ${totalFixes}`);
        
        return {
            initialErrors: initialErrors.errorCount,
            finalErrors: finalErrors.errorCount,
            reduction: initialErrors.errorCount - finalErrors.errorCount,
            fixesApplied: totalFixes
        };
    }
}

if (require.main === module) {
    const resolver = new FinalErrorResolution();
    resolver.run().catch(console.error);
}

module.exports = FinalErrorResolution;