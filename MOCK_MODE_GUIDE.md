# 🎯 Mock Mode - Instant Testing Guide

**Status**: Ready to test APIs without databases!

---

## ✅ Setup Complete!

I've created a **mock mode** version that runs without any databases. Perfect for testing!

---

## 🚀 Quick Start (3 Steps)

### Step 1: Copy the mock .env file

```bash
cd backend
copy .env.mock .env
```

### Step 2: Start the mock server

```bash
npm run mock
```

**OR** if that doesn't work:

```bash
node src/server.mock.js
```

### Step 3: Test with Postman/Thunder Client!

Server will run on: **http://localhost:5000**

---

## 📡 Available Endpoints to Test

All endpoints from the API are available, but data won't persist (in-memory only).

### Health Check
```http
GET http://localhost:5000/health
```

### Register User
```http
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+2348012345678",
  "role": "guest"
}
```

You'll get back a JWT token - save it for other requests!

---

## 💡 What Works in Mock Mode?

✅ All API endpoints  
✅ Request validation  
✅ JWT authentication  
✅ Error handling  
✅ JSON responses  

❌ Data persistence (restarts = data lost)  
❌ Database queries  
❌ Real Paystack payments  
❌ AI voice features  

---

## 🎯 Perfect For:

- Testing API structure
- Verifying request/response formats
- Testing authentication flow
- Learning how the system works
- Frontend development (mock backend)
- Postman API testing

---

## 📦 Import Test Collection

Use the `api-tests.json` file:

1. Open Thunder Client (VS Code) or Postman
2. Import collection: `api-tests.json`
3. Start making requests!

---

## 🔄 Next Steps

After testing in mock mode:

1. **Add real databases** when ready
2. **Test full booking flow** with persistence
3. **Integrate Paystack** for real payments
4. **Build mobile app** using these APIs

---

## ❓ Troubleshooting

**Port 5000 in use?**
Edit `.env` and change `PORT=5001`

**Module errors?**
Make sure you ran `npm install` first

**Can't start server?**
Try: `node src/server.mock.js` directly

---

**Ready to test! Just run `npm run mock` and start making API requests! 🚀**
