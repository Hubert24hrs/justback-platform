# JustBack API Configuration Guide

This guide documents all required API keys and configuration for production deployment.

---

## 🔑 Required API Keys

### 1. Payment Gateway - Paystack
**Purpose:** Process payments for bookings

| Variable | Description |
|----------|-------------|
| `PAYSTACK_SECRET_KEY` | Server-side secret key (starts with `sk_`) |
| `PAYSTACK_PUBLIC_KEY` | Client-side public key (starts with `pk_`) |

**Get Keys:** [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer)

---

### 2. AI Voice Assistant - OpenAI
**Purpose:** Power the AI concierge voice assistant

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | API key for GPT models (starts with `sk-`) |

**Get Keys:** [OpenAI Platform](https://platform.openai.com/api-keys)

---

### 3. Voice/SMS - Twilio
**Purpose:** Make AI-powered phone calls, send SMS

| Variable | Description |
|----------|-------------|
| `TWILIO_ACCOUNT_SID` | Account SID (starts with `AC`) |
| `TWILIO_AUTH_TOKEN` | Auth token |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number |

**Get Keys:** [Twilio Console](https://console.twilio.com/)

---

### 4. Vector Search - Pinecone (Optional)
**Purpose:** Property semantic search

| Variable | Description |
|----------|-------------|
| `PINECONE_API_KEY` | API key |
| `PINECONE_ENVIRONMENT` | Environment (e.g., `us-east-1`) |

**Get Keys:** [Pinecone Console](https://app.pinecone.io/)

---

## 🗄️ Database Configuration

### PostgreSQL (Primary Database)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=justback_db
DB_USER=postgres
DB_PASSWORD=your_secure_password
```

### MongoDB (AI Logs - Optional)
```env
MONGODB_URI=mongodb://localhost:27017/justback_logs
```

### Redis (Caching - Optional)
```env
REDIS_URL=redis://localhost:6379
```

---

## 🔒 Security Configuration

```env
# CHANGE THESE IN PRODUCTION!
JWT_SECRET=generate_a_64_char_random_string
JWT_REFRESH_SECRET=generate_another_64_char_random_string
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=30d
```

**Generate secure secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🚀 Quick Start

1. Copy `.env.example` to `.env`
2. Fill in your API keys
3. For mock mode (no database needed): set `USE_MOCK_DB=true`
4. For production: set `USE_MOCK_DB=false` and configure database

**Run mock server:**
```bash
node src/server.standalone-mock.js
```

**Run full server (requires database):**
```bash
npm start
```

---

## 📋 Environment Files Reference

| File | Purpose |
|------|---------|
| `.env.example` | Template with placeholders |
| `.env.mock` | Mock mode configuration |
| `.env.real` | Real database configuration |
| `.env` | Active configuration (not committed) |
