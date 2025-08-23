import { Logger } from '../utils/Logger';
import { AnalyzedError, PerformanceMetrics } from '../types';
import { ValidationReport } from './ValidationEngine';
import { ExecutionResult } from './ExecutionOrchestrator';
import * as fs from 'fs';
import * as path from 'path';

export interface ErrorResolutionReport {
  id: string;
  timestamp: Date;
  summary: ReportSummary;
  errorAnalysis: ErrorAnalysisReport;
  executionDetails: ExecutionDetailsReport;
  validationResults: ValidationReport[];
  performanceMetrics: PerformanceMetrics;
  recommendations: string[];
  files: FileChangeReport[];
}

export interface ReportSummary {
  totalErrors: number;
  errorsFixed: number;
  errorsRemaining: number;
  successRate: number;
  executionTime: number;
  overallSuccess: boolean;
  phasesCompleted: number;
  phasesTotal: number;
}

export interface ErrorAnalysisReport {
  errorsByCategory: Record<string, number>;
  errorsByFile: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  mostCommonErrors: Array<{
    code: string;
    message: string;
    count: number;
    files: string[];
  }>;
  complexityAnalysis: {
    averageErrorsPerFile: number;
    filesWithMostErrors: Array<{
      file: string;
      errorCount: number;
    }>;
  };
}

export interface ExecutionDetailsReport {
  phases: Array<{
    name: string;
    status: string;
    duration: number;
    errorsProcessed: number;
    scriptsExecuted: number;
  }>;
  rollbacksPerformed: number;
  timeoutsOccurred: number;
  retryAttempts: number;
}

export interface FileChangeReport {
  file: string;
  changeType: 'modified' | 'created' | 'deleted';
  linesChanged: number;
  errorsFixed: number;
  beforeHash?: string;
  afterHash?: string;
  backupPath?: string;
}

export interface ReportConfig {
  outputDirectory: string;
  includeDetailedLogs: boolean;
  includeFileContents: boolean;
  generateHtmlReport: boolean;
  generateJsonReport: boolean;
  generateMarkdownReport: boolean;
  compressOldReports: boolean;
  maxReportsToKeep: number;
}

export class ReportGenerator {
  private logger: Logger;
  private config: ReportConfig;
  private reports: Map<string, ErrorResolutionReport> = new Map();

  constructor(config: Partial<ReportConfig> = {}, logger?: Logger) {
    this.logger = logger || new Logger();
    
    this.config = {
      outputDirectory: 'error-resolution-reports',
      includeDetailedLogs: true,
      includeFileContents: false,
      generateHtmlReport: true,
      generateJsonReport: true,
      generateMarkdownReport: true,
      compressOldReports: true,
      maxReportsToKeep: 50,
      ...config
    };

    this.initializeReportDirectory();
  }

  /**
   * Generates a comprehensive error resolution report
   */
  public async generateReport(
    initialErrors: AnalyzedError[],
    executionResult: ExecutionResult,
    validationResults: ValidationReport[],
    fileChanges: FileChangeReport[] = []
  ): Promise<ErrorResolutionReport> {
    const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.logger.info('REPORT', `Generating error resolution report: ${reportId}`);
    
    try {
      const report: ErrorResolutionReport = {
        id: reportId,
        timestamp: new Date(),
        summary: this.generateSummary(initialErrors, executionResult),
        errorAnalysis: this.generateErrorAnalysis(initialErrors),
        executionDetails: this.generateExecutionDetails(executionResult),
        validationResults,
        performanceMetrics: executionResult.performanceMetrics,
        recommendations: this.generateRecommendations(initialErrors, executionResult, validationResults),
        files: fileChanges
      };

      // Store report in memory
      this.reports.set(reportId, report);

      // Generate output files
      await this.writeReportFiles(report);

      // Cleanup old reports
      await this.cleanupOldReports();

      this.logger.info('REPORT', `Report generated successfully: ${reportId}`);
      return report;

    } catch (error) {
      this.logger.error('REPORT', `Failed to generate report: ${error}`, error as Error);
      throw error;
    }
  }

