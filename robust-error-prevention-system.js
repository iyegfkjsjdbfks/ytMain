#!/usr/bin/env node

/**
 * Robust Error Prevention System for TypeScript
 * Implements comprehensive error detection, fixing, and prevention mechanisms
 * to ensure errors don't reappear
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class RobustErrorPreventionSystem {
    constructor() {
        this.fixedFiles = new Set();
        this.errorDatabase = new Map();
        this.preventionRules = new Map();
        this.warningSystem = new Map();
        this.backupDir = '.error-prevention-backups';
        this.logFile = 'error-prevention.log';
        this.configFile = 'error-prevention-config.json';
        
        this.setupSystem();
        this.initializePreventionRules();
        this.loadConfiguration();
    }

    setupSystem() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
        
        // Initialize log file
        this.log('🚀 Robust Error Prevention System initialized');
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}\n`;
        fs.appendFileSync(this.logFile, logEntry);
        console.log(message);
    }

    loadConfiguration() {
        try {
            if (fs.existsSync(this.configFile)) {
                const config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
                this.log(`✅ Loaded configuration with ${Object.keys(config).length} settings`);
                return config;
            }
        } catch (error) {
            this.log(`⚠️ Failed to load configuration: ${error.message}`);
        }
        
        // Default configuration
        const defaultConfig = {
            enablePreventionMode: true,
            enableRealTimeValidation: true,
            enableAutoBackup: true,
            maxErrorsBeforeAlert: 10,
            validationPatterns: {
                jsxSyntax: true,
                reactImports: true,
                typeAnnotations: true,
                destructuringPatterns: true
            }
        };
        
        this.saveConfiguration(defaultConfig);
        return defaultConfig;
    }

    saveConfiguration(config) {
        try {
            fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
            this.log(`✅ Configuration saved`);
        } catch (error) {
            this.log(`❌ Failed to save configuration: ${error.message}`);
        }
    }

    initializePreventionRules() {
        // JSX Syntax Prevention Rules
        this.preventionRules.set('jsx_malformed_elements', {
            pattern: /<\w+;/g,
            severity: 'critical',
            autoFix: true,
            fix: (match) => match.replace(';', ''),
            description: 'Prevent malformed JSX element syntax (semicolon instead of proper closing)',
            prevention: 'Validate JSX element syntax in real-time'
        });

        this.preventionRules.set('jsx_malformed_closing', {
            pattern: /\/\{['""]>['""]}/g,
            severity: 'critical',
            autoFix: true,
            fix: () => '/>',
            description: 'Prevent malformed JSX self-closing syntax',
            prevention: 'Validate JSX closing patterns'
        });

        this.preventionRules.set('jsx_malformed_braces', {
            pattern: /\)\{['""][\}]/g,
            severity: 'critical',
            autoFix: true,
            fix: () => '}',
            description: 'Prevent malformed JSX closing braces',
            prevention: 'Validate JSX brace matching'
        });

        this.preventionRules.set('react_import_missing', {
            pattern: /^(?!.*import.*React).*React\.FC/gm,
            severity: 'high',
            autoFix: true,
            fix: (match) => `import React from 'react';\n${match}`,
            description: 'Prevent missing React imports for FC components',
            prevention: 'Auto-add React imports when FC is detected'
        });

        this.preventionRules.set('destructuring_syntax', {
            pattern: /(\w+)\s*\.\.\.\s*props;\s*\}\s*\)\s*=>/g,
            severity: 'high',
            autoFix: true,
            fix: (match, name) => `${name}, ...props\n}) =>`,
            description: 'Prevent TypeScript destructuring syntax errors',
            prevention: 'Validate destructuring patterns'
        });

        this.preventionRules.set('unclosed_braces', {
            pattern: /\{[^}]*$/gm,
            severity: 'medium',
            autoFix: false,
            description: 'Detect unclosed braces in destructuring',
            prevention: 'Warn about potential unclosed braces'
        });

        this.log(`✅ Initialized ${this.preventionRules.size} prevention rules`);
    }

    async createBackup(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(this.backupDir, `${path.basename(filePath)}.${timestamp}.backup`);
            fs.writeFileSync(backupPath, content);
            this.log(`✅ Created backup: ${backupPath}`);
            return backupPath;
        } catch (error) {
            this.log(`❌ Backup failed for ${filePath}: ${error.message}`);
            return null;
        }
    }

    validateFile(filePath, content) {
        const violations = [];
        const warnings = [];

        for (const [ruleName, rule] of this.preventionRules) {
            try {
                const matches = content.match(rule.pattern);
                if (matches && matches.length > 0) {
                    const violation = {
                        rule: ruleName,
                        severity: rule.severity,
                        count: matches.length,
                        description: rule.description,
                        autoFixable: rule.autoFix,
                        matches: matches.slice(0, 3) // Show first 3 matches
                    };

                    if (rule.severity === 'critical') {
                        violations.push(violation);
                    } else {
                        warnings.push(violation);
                    }
                }
            } catch (error) {
                this.log(`⚠️ Validation rule ${ruleName} failed for ${filePath}: ${error.message}`);
            }
        }

        return { violations, warnings };
    }

    applyRobustFixes(content, filePath) {
        let fixedContent = content;
        const appliedFixes = [];
        let hasErrors = false;

        try {
            for (const [ruleName, rule] of this.preventionRules) {
                if (!rule.autoFix) continue;

                try {
                    const beforeCount = (fixedContent.match(rule.pattern) || []).length;
                    if (beforeCount > 0) {
                        fixedContent = fixedContent.replace(rule.pattern, rule.fix);
                        const afterCount = (fixedContent.match(rule.pattern) || []).length;
                        const fixedCount = beforeCount - afterCount;
                        
                        if (fixedCount > 0) {
                            appliedFixes.push({
                                rule: ruleName,
                                count: fixedCount,
                                description: rule.description
                            });
                            this.log(`  ✅ ${rule.description}: ${fixedCount} fixes`);
                        }
                    }
                } catch (error) {
                    this.log(`⚠️ Fix rule ${ruleName} failed for ${filePath}: ${error.message}`);
                    hasErrors = true;
                }
            }

            // Apply specific manual fixes for known problematic patterns
            fixedContent = this.applySpecificFixes(fixedContent, filePath);

        } catch (error) {
            this.log(`❌ Critical error applying fixes to ${filePath}: ${error.message}`);
            hasErrors = true;
        }

        return { content: fixedContent, appliedFixes, hasErrors };
    }

    applySpecificFixes(content, filePath) {
        let fixedContent = content;

        try {
            // Fix specific patterns that require more complex logic
            if (filePath.includes('.tsx')) {
                // Fix JSX expression errors
                fixedContent = fixedContent
                    .replace(/\{['""]>['""]}/g, '>')
                    .replace(/\{['""]<['""]}/g, '<')
                    .replace(/\{['""]\/['""]}/g, '/')
                    // Fix malformed conditional expressions
                    .replace(/\)\{['""][\}]/g, '}')
                    // Fix comment artifacts
                    .replace(/\/\/\s*FIXED:\s*([^\n]+)/g, '')
                    .replace(/\/\*\s*FIXED:\s*([^*]+)\*\//g, '');
            }

            // Fix TypeScript specific issues
            if (filePath.includes('.ts') || filePath.includes('.tsx')) {
                // Fix destructuring issues
                fixedContent = fixedContent
                    .replace(/\.\.\.\s*props;\s*\}\s*\)\s*=>/g, '...props\n}) =>')
                    .replace(/,\s*\.\.\.\s*props;/g, ', ...props');
            }

        } catch (error) {
            this.log(`⚠️ Specific fixes failed for ${filePath}: ${error.message}`);
        }

        return fixedContent;
    }

    async processFile(filePath) {
        try {
            this.log(`\n🔧 Processing: ${filePath}`);
            
            // Read current content
            const originalContent = fs.readFileSync(filePath, 'utf8');
            
            // Validate file
            const { violations, warnings } = this.validateFile(filePath, originalContent);
            
            if (violations.length === 0 && warnings.length === 0) {
                this.log(`  ✅ No issues found`);
                return { success: true, changed: false };
            }

            // Log issues found
            if (violations.length > 0) {
                this.log(`  🚨 ${violations.length} critical violations found`);
                violations.forEach(v => {
                    this.log(`    - ${v.description}: ${v.count} instances`);
                });
            }

            if (warnings.length > 0) {
                this.log(`  ⚠️ ${warnings.length} warnings found`);
                warnings.forEach(w => {
                    this.log(`    - ${w.description}: ${w.count} instances`);
                });
            }

            // Create backup
            const backupPath = await this.createBackup(filePath);
            if (!backupPath) {
                throw new Error('Backup creation failed');
            }

            // Apply fixes
            const { content: fixedContent, appliedFixes, hasErrors } = this.applyRobustFixes(originalContent, filePath);

            // Validate fixes
            const { violations: remainingViolations } = this.validateFile(filePath, fixedContent);
            
            if (remainingViolations.length > 0) {
                this.log(`  ⚠️ ${remainingViolations.length} violations remain after fixes`);
            }

            // Write fixed content if changes were made
            if (fixedContent !== originalContent) {
                fs.writeFileSync(filePath, fixedContent);
                this.fixedFiles.add(filePath);
                
                this.log(`  ✅ Applied ${appliedFixes.length} fix patterns`);
                appliedFixes.forEach(fix => {
                    this.log(`    - ${fix.description}: ${fix.count} fixes`);
                });
                
                return { success: true, changed: true, fixes: appliedFixes.length };
            } else {
                this.log(`  ℹ️ No changes needed after validation`);
                return { success: true, changed: false };
            }

        } catch (error) {
            this.log(`❌ Failed to process ${filePath}: ${error.message}`);
            return { success: false, error: error.message };
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
                const errors = this.parseTypeScriptErrors(allOutput);
                resolve({ errorCount, output: allOutput, errors });
            });
        });
    }

    parseTypeScriptErrors(output) {
        const errorPattern = /([^\s]+\.tsx?)\((\d+),(\d+)\):\s*error\s*(TS\d+):\s*(.+)/g;
        const errors = [];
        let match;

        while ((match = errorPattern.exec(output)) !== null) {
            errors.push({
                file: match[1],
                line: parseInt(match[2]),
                column: parseInt(match[3]),
                code: match[4],
                message: match[5].trim()
            });
        }

        return errors;
    }

    async findFilesWithErrors() {
        const { errors } = await this.getTypeScriptErrors();
        const errorFiles = new Set();
        
        errors.forEach(error => {
            if (fs.existsSync(error.file)) {
                errorFiles.add(error.file);
            }
        });
        
        return Array.from(errorFiles);
    }

    async installPreventionHooks() {
        this.log('\n🔒 Installing prevention hooks...');
        
        // Create ESLint configuration for prevention
        const eslintPreventionRules = {
            "rules": {
                "react/jsx-no-undef": "error",
                "react/jsx-uses-react": "error",
                "react/jsx-uses-vars": "error",
                "@typescript-eslint/no-unused-vars": "warn",
                "@typescript-eslint/no-explicit-any": "warn"
            }
        };

        try {
            const eslintConfigPath = '.eslintrc.prevention.json';
            fs.writeFileSync(eslintConfigPath, JSON.stringify(eslintPreventionRules, null, 2));
            this.log(`✅ Created prevention ESLint config: ${eslintConfigPath}`);
        } catch (error) {
            this.log(`⚠️ Failed to create ESLint config: ${error.message}`);
        }

        // Create pre-commit hook script
        const preCommitHook = `#!/bin/sh
# TypeScript Error Prevention Pre-commit Hook
echo "🔍 Running error prevention checks..."
node robust-error-prevention-system.js --validate-only
if [ $? -ne 0 ]; then
    echo "❌ Error prevention check failed. Commit aborted."
    exit 1
fi
echo "✅ Error prevention check passed."
`;

        try {
            const hookDir = '.git/hooks';
            if (fs.existsSync(hookDir)) {
                const hookPath = path.join(hookDir, 'pre-commit');
                fs.writeFileSync(hookPath, preCommitHook);
                fs.chmodSync(hookPath, '755');
                this.log(`✅ Installed pre-commit hook: ${hookPath}`);
            }
        } catch (error) {
            this.log(`⚠️ Failed to install pre-commit hook: ${error.message}`);
        }

        this.log('✅ Prevention hooks installed');
    }

    async generateComprehensiveReport() {
        const { errorCount, errors } = await this.getTypeScriptErrors();
        
        const report = {
            timestamp: new Date().toISOString(),
            system: {
                version: '1.0.0',
                preventionRules: this.preventionRules.size,
                configFile: this.configFile,
                logFile: this.logFile
            },
            processing: {
                filesFixed: Array.from(this.fixedFiles),
                totalFilesFixed: this.fixedFiles.size
            },
            errors: {
                current: errorCount,
                breakdown: this.categorizeErrors(errors)
            },
            prevention: {
                rules: Object.fromEntries(
                    Array.from(this.preventionRules.entries()).map(([name, rule]) => [
                        name,
                        {
                            severity: rule.severity,
                            description: rule.description,
                            autoFixable: rule.autoFix,
                            prevention: rule.prevention
                        }
                    ])
                ),
                hooksInstalled: fs.existsSync('.git/hooks/pre-commit'),
                eslintConfigCreated: fs.existsSync('.eslintrc.prevention.json')
            },
            recommendations: this.generateRecommendations(errors)
        };

        const reportPath = 'robust-error-prevention-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        this.log(`\n📊 Comprehensive report generated: ${reportPath}`);
        
        return report;
    }

    categorizeErrors(errors) {
        const categories = {
            jsxSyntax: 0,
            typeErrors: 0,
            importErrors: 0,
            destructuringErrors: 0,
            other: 0
        };

        errors.forEach(error => {
            if (error.message.includes('JSX') || error.message.includes('Identifier expected')) {
                categories.jsxSyntax++;
            } else if (error.message.includes('Type') || error.message.includes('Property')) {
                categories.typeErrors++;
            } else if (error.message.includes('import') || error.message.includes('module')) {
                categories.importErrors++;
            } else if (error.message.includes('expected') && error.message.includes(',')) {
                categories.destructuringErrors++;
            } else {
                categories.other++;
            }
        });

        return categories;
    }

    generateRecommendations(errors) {
        const recommendations = [];

        const errorCounts = this.categorizeErrors(errors);

        if (errorCounts.jsxSyntax > 10) {
            recommendations.push({
                category: 'JSX Syntax',
                priority: 'high',
                action: 'Install JSX linting rules and real-time validation in your IDE',
                prevention: 'Add stricter JSX formatting rules to prevent malformed syntax'
            });
        }

        if (errorCounts.typeErrors > 20) {
            recommendations.push({
                category: 'Type Safety',
                priority: 'medium',
                action: 'Gradually enable stricter TypeScript compiler options',
                prevention: 'Implement incremental type safety improvements'
            });
        }

        if (errorCounts.destructuringErrors > 5) {
            recommendations.push({
                category: 'Destructuring',
                priority: 'high',
                action: 'Review and fix destructuring patterns consistently',
                prevention: 'Use consistent destructuring patterns across the codebase'
            });
        }

        return recommendations;
    }

    async run(validateOnly = false) {
        this.log('🚀 Starting Robust Error Prevention System...\n');
        
        try {
            // Get initial state
            const initialErrors = await this.getTypeScriptErrors();
            this.log(`📊 Initial error count: ${initialErrors.errorCount}`);
            
            if (validateOnly) {
                this.log('🔍 Running validation-only mode...');
                const errorFiles = await this.findFilesWithErrors();
                let hasViolations = false;
                
                for (const filePath of errorFiles.slice(0, 10)) { // Validate first 10 files
                    const content = fs.readFileSync(filePath, 'utf8');
                    const { violations } = this.validateFile(filePath, content);
                    if (violations.length > 0) {
                        hasViolations = true;
                        this.log(`❌ Violations found in ${filePath}: ${violations.length}`);
                    }
                }
                
                process.exit(hasViolations ? 1 : 0);
            }

            // Find files with errors
            const errorFiles = await this.findFilesWithErrors();
            this.log(`📁 Files with errors: ${errorFiles.length}`);
            
            if (errorFiles.length === 0) {
                this.log('✅ No error files found!');
                await this.installPreventionHooks();
                await this.generateComprehensiveReport();
                return;
            }

            // Process files with robust error handling
            let successCount = 0;
            let totalFixesApplied = 0;
            const failedFiles = [];

            // Process critical files first (components, forms, etc.)
            const criticalFiles = errorFiles.filter(f => 
                f.includes('components/') || f.includes('forms/') || f.includes('icons/')
            );
            const otherFiles = errorFiles.filter(f => !criticalFiles.includes(f));

            const allFilesToProcess = [...criticalFiles, ...otherFiles];

            for (const filePath of allFilesToProcess.slice(0, 50)) { // Process first 50 files
                const result = await this.processFile(filePath);
                
                if (result.success) {
                    if (result.changed) {
                        successCount++;
                        totalFixesApplied += result.fixes || 0;
                    }
                } else {
                    failedFiles.push({ file: filePath, error: result.error });
                }

                // Progress update every 10 files
                if ((successCount + failedFiles.length) % 10 === 0) {
                    const processed = successCount + failedFiles.length;
                    const progress = Math.round((processed / Math.min(allFilesToProcess.length, 50)) * 100);
                    this.log(`\n📈 Progress: ${progress}% (${processed}/${Math.min(allFilesToProcess.length, 50)})`);
                }
            }
            
            // Get final state
            const finalErrors = await this.getTypeScriptErrors();
            const errorReduction = initialErrors.errorCount - finalErrors.errorCount;
            
            this.log(`\n📊 Final error count: ${finalErrors.errorCount}`);
            this.log(`📈 Errors reduced by: ${errorReduction}`);
            
            // Install prevention hooks
            await this.installPreventionHooks();
            
            // Generate comprehensive report
            const report = await this.generateComprehensiveReport();
            
            // Summary
            this.log('\n🎯 ROBUST ERROR PREVENTION SYSTEM COMPLETE');
            this.log(`✅ Files successfully processed: ${successCount}`);
            this.log(`🔧 Total fixes applied: ${totalFixesApplied}`);
            this.log(`❌ Files with processing errors: ${failedFiles.length}`);
            this.log(`📉 Error reduction: ${errorReduction}`);
            this.log(`🔒 Prevention hooks installed: ${report.prevention.hooksInstalled}`);
            
            if (failedFiles.length > 0) {
                this.log('\n❌ Failed to process:');
                failedFiles.forEach(f => this.log(`  - ${f.file}: ${f.error}`));
            }

            // Recommendations
            if (report.recommendations.length > 0) {
                this.log('\n💡 Recommendations:');
                report.recommendations.forEach(rec => {
                    this.log(`  - ${rec.category} (${rec.priority}): ${rec.action}`);
                });
            }

        } catch (error) {
            this.log(`💥 Critical error in prevention system: ${error.message}`);
            process.exit(1);
        }
    }
}

// Command line handling
const args = process.argv.slice(2);
const validateOnly = args.includes('--validate-only');

if (require.main === module) {
    const system = new RobustErrorPreventionSystem();
    system.run(validateOnly).catch(console.error);
}

module.exports = RobustErrorPreventionSystem;