# JustBack Production Deployment Guide

## 🏗️ Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Mobile App    │     │  Admin Dashboard│     │  Host Dashboard │
│    (Flutter)    │     │     (React)     │     │     (React)     │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    Node.js Backend      │
                    │    (Express + Socket.io)│
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐
│   PostgreSQL    │    │     MongoDB     │    │      Redis      │
│  (Main Data)    │    │   (AI Logs)     │    │   (Caching)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## ☁️ Cloud Hosting Options

### Option 1: Railway (Recommended for MVP)
**Pros:** Free tier, easy setup, auto-scaling
**Cost:** Free → $5/month

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

### Option 2: Render
**Pros:** Free PostgreSQL, auto-deploy from Git
**Cost:** Free → $7/month

### Option 3: AWS (Production)
**Services needed:**
- EC2 or ECS for backend
- RDS for PostgreSQL
- ElastiCache for Redis
- S3 for property images

---

## 🗄️ Database Setup

### PostgreSQL Setup
```bash
# Create database
createdb justback_db

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### Required Tables
- `users` - User accounts
- `properties` - Listings
- `bookings` - Reservations
- `transactions` - Payment records
- `ai_call_logs` - Voice assistant logs

---

## 📱 Mobile App Deployment

### Android (Play Store)
```bash
cd mobile
flutter build appbundle --release
```

Upload `build/app/outputs/bundle/release/app-release.aab` to Play Console.

### iOS (App Store)
```bash
flutter build ios --release
```

Archive and upload via Xcode.

### Web (Firebase Hosting)
```bash
flutter build web --release
firebase deploy --only hosting
```

---

## 🔒 Security Checklist

- [ ] Change all JWT secrets
- [ ] Enable HTTPS only
- [ ] Set proper CORS origins
- [ ] Enable rate limiting
- [ ] Configure firewall rules
- [ ] Set up monitoring (Sentry/LogRocket)

---

## 🌐 Domain Configuration

### Recommended Structure
- `justback.ng` - Main website
- `app.justback.ng` - Mobile web app
- `api.justback.ng` - Backend API
- `admin.justback.ng` - Admin dashboard
- `host.justback.ng` - Host dashboard

---

## 📊 Monitoring & Logging

### Recommended Services
- **Error Tracking:** Sentry
- **APM:** New Relic or DataDog
- **Logs:** LogDNA or Papertrail
- **Uptime:** UptimeRobot (free)

---

## 🚀 Deployment Commands

```bash
# Backend
npm run build
npm run start:prod

# Admin Dashboard
cd admin-dashboard && npm run build

# Mobile Web
cd mobile && flutter build web --release
```
