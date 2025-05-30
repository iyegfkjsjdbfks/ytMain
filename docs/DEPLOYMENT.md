# Deployment Guide

This guide covers various deployment options for the YouTube Studio Clone application, from local development to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Vercel Deployment](#vercel-deployment)
- [AWS Deployment](#aws-deployment)
- [Google Cloud Platform](#google-cloud-platform)
- [Azure Deployment](#azure-deployment)
- [Nginx Configuration](#nginx-configuration)
- [SSL/TLS Setup](#ssltls-setup)
- [Monitoring and Logging](#monitoring-and-logging)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Node.js**: 20.11.0 or higher
- **npm**: 10.0.0 or higher
- **Docker**: 24.0.0 or higher (for containerized deployment)
- **Git**: Latest version

### API Keys Required

- **YouTube Data API Key**: From Google Cloud Console
- **Google Gemini AI API Key**: From Google AI Studio (optional)
- **OAuth 2.0 Credentials**: For YouTube authentication

### Domain and SSL

- **Domain Name**: For production deployment
- **SSL Certificate**: Let's Encrypt or commercial certificate

## Environment Variables

### Required Variables

Create a `.env` file in the project root:

```bash
# YouTube API Configuration
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
VITE_YOUTUBE_CLIENT_ID=your_oauth_client_id
VITE_YOUTUBE_CLIENT_SECRET=your_oauth_client_secret

# Gemini AI Configuration (Optional)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Application Configuration
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://your-domain.com/api
VITE_APP_URL=https://your-domain.com

# Environment
NODE_ENV=production
VITE_ENVIRONMENT=production

# Analytics (Optional)
VITE_GA_TRACKING_ID=your_google_analytics_id
VITE_SENTRY_DSN=your_sentry_dsn

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_LIVE_STREAMING=true
VITE_ENABLE_ANALYTICS=true
```

### Environment-Specific Variables

#### Development
```bash
NODE_ENV=development
VITE_ENVIRONMENT=development
VITE_API_BASE_URL=http://localhost:5173/api
VITE_APP_URL=http://localhost:5173
VITE_ENABLE_DEBUG=true
```

#### Staging
```bash
NODE_ENV=production
VITE_ENVIRONMENT=staging
VITE_API_BASE_URL=https://staging.your-domain.com/api
VITE_APP_URL=https://staging.your-domain.com
VITE_ENABLE_DEBUG=false
```

#### Production
```bash
NODE_ENV=production
VITE_ENVIRONMENT=production
VITE_API_BASE_URL=https://your-domain.com/api
VITE_APP_URL=https://your-domain.com
VITE_ENABLE_DEBUG=false
```

## Local Development

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/username/ytastudioaug2.git
   cd ytastudioaug2
   ```

2. **Install dependencies**
   ```bash
   npm ci
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Docker Deployment

### Single Container Deployment

1. **Build the image**
   ```bash
   docker build -t youtube-studio-clone .
   ```

2. **Run the container**
   ```bash
   docker run -d \
     --name youtube-studio \
     -p 80:80 \
     -e VITE_YOUTUBE_API_KEY=your_api_key \
     -e VITE_GEMINI_API_KEY=your_gemini_key \
     youtube-studio-clone
   ```

3. **Access the application**
   ```
   http://localhost
   ```

### Docker Compose Deployment

1. **Production deployment**
   ```bash
   docker-compose --profile production up -d
   ```

2. **Development deployment**
   ```bash
   docker-compose --profile development up -d
   ```

3. **View logs**
   ```bash
   docker-compose logs -f
   ```

4. **Stop services**
   ```bash
   docker-compose down
   ```

### Docker Environment Variables

Create a `.env.docker` file:

```bash
# Application
VITE_YOUTUBE_API_KEY=your_youtube_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_APP_URL=https://your-domain.com

# Redis (if using)
REDIS_URL=redis://redis:6379

# Nginx
NGINX_HOST=your-domain.com
NGINX_PORT=80
```

### Health Checks

The Docker container includes health checks:

```bash
# Check container health
docker ps

# View health check logs
docker inspect --format='{{json .State.Health}}' youtube-studio
```

## Vercel Deployment

### Automatic Deployment

1. **Connect GitHub repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure environment variables**
   ```bash
   # In Vercel dashboard, add these environment variables:
   VITE_YOUTUBE_API_KEY=your_youtube_api_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_APP_URL=https://your-project.vercel.app
   ```

3. **Deploy**
   - Vercel will automatically deploy on every push to main branch

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Vercel Configuration

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ],
  "env": {
    "VITE_YOUTUBE_API_KEY": "@youtube_api_key",
    "VITE_GEMINI_API_KEY": "@gemini_api_key"
  }
}
```

## AWS Deployment

### AWS S3 + CloudFront

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Create S3 bucket**
   ```bash
   aws s3 mb s3://your-bucket-name
   ```

3. **Upload files**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

4. **Configure S3 for static hosting**
   ```bash
   aws s3 website s3://your-bucket-name \
     --index-document index.html \
     --error-document index.html
   ```

5. **Create CloudFront distribution**
   ```json
   {
     "CallerReference": "youtube-studio-clone",
     "Origins": {
       "Quantity": 1,
       "Items": [
         {
           "Id": "S3-your-bucket-name",
           "DomainName": "your-bucket-name.s3.amazonaws.com",
           "S3OriginConfig": {
             "OriginAccessIdentity": ""
           }
         }
       ]
     },
     "DefaultCacheBehavior": {
       "TargetOriginId": "S3-your-bucket-name",
       "ViewerProtocolPolicy": "redirect-to-https",
       "TrustedSigners": {
         "Enabled": false,
         "Quantity": 0
       },
       "ForwardedValues": {
         "QueryString": false,
         "Cookies": {
           "Forward": "none"
         }
       }
     },
     "Comment": "YouTube Studio Clone Distribution",
     "Enabled": true
   }
   ```

### AWS EC2 Deployment

1. **Launch EC2 instance**
   ```bash
   # Amazon Linux 2
   aws ec2 run-instances \
     --image-id ami-0abcdef1234567890 \
     --count 1 \
     --instance-type t3.micro \
     --key-name your-key-pair \
     --security-group-ids sg-903004f8
   ```

2. **Connect to instance**
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   ```

3. **Install dependencies**
   ```bash
   # Update system
   sudo yum update -y
   
   # Install Node.js
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install 20
   
   # Install Docker
   sudo yum install -y docker
   sudo service docker start
   sudo usermod -a -G docker ec2-user
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

4. **Deploy application**
   ```bash
   # Clone repository
   git clone https://github.com/username/ytastudioaug2.git
   cd ytastudioaug2
   
   # Set up environment
   cp .env.example .env
   # Edit .env with your values
   
   # Deploy with Docker
   docker-compose --profile production up -d
   ```

### AWS ECS Deployment

1. **Create task definition**
   ```json
   {
     "family": "youtube-studio-clone",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "youtube-studio-clone",
         "image": "your-account.dkr.ecr.region.amazonaws.com/youtube-studio-clone:latest",
         "portMappings": [
           {
             "containerPort": 80,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "VITE_YOUTUBE_API_KEY",
             "value": "your_api_key"
           }
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/youtube-studio-clone",
             "awslogs-region": "us-east-1",
             "awslogs-stream-prefix": "ecs"
           }
         }
       }
     ]
   }
   ```

2. **Create service**
   ```bash
   aws ecs create-service \
     --cluster your-cluster \
     --service-name youtube-studio-clone \
     --task-definition youtube-studio-clone:1 \
     --desired-count 2 \
     --launch-type FARGATE \
     --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
   ```

## Google Cloud Platform

### Cloud Run Deployment

1. **Build and push image**
   ```bash
   # Build image
   docker build -t gcr.io/your-project/youtube-studio-clone .
   
   # Push to Container Registry
   docker push gcr.io/your-project/youtube-studio-clone
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy youtube-studio-clone \
     --image gcr.io/your-project/youtube-studio-clone \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars VITE_YOUTUBE_API_KEY=your_api_key
   ```

### App Engine Deployment

1. **Create `app.yaml`**
   ```yaml
   runtime: nodejs20
   
   env_variables:
     VITE_YOUTUBE_API_KEY: your_api_key
     VITE_GEMINI_API_KEY: your_gemini_key
   
   handlers:
   - url: /static
     static_dir: dist/static
   
   - url: /.*
     static_files: dist/index.html
     upload: dist/index.html
   ```

2. **Deploy**
   ```bash
   gcloud app deploy
   ```

### Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```

3. **Configure `firebase.json`**
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ],
       "headers": [
         {
           "source": "**/*.@(js|css)",
           "headers": [
             {
               "key": "Cache-Control",
               "value": "max-age=31536000"
             }
           ]
         }
       ]
     }
   }
   ```

4. **Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

## Azure Deployment

### Azure Static Web Apps

1. **Create workflow file** (`.github/workflows/azure-static-web-apps.yml`)
   ```yaml
   name: Azure Static Web Apps CI/CD
   
   on:
     push:
       branches:
         - main
     pull_request:
       types: [opened, synchronize, reopened, closed]
       branches:
         - main
   
   jobs:
     build_and_deploy_job:
       if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
       runs-on: ubuntu-latest
       name: Build and Deploy Job
       steps:
         - uses: actions/checkout@v3
           with:
             submodules: true
         - name: Build And Deploy
           id: builddeploy
           uses: Azure/static-web-apps-deploy@v1
           with:
             azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
             repo_token: ${{ secrets.GITHUB_TOKEN }}
             action: "upload"
             app_location: "/"
             api_location: ""
             output_location: "dist"
           env:
             VITE_YOUTUBE_API_KEY: ${{ secrets.VITE_YOUTUBE_API_KEY }}
             VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
   ```

### Azure Container Instances

1. **Create resource group**
   ```bash
   az group create --name youtube-studio-rg --location eastus
   ```

2. **Deploy container**
   ```bash
   az container create \
     --resource-group youtube-studio-rg \
     --name youtube-studio-clone \
     --image your-registry/youtube-studio-clone:latest \
     --dns-name-label youtube-studio-unique \
     --ports 80 \
     --environment-variables \
       VITE_YOUTUBE_API_KEY=your_api_key \
       VITE_GEMINI_API_KEY=your_gemini_key
   ```

## Nginx Configuration

### Basic Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Root Directory
    root /var/www/youtube-studio-clone/dist;
    index index.html;
    
    # Static Assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # API Routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # SPA Routing
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
    
    # Health Check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### Load Balancing

```nginx
upstream youtube_studio_backend {
    least_conn;
    server 127.0.0.1:3000 weight=1 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3001 weight=1 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3002 weight=1 max_fails=3 fail_timeout=30s;
}

