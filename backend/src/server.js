const express = require('express');
const http = require('http');
const cors = require('cors');
const { initSocket } = require('./utils/socket');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDatabase } = require('./config/database');
const { connectMongoDB } = require('./config/mongodb');
const { connectRedis } = require('./config/redis');
const { logger } = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { securityHeaders, sanitizeInput, auditLog } = require('./middleware/security');

// Import routes
const authRoutes = require('./routes/auth.routes');
const propertyRoutes = require('./routes/property.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const aiVoiceRoutes = require('./routes/ai-voice.routes');
const walletRoutes = require('./routes/wallet.routes');
const adminRoutes = require('./routes/admin.routes');
const kycRoutes = require('./routes/kyc.routes');
const reviewRoutes = require('./routes/review.routes');
const promoRoutes = require('./routes/promo.routes');

const app = express();
const server = http.createServer(app);
const io = initSocket(server);
app.set('io', io);

// Security Middleware
app.use(securityHeaders);

// Looser CORS for Mock Mode/Dev
const corsOptions = (process.env.MOCK_MODE === 'true' || process.env.NODE_ENV === 'development')
  ? { origin: true, credentials: true }
  : { origin: [process.env.FRONTEND_URL, process.env.ADMIN_URL, process.env.HOST_URL], credentials: true };

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: logger.stream }));

// XSS Sanitization
app.use(sanitizeInput);

// Audit Logging
app.use(auditLog);

// Rate limiting (stricter for auth endpoints)
const generalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests.' } }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 min
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many auth attempts.' } }
});

app.use('/api/', generalLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/properties`, propertyRoutes);
app.use(`/api/${API_VERSION}/bookings`, bookingRoutes);
app.use(`/api/${API_VERSION}/payments`, paymentRoutes);
app.use(`/api/${API_VERSION}/ai-voice`, aiVoiceRoutes);
app.use(`/api/${API_VERSION}/wallet`, walletRoutes);
app.use(`/api/${API_VERSION}/admin`, adminRoutes);
app.use(`/api/${API_VERSION}/kyc`, kycRoutes);
app.use(`/api/${API_VERSION}/reviews`, reviewRoutes);
app.use(`/api/${API_VERSION}/promos`, promoRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'API endpoint not found'
    }
  });
});

// Initialize
const PORT = process.env.PORT || 5052;

async function startServer() {
  try {
    // Connect to databases
    if (process.env.MOCK_MODE !== 'true' && process.env.USE_MOCK_DB !== 'true') {
      await connectDatabase();

      // Only connect to Mongo/Redis if NOT using SQLite (which serves as a simpler local stack)
      if (process.env.DB_TYPE !== 'sqlite') {
        await connectMongoDB();
        await connectRedis();
      } else {
        logger.info('ℹ️  Running with SQLite - MongoDB & Redis connections skipped');
      }
    } else {
      logger.info('⚠️  Starting in MOCK MODE - Database connections skipped');
    }

    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 JustBack API + Socket Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🌍 API Version: ${API_VERSION}`);
    });
  } catch (error) {
    console.error('SERVER STARTUP ERROR:', error);
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

startServer();

module.exports = app;
