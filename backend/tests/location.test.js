/**
 * Location & Geo-Search Tests
 * Tests for location endpoints and geo-radius property search
 */

const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// ─── Mock Nigeria Location Data ───
const MOCK_STATES = [
    { id: 1, name: 'Lagos', capital: 'Ikeja', latitude: 6.5244, longitude: 3.3792, geo_zone: 'South West' },
    { id: 2, name: 'FCT', capital: 'Abuja', latitude: 9.0579, longitude: 7.4951, geo_zone: 'North Central' },
    { id: 3, name: 'Rivers', capital: 'Port Harcourt', latitude: 4.8156, longitude: 7.0498, geo_zone: 'South South' },
    { id: 4, name: 'Oyo', capital: 'Ibadan', latitude: 7.3775, longitude: 3.9470, geo_zone: 'South West' },
    { id: 5, name: 'Kano', capital: 'Kano', latitude: 12.0022, longitude: 8.5920, geo_zone: 'North West' },
];

const MOCK_LGAS = [
    { id: 1, state_id: 1, name: 'Ikeja', latitude: 6.5954, longitude: 3.3424 },
    { id: 2, state_id: 1, name: 'Victoria Island', latitude: 6.4281, longitude: 3.4219 },
    { id: 3, state_id: 1, name: 'Lekki', latitude: 6.4474, longitude: 3.4730 },
    { id: 4, state_id: 2, name: 'Garki', latitude: 9.0108, longitude: 7.4874 },
    { id: 5, state_id: 2, name: 'Wuse', latitude: 9.0643, longitude: 7.4892 },
    { id: 6, state_id: 3, name: 'Port Harcourt City', latitude: 4.8156, longitude: 7.0498 },
];

const MOCK_PROPERTIES_GEO = [
    {
        id: 'prop-geo-001', title: 'Lagos Luxury Penthouse',
        city: 'Lagos', state: 'Lagos', lga: 'Victoria Island',
        latitude: 6.4281, longitude: 3.4219,
        pricePerNight: 75000, bedrooms: 3, bathrooms: 2, maxGuests: 6,
        status: 'active', rating: 4.8, reviewCount: 20, property_type: 'apartment'
    },
    {
        id: 'prop-geo-002', title: 'Lekki Beach House',
        city: 'Lagos', state: 'Lagos', lga: 'Lekki',
        latitude: 6.4474, longitude: 3.4730,
        pricePerNight: 120000, bedrooms: 4, bathrooms: 3, maxGuests: 8,
        status: 'active', rating: 4.9, reviewCount: 15, property_type: 'house'
    },
    {
        id: 'prop-geo-003', title: 'Ikeja Business Suite',
        city: 'Lagos', state: 'Lagos', lga: 'Ikeja',
        latitude: 6.5954, longitude: 3.3424,
        pricePerNight: 45000, bedrooms: 2, bathrooms: 1, maxGuests: 3,
        status: 'active', rating: 4.5, reviewCount: 30, property_type: 'apartment'
    },
    {
        id: 'prop-geo-004', title: 'Abuja Executive Residence',
        city: 'Abuja', state: 'FCT', lga: 'Maitama',
        latitude: 9.0817, longitude: 7.4926,
        pricePerNight: 95000, bedrooms: 3, bathrooms: 2, maxGuests: 6,
        status: 'active', rating: 4.7, reviewCount: 12, property_type: 'serviced_apartment'
    },
    {
        id: 'prop-geo-005', title: 'Port Harcourt Waterfront',
        city: 'Port Harcourt', state: 'Rivers', lga: 'Port Harcourt City',
        latitude: 4.8200, longitude: 7.0500,
        pricePerNight: 60000, bedrooms: 2, bathrooms: 2, maxGuests: 4,
        status: 'active', rating: 4.6, reviewCount: 8, property_type: 'apartment'
    }
];