server {
    # ... SSL and other configurations ...
    
    location /api/ {
        proxy_pass http://youtube_studio_backend;
        # ... other proxy settings ...
    }
}
```

## SSL/TLS Setup

### Let's Encrypt with Certbot

1. **Install Certbot**
   ```bash
   # Ubuntu/Debian
   sudo apt install certbot python3-certbot-nginx
   
   # CentOS/RHEL
   sudo yum install certbot python3-certbot-nginx
   ```

2. **Obtain certificate**
   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

3. **Auto-renewal**
   ```bash
   # Add to crontab
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Manual SSL Setup

1. **Generate private key**
   ```bash
   openssl genrsa -out private.key 2048
   ```

2. **Generate CSR**
   ```bash
   openssl req -new -key private.key -out certificate.csr
   ```

3. **Install certificate**
   ```bash
   # Copy certificate files
   sudo cp certificate.crt /etc/ssl/certs/
   sudo cp private.key /etc/ssl/private/
   sudo chmod 600 /etc/ssl/private/private.key
   ```

## Monitoring and Logging

### Application Monitoring

1. **Health Check Endpoint**
   ```typescript
   // src/api/health.ts
   export const healthCheck = {
     status: 'healthy',
     timestamp: new Date().toISOString(),
     version: process.env.VITE_APP_VERSION,
     uptime: process.uptime(),
     memory: process.memoryUsage(),
     environment: process.env.NODE_ENV
   };
   ```

