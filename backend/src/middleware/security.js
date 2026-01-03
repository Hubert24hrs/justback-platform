const helmet = require('helmet');
const xss = require('xss');
const { logger } = require('../utils/logger');

// XSS sanitization middleware
const sanitizeInput = (req, res, next) => {
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            return xss(obj);
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }
        if (obj && typeof obj === 'object') {
            return Object.keys(obj).reduce((acc, key) => {
                acc[key] = sanitize(obj[key]);
                return acc;
            }, {});
        }
        return obj;
    };

    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);

    next();
};

// Security headers via Helmet
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.paystack.co"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false, // For mobile app compatibility
    crossOriginResourcePolicy: { policy: "cross-origin" },
});

// Request logging for security audits
const auditLog = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.connection.remoteAddress,
            userId: req.user?.id || 'anonymous',
            userAgent: req.get('User-Agent')?.substring(0, 100)
        };

        // Log sensitive actions
        if (req.path.includes('/admin') ||
            req.path.includes('/auth') ||
            req.path.includes('/kyc') ||
            req.path.includes('/payments')) {
            logger.info('AUDIT:', logData);
        }
    });

    next();
};

// IP-based brute force protection
const loginAttempts = new Map();

const bruteForceProtection = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `${ip}:${req.body.email || 'unknown'}`;

    const attempts = loginAttempts.get(key) || { count: 0, lockUntil: 0 };

    if (Date.now() < attempts.lockUntil) {
        const waitTime = Math.ceil((attempts.lockUntil - Date.now()) / 1000 / 60);
        return res.status(429).json({
            success: false,
            error: {
                code: 'ACCOUNT_LOCKED',
                message: `Too many failed attempts. Try again in ${waitTime} minutes.`
            }
        });
    }

    // Attach helper to track success/failure
    req.trackLoginAttempt = (success) => {
        if (success) {
            loginAttempts.delete(key);
        } else {
            attempts.count++;
            if (attempts.count >= 5) {
                attempts.lockUntil = Date.now() + (15 * 60 * 1000); // 15 min lockout
                attempts.count = 0;
            }
            loginAttempts.set(key, attempts);
        }
    };

    next();
};

// Clear old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of loginAttempts.entries()) {
        if (value.lockUntil < now && value.count === 0) {
            loginAttempts.delete(key);
        }
    }
}, 60 * 1000);

// Password strength validator
const validatePasswordStrength = (password) => {
    const errors = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

module.exports = {
    sanitizeInput,
    securityHeaders,
    auditLog,
    bruteForceProtection,
    validatePasswordStrength
};
