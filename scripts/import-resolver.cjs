#!/usr/bin/env node

/**
 * Import Resolver - Stage 3 of Progressive Error Resolution
 * 
 * Targets import/export related TypeScript errors:
 * - TS2307: Cannot find module
 * - TS2305: Module has no exported member
 * - TS1192: Module has no default export
 * - TS2339: Property does not exist on type (for imports)
 * - Missing file extensions
 * - Incorrect import paths
 * 
 * Expected to resolve import-related errors after syntax and JSX fixes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ImportResolver {
    constructor() {
        this.processedFiles = 0;
        this.fixedErrors = 0;
        this.backupDir = '.error-fix-backups';
        this.logFile = 'import-resolution-fixes.log';
        this.startTime = Date.now();
        
        // Common import patterns and their fixes
        this.importMappings = {
            // React imports
            "import React from 'react'": "import React from 'react';",
            "import { useState, useEffect }": "import { useState, useEffect } from 'react';",
            "import { Component }": "import { Component } from 'react';",
            
            // Common library imports
            "import axios": "import axios from 'axios';",
            "import moment": "import moment from 'moment';",
            "import lodash": "import _ from 'lodash';",
            "import { Router }": "import { Router } from 'react-router-dom';",
            "import { Link }": "import { Link } from 'react-router-dom';"
        };
        
        // File extensions to try
        this.extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
        
        // Ensure backup directory exists
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
        
        this.log('=== Import Resolver Started ===');
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
    
    findFileWithExtension(basePath, currentDir) {
        for (const ext of this.extensions) {
            const fullPath = path.resolve(currentDir, basePath + ext);
            if (fs.existsSync(fullPath)) {
                return fullPath;
            }
        }
        
        // Try index files
        for (const ext of this.extensions) {
            const indexPath = path.resolve(currentDir, basePath, 'index' + ext);
            if (fs.existsSync(indexPath)) {
                return indexPath;
            }
        }
        
        return null;
    }
    
    resolveImportPath(importPath, currentFilePath) {
        const currentDir = path.dirname(currentFilePath);
        
        // Handle relative imports
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
            const resolvedPath = this.findFileWithExtension(importPath, currentDir);
            if (resolvedPath) {
                return path.relative(currentDir, resolvedPath).replace(/\\/g, '/');
            }
        }
        
        // Handle absolute imports from src
        if (!importPath.startsWith('.') && !importPath.includes('node_modules')) {
            const srcPath = path.resolve(process.cwd(), 'src', importPath);
            const resolvedPath = this.findFileWithExtension('', srcPath);
            if (resolvedPath) {
                const relativePath = path.relative(currentDir, resolvedPath).replace(/\\/g, '/');
                return relativePath.startsWith('.') ? relativePath : './' + relativePath;
            }
        }
        
        return null;
    }
    
    fixImports(content, filePath) {
        let fixedContent = content;
        let fixCount = 0;
        const fixes = [];
        
        // Fix 1: Add missing semicolons to import statements
        const importSemicolonRegex = /^(import\s+[^;\n]+)(?<!;)$/gm;
        fixedContent = fixedContent.replace(importSemicolonRegex, (match) => {
            if (!match.endsWith(';')) {
                fixCount++;
                fixes.push('Added missing semicolon to import');
                return match + ';';
            }
            return match;
        });
        
        // Fix 2: Fix import statements missing 'from' keyword
        const missingFromRegex = /import\s+{([^}]+)}\s+(['"][^'"]+['"])/g;
        fixedContent = fixedContent.replace(missingFromRegex, (match, imports, module) => {
            if (!match.includes(' from ')) {
                fixCount++;
                fixes.push(`Added missing 'from' keyword in import`);
                return `import {${imports}} from ${module}`;
            }
            return match;
        });
        
        // Fix 3: Fix import paths without extensions
        const importRegex = /import\s+([^'"\n]+)['"]([^'"]+)['"];?/g;
        fixedContent = fixedContent.replace(importRegex, (match, importClause, importPath) => {
            // Skip node_modules imports
            if (importPath.includes('node_modules') || !importPath.startsWith('.')) {
                return match;
            }
            
            const resolvedPath = this.resolveImportPath(importPath, filePath);
            if (resolvedPath && resolvedPath !== importPath) {
                fixCount++;
                fixes.push(`Fixed import path: ${importPath} -> ${resolvedPath}`);
                return match.replace(importPath, resolvedPath);
            }
            
            return match;
        });
        
        // Fix 4: Fix React imports (disabled - too aggressive)
        // Modern React (17+) doesn't require React imports for JSX
        /*
        if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
            // Add React import if JSX is used but React is not imported
            const hasJSX = /<\w+/.test(fixedContent);
            const hasReactImport = /import\s+.*React.*from\s+['"]react['"]/.test(fixedContent);
            
            if (hasJSX && !hasReactImport) {
                fixCount++;
                fixes.push('Added missing React import for JSX');
                fixedContent = `import React from 'react';\n${fixedContent}`;
            }
        */
            
            // Fix React hook imports
            const hookUsage = {
                'useState': /useState\s*\(/,
                'useEffect': /useEffect\s*\(/,
                'useContext': /useContext\s*\(/,
                'useReducer': /useReducer\s*\(/,
                'useMemo': /useMemo\s*\(/,
                'useCallback': /useCallback\s*\(/,
                'useRef': /useRef\s*\(/
            };
            
            const usedHooks = [];
            for (const [hook, regex] of Object.entries(hookUsage)) {
                if (regex.test(fixedContent)) {
                    usedHooks.push(hook);
                }
            }
            
            if (usedHooks.length > 0) {
                const existingReactImport = fixedContent.match(/import\s+React(?:,\s*{([^}]*)})?\s+from\s+['"]react['"];?/);
                if (existingReactImport) {
                    const existingHooks = existingReactImport[1] ? existingReactImport[1].split(',').map(h => h.trim()) : [];
                    const newHooks = usedHooks.filter(hook => !existingHooks.includes(hook));
                    
                    if (newHooks.length > 0) {
                        const allHooks = [...existingHooks, ...newHooks].filter(Boolean);
                        const newImport = `import React, { ${allHooks.join(', ')} } from 'react';`;
                        fixedContent = fixedContent.replace(existingReactImport[0], newImport);
                        fixCount++;
                        fixes.push(`Added missing React hooks: ${newHooks.join(', ')}`);
                    }
                } else if (hasReactImport) {
                    // Update existing React import to include hooks
                    const reactImportRegex = /import\s+React\s+from\s+['"]react['"];?/;
                    const newImport = `import React, { ${usedHooks.join(', ')} } from 'react';`;
                    fixedContent = fixedContent.replace(reactImportRegex, newImport);
                    fixCount++;
                    fixes.push(`Added React hooks to existing import: ${usedHooks.join(', ')}`);
                }
            }
        }
        
        // Fix 5: Fix export statements (disabled - causing syntax errors)
        /*
        const exportRegex = /^(export\s+(?:default\s+)?(?:const|let|var|function|class)\s+\w+[^;\n]*?)$/gm;
        fixedContent = fixedContent.replace(exportRegex, (match) => {
            if (!match.endsWith(';') && !match.includes('{')) {
                fixCount++;
                fixes.push('Added missing semicolon to export');
                return match + ';';
            }
            return match;
        });
        */
        
        // Fix 6: Fix named exports
        const namedExportRegex = /export\s*{([^}]+)}(?:\s*from\s*['"][^'"]*['"])?;?/g;
        fixedContent = fixedContent.replace(namedExportRegex, (match) => {
            if (!match.endsWith(';')) {
                fixCount++;
                fixes.push('Added missing semicolon to named export');
                return match + ';';
            }
            return match;
        });
        
        // Fix 7: Fix dynamic imports
        const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
        fixedContent = fixedContent.replace(dynamicImportRegex, (match, importPath) => {
            if (importPath.startsWith('./') || importPath.startsWith('../')) {
                const resolvedPath = this.resolveImportPath(importPath, filePath);
                if (resolvedPath && resolvedPath !== importPath) {
                    fixCount++;
                    fixes.push(`Fixed dynamic import path: ${importPath} -> ${resolvedPath}`);
                    return match.replace(importPath, resolvedPath);
                }
            }
            return match;
        });
        
        // Fix 8: Fix require statements (disabled - can break CommonJS modules)
        /*
        const requireRegex = /const\s+(\w+)\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
        fixedContent = fixedContent.replace(requireRegex, (match, varName, modulePath) => {
            // Convert to ES6 import if it's a relative path
            if (modulePath.startsWith('./') || modulePath.startsWith('../')) {
                fixCount++;
                fixes.push(`Converted require to ES6 import: ${varName}`);
                return `import ${varName} from '${modulePath}';`;
            }
            return match;
        });
        */
        
        // Fix 9: Fix module.exports (disabled - can break CommonJS modules)
        /*
        const moduleExportsRegex = /module\.exports\s*=\s*([^;\n]+);?/g;
        fixedContent = fixedContent.replace(moduleExportsRegex, (match, exportValue) => {
            fixCount++;
            fixes.push('Converted module.exports to ES6 export default');
            return `export default ${exportValue};`;
        });
        */
        
        // Fix 10: Fix exports.something (disabled - can break CommonJS modules)
        /*
        const exportsRegex = /exports\.(\w+)\s*=\s*([^;\n]+);?/g;
        fixedContent = fixedContent.replace(exportsRegex, (match, exportName, exportValue) => {
            fixCount++;
            fixes.push(`Converted exports.${exportName} to ES6 named export`);
            return `export const ${exportName} = ${exportValue};`;
        });
        */
        
        // Fix 11: Add missing type imports for TypeScript
        if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
            const typeUsage = {
                'React.FC': /React\.FC/,
                'React.Component': /React\.Component/,
                'React.ReactNode': /React\.ReactNode/,
                'React.MouseEvent': /React\.MouseEvent/,
                'React.ChangeEvent': /React\.ChangeEvent/,
                'React.FormEvent': /React\.FormEvent/
            };
            
            for (const [typeName, regex] of Object.entries(typeUsage)) {
                if (regex.test(fixedContent) && !fixedContent.includes(`import { ${typeName.split('.')[1]} }`)) {
                    const typeImport = typeName.split('.')[1];
                    const hasReactImport = /import\s+React(?:,\s*{([^}]*)})?\s+from\s+['"]react['"];?/.test(fixedContent);
                    
                    if (hasReactImport && typeImport !== 'FC' && typeImport !== 'Component') {
                        // Add to existing React import
                        const reactImportMatch = fixedContent.match(/import\s+React(?:,\s*{([^}]*)})?\s+from\s+['"]react['"];?/);
                        if (reactImportMatch) {
                            const existingTypes = reactImportMatch[1] ? reactImportMatch[1].split(',').map(t => t.trim()) : [];
                            if (!existingTypes.includes(typeImport)) {
                                const allTypes = [...existingTypes, typeImport].filter(Boolean);
                                const newImport = `import React, { ${allTypes.join(', ')} } from 'react';`;
                                fixedContent = fixedContent.replace(reactImportMatch[0], newImport);
                                fixCount++;
                                fixes.push(`Added React type import: ${typeImport}`);
                            }
                        }
                    }
                }
            }
        }
        
        // Fix 12: Fix CSS/SCSS imports
        const cssImportRegex = /import\s+['"]([^'"]+\.(css|scss|sass))['"];?/g;
        fixedContent = fixedContent.replace(cssImportRegex, (match) => {
            if (!match.endsWith(';')) {
                fixCount++;
                fixes.push('Added missing semicolon to CSS import');
                return match + ';';
            }
            return match;
        });
        
        if (fixCount > 0) {
            this.log(`  ✅ Applied ${fixCount} import fixes: ${fixes.join(', ')}`);
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
            
            const result = this.fixImports(content, filePath);
            
            if (result.fixCount > 0) {
                fs.writeFileSync(filePath, result.content, 'utf8');
                this.fixedErrors += result.fixCount;
                this.log(`✅ Fixed ${result.fixCount} import issues in ${filePath}`);
                return true;
            } else {
                this.log(`ℹ️  No import issues found in ${filePath}`);
                return true;
            }
            
        } catch (error) {
            this.log(`❌ Error processing ${filePath}: ${error.message}`);
            return false;
        }
    }
    
    getFilesToProcess() {
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
                    // Focus on JavaScript/TypeScript files
                    return filePath.endsWith('.ts') || 
                           filePath.endsWith('.tsx') || 
                           filePath.endsWith('.js') || 
                           filePath.endsWith('.jsx');
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
                const importErrors = (output.match(/error TS(2307|2305|1192):/g) || []).length;
                this.log(`⚠️  TypeScript validation found ${errorCount} errors (${importErrors} import-related)`);
                return { success: false, errors: errorCount, importErrors };
            }
        } catch (error) {
            const errorOutput = error.stdout || error.message;
            const errorCount = (errorOutput.match(/error TS\d+:/g) || []).length;
            const importErrors = (errorOutput.match(/error TS(2307|2305|1192):/g) || []).length;
            this.log(`⚠️  TypeScript validation found ${errorCount} errors (${importErrors} import-related)`);
            return { success: false, errors: errorCount, importErrors };
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
        
        fs.writeFileSync('import-resolution-report.json', JSON.stringify(report, null, 2));
        
        this.log('\n=== IMPORT RESOLUTION REPORT ===');
        this.log(`📊 Processed Files: ${report.processedFiles}`);
        this.log(`🔧 Fixed Errors: ${report.fixedErrors}`);
        this.log(`⏱️  Duration: ${report.duration}`);
        this.log(`📈 Average Fixes per File: ${report.averageFixesPerFile}`);
        this.log('=== END REPORT ===\n');
        
        return report;
    }
    
    async run() {
        try {
            this.log('🚀 Starting import resolution process...');
            
            // Get list of files to process
            const files = this.getFilesToProcess();
            this.log(`📋 Found ${files.length} files to process`);
            
            if (files.length === 0) {
                this.log('❌ No files found. Exiting.');
                return;
            }
            
            // Validate initial state
            const initialValidation = this.validateTypeScript();
            this.log(`📊 Initial error count: ${initialValidation.errors} (${initialValidation.importErrors || 0} import-related)`);
            
            // Process each file
            for (const filePath of files) {
                this.log(`\n🔧 Processing: ${filePath}`);
                
                if (this.processFile(filePath)) {
                    this.processedFiles++;
                }
                
                // Progress update every 10 files
                if (this.processedFiles % 10 === 0) {
                    this.log(`📈 Progress: ${this.processedFiles}/${files.length} files processed`);
                }
            }
            
            // Final validation
            this.log('\n🔍 Running final TypeScript validation...');
            const finalValidation = this.validateTypeScript();
            
            const errorReduction = initialValidation.errors - finalValidation.errors;
            const importErrorReduction = (initialValidation.importErrors || 0) - (finalValidation.importErrors || 0);
            const reductionPercentage = initialValidation.errors > 0 
                ? Math.round((errorReduction / initialValidation.errors) * 100) 
                : 0;
            
            this.log(`\n📊 RESULTS:`);
            this.log(`   Initial errors: ${initialValidation.errors}`);
            this.log(`   Final errors: ${finalValidation.errors}`);
            this.log(`   Total errors reduced: ${errorReduction} (${reductionPercentage}%)`);
            this.log(`   Import errors reduced: ${importErrorReduction}`);
            
            // Generate final report
            this.generateReport();
            
            if (finalValidation.errors === 0) {
                this.log('🎉 SUCCESS: All TypeScript errors have been eliminated!');
            } else if (errorReduction > 0) {
                this.log(`✅ PROGRESS: Reduced errors by ${reductionPercentage}%. Import issues resolved.`);
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
    const resolver = new ImportResolver();
    resolver.run().catch(console.error);
}

module.exports = ImportResolver;