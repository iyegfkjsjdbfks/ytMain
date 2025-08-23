// utils - Enhanced Implementation
export interface UtilsConfig {
  enabled: boolean;
  options: Record<string, any>;
}

export class Utils {
  private config: UtilsConfig;

  constructor(config?: Partial<UtilsConfig>) {
    this.config = {
      enabled: true,
      options: {},
      ...config
    };
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  updateConfig(newConfig: Partial<UtilsConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): UtilsConfig {
    return { ...this.config };
  }
}

export const utils = new Utils();
export default utils;