/**
 * Integration Examples for TypeScript Error Resolution System
 * 
 * This file demonstrates how to integrate the error resolution system
 * with popular development tools and CI/CD pipelines.
 */

import { resolveTypeScriptErrors, WorkflowCoordinator, ErrorAnalyzer } from '../src/error-resolution';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Example 1: GitHub Actions Integration
 * 
 * This example shows how to integrate error resolution into a GitHub Actions workflow.
 */
export async function githubActionsIntegration() {
  console.log('🔄 GitHub Actions Integration Example');
  
  // Check if running in GitHub Actions
  const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
  
  if (isGitHubActions) {
    console.log('Running in GitHub Actions environment');
    
    // Set GitHub Actions outputs
    const setOutput = (name: string, value: string) => {
      console.log(`::set-output name=${name}::${value}`);
    };
    
    try {
      const result = await resolveTypeScriptErrors('./', {
        dryRun: false,
        backupEnabled: true,
        validationEnabled: true,
        generateReports: true
      });
      
      // Set outputs for use in subsequent steps
      setOutput('errors-fixed', result.errorsFixed.toString());
      setOutput('success-rate', ((result.errorsFixed / result.initialErrorCount) * 100).toFixed(1));
      setOutput('execution-time', (result.executionTime / 1000).toFixed(1));
      
      // Create job summary
      const summary = `
## TypeScript Error Resolution Results

- **Initial Errors**: ${result.initialErrorCount}
- **Errors Fixed**: ${result.errorsFixed}
- **Success Rate**: ${((result.errorsFixed / result.initialErrorCount) * 100).toFixed(1)}%
- **Execution Time**: ${(result.executionTime / 1000).toFixed(1)}s
- **Phases Completed**: ${result.phasesCompleted.length}

${result.success ? '✅ All errors resolved successfully!' : '⚠️ Some errors remain - manual review needed'}
      `;
      
      // Write to GitHub Actions summary
      if (process.env.GITHUB_STEP_SUMMARY) {
        await fs.promises.appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
      }
      
    } catch (error) {
      console.log(`::error::Error resolution failed: ${error}`);
      process.exit(1);
    }
  } else {
    console.log('Not running in GitHub Actions - simulating integration');
  }
}

/**
 * Example 2: VS Code Extension Integration
 * 
 * This example shows how to integrate with VS Code for real-time error resolution.
 */
export class VSCodeIntegration {
  private diagnostics: any[] = [];
  
  constructor() {
    console.log('🔧 VS Code Integration Example');
  }
  
  /**
   * Simulate VS Code diagnostic collection
   */
  public async collectDiagnostics(workspaceRoot: string) {
    const analyzer = new ErrorAnalyzer();
    const errors = await analyzer.analyzeProject(workspaceRoot);
    
    // Convert to VS Code diagnostic format
    this.diagnostics = errors.map(error => ({
      range: {
        start: { line: error.line - 1, character: error.column - 1 },
        end: { line: error.line - 1, character: error.column + 10 }
      },
      message: error.message,
      severity: error.severity === 'error' ? 0 : 1, // Error = 0, Warning = 1
      source: 'typescript-error-resolver',
      code: error.code
    }));
    
    console.log(`📊 Collected ${this.diagnostics.length} diagnostics`);
    return this.diagnostics;
  }
  
  /**
   * Simulate VS Code quick fix provider
   */
  public async provideQuickFixes(document: any, range: any) {
    const quickFixes = [];
    
    // Find relevant diagnostics
    const relevantDiagnostics = this.diagnostics.filter(diag => 
      this.rangesOverlap(diag.range, range)
    );
    
    for (const diagnostic of relevantDiagnostics) {
      quickFixes.push({
        title: `🔧 Auto-fix: ${diagnostic.code}`,
        kind: 'quickfix',
        diagnostics: [diagnostic],
        edit: {
          changes: {
            [document.uri]: [{
              range: diagnostic.range,
              newText: '// Auto-fixed by TypeScript Error Resolver'
            }]
          }
        }
      });
    }
    
    console.log(`💡 Provided ${quickFixes.length} quick fixes`);
    return quickFixes;
  }
  
  private rangesOverlap(range1: any, range2: any): boolean {
    return range1.start.line <= range2.end.line && range2.start.line <= range1.end.line;
  }
}

/**
 * Example 3: Webpack Plugin Integration
 * 
 * This example shows how to create a Webpack plugin for automatic error resolution.
 */
export class TypeScriptErrorResolverWebpackPlugin {
  private options: any;
  
