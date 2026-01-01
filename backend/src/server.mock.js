const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: '*', // Allow all for testing
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

console.log('🎯 MOCK MODE: Running without databases for quick testing!');
console.log('📝 Note: Data will not persist - this is for API structure testing only');

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        mode: 'MOCK',
        message: 'Mock mode - no databases required!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// Import routes
const authRoutes = require('./routes/auth.routes');
const propertyRoutes = require('./routes/property.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const chatRoutes = require('./routes/chat.routes');
const aiVoiceRoutes = require('./routes/ai-voice.routes');

// API Routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/properties`, propertyRoutes);
app.use(`/api/${API_VERSION}/bookings`, bookingRoutes);
app.use(`/api/${API_VERSION}/payments`, paymentRoutes);
app.use(`/api/${API_VERSION}/chat`, chatRoutes);
app.use(`/api/${API_VERSION}/ai-voice`, aiVoiceRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message: message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

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

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('');
    console.log('🚀 JustBack API Server (MOCK MODE) running!');
    console.log(`📡 Port: ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌍 API Version: ${API_VERSION}`);
    console.log('');
    console.log('✅ Ready to test APIs!');
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   Auth: http://localhost:${PORT}/api/${API_VERSION}/auth/register`);
    console.log('');
    console.log('💡 Use Postman or Thunder Client to test endpoints');
    console.log('📖 See api-tests.json for example requests');
    console.log('');
});

module.exports = app;