  /**
   * Generates a progress report during execution
   */
  public generateProgressReport(
    currentErrors: AnalyzedError[],
    initialErrorCount: number,
    elapsedTime: number,
    currentPhase: string
  ): {
    progress: number;
    errorsFixed: number;
    errorsRemaining: number;
    estimatedTimeRemaining: number;
    currentPhase: string;
  } {
    const errorsFixed = initialErrorCount - currentErrors.length;
    const progress = initialErrorCount > 0 ? (errorsFixed / initialErrorCount) * 100 : 100;
    
    // Estimate remaining time based on current progress
    const averageTimePerError = errorsFixed > 0 ? elapsedTime / errorsFixed : 30000; // 30s default
    const estimatedTimeRemaining = currentErrors.length * averageTimePerError;

    return {
      progress: Math.round(progress * 100) / 100,
      errorsFixed,
      errorsRemaining: currentErrors.length,
      estimatedTimeRemaining: Math.round(estimatedTimeRemaining),
      currentPhase
    };
  }

  /**
   * Generates a comparison report between before and after states
   */
  public generateComparisonReport(
    beforeErrors: AnalyzedError[],
    afterErrors: AnalyzedError[]
  ): {
    summary: {
      totalImprovement: number;
      errorReduction: number;
      newErrors: number;
      persistentErrors: number;
    };
    categoryComparison: Record<string, {
      before: number;
      after: number;
      improvement: number;
    }>;
    fileComparison: Record<string, {
      before: number;
      after: number;
      improvement: number;
    }>;
  } {
    const beforeByFile = this.groupErrorsByFile(beforeErrors);
    const afterByFile = this.groupErrorsByFile(afterErrors);
    const beforeByCategory = this.groupErrorsByCategory(beforeErrors);
    const afterByCategory = this.groupErrorsByCategory(afterErrors);

    // Calculate improvements
    const totalImprovement = beforeErrors.length - afterErrors.length;
    const newErrorsSet = new Set(afterErrors.map(e => `${e.file}:${e.line}:${e.code}`));
    const beforeErrorsSet = new Set(beforeErrors.map(e => `${e.file}:${e.line}:${e.code}`));
    
    const newErrors = afterErrors.filter(e => 
      !beforeErrorsSet.has(`${e.file}:${e.line}:${e.code}`)
    ).length;
    
    const persistentErrors = afterErrors.filter(e => 
      beforeErrorsSet.has(`${e.file}:${e.line}:${e.code}`)
    ).length;

    // Category comparison
    const categoryComparison: Record<string, any> = {};
    const allCategories = new Set([...Object.keys(beforeByCategory), ...Object.keys(afterByCategory)]);
    
    for (const category of allCategories) {
      const before = beforeByCategory[category] || 0;
      const after = afterByCategory[category] || 0;
      categoryComparison[category] = {
        before,
        after,
        improvement: before - after
      };
    }

    // File comparison
    const fileComparison: Record<string, any> = {};
    const allFiles = new Set([...Object.keys(beforeByFile), ...Object.keys(afterByFile)]);
    
    for (const file of allFiles) {
      const before = beforeByFile[file] || 0;
      const after = afterByFile[file] || 0;
      fileComparison[file] = {
        before,
        after,
        improvement: before - after
      };
    }

    return {
      summary: {
        totalImprovement,
        errorReduction: Math.max(0, totalImprovement),
        newErrors,
        persistentErrors
      },
      categoryComparison,
      fileComparison
    };
  }

  /**
   * Exports report to various formats
   */
  public async exportReport(reportId: string, formats: ('json' | 'html' | 'markdown' | 'csv')[]): Promise<string[]> {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error(`Report not found: ${reportId}`);
    }

    const exportedFiles: string[] = [];

    for (const format of formats) {
      try {
        const filePath = await this.exportToFormat(report, format);
        exportedFiles.push(filePath);
      } catch (error) {
        this.logger.error('EXPORT', `Failed to export report to ${format}: ${error}`, error as Error);
      }
    }

