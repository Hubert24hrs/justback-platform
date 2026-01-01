# JustBack API Documentation

Complete REST API documentation for the JustBack platform.

**Base URL**: `https://api.justback.ng/api/v1`

**Authentication**: JWT Bearer Token in `Authorization` header

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Creates a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+2348012345678",
  "role": "guest" // or "host"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "guest",
      "emailVerified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Login

**POST** `/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

**Errors**:
- `401`: Invalid credentials
- `403`: Email not verified

---

### Refresh Token

**POST** `/auth/refresh`

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

---

## Property Endpoints

### Search Properties

**GET** `/properties`

Search and filter properties.

**Query Parameters**:
- `city` (string): Filter by city (e.g., "Lagos")
- `state` (string): Filter by state
- `minPrice` (number): Minimum price per night
- `maxPrice` (number): Maximum price per night
- `bedrooms` (number): Number of bedrooms
- `propertyType` (string): `hotel`, `apartment`, `house`, `shortlet`, `serviced_apartment`
- `amenities` (array): Filter by amenities (e.g., `wifi,pool,parking`)
- `checkIn` (date): Check-in date (YYYY-MM-DD)
- `checkOut` (date): Check-out date (YYYY-MM-DD)
- `guests` (number): Number of guests
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `sortBy` (string): `price_asc`, `price_desc`, `rating`, `newest`

**Example**:
```
GET /properties?city=Lagos&bedrooms=3&minPrice=30000&maxPrice=80000&amenities=wifi,pool&checkIn=2026-01-15&checkOut=2026-01-20
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "uuid",
        "title": "Lekki Luxury Apartment",
        "propertyType": "apartment",
        "address": "15 Admiralty Way, Lekki Phase 1",
        "city": "Lagos",
        "state": "Lagos",
        "bedrooms": 3,
        "bathrooms": 2,
        "maxGuests": 6,
        "pricePerNight": 45000,
        "images": ["url1", "url2"],
        "amenities": ["wifi", "pool", "parking", "gym"],
        "averageRating": 4.8,
        "reviewCount": 127,
        "host": {
          "id": "uuid",
          "firstName": "Jane",
          "avatarUrl": "url"
        },
        "available": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 157,
      "pages": 8
    }
  }
}
```

---

### Get Property Details

**GET** `/properties/:id`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Lekki Luxury Apartment",
    "description": "Spacious 3-bedroom apartment with stunning ocean views...",
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
    "weeklyPrice": 280000,
    "monthlyPrice": 1000000,
    "cleaningFee": 10000,
    "amenities": ["wifi", "pool", "parking", "gym", "24hr_security"],
    "images": [
      {
        "url": "https://cdn.justback.ng/prop/123/img1.jpg",
        "caption": "Living room"
      }
    ],
    "houseRules": "No smoking. No parties. No pets.",
    "checkInTime": "14:00:00",
    "checkOutTime": "11:00:00",
    "cancellationPolicy": "24_hours",
    "customFaqs": [
      {
        "question": "Is there parking?",
        "answer": "Yes, free parking for 2 cars",
        "category": "amenities"
      }
    ],
    "averageRating": 4.8,
    "reviewCount": 127,
    "host": {
      "id": "uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "avatarUrl": "url",
      "hostSince": "2023-05-10T00:00:00Z",
      "responseRate": 98,
      "responseTime": "within an hour"
    },
    "location": {
      "nearbyPlaces": [
        { "name": "Murtala Muhammed Airport", "distance": "25 km" },
        { "name": "Eko Atlantic", "distance": "3 km" }
      ]
    },
    "createdAt": "2024-03-15T10:30:00Z",
    "updatedAt": "2025-12-20T08:15:00Z"
  }
}
```

---

### Create Property (Host Only)

**POST** `/properties`

**Authorization**: Bearer token with `host` role

**Request Body** (multipart/form-data):
```json
{
  "title": "Beautiful 2BR in Ikeja",
  "description": "Cozy apartment...",
  "propertyType": "apartment",
  "address": "12 Allen Avenue, Ikeja",
  "city": "Lagos",
  "state": "Lagos",
  "bedrooms": 2,
  "bathrooms": 1,
  "maxGuests": 4,
  "pricePerNight": 35000,
  "weeklyPrice": 210000,
  "monthlyPrice": 750000,
  "cleaningFee": 8000,
  "amenities": ["wifi", "parking"],
  "houseRules": "No smoking",
  "checkInTime": "14:00",
  "checkOutTime": "11:00",
  "cancellationPolicy": "24_hours"
}
```

