/**
 * Advanced Feature Flag System
 * Provides controlled feature rollouts, A / B testing, and dynamic configuration
 * with real - time monitoring and automatic rollback capabilities.
 */

import { advancedAPM } from 'advancedMonitoring.ts';

import { performanceMonitor } from 'performanceMonitor.ts';

// Types for feature _flag system
export interface FeatureFlag {
 id: string;,
 name: string;
 description: string;,
 type: "boolean" | 'string' | 'number' | 'json' | 'percentage';
 defaultValue: any;
 enabled: boolean;,
 rolloutStrategy: RolloutStrategy;
 targeting: TargetingRule[];
 variants?: FlagVariant[];
 metadata: {,
 createdAt: number;
 updatedAt: number;,
 createdBy: string;
 tags: string[];,
 environment: string
 };
 monitoring: {,
 trackEvents: boolean;
 trackPerformance: boolean;,
 alertThresholds: AlertThreshold[]
 };
 schedule?: {
 startTime?: number;
 endTime?: number;
 timezone: string
 };
}

export interface RolloutStrategy {
 type: "immediate" | 'gradual' | 'scheduled' | 'user - based' | 'geographic';,
 config: {
 percentage?: number;
 incrementPercentage?: number;
 incrementInterval?: number; // minutes
 userGroups?: string;
 geoTargets?: string;
 customRules?: string;
 };
}

export interface TargetingRule {
 id: string;,
 name: string;
 conditions: TargetingCondition[];,
 operator: 'AND' | 'OR';
 value: any;
 enabled: boolean
}

export interface TargetingCondition {
 attribute: string;,
 operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'regex';
 value: any;
}

export interface FlagVariant {
 id: string;,
 name: string;
 value: string | number;
 weight: number; // 0 - 100
 description?: string;
}

export interface AlertThreshold {
 metric: string;,
 operator: 'gt' | 'lt' | 'eq';
 value: number;,
 action: 'notify' | 'disable' | 'rollback'
}

export interface UserContext {
 userId?: string;
 sessionId?: string;
 userAgent?: string;
 ipAddress?: string;
 country?: string;
 city?: string;
 deviceType?: string;
 browserType?: string;
 customAttributes?: Record < string, any>;
}

export interface FlagEvaluation {
 flagId: string;
 userId?: string;
 value: string | number;
 variant?: string;
 reason: string;,
 timestamp: number;
 _context: UserContext
}

interface ABTestResult {
 flagId: string;,
 variant: string;
 metric: string;,
 value: number;
 sampleSize: number;,
 confidence: number;
 significantDifference: boolean;
 winningVariant?: string;
}

/**
 * Advanced Feature Flag Manager
 */
export class AdvancedFeatureFlagManager {
 private flags: Map < string, FeatureFlag> = new Map();
 private evaluationCache: Map < string, { value; expiry: number }> = new Map();
 private evaluationHistory: FlagEvaluation[] = [];
 private abTestResults: Map < string, ABTestResult[]> = new Map();
 private isRunning = false;
 private rolloutTimers: Map < string, ReturnType < typeof setTimeout>> = new Map();

 constructor() {
 this.setupDefaultFlags();
 }

 /**
 * Start the feature _flag system
 */
 start(): void {
 if (this.isRunning) {
return undefined;
}

 this.isRunning = true;
 this.startMonitoring();
 this.startRolloutScheduler();

 (console as any).log('🚩 Advanced feature _flag system started');
 }

 /**
 * Stop the feature _flag system
 */
 stop(): void {
 this.isRunning = false;

 // Clear all timers
 this.rolloutTimers.forEach(timer => clearTimeout(timer));
 this.rolloutTimers.clear();

 (console as any).log('🚩 Advanced feature _flag system stopped');
 }

