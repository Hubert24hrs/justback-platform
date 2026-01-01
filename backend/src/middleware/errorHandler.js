const { logger } = require('../utils/logger');

function errorHandler(err, req, res, next) {
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });

    // Default to 500 server error
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
}

module.exports = errorHandler;
