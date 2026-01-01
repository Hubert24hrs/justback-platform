# 🚀 JustBack Backend - Simple Setup (No Docker Required)

**Updated: 2026-01-01**

I noticed Docker isn't installed on your system. Here's a simpler approach to get you testing quickly!

---

## ⚡ Option 1: Mock Mode (Test APIs WITHOUT Databases)

For testing the API structure without setting up databases, I'll create a mock mode.

### Step 1: Create .env file manually

Copy this into a new file called `.env` in the `backend` folder:

```env
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Use mock/in-memory for testing
DB_HOST=localhost
DB_PORT=5432
DB_NAME=justback_db
DB_USER=postgres
DB_PASSWORD=postgres123

MONGODB_URI=mongodb://localhost:27017/justback_analytics
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT secrets (for testing)
JWT_SECRET=justback_secret_key_2026
JWT_REFRESH_SECRET=justback_refresh_key_2026
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=30d

FRONTEND_URL=http://localhost:3000
SUPPORT_PHONE_NUMBER=+2348000000000
SUPPORT_EMAIL=support@justback.ng
HOST_COMMISSION_PERCENT=12.5
GUEST_SERVICE_FEE_PERCENT=7.5
```

### Step 2: npm install is running...

Wait for it to complete (should take 1-2 minutes).

### Step 3: We'll modify the server to work without databases temporarily

Once you confirm npm install is done, I'll create a modified version that works in mock mode for testing.

---

## 🐘 Option 2: Install Databases Locally (Recommended for Full Testing)

If you want to test with real databases:

### PostgreSQL
1. Download: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for 'postgres' user

### MongoDB
1. Download: https://www.mongodb.com/try/download/community
2. Install MongoDB Community Server
3. Run as a service (default)

### Redis (Optional - we can skip this)
1. Download: https://github.com/microsoftarchive/redis/releases
2. Or we can disable Redis caching for testing

---

## 📊 Current Status

✅ npm install - RUNNING  
❌ Docker - Not installed (OK, we'll work around this)  
⏳ .env file - Needs manual creation (gitignore blocked me)  
⏳ Databases - Need to choose Option 1 or 2

---

## 🎯 What I Recommend

**For Quick Testing**: Use Option 1 (Mock Mode)
- Get APIs running in 5 minutes
- Test endpoints with Postman
- See how everything works
- Later install real databases

**For Full Experience**: Use Option 2 (Local Databases)
- Full functionality
- Real data persistence
- Complete booking flow
- Takes 15-30 minutes to set up

---

**Which option do you prefer? Or just say "mock mode" and I'll set that up for you!**
