const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ImportResolver {
    constructor() {
        this.processedFiles = new Set();
        this.fixedFiles = new Set();
        this.errorFiles = new Set();
    }

    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            'info': 'ℹ️ ',
            'warn': '⚠️ ',
            'error': '❌',
            'success': '✅'
        }[level] || 'ℹ️ ';
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    findFileWithExtension(importPath, baseDir) {
        const extensions = ['.ts', '.tsx', '.js', '.jsx', '.d.ts'];
        const basePath = path.resolve(baseDir, importPath);
        
        for (const ext of extensions) {
            const fullPath = basePath + ext;
            if (fs.existsSync(fullPath)) {
                return fullPath;
            }
        }
        
        // Check for index files
        for (const ext of extensions) {
            const indexPath = path.join(basePath, 'index' + ext);
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
        
        // Fix 4: Fix React hook imports
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
            const existingReactImport = fixedContent.match(/import\s+React(?:,\s*{([^}]*)})\s+from\s+['"]react['"];?/);
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
            }
        }
        
        // Fix 5: Fix named exports
        const namedExportRegex = /export\s*{([^}]+)}(?:\s*from\s*['"][^'"]*['"])?;?/g;
        fixedContent = fixedContent.replace(namedExportRegex, (match) => {
            if (!match.endsWith(';')) {
                fixCount++;
                fixes.push('Added missing semicolon to named export');
                return match + ';';
            }
            return match;
        });
        
        return {
            content: fixedContent,
            fixCount,
            fixes
        };
    }

    async processFile(filePath) {
        try {
            if (this.processedFiles.has(filePath)) {
                return { success: true, fixes: [], message: 'Already processed' };
            }
            
            this.processedFiles.add(filePath);
            
            if (!fs.existsSync(filePath)) {
                this.errorFiles.add(filePath);
                return { success: false, error: 'File not found' };
            }
            
            const content = fs.readFileSync(filePath, 'utf8');
            const result = this.fixImports(content, filePath);
            
            if (result.fixCount > 0) {
                fs.writeFileSync(filePath, result.content, 'utf8');
                this.fixedFiles.add(filePath);
                this.log(`Fixed ${result.fixCount} import issues in ${path.relative(process.cwd(), filePath)}`);
                return { success: true, fixes: result.fixes, fixCount: result.fixCount };
            }
            
            return { success: true, fixes: [], fixCount: 0 };
            
        } catch (error) {
            this.errorFiles.add(filePath);
            this.log(`Error processing ${filePath}: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async processDirectory(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
        const files = [];
        
        function walkDir(dir) {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    walkDir(fullPath);
                } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
                    files.push(fullPath);
                }
            }
        }
        
        walkDir(dirPath);
        
        this.log(`Found ${files.length} files to process`);
        
        const results = [];
        for (const file of files) {
            const result = await this.processFile(file);
            results.push({ file, ...result });
        }
        
        return results;
    }

    getStats() {
        return {
            processed: this.processedFiles.size,
            fixed: this.fixedFiles.size,
            errors: this.errorFiles.size
        };
    }
}

module.exports = ImportResolver;

// CLI usage
if (require.main === module) {
    const resolver = new ImportResolver();
    
    async function main() {
        try {
            resolver.log('=== Import Resolver Started ===');
            resolver.log('🚀 Starting import resolution process...');
            
            const projectRoot = process.cwd();
            const results = await resolver.processDirectory(projectRoot);
            
            const stats = resolver.getStats();
            resolver.log(`📊 Processing complete:`);
            resolver.log(`   - Files processed: ${stats.processed}`);
            resolver.log(`   - Files fixed: ${stats.fixed}`);
            resolver.log(`   - Errors: ${stats.errors}`);
            
            const totalFixes = results.reduce((sum, r) => sum + (r.fixCount || 0), 0);
            resolver.log(`🔧 Total fixes applied: ${totalFixes}`);
            
            if (stats.errors > 0) {
                resolver.log('⚠️  Some files had errors during processing', 'warn');
                process.exit(1);
            } else {
                resolver.log('✅ Import resolution completed successfully', 'success');
                process.exit(0);
            }
            
        } catch (error) {
            resolver.log(`❌ Fatal error: ${error.message}`, 'error');
            process.exit(1);
        }
    }
    
    main();
}