2. **Error Tracking with Sentry**
   ```typescript
   import * as Sentry from '@sentry/react';
   
   Sentry.init({
     dsn: process.env.VITE_SENTRY_DSN,
     environment: process.env.VITE_ENVIRONMENT,
     tracesSampleRate: 1.0,
   });
   ```

3. **Performance Monitoring**
   ```typescript
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
   
   getCLS(console.log);
   getFID(console.log);
   getFCP(console.log);
   getLCP(console.log);
   getTTFB(console.log);
   ```

### Logging Configuration

1. **Application Logs**
   ```typescript
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.errors({ stack: true }),
       winston.format.json()
     ),
     defaultMeta: { service: 'youtube-studio-clone' },
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   });
   ```

2. **Nginx Access Logs**
   ```nginx
   log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                   '$status $body_bytes_sent "$http_referer" '
                   '"$http_user_agent" "$http_x_forwarded_for"';
   
   access_log /var/log/nginx/access.log main;
   error_log /var/log/nginx/error.log warn;
   ```

### Monitoring Tools

1. **Prometheus + Grafana**
   ```yaml
   # docker-compose.monitoring.yml
   version: '3.8'
   services:
     prometheus:
       image: prom/prometheus
       ports:
         - "9090:9090"
       volumes:
         - ./prometheus.yml:/etc/prometheus/prometheus.yml
     
     grafana:
       image: grafana/grafana
       ports:
         - "3000:3000"
       environment:
         - GF_SECURITY_ADMIN_PASSWORD=admin
   ```

2. **Uptime Monitoring**
   ```bash
   # Simple uptime check script
   #!/bin/bash
   URL="https://your-domain.com/health"
   STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL)
   
   if [ $STATUS -eq 200 ]; then
     echo "Site is up"
   else
     echo "Site is down - Status: $STATUS"
     # Send alert
   fi
   ```

## Performance Optimization

### Build Optimization

