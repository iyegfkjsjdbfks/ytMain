import { Logger } from '../utils/Logger';
import * as fs from 'fs';
import * as path from 'path';

export interface ErrorResolutionConfig {
  projectRoot: string;
  dryRun: boolean;
  backupEnabled: boolean;
  validationEnabled: boolean;
  timeoutSeconds: number;
  maxRetries: number;
  rollbackOnFailure: boolean;
  continueOnValidationFailure: boolean;
  generateReports: boolean;
  reportFormats: ('json' | 'html' | 'markdown')[];
  customPatterns: CustomErrorPattern[];
  plugins: PluginConfig[];
}

export interface CustomErrorPattern {
  id: string;
  name: string;
  pattern: string;
  category: string;
  fixTemplate: string;
  enabled: boolean;
}

export interface PluginConfig {
  name: string;
  path: string;
  enabled: boolean;
  options: Record<string, any>;
}

export class ConfigManager {
  private logger: Logger;
  private configPath: string;
  private config: ErrorResolutionConfig;

  constructor(configPath?: string, logger?: Logger) {
    this.logger = logger || new Logger();
    this.configPath = configPath || path.join(process.cwd(), 'error-resolver.config.json');
    this.config = this.getDefaultConfig();
  }

  /**
   * Loads configuration from file
   */
  public async loadConfig(): Promise<ErrorResolutionConfig> {
    try {
      if (await this.fileExists(this.configPath)) {
        const configContent = await fs.promises.readFile(this.configPath, 'utf8');
        const fileConfig = JSON.parse(configContent);
        
        // Merge with defaults
        this.config = { ...this.getDefaultConfig(), ...fileConfig };
        
        this.logger.info('CONFIG', `Configuration loaded from ${this.configPath}`);
      } else {
        this.logger.info('CONFIG', 'Using default configuration');
      }
    } catch (error) {
      this.logger.error('CONFIG', `Failed to load configuration: ${error}`, error as Error);
      throw error;
    }
    
    return this.config;
  }

  /**
   * Saves configuration to file
   */
  public async saveConfig(config?: Partial<ErrorResolutionConfig>): Promise<void> {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    try {
      await fs.promises.writeFile(
        this.configPath,
        JSON.stringify(this.config, null, 2),
        'utf8'
      );
      
      this.logger.info('CONFIG', `Configuration saved to ${this.configPath}`);
    } catch (error) {
      this.logger.error('CONFIG', `Failed to save configuration: ${error}`, error as Error);
      throw error;
    }
  }

  /**
   * Gets current configuration
   */
  public getConfig(): ErrorResolutionConfig {
    return { ...this.config };
  }

