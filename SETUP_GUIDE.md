# 🚀 Quick Setup Guide - Testing JustBack Backend

**Happy New Year 2026! Let's get your backend running!** 🎊

---

## Step 1: Fix PowerShell (if needed)

If you got the "running scripts is disabled" error, run this in PowerShell as **Administrator**:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then close and reopen your terminal.

---

## Step 2: Install Dependencies

```bash
cd C:\Users\HP\.gemini\antigravity\scratch\justback-platform\backend
npm install
```

This will install all the packages (Express, JWT, Twilio, OpenAI, etc.)

---

## Step 3: Set Up Environment Variables

```bash
# Copy the example file
copy .env.example .env
```

Now open `.env` and fill in these **REQUIRED** values:

```env
# Database (for now, use local)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=justback_db
DB_USER=postgres
DB_PASSWORD=postgres123

MONGODB_URI=mongodb://admin:admin123@localhost:27017/justback_analytics?authSource=admin

REDIS_HOST=localhost
REDIS_PORT=6379

# JWT (generate random secrets)
JWT_SECRET=your_super_secret_jwt_key_change_this_to_something_random
JWT_REFRESH_SECRET=your_refresh_secret_also_random

# OPTIONAL for now (can add later)
OPENAI_API_KEY=sk-your_key_here
PINECONE_API_KEY=your_key_here
TWILIO_ACCOUNT_SID=your_sid_here
TWILIO_AUTH_TOKEN=your_token_here
PAYSTACK_SECRET_KEY=sk_test_your_key_here
```

**Don't worry about API keys yet** - the basic APIs will work without them!

---

## Step 4: Start Databases with Docker

```bash
# From the project root
cd C:\Users\HP\.gemini\antigravity\scratch\justback-platform

# Start PostgreSQL, MongoDB, Redis
docker-compose up -d postgres mongodb redis

# Check if they're running
docker ps
```

You should see 3 containers running.

**Don't have Docker?** You can:
- Install Docker Desktop for Windows
- OR install PostgreSQL, MongoDB, Redis separately

---

## Step 5: Create Database & Run Schema

### Option A: Using Docker PostgreSQL

```bash
# Connect to PostgreSQL container
docker exec -it justback_postgres psql -U postgres

# Create database
CREATE DATABASE justback_db;

# Exit
\q

# Load schema
docker exec -i justback_postgres psql -U postgres -d justback_db < backend\database\schema.sql
```

### Option B: If you have PostgreSQL installed locally

```bash
# Create database
createdb justback_db

# Load schema
psql -U postgres -d justback_db -f backend\database\schema.sql
```

---

## Step 6: Start the Server! 🚀

```bash
cd backend
npm run dev
```

You should see:
```
🚀 JustBack API Server running on port 5000
📊 Environment: development
🌍 API Version: v1
✅ PostgreSQL connected
✅ MongoDB connected
✅ Redis connected
```

**If you see errors about databases**, make sure Docker is running and databases are started.

---

## Step 7: Test with Postman/Thunder Client

### Install Thunder Client (VS Code Extension)

1. Open VS Code Extensions (Ctrl+Shift+X)
2. Search for "Thunder Client"
3. Install it
4. Click the Thunder Client icon in the sidebar

### Test Endpoint 1: Health Check

```http
GET http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### Test Endpoint 2: Register User

```http
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+2348012345678",
  "role": "guest"
}
```

Expected response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "guest"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  },
  "message": "Registration successful"
}
```

**Save the `accessToken`!** You'll need it for other requests.

### Test Endpoint 3: Login

```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Test Endpoint 4: Get Profile (Protected)

```http
GET http://localhost:5000/api/v1/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

### Test Endpoint 5: Create Property (as Host)

First, register a host user:

```http
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "email": "host@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+2348087654321",
  "role": "host"
}
```

Then create a property:

```http
POST http://localhost:5000/api/v1/properties
Authorization: Bearer HOST_ACCESS_TOKEN
Content-Type: application/json

{
  "title": "Luxury 3BR Apartment in Lekki",
  "description": "Beautiful spacious apartment with stunning ocean views. Perfect for families and business travelers.",
  "propertyType": "apartment",
  "address": "15 Admiralty Way, Lekki Phase 1",
  "city": "Lagos",
  "state": "Lagos",
  "latitude": 6.4474,
  "longitude": 3.4700,
  "bedrooms": 3,
  "bathrooms": 2,
  "maxGuests": 6,
  "pricePerNight": 45000,
  "cleaningFee": 10000,
  "amenities": ["wifi", "pool", "parking", "gym", "24hr_security"],
  "images": [],
  "houseRules": "No smoking. No parties. Check-in after 2PM."
}
```

### Test Endpoint 6: Search Properties

```http
GET http://localhost:5000/api/v1/properties?city=Lagos&minPrice=30000&maxPrice=50000
```

### Test Endpoint 7: Check Availability

```http
GET http://localhost:5000/api/v1/properties/PROPERTY_ID/availability?startDate=2026-01-15&endDate=2026-01-20
```

Replace `PROPERTY_ID` with the ID from the property you created.

### Test Endpoint 8: Create Booking

```http
POST http://localhost:5000/api/v1/bookings
Authorization: Bearer GUEST_ACCESS_TOKEN
Content-Type: application/json

{
  "propertyId": "PROPERTY_ID_HERE",
  "checkInDate": "2026-01-15",
  "checkOutDate": "2026-01-20",
  "numGuests": 4,
  "guestNotes": "Will arrive around 6PM"
}
```

This will return a booking AND a Paystack payment link!

---

## 🐛 Troubleshooting

### Database Connection Failed

```bash
# Check if containers are running
docker ps

# Restart containers
docker-compose restart postgres mongodb redis

# Check logs
docker-compose logs postgres
```

### Port 5000 Already in Use

Change the port in `.env`:
```env
PORT=5001
```

### Redis Connection Error

Redis is optional for testing. You can comment out Redis in `server.js` temporarily.

### Module Not Found Errors

```bash
# Make sure you're in the backend directory
cd backend

# Reinstall
rm -rf node_modules
npm install
```

---

## ✅ Success Checklist

- [ ] npm install completed
- [ ] .env file configured
- [ ] Docker containers running (postgres, mongodb, redis)
- [ ] Database schema loaded
- [ ] Server started without errors
- [ ] Health endpoint returns OK
- [ ] Successfully registered a user
- [ ] Successfully created a property
- [ ] Successfully created a booking

---

## 📞 Need Help?

If you encounter any errors:

1. Check the server console for error messages
2. Check Docker container logs: `docker-compose logs [service]`
3. Verify .env values are correct
4. Make sure all dependencies installed successfully

---

## 🎯 Next Steps After Testing

Once everything works:

1. **Get Paystack Test API Keys** (free at paystack.com)
2. **Test actual payments** with test cards
3. **Add more sample properties**
4. **Test the full booking flow**
5. **Then we build the mobile app!**

---

**Happy Testing! You're about to see your marketplace come to life! 🚀**
