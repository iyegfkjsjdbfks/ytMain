/**
 * Custom Plugin Example for TypeScript Error Resolution System
 * 
 * This example demonstrates how to create custom plugins to extend
 * the error resolution capabilities for project-specific needs.
 */

import { BaseScriptGenerator, ScriptTemplate, GenerationContext } from '../src/error-resolution/generators/BaseScriptGenerator';
import { AnalyzedError, ScriptCommand, FixingScript } from '../src/error-resolution/types';
import { Logger } from '../src/error-resolution/utils/Logger';

/**
 * Example: Custom React-specific Error Generator
 * 
 * This plugin handles React-specific TypeScript errors like:
 * - Missing React import for JSX
 * - Incorrect prop types
 * - Missing key props in lists
 * - Hook dependency issues
 */
export class ReactErrorGenerator extends BaseScriptGenerator {
  constructor(logger?: Logger) {
    super(logger?.toString() || '');
  }

  public getCategory(): string {
    return 'React';
  }

  public canHandle(errors: AnalyzedError[]): boolean {
    return errors.some(error => 
      this.isReactError(error) || 
      this.isJSXError(error) ||
      this.isHookError(error)
    );
  }

  protected initializeTemplates(): void {
    // Template for missing React import
    this.addTemplate({
      id: 'missing-react-import',
      name: 'Add Missing React Import',
      description: 'Add React import for JSX usage',
      // pattern: /JSX element .* requires React/i,
      commands: [{
        type: 'insert',
        file: '',
        position: { line: 1, column: 0 },
        replacement: "import React from 'react';\n",
        description: 'Add React import for JSX'
      }],
      validationChecks: [{
        type: 'compilation',
        command: 'npx tsc --noEmit {file}',
        expectedResult: 'improved-count',
        timeoutSeconds: 30
      }]
    });

    // Template for missing key prop
    this.addTemplate({
      id: 'missing-key-prop',
      name: 'Add Missing Key Prop',
      description: 'Add key prop to JSX elements in arrays',
      pattern: /Warning: Each child in a list should have a unique "key" prop/i,
      commands: [{
        type: 'replace',
        file: '',
        pattern: /<(\w+)(\s[^>]*)?>/,
        replacement: '<$1$2 key={index}>',
        description: 'Add key prop to JSX element'
      }],
      validationChecks: [{
        type: 'lint',
        command: 'npx eslint {file}',
        expectedResult: 'improved-count',
        timeoutSeconds: 20
      }]
    });

    // Template for incorrect prop types
    this.addTemplate({
      id: 'prop-type-mismatch',
      name: 'Fix Prop Type Mismatch',
      description: 'Fix TypeScript prop type mismatches',
      pattern: /Type .* is not assignable to type .* of property/i,
      commands: [{
        type: 'replace',
        file: '',
        pattern: /(\w+):\s*(\w+)/,
        replacement: '$1: $2 | undefined',
        description: 'Make prop optional to fix type mismatch'
      }],
      validationChecks: [{
        type: 'compilation',
        command: 'npx tsc --noEmit {file}',
        expectedResult: 'improved-count',
        timeoutSeconds: 30
      }]
    });

    // Template for hook dependency issues
    this.addTemplate({
      id: 'hook-dependency',
      name: 'Fix Hook Dependencies',
      description: 'Add missing dependencies to React hooks',
      pattern: /React Hook .* has a missing dependency/i,
      commands: [{
        type: 'replace',
        file: '',
        pattern: /\[([^\]]*)\]/,
        replacement: '[$1, {missingDep}]',
        description: 'Add missing dependency to hook'
      }],
      validationChecks: [{
        type: 'lint',
        command: 'npx eslint {file} --rule "react-hooks/exhaustive-deps: error"',
        expectedResult: 'improved-count',
        timeoutSeconds: 20
      }]
    });
  }

  /**
   * Custom method to detect React-specific errors
   */
  private isReactError(error: AnalyzedError): boolean {
    const reactPatterns = [
      /JSX/i,
      /React/i,
      /component/i,
      /prop/i,
      /hook/i
    ];
    
    return reactPatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.code)
    );
  }

  /**
   * Custom method to detect JSX-related errors
   */
  private isJSXError(error: AnalyzedError): boolean {
    return error.message.includes('JSX') || 
           error.code === 'TS2304' && error.message.includes('React');
  }

  /**
   * Custom method to detect React Hook errors
   */
  private isHookError(error: AnalyzedError): boolean {
    return error.message.includes('Hook') || 
           error.message.includes('useEffect') ||
           error.message.includes('useState') ||
           error.message.includes('dependency');
  }

  /**
   * Override to add React-specific command generation
   */
  protected async generateCommandsForError(
    template: ScriptTemplate,
    error: AnalyzedError,
    context: GenerationContext
  ): Promise<{ commands: ScriptCommand[]; rollbackCommands: ScriptCommand[] }> {
    const baseResult = await super.generateCommandsForError(template, error, context);
    
    // Add React-specific enhancements
    if (template.id === 'missing-react-import') {
      // Check if React is already imported
      const fileContent = await this.readFile(error.file);
      if (fileContent.includes("import React")) {
        // React already imported, skip this fix
        return { commands: [], rollbackCommands: [] };
      }
    }
    
    return baseResult;
  }
}

/**
 * Example: Custom API Error Generator
 * 
 * This plugin handles API-related TypeScript errors like:
 * - Missing async/await for API calls
 * - Incorrect response type handling
 * - Missing error handling for API calls
 */
