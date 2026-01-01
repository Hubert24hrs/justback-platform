# JustBack Platform

**AI-Powered Accommodation Marketplace for Nigeria**

![Architecture](../docs/architecture-diagram.png)

---

## 🚀 Overview

JustBack is a comprehensive accommodation booking platform combining traditional marketplace features with cutting-edge AI voice technology powered by RAG (Retrieval-Augmented Generation).

### Key Features

- 🏠 **Property Marketplace**: Search, book, and manage accommodations
- 🤖 **AI Voice Assistant**: 24/7 automated customer support using RAG
- 💳 **Payment Integration**: Paystack, Flutterwave with escrow system
- 📱 **Mobile Apps**: Flutter apps for Android & iOS
- 📊 **Dashboards**: Admin and Host web portals
- 💰 **Wallet System**: Internal wallet for transactions
- 🔐 **Secure**: JWT authentication, encrypted data, NDPR compliant

---

## 📋 Project Structure

```
justback-platform/
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── server.js       # Main server file
│   │   ├── config/         # Database & service configs
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models
│   │   ├── middleware/     # Auth, validation, etc.
│   │   ├── ai-voice/       # RAG pipeline & Twilio
│   │   └── utils/          # Helper functions
│   ├── database/           # SQL schemas & migrations
│   ├── scripts/            # Utility scripts
│   └── tests/              # Test suites
│
├── mobile/                  # Flutter mobile app
│   ├── lib/
│   │   ├── main.dart
│   │   ├── core/           # App config & constants
│   │   ├── features/       # Feature modules
│   │   └── shared/         # Shared widgets & models
│   └── assets/             # Images, fonts, etc.
│
├── admin-dashboard/         # React admin panel
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   └── services/       # API services
│   └── public/
│
├── host-dashboard/          # React host portal
│   └── src/
│
├── infrastructure/          # Cloud infrastructure
│   ├── terraform/          # IaC for AWS
│   └── docker/             # Container configs
│
└── docs/                    # Documentation
    ├── architecture/
    ├── api/
    └── deployment/
```

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Databases**: PostgreSQL (transactional), MongoDB (analytics), Redis (cache)
- **AI/ML**: OpenAI GPT-4, Whisper, Pinecone Vector DB
- **Voice**: Twilio Voice API
- **Payments**: Paystack, Flutterwave, Stripe
- **Storage**: AWS S3
- **Auth**: JWT

### Mobile
- **Framework**: Flutter 3.16+
- **State Management**: Provider / Riverpod
- **HTTP**: Dio
- **Storage**: Hive / SharedPreferences

### Web Dashboards
- **Framework**: React 18+ with TypeScript
- **UI Library**: Material-UI / Ant Design
- **State**: Redux / Context API
- **Charts**: Recharts / Chart.js

### Infrastructure
- **Cloud**: AWS (EC2, RDS, S3, CloudFront)
- **Containerization**: Docker
- **Orchestration**: Docker Compose / ECS
- **IaC**: Terraform
- **CI/CD**: GitHub Actions

---

## 🚦 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14
- MongoDB >= 6.0
- Redis >= 7.0
- Flutter SDK >= 3.16
- Twilio Account
- OpenAI API Key
- Pinecone Account
- Paystack/Flutterwave Account

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Create database
createdb justback_db

# 5. Run migrations
npm run migrate

# 6. Seed initial data (optional)
npm run seed

# 7. Start development server
npm run dev

# Server runs on http://localhost:5000
```

### Mobile App Setup

```bash
# 1. Navigate to mobile
cd mobile

# 2. Get Flutter dependencies
flutter pub get

# 3. Run on Android
flutter run

# Or iOS
flutter run -d ios
```

### Admin Dashboard Setup

```bash
# 1. Navigate to admin dashboard
cd admin-dashboard

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env

# 4. Start development server
npm start

# Dashboard runs on http://localhost:3000
```

---

## 📡 API Endpoints

Base URL: `http://localhost:5000/api/v1`

### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token

### Properties
- `GET /properties` - Search properties
- `GET /properties/:id` - Get property details
- `POST /properties` - Create property (host)
- `PUT /properties/:id` - Update property
- `GET /properties/:id/availability` - Check availability

