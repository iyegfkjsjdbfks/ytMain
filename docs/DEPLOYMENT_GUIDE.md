# Deployment Guide

## Overview

This comprehensive deployment guide covers all aspects of deploying the YouTubeX application to various environments, including development, staging, and production. It includes containerization, CI/CD pipelines, monitoring, and best practices for scalable deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Monitoring and Logging](#monitoring-and-logging)
7. [Security Configuration](#security-configuration)
8. [Performance Optimization](#performance-optimization)
9. [Backup and Recovery](#backup-and-recovery)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

```yaml
# Minimum requirements
CPU: 2 cores
RAM: 4GB
Storage: 20GB SSD
Network: 100 Mbps

# Recommended for production
CPU: 4+ cores
RAM: 8GB+
Storage: 50GB+ SSD
Network: 1 Gbps
```

### Required Software

```bash
# Core dependencies
Node.js >= 18.0.0
npm >= 8.0.0
Docker >= 20.10.0
Docker Compose >= 2.0.0

# Optional but recommended
Kubernetes >= 1.24
Helm >= 3.8.0
Terraform >= 1.0.0
```

### Environment Setup

```bash
# Install Node.js (using nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.12.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Environment Configuration

### 1. **Environment Variables**

```bash
# .env.development
NODE_ENV=development
REACT_APP_API_URL=http://localhost:3001
REACT_APP_YOUTUBE_API_KEY=your_dev_api_key
REACT_APP_GOOGLE_CLIENT_ID=your_dev_client_id
REACT_APP_FIREBASE_CONFIG=your_dev_firebase_config
REACT_APP_SENTRY_DSN=your_dev_sentry_dsn
REACT_APP_ANALYTICS_ID=your_dev_analytics_id

# .env.staging
NODE_ENV=staging
REACT_APP_API_URL=https://api-staging.youtubex.com
REACT_APP_YOUTUBE_API_KEY=your_staging_api_key
REACT_APP_GOOGLE_CLIENT_ID=your_staging_client_id
REACT_APP_FIREBASE_CONFIG=your_staging_firebase_config
REACT_APP_SENTRY_DSN=your_staging_sentry_dsn
REACT_APP_ANALYTICS_ID=your_staging_analytics_id

# .env.production
NODE_ENV=production
REACT_APP_API_URL=https://api.youtubex.com
REACT_APP_YOUTUBE_API_KEY=your_prod_api_key
REACT_APP_GOOGLE_CLIENT_ID=your_prod_client_id
REACT_APP_FIREBASE_CONFIG=your_prod_firebase_config
REACT_APP_SENTRY_DSN=your_prod_sentry_dsn
REACT_APP_ANALYTICS_ID=your_prod_analytics_id

# Security variables (never commit these)
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

### 2. **Configuration Management**

```typescript
// config/deployment.ts
interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  cache: {
    ttl: number;
    maxSize: number;
  };
  monitoring: {
    enabled: boolean;
    sampleRate: number;
  };
  features: {
    [key: string]: boolean;
  };
}

const deploymentConfigs: Record<string, DeploymentConfig> = {
  development: {
    environment: 'development',
    api: {
      baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
      timeout: 10000,
      retries: 3,
    },
    cache: {
      ttl: 300000, // 5 minutes
      maxSize: 100,
    },
    monitoring: {
      enabled: false,
      sampleRate: 1.0,
    },
    features: {
      liveStreaming: true,
      analytics: false,
      betaFeatures: true,
    },
  },
  staging: {
    environment: 'staging',
    api: {
      baseUrl: process.env.REACT_APP_API_URL || 'https://api-staging.youtubex.com',
      timeout: 15000,
      retries: 3,
    },
    cache: {
      ttl: 600000, // 10 minutes
      maxSize: 500,
    },
    monitoring: {
      enabled: true,
      sampleRate: 0.1,
    },
    features: {
      liveStreaming: true,
      analytics: true,
      betaFeatures: true,
    },
  },
  production: {
    environment: 'production',
    api: {
      baseUrl: process.env.REACT_APP_API_URL || 'https://api.youtubex.com',
      timeout: 20000,
      retries: 5,
    },
    cache: {
      ttl: 1800000, // 30 minutes
      maxSize: 1000,
    },
    monitoring: {
      enabled: true,
      sampleRate: 0.01,
    },
    features: {
      liveStreaming: true,
      analytics: true,
      betaFeatures: false,
    },
  },
};

export const getDeploymentConfig = (): DeploymentConfig => {
  const env = process.env.NODE_ENV || 'development';
  return deploymentConfigs[env] || deploymentConfigs.development;
};

// Feature flag utility
export const isFeatureEnabled = (feature: string): boolean => {
  const config = getDeploymentConfig();
  return config.features[feature] || false;
};
```

## Docker Deployment

### 1. **Multi-stage Dockerfile**

```dockerfile
# Dockerfile.production
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.ts ./

# Build application
ARG NODE_ENV=production
ARG REACT_APP_API_URL
ARG REACT_APP_YOUTUBE_API_KEY
ARG REACT_APP_GOOGLE_CLIENT_ID

RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache curl

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx.prod.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
USER nextjs

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 2. **Docker Compose Configuration**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.production
      args:
        NODE_ENV: production
        REACT_APP_API_URL: ${REACT_APP_API_URL}
        REACT_APP_YOUTUBE_API_KEY: ${REACT_APP_YOUTUBE_API_KEY}
        REACT_APP_GOOGLE_CLIENT_ID: ${REACT_APP_GOOGLE_CLIENT_ID}
    ports:
      - "80:80"
      - "443:443"
    environment:
      - NODE_ENV=production
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
      - ./logs:/var/log/nginx
    restart: unless-stopped
    networks:
      - app-network
    depends_on:
      - redis
      - postgres
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    restart: unless-stopped
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx-proxy:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-proxy.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app-network

volumes:
  redis-data:
  postgres-data:

networks:
  app-network:
    driver: bridge
```

### 3. **Nginx Configuration**

```nginx
# nginx.prod.conf
server {
    listen 80;
    server_name youtubex.com www.youtubex.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name youtubex.com www.youtubex.com;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; media-src 'self' https:; connect-src 'self' https:; frame-src https://www.youtube.com;";

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Root directory
    root /usr/share/nginx/html;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API proxy
    location /api/ {
        proxy_pass http://api-server:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

## Cloud Deployment

### 1. **AWS Deployment**

```yaml
# aws-infrastructure.yml (CloudFormation)
AWSTemplateFormatVersion: '2010-09-09'
Description: 'YouTubeX Application Infrastructure'

Parameters:
  Environment:
    Type: String
    Default: production
    AllowedValues: [development, staging, production]
  
  InstanceType:
    Type: String
    Default: t3.medium
    AllowedValues: [t3.small, t3.medium, t3.large]

Resources:
  # VPC Configuration
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub '${Environment}-youtubex-vpc'

  # Internet Gateway
  InternetGateway:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: !Sub '${Environment}-youtubex-igw'

  # Public Subnets
  PublicSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: !Select [0, !GetAZs '']
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub '${Environment}-public-subnet-1'

  PublicSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.2.0/24
      AvailabilityZone: !Select [1, !GetAZs '']
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub '${Environment}-public-subnet-2'

  # Application Load Balancer
  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: !Sub '${Environment}-youtubex-alb'
      Scheme: internet-facing
      Type: application
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2
      SecurityGroups:
        - !Ref ALBSecurityGroup

  # ECS Cluster
  ECSCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: !Sub '${Environment}-youtubex-cluster'
      CapacityProviders:
        - FARGATE
        - FARGATE_SPOT
      DefaultCapacityProviderStrategy:
        - CapacityProvider: FARGATE
          Weight: 1
        - CapacityProvider: FARGATE_SPOT
          Weight: 4

  # ECS Task Definition
  TaskDefinition:
    Type: AWS::ECS::TaskDefinition
    Properties:
      Family: !Sub '${Environment}-youtubex-task'
      NetworkMode: awsvpc
      RequiresCompatibilities:
        - FARGATE
      Cpu: 512
      Memory: 1024
      ExecutionRoleArn: !Ref TaskExecutionRole
      TaskRoleArn: !Ref TaskRole
      ContainerDefinitions:
        - Name: youtubex-app
          Image: !Sub '${AWS::AccountId}.dkr.ecr.${AWS::Region}.amazonaws.com/youtubex:latest'
          PortMappings:
            - ContainerPort: 80
              Protocol: tcp
          Environment:
            - Name: NODE_ENV
              Value: !Ref Environment
            - Name: REACT_APP_API_URL
              Value: !Sub 'https://api-${Environment}.youtubex.com'
          LogConfiguration:
            LogDriver: awslogs
            Options:
              awslogs-group: !Ref LogGroup
              awslogs-region: !Ref AWS::Region
              awslogs-stream-prefix: ecs
          HealthCheck:
            Command:
              - CMD-SHELL
              - 'curl -f http://localhost:80/health || exit 1'
            Interval: 30
            Timeout: 5
            Retries: 3
            StartPeriod: 60

  # ECS Service
  ECSService:
    Type: AWS::ECS::Service
    DependsOn: ALBListener
    Properties:
      ServiceName: !Sub '${Environment}-youtubex-service'
      Cluster: !Ref ECSCluster
      TaskDefinition: !Ref TaskDefinition
      DesiredCount: 2
      LaunchType: FARGATE
      NetworkConfiguration:
        AwsvpcConfiguration:
          SecurityGroups:
            - !Ref ECSSecurityGroup
          Subnets:
            - !Ref PublicSubnet1
            - !Ref PublicSubnet2
          AssignPublicIp: ENABLED
      LoadBalancers:
        - ContainerName: youtubex-app
          ContainerPort: 80
          TargetGroupArn: !Ref TargetGroup
      HealthCheckGracePeriodSeconds: 300

  # Auto Scaling
  ServiceScalingTarget:
    Type: AWS::ApplicationAutoScaling::ScalableTarget
    Properties:
      MaxCapacity: 10
      MinCapacity: 2
      ResourceId: !Sub 'service/${ECSCluster}/${ECSService.Name}'
      RoleARN: !Sub 'arn:aws:iam::${AWS::AccountId}:role/aws-service-role/ecs.application-autoscaling.amazonaws.com/AWSServiceRoleForApplicationAutoScaling_ECSService'
      ScalableDimension: ecs:service:DesiredCount
      ServiceNamespace: ecs

  ServiceScalingPolicy:
    Type: AWS::ApplicationAutoScaling::ScalingPolicy
    Properties:
      PolicyName: !Sub '${Environment}-youtubex-scaling-policy'
      PolicyType: TargetTrackingScaling
      ScalingTargetId: !Ref ServiceScalingTarget
      TargetTrackingScalingPolicyConfiguration:
        PredefinedMetricSpecification:
          PredefinedMetricType: ECSServiceAverageCPUUtilization
        TargetValue: 70.0
        ScaleOutCooldown: 300
        ScaleInCooldown: 300

Outputs:
  LoadBalancerDNS:
    Description: 'Load Balancer DNS Name'
    Value: !GetAtt ApplicationLoadBalancer.DNSName
    Export:
      Name: !Sub '${Environment}-youtubex-alb-dns'

  ClusterName:
    Description: 'ECS Cluster Name'
    Value: !Ref ECSCluster
    Export:
      Name: !Sub '${Environment}-youtubex-cluster-name'
```

### 2. **Kubernetes Deployment**

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: youtubex-app
  namespace: youtubex
  labels:
    app: youtubex
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: youtubex
  template:
    metadata:
      labels:
        app: youtubex
        version: v1
    spec:
      containers:
      - name: youtubex
        image: youtubex:latest
        ports:
        - containerPort: 80
        env:
        - name: NODE_ENV
          value: "production"
        - name: REACT_APP_API_URL
          valueFrom:
            configMapKeyRef:
              name: youtubex-config
              key: api-url
        - name: REACT_APP_YOUTUBE_API_KEY
          valueFrom:
            secretKeyRef:
              name: youtubex-secrets
              key: youtube-api-key
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: nginx-config
          mountPath: /etc/nginx/conf.d
      volumes:
      - name: nginx-config
        configMap:
          name: nginx-config
      imagePullSecrets:
      - name: regcred

---
apiVersion: v1
kind: Service
metadata:
  name: youtubex-service
  namespace: youtubex
spec:
  selector:
    app: youtubex
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: youtubex-ingress
  namespace: youtubex
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - youtubex.com
    - www.youtubex.com
    secretName: youtubex-tls
  rules:
  - host: youtubex.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: youtubex-service
            port:
              number: 80
  - host: www.youtubex.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: youtubex-service
            port:
              number: 80

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: youtubex-hpa
  namespace: youtubex
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: youtubex-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## CI/CD Pipeline

### 1. **GitHub Actions Workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy YouTubeX

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
    
    - name: Run accessibility tests
      run: npm run test:a11y
    
    - name: Run security audit
      run: npm audit --audit-level moderate

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image: ${{ steps.image.outputs.image }}
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}
    
    - name: Build and push Docker image
      id: build
      uses: docker/build-push-action@v5
      with:
        context: .
        file: ./Dockerfile.production
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
        build-args: |
          NODE_ENV=production
          REACT_APP_API_URL=${{ secrets.REACT_APP_API_URL }}
          REACT_APP_YOUTUBE_API_KEY=${{ secrets.REACT_APP_YOUTUBE_API_KEY }}
    
    - name: Output image
      id: image
      run: echo "image=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}" >> $GITHUB_OUTPUT

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to staging
      run: |
        echo "Deploying ${{ needs.build.outputs.image }} to staging"
        # Add your staging deployment commands here
    
    - name: Run smoke tests
      run: |
        echo "Running smoke tests against staging"
        # Add your smoke test commands here

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to production
      run: |
        echo "Deploying ${{ needs.build.outputs.image }} to production"
        # Add your production deployment commands here
    
    - name: Run smoke tests
      run: |
        echo "Running smoke tests against production"
        # Add your smoke test commands here
    
    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()
```

### 2. **Deployment Scripts**

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

# Configuration
ENVIRONMENT=${1:-staging}
IMAGE_TAG=${2:-latest}
REGISTRY="ghcr.io/yourusername/youtubex"

echo "Deploying YouTubeX to $ENVIRONMENT environment..."

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    echo "Error: Environment must be 'staging' or 'production'"
    exit 1
fi

# Load environment variables
if [ -f ".env.$ENVIRONMENT" ]; then
    export $(cat .env.$ENVIRONMENT | xargs)
else
    echo "Error: .env.$ENVIRONMENT file not found"
    exit 1
fi

# Pre-deployment checks
echo "Running pre-deployment checks..."

# Check if image exists
if ! docker manifest inspect "$REGISTRY:$IMAGE_TAG" > /dev/null 2>&1; then
    echo "Error: Image $REGISTRY:$IMAGE_TAG not found"
    exit 1
fi

# Check database connectivity
if ! pg_isready -h "$DATABASE_HOST" -p "$DATABASE_PORT" -U "$DATABASE_USER"; then
    echo "Error: Cannot connect to database"
    exit 1
fi

# Backup database (production only)
if [ "$ENVIRONMENT" = "production" ]; then
    echo "Creating database backup..."
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    pg_dump "$DATABASE_URL" > "backups/$BACKUP_FILE"
    echo "Backup created: $BACKUP_FILE"
fi

# Deploy application
echo "Deploying application..."

if [ "$DEPLOYMENT_TYPE" = "kubernetes" ]; then
    # Kubernetes deployment
    kubectl set image deployment/youtubex-app youtubex="$REGISTRY:$IMAGE_TAG" -n youtubex
    kubectl rollout status deployment/youtubex-app -n youtubex --timeout=300s
else
    # Docker Compose deployment
    export IMAGE_TAG
    docker-compose -f docker-compose.$ENVIRONMENT.yml pull
    docker-compose -f docker-compose.$ENVIRONMENT.yml up -d --remove-orphans
fi

# Wait for deployment to be ready
echo "Waiting for deployment to be ready..."
sleep 30

# Health check
echo "Running health checks..."
HEALTH_URL="https://${ENVIRONMENT}.youtubex.com/health"
for i in {1..10}; do
    if curl -f "$HEALTH_URL" > /dev/null 2>&1; then
        echo "Health check passed"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "Error: Health check failed after 10 attempts"
        exit 1
    fi
    echo "Health check attempt $i failed, retrying in 10 seconds..."
    sleep 10
done

# Run smoke tests
echo "Running smoke tests..."
npm run test:smoke -- --env="$ENVIRONMENT"

# Clean up old images (keep last 5)
echo "Cleaning up old images..."
docker images "$REGISTRY" --format "table {{.Tag}}\t{{.CreatedAt}}" | \
    tail -n +2 | sort -k2 -r | tail -n +6 | awk '{print $1}' | \
    xargs -I {} docker rmi "$REGISTRY:{}" 2>/dev/null || true

echo "Deployment completed successfully!"

# Send notification
if [ -n "$SLACK_WEBHOOK" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"YouTubeX deployed to $ENVIRONMENT successfully! 🚀\"}" \
        "$SLACK_WEBHOOK"
fi
```

## Monitoring and Logging

### 1. **Application Monitoring**

```typescript
// monitoring/metrics.ts
import { createPrometheusMetrics } from '@prometheus/client';

// Custom metrics
export const metrics = {
  // HTTP request metrics
  httpRequestDuration: new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  }),
  
  httpRequestTotal: new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  }),
  
  // Application metrics
  activeUsers: new Gauge({
    name: 'active_users_total',
    help: 'Number of active users',
  }),
  
  videoPlays: new Counter({
    name: 'video_plays_total',
    help: 'Total number of video plays',
    labelNames: ['video_id', 'quality'],
  }),
  
  searchQueries: new Counter({
    name: 'search_queries_total',
    help: 'Total number of search queries',
    labelNames: ['query_type'],
  }),
  
  // Error metrics
  errorRate: new Counter({
    name: 'errors_total',
    help: 'Total number of errors',
    labelNames: ['error_type', 'component'],
  }),
  
  // Performance metrics
  pageLoadTime: new Histogram({
    name: 'page_load_time_seconds',
    help: 'Page load time in seconds',
    labelNames: ['page'],
    buckets: [0.5, 1, 2, 3, 5, 8, 10],
  }),
};

// Middleware for Express.js
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    metrics.httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
    
    metrics.httpRequestTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
  });
  
  next();
};

