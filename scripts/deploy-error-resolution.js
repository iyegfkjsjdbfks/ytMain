#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const CONFIG_FILE = path.join(PROJECT_ROOT, 'error-resolver.config.json');

function runCommand(command) {
  console.log(`
Running command: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    return false;
  }
}

function installDependencies() {
    console.log('\nInstalling project dependencies...');
    if (!runCommand('npm install')) {
        console.error('Failed to install project dependencies. Aborting.');
        process.exit(1);
    }
}

function initializeConfig() {
  console.log('\nInitializing TypeScript Error Resolution configuration...');
  if (fs.existsSync(CONFIG_FILE)) {
    console.log('Configuration file already exists.');
    return;
  }

  const defaultConfig = {
    projectRoot: ".",
    dryRun: false,
    backupEnabled: true,
    validationEnabled: true,
    timeoutSeconds: 600,
    maxRetries: 2,
    rollbackOnFailure: true,
    continueOnValidationFailure: false,
    generateReports: true,
    reportFormats: ["json", "html", "markdown"],
    performance: {
        maxConcurrentProcesses: 4,
        memoryLimitMB: 4096,
        batchSize: 50,
        enableCaching: true
    }
  };

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
  console.log(`Configuration file created at: ${CONFIG_FILE}`);
}


function main() {
  console.log('🚀 Starting TypeScript Error Resolution System Deployment 🚀');

  installDependencies();
  initializeConfig();

  console.log('\n✅ Deployment setup complete.');
  console.log('You can now use the following scripts:');
  console.log(' - node scripts/fix-all-typescript-errors.js');
  console.log(' - node scripts/targeted-error-fix.js');
  console.log(' - node scripts/run-error-resolution.js');
  console.log('\nOr use the CLI:');
  console.log(' - npx error-resolver analyze --project .');
  console.log(' - npx error-resolver fix --project .');
}

if (require.main === module) {
  main();
}