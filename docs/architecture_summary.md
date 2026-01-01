# JustBack - Platform Architecture Summary

**AI-Powered Accommodation Marketplace for Nigeria**

---

## Executive Overview

JustBack is a comprehensive accommodation booking platform combining traditional marketplace features with cutting-edge AI voice technology. The platform enables guests to search, book, and manage accommodations while providing hosts with powerful tools to manage their properties and earnings.

**Key Differentiator**: AI-powered voice call center using RAG (Retrieval-Augmented Generation) technology that answers customer inquiries 24/7 using real business data.

---

## System Architecture

![JustBack Architecture](C:/Users/HP/.gemini/antigravity/brain/6c4f14a8-b887-42fe-8a67-b593468c2019/justback_architecture_diagram_1767220003236.png)

### Architecture Layers

**Client Layer**:
- 📱 Mobile Apps (Flutter) - Android & iOS
- 🌐 Admin Dashboard (React + TypeScript)
- 🌐 Host Dashboard (React + TypeScript)

**API Gateway**:
- Kong API Gateway / AWS API Gateway
- Rate limiting, authentication, routing

**Microservices Layer**:
- **Auth Service**: JWT authentication, user management
- **Property Service**: Listings, search, availability
- **Booking Service**: Reservations, check-in/out
- **Payment Service**: Escrow, wallets, payouts
- **AI Voice Service**: RAG pipeline, call handling
- **Notification Service**: Email, SMS, push notifications

**Data Layer**:
- PostgreSQL: Transactional data (users, properties, bookings, payments)
- MongoDB: Analytics, call logs, transcripts
- Redis: Caching, session management
- Pinecone: Vector database for AI knowledge base

**External Integrations**:
- Payment Gateways: Paystack, Flutterwave, Stripe
- Maps: Google Maps API
- Storage: AWS S3
- Voice: Twilio Voice API
- AI: OpenAI GPT-4, Whisper, Amazon Polly

---

## AI Voice RAG Pipeline

![RAG Pipeline](C:/Users/HP/.gemini/antigravity/brain/6c4f14a8-b887-42fe-8a67-b593468c2019/rag_pipeline_flow_1767220028557.png)

### How It Works

1. **Customer calls** the JustBack hotline or uses in-app voice
2. **Speech-to-Text** (Whisper) converts voice to text
3. **Intent Classification** determines what the customer wants
4. **RAG Pipeline** searches the vector database for relevant information
5. **GPT-4** generates a response using retrieved context
6. **Confidence Check**: If confidence > 85%, proceed; else escalate to human
7. **Text-to-Speech** (Polly) converts response to natural voice
8. **Customer hears** the AI response

### Knowledge Sources

- Property listings (real-time sync)
- Host-provided FAQs
- Company policies (cancellation, refund, etc.)
- User booking history
- Location guides

**Accuracy**: The AI answers **strictly** from retrieved documents—no hallucinations. If information isn't available, it escalates to a human agent.

---

## Mobile App

![App Flow](C:/Users/HP/.gemini/antigravity/brain/6c4f14a8-b887-42fe-8a67-b593468c2019/mobile_app_flow_1767220053786.png)

### Guest Features

- 🔍 **Search & Filter**: Location, price, amenities, dates
- 🏠 **Property Details**: Photos, reviews, map, amenities
- 📞 **AI Voice Assistant**: Call AI to ask questions
- 💬 **In-App Chat**: Message hosts
- 💳 **Seamless Booking**: Calendar, pricing, payment
- 🧳 **Trip Management**: Upcoming stays, history
- 💰 **Wallet**: Fund, pay, track transactions
- ⭐ **Reviews**: Rate properties & hosts

### Host Features

- ➕ **Add Properties**: Upload photos, set pricing
- 📅 **Manage Availability**: Calendar, pricing overrides
- 📋 **Booking Management**: Accept/decline, check-in/out
- 🤖 **AI Assistant Setup**: Add custom FAQs for AI
- 💸 **Earnings & Payouts**: Track revenue, withdraw funds
- 📊 **Analytics**: Booking stats, occupancy rates

---

## Database Schema Highlights

### Core Tables

**users**
- Authentication & profile information
- Wallet balance
- KYC status (for hosts)

**properties**
- Property details (title, description, location, amenities)
- Pricing (nightly, weekly, monthly)
- House rules & policies
- Custom FAQs for AI (JSONB)
- Average rating & review count

**bookings**
- Guest, host, property references
- Check-in/out dates
- Pricing breakdown
- Status tracking (pending → confirmed → checked in → checked out)
- Payment status (escrow flow)

**payments**
- Gateway transactions (Paystack, Flutterwave, Stripe)
- Reference tracking
- Status & gateway responses

**escrow**
- Holds booking payments until check-in
- Releases funds to host after guest checks in
- Commission deduction (10-15% host fee)

**call_logs** (MongoDB)
- AI call transcripts
- Retrieved documents
- Confidence scores
- Escalation tracking
- Customer satisfaction

---

## API Endpoints

Complete REST API with 50+ endpoints across 7 domains:

### Authentication
- Register, login, refresh token, email verification
- Password reset