**Files**: `images[]` (multiple image uploads)

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Beautiful 2BR in Ikeja",
    "status": "DRAFT",
    ...
  },
  "message": "Property created successfully. It will be reviewed before going live."
}
```

---

### Check Availability

**GET** `/properties/:id/availability`

**Query Parameters**:
- `startDate` (required): YYYY-MM-DD
- `endDate` (required): YYYY-MM-DD

**Response** (200):
```json
{
  "success": true,
  "data": {
    "available": true,
    "nights": 5,
    "pricing": {
      "pricePerNight": 45000,
      "subtotal": 225000,
      "cleaningFee": 10000,
      "serviceFee": 16875, // 7.5% of subtotal
      "total": 251875
    },
    "blockedDates": [], // Dates not available in range
    "checkIn": "2026-01-15",
    "checkOut": "2026-01-20"
  }
}
```

---

## Booking Endpoints

### Create Booking

**POST** `/bookings`

**Authorization**: Bearer token with `guest` role

**Request Body**:
```json
{
  "propertyId": "uuid",
  "checkInDate": "2026-01-15",
  "checkOutDate": "2026-01-20",
  "numGuests": 4,
  "guestNotes": "Arriving late, around 10 PM",
  "paymentMethod": "PAYSTACK" // or FLUTTERWAVE, WALLET
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "bookingReference": "JB-2026-001234",
      "propertyId": "uuid",
      "property": {
        "title": "Lekki Luxury Apartment",
        "address": "...",
        "images": ["..."]
      },
      "guestId": "uuid",
      "hostId": "uuid",
      "checkInDate": "2026-01-15",
      "checkOutDate": "2026-01-20",
      "nights": 5,
      "numGuests": 4,
      "pricing": {
        "subtotal": 225000,
        "cleaningFee": 10000,
        "serviceFee": 16875,
        "total": 251875
      },
      "status": "PENDING",
      "paymentStatus": "PENDING",
      "createdAt": "2025-12-31T10:00:00Z"
    },
    "payment": {
      "reference": "JB-PAY-1234567890",
      "authorizationUrl": "https://checkout.paystack.com/abcdefg",
      "accessCode": "abcdefg"
    }
  },
  "message": "Booking created. Please complete payment."
}
```

**Next Step**: Redirect user to `authorizationUrl` to complete payment

---

### Verify Payment

**POST** `/payments/verify`

Called after payment gateway redirect.

**Request Body**:
```json
{
  "reference": "JB-PAY-1234567890"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "uuid",
      "reference": "JB-PAY-1234567890",
      "amount": 251875,
      "status": "SUCCESS",
      "gateway": "PAYSTACK",
      "gatewayReference": "T1234567890"
    },
    "booking": {
      "id": "uuid",
      "bookingReference": "JB-2026-001234",
      "status": "CONFIRMED",
      "paymentStatus": "PAID"
    }
  },
  "message": "Payment successful! Your booking is confirmed."
}
```

---

### Get User Bookings

**GET** `/bookings`

**Authorization**: Bearer token

**Query Parameters**:
- `status` (optional): `PENDING`, `CONFIRMED`, `CHECKED_IN`, `CHECKED_OUT`, `CANCELLED`
- `role` (optional): `guest`, `host` (defaults to user's current role)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "uuid",
        "bookingReference": "JB-2026-001234",
        "property": {
          "id": "uuid",
          "title": "Lekki Luxury Apartment",
          "images": ["url"]
        },
        "host": {
          "id": "uuid",
          "firstName": "Jane",
          "phone": "+234801..."
        },
        "checkInDate": "2026-01-15",
        "checkOutDate": "2026-01-20",
        "nights": 5,
        "total": 251875,
        "status": "CONFIRMED",
        "paymentStatus": "PAID",
        "canCancel": true,
        "canCheckIn": false,
        "createdAt": "2025-12-31T10:00:00Z"
      }
    ]
  }
}
```

---

### Cancel Booking

**PUT** `/bookings/:id/cancel`

