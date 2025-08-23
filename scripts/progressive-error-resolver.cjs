#!/usr/bin/env node

/**
 * Progressive Error Resolver - Master Orchestration Script
 * 
 * Orchestrates the systematic resolution of TypeScript errors in stages:
 * Stage 1: Syntax Error Elimination (TS1005, TS1128, TS1109)
 * Stage 2: JSX Structure Fixing (TS1382, TS17002, TS1381)
 * Stage 3: Import Resolution (TS1138, TS2307)
 * Stage 4: Type Safety Enhancement (TS2xxx)
 * 
 * Features:
 * - Progressive error reduction with validation between stages
 * - Comprehensive backup and rollback system
 * - Real-time progress monitoring
 * - Detailed reporting and analytics
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

class ProgressiveErrorResolver {
    constructor() {
        this.startTime = Date.now();
        this.backupDir = '.error-fix-backups';
        this.logFile = 'progressive-resolver.log';
        this.reportFile = 'progressive-resolver-report.json';
        
        this.stages = [
            {
                id: 'stage1',
                name: 'Syntax Error Elimination',
                script: 'syntax-error-eliminator.cjs',
                description: 'Fix TS1005, TS1128, TS1109 errors',
                expectedReduction: 70
            },
            {
                id: 'stage2',
                name: 'JSX Structure Fixing',
                script: 'jsx-structure-fixer.cjs',
                description: 'Fix TS1382, TS17002, TS1381 errors',
                expectedReduction: 15
            },
            {
                id: 'stage3',
                name: 'Import Resolution',
                script: 'import-resolver.cjs',
                description: 'Fix TS1138, TS2307 import errors',
                expectedReduction: 10
            },
            {
                id: 'stage4',
                name: 'Type Safety Enhancement',
                script: 'type-safety-enhancer.cjs',
                description: 'Fix TS2xxx type errors',
                expectedReduction: 5
            }
        ];
        
        this.results = {
            initialErrors: 0,
            finalErrors: 0,
            stageResults: [],
            totalDuration: 0,
            success: false
        };
        
        // Ensure backup directory exists
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
        
        this.log('=== Progressive Error Resolver Started ===');
    }
    
    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        fs.appendFileSync(this.logFile, logMessage + '\n');
    }
    
    validateTypeScript() {
        try {
            this.log('🔍 Running TypeScript validation...');
            const output = execSync('npx tsc --noEmit 2>&1', { encoding: 'utf8' });
            
            if (output.trim() === '') {
                return { success: true, errors: 0, output: '' };
            } else {
                const errorCount = (output.match(/error TS\d+:/g) || []).length;
                return { success: false, errors: errorCount, output };
            }
        } catch (error) {
            const errorOutput = error.stdout || error.message;
            const errorCount = (errorOutput.match(/error TS\d+:/g) || []).length;
            return { success: false, errors: errorCount, output: errorOutput };
        }
    }
    
    createSystemBackup() {
        try {
            const backupTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const systemBackupDir = path.join(this.backupDir, `system-backup-${backupTimestamp}`);
            
            this.log(`📦 Creating system backup at ${systemBackupDir}`);
            
            // Read corrupted files list
            const corruptedFilesPath = 'corrupted-files-to-delete.txt';
            if (!fs.existsSync(corruptedFilesPath)) {
                this.log('❌ corrupted-files-to-delete.txt not found');
                return false;
            }
            
            const content = fs.readFileSync(corruptedFilesPath, 'utf8');
            const filesToBackup = content.split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('#'))
                .map(line => {
                    const match = line.match(/^(.+?)\s*\(\d+\s+errors\)$/);
                    return match ? match[1].trim() : line;
                });
            
            fs.mkdirSync(systemBackupDir, { recursive: true });
            
            let backedUpCount = 0;
            for (const filePath of filesToBackup) {
                if (fs.existsSync(filePath)) {
                    const relativePath = path.relative(process.cwd(), filePath);
                    const backupPath = path.join(systemBackupDir, relativePath);
                    const backupDir = path.dirname(backupPath);
                    
                    if (!fs.existsSync(backupDir)) {
                        fs.mkdirSync(backupDir, { recursive: true });
                    }
                    
                    fs.copyFileSync(filePath, backupPath);
                    backedUpCount++;
                }
            }
            
            this.log(`✅ System backup completed: ${backedUpCount} files backed up`);
            return systemBackupDir;
            
        } catch (error) {
            this.log(`❌ System backup failed: ${error.message}`);
            return false;
        }
    }
    
    runStage(stage) {
        return new Promise((resolve, reject) => {
            const stageStartTime = Date.now();
            this.log(`\n🚀 Starting ${stage.name} (${stage.id})`);
            this.log(`📋 ${stage.description}`);
            
            const scriptPath = path.join('scripts', stage.script);
            
            if (!fs.existsSync(scriptPath)) {
                this.log(`❌ Script not found: ${scriptPath}`);
                resolve({
                    stage: stage.id,
                    success: false,
                    error: 'Script not found',
                    duration: 0,
                    errorsBefore: 0,
                    errorsAfter: 0,
                    reduction: 0
                });
                return;
            }
            
            // Validate before stage
            const beforeValidation = this.validateTypeScript();
            this.log(`📊 Errors before ${stage.name}: ${beforeValidation.errors}`);
            
            // Run the stage script
            const child = spawn('node', [scriptPath], {
                stdio: ['inherit', 'pipe', 'pipe'],
                cwd: process.cwd()
            });
            
            let output = '';
            let errorOutput = '';
            
            child.stdout.on('data', (data) => {
                const text = data.toString();
                output += text;
                process.stdout.write(text);
            });
            
            child.stderr.on('data', (data) => {
                const text = data.toString();
                errorOutput += text;
                process.stderr.write(text);
            });
            
            child.on('close', (code) => {
                const stageDuration = Math.round((Date.now() - stageStartTime) / 1000);
                
                // Validate after stage
                const afterValidation = this.validateTypeScript();
                const errorReduction = beforeValidation.errors - afterValidation.errors;
                const reductionPercentage = beforeValidation.errors > 0 
                    ? Math.round((errorReduction / beforeValidation.errors) * 100) 
                    : 0;
                
                this.log(`📊 Errors after ${stage.name}: ${afterValidation.errors}`);
                this.log(`📈 Error reduction: ${errorReduction} (${reductionPercentage}%)`);
                this.log(`⏱️  Stage duration: ${stageDuration} seconds`);
                
                const result = {
                    stage: stage.id,
                    name: stage.name,
                    success: code === 0 && errorReduction >= 0,
                    exitCode: code,
                    duration: stageDuration,
                    errorsBefore: beforeValidation.errors,
                    errorsAfter: afterValidation.errors,
                    reduction: errorReduction,
                    reductionPercentage,
                    expectedReduction: stage.expectedReduction,
                    metExpectation: reductionPercentage >= stage.expectedReduction * 0.5, // 50% of expected
                    output: output.substring(0, 1000), // Limit output size
                    error: errorOutput.substring(0, 500)
                };
                
                if (result.success) {
                    this.log(`✅ ${stage.name} completed successfully`);
                } else {
                    this.log(`❌ ${stage.name} failed or had issues`);
                }
                
                resolve(result);
            });
            
            child.on('error', (error) => {
                this.log(`❌ Failed to start ${stage.name}: ${error.message}`);
                resolve({
                    stage: stage.id,
                    name: stage.name,
                    success: false,
                    error: error.message,
                    duration: 0,
                    errorsBefore: beforeValidation.errors,
                    errorsAfter: beforeValidation.errors,
                    reduction: 0,
                    reductionPercentage: 0
                });
            });
        });
    }
    
    shouldContinueToNextStage(stageResult) {
        // Continue if:
        // 1. Stage was successful
        // 2. Some error reduction was achieved
        // 3. No critical failures occurred
        
        if (!stageResult.success) {
            this.log(`⚠️  Stage ${stageResult.name} failed, but checking if we should continue...`);
        }
        
        if (stageResult.reduction > 0) {
            this.log(`✅ Error reduction achieved (${stageResult.reduction}), continuing to next stage`);
            return true;
        }
        
        if (stageResult.errorsAfter === 0) {
            this.log(`🎉 No errors remaining, skipping remaining stages`);
            return false;
        }
        
        if (stageResult.exitCode !== 0) {
            this.log(`❌ Stage failed with exit code ${stageResult.exitCode}, stopping progression`);
            return false;
        }
        
        this.log(`⚠️  No error reduction in ${stageResult.name}, but continuing to next stage`);
        return true;
    }
    
    generateFinalReport() {
        const endTime = Date.now();
        const totalDuration = Math.round((endTime - this.startTime) / 1000);
        
        const report = {
            timestamp: new Date().toISOString(),
            totalDuration: `${totalDuration} seconds`,
            initialErrors: this.results.initialErrors,
            finalErrors: this.results.finalErrors,
            totalReduction: this.results.initialErrors - this.results.finalErrors,
            totalReductionPercentage: this.results.initialErrors > 0 
                ? Math.round(((this.results.initialErrors - this.results.finalErrors) / this.results.initialErrors) * 100)
                : 0,
            success: this.results.finalErrors === 0,
            stageResults: this.results.stageResults,
            summary: {
                stagesCompleted: this.results.stageResults.length,
                successfulStages: this.results.stageResults.filter(r => r.success).length,
                totalErrorsFixed: this.results.stageResults.reduce((sum, r) => sum + r.reduction, 0),
                averageReductionPerStage: this.results.stageResults.length > 0 
                    ? Math.round(this.results.stageResults.reduce((sum, r) => sum + r.reductionPercentage, 0) / this.results.stageResults.length)
                    : 0
            }
        };
        
        fs.writeFileSync(this.reportFile, JSON.stringify(report, null, 2));
        
        this.log('\n' + '='.repeat(60));
        this.log('🎯 PROGRESSIVE ERROR RESOLUTION FINAL REPORT');
        this.log('='.repeat(60));
        this.log(`⏱️  Total Duration: ${report.totalDuration}`);
        this.log(`📊 Initial Errors: ${report.initialErrors}`);
        this.log(`📊 Final Errors: ${report.finalErrors}`);
        this.log(`📈 Total Reduction: ${report.totalReduction} (${report.totalReductionPercentage}%)`);
        this.log(`🎯 Stages Completed: ${report.summary.stagesCompleted}/${this.stages.length}`);
        this.log(`✅ Successful Stages: ${report.summary.successfulStages}`);
        this.log(`🔧 Total Errors Fixed: ${report.summary.totalErrorsFixed}`);
        
        this.log('\n📋 STAGE BREAKDOWN:');
        this.results.stageResults.forEach(stage => {
            const status = stage.success ? '✅' : '❌';
            this.log(`   ${status} ${stage.name}: ${stage.reduction} errors (${stage.reductionPercentage}%) in ${stage.duration}s`);
        });
        
        if (report.success) {
            this.log('\n🎉 SUCCESS: All TypeScript errors have been eliminated!');
            this.log('🚀 Your codebase is now TypeScript error-free!');
        } else if (report.totalReduction > 0) {
            this.log(`\n✅ SIGNIFICANT PROGRESS: Reduced errors by ${report.totalReductionPercentage}%`);
            this.log(`📋 Remaining errors: ${report.finalErrors}`);
            this.log('💡 Consider manual review for remaining complex errors');
        } else {
            this.log('\n⚠️  LIMITED PROGRESS: Minimal error reduction achieved');
            this.log('🔍 Manual investigation and custom fixes may be required');
        }
        
        this.log('='.repeat(60));
        
        return report;
    }
    
    async run() {
        try {
            this.log('🚀 Starting Progressive Error Resolution Process...');
            
            // Create system backup
            const backupDir = this.createSystemBackup();
            if (!backupDir) {
                this.log('❌ Failed to create system backup. Aborting for safety.');
                return;
            }
            
            // Initial validation
            const initialValidation = this.validateTypeScript();
            this.results.initialErrors = initialValidation.errors;
            this.log(`📊 Initial TypeScript errors: ${this.results.initialErrors}`);
            
            if (this.results.initialErrors === 0) {
                this.log('🎉 No TypeScript errors found! Your codebase is already clean.');
                return;
            }
            
            // Run each stage
            for (let i = 0; i < this.stages.length; i++) {
                const stage = this.stages[i];
                const stageResult = await this.runStage(stage);
                this.results.stageResults.push(stageResult);
                
                // Check if we should continue
                if (stageResult.errorsAfter === 0) {
                    this.log('🎉 All errors eliminated! Stopping progression.');
                    break;
                }
                
                if (!this.shouldContinueToNextStage(stageResult)) {
                    this.log(`🛑 Stopping progression after ${stage.name}`);
                    break;
                }
                
                // Brief pause between stages
                if (i < this.stages.length - 1) {
                    this.log('⏸️  Pausing 2 seconds before next stage...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
            
            // Final validation
            const finalValidation = this.validateTypeScript();
            this.results.finalErrors = finalValidation.errors;
            this.results.success = finalValidation.success;
            
            // Generate and display final report
            this.generateFinalReport();
            
        } catch (error) {
            this.log(`❌ Fatal error in progressive resolution: ${error.message}`);
            console.error(error);
        }
    }
}

// Run the script
if (require.main === module) {
    const resolver = new ProgressiveErrorResolver();
    resolver.run().catch(console.error);
}

module.exports = ProgressiveErrorResolver;