// ─── Haversine Helper ───
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// ─── Location Routes ───
app.get('/api/v1/locations/states', (req, res) => {
    res.json({ success: true, data: { states: MOCK_STATES, total: MOCK_STATES.length } });
});

app.get('/api/v1/locations/states/:id', (req, res) => {
    const state = MOCK_STATES.find(s => s.id === parseInt(req.params.id));
    if (!state) return res.status(404).json({ success: false, error: { code: 'STATE_NOT_FOUND' } });
    res.json({ success: true, data: state });
});

app.get('/api/v1/locations/states/:id/lgas', (req, res) => {
    const stateId = parseInt(req.params.id);
    const lgas = MOCK_LGAS.filter(l => l.state_id === stateId);
    res.json({ success: true, data: { lgas, total: lgas.length } });
});

app.get('/api/v1/locations/search', (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 2) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_QUERY' } });
    }
    const states = MOCK_STATES.filter(s =>
        s.name.toLowerCase().includes(q.toLowerCase()) ||
        s.capital.toLowerCase().includes(q.toLowerCase())
    );
    const lgas = MOCK_LGAS.filter(l => l.name.toLowerCase().includes(q.toLowerCase()));
    res.json({ success: true, data: { states, lgas } });
});

app.get('/api/v1/locations/geo-zones', (req, res) => {
    const grouped = {};
    for (const state of MOCK_STATES) {
        if (!grouped[state.geo_zone]) grouped[state.geo_zone] = [];
        grouped[state.geo_zone].push(state);
    }
    res.json({ success: true, data: grouped });
});

app.get('/api/v1/locations/nearest', (req, res) => {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).json({ success: false, error: { code: 'MISSING_COORDS' } });
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    let nearestState = null;
    let minDist = Infinity;
    for (const s of MOCK_STATES) {
        const d = haversineDistance(lat, lng, s.latitude, s.longitude);
        if (d < minDist) { minDist = d; nearestState = { ...s, distance_km: Math.round(d * 10) / 10 }; }
    }
    res.json({ success: true, data: { state: nearestState } });
});

// ─── Geo Property Search Routes ───
app.get('/api/v1/properties/nearby', (req, res) => {
    const { latitude, longitude, radius = 10, minPrice, maxPrice, bedrooms } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: '"latitude" is required' } });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusKm = parseFloat(radius);

    let results = MOCK_PROPERTIES_GEO.filter(p => {
        const d = haversineDistance(lat, lng, p.latitude, p.longitude);
        return d <= radiusKm;
    }).map(p => ({
        ...p,
        distance: Math.round(haversineDistance(lat, lng, p.latitude, p.longitude) * 10) / 10
    }));

    if (minPrice) results = results.filter(p => p.pricePerNight >= parseInt(minPrice));
    if (maxPrice) results = results.filter(p => p.pricePerNight <= parseInt(maxPrice));
    if (bedrooms) results = results.filter(p => p.bedrooms >= parseInt(bedrooms));

    results.sort((a, b) => a.distance - b.distance);

    res.json({
        success: true,
        data: {
            properties: results,
            center: { latitude: lat, longitude: lng },
            radiusKm,
            pagination: { page: 1, limit: 20, total: results.length, pages: 1 }
        }
    });
});

app.get('/api/v1/properties/by-state/:state', (req, res) => {
    const { lga, minPrice, maxPrice, bedrooms } = req.query;
    let results = MOCK_PROPERTIES_GEO.filter(p =>
        p.state.toLowerCase() === req.params.state.toLowerCase()
    );

    if (lga) results = results.filter(p => p.lga && p.lga.toLowerCase() === lga.toLowerCase());
    if (minPrice) results = results.filter(p => p.pricePerNight >= parseInt(minPrice));
    if (maxPrice) results = results.filter(p => p.pricePerNight <= parseInt(maxPrice));
    if (bedrooms) results = results.filter(p => p.bedrooms >= parseInt(bedrooms));

    res.json({
        success: true,
        data: {
            properties: results,
            pagination: { page: 1, limit: 20, total: results.length, pages: 1 }
        }
    });
});


