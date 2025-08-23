import { Logger } from '../utils/Logger';
import { AnalyzedError, ScriptCommand } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export interface ImportInfo {
  importPath: string;
  importedItems: string[];
  isDefault: boolean;
  isNamespace: boolean;
  line: number;
  originalText: string;
}

export interface ModuleInfo {
  filePath: string;
  exports: string[];
  defaultExport?: string;
  hasNamespaceExport: boolean;
}

export interface ImportFixSuggestion {
  type: 'add-import' | 'fix-path' | 'fix-specifier' | 'remove-duplicate' | 'resolve-circular';
  description: string;
  commands: ScriptCommand[];
  confidence: number;
}

export class ImportFixer {
  private logger: Logger;
  private projectRoot: string;
  private moduleCache: Map<string, ModuleInfo> = new Map();
  private packageJsonCache: Map<string, any> = new Map();

  constructor(projectRoot: string, logger?: Logger) {
    this.logger = logger || new Logger();
    this.projectRoot = projectRoot;
  }

  /**
   * Fixes import-related errors
   */
  public async fixImportErrors(errors: AnalyzedError[]): Promise<ScriptCommand[]> {
    this.logger.info('IMPORT_FIXER', `Fixing ${errors.length} import-related errors`);
    
    const commands: ScriptCommand[] = [];
    
    // Build module cache
    await this.buildModuleCache();
    
    for (const error of errors) {
      try {
        const suggestions = await this.analyzeImportError(error);
        
        if (suggestions.length > 0) {
          // Use the highest confidence suggestion
          const bestSuggestion = suggestions.sort((a, b) => b.confidence - a.confidence)[0];
          commands.push(...bestSuggestion.commands);
          
          this.logger.debug('IMPORT_FIXER', 
            `Applied fix for ${error.code} in ${error.file}: ${bestSuggestion.description}`
          );
        } else {
          this.logger.warn('IMPORT_FIXER', 
            `No fix suggestions found for ${error.code} in ${error.file}: ${error.message}`
          );
        }
      } catch (fixError) {
        this.logger.error('IMPORT_FIXER', 
          `Failed to fix import error in ${error.file}: ${fixError}`, fixError as Error
        );
      }
    }
    
    // Remove duplicate imports
    const deduplicationCommands = await this.generateDeduplicationCommands(errors);
    commands.push(...deduplicationCommands);
    
    this.logger.info('IMPORT_FIXER', `Generated ${commands.length} import fix commands`);
    return commands;
  }

  /**
   * Analyzes a specific import error and suggests fixes
   */
  public async analyzeImportError(error: AnalyzedError): Promise<ImportFixSuggestion[]> {
    const suggestions: ImportFixSuggestion[] = [];
    
    // Read file content
    const fileContent = await fs.promises.readFile(error.file, 'utf8');
    const lines = fileContent.split('\n');
    const errorLine = lines[error.line - 1];
    
    // Analyze different types of import errors
    if (this.isModuleNotFoundError(error)) {
      suggestions.push(...await this.fixModuleNotFound(error, errorLine, fileContent));
    }
    
    if (this.isCannotResolveModuleError(error)) {
      suggestions.push(...await this.fixCannotResolveModule(error, errorLine, fileContent));
    }
    
    if (this.isImportNotFoundError(error)) {
      suggestions.push(...await this.fixImportNotFound(error, errorLine, fileContent));
    }
    
    if (this.isCircularDependencyError(error)) {
      suggestions.push(...await this.fixCircularDependency(error, fileContent));
    }
    
    if (this.isDuplicateImportError(error)) {
      suggestions.push(...await this.fixDuplicateImport(error, fileContent));
    }
    
    return suggestions;
  }