export class APIErrorGenerator extends BaseScriptGenerator {
  constructor(logger?: Logger) {
    super(logger?.toString() || '');
  }

  public getCategory(): string {
    return 'API';
  }

  public canHandle(errors: AnalyzedError[]): boolean {
    return errors.some(error => this.isAPIError(error));
  }

  protected initializeTemplates(): void {
    // Template for missing async/await
    this.addTemplate({
      id: 'missing-await',
      name: 'Add Missing Await',
      description: 'Add await keyword for Promise-returning functions',
      pattern: /Type 'Promise<.*>' is not assignable to type/i,
      commands: [{
        type: 'replace',
        file: '',
        pattern: /(\w+\([^)]*\))/,
        replacement: 'await $1',
        description: 'Add await keyword'
      }],
      validationChecks: [{
        type: 'compilation',
        command: 'npx tsc --noEmit {file}',
        expectedResult: 'improved-count',
        timeoutSeconds: 30
      }]
    });

    // Template for missing try-catch
    this.addTemplate({
      id: 'missing-error-handling',
      name: 'Add Error Handling',
      description: 'Add try-catch block for API calls',
      pattern: /Unhandled promise rejection/i,
      commands: [{
        type: 'replace',
        file: '',
        pattern: /(await\s+\w+\([^)]*\);?)/,
        replacement: 'try {\n  $1\n} catch (error) {\n  console.error("API Error:", error);\n  throw error;\n}',
        description: 'Add try-catch for error handling'
      }],
      validationChecks: [{
        type: 'compilation',
        command: 'npx tsc --noEmit {file}',
        expectedResult: 'improved-count',
        timeoutSeconds: 30
      }]
    });
  }

  private isAPIError(error: AnalyzedError): boolean {
    const apiPatterns = [
      /Promise/i,
      /async/i,
      /await/i,
      /fetch/i,
      /axios/i,
      /api/i
    ];
    
    return apiPatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.file)
    );
  }
}

/**
 * Plugin Registration Helper
 * 
 * This function demonstrates how to register custom plugins
 * with the error resolution system.
 */
export function registerCustomPlugins(coordinator: any) {
  // Register React plugin
  const reactGenerator = new ReactErrorGenerator();
  coordinator.registerGenerator('React', reactGenerator);
  
  // Register API plugin
  const apiGenerator = new APIErrorGenerator();
  coordinator.registerGenerator('API', apiGenerator);
  
  console.log('✅ Custom plugins registered successfully');
}

/**
 * Configuration Example for Custom Plugins
 * 
 * This shows how to configure the system to use custom plugins
 * through the configuration file.
 */
export const customPluginConfig = {
  "plugins": [
    {
      "name": "react-error-generator",
      "path": "./plugins/ReactErrorGenerator.js",
      "enabled": true,
      "options": {
        "strictMode": true,
        "addKeyProps": true,
        "enforceHookRules": true
      }
    },
    {
      "name": "api-error-generator", 
      "path": "./plugins/APIErrorGenerator.js",
      "enabled": true,
      "options": {
        "addErrorHandling": true,
        "enforceAsync": true,
        "timeoutMs": 5000
      }
    }
  ],
  "customPatterns": [
    {
      "id": "custom-react-pattern",
      "name": "Custom React Pattern",
      "pattern": "TS2786: 'React' refers to a UMD global",
      "category": "React",
      "fixTemplate": "Add React import statement",
      "enabled": true
    },
    {
      "id": "custom-api-pattern",
      "name": "Custom API Pattern", 
      "pattern": "TS2794: Expected 1 arguments, but got 0. Did you forget to include 'void'",
      "category": "API",
      "fixTemplate": "Add proper async/await handling",
      "enabled": true
    }
  ]
};

/**
 * Usage Example
 * 
 * This demonstrates how to use the custom plugins in practice.
 */
export async function useCustomPlugins() {
  const { WorkflowCoordinator } = await import('../src/error-resolution/core/WorkflowCoordinator');
  
  // Create coordinator
  const coordinator = new WorkflowCoordinator();
  
  // Register custom plugins
  registerCustomPlugins(coordinator);
  
  // Configure workflow with custom settings
  const config = {
    projectRoot: './react-project',
    dryRun: false,
    backupEnabled: true,
    validationEnabled: true,
    timeoutSeconds: 300,
    maxRetries: 2,
    rollbackOnFailure: true,
    continueOnValidationFailure: false,
    generateReports: true,
    reportFormats: ['json', 'html'] as const
  };
  
  try {
    console.log('🚀 Running error resolution with custom plugins...');
    
    const result = await coordinator.executeWorkflow([], config);
    
    console.log('✅ Custom plugin workflow completed:');
    console.log(`  - Errors fixed: ${result.errorsFixed}`);
    console.log(`  - Success: ${result.success}`);
    
  } catch (error) {
    console.error('❌ Custom plugin workflow failed:', error);
  }
}

// Export plugin classes for use in other files
// export { ReactErrorGenerator, APIErrorGenerator };

// CLI integration example (as comments)
/*

# To use custom plugins via CLI:

# 1. Create plugin files in a plugins directory
mkdir plugins
cp examples/custom-plugin.ts plugins/ReactErrorGenerator.ts

# 2. Update configuration to include plugins
error-resolver config --init
# Edit error-resolver.config.json to add plugin configuration

# 3. Run error resolution with custom plugins
error-resolver fix --project ./react-project

*/