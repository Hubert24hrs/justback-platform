const express = require('express');
const http = require('http'); // [NEW]
const cors = require('cors');
const helmet = require('helmet');
const { initSocket } = require('./utils/socket'); // [NEW]
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDatabase } = require('./config/database');
const { connectMongoDB } = require('./config/mongodb');
const { connectRedis } = require('./config/redis');
const { logger } = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth.routes');
const propertyRoutes = require('./routes/property.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const aiVoiceRoutes = require('./routes/ai-voice.routes');
const walletRoutes = require('./routes/wallet.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const server = http.createServer(app); // [NEW]
const io = initSocket(server); // [NEW]
app.set('io', io); // [NEW]

// Middleware
app.use(helmet());

// Looser CORS for Mock Mode/Dev
const corsOptions = process.env.MOCK_MODE === 'true'
  ? { origin: true, credentials: true }
  : { origin: [process.env.FRONTEND_URL, process.env.ADMIN_URL, process.env.HOST_URL], credentials: true };

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: logger.stream }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

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
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to databases
    if (process.env.MOCK_MODE !== 'true' && process.env.USE_MOCK_DB !== 'true') {
      await connectDatabase();
      await connectMongoDB();
      await connectRedis();
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
