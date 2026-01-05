/**
 * JustBack API - Standalone Mock Server (Expanded Version)
 * 
 * This server runs WITHOUT any database or external service dependencies.
 * All data is in-memory mock data for testing API structure.
 * 
 * EXPANDED: More properties, users, bookings + Admin endpoints
 * 
 * Run with: node src/server.standalone-mock.js
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const http = require('http');
const socketIo = require('socket.io');

// Security Middlewares
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// ===========================================
// CONFIGURATION
// ===========================================
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'mock-jwt-secret-key-for-testing';
const JWT_REFRESH_SECRET = 'mock-refresh-secret-key-for-testing';
const API_VERSION = 'v1';

// ===========================================
// MIDDLEWARE
// ===========================================

// 1. Security Headers (Helmet)
app.use(helmet());

// 2. CORS Configuration (More restrictive than *)
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5000', 'https://justback-ng.web.app', 'https://neoride-navigator.web.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// 3. Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later.' } }
});
app.use('/api', limiter);

// Stricter limiter for Auth
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 failed login attempts (approx)
    message: { success: false, error: { code: 'AUTH_RATE_LIMIT', message: 'Too many login attempts, please try again in an hour.' } }
});
app.use('/api/v1/auth', authLimiter);

// 4. Data Sanitization
app.use(xss()); // Data sanitization against XSS
app.use(hpp()); // Prevent parameter pollution

// 5. Body Parsers
app.use(express.json({ limit: '10kb' })); // Body limit to prevent DoS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.message} | ${req.ip} | ${req.method} ${req.path}`);
    next();
});

// ===========================================
// MOCK DATA STORE (In-Memory)
// ===========================================
const mockUsers = new Map();
const mockProperties = new Map();
const mockBookings = new Map();
const mockCallLogs = new Map();
const mockConversations = new Map(); // [NEW] Chat
const mockMessages = new Map(); // [NEW] Chat
const mockHostAiSettings = new Map(); // Store FAQs and AI config per host
const mockAnalytics = {
    totalRevenue: 8750000,
    monthlyRevenue: [
        { month: 'Jul', revenue: 1200000 },
        { month: 'Aug', revenue: 1450000 },
        { month: 'Sep', revenue: 1100000 },
        { month: 'Oct', revenue: 1650000 },
        { month: 'Nov', revenue: 1800000 },
        { month: 'Dec', revenue: 1550000 }
    ],
    bookingsByStatus: { confirmed: 45, pending: 12, cancelled: 8, completed: 127 },
    topCities: [
        { city: 'Lagos', bookings: 89 },
        { city: 'Abuja', bookings: 45 },
        { city: 'Port Harcourt', bookings: 23 },
        { city: 'Ibadan', bookings: 18 },
        { city: 'Kano', bookings: 12 }
    ]
};

// ===========================================
// SEED EXPANDED DATA
// ===========================================
const seedData = () => {
    // ========== USERS ==========
    const users = [
        { id: 'admin-001', email: 'admin@justback.com', phone: '+2348000000000', firstName: 'Super', lastName: 'Admin', role: 'admin', walletBalance: 0 },
        { id: 'user-001', email: 'test@justback.com', phone: '+2348012345678', firstName: 'Chukwuemeka', lastName: 'Okafor', role: 'guest', walletBalance: 50000 },
        { id: 'user-002', email: 'amina@gmail.com', phone: '+2348023456789', firstName: 'Amina', lastName: 'Bello', role: 'guest', walletBalance: 125000 },
        { id: 'user-003', email: 'tunde@yahoo.com', phone: '+2348034567890', firstName: 'Tunde', lastName: 'Adeyemi', role: 'guest', walletBalance: 35000 },
        { id: 'user-004', email: 'ngozi@outlook.com', phone: '+2348045678901', firstName: 'Ngozi', lastName: 'Eze', role: 'guest', walletBalance: 78000 },
        { id: 'user-005', email: 'ibrahim@gmail.com', phone: '+2348056789012', firstName: 'Ibrahim', lastName: 'Musa', role: 'guest', walletBalance: 200000 },
        { id: 'host-001', email: 'host@justback.com', phone: '+2348087654321', firstName: 'Chidinma', lastName: 'Lagos', role: 'host', walletBalance: 2500000 },
        { id: 'host-002', email: 'abuja.host@gmail.com', phone: '+2348098765432', firstName: 'Yusuf', lastName: 'Ahmad', role: 'host', walletBalance: 1800000 },
        { id: 'host-003', email: 'phc.host@yahoo.com', phone: '+2348109876543', firstName: 'Blessing', lastName: 'Okonkwo', role: 'host', walletBalance: 750000 },
        { id: 'host-004', email: 'ibadan.host@gmail.com', phone: '+2348110987654', firstName: 'Olumide', lastName: 'Bakare', role: 'host', walletBalance: 450000 },
    ];

    users.forEach(u => {
        mockUsers.set(u.id, {
            ...u,
            passwordHash: bcrypt.hashSync('password123', 10),
            emailVerified: true,
            phoneVerified: true,
            createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
        });
    });

    // ========== PROPERTIES ==========
    const properties = [
        // Apartment (Air BnB NG)
        { id: 'prop-001', hostId: 'host-001', title: 'Skyline Glass Penthouse', category: 'apartment', description: 'Experience luxury in this 4K-view penthouse with holographic controls and 3D furniture.', propertyType: 'apartment', address: 'Plot 42, Eko Atlantic', city: 'Lagos', state: 'Lagos', pricePerNight: 85000, bedrooms: 3, bathrooms: 3, maxGuests: 6, amenities: ['wifi', 'ac', 'pool', 'gym', 'parking', 'generator'], rating: 4.9, reviewCount: 45, status: 'active' },
        { id: 'prop-002', hostId: 'host-002', title: 'Neon Horizon Duplex', category: 'apartment', description: 'A futuristic duplex featuring smart glass walls and ambient neon lighting systems.', propertyType: 'apartment', address: 'Maitama District', city: 'Abuja', state: 'FCT', pricePerNight: 95000, bedrooms: 4, bathrooms: 4, maxGuests: 8, amenities: ['wifi', 'ac', 'pool', 'gym', 'parking'], rating: 4.8, reviewCount: 30, status: 'active' },
        { id: 'prop-009', hostId: 'host-001', title: 'Cyber-Loft Lekki', category: 'apartment', description: 'Ultra-modern loft with 360-degree holographic city views.', propertyType: 'apartment', address: 'Phase 2, Lekki', city: 'Lagos', state: 'Lagos', pricePerNight: 45000, bedrooms: 2, bathrooms: 1, maxGuests: 4, amenities: ['wifi', 'ac', 'gym'], rating: 4.7, reviewCount: 15, status: 'active' },

        // Hotel
        { id: 'prop-003', hostId: 'host-001', title: 'Solaris Grand Hotel', category: 'hotel', description: 'Ultra-modern hotel suites with zero-gravity bed simulation and panoramic sky views.', propertyType: 'hotel', address: 'Victoria Island', city: 'Lagos', state: 'Lagos', pricePerNight: 55000, bedrooms: 1, bathrooms: 1, maxGuests: 2, amenities: ['wifi', 'ac', 'spa', 'pool'], rating: 4.7, reviewCount: 120, status: 'active' },
        { id: 'prop-004', hostId: 'host-003', title: 'The Prism Ritz', category: 'hotel', description: 'A crystal-themed futuristic stay with AI butler service and diamond-cut architecture.', propertyType: 'hotel', address: 'Transcorp Area', city: 'Abuja', state: 'FCT', pricePerNight: 110000, bedrooms: 1, bathrooms: 1, maxGuests: 2, amenities: ['wifi', 'ac', 'pool', 'gym'], rating: 4.9, reviewCount: 85, status: 'active' },
        { id: 'prop-010', hostId: 'host-004', title: 'Nova Zenith Hotel', category: 'hotel', description: 'Superior futuristic comfort with smart-glass windows and automated services.', propertyType: 'hotel', address: 'Independence Layout', city: 'Enugu', state: 'Enugu', pricePerNight: 40000, bedrooms: 1, bathrooms: 1, maxGuests: 2, amenities: ['wifi', 'ac'], rating: 4.6, reviewCount: 22, status: 'active' },

        // Shortlets
        { id: 'prop-005', hostId: 'host-001', title: 'Quantum Smart-Stay', category: 'shortlet', description: 'Compact, efficient, and ultra-stylish shortlet with fiber-optic decor.', propertyType: 'apartment', address: 'Lekki Phase 1', city: 'Lagos', state: 'Lagos', pricePerNight: 35000, bedrooms: 1, bathrooms: 1, maxGuests: 2, amenities: ['wifi', 'ac'], rating: 4.6, reviewCount: 50, status: 'active' },
        { id: 'prop-006', hostId: 'host-004', title: 'Vortex Executive Loft', category: 'shortlet', description: 'Perfect for business travelers, featuring 3D-printed aesthetics and high-speed data nodes.', propertyType: 'apartment', address: 'Asokoro', city: 'Abuja', state: 'FCT', pricePerNight: 40000, bedrooms: 1, bathrooms: 1, maxGuests: 2, amenities: ['wifi', 'ac'], rating: 4.5, reviewCount: 22, status: 'active' },
        { id: 'prop-011', hostId: 'host-002', title: 'Pulse Short-Stay', category: 'shortlet', description: 'Rapid booking, futuristic vibes, and premium comfort in the city center.', propertyType: 'apartment', address: 'Wuse II', city: 'Abuja', state: 'FCT', pricePerNight: 25000, bedrooms: 1, bathrooms: 1, maxGuests: 1, amenities: ['wifi', 'ac'], rating: 4.4, reviewCount: 40, status: 'active' },

        // Night life (clubs, events)
        { id: 'prop-007', hostId: 'host-001', title: 'Infinity Neon Club', category: 'nightlife', description: 'The peak of Lagos nightlife. Immersive 3D soundscapes and holographic dancers.', propertyType: 'event_space', address: 'Oniru Beach', city: 'Lagos', state: 'Lagos', pricePerNight: 250000, bedrooms: 0, bathrooms: 4, maxGuests: 500, amenities: ['parking', 'security', 'bar', 'dj'], rating: 4.9, reviewCount: 150, status: 'active' },
        { id: 'prop-008', hostId: 'host-002', title: 'Stellar Event Dome', category: 'nightlife', description: 'A massive geodesic dome for futuristic events and private night-stays.', propertyType: 'event_space', address: 'Central Business District', city: 'Abuja', state: 'FCT', pricePerNight: 350000, bedrooms: 2, bathrooms: 2, maxGuests: 1000, amenities: ['parking', 'security', 'ac'], rating: 4.8, reviewCount: 65, status: 'active' },
        { id: 'prop-012', hostId: 'host-003', title: 'Cyber-Garden Lounge', category: 'nightlife', description: 'Outdoor neon garden for high-end networking and events.', propertyType: 'event_space', address: 'Ikeja GRA', city: 'Lagos', state: 'Lagos', pricePerNight: 150000, bedrooms: 0, bathrooms: 2, maxGuests: 200, amenities: ['parking', 'security', 'ac'], rating: 4.7, reviewCount: 30, status: 'active' },
    ];

    properties.forEach((p, idx) => {
        const imageKeywords = {
            'apartment': 'futuristic+modern+apartment+bright+4k',
            'hotel': 'luxury+future+hotel+suite+bright+4k',
            'shortlet': 'cyber+modern+loft+bright+4k',
            'nightlife': 'neon+nightclub+event+space+bright+4k'
        };
        const keyword = imageKeywords[p.category] || 'futuristic+luxury+bright+4k';

        mockProperties.set(p.id, {
            ...p,
            country: 'Nigeria',
            images: [
                `https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80&sig=${idx}`,
                `https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1600&q=80&sig=${idx + 100}`
            ],
            imageUrl: `https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80&sig=${idx}`,
            createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString()
        });
    });

    // ========== BOOKINGS ==========
    const bookingStatuses = ['confirmed', 'pending', 'cancelled', 'completed', 'checked_in'];
    const bookings = [
        { id: 'booking-001', propertyId: 'prop-001', guestId: 'user-001', hostId: 'host-001', checkIn: '2026-01-15', checkOut: '2026-01-18', guests: 2, totalPrice: 135000, status: 'confirmed', paymentStatus: 'paid' },
        { id: 'booking-002', propertyId: 'prop-006', guestId: 'user-002', hostId: 'host-002', checkIn: '2026-01-10', checkOut: '2026-01-14', guests: 4, totalPrice: 480000, status: 'completed', paymentStatus: 'paid' },
        { id: 'booking-003', propertyId: 'prop-003', guestId: 'user-003', hostId: 'host-001', checkIn: '2026-01-20', checkOut: '2026-01-23', guests: 3, totalPrice: 165000, status: 'pending', paymentStatus: 'pending' },
        { id: 'booking-004', propertyId: 'prop-009', guestId: 'user-004', hostId: 'host-003', checkIn: '2026-01-05', checkOut: '2026-01-07', guests: 2, totalPrice: 70000, status: 'cancelled', paymentStatus: 'refunded' },
        { id: 'booking-005', propertyId: 'prop-007', guestId: 'user-005', hostId: 'host-002', checkIn: '2026-01-12', checkOut: '2026-01-16', guests: 4, totalPrice: 160000, status: 'checked_in', paymentStatus: 'paid' },
        { id: 'booking-006', propertyId: 'prop-004', guestId: 'user-001', hostId: 'host-001', checkIn: '2026-02-01', checkOut: '2026-02-05', guests: 6, totalPrice: 600000, status: 'confirmed', paymentStatus: 'paid' },
        { id: 'booking-007', propertyId: 'prop-011', guestId: 'user-002', hostId: 'host-004', checkIn: '2026-01-08', checkOut: '2026-01-10', guests: 2, totalPrice: 44000, status: 'completed', paymentStatus: 'paid' },
        { id: 'booking-008', propertyId: 'prop-008', guestId: 'user-003', hostId: 'host-002', checkIn: '2026-01-25', checkOut: '2026-01-28', guests: 4, totalPrice: 255000, status: 'pending', paymentStatus: 'pending' },
        { id: 'booking-009', propertyId: 'prop-002', guestId: 'user-004', hostId: 'host-001', checkIn: '2026-01-18', checkOut: '2026-01-20', guests: 2, totalPrice: 50000, status: 'confirmed', paymentStatus: 'paid' },
        { id: 'booking-010', propertyId: 'prop-014', guestId: 'user-005', hostId: 'host-002', checkIn: '2026-02-10', checkOut: '2026-02-15', guests: 10, totalPrice: 1000000, status: 'confirmed', paymentStatus: 'paid' },
    ];

    bookings.forEach(b => {
        mockBookings.set(b.id, {
            ...b,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
    });

    // ========== AI CALL LOGS ==========
    const callLogs = [
        { id: 'call-001', propertyId: 'prop-001', callerId: 'user-001', duration: 120, status: 'completed', transcript: 'Customer asked about check-in time and parking availability.', aiResponse: 'Check-in is at 2 PM. Free parking is available.' },
        { id: 'call-002', propertyId: 'prop-006', callerId: 'user-002', duration: 85, status: 'completed', transcript: 'Customer inquired about pool access and gym hours.', aiResponse: 'Pool is open 6 AM - 10 PM. Gym is 24/7.' },
        { id: 'call-003', propertyId: 'prop-003', callerId: 'user-003', duration: 45, status: 'missed', transcript: '', aiResponse: '' },
        { id: 'call-004', propertyId: 'prop-009', callerId: 'user-004', duration: 180, status: 'completed', transcript: 'Detailed questions about the neighborhood and security.', aiResponse: 'GRA Phase 2 is one of the safest areas. 24/7 security patrol.' },
        { id: 'call-005', propertyId: 'prop-007', callerId: 'user-005', duration: 95, status: 'completed', transcript: 'Customer asked about generator availability and power supply.', aiResponse: '24/7 power with backup generator. No power interruptions.' },
    ];

    callLogs.forEach(c => {
        mockCallLogs.set(c.id, {
            ...c,
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        });
    });

    console.log('📦 Seeded expanded mock data:');
    console.log(`   - ${mockUsers.size} users (1 admin, 5 guests, 4 hosts)`);
    console.log(`   - ${mockProperties.size} properties (Lagos, Abuja, PH, Ibadan)`);
    console.log(`   - ${mockBookings.size} bookings (various statuses)`);
    console.log(`   - ${mockCallLogs.size} AI call logs`);
};

// ===========================================
// HELPER FUNCTIONS
// ===========================================
const generateTokens = (userId, role) => {
    const accessToken = jwt.sign(
        { userId, role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
    const refreshToken = jwt.sign(
        { userId, role, type: 'refresh' },
        JWT_REFRESH_SECRET,
        { expiresIn: '30d' }
    );
    return { accessToken, refreshToken };
};

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: { code: 'NO_TOKEN', message: 'No authentication token provided' }
        });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.userId, role: decoded.role };
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
        });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: { code: 'FORBIDDEN', message: 'Admin access required' }
        });
    }
    next();
};

const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ===========================================
// ROUTES: Health Check
// ===========================================
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        mode: 'STANDALONE_MOCK_EXPANDED',
        message: 'Mock server running with expanded data!',
        timestamp: new Date().toISOString(),
        stats: {
            users: mockUsers.size,
            properties: mockProperties.size,
            bookings: mockBookings.size,
            callLogs: mockCallLogs.size
        }
    });
});

// ===========================================
// ROUTES: Authentication
// ===========================================
const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, fullName, phone, role = 'guest' } = req.body;

        // Support both fullName (mobile) and firstName/lastName (web)
        let finalFirstName = firstName;
        let finalLastName = lastName;
        if (fullName && !firstName) {
            const nameParts = fullName.trim().split(' ');
            finalFirstName = nameParts[0] || 'User';
            finalLastName = nameParts.slice(1).join(' ') || 'Guest';
        }

        // Normalize role to lowercase
        const normalizedRole = (role || 'guest').toLowerCase();

        if (!email || !password || (!firstName && !fullName) || !phone) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'All fields are required' }
            });
        }

        for (const user of mockUsers.values()) {
            if (user.email === email) {
                return res.status(409).json({
                    success: false,
                    error: { code: 'USER_EXISTS', message: 'User with this email already exists' }
                });
            }
        }

        const userId = generateId('user');
        const newUser = {
            id: userId,
            email,
            phone,
            passwordHash: await bcrypt.hash(password, 10),
            firstName: finalFirstName,
            lastName: finalLastName,
            role: normalizedRole,
            walletBalance: 0,
            emailVerified: false,
            phoneVerified: false,
            createdAt: new Date().toISOString()
        };
        mockUsers.set(userId, newUser);

        const tokens = generateTokens(userId, normalizedRole);

        res.status(201).json({
            success: true,
            data: {
                user: { id: userId, email, firstName: finalFirstName, lastName: finalLastName, role: normalizedRole },
                ...tokens
            },
            message: 'Registration successful'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
});

authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' }
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
                error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
            });
        }

        const isValid = await bcrypt.compare(password, foundUser.passwordHash);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
            });
        }

        const tokens = generateTokens(foundUser.id, foundUser.role);

        res.json({
            success: true,
            data: {
                user: {
                    id: foundUser.id,
                    email: foundUser.email,
                    firstName: foundUser.firstName,
                    lastName: foundUser.lastName,
                    role: foundUser.role
                },
                ...tokens
            },
            message: 'Login successful'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
});

authRouter.get('/me', authenticate, (req, res) => {
    const user = mockUsers.get(req.user.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            error: { code: 'USER_NOT_FOUND', message: 'User not found' }
        });
    }

    res.json({
        success: true,
        data: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            walletBalance: user.walletBalance,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt
        }
    });
});

authRouter.post('/refresh', (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Refresh token is required' }
            });
        }

        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const tokens = generateTokens(decoded.userId, decoded.role);

        res.json({ success: true, data: tokens });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' }
        });
    }
});

authRouter.post('/logout', authenticate, (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

// ===========================================
// ROUTES: Properties
// ===========================================
const propertyRouter = express.Router();

// Get all properties (for admin)
propertyRouter.get('/', (req, res) => {
    const { page = 1, limit = 10, city, status, propertyType } = req.query;

    let results = Array.from(mockProperties.values());

    if (city) results = results.filter(p => p.city.toLowerCase().includes(city.toLowerCase()));
    if (status) results = results.filter(p => p.status === status);
    if (propertyType) results = results.filter(p => p.propertyType === propertyType);

    const startIdx = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = results.slice(startIdx, startIdx + parseInt(limit));

    // Add host info
    const propertiesWithHost = paginatedResults.map(p => {
        const host = mockUsers.get(p.hostId);
        return {
            ...p,
            host: host ? { id: host.id, firstName: host.firstName, lastName: host.lastName, email: host.email } : null
        };
    });

    res.json({
        success: true,
        data: {
            properties: propertiesWithHost,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: results.length,
                pages: Math.ceil(results.length / parseInt(limit))
            }
        }
    });
});

propertyRouter.get('/search', (req, res) => {
    const { city, minPrice, maxPrice, bedrooms, propertyType, page = 1, limit = 10 } = req.query;

    let results = Array.from(mockProperties.values()).filter(p => p.status === 'active');

    if (city) results = results.filter(p => p.city.toLowerCase().includes(city.toLowerCase()));
    if (minPrice) results = results.filter(p => p.pricePerNight >= parseInt(minPrice));
    if (maxPrice) results = results.filter(p => p.pricePerNight <= parseInt(maxPrice));
    if (bedrooms) results = results.filter(p => p.bedrooms >= parseInt(bedrooms));
    if (propertyType) results = results.filter(p => p.propertyType === propertyType);

    const startIdx = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = results.slice(startIdx, startIdx + parseInt(limit));

    res.json({
        success: true,
        data: {
            properties: paginatedResults,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: results.length,
                pages: Math.ceil(results.length / parseInt(limit))
            }
        }
    });
});

propertyRouter.get('/:id', (req, res) => {
    const property = mockProperties.get(req.params.id);
    if (!property) {
        return res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Property not found' }
        });
    }

    const host = mockUsers.get(property.hostId);

    res.json({
        success: true,
        data: {
            ...property,
            host: host ? {
                id: host.id,
                firstName: host.firstName,
                lastName: host.lastName,
                responseRate: 95,
                responseTime: 'within an hour'
            } : null
        }
    });
});

propertyRouter.get('/:id/availability', (req, res) => {
    const { checkIn, checkOut } = req.query;
    const property = mockProperties.get(req.params.id);

    if (!property) {
        return res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Property not found' }
        });
    }

    const nights = checkIn && checkOut ?
        Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) : 1;

    res.json({
        success: true,
        data: {
            available: true,
            propertyId: property.id,
            checkIn,
            checkOut,
            pricePerNight: property.pricePerNight,
            nights,
            totalPrice: property.pricePerNight * nights,
            serviceFee: Math.round(property.pricePerNight * nights * 0.1),
            grandTotal: Math.round(property.pricePerNight * nights * 1.1)
        }
    });
});

propertyRouter.post('/', authenticate, (req, res) => {
    if (req.user.role !== 'host' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: { code: 'FORBIDDEN', message: 'Only hosts can create properties' }
        });
    }

    const propertyId = generateId('prop');
    const newProperty = {
        id: propertyId,
        hostId: req.user.id,
        ...req.body,
        country: 'Nigeria',
        rating: 0,
        reviewCount: 0,
        status: 'pending',
        images: req.body.images || [`https://picsum.photos/800/600?random=${propertyId}`],
        createdAt: new Date().toISOString()
    };
    mockProperties.set(propertyId, newProperty);

    res.status(201).json({
        success: true,
        data: newProperty,
        message: 'Property created successfully'
    });
});

propertyRouter.put('/:id', authenticate, (req, res) => {
    const property = mockProperties.get(req.params.id);
    if (!property) {
        return res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Property not found' }
        });
    }

    // Update property
    const updatedProperty = { ...property, ...req.body, updatedAt: new Date().toISOString() };
    mockProperties.set(req.params.id, updatedProperty);

    res.json({
        success: true,
        data: updatedProperty,
        message: 'Property updated successfully'
    });
});

propertyRouter.delete('/:id', authenticate, (req, res) => {
    const property = mockProperties.get(req.params.id);
    if (!property) {
        return res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Property not found' }
        });
    }

    mockProperties.delete(req.params.id);

    res.json({
        success: true,
        message: 'Property deleted successfully'
    });
});

// ===========================================
// ROUTES: Bookings
// ===========================================
const bookingRouter = express.Router();

// Get all bookings (for admin)
bookingRouter.get('/', (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    let results = Array.from(mockBookings.values());

    if (status) results = results.filter(b => b.status === status);

    // Sort by date (newest first)
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const startIdx = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = results.slice(startIdx, startIdx + parseInt(limit));

    // Add property and guest info
    const bookingsWithDetails = paginatedResults.map(b => {
        const property = mockProperties.get(b.propertyId);
        const guest = mockUsers.get(b.guestId);
        const host = mockUsers.get(b.hostId);
        return {
            ...b,
            property: property ? { id: property.id, title: property.title, city: property.city } : null,
            guest: guest ? { id: guest.id, firstName: guest.firstName, lastName: guest.lastName, email: guest.email } : null,
            host: host ? { id: host.id, firstName: host.firstName, lastName: host.lastName } : null
        };
    });

    res.json({
        success: true,
        data: {
            bookings: bookingsWithDetails,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: results.length,
                pages: Math.ceil(results.length / parseInt(limit))
            }
        }
    });
});

bookingRouter.post('/', authenticate, (req, res) => {
    const { propertyId, checkIn, checkOut, guests } = req.body;

    const property = mockProperties.get(propertyId);
    if (!property) {
        return res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Property not found' }
        });
    }

    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const totalPrice = property.pricePerNight * nights;

    const bookingId = generateId('booking');
    const newBooking = {
        id: bookingId,
        propertyId,
        guestId: req.user.id,
        hostId: property.hostId,
        checkIn,
        checkOut,
        guests,
        nights,
        pricePerNight: property.pricePerNight,
        totalPrice,
        serviceFee: Math.round(totalPrice * 0.1),
        grandTotal: Math.round(totalPrice * 1.1),
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
    };
    mockBookings.set(bookingId, newBooking);

    res.status(201).json({
        success: true,
        data: newBooking,
        message: 'Booking created. Please proceed to payment.'
    });
});

bookingRouter.get('/my-bookings', authenticate, (req, res) => {
    const myBookings = Array.from(mockBookings.values())
        .filter(b => b.guestId === req.user.id || b.hostId === req.user.id)
        .map(booking => {
            const property = mockProperties.get(booking.propertyId);
            return { ...booking, property: property || null };
        });

    res.json({
        success: true,
        data: { bookings: myBookings, total: myBookings.length }
    });
});

bookingRouter.get('/:id', authenticate, (req, res) => {
    const booking = mockBookings.get(req.params.id);
    if (!booking) {
        return res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Booking not found' }
        });
    }

    const property = mockProperties.get(booking.propertyId);
    const guest = mockUsers.get(booking.guestId);
    const host = mockUsers.get(booking.hostId);

    res.json({
        success: true,
        data: {
            ...booking,
            property: property || null,
            guest: guest ? { id: guest.id, firstName: guest.firstName, lastName: guest.lastName, email: guest.email, phone: guest.phone } : null,
            host: host ? { id: host.id, firstName: host.firstName, lastName: host.lastName } : null
        }
    });
});

bookingRouter.post('/:id/cancel', authenticate, (req, res) => {
    const booking = mockBookings.get(req.params.id);
    if (!booking) {
        return res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Booking not found' }
        });
    }

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancelledAt = new Date().toISOString();
    mockBookings.set(booking.id, booking);

    res.json({
        success: true,
        data: booking,
        message: 'Booking cancelled successfully'
    });
});

// ===========================================
// ROUTES: Users (Admin)
// ===========================================
const userRouter = express.Router();

userRouter.get('/', (req, res) => {
    const { page = 1, limit = 10, role } = req.query;

    let results = Array.from(mockUsers.values());

    if (role) results = results.filter(u => u.role === role);

    const startIdx = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = results.slice(startIdx, startIdx + parseInt(limit));

    // Remove sensitive data
    const users = paginatedResults.map(u => ({
        id: u.id,
        email: u.email,
        phone: u.phone,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        walletBalance: u.walletBalance,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt
    }));

    res.json({
        success: true,
        data: {
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: results.length,
                pages: Math.ceil(results.length / parseInt(limit))
            }
        }
    });
});

userRouter.get('/:id', (req, res) => {
    const user = mockUsers.get(req.params.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'User not found' }
        });
    }

    // Get user's bookings and properties
    const userBookings = Array.from(mockBookings.values()).filter(b => b.guestId === user.id);
    const userProperties = Array.from(mockProperties.values()).filter(p => p.hostId === user.id);

    res.json({
        success: true,
        data: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            walletBalance: user.walletBalance,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            stats: {
                totalBookings: userBookings.length,
                totalProperties: userProperties.length,
                totalSpent: userBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
            }
        }
    });
});

// ===========================================
// ROUTES: Analytics (Admin)
// ===========================================
const analyticsRouter = express.Router();

analyticsRouter.get('/dashboard', (req, res) => {
    const totalUsers = mockUsers.size;
    const totalProperties = mockProperties.size;
    const totalBookings = mockBookings.size;
    const activeBookings = Array.from(mockBookings.values()).filter(b => b.status === 'confirmed' || b.status === 'checked_in').length;

    // Calculate today's revenue (mock)
    const todayRevenue = 1250000;
    const monthRevenue = mockAnalytics.totalRevenue;

    res.json({
        success: true,
        data: {
            stats: {
                totalUsers,
                totalProperties,
                totalBookings,
                activeBookings,
                todayRevenue,
                monthRevenue,
                aiCallsToday: mockCallLogs.size
            },
            revenueChart: mockAnalytics.monthlyRevenue,
            bookingsByStatus: mockAnalytics.bookingsByStatus,
            topCities: mockAnalytics.topCities,
            recentBookings: Array.from(mockBookings.values())
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map(b => {
                    const property = mockProperties.get(b.propertyId);
                    const guest = mockUsers.get(b.guestId);
                    return {
                        id: b.id,
                        property: property ? property.title : 'Unknown',
                        guest: guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown',
                        amount: b.totalPrice,
                        status: b.status,
                        date: b.createdAt
                    };
                })
        }
    });
});

// ===========================================
// ROUTES: AI Voice / Call Center
// ===========================================
const aiVoiceRouter = express.Router();

aiVoiceRouter.get('/calls', (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    let results = Array.from(mockCallLogs.values());
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const startIdx = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = results.slice(startIdx, startIdx + parseInt(limit));

    const callsWithDetails = paginatedResults.map(c => {
        const property = mockProperties.get(c.propertyId);
        const caller = mockUsers.get(c.callerId);
        return {
            ...c,
            property: property ? { id: property.id, title: property.title } : null,
            caller: caller ? { id: caller.id, firstName: caller.firstName, lastName: caller.lastName } : null
        };
    });

    res.json({
        success: true,
        data: {
            calls: callsWithDetails,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: results.length,
                pages: Math.ceil(results.length / parseInt(limit))
            }
        }
    });
});

aiVoiceRouter.post('/webhook/incoming', (req, res) => {
    console.log('📞 Mock AI Voice: Incoming call webhook');
    res.json({
        success: true,
        message: 'Mock AI voice handler - would process call here'
    });
});

aiVoiceRouter.post('/request-call', authenticate, (req, res) => {
    const { propertyId, callReason = 'inquiry' } = req.body;
    const property = mockProperties.get(propertyId);

    if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Simulate RAG transcript generation based on host FAQs
    const hostSettings = mockHostAiSettings.get(property.hostId) || {
        faqs: [
            { question: 'What is the check-in time?', answer: 'Check-in is at 2 PM.' },
            { question: 'Is parking available?', answer: 'Yes, free parking is available.' }
        ]
    };

    const callSid = `call-${Date.now()}`;
    const transcript = [
        { speaker: 'ai', text: `Hello! I'm the JustBack AI assistant for ${property.title}. How can I help you?` },
        { speaker: 'customer', text: 'What are the house rules regarding pets?' },
        { speaker: 'ai', text: hostSettings.faqs.find(f => f.question.toLowerCase().includes('pet'))?.answer || 'I don\'t have specific information about pets for this property. Let me check with the host.' }
    ];

    // Log the simulated call
    mockCallLogs.set(callSid, {
        id: callSid,
        propertyId,
        callerId: req.user.id,
        direction: 'outbound',
        status: 'completed',
        duration: 45,
        transcript,
        createdAt: new Date().toISOString()
    });

    res.json({
        success: true,
        data: {
            callSid,
            estimatedWaitTime: '30 seconds',
            simulatedTranscript: transcript
        },
        message: 'AI assistant is initiating the call now.'
    });
});

aiVoiceRouter.post('/request-callback', authenticate, (req, res) => {
    const { propertyId, question } = req.body;
    res.json({
        success: true,
        data: {
            callbackId: generateId('callback'),
            estimatedWait: '2 minutes',
            propertyId,
            question
        },
        message: 'Callback requested. AI will call you shortly.'
    });
});

aiVoiceRouter.get('/call-logs', authenticate, (req, res) => {
    const calls = Array.from(mockCallLogs.values());
    res.json({
        success: true,
        data: { calls, total: calls.length }
    });
});

// ===========================================
// ROUTES: Payments
// ===========================================
const paymentRouter = express.Router();

paymentRouter.post('/initialize', authenticate, (req, res) => {
    const { bookingId } = req.body;

    const booking = mockBookings.get(bookingId);
    if (!booking) {
        return res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Booking not found' }
        });
    }

    const reference = `JBACK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
        success: true,
        data: {
            authorization_url: `https://checkout.paystack.com/mock/${reference}`,
            access_code: reference,
            reference: reference
        },
        message: 'Payment initialized. Redirect user to authorization_url'
    });
});

paymentRouter.get('/verify/:reference', authenticate, (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'success',
            reference: req.params.reference,
            amount: 135000,
            currency: 'NGN',
            paidAt: new Date().toISOString()
        },
        message: 'Payment verified successfully'
    });
});

paymentRouter.post('/webhook', (req, res) => {
    console.log('📥 Payment webhook received:', req.body);
    res.status(200).send('OK');
});

// ===========================================
// MOUNT ROUTES
// ===========================================
app.use(`/api/${API_VERSION}/auth`, authRouter);
app.use(`/api/${API_VERSION}/properties`, propertyRouter);
app.use(`/api/${API_VERSION}/bookings`, bookingRouter);
app.use(`/api/${API_VERSION}/users`, userRouter);
app.use(`/api/${API_VERSION}/analytics`, analyticsRouter);
app.use(`/api/${API_VERSION}/ai-voice`, aiVoiceRouter);
app.use(`/api/${API_VERSION}/payments`, paymentRouter);

// ===========================================
// ROUTES: Chat (Mock)
// ===========================================
const chatRouter = express.Router();

chatRouter.get('/conversations', authenticate, (req, res) => {
    const userId = req.user.id;
    const userConvos = Array.from(mockConversations.values())
        .filter(c => c.participants.includes(userId))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json({ success: true, data: userConvos });
});

chatRouter.get('/conversations/:id', authenticate, (req, res) => {
    const conversation = mockConversations.get(req.params.id);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    // Get messages
    const messages = Array.from(mockMessages.values())
        .filter(m => m.conversationId === req.params.id)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json({ success: true, data: messages });
});

chatRouter.post('/messages', authenticate, (req, res) => {
    const { recipientId, text, conversationId } = req.body;
    const senderId = req.user.id;

    let convId = conversationId;
    let conversation;

    // Find or Create Conversation
    if (convId) {
        conversation = mockConversations.get(convId);
    } else if (recipientId) {
        conversation = Array.from(mockConversations.values()).find(c =>
            c.participants.includes(senderId) && c.participants.includes(recipientId)
        );
    }

    if (!conversation) {
        // Create new
        const newId = generateId('conv');
        conversation = {
            _id: newId,
            participants: [senderId, recipientId],
            lastMessage: text,
            updatedAt: new Date().toISOString()
        };
        mockConversations.set(newId, conversation);
        convId = newId;
    } else {
        conversation.lastMessage = text;
        conversation.updatedAt = new Date().toISOString();
        mockConversations.set(conversation._id, conversation);
        convId = conversation._id;
    }

    // Create Message
    const msgId = generateId('msg');
    const newMessage = {
        _id: msgId,
        conversationId: convId,
        senderId,
        text,
        createdAt: new Date().toISOString()
    };
    mockMessages.set(msgId, newMessage);

    // Emit Socket Event
    io.to(convId).emit('new_message', {
        conversationId: convId,
        message: newMessage
    });
    console.log(`🔌 Socket Emitted: "new_message" to room ${convId}`);

    res.status(201).json({ success: true, data: conversation });
});

app.use(`/api/${API_VERSION}/chat`, chatRouter);

// ===========================================
// ROUTES: Host AI Settings
// ===========================================
const hostRouter = express.Router();

hostRouter.get('/settings/ai', authenticate, (req, res) => {
    // In mock, we use the userId as hostId
    const settings = mockHostAiSettings.get(req.user.id) || {
        faqs: [
            { question: 'What is the check-in time?', answer: 'Check-in is at 2 PM and check-out is at 11 AM.' },
            { question: 'Is parking available?', answer: 'Yes, free parking is available for all guests.' },
            { question: 'Do you allow pets?', answer: 'Sorry, we do not allow pets at this time.' },
        ],
        aiAutoReply: true
    };
    res.json({ success: true, data: settings });
});

hostRouter.post('/settings/ai', authenticate, (req, res) => {
    const { faqs, aiAutoReply } = req.body;
    mockHostAiSettings.set(req.user.id, { faqs, aiAutoReply });
    res.json({ success: true, message: 'AI settings updated successfully' });
});

hostRouter.post('/settings/ai/index', authenticate, (req, res) => {
    // Simulate RAG indexing delay
    setTimeout(() => {
        console.log(`🤖 AI RAG Indexing complete for host ${req.user.id}`);
    }, 2000);
    res.json({ success: true, message: 'Knowledge base indexing started' });
});

app.use(`/api/${API_VERSION}/host`, hostRouter);

// ===========================================
// ROUTES: AI Voice with Real OpenAI
// ===========================================
let openaiService = null;
try {
    openaiService = require('./services/openai.service');
    console.log('🤖 OpenAI Service loaded successfully');
} catch (err) {
    console.log('⚠️  OpenAI Service not available, using fallback responses');
}

const voiceRouter = express.Router();

// AI Chat Query - Real OpenAI powered
voiceRouter.post('/query', async (req, res) => {
    try {
        const { query, propertyId, conversationHistory } = req.body;

        if (!query) {
            return res.status(400).json({ success: false, error: 'Query is required' });
        }

        // Get property context if propertyId provided
        let property = null;
        if (propertyId) {
            property = mockProperties.get(propertyId);
        }

        // Use OpenAI if available, otherwise fallback
        let response;
        if (openaiService && process.env.OPENAI_API_KEY) {
            response = await openaiService.generateResponse(query, property, conversationHistory || []);
        } else {
            // Fallback response
            response = {
                success: true,
                response: openaiService ? openaiService.getFallbackResponse(query, property) :
                    'Welcome to JustBack! I\'m your AI assistant. How can I help you with your property inquiry?',
                intent: 'general_question',
                fallback: true
            };
        }

        // Log the AI interaction
        const logId = `ai-${Date.now()}`;
        mockCallLogs.set(logId, {
            id: logId,
            type: 'chat',
            query: query,
            propertyId: propertyId || null,
            response: response.response,
            intent: response.intent,
            timestamp: new Date().toISOString(),
            usedOpenAI: !response.fallback
        });

        res.json({
            success: true,
            data: {
                response: response.response,
                intent: response.intent,
                propertyContext: property ? property.title : null,
                logId: logId
            }
        });
    } catch (error) {
        console.error('AI Query Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Twilio Voice Webhook
voiceRouter.post('/webhook/incoming', async (req, res) => {
    const { From, CallSid, PropertyId } = req.body;

    const greeting = `Welcome to I Just Got Back, Nigeria's premier property booking platform. 
        I'm your AI assistant and I'm here to help you with property inquiries. 
        How may I assist you today?`;

    const twiml = openaiService ?
        openaiService.generateTwiML(greeting) :
        `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice">${greeting}</Say></Response>`;

    // Log the call
    const logId = CallSid || `call-${Date.now()}`;
    mockCallLogs.set(logId, {
        id: logId,
        type: 'voice_inbound',
        from: From || 'Unknown',
        propertyId: PropertyId,
        status: 'answered',
        startTime: new Date().toISOString(),
        transcript: [{ role: 'assistant', content: greeting }]
    });

    res.type('text/xml').send(twiml);
});

// Process voice input
voiceRouter.post('/webhook/gather', async (req, res) => {
    const { SpeechResult, CallSid, PropertyId } = req.body;

    let responseText = 'I apologize, I didn\'t catch that. Could you please repeat your question?';

    if (SpeechResult) {
        // Get property for context
        const property = PropertyId ? mockProperties.get(PropertyId) : null;

        if (openaiService && process.env.OPENAI_API_KEY) {
            const aiResponse = await openaiService.generateResponse(SpeechResult, property, []);
            responseText = aiResponse.response;
        } else if (openaiService) {
            responseText = openaiService.getFallbackResponse(SpeechResult, property);
        }

        // Update call log
        const callLog = mockCallLogs.get(CallSid);
        if (callLog) {
            callLog.transcript.push({ role: 'user', content: SpeechResult });
            callLog.transcript.push({ role: 'assistant', content: responseText });
        }
    }

    const twiml = openaiService ?
        openaiService.generateTwiML(responseText) :
        `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice">${responseText}</Say></Response>`;

    res.type('text/xml').send(twiml);
});

// Get call logs
voiceRouter.get('/calls', authenticate, (req, res) => {
    const logs = Array.from(mockCallLogs.values())
        .sort((a, b) => new Date(b.startTime || b.timestamp) - new Date(a.startTime || a.timestamp))
        .slice(0, 50);

    res.json({ success: true, data: logs });
});

// Request AI call simulation (for mobile app)
voiceRouter.post('/request-call', authenticate, async (req, res) => {
    const { propertyId, callReason } = req.body;

    const property = mockProperties.get(propertyId);
    const callSid = `SIM-${Date.now()}`;

    // Generate a simulated AI conversation
    const transcript = [
        { role: 'assistant', content: `Hello! I'm calling about ${property?.title || 'your property'}. How can I help you today?` },
        { role: 'user', content: 'I\'d like to know more about the check-in process.' },
        { role: 'assistant', content: `Great question! Check-in time is ${property?.checkInTime || '2:00 PM'}. You'll receive a welcome message with all the details 24 hours before your arrival.` },
        { role: 'user', content: 'What amenities are available?' },
        { role: 'assistant', content: `This property features: ${property?.amenities?.join(', ') || 'WiFi, AC, and standard amenities'}. Is there anything specific you're looking for?` }
    ];

    mockCallLogs.set(callSid, {
        id: callSid,
        type: 'simulated',
        propertyId,
        callReason,
        status: 'completed',
        startTime: new Date().toISOString(),
        duration: 45,
        transcript
    });

    res.json({
        success: true,
        data: {
            callSid,
            message: 'AI call simulated successfully',
            simulatedTranscript: transcript
        }
    });
});

app.use(`/api/${API_VERSION}/voice`, voiceRouter);

// ===========================================
// ERROR HANDLING
// ===========================================
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.statusCode || 500).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message: err.message || 'Internal Server Error'
        }
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Endpoint ${req.method} ${req.path} not found` }
    });
});

// ===========================================
// START SERVER
// ===========================================
// Socket Connection Logic
io.on('connection', (socket) => {
    console.log('🔌 New Client Connected:', socket.id);
    socket.on('join_conversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`Socket ${socket.id} joined room ${conversationId}`);
    });
    socket.on('typing', (data) => socket.to(data.conversationId).emit('user_typing', data.userId));
    socket.on('disconnect', () => console.log('❌ Client Disconnected:', socket.id));
});

seedData();

server.listen(PORT, () => {
    console.log('');
    console.log('🚀 ═══════════════════════════════════════════════════════════');
    console.log('   JustBack API - STANDALONE MOCK SERVER (EXPANDED)');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌍 API Version: ${API_VERSION}`);
    console.log('💾 Data: In-memory with expanded dataset');
    console.log('');
    console.log('📋 Core Endpoints:');
    console.log(`   Health:      GET  http://localhost:${PORT}/health`);
    console.log('');
    console.log('🔐 Test Credentials:');
    console.log('   Admin: admin@justback.com / password123');
    console.log('   Guest: test@justback.com / password123');
    console.log('   Host:  host@justback.com / password123');
    console.log('');
    console.log('📊 Admin Endpoints:');
    console.log(`   Dashboard:   GET  http://localhost:${PORT}/api/v1/analytics/dashboard`);
    console.log(`   Properties:  GET  http://localhost:${PORT}/api/v1/properties`);
    console.log(`   Bookings:    GET  http://localhost:${PORT}/api/v1/bookings`);
    console.log(`   Users:       GET  http://localhost:${PORT}/api/v1/users`);
    console.log(`   AI Calls:    GET  http://localhost:${PORT}/api/v1/ai-voice/calls`);
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ Ready for testing!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
});

module.exports = app;
