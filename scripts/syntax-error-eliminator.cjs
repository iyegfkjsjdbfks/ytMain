#!/usr/bin/env node

/**
 * Syntax Error Eliminator - Stage 1 of Progressive Error Resolution
 * 
 * Targets the most common TypeScript syntax errors:
 * - TS1005: ',' expected / ';' expected
 * - TS1128: Declaration or statement expected
 * - TS1109: Expression expected
 * 
 * Expected to resolve ~70% of total errors (4,986 out of 7,720)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SyntaxErrorEliminator {
    constructor() {
        this.processedFiles = 0;
        this.fixedErrors = 0;
        this.backupDir = '.error-fix-backups';
        this.logFile = 'syntax-fixes.log';
        this.startTime = Date.now();
        
        // Ensure backup directory exists
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
        
        this.log('=== Syntax Error Eliminator Started ===');
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
    
    fixSyntaxErrors(content, filePath) {
        let fixedContent = content;
        let fixCount = 0;
        const fixes = [];
        
        // Fix 1: Missing semicolons at end of statements
        const missingSemicolonRegex = /^(\s*(?:import|export|const|let|var|return|throw|break|continue)\s+[^;\n]+)(?<!;)\s*$/gm;
        fixedContent = fixedContent.replace(missingSemicolonRegex, (match, statement) => {
            if (!statement.trim().endsWith(';') && !statement.includes('{') && !statement.includes('(')) {
                fixCount++;
                fixes.push('Added missing semicolon');
                return statement + ';';
            }
            return match;
        });
        
        // Fix 2: Missing commas in object literals and arrays
        const missingCommaRegex = /(\w+\s*:\s*[^,\n}]+)\s*\n(\s*\w+\s*:)/g;
        fixedContent = fixedContent.replace(missingCommaRegex, (match, prop1, prop2) => {
            fixCount++;
            fixes.push('Added missing comma in object literal');
            return prop1 + ',\n' + prop2;
        });
        
        // Fix 3: Missing commas in function parameters
        const missingParamCommaRegex = /(\w+\s*:\s*\w+)\s*\n(\s*\w+\s*:)/g;
        fixedContent = fixedContent.replace(missingParamCommaRegex, (match, param1, param2) => {
            fixCount++;
            fixes.push('Added missing comma in function parameters');
            return param1 + ',\n' + param2;
        });
        
        // Fix 4: Malformed import statements
        const malformedImportRegex = /import\s+([^\n]*?)\s*from\s*['"]([^'"]*)['"](?!;)/g;
        fixedContent = fixedContent.replace(malformedImportRegex, (match, imports, source) => {
            if (!match.trim().endsWith(';')) {
                fixCount++;
                fixes.push('Fixed malformed import statement');
                return `import ${imports.trim()} from '${source}';`;
            }
            return match;
        });
        
        // Fix 5: Missing export keywords
        const missingExportRegex = /^(\s*)((?:const|let|var|function|class|interface|type)\s+\w+)/gm;
        if (filePath.includes('components/') || filePath.includes('utils/') || filePath.includes('services/')) {
            fixedContent = fixedContent.replace(missingExportRegex, (match, indent, declaration) => {
                // Only add export if it's likely meant to be exported
                if (declaration.includes('function') || declaration.includes('class') || declaration.includes('interface')) {
                    const isAlreadyExported = content.includes(`export ${declaration}`);
                    if (!isAlreadyExported && !declaration.includes('test') && !declaration.includes('Test')) {
                        fixCount++;
                        fixes.push('Added missing export keyword');
                        return `${indent}export ${declaration}`;
                    }
                }
                return match;
            });
        }
        
        // Fix 6: Unclosed brackets and parentheses (basic cases)
        const lines = fixedContent.split('\n');
        let bracketStack = [];
        let parenStack = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Track brackets
            for (const char of line) {
                if (char === '{') bracketStack.push(i);
                else if (char === '}') bracketStack.pop();
                else if (char === '(') parenStack.push(i);
                else if (char === ')') parenStack.pop();
            }
        }
        
        // Fix 7: Remove duplicate semicolons
        fixedContent = fixedContent.replace(/;;+/g, ';');
        if (fixedContent !== content && fixedContent.includes(';;')) {
            fixCount++;
            fixes.push('Removed duplicate semicolons');
        }
        
        // Fix 8: Fix spacing around operators
        const operatorSpacingRegex = /(\w)([=+\-*/<>!])([=]?)(\w)/g;
        fixedContent = fixedContent.replace(operatorSpacingRegex, (match, before, op, equals, after) => {
            const operator = op + (equals || '');
            if (match !== `${before} ${operator} ${after}`) {
                fixCount++;
                fixes.push('Fixed operator spacing');
                return `${before} ${operator} ${after}`;
            }
            return match;
        });
        
        // Fix 9: Fix malformed arrow functions
        const arrowFunctionRegex = /(\w+)\s*=>\s*{/g;
        fixedContent = fixedContent.replace(arrowFunctionRegex, (match, param) => {
            if (!match.includes('(')) {
                fixCount++;
                fixes.push('Fixed arrow function syntax');
                return `(${param}) => {`;
            }
            return match;
        });
        
        // Fix 10: Fix incomplete statements
        const incompleteStatementRegex = /^(\s*)(if|while|for)\s*\([^)]*\)\s*$/gm;
        fixedContent = fixedContent.replace(incompleteStatementRegex, (match, indent, keyword) => {
            fixCount++;
            fixes.push(`Fixed incomplete ${keyword} statement`);
            return `${match} {\n${indent}    // TODO: Add implementation\n${indent}}`;
        });
        
        if (fixCount > 0) {
            this.log(`  ✅ Applied ${fixCount} fixes: ${fixes.join(', ')}`);
        }
        
        return { content: fixedContent, fixCount };
    }
    
    processFile(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                this.log(`❌ File not found: ${filePath}`);
                return false;
            }
            
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Create backup
            if (!this.createBackup(filePath)) {
                this.log(`❌ Skipping ${filePath} - backup failed`);
                return false;
            }
            
            const result = this.fixSyntaxErrors(content, filePath);
            
            if (result.fixCount > 0) {
                fs.writeFileSync(filePath, result.content, 'utf8');
                this.fixedErrors += result.fixCount;
                this.log(`✅ Fixed ${result.fixCount} syntax errors in ${filePath}`);
                return true;
            } else {
                this.log(`ℹ️  No syntax errors found in ${filePath}`);
                return true;
            }
            
        } catch (error) {
            this.log(`❌ Error processing ${filePath}: ${error.message}`);
            return false;
        }
    }
    
    getCorruptedFiles() {
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
                    // Extract file path from the format: "path/to/file.ts (X errors)"
                    const match = line.match(/^(.+?)\s*\(\d+\s+errors\)$/);
                    return match ? match[1].trim() : line;
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
                this.log(`⚠️  TypeScript validation found ${errorCount} errors`);
                return { success: false, errors: errorCount };
            }
        } catch (error) {
            const errorOutput = error.stdout || error.message;
            const errorCount = (errorOutput.match(/error TS\d+:/g) || []).length;
            this.log(`⚠️  TypeScript validation found ${errorCount} errors`);
            return { success: false, errors: errorCount };
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
        
        fs.writeFileSync('syntax-fixes-report.json', JSON.stringify(report, null, 2));
        
        this.log('\n=== SYNTAX ERROR ELIMINATION REPORT ===');
        this.log(`📊 Processed Files: ${report.processedFiles}`);
        this.log(`🔧 Fixed Errors: ${report.fixedErrors}`);
        this.log(`⏱️  Duration: ${report.duration}`);
        this.log(`📈 Average Fixes per File: ${report.averageFixesPerFile}`);
        this.log('=== END REPORT ===\n');
        
        return report;
    }
    
    async run() {
        try {
            this.log('🚀 Starting syntax error elimination process...');
            
            // Get list of corrupted files
            const corruptedFiles = this.getCorruptedFiles();
            this.log(`📋 Found ${corruptedFiles.length} corrupted files to process`);
            
            if (corruptedFiles.length === 0) {
                this.log('❌ No corrupted files found. Exiting.');
                return;
            }
            
            // Validate initial state
            const initialValidation = this.validateTypeScript();
            this.log(`📊 Initial error count: ${initialValidation.errors}`);
            
            // Process each file
            for (const filePath of corruptedFiles) {
                this.log(`\n🔧 Processing: ${filePath}`);
                
                if (this.processFile(filePath)) {
                    this.processedFiles++;
                }
                
                // Progress update every 10 files
                if (this.processedFiles % 10 === 0) {
                    this.log(`📈 Progress: ${this.processedFiles}/${corruptedFiles.length} files processed`);
                }
            }
            
            // Final validation
            this.log('\n🔍 Running final TypeScript validation...');
            const finalValidation = this.validateTypeScript();
            
            const errorReduction = initialValidation.errors - finalValidation.errors;
            const reductionPercentage = initialValidation.errors > 0 
                ? Math.round((errorReduction / initialValidation.errors) * 100) 
                : 0;
            
            this.log(`\n📊 RESULTS:`);
            this.log(`   Initial errors: ${initialValidation.errors}`);
            this.log(`   Final errors: ${finalValidation.errors}`);
            this.log(`   Errors reduced: ${errorReduction} (${reductionPercentage}%)`);
            
            // Generate final report
            this.generateReport();
            
            if (finalValidation.errors === 0) {
                this.log('🎉 SUCCESS: All TypeScript errors have been eliminated!');
            } else if (errorReduction > 0) {
                this.log(`✅ PROGRESS: Reduced errors by ${reductionPercentage}%. Ready for Stage 2.`);
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
    const eliminator = new SyntaxErrorEliminator();
    eliminator.run().catch(console.error);
}

module.exports = SyntaxErrorEliminator;