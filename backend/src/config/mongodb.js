const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

async function connect MongoDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        logger.info('✅ MongoDB connected');
    } catch (error) {
        logger.error('MongoDB connection error:', error);
        throw error;
    }
}

mongoose.connection.on('error', (err) => {
    logger.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
});

module.exports = { connectMongoDB };