**Request Body**:
```json
{
  "reason": "Change of plans"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "status": "CANCELLED",
      "cancelledAt": "2025-12-31T15:00:00Z"
    },
    "refund": {
      "amount": 251875,
      "processingTime": "3-5 business days",
      "method": "Original payment method"
    }
  },
  "message": "Booking cancelled. Refund will be processed."
}
```

**Refund Policy**:
- >24 hours before check-in: 100% refund
- <24 hours: No refund (per cancellation policy)

---

### Check-In

**POST** `/bookings/:id/check-in`

**Authorization**: Host only

**Response** (200):
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "status": "CHECKED_IN",
      "checkedInAt": "2026-01-15T14:30:00Z"
    },
    "escrowReleased": true,
    "hostPayout": 191250 // After 15% commission
  },
  "message": "Guest checked in. Funds released from escrow."
}
```

---

## AI Voice Endpoints

### Request AI Call

**POST** `/ai-voice/request-call`

Request AI assistant to call the user.

**Request Body**:
```json
{
  "propertyId": "uuid",
  "callReason": "booking_inquiry" // or "property_details", "support"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "estimatedWaitTime": "30 seconds",
    "callbackNumber": "+2348012345678"
  },
  "message": "Our AI assistant will call you shortly."
}
```

---

### Get Call History

**GET** `/ai-voice/calls`

**Authorization**: User can see only their calls; Admin sees all

**Response** (200):
```json
{
  "success": true,
  "data": {
    "calls": [
      {
        "id": "uuid",
        "callSid": "CA123456",
        "phoneNumber": "+2348012345678",
        "duration": 145, // seconds
        "status": "completed",
        "resolvedByAI": true,
        "customerSatisfaction": 4.5,
        "createdAt": "2025-12-30T18:20:00Z",
        "summary": "Customer inquired about 3BR apartment pricing in Lekki"
      }
    ]
  }
}
```

---

### Get Call Details (Admin)

**GET** `/ai-voice/calls/:id`

**Authorization**: Admin only

**Response** (200):
```json
{
  "success": true,
  "data": {
    "call": {
      "id": "uuid",
      "callSid": "CA123456",
      "phoneNumber": "+2348012345678",
      "duration": 145,
      "recordingUrl": "https://api.twilio.com/recordings/RE123",
      "transcript": [
        {
          "speaker": "ai",
          "text": "Hello! Welcome to JustBack...",
          "timestamp": "2025-12-30T18:20:05Z"
        },
        {
          "speaker": "customer",
          "text": "I'm looking for a 3 bedroom in Lekki",
          "timestamp": "2025-12-30T18:20:15Z",
          "confidence": 0.92
        },
        {
          "speaker": "ai",
          "text": "Great! I found several 3-bedroom apartments in Lekki...",
          "timestamp": "2025-12-30T18:20:20Z"
        }
      ],
      "retrievedDocuments": [
        {
          "documentId": "prop_123_general",
          "relevanceScore": 0.89,
          "content": "Property: Lekki Luxury Apartment..."
        }
      ],
      "averageConfidence": 0.87,
      "resolvedByAI": true,
      "escalatedToHuman": false,
      "createdAt": "2025-12-30T18:20:00Z"
    }
  }
}
```

---

## Wallet Endpoints

### Get Wallet Balance

**GET** `/wallet/balance`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "balance": 150000,
    "currency": "NGN",
    "pendingBalance": 50000 // Escrow
  }
}
```

---

### Fund Wallet

**POST** `/wallet/fund`

**Request Body**:
```json
{
  "amount": 100000,
  "paymentMethod": "PAYSTACK"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "uuid",
      "type": "CREDIT",
      "amount": 100000,
      "reference": "JB-WALLET-123"
    },
    "payment": {
      "authorizationUrl": "https://checkout.paystack.com/xyz",
      "reference": "JB-PAY-987654"
    }
  }
}
```

---

### Withdraw Funds (Host)

**POST** `/wallet/withdraw`

**Request Body**:
```json
{
  "amount": 50000,
  "bankAccount": {
    "accountNumber": "0123456789",
    "bankCode": "044", // Access Bank
    "accountName": "Jane Doe"
  }
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "withdrawal": {
      "id": "uuid",
      "amount": 50000,
      "fee": 100,
      "netAmount": 49900,
      "status": "PROCESSING",
      "estimatedTime": "24 hours"
    }
  },
  "message": "Withdrawal request submitted. Funds will be transferred within 24 hours."
}
```