### Properties
- Search with filters (city, price, bedrooms, amenities, dates)
- Get details, check availability
- Create/update/delete (hosts)
- Manage FAQs for AI

### Bookings
- Create booking, verify payment
- Get bookings (guest/host views)
- Cancel, modify, check-in, check-out

### Payments
- Initialize payment (Paystack/Flutterwave)
- Verify payment, process refunds
- Payout to hosts

### Wallet
- Get balance, fund wallet, withdraw

### AI Voice
- Request AI call
- Get call history & transcripts (admin)
- Update knowledge base

### Admin
- Platform analytics
- AI call center monitoring
- Dispute resolution

**See Full Documentation**: [api_documentation.md](file:///C:/Users/HP/.gemini/antigravity/brain/6c4f14a8-b887-42fe-8a67-b593468c2019/api_documentation.md)

---

## Technology Stack

### ✅ Recommended Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Mobile** | Flutter | Single codebase, excellent UI, native performance |
| **Backend** | Node.js (NestJS) | Microservices, real-time, TypeScript |
| **Databases** | PostgreSQL + MongoDB + Redis | Relational + NoSQL + Caching |
| **Voice** | Twilio Voice | Best Nigerian phone support, comprehensive API |
| **STT** | OpenAI Whisper | Accurate, handles Nigerian English well |
| **TTS** | Amazon Polly (Neural) | Natural-sounding voices |
| **LLM** | OpenAI GPT-4 | Best Nigerian English comprehension |
| **Vector DB** | Pinecone | Managed, scalable, RAG-optimized |
| **Payments** | Paystack + Flutterwave | Nigerian market leaders |
| **Cloud** | AWS | Best Nigerian infrastructure, comprehensive services |
| **Web Dashboards** | React + TypeScript | Component-based, type-safe |

---

## Payment Flow & Escrow

### How It Works

1. **Guest books** a property
2. **Payment processed** via Paystack/Flutterwave
3. **Funds held in escrow** (not immediately released to host)
4. **On check-in day**, guest checks in
5. **Funds released to host** (minus 10-15% commission)
6. **Platform earns** commission + 5-10% guest service fee

### Payment Methods

- ✅ Debit/Credit Cards
- ✅ Bank Transfer
- ✅ USSD
- ✅ Wallet
- ✅ Crypto (USDT) - Future phase

### Refund Policy

- **24+ hours before check-in**: 100% refund
- **<24 hours**: No refund (non-refundable)
- **Host cancellation**: 100% refund + compensation

---

## Monetization Strategy

### Revenue Streams

**1. Booking Commissions** (Primary)
- Host fee: 10-15% per booking
- Guest service fee: 5-10% per booking
- **Example**: ₦100,000 booking = ₦10,000-15,000 host fee + ₦5,000-10,000 guest fee = **₦15,000-25,000 revenue**

**2. AI Voice Subscriptions** (Unique)
- Hosts pay for AI call handling
- **Basic**: ₦5,000/month (up to 100 calls)
- **Pro**: ₦15,000/month (unlimited calls)
- **Enterprise**: Custom pricing (hotels, large property managers)

**3. Featured Listings**
- Boost property visibility: ₦10,000/month

**4. Corporate Bookings**
- Enterprise accounts for corporate housing
- Volume discounts, dedicated support

**5. Ads & Partnerships**
- Banner ads for travel services
- Partnerships with airlines, tour operators

---

## Cost Breakdown (Monthly)

### Phase 1: Lagos Launch (1K properties, 10K users)

| Category | Service | Cost (USD) |
|----------|---------|------------|
| **Infrastructure** | AWS (EC2, RDS, S3, etc.) | $1,320 |
| **AI Voice** | Twilio (5,000 calls x 3min) | $750 |
| | OpenAI GPT-4 (500K tokens/day) | $600 |
| | Whisper STT (250 hours) | $150 |
| | Polly TTS (1M chars) | $16 |
| | Pinecone (100K vectors) | $70 |
| **Total** | | **~$2,906/month** |

**Break-Even**: ₦5M GMV (10% commission = ₦500K ≈ $340) + AI subscriptions

### Per-Call AI Cost: ~$0.08

---

## Scalability Plan

### Phase 1: Lagos Launch (Months 1-3)
- **Target**: 1,000 properties, 10,000 users
- **Cities**: Lagos (Lekki, VI, Ikoyi, Ikeja)
- **Infrastructure**: 2-3 API instances, 1 Voice instance
- **AI Calls**: ~500/day

### Phase 2: Nigeria Expansion (Months 4-12)
- **Target**: 10,000 properties, 100,000 users
- **Cities**: Abuja, Port Harcourt, Enugu, Ibadan
- **Infrastructure**: Auto-scaling (2-10 instances)
- **AI Calls**: ~5,000/day

### Phase 3: Africa Expansion (Year 2)
- **Target**: 50,000 properties, 1M users
- **Countries**: Ghana, Kenya, South Africa
- **Infrastructure**: Multi-region deployment
- **AI Calls**: ~20,000/day
- **Languages**: English, French, Swahili

---

## Go-to-Market Strategy

### Phase 1: Lagos Soft Launch

**Week 1-2: Host Onboarding**
- Partner with existing property managers in Lekki, VI
- Offer **free listings** for first 3 months
- Target: 100 properties

**Week 3-4: Guest Acquisition**
- Social media campaigns (Instagram, Twitter, Facebook)
- Influencer partnerships (Nigerian travel bloggers)
- Target: 1,000 app downloads

**Month 2: AI Voice Showcase**
- PR campaign highlighting AI voice assistant
- Demo videos on social media
- Press releases to tech blogs

**Month 3: Optimization**
- Gather feedback
- Improve AI accuracy
- Refine user experience

### Marketing Channels

- **Digital Ads**: Google Ads, Facebook Ads, Instagram Ads
- **Content Marketing**: Blog (travel guides, property investment tips)
- **SEO**: Rank for "shortlet Lagos", "hotels Lekki", etc.
- **Partnerships**: Corporate housing, relocation agencies
- **Referral Program**: ₦5,000 credit for referring hosts/guests

---

## Development Timeline

### MVP (Months 1-4)

**Month 1: Backend & Database**
- Set up infrastructure (AWS, databases)
- Implement Auth, Property, Booking APIs
- Payment integration (Paystack)

**Month 2: AI Voice System**
- RAG pipeline development
- Twilio integration
- Knowledge base ingestion
- Testing with sample data

**Month 3: Mobile App**
- Flutter app development
- Guest & host flows
- AI voice integration
- Payment flow

**Month 4: Dashboards & Testing**
- Admin dashboard
- Host dashboard
- End-to-end testing
- Beta launch

### Post-MVP (Months 5-6)

- User feedback & iteration
- AI accuracy improvements
- Additional payment methods
- Marketing campaigns

### Full Launch (Month 7)

- Public launch in Lagos
- Press releases
- Influencer campaigns

---

## Security & Compliance

### Data Protection
- **NDPR Compliance**: Call recording consent, data encryption
- **GDPR Readiness**: For international expansion
- **PCI DSS**: Payment data security

### Voice Data Security
- Encrypted call recordings (AES-256)
- Access-controlled transcripts
- Data retention policies (90 days)

### API Security
- JWT authentication
- Rate limiting
- HTTPS only
- CORS restrictions

---

## Risk Mitigation

### AI Voice Risks

| Risk | Mitigation |
|------|------------|
| **Hallucinations** | Strict RAG guardrails, confidence thresholds |
| **Low accuracy** | Human escalation for low-confidence responses |
| **Cost overruns** | Per-minute budgets, usage monitoring |
| **Nigerian accent issues** | Fine-tune Whisper, test extensively |

### Business Risks

| Risk | Mitigation |
|------|------------|
| **Host fraud** | KYC verification, reviews, escrow |
| **Payment failures** | Multiple gateways, wallet fallback |
| **Competition** | AI differentiation, superior UX |
| **Slow adoption** | Incentives (free listings, referral bonuses) |

---

## Success Metrics (6 Months)

- **Properties Listed**: 2,000+
- **Active Users**: 50,000+
- **Monthly Bookings**: 3,000+
- **GMV**: ₦100M+
- **AI Call Resolution Rate**: 70%+
- **Customer Satisfaction**: 4.0+/5.0

---

## Next Steps

### ✅ Completed
- [x] Architecture design
- [x] RAG pipeline specification
- [x] API documentation
- [x] Database schema design
- [x] System diagrams

### 🚀 Ready to Start

1. **Confirm Technology Stack** - Review recommendations
2. **Set Up Project Repositories** - GitHub repos for backend, mobile, web
3. **Provision Cloud Infrastructure** - AWS setup
4. **Begin Backend Development** - API implementation
5. **Develop RAG Pipeline** - AI voice system
6. **Build Mobile App** - Flutter development
7. **Create Dashboards** - Admin & host portals
8. **Testing & Deployment** - QA, staging, production

---

## Documentation Index

All documentation is available in the artifacts folder:

📄 [Implementation Plan](file:///C:/Users/HP/.gemini/antigravity/brain/6c4f14a8-b887-42fe-8a67-b593468c2019/implementation_plan.md) - Complete technical architecture and implementation plan

📄 [RAG Pipeline Specification](file:///C:/Users/HP/.gemini/antigravity/brain/6c4f14a8-b887-42fe-8a67-b593468c2019/rag_pipeline_spec.md) - Detailed AI voice system technical spec

📄 [API Documentation](file:///C:/Users/HP/.gemini/antigravity/brain/6c4f14a8-b887-42fe-8a67-b593468c2019/api_documentation.md) - Complete REST API reference

📝 [Task Checklist](file:///C:/Users/HP/.gemini/antigravity/brain/6c4f14a8-b887-42fe-8a67-b593468c2019/task.md) - Implementation task breakdown

---

## Contact & Support

For questions or clarifications about this architecture:

- Review the detailed implementation plan
- Check the RAG pipeline technical specification
- Refer to the API documentation
- Follow the task checklist for implementation

**Ready to build JustBack and revolutionize accommodation booking in Nigeria! 🚀**