// ═══════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════

describe('Location API', () => {
    describe('GET /api/v1/locations/states', () => {
        it('should return all Nigerian states', async () => {
            const res = await request(app).get('/api/v1/locations/states');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.states.length).toBe(5);
            expect(res.body.data.total).toBe(5);
        });

        it('should include state coordinates', async () => {
            const res = await request(app).get('/api/v1/locations/states');
            const lagos = res.body.data.states.find(s => s.name === 'Lagos');
            expect(lagos).toBeDefined();
            expect(lagos.latitude).toBeDefined();
            expect(lagos.longitude).toBeDefined();
            expect(lagos.geo_zone).toBe('South West');
        });
    });

    describe('GET /api/v1/locations/states/:id', () => {
        it('should return a single state', async () => {
            const res = await request(app).get('/api/v1/locations/states/1');
            expect(res.status).toBe(200);
            expect(res.body.data.name).toBe('Lagos');
        });

        it('should return 404 for non-existent state', async () => {
            const res = await request(app).get('/api/v1/locations/states/999');
            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/v1/locations/states/:id/lgas', () => {
        it('should return LGAs for Lagos', async () => {
            const res = await request(app).get('/api/v1/locations/states/1/lgas');
            expect(res.status).toBe(200);
            expect(res.body.data.lgas.length).toBe(3);
            expect(res.body.data.lgas.map(l => l.name)).toContain('Victoria Island');
        });

        it('should return LGAs for FCT', async () => {
            const res = await request(app).get('/api/v1/locations/states/2/lgas');
            expect(res.status).toBe(200);
            expect(res.body.data.lgas.length).toBe(2);
        });

        it('should return empty array for state with no LGAs', async () => {
            const res = await request(app).get('/api/v1/locations/states/5/lgas');
            expect(res.status).toBe(200);
            expect(res.body.data.lgas.length).toBe(0);
        });
    });

    describe('GET /api/v1/locations/search', () => {
        it('should search states by name', async () => {
            const res = await request(app).get('/api/v1/locations/search?q=Lag');
            expect(res.status).toBe(200);
            expect(res.body.data.states.length).toBeGreaterThan(0);
            expect(res.body.data.states[0].name).toBe('Lagos');
        });

        it('should search LGAs by name', async () => {
            const res = await request(app).get('/api/v1/locations/search?q=Victoria');
            expect(res.status).toBe(200);
            expect(res.body.data.lgas.length).toBeGreaterThan(0);
        });

        it('should reject query shorter than 2 chars', async () => {
            const res = await request(app).get('/api/v1/locations/search?q=L');
            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/v1/locations/geo-zones', () => {
        it('should return states grouped by geo-zone', async () => {
            const res = await request(app).get('/api/v1/locations/geo-zones');
            expect(res.status).toBe(200);
            expect(res.body.data['South West']).toBeDefined();
            expect(res.body.data['South West'].length).toBe(2); // Lagos + Oyo
        });
    });

    describe('GET /api/v1/locations/nearest', () => {
        it('should find nearest state to Lagos coordinates', async () => {
            const res = await request(app).get('/api/v1/locations/nearest?latitude=6.5&longitude=3.4');
            expect(res.status).toBe(200);
            expect(res.body.data.state.name).toBe('Lagos');
        });

        it('should find nearest state to Abuja coordinates', async () => {
            const res = await request(app).get('/api/v1/locations/nearest?latitude=9.05&longitude=7.49');
            expect(res.status).toBe(200);
            expect(res.body.data.state.name).toBe('FCT');
        });

        it('should require latitude and longitude', async () => {
            const res = await request(app).get('/api/v1/locations/nearest');
            expect(res.status).toBe(400);
        });
    });
});

describe('Geo Property Search', () => {
    describe('GET /api/v1/properties/nearby', () => {
        it('should find properties near Victoria Island', async () => {
            // VI coordinates with 10km radius
            const res = await request(app)
                .get('/api/v1/properties/nearby?latitude=6.4281&longitude=3.4219&radius=10');
            expect(res.status).toBe(200);
            expect(res.body.data.properties.length).toBeGreaterThan(0);
            expect(res.body.data.center.latitude).toBe(6.4281);
            expect(res.body.data.radiusKm).toBe(10);
        });

        it('should return properties sorted by distance', async () => {
            const res = await request(app)
                .get('/api/v1/properties/nearby?latitude=6.4281&longitude=3.4219&radius=30');
            const props = res.body.data.properties;
            for (let i = 1; i < props.length; i++) {
                expect(props[i].distance).toBeGreaterThanOrEqual(props[i - 1].distance);
            }
        });

        it('should include distance in response', async () => {
            const res = await request(app)
                .get('/api/v1/properties/nearby?latitude=6.4281&longitude=3.4219&radius=30');
            const props = res.body.data.properties;
            expect(props[0].distance).toBeDefined();
            expect(typeof props[0].distance).toBe('number');
        });

        it('should filter by price within radius', async () => {
            const res = await request(app)
                .get('/api/v1/properties/nearby?latitude=6.4281&longitude=3.4219&radius=30&maxPrice=50000');
            const props = res.body.data.properties;
            props.forEach(p => {
                expect(p.pricePerNight).toBeLessThanOrEqual(50000);
            });
        });

        it('should return no properties for location far from any property', async () => {
            // Coordinates in the middle of the Sahara
            const res = await request(app)
                .get('/api/v1/properties/nearby?latitude=25.0&longitude=10.0&radius=5');
            expect(res.body.data.properties.length).toBe(0);
        });

        it('should narrow results with smaller radius', async () => {
            const wideRes = await request(app)
                .get('/api/v1/properties/nearby?latitude=6.4281&longitude=3.4219&radius=30');
            const narrowRes = await request(app)
                .get('/api/v1/properties/nearby?latitude=6.4281&longitude=3.4219&radius=5');
            expect(narrowRes.body.data.properties.length).toBeLessThanOrEqual(wideRes.body.data.properties.length);
        });

        it('should require latitude and longitude', async () => {
            const res = await request(app)
                .get('/api/v1/properties/nearby');
            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/v1/properties/by-state/:state', () => {
        it('should return Lagos properties', async () => {
            const res = await request(app)
                .get('/api/v1/properties/by-state/Lagos');
            expect(res.status).toBe(200);
            expect(res.body.data.properties.length).toBe(3);
            res.body.data.properties.forEach(p => {
                expect(p.state.toLowerCase()).toBe('lagos');
            });
        });

        it('should return FCT properties', async () => {
            const res = await request(app)
                .get('/api/v1/properties/by-state/FCT');
            expect(res.status).toBe(200);
            expect(res.body.data.properties.length).toBe(1);
        });

        it('should filter by LGA within state', async () => {
            const res = await request(app)
                .get('/api/v1/properties/by-state/Lagos?lga=Lekki');
            expect(res.status).toBe(200);
            expect(res.body.data.properties.length).toBe(1);
            expect(res.body.data.properties[0].title).toBe('Lekki Beach House');
        });

        it('should filter by price within state', async () => {
            const res = await request(app)
                .get('/api/v1/properties/by-state/Lagos?maxPrice=50000');
            expect(res.status).toBe(200);
            res.body.data.properties.forEach(p => {
                expect(p.pricePerNight).toBeLessThanOrEqual(50000);
            });
        });

        it('should return empty for state with no properties', async () => {
            const res = await request(app)
                .get('/api/v1/properties/by-state/Zamfara');
            expect(res.status).toBe(200);
            expect(res.body.data.properties.length).toBe(0);
        });

        it('should be case-insensitive', async () => {
            const res = await request(app)
                .get('/api/v1/properties/by-state/lagos');
            expect(res.status).toBe(200);
            expect(res.body.data.properties.length).toBe(3);
        });
    });
});