  /**
   * Updates configuration
   */
  public updateConfig(updates: Partial<ErrorResolutionConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Adds a custom error pattern
   */
  public addCustomPattern(pattern: CustomErrorPattern): void {
    const existingIndex = this.config.customPatterns.findIndex(p => p.id === pattern.id);
    
    if (existingIndex >= 0) {
      this.config.customPatterns[existingIndex] = pattern;
    } else {
      this.config.customPatterns.push(pattern);
    }
    
    this.logger.info('CONFIG', `Added custom pattern: ${pattern.name}`);
  }

  /**
   * Removes a custom error pattern
   */
  public removeCustomPattern(patternId: string): void {
    const index = this.config.customPatterns.findIndex(p => p.id === patternId);
    
    if (index >= 0) {
      const pattern = this.config.customPatterns[index];
      this.config.customPatterns.splice(index, 1);
      this.logger.info('CONFIG', `Removed custom pattern: ${pattern.name}`);
    }
  }

  /**
   * Adds a plugin configuration
   */
  public addPlugin(plugin: PluginConfig): void {
    const existingIndex = this.config.plugins.findIndex(p => p.name === plugin.name);
    
    if (existingIndex >= 0) {
      this.config.plugins[existingIndex] = plugin;
    } else {
      this.config.plugins.push(plugin);
    }
    
    this.logger.info('CONFIG', `Added plugin: ${plugin.name}`);
  }

  /**
   * Removes a plugin configuration
   */
  public removePlugin(pluginName: string): void {
    const index = this.config.plugins.findIndex(p => p.name === pluginName);
    
    if (index >= 0) {
      this.config.plugins.splice(index, 1);
      this.logger.info('CONFIG', `Removed plugin: ${pluginName}`);
    }
  }

  /**
   * Validates configuration
   */
  public validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate project root
    if (!this.config.projectRoot || !path.isAbsolute(this.config.projectRoot)) {
      errors.push('Project root must be an absolute path');
    }
    
    // Validate timeout
    if (this.config.timeoutSeconds <= 0) {
      errors.push('Timeout must be greater than 0');
    }
    
    // Validate max retries
    if (this.config.maxRetries < 0) {
      errors.push('Max retries cannot be negative');
    }
    
    // Validate report formats
    const validFormats = ['json', 'html', 'markdown'];
    for (const format of this.config.reportFormats) {
      if (!validFormats.includes(format)) {
        errors.push(`Invalid report format: ${format}`);
      }
    }
    
    // Validate custom patterns
    for (const pattern of this.config.customPatterns) {
      if (!pattern.id || !pattern.name || !pattern.pattern) {
        errors.push(`Invalid custom pattern: ${pattern.id || 'unnamed'}`);
      }
      
      try {
        new RegExp(pattern.pattern);
      } catch (regexError) {
        errors.push(`Invalid regex pattern in ${pattern.id}: ${regexError}`);
      }
    }
    
    // Validate plugins
    for (const plugin of this.config.plugins) {
      if (!plugin.name || !plugin.path) {
        errors.push(`Invalid plugin configuration: ${plugin.name || 'unnamed'}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Creates a configuration template
   */
  public static createTemplate(projectRoot: string): ErrorResolutionConfig {
    return {
      projectRoot,
      dryRun: false,
      backupEnabled: true,
      validationEnabled: true,
      timeoutSeconds: 300,
      maxRetries: 2,
      rollbackOnFailure: true,
      continueOnValidationFailure: false,
      generateReports: true,
      reportFormats: ['json', 'html', 'markdown'],
      customPatterns: [
        {
          id: 'example-pattern',
          name: 'Example Custom Pattern',
          pattern: 'TS\\d+: Custom error pattern',
          category: 'Custom',
          fixTemplate: 'Fix template for custom pattern',
          enabled: false
        }
      ],
      plugins: [
        {
          name: 'example-plugin',
          path: './plugins/example-plugin.js',
          enabled: false,
          options: {
            option1: 'value1',
            option2: true
          }
        }
      ]
    };
  }

  /**
   * Gets default configuration
   */
  private getDefaultConfig(): ErrorResolutionConfig {
    return {
      projectRoot: process.cwd(),
      dryRun: false,
      backupEnabled: true,
      validationEnabled: true,
      timeoutSeconds: 300,
      maxRetries: 2,
      rollbackOnFailure: true,
      continueOnValidationFailure: false,
      generateReports: true,
      reportFormats: ['json', 'html', 'markdown'],
      customPatterns: [],
      plugins: []
    };
  }

  /**
   * Checks if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets configuration statistics
   */
  public getStatistics(): {
    configPath: string;
    hasCustomPatterns: boolean;
    customPatternCount: number;
    hasPlugins: boolean;
    pluginCount: number;
    enabledPlugins: number;
  } {
    return {
      configPath: this.configPath,
      hasCustomPatterns: this.config.customPatterns.length > 0,
      customPatternCount: this.config.customPatterns.length,
      hasPlugins: this.config.plugins.length > 0,
      pluginCount: this.config.plugins.length,
      enabledPlugins: this.config.plugins.filter(p => p.enabled).length
    };
  }
}