---

## Admin Endpoints

### Get Platform Analytics

**GET** `/admin/analytics/overview`

**Authorization**: Admin only

**Query Parameters**:
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD

**Response** (200):
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalBookings": 1247,
      "totalRevenue": 125000000, // NGN
      "platformCommission": 18750000,
      "activeProperties": 3452,
      "activeUsers": 15678,
      "aiCallsHandled": 8945,
      "aiResolutionRate": 0.72
    },
    "trends": {
      "bookings": [
        { "date": "2025-12-01", "count": 45 },
        { "date": "2025-12-02", "count": 52 }
      ],
      "revenue": [
        { "date": "2025-12-01", "amount": 4500000 }
      ]
    },
    "topCities": [
      { "city": "Lagos", "bookings": 567 },
      { "city": "Abuja", "bookings": 234 }
    ]
  }
}
```

---

### Manage Knowledge Base (Admin)

**POST** `/admin/ai-voice/knowledge-base/sync`

Trigger manual sync of knowledge base to vector database.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "propertiesSynced": 3452,
    "documentsSynced": 17260,
    "vectorsUpdated": 17260,
    "syncDuration": "4.2 minutes"
  },
  "message": "Knowledge base sync completed successfully."
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**Common Error Codes**:
- `VALIDATION_ERROR` (400): Invalid request data
- `UNAUTHORIZED` (401): Missing or invalid authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource conflict (e.g., duplicate booking)
- `PAYMENT_FAILED` (402): Payment processing failed
- `RATE_LIMIT` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

---

## Rate Limiting

- **Authenticated**: 1000 requests/hour per user
- **Unauthenticated**: 100 requests/hour per IP
- **AI Voice**: 10 calls/hour per user

**Rate Limit Headers**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1735123456
```

---

## Webhooks

JustBack can send webhooks for important events.

### Webhook Events

- `booking.created`
- `booking.confirmed`
- `booking.cancelled`
- `payment.succeeded`
- `payment.failed`
- `check_in.completed`
- `check_out.completed`
- `ai_call.completed`

### Webhook Payload Example

```json
{
  "event": "booking.confirmed",
  "timestamp": "2025-12-31T10:30:00Z",
  "data": {
    "bookingId": "uuid",
    "propertyId": "uuid",
    "guestId": "uuid",
    "total": 251875,
    "checkInDate": "2026-01-15"
  }
}
```

**Webhook Signature** (HMAC SHA256):
```
X-JustBack-Signature: sha256=abc123...
```

---

## SDK Examples

### JavaScript/Node.js

```javascript
import JustBack from '@justback/sdk';

const client = new JustBack({
  apiKey: process.env.JUSTBACK_API_KEY
});

// Search properties
const properties = await client.properties.search({
  city: 'Lagos',
  bedrooms: 3,
  checkIn: '2026-01-15',
  checkOut: '2026-01-20'
});

// Create booking
const booking = await client.bookings.create({
  propertyId: 'prop-uuid',
  checkInDate: '2026-01-15',
  checkOutDate: '2026-01-20',
  numGuests: 4
});

// Request AI call
await client.aiVoice.requestCall({
  propertyId: 'prop-uuid',
  callReason: 'booking_inquiry'
});
```

### Python

```python
from justback import JustBackClient

client = JustBackClient(api_key=os.getenv('JUSTBACK_API_KEY'))

# Search properties
properties = client.properties.search(
    city='Lagos',
    bedrooms=3,
    check_in='2026-01-15',
    check_out='2026-01-20'
)

# Create booking
booking = client.bookings.create(
    property_id='prop-uuid',
    check_in_date='2026-01-15',
    check_out_date='2026-01-20',
    num_guests=4
)
```

---

## Testing

**Sandbox Environment**: `https://sandbox-api.justback.ng/api/v1`

**Test Cards** (Paystack):
- Success: `5531886652142950`
- Decline: `5061666666666666666`

**Test AI Voice**: `+234 800 JUSTBACK (800 5878 2225)`

---

## Changelog

### v1.0.0 (2026-01-01)
- Initial API release
- Authentication, properties, bookings, payments, AI voice, wallet endpoints

---

**Support**: api-support@justback.ng  
**Status Page**: https://status.justback.ng