// React performance monitoring
export const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Monitor page load time
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navigationEntry = entry as PerformanceNavigationTiming;
          const loadTime = navigationEntry.loadEventEnd - navigationEntry.fetchStart;
          
          metrics.pageLoadTime
            .labels(window.location.pathname)
            .observe(loadTime / 1000);
        }
      }
    });
    
    observer.observe({ entryTypes: ['navigation'] });
    
    return () => observer.disconnect();
  }, []);
};
```

### 2. **Logging Configuration**

```typescript
// logging/logger.ts
import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

// Log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Create logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: {
    service: 'youtubex',
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION,
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'development'
        ? combine(colorize(), simple())
        : json(),
    }),
    
    // File transport
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add Elasticsearch transport for production
if (process.env.NODE_ENV === 'production' && process.env.ELASTICSEARCH_URL) {
  logger.add(new ElasticsearchTransport({
    level: 'info',
    clientOpts: {
      node: process.env.ELASTICSEARCH_URL,
      auth: {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD,
      },
    },
    index: 'youtubex-logs',
  }));
}

// Structured logging helpers
export const loggers = {
  request: (req: Request, res: Response, duration: number) => {
    logger.http('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id,
    });
  },
  
  error: (error: Error, context?: Record<string, any>) => {
    logger.error('Application Error', {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  },
  
  performance: (metric: string, value: number, labels?: Record<string, string>) => {
    logger.info('Performance Metric', {
      metric,
      value,
      labels,
    });
  },
  
  security: (event: string, details: Record<string, any>) => {
    logger.warn('Security Event', {
      event,
      ...details,
    });
  },
  
  business: (event: string, data: Record<string, any>) => {
    logger.info('Business Event', {
      event,
      ...data,
    });
  },
};
```

This deployment guide provides comprehensive coverage of deploying the YouTubeX application across different environments and platforms, ensuring scalability, reliability, and maintainability.