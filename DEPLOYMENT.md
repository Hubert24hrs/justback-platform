# JustBack Platform - Deployment Guide

## Overview

This guide covers deploying the JustBack platform using Docker containers.

---

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2+
- 4GB+ RAM available for containers
- Ports 80, 443, 5000, 5432, 27017, 6379 available

---

## Quick Start (Development)

```bash
# Clone and navigate
cd justback-platform

# Start development containers
docker-compose up -d

# View logs
docker-compose logs -f backend

# Access services
# - API: http://localhost:5000
# - Admin: http://localhost:5173 (dev server)
```

---

## Production Deployment

### 1. Environment Setup

Create a `.env` file in the project root:

```env
# Database
DB_NAME=justback_db
DB_USER=postgres
DB_PASSWORD=your-secure-password

# MongoDB
MONGO_USER=admin
MONGO_PASSWORD=your-mongo-password

# Redis
REDIS_PASSWORD=your-redis-password

# JWT
JWT_SECRET=your-256-bit-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# External Services (Optional)
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
PAYSTACK_SECRET_KEY=...
```

### 2. Build and Deploy

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 3. Verify Deployment

```bash
# Health check
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","timestamp":"...","services":{"database":"connected","redis":"connected"}}
```

---

## Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      NGINX (Port 80/443)                    │
│                    Reverse Proxy + SSL                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   Backend     │ │    Admin      │ │   Mobile      │
│   API:5000    │ │    :3000      │ │   (External)  │
└───────┬───────┘ └───────────────┘ └───────────────┘
        │
        ├───────────────────────────────────┐
        │                                   │
        ▼                                   ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  PostgreSQL   │ │    MongoDB    │ │     Redis     │
│   :5432       │ │    :27017     │ │    :6379      │
└───────────────┘ └───────────────┘ └───────────────┘
```

---

## Container Management

### Restart Services
```bash
docker-compose -f docker-compose.prod.yml restart backend
```

### Scale Backend (if using Swarm)
```bash
docker service scale justback_backend=3
```

### View Resource Usage
```bash
docker stats
```

### Access Container Shell
```bash
docker exec -it justback_backend sh
```

---

## Database Operations

### Backup PostgreSQL
```bash
docker exec justback_postgres pg_dump -U postgres justback_db > backup.sql
```

### Restore PostgreSQL
```bash
cat backup.sql | docker exec -i justback_postgres psql -U postgres justback_db
```

### MongoDB Backup
```bash
docker exec justback_mongodb mongodump --out /backup
docker cp justback_mongodb:/backup ./mongo-backup
```

---

## SSL/HTTPS Setup

### Option 1: Let's Encrypt (Certbot)
```bash
# Install certbot
apt-get install certbot

# Get certificate
certbot certonly --standalone -d api.justback.ng

# Copy to nginx/ssl directory
cp /etc/letsencrypt/live/api.justback.ng/* ./nginx/ssl/
```

### Option 2: Self-Signed (Development)
```bash
openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/CN=localhost"
```

---

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Common issues:
# - Port already in use: Stop conflicting services
# - Database not ready: Wait for healthcheck
# - Missing env vars: Check .env file
```

### Database connection failed
```bash
# Verify database is healthy
docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# Check credentials
docker-compose -f docker-compose.prod.yml exec backend env | grep DB_
```

### Out of memory
```bash
# Increase Docker memory limit in Docker Desktop settings
# Or reduce container limits in docker-compose.prod.yml
```

---

## Monitoring

### Recommended Tools
- **Portainer**: Container management UI
- **Prometheus + Grafana**: Metrics and dashboards
- **ELK Stack**: Log aggregation

### Basic Health Monitoring
```bash
# Create a monitoring script
#!/bin/bash
while true; do
  curl -s http://localhost:5000/health | jq .
  sleep 60
done
```

---

## Cloud Deployment Options

### AWS
- Use ECS with Fargate for serverless containers
- RDS for PostgreSQL, DocumentDB for MongoDB
- ElastiCache for Redis

### Google Cloud
- Cloud Run for containers
- Cloud SQL for PostgreSQL
- Firestore for MongoDB alternative

### Railway/Render
- Simple one-click deployment
- Auto-scaling included
- Free tier available

---

## Environment URLs

| Environment | API URL | Admin URL |
|-------------|---------|-----------|
| Development | http://localhost:5000 | http://localhost:5173 |
| Staging | https://api-staging.justback.ng | https://admin-staging.justback.ng |
| Production | https://api.justback.ng | https://admin.justback.ng |

---

## Support

For issues:
1. Check logs: `docker-compose logs`
2. Verify health: `curl localhost:5000/health`
3. Review this guide's Troubleshooting section
4. Contact: devops@justback.ng