  /**
   * Fixes "Module not found" errors
   */
  private async fixModuleNotFound(
    error: AnalyzedError, 
    errorLine: string, 
    fileContent: string
  ): Promise<ImportFixSuggestion[]> {
    const suggestions: ImportFixSuggestion[] = [];
    
    // Extract module path from error message
    const modulePathMatch = error.message.match(/Cannot find module ['"]([^'"]+)['"]/);
    if (!modulePathMatch) return suggestions;
    
    const requestedModule = modulePathMatch[1];
    
    // Try to find similar modules
    const similarModules = await this.findSimilarModules(requestedModule);
    
    for (const similarModule of similarModules) {
      suggestions.push({
        type: 'fix-path',
        description: `Fix import path from '${requestedModule}' to '${similarModule.path}'`,
        commands: [{
          type: 'replace',
          file: error.file,
          pattern: new RegExp(`(['"])${this.escapeRegex(requestedModule)}\\1`, 'g'),
          replacement: `$1${similarModule.path}$1`,
          description: `Update import path to ${similarModule.path}`
        }],
        confidence: similarModule.confidence
      });
    }
    
    // Check if it's a missing npm package
    if (!requestedModule.startsWith('.') && !requestedModule.startsWith('/')) {
      const packageSuggestion = await this.suggestPackageInstallation(requestedModule);
      if (packageSuggestion) {
        suggestions.push(packageSuggestion);
      }
    }
    
    return suggestions;
  }

  /**
   * Fixes "Cannot resolve module" errors
   */
  private async fixCannotResolveModule(
    error: AnalyzedError,
    errorLine: string,
    fileContent: string
  ): Promise<ImportFixSuggestion[]> {
    const suggestions: ImportFixSuggestion[] = [];
    
    // Extract import statement
    const importMatch = errorLine.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/);
    if (!importMatch) return suggestions;
    
    const importPath = importMatch[1];
    
    // Try different path resolution strategies
    const resolvedPaths = await this.resolveModulePath(importPath, error.file);
    
    for (const resolvedPath of resolvedPaths) {
      suggestions.push({
        type: 'fix-path',
        description: `Resolve import path to '${resolvedPath.path}'`,
        commands: [{
          type: 'replace',
          file: error.file,
          pattern: new RegExp(`(['"])${this.escapeRegex(importPath)}\\1`),
          replacement: `$1${resolvedPath.path}$1`,
          description: `Update import path to ${resolvedPath.path}`
        }],
        confidence: resolvedPath.confidence
      });
    }
    
