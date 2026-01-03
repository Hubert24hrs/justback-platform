/**
 * Auth Controller Tests
 * Tests for authentication endpoints
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock server setup for testing
const app = express();
app.use(express.json());

const JWT_SECRET = 'test-jwt-secret';
const mockUsers = new Map();

// Setup test routes (simplified from standalone-mock)
app.post('/api/v1/auth/register', async (req, res) => {
    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password || !firstName || !phone) {
        return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'All fields are required' }
        });
    }

    for (const user of mockUsers.values()) {
        if (user.email === email) {
            return res.status(409).json({
                success: false,
                error: { code: 'USER_EXISTS', message: 'User already exists' }
            });
        }
    }

    const userId = `user-${Date.now()}`;
    mockUsers.set(userId, {
        id: userId,
        email,
        passwordHash: await bcrypt.hash(password, 10),
        firstName,
        lastName,
        phone,
        role: 'guest'
    });

    const token = jwt.sign({ userId, role: 'guest' }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
        success: true,
        data: { user: { id: userId, email, firstName, lastName }, accessToken: token }
    });
});

app.post('/api/v1/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Email and password required' }
        });
    }

    let foundUser = null;
    for (const user of mockUsers.values()) {
        if (user.email === email) {
            foundUser = user;
            break;
        }
    }

    if (!foundUser) {
        return res.status(401).json({
            success: false,
            error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' }
        });
    }

    const isValid = await bcrypt.compare(password, foundUser.passwordHash);
    if (!isValid) {
        return res.status(401).json({
            success: false,
            error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' }
        });
    }

    const token = jwt.sign({ userId: foundUser.id, role: foundUser.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
        success: true,
        data: { user: { id: foundUser.id, email: foundUser.email }, accessToken: token }
    });
});

// Test Suite
describe('Auth Controller', () => {
    beforeEach(() => {
        mockUsers.clear();
    });

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '+2348012345678'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.email).toBe('test@example.com');
            expect(res.body.data.accessToken).toBeDefined();
        });

        it('should reject registration with missing fields', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'test@example.com'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error.code).toBe('VALIDATION_ERROR');
        });

        it('should reject duplicate email registration', async () => {
            // First registration
            await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'duplicate@example.com',
                    password: 'password123',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '+2348012345678'
                });

            // Second registration with same email
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'duplicate@example.com',
                    password: 'password456',
                    firstName: 'Jane',
                    lastName: 'Doe',
                    phone: '+2348012345679'
                });

            expect(res.status).toBe(409);
            expect(res.body.error.code).toBe('USER_EXISTS');
        });
    });

    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            // Create a test user
            await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'login@example.com',
                    password: 'password123',
                    firstName: 'Test',
                    lastName: 'User',
                    phone: '+2348012345678'
                });
        });

        it('should login successfully with valid credentials', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.accessToken).toBeDefined();
        });

        it('should reject login with wrong password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword'
                });

            expect(res.status).toBe(401);
            expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
        });

        it('should reject login with non-existent email', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(401);
            expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
        });

        it('should reject login with missing fields', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'login@example.com'
                });

            expect(res.status).toBe(400);
            expect(res.body.error.code).toBe('VALIDATION_ERROR');
        });
    });
});
