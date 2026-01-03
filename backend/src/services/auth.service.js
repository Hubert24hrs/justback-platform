const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { MOCK_USERS } = require('../utils/mockData');

class AuthService {
    // Register new user
    async register(userData) {
        // --- MOCK MODE ---
        if (process.env.MOCK_MODE === 'true') {
            const { email, firstName, lastName, role = 'guest' } = userData;
            const mockUser = {
                id: 'mock-user-' + Date.now(),
                email,
                firstName,
                lastName,
                role
            };
            const tokens = this.generateTokens(mockUser.id, role);
            return { user: mockUser, ...tokens };
        }
        // --- END MOCK MODE ---
        const { email, password, firstName, lastName, phone, role = 'guest' } = userData;

        // Check if user exists
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1 OR phone = $2',
            [email, phone]
        );

        if (existingUser.rows.length > 0) {
            const error = new Error('User with this email or phone already exists');
            error.statusCode = 409;
            error.code = 'USER_EXISTS';
            throw error;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        // Create user
        let user;
        if (process.env.DB_TYPE === 'sqlite') {
            await query(
                `INSERT INTO users (id, email, phone, password_hash, first_name, last_name, role)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [userId, email, phone, passwordHash, firstName, lastName, role]
            );

            // For SQLite, we construct the user object since we can't RETURNING
            user = {
                id: userId,
                email,
                first_name: firstName,
                last_name: lastName,
                role,
                created_at: new Date()
            };
        } else {
            const result = await query(
                `INSERT INTO users (email, phone, password_hash, first_name, last_name, role)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id, email, first_name, last_name, role, created_at`,
                [email, phone, passwordHash, firstName, lastName, role]
            );
            user = result.rows[0];
        }

        // Generate tokens
        const tokens = this.generateTokens(user.id, user.role);

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role
            },
            ...tokens
        };
    }

    // Login user
    async login(email, password) {
        // --- MOCK MODE ---
        if (process.env.MOCK_MODE === 'true') {
            const user = MOCK_USERS.find(u => u.email === email) || MOCK_USERS[0];
            const tokens = this.generateTokens(user.id, user.role);
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role
                },
                ...tokens
            };
        }
        // --- END MOCK MODE ---
        // Get user
        const result = await query(
            'SELECT id, email, password_hash, first_name, last_name, role, email_verified FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            error.code = 'INVALID_CREDENTIALS';
            throw error;
        }

        const user = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            error.code = 'INVALID_CREDENTIALS';
            throw error;
        }

        // Check if email verified (optional, can be disabled for MVP)
        // if (!user.email_verified) {
        //   const error = new Error('Please verify your email first');
        //   error.statusCode = 403;
        //   error.code = 'EMAIL_NOT_VERIFIED';
        //   throw error;
        // }

        // Generate tokens
        const tokens = this.generateTokens(user.id, user.role);

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role
            },
            ...tokens
        };
    }

    // Generate JWT tokens
    generateTokens(userId, role) {
        const jwtSecret = process.env.JWT_SECRET || 'mock_jwt_secret_for_dev';
        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'mock_jwt_refresh_secret_for_dev';

        const accessToken = jwt.sign(
            { userId, role },
            jwtSecret,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        const refreshToken = jwt.sign(
            { userId, role, type: 'refresh' },
            jwtRefreshSecret,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
        );

        return { accessToken, refreshToken };
    }

    // Refresh access token
    async refreshToken(refreshToken) {
        // --- MOCK MODE ---
        if (process.env.MOCK_MODE === 'true') {
            try {
                const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'test_refresh_secret');
                return this.generateTokens(decoded.userId, decoded.role);
            } catch (error) {
                const err = new Error('Invalid or expired refresh token');
                err.statusCode = 401;
                throw err;
            }
        }
        // --- END MOCK MODE ---

        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            if (decoded.type !== 'refresh') {
                throw new Error('Invalid token type');
            }

            // Get user to ensure they still exist
            const result = await query(
                'SELECT id, role FROM users WHERE id = $1',
                [decoded.userId]
            );

            if (result.rows.length === 0) {
                throw new Error('User not found');
            }

            const user = result.rows[0];
            return this.generateTokens(user.id, user.role);
        } catch (error) {
            const err = new Error('Invalid or expired refresh token');
            err.statusCode = 401;
            err.code = 'INVALID_REFRESH_TOKEN';
            throw err;
        }
    }

    // Get user profile
    async getProfile(userId) {
        // --- MOCK MODE ---
        if (process.env.MOCK_MODE === 'true') {
            const user = MOCK_USERS.find(u => u.id === userId) || MOCK_USERS[0];
            return {
                id: user.id,
                email: user.email,
                phone: user.phone,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                avatarUrl: user.avatar_url,
                emailVerified: user.email_verified,
                phoneVerified: user.phone_verified,
                walletBalance: user.wallet_balance,
                createdAt: user.created_at
            };
        }
        // --- END MOCK MODE ---
        const result = await query(
            `SELECT id, email, phone, first_name, last_name, role, avatar_url, 
              email_verified, phone_verified, wallet_balance, created_at
       FROM users WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            const error = new Error('User not found');
            error.statusCode = 404;
            error.code = 'USER_NOT_FOUND';
            throw error;
        }

        const user = result.rows[0];
        return {
            id: user.id,
            email: user.email,
            phone: user.phone,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            avatarUrl: user.avatar_url,
            emailVerified: user.email_verified,
            phoneVerified: user.phone_verified,
            walletBalance: parseFloat(user.wallet_balance),
            createdAt: user.created_at
        };
    }

    // Update profile
    async updateProfile(userId, updates) {
        const allowedFields = ['first_name', 'last_name', 'phone', 'avatar_url'];
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = $${paramCount}`);
                values.push(updates[key]);
                paramCount++;
            }
        });

        if (fields.length === 0) {
            return this.getProfile(userId);
        }

        values.push(userId);

        const result = await query(
            `UPDATE users SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING id, email, first_name, last_name, role, avatar_url`,
            values
        );

        return result.rows[0];
    }

    // Change password
    async changePassword(userId, currentPassword, newPassword) {
        // Get current password hash
        const result = await query(
            'SELECT password_hash FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);

        if (!isValid) {
            const error = new Error('Current password is incorrect');
            error.statusCode = 401;
            error.code = 'INVALID_PASSWORD';
            throw error;
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Update password
        await query(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
            [newPasswordHash, userId]
        );

        return { message: 'Password updated successfully' };
    }
}

module.exports = new AuthService();
