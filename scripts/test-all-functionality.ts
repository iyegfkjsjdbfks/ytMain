#!/usr/bin/env node

/**
 * Comprehensive Test Runner for YouTube Clone
 * Tests all core functionalities and generates detailed reports
 */

// TODO: Fix import - import { execSync } from 'child_process';
// TODO: Fix import - import fs from 'fs';
// TODO: Fix import - import path from 'path';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  errors?: string[];
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
}

class TestRunner {
  private results: TestSuite[] = [];
  private startTime: number = Date.now();

  async runAllTests(): Promise<void> {
    // Core functionality tests
    await this.runTestSuite('Core Application Functionality', [
      'tests/core-functionality.test.tsx',
    ]);

    // Video functionality tests
    await this.runTestSuite('Video Functionality', [
      'tests/video-functionality.test.tsx',
    ]);

    // Component tests
    await this.runTestSuite('Component Tests', [
      'src/components/**/*.test.tsx',
      'src/components/**/*.test.ts',
    ]);

    // Hook tests
    await this.runTestSuite('Custom Hooks', [
      'src/hooks/**/*.test.ts',
      'src/hooks/**/*.test.tsx',
    ]);

    // Service tests
    await this.runTestSuite('Services and APIs', [
      'src/services/**/*.test.ts',
      'src/lib/**/*.test.ts',
    ]);

    // Integration tests
    await this.runTestSuite('Integration Tests', [
      'tests/integration/**/*.test.tsx',
    ]);

    // Generate comprehensive report
    this.generateReport();
  }

  private async runTestSuite(suiteName: string, testPatterns: string[]): Promise<void> {
    const suiteStartTime = Date.now();

    const suite: TestSuite = {
      name: suiteName,
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      duration: 0,
    };

    try {
      // Run tests for each pattern
      for (const pattern of testPatterns) {
        try {
          const command = `npm run test -- "${pattern}" --reporter=json`;
          const output = execSync(command, {
            encoding: 'utf8',
            timeout: 60000, // 1 minute timeout per test pattern
          });

          // Parse test results
          const results = this.parseTestOutput(output);
          suite.tests.push(...results);

        } catch (error) {
          console.warn(`⚠️  Warning: Some tests in ${pattern} failed or timed out`);
          suite.tests.push({
            name: pattern,
            status: 'failed',
            duration: 0,
            errors: [error instanceof Error ? error.message : String(error)],
          });
        }
      }

      // Calculate suite statistics
      suite.totalTests = suite.tests.length;
      suite.passedTests = suite.tests.filter(t => t.status === 'passed').length;
      suite.failedTests = suite.tests.filter(t => t.status === 'failed').length;
      suite.skippedTests = suite.tests.filter(t => t.status === 'skipped').length;
      suite.duration = Date.now() - suiteStartTime;

      } catch (error) {
      console.error(`❌ Failed to run ${suiteName}:`, error);
      suite.tests.push({
        name: suiteName,
        status: 'failed',
        duration: Date.now() - suiteStartTime,
        errors: [error instanceof Error ? error.message : String(error)],
      });
    }

    this.results.push(suite);
  }

  private parseTestOutput(output: string): TestResult[] {
    const results: TestResult[] = [];

    try {
      // Try to parse JSON output from test runner
      const jsonOutput = JSON.parse(output);

      if (jsonOutput.testResults) {
        for (const testFile of jsonOutput.testResults) {
          for (const test of testFile.assertionResults || []) {
            results.push({
              name: test.title || test.fullName,
              status: test.status === 'passed' ? 'passed' :
                     test.status === 'skipped' ? 'skipped' : 'failed',
              duration: test.duration || 0,
              errors: test.failureMessages || [],
            });
          }
        }
      }
    } catch (error) {
      // Fallback: parse text output
      const lines = output.split('\n');

      for (const line of lines) {
        if (line.includes('✓') || line.includes('PASS')) {
          const testName = line.replace(/[✓✗]/g, '').trim();
          if (testName) {
            results.push({
              name: testName,
              status: 'passed',
              duration: 0,
            });
          }
        } else if (line.includes('✗') || line.includes('FAIL')) {
          const testName = line.replace(/[✓✗]/g, '').trim();
          if (testName) {
            results.push({
              name: testName,
              status: 'failed',
              duration: 0,
              errors: ['Test failed'],
            });
          }
        }
      }
    }

    return results;
  }

  private generateReport(): void {
    const totalDuration = Date.now() - this.startTime;
    const totalTests = this.results.reduce((sum, suite) => sum + suite.totalTests, 0);
    const totalPassed = this.results.reduce((sum, suite) => sum + suite.passedTests, 0);
    const totalFailed = this.results.reduce((sum, suite) => sum + suite.failedTests, 0);
    const totalSkipped = this.results.reduce((sum, suite) => sum + suite.skippedTests, 0);

    // Console report
    // Detailed suite results
    for (const suite of this.results) {
      if (suite.failedTests > 0) {
        suite.tests
          .filter(test => test.status === 'failed')
          .forEach(test => {
            if (test.errors && test.errors.length > 0) {
              test.errors.forEach(() => {
                });
            }
          });
      }
    }

    // Generate JSON report
    const reportData = {
      timestamp: new Date().toISOString(),
      totalDuration,
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        totalSkipped,
        passRate: ((totalPassed / totalTests) * 100).toFixed(1),
      },
      suites: this.results,
    };

    const reportPath = path.join(process.cwd(), 'test-reports', 'comprehensive-test-report.json');

    // Ensure reports directory exists
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    // Generate HTML report
    this.generateHtmlReport(reportData, reportsDir);

    // Exit with appropriate code
    if (totalFailed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }

  private generateHtmlReport(reportData: any, reportsDir: string): void {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouTube Clone Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .suite { margin-bottom: 30px; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; }
        .suite-header { background: #e9ecef; padding: 15px; font-weight: bold; }
        .suite-content { padding: 15px; }
        .test-item { padding: 10px; border-bottom: 1px solid #f1f3f4; }
        .test-item:last-child { border-bottom: none; }
        .test-passed { color: #28a745; }
        .test-failed { color: #dc3545; }
        .test-skipped { color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 YouTube Clone Test Report</h1>
            <p>Generated on ${new Date(reportData.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-value">${reportData.summary.totalTests}</div>
                <div>Total Tests</div>
            </div>
            <div class="stat-card">
                <div class="stat-value passed">${reportData.summary.totalPassed}</div>
                <div>Passed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value failed">${reportData.summary.totalFailed}</div>
                <div>Failed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${reportData.summary.passRate}%</div>
                <div>Pass Rate</div>
            </div>
        </div>
        
        ${reportData.suites.map((suite) => `
            <div class="suite">
                <div class="suite-header">
                    📋 ${suite.name} (${suite.passedTests}/${suite.totalTests} passed)
                </div>
                <div class="suite-content">
                    ${suite.tests.map((test) => `
                        <div class="test-item test-${test.status}">
                            <strong>${test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️'}</strong>
                            ${test.name}
                            ${test.errors && test.errors.length > 0 ? `<br><small style="color: #dc3545;">${test.errors[0]}</small>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;

    const htmlPath = path.join(reportsDir, 'test-report.html');
    fs.writeFileSync(htmlPath, htmlContent);
    }
}

// Run the tests
const runner = new TestRunner();
runner.runAllTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
