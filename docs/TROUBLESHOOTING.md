# Troubleshooting Guide

This guide helps you resolve common issues when using the TypeScript Error Resolution system.

## Table of Contents

- [Common Issues](#common-issues)
- [Error Messages](#error-messages)
- [Performance Issues](#performance-issues)
- [Configuration Problems](#configuration-problems)
- [Integration Issues](#integration-issues)
- [Debugging](#debugging)
- [Getting Help](#getting-help)

## Common Issues

### 1. "No TypeScript errors found" but compilation fails

**Symptoms:**
- The analyzer reports 0 errors
- `tsc` command shows compilation errors
- Build process fails

**Causes:**
- TypeScript configuration issues
- Wrong project root directory
- Excluded files in tsconfig.json

**Solutions:**

```bash
# Check TypeScript configuration
npx tsc --showConfig

# Verify project structure
error-resolver analyze --project . --json

# Check if files are excluded
cat tsconfig.json | grep -A 10 "exclude"
```

**Fix:**
```bash
# Use correct project root
error-resolver analyze --project /path/to/actual/project

# Update tsconfig.json to include all files
# Remove overly restrictive exclude patterns
```

### 2. "Permission denied" errors during backup creation

**Symptoms:**
- Backup creation fails
- "EACCES" or "EPERM" errors
- Cannot create checkpoint

**Causes:**
- Insufficient file permissions
- Read-only file system
- Antivirus software interference

**Solutions:**

```bash
# Check file permissions
ls -la .error-resolution-backups/

# Fix permissions
chmod -R 755 .error-resolution-backups/

# Run with elevated permissions (if necessary)
sudo error-resolver fix --project .
```

### 3. Validation fails after successful fixes

**Symptoms:**
- Errors appear to be fixed
- Validation stage fails
- TypeScript compilation still shows errors

**Causes:**
- Incomplete fixes
- New errors introduced by fixes
- Cache issues

**Solutions:**

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache/
rm -f tsconfig.tsbuildinfo

# Run validation manually
npx tsc --noEmit --skipLibCheck

# Check for new errors
error-resolver analyze --project . --output post-fix-analysis.json
```

### 4. Process hangs or times out

**Symptoms:**
- Command never completes
- No progress updates
- CPU usage remains high

**Causes:**
- Large project size
- Infinite loops in error detection
- Network issues (for remote dependencies)

**Solutions:**

```bash
# Increase timeout
error-resolver fix --project . --timeout 1800

# Process in smaller batches
error-resolver fix --project ./src/components
error-resolver fix --project ./src/utils

# Use dry run to identify problematic files
error-resolver fix --project . --dry-run
```

### 5. Git integration issues

**Symptoms:**
- "Not a git repository" errors
- Rollback fails
- Checkpoint creation fails

**Causes:**
- Project not initialized with Git
- Git configuration issues
- Uncommitted changes

**Solutions:**

```bash
# Initialize Git repository
git init
git add .
git commit -m "Initial commit"

# Check Git status
git status

# Disable Git integration if not needed
error-resolver fix --project . --no-backup
```

## Error Messages

### TS2307: Cannot find module

**Error:** `TS2307: Cannot find module './missing-file'`

**Diagnosis:**
```bash
# Check if file exists
ls -la ./missing-file.ts ./missing-file.tsx ./missing-file/index.ts

# Check import paths
grep -r "missing-file" src/
```

**Solutions:**
- Create the missing file
- Fix the import path
- Add to tsconfig paths mapping

### TS2304: Cannot find name

**Error:** `TS2304: Cannot find name 'React'`

**Diagnosis:**
```bash
# Check imports
grep -n "import.*React" src/file.tsx

# Check dependencies
npm list react @types/react
```

**Solutions:**
```typescript
// Add missing import
import React from 'react';

// Or install missing dependency
npm install react @types/react
```

### TS2345: Argument of type X is not assignable to parameter of type Y

**Error:** Type mismatch in function calls

**Diagnosis:**
```bash
# Find the function definition
grep -r "functionName" src/ --include="*.ts" --include="*.tsx"

# Check type definitions
npx tsc --noEmit --listFiles | grep types
```

**Solutions:**
- Add type assertions: `value as ExpectedType`
- Fix the type definition
- Make the parameter optional: `param?: Type`

### Memory Issues

**Error:** `JavaScript heap out of memory`

**Diagnosis:**
```bash
# Check project size
find . -name "*.ts" -o -name "*.tsx" | wc -l
du -sh node_modules/

# Check Node.js memory usage
node --max-old-space-size=4096 $(which error-resolver) fix --project .
```

**Solutions:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=8192"

# Process in smaller chunks
error-resolver fix --project ./src/components
error-resolver fix --project ./src/pages

# Exclude large directories
echo "node_modules/" >> .gitignore
```

## Performance Issues

### Slow Analysis Phase

**Symptoms:**
- Analysis takes very long time
- High CPU usage during analysis
- Memory usage keeps growing

**Solutions:**

1. **Exclude unnecessary files:**
```json
// tsconfig.json
{
  "exclude": [
    "node_modules",
    "dist",
    "build",
    "coverage",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

2. **Use incremental compilation:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

3. **Process specific directories:**
```bash
# Instead of entire project
error-resolver analyze --project .

# Process specific directories
error-resolver analyze --project ./src/main
```

### Slow Execution Phase

**Symptoms:**
- Script execution takes very long
- Many retries and rollbacks
- Low success rate

**Solutions:**

1. **Optimize script generation:**
```bash
# Use dry run to identify issues
error-resolver fix --project . --dry-run

# Check generated scripts
ls -la error-resolution-reports/*/
```

2. **Adjust retry settings:**
```bash
# Reduce retries for faster execution
error-resolver fix --project . --max-retries 1

# Increase timeout for complex fixes
error-resolver fix --project . --timeout 600
```

### Slow Validation Phase

**Symptoms:**
- Validation takes longer than fixing
- Multiple validation failures
- Repeated compilation checks

**Solutions:**

1. **Skip validation for testing:**
```bash
error-resolver fix --project . --no-validation
```

2. **Use faster validation:**
```bash
# Skip lint checks
error-resolver validate --project . --suite typescript-basic
```

3. **Optimize TypeScript configuration:**
```json
// tsconfig.json for faster compilation
{
  "compilerOptions": {
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "noEmit": true
  }
}
```

## Configuration Problems

### Invalid Configuration File

**Error:** `Configuration validation failed`

**Diagnosis:**
```bash
# Check configuration syntax
cat error-resolver.config.json | jq .

# Validate configuration
error-resolver config --show
```

**Solutions:**
```bash
# Recreate configuration
rm error-resolver.config.json
error-resolver config --init

# Fix JSON syntax errors
# Use online JSON validator
```

### Plugin Loading Issues

**Error:** `Failed to load plugin: custom-plugin`

**Diagnosis:**
```bash
# Check plugin file exists
ls -la ./plugins/custom-plugin.js

# Check plugin syntax
node -c ./plugins/custom-plugin.js

# Check plugin exports
node -e "console.log(require('./plugins/custom-plugin.js'))"
```

**Solutions:**
```javascript
// Ensure proper plugin structure
module.exports = class CustomPlugin {
  constructor() {}
  
  getCategory() {
    return 'Custom';
  }
  
  canHandle(errors) {
    return true;
  }
};
```

### Path Resolution Issues

**Error:** `Cannot resolve project root`

**Diagnosis:**
```bash
# Check current directory
pwd

# Check if path exists
ls -la /path/to/project

# Check permissions
ls -ld /path/to/project
```

**Solutions:**
```bash
# Use absolute path
error-resolver fix --project /absolute/path/to/project

# Fix relative path
cd /correct/directory
error-resolver fix --project .
```

## Integration Issues

### CI/CD Pipeline Failures

**Symptoms:**
- Pipeline fails at error resolution step
- Different behavior in CI vs local
- Permission issues in containers

**Solutions:**

1. **Docker integration:**
```dockerfile
# Ensure proper permissions
RUN npm install -g typescript-error-resolution
RUN chmod +x /usr/local/bin/error-resolver

# Set working directory
WORKDIR /app
COPY . .
RUN error-resolver fix --project .
```

2. **GitHub Actions:**
```yaml
- name: Fix TypeScript Errors
  run: |
    npm install -g typescript-error-resolution
    error-resolver fix --project . --no-backup
  env:
    NODE_OPTIONS: "--max-old-space-size=4096"
```

3. **Jenkins:**
```groovy
stage('Fix Errors') {
    steps {
        sh '''
            export NODE_OPTIONS="--max-old-space-size=4096"
            npm install -g typescript-error-resolution
            error-resolver fix --project . --timeout 1800
        '''
    }
}
```

### IDE Integration Issues

**Symptoms:**
- VS Code extension not working
- IntelliJ plugin fails
- Different results in IDE vs CLI

**Solutions:**

1. **VS Code settings:**
```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

2. **Workspace configuration:**
```bash
# Ensure consistent TypeScript version
npm install typescript@latest
npx tsc --version
```

## Debugging

### Enable Debug Logging

```bash
# Enable verbose logging
DEBUG=* error-resolver fix --project .

# Enable specific component logging
DEBUG=error-resolution:* error-resolver fix --project .

# Save logs to file
error-resolver fix --project . 2>&1 | tee debug.log
```

### Analyze Generated Scripts

```bash
# Check generated scripts
ls -la error-resolution-reports/*/

# Review script commands
cat error-resolution-reports/*/report.json | jq '.executionDetails'
```

### Check System Resources

```bash
# Monitor memory usage
top -p $(pgrep -f error-resolver)

# Check disk space
df -h

# Monitor file handles
lsof -p $(pgrep -f error-resolver) | wc -l
```

### Validate Environment

```bash
# Check Node.js version
node --version

# Check TypeScript version
npx tsc --version

# Check npm configuration
npm config list

# Check system limits
ulimit -a
```

## Getting Help

### Collect Diagnostic Information

Before seeking help, collect this information:

```bash
# System information
echo "OS: $(uname -a)"
echo "Node: $(node --version)"
echo "NPM: $(npm --version)"
echo "TypeScript: $(npx tsc --version)"

# Project information
echo "Project size: $(find . -name '*.ts' -o -name '*.tsx' | wc -l) files"
echo "Dependencies: $(npm list --depth=0 | wc -l) packages"

# Error resolution information
error-resolver --version
error-resolver config --show

# Recent logs
tail -50 ~/.error-resolver/logs/latest.log
```

### Create Minimal Reproduction

1. Create a minimal project that reproduces the issue
2. Include only necessary files
3. Provide exact commands that cause the problem
4. Include error messages and logs

### Report Issues

When reporting issues, include:

- **Environment details** (OS, Node.js version, etc.)
- **Exact command used**
- **Complete error message**
- **Configuration file** (if relevant)
- **Sample code** that reproduces the issue
- **Expected vs actual behavior**

### Community Resources

- **GitHub Issues**: Report bugs and feature requests
- **GitHub Discussions**: Ask questions and share experiences
- **Stack Overflow**: Tag questions with `typescript-error-resolution`
- **Documentation**: Check the latest docs for updates

### Professional Support

For enterprise users requiring professional support:

- **Priority support** with guaranteed response times
- **Custom plugin development**
- **Integration consulting**
- **Training and workshops**

Contact: support@typescript-error-resolution.com

## Frequently Asked Questions

### Q: Can I use this with JavaScript projects?

A: Currently, the system is designed specifically for TypeScript projects. JavaScript support is planned for future releases.

### Q: Does this work with monorepos?

A: Yes, you can run the tool on individual packages within a monorepo or configure it to handle the entire monorepo structure.

### Q: Is it safe to use in production?

A: Yes, with proper configuration. Always enable backups and use dry-run mode first. The system includes comprehensive safety mechanisms.

### Q: How do I handle custom error patterns?

A: Use the configuration file to define custom error patterns and create custom plugins for complex scenarios.

### Q: Can I integrate this with my existing CI/CD pipeline?

A: Yes, the system provides examples for all major CI/CD platforms including GitHub Actions, Jenkins, GitLab CI, and Azure DevOps.

### Q: What happens if the process is interrupted?

A: The system includes graceful shutdown handling and can resume from checkpoints. Rollback capabilities ensure no data is lost.

### Q: How do I optimize performance for large projects?

A: Use incremental processing, exclude unnecessary files, increase memory limits, and process directories in batches.

### Q: Can I customize the validation rules?

A: Yes, you can create custom validation suites and configure which checks to run based on your project requirements.