  constructor(options = {}) {
    this.options = {
      enabled: true,
      dryRun: false,
      backupEnabled: true,
      ...options
    };
    
    console.log('📦 Webpack Plugin Integration Example');
  }
  
  apply(compiler: any) {
    compiler.hooks.beforeCompile.tapAsync(
      'TypeScriptErrorResolverPlugin',
      async (params: any, callback: Function) => {
        if (!this.options.enabled) {
          return callback();
        }
        
        console.log('🔍 Running TypeScript error resolution before compilation...');
        
        try {
          const result = await resolveTypeScriptErrors(compiler.context, {
            dryRun: this.options.dryRun,
            backupEnabled: this.options.backupEnabled,
            validationEnabled: false, // Skip validation to avoid conflicts
            generateReports: false
          });
          
          if (result.errorsFixed > 0) {
            console.log(`✅ Fixed ${result.errorsFixed} errors before compilation`);
          }
          
          callback();
        } catch (error) {
          console.warn(`⚠️ Error resolution failed: ${error}`);
          callback(); // Continue compilation even if error resolution fails
        }
      }
    );
  }
}

/**
 * Example 4: Jest Integration
 * 
 * This example shows how to integrate with Jest for pre-test error resolution.
 */
export async function jestIntegration() {
  console.log('🧪 Jest Integration Example');
  
  // Jest setup hook
  const setupJest = async () => {
    console.log('Setting up Jest with TypeScript error resolution...');
    
    // Run error resolution before tests
    try {
      const result = await resolveTypeScriptErrors('./', {
        dryRun: false,
        backupEnabled: true,
        validationEnabled: true,
        generateReports: false
      });
      
      if (result.errorsFixed > 0) {
        console.log(`✅ Fixed ${result.errorsFixed} errors before running tests`);
      }
      
    } catch (error) {
      console.warn(`⚠️ Pre-test error resolution failed: ${error}`);
    }
  };
  
  // Jest teardown hook
  const teardownJest = async () => {
    console.log('Cleaning up after Jest tests...');
    // Cleanup logic here
  };
  
  return { setupJest, teardownJest };
}

/**
 * Example 5: Docker Integration
 * 
 * This example shows how to use the error resolver in Docker containers.
 */
export function dockerIntegration() {
  console.log('🐳 Docker Integration Example');
  
  const dockerfile = `
# Dockerfile for TypeScript Error Resolution
FROM node:18-alpine

# Install TypeScript Error Resolver
RUN npm install -g typescript-error-resolution

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Run error resolution and build
RUN error-resolver fix --project . && npm run build

# Start application
CMD ["npm", "start"]
  `;
  
  const dockerCompose = `
version: '3.8'
services:
  typescript-fixer:
    build: .
    volumes:
      - ./src:/app/src
      - ./reports:/app/reports
    environment:
      - NODE_ENV=development
    command: >
      sh -c "
        error-resolver analyze --project . --output /app/reports/analysis.json &&
        error-resolver fix --project . &&
        error-resolver validate --project .
      "
  `;
  
  console.log('📄 Docker configuration generated');
  return { dockerfile, dockerCompose };
}

/**
 * Example 6: CI/CD Pipeline Integration
 * 
 * This example shows integration with various CI/CD systems.
 */
export class CICDIntegration {
  
  /**
   * Jenkins Pipeline Integration
   */
  public generateJenkinsfile(): string {
    return `
pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
                sh 'npm install -g typescript-error-resolution'
            }
        }
        
        stage('Analyze Errors') {
            steps {
                sh 'error-resolver analyze --project . --output analysis.json'
                archiveArtifacts artifacts: 'analysis.json'
            }
        }
        
        stage('Fix Errors') {
            steps {
                sh 'error-resolver fix --project .'
            }
        }
        
        stage('Validate') {
            steps {
                sh 'error-resolver validate --project .'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'error-resolution-reports/**/*'
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'error-resolution-reports',
                reportFiles: '*/report.html',
                reportName: 'Error Resolution Report'
            ])
        }
    }
}
    `;
  }
  
  /**
   * GitLab CI Integration
   */
  public generateGitLabCI(): string {
    return `
stages:
  - analyze
  - fix
  - validate
  - build
  - test

variables:
  NODE_VERSION: "18"

before_script:
  - npm ci
  - npm install -g typescript-error-resolution

analyze_errors:
  stage: analyze
  script:
    - error-resolver analyze --project . --output analysis.json
  artifacts:
    reports:
      junit: analysis.json
    paths:
      - analysis.json
    expire_in: 1 week

fix_errors:
  stage: fix
  script:
    - error-resolver fix --project .
  artifacts:
    paths:
      - src/
      - error-resolution-reports/
    expire_in: 1 week

validate_project:
  stage: validate
  script:
    - error-resolver validate --project .

build_project:
  stage: build
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week

test_project:
  stage: test
  script:
    - npm test
  coverage: '/Coverage: \\d+\\.\\d+%/'
    `;
  }
  