    return suggestions;
  }

  /**
   * Fixes "Import not found" errors
   */
  private async fixImportNotFound(
    error: AnalyzedError,
    errorLine: string,
    fileContent: string
  ): Promise<ImportFixSuggestion[]> {
    const suggestions: ImportFixSuggestion[] = [];
    
    // Extract imported item and module
    const importMatch = errorLine.match(/import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/);
    if (!importMatch) return suggestions;
    
    const namedImports = importMatch[1];
    const defaultImport = importMatch[2];
    const modulePath = importMatch[3];
    
    // Resolve the module
    const moduleInfo = await this.getModuleInfo(modulePath, error.file);
    if (!moduleInfo) return suggestions;
    
    if (namedImports) {
      // Handle named imports
      const importedItems = namedImports.split(',').map(item => item.trim());
      
      for (const item of importedItems) {
        const availableExports = moduleInfo.exports;
        const similarExports = this.findSimilarExports(item, availableExports);
        
        for (const similarExport of similarExports) {
          suggestions.push({
            type: 'fix-specifier',
            description: `Fix import specifier from '${item}' to '${similarExport.name}'`,
            commands: [{
              type: 'replace',
              file: error.file,
              pattern: new RegExp(`\\b${this.escapeRegex(item)}\\b`),
              replacement: similarExport.name,
              description: `Update import specifier to ${similarExport.name}`
            }],
            confidence: similarExport.confidence
          });
        }
      }
    }
    
    if (defaultImport && !moduleInfo.defaultExport) {
      // Suggest converting to named import
      if (moduleInfo.exports.length > 0) {
        const mainExport = moduleInfo.exports[0];
        suggestions.push({
          type: 'fix-specifier',
          description: `Convert default import to named import: { ${mainExport} }`,
          commands: [{
            type: 'replace',
            file: error.file,
            pattern: new RegExp(`import\\s+${this.escapeRegex(defaultImport)}\\s+from`),
            replacement: `import { ${mainExport} } from`,
            description: `Convert to named import`
          }],
          confidence: 0.7
        });
      }
    }
    
    return suggestions;
  }

  /**
   * Fixes circular dependency errors
   */
  private async fixCircularDependency(
    error: AnalyzedError,
    fileContent: string
  ): Promise<ImportFixSuggestion[]> {
    const suggestions: ImportFixSuggestion[] = [];
    
    // Detect circular dependencies
    const circularChain = await this.detectCircularDependencies(error.file);
    
    if (circularChain.length > 0) {
      // Suggest moving shared types to a separate file
      suggestions.push({
        type: 'resolve-circular',
        description: 'Extract shared types to break circular dependency',
        commands: await this.generateCircularDependencyFix(circularChain),
        confidence: 0.8
      });
    }
    
    return suggestions;
  }

  /**
   * Fixes duplicate import errors
   */
  private async fixDuplicateImport(
    error: AnalyzedError,
    fileContent: string
  ): Promise<ImportFixSuggestion[]> {
    const suggestions: ImportFixSuggestion[] = [];
    
    const imports = this.extractImports(fileContent);
    const duplicates = this.findDuplicateImports(imports);
    
    for (const duplicate of duplicates) {
      suggestions.push({
        type: 'remove-duplicate',
        description: `Merge duplicate imports from '${duplicate.module}'`,
        commands: await this.generateDuplicateRemovalCommands(duplicate, error.file),
        confidence: 0.9
      });
    }
    
    return suggestions;
  }

  /**
   * Finds similar modules based on fuzzy matching
   */
  private async findSimilarModules(requestedModule: string): Promise<Array<{
    path: string;
    confidence: number;
  }>> {
    const similar: Array<{ path: string; confidence: number }> = [];
    
    // Search in module cache
    for (const [modulePath] of this.moduleCache.entries()) {
      const confidence = this.calculateSimilarity(requestedModule, modulePath);
      if (confidence > 0.6) {
        similar.push({ path: modulePath, confidence });
      }
    }
    
    // Search for files with similar names
    const files = await this.findFilesInProject();
    for (const file of files) {
      const relativePath = path.relative(this.projectRoot, file);
      const withoutExt = relativePath.replace(/\.(ts|tsx|js|jsx)$/, '');
      
      const confidence = this.calculateSimilarity(requestedModule, withoutExt);
      if (confidence > 0.6) {
        similar.push({ path: './' + withoutExt, confidence });
      }
    }
    
    return similar.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }

  /**
   * Suggests package installation for missing npm packages
   */
  private async suggestPackageInstallation(packageName: string): Promise<ImportFixSuggestion | null> {
    // Check if package exists in package.json dependencies
    const packageJson = await this.getPackageJson();
    
    if (packageJson && 
        !packageJson.dependencies?.[packageName] && 
        !packageJson.devDependencies?.[packageName]) {
      
      return {
        type: 'add-import',
        description: `Install missing package: ${packageName}`,
        commands: [{
          type: 'replace', // This would be handled by a package manager command
          file: 'package.json',
          pattern: /"dependencies":\s*{/,
          replacement: `"dependencies": {\n    "${packageName}": "latest",`,
          description: `Add ${packageName} to dependencies`
        }],
        confidence: 0.5
      };
    }
    
    return null;
  }

  /**
   * Resolves module paths using different strategies
   */
  private async resolveModulePath(importPath: string, fromFile: string): Promise<Array<{
    path: string;
    confidence: number;
  }>> {
    const resolved: Array<{ path: string; confidence: number }> = [];
    
    if (importPath.startsWith('.')) {
      // Relative import
      const fromDir = path.dirname(fromFile);
      const absolutePath = path.resolve(fromDir, importPath);
      
      // Try different extensions
      const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
      
      for (const ext of extensions) {
        const fullPath = absolutePath + ext;
        if (await this.fileExists(fullPath)) {
          const relativePath = path.relative(fromDir, fullPath).replace(/\\/g, '/');
          resolved.push({
            path: relativePath.startsWith('.') ? relativePath : './' + relativePath,
            confidence: 0.9
          });
        }
      }
    }
    
    return resolved;
  }

  /**
   * Gets module information including exports
   */
  private async getModuleInfo(modulePath: string, fromFile: string): Promise<ModuleInfo | null> {
    // Check cache first
    if (this.moduleCache.has(modulePath)) {
      return this.moduleCache.get(modulePath)!;
    }
    
    let resolvedPath: string;
    
    if (modulePath.startsWith('.')) {
      // Relative path
      const fromDir = path.dirname(fromFile);
      resolvedPath = path.resolve(fromDir, modulePath);
      
      // Try different extensions
      const extensions = ['.ts', '.tsx', '.js', '.jsx'];
      let found = false;
      
      for (const ext of extensions) {
        const fullPath = resolvedPath + ext;
        if (await this.fileExists(fullPath)) {
          resolvedPath = fullPath;
          found = true;
          break;
        }
      }
      
      if (!found) {
        // Try index files
        for (const ext of extensions) {
          const indexPath = path.join(resolvedPath, `index${ext}`);
          if (await this.fileExists(indexPath)) {
            resolvedPath = indexPath;
            found = true;
            break;
          }
        }
      }
      
      if (!found) return null;
    } else {
      // Node module - would need more complex resolution
      return null;
    }
    
    try {
      const content = await fs.promises.readFile(resolvedPath, 'utf8');
      const moduleInfo = this.parseModuleExports(content, resolvedPath);
      
      this.moduleCache.set(modulePath, moduleInfo);
      return moduleInfo;
    } catch (error) {
      return null;
    }
  }

  /**
   * Parses module exports from file content
   */
  private parseModuleExports(content: string, filePath: string): ModuleInfo {
    const exports: string[] = [];
    let defaultExport: string | undefined;
    let hasNamespaceExport = false;
    
    // Parse export statements
    const exportMatches = content.match(/export\s+(?:(?:default\s+)?(?:class|function|const|let|var|interface|type|enum)\s+(\w+)|default\s+(\w+)|{\s*([^}]+)\s*})/g);
    
    if (exportMatches) {
      for (const match of exportMatches) {
        if (match.includes('export default')) {
          const defaultMatch = match.match(/export\s+default\s+(?:class|function)?\s*(\w+)/);
          if (defaultMatch) {
            defaultExport = defaultMatch[1];
          }
        } else {
          const namedMatch = match.match(/export\s+(?:class|function|const|let|var|interface|type|enum)\s+(\w+)/);
          if (namedMatch) {
            exports.push(namedMatch[1]);
          }
          
          const destructuredMatch = match.match(/export\s+{\s*([^}]+)\s*}/);
          if (destructuredMatch) {
            const items = destructuredMatch[1].split(',').map(item => item.trim().split(' as ')[0]);
            exports.push(...items);
          }
        }
      }
    }
    
    // Check for namespace export
    if (content.includes('export *')) {
      hasNamespaceExport = true;
    }
    
    return {
      filePath,
      exports,
      defaultExport,
      hasNamespaceExport
    };
  }

  /**
   * Finds similar exports using fuzzy matching
   */
  private findSimilarExports(requested: string, available: string[]): Array<{
    name: string;
    confidence: number;
  }> {
    const similar: Array<{ name: string; confidence: number }> = [];
    
    for (const exportName of available) {
      const confidence = this.calculateSimilarity(requested, exportName);
      if (confidence > 0.6) {
        similar.push({ name: exportName, confidence });
      }
    }
    
    return similar.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Detects circular dependencies
   */
  private async detectCircularDependencies(filePath: string): Promise<string[]> {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const chain: string[] = [];
    
    const dfs = async (currentFile: string): Promise<boolean> => {
      if (recursionStack.has(currentFile)) {
        // Found cycle
        const cycleStart = chain.indexOf(currentFile);
        return cycleStart >= 0;
      }
      
      if (visited.has(currentFile)) {
        return false;
      }
      
      visited.add(currentFile);
      recursionStack.add(currentFile);
      chain.push(currentFile);
      
      try {
        const content = await fs.promises.readFile(currentFile, 'utf8');
        const imports = this.extractImports(content);
        
        for (const importInfo of imports) {
          if (importInfo.importPath.startsWith('.')) {
            const resolvedPath = path.resolve(path.dirname(currentFile), importInfo.importPath);
            
            // Try different extensions
            const extensions = ['.ts', '.tsx', '.js', '.jsx'];
            for (const ext of extensions) {
              const fullPath = resolvedPath + ext;
              if (await this.fileExists(fullPath)) {
                if (await dfs(fullPath)) {
                  return true;
                }
                break;
              }
            }
          }
        }
      } catch (error) {
        // File not readable, skip
      }
      
      recursionStack.delete(currentFile);
      chain.pop();
      return false;
    };
    
    const hasCycle = await dfs(filePath);
    return hasCycle ? chain : [];
  }

  /**
   * Extracts import statements from file content
   */
  private extractImports(content: string): ImportInfo[] {
    const imports: ImportInfo[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const importMatch = line.match(/import\s+(?:(\w+)|{\s*([^}]+)\s*}|\*\s+as\s+(\w+))\s+from\s+['"]([^'"]+)['"]/);
      
      if (importMatch) {
        const defaultImport = importMatch[1];
        const namedImports = importMatch[2];
        const namespaceImport = importMatch[3];
        const importPath = importMatch[4];
        
        let importedItems: string[] = [];
        let isDefault = false;
        let isNamespace = false;
        
        if (defaultImport) {
          importedItems = [defaultImport];
          isDefault = true;
        } else if (namedImports) {
          importedItems = namedImports.split(',').map(item => item.trim());
        } else if (namespaceImport) {
          importedItems = [namespaceImport];
          isNamespace = true;
        }
        
        imports.push({
          importPath,
          importedItems,
          isDefault,
          isNamespace,
          line: i + 1,
          originalText: line.trim()
        });
      }
    }
    
    return imports;
  }

  /**
   * Finds duplicate imports
   */
  private findDuplicateImports(imports: ImportInfo[]): Array<{
    module: string;
    imports: ImportInfo[];
  }> {
    const groupedImports = new Map<string, ImportInfo[]>();
    
    for (const importInfo of imports) {
      if (!groupedImports.has(importInfo.importPath)) {
        groupedImports.set(importInfo.importPath, []);
      }
      groupedImports.get(importInfo.importPath)!.push(importInfo);
    }
    
    const duplicates: Array<{ module: string; imports: ImportInfo[] }> = [];
    
    for (const [module, moduleImports] of groupedImports.entries()) {
      if (moduleImports.length > 1) {
        duplicates.push({ module, imports: moduleImports });
      }
    }
    
    return duplicates;
  }

  /**
   * Generates commands to remove duplicate imports
   */
  private async generateDuplicateRemovalCommands(
    duplicate: { module: string; imports: ImportInfo[] },
    filePath: string
  ): Promise<ScriptCommand[]> {
    const commands: ScriptCommand[] = [];
    
    // Merge all imports into one
    const allItems = new Set<string>();
    let hasDefault = false;
    let hasNamespace = false;
    let defaultName = '';
    let namespaceName = '';
    
    for (const importInfo of duplicate.imports) {
      if (importInfo.isDefault) {
        hasDefault = true;
        defaultName = importInfo.importedItems[0];
      } else if (importInfo.isNamespace) {
        hasNamespace = true;
        namespaceName = importInfo.importedItems[0];
      } else {
        importInfo.importedItems.forEach(item => allItems.add(item));
      }
    }
    
    // Build merged import statement
    let mergedImport = 'import ';
    const parts: string[] = [];
    
    if (hasDefault) {
      parts.push(defaultName);
    }
    
    if (hasNamespace) {
      parts.push(`* as ${namespaceName}`);
    }
    
    if (allItems.size > 0) {
      parts.push(`{ ${Array.from(allItems).join(', ')} }`);
    }
    
    mergedImport += parts.join(', ') + ` from '${duplicate.module}';`;
    
    // Remove all duplicate imports and add merged one
    for (let i = 0; i < duplicate.imports.length; i++) {
      const importInfo = duplicate.imports[i];
      
      if (i === 0) {
        // Replace first import with merged import
        commands.push({
          type: 'replace',
          file: filePath,
          pattern: new RegExp(this.escapeRegex(importInfo.originalText)),
          replacement: mergedImport,
          description: `Merge duplicate imports from ${duplicate.module}`
        });
      } else {
        // Remove other imports
        commands.push({
          type: 'delete',
          file: filePath,
          position: { line: importInfo.line, column: 0 },
          description: `Remove duplicate import from ${duplicate.module}`
        });
      }
    }
    
    return commands;
  }

  /**
   * Generates commands to fix circular dependencies
   */
  private async generateCircularDependencyFix(circularChain: string[]): Promise<ScriptCommand[]> {
    const commands: ScriptCommand[] = [];
    
    // This is a complex operation that would involve:
    // 1. Analyzing shared types/interfaces
    // 2. Creating a new shared types file
    // 3. Updating imports in all files in the chain
    
    // For now, return a placeholder command
    commands.push({
      type: 'replace',
      file: circularChain[0],
      pattern: /\/\/ TODO: Fix circular dependency/,
      replacement: '// Circular dependency detected - manual intervention required',
      description: 'Mark circular dependency for manual resolution'
    });
    
    return commands;
  }

  /**
   * Generates commands to remove duplicate imports across files
   */
  private async generateDeduplicationCommands(errors: AnalyzedError[]): Promise<ScriptCommand[]> {
    const commands: ScriptCommand[] = [];
    const processedFiles = new Set<string>();
    
    for (const error of errors) {
      if (processedFiles.has(error.file)) continue;
      
      try {
        const content = await fs.promises.readFile(error.file, 'utf8');
        const imports = this.extractImports(content);
        const duplicates = this.findDuplicateImports(imports);
        
        for (const duplicate of duplicates) {
          const deduplicationCommands = await this.generateDuplicateRemovalCommands(duplicate, error.file);
          commands.push(...deduplicationCommands);
        }
        
        processedFiles.add(error.file);
      } catch (fileError) {
        this.logger.warn('IMPORT_FIXER', `Failed to process file ${error.file}: ${fileError}`);
      }
    }
    
    return commands;
  }

  /**
   * Builds cache of all modules in the project
   */
  private async buildModuleCache(): Promise<void> {
    this.logger.debug('IMPORT_FIXER', 'Building module cache...');
    
    const files = await this.findFilesInProject();
    
    for (const file of files) {
      try {
        const content = await fs.promises.readFile(file, 'utf8');
        const relativePath = path.relative(this.projectRoot, file);
        const moduleInfo = this.parseModuleExports(content, file);
        
        this.moduleCache.set(relativePath, moduleInfo);
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    this.logger.debug('IMPORT_FIXER', `Built cache for ${this.moduleCache.size} modules`);
  }

  /**
   * Finds all TypeScript/JavaScript files in the project
   */
  private async findFilesInProject(): Promise<string[]> {
    const files: string[] = [];
    
    const searchDir = async (dir: string): Promise<void> => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
            await searchDir(fullPath);
          }
        } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    };
    
    await searchDir(this.projectRoot);
    return files;
  }

  /**
   * Gets package.json content
   */
  private async getPackageJson(): Promise<any> {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    
    if (this.packageJsonCache.has(packageJsonPath)) {
      return this.packageJsonCache.get(packageJsonPath);
    }
    
    try {
      const content = await fs.promises.readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(content);
      this.packageJsonCache.set(packageJsonPath, packageJson);
      return packageJson;
    } catch (error) {
      return null;
    }
  }

  /**
   * Calculates similarity between two strings using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;
    
    const matrix: number[][] = [];
    
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    const maxLen = Math.max(len1, len2);
    return (maxLen - matrix[len1][len2]) / maxLen;
  }

  /**
   * Escapes special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
   * Error type detection methods
   */
  private isModuleNotFoundError(error: AnalyzedError): boolean {
    return error.message.includes('Cannot find module') || error.code === 'TS2307';
  }

  private isCannotResolveModuleError(error: AnalyzedError): boolean {
    return error.message.includes('Cannot resolve module') || error.code === 'TS2792';
  }

  private isImportNotFoundError(error: AnalyzedError): boolean {
    return error.message.includes('has no exported member') || error.code === 'TS2305';
  }

  private isCircularDependencyError(error: AnalyzedError): boolean {
    return error.message.includes('circular dependency') || error.code === 'TS2345';
  }

  private isDuplicateImportError(error: AnalyzedError): boolean {
    return error.message.includes('duplicate import') || error.message.includes('already imported');
  }
}