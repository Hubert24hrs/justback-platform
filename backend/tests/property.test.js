/**
 * Property Controller Tests
 * Tests for property management endpoints
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const JWT_SECRET = 'test-jwt-secret';
const mockProperties = new Map();

// Seed test properties
const seedProperties = () => {
    mockProperties.clear();
    mockProperties.set('prop-001', {
        id: 'prop-001',
        hostId: 'host-001',
        title: 'Lagos Luxury Apartment',
        city: 'Lagos',
        state: 'Lagos',
        pricePerNight: 50000,
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        status: 'active',
        rating: 4.5,
        reviewCount: 10
    });
    mockProperties.set('prop-002', {
        id: 'prop-002',
        hostId: 'host-001',
        title: 'Abuja Executive Suite',
        city: 'Abuja',
        state: 'FCT',
        pricePerNight: 75000,
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        status: 'active',
        rating: 4.8,
        reviewCount: 25
    });
    mockProperties.set('prop-003', {
        id: 'prop-003',
        hostId: 'host-002',
        title: 'Port Harcourt Beach House',
        city: 'Port Harcourt',
        state: 'Rivers',
        pricePerNight: 100000,
        bedrooms: 4,
        bathrooms: 3,
        maxGuests: 8,
        status: 'active',
        rating: 4.9,
        reviewCount: 15
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
app.get('/api/v1/properties', (req, res) => {
    const { city, minPrice, maxPrice, bedrooms } = req.query;
    let results = Array.from(mockProperties.values());

    if (city) results = results.filter(p => p.city.toLowerCase().includes(city.toLowerCase()));
    if (minPrice) results = results.filter(p => p.pricePerNight >= parseInt(minPrice));
    if (maxPrice) results = results.filter(p => p.pricePerNight <= parseInt(maxPrice));
    if (bedrooms) results = results.filter(p => p.bedrooms >= parseInt(bedrooms));

    res.json({ success: true, data: { properties: results, total: results.length } });
});

app.get('/api/v1/properties/:id', (req, res) => {
    const property = mockProperties.get(req.params.id);
    if (!property) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    }
    res.json({ success: true, data: property });
});

app.post('/api/v1/properties', authenticate, (req, res) => {
    if (req.user.role !== 'host' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
    }

    const propertyId = `prop-${Date.now()}`;
    const newProperty = {
        id: propertyId,
        hostId: req.user.id,
        ...req.body,
        status: 'pending',
        rating: 0,
        reviewCount: 0
    };
    mockProperties.set(propertyId, newProperty);

    res.status(201).json({ success: true, data: newProperty });
});

app.delete('/api/v1/properties/:id', authenticate, (req, res) => {
    const property = mockProperties.get(req.params.id);
    if (!property) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    }
    mockProperties.delete(req.params.id);
    res.json({ success: true, message: 'Property deleted' });
});

// Test Suite
describe('Property Controller', () => {
    beforeEach(() => {
        seedProperties();
    });

    describe('GET /api/v1/properties', () => {
        it('should return all properties', async () => {
            const res = await request(app).get('/api/v1/properties');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.properties.length).toBe(3);
        });

        it('should filter properties by city', async () => {
            const res = await request(app).get('/api/v1/properties?city=Lagos');

            expect(res.status).toBe(200);
            expect(res.body.data.properties.length).toBe(1);
            expect(res.body.data.properties[0].city).toBe('Lagos');
        });

        it('should filter properties by minimum price', async () => {
            const res = await request(app).get('/api/v1/properties?minPrice=70000');

            expect(res.status).toBe(200);
            expect(res.body.data.properties.length).toBe(2);
        });

        it('should filter properties by maximum price', async () => {
            const res = await request(app).get('/api/v1/properties?maxPrice=60000');

            expect(res.status).toBe(200);
            expect(res.body.data.properties.length).toBe(1);
        });

        it('should filter properties by bedrooms', async () => {
            const res = await request(app).get('/api/v1/properties?bedrooms=3');

            expect(res.status).toBe(200);
            expect(res.body.data.properties.length).toBe(2);
        });

        it('should apply multiple filters', async () => {
            const res = await request(app).get('/api/v1/properties?city=Abuja&minPrice=50000');

            expect(res.status).toBe(200);
            expect(res.body.data.properties.length).toBe(1);
            expect(res.body.data.properties[0].title).toBe('Abuja Executive Suite');
        });
    });

    describe('GET /api/v1/properties/:id', () => {
        it('should return property details by ID', async () => {
            const res = await request(app).get('/api/v1/properties/prop-001');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe('prop-001');
            expect(res.body.data.title).toBe('Lagos Luxury Apartment');
        });

        it('should return 404 for non-existent property', async () => {
            const res = await request(app).get('/api/v1/properties/prop-999');

            expect(res.status).toBe(404);
            expect(res.body.error.code).toBe('NOT_FOUND');
        });
    });

    describe('POST /api/v1/properties', () => {
        it('should create property for host user', async () => {
            const hostToken = jwt.sign({ userId: 'host-001', role: 'host' }, JWT_SECRET);

            const res = await request(app)
                .post('/api/v1/properties')
                .set('Authorization', `Bearer ${hostToken}`)
                .send({
                    title: 'New Test Property',
                    city: 'Ibadan',
                    state: 'Oyo',
                    pricePerNight: 35000,
                    bedrooms: 2,
                    bathrooms: 1,
                    maxGuests: 4
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('New Test Property');
            expect(res.body.data.status).toBe('pending');
        });

        it('should reject property creation for guest user', async () => {
            const guestToken = jwt.sign({ userId: 'user-001', role: 'guest' }, JWT_SECRET);

            const res = await request(app)
                .post('/api/v1/properties')
                .set('Authorization', `Bearer ${guestToken}`)
                .send({
                    title: 'Unauthorized Property',
                    city: 'Lagos'
                });

            expect(res.status).toBe(403);
            expect(res.body.error.code).toBe('FORBIDDEN');
        });

        it('should reject property creation without authentication', async () => {
            const res = await request(app)
                .post('/api/v1/properties')
                .send({
                    title: 'No Auth Property',
                    city: 'Lagos'
                });

            expect(res.status).toBe(401);
        });
    });

    describe('DELETE /api/v1/properties/:id', () => {
        it('should delete property successfully', async () => {
            const hostToken = jwt.sign({ userId: 'host-001', role: 'host' }, JWT_SECRET);

            const res = await request(app)
                .delete('/api/v1/properties/prop-001')
                .set('Authorization', `Bearer ${hostToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(mockProperties.has('prop-001')).toBe(false);
        });

        it('should return 404 when deleting non-existent property', async () => {
            const hostToken = jwt.sign({ userId: 'host-001', role: 'host' }, JWT_SECRET);

            const res = await request(app)
                .delete('/api/v1/properties/prop-999')
                .set('Authorization', `Bearer ${hostToken}`);

            expect(res.status).toBe(404);
        });
    });
});
