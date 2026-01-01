const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'No token provided'
                }
            });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from database
            const result = await query('SELECT id, email, role, first_name, last_name FROM users WHERE id = $1', [decoded.userId]);

            if (result.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'User not found'
                    }
                });
            }

            req.user = result.rows[0];
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Invalid or expired token'
                }
            });
        }
    } catch (error) {
        next(error);
    }
}

function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required'
                }
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Insufficient permissions'
                }
            });
        }

        next();
    };
}

module.exports = { authenticate, authorize };