    return exportedFiles;
  }

  /**
   * Generates summary section
   */
  private generateSummary(initialErrors: AnalyzedError[], executionResult: ExecutionResult): ReportSummary {
    const totalErrors = initialErrors.length;
    const errorsFixed = executionResult.errorsFixed;
    const errorsRemaining = executionResult.errorsRemaining;
    const successRate = totalErrors > 0 ? (errorsFixed / totalErrors) * 100 : 100;

    return {
      totalErrors,
      errorsFixed,
      errorsRemaining,
      successRate: Math.round(successRate * 100) / 100,
      executionTime: executionResult.executionTime,
      overallSuccess: executionResult.success,
      phasesCompleted: executionResult.executedPhases.length,
      phasesTotal: executionResult.executedPhases.length + executionResult.failedPhases.length + executionResult.skippedPhases.length
    };
  }

  /**
   * Generates error analysis section
   */
  private generateErrorAnalysis(errors: AnalyzedError[]): ErrorAnalysisReport {
    const errorsByCategory = this.groupErrorsByCategory(errors);
    const errorsByFile = this.groupErrorsByFile(errors);
    const errorsBySeverity = this.groupErrorsBySeverity(errors);
    const mostCommonErrors = this.findMostCommonErrors(errors);
    
    const filesWithErrors = Object.keys(errorsByFile);
    const averageErrorsPerFile = filesWithErrors.length > 0 ? errors.length / filesWithErrors.length : 0;
    
    const filesWithMostErrors = Object.entries(errorsByFile)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([file, errorCount]) => ({ file, errorCount }));

    return {
      errorsByCategory,
      errorsByFile,
      errorsBySeverity,
      mostCommonErrors,
      complexityAnalysis: {
        averageErrorsPerFile: Math.round(averageErrorsPerFile * 100) / 100,
        filesWithMostErrors
      }
    };
  }

  /**
   * Generates execution details section
   */
  private generateExecutionDetails(executionResult: ExecutionResult): ExecutionDetailsReport {
    // This would need to be enhanced with actual phase data from ExecutionOrchestrator
    const phases = executionResult.executedPhases.map(phaseId => ({
      name: phaseId,
      status: 'completed',
      duration: 0, // Would need actual phase timing data
      errorsProcessed: 0, // Would need actual phase error data
      scriptsExecuted: 0 // Would need actual script count data
    }));

    return {
      phases,
      rollbacksPerformed: executionResult.rollbackPerformed ? 1 : 0,
      timeoutsOccurred: executionResult.performanceMetrics.timeoutCount,
      retryAttempts: 0 // Would need actual retry data
    };
  }

  /**
   * Generates recommendations based on results
   */
  private generateRecommendations(
    initialErrors: AnalyzedError[],
    executionResult: ExecutionResult,
    validationResults: ValidationReport[]
  ): string[] {
    const recommendations: string[] = [];

    // Success rate recommendations
    if (executionResult.success) {
      recommendations.push('✅ Error resolution completed successfully. Consider running validation checks regularly to maintain code quality.');
    } else {
      recommendations.push('⚠️ Error resolution was not fully successful. Review failed phases and consider manual intervention.');
    }

    // Performance recommendations
    if (executionResult.executionTime > 300000) { // 5 minutes
      recommendations.push('⏱️ Execution took longer than expected. Consider optimizing script generation or running in smaller batches.');
    }

    // Error pattern recommendations
    const errorsByCategory = this.groupErrorsByCategory(initialErrors);
    const topCategory = Object.entries(errorsByCategory).sort(([, a], [, b]) => b - a)[0];
    
    if (topCategory && topCategory[1] > initialErrors.length * 0.5) {
      recommendations.push(`🎯 Focus on ${topCategory[0]} errors - they represent ${Math.round((topCategory[1] / initialErrors.length) * 100)}% of all issues.`);
    }

    // Validation recommendations
    const failedValidations = validationResults.filter(v => !v.overallSuccess);
    if (failedValidations.length > 0) {
      recommendations.push(`🔍 ${failedValidations.length} validation suite(s) failed. Review validation results for additional issues.`);
    }

    // File-specific recommendations
    const errorsByFile = this.groupErrorsByFile(initialErrors);
    const problematicFiles = Object.entries(errorsByFile)
      .filter(([, count]) => count > 10)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    if (problematicFiles.length > 0) {
      recommendations.push(`📁 Consider refactoring these files with high error counts: ${problematicFiles.map(([file]) => path.basename(file)).join(', ')}`);
    }

    // Rollback recommendations
    if (executionResult.rollbackPerformed) {
      recommendations.push('🔄 A rollback was performed. Review the execution logs to understand what went wrong and consider a more conservative approach.');
    }

    return recommendations;
  }

  /**
   * Groups errors by category
   */
  private groupErrorsByCategory(errors: AnalyzedError[]): Record<string, number> {
    const groups: Record<string, number> = {};
    
    for (const error of errors) {
      const category = error.category.primary;
      groups[category] = (groups[category] || 0) + 1;
    }
    
    return groups;
  }

  /**
   * Groups errors by file
   */
  private groupErrorsByFile(errors: AnalyzedError[]): Record<string, number> {
    const groups: Record<string, number> = {};
    
    for (const error of errors) {
      groups[error.file] = (groups[error.file] || 0) + 1;
    }
    
    return groups;
  }

  /**
   * Groups errors by severity
   */
  private groupErrorsBySeverity(errors: AnalyzedError[]): Record<string, number> {
    const groups: Record<string, number> = {};
    
    for (const error of errors) {
      groups[error.severity] = (groups[error.severity] || 0) + 1;
    }
    
    return groups;
  }

  /**
   * Finds most common error patterns
   */
  private findMostCommonErrors(errors: AnalyzedError[]): Array<{
    code: string;
    message: string;
    count: number;
    files: string[];
  }> {
    const errorPatterns = new Map<string, {
      code: string;
      message: string;
      count: number;
      files: Set<string>;
    }>();

    for (const error of errors) {
      const key = `${error.code}:${error.message}`;
      
      if (errorPatterns.has(key)) {
        const pattern = errorPatterns.get(key)!;
        pattern.count++;
        pattern.files.add(error.file);
      } else {
        errorPatterns.set(key, {
          code: error.code,
          message: error.message,
          count: 1,
          files: new Set([error.file])
        });
      }
    }

    return Array.from(errorPatterns.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(pattern => ({
        code: pattern.code,
        message: pattern.message,
        count: pattern.count,
        files: Array.from(pattern.files)
      }));
  }

  /**
   * Writes report files in various formats
   */
  private async writeReportFiles(report: ErrorResolutionReport): Promise<void> {
    const reportDir = path.join(this.config.outputDirectory, report.id);
    await fs.promises.mkdir(reportDir, { recursive: true });

    if (this.config.generateJsonReport) {
      await this.writeJsonReport(report, reportDir);
    }

    if (this.config.generateMarkdownReport) {
      await this.writeMarkdownReport(report, reportDir);
    }

    if (this.config.generateHtmlReport) {
      await this.writeHtmlReport(report, reportDir);
    }
  }

  /**
   * Writes JSON report
   */
  private async writeJsonReport(report: ErrorResolutionReport, outputDir: string): Promise<void> {
    const filePath = path.join(outputDir, 'report.json');
    const jsonContent = JSON.stringify(report, null, 2);
    await fs.promises.writeFile(filePath, jsonContent, 'utf8');
    this.logger.debug('REPORT', `JSON report written: ${filePath}`);
  }

  /**
   * Writes Markdown report
   */
  private async writeMarkdownReport(report: ErrorResolutionReport, outputDir: string): Promise<void> {
    const filePath = path.join(outputDir, 'report.md');
    const markdown = this.generateMarkdownContent(report);
    await fs.promises.writeFile(filePath, markdown, 'utf8');
    this.logger.debug('REPORT', `Markdown report written: ${filePath}`);
  }

  /**
   * Writes HTML report
   */
  private async writeHtmlReport(report: ErrorResolutionReport, outputDir: string): Promise<void> {
    const filePath = path.join(outputDir, 'report.html');
    const html = this.generateHtmlContent(report);
    await fs.promises.writeFile(filePath, html, 'utf8');
    this.logger.debug('REPORT', `HTML report written: ${filePath}`);
  }

  /**
   * Generates Markdown content
   */
  private generateMarkdownContent(report: ErrorResolutionReport): string {
    const { summary, errorAnalysis, executionDetails, recommendations } = report;
    
    return `# Error Resolution Report

**Report ID:** ${report.id}  
**Generated:** ${report.timestamp.toISOString()}

## Summary

- **Total Errors:** ${summary.totalErrors}
- **Errors Fixed:** ${summary.errorsFixed}
- **Errors Remaining:** ${summary.errorsRemaining}
- **Success Rate:** ${summary.successRate}%
- **Execution Time:** ${this.formatDuration(summary.executionTime)}
- **Overall Success:** ${summary.overallSuccess ? '✅ Yes' : '❌ No'}

## Error Analysis

### Errors by Category
${Object.entries(errorAnalysis.errorsByCategory)
  .map(([category, count]) => `- **${category}:** ${count}`)
  .join('\n')}

### Most Common Errors
${errorAnalysis.mostCommonErrors
  .map((error, index) => `${index + 1}. **${error.code}:** ${error.message} (${error.count} occurrences)`)
  .join('\n')}

### Files with Most Errors
${errorAnalysis.complexityAnalysis.filesWithMostErrors
  .map((file, index) => `${index + 1}. ${path.basename(file.file)}: ${file.errorCount} errors`)
  .join('\n')}

## Execution Details

### Phases
${executionDetails.phases
  .map(phase => `- **${phase.name}:** ${phase.status} (${this.formatDuration(phase.duration)})`)
  .join('\n')}

## Recommendations

${recommendations.map(rec => `- ${rec}`).join('\n')}

## Performance Metrics

- **Average Fix Time:** ${this.formatDuration(report.performanceMetrics.averageFixTime)}
- **Success Rate:** ${report.performanceMetrics.successRate}%
- **Rollback Count:** ${report.performanceMetrics.rollbackCount}
- **Timeout Count:** ${report.performanceMetrics.timeoutCount}
`;
  }

  /**
   * Generates HTML content
   */
  private generateHtmlContent(report: ErrorResolutionReport): string {
    const { summary, errorAnalysis, recommendations } = report;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error Resolution Report - ${report.id}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .metric { background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #333; }
        .metric-label { color: #666; font-size: 0.9em; }
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .error { color: #dc3545; }
        .section { margin-bottom: 30px; }
        .chart-placeholder { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
        ul { padding-left: 20px; }
        li { margin-bottom: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Error Resolution Report</h1>
        <p><strong>Report ID:</strong> ${report.id}</p>
        <p><strong>Generated:</strong> ${report.timestamp.toLocaleString()}</p>
    </div>

    <div class="section">
        <h2>Summary</h2>
        <div class="summary">
            <div class="metric">
                <div class="metric-value">${summary.totalErrors}</div>
                <div class="metric-label">Total Errors</div>
            </div>
            <div class="metric">
                <div class="metric-value success">${summary.errorsFixed}</div>
                <div class="metric-label">Errors Fixed</div>
            </div>
            <div class="metric">
                <div class="metric-value ${summary.errorsRemaining > 0 ? 'warning' : 'success'}">${summary.errorsRemaining}</div>
                <div class="metric-label">Errors Remaining</div>
            </div>
            <div class="metric">
                <div class="metric-value ${summary.successRate >= 80 ? 'success' : summary.successRate >= 50 ? 'warning' : 'error'}">${summary.successRate}%</div>
                <div class="metric-label">Success Rate</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Error Analysis</h2>
        <h3>Errors by Category</h3>
        <ul>
            ${Object.entries(errorAnalysis.errorsByCategory)
              .map(([category, count]) => `<li><strong>${category}:</strong> ${count}</li>`)
              .join('')}
        </ul>
        
        <h3>Most Common Errors</h3>
        <ol>
            ${errorAnalysis.mostCommonErrors
              .map(error => `<li><strong>${error.code}:</strong> ${error.message} (${error.count} occurrences)</li>`)
              .join('')}
        </ol>
    </div>

    <div class="section">
        <h2>Recommendations</h2>
        <ul>
            ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>Performance Metrics</h2>
        <ul>
            <li><strong>Average Fix Time:</strong> ${this.formatDuration(report.performanceMetrics.averageFixTime)}</li>
            <li><strong>Success Rate:</strong> ${report.performanceMetrics.successRate}%</li>
            <li><strong>Rollback Count:</strong> ${report.performanceMetrics.rollbackCount}</li>
            <li><strong>Timeout Count:</strong> ${report.performanceMetrics.timeoutCount}</li>
        </ul>
    </div>
</body>
</html>`;
  }

  /**
   * Exports report to specific format
   */
  private async exportToFormat(report: ErrorResolutionReport, format: string): Promise<string> {
    const timestamp = report.timestamp.toISOString().replace(/[:.]/g, '-');
    const filename = `error-resolution-report-${timestamp}.${format}`;
    const filePath = path.join(this.config.outputDirectory, filename);

    switch (format) {
      case 'json':
        await fs.promises.writeFile(filePath, JSON.stringify(report, null, 2), 'utf8');
        break;
      case 'markdown':
        await fs.promises.writeFile(filePath, this.generateMarkdownContent(report), 'utf8');
        break;
      case 'html':
        await fs.promises.writeFile(filePath, this.generateHtmlContent(report), 'utf8');
        break;
      case 'csv':
        await fs.promises.writeFile(filePath, this.generateCsvContent(report), 'utf8');
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    return filePath;
  }

  /**
   * Generates CSV content
   */
  private generateCsvContent(report: ErrorResolutionReport): string {
    const headers = ['Category', 'Count', 'Percentage'];
    const rows = Object.entries(report.errorAnalysis.errorsByCategory)
      .map(([category, count]) => [
        category,
        count.toString(),
        ((count / report.summary.totalErrors) * 100).toFixed(2) + '%'
      ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Formats duration in human readable format
   */
  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Initializes report directory
   */
  private async initializeReportDirectory(): Promise<void> {
    try {
      await fs.promises.mkdir(this.config.outputDirectory, { recursive: true });
    } catch (error) {
      this.logger.error('REPORT', `Failed to initialize report directory: ${error}`, error as Error);
      throw error;
    }
  }

  /**
   * Cleans up old reports
   */
  private async cleanupOldReports(): Promise<void> {
    try {
      const entries = await fs.promises.readdir(this.config.outputDirectory, { withFileTypes: true });
      const reportDirs = entries
        .filter(entry => entry.isDirectory() && entry.name.startsWith('report-'))
        .map(entry => ({
          name: entry.name,
          path: path.join(this.config.outputDirectory, entry.name)
        }));

      if (reportDirs.length > this.config.maxReportsToKeep) {
        // Sort by creation time (newest first)
        const sortedDirs = reportDirs.sort((a, b) => b.name.localeCompare(a.name));
        const toDelete = sortedDirs.slice(this.config.maxReportsToKeep);

        for (const dir of toDelete) {
          await fs.promises.rm(dir.path, { recursive: true, force: true });
          this.logger.debug('REPORT', `Deleted old report directory: ${dir.name}`);
        }
      }
    } catch (error) {
      this.logger.warn('REPORT', `Failed to cleanup old reports: ${error}`);
    }
  }

  /**
   * Gets report statistics
   */
  public getStatistics(): {
    totalReports: number;
    outputDirectory: string;
    config: ReportConfig;
  } {
    return {
      totalReports: this.reports.size,
      outputDirectory: this.config.outputDirectory,
      config: this.config
    };
  }
}