  /**
   * Azure DevOps Pipeline Integration
   */
  public generateAzurePipeline(): string {
    return `
trigger:
- main
- develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  nodeVersion: '18.x'

stages:
- stage: ErrorResolution
  displayName: 'TypeScript Error Resolution'
  jobs:
  - job: AnalyzeAndFix
    displayName: 'Analyze and Fix Errors'
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '$(nodeVersion)'
      displayName: 'Install Node.js'
    
    - script: |
        npm ci
        npm install -g typescript-error-resolution
      displayName: 'Install Dependencies'
    
    - script: |
        error-resolver analyze --project . --output $(Agent.TempDirectory)/analysis.json
      displayName: 'Analyze TypeScript Errors'
    
    - script: |
        error-resolver fix --project .
      displayName: 'Fix TypeScript Errors'
    
    - script: |
        error-resolver validate --project .
      displayName: 'Validate Fixes'
    
    - task: PublishBuildArtifacts@1
      inputs:
        pathToPublish: 'error-resolution-reports'
        artifactName: 'error-resolution-reports'
      displayName: 'Publish Error Resolution Reports'

- stage: Build
  displayName: 'Build and Test'
  dependsOn: ErrorResolution
  jobs:
  - job: BuildAndTest
    displayName: 'Build and Test'
    steps:
    - script: npm run build
      displayName: 'Build Project'
    
    - script: npm test
      displayName: 'Run Tests'
    `;
  }
}

/**
 * Example 7: Monitoring and Alerting Integration
 * 
 * This example shows how to integrate with monitoring systems.
 */
export class MonitoringIntegration {
  
  /**
   * Send metrics to monitoring system
   */
  public async sendMetrics(result: any) {
    const metrics = {
      timestamp: new Date().toISOString(),
      errorsFixed: result.errorsFixed,
      successRate: (result.errorsFixed / result.initialErrorCount) * 100,
      executionTime: result.executionTime,
      phasesCompleted: result.phasesCompleted.length
    };
    
    // Example: Send to DataDog
    await this.sendToDataDog(metrics);
    
    // Example: Send to Prometheus
    await this.sendToPrometheus(metrics);
    
    // Example: Send Slack notification
    await this.sendSlackNotification(result);
  }
  
  private async sendToDataDog(metrics: any) {
    console.log('📊 Sending metrics to DataDog:', metrics);
    // Implementation would use DataDog API
  }
  
  private async sendToPrometheus(metrics: any) {
    console.log('📈 Sending metrics to Prometheus:', metrics);
    // Implementation would use Prometheus client
  }
  
  private async sendSlackNotification(result: any) {
    const message = `
🔧 TypeScript Error Resolution Complete

• Errors Fixed: ${result.errorsFixed}/${result.initialErrorCount}
• Success Rate: ${((result.errorsFixed / result.initialErrorCount) * 100).toFixed(1)}%
• Execution Time: ${(result.executionTime / 1000).toFixed(1)}s
• Status: ${result.success ? '✅ Success' : '⚠️ Partial'}
    `;
    
    console.log('💬 Sending Slack notification:', message);
    // Implementation would use Slack API
  }
}

// Export all integration examples
export {
  githubActionsIntegration,
  VSCodeIntegration,
  TypeScriptErrorResolverWebpackPlugin,
  jestIntegration,
  dockerIntegration,
  CICDIntegration,
  MonitoringIntegration
};

// Usage example
async function runIntegrationExamples() {
  console.log('🔗 TypeScript Error Resolution - Integration Examples\n');
  
  await githubActionsIntegration();
  console.log('\n' + '='.repeat(50) + '\n');
  
  const vscode = new VSCodeIntegration();
  await vscode.collectDiagnostics('./');
  console.log('\n' + '='.repeat(50) + '\n');
  
  const cicd = new CICDIntegration();
  console.log('📋 Generated Jenkins pipeline');
  console.log('📋 Generated GitLab CI configuration');
  console.log('📋 Generated Azure DevOps pipeline');
  console.log('\n' + '='.repeat(50) + '\n');
  
  const monitoring = new MonitoringIntegration();
  console.log('📊 Monitoring integration configured');
}

if (require.main === module) {
  runIntegrationExamples().catch(console.error);
}