### Bookings
- `POST /bookings` - Create booking
- `GET /bookings` - Get user bookings
- `PUT /bookings/:id/cancel` - Cancel booking
- `POST /bookings/:id/check-in` - Check-in

### AI Voice
- `POST /ai-voice/webhook/incoming-call` - Twilio webhook
- `POST /ai-voice/process-speech` - Process speech
- `GET /ai-voice/calls` - Get call logs
- `POST /ai-voice/request-call` - Request AI callback

### Payments
- `POST /payments/initialize` - Initialize payment
- `POST /payments/verify` - Verify payment

See [API Documentation](../docs/api_documentation.md) for complete reference.

---

## 🤖 AI Voice System

### RAG Pipeline

The AI voice assistant uses Retrieval-Augmented Generation to answer customer queries:

1. **Speech-to-Text**: Customer speech → text (Whisper)
2. **Intent Classification**: Determine what customer wants (GPT-4)
3. **Document Retrieval**: Search knowledge base (Pinecone)
4. **Response Generation**: Generate answer from context (GPT-4)
5. **Confidence Check**: If < 85%, escalate to human
6. **Text-to-Speech**: Convert response to voice (Polly)

### Knowledge Sources

- Property listings (auto-synced from database)
- Host-provided FAQs
- Company policies (cancellation, refund, etc.)
- User booking history
- Location guides

### Testing AI Voice

```bash
# 1. Make sure Twilio webhook is configured
# 2. Call the Twilio number
# 3. Speak your query
# 4. AI responds or escalates to human

# View call logs
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/v1/ai-voice/calls
```

---

## 🗄️ Database Setup

### PostgreSQL

```bash
# Create database
createdb justback_db

# Run schema
psql justback_db < database/schema.sql

# Or use migration script
npm run migrate
```

### MongoDB

```bash
# Start MongoDB
mongod

# Auto-creates collections on first use
```

### Redis

```bash
# Start Redis
redis-server

# Test connection
redis-cli ping
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- auth.test.js

# Watch mode
npm run test:watch
```

---

## 📦 Deployment

### Production Build

```bash
# Backend
cd backend
npm run build

# Mobile
cd mobile
flutter build apk --release  # Android
flutter build ios --release  # iOS

# Admin Dashboard
cd admin-dashboard
npm run build
```

### Docker Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

### AWS Deployment

See [Deployment Guide](../docs/deployment-guide.md)

---

## 🔐 Security

- JWT authentication with access & refresh tokens
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configured for specific domains
- Input validation with Joi
- SQL injection prevention (parameterized queries)
- XSS protection with Helmet
- Encrypted call recordings
- NDPR compliant data handling

---

## 📊 Monitoring

- **Logs**: Winston logger → CloudWatch
- **Metrics**: Custom metrics → Prometheus
- **APM**: New Relic / DataDog
- **Errors**: Sentry
- **Uptime**: StatusPage

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 📞 Support

- **Email**: support@justback.ng
- **Phone**: +234 800 JUSTBACK
- **Documentation**: https://docs.justback.ng
- **Status**: https://status.justback.ng

---

## 🗺️ Roadmap

### Phase 1 (Months 1-3): Lagos Launch
- ✅ Core backend API
- ✅ AI voice system
- ✅ Mobile app (MVP)
- ✅ Payment integration
- [ ] Beta testing
- [ ] Public launch

### Phase 2 (Months 4-6): Nigeria Expansion
- [ ] Abuja, Port Harcourt, Enugu
- [ ] Host analytics
- [ ] Advanced AI features
- [ ] Corporate booking system

### Phase 3 (Months 7-12): Optimization
- [ ] AI multilingual support (Yoruba, Igbo, Hausa)
- [ ] Instant booking
- [ ] Smart pricing
- [ ] Enhanced matching algorithm

### Phase 4 (Year 2): Africa Expansion
- [ ] Kenya, Ghana, South Africa
- [ ] Multi-currency support
- [ ] International payments

---

**Built with ❤️ by the JustBack Team**
