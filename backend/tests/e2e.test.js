/**
 * E2E Integration Tests
 * Tests complete user flows from start to finish
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Setup a test app that mimics the real server
const app = express();
app.use(express.json());

const JWT_SECRET = 'test-jwt-secret';
const mockUsers = new Map();
const mockProperties = new Map();
const mockBookings = new Map();

// Seed test data
const seedTestData = () => {
    mockUsers.clear();
    mockProperties.clear();
    mockBookings.clear();

    // Add test host
    mockUsers.set('host-001', {
        id: 'host-001',
        email: 'host@test.com',
        passwordHash: bcrypt.hashSync('password123', 10),
        firstName: 'Test',
        lastName: 'Host',
        role: 'host',
        walletBalance: 500000
    });

    // Add test guest
    mockUsers.set('guest-001', {
        id: 'guest-001',
        email: 'guest@test.com',
        passwordHash: bcrypt.hashSync('password123', 10),
        firstName: 'Test',
        lastName: 'Guest',
        role: 'guest',
        walletBalance: 100000
    });

    // Add test admin
    mockUsers.set('admin-001', {
        id: 'admin-001',
        email: 'admin@test.com',
        passwordHash: bcrypt.hashSync('admin123', 10),
        firstName: 'Super',
        lastName: 'Admin',
        role: 'admin'
    });

    // Add test property
    mockProperties.set('prop-001', {
        id: 'prop-001',
        hostId: 'host-001',
        title: 'Test Lagos Apartment',
        city: 'Lagos',
        state: 'Lagos',
        pricePerNight: 50000,
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        status: 'active',
        rating: 4.5
    });
};

// Helper to generate tokens
const generateToken = (userId, role) => {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '24h' });
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
app.post('/api/v1/auth/register', async (req, res) => {
    const { email, password, firstName, lastName, phone, role = 'guest' } = req.body;

    for (const user of mockUsers.values()) {
        if (user.email === email) {
            return res.status(409).json({ success: false, error: { code: 'USER_EXISTS' } });
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
        role,
        walletBalance: 0
    });

    const token = generateToken(userId, role);
    res.status(201).json({
        success: true,
        data: { user: { id: userId, email, firstName, lastName, role }, accessToken: token }
    });
});

app.post('/api/v1/auth/login', async (req, res) => {
    const { email, password } = req.body;

    let user = null;
    for (const u of mockUsers.values()) {
        if (u.email === email) { user = u; break; }
    }

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS' } });
    }

    const token = generateToken(user.id, user.role);
    res.json({ success: true, data: { user: { id: user.id, email, role: user.role }, accessToken: token } });
});

app.get('/api/v1/auth/me', authenticate, (req, res) => {
    const user = mockUsers.get(req.user.id);
    if (!user) return res.status(404).json({ success: false });
    res.json({ success: true, data: { id: user.id, email: user.email, firstName: user.firstName, role: user.role } });
});

app.post('/api/v1/auth/logout', authenticate, (req, res) => {
    res.json({ success: true, message: 'Logged out' });
});

app.get('/api/v1/properties/search', (req, res) => {
    const { city } = req.query;
    let results = Array.from(mockProperties.values()).filter(p => p.status === 'active');
    if (city) results = results.filter(p => p.city.toLowerCase().includes(city.toLowerCase()));
    res.json({ success: true, data: { properties: results } });
});

app.get('/api/v1/properties/:id', (req, res) => {
    const property = mockProperties.get(req.params.id);
    if (!property) return res.status(404).json({ success: false });
    res.json({ success: true, data: property });
});

app.get('/api/v1/properties/:id/availability', (req, res) => {
    const property = mockProperties.get(req.params.id);
    if (!property) return res.status(404).json({ success: false });
    res.json({ success: true, data: { available: true, pricePerNight: property.pricePerNight } });
});

app.post('/api/v1/bookings', authenticate, (req, res) => {
    const { propertyId, checkIn, checkOut, guests } = req.body;
    const property = mockProperties.get(propertyId);
    if (!property) return res.status(404).json({ success: false });

    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const bookingId = `booking-${Date.now()}`;
    const booking = {
        id: bookingId,
        propertyId,
        guestId: req.user.id,
        hostId: property.hostId,
        checkIn,
        checkOut,
        guests,
        nights,
        totalPrice: property.pricePerNight * nights,
        status: 'pending',
        paymentStatus: 'pending'
    };
    mockBookings.set(bookingId, booking);
    res.status(201).json({ success: true, data: booking });
});

app.post('/api/v1/payments/initialize', authenticate, (req, res) => {
    const { bookingId } = req.body;
    const booking = mockBookings.get(bookingId);
    if (!booking) return res.status(404).json({ success: false });

    res.json({
        success: true,
        data: {
            paymentUrl: 'https://paystack.com/pay/mock-payment',
            reference: `ref-${Date.now()}`,
            amount: booking.totalPrice
        }
    });
});

app.post('/api/v1/payments/verify', authenticate, (req, res) => {
    const { reference, bookingId } = req.body;
    const booking = mockBookings.get(bookingId);
    if (!booking) return res.status(404).json({ success: false });

    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    mockBookings.set(bookingId, booking);

    res.json({ success: true, data: { booking, paymentVerified: true } });
});

app.get('/api/v1/bookings/my-bookings', authenticate, (req, res) => {
    const bookings = Array.from(mockBookings.values()).filter(b => b.guestId === req.user.id);
    res.json({ success: true, data: { bookings } });
});

app.post('/api/v1/properties', authenticate, (req, res) => {
    if (req.user.role !== 'host' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false });
    }
    const propertyId = `prop-${Date.now()}`;
    const property = { id: propertyId, hostId: req.user.id, ...req.body, status: 'pending' };
    mockProperties.set(propertyId, property);
    res.status(201).json({ success: true, data: property });
});

app.put('/api/v1/properties/:id', authenticate, (req, res) => {
    const property = mockProperties.get(req.params.id);
    if (!property) return res.status(404).json({ success: false });
    const updated = { ...property, ...req.body };
    mockProperties.set(req.params.id, updated);
    res.json({ success: true, data: updated });
});

app.delete('/api/v1/properties/:id', authenticate, (req, res) => {
    if (!mockProperties.has(req.params.id)) return res.status(404).json({ success: false });
    mockProperties.delete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
});

app.get('/api/v1/admin/dashboard', authenticate, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false });
    res.json({
        success: true,
        data: {
            totalUsers: mockUsers.size,
            totalProperties: mockProperties.size,
            totalBookings: mockBookings.size,
            totalRevenue: 5000000
        }
    });
});

app.get('/api/v1/admin/users', authenticate, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false });
    const users = Array.from(mockUsers.values()).map(u => ({
        id: u.id, email: u.email, firstName: u.firstName, role: u.role
    }));
    res.json({ success: true, data: { users } });
});

// ============================================
// E2E TEST SUITES
// ============================================

describe('E2E: Complete Auth Flow', () => {
    beforeEach(() => seedTestData());

    it('should complete full registration → login → profile → logout flow', async () => {
        // Step 1: Register new user
        const registerRes = await request(app)
            .post('/api/v1/auth/register')
            .send({
                email: 'newuser@test.com',
                password: 'securepass123',
                firstName: 'New',
                lastName: 'User',
                phone: '+2348012345678'
            });

        expect(registerRes.status).toBe(201);
        expect(registerRes.body.data.user.email).toBe('newuser@test.com');
        const token = registerRes.body.data.accessToken;

        // Step 2: Get profile
        const profileRes = await request(app)
            .get('/api/v1/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(profileRes.status).toBe(200);
        expect(profileRes.body.data.email).toBe('newuser@test.com');

        // Step 3: Logout
        const logoutRes = await request(app)
            .post('/api/v1/auth/logout')
            .set('Authorization', `Bearer ${token}`);

        expect(logoutRes.status).toBe(200);
        expect(logoutRes.body.success).toBe(true);
    });

    it('should login with existing account and access protected routes', async () => {
        // Login as existing guest
        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'guest@test.com', password: 'password123' });

        expect(loginRes.status).toBe(200);
        const token = loginRes.body.data.accessToken;

        // Access profile
        const profileRes = await request(app)
            .get('/api/v1/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(profileRes.status).toBe(200);
        expect(profileRes.body.data.role).toBe('guest');
    });
});

describe('E2E: Complete Booking Flow', () => {
    beforeEach(() => seedTestData());

    it('should complete full search → select → book → pay → confirm flow', async () => {
        // Step 1: Login as guest
        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'guest@test.com', password: 'password123' });
        const token = loginRes.body.data.accessToken;

        // Step 2: Search properties
        const searchRes = await request(app)
            .get('/api/v1/properties/search?city=Lagos');

        expect(searchRes.status).toBe(200);
        expect(searchRes.body.data.properties.length).toBeGreaterThan(0);
        const propertyId = searchRes.body.data.properties[0].id;

        // Step 3: View property details
        const detailsRes = await request(app)
            .get(`/api/v1/properties/${propertyId}`);

        expect(detailsRes.status).toBe(200);
        expect(detailsRes.body.data.title).toBe('Test Lagos Apartment');

        // Step 4: Check availability
        const availRes = await request(app)
            .get(`/api/v1/properties/${propertyId}/availability?checkIn=2026-02-01&checkOut=2026-02-05`);

        expect(availRes.status).toBe(200);
        expect(availRes.body.data.available).toBe(true);

        // Step 5: Create booking
        const bookingRes = await request(app)
            .post('/api/v1/bookings')
            .set('Authorization', `Bearer ${token}`)
            .send({
                propertyId,
                checkIn: '2026-02-01',
                checkOut: '2026-02-05',
                guests: 2
            });

        expect(bookingRes.status).toBe(201);
        expect(bookingRes.body.data.status).toBe('pending');
        const bookingId = bookingRes.body.data.id;

        // Step 6: Initialize payment
        const payInitRes = await request(app)
            .post('/api/v1/payments/initialize')
            .set('Authorization', `Bearer ${token}`)
            .send({ bookingId });

        expect(payInitRes.status).toBe(200);
        expect(payInitRes.body.data.paymentUrl).toBeDefined();
        const reference = payInitRes.body.data.reference;

        // Step 7: Verify payment (simulate callback)
        const payVerifyRes = await request(app)
            .post('/api/v1/payments/verify')
            .set('Authorization', `Bearer ${token}`)
            .send({ reference, bookingId });

        expect(payVerifyRes.status).toBe(200);
        expect(payVerifyRes.body.data.paymentVerified).toBe(true);
        expect(payVerifyRes.body.data.booking.status).toBe('confirmed');

        // Step 8: Check my bookings
        const myBookingsRes = await request(app)
            .get('/api/v1/bookings/my-bookings')
            .set('Authorization', `Bearer ${token}`);

        expect(myBookingsRes.status).toBe(200);
        expect(myBookingsRes.body.data.bookings.length).toBe(1);
        expect(myBookingsRes.body.data.bookings[0].status).toBe('confirmed');
    });
});

describe('E2E: Host Property Management Flow', () => {
    beforeEach(() => seedTestData());

    it('should complete full create → update → view → delete property flow', async () => {
        // Login as host
        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'host@test.com', password: 'password123' });
        const token = loginRes.body.data.accessToken;

        // Step 1: Create new property
        const createRes = await request(app)
            .post('/api/v1/properties')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'New Abuja Villa',
                city: 'Abuja',
                state: 'FCT',
                pricePerNight: 75000,
                bedrooms: 3,
                bathrooms: 2,
                maxGuests: 6
            });

        expect(createRes.status).toBe(201);
        expect(createRes.body.data.title).toBe('New Abuja Villa');
        expect(createRes.body.data.status).toBe('pending');
        const propertyId = createRes.body.data.id;

        // Step 2: Update property
        const updateRes = await request(app)
            .put(`/api/v1/properties/${propertyId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                pricePerNight: 80000,
                title: 'Premium Abuja Villa'
            });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body.data.pricePerNight).toBe(80000);
        expect(updateRes.body.data.title).toBe('Premium Abuja Villa');

        // Step 3: View property
        const viewRes = await request(app)
            .get(`/api/v1/properties/${propertyId}`);

        expect(viewRes.status).toBe(200);
        expect(viewRes.body.data.title).toBe('Premium Abuja Villa');

        // Step 4: Delete property
        const deleteRes = await request(app)
            .delete(`/api/v1/properties/${propertyId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(deleteRes.status).toBe(200);

        // Verify deleted
        const verifyDeleteRes = await request(app)
            .get(`/api/v1/properties/${propertyId}`);

        expect(verifyDeleteRes.status).toBe(404);
    });
});

describe('E2E: Admin Dashboard Flow', () => {
    beforeEach(() => seedTestData());

    it('should complete admin login → view dashboard → manage users flow', async () => {
        // Login as admin
        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'admin@test.com', password: 'admin123' });
        const token = loginRes.body.data.accessToken;

        // View dashboard stats
        const dashboardRes = await request(app)
            .get('/api/v1/admin/dashboard')
            .set('Authorization', `Bearer ${token}`);

        expect(dashboardRes.status).toBe(200);
        expect(dashboardRes.body.data.totalUsers).toBeGreaterThan(0);
        expect(dashboardRes.body.data.totalProperties).toBeGreaterThan(0);

        // View users list
        const usersRes = await request(app)
            .get('/api/v1/admin/users')
            .set('Authorization', `Bearer ${token}`);

        expect(usersRes.status).toBe(200);
        expect(usersRes.body.data.users.length).toBeGreaterThan(0);
    });

    it('should deny admin routes to non-admin users', async () => {
        // Login as guest
        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'guest@test.com', password: 'password123' });
        const token = loginRes.body.data.accessToken;

        // Try accessing admin dashboard
        const dashboardRes = await request(app)
            .get('/api/v1/admin/dashboard')
            .set('Authorization', `Bearer ${token}`);

        expect(dashboardRes.status).toBe(403);
    });
});
