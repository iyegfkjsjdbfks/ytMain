/**
 * Advanced Feature Flag System
 * Provides controlled feature rollouts, A/B testing, and dynamic configuration
 * with real-time monitoring and automatic rollback capabilities.
 */

import { advancedAPM } from './advancedMonitoring';
import { performanceMonitor } from './performanceMonitor';

// Types for feature flag system
interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'json' | 'percentage';
  defaultValue: any;
  enabled: boolean;
  rolloutStrategy: RolloutStrategy;
  targeting: TargetingRule[];
  variants?: FlagVariant[];
  metadata: {
    createdAt: number;
    updatedAt: number;
    createdBy: string;
    tags: string[];
    environment: string;
  };
  monitoring: {
    trackEvents: boolean;
    trackPerformance: boolean;
    alertThresholds: AlertThreshold[];
  };
  schedule?: {
    startTime?: number;
    endTime?: number;
    timezone: string;
  };
}

interface RolloutStrategy {
  type: 'immediate' | 'gradual' | 'scheduled' | 'user-based' | 'geographic';
  _config: {
    percentage?: number;
    incrementPercentage?: number;
    incrementInterval?: number; // minutes
    userGroups?: string[];
    geoTargets?: string[];
    customRules?: string[];
  };
}

interface TargetingRule {
  id: string;
  name: string;
  conditions: TargetingCondition[];
  operator: 'AND' | 'OR';
  value: any;
  enabled: boolean;
}

interface TargetingCondition {
  attribute: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'regex';
  value: any;
}

interface FlagVariant {
  id: string;
  name: string;
  value: any;
  weight: number; // 0-100
  description?: string;
}

interface AlertThreshold {
  metric: string;
  operator: 'gt' | 'lt' | 'eq';
  value: number;
  action: 'notify' | 'disable' | 'rollback';
}

interface UserContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
  deviceType?: string;
  browserType?: string;
  customAttributes?: Record<string, any>;
}

interface FlagEvaluation {
  flagId: string;
  userId?: string;
  value: any;
  variant?: string;
  reason: string;
  timestamp: number;
  _context: UserContext;
}

interface ABTestResult {
  flagId: string;
  variant: string;
  metric: string;
  value: number;
  sampleSize: number;
  confidence: number;
  significantDifference: boolean;
  winningVariant?: string;
}

/**
 * Advanced Feature Flag Manager
 */
class AdvancedFeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map();
  private evaluationCache: Map<string, { value: any; expiry: number }> = new Map();
  private evaluationHistory: FlagEvaluation[] = [];
  private abTestResults: Map<string, ABTestResult[]> = new Map();
  private isRunning = false;
  private rolloutTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.setupDefaultFlags();
  }

  /**
   * Start the feature flag system
   */
  start(): void {
    if (this.isRunning) {
return undefined;
}

    this.isRunning = true;
    this.startMonitoring();
    this.startRolloutScheduler();

    console.log('🚩 Advanced feature flag system started');
  }

  /**
   * Stop the feature flag system
   */
  stop(): void {
    this.isRunning = false;

    // Clear all timers
    this.rolloutTimers.forEach(timer => clearTimeout(timer));
    this.rolloutTimers.clear();

    console.log('🚩 Advanced feature flag system stopped');
  }

  /**
   * Create or update a feature flag
   */
  createFlag(flag: Omit<FeatureFlag, 'metadata'> & { metadata?: Partial<FeatureFlag['metadata']> }): void {
    const now = Date.now();
    const fullFlag: FeatureFlag = {
      ...flag,
      metadata: {
        createdAt: this.flags.has(flag.id) ? this.flags.get(flag.id)!.metadata.createdAt : now,
        updatedAt: now,
        createdBy: 'system',
        tags: flag.metadata?.tags || [],
        environment: process.env.NODE_ENV || 'development',
      },
    };

    this.flags.set(flag.id, fullFlag);
    this.clearEvaluationCache(flag.id);

    // Start rollout if gradual
    if (fullFlag.rolloutStrategy.type === 'gradual') {
      this.startGradualRollout(fullFlag);
    }

    console.log(`🚩 Feature flag '${flag.name}' created/updated`);

    advancedAPM.recordMetric('feature-flag-created', 1, {
      flagId: flag.id,
      flagName: flag.name,
      type: flag.type,
    });
  }

  /**
   * Evaluate a feature flag for a user
   */
  evaluateFlag(flagId: string, _context: UserContext = {}, defaultValue?: any): any {
    const flag = this.flags.get(flagId);
    if (!flag) {
      console.warn(`🚩 Feature flag '${flagId}' not found`);
      return defaultValue !== undefined ? defaultValue : false;
    }

    // Check cache first
    const cacheKey = this.getCacheKey(flagId, context);
    const cached = this.evaluationCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }

    // Evaluate flag
    const evaluation = this.performEvaluation(flag, context);

    // Cache result (5 minute TTL)
    this.evaluationCache.set(cacheKey, {
      value: evaluation.value,
      expiry: Date.now() + 5 * 60 * 1000,
    });

    // Record evaluation
    this.evaluationHistory.push(evaluation);

    // Keep only last 10000 evaluations
    if (this.evaluationHistory.length > 10000) {
      this.evaluationHistory.splice(0, this.evaluationHistory.length - 10000);
    }

    // Track metrics
    if (flag.monitoring.trackEvents) {
      advancedAPM.recordMetric('feature-flag-evaluation', 1, {
        flagId,
        value: String(evaluation.value),
        variant: evaluation.variant || 'default',
        reason: evaluation.reason,
      });
    }

    // Track performance impact
    if (flag.monitoring.trackPerformance) {
      this.trackPerformanceImpact(flagId, evaluation.value);
    }

    return evaluation.value;
  }

  /**
   * Get all feature flags
   */
  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  /**
   * Get feature flag by ID
   */
  getFlag(flagId: string): FeatureFlag | undefined {
    return this.flags.get(flagId);
  }

  /**
   * Delete a feature flag
   */
  deleteFlag(flagId: string): boolean {
    const deleted = this.flags.delete(flagId);
    if (deleted) {
      this.clearEvaluationCache(flagId);

      // Clear rollout timer
      const timer = this.rolloutTimers.get(flagId);
      if (timer) {
        clearTimeout(timer);
        this.rolloutTimers.delete(flagId);
      }

      console.log(`🚩 Feature flag '${flagId}' deleted`);
    }
    return deleted;
  }

  /**
   * Update flag rollout percentage
   */
  updateRolloutPercentage(flagId: string, percentage: number): void {
    const flag = this.flags.get(flagId);
    if (!flag) {
      throw new Error(`Feature flag '${flagId}' not found`);
    }

    flag.rolloutStrategy._config.percentage = Math.max(0, Math.min(100, percentage));
    flag.metadata.updatedAt = Date.now();

    this.clearEvaluationCache(flagId);

    console.log(`🚩 Updated rollout percentage for '${flagId}' to ${percentage}%`);

    advancedAPM.recordMetric('feature-flag-rollout-updated', 1, {
      flagId,
      percentage: percentage.toString(),
    });
  }

  /**
   * Enable/disable a feature flag
   */
  toggleFlag(flagId: string, enabled: boolean): void {
    const flag = this.flags.get(flagId);
    if (!flag) {
      throw new Error(`Feature flag '${flagId}' not found`);
    }

    flag.enabled = enabled;
    flag.metadata.updatedAt = Date.now();

    this.clearEvaluationCache(flagId);

    console.log(`🚩 Feature flag '${flagId}' ${enabled ? 'enabled' : 'disabled'}`);

    advancedAPM.recordMetric('feature-flag-toggled', 1, {
      flagId,
      enabled: enabled.toString(),
    });
  }

  /**
   * Get evaluation analytics
   */
  getEvaluationAnalytics(flagId?: string, hours = 24): {
    totalEvaluations: number;
    uniqueUsers: number;
    variantDistribution: Record<string, number>;
    conversionRates: Record<string, number>;
    performanceImpact: {
      averageLoadTime: number;
      errorRate: number;
    };
  } {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    let evaluations = this.evaluationHistory.filter(e => e.timestamp > cutoff);

    if (flagId) {
      evaluations = evaluations.filter(e => e.flagId === flagId);
    }

    const uniqueUsers = new Set(evaluations.map(e => e.userId).filter(Boolean)).size;

    const variantDistribution: Record<string, number> = {};
    evaluations.forEach(e => {
      const variant = e.variant || 'default';
      variantDistribution[variant] = (variantDistribution[variant] || 0) + 1;
    });

    // Mock conversion rates and performance data
    const conversionRates: Record<string, number> = {};
    Object.keys(variantDistribution).forEach(variant => {
      conversionRates[variant] = Math.random() * 0.1 + 0.05; // 5-15%
    });

    return {
      totalEvaluations: evaluations.length,
      uniqueUsers,
      variantDistribution,
      conversionRates,
      performanceImpact: {
        averageLoadTime: Math.random() * 500 + 200,
        errorRate: Math.random() * 0.02,
      },
    };
  }

  /**
   * Run A/B test analysis
   */
  async runABTestAnalysis(flagId: string): Promise<ABTestResult[]> {
    const flag = this.flags.get(flagId);
    if (!flag?.variants || flag.variants.length < 2) {
      throw new Error('Flag must have at least 2 variants for A/B testing');
    }

    const results: ABTestResult[] = [];
    const analytics = this.getEvaluationAnalytics(flagId);

    // Analyze each metric for each variant
    const metrics = ['conversion_rate', 'engagement_time', 'bounce_rate'];

    for (const metric of metrics) {
      const variantResults: Record<string, { value: number; sampleSize: number }> = {};

      // Generate mock data for each variant
      flag.variants.forEach(variant => {
        const sampleSize = analytics.variantDistribution[variant.id] || 0;
        let value: number;

        switch (metric) {
          case 'conversion_rate':
            value = analytics.conversionRates[variant.id] || 0;
            break;
          case 'engagement_time':
            value = Math.random() * 300 + 120; // 2-7 minutes
            break;
          case 'bounce_rate':
            value = Math.random() * 0.4 + 0.2; // 20-60%
            break;
          default:
            value = Math.random();
        }

        variantResults[variant.id] = { value, sampleSize };
      });

      // Calculate statistical significance (simplified)
      const variants = Object.keys(variantResults);
      if (variants.length >= 2) {
        const controlVariant = variants[0];
        const testVariant = variants[1];

        const testData = testVariant ? variantResults[testVariant] : undefined;
        const controlData = controlVariant ? variantResults[controlVariant] : undefined;

        if (!testData || !controlData) {
return [];
}

        const controlValue = controlData.value;
        const testValue = testData.value;

        const difference = Math.abs(testValue - controlValue);
        const relativeDifference = difference / controlValue;

        // Mock statistical significance calculation
        const confidence = Math.min(0.99, relativeDifference * 2);
        const significantDifference = confidence > 0.95;

        const winningVariant = testValue > controlValue ? testVariant : controlVariant;

        results.push({
          flagId,
          variant: testVariant || 'unknown',
          metric,
          value: testValue,
          sampleSize: testData.sampleSize,
          confidence,
          significantDifference,
          winningVariant: significantDifference && winningVariant ? winningVariant : '',
        });
      }
    }

    this.abTestResults.set(flagId, results);

    console.log(`📊 A/B test analysis completed for flag '${flagId}'`);

    return results;
  }

  /**
   * Get A/B test recommendations
   */
  getABTestRecommendations(flagId: string): {
    action: 'continue' | 'promote_winner' | 'stop_test' | 'extend_test';
    reason: string;
    winningVariant?: string;
    confidence: number;
  } {
    const results = this.abTestResults.get(flagId) || [];

    if (results.length === 0) {
      return {
        action: 'continue',
        reason: 'Insufficient data for analysis',
        confidence: 0,
      };
    }

    // Find results with significant differences
    const significantResults = results.filter(r => r.significantDifference);

    if (significantResults.length === 0) {
      return {
        action: 'extend_test',
        reason: 'No statistically significant differences found',
        confidence: Math.max(...results.map(r => r.confidence)),
      };
    }

    // Check if there's a consistent winner
    const winnerCounts: Record<string, number> = {};
    significantResults.forEach(r => {
      if (r.winningVariant) {
        winnerCounts[r.winningVariant] = (winnerCounts[r.winningVariant] || 0) + 1;
      }
    });

    const topWinner = Object.entries(winnerCounts)
      .sort(([, a], [, b]) => b - a)[0];

    if (topWinner && topWinner[1] >= significantResults.length * 0.7) {
      return {
        action: 'promote_winner',
        reason: `Variant '${topWinner[0]}' shows consistent improvement across metrics`,
        winningVariant: topWinner[0],
        confidence: Math.max(...significantResults.map(r => r.confidence)),
      };
    }

    return {
      action: 'continue',
      reason: 'Mixed results, continue testing for clearer winner',
      confidence: Math.max(...results.map(r => r.confidence)),
    };
  }

  /**
   * Auto-promote winning variant
   */
  async autoPromoteWinner(flagId: string): Promise<void> {
    const recommendation = this.getABTestRecommendations(flagId);

    if (recommendation.action === 'promote_winner' && recommendation.winningVariant) {
      const flag = this.flags.get(flagId);
      if (!flag) {
return undefined;
}

      const winningVariant = flag.variants?.find(v => v.id === recommendation.winningVariant);
      if (!winningVariant) {
return undefined;
}

      // Update flag to use winning variant as default
      flag.defaultValue = winningVariant.value;
      flag.rolloutStrategy._config.percentage = 100;
      flag.metadata.updatedAt = Date.now();

      this.clearEvaluationCache(flagId);

      console.log(`🏆 Auto-promoted winning variant '${winningVariant.name}' for flag '${flagId}'`);

      advancedAPM.recordMetric('feature-flag-auto-promoted', 1, {
        flagId,
        winningVariant: winningVariant.id,
        confidence: recommendation.confidence.toString(),
      });
    }
  }

  /**
   * Emergency rollback
   */
  emergencyRollback(flagId: string, reason: string): void {
    const flag = this.flags.get(flagId);
    if (!flag) {
return undefined;
}

    // Disable flag or set to safe default
    flag.enabled = false;
    flag.rolloutStrategy._config.percentage = 0;
    flag.metadata.updatedAt = Date.now();

    this.clearEvaluationCache(flagId);

    console.error(`🚨 Emergency rollback for flag '${flagId}': ${reason}`);

    advancedAPM.recordMetric('feature-flag-emergency-rollback', 1, {
      flagId,
      reason,
    });
  }

  private performEvaluation(flag: FeatureFlag, _context: UserContext): FlagEvaluation {
    const evaluation: FlagEvaluation = {
      flagId: flag.id,
      value: flag.defaultValue,
      timestamp: Date.now(),
      context,
      reason: 'default',
    };

    // Add userId only if it exists
    if (context.userId) {
      evaluation.userId = context.userId;
    }

    // Check if flag is enabled
    if (!flag.enabled) {
      evaluation.reason = 'flag_disabled';
      return evaluation;
    }

    // Check schedule
    if (flag.schedule) {
      const now = Date.now();
      if (flag.schedule.startTime && now < flag.schedule.startTime) {
        evaluation.reason = 'not_started';
        return evaluation;
      }
      if (flag.schedule.endTime && now > flag.schedule.endTime) {
        evaluation.reason = 'expired';
        return evaluation;
      }
    }

    // Check targeting rules
    for (const rule of flag.targeting) {
      if (!rule.enabled) {
continue;
}

      const ruleMatches = this.evaluateTargetingRule(rule, context);
      if (ruleMatches) {
        evaluation.value = rule.value;
        evaluation.reason = `targeting_rule_${rule.id}`;
        break;
      }
    }

    // Apply rollout strategy
    const rolloutResult = this.applyRolloutStrategy(flag, context);
    if (rolloutResult.shouldApply) {
      evaluation.value = rolloutResult.value;
      if (rolloutResult.variant) {
        evaluation.variant = rolloutResult.variant;
      }
      evaluation.reason = rolloutResult.reason;
    }

    return evaluation;
  }

  private evaluateTargetingRule(rule: TargetingRule, _context: UserContext): boolean {
    const results = rule.conditions.map(condition =>
      this.evaluateTargetingCondition(condition, context),
    );

    return rule.operator === 'AND'
      ? results.every(r => r)
      : results.some(r => r);
  }

  private evaluateTargetingCondition(condition: TargetingCondition, _context: UserContext): boolean {
    const contextValue = this.getContextValue(condition.attribute, context);

    switch (condition.operator) {
      case 'equals':
        return contextValue === condition.value;
      case 'not_equals':
        return contextValue !== condition.value;
      case 'contains':
        return String(contextValue).includes(String(condition.value));
      case 'not_contains':
        return !String(contextValue).includes(String(condition.value));
      case 'greater_than':
        return Number(contextValue) > Number(condition.value);
      case 'less_than':
        return Number(contextValue) < Number(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(contextValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(contextValue);
      case 'regex':
        try {
          const regex = new RegExp(condition.value);
          return regex.test(String(contextValue));
        } catch {
          return false;
        }
      default:
        return false;
    }
  }

  private getContextValue(attribute: string, _context: UserContext): any {
    switch (attribute) {
      case 'userId':
        return context.userId;
      case 'country':
        return context.country;
      case 'deviceType':
        return context.deviceType;
      case 'browserType':
        return context.browserType;
      default:
        return context.customAttributes?.[attribute];
    }
  }

  private applyRolloutStrategy(flag: FeatureFlag, _context: UserContext): {
    shouldApply: boolean;
    value: any;
    variant?: string;
    reason: string;
  } {
    const _strategy = flag.rolloutStrategy;

    switch (strategy.type) {
      case 'immediate':
        return {
          shouldApply: true,
          value: flag.defaultValue,
          reason: 'immediate_rollout',
        };

      case 'gradual':
      case 'user-based':
        const percentage = strategy._config.percentage || 0;
        const hash = this.getUserHash(context.userId || context.sessionId || 'anonymous', flag.id);
        const shouldInclude = hash < percentage;

        if (shouldInclude && flag.variants && flag.variants.length > 0) {
          const variant = this.selectVariant(flag.variants, hash);
          return {
            shouldApply: true,
            value: variant.value,
            variant: variant.id,
            reason: 'variant_selected',
          };
        }

        return {
          shouldApply: shouldInclude,
          value: flag.defaultValue,
          reason: shouldInclude ? 'rollout_included' : 'rollout_excluded',
        };

      case 'geographic':
        const geoTargets = strategy._config.geoTargets || [];
        const userCountry = context.country;
        const geoMatch = !userCountry || geoTargets.length === 0 || geoTargets.includes(userCountry);

        return {
          shouldApply: geoMatch,
          value: flag.defaultValue,
          reason: geoMatch ? 'geo_included' : 'geo_excluded',
        };

      default:
        return {
          shouldApply: false,
          value: flag.defaultValue,
          reason: 'unknown_strategy',
        };
    }
  }

  private selectVariant(variants: FlagVariant[], hash: number): FlagVariant {
    if (variants.length === 0) {
      // Return a default variant if no variants are provided
      return {
        id: 'default',
        name: 'Default',
        value: null,
        weight: 100,
      };
    }

    // Normalize hash to 0-100 range
    const normalizedHash = hash % 100;

    let cumulativeWeight = 0;
    for (const variant of variants) {
      cumulativeWeight += variant.weight;
      if (normalizedHash < cumulativeWeight) {
        return variant;
      }
    }

    // Fallback to first variant
    return variants[0] || { id: 'default', name: 'Default', weight: 100 };
  }

  private getUserHash(userId: string, flagId: string): number {
    // Simple hash function for consistent user bucketing
    const str = `${userId}:${flagId}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
  }

  private getCacheKey(flagId: string, _context: UserContext): string {
    const keyParts = [
      flagId,
      context.userId || 'anonymous',
      context.country || 'unknown',
      context.deviceType || 'unknown',
    ];
    return keyParts.join(':');
  }

  private clearEvaluationCache(flagId?: string): void {
    if (flagId) {
      // Clear cache entries for specific flag
      const keysToDelete: string[] = [];
      this.evaluationCache.forEach((_, key) => {
        if (key.startsWith(`${flagId}:`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.evaluationCache.delete(key));
    } else {
      // Clear all cache
      this.evaluationCache.clear();
    }
  }

  private startGradualRollout(flag: FeatureFlag): void {
    const _strategy = flag.rolloutStrategy;
    if (strategy.type !== 'gradual' || !strategy._config.incrementPercentage || !strategy._config.incrementInterval) {
      return undefined;
    }

    const currentPercentage = strategy._config.percentage || 0;
    const { incrementPercentage } = strategy._config;
    const incrementInterval = strategy._config.incrementInterval * 60 * 1000; // Convert to ms

    if (currentPercentage >= 100) {
      return undefined; // Already at 100%
    }

    const timer = setTimeout(() => {
      const newPercentage = Math.min(100, currentPercentage + incrementPercentage);
      this.updateRolloutPercentage(flag.id, newPercentage);

      // Schedule next increment if not at 100%
      if (newPercentage < 100) {
        this.startGradualRollout(flag);
      }
    }, incrementInterval);

    this.rolloutTimers.set(flag.id, timer);
  }

  private trackPerformanceImpact(flagId: string, flagValue: any): void {
    // Track performance metrics when flag is evaluated
    const metrics = performanceMonitor.getMetrics();
    const loadTime = metrics.find(m => m.name === 'page-load-time')?.value || 0;

    advancedAPM.recordMetric('feature-flag-performance-impact', loadTime, {
      flagId,
      flagValue: String(flagValue),
    });
  }

  private startMonitoring(): void {
    // Monitor flag performance and trigger alerts
    setInterval(() => {
      if (!this.isRunning) {
return undefined;
}

      this.flags.forEach(flag => {
        if (!flag.monitoring.alertThresholds.length) {
return undefined;
}

        flag.monitoring.alertThresholds.forEach(threshold => {
          this.checkAlertThreshold(flag, threshold);
        });
      });
    }, 60000); // Check every minute
  }

  private startRolloutScheduler(): void {
    // Check for scheduled flag activations
    setInterval(() => {
      if (!this.isRunning) {
return undefined;
}

      const now = Date.now();

      this.flags.forEach(flag => {
        if (!flag.schedule) {
return undefined;
}

        // Auto-enable flags that should start
        if (flag.schedule.startTime &&
            flag.schedule.startTime <= now &&
            !flag.enabled) {
          this.toggleFlag(flag.id, true);
          console.log(`🕐 Auto-enabled scheduled flag '${flag.id}'`);
        }

        // Auto-disable flags that should end
        if (flag.schedule.endTime &&
            flag.schedule.endTime <= now &&
            flag.enabled) {
          this.toggleFlag(flag.id, false);
          console.log(`🕐 Auto-disabled expired flag '${flag.id}'`);
        }
      });
    }, 30000); // Check every 30 seconds
  }

  private async checkAlertThreshold(flag: FeatureFlag, threshold: AlertThreshold): Promise<void> {
    let currentValue: number;

    switch (threshold.metric) {
      case 'error_rate':
        currentValue = Math.random() * 0.1; // Mock error rate
        break;
      case 'response_time':
        currentValue = Math.random() * 1000 + 200; // Mock response time
        break;
      case 'conversion_rate':
        const analytics = this.getEvaluationAnalytics(flag.id, 1);
        currentValue = Object.values(analytics.conversionRates)[0] || 0;
        break;
      default:
        return undefined;
    }

    let shouldTrigger = false;
    switch (threshold.operator) {
      case 'gt':
        shouldTrigger = currentValue > threshold.value;
        break;
      case 'lt':
        shouldTrigger = currentValue < threshold.value;
        break;
      case 'eq':
        shouldTrigger = currentValue === threshold.value;
        break;
    }

    if (shouldTrigger) {
      console.warn(`🚨 Alert threshold triggered for flag '${flag.id}': ${threshold.metric} ${threshold.operator} ${threshold.value} (current: ${currentValue})`);

      switch (threshold.action) {
        case 'notify':
          // Send notification (implementation would depend on notification system)
          break;
        case 'disable':
          this.toggleFlag(flag.id, false);
          break;
        case 'rollback':
          this.emergencyRollback(flag.id, `Alert threshold: ${threshold.metric} ${threshold.operator} ${threshold.value}`);
          break;
      }
    }
  }

  private setupDefaultFlags(): void {
    // Example feature flags
    this.createFlag({
      id: 'new-video-player',
      name: 'New Video Player',
      description: 'Enable the new enhanced video player with improved controls',
      type: 'boolean',
      defaultValue: false,
      enabled: true,
      rolloutStrategy: {
        type: 'gradual',
        _config: {
          percentage: 10,
          incrementPercentage: 10,
          incrementInterval: 60, // 1 hour
        },
      },
      targeting: [
        {
          id: 'premium-users',
          name: 'Premium Users',
          conditions: [
            {
              attribute: 'userType',
              operator: 'equals',
              value: 'premium',
            },
          ],
          operator: 'AND',
          value: true,
          enabled: true,
        },
      ],
      variants: [
        {
          id: 'control',
          name: 'Control (Old Player)',
          value: false,
          weight: 50,
        },
        {
          id: 'treatment',
          name: 'Treatment (New Player)',
          value: true,
          weight: 50,
        },
      ],
      monitoring: {
        trackEvents: true,
        trackPerformance: true,
        alertThresholds: [
          {
            metric: 'error_rate',
            operator: 'gt',
            value: 0.05,
            action: 'rollback',
          },
        ],
      },
    });

    this.createFlag({
      id: 'dark-mode',
      name: 'Dark Mode',
      description: 'Enable dark mode theme',
      type: 'boolean',
      defaultValue: false,
      enabled: true,
      rolloutStrategy: {
        type: 'immediate',
        _config: {},
      },
      targeting: [],
      monitoring: {
        trackEvents: true,
        trackPerformance: false,
        alertThresholds: [],
      },
    });

    this.createFlag({
      id: 'recommendation-algorithm',
      name: 'Recommendation Algorithm',
      description: 'A/B test different recommendation algorithms',
      type: 'string',
      defaultValue: 'collaborative',
      enabled: true,
      rolloutStrategy: {
        type: 'user-based',
        _config: {
          percentage: 100,
        },
      },
      targeting: [],
      variants: [
        {
          id: 'collaborative',
          name: 'Collaborative Filtering',
          value: 'collaborative',
          weight: 33,
        },
        {
          id: 'content-based',
          name: 'Content-Based',
          value: 'content-based',
          weight: 33,
        },
        {
          id: 'hybrid',
          name: 'Hybrid Approach',
          value: 'hybrid',
          weight: 34,
        },
      ],
      monitoring: {
        trackEvents: true,
        trackPerformance: true,
        alertThresholds: [
          {
            metric: 'conversion_rate',
            operator: 'lt',
            value: 0.05,
            action: 'notify',
          },
        ],
      },
    });
  }
}

// Create singleton instance
export const featureFlagManager = new AdvancedFeatureFlagManager();

// Auto-start in development
if (process.env.NODE_ENV === 'development') {
  featureFlagManager.start();
}

// Export types
export type {
  FeatureFlag,
  RolloutStrategy,
  TargetingRule,
  TargetingCondition,
  FlagVariant,
  AlertThreshold,
  UserContext,
  FlagEvaluation,
  ABTestResult,
};

// Export class for custom implementations
export { AdvancedFeatureFlagManager };

// Convenience hooks for React components
export const useFeatureFlag = (flagId: string, _context: UserContext = {}, defaultValue?: any) => {
  return featureFlagManager.evaluateFlag(flagId, context, defaultValue);
};

export const useABTest = (flagId: string, _context: UserContext = {}) => {
  const evaluation = featureFlagManager.evaluateFlag(flagId, context);
  return {
    value: evaluation,
    variant: evaluation.variant || 'control',
  };
};