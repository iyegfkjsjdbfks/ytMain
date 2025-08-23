#!/usr/bin/env node

import { Command } from 'commander';
import { WorkflowCoordinator } from '../core/WorkflowCoordinator';
import { ErrorAnalyzer } from '../core/ErrorAnalyzer';
import { Logger } from '../utils/Logger';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

program
  .name('error-resolver')
  .description('TypeScript Error Resolution Tool')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze TypeScript errors in the project')
  .option('-p, --project <path>', 'Project root directory', process.cwd())
  .option('-o, --output <file>', 'Output file for analysis results')
  .option('--json', 'Output in JSON format')
  .action(async (options) => {
    const logger = new Logger();
    const analyzer = new ErrorAnalyzer(logger);
    
    try {
      console.log(`🔍 Analyzing TypeScript errors in ${options.project}...`);
      
      const errors = await analyzer.analyzeProject(options.project);
      
      const result = {
        timestamp: new Date().toISOString(),
        projectRoot: options.project,
        totalErrors: errors.length,
        errorsByCategory: analyzer.categorizeErrors(errors),
        errors: options.json ? errors : errors.slice(0, 10) // Limit output for readability
      };
      
      if (options.output) {
        await fs.promises.writeFile(options.output, JSON.stringify(result, null, 2));
        console.log(`📄 Analysis saved to ${options.output}`);
      } else {
        console.log(`\n📊 Analysis Results:`);
        console.log(`Total Errors: ${result.totalErrors}`);
        console.log(`Categories:`, result.errorsByCategory);
        
        if (!options.json && errors.length > 10) {
          console.log(`\n(Showing first 10 errors, use --json for full output)`);
        }
      }
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      process.exit(1);
    }
  });

program
  .command('fix')
  .description('Automatically fix TypeScript errors')
  .option('-p, --project <path>', 'Project root directory', process.cwd())
  .option('--dry-run', 'Show what would be fixed without making changes')
  .option('--no-backup', 'Skip creating backup before fixing')
  .option('--no-validation', 'Skip validation after fixing')
  .option('--timeout <seconds>', 'Timeout in seconds', '300')
  .option('--max-retries <count>', 'Maximum retry attempts', '2')
  .option('--continue-on-failure', 'Continue even if validation fails')
  .action(async (options) => {
    const logger = new Logger();
    const coordinator = new WorkflowCoordinator(logger);
    
    try {
      console.log(`🔧 Starting error resolution for ${options.project}...`);
      
      const config = {
        projectRoot: options.project,
        dryRun: options.dryRun || false,
        backupEnabled: !options.noBackup,
        validationEnabled: !options.noValidation,
        timeoutSeconds: parseInt(options.timeout),
        maxRetries: parseInt(options.maxRetries),
        rollbackOnFailure: true,
        continueOnValidationFailure: options.continueOnFailure || false,
        generateReports: true,
        reportFormats: ['json', 'html', 'markdown'] as const
      };
      
      const result = await coordinator.executeWorkflow([], config);
      
      console.log(`\n✅ Error resolution completed!`);
      console.log(`📊 Results:`);
      console.log(`  - Initial errors: ${result.initialErrorCount}`);
      console.log(`  - Errors fixed: ${result.errorsFixed}`);
      console.log(`  - Remaining errors: ${result.finalErrorCount}`);
      console.log(`  - Success rate: ${((result.errorsFixed / result.initialErrorCount) * 100).toFixed(1)}%`);
      console.log(`  - Execution time: ${(result.executionTime / 1000).toFixed(1)}s`);
      
      if (result.rollbackPerformed) {
        console.log(`⚠️  Rollback was performed due to errors`);
      }
      
      if (result.report) {
        console.log(`📄 Report generated: ${result.report.id}`);
      }
      
    } catch (error) {
      console.error('❌ Error resolution failed:', error);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate TypeScript project')
  .option('-p, --project <path>', 'Project root directory', process.cwd())
  .option('-s, --suite <name>', 'Validation suite to run', 'typescript-basic')
  .action(async (options) => {
    const { ValidationEngine } = await import('../core/ValidationEngine');
    const logger = new Logger();
    const validator = new ValidationEngine({}, logger);
    
    try {
      console.log(`🔍 Running validation suite: ${options.suite}...`);
      
      const report = await validator.runSuite(options.suite, {
        projectRoot: options.project
      });
      
      console.log(`\n📊 Validation Results:`);
      console.log(`Suite: ${report.suiteId}`);
      console.log(`Duration: ${(report.duration / 1000).toFixed(1)}s`);
      console.log(`Checks: ${report.passedChecks}/${report.totalChecks} passed`);
      console.log(`Overall: ${report.overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
      
      if (!report.overallSuccess) {
        console.log(`\n❌ Failed checks:`);
        report.results
          .filter(r => !r.success)
          .forEach(r => console.log(`  - ${r.type}: ${r.message}`));
      }
      
    } catch (error) {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    }
  });

program
  .command('report')
  .description('Generate error resolution report')
  .option('-i, --input <file>', 'Input analysis file')
  .option('-o, --output <dir>', 'Output directory', 'reports')
  .option('-f, --format <formats>', 'Report formats (json,html,markdown)', 'html,json')
  .action(async (options) => {
    const { ReportGenerator } = await import('../core/ReportGenerator');
    const logger = new Logger();
    const generator = new ReportGenerator({ outputDirectory: options.output }, logger);
    
    try {
      console.log(`📄 Generating report...`);
      
      // This would need actual execution data
      console.log(`Report generation requires execution data from the fix command.`);
      console.log(`Use 'error-resolver fix' to automatically generate reports.`);
      
    } catch (error) {
      console.error('❌ Report generation failed:', error);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Manage configuration')
  .option('--init', 'Initialize configuration file')
  .option('--show', 'Show current configuration')
  .action(async (options) => {
    const configPath = path.join(process.cwd(), 'error-resolver.config.json');
    
    if (options.init) {
      const defaultConfig = {
        projectRoot: process.cwd(),
        dryRun: false,
        backupEnabled: true,
        validationEnabled: true,
        timeoutSeconds: 300,
        maxRetries: 2,
        rollbackOnFailure: true,
        continueOnValidationFailure: false,
        generateReports: true,
        reportFormats: ['json', 'html', 'markdown']
      };
      
      await fs.promises.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
      console.log(`✅ Configuration file created: ${configPath}`);
    }
    
    if (options.show) {
      try {
        const config = JSON.parse(await fs.promises.readFile(configPath, 'utf8'));
        console.log('📋 Current configuration:');
        console.log(JSON.stringify(config, null, 2));
      } catch (error) {
        console.log('No configuration file found. Use --init to create one.');
      }
    }
  });

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

program.parse();