#!/usr/bin/env node

/**
 * JSX Structure Fixer - Stage 2 of Progressive Error Resolution
 * 
 * Targets JSX-related TypeScript errors:
 * - TS1382: Unexpected token JSX
 * - TS17002: JSX closing tag expected
 * - TS1381: Unexpected token in JSX
 * - JSX fragment and element structure issues
 * 
 * Expected to resolve ~15% of remaining errors after Stage 1
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class JSXStructureFixer {
    constructor() {
        this.processedFiles = 0;
        this.fixedErrors = 0;
        this.backupDir = '.error-fix-backups';
        this.logFile = 'jsx-fixes.log';
        this.startTime = Date.now();
        
        // Ensure backup directory exists
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
        
        this.log('=== JSX Structure Fixer Started ===');
    }
    
    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        fs.appendFileSync(this.logFile, logMessage + '\n');
    }
    
    createBackup(filePath) {
        try {
            const relativePath = path.relative(process.cwd(), filePath);
            const backupPath = path.join(this.backupDir, relativePath);
            const backupDir = path.dirname(backupPath);
            
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            
            fs.copyFileSync(filePath, backupPath);
            return true;
        } catch (error) {
            this.log(`❌ Failed to backup ${filePath}: ${error.message}`);
            return false;
        }
    }
    
    isJSXFile(filePath) {
        return filePath.endsWith('.tsx') || filePath.endsWith('.jsx');
    }
    
    fixJSXStructure(content, filePath) {
        let fixedContent = content;
        let fixCount = 0;
        const fixes = [];
        
        // Fix 1: Add missing React import for JSX files (disabled - too aggressive)
        // This was adding React imports to files that don't need them
        // Modern React (17+) doesn't require React imports for JSX
        // if (this.isJSXFile(filePath) && !fixedContent.includes('import React') && !fixedContent.includes('import * as React')) {
        
        // Fix 2: Fix unclosed JSX tags (more conservative)
        // Only fix obvious self-closing HTML tags
        const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
        const selfClosingRegex = new RegExp(`<(${selfClosingTags.join('|')})([^>]*?)(?<!/)>`, 'g');
        fixedContent = fixedContent.replace(selfClosingRegex, (match, tagName, attributes) => {
            if (!attributes.includes('/')) {
                fixCount++;
                fixes.push(`Fixed self-closing tag: ${tagName}`);
                return `<${tagName}${attributes} />`;
            }
            return match;
        });
        
        // Fix 3: Fix malformed JSX expressions
        const malformedExpressionRegex = /{([^}]*?)(?<!})$/gm;
        fixedContent = fixedContent.replace(malformedExpressionRegex, (match, expression) => {
            if (!match.endsWith('}')) {
                fixCount++;
                fixes.push('Fixed unclosed JSX expression');
                return `{${expression}}`;
            }
            return match;
        });
        
        // Fix 4: Fix JSX fragments
        const malformedFragmentRegex = /<>([\s\S]*?)(?!<\/>)/g;
        fixedContent = fixedContent.replace(malformedFragmentRegex, (match, content) => {
            if (!match.includes('</>')) {
                fixCount++;
                fixes.push('Fixed unclosed JSX fragment');
                return `<>${content}</>`;
            }
            return match;
        });
        
        // Fix 5: Fix nested JSX structure
        const lines = fixedContent.split('\n');
        let jsxStack = [];
        let inJSX = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Detect JSX opening tags
            const openTagMatches = line.match(/<(\w+)(?:[^>]*?)(?<!\/)>/g);
            if (openTagMatches) {
                openTagMatches.forEach(tag => {
                    const tagName = tag.match(/<(\w+)/)[1];
                    jsxStack.push({ tag: tagName, line: i });
                    inJSX = true;
                });
            }
            
            // Detect JSX closing tags
            const closeTagMatches = line.match(/<\/(\w+)>/g);
            if (closeTagMatches) {
                closeTagMatches.forEach(tag => {
                    const tagName = tag.match(/<\/(\w+)>/)[1];
                    const lastOpen = jsxStack.pop();
                    if (!lastOpen || lastOpen.tag !== tagName) {
                        // Mismatched closing tag
                        this.log(`⚠️  Mismatched JSX tag at line ${i + 1}: expected ${lastOpen?.tag}, found ${tagName}`);
                    }
                });
            }
        }
        
        // Fix 6: Fix JSX attribute syntax
        const malformedAttributeRegex = /(\w+)=([^"'{\s][^\s>]*)/g;
        fixedContent = fixedContent.replace(malformedAttributeRegex, (match, attrName, attrValue) => {
            // Skip if already properly quoted
            if (attrValue.startsWith('"') || attrValue.startsWith("'") || attrValue.startsWith('{')) {
                return match;
            }
            
            fixCount++;
            fixes.push(`Fixed JSX attribute: ${attrName}`);
            
            // Determine if it should be a string or expression
            if (/^\d+$/.test(attrValue) || /^(true|false)$/.test(attrValue)) {
                return `${attrName}={${attrValue}}`;
            } else {
                return `${attrName}="${attrValue}"`;
            }
        });
        
        // Fix 7: Fix JSX comments (disabled - too aggressive)
        // This was incorrectly converting regular comments to JSX comments
        // const malformedCommentRegex = /\/\*([\s\S]*?)\*\//g;
        
        // Fix 8: Fix JSX conditional rendering
        const conditionalRegex = /{([^}]*?)\?([^}]*?):([^}]*?)}/g;
        fixedContent = fixedContent.replace(conditionalRegex, (match, condition, trueCase, falseCase) => {
            // Ensure proper spacing and parentheses
            const cleanCondition = condition.trim();
            const cleanTrue = trueCase.trim();
            const cleanFalse = falseCase.trim();
            
            if (match !== `{${cleanCondition} ? ${cleanTrue} : ${cleanFalse}}`) {
                fixCount++;
                fixes.push('Fixed JSX conditional rendering');
                return `{${cleanCondition} ? ${cleanTrue} : ${cleanFalse}}`;
            }
            
            return match;
        });
        
        // Fix 9: Fix JSX map expressions
        const mapExpressionRegex = /{([^}]*?\.map\([^}]*?)}/g;
        fixedContent = fixedContent.replace(mapExpressionRegex, (match, mapExpression) => {
            // Ensure proper key prop in mapped elements
            if (!mapExpression.includes('key=') && mapExpression.includes('.map(')) {
                const hasJSXElement = /<\w+/.test(mapExpression);
                if (hasJSXElement) {
                    this.log(`⚠️  Missing key prop in map expression: ${mapExpression.substring(0, 50)}...`);
                    // Note: This is a warning, not an automatic fix as it requires context
                }
            }
            return match;
        });
        
        // Fix 10: Fix JSX prop spreading
        const propSpreadRegex = /{\.\.\.(\w+)}/g;
        fixedContent = fixedContent.replace(propSpreadRegex, (match, propName) => {
            // Ensure proper spacing
            if (match !== `{...${propName}}`) {
                fixCount++;
                fixes.push('Fixed JSX prop spreading syntax');
                return `{...${propName}}`;
            }
            return match;
        });
        
        // Fix 11: Fix JSX boolean attributes (disabled - can break functionality)
        // This was removing {true} which might be intentional
        // const booleanAttrRegex = /(\w+)={true}/g;
        
        // Fix 12: Fix JSX className vs class
        const classAttrRegex = /\bclass=/g;
        if (this.isJSXFile(filePath)) {
            fixedContent = fixedContent.replace(classAttrRegex, (match) => {
                fixCount++;
                fixes.push('Fixed class attribute to className');
                return 'className=';
            });
        }
        
        if (fixCount > 0) {
            this.log(`  ✅ Applied ${fixCount} JSX fixes: ${fixes.join(', ')}`);
        }
        
        return { content: fixedContent, fixCount };
    }
    
    processFile(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                this.log(`❌ File not found: ${filePath}`);
                return false;
            }
            
            // Only process JSX/TSX files and files that likely contain JSX
            const content = fs.readFileSync(filePath, 'utf8');
            const hasJSX = (/<[A-Z][\w]*/.test(content) || /<\w+[\s>]/.test(content)) && this.isJSXFile(filePath);
            
            if (!hasJSX) {
                this.log(`ℹ️  Skipping ${filePath} - no JSX content detected`);
                return true;
            }
            
            // Create backup
            if (!this.createBackup(filePath)) {
                this.log(`❌ Skipping ${filePath} - backup failed`);
                return false;
            }
            
            const result = this.fixJSXStructure(content, filePath);
            
            if (result.fixCount > 0) {
                fs.writeFileSync(filePath, result.content, 'utf8');
                this.fixedErrors += result.fixCount;
                this.log(`✅ Fixed ${result.fixCount} JSX errors in ${filePath}`);
                return true;
            } else {
                this.log(`ℹ️  No JSX errors found in ${filePath}`);
                return true;
            }
            
        } catch (error) {
            this.log(`❌ Error processing ${filePath}: ${error.message}`);
            return false;
        }
    }
    
    getJSXFiles() {
        try {
            const corruptedFilesPath = 'corrupted-files-to-delete.txt';
            if (!fs.existsSync(corruptedFilesPath)) {
                this.log('❌ corrupted-files-to-delete.txt not found');
                return [];
            }
            
            const content = fs.readFileSync(corruptedFilesPath, 'utf8');
            return content.split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('#'))
                .map(line => {
                    const match = line.match(/^(.+?)\s*\(\d+\s+errors\)$/);
                    return match ? match[1].trim() : line;
                })
                .filter(filePath => {
                    // Focus on React component files and files likely to contain JSX
                    return filePath.endsWith('.tsx') || 
                           filePath.endsWith('.jsx') || 
                           filePath.includes('components/') || 
                           filePath.includes('pages/') || 
                           filePath.includes('views/');
                });
        } catch (error) {
            this.log(`❌ Error reading corrupted files list: ${error.message}`);
            return [];
        }
    }
    
    validateTypeScript() {
        try {
            this.log('🔍 Running TypeScript validation...');
            const output = execSync('npx tsc --noEmit 2>&1', { encoding: 'utf8' });
            
            if (output.trim() === '') {
                this.log('✅ TypeScript validation passed - no errors!');
                return { success: true, errors: 0 };
            } else {
                const errorCount = (output.match(/error TS\d+:/g) || []).length;
                const jsxErrors = (output.match(/error TS(1382|17002|1381):/g) || []).length;
                this.log(`⚠️  TypeScript validation found ${errorCount} errors (${jsxErrors} JSX-related)`);
                return { success: false, errors: errorCount, jsxErrors };
            }
        } catch (error) {
            const errorOutput = error.stdout || error.message;
            const errorCount = (errorOutput.match(/error TS\d+:/g) || []).length;
            const jsxErrors = (errorOutput.match(/error TS(1382|17002|1381):/g) || []).length;
            this.log(`⚠️  TypeScript validation found ${errorCount} errors (${jsxErrors} JSX-related)`);
            return { success: false, errors: errorCount, jsxErrors };
        }
    }
    
    generateReport() {
        const endTime = Date.now();
        const duration = Math.round((endTime - this.startTime) / 1000);
        
        const report = {
            timestamp: new Date().toISOString(),
            duration: `${duration} seconds`,
            processedFiles: this.processedFiles,
            fixedErrors: this.fixedErrors,
            averageFixesPerFile: this.processedFiles > 0 ? Math.round(this.fixedErrors / this.processedFiles * 100) / 100 : 0
        };
        
        fs.writeFileSync('jsx-fixes-report.json', JSON.stringify(report, null, 2));
        
        this.log('\n=== JSX STRUCTURE FIXING REPORT ===');
        this.log(`📊 Processed Files: ${report.processedFiles}`);
        this.log(`🔧 Fixed Errors: ${report.fixedErrors}`);
        this.log(`⏱️  Duration: ${report.duration}`);
        this.log(`📈 Average Fixes per File: ${report.averageFixesPerFile}`);
        this.log('=== END REPORT ===\n');
        
        return report;
    }
    
    async run() {
        try {
            this.log('🚀 Starting JSX structure fixing process...');
            
            // Get list of JSX files to process
            const jsxFiles = this.getJSXFiles();
            this.log(`📋 Found ${jsxFiles.length} JSX/React files to process`);
            
            if (jsxFiles.length === 0) {
                this.log('❌ No JSX files found. Exiting.');
                return;
            }
            
            // Validate initial state
            const initialValidation = this.validateTypeScript();
            this.log(`📊 Initial error count: ${initialValidation.errors} (${initialValidation.jsxErrors || 0} JSX-related)`);
            
            // Process each file
            for (const filePath of jsxFiles) {
                this.log(`\n🔧 Processing: ${filePath}`);
                
                if (this.processFile(filePath)) {
                    this.processedFiles++;
                }
                
                // Progress update every 5 files
                if (this.processedFiles % 5 === 0) {
                    this.log(`📈 Progress: ${this.processedFiles}/${jsxFiles.length} files processed`);
                }
            }
            
            // Final validation
            this.log('\n🔍 Running final TypeScript validation...');
            const finalValidation = this.validateTypeScript();
            
            const errorReduction = initialValidation.errors - finalValidation.errors;
            const jsxErrorReduction = (initialValidation.jsxErrors || 0) - (finalValidation.jsxErrors || 0);
            const reductionPercentage = initialValidation.errors > 0 
                ? Math.round((errorReduction / initialValidation.errors) * 100) 
                : 0;
            
            this.log(`\n📊 RESULTS:`);
            this.log(`   Initial errors: ${initialValidation.errors}`);
            this.log(`   Final errors: ${finalValidation.errors}`);
            this.log(`   Total errors reduced: ${errorReduction} (${reductionPercentage}%)`);
            this.log(`   JSX errors reduced: ${jsxErrorReduction}`);
            
            // Generate final report
            this.generateReport();
            
            if (finalValidation.errors === 0) {
                this.log('🎉 SUCCESS: All TypeScript errors have been eliminated!');
            } else if (errorReduction > 0) {
                this.log(`✅ PROGRESS: Reduced errors by ${reductionPercentage}%. Ready for Stage 3.`);
            } else {
                this.log('⚠️  WARNING: No error reduction achieved. Manual review required.');
            }
            
        } catch (error) {
            this.log(`❌ Fatal error: ${error.message}`);
            console.error(error);
        }
    }
}

// Run the script
if (require.main === module) {
    const fixer = new JSXStructureFixer();
    fixer.run().catch(console.error);
}

module.exports = JSXStructureFixer;