1. **Vite Configuration**
   ```typescript
   // vite.config.ts
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
             ui: ['@headlessui/react', '@heroicons/react'],
             utils: ['lodash', 'date-fns']
           }
         }
       },
       chunkSizeWarningLimit: 1000,
       minify: 'terser',
       terserOptions: {
         compress: {
           drop_console: true,
           drop_debugger: true
         }
       }
     }
   });
   ```

2. **Bundle Analysis**
   ```bash
   # Install bundle analyzer
   npm install --save-dev rollup-plugin-visualizer
   
   # Generate bundle report
   npm run build -- --analyze
   ```

### CDN Configuration

1. **CloudFlare Setup**
   ```javascript
   // CloudFlare Worker for edge caching
   addEventListener('fetch', event => {
     event.respondWith(handleRequest(event.request))
   })
   
   async function handleRequest(request) {
     const cache = caches.default
     const cacheKey = new Request(request.url, request)
     
     let response = await cache.match(cacheKey)
     
     if (!response) {
       response = await fetch(request)
       
       if (response.status === 200) {
         const headers = new Headers(response.headers)
         headers.set('Cache-Control', 'public, max-age=86400')
         
         response = new Response(response.body, {
           status: response.status,
           statusText: response.statusText,
           headers: headers
         })
         
         event.waitUntil(cache.put(cacheKey, response.clone()))
       }
     }
     
     return response
   }
   ```

### Database Optimization

1. **Redis Caching**
   ```typescript
   import Redis from 'ioredis';
   
   const redis = new Redis(process.env.REDIS_URL);
   
   export const cacheService = {
     async get(key: string) {
       const value = await redis.get(key);
       return value ? JSON.parse(value) : null;
     },
     
     async set(key: string, value: any, ttl = 3600) {
       await redis.setex(key, ttl, JSON.stringify(value));
     },
     
     async del(key: string) {
       await redis.del(key);
     }
   };
   ```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   
   # Check Node.js version
   node --version  # Should be 20.11.0+
   
   # Check for TypeScript errors
   npm run type-check
   ```

2. **API Key Issues**
   ```bash
   # Verify environment variables
   echo $VITE_YOUTUBE_API_KEY
   
   # Check API key permissions in Google Cloud Console
   # Ensure YouTube Data API v3 is enabled
   ```

3. **Docker Issues**
   ```bash
   # Check container logs
   docker logs youtube-studio
   
   # Check container health
   docker inspect --format='{{json .State.Health}}' youtube-studio
   
   # Rebuild image
   docker build --no-cache -t youtube-studio-clone .
   ```

4. **SSL Certificate Issues**
   ```bash
   # Check certificate expiration
   openssl x509 -in certificate.crt -text -noout | grep "Not After"
   
   # Test SSL configuration
   openssl s_client -connect your-domain.com:443
   
   # Renew Let's Encrypt certificate
   sudo certbot renew --dry-run
   ```

### Performance Issues

1. **Slow Loading**
   ```bash
   # Run Lighthouse audit
   npm run lighthouse
   
   # Check bundle size
   npm run build:analyze
   
   # Monitor network requests
   # Use browser dev tools Network tab
   ```

2. **Memory Leaks**
   ```bash
   # Monitor memory usage
   docker stats youtube-studio
   
   # Check for memory leaks in browser
   # Use browser dev tools Memory tab
   ```

### Debugging

1. **Enable Debug Mode**
   ```bash
   # Development
   VITE_ENABLE_DEBUG=true npm run dev
   
   # Production debugging
   VITE_ENABLE_DEBUG=true npm run build
   ```

2. **Log Analysis**
   ```bash
   # Application logs
   tail -f logs/app.log
   
   # Nginx logs
   tail -f /var/log/nginx/access.log
   tail -f /var/log/nginx/error.log
   
   # Docker logs
   docker-compose logs -f
   ```

### Getting Help

- **Documentation**: [docs/](./)
- **GitHub Issues**: [Issues](https://github.com/username/ytastudioaug2/issues)
- **Discord**: [Community Discord](https://discord.gg/example)
- **Email**: support@example.com

### Emergency Procedures

1. **Rollback Deployment**
   ```bash
   # Vercel
   vercel rollback
   
   # Docker
   docker-compose down
   docker-compose up -d --scale app=0
   docker-compose up -d previous-image
   
   # Manual
   git revert HEAD
   npm run build
   npm run deploy
   ```

2. **Scale Down/Up**
   ```bash
   # Docker Compose
   docker-compose up -d --scale app=0  # Scale down
   docker-compose up -d --scale app=3  # Scale up
   
   # Kubernetes
   kubectl scale deployment youtube-studio --replicas=0
   kubectl scale deployment youtube-studio --replicas=3
   ```

This deployment guide provides comprehensive instructions for deploying the YouTube Studio Clone in various environments. Choose the deployment method that best fits your needs and infrastructure requirements.