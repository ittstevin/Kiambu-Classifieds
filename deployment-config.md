# 🚀 **Kiambu Classifieds - Scalable Deployment Guide**

## **🏗️ Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Load Balancer │    │   Backend API   │
│   (React)       │◄──►│   (Nginx/ALB)   │◄──►│   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Redis Cache   │
                       │   (ElastiCache) │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   MongoDB       │
                       │   (Atlas)       │
                       └─────────────────┘
```

## **📦 Environment Variables**

### **Production Environment (.env.production)**
```bash
# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://kiambuclass.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kiambu-classifieds?retryWrites=true&w=majority

# Redis Cache
REDIS_HOST=your-redis-endpoint.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT Authentication
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRE=7d

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Service (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+254700000000

# Africa's Talking (SMS)
AT_API_KEY=your-api-key
AT_USERNAME=your-username

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Analytics
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX-X
POSTHOG_API_KEY=your-posthog-key

# Security
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
CORS_ORIGIN=https://kiambuclass.com

# Performance
CACHE_TTL=3600
MAX_FILE_SIZE=10485760
MAX_VIDEO_SIZE=104857600
```

## **🌐 Deployment Platforms**

### **1. AWS (Recommended for Scale)**

#### **EC2 + Load Balancer Setup**
```bash
# Launch EC2 instances
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d323 \
  --count 3 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxxxxxx \
  --subnet-id subnet-xxxxxxxxx

# Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name kiambu-alb \
  --subnets subnet-xxxxxxxxx subnet-yyyyyyyyy \
  --security-groups sg-xxxxxxxxx

# Create target group
aws elbv2 create-target-group \
  --name kiambu-targets \
  --protocol HTTP \
  --port 5000 \
  --vpc-id vpc-xxxxxxxxx \
  --health-check-path /health
```

#### **Docker Configuration**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - REDIS_HOST=${REDIS_HOST}
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

### **2. Railway Deployment**

#### **railway.json**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### **3. Render Deployment**

#### **render.yaml**
```yaml
services:
  - type: web
    name: kiambu-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: REDIS_HOST
        sync: false
      - key: JWT_SECRET
        sync: false

  - type: redis
    name: kiambu-redis
    ipAllowList: []
```

### **4. Vercel Deployment (Frontend)**

#### **vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "https://your-backend-domain.com"
  }
}
```

## **🔧 Performance Optimization**

### **1. Database Optimization**
```javascript
// MongoDB Atlas Configuration
{
  "cluster": {
    "name": "kiambu-classifieds",
    "provider": "AWS",
    "region": "us-east-1",
    "tier": "M10",
    "backup": true,
    "monitoring": true
  },
  "indexes": [
    {
      "collection": "ads",
      "index": { "category": 1, "status": 1, "createdAt": -1 }
    },
    {
      "collection": "ads",
      "index": { "location": 1, "category": 1, "price": 1 }
    },
    {
      "collection": "ads",
      "index": { "coordinates": "2dsphere" }
    }
  ]
}
```

### **2. Redis Configuration**
```bash
# Redis Configuration
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### **3. CDN Configuration (CloudFront)**
```json
{
  "DistributionConfig": {
    "Origins": {
      "Items": [
        {
          "Id": "kiambu-backend",
          "DomainName": "your-api-domain.com",
          "CustomOriginConfig": {
            "HTTPPort": 443,
            "HTTPSPort": 443,
            "OriginProtocolPolicy": "https-only"
          }
        }
      ]
    },
    "CacheBehaviors": {
      "Items": [
        {
          "PathPattern": "/api/ads/*",
          "TargetOriginId": "kiambu-backend",
          "ViewerProtocolPolicy": "redirect-to-https",
          "MinTTL": 300,
          "MaxTTL": 3600,
          "DefaultTTL": 600
        }
      ]
    }
  }
}
```

## **📊 Monitoring & Analytics**

### **1. Application Monitoring**
```javascript
// New Relic Configuration
const newrelic = require('newrelic');

// PM2 Configuration
module.exports = {
  apps: [{
    name: 'kiambu-backend',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### **2. Health Checks**
```bash
#!/bin/bash
# health-check.sh

curl -f http://localhost:5000/health || exit 1
curl -f http://localhost:5000/api/services/health || exit 1
```

## **🔒 Security Configuration**

### **1. SSL/TLS Setup**
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name kiambuclass.com;
    
    ssl_certificate /etc/letsencrypt/live/kiambuclass.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kiambuclass.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **2. Security Headers**
```javascript
// Security middleware configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "ws:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## **🚀 Deployment Scripts**

### **1. Production Deployment**
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
npm ci --production

# Run database migrations
npm run migrate

# Clear cache
npm run cache:clear

# Restart application
pm2 restart kiambu-backend

# Health check
sleep 10
curl -f http://localhost:5000/health || exit 1

echo "✅ Deployment completed successfully!"
```

### **2. Database Migration**
```javascript
// scripts/migrate.js
const mongoose = require('mongoose');
require('dotenv').config();

const migrations = [
  {
    name: 'add_user_verification',
    up: async () => {
      await mongoose.connection.db.collection('users').updateMany(
        {},
        { $set: { emailVerified: false, phoneVerified: false } }
      );
    }
  },
  {
    name: 'add_ad_analytics',
    up: async () => {
      await mongoose.connection.db.collection('ads').updateMany(
        {},
        { $set: { views: 0, saves: 0, shares: 0 } }
      );
    }
  }
];

async function runMigrations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    for (const migration of migrations) {
      console.log(`Running migration: ${migration.name}`);
      await migration.up();
      console.log(`✅ Migration completed: ${migration.name}`);
    }
    
    console.log('✅ All migrations completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
```

## **📈 Scaling Strategies**

### **1. Horizontal Scaling**
- Use load balancers to distribute traffic
- Deploy multiple instances across regions
- Implement auto-scaling based on CPU/memory usage

### **2. Database Scaling**
- Use MongoDB Atlas with read replicas
- Implement database sharding for large datasets
- Use Redis for session storage and caching

### **3. CDN Optimization**
- Serve static assets through CDN
- Cache API responses for frequently accessed data
- Use edge locations for global performance

### **4. Monitoring & Alerts**
- Set up CloudWatch alarms for CPU, memory, and disk usage
- Monitor API response times and error rates
- Set up alerts for database connection issues

## **🔧 Maintenance Scripts**

### **1. Cache Management**
```bash
#!/bin/bash
# scripts/clearCache.sh

echo "🧹 Clearing cache..."

# Clear Redis cache
redis-cli FLUSHALL

# Clear file uploads older than 30 days
find ./uploads -type f -mtime +30 -delete

echo "✅ Cache cleared successfully!"
```

### **2. Database Backup**
```bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

mkdir -p $BACKUP_DIR

# MongoDB backup
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/mongodb_$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" -C "$BACKUP_DIR" "mongodb_$DATE"

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "✅ Backup completed: backup_$DATE.tar.gz"
```

This deployment configuration ensures your Kiambu Classifieds application can handle thousands of concurrent users with optimal performance, security, and scalability. 