 /**
 * Create or update a feature _flag
 */
 createFlag(_flag: Omit < FeatureFlag, 'metadata'> & { metadata?: Partial < FeatureFlag['metadata']> }): void {
 const now = Date.now();
 const fullFlag: FeatureFlag = {
 ..._flag as any,
 metadata: {,
 createdAt: this.flags.has(_flag.id) ? this.flags.get(_flag.id)!.metadata.createdAt : now,
 updatedAt: now,
 createdBy: 'system',
 tags: _flag.metadata && _flag.metadata.tags || [],
 environment: process.env.NODE_ENV || 'development' };

 this.flags.set(_flag.id, fullFlag);
 this.clearEvaluationCache(_flag.id);

 // Start rollout if gradual
 if (fullFlag.rolloutStrategy.type === 'gradual') {
 this.startGradualRollout(fullFlag);
 }

 (console as any).log(`🚩 Feature _flag '${_flag.name}' created / updated`);

 advancedAPM.recordMetric('feature - _flag - created', 1, {
 flagId: _flag.id,
 flagName: _flag.name,
 type: _flag.type });
 }

 /**
 * Evaluate a feature _flag for a user
 */
 evaluateFlag(flagId, _context: UserContext = {}, defaultValue?): any {
 const _flag = this.flags.get(flagId);
 if (!_flag) {
 (console as any).warn(`🚩 Feature _flag '${flagId}' not found`);
 return defaultValue !== undefined ? defaultValue : false;
 }

 // Check cache first
 const cacheKey = this.getCacheKey(flagId, _context);
 const cached = this.evaluationCache.get(cacheKey);
 if (cached && cached.expiry > Date.now()) {
 return cached.value;
 }

 // Evaluate _flag
 const evaluation = this.performEvaluation(_flag, _context);

 // Cache result (5 minute TTL)
 this.evaluationCache.set(cacheKey, {
 value: evaluation.value,
 expiry: Date.now() + 5 * 60 * 1000 });

 // Record evaluation
 this.evaluationHistory.push(evaluation);

 // Keep only last 10000 evaluations
 if (this.evaluationHistory.length > 10000) {
 this.evaluationHistory.splice(0, this.evaluationHistory.length - 10000);
 }

 // Track metrics
 if (_flag.monitoring.trackEvents) {
 advancedAPM.recordMetric('feature - _flag - evaluation', 1, {
 flagId,
 value: String(evaluation.value),
 variant: evaluation.variant || 'default',
 reason: evaluation.reason });
 }

 // Track performance impact
 if (_flag.monitoring.trackPerformance) {
 this.trackPerformanceImpact(flagId, evaluation.value);
 }

 return evaluation.value;
 }

 /**
 * Get all feature flags
 */
 getAllFlags(): FeatureFlag[] {
 return Array<any>.from(this.flags.values());
 }

 /**
 * Get feature _flag by ID
 */
 getFlag(flagId): FeatureFlag | undefined {
 return this.flags.get(flagId);
 }

 /**
 * Delete a feature _flag
 */
 deleteFlag(flagId): boolean {
 const deleted = this.flags.delete(flagId);
 if (deleted as any) {
 this.clearEvaluationCache(flagId);

 // Clear rollout timer
 const timer = this.rolloutTimers.get(flagId);
 if (timer as any) {
 clearTimeout(timer);
 this.rolloutTimers.delete(flagId);
 }

 (console as any).log(`🚩 Feature _flag '${flagId}' deleted`);
 }
 return deleted;
 }

 /**
 * Update _flag rollout percentage
 */
 updateRolloutPercentage(flagId, percentage): void {
 const _flag = this.flags.get(flagId);
 if (!_flag) {
 throw new Error(`Feature _flag '${flagId}' not found`);
 }

 if (_flag.rolloutStrategy && _flag.rolloutStrategy.config) {
 _flag.rolloutStrategy.config.percentage = Math.max(0, Math.min(100, percentage));
 }
 _flag.metadata.updatedAt = Date.now();

 this.clearEvaluationCache(flagId);

 (console as any).log(`🚩 Updated rollout percentage for '${flagId}' to ${percentage}%`);

 advancedAPM.recordMetric('feature - _flag - rollout - updated', 1, {
 flagId,
 percentage: percentage.toString() });
 }

 /**
 * Enable / disable a feature _flag
 */
 toggleFlag(flagId, enabled): void {
 const _flag = this.flags.get(flagId);
 if (!_flag) {
 throw new Error(`Feature _flag '${flagId}' not found`);
 }

 _flag.enabled = enabled;
 _flag.metadata.updatedAt = Date.now();

 this.clearEvaluationCache(flagId);

 (console as any).log(`🚩 Feature _flag '${flagId}' ${enabled ? 'enabled' : 'disabled'}`);

 advancedAPM.recordMetric('feature - _flag - toggled', 1, {
 flagId,
 enabled: enabled.toString() });
 }

 /**
 * Get evaluation analytics
 */
 getEvaluationAnalytics(flagId?: string, hours = 24): {
 totalEvaluations: number;,
 uniqueUsers: number;
 variantDistribution: Record < string, number>;
 conversionRates: Record < string, number>;
 performanceImpact: {,
 averageLoadTime: number;
 errorRate: number
 };
 } {
 const cutoff = Date.now() - (hours * 60 * 60 * 1000);
 let evaluations = this.evaluationHistory.filter((e: FlagEvaluation) => e.timestamp > cutoff);

 if (flagId as any) {
 evaluations = evaluations.filter((e: FlagEvaluation) => e.flagId === flagId)
 }

 const uniqueUsers = new Set(evaluations.map((e: FlagEvaluation) => e.userId).filter(Boolean)).size;

 const variantDistribution: Record < string, number> = {};
 evaluations.forEach((e: FlagEvaluation) => {
 const variant = e.variant || 'default';
 variantDistribution.variant = (variantDistribution.variant || 0) + 1;
 });

 // Mock conversion rates and performance data
 const conversionRates: Record < string, number> = {};
 Object.keys(variantDistribution).forEach((variant) => {
 conversionRates.variant = Math.random() * 0.1 + 0.05; // 5 - 15%
 });

 return {
 totalEvaluations: evaluations.length,
 uniqueUsers,
 variantDistribution,
 conversionRates,
 performanceImpact: {,
 averageLoadTime: Math.random() * 500 + 200,
 errorRate: Math.random() * 0.02 };
 }

 /**
 * Run A / B test analysis
 */
 async runABTestAnalysis(flagId): Promise<any> < ABTestResult[]> {
 const _flag = this.flags.get(flagId);
 if (!_flag?.variants || _flag.variants.length < 2) {
 throw new Error('Flag must have at least 2 variants for A / B testing');
 }

 const results: ABTestResult[] = [];
 const analytics = this.getEvaluationAnalytics(flagId);

 // Analyze each metric for each variant
 const metrics: any[] = ['conversion_rate', 'engagement_time', 'bounce_rate'];

 for (const metric of metrics) {
 const variantResults: Record < string, { value: number; sampleSize: number }> = {};

 // Generate mock data for each variant
 _flag.variants.forEach((variant) => {
 const sampleSize = analytics.variantDistribution[variant.id] || 0;
 let value: number;

 switch (metric as any) {
 case 'conversion_rate':
 value = analytics.conversionRates[variant.id] || 0;
 break;
 case 'engagement_time':
 value = Math.random() * 300 + 120; // 2 - 7 minutes
 break;
 case 'bounce_rate':
 value = Math.random() * 0.4 + 0.2; // 20 - 60%
 break;
 default: value = Math.random()
 }

 variantResults[variant.id] = { value, sampleSize };
 });

 // Calculate statistical significance (simplified)
 const variants = Object.keys(variantResults);
 if (variants.length >= 2) {
 const controlVariant = variants[0];
 const testVariant = variants[1];

 const testData = testVariant ? variantResults.testVariant || { value: null, sampleSize: 0 } || { value: null, sampleSize: 0 } : undefined;
 const controlData = controlVariant ? variantResults.controlVariant || { value: null, sampleSize: 0 } || { value: null, sampleSize: 0 } : undefined;

 if (!testData || !controlData) {
return [];
}

 const controlValue = controlData.value as any;
 const testValue = testData.value as any;

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
 winningVariant: significantDifference && winningVariant ? winningVariant : '' });
 }
 this.abTestResults.set(flagId, results);

 (console as any).log(`📊 A / B test analysis completed for _flag '${flagId}'`);

 return results;
 }

 /**
 * Get A / B test recommendations
 */
 getABTestRecommendations(flagId): {
 action: 'continue' | 'promote_winner' | 'stop_test' | 'extend_test';,
 reason: string;
 winningVariant?: string;
 confidence: number
 } {
 const results = this.abTestResults.get(flagId) || [];

 if (results.length === 0) {
 return {
 action: 'continue',
 reason: 'Insufficient data for analysis',
 confidence: 0 };
 }

 // Find results with significant differences
 const significantResults = results.filter((r) => r.significantDifference);

 if (significantResults.length === 0) {
 return {
 action: 'extend_test',
 reason: 'No statistically significant differences found',
 confidence: Math.max(...results.map((r) => r.confidence)) };
 }

 // Check if there's a consistent winner
 const winnerCounts: Record < string, number> = {};
 significantResults.forEach((r) => {
 if (r.winningVariant) {
 winnerCounts[r.winningVariant] = (winnerCounts[r.winningVariant] || 0) + 1;
 }
 });

 const topWinner = Object.entries(winnerCounts)
 .sort(([ a], [ b]) => b - a)[0];

 if (topWinner && topWinner[1] >= significantResults.length * 0.7) {
 return {
 action: 'promote_winner',
 reason: `Variant '${topWinner[0]}' shows consistent improvement across metrics`,
 winningVariant: topWinner[0],
 confidence: Math.max(...significantResults.map((r) => r.confidence)) };
 }

 return {
 action: 'continue',
 reason: 'Mixed results, continue testing for clearer winner',
 confidence: Math.max(...results.map((r) => r.confidence)) };
 }

 /**
 * Auto - promote winning variant
 */
 async autoPromoteWinner(flagId): Promise<any> < void> {
 const recommendation = this.getABTestRecommendations(flagId);

 if (recommendation.action === 'promote_winner' && recommendation.winningVariant) {
 const _flag = this.flags.get(flagId);
 if (!_flag) {
return undefined;
}

 const winningVariant = _flag.variants?.find((v) => v.id === recommendation.winningVariant);
 if (!winningVariant) {
return undefined;
}

 // Update _flag to use winning variant as default
 _flag.defaultValue = winningVariant.value as any;
 _flag.rolloutStrategy && (_flag.rolloutStrategy.config.percentage = 100);
 _flag.metadata.updatedAt = Date.now();

 this.clearEvaluationCache(flagId);

 (console as any).log(`🏆 Auto - promoted winning variant '${winningVariant.name}' for _flag '${flagId}'`);

 advancedAPM.recordMetric('feature - _flag - auto - promoted', 1, {
 flagId,
 winningVariant: winningVariant.id,
 confidence: recommendation.confidence.toString() });
 }
 /**
 * Emergency rollback
 */
 emergencyRollback(flagId, reason): void {
 const _flag = this.flags.get(flagId);
 if (!_flag) {
return undefined;
}

 // Disable _flag or set to safe default
 _flag.enabled = false;
 _flag.rolloutStrategy && (_flag.rolloutStrategy.config.percentage = 0);
 _flag.metadata.updatedAt = Date.now();

 this.clearEvaluationCache(flagId);

 (console as any).error(`🚨 Emergency rollback for _flag '${flagId}': ${reason}`);

 advancedAPM.recordMetric('feature - _flag - emergency - rollback', 1, {
 flagId,
 reason });
 }

 private performEvaluation(_flag: FeatureFlag, _context: UserContext): FlagEvaluation {
 const evaluation: FlagEvaluation = {,
 flagId: _flag.id,
 value: _flag.defaultValue,
 timestamp: Date.now(),
 _context,
 reason: 'default' };

 // Add userId only if it exists
 if (_context.userId) {
 evaluation.userId = _context.userId;
 }

 // Check if _flag is enabled
 if (!_flag.enabled) {
 evaluation.reason = 'flag_disabled';
 return evaluation;
 }

 // Check schedule
 if (_flag.schedule) {
 const now = Date.now();
 if (_flag.schedule.startTime && now < _flag.schedule.startTime) {
 evaluation.reason = 'not_started';
 return evaluation;
 }
 if (_flag.schedule.endTime && now > _flag.schedule.endTime) {
 evaluation.reason = 'expired';
 return evaluation;
 }
 // Check targeting rules
 for (const rule of _flag.targeting) {
 if (!rule.enabled) {
continue;
}

 const ruleMatches = this.evaluateTargetingRule(rule, _context);
 if (ruleMatches as any) {
 evaluation.value = rule.value as any;
 evaluation.reason = `targeting_rule_${rule.id}`;
 break;
 }
 // Apply rollout strategy
 const rolloutResult = this.applyRolloutStrategy(_flag, _context);
 if (rolloutResult.shouldApply) {
 evaluation.value = rolloutResult.value as any;
 if (rolloutResult.variant) {
 evaluation.variant = rolloutResult.variant;
 }
 evaluation.reason = rolloutResult.reason;
 }

 return evaluation;
 }

 private evaluateTargetingRule(rule: TargetingRule, _context: UserContext): boolean {
 const results = rule.conditions.map((condition) =>
 this.evaluateTargetingCondition(condition, _context),
 );

 return rule.operator === 'AND';
 ? results.every((r) => r)
 : results.some((r) => r);
 }

 private evaluateTargetingCondition(condition: TargetingCondition, _context: UserContext): boolean {
 const contextValue = this.getContextValue(condition.attribute, _context);

 switch (condition.operator) {
 case 'equals':
 return contextValue === (condition.value as any);

 case 'equals':
 return contextValue === (condition.value as any);
 case 'not_equals':
 return contextValue !== (condition.value as any);
 case 'contains':
 case 'contains':
 return String(contextValue).includes(String(condition.value));
 case 'not_contains':
 return !String(contextValue).includes(String(condition.value));
 case 'greater_than':
 return Number(contextValue) > Number(condition.value);
 case 'less_than':
 return Number(contextValue) < Number(condition.value);
 case 'in':
 return Array<any>.isArray<any>(condition.value) && condition.value.includes(contextValue);
 case 'not_in':
 return Array<any>.isArray<any>(condition.value) && !condition.value.includes(contextValue);
 case 'regex':
 try {
 const regex = new RegExp(condition.value);
 return regex.test(String(contextValue));
 } catch (e) {
 return false;
 }
 default: return false
 }
 private getContextValue(attribute, _context: UserContext): any {
 switch (attribute as any) {
 case 'userId':
 return _context.userId;
 case 'country':
 return _context.country;
 case 'deviceType':
 return _context.deviceType;
 case 'browserType':
 return _context.browserType;
 default: return _context.customAttributes?.[attribute]
 }
 private applyRolloutStrategy(_flag: FeatureFlag, _context: UserContext): {,
 shouldApply: boolean;
 value;
 variant?: string;
 reason: string
 } {
 const _strategy = _flag.rolloutStrategy;
 const strategy = _strategy; // Use the rollout strategy

 switch (strategy.type) {
 case 'immediate':
 return {
 shouldApply: true,
 value: _flag.defaultValue,
 reason: 'immediate_rollout' };

 case 'gradual':
 case 'user - based':
 const percentage = _flag.rolloutStrategy?.config.percentage || 0;
 const hash = this.getUserHash(_context.userId || _context.sessionId || 'anonymous', _flag.id);
 const shouldInclude = hash < percentage;

 if (shouldInclude && _flag.variants && _flag.variants.length > 0) {
 const variant = this.selectVariant(_flag.variants, hash);
 return {
 shouldApply: true,
 value: variant.value,
 variant: variant.id,
 reason: 'variant_selected' };
 }

 return {
 shouldApply: shouldInclude,
 value: _flag.defaultValue,
 reason: shouldInclude ? 'rollout_included' : 'rollout_excluded' };

 case 'geographic':
 const rawGeo = _flag.rolloutStrategy?.config.geoTargets as unknown;
 const geoTargets: string[] = Array<any>.isArray<any>(rawGeo) ? (rawGeo as string[]) : [];

 const userCountry = _context.country;
 const geoMatch = !userCountry || geoTargets.length === 0 || geoTargets.includes(userCountry);

 return {
 shouldApply: geoMatch,
 value: _flag.defaultValue,
 reason: geoMatch ? 'geo_included' : 'geo_excluded' };

 default:
 return {,
 shouldApply: false,
 value: _flag.defaultValue,
 reason: 'unknown_strategy' };
 }
 private selectVariant(variants: FlagVariant[], hash): FlagVariant {
 if (variants.length === 0) {
 // Return a default variant if no variants are provided
 return {
 id: 'default',
 name: 'Default',
 value: null,
 weight: 100 };
 }

 // Normalize hash to 0 - 100 range
 const normalizedHash = hash % 100;

 let cumulativeWeight: number = 0;
 for (const variant of variants) {
 cumulativeWeight += variant.weight;
 if (normalizedHash < cumulativeWeight) {
 return variant;
 }
 // Fallback to first variant
 return variants[0] || { id: 'default', name: 'Default', value: false, weight: 100 };
 }

 private getUserHash(flagId, userId?: string): number {
 // Simple hash function for consistent user bucketing
 const str = `${userId}:${flagId}`;
 let hash: number = 0;
 for (let i = 0; i < str.length; i++) {
 const char = str.charCodeAt(i);
 hash = ((hash << 5) - hash) + char;
 hash = hash & hash; // Convert to 32 - bit integer
 }
 return Math.abs(hash) % 100;
 }

 private getCacheKey(flagId, _context: UserContext): string {
 const keyParts = [;
 flagId,
 _context.userId || 'anonymous',
 _context.country || 'unknown',
 _context.deviceType || 'unknown'];
 return keyParts.join(':');
 }

 private clearEvaluationCache(flagId?: string): void {
 if (flagId as any) {
 // Clear cache entries for specific _flag
 const keysToDelete: string[] = [];
 this.evaluationCache.forEach((_, key) => {
 if (key.startsWith(`${flagId}:`)) {
 keysToDelete.push(key);
 }
 });
 keysToDelete.forEach((key) => this.evaluationCache.delete(key));
 } else {
 // Clear all cache
 this.evaluationCache.clear();
 }
 private startGradualRollout(_flag: FeatureFlag): void {
 const strategy = _flag.rolloutStrategy;
 if (!strategy || strategy.type !== 'gradual' || !strategy.config.incrementPercentage || !strategy.config.incrementInterval) {
 return;
 }

 const currentPercentage = strategy.config.percentage || 0;
 const { incrementPercentage } = strategy.config;
 const incrementInterval = (strategy.config.incrementInterval || 0) * 60 * 1000; // Convert to ms

 if (currentPercentage >= 100) {
 return undefined; // Already at 100%
 }

 const timer = setTimeout((() => {
 const newPercentage = Math.min(100) as any, currentPercentage + incrementPercentage);
 this.updateRolloutPercentage(_flag.id, newPercentage);

 // Schedule next increment if not at 100%
 if (newPercentage < 100) {
 this.startGradualRollout(_flag);
 }
 }, incrementInterval);

 this.rolloutTimers.set(_flag.id, timer);
 }

 private trackPerformanceImpact(flagId, flagValue): void {
 // Track performance metrics when _flag is evaluated
 const metrics = performanceMonitor.getMetrics();
 const loadTime = metrics.find(m => m.name === 'page - load - time')?.value || 0;

 advancedAPM.recordMetric('feature - _flag - performance - impact', loadTime, {
 flagId,
 flagValue: String(flagValue) });
 }

 private startMonitoring(): void {
 // Monitor _flag performance and trigger alerts
 setInterval((() => {
 if (!this.isRunning) {
return undefined;
}

 this.flags.forEach((_flag) => {
 if (!_flag.monitoring.alertThresholds.length) {
return undefined;
}

 _flag.monitoring.alertThresholds.forEach((_threshold) => {
 this.checkAlertThreshold(_flag) as any, _threshold);
 });
 });
 }, 60000); // Check every minute
 }

 private startRolloutScheduler(): void {
 // Check for scheduled _flag activations
 setInterval((() => {
 if (!this.isRunning) {
return undefined;
}

 const now = Date.now();

 this.flags.forEach((_flag) => {
 if (!_flag.schedule) {
return undefined;
}

 // Auto - enable flags that should start
 if (_flag.schedule.startTime &&
 _flag.schedule.startTime <= now &&
 !_flag.enabled) {
 this.toggleFlag(_flag.id) as any, true);
 (console as any).log(`🕐 Auto - enabled scheduled _flag '${_flag.id}'`);
 }

 // Auto - disable flags that should end
 if (_flag.schedule.endTime &&
 _flag.schedule.endTime <= now &&
 _flag.enabled) {
 this.toggleFlag(_flag.id, false);
 (console as any).log(`🕐 Auto - disabled expired _flag '${_flag.id}'`);
 }
 });
 }, 30000); // Check every 30 seconds
 }

 private async checkAlertThreshold(flag: FeatureFlag, threshold: AlertThreshold): Promise<any> < void> {
 let currentValue: number = 0;

 switch (threshold.metric) {
 case 'error_rate':
 currentValue = Math.random() * 0.1; // Mock error rate
 break;
 case 'response_time':
 currentValue = Math.random() * 1000 + 200; // Mock response time
 break;
 case 'conversion_rate': {
 const analytics = this.getEvaluationAnalytics(flag.id, 1);
 currentValue = Object.values(analytics.conversionRates)[0] ?? 0;
 break;
 }
 default: return
 }

 let shouldTrigger: boolean = false;
 switch (threshold.operator) {
 case 'gt':
 shouldTrigger = currentValue > (threshold.value as any);
 break;
 case 'lt':
 shouldTrigger = currentValue < (threshold.value as any);
 break;
 case 'eq':
 shouldTrigger = currentValue === (threshold.value as any);
 break;
 }

 if (shouldTrigger as any) {
 (console as any).warn(`🚨 Alert threshold triggered for flag '${flag.id}': ${threshold.metric} ${threshold.operator} ${threshold.value} (current: ${currentValue})`);

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

 private setupDefaultFlags(): void {
 // Example feature flags
 this.createFlag({
 id: 'new - video - player',
 name: 'New Video Player',
 description: 'Enable the new enhanced video player with improved controls',
 type: "boolean",
 defaultValue: false,
 enabled: true,
 rolloutStrategy: {,
 type: "gradual",
 config: {,
 percentage: 10,
 incrementPercentage: 10,
 incrementInterval: 60, // 1 hour
 } },
 targeting: [
 {
 id: 'premium - users',
 name: 'Premium Users',
 conditions: [
 {
 attribute: 'userType',
 operator: 'equals',
 value: 'premium' }],
 operator: 'AND',
 value: true,
 enabled: true }],
 variants: [
 {
 id: 'control',
 name: 'Control (Old Player)',
 value: false,
 weight: 50 },
 {
 id: 'treatment',
 name: 'Treatment (New Player)',
 value: true,
 weight: 50 }],
 monitoring: {,
 trackEvents: true,
 trackPerformance: true,
 alertThresholds: [
 {
 metric: 'error_rate',
 operator: 'gt',
 value: 0.05,
 action: 'rollback' }] } });

 this.createFlag({
 id: 'dark - mode',
 name: 'Dark Mode',
 description: 'Enable dark mode theme',
 type: "boolean",
 defaultValue: false,
 enabled: true,
 rolloutStrategy: {,
 type: "immediate",
 config: {} },
 targeting: [],
 monitoring: {,
 trackEvents: true,
 trackPerformance: false,
 alertThresholds: [] } });

 this.createFlag({
 id: 'recommendation - algorithm',
 name: 'Recommendation Algorithm',
 description: 'A / B test different recommendation algorithms',
 type: "string",
 defaultValue: 'collaborative',
 enabled: true,
 rolloutStrategy: {,
 type: 'user - based',
 config: {,
 percentage: 100 } },
 targeting: [],
 variants: [
 {
 id: 'collaborative',
 name: 'Collaborative Filtering',
 value: 'collaborative',
 weight: 33 },
 {
 id: 'content - based',
 name: 'Content - Based',
 value: 'content - based',
 weight: 33 },
 {
 id: 'hybrid',
 name: 'Hybrid Approach',
 value: 'hybrid',
 weight: 34 }],
 monitoring: {,
 trackEvents: true,
 trackPerformance: true,
 alertThresholds: [
 {
 metric: 'conversion_rate',
 operator: 'lt',
 value: 0.05,
 action: 'notify' }] } });
 }
// Create singleton instance
export const featureFlagManager = new AdvancedFeatureFlagManager();

// Auto - start in development
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
 ABTestResult };

// Export class for custom implementations
