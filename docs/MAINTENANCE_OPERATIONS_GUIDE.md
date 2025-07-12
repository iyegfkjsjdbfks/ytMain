# Maintenance and Operations Guide

## Overview

This comprehensive guide covers all aspects of maintaining and operating the YouTubeX application in production, including routine maintenance tasks, troubleshooting procedures, backup and recovery strategies, performance optimization, and operational best practices.

## Table of Contents

1. [Routine Maintenance](#routine-maintenance)
2. [Backup and Recovery](#backup-and-recovery)
3. [Performance Optimization](#performance-optimization)
4. [Troubleshooting Guide](#troubleshooting-guide)
5. [Database Maintenance](#database-maintenance)
6. [Security Operations](#security-operations)
7. [Capacity Planning](#capacity-planning)
8. [Incident Response](#incident-response)
9. [Change Management](#change-management)
10. [Documentation and Runbooks](#documentation-and-runbooks)

## Routine Maintenance

### 1. **Daily Tasks**

```bash
#!/bin/bash
# scripts/daily-maintenance.sh

set -e

echo "Starting daily maintenance tasks..."

# Check system health
echo "Checking system health..."
curl -f http://localhost/health || echo "WARNING: Health check failed"

# Check disk space
echo "Checking disk space..."
df -h | awk '$5 > 80 {print "WARNING: " $0}'

# Check memory usage
echo "Checking memory usage..."
free -m | awk 'NR==2{printf "Memory Usage: %s/%sMB (%.2f%%)\n", $3,$2,$3*100/$2 }'

# Check CPU usage
echo "Checking CPU usage..."
top -bn1 | grep "Cpu(s)" | awk '{print "CPU Usage: " $2}'

# Check application logs for errors
echo "Checking for recent errors..."
grep -i error /var/log/youtubex/app.log | tail -10

# Check database connections
echo "Checking database connections..."
psql $DATABASE_URL -c "SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active';"

# Check Redis status
echo "Checking Redis status..."
redis-cli ping

# Check SSL certificate expiry
echo "Checking SSL certificate expiry..."
echo | openssl s_client -servername youtubex.com -connect youtubex.com:443 2>/dev/null | openssl x509 -noout -dates

# Clean up temporary files
echo "Cleaning up temporary files..."
find /tmp -name "youtubex-*" -mtime +1 -delete

# Rotate logs if needed
echo "Rotating logs..."
logrotate /etc/logrotate.d/youtubex

echo "Daily maintenance completed."
```

### 2. **Weekly Tasks**

```bash
#!/bin/bash
# scripts/weekly-maintenance.sh

set -e

echo "Starting weekly maintenance tasks..."

# Update system packages (staging first)
if [ "$ENVIRONMENT" = "staging" ]; then
    echo "Updating system packages..."
    apt update && apt upgrade -y
fi

# Analyze database performance
echo "Analyzing database performance..."
psql $DATABASE_URL -c "
    SELECT schemaname, tablename, attname, n_distinct, correlation 
    FROM pg_stats 
    WHERE schemaname = 'public' 
    ORDER BY n_distinct DESC 
    LIMIT 20;
"

# Check for slow queries
echo "Checking for slow queries..."
psql $DATABASE_URL -c "
    SELECT query, mean_time, calls, total_time 
    FROM pg_stat_statements 
    ORDER BY mean_time DESC 
    LIMIT 10;
"

# Vacuum and analyze database
echo "Running database maintenance..."
psql $DATABASE_URL -c "VACUUM ANALYZE;"

# Check for unused indexes
echo "Checking for unused indexes..."
psql $DATABASE_URL -c "
    SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch 
    FROM pg_stat_user_indexes 
    WHERE idx_tup_read = 0 AND idx_tup_fetch = 0;
"

# Clean up old backups
echo "Cleaning up old backups..."
find /backups -name "*.sql" -mtime +30 -delete
find /backups -name "*.tar.gz" -mtime +30 -delete

# Check container resource usage
echo "Checking container resource usage..."
docker stats --no-stream

# Update security patches
echo "Checking for security updates..."
apt list --upgradable | grep -i security

# Review access logs for anomalies
echo "Reviewing access logs..."
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -20

echo "Weekly maintenance completed."
```

### 3. **Monthly Tasks**

```bash
#!/bin/bash
# scripts/monthly-maintenance.sh

set -e

echo "Starting monthly maintenance tasks..."

# Full database backup
echo "Creating full database backup..."
BACKUP_FILE="/backups/monthly/youtubex_$(date +%Y%m%d).sql"
pg_dump $DATABASE_URL > $BACKUP_FILE
gzip $BACKUP_FILE

# Analyze application metrics
echo "Generating monthly metrics report..."
node scripts/generate-metrics-report.js --month=$(date +%Y-%m)

# Review and update SSL certificates
echo "Checking SSL certificate status..."
certbot certificates

# Security audit
echo "Running security audit..."
npm audit --audit-level moderate

# Performance baseline update
echo "Updating performance baselines..."
node scripts/update-performance-baselines.js

# Capacity planning review
echo "Reviewing capacity metrics..."
node scripts/capacity-planning-report.js

# Clean up old Docker images
echo "Cleaning up old Docker images..."
docker image prune -a --filter "until=720h" -f

# Update documentation
echo "Checking documentation updates..."
git log --since="1 month ago" --oneline docs/

echo "Monthly maintenance completed."
```

## Backup and Recovery

### 1. **Backup Strategy**

```typescript
// scripts/backup-manager.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

interface BackupConfig {
  type: 'database' | 'files' | 'full';
  retention: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  storage: {
    local: string;
    s3?: {
      bucket: string;
      region: string;
    };
  };
}

class BackupManager {
  private config: BackupConfig;
  private s3?: AWS.S3;

  constructor(config: BackupConfig) {
    this.config = config;
    
    if (config.storage.s3) {
      this.s3 = new AWS.S3({
        region: config.storage.s3.region,
      });
    }
  }

  async createDatabaseBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `database-backup-${timestamp}.sql`;
    const filepath = path.join(this.config.storage.local, filename);

    console.log(`Creating database backup: ${filename}`);

    try {
      // Create backup
      await execAsync(`pg_dump ${process.env.DATABASE_URL} > ${filepath}`);
      
      // Compress backup
      await execAsync(`gzip ${filepath}`);
      const compressedPath = `${filepath}.gz`;

      // Verify backup
      const stats = fs.statSync(compressedPath);
      if (stats.size === 0) {
        throw new Error('Backup file is empty');
      }

      console.log(`Database backup created: ${compressedPath} (${stats.size} bytes)`);

      // Upload to S3 if configured
      if (this.s3 && this.config.storage.s3) {
        await this.uploadToS3(compressedPath, `database/${filename}.gz`);
      }

      return compressedPath;
    } catch (error) {
      console.error('Database backup failed:', error);
      throw error;
    }
  }

  async createFilesBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `files-backup-${timestamp}.tar.gz`;
    const filepath = path.join(this.config.storage.local, filename);

    console.log(`Creating files backup: ${filename}`);

    try {
      // Create tar archive of important directories
      const directories = [
        '/app/uploads',
        '/app/config',
        '/app/ssl',
        '/etc/nginx/conf.d',
      ].filter(dir => fs.existsSync(dir));

      if (directories.length === 0) {
        throw new Error('No directories found to backup');
      }

      await execAsync(`tar -czf ${filepath} ${directories.join(' ')}`);

      // Verify backup
      const stats = fs.statSync(filepath);
      if (stats.size === 0) {
        throw new Error('Files backup is empty');
      }

      console.log(`Files backup created: ${filepath} (${stats.size} bytes)`);

      // Upload to S3 if configured
      if (this.s3 && this.config.storage.s3) {
        await this.uploadToS3(filepath, `files/${filename}`);
      }

      return filepath;
    } catch (error) {
      console.error('Files backup failed:', error);
      throw error;
    }
  }

  async restoreDatabase(backupPath: string): Promise<void> {
    console.log(`Restoring database from: ${backupPath}`);

    try {
      // Check if backup file exists
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }

      // Decompress if needed
      let sqlFile = backupPath;
      if (backupPath.endsWith('.gz')) {
        sqlFile = backupPath.replace('.gz', '');
        await execAsync(`gunzip -c ${backupPath} > ${sqlFile}`);
      }

      // Create a backup of current database before restore
      const currentBackup = await this.createDatabaseBackup();
      console.log(`Current database backed up to: ${currentBackup}`);

      // Restore database
      await execAsync(`psql ${process.env.DATABASE_URL} < ${sqlFile}`);

      console.log('Database restore completed successfully');

      // Clean up temporary files
      if (sqlFile !== backupPath) {
        fs.unlinkSync(sqlFile);
      }
    } catch (error) {
      console.error('Database restore failed:', error);
      throw error;
    }
  }

  async cleanupOldBackups(): Promise<void> {
    console.log('Cleaning up old backups...');

    const now = new Date();
    const files = fs.readdirSync(this.config.storage.local);

    for (const file of files) {
      const filepath = path.join(this.config.storage.local, file);
      const stats = fs.statSync(filepath);
      const ageInDays = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

      let shouldDelete = false;

      if (file.includes('database-backup')) {
        shouldDelete = ageInDays > this.config.retention.daily;
      } else if (file.includes('files-backup')) {
        shouldDelete = ageInDays > this.config.retention.daily;
      }

      if (shouldDelete) {
        console.log(`Deleting old backup: ${file}`);
        fs.unlinkSync(filepath);
      }
    }
  }

  private async uploadToS3(localPath: string, s3Key: string): Promise<void> {
    if (!this.s3 || !this.config.storage.s3) {
      return;
    }

    console.log(`Uploading to S3: ${s3Key}`);

    const fileStream = fs.createReadStream(localPath);
    
    const uploadParams = {
      Bucket: this.config.storage.s3.bucket,
      Key: s3Key,
      Body: fileStream,
      ServerSideEncryption: 'AES256',
    };

    try {
      await this.s3.upload(uploadParams).promise();
      console.log(`Successfully uploaded to S3: ${s3Key}`);
    } catch (error) {
      console.error(`S3 upload failed: ${error}`);
      throw error;
    }
  }

  async testBackupIntegrity(backupPath: string): Promise<boolean> {
    console.log(`Testing backup integrity: ${backupPath}`);

    try {
      if (backupPath.endsWith('.sql.gz')) {
        // Test gzip integrity
        await execAsync(`gzip -t ${backupPath}`);
        
        // Test SQL syntax
        await execAsync(`gunzip -c ${backupPath} | head -100 | psql ${process.env.TEST_DATABASE_URL} --dry-run`);
      } else if (backupPath.endsWith('.tar.gz')) {
        // Test tar integrity
        await execAsync(`tar -tzf ${backupPath} > /dev/null`);
      }

      console.log('Backup integrity test passed');
      return true;
    } catch (error) {
      console.error('Backup integrity test failed:', error);
      return false;
    }
  }
}

// Usage example
const backupConfig: BackupConfig = {
  type: 'full',
  retention: {
    daily: 7,
    weekly: 4,
    monthly: 12,
  },
  storage: {
    local: '/backups',
    s3: {
      bucket: 'youtubex-backups',
      region: 'us-east-1',
    },
  },
};

export const backupManager = new BackupManager(backupConfig);

// Automated backup script
if (require.main === module) {
  (async () => {
    try {
      await backupManager.createDatabaseBackup();
      await backupManager.createFilesBackup();
      await backupManager.cleanupOldBackups();
      console.log('Backup process completed successfully');
    } catch (error) {
      console.error('Backup process failed:', error);
      process.exit(1);
    }
  })();
}
```

### 2. **Disaster Recovery Plan**

```bash
#!/bin/bash
# scripts/disaster-recovery.sh

set -e

DR_TYPE=${1:-"partial"}
BACKUP_DATE=${2:-"latest"}

echo "Starting disaster recovery process..."
echo "Recovery type: $DR_TYPE"
echo "Backup date: $BACKUP_DATE"

# Function to restore from S3
restore_from_s3() {
    local backup_type=$1
    local backup_date=$2
    
    echo "Downloading backup from S3..."
    aws s3 cp s3://youtubex-backups/${backup_type}/backup-${backup_date}.sql.gz /tmp/
    
    echo "Restoring database..."
    gunzip -c /tmp/backup-${backup_date}.sql.gz | psql $DATABASE_URL
}

# Function to restore application
restore_application() {
    echo "Restoring application..."
    
    # Pull latest Docker image
    docker pull ghcr.io/yourusername/youtubex:latest
    
    # Stop current containers
    docker-compose down
    
    # Start with restored data
    docker-compose up -d
    
    # Wait for services to be ready
    sleep 30
    
    # Run health checks
    curl -f http://localhost/health
}

# Function to restore infrastructure
restore_infrastructure() {
    echo "Restoring infrastructure..."
    
    # Recreate infrastructure using Terraform
    cd infrastructure/
    terraform init
    terraform plan
    terraform apply -auto-approve
    
    # Wait for infrastructure to be ready
    sleep 60
}

case $DR_TYPE in
    "partial")
        echo "Performing partial recovery (data only)..."
        restore_from_s3 "database" $BACKUP_DATE
        ;;
    "full")
        echo "Performing full recovery..."
        restore_infrastructure
        restore_from_s3 "database" $BACKUP_DATE
        restore_application
        ;;
    "infrastructure")
        echo "Performing infrastructure recovery..."
        restore_infrastructure
        ;;
    *)
        echo "Invalid recovery type. Use: partial, full, or infrastructure"
        exit 1
        ;;
esac

# Verify recovery
echo "Verifying recovery..."

# Check database connectivity
psql $DATABASE_URL -c "SELECT version();"

# Check application health
curl -f http://localhost/health

# Check key functionality
curl -f http://localhost/api/videos?limit=1

echo "Disaster recovery completed successfully!"

# Send notification
if [ -n "$SLACK_WEBHOOK" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"Disaster recovery completed successfully! Type: $DR_TYPE\"}" \
        "$SLACK_WEBHOOK"
fi
```

## Performance Optimization

### 1. **Database Performance Tuning**

```sql
-- scripts/database-optimization.sql

-- Analyze table statistics
ANALYZE;

-- Check for missing indexes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
    AND n_distinct > 100
    AND correlation < 0.1
ORDER BY n_distinct DESC;

-- Find slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 20;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Find unused indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
    AND indexname NOT LIKE '%_pkey';

-- Table bloat analysis
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Optimize common queries

-- Create indexes for video searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_title_gin 
ON videos USING gin(to_tsvector('english', title));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_published_at 
ON videos(published_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_view_count 
ON videos(view_count DESC);

-- Create indexes for user activities
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_activities_user_id_created_at 
ON user_activities(user_id, created_at DESC);

-- Create partial indexes for active users
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active 
ON users(last_login_at) WHERE last_login_at > NOW() - INTERVAL '30 days';

-- Update table statistics
VACUUM ANALYZE;
```

### 2. **Application Performance Monitoring**

```typescript
// scripts/performance-monitor.ts
import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

class PerformanceMonitor extends EventEmitter {
  private metrics: PerformanceMetric[] = [];
  private thresholds: Record<string, number> = {
    'api.response_time': 1000, // 1 second
    'database.query_time': 500, // 500ms
    'cache.miss_rate': 0.2, // 20%
    'memory.usage': 0.8, // 80%
    'cpu.usage': 0.7, // 70%
  };

  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    };

    this.metrics.push(metric);
    this.emit('metric', metric);

    // Check thresholds
    const threshold = this.thresholds[name];
    if (threshold && value > threshold) {
      this.emit('threshold_exceeded', { metric, threshold });
    }

    // Keep only recent metrics (last hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
  }

  getMetrics(name?: string, since?: number): PerformanceMetric[] {
    let filtered = this.metrics;

    if (name) {
      filtered = filtered.filter(m => m.name === name);
    }

    if (since) {
      filtered = filtered.filter(m => m.timestamp > since);
    }

    return filtered;
  }

  getAverageMetric(name: string, since?: number): number {
    const metrics = this.getMetrics(name, since);
    if (metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  getPercentile(name: string, percentile: number, since?: number): number {
    const metrics = this.getMetrics(name, since);
    if (metrics.length === 0) return 0;

    const sorted = metrics.map(m => m.value).sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  // Middleware for Express.js
  expressMiddleware() {
    return (req: any, res: any, next: any) => {
      const start = performance.now();

      res.on('finish', () => {
        const duration = performance.now() - start;
        this.recordMetric('api.response_time', duration, {
          method: req.method,
          route: req.route?.path || req.path,
          status: res.statusCode.toString(),
        });
      });

      next();
    };
  }

  // Database query monitoring
  monitorDatabaseQuery<T>(queryName: string, queryFn: () => Promise<T>): Promise<T> {
    const start = performance.now();

    return queryFn().then(
      (result) => {
        const duration = performance.now() - start;
        this.recordMetric('database.query_time', duration, {
          query: queryName,
          status: 'success',
        });
        return result;
      },
      (error) => {
        const duration = performance.now() - start;
        this.recordMetric('database.query_time', duration, {
          query: queryName,
          status: 'error',
        });
        throw error;
      }
    );
  }

  // Cache monitoring
  monitorCache(operation: 'hit' | 'miss', cacheType: string): void {
    this.recordMetric('cache.operation', 1, {
      operation,
      type: cacheType,
    });
  }

  // System resource monitoring
  async monitorSystemResources(): Promise<void> {
    try {
      // Memory usage
      const memUsage = process.memoryUsage();
      const totalMem = require('os').totalmem();
      const memoryUsage = memUsage.heapUsed / totalMem;
      this.recordMetric('memory.usage', memoryUsage);

      // CPU usage (simplified)
      const cpuUsage = process.cpuUsage();
      const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
      this.recordMetric('cpu.usage', cpuPercent);

      // Event loop lag
      const start = process.hrtime.bigint();
      setImmediate(() => {
        const lag = Number(process.hrtime.bigint() - start) / 1000000; // Convert to ms
        this.recordMetric('event_loop.lag', lag);
      });
    } catch (error) {
      console.error('Error monitoring system resources:', error);
    }
  }

  // Generate performance report
  generateReport(since?: number): any {
    const sinceTime = since || Date.now() - 60 * 60 * 1000; // Last hour
    
    const report = {
      timestamp: new Date().toISOString(),
      period: {
        start: new Date(sinceTime).toISOString(),
        end: new Date().toISOString(),
      },
      metrics: {} as any,
    };

    // API performance
    report.metrics.api = {
      average_response_time: this.getAverageMetric('api.response_time', sinceTime),
      p95_response_time: this.getPercentile('api.response_time', 95, sinceTime),
      p99_response_time: this.getPercentile('api.response_time', 99, sinceTime),
    };

    // Database performance
    report.metrics.database = {
      average_query_time: this.getAverageMetric('database.query_time', sinceTime),
      p95_query_time: this.getPercentile('database.query_time', 95, sinceTime),
    };

    // System resources
    report.metrics.system = {
      average_memory_usage: this.getAverageMetric('memory.usage', sinceTime),
      average_cpu_usage: this.getAverageMetric('cpu.usage', sinceTime),
      average_event_loop_lag: this.getAverageMetric('event_loop.lag', sinceTime),
    };

    return report;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Set up automatic system monitoring
setInterval(() => {
  performanceMonitor.monitorSystemResources();
}, 30000); // Every 30 seconds

// Set up threshold alerts
performanceMonitor.on('threshold_exceeded', ({ metric, threshold }) => {
  console.warn(`Performance threshold exceeded: ${metric.name} = ${metric.value} (threshold: ${threshold})`);
  
  // Send alert to monitoring system
  // This could integrate with your alerting system
});
```

## Troubleshooting Guide

### 1. **Common Issues and Solutions**

```bash
#!/bin/bash
# scripts/troubleshoot.sh

ISSUE_TYPE=${1:-"all"}

echo "YouTubeX Troubleshooting Guide"
echo "=============================="

troubleshoot_high_cpu() {
    echo "Investigating high CPU usage..."
    
    # Check top processes
    echo "Top CPU consuming processes:"
    ps aux --sort=-%cpu | head -10
    
    # Check Node.js processes
    echo "Node.js processes:"
    ps aux | grep node
    
    # Check for infinite loops in logs
    echo "Checking for error loops:"
    tail -1000 /var/log/youtubex/app.log | grep -c "Error" | awk '{if($1>100) print "WARNING: High error count detected: " $1}'
    
    # Check event loop lag
    echo "Checking event loop lag:"
    node -e "const start = process.hrtime.bigint(); setImmediate(() => console.log('Event loop lag:', Number(process.hrtime.bigint() - start) / 1000000, 'ms'));"
}

troubleshoot_high_memory() {
    echo "Investigating high memory usage..."
    
    # Check memory usage
    echo "Memory usage:"
    free -h
    
    # Check top memory consuming processes
    echo "Top memory consuming processes:"
    ps aux --sort=-%mem | head -10
    
    # Check for memory leaks in Node.js
    echo "Node.js memory usage:"
    node -e "console.log(process.memoryUsage());"
    
    # Check Docker container memory
    echo "Docker container memory usage:"
    docker stats --no-stream
}

troubleshoot_database_issues() {
    echo "Investigating database issues..."
    
    # Check database connectivity
    echo "Testing database connection:"
    psql $DATABASE_URL -c "SELECT version();" || echo "ERROR: Cannot connect to database"
    
    # Check active connections
    echo "Active database connections:"
    psql $DATABASE_URL -c "SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active';"
    
    # Check for long-running queries
    echo "Long-running queries:"
    psql $DATABASE_URL -c "
        SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
        FROM pg_stat_activity 
        WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
    "
    
    # Check for locks
    echo "Database locks:"
    psql $DATABASE_URL -c "
        SELECT blocked_locks.pid AS blocked_pid,
               blocked_activity.usename AS blocked_user,
               blocking_locks.pid AS blocking_pid,
               blocking_activity.usename AS blocking_user,
               blocked_activity.query AS blocked_statement,
               blocking_activity.query AS current_statement_in_blocking_process
        FROM pg_catalog.pg_locks blocked_locks
        JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
        JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
        JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
        WHERE NOT blocked_locks.granted;
    "
}

troubleshoot_api_errors() {
    echo "Investigating API errors..."
    
    # Check recent error logs
    echo "Recent API errors:"
    grep -i "error" /var/log/youtubex/app.log | tail -20
    
    # Check API response times
    echo "API health check:"
    curl -w "@curl-format.txt" -o /dev/null -s http://localhost/health
    
    # Check external API connectivity
    echo "YouTube API connectivity:"
    curl -s "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=$YOUTUBE_API_KEY" | jq '.items | length'
    
    # Check rate limiting
    echo "Checking rate limits:"
    redis-cli get "rate_limit:global" || echo "No rate limit data found"
}

troubleshoot_network_issues() {
    echo "Investigating network issues..."
    
    # Check network connectivity
    echo "Network connectivity:"
    ping -c 3 google.com
    
    # Check DNS resolution
    echo "DNS resolution:"
    nslookup youtube.com
    
    # Check port availability
    echo "Port availability:"
    netstat -tlnp | grep :80
    netstat -tlnp | grep :443
    
    # Check SSL certificate
    echo "SSL certificate status:"
    echo | openssl s_client -servername youtubex.com -connect youtubex.com:443 2>/dev/null | openssl x509 -noout -dates
}

troubleshoot_docker_issues() {
    echo "Investigating Docker issues..."
    
    # Check container status
    echo "Container status:"
    docker ps -a
    
    # Check container logs
    echo "Recent container logs:"
    docker logs --tail 50 youtubex-app
    
    # Check container resources
    echo "Container resource usage:"
    docker stats --no-stream
    
    # Check Docker daemon
    echo "Docker daemon status:"
    systemctl status docker
}

case $ISSUE_TYPE in
    "cpu")
        troubleshoot_high_cpu
        ;;
    "memory")
        troubleshoot_high_memory
        ;;
    "database")
        troubleshoot_database_issues
        ;;
    "api")
        troubleshoot_api_errors
        ;;
    "network")
        troubleshoot_network_issues
        ;;
    "docker")
        troubleshoot_docker_issues
        ;;
    "all")
        echo "Running comprehensive troubleshooting..."
        troubleshoot_high_cpu
        echo ""
        troubleshoot_high_memory
        echo ""
        troubleshoot_database_issues
        echo ""
        troubleshoot_api_errors
        echo ""
        troubleshoot_network_issues
        echo ""
        troubleshoot_docker_issues
        ;;
    *)
        echo "Usage: $0 [cpu|memory|database|api|network|docker|all]"
        exit 1
        ;;
esac

echo ""
echo "Troubleshooting completed. Check the output above for any issues."
```

### 2. **Log Analysis Tools**

```bash
#!/bin/bash
# scripts/log-analyzer.sh

LOG_FILE=${1:-"/var/log/youtubex/app.log"}
TIME_RANGE=${2:-"1h"}

echo "Analyzing logs: $LOG_FILE"
echo "Time range: $TIME_RANGE"
echo "=============================="

# Convert time range to minutes
case $TIME_RANGE in
    *h) MINUTES=$((${TIME_RANGE%h} * 60)) ;;
    *m) MINUTES=${TIME_RANGE%m} ;;
    *) MINUTES=60 ;;
esac

# Get logs from the specified time range
SINCE_TIME=$(date -d "$MINUTES minutes ago" '+%Y-%m-%d %H:%M:%S')
echo "Analyzing logs since: $SINCE_TIME"

# Error analysis
echo ""
echo "Error Analysis:"
echo "==============="
awk -v since="$SINCE_TIME" '$0 >= since && /ERROR|Error|error/ {print}' $LOG_FILE | \
    awk '{print $NF}' | sort | uniq -c | sort -nr | head -10

# Response time analysis
echo ""
echo "Response Time Analysis:"
echo "======================"
grep "HTTP Request Completed" $LOG_FILE | \
    awk -v since="$SINCE_TIME" '$0 >= since {print}' | \
    grep -o '"duration":[0-9]*' | \
    cut -d: -f2 | \
    awk '{
        sum += $1; 
        count++; 
        if($1 > max) max = $1;
        if(min == "" || $1 < min) min = $1;
    } END {
        if(count > 0) {
            print "Average response time:", sum/count "ms";
            print "Min response time:", min "ms";
            print "Max response time:", max "ms";
            print "Total requests:", count;
        }
    }'

# Top endpoints
echo ""
echo "Top Endpoints:"
echo "=============="
grep "HTTP Request Completed" $LOG_FILE | \
    awk -v since="$SINCE_TIME" '$0 >= since {print}' | \
    grep -o '"url":"[^"]*"' | \
    cut -d'"' -f4 | \
    sort | uniq -c | sort -nr | head -10

# Status code distribution
echo ""
echo "Status Code Distribution:"
echo "========================"
grep "HTTP Request Completed" $LOG_FILE | \
    awk -v since="$SINCE_TIME" '$0 >= since {print}' | \
    grep -o '"statusCode":[0-9]*' | \
    cut -d: -f2 | \
    sort | uniq -c | sort -nr

# User activity
echo ""
echo "User Activity:"
echo "=============="
grep "userId" $LOG_FILE | \
    awk -v since="$SINCE_TIME" '$0 >= since {print}' | \
    grep -o '"userId":"[^"]*"' | \
    cut -d'"' -f4 | \
    sort | uniq -c | sort -nr | head -10

# Search for specific patterns
echo ""
echo "Security Events:"
echo "================"
grep -i "security\|auth\|login\|unauthorized" $LOG_FILE | \
    awk -v since="$SINCE_TIME" '$0 >= since {print}' | \
    tail -10

echo ""
echo "Performance Issues:"
echo "=================="
grep -i "slow\|timeout\|performance" $LOG_FILE | \
    awk -v since="$SINCE_TIME" '$0 >= since {print}' | \
    tail -10

echo ""
echo "Log analysis completed."
```

This maintenance and operations guide provides comprehensive procedures and tools for effectively managing the YouTubeX application in production, ensuring optimal performance, reliability, and quick issue resolution.