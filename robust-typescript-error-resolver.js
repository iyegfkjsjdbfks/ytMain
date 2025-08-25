#!/usr/bin/env node

/**
 * Robust TypeScript Error Resolution System
 * Implements comprehensive error fixing with exception handling
 * to prevent errors from reoccurring.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class RobustErrorResolver {
    constructor() {
        this.fixedFiles = new Set();
        this.backupDir = '.error-fix-backups-robust';
        this.errorPatterns = new Map();
        this.failedFixes = new Map();
        this.preventionRules = new Map();
        this.setupBackupDir();
        this.initializeErrorPatterns();
        this.initializePreventionRules();
    }

    setupBackupDir() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    initializeErrorPatterns() {
        // Critical JSX syntax error patterns with robust fixes
        this.errorPatterns.set('malformed_jsx_element', {
            pattern: /(<\w+);/g,
            fix: (match, element) => element,
            description: 'Fix malformed JSX element syntax (semicolon instead of proper closing)'
        });

        this.errorPatterns.set('malformed_jsx_closing', {
            pattern: /\/\{['""]>['""]}/g,
            fix: () => '/>',
            description: 'Fix malformed JSX self-closing syntax'
        });

        this.errorPatterns.set('malformed_jsx_brace', {
            pattern: /\)\{['""][\}]/g,
            fix: () => '}',
            description: 'Fix malformed JSX closing brace'
        });

        this.errorPatterns.set('nested_jsx_error', {
            pattern: /<div><\/(\w+)><\/div>/g,
            fix: (match, tag) => `</${tag}>`,
            description: 'Fix improper JSX nesting'
        });

        this.errorPatterns.set('missing_jsx_props_closing', {
            pattern: /(\{[^}]*);?\s*$/gm,
            fix: (match, props) => props.endsWith('}') ? props : props + '}',
            description: 'Fix missing closing brace in JSX props'
        });

        this.errorPatterns.set('react_import_missing', {
            pattern: /^(?!.*import.*React).*export.*React\.FC/gm,
            fix: (match) => `import React from 'react';\n${match}`,
            description: 'Add missing React import for FC components'
        });

        this.errorPatterns.set('typescript_syntax_errors', {
            pattern: /(\w+)\s*\.\.\.\s*props;\s*\}\s*\)\s*=>/g,
            fix: (match, name) => `${name}, ...props }) =>`,
            description: 'Fix TypeScript destructuring syntax'
        });
    }

    initializePreventionRules() {
        // Rules to prevent errors from reoccurring
        this.preventionRules.set('jsx_validation', {
            validate: (content) => {
                const issues = [];
                
                // Check for malformed JSX elements
                const malformedElements = content.match(/<\w+;/g);
                if (malformedElements) {
                    issues.push(`Malformed JSX elements found: ${malformedElements.join(', ')}`);
                }

                // Check for improper JSX closing
                const improperClosing = content.match(/\/\{['""]>['""]}/g);
                if (improperClosing) {
                    issues.push(`Improper JSX closing found: ${improperClosing.join(', ')}`);
                }

                // Check for React import in FC components
                if (content.includes('React.FC') && !content.includes("import React")) {
                    issues.push('Missing React import for FC component');
                }

                return issues;
            },
            description: 'Validate JSX syntax and React imports'
        });

        this.preventionRules.set('typescript_validation', {
            validate: (content) => {
                const issues = [];
                
                // Check for unclosed braces in destructuring
                const destructuringPattern = /\{[^}]*$/gm;
                const matches = content.match(destructuringPattern);
                if (matches) {
                    issues.push(`Unclosed destructuring braces found`);
                }

                return issues;
            },
            description: 'Validate TypeScript syntax patterns'
        });
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

    validateBeforeFix(filePath, content) {
        const issues = [];
        
        for (const [ruleName, rule] of this.preventionRules) {
            try {
                const ruleIssues = rule.validate(content);
                if (ruleIssues.length > 0) {
                    issues.push(...ruleIssues.map(issue => `${ruleName}: ${issue}`));
                }
            } catch (error) {
                console.warn(`⚠️ Validation rule ${ruleName} failed:`, error.message);
            }
        }

        return issues;
    }

    applyRobustFixes(content, filePath) {
        let fixedContent = content;
        const appliedFixes = [];

        try {
            // Apply each error pattern fix with exception handling
            for (const [patternName, pattern] of this.errorPatterns) {
                try {
                    const beforeCount = (fixedContent.match(pattern.pattern) || []).length;
                    if (beforeCount > 0) {
                        fixedContent = fixedContent.replace(pattern.pattern, pattern.fix);
                        const afterCount = (fixedContent.match(pattern.pattern) || []).length;
                        const fixedCount = beforeCount - afterCount;
                        
                        if (fixedCount > 0) {
                            appliedFixes.push(`${patternName}: ${fixedCount} fixes`);
                            console.log(`  ✅ ${pattern.description}: ${fixedCount} fixes`);
                        }
                    }
                } catch (error) {
                    console.warn(`⚠️ Pattern ${patternName} failed for ${filePath}:`, error.message);
                    this.failedFixes.set(`${filePath}:${patternName}`, error.message);
                }
            }

            // Apply manual fixes for specific complex cases
            fixedContent = this.applyManualFixes(fixedContent, filePath);

        } catch (error) {
            console.error(`❌ Critical error applying fixes to ${filePath}:`, error.message);
            throw error;
        }

        return { content: fixedContent, appliedFixes };
    }

    applyManualFixes(content, filePath) {
        let fixedContent = content;

        try {
            // Fix specific VideoCard.tsx issues
            if (filePath.includes('VideoCard.tsx')) {
                fixedContent = this.fixVideoCardSpecific(fixedContent);
            }

            // Fix specific Button.tsx issues  
            if (filePath.includes('Button.tsx')) {
                fixedContent = this.fixButtonSpecific(fixedContent);
            }

            // Fix specific YouTubeLogo.tsx issues
            if (filePath.includes('YouTubeLogo.tsx')) {
                fixedContent = this.fixYouTubeLogoSpecific(fixedContent);
            }

        } catch (error) {
            console.warn(`⚠️ Manual fixes failed for ${filePath}:`, error.message);
        }

        return fixedContent;
    }

    fixVideoCardSpecific(content) {
        return content
            // Fix ImageWithFallback component
            .replace(/<ImageWithFallback;/g, '<ImageWithFallback')
            .replace(/fallbackSrc={`[^`]*`}\s*\/\{['""]>['""]}/g, 
                match => match.replace(/\/\{['""]>['""]}/g, '/>'))
            
            // Fix IconButton component
            .replace(/<IconButton;/g, '<IconButton')
            .replace(/icon={<SaveIcon[^>]*>}\s*\/\{['""]>['""]}/g,
                match => match.replace(/\/\{['""]>['""]}/g, '/>'))
            
            // Fix div and img elements
            .replace(/<(div|img);/g, '<$1')
            .replace(/\/\{['""]>['""]}/g, '/>')
            
            // Fix malformed closing braces
            .replace(/\)\{['""][\}]/g, '}')
            
            // Fix improper JSX nesting at the end
            .replace(/<\/div><\/Link>\s*<\/div>\s*<\/Link>/g, '</div>\n    </div>\n  </Link>')
            
            // Fix missing closing tags
            .replace(/(<div[^>]*>)([^<]*$)/gm, '$1$2</div>');
    }

    fixButtonSpecific(content) {
        return content
            // Fix props destructuring
            .replace(/(\.\.\.\s*props);\s*\}\s*\)\s*=>/g, '$1\n}) =>')
            
            // Fix button element
            .replace(/<button;/g, '<button')
            
            // Fix SVG elements
            .replace(/<(svg|circle|path);/g, '<$1')
            .replace(/\/\{['""]>['""]}/g, '/>')
            
            // Fix improper nesting
            .replace(/<\/svg><\/button>/g, '</svg>')
            .replace(/<div><\/button><\/div>/g, '</button>');
    }

    fixYouTubeLogoSpecific(content) {
        return content
            // Fix missing SVG opening tag
            .replace(/const YouTubeLogo[^=]*=\s*\([^)]*\)\s*=>\s*\(\s*<svg>/g, 
                match => match.replace('<svg>', '<svg'))
            
            // Fix path element
            .replace(/<path;>/g, '<path')
            
            // Fix improper nesting
            .replace(/<div><\/svg><\/div>/g, '</svg>');
    }

    validateAfterFix(content, filePath) {
        const issues = this.validateBeforeFix(filePath, content);
        
        if (issues.length > 0) {
            console.warn(`⚠️ Post-fix validation issues in ${filePath}:`);
            issues.forEach(issue => console.warn(`  - ${issue}`));
            return false;
        }
        
        return true;
    }

    async fixFile(filePath) {
        try {
            console.log(`\n🔧 Processing: ${filePath}`);
            
            // Backup original file
            if (!this.backup(filePath)) {
                throw new Error('Backup failed');
            }

            // Read current content
            const originalContent = fs.readFileSync(filePath, 'utf8');
            
            // Pre-fix validation
            const preIssues = this.validateBeforeFix(filePath, originalContent);
            if (preIssues.length > 0) {
                console.log(`  📋 Issues detected: ${preIssues.length}`);
            }

            // Apply robust fixes
            const { content: fixedContent, appliedFixes } = this.applyRobustFixes(originalContent, filePath);

            // Post-fix validation
            if (!this.validateAfterFix(fixedContent, filePath)) {
                console.warn(`⚠️ Post-fix validation failed for ${filePath}`);
            }

            // Write fixed content if changes were made
            if (fixedContent !== originalContent) {
                fs.writeFileSync(filePath, fixedContent);
                this.fixedFiles.add(filePath);
                
                console.log(`  ✅ Fixed: ${appliedFixes.length} patterns applied`);
                appliedFixes.forEach(fix => console.log(`    - ${fix}`));
                
                return true;
            } else {
                console.log(`  ℹ️ No changes needed`);
                return false;
            }

        } catch (error) {
            console.error(`❌ Failed to fix ${filePath}:`, error.message);
            this.failedFixes.set(filePath, error.message);
            return false;
        }
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

    async findFilesWithErrors() {
        const { output } = await this.getTypeScriptErrors();
        const errorFiles = new Set();
        
        // Extract file paths from TypeScript error output
        const fileMatches = output.match(/([^\s]+\.tsx?)\(\d+,\d+\):/g) || [];
        fileMatches.forEach(match => {
            const filePath = match.replace(/\(\d+,\d+\):/, '');
            if (fs.existsSync(filePath)) {
                errorFiles.add(filePath);
            }
        });
        
        return Array.from(errorFiles);
    }

    async generatePreventionReport() {
        const report = {
            timestamp: new Date().toISOString(),
            fixedFiles: Array.from(this.fixedFiles),
            failedFixes: Object.fromEntries(this.failedFixes),
            preventionRules: Object.fromEntries(
                Array.from(this.preventionRules.entries()).map(([name, rule]) => [
                    name, 
                    { description: rule.description }
                ])
            ),
            errorPatterns: Object.fromEntries(
                Array.from(this.errorPatterns.entries()).map(([name, pattern]) => [
                    name,
                    { description: pattern.description }
                ])
            )
        };

        fs.writeFileSync('robust-error-resolution-report.json', JSON.stringify(report, null, 2));
        console.log('\n📊 Prevention report generated: robust-error-resolution-report.json');
    }

    async run() {
        console.log('🚀 Starting Robust TypeScript Error Resolution...\n');
        
        try {
            // Get initial error count
            const initialErrors = await this.getTypeScriptErrors();
            console.log(`📊 Initial error count: ${initialErrors.errorCount}`);
            
            // Find files with errors
            const errorFiles = await this.findFilesWithErrors();
            console.log(`📁 Files with errors: ${errorFiles.length}`);
            
            if (errorFiles.length === 0) {
                console.log('✅ No error files found to fix!');
                return;
            }

            // Fix files systematically
            let successCount = 0;
            for (const filePath of errorFiles) {
                if (await this.fixFile(filePath)) {
                    successCount++;
                }
                
                // Progress update every 10 files
                if ((successCount + this.failedFixes.size) % 10 === 0) {
                    const progress = Math.round(((successCount + this.failedFixes.size) / errorFiles.length) * 100);
                    console.log(`\n📈 Progress: ${progress}% (${successCount + this.failedFixes.size}/${errorFiles.length})`);
                }
            }
            
            // Get final error count
            const finalErrors = await this.getTypeScriptErrors();
            console.log(`\n📊 Final error count: ${finalErrors.errorCount}`);
            console.log(`📈 Errors reduced by: ${initialErrors.errorCount - finalErrors.errorCount}`);
            
            // Generate prevention report
            await this.generatePreventionReport();
            
            // Summary
            console.log('\n🎯 ROBUST ERROR RESOLUTION COMPLETE');
            console.log(`✅ Files fixed: ${successCount}`);
            console.log(`❌ Files failed: ${this.failedFixes.size}`);
            console.log(`📉 Error reduction: ${initialErrors.errorCount - finalErrors.errorCount}`);
            
            if (this.failedFixes.size > 0) {
                console.log('\n❌ Failed fixes:');
                for (const [file, error] of this.failedFixes) {
                    console.log(`  - ${file}: ${error}`);
                }
            }

        } catch (error) {
            console.error('💥 Critical error in robust resolver:', error);
            process.exit(1);
        }
    }
}

// Run the robust error resolver
if (require.main === module) {
    const resolver = new RobustErrorResolver();
    resolver.run().catch(console.error);
}

module.exports = RobustErrorResolver;