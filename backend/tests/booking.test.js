/**
 * Booking Controller Tests
 * Tests for booking management endpoints
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const JWT_SECRET = 'test-jwt-secret';
const mockBookings = new Map();
const mockProperties = new Map();

// Seed test data
const seedData = () => {
    mockBookings.clear();
    mockProperties.clear();

    mockProperties.set('prop-001', {
        id: 'prop-001',
        hostId: 'host-001',
        title: 'Lagos Luxury Apartment',
        pricePerNight: 50000,
        status: 'active'
    });

    mockBookings.set('booking-001', {
        id: 'booking-001',
        propertyId: 'prop-001',
        guestId: 'user-001',
        hostId: 'host-001',
        checkIn: '2026-01-15',
        checkOut: '2026-01-18',
        guests: 2,
        nights: 3,
        totalPrice: 150000,
        status: 'confirmed',
        paymentStatus: 'paid',
        createdAt: new Date().toISOString()
    });

    mockBookings.set('booking-002', {
        id: 'booking-002',
        propertyId: 'prop-001',
        guestId: 'user-002',
        hostId: 'host-001',
        checkIn: '2026-01-20',
        checkOut: '2026-01-23',
        guests: 4,
        nights: 3,
        totalPrice: 150000,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
    });
};

// Auth middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: { code: 'NO_TOKEN' } });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.userId, role: decoded.role };
        next();
    } catch {
        return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN' } });
    }
};

// Routes
app.post('/api/v1/bookings', authenticate, (req, res) => {
    const { propertyId, checkIn, checkOut, guests } = req.body;

    const property = mockProperties.get(propertyId);
    if (!property) {
        return res.status(404).json({ success: false, error: { code: 'PROPERTY_NOT_FOUND' } });
    }

    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const totalPrice = property.pricePerNight * nights;

    const bookingId = `booking-${Date.now()}`;
    const newBooking = {
        id: bookingId,
        propertyId,
        guestId: req.user.id,
        hostId: property.hostId,
        checkIn,
        checkOut,
        guests,
        nights,
        totalPrice,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
    };
    mockBookings.set(bookingId, newBooking);

    res.status(201).json({ success: true, data: newBooking });
});

app.get('/api/v1/bookings/my-bookings', authenticate, (req, res) => {
    const myBookings = Array.from(mockBookings.values())
        .filter(b => b.guestId === req.user.id || b.hostId === req.user.id);

    res.json({ success: true, data: { bookings: myBookings, total: myBookings.length } });
});

app.get('/api/v1/bookings/:id', authenticate, (req, res) => {
    const booking = mockBookings.get(req.params.id);
    if (!booking) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    }

    // Check if user has access
    if (booking.guestId !== req.user.id && booking.hostId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
    }

    res.json({ success: true, data: booking });
});

app.post('/api/v1/bookings/:id/cancel', authenticate, (req, res) => {
    const booking = mockBookings.get(req.params.id);
    if (!booking) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    }

    if (booking.guestId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
    }

    if (booking.status === 'cancelled') {
        return res.status(400).json({ success: false, error: { code: 'ALREADY_CANCELLED' } });
    }

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancelledAt = new Date().toISOString();
    mockBookings.set(booking.id, booking);

    res.json({ success: true, data: booking, message: 'Booking cancelled' });
});

// Test Suite
describe('Booking Controller', () => {
    beforeEach(() => {
        seedData();
    });

    describe('POST /api/v1/bookings', () => {
        it('should create a new booking', async () => {
            const userToken = jwt.sign({ userId: 'user-003', role: 'guest' }, JWT_SECRET);

            const res = await request(app)
                .post('/api/v1/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    propertyId: 'prop-001',
                    checkIn: '2026-02-01',
                    checkOut: '2026-02-05',
                    guests: 2
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('pending');
            expect(res.body.data.nights).toBe(4);
            expect(res.body.data.totalPrice).toBe(200000); // 50000 * 4 nights
        });

        it('should reject booking for non-existent property', async () => {
            const userToken = jwt.sign({ userId: 'user-003', role: 'guest' }, JWT_SECRET);

            const res = await request(app)
                .post('/api/v1/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    propertyId: 'prop-999',
                    checkIn: '2026-02-01',
                    checkOut: '2026-02-05',
                    guests: 2
                });

            expect(res.status).toBe(404);
            expect(res.body.error.code).toBe('PROPERTY_NOT_FOUND');
        });

        it('should reject booking without authentication', async () => {
            const res = await request(app)
                .post('/api/v1/bookings')
                .send({
                    propertyId: 'prop-001',
                    checkIn: '2026-02-01',
                    checkOut: '2026-02-05',
                    guests: 2
                });

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/v1/bookings/my-bookings', () => {
        it('should return user bookings', async () => {
            const userToken = jwt.sign({ userId: 'user-001', role: 'guest' }, JWT_SECRET);

            const res = await request(app)
                .get('/api/v1/bookings/my-bookings')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.bookings.length).toBe(1);
            expect(res.body.data.bookings[0].guestId).toBe('user-001');
        });

        it('should return host bookings', async () => {
            const hostToken = jwt.sign({ userId: 'host-001', role: 'host' }, JWT_SECRET);

            const res = await request(app)
                .get('/api/v1/bookings/my-bookings')
                .set('Authorization', `Bearer ${hostToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.bookings.length).toBe(2); // Both bookings belong to host-001
        });

        it('should return empty for user with no bookings', async () => {
            const userToken = jwt.sign({ userId: 'user-999', role: 'guest' }, JWT_SECRET);

            const res = await request(app)
                .get('/api/v1/bookings/my-bookings')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.bookings.length).toBe(0);
        });
    });

    describe('GET /api/v1/bookings/:id', () => {
        it('should return booking details for guest', async () => {
            const userToken = jwt.sign({ userId: 'user-001', role: 'guest' }, JWT_SECRET);

            const res = await request(app)
                .get('/api/v1/bookings/booking-001')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe('booking-001');
        });

        it('should return booking details for host', async () => {
            const hostToken = jwt.sign({ userId: 'host-001', role: 'host' }, JWT_SECRET);

            const res = await request(app)
                .get('/api/v1/bookings/booking-001')
                .set('Authorization', `Bearer ${hostToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe('booking-001');
        });

        it('should reject access for unauthorized user', async () => {
            const otherUserToken = jwt.sign({ userId: 'user-999', role: 'guest' }, JWT_SECRET);

            const res = await request(app)
                .get('/api/v1/bookings/booking-001')
                .set('Authorization', `Bearer ${otherUserToken}`);

            expect(res.status).toBe(403);
        });

        it('should return 404 for non-existent booking', async () => {
            const userToken = jwt.sign({ userId: 'user-001', role: 'guest' }, JWT_SECRET);

            const res = await request(app)
                .get('/api/v1/bookings/booking-999')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(404);
        });
    });

    describe('POST /api/v1/bookings/:id/cancel', () => {
        it('should cancel booking successfully', async () => {
            const userToken = jwt.sign({ userId: 'user-001', role: 'guest' }, JWT_SECRET);

            const res = await request(app)
                .post('/api/v1/bookings/booking-001/cancel')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('cancelled');
            expect(res.body.data.paymentStatus).toBe('refunded');
        });

        it('should reject cancellation by non-owner', async () => {
            const otherUserToken = jwt.sign({ userId: 'user-999', role: 'guest' }, JWT_SECRET);

            const res = await request(app)
                .post('/api/v1/bookings/booking-001/cancel')
                .set('Authorization', `Bearer ${otherUserToken}`);

            expect(res.status).toBe(403);
        });

        it('should reject double cancellation', async () => {
            const userToken = jwt.sign({ userId: 'user-001', role: 'guest' }, JWT_SECRET);

            // First cancellation
            await request(app)
                .post('/api/v1/bookings/booking-001/cancel')
                .set('Authorization', `Bearer ${userToken}`);

            // Second cancellation
            const res = await request(app)
                .post('/api/v1/bookings/booking-001/cancel')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(400);
            expect(res.body.error.code).toBe('ALREADY_CANCELLED');
